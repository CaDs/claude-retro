/**
 * ProceduralAssets — Generates all game art procedurally using canvas.
 * This replaces external image files with runtime-generated pixel art.
 */
export class ProceduralAssets {
  /**
   * Generate all game assets and add them to the asset cache.
   * @param {AssetLoader} assetLoader
   */
  static generateAll(assetLoader) {
    // Room backgrounds
    assetLoader.cache.set('room_village_square', this.generateVillageSquare());
    assetLoader.cache.set('room_tavern', this.generateTavern());
    assetLoader.cache.set('room_forest_path', this.generateForestPath());

    // Item icons
    assetLoader.cache.set('item_gold_coin', this.generateItemIcon('gold_coin'));
    assetLoader.cache.set('item_old_key', this.generateItemIcon('old_key'));
    assetLoader.cache.set('item_rope', this.generateItemIcon('rope'));
    assetLoader.cache.set('item_bucket', this.generateItemIcon('bucket'));
    assetLoader.cache.set('item_enchanted_tankard', this.generateItemIcon('enchanted_tankard'));
    assetLoader.cache.set('item_mysterious_note', this.generateItemIcon('mysterious_note'));

    // Cursor
    assetLoader.cache.set('cursor', this.generateCursor());
  }

  /**
   * Create a canvas of given size.
   */
  static _createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx };
  }

  /**
   * Draw a single pixel.
   */
  static _pixel(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  }

  /**
   * Fill a rectangle with a color.
   */
  static _rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  /**
   * Draw simple dithered gradient vertically.
   */
  static _gradientV(ctx, x, y, w, h, color1, color2) {
    for (let row = 0; row < h; row++) {
      const t = row / h;
      const r1 = parseInt(color1.slice(1, 3), 16);
      const g1 = parseInt(color1.slice(3, 5), 16);
      const b1 = parseInt(color1.slice(5, 7), 16);
      const r2 = parseInt(color2.slice(1, 3), 16);
      const g2 = parseInt(color2.slice(3, 5), 16);
      const b2 = parseInt(color2.slice(5, 7), 16);

      const r = Math.floor(r1 + (r2 - r1) * t);
      const g = Math.floor(g1 + (g2 - g1) * t);
      const b = Math.floor(b1 + (b2 - b1) * t);

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y + row, w, 1);
    }
  }

  // ========================================================
  //  VILLAGE SQUARE
  // ========================================================
  static generateVillageSquare() {
    const { canvas, ctx } = this._createCanvas(320, 140);

    // Sky gradient
    this._gradientV(ctx, 0, 0, 320, 55, '#4488cc', '#88bbee');

    // Clouds
    this._rect(ctx, 40, 8, 30, 6, '#c8ddf0');
    this._rect(ctx, 44, 5, 22, 4, '#d8eaf4');
    this._rect(ctx, 180, 12, 25, 5, '#c8ddf0');
    this._rect(ctx, 184, 9, 17, 4, '#d8eaf4');
    this._rect(ctx, 260, 6, 20, 5, '#c8ddf0');

    // Background buildings
    // Left building
    this._rect(ctx, 0, 25, 40, 50, '#8a7a5a');
    this._rect(ctx, 3, 30, 10, 12, '#6a5a3a'); // window
    this._rect(ctx, 6, 33, 4, 4, '#aab866');   // window glass
    this._rect(ctx, 20, 30, 10, 12, '#6a5a3a');
    this._rect(ctx, 23, 33, 4, 4, '#aab866');
    this._rect(ctx, 0, 20, 40, 6, '#6a4a2a'); // roof
    this._rect(ctx, -3, 18, 46, 4, '#5a3a1a');

    // Right building (with tavern door)
    this._rect(ctx, 270, 28, 50, 47, '#7a6a4a');
    this._rect(ctx, 273, 35, 10, 10, '#5a4a2a'); // window
    this._rect(ctx, 276, 38, 4, 4, '#aa9966');
    this._rect(ctx, 290, 50, 16, 25, '#3a2a15'); // tavern door
    this._rect(ctx, 300, 60, 3, 3, '#cca833');   // door handle
    this._rect(ctx, 270, 23, 50, 6, '#5a3a1a');  // roof
    this._rect(ctx, 267, 21, 56, 4, '#4a2a0a');

    // Tavern sign
    this._rect(ctx, 285, 32, 24, 12, '#5a3a1a');
    ctx.fillStyle = '#cca833';
    ctx.font = '4px monospace';
    ctx.fillText('TAVERN', 287, 41);

    // Center background — forest path opening
    this._rect(ctx, 130, 30, 60, 25, '#2a4a2a');
    this._rect(ctx, 140, 25, 40, 10, '#1a3a1a');
    this._rect(ctx, 148, 22, 24, 8, '#0f2a0f');
    // Trees around path
    this._drawTree(ctx, 120, 15, '#2a5a2a', '#1a3a0a');
    this._drawTree(ctx, 188, 18, '#2a5a2a', '#1a3a0a');

    // Ground — cobblestone
    this._rect(ctx, 0, 75, 320, 65, '#8a7a6a');
    // Cobblestone pattern
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 20; col++) {
        const sx = col * 17 + (row % 2) * 8;
        const sy = 78 + row * 8;
        const shade = (col + row) % 3 === 0 ? '#7a6a5a' : '#9a8a7a';
        this._rect(ctx, sx, sy, 15, 6, shade);
        this._rect(ctx, sx, sy, 15, 1, '#6a5a4a'); // top edge
        this._rect(ctx, sx, sy, 1, 6, '#6a5a4a');  // left edge
      }
    }

    // Well (center)
    this._rect(ctx, 140, 72, 40, 35, '#6a6a6a');   // well body
    this._rect(ctx, 137, 70, 46, 4, '#7a7a7a');     // well rim
    this._rect(ctx, 143, 74, 34, 28, '#1a1a2a');    // well hole (dark)
    this._rect(ctx, 148, 76, 24, 2, '#2a2a3a');     // water glint
    // Well posts and roof
    this._rect(ctx, 142, 50, 4, 22, '#5a4a2a');
    this._rect(ctx, 174, 50, 4, 22, '#5a4a2a');
    this._rect(ctx, 138, 45, 44, 6, '#5a3a1a');     // roof
    this._rect(ctx, 140, 44, 40, 2, '#4a2a0a');
    // Rope
    this._rect(ctx, 159, 48, 1, 20, '#8a7a5a');

    // Market stall (left)
    this._rect(ctx, 15, 60, 55, 30, '#6a4a2a');     // stall body
    this._rect(ctx, 13, 55, 59, 6, '#aa3333');       // awning
    this._rect(ctx, 13, 53, 59, 3, '#cc4444');
    // Goods on stall
    this._rect(ctx, 20, 65, 8, 8, '#ddaa44');        // yellow item
    this._rect(ctx, 32, 65, 6, 10, '#88aa44');        // green bottle
    this._rect(ctx, 42, 67, 10, 6, '#aa8866');        // box
    // Rope coil
    this._rect(ctx, 35, 73, 15, 10, '#8a7a5a');
    this._rect(ctx, 38, 75, 9, 6, '#9a8a6a');

    // Notice board (right area)
    this._rect(ctx, 250, 55, 30, 35, '#5a4a2a');     // board
    this._rect(ctx, 248, 53, 34, 3, '#4a3a1a');      // top frame
    this._rect(ctx, 248, 88, 34, 3, '#4a3a1a');      // bottom frame
    this._rect(ctx, 248, 53, 3, 38, '#4a3a1a');      // left frame
    this._rect(ctx, 279, 53, 3, 38, '#4a3a1a');      // right frame
    // Post
    this._rect(ctx, 263, 88, 4, 15, '#4a3a1a');
    // Notes pinned
    this._rect(ctx, 253, 58, 12, 10, '#eeddaa');
    this._rect(ctx, 267, 60, 10, 8, '#ddccaa');
    this._rect(ctx, 255, 72, 14, 12, '#eeeebb');

    return canvas;
  }

  // ========================================================
  //  TAVERN
  // ========================================================
  static generateTavern() {
    const { canvas, ctx } = this._createCanvas(320, 140);

    // Ceiling
    this._rect(ctx, 0, 0, 320, 25, '#2a1a0a');
    // Wooden beams
    this._rect(ctx, 0, 0, 320, 3, '#3a2a15');
    this._rect(ctx, 50, 0, 4, 25, '#3a2a15');
    this._rect(ctx, 160, 0, 4, 25, '#3a2a15');
    this._rect(ctx, 270, 0, 4, 25, '#3a2a15');

    // Back wall
    this._rect(ctx, 0, 25, 320, 50, '#4a3a2a');
    // Stone wall texture
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 16; col++) {
        const sx = col * 22 + (row % 2) * 11;
        const sy = 26 + row * 10;
        const shade = (col + row) % 2 === 0 ? '#453525' : '#4f3f2f';
        this._rect(ctx, sx, sy, 20, 8, shade);
      }
    }

    // Floor
    this._rect(ctx, 0, 75, 320, 65, '#3a2a1a');
    // Wooden planks
    for (let i = 0; i < 14; i++) {
      const y = 76 + i * 5;
      this._rect(ctx, 0, y, 320, 4, i % 2 === 0 ? '#352518' : '#3f2f1f');
      this._rect(ctx, 0, y, 320, 1, '#2a1a0a');
    }

    // Fireplace (left)
    this._rect(ctx, 5, 35, 45, 50, '#555');           // stone frame
    this._rect(ctx, 10, 40, 35, 40, '#111');           // opening
    // Fire
    this._rect(ctx, 18, 65, 6, 10, '#ff6622');
    this._rect(ctx, 26, 62, 5, 13, '#ffaa22');
    this._rect(ctx, 20, 60, 8, 8, '#ff4411');
    this._rect(ctx, 22, 58, 4, 5, '#ffdd44');
    // Logs
    this._rect(ctx, 14, 75, 28, 4, '#4a2a0a');
    this._rect(ctx, 16, 72, 24, 4, '#3a1a00');
    // Mantle
    this._rect(ctx, 2, 32, 51, 5, '#666');

    // Bar counter
    this._rect(ctx, 85, 65, 140, 20, '#5a3a15');      // counter front
    this._rect(ctx, 85, 62, 140, 4, '#6a4a25');       // counter top
    this._rect(ctx, 85, 65, 140, 2, '#4a2a0a');       // shadow line
    // Bar counter legs
    this._rect(ctx, 88, 80, 5, 12, '#4a2a0a');
    this._rect(ctx, 218, 80, 5, 12, '#4a2a0a');

    // Shelves behind bar
    this._rect(ctx, 90, 28, 120, 3, '#5a3a15');  // top shelf
    this._rect(ctx, 90, 42, 120, 3, '#5a3a15');  // middle shelf
    this._rect(ctx, 90, 56, 120, 3, '#5a3a15');  // bottom shelf

    // Bottles on shelves
    const bottleColors = ['#448844', '#884444', '#444488', '#886644', '#448888'];
    for (let i = 0; i < 8; i++) {
      const bx = 95 + i * 14;
      const color = bottleColors[i % bottleColors.length];
      this._rect(ctx, bx, 45, 5, 10, color);
      this._rect(ctx, bx + 1, 43, 3, 3, color);
    }
    for (let i = 0; i < 6; i++) {
      const bx = 100 + i * 16;
      const color = bottleColors[(i + 2) % bottleColors.length];
      this._rect(ctx, bx, 31, 5, 10, color);
      this._rect(ctx, bx + 1, 29, 3, 3, color);
    }

    // Enchanted Tankard (on high shelf, glowing)
    this._rect(ctx, 152, 20, 16, 12, '#cc9922');     // tankard body
    this._rect(ctx, 149, 20, 4, 8, '#cc9922');        // handle
    this._rect(ctx, 152, 18, 16, 3, '#ddaa33');       // rim
    // Glow effect
    this._rect(ctx, 148, 16, 24, 18, 'rgba(255,221,80,0.15)');
    this._rect(ctx, 150, 18, 20, 14, 'rgba(255,221,80,0.1)');

    // Cabinet (right, behind bar)
    this._rect(ctx, 230, 32, 30, 50, '#5a3a15');
    this._rect(ctx, 233, 35, 24, 20, '#4a2a0a');      // upper doors
    this._rect(ctx, 233, 58, 24, 20, '#4a2a0a');      // lower doors
    this._rect(ctx, 244, 42, 2, 8, '#886633');         // handle
    this._rect(ctx, 244, 65, 2, 8, '#886633');         // handle
    // Lock
    this._rect(ctx, 244, 46, 2, 2, '#aaaaaa');
    this._rect(ctx, 232, 34, 26, 1, '#3a1a00');
    this._rect(ctx, 232, 56, 26, 1, '#3a1a00');

    // Ale barrel (far right)
    this._rect(ctx, 272, 78, 30, 32, '#5a3a15');
    this._rect(ctx, 270, 80, 34, 2, '#6a4a25');       // ring
    this._rect(ctx, 270, 95, 34, 2, '#6a4a25');       // ring
    this._rect(ctx, 285, 85, 4, 6, '#3a2a0a');        // tap

    // Door (left exit)
    this._rect(ctx, 0, 40, 18, 50, '#3a2515');
    this._rect(ctx, 2, 42, 14, 45, '#4a3520');
    this._rect(ctx, 12, 60, 3, 3, '#886633');          // handle

    // Hanging lanterns (warm light)
    this._rect(ctx, 120, 5, 6, 8, '#886633');
    this._rect(ctx, 121, 8, 4, 4, '#ffaa44');
    this._rect(ctx, 200, 5, 6, 8, '#886633');
    this._rect(ctx, 201, 8, 4, 4, '#ffaa44');

    // Warm ambient lighting overlay
    ctx.fillStyle = 'rgba(255, 180, 80, 0.08)';
    ctx.fillRect(0, 0, 320, 140);

    return canvas;
  }

  // ========================================================
  //  FOREST PATH
  // ========================================================
  static generateForestPath() {
    const { canvas, ctx } = this._createCanvas(320, 140);

    // Deep sky through canopy
    this._gradientV(ctx, 0, 0, 320, 50, '#1a3a2a', '#2a5a3a');

    // Canopy cover (dark green blobs)
    for (let i = 0; i < 40; i++) {
      const x = (i * 37 + 13) % 320;
      const y = (i * 7 + 3) % 30;
      const w = 20 + (i * 13) % 25;
      const h = 10 + (i * 7) % 15;
      const shade = i % 3 === 0 ? '#1a4a1a' : i % 3 === 1 ? '#225522' : '#1a3a12';
      this._rect(ctx, x, y, w, h, shade);
    }

    // Light shafts
    ctx.fillStyle = 'rgba(255, 230, 150, 0.06)';
    for (let i = 0; i < 5; i++) {
      const x = 30 + i * 65;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 15, 0);
      ctx.lineTo(x + 30, 140);
      ctx.lineTo(x - 5, 140);
      ctx.fill();
    }

    // Ground
    this._gradientV(ctx, 0, 80, 320, 60, '#3a5a2a', '#2a4a1a');
    // Moss and earth patches
    for (let i = 0; i < 30; i++) {
      const x = (i * 47 + 5) % 310;
      const y = 85 + (i * 11) % 50;
      const shade = i % 4 === 0 ? '#2a5a2a' : i % 4 === 1 ? '#3a6a3a' : i % 4 === 2 ? '#4a3a1a' : '#354a25';
      this._rect(ctx, x, y, 8 + i % 5, 3 + i % 3, shade);
    }

    // Path (winding dirt)
    this._rect(ctx, 100, 115, 120, 25, '#5a4a2a');
    this._rect(ctx, 90, 120, 140, 20, '#5a4a2a');
    this._rect(ctx, 120, 100, 80, 20, '#4a3a1a');
    this._rect(ctx, 130, 90, 60, 15, '#4a3a1a');
    // Path detail
    for (let i = 0; i < 10; i++) {
      const x = 105 + (i * 13);
      const y = 122 + (i % 3) * 3;
      this._rect(ctx, x, y, 4, 2, '#6a5a3a');
    }

    // Large tree (left)
    this._rect(ctx, 45, 25, 25, 80, '#3a2a15');    // trunk
    this._rect(ctx, 42, 30, 4, 60, '#352515');      // bark detail
    this._rect(ctx, 67, 35, 4, 50, '#352515');
    // Branches and leaves
    this._drawTreeCanopy(ctx, 30, 5, 60, 35, '#1a5a1a');
    this._drawTreeCanopy(ctx, 10, 15, 40, 25, '#226622');
    this._drawTreeCanopy(ctx, 55, 10, 50, 30, '#1a4a12');
    // Moss on trunk
    this._rect(ctx, 45, 60, 8, 15, '#3a6a2a');

    // Medium tree (right)
    this._rect(ctx, 260, 20, 18, 75, '#3a2a15');
    this._rect(ctx, 257, 25, 4, 55, '#352515');
    this._drawTreeCanopy(ctx, 240, 0, 50, 30, '#1a5a1a');
    this._drawTreeCanopy(ctx, 255, 5, 40, 25, '#226622');

    // Small trees in background
    this._drawTree(ctx, 150, 30, '#1a4a1a', '#2a1a0a');
    this._drawTree(ctx, 180, 25, '#225522', '#2a1a0a');

    // Hermit area (center-left) — small dwelling hints
    this._rect(ctx, 110, 55, 30, 20, '#4a3a1a');    // shelter
    this._rect(ctx, 108, 52, 34, 5, '#3a5a2a');     // mossy roof
    // Hanging herbs
    this._rect(ctx, 115, 48, 2, 8, '#5a8a3a');
    this._rect(ctx, 120, 46, 2, 10, '#4a7a2a');
    this._rect(ctx, 125, 47, 2, 9, '#6a9a4a');

    // Mushroom ring (right area)
    const mushColors = ['#cc4444', '#dd6644', '#cc5555', '#ee5533', '#dd4455'];
    const mushPositions = [
      [200, 105], [210, 100], [220, 103], [230, 108], [225, 115],
      [213, 118], [203, 114], [198, 110]
    ];
    for (let i = 0; i < mushPositions.length; i++) {
      const [mx, my] = mushPositions[i];
      this._rect(ctx, mx + 1, my + 2, 3, 3, '#ddd');    // stem
      this._rect(ctx, mx, my, 5, 3, mushColors[i % mushColors.length]); // cap
      this._rect(ctx, mx + 1, my, 1, 1, '#fff');         // spot
    }
    // Glow effect
    ctx.fillStyle = 'rgba(100, 255, 100, 0.05)';
    ctx.beginPath();
    ctx.arc(215, 110, 25, 0, Math.PI * 2);
    ctx.fill();

    // Old stump (far right)
    this._rect(ctx, 252, 75, 25, 15, '#4a3a1a');
    this._rect(ctx, 250, 73, 29, 4, '#5a4a2a');       // flat top
    // Annual rings
    ctx.strokeStyle = '#3a2a0a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(265, 75, 5, 0, Math.PI * 2);
    ctx.stroke();

    // Bucket near stump
    this._rect(ctx, 262, 88, 12, 10, '#6a5a3a');
    this._rect(ctx, 260, 87, 16, 2, '#7a6a4a');       // rim
    this._rect(ctx, 260, 96, 16, 2, '#5a4a2a');       // bottom ring

    // Atmospheric overlay
    ctx.fillStyle = 'rgba(50, 100, 50, 0.1)';
    ctx.fillRect(0, 0, 320, 140);

    return canvas;
  }

  // ========================================================
  //  HELPER DRAWING METHODS
  // ========================================================

  static _drawTree(ctx, x, y, leafColor, trunkColor) {
    // Simple small tree
    this._rect(ctx, x + 6, y + 12, 5, 18, trunkColor);
    this._rect(ctx, x, y, 18, 14, leafColor);
    this._rect(ctx, x + 2, y - 3, 14, 6, leafColor);
    this._rect(ctx, x + 4, y - 5, 10, 4, leafColor);
  }

  static _drawTreeCanopy(ctx, x, y, w, h, color) {
    // Blob-like tree canopy
    this._rect(ctx, x, y + 4, w, h - 8, color);
    this._rect(ctx, x + 4, y, w - 8, h, color);
    this._rect(ctx, x + 2, y + 2, w - 4, h - 4, color);
  }

  // ========================================================
  //  ITEM ICONS
  // ========================================================
  static generateItemIcon(itemId) {
    const { canvas, ctx } = this._createCanvas(32, 20);

    switch (itemId) {
      case 'gold_coin':
        this._rect(ctx, 10, 3, 12, 14, '#cc9922');
        this._rect(ctx, 12, 1, 8, 2, '#cc9922');
        this._rect(ctx, 12, 17, 8, 2, '#cc9922');
        this._rect(ctx, 8, 5, 2, 10, '#cc9922');
        this._rect(ctx, 22, 5, 2, 10, '#cc9922');
        // Dragon symbol
        this._rect(ctx, 14, 6, 4, 8, '#aa7711');
        this._rect(ctx, 13, 8, 6, 4, '#aa7711');
        // Shine
        this._rect(ctx, 11, 4, 2, 2, '#ffdd77');
        break;

      case 'old_key':
        // Key shaft
        this._rect(ctx, 8, 10, 16, 2, '#888');
        this._rect(ctx, 8, 9, 16, 1, '#999');
        // Key head
        this._rect(ctx, 4, 6, 8, 8, '#888');
        this._rect(ctx, 6, 4, 4, 12, '#888');
        this._rect(ctx, 6, 8, 4, 4, '#666'); // hole
        // Key teeth
        this._rect(ctx, 22, 10, 2, 4, '#888');
        this._rect(ctx, 25, 10, 2, 3, '#888');
        break;

      case 'rope':
        // Coiled rope
        ctx.strokeStyle = '#8a7a5a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(16, 10, 6, 0, Math.PI * 1.8);
        ctx.stroke();
        ctx.strokeStyle = '#9a8a6a';
        ctx.beginPath();
        ctx.arc(16, 10, 4, 0, Math.PI * 1.5);
        ctx.stroke();
        this._rect(ctx, 20, 5, 4, 2, '#8a7a5a');
        break;

      case 'bucket':
        this._rect(ctx, 9, 6, 14, 12, '#6a5a3a');
        this._rect(ctx, 7, 5, 18, 2, '#7a6a4a');     // rim
        this._rect(ctx, 8, 16, 16, 2, '#5a4a2a');    // bottom
        this._rect(ctx, 10, 4, 12, 1, '#8a7a5a');    // handle
        this._rect(ctx, 10, 2, 1, 3, '#8a7a5a');
        this._rect(ctx, 21, 2, 1, 3, '#8a7a5a');
        break;

      case 'enchanted_tankard':
        // Tankard body
        this._rect(ctx, 10, 4, 12, 12, '#cc9922');
        this._rect(ctx, 8, 4, 2, 10, '#cc9922');     // handle
        this._rect(ctx, 8, 6, 2, 2, '#aa7711');
        this._rect(ctx, 10, 2, 12, 3, '#ddaa33');    // rim
        this._rect(ctx, 10, 15, 12, 2, '#aa7711');   // base
        // Runes
        this._rect(ctx, 13, 7, 2, 6, '#ffdd77');
        this._rect(ctx, 17, 7, 2, 6, '#ffdd77');
        // Glow
        this._rect(ctx, 7, 1, 18, 18, 'rgba(255,221,80,0.15)');
        break;

      case 'mysterious_note':
        this._rect(ctx, 8, 3, 16, 14, '#eeddaa');
        this._rect(ctx, 8, 3, 16, 1, '#ddcc99');
        // Text lines
        this._rect(ctx, 10, 6, 12, 1, '#886644');
        this._rect(ctx, 10, 9, 10, 1, '#886644');
        this._rect(ctx, 10, 12, 11, 1, '#886644');
        // Fold
        this._rect(ctx, 20, 3, 4, 4, '#ddcc88');
        break;
    }

    return canvas;
  }

  // ========================================================
  //  CURSOR
  // ========================================================
  static generateCursor() {
    const { canvas, ctx } = this._createCanvas(8, 8);

    // Crosshair cursor
    this._rect(ctx, 3, 0, 2, 3, '#ffdd57');
    this._rect(ctx, 3, 5, 2, 3, '#ffdd57');
    this._rect(ctx, 0, 3, 3, 2, '#ffdd57');
    this._rect(ctx, 5, 3, 3, 2, '#ffdd57');
    // Center dot
    this._rect(ctx, 3, 3, 2, 2, '#fff');

    return canvas;
  }
}
