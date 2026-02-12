/**
 * ProceduralAssets — EGA-style procedural pixel art using strict 16-color palettes.
 * All visuals use PixelArtToolkit primitives + ordered dithering for textures.
 */
import { PixelArtToolkit as T } from './PixelArtToolkit.js';
import { Palette } from './Palette.js';
import { TemplateRegistry } from './TemplateRegistry.js';

export class ProceduralAssets {
  /**
   * Generate all game assets and add them to the asset cache.
   * This is the legacy path — generates hardcoded backgrounds for the
   * Enchanted Tankard game. Template-based rooms use generateFromTemplate().
   */
  static generateAll(assetLoader) {
    assetLoader.cache.set('room_village_square', this.generateVillageSquare());
    assetLoader.cache.set('room_tavern', this.generateTavern());
    assetLoader.cache.set('room_forest_path', this.generateForestPath());
    assetLoader.cache.set('room_temple', this.generateTemple());

    assetLoader.cache.set('item_gold_coin', this.generateItemIcon('gold_coin'));
    assetLoader.cache.set('item_old_key', this.generateItemIcon('old_key'));
    assetLoader.cache.set('item_rope', this.generateItemIcon('rope'));
    assetLoader.cache.set('item_bucket', this.generateItemIcon('bucket'));
    assetLoader.cache.set('item_enchanted_tankard', this.generateItemIcon('enchanted_tankard'));
    assetLoader.cache.set('item_mysterious_note', this.generateItemIcon('mysterious_note'));

    assetLoader.cache.set('cursor', this.generateCursor());
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

  // Legacy helpers kept for prop compatibility
  static _pixel(ctx, x, y, color) { T.pixel(ctx, x, y, color); }
  static _rect(ctx, x, y, w, h, color) { T.rect(ctx, x, y, w, h, color); }

  // ================================================================
  //  TAVERN — 16-color EGA palette
  // ================================================================
  static generateTavern() {
    const { canvas, ctx } = this._createCanvas(320, 140);
    const P = Palette.get('tavern');
    this._tavernBase(ctx, P);
    this._tavernStructures(ctx, P);
    this._tavernDetails(ctx, P);
    this._tavernShading(ctx, P);
    this._tavernAtmosphere(ctx, P);
    return canvas;
  }

  static _tavernBase(ctx, P) {
    // Ceiling — solid dark wood with vertical grain lines
    T.rect(ctx, 0, 0, 320, 25, P.dark_brown);
    // Dark blue vertical grain for wood texture
    for (let gx = 7; gx < 320; gx += 14) {
      T.line(ctx, gx, 0, gx, 25, P.dark_blue);
    }
    // Wooden beams
    T.rect(ctx, 0, 0, 320, 3, P.brown);
    T.rect(ctx, 50, 0, 4, 25, P.brown);
    T.rect(ctx, 160, 0, 4, 25, P.brown);
    T.rect(ctx, 270, 0, 4, 25, P.brown);
    // Beam highlights
    T.line(ctx, 50, 0, 50, 25, P.tan);
    T.line(ctx, 160, 0, 160, 25, P.tan);
    T.line(ctx, 270, 0, 270, 25, P.tan);

    // Back wall — solid stone with alternating brick shading
    T.rect(ctx, 0, 25, 320, 50, P.gray);
    // Alternating dark_gray brick fills for depth
    for (let row = 0; row < 6; row++) {
      const sy = 26 + row * 8;
      const offset = (row % 2) * 11;
      for (let col = 0; col < 16; col++) {
        const sx = col * 22 + offset;
        if ((col + row) % 2 === 0) {
          T.rect(ctx, sx + 1, sy + 1, 20, 6, P.dark_gray);
        }
      }
    }
    // Mortar lines (horizontal)
    for (let row = 0; row < 6; row++) {
      const sy = 26 + row * 8;
      T.line(ctx, 0, sy, 320, sy, P.dark_gray);
    }
    // Mortar lines (vertical, staggered brick)
    for (let row = 0; row < 6; row++) {
      const sy = 26 + row * 8;
      const offset = (row % 2) * 11;
      for (let col = 0; col < 16; col++) {
        const sx = col * 22 + offset;
        T.line(ctx, sx, sy, sx, sy + 8, P.dark_gray);
      }
    }

    // Floor — solid wood planks with grain detail
    T.rect(ctx, 0, 75, 320, 65, P.brown);
    // Plank lines + grain
    for (let i = 0; i < 9; i++) {
      const y = 76 + i * 7;
      T.line(ctx, 0, y, 320, y, P.dark_brown);
      // Dark brown vertical grain lines (3–4 per plank)
      for (let g = 0; g < 4; g++) {
        const gx = 15 + g * 80 + i * 13;
        T.line(ctx, gx, y + 1, gx, y + 6, P.dark_brown);
      }
      // Tan highlight on top edge of alternating planks
      if (i % 2 === 0) {
        T.line(ctx, 0, y + 1, 320, y + 1, P.tan);
      }
    }
  }

  static _tavernStructures(ctx, P) {
    // Fireplace (left) — solid stone body with mortar grid
    T.rect(ctx, 5, 32, 45, 53, P.dark_gray);
    // Gray mortar grid lines
    for (let gy = 38; gy < 85; gy += 6) {
      T.line(ctx, 5, gy, 50, gy, P.gray);
    }
    for (let gx = 5; gx < 50; gx += 9) {
      const off = ((gx - 5) / 9 | 0) % 2 === 0 ? 0 : 3;
      T.line(ctx, gx, 32 + off, gx, 85, P.gray);
    }
    // Arch top (polygon)
    T.polygonFill(ctx, [[10,40],[15,36],[40,36],[45,40]], P.dark_gray);
    // Fireplace opening
    T.rect(ctx, 12, 40, 31, 38, P.black);
    // Mantle shelf
    T.rect(ctx, 2, 32, 51, 4, P.gray);
    T.line(ctx, 2, 32, 53, 32, P.light_gray);
    // Stone surround bricks
    for (let r = 0; r < 5; r++) {
      const fy = 40 + r * 6;
      T.line(ctx, 5, fy, 12, fy, P.gray);
      T.line(ctx, 43, fy, 50, fy, P.gray);
    }

    // Fire glow in opening (static version — lighting system adds animation)
    T.polygonFill(ctx, [[18,75],[22,60],[27,55],[32,58],[36,75]], P.dark_red);
    T.polygonFill(ctx, [[20,75],[24,63],[28,58],[33,62],[35,75]], P.red);
    T.polygonFill(ctx, [[23,75],[26,66],[29,62],[32,66],[34,75]], P.orange);
    T.polygonFill(ctx, [[25,75],[27,68],[30,65],[32,68],[33,75]], P.yellow);
    // Logs — solid with bark lines
    T.rect(ctx, 14, 74, 28, 4, P.dark_brown);
    T.line(ctx, 20, 74, 20, 78, P.brown);
    T.line(ctx, 28, 74, 28, 78, P.brown);
    T.line(ctx, 36, 74, 36, 78, P.brown);
    T.line(ctx, 14, 74, 42, 74, P.dark_brown);

    // Bar counter — solid body with grain lines
    T.rect(ctx, 85, 65, 140, 20, P.brown);
    // Vertical grain lines on counter body
    for (let gx = 105; gx < 225; gx += 20) {
      T.line(ctx, gx, 65, gx, 85, P.dark_brown);
    }
    // Counter top surface (solid lighter wood)
    T.rect(ctx, 85, 62, 140, 4, P.tan);
    T.line(ctx, 85, 62, 225, 62, P.amber);
    // Counter edge shadow
    T.line(ctx, 85, 66, 225, 66, P.dark_brown);
    // Counter legs
    T.rect(ctx, 88, 80, 5, 12, P.dark_brown);
    T.rect(ctx, 218, 80, 5, 12, P.dark_brown);

    // Shelves behind bar
    for (const sy of [28, 42, 56]) {
      T.rect(ctx, 90, sy, 120, 3, P.brown);
      T.line(ctx, 90, sy, 210, sy, P.tan);
      // Bracket triangles
      T.polygonFill(ctx, [[90, sy + 3], [90, sy + 7], [94, sy + 3]], P.brown);
      T.polygonFill(ctx, [[210, sy + 3], [210, sy + 7], [206, sy + 3]], P.brown);
    }

    // Cabinet (right, behind bar) — solid with grain lines
    T.rect(ctx, 230, 32, 30, 50, P.brown);
    // Vertical grain lines
    T.line(ctx, 237, 32, 237, 82, P.dark_brown);
    T.line(ctx, 244, 32, 244, 82, P.dark_brown);
    T.line(ctx, 251, 32, 251, 82, P.dark_brown);
    // Left highlight, right shadow
    T.line(ctx, 230, 32, 230, 82, P.tan);
    T.line(ctx, 259, 32, 259, 82, P.dark_brown);
    // Door panels
    T.rect(ctx, 233, 35, 24, 20, P.dark_brown);
    T.rect(ctx, 233, 58, 24, 20, P.dark_brown);
    T.rect(ctx, 244, 42, 2, 8, P.tan);
    T.rect(ctx, 244, 65, 2, 8, P.tan);
    T.pixel(ctx, 244, 46, P.light_gray);
    T.line(ctx, 232, 34, 258, 34, P.dark_brown);
    T.line(ctx, 232, 56, 258, 56, P.dark_brown);

    // Ale barrel (far right) — solid with stave detail
    T.rect(ctx, 272, 78, 30, 32, P.brown);
    T.ellipse(ctx, 287, 85, 14, 8, P.tan);
    // Stave lines
    for (let i = 0; i < 4; i++) {
      T.line(ctx, 275 + i * 7, 78, 275 + i * 7, 110, P.dark_brown);
    }
    // Tan left highlight for roundness
    T.line(ctx, 273, 80, 273, 108, P.tan);
    // Iron rings
    T.rect(ctx, 270, 82, 34, 2, P.tan);
    T.rect(ctx, 270, 98, 34, 2, P.tan);
    // Tap
    T.rect(ctx, 285, 88, 4, 5, P.dark_brown);
    T.pixel(ctx, 289, 90, P.dark_gray);

    // Door (left exit) — solid with grain lines
    T.rect(ctx, 0, 40, 18, 50, P.dark_brown);
    // Vertical grain lines
    T.line(ctx, 5, 40, 5, 90, P.brown);
    T.line(ctx, 10, 40, 10, 90, P.brown);
    T.line(ctx, 15, 40, 15, 90, P.brown);
    // Inner panel + edge + handle
    T.rect(ctx, 2, 42, 14, 45, P.brown);
    T.line(ctx, 2, 42, 2, 87, P.dark_brown);
    T.rect(ctx, 12, 60, 3, 3, P.tan);
    T.pixel(ctx, 13, 61, P.amber);
  }

  static _tavernDetails(ctx, P) {
    // Bottles on shelves — use palette colors
    const bottleColors = [P.dark_gray, P.dark_red, P.dark_blue, P.brown, P.dark_gray];
    for (let i = 0; i < 8; i++) {
      const bx = 95 + i * 14;
      const color = bottleColors[i % bottleColors.length];
      T.rect(ctx, bx, 45, 5, 10, color);
      T.rect(ctx, bx + 1, 43, 3, 3, color);
      T.pixel(ctx, bx + 1, 44, P.light_gray); // highlight
    }
    for (let i = 0; i < 6; i++) {
      const bx = 100 + i * 16;
      const color = bottleColors[(i + 2) % bottleColors.length];
      T.rect(ctx, bx, 31, 5, 10, color);
      T.rect(ctx, bx + 1, 29, 3, 3, color);
      T.pixel(ctx, bx + 1, 30, P.light_gray);
    }

    // Enchanted Tankard (on shelf)
    T.rect(ctx, 152, 20, 14, 10, P.amber);
    T.rect(ctx, 149, 21, 4, 6, P.amber);
    T.ellipseFill(ctx, 159, 19, 7, 2, P.yellow);
    // Runes — yellow glow pixels
    T.pixel(ctx, 155, 23, P.yellow);
    T.pixel(ctx, 157, 25, P.yellow);
    T.pixel(ctx, 159, 23, P.yellow);
    T.pixel(ctx, 161, 25, P.yellow);
    // Glow halo
    T.scatter(ctx, 147, 15, 26, 20, P.yellow, 0.08, 4);

    // Hanging lanterns
    for (const lx of [120, 200]) {
      T.rect(ctx, lx, 4, 6, 8, P.tan);
      T.rect(ctx, lx + 1, 7, 4, 4, P.yellow);
      T.line(ctx, lx + 3, 0, lx + 3, 4, P.dark_gray);
      // Small glow circle
      T.scatter(ctx, lx - 4, 2, 14, 14, P.amber, 0.1, 4);
    }
  }

  static _tavernShading(ctx, P) {
    // Under-counter shadow
    T.scatter(ctx, 85, 85, 140, 6, P.black, 0.4, 4);

    // Fireplace glow on floor — warm radial scatter
    T.scatterCircle(ctx, 27, 85, 40, P.orange, 0.12, 4);

    // Ambient occlusion lines
    T.line(ctx, 0, 25, 320, 25, P.black); // wall-ceiling join
    T.line(ctx, 0, 75, 320, 75, P.black); // wall-floor join
  }

  static _tavernAtmosphere(ctx, P) {
    // Warm amber wash over the whole scene (subtle overlay scatter)
    T.scatter(ctx, 0, 0, 320, 140, P.amber, 0.03, 4);
  }

  // ================================================================
  //  VILLAGE SQUARE — 16-color EGA palette
  // ================================================================
  static generateVillageSquare() {
    const { canvas, ctx } = this._createCanvas(320, 140);
    const P = Palette.get('village_square');
    this._villageBase(ctx, P);
    this._villageStructures(ctx, P);
    this._villageDetails(ctx, P);
    this._villageShading(ctx, P);
    return canvas;
  }

  static _villageBase(ctx, P) {
    // Sky — solid color bands (no dither gradient)
    T.rect(ctx, 0, 0, 320, 15, P.dark_blue);
    T.rect(ctx, 0, 15, 320, 14, P.blue);
    T.rect(ctx, 0, 29, 320, 14, P.light_blue);
    T.rect(ctx, 0, 43, 320, 12, P.white);
    // Soft transition pixels between bands
    T.scatter(ctx, 0, 13, 320, 4, P.blue, 0.3, 4);
    T.scatter(ctx, 0, 27, 320, 4, P.light_blue, 0.25, 4);

    // Clouds — overlapping ellipses (already clean)
    T.ellipseFill(ctx, 52, 10, 16, 5, P.white);
    T.ellipseFill(ctx, 46, 8, 10, 4, P.white);
    T.ellipseFill(ctx, 190, 14, 14, 4, P.white);
    T.ellipseFill(ctx, 185, 12, 8, 3, P.white);
    T.ellipseFill(ctx, 270, 8, 11, 4, P.white);

    // Ground — solid cobblestone tiles (no dither base)
    T.rect(ctx, 0, 75, 320, 65, P.tan);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 20; col++) {
        const sx = col * 17 + (row % 2) * 8;
        const sy = 78 + row * 8;
        const shade = (col + row) % 3 === 0 ? P.dark_gray : P.gray;
        T.rect(ctx, sx, sy, 15, 6, shade);
        // Top edge highlight
        T.line(ctx, sx, sy, sx + 14, sy, P.tan);
        // Bottom edge shadow
        T.line(ctx, sx, sy + 6, sx + 14, sy + 6, P.dark_brown);
        // Left edge shadow
        T.line(ctx, sx, sy + 1, sx, sy + 5, P.dark_brown);
      }
    }
  }

  static _villageStructures(ctx, P) {
    // === Left building (x:0–40) — solid stone wall + mortar grid ===
    T.rect(ctx, 0, 25, 40, 50, P.dark_gray);
    // Mortar lines (horizontal)
    for (let r = 0; r < 6; r++) {
      const my = 27 + r * 8;
      T.line(ctx, 0, my, 39, my, P.gray);
    }
    // Mortar lines (vertical, staggered)
    for (let r = 0; r < 6; r++) {
      const my = 27 + r * 8;
      const off = (r % 2) * 10;
      for (let c = 0; c < 4; c++) {
        const mx = c * 20 + off;
        if (mx < 40) T.line(ctx, mx, my, mx, my + 8, P.gray);
      }
    }
    // Windows — nested rects with glass glint
    T.rect(ctx, 3, 30, 10, 12, P.dark_brown);
    T.rect(ctx, 5, 32, 6, 8, P.dark_blue);
    T.pixel(ctx, 6, 33, P.light_blue);
    T.rect(ctx, 20, 30, 10, 12, P.dark_brown);
    T.rect(ctx, 22, 32, 6, 8, P.dark_blue);
    T.pixel(ctx, 23, 33, P.light_blue);
    // Roof — polygonFill
    T.polygonFill(ctx, [[-3, 25], [20, 15], [43, 25]], P.dark_brown);
    T.line(ctx, -3, 25, 20, 15, P.brown);
    T.line(ctx, 20, 15, 43, 25, P.dark_brown);

    // === Right building / Tavern (x:270–320) — solid tan wall + mortar ===
    T.rect(ctx, 270, 28, 50, 47, P.tan);
    // Mortar lines
    for (let r = 0; r < 6; r++) {
      const my = 30 + r * 7;
      T.line(ctx, 270, my, 319, my, P.gray);
    }
    for (let r = 0; r < 6; r++) {
      const my = 30 + r * 7;
      const off = (r % 2) * 12;
      for (let c = 0; c < 4; c++) {
        const mx = 270 + c * 24 + off;
        if (mx < 320) T.line(ctx, mx, my, mx, my + 7, P.gray);
      }
    }
    // Window
    T.rect(ctx, 273, 35, 10, 10, P.dark_brown);
    T.rect(ctx, 275, 37, 6, 6, P.dark_blue);
    T.pixel(ctx, 276, 38, P.light_blue);
    // Tavern door — solid dark_brown with frame + handle
    T.rect(ctx, 289, 49, 18, 26, P.dark_brown);
    T.rect(ctx, 291, 51, 14, 22, P.brown);
    T.line(ctx, 289, 49, 306, 49, P.tan);       // top frame highlight
    T.line(ctx, 289, 49, 289, 75, P.tan);        // left frame highlight
    T.line(ctx, 306, 49, 306, 75, P.dark_brown); // right frame shadow
    T.rect(ctx, 300, 60, 3, 3, P.yellow);        // handle plate
    T.pixel(ctx, 301, 61, P.white);              // handle glint
    // Roof
    T.polygonFill(ctx, [[267, 28], [295, 18], [323, 28]], P.dark_brown);
    T.line(ctx, 267, 28, 295, 18, P.brown);
    // Tavern sign
    T.rect(ctx, 285, 32, 24, 12, P.dark_brown);
    T.rect(ctx, 287, 34, 20, 8, P.brown);
    for (let i = 0; i < 6; i++) {
      T.pixel(ctx, 289 + i * 3, 37, P.yellow);
      T.pixel(ctx, 290 + i * 3, 38, P.yellow);
    }

    // === Forest opening (x:130–190) — solid dark_green + tree crowns ===
    T.rect(ctx, 130, 30, 60, 25, P.dark_green);
    // Path hint — darker center
    T.rect(ctx, 145, 35, 30, 20, P.black);
    T.rect(ctx, 148, 38, 24, 14, P.dark_green);
    // Tree crowns framing the path (layered ellipses)
    T.ellipseFill(ctx, 130, 28, 14, 12, P.dark_green);
    T.ellipseFill(ctx, 128, 22, 10, 8, P.green);
    T.ellipseFill(ctx, 190, 30, 14, 12, P.dark_green);
    T.ellipseFill(ctx, 192, 24, 10, 8, P.green);
    // Central canopy top
    T.ellipseFill(ctx, 160, 26, 18, 8, P.dark_green);
    T.ellipseFill(ctx, 155, 22, 10, 6, P.green);
    T.ellipseFill(ctx, 168, 23, 8, 5, P.green);
    // Tree trunks at edges
    T.rect(ctx, 124, 28, 5, 27, P.dark_brown);
    T.line(ctx, 124, 28, 124, 55, P.brown);
    T.rect(ctx, 191, 30, 5, 25, P.dark_brown);
    T.line(ctx, 191, 30, 191, 55, P.brown);

    // === Well (center, aligned with hotspot x:135 y:65 w:50 h:45) ===
    // Stone body — solid rects + mortar lines
    T.rect(ctx, 140, 72, 40, 35, P.dark_gray);
    // Mortar lines on well body
    for (let r = 0; r < 4; r++) {
      const wy = 74 + r * 7;
      T.line(ctx, 140, wy, 179, wy, P.gray);
    }
    for (let r = 0; r < 4; r++) {
      const wy = 74 + r * 7;
      const off = (r % 2) * 7;
      for (let c = 0; c < 4; c++) {
        const wx = 140 + c * 14 + off;
        if (wx < 180) T.line(ctx, wx, wy, wx, wy + 7, P.gray);
      }
    }
    // Well rim — ellipse
    T.ellipseFill(ctx, 160, 72, 22, 4, P.gray);
    T.ellipse(ctx, 160, 72, 22, 4, P.dark_gray);
    // Well hole
    T.ellipseFill(ctx, 160, 74, 17, 3, P.black);
    // Water glint pixels
    T.pixel(ctx, 155, 75, P.dark_blue);
    T.pixel(ctx, 162, 75, P.dark_blue);
    // Well posts
    T.rect(ctx, 142, 50, 4, 22, P.dark_brown);
    T.rect(ctx, 174, 50, 4, 22, P.dark_brown);
    T.line(ctx, 142, 50, 142, 72, P.brown);
    T.line(ctx, 174, 50, 174, 72, P.brown);
    // Well roof
    T.polygonFill(ctx, [[136, 50], [160, 42], [184, 50]], P.dark_brown);
    T.line(ctx, 136, 50, 160, 42, P.brown);
    T.line(ctx, 160, 42, 184, 50, P.dark_brown);
    // Rope
    T.line(ctx, 159, 48, 159, 70, P.tan);

    // === Market stall (left, aligned with hotspot x:20 y:55 w:55 h:45) ===
    // Stall body — solid wood rect + frame lines
    T.rect(ctx, 15, 62, 55, 28, P.brown);
    T.line(ctx, 15, 62, 69, 62, P.tan);         // top edge highlight
    T.line(ctx, 15, 89, 69, 89, P.dark_brown);  // bottom edge shadow
    T.line(ctx, 15, 62, 15, 89, P.dark_brown);  // left edge
    T.line(ctx, 69, 62, 69, 89, P.dark_brown);  // right edge
    // Awning — striped red/white
    for (let i = 0; i < 10; i++) {
      const color = i % 2 === 0 ? P.red : P.white;
      T.rect(ctx, 13 + i * 6, 55, 6, 6, color);
    }
    T.line(ctx, 13, 55, 72, 55, P.dark_brown);
    T.line(ctx, 13, 61, 72, 61, P.dark_brown);
    // Stall legs
    T.rect(ctx, 15, 62, 3, 28, P.dark_brown);
    T.rect(ctx, 65, 62, 3, 28, P.dark_brown);
    // Goods on stall
    T.rect(ctx, 20, 65, 8, 8, P.yellow);
    T.pixel(ctx, 22, 67, P.white);               // gold item glint
    T.rect(ctx, 32, 65, 6, 10, P.dark_green);
    T.pixel(ctx, 34, 66, P.green);               // bottle highlight
    T.rect(ctx, 42, 67, 10, 6, P.tan);
    T.line(ctx, 42, 67, 51, 67, P.white);        // box top highlight

    // === Notice board (right, aligned with hotspot x:245 y:50 w:35 h:45) ===
    // Board body — solid wood
    T.rect(ctx, 250, 55, 30, 35, P.brown);
    // Frame border rects
    T.rect(ctx, 248, 53, 34, 3, P.dark_brown);
    T.rect(ctx, 248, 88, 34, 3, P.dark_brown);
    T.rect(ctx, 248, 53, 3, 38, P.dark_brown);
    T.rect(ctx, 279, 53, 3, 38, P.dark_brown);
    // Frame highlight
    T.line(ctx, 248, 53, 281, 53, P.tan);
    // Post
    T.rect(ctx, 263, 88, 4, 15, P.dark_brown);
    T.line(ctx, 263, 88, 263, 103, P.brown);
    // Notes — white rectangles
    T.rect(ctx, 253, 58, 12, 10, P.white);
    T.rect(ctx, 267, 60, 10, 8, P.white);
    T.rect(ctx, 255, 72, 14, 12, P.white);
    // Scribble lines on notes
    T.line(ctx, 255, 60, 262, 60, P.dark_gray);
    T.line(ctx, 255, 63, 260, 63, P.dark_gray);
    T.line(ctx, 269, 62, 274, 62, P.dark_gray);
    T.line(ctx, 269, 64, 275, 64, P.dark_gray);
    T.line(ctx, 257, 75, 266, 75, P.dark_gray);
    T.line(ctx, 257, 78, 264, 78, P.dark_gray);

    // === Temple archway hint (left edge x:0–15, exit x:0 y:80 w:20 h:50) ===
    T.rect(ctx, 0, 75, 15, 55, P.dark_gray);
    // Arch shape
    T.polygonFill(ctx, [[0, 75], [8, 68], [15, 75]], P.gray);
    // Stone block lines
    T.line(ctx, 0, 82, 14, 82, P.gray);
    T.line(ctx, 0, 90, 14, 90, P.gray);
    T.line(ctx, 0, 98, 14, 98, P.gray);
    T.line(ctx, 7, 75, 7, 105, P.gray);
    // Crumbling edge — a few stray pixels
    T.pixel(ctx, 15, 78, P.gray);
    T.pixel(ctx, 16, 85, P.dark_gray);
    T.pixel(ctx, 14, 92, P.gray);
    T.pixel(ctx, 16, 100, P.dark_gray);
  }

  static _villageDetails(ctx, P) {
    // Scattered ground details — dirt variation (keep original)
    for (let i = 0; i < 20; i++) {
      const dx = (i * 47 + 11) % 310;
      const dy = 82 + (i * 13) % 50;
      T.pixel(ctx, dx, dy, i % 2 === 0 ? P.brown : P.dark_brown);
    }
    // Puddle pixel cluster (near well)
    T.pixel(ctx, 170, 112, P.dark_blue);
    T.pixel(ctx, 171, 113, P.blue);
    T.pixel(ctx, 172, 112, P.dark_blue);
    T.pixel(ctx, 171, 111, P.blue);
    // Grass tufts near buildings
    T.pixel(ctx, 42, 76, P.green);
    T.pixel(ctx, 43, 75, P.dark_green);
    T.pixel(ctx, 44, 76, P.green);
    T.pixel(ctx, 268, 76, P.green);
    T.pixel(ctx, 269, 75, P.dark_green);
    T.pixel(ctx, 270, 76, P.green);
    // Fallen leaves
    T.pixel(ctx, 95, 88, P.brown);
    T.pixel(ctx, 96, 89, P.dark_brown);
    T.pixel(ctx, 210, 95, P.yellow);
    T.pixel(ctx, 211, 96, P.brown);
  }

  static _villageShading(ctx, P) {
    // Building shadows on ground
    T.scatter(ctx, 0, 75, 45, 10, P.black, 0.3, 4);
    T.scatter(ctx, 270, 75, 50, 10, P.black, 0.3, 4);
    // Well shadow
    T.scatter(ctx, 145, 105, 30, 5, P.black, 0.25, 4);
    // Shadow under market awning
    T.scatter(ctx, 15, 62, 55, 6, P.black, 0.2, 4);
    // Warm afternoon wash
    T.scatter(ctx, 0, 0, 320, 140, P.yellow, 0.03, 4);
  }

  // Small helper tree for background
  static _miniTree(ctx, x, y, dark, light, trunk) {
    T.rect(ctx, x + 6, y + 14, 5, 12, trunk);
    T.ellipseFill(ctx, x + 8, y + 6, 10, 9, dark);
    T.ellipseFill(ctx, x + 8, y + 4, 7, 6, light);
  }

  // ================================================================
  //  FOREST PATH — 16-color EGA palette
  // ================================================================
  static generateForestPath() {
    const { canvas, ctx } = this._createCanvas(320, 140);
    const P = Palette.get('forest_path');
    this._forestBase(ctx, P);
    this._forestStructures(ctx, P);
    this._forestDetails(ctx, P);
    this._forestShading(ctx, P);
    this._forestAtmosphere(ctx, P);
    return canvas;
  }

  static _forestBase(ctx, P) {
    // Dense canopy — overlapping ellipses in green tones
    // Start with dark background
    T.rect(ctx, 0, 0, 320, 50, P.dark_green);

    // Canopy blobs (back layer)
    const canopyBlobs = [
      [30, 10, 35, 18], [80, 5, 40, 20], [140, 8, 30, 15],
      [200, 3, 38, 18], [260, 7, 35, 16], [310, 5, 30, 14],
      [0, 15, 28, 12], [55, 20, 30, 10], [120, 18, 25, 12],
      [180, 22, 28, 10], [240, 20, 32, 12], [290, 18, 25, 10],
    ];
    for (const [cx, cy, rx, ry] of canopyBlobs) {
      T.ellipseFill(ctx, cx, cy, rx, ry, P.dark_green);
    }
    // Middle canopy layer — additional green ellipse blobs for depth
    const midBlobs = [
      [15, 8, 20, 10], [50, 12, 18, 9], [100, 6, 22, 11],
      [130, 14, 16, 8], [165, 10, 20, 10], [210, 8, 18, 9],
      [245, 14, 22, 10], [275, 4, 16, 8], [305, 12, 18, 9],
      [40, 22, 14, 7], [155, 20, 16, 8], [225, 18, 14, 7],
    ];
    for (const [cx, cy, rx, ry] of midBlobs) {
      T.ellipseFill(ctx, cx, cy, rx, ry, P.green);
    }
    // Small light_green highlight ellipses
    const highlightBlobs = [
      [25, 6, 8, 4], [90, 10, 7, 3], [150, 5, 9, 4],
      [195, 8, 6, 3], [250, 10, 8, 4], [300, 8, 7, 3],
      [60, 16, 6, 3], [175, 18, 7, 3],
    ];
    for (const [cx, cy, rx, ry] of highlightBlobs) {
      T.ellipseFill(ctx, cx, cy, rx, ry, P.light_green);
    }
    // Front canopy details
    for (const [cx, cy, rx, ry] of canopyBlobs) {
      T.ellipseFill(ctx, cx + 5, cy + 3, rx - 8, ry - 5, P.green);
    }
    // Sky peeks through gaps
    T.ellipseFill(ctx, 95, 8, 6, 5, P.dark_blue);
    T.ellipseFill(ctx, 175, 12, 5, 4, P.blue);
    T.ellipseFill(ctx, 280, 6, 4, 3, P.dark_blue);

    // Ground — solid dark green base with brown earth patches
    T.rect(ctx, 0, 80, 320, 60, P.dark_green);
    // Scattered brown rect patches for earth
    const earthPatches = [
      [12, 88, 6, 3], [45, 95, 8, 2], [78, 82, 5, 3], [110, 92, 7, 2],
      [155, 86, 4, 3], [188, 98, 6, 2], [220, 84, 8, 3], [255, 90, 5, 2],
      [285, 96, 7, 3], [30, 105, 6, 2], [65, 112, 5, 3], [140, 108, 7, 2],
      [200, 115, 6, 2], [240, 120, 8, 3], [300, 102, 5, 2],
    ];
    for (const [ex, ey, ew, eh] of earthPatches) {
      T.rect(ctx, ex, ey, ew, eh, P.brown);
    }
    // Moss and earth patches (increased to ~35)
    for (let i = 0; i < 35; i++) {
      const gx = (i * 47 + 5) % 310;
      const gy = 85 + (i * 11) % 50;
      const c = i % 3 === 0 ? P.green : i % 3 === 1 ? P.light_green : P.dark_brown;
      T.rect(ctx, gx, gy, 6 + i % 4, 2 + i % 2, c);
    }
    // Green pixel grass tufts
    for (let i = 0; i < 35; i++) {
      const tx = (i * 37 + 3) % 310;
      const ty = 82 + (i * 13) % 55;
      T.pixel(ctx, tx, ty, P.green);
      T.pixel(ctx, tx + 1, ty - 1, P.green);
      T.pixel(ctx, tx + 2, ty, P.light_green);
    }

    // Path (winding dirt) — polygon shape
    T.polygonFill(ctx, [
      [130, 85], [190, 85], [210, 100], [220, 115],
      [230, 140], [90, 140], [100, 115], [115, 100],
    ], P.tan);
    // Brown rect patches for dirt variation
    const dirtPatches = [
      [105, 108, 6, 3], [120, 118, 5, 2], [135, 112, 7, 3], [150, 125, 4, 2],
      [165, 108, 6, 3], [175, 120, 5, 2], [190, 115, 7, 2], [115, 130, 6, 3],
      [140, 135, 5, 2], [195, 128, 4, 3], [155, 105, 5, 2], [210, 118, 6, 3],
    ];
    for (const [dx, dy, dw, dh] of dirtPatches) {
      T.rect(ctx, dx, dy, dw, dh, P.brown);
    }
    // Dark brown rut marks along path
    T.line(ctx, 120, 100, 125, 115, P.dark_brown);
    T.line(ctx, 160, 95, 170, 110, P.dark_brown);
    T.line(ctx, 195, 105, 200, 118, P.dark_brown);
    // Path stones / pebbles (increased to ~18)
    for (let i = 0; i < 18; i++) {
      const px = 100 + (i * 11) % 125;
      const py = 105 + (i * 7) % 30;
      T.pixel(ctx, px, py, P.gray);
      T.pixel(ctx, px + 1, py, P.dark_gray);
    }
  }

  static _forestStructures(ctx, P) {
    // Large tree (left) — tapered polygon trunk
    T.polygonFill(ctx, [
      [48, 25], [68, 25], [72, 105], [44, 105],
    ], P.brown);
    // Bark texture — vertical dark_brown lines following trunk taper
    T.line(ctx, 50, 30, 48, 100, P.dark_brown);
    T.line(ctx, 53, 28, 51, 100, P.dark_brown);
    T.line(ctx, 56, 26, 55, 102, P.dark_brown);
    T.line(ctx, 59, 26, 58, 102, P.dark_brown);
    T.line(ctx, 62, 26, 62, 103, P.dark_brown);
    T.line(ctx, 65, 27, 65, 103, P.dark_brown);
    T.line(ctx, 67, 28, 68, 104, P.dark_brown);
    T.line(ctx, 50, 35, 50, 90, P.dark_brown);
    // Brown highlight lines on right side
    T.line(ctx, 66, 30, 69, 100, P.tan);
    T.line(ctx, 68, 32, 70, 102, P.tan);
    // Left bark edge
    T.line(ctx, 46, 28, 44, 105, P.dark_brown);
    // Right bark highlight
    T.line(ctx, 69, 28, 72, 105, P.brown);
    // Canopy over trunk
    T.ellipseFill(ctx, 45, 12, 32, 18, P.dark_green);
    T.ellipseFill(ctx, 30, 20, 22, 14, P.green);
    T.ellipseFill(ctx, 62, 15, 26, 16, P.dark_green);
    // Additional green ellipse blobs for density
    T.ellipseFill(ctx, 25, 10, 14, 8, P.green);
    T.ellipseFill(ctx, 40, 6, 12, 7, P.green);
    T.ellipseFill(ctx, 55, 18, 10, 6, P.green);
    T.ellipseFill(ctx, 68, 8, 14, 9, P.green);
    T.ellipseFill(ctx, 35, 16, 10, 6, P.green);
    T.ellipseFill(ctx, 50, 4, 12, 7, P.green);
    T.ellipseFill(ctx, 72, 14, 10, 6, P.green);
    T.ellipseFill(ctx, 20, 18, 8, 5, P.green);
    // Highlight leaves
    T.ellipseFill(ctx, 38, 8, 10, 6, P.light_green);
    T.ellipseFill(ctx, 55, 10, 8, 5, P.light_green);
    // Moss on trunk — pixel cluster replacing dither
    const mossPixels = [
      [46, 55], [47, 57], [48, 56], [49, 59], [50, 58], [47, 60],
      [48, 62], [49, 61], [50, 64], [46, 63], [47, 65], [51, 66],
      [48, 67], [49, 69], [50, 68], [46, 70], [47, 71], [49, 72],
      [48, 58], [50, 60],
    ];
    for (const [mx, my] of mossPixels) {
      T.pixel(ctx, mx, my, my % 3 === 0 ? P.light_green : P.green);
    }
    // Root spread
    T.polygonFill(ctx, [[38, 100], [44, 95], [44, 105], [35, 110]], P.brown);
    T.polygonFill(ctx, [[72, 95], [78, 100], [80, 110], [72, 105]], P.brown);

    // Medium tree (right) — solid trunk with bark lines
    T.polygonFill(ctx, [
      [262, 20], [276, 20], [280, 95], [258, 95],
    ], P.brown);
    // Bark detail lines following trunk taper
    T.line(ctx, 264, 22, 260, 92, P.dark_brown);
    T.line(ctx, 267, 22, 264, 92, P.dark_brown);
    T.line(ctx, 270, 21, 268, 93, P.dark_brown);
    T.line(ctx, 273, 21, 273, 93, P.dark_brown);
    T.line(ctx, 275, 22, 277, 93, P.dark_brown);
    // Right highlight
    T.line(ctx, 275, 25, 278, 90, P.tan);
    // Left edge
    T.line(ctx, 264, 25, 260, 90, P.dark_brown);
    // Canopy
    T.ellipseFill(ctx, 268, 8, 28, 16, P.dark_green);
    T.ellipseFill(ctx, 260, 12, 20, 12, P.green);
    T.ellipseFill(ctx, 280, 10, 18, 10, P.dark_green);
    T.ellipseFill(ctx, 270, 6, 12, 7, P.light_green);

    // Small background trees
    this._miniTree(ctx, 148, 28, P.dark_green, P.green, P.dark_brown);
    this._miniTree(ctx, 178, 24, P.green, P.light_green, P.dark_brown);

    // Hermit shelter — solid walls with plank lines
    T.rect(ctx, 110, 55, 30, 20, P.dark_brown);
    // Horizontal plank lines
    T.line(ctx, 110, 60, 140, 60, P.brown);
    T.line(ctx, 110, 65, 140, 65, P.brown);
    T.line(ctx, 110, 70, 140, 70, P.brown);
    // Vertical grain lines
    T.line(ctx, 117, 55, 117, 75, P.brown);
    T.line(ctx, 125, 55, 125, 75, P.brown);
    T.line(ctx, 133, 55, 133, 75, P.brown);
    // Thatch roof polygon — solid with straw lines
    T.polygonFill(ctx, [[106, 55], [125, 45], [144, 55]], P.tan);
    // Brown horizontal straw lines
    T.line(ctx, 108, 48, 140, 48, P.brown);
    T.line(ctx, 110, 49, 138, 49, P.brown);
    T.line(ctx, 109, 50, 139, 50, P.brown);
    T.line(ctx, 111, 51, 137, 51, P.brown);
    T.line(ctx, 108, 52, 140, 52, P.brown);
    T.line(ctx, 110, 53, 138, 53, P.brown);
    T.line(ctx, 109, 54, 139, 54, P.brown);
    T.line(ctx, 107, 55, 141, 55, P.brown);
    // Dark brown bottom edge fringe pixels
    T.pixel(ctx, 107, 55, P.dark_brown);
    T.pixel(ctx, 110, 55, P.dark_brown);
    T.pixel(ctx, 114, 55, P.dark_brown);
    T.pixel(ctx, 118, 55, P.dark_brown);
    T.pixel(ctx, 122, 55, P.dark_brown);
    T.pixel(ctx, 130, 55, P.dark_brown);
    T.pixel(ctx, 135, 55, P.dark_brown);
    T.pixel(ctx, 140, 55, P.dark_brown);
    // Roof edge lines
    T.line(ctx, 106, 55, 125, 45, P.brown);
    T.line(ctx, 125, 45, 144, 55, P.dark_brown);
    // Door opening
    T.rect(ctx, 120, 60, 8, 15, P.black);
    // Hanging herbs
    T.line(ctx, 115, 48, 115, 55, P.light_green);
    T.line(ctx, 120, 46, 120, 53, P.green);
    T.line(ctx, 125, 47, 125, 54, P.light_green);
    T.pixel(ctx, 115, 48, P.green);
    T.pixel(ctx, 120, 46, P.light_green);
    T.pixel(ctx, 125, 47, P.green);
  }

  static _forestDetails(ctx, P) {
    // Mushroom ring
    const mushPositions = [
      [200, 105], [210, 100], [220, 103], [230, 108], [225, 115],
      [213, 118], [203, 114], [198, 110],
    ];
    for (let i = 0; i < mushPositions.length; i++) {
      const [mx, my] = mushPositions[i];
      // Stem
      T.rect(ctx, mx + 1, my + 2, 3, 3, P.white);
      // Cap — ellipse
      T.ellipseFill(ctx, mx + 2, my, 3, 2, P.red);
      // White spot
      T.pixel(ctx, mx + 1, my, P.white);
    }
    // Mushroom glow area — circular overlay centered on ring
    T.scatterCircle(ctx, 215, 110, 25, P.light_green, 0.08, 4);

    // Old stump — solid with horizontal grain lines
    T.polygonFill(ctx, [[252, 73], [277, 73], [278, 90], [251, 90]], P.brown);
    // Horizontal grain lines
    T.line(ctx, 253, 76, 276, 76, P.dark_brown);
    T.line(ctx, 252, 79, 277, 79, P.dark_brown);
    T.line(ctx, 253, 82, 276, 82, P.dark_brown);
    T.line(ctx, 252, 85, 277, 85, P.dark_brown);
    T.line(ctx, 253, 88, 276, 88, P.dark_brown);
    T.ellipseFill(ctx, 264, 73, 13, 3, P.tan);
    // Annual rings
    T.circle(ctx, 264, 73, 4, P.dark_brown);
    T.circle(ctx, 264, 73, 7, P.dark_brown);
    T.pixel(ctx, 264, 73, P.dark_brown);

    // Bucket near stump — solid with vertical stave lines
    T.polygonFill(ctx, [[262, 87], [274, 87], [276, 98], [260, 98]], P.tan);
    // Vertical stave lines
    T.line(ctx, 264, 87, 263, 98, P.brown);
    T.line(ctx, 267, 87, 266, 98, P.brown);
    T.line(ctx, 270, 87, 270, 98, P.brown);
    T.line(ctx, 273, 87, 274, 98, P.brown);
    T.ellipse(ctx, 268, 87, 7, 2, P.brown);
    T.line(ctx, 263, 84, 268, 82, P.tan);
    T.line(ctx, 268, 82, 273, 84, P.tan);

    // Fern clusters
    for (const [fx, fy] of [[85, 95], [145, 110], [235, 100], [290, 108]]) {
      T.pixel(ctx, fx, fy, P.green);
      T.pixel(ctx, fx - 1, fy + 1, P.light_green);
      T.pixel(ctx, fx + 1, fy + 1, P.light_green);
      T.pixel(ctx, fx - 2, fy + 2, P.green);
      T.pixel(ctx, fx + 2, fy + 2, P.green);
    }
  }

  static _forestShading(ctx, P) {
    // Light shafts — scattered yellow overlay (preserves trees/canopy underneath)
    const shaftPositions = [30, 95, 160, 225, 290];
    for (const sx of shaftPositions) {
      T.scatter(ctx, sx - 5, 0, 20, 140, P.yellow, 0.06, 4);
    }

    // Tree shadows on ground
    T.scatter(ctx, 35, 100, 40, 8, P.black, 0.35, 4);
    T.scatter(ctx, 250, 90, 35, 8, P.black, 0.35, 4);
  }

  static _forestAtmosphere(ctx, P) {
    // Scattered bright dust motes in light shaft areas
    const motes = [[35, 40], [40, 80], [98, 55], [100, 30], [165, 45],
                   [170, 70], [228, 35], [230, 60], [295, 50], [292, 85]];
    for (const [mx, my] of motes) {
      T.pixel(ctx, mx, my, P.yellow);
    }
  }

  // ================================================================
  //  ANCIENT TEMPLE — 16-color palette, clean pixel art
  // ================================================================
  static generateTemple() {
    const { canvas, ctx } = this._createCanvas(320, 140);
    const P = Palette.get('temple');
    this._templeBase(ctx, P);
    this._templeStructures(ctx, P);
    this._templeDetails(ctx, P);
    this._templeShading(ctx, P);
    this._templeAtmosphere(ctx, P);
    return canvas;
  }

  static _templeBase(ctx, P) {
    // Back wall — solid stone blocks (no dither)
    T.rect(ctx, 0, 0, 320, 75, P.dark_stone);
    // Horizontal mortar lines
    for (let row = 0; row < 9; row++) {
      const sy = row * 8 + 4;
      T.line(ctx, 0, sy, 320, sy, P.stone);
    }
    // Vertical mortar lines (staggered)
    for (let row = 0; row < 9; row++) {
      const sy = row * 8 + 4;
      const offset = (row % 2) * 16;
      for (let col = 0; col < 12; col++) {
        const sx = col * 28 + offset;
        T.line(ctx, sx, sy, sx, sy + 8, P.stone);
      }
    }

    // Floor — alternating tile rects
    T.rect(ctx, 0, 75, 320, 65, P.stone);
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 16; col++) {
        const tx = col * 22 + (row % 2) * 11;
        const ty = 76 + row * 13;
        const shade = (col + row) % 2 === 0 ? P.dark_stone : P.stone;
        T.rect(ctx, tx, ty, 20, 11, shade);
        T.line(ctx, tx, ty, tx + 19, ty, P.light_stone); // top edge
      }
    }

    // Cracked wall opening (right side) — rough polygon hole
    T.polygonFill(ctx, [
      [275, 10], [285, 5], [300, 8], [310, 15],
      [315, 40], [312, 60], [305, 70], [290, 75],
      [278, 70], [272, 50], [270, 30],
    ], P.deep_blue);
    // Opening edge — lighter stone border
    T.line(ctx, 275, 10, 285, 5, P.light_stone);
    T.line(ctx, 285, 5, 300, 8, P.light_stone);
    T.line(ctx, 300, 8, 310, 15, P.pale_stone);
    T.line(ctx, 310, 15, 315, 40, P.light_stone);
    T.line(ctx, 315, 40, 312, 60, P.light_stone);
    T.line(ctx, 312, 60, 305, 70, P.pale_stone);
    T.line(ctx, 305, 70, 290, 75, P.light_stone);
    T.line(ctx, 290, 75, 278, 70, P.light_stone);
    T.line(ctx, 278, 70, 272, 50, P.pale_stone);
    T.line(ctx, 272, 50, 270, 30, P.light_stone);
    T.line(ctx, 270, 30, 275, 10, P.light_stone);
  }

  static _templeStructures(ctx, P) {
    // Arched ceiling — polygon
    T.polygonFill(ctx, [
      [0, 18], [40, 5], [100, 0], [160, -2], [220, 0], [280, 5], [320, 18],
      [320, 22], [280, 9], [220, 4], [160, 2], [100, 4], [40, 9], [0, 22],
    ], P.stone);
    T.line(ctx, 0, 22, 40, 9, P.light_stone);
    T.line(ctx, 40, 9, 100, 4, P.light_stone);
    T.line(ctx, 100, 4, 160, 2, P.light_stone);
    T.line(ctx, 160, 2, 220, 4, P.light_stone);
    T.line(ctx, 220, 4, 280, 9, P.light_stone);

    // Left column (intact)
    T.rect(ctx, 55, 20, 14, 55, P.stone);
    T.rect(ctx, 53, 20, 18, 4, P.light_stone); // capital
    T.rect(ctx, 53, 71, 18, 4, P.light_stone); // base
    T.line(ctx, 55, 24, 55, 71, P.light_stone); // left highlight
    T.line(ctx, 68, 24, 68, 71, P.dark_stone);  // right shadow

    // Center column (intact)
    T.rect(ctx, 153, 20, 14, 55, P.stone);
    T.rect(ctx, 151, 20, 18, 4, P.light_stone);
    T.rect(ctx, 151, 71, 18, 4, P.light_stone);
    T.line(ctx, 153, 24, 153, 71, P.light_stone);
    T.line(ctx, 166, 24, 166, 71, P.dark_stone);

    // Right column (broken — top half only + rubble)
    T.rect(ctx, 233, 45, 14, 30, P.stone);
    T.rect(ctx, 231, 71, 18, 4, P.light_stone); // base
    // Jagged break at top
    T.polygonFill(ctx, [
      [233, 45], [237, 42], [241, 46], [244, 43], [247, 45],
      [247, 48], [233, 48],
    ], P.stone);
    // Rubble pieces on floor
    T.rect(ctx, 225, 90, 8, 5, P.light_stone);
    T.rect(ctx, 235, 92, 6, 4, P.stone);
    T.rect(ctx, 243, 88, 10, 6, P.light_stone);
    T.rect(ctx, 240, 95, 5, 3, P.pale_stone);

    // Stone altar (center-left)
    T.rect(ctx, 90, 80, 40, 20, P.stone);
    T.rect(ctx, 88, 78, 44, 4, P.light_stone); // altar top
    T.line(ctx, 88, 78, 131, 78, P.pale_stone); // top highlight
    // Single subtle dither for altar surface texture (the only dither in the room)
    T.dither(ctx, 90, 82, 40, 16, P.stone, P.dark_stone, 0.15, 4);
    // Gold vessel on altar
    T.rect(ctx, 104, 72, 12, 8, P.dark_gold);
    T.rect(ctx, 106, 70, 8, 4, P.gold);
    T.ellipseFill(ctx, 110, 70, 5, 2, P.bright_gold);
    T.pixel(ctx, 108, 74, P.bright_gold); // vessel glow dot
    T.pixel(ctx, 112, 74, P.bright_gold);
  }

  static _templeDetails(ctx, P) {
    // Gold rune pixels on back wall
    const runePositions = [
      [30, 35], [32, 40], [34, 35], [36, 42],
      [130, 30], [133, 34], [136, 30], [132, 38],
      [190, 32], [193, 36], [196, 32], [191, 40],
    ];
    for (const [rx, ry] of runePositions) {
      T.pixel(ctx, rx, ry, P.gold);
    }

    // Wall cracks (lines)
    T.line(ctx, 80, 25, 85, 45, P.black);
    T.line(ctx, 85, 45, 82, 55, P.black);
    T.line(ctx, 200, 15, 205, 30, P.black);
    T.line(ctx, 205, 30, 202, 40, P.black);

    // Faded tapestry (left wall)
    T.rect(ctx, 10, 28, 18, 30, P.dark_purple);
    T.rect(ctx, 12, 30, 14, 26, P.purple);
    // Tapestry pattern — simple gold lines
    T.line(ctx, 15, 34, 22, 34, P.dark_gold);
    T.line(ctx, 15, 40, 22, 40, P.dark_gold);
    T.line(ctx, 15, 46, 22, 46, P.dark_gold);
    T.pixel(ctx, 18, 37, P.gold);
    T.pixel(ctx, 18, 43, P.gold);
    // Frayed bottom edge
    T.pixel(ctx, 12, 56, P.purple);
    T.pixel(ctx, 15, 58, P.dark_purple);
    T.pixel(ctx, 19, 57, P.purple);
    T.pixel(ctx, 23, 58, P.dark_purple);

    // Fallen candelabra on floor (right area)
    // Horizontal shaft
    T.line(ctx, 175, 105, 210, 103, P.dark_gold);
    T.line(ctx, 175, 106, 210, 104, P.gold);
    // Candle stubs
    T.rect(ctx, 177, 101, 3, 4, P.pale_stone);
    T.rect(ctx, 195, 100, 3, 3, P.pale_stone);
    T.rect(ctx, 207, 99, 3, 4, P.pale_stone);
    // Base ring
    T.circle(ctx, 175, 106, 3, P.dark_gold);

    // Vine on broken column
    T.line(ctx, 236, 45, 238, 55, P.vine_green);
    T.line(ctx, 238, 55, 235, 62, P.vine_green);
    T.line(ctx, 235, 62, 237, 70, P.vine_green);
    T.pixel(ctx, 234, 50, P.vine_green);
    T.pixel(ctx, 239, 58, P.vine_green);
    T.pixel(ctx, 233, 65, P.vine_green);
  }

  static _templeShading(ctx, P) {
    // Column shadows on floor (scatter only)
    T.scatter(ctx, 50, 76, 24, 8, P.black, 0.3, 4);
    T.scatter(ctx, 148, 76, 24, 8, P.black, 0.3, 4);
    T.scatter(ctx, 228, 76, 24, 8, P.black, 0.25, 4);

    // Altar shadow
    T.scatter(ctx, 88, 100, 44, 6, P.black, 0.35, 4);

    // Ceiling shadow band
    T.scatter(ctx, 0, 18, 270, 8, P.black, 0.2, 4);

    // Rubble shadow
    T.scatter(ctx, 224, 94, 30, 4, P.black, 0.2, 4);
  }

  static _templeAtmosphere(ctx, P) {
    // Light shaft from wall opening — pale scattered glow
    T.scatter(ctx, 270, 10, 45, 130, P.pale_stone, 0.06, 4);
    T.scatter(ctx, 265, 75, 50, 40, P.pale_stone, 0.04, 4);

    // Altar glow — warm gold circle
    T.scatterCircle(ctx, 110, 75, 25, P.bright_gold, 0.07, 4);
    T.scatterCircle(ctx, 110, 75, 15, P.gold, 0.05, 4);

    // Cool blue ambient wash
    T.scatter(ctx, 0, 0, 260, 140, P.deep_blue, 0.03, 4);

    // Purple haze on floor
    T.scatter(ctx, 0, 90, 260, 50, P.dark_purple, 0.04, 4);

    // Dust motes in light shaft
    const motes = [
      [280, 20], [290, 35], [285, 50], [295, 65],
      [275, 80], [288, 95], [300, 25], [278, 110],
    ];
    for (const [mx, my] of motes) {
      T.pixel(ctx, mx, my, P.pale_stone);
    }
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
