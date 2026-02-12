/**
 * TemplateRegistry — Central registry mapping template IDs to generator modules.
 *
 * Each template module describes a procedural background generator for a specific
 * scene type (e.g., 'fantasy/tavern'). Modules carry metadata (param schemas for
 * UI forms, setting/category tags) and a `generate` function that draws pixel art
 * onto a canvas context using PixelArtToolkit primitives and a resolved palette.
 *
 * Template module shape:
 *   - metadata: { id, name, setting, category, palette, params }
 *   - generate(ctx, palette, params): draws on ctx using PixelArtToolkit
 *
 * Usage:
 *   TemplateRegistry.register('fantasy/tavern', tavernModule);
 *   const canvas = TemplateRegistry.generateBackground(roomDef, paletteRegistry);
 */
export class TemplateRegistry {

  /** @type {Map<string, {metadata: object, generate: function}>} */
  static _templates = new Map();

  // -------------------------------------------------------------------
  //  Registration
  // -------------------------------------------------------------------

  /**
   * Register a template module.
   *
   * @param {string} id   — Unique template ID, typically 'setting/name'
   *                         (e.g. 'fantasy/tavern', 'scifi/bridge').
   * @param {object} module — Template module with `metadata` and `generate`.
   * @param {object} module.metadata — Descriptor including id, name, setting,
   *                                    category, palette, and params schema.
   * @param {function} module.generate — (ctx, palette, params) => void
   * @throws {Error} If the module is missing required fields.
   */
  static register(id, module) {
    if (!module || typeof module !== 'object') {
      throw new Error(`TemplateRegistry.register: module for '${id}' must be an object`);
    }
    if (!module.metadata) {
      throw new Error(`TemplateRegistry.register: module '${id}' is missing metadata`);
    }
    if (typeof module.generate !== 'function') {
      throw new Error(`TemplateRegistry.register: module '${id}' is missing generate function`);
    }

    this._templates.set(id, module);
  }

  // -------------------------------------------------------------------
  //  Queries
  // -------------------------------------------------------------------

  /**
   * Check whether a template with the given ID has been registered.
   *
   * @param {string} id — Template ID.
   * @returns {boolean}
   */
  static has(id) {
    return this._templates.has(id);
  }

  /**
   * Return the metadata object for a template. This includes the param
   * schema that UI form builders can use to present options.
   *
   * @param {string} id — Template ID.
   * @returns {object|null} Metadata object, or null if not found.
   */
  static getMetadata(id) {
    const tpl = this._templates.get(id);
    return tpl ? tpl.metadata : null;
  }

  /**
   * Return all templates whose `metadata.setting` matches the given ID.
   *
   * @param {string} settingId — Setting identifier (e.g. 'fantasy', 'scifi').
   * @returns {object[]} Array of metadata objects.
   */
  static listBySetting(settingId) {
    const results = [];
    for (const tpl of this._templates.values()) {
      if (tpl.metadata.setting === settingId) {
        results.push(tpl.metadata);
      }
    }
    return results;
  }

  /**
   * Return all templates whose `metadata.category` matches the given value.
   *
   * @param {string} category — Category tag (e.g. 'interior', 'exterior').
   * @returns {object[]} Array of metadata objects.
   */
  static listByCategory(category) {
    const results = [];
    for (const tpl of this._templates.values()) {
      if (tpl.metadata.category === category) {
        results.push(tpl.metadata);
      }
    }
    return results;
  }

  // -------------------------------------------------------------------
  //  Generation
  // -------------------------------------------------------------------

  /**
   * Invoke a template's generate function directly.
   *
   * @param {string} id       — Template ID.
   * @param {CanvasRenderingContext2D} ctx — Target 2D context.
   * @param {object} palette  — Resolved palette (named color map).
   * @param {object} [params] — Generation parameters (merged with defaults).
   * @throws {Error} If the template ID is not registered.
   */
  static generate(id, ctx, palette, params = {}) {
    const tpl = this._templates.get(id);
    if (!tpl) {
      throw new Error(`TemplateRegistry.generate: unknown template '${id}'`);
    }

    const mergedParams = this._mergeParams(tpl.metadata.params, params);
    tpl.generate(ctx, palette, mergedParams);
  }

  /**
   * Full background generation pipeline.
   *
   * 1. Reads the template ID from `roomDef.background.template`.
   * 2. Resolves the palette — uses `roomDef.background.palette` if present,
   *    otherwise falls back to the template's default palette.
   * 3. Applies `roomDef.background.paletteOverrides` on top, if any.
   * 4. Creates a 320x140 offscreen canvas (classic VGA game viewport).
   * 5. Merges template default params with any room-level overrides.
   * 6. Calls the template's `generate` function.
   * 7. Returns the finished canvas element.
   *
   * @param {object} roomDef         — Room definition (from YAML).
   * @param {object} paletteRegistry — PaletteRegistry instance with a
   *                                    `get(id)` method returning a color map.
   * @returns {HTMLCanvasElement} The rendered 320x140 background canvas.
   * @throws {Error} If the template is not found or palette cannot be resolved.
   */
  static generateBackground(roomDef, paletteRegistry) {
    // 1. Resolve template ID
    const bg = roomDef.background;
    if (!bg || !bg.template) {
      throw new Error(
        `TemplateRegistry.generateBackground: room '${roomDef.id || '?'}' ` +
        `has no background.template`
      );
    }

    const templateId = bg.template;
    const tpl = this._templates.get(templateId);
    if (!tpl) {
      throw new Error(
        `TemplateRegistry.generateBackground: unknown template '${templateId}' ` +
        `for room '${roomDef.id || '?'}'`
      );
    }

    // 2. Resolve palette — room override > template default
    const paletteId = bg.palette || tpl.metadata.palette;
    if (!paletteId) {
      throw new Error(
        `TemplateRegistry.generateBackground: no palette specified for ` +
        `template '${templateId}' and room '${roomDef.id || '?'}'`
      );
    }

    let palette = paletteRegistry.get(paletteId);
    if (!palette) {
      throw new Error(
        `TemplateRegistry.generateBackground: palette '${paletteId}' not found`
      );
    }

    // 3. Apply palette overrides (shallow copy so originals stay clean)
    if (bg.paletteOverrides && typeof bg.paletteOverrides === 'object') {
      palette = Object.assign({}, palette, bg.paletteOverrides);
    }

    // 4. Create offscreen canvas (320x140 — classic VGA viewport)
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // 5. Merge template default params with room-level overrides
    const roomParams = (bg.params && typeof bg.params === 'object') ? bg.params : {};
    const mergedParams = this._mergeParams(tpl.metadata.params, roomParams);

    // 6. Generate
    tpl.generate(ctx, palette, mergedParams);

    // 7. Return the finished canvas
    return canvas;
  }

  // -------------------------------------------------------------------
  //  Internal helpers
  // -------------------------------------------------------------------

  /**
   * Merge user-supplied params over template default values.
   * Only keys defined in the schema are included — unknown keys are ignored.
   *
   * @param {object} schema   — Param definitions from metadata.params
   *                             (each key maps to { type, default, ... }).
   * @param {object} overrides — Caller-supplied values.
   * @returns {object} Merged params with defaults filled in.
   * @private
   */
  static _mergeParams(schema, overrides) {
    const merged = {};
    if (!schema) return merged;

    for (const [key, def] of Object.entries(schema)) {
      if (overrides && key in overrides) {
        merged[key] = overrides[key];
      } else {
        merged[key] = def.default;
      }
    }
    return merged;
  }
}
