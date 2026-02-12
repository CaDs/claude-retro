/**
 * ProceduralAssets — EGA-style procedural pixel art using strict 16-color palettes.
 * All visuals use PixelArtToolkit primitives + ordered dithering for textures.
 */
import { PixelArtToolkit as T } from './PixelArtToolkit.js';
import { Palette } from './Palette.js';
import { TemplateRegistry } from './TemplateRegistry.js';

export class ProceduralAssets {
  /**
   * Generate core assets (cursor) and add them to the asset cache.
   */
  static generateCoreAssets(assetLoader) {
    assetLoader.cache.set('cursor', this.generateCursor());
  }

  /**
   * Generate item icons dynamically from loaded content.
   * Reads each item's icon.generator field and renders the icon.
   */
  static generateItemIcons(assetLoader, content) {
    const items = content.getAllItems();
    for (const [id, item] of Object.entries(items)) {
      if (item.icon?.generator) {
        const icon = this.generateItemIcon(item.icon.generator);
        if (icon) assetLoader.cache.set(`item_${id}`, icon);
      }
    }
  }

  /**
   * Generate backgrounds for rooms that use the template system.
   * Checks each room for a `background.template` field and generates
   * the background using TemplateRegistry.
   * @param {AssetLoader} assetLoader
   * @param {ContentRegistry} content
   */
  static generateTemplateBackgrounds(assetLoader, content) {
    const templateRooms = content.getTemplateRooms();
    for (const room of templateRooms) {
      const bg = room.background;
      if (!bg.template || !TemplateRegistry.has(bg.template)) continue;

      const { canvas, ctx } = this._createCanvas(320, 140);
      const meta = TemplateRegistry.getMetadata(bg.template);

      // Resolve palette: room override > template default > legacy
      let palette = Palette.get(bg.palette || meta.palette || 'tavern');
      if (bg.paletteOverrides) {
        palette = Palette.applyOverrides(palette, bg.paletteOverrides);
      }

      // Merge template defaults with room-specific params
      const defaults = {};
      if (meta.params) {
        for (const [key, def] of Object.entries(meta.params)) {
          defaults[key] = def.default;
        }
      }
      const params = { ...defaults, ...(bg.params || {}) };

      TemplateRegistry.generate(bg.template, ctx, palette, params);
      assetLoader.cache.set(`room_${room.id}`, canvas);
    }
  }

