/**
 * PaletteRegistry — dynamic palette management across settings.
 *
 * Wraps and extends the static Palette class, providing instance-based
 * registration, lookup, per-setting grouping, and runtime overrides.
 * Both the game creator and the engine maintain their own instances.
 */
import { Palette } from './Palette.js';

// Required character colors every palette must include.
const REQUIRED_CHAR_COLORS = {
  skin_base: '#d4a574',
  skin_shadow: '#a0724a',
};

export class PaletteRegistry {

  constructor() {
    /** @type {Map<string, { colors: object, settingId: string|null }>} */
    this._palettes = new Map();

    // Seed with every palette already defined on Palette.PALETTES
    for (const [id, colorMap] of Object.entries(Palette.PALETTES)) {
      this._palettes.set(id, {
        colors: { ...colorMap },
        settingId: null,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Core API
  // ---------------------------------------------------------------------------

  /**
   * Register a single palette.
   * Missing character colors are filled in automatically.
   * @param {string} id          Unique palette identifier.
   * @param {object} colorMap    Named 16-color map (e.g. { black: '#000000', ... }).
   * @param {string|null} [settingId=null]  Optional setting this palette belongs to.
   */
  register(id, colorMap, settingId = null) {
    const colors = {
      ...REQUIRED_CHAR_COLORS,
      ...colorMap,
    };
    this._palettes.set(id, { colors, settingId });
  }

  /**
   * Retrieve a palette's color map by ID.
   * Falls back to the static Palette.get() for legacy look-ups.
   * @param {string} id
   * @returns {object} Named color map.
   */
  get(id) {
    const entry = this._palettes.get(id);
    if (entry) {
      return entry.colors;
    }
    // Legacy fallback — Palette.get() returns tavern if unknown
    return Palette.get(id);
  }

  /**
   * Check whether a palette is registered.
   * @param {string} id
   * @returns {boolean}
   */
  has(id) {
    return this._palettes.has(id);
  }

  // ---------------------------------------------------------------------------
  // Overrides
  // ---------------------------------------------------------------------------

  /**
   * Return a new palette object with specific colors replaced.
   * The original palette is never mutated.
   *
   * @param {object} palette    A color map (as returned by `get()`).
   * @param {object} overrides  Key/value pairs to replace (e.g. { brown: '#5a4a2a' }).
   * @returns {object}          New color map with overrides applied.
   */
  applyOverrides(palette, overrides) {
    return { ...palette, ...overrides };
  }

  // ---------------------------------------------------------------------------
  // Setting helpers
  // ---------------------------------------------------------------------------

  /**
   * Return all palette IDs that belong to the given setting.
   * @param {string} settingId
   * @returns {string[]}
   */
  listBySetting(settingId) {
    const ids = [];
    for (const [id, entry] of this._palettes) {
      if (entry.settingId === settingId) {
        ids.push(id);
      }
    }
    return ids;
  }

  /**
   * Bulk-register palettes from a setting definition.
   *
   * @param {string} settingId              Setting identifier (e.g. 'enchanted_tankard').
   * @param {Object<string, object>} palettes  Map of palette ID to color map.
   *   Example: { tavern_warm: { black: '#000', ... }, forest_deep: { ... } }
   */
  registerFromSetting(settingId, palettes) {
    for (const [id, colorMap] of Object.entries(palettes)) {
      this.register(id, colorMap, settingId);
    }
  }
}