  static _createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx };
  }

  // ================================================================
  //  ITEM ICONS — EGA palette-aware
  // ================================================================
  static generateItemIcon(itemId) {
    const { canvas, ctx } = this._createCanvas(32, 20);

    switch (itemId) {
      case 'gold_coin': {
        const gold = '#c89922';
        const shadow = '#8a6a22';
        const highlight = '#ffcc44';
        // Circle coin
        T.circleFill(ctx, 16, 10, 7, gold);
        T.circle(ctx, 16, 10, 7, shadow);
        // Dragon cross symbol
        T.line(ctx, 16, 5, 16, 15, shadow);
        T.line(ctx, 12, 10, 20, 10, shadow);
        // Highlight arc
        T.pixel(ctx, 12, 6, highlight);
        T.pixel(ctx, 13, 5, highlight);
        T.pixel(ctx, 14, 4, highlight);
        break;
      }
      case 'old_key': {
        const metal = '#888888';
        const dark = '#555555';
        const light = '#aaaaaa';
        // Key head — circle
        T.circleFill(ctx, 8, 9, 4, metal);
        T.circle(ctx, 8, 9, 4, dark);
        T.circleFill(ctx, 8, 9, 2, dark); // hole
        // Shaft
        T.line(ctx, 12, 9, 26, 9, metal);
        T.line(ctx, 12, 10, 26, 10, dark);
        // Teeth
        T.rect(ctx, 22, 10, 2, 3, metal);
        T.rect(ctx, 25, 10, 2, 4, metal);
        // Highlight
        T.pixel(ctx, 6, 7, light);
        break;
      }
      case 'rope': {
        const rope = '#8a6a3a';
        const light = '#aa8a5a';
        // Coil circles
        T.circle(ctx, 16, 10, 6, rope);
        T.circle(ctx, 16, 10, 4, light);
        // End
        T.line(ctx, 21, 5, 24, 4, rope);
        T.line(ctx, 22, 6, 25, 5, light);
        break;
      }
      case 'bucket': {
        const wood = '#6a5a3a';
        const rim = '#888888';
        const dark = '#4a3a1a';
        // Bucket body — tapered polygon
        T.polygonFill(ctx, [[9, 5], [23, 5], [25, 17], [7, 17]], wood);
        T.dither(ctx, 9, 6, 14, 11, wood, dark, 0.3, 2);
        // Rim — ellipse
        T.ellipse(ctx, 16, 5, 7, 2, rim);
        // Handle arc
        T.line(ctx, 10, 5, 13, 2, rim);
        T.line(ctx, 13, 2, 19, 2, rim);
        T.line(ctx, 19, 2, 22, 5, rim);
        // Rings
        T.line(ctx, 8, 10, 24, 10, dark);
        break;
      }
      case 'enchanted_tankard': {
        const gold = '#c89922';
        const shadow = '#8a6a22';
        const glow = '#ffcc44';
        // Body
        T.rect(ctx, 10, 4, 12, 12, gold);
        T.dither(ctx, 10, 4, 12, 12, gold, shadow, 0.25, 2);
        // Handle
        T.line(ctx, 9, 6, 7, 6, gold);
        T.line(ctx, 7, 6, 7, 12, gold);
        T.line(ctx, 7, 12, 9, 12, gold);
        // Rim — ellipse
        T.ellipseFill(ctx, 16, 3, 6, 2, glow);
        // Base
        T.rect(ctx, 10, 15, 12, 2, shadow);
        // Runes — glow pixels
        T.pixel(ctx, 13, 7, glow);
        T.pixel(ctx, 15, 9, glow);
        T.pixel(ctx, 17, 7, glow);
        T.pixel(ctx, 19, 9, glow);
        break;
      }
      case 'mysterious_note': {
        const paper = '#e8e0d0';
        const ink = '#555555';
        const fold = '#c8c0b0';
        // Paper body
        T.rect(ctx, 8, 3, 16, 14, paper);
        // Fold corner — triangle
        T.polygonFill(ctx, [[20, 3], [24, 3], [24, 7]], fold);
        T.line(ctx, 20, 3, 24, 7, ink);
        // Text lines
        T.line(ctx, 10, 6, 22, 6, ink);
        T.line(ctx, 10, 9, 20, 9, ink);
        T.line(ctx, 10, 12, 21, 12, ink);
        break;
      }
    }

    return canvas;
  }

  // ================================================================
  //  CURSOR — 12x12 pixel-art arrow
  // ================================================================
  static generateCursor() {
    const { canvas, ctx } = this._createCanvas(12, 12);

    // Arrow cursor: white outline on black
    const outline = '#000000';
    const fill = '#ffffff';
    const shadow = '#888888';

    // Arrow shape (pointing upper-left)
    T.polygonFill(ctx, [
      [1, 1], [1, 9], [3, 7], [5, 10], [7, 9], [5, 6], [8, 6],
    ], fill);
    T.polygon(ctx, [
      [1, 1], [1, 9], [3, 7], [5, 10], [7, 9], [5, 6], [8, 6],
    ], outline);
    // Shadow pixel
    T.pixel(ctx, 2, 2, shadow);

    return canvas;
  }

  // ================================================================
  //  PROP REGISTRY
  // ================================================================
  static PROP_REGISTRY = {
    tree:     (ctx, x, y, variant) => ProceduralAssets._drawPropTree(ctx, x, y, variant),
    rock:     (ctx, x, y, variant) => ProceduralAssets._drawPropRock(ctx, x, y, variant),
    bush:     (ctx, x, y, variant) => ProceduralAssets._drawPropBush(ctx, x, y, variant),
    barrel:   (ctx, x, y, variant) => ProceduralAssets._drawPropBarrel(ctx, x, y, variant),
    crate:    (ctx, x, y, variant) => ProceduralAssets._drawPropCrate(ctx, x, y, variant),
    fence:    (ctx, x, y, variant) => ProceduralAssets._drawPropFence(ctx, x, y, variant),
    sign:     (ctx, x, y, variant) => ProceduralAssets._drawPropSign(ctx, x, y, variant),
    mushroom: (ctx, x, y, variant) => ProceduralAssets._drawPropMushroom(ctx, x, y, variant),
    table:    (ctx, x, y, variant) => ProceduralAssets._drawPropTable(ctx, x, y, variant),
    lamp:     (ctx, x, y, variant) => ProceduralAssets._drawPropLamp(ctx, x, y, variant),
    fire:     (ctx, x, y, variant, frame) => ProceduralAssets._drawPropFire(ctx, x, y, variant, frame),
  };

  static PROP_SIZES = {
    tree:     { default: { width: 24, height: 40 }, oak: { width: 28, height: 45 }, pine: { width: 18, height: 48 }, dead: { width: 16, height: 35 } },
    rock:     { default: { width: 16, height: 10 }, large: { width: 24, height: 14 }, small: { width: 10, height: 7 } },
    bush:     { default: { width: 20, height: 12 }, berry: { width: 22, height: 14 } },
    barrel:   { default: { width: 14, height: 18 } },
    crate:    { default: { width: 14, height: 14 }, large: { width: 18, height: 18 } },
    fence:    { default: { width: 30, height: 16 } },
    sign:     { default: { width: 14, height: 20 } },
    mushroom: { default: { width: 8, height: 8 }, cluster: { width: 16, height: 10 } },
    table:    { default: { width: 30, height: 16 }, small: { width: 20, height: 14 } },
    lamp:     { default: { width: 8, height: 22 } },
    fire:     { default: { width: 20, height: 20 } },
  };

  static drawProp(renderer, type, x, y, variant, frameCount) {
    const drawFn = this.PROP_REGISTRY[type];
    if (!drawFn) return;
    drawFn(renderer.bufCtx, x, y, variant || 'default', frameCount || 0);
  }

  static getPropSize(type, variant) {
    const sizes = this.PROP_SIZES[type];
    if (!sizes) return { width: 16, height: 16 };
    return sizes[variant || 'default'] || sizes.default || { width: 16, height: 16 };
  }

  // --- Prop draw methods (EGA-upgraded) ---

  static _drawPropTree(ctx, x, y, variant) {
    switch (variant) {
      case 'pine': {
        T.rect(ctx, x + 7, y + 20, 4, 28, '#3a2a15');
        // Triangular layers via polygons
        T.polygonFill(ctx, [[x + 1, y + 23], [x + 9, y + 12], [x + 17, y + 23]], '#1a4a1a');
        T.polygonFill(ctx, [[x + 2, y + 16], [x + 9, y + 6], [x + 16, y + 16]], '#1a5a1a');
        T.polygonFill(ctx, [[x + 4, y + 9], [x + 9, y + 0], [x + 14, y + 9]], '#225522');
        break;
      }
      case 'dead': {
        const bark = '#4a3a1a';
        T.rect(ctx, x + 6, y + 10, 4, 25, bark);
        T.line(ctx, x + 3, y + 14, x + 6, y + 12, bark);
        T.line(ctx, x + 10, y + 10, x + 14, y + 7, bark);
        T.line(ctx, x + 0, y + 8, x + 4, y + 12, '#3a2a0a');
        T.line(ctx, x + 12, y + 4, x + 15, y + 2, '#3a2a0a');
        break;
      }
      case 'oak':
      default: {
        // Trunk with bark texture
        T.rect(ctx, x + 10, y + 20, 6, 25, '#3a2a15');
        T.dither(ctx, x + 10, y + 22, 6, 20, '#3a2a15', '#2a1a0a', 0.4, 2);
        T.line(ctx, x + 10, y + 22, x + 10, y + 42, '#2a1a0a');
        // Canopy ellipses
        T.ellipseFill(ctx, x + 13, y + 10, 14, 12, '#2a5a2a');
        T.ellipseFill(ctx, x + 13, y + 6, 10, 8, '#226622');
        T.dither(ctx, x + 4, y + 2, 18, 14, '#2a5a2a', '#3a7a3a', 0.2, 4);
        break;
      }
    }
  }

  static _drawPropRock(ctx, x, y, variant) {
    const lg = variant === 'large';
    const sm = variant === 'small';
    const w = lg ? 24 : sm ? 10 : 16;
    const h = lg ? 14 : sm ? 7 : 10;
    // Irregular shape via polygon
    T.polygonFill(ctx, [
      [x + 2, y + h], [x, y + h - 3], [x + 1, y + 2],
      [x + Math.floor(w * 0.3), y], [x + Math.floor(w * 0.7), y],
      [x + w - 1, y + 2], [x + w, y + h - 3], [x + w - 2, y + h],
    ], '#777777');
    T.dither(ctx, x + 1, y + 1, w - 2, h - 2, '#777777', '#555555', 0.35, 4);
    // Highlight edge
    T.line(ctx, x + Math.floor(w * 0.3), y, x + Math.floor(w * 0.7), y, '#aaaaaa');
    // Shadow
    T.line(ctx, x + 1, y + h, x + w - 1, y + h, '#444444');
  }

  static _drawPropBush(ctx, x, y, variant) {
    const isBerry = variant === 'berry';
    T.ellipseFill(ctx, x + 10, y + 6, 10, 6, '#2a6a2a');
    T.ellipseFill(ctx, x + 10, y + 4, 7, 4, '#3a7a3a');
    T.dither(ctx, x + 3, y + 2, 14, 8, '#2a6a2a', '#3a8a3a', 0.2, 4);
    if (isBerry) {
      T.pixel(ctx, x + 5, y + 3, '#cc3333');
      T.pixel(ctx, x + 9, y + 2, '#cc3333');
      T.pixel(ctx, x + 14, y + 4, '#cc3333');
      T.pixel(ctx, x + 7, y + 6, '#cc3333');
      T.pixel(ctx, x + 12, y + 5, '#cc3333');
    }
  }

  static _drawPropBarrel(ctx, x, y) {
    // Body with stave texture
    T.rect(ctx, x + 1, y + 2, 12, 14, '#5a3a15');
    T.dither(ctx, x + 1, y + 2, 12, 14, '#5a3a15', '#3a2a0a', 0.35, 4);
    // End cap ellipse
    T.ellipseFill(ctx, x + 7, y + 1, 6, 2, '#6a4a25');
    T.ellipse(ctx, x + 7, y + 1, 6, 2, '#4a2a0a');
    // Iron rings
    T.rect(ctx, x, y + 5, 14, 1, '#888888');
    T.rect(ctx, x, y + 12, 14, 1, '#888888');
    // Stave lines
    T.line(ctx, x + 5, y + 2, x + 5, y + 16, '#4a2a0a');
    T.line(ctx, x + 9, y + 2, x + 9, y + 16, '#4a2a0a');
  }

  static _drawPropCrate(ctx, x, y, variant) {
    const size = variant === 'large' ? 18 : 14;
    T.rect(ctx, x, y, size, size, '#6a5a3a');
    T.dither(ctx, x, y, size, size, '#6a5a3a', '#5a4a2a', 0.3, 4);
    T.line(ctx, x, y, x + size, y, '#7a6a4a');
    T.line(ctx, x, y, x, y + size, '#5a4a2a');
    // Cross planks
    T.line(ctx, x, y, x + size, y + size, '#4a3a1a');
    T.line(ctx, x + size, y, x, y + size, '#4a3a1a');
  }

  static _drawPropFence(ctx, x, y) {
    // Horizontal rails
    T.rect(ctx, x, y + 4, 30, 2, '#6a5a3a');
    T.rect(ctx, x, y + 10, 30, 2, '#6a5a3a');
    // Vertical posts with pointed tops
    for (const px of [x + 1, x + 13, x + 26]) {
      T.rect(ctx, px, y + 1, 3, 15, '#5a4a2a');
      T.polygonFill(ctx, [[px, y + 1], [px + 1, y], [px + 2, y + 1]], '#5a4a2a');
    }
  }

  static _drawPropSign(ctx, x, y) {
    T.rect(ctx, x + 6, y + 8, 3, 12, '#4a3a1a');
    T.rect(ctx, x, y, 14, 10, '#5a4a2a');
    T.dither(ctx, x + 1, y + 1, 12, 8, '#5a4a2a', '#6a5a3a', 0.35, 4);
    T.line(ctx, x + 3, y + 3, x + 11, y + 3, '#3a2a1a');
    T.line(ctx, x + 3, y + 6, x + 9, y + 6, '#3a2a1a');
  }

  static _drawPropMushroom(ctx, x, y, variant) {
    if (variant === 'cluster') {
      const positions = [[0, 4], [5, 2], [10, 3], [7, 6]];
      const capColors = ['#cc4444', '#dd6644', '#cc5555', '#ee5533'];
      for (let i = 0; i < positions.length; i++) {
        const [mx, my] = positions[i];
        T.rect(ctx, x + mx + 1, y + my + 3, 3, 2, '#ddddcc');
        T.ellipseFill(ctx, x + mx + 2, y + my + 1, 3, 2, capColors[i]);
        T.pixel(ctx, x + mx + 1, y + my, '#ffffff');
      }
    } else {
      T.rect(ctx, x + 3, y + 4, 3, 4, '#ddddcc');
      T.ellipseFill(ctx, x + 4, y + 2, 4, 3, '#cc4444');
      T.pixel(ctx, x + 2, y + 1, '#ffffff');
      T.pixel(ctx, x + 5, y + 1, '#ffffff');
    }
  }

  static _drawPropTable(ctx, x, y, variant) {
    const w = variant === 'small' ? 20 : 30;
    const h = variant === 'small' ? 14 : 16;
    T.rect(ctx, x, y, w, 4, '#6a4a25');
    T.dither(ctx, x, y, w, 4, '#6a4a25', '#7a5a35', 0.4, 2);
    T.line(ctx, x, y, x + w, y, '#7a5a35');
    T.rect(ctx, x + 2, y + 4, 3, h - 4, '#5a3a15');
    T.rect(ctx, x + w - 5, y + 4, 3, h - 4, '#5a3a15');
  }

  static _drawPropLamp(ctx, x, y) {
    T.rect(ctx, x + 3, y + 6, 2, 16, '#555555');
    T.rect(ctx, x + 1, y + 20, 6, 2, '#666666');
    // Housing
    T.polygonFill(ctx, [[x + 1, y + 7], [x + 4, y + 2], [x + 7, y + 7]], '#555555');
    T.rect(ctx, x + 2, y + 4, 4, 3, '#ffcc44');
    T.rect(ctx, x + 3, y + 3, 2, 2, '#ffcc44');
    // Glow halo — overlay scatter
    T.scatterCircle(ctx, x + 4, y + 4, 10, '#ffcc44', 0.08, 4);
  }

  static _drawPropFire(ctx, x, y, variant, frame) {
    // Animated fire prop — 3 frame cycle
    const f = Math.floor((frame || 0) / 10) % 3;
    const colors = ['#cc4411', '#dd7722', '#ffcc44'];
    const offsets = [
      [[0, 0], [2, -2], [-1, 1]],
      [[1, -1], [-1, 0], [2, 1]],
      [[-1, 1], [1, -1], [0, 0]],
    ];
    const o = offsets[f];
    // Back flame
    T.polygonFill(ctx, [
      [x + 3 + o[0][0], y + 18], [x + 7 + o[0][0], y + 4 + o[0][1]],
      [x + 10, y + 2 + o[0][1]], [x + 14 + o[0][0], y + 5 + o[0][1]],
      [x + 17 + o[0][0], y + 18],
    ], colors[0]);
    // Mid flame
    T.polygonFill(ctx, [
      [x + 5 + o[1][0], y + 18], [x + 8 + o[1][0], y + 6 + o[1][1]],
      [x + 10, y + 3 + o[1][1]], [x + 13 + o[1][0], y + 7 + o[1][1]],
      [x + 15 + o[1][0], y + 18],
    ], colors[1]);
    // Front flame
    T.polygonFill(ctx, [
      [x + 7 + o[2][0], y + 18], [x + 9 + o[2][0], y + 8 + o[2][1]],
      [x + 10, y + 5 + o[2][1]], [x + 12 + o[2][0], y + 9 + o[2][1]],
      [x + 13 + o[2][0], y + 18],
    ], colors[2]);
  }
}
