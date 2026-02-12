/**
 * CharacterGenerator — EGA-style trait-based procedural pixel-art character assembly.
 * Produces characters with ellipse heads, polygon torsos, articulated arms,
 * facial features, per-pixel shading, and 8-frame walk cycles.
 */
import { PixelArtToolkit as T } from './PixelArtToolkit.js';

export class CharacterGenerator {
  // --- Skin tone palettes (base, shadow, highlight) ---
  static SKIN_TONES = {
    fair:  { base: '#f0c8a0', shadow: '#d4a574', highlight: '#ffe0c0' },
    tan:   { base: '#d4a574', shadow: '#b8845a', highlight: '#e8c090' },
    brown: { base: '#a0724a', shadow: '#8a5e3a', highlight: '#b88860' },
    dark:  { base: '#6a4a2a', shadow: '#5a3a1a', highlight: '#7a5a3a' },
    pale:  { base: '#e8d8c8', shadow: '#d0c0a8', highlight: '#f8e8d8' },
  };

  // --- Hair color palettes ---
  static HAIR_COLORS = {
    brown:  { base: '#6b3a2a', highlight: '#8b5a3a' },
    black:  { base: '#2a2a2a', highlight: '#4a4a4a' },
    blonde: { base: '#d4a040', highlight: '#e8c060' },
    red:    { base: '#8b3020', highlight: '#a84030' },
    gray:   { base: '#888888', highlight: '#aaaaaa' },
    white:  { base: '#cccccc', highlight: '#eeeeee' },
  };

  // --- Named clothing colors ---
  static CLOTHING_COLORS = {
    blue:   '#4a86c8',
    red:    '#c84a4a',
    green:  '#4ac84a',
    brown:  '#8b6a4a',
    purple: '#8b4ac8',
    white:  '#e8e8e8',
    black:  '#3a3a3a',
    yellow: '#c8c84a',
    orange: '#c88a4a',
    gray:   '#8a8a8a',
  };

  // --- Body templates (expanded with arm/leg data) ---
  static BODY_TEMPLATES = {
    slim:    { bodyW: 12, bodyH: 14, headRx: 5, headRy: 5, shoulderW: 12, armLen: 5, forearmLen: 4, legUpper: 5, legLower: 5, legW: 3 },
    average: { bodyW: 14, bodyH: 14, headRx: 5, headRy: 5, shoulderW: 14, armLen: 5, forearmLen: 4, legUpper: 5, legLower: 5, legW: 3 },
    stocky:  { bodyW: 16, bodyH: 16, headRx: 6, headRy: 6, shoulderW: 16, armLen: 5, forearmLen: 4, legUpper: 5, legLower: 5, legW: 4 },
    tall:    { bodyW: 14, bodyH: 18, headRx: 5, headRy: 5, shoulderW: 14, armLen: 6, forearmLen: 5, legUpper: 6, legLower: 6, legW: 3 },
  };

  // --- 8-frame walk cycle data ---
  static BOB =       [0, 1, 0, -1, 0, 1, 0, -1];
  static LEG_DATA = [
    // frame 0: standing
    { lx: 0, ly: 0, rx: 0, ry: 0 },
    // frame 1: left forward
    { lx: -2, ly: -1, rx: 2, ry: 0 },
    // frame 2: left mid
    { lx: -1, ly: -2, rx: 1, ry: 0 },
    // frame 3: contact
    { lx: 0, ly: -1, rx: 0, ry: -1 },
    // frame 4: standing (mirror)
    { lx: 0, ly: 0, rx: 0, ry: 0 },
    // frame 5: right forward
    { lx: 2, ly: 0, rx: -2, ry: -1 },
    // frame 6: right mid
    { lx: 1, ly: 0, rx: -1, ry: -2 },
    // frame 7: contact mirror
    { lx: 0, ly: -1, rx: 0, ry: -1 },
  ];
  static ARM_SWING = [
    { l: 0, r: 0 },
    { l: 2, r: -2 },
    { l: 1, r: -1 },
    { l: 0, r: 0 },
    { l: 0, r: 0 },
    { l: -2, r: 2 },
    { l: -1, r: 1 },
    { l: 0, r: 0 },
  ];

  // Reusable flip buffer
  static _flipCanvas = null;
  static _flipCtx = null;

  static _getFlipBuffer(w, h) {
    if (!this._flipCanvas || this._flipCanvas.width < w || this._flipCanvas.height < h) {
      this._flipCanvas = document.createElement('canvas');
      this._flipCanvas.width = w;
      this._flipCanvas.height = h;
      this._flipCtx = this._flipCanvas.getContext('2d');
      this._flipCtx.imageSmoothingEnabled = false;
    }
    this._flipCtx.clearRect(0, 0, this._flipCanvas.width, this._flipCanvas.height);
    return { canvas: this._flipCanvas, ctx: this._flipCtx };
  }

  /**
   * Draw a character sprite directly.
   * @param {object} renderer - Renderer with drawRect and bufCtx
   * @param {number} x - Base X position
   * @param {number} y - Base Y position
   * @param {object} traits - Character trait descriptor
   * @param {number} frame - Walk frame 0-7 or idle frame 8-11
   * @param {string} facing - 'left' or 'right'
   */
  static draw(renderer, x, y, traits, frame = 0, facing = 'right') {
    const template = this.BODY_TEMPLATES[traits.bodyType] || this.BODY_TEMPLATES.average;
    const cellWidth = 24;
    const cellHeight = template.headRy * 2 + template.bodyH + template.legUpper + template.legLower + 4;

    if (facing === 'right') {
      const { canvas: flipBuf, ctx: flipCtx } = this._getFlipBuffer(cellWidth + 8, cellHeight + 16);

      const proxy = {
        drawRect(rx, ry, rw, rh, color) {
          flipCtx.fillStyle = color;
          flipCtx.fillRect(Math.floor(rx - x), Math.floor(ry - y), rw, rh);
        },
        bufCtx: flipCtx,
        _proxyOffX: x,
        _proxyOffY: y,
      };

      this._drawCharacter(proxy, x, y, traits, frame, template);

      renderer.bufCtx.save();
      renderer.bufCtx.translate(Math.floor(x) + cellWidth, Math.floor(y));
      renderer.bufCtx.scale(-1, 1);
      renderer.bufCtx.drawImage(flipBuf, 0, 0, cellWidth + 8, cellHeight + 16, 0, 0, cellWidth + 8, cellHeight + 16);
      renderer.bufCtx.restore();
    } else {
      this._drawCharacter(renderer, x, y, traits, frame, template);
    }
  }

  /**
   * Internal character drawing — always draws left-facing.
   */
  static _drawCharacter(renderer, x, y, traits, frame, template) {
    const skin = this.SKIN_TONES[traits.skinTone] || this.SKIN_TONES.fair;
    const hairColor = this.HAIR_COLORS[traits.hairColor] || this.HAIR_COLORS.brown;
    const clothColor = this._resolveColor(traits.clothingColor);
    const clothShadow = T.darken(clothColor, 35);
    const clothHighlight = T.lighten(clothColor, 25);
    const isFemale = traits.gender === 'female';

    // Idle animation support (frames 8-11 map to idle states)
    const isIdleAnim = frame >= 8;
    const idleSubFrame = isIdleAnim ? frame - 8 : -1;
    const walkFrame = isIdleAnim ? 0 : frame;
    const isMoving = walkFrame > 0;

    // 8-frame bob
    const bob = isMoving ? this.BOB[walkFrame] : (idleSubFrame === 0 ? -1 : 0);

    // Layout offsets
    const cx = Math.floor((24 - template.bodyW) / 2);
    const headCx = x + 12; // center of the 24px cell
    const headCy = y + template.headRy + bob;
    const torsoY = y + template.headRy * 2 + bob;
    const legY = torsoY + template.bodyH - 2;

    // Get walk data
    const legData = isMoving ? this.LEG_DATA[walkFrame] : this.LEG_DATA[0];
    const armData = isMoving ? this.ARM_SWING[walkFrame] : this.ARM_SWING[0];

    // --- 1. Back arm (behind body) ---
    this._drawArm(renderer, x + cx + template.bodyW - 1, torsoY + 1,
      template, armData.r, clothColor, clothShadow, skin, traits.clothing === 'robe');

    // --- 2. Legs ---
    const legColor = T.darken(clothColor, 40);
    const legShadow = T.darken(clothColor, 60);
    // Left leg
    const llx = x + cx + 2 + legData.lx;
    const lly = legY + legData.ly;
    renderer.drawRect(llx, lly, template.legW, template.legUpper + template.legLower, legColor);
    renderer.drawRect(llx + template.legW - 1, lly, 1, template.legUpper + template.legLower, legShadow);
    // Right leg
    const rlx = x + cx + template.bodyW - template.legW - 2 + legData.rx;
    const rly = legY + legData.ry;
    renderer.drawRect(rlx, rly, template.legW, template.legUpper + template.legLower, legColor);
    renderer.drawRect(rlx + template.legW - 1, rly, 1, template.legUpper + template.legLower, legShadow);

    // --- 3. Body (torso) — tapered polygon ---
    const torsoW = isFemale ? template.bodyW - 2 : template.bodyW;
    const torsoX = cx + (isFemale ? 1 : 0);
    // Draw torso polygon (wider at shoulders, narrower at hips)
    const shoulderOff = isFemale ? 1 : 0;
    const hipNarrow = isFemale ? 2 : 1;
    if (renderer.bufCtx) {
      const ctx = renderer.bufCtx;
      const ox = renderer._proxyOffX || 0;
      const oy = renderer._proxyOffY || 0;
      T.polygonFill(ctx, [
        [x + torsoX - shoulderOff - ox, torsoY - oy],
        [x + torsoX + torsoW + shoulderOff - ox, torsoY - oy],
        [x + torsoX + torsoW - hipNarrow - ox, torsoY + template.bodyH - 2 - oy],
        [x + torsoX + hipNarrow - ox, torsoY + template.bodyH - 2 - oy],
      ], clothColor);
      // Right-side shadow (1px)
      T.line(ctx,
        x + torsoX + torsoW + shoulderOff - ox, torsoY - oy,
        x + torsoX + torsoW - hipNarrow - ox, torsoY + template.bodyH - 2 - oy,
        clothShadow);
      // Bottom shadow
      T.line(ctx,
        x + torsoX + hipNarrow - ox, torsoY + template.bodyH - 2 - oy,
        x + torsoX + torsoW - hipNarrow - ox, torsoY + template.bodyH - 2 - oy,
        clothShadow);
      // Left highlight
      T.line(ctx,
        x + torsoX - shoulderOff - ox, torsoY - oy,
        x + torsoX + hipNarrow - ox, torsoY + template.bodyH - 2 - oy,
        clothHighlight);
    } else {
      // Fallback rect if no bufCtx
      renderer.drawRect(x + torsoX, torsoY, torsoW, template.bodyH - 2, clothColor);
    }

    // --- 4. Apply clothing pattern ---
    this._drawClothing(renderer, x + torsoX, torsoY, { ...template, bodyW: torsoW }, clothColor, clothShadow, traits.clothing);

    // --- 5. Front arm (in front of body) ---
    this._drawArm(renderer, x + cx, torsoY + 1,
      template, armData.l, clothColor, clothShadow, skin, traits.clothing === 'robe');

    // --- 6. Head (ellipse) ---
    if (renderer.bufCtx) {
      const ctx = renderer.bufCtx;
      const ox = renderer._proxyOffX || 0;
      const oy = renderer._proxyOffY || 0;
      // Base head
      T.ellipseFill(ctx, headCx - ox, headCy - oy, template.headRx, template.headRy, skin.base);
      // Highlight on left edge
      T.line(ctx, headCx - template.headRx + 1 - ox, headCy - 1 - oy,
                  headCx - template.headRx + 1 - ox, headCy + 2 - oy, skin.highlight);
      // Shadow on right edge
      T.line(ctx, headCx + template.headRx - 1 - ox, headCy - 1 - oy,
                  headCx + template.headRx - 1 - ox, headCy + 2 - oy, skin.shadow);
    } else {
      const headW = template.headRx * 2;
      const headH = template.headRy * 2;
      renderer.drawRect(headCx - template.headRx, headCy - template.headRy, headW, headH, skin.base);
    }

    // --- 7. Facial features ---
    const eyeY = headCy + Math.floor(template.headRy * 0.1);
    const eyeSpacing = Math.floor(template.headRx * 0.5);
    const eyeColor = '#222222';

    if (idleSubFrame === 1) {
      // Blink
      renderer.drawRect(headCx - eyeSpacing - 1, eyeY + 1, 2, 1, eyeColor);
      renderer.drawRect(headCx + eyeSpacing - 1, eyeY + 1, 2, 1, eyeColor);
    } else {
      // Open eyes
      renderer.drawRect(headCx - eyeSpacing - 1, eyeY, 2, 2, eyeColor);
      renderer.drawRect(headCx + eyeSpacing - 1, eyeY, 2, 2, eyeColor);
      // Eye highlights (1px white)
      renderer.drawRect(headCx - eyeSpacing - 1, eyeY, 1, 1, '#ffffff');
      renderer.drawRect(headCx + eyeSpacing - 1, eyeY, 1, 1, '#ffffff');
      // Eyebrows (hair color)
      renderer.drawRect(headCx - eyeSpacing - 1, eyeY - 2, 3, 1, hairColor.base);
      renderer.drawRect(headCx + eyeSpacing - 1, eyeY - 2, 3, 1, hairColor.base);
    }

    // Nose (1px)
    renderer.drawRect(headCx, eyeY + 3, 1, 1, skin.shadow);

    // Mouth (1-2px)
    renderer.drawRect(headCx - 1, eyeY + 5, 2, 1, T.darken(skin.base, 30));

    // Eyelashes (female)
    if (isFemale && idleSubFrame !== 1) {
      renderer.drawRect(headCx - eyeSpacing - 2, eyeY, 1, 1, eyeColor);
      renderer.drawRect(headCx + eyeSpacing + 1, eyeY, 1, 1, eyeColor);
    }

    // --- 8. Hair ---
    this._drawHair(renderer, headCx, headCy, template, hairColor, traits.hairStyle);

    // --- 9. Facial hair ---
    if (traits.facial && traits.facial !== 'none') {
      this._drawFacial(renderer, headCx, headCy, template, hairColor, traits.facial);
    }

    // --- 10. Accessories ---
    if (traits.accessory && traits.accessory !== 'none') {
      this._drawAccessory(renderer, headCx, headCy, template, traits.accessory);
    }

    // --- 11. Footwear ---
    if (traits.footwear && traits.footwear !== 'none') {
      this._drawFootwear(renderer, llx, lly, rlx, rly, template, traits.footwear);
    }
  }

  /**
   * Draw an arm (upper + forearm as 2px-wide line segments).
   */
  static _drawArm(renderer, shoulderX, shoulderY, template, swing, clothColor, clothShadow, skin, isRobed) {
    const armColor = isRobed ? clothColor : skin.base;
    const forearmColor = skin.base;
    const elbowX = shoulderX + swing;
    const elbowY = shoulderY + template.armLen;
    const handX = elbowX + Math.floor(swing * 0.5);
    const handY = elbowY + template.forearmLen;

    // Upper arm (clothing color — sleeved)
    renderer.drawRect(shoulderX, shoulderY, 2, template.armLen, clothColor);
    renderer.drawRect(shoulderX + 1, shoulderY, 1, template.armLen, clothShadow);

    // Forearm (skin or robe)
    renderer.drawRect(elbowX, elbowY, 2, template.forearmLen, isRobed ? clothColor : forearmColor);

    // Hand
    renderer.drawRect(handX, handY, 2, 2, skin.base);
  }

  /**
   * Draw footwear.
   */
  static _drawFootwear(renderer, llx, lly, rlx, rly, template, style) {
    const legH = template.legUpper + template.legLower;
    const shoeColor = '#3a2a1a';
    const shoeLight = '#4a3a2a';

    switch (style) {
      case 'boots':
        renderer.drawRect(llx - 1, lly + legH - 3, template.legW + 1, 4, shoeColor);
        renderer.drawRect(llx, lly + legH - 3, template.legW, 1, shoeLight);
        renderer.drawRect(rlx - 1, rly + legH - 3, template.legW + 1, 4, shoeColor);
        renderer.drawRect(rlx, rly + legH - 3, template.legW, 1, shoeLight);
        break;
      case 'shoes':
        renderer.drawRect(llx, lly + legH - 2, template.legW + 1, 2, shoeColor);
        renderer.drawRect(rlx, rly + legH - 2, template.legW + 1, 2, shoeColor);
        break;
      case 'sandals':
        renderer.drawRect(llx, lly + legH - 1, template.legW, 1, '#8B7355');
        renderer.drawRect(rlx, rly + legH - 1, template.legW, 1, '#8B7355');
        break;
      case 'sneakers': {
        // Like shoes but with colored sole line
        renderer.drawRect(llx, lly + legH - 2, template.legW + 1, 2, '#e8e8e8');
        renderer.drawRect(llx, lly + legH, template.legW + 1, 1, '#4a86c8'); // accent sole
        renderer.drawRect(rlx, rly + legH - 2, template.legW + 1, 2, '#e8e8e8');
        renderer.drawRect(rlx, rly + legH, template.legW + 1, 1, '#4a86c8');
        break;
      }
      case 'high_tops': {
        // Taller shoes extending 1px higher on ankle
        renderer.drawRect(llx, lly + legH - 3, template.legW + 1, 3, '#e8e8e8');
        renderer.drawRect(llx, lly + legH, template.legW + 1, 1, '#c84a4a'); // accent
        renderer.drawRect(rlx, rly + legH - 3, template.legW + 1, 3, '#e8e8e8');
        renderer.drawRect(rlx, rly + legH, template.legW + 1, 1, '#c84a4a');
        break;
      }
      case 'mag_boots': {
        // Wider boots with glowing sole accent
        renderer.drawRect(llx - 1, lly + legH - 3, template.legW + 2, 4, shoeColor);
        renderer.drawRect(llx - 1, lly + legH + 1, template.legW + 2, 1, '#44aaff'); // glow sole
        renderer.drawRect(rlx - 1, rly + legH - 3, template.legW + 2, 4, shoeColor);
        renderer.drawRect(rlx - 1, rly + legH + 1, template.legW + 2, 1, '#44aaff');
        break;
      }
      case 'armored_boots': {
        // Boots with metallic highlight plate
        renderer.drawRect(llx - 1, lly + legH - 3, template.legW + 1, 4, shoeColor);
        renderer.drawRect(llx, lly + legH - 3, template.legW - 1, 1, '#8a8a8a'); // metal plate
        renderer.drawRect(rlx - 1, rly + legH - 3, template.legW + 1, 4, shoeColor);
        renderer.drawRect(rlx, rly + legH - 3, template.legW - 1, 1, '#8a8a8a');
        break;
      }
    }
  }

  /**
   * Apply clothing pattern overlay.
   */
  static _drawClothing(renderer, bodyX, bodyY, template, baseColor, shadowColor, type) {
    switch (type) {
      case 'apron': {
        const apronColor = '#f0f0f0';
        const apronShadow = '#d0d0d0';
        const apronW = Math.floor(template.bodyW * 0.6);
        const apronX = bodyX + Math.floor((template.bodyW - apronW) / 2);
        renderer.drawRect(apronX, bodyY + 2, apronW, template.bodyH - 4, apronColor);
        renderer.drawRect(apronX + apronW - 1, bodyY + 2, 1, template.bodyH - 4, apronShadow);
        break;
      }
      case 'robe': {
        renderer.drawRect(bodyX - 1, bodyY, template.bodyW + 2, template.bodyH, baseColor);
        renderer.drawRect(bodyX + template.bodyW, bodyY, 1, template.bodyH, shadowColor);
        // Rope belt
        renderer.drawRect(bodyX, bodyY + Math.floor(template.bodyH * 0.5), template.bodyW, 2, '#8B7355');
        break;
      }
      case 'armor': {
        const metalColor = '#8a8a8a';
        const metalShadow = '#666666';
        renderer.drawRect(bodyX, bodyY, template.bodyW, 4, metalColor);
        renderer.drawRect(bodyX + 2, bodyY + 4, template.bodyW - 4, 2, metalColor);
        renderer.drawRect(bodyX + template.bodyW - 2, bodyY, 2, 6, metalShadow);
        break;
      }
      case 'vest': {
        const vestDark = T.darken(baseColor, 30);
        renderer.drawRect(bodyX + 2, bodyY, template.bodyW - 4, template.bodyH - 2, vestDark);
        break;
      }
      case 'jumpsuit': {
        // Single-color body with collar line and belt
        renderer.drawRect(bodyX, bodyY, template.bodyW, template.bodyH - 2, baseColor);
        renderer.drawRect(bodyX + 1, bodyY, template.bodyW - 2, 1, shadowColor); // collar
        renderer.drawRect(bodyX, bodyY + Math.floor(template.bodyH * 0.5), template.bodyW, 1, shadowColor); // belt
        break;
      }
      case 'uniform': {
        // Tunic-like with shoulder epaulettes and belt
        renderer.drawRect(bodyX, bodyY + Math.floor(template.bodyH * 0.6), template.bodyW, 2, shadowColor);
        renderer.drawRect(bodyX, bodyY, 2, 2, T.lighten(baseColor, 40)); // left epaulette
        renderer.drawRect(bodyX + template.bodyW - 2, bodyY, 2, 2, T.lighten(baseColor, 40)); // right epaulette
        renderer.drawRect(bodyX, bodyY + Math.floor(template.bodyH * 0.45), template.bodyW, 1, shadowColor); // belt
        break;
      }
      case 'labcoat': {
        const coatColor = '#e8e8e8';
        const coatShadow = '#cccccc';
        renderer.drawRect(bodyX - 1, bodyY, template.bodyW + 2, template.bodyH, coatColor);
        renderer.drawRect(bodyX + template.bodyW, bodyY, 1, template.bodyH, coatShadow);
        // Open front gap
        renderer.drawRect(bodyX + Math.floor(template.bodyW / 2), bodyY + 2, 1, template.bodyH - 4, baseColor);
        break;
      }
      case 'spacesuit': {
        // Wider silhouette with collar ring, belt, chest panel
        renderer.drawRect(bodyX - 1, bodyY, template.bodyW + 2, template.bodyH - 2, baseColor);
        renderer.drawRect(bodyX, bodyY, template.bodyW, 2, T.lighten(baseColor, 30)); // collar ring
        renderer.drawRect(bodyX, bodyY + Math.floor(template.bodyH * 0.5), template.bodyW, 1, shadowColor); // belt
        // Chest panel
        const panelW = Math.floor(template.bodyW * 0.4);
        const panelX = bodyX + Math.floor((template.bodyW - panelW) / 2);
        renderer.drawRect(panelX, bodyY + 3, panelW, 3, '#555577');
        break;
      }
      case 'jacket':
      case 'leather_jacket':
      case 'neon_jacket': {
        const innerColor = T.darken(baseColor, 25);
        renderer.drawRect(bodyX, bodyY, template.bodyW, template.bodyH - 2, baseColor);
        // Open front showing inner
        renderer.drawRect(bodyX + Math.floor(template.bodyW / 2) - 1, bodyY + 2, 2, template.bodyH - 4, innerColor);
        // Lapel lines
        renderer.drawRect(bodyX + Math.floor(template.bodyW / 2) - 2, bodyY, 1, 4, shadowColor);
        renderer.drawRect(bodyX + Math.floor(template.bodyW / 2) + 1, bodyY, 1, 4, shadowColor);
        if (type === 'neon_jacket') {
          const neonColor = T.lighten(baseColor, 60);
          renderer.drawRect(bodyX, bodyY, template.bodyW, 1, neonColor); // shoulder highlight
        }
        break;
      }
      case 'hoodie': {
        renderer.drawRect(bodyX, bodyY, template.bodyW, template.bodyH - 2, baseColor);
        // Rounded neckline
        renderer.drawRect(bodyX + Math.floor(template.bodyW / 2) - 2, bodyY, 4, 2, T.darken(baseColor, 15));
        break;
      }
      case 'tshirt':
      case 'band_tee': {
        renderer.drawRect(bodyX, bodyY, template.bodyW, Math.floor(template.bodyH * 0.6), baseColor);
        // Round neck
        renderer.drawRect(bodyX + Math.floor(template.bodyW / 2) - 2, bodyY, 4, 1, T.darken(baseColor, 20));
        if (type === 'band_tee') {
          // Horizontal stripe graphic on chest
          renderer.drawRect(bodyX + 2, bodyY + 3, template.bodyW - 4, 2, T.lighten(baseColor, 40));
        }
        break;
      }
      case 'tracksuit': {
        renderer.drawRect(bodyX, bodyY, template.bodyW, template.bodyH - 2, baseColor);
        // Vertical stripe down each side
        renderer.drawRect(bodyX + 1, bodyY, 1, template.bodyH - 2, T.lighten(baseColor, 35));
        renderer.drawRect(bodyX + template.bodyW - 2, bodyY, 1, template.bodyH - 2, T.lighten(baseColor, 35));
        break;
      }
      case 'suit': {
        renderer.drawRect(bodyX, bodyY, template.bodyW, template.bodyH - 2, baseColor);
        // Collar
        renderer.drawRect(bodyX + Math.floor(template.bodyW / 2) - 2, bodyY, 4, 1, '#e8e8e8');
        // Lapel lines
        renderer.drawRect(bodyX + Math.floor(template.bodyW / 2) - 2, bodyY + 1, 1, 4, shadowColor);
        renderer.drawRect(bodyX + Math.floor(template.bodyW / 2) + 1, bodyY + 1, 1, 4, shadowColor);
        // Buttons
        renderer.drawRect(bodyX + Math.floor(template.bodyW / 2), bodyY + 5, 1, 1, '#aaaaaa');
        renderer.drawRect(bodyX + Math.floor(template.bodyW / 2), bodyY + 7, 1, 1, '#aaaaaa');
        break;
      }
      case 'cloak': {
        // Drawn behind body, open front - wider like robe
        renderer.drawRect(bodyX - 1, bodyY - 1, template.bodyW + 2, template.bodyH + 1, baseColor);
        renderer.drawRect(bodyX + template.bodyW, bodyY - 1, 1, template.bodyH + 1, shadowColor);
        // Open front
        renderer.drawRect(bodyX + Math.floor(template.bodyW / 2) - 1, bodyY + 1, 2, template.bodyH - 3, T.lighten(baseColor, 20));
        break;
      }
      case 'dress':
      case 'merchant_garb': {
        // Longer than tunic, flared bottom
        renderer.drawRect(bodyX, bodyY, template.bodyW, template.bodyH - 2, baseColor);
        renderer.drawRect(bodyX - 1, bodyY + template.bodyH - 4, template.bodyW + 2, 3, baseColor); // flared bottom
        renderer.drawRect(bodyX + template.bodyW, bodyY + template.bodyH - 4, 1, 3, shadowColor);
        renderer.drawRect(bodyX, bodyY + Math.floor(template.bodyH * 0.4), template.bodyW, 1, shadowColor); // waist
        break;
      }
      case 'tunic':
      default:
        renderer.drawRect(bodyX, bodyY + Math.floor(template.bodyH * 0.6), template.bodyW, 2, shadowColor);
        break;
    }
  }

  /**
   * Draw hair based on style (using ellipse head center coords).
   */
  static _drawHair(renderer, headCx, headCy, template, hairColor, style) {
    const rx = template.headRx;
    const ry = template.headRy;

    switch (style) {
      case 'short':
        renderer.drawRect(headCx - rx, headCy - ry - 1, rx * 2, 4, hairColor.base);
        renderer.drawRect(headCx - rx, headCy - ry + 1, 2, 3, hairColor.base);
        renderer.drawRect(headCx + rx - 2, headCy - ry + 1, 2, 3, hairColor.base);
        // Highlight
        renderer.drawRect(headCx - rx + 2, headCy - ry - 1, 3, 1, hairColor.highlight);
        break;
      case 'long':
        renderer.drawRect(headCx - rx - 1, headCy - ry - 1, rx * 2 + 2, 4, hairColor.base);
        renderer.drawRect(headCx - rx - 2, headCy - ry + 1, 2, ry * 2 + 4, hairColor.base);
        renderer.drawRect(headCx + rx, headCy - ry + 1, 2, ry * 2 + 4, hairColor.base);
        renderer.drawRect(headCx - rx + 1, headCy - ry - 1, 3, 1, hairColor.highlight);
        break;
      case 'ponytail':
        renderer.drawRect(headCx - rx, headCy - ry - 1, rx * 2, 4, hairColor.base);
        renderer.drawRect(headCx + rx, headCy, 4, 8, hairColor.base);
        renderer.drawRect(headCx + rx + 1, headCy + 8, 2, 3, hairColor.base);
        renderer.drawRect(headCx - rx + 2, headCy - ry - 1, 3, 1, hairColor.highlight);
        break;
      case 'messy':
        renderer.drawRect(headCx - rx, headCy - ry - 2, rx * 2, 5, hairColor.base);
        renderer.drawRect(headCx - rx + 2, headCy - ry - 4, 3, 3, hairColor.highlight);
        renderer.drawRect(headCx + rx - 4, headCy - ry - 3, 3, 3, hairColor.highlight);
        renderer.drawRect(headCx, headCy - ry - 3, 2, 2, hairColor.base);
        break;
      case 'braided':
        renderer.drawRect(headCx - rx, headCy - ry - 1, rx * 2, 3, hairColor.base);
        // Braids going down
        renderer.drawRect(headCx - rx - 1, headCy, 2, ry * 2 + 6, hairColor.base);
        renderer.drawRect(headCx + rx - 1, headCy, 2, ry * 2 + 6, hairColor.base);
        // Braid ties
        renderer.drawRect(headCx - rx - 1, headCy + ry * 2 + 4, 2, 2, '#c84a4a');
        renderer.drawRect(headCx + rx - 1, headCy + ry * 2 + 4, 2, 2, '#c84a4a');
        break;
      case 'bald':
      default:
        // Slight scalp highlight
        renderer.drawRect(headCx - 2, headCy - ry, 4, 2, hairColor.highlight || '#d4a574');
        break;
    }
  }

  /**
   * Draw facial hair.
   */
  static _drawFacial(renderer, headCx, headCy, template, hairColor, type) {
    const chinY = headCy + template.headRy - 2;
    switch (type) {
      case 'beard':
        renderer.drawRect(headCx - 3, chinY, 6, 5, hairColor.base);
        renderer.drawRect(headCx - 2, chinY + 5, 4, 2, hairColor.base);
        break;
      case 'mustache':
        renderer.drawRect(headCx - 3, chinY - 1, 6, 2, hairColor.base);
        renderer.drawRect(headCx - 4, chinY, 2, 1, hairColor.base);
        renderer.drawRect(headCx + 2, chinY, 2, 1, hairColor.base);
        break;
      case 'goatee':
        renderer.drawRect(headCx - 2, chinY, 4, 4, hairColor.base);
        renderer.drawRect(headCx - 1, chinY + 4, 2, 2, hairColor.base);
        break;
    }
  }

  /**
   * Draw accessory.
   */
  static _drawAccessory(renderer, headCx, headCy, template, type) {
    const rx = template.headRx;
    const ry = template.headRy;

    switch (type) {
      case 'hood':
        renderer.drawRect(headCx - rx - 1, headCy - ry - 2, rx * 2 + 2, 4, '#888888');
        renderer.drawRect(headCx - rx - 2, headCy - ry, 2, Math.floor(ry * 1.2), '#888888');
        renderer.drawRect(headCx + rx, headCy - ry, 2, Math.floor(ry * 1.2), '#888888');
        break;
      case 'hat':
        renderer.drawRect(headCx - rx - 2, headCy - ry - 3, rx * 2 + 4, 3, '#5a3a2a');
        renderer.drawRect(headCx - rx, headCy - ry - 6, rx * 2, 4, '#5a3a2a');
        renderer.drawRect(headCx - rx + 1, headCy - ry - 6, 3, 1, '#7a5a4a'); // highlight
        break;
      case 'headband':
        renderer.drawRect(headCx - rx - 1, headCy - ry + 2, rx * 2 + 2, 2, '#c84a4a');
        break;
      case 'eyepatch':
        renderer.drawRect(headCx - Math.floor(rx * 0.5) - 1, headCy, 3, 3, '#222222');
        renderer.drawRect(headCx - rx, headCy + 1, rx * 2, 1, '#333333'); // strap
        break;
      case 'glasses':
        renderer.drawRect(headCx - Math.floor(rx * 0.5) - 2, headCy, 3, 3, '#4a4a8a');
        renderer.drawRect(headCx + Math.floor(rx * 0.5) - 1, headCy, 3, 3, '#4a4a8a');
        renderer.drawRect(headCx - 1, headCy + 1, 2, 1, '#4a4a8a'); // bridge
        break;
      case 'crown':
        renderer.drawRect(headCx - rx, headCy - ry - 3, rx * 2, 3, '#d4a040');
        renderer.drawRect(headCx - rx + 1, headCy - ry - 5, 2, 3, '#d4a040');
        renderer.drawRect(headCx + rx - 3, headCy - ry - 5, 2, 3, '#d4a040');
        renderer.drawRect(headCx - 1, headCy - ry - 6, 2, 3, '#d4a040');
        // Jewel
        renderer.drawRect(headCx, headCy - ry - 5, 1, 1, '#cc4444');
        break;
      case 'visor': {
        // Horizontal 3px band across eyes
        renderer.drawRect(headCx - rx, headCy + 1, rx * 2, 3, '#44aaff');
        renderer.drawRect(headCx - rx + 1, headCy + 1, rx * 2 - 2, 1, '#66ccff'); // highlight
        break;
      }
      case 'headset': {
        // Thin arc over head + earpiece dot
        renderer.drawRect(headCx - rx + 1, headCy - ry - 1, rx * 2 - 2, 1, '#555555');
        renderer.drawRect(headCx + rx - 1, headCy - 1, 2, 2, '#333333'); // earpiece
        break;
      }
      case 'goggles': {
        // 4px band across eyes with frame outlines
        renderer.drawRect(headCx - rx, headCy - 1, rx * 2, 4, '#8B4513');
        renderer.drawRect(headCx - rx + 1, headCy, rx - 2, 2, '#88ccee'); // left lens
        renderer.drawRect(headCx + 1, headCy, rx - 2, 2, '#88ccee'); // right lens
        break;
      }
      case 'helmet': {
        // Fills top of head area, rounded, larger than hat
        renderer.drawRect(headCx - rx - 1, headCy - ry - 2, rx * 2 + 2, ry + 2, '#777788');
        renderer.drawRect(headCx - rx, headCy - ry - 2, rx * 2, 1, '#9999aa'); // highlight
        break;
      }
      case 'sunglasses': {
        // Thin dark line across eyes
        renderer.drawRect(headCx - rx + 1, headCy + 1, rx * 2 - 2, 2, '#1a1a1a');
        break;
      }
      case 'headphones': {
        // Arc over head + ear squares
        renderer.drawRect(headCx - rx + 1, headCy - ry - 1, rx * 2 - 2, 1, '#333333');
        renderer.drawRect(headCx - rx - 1, headCy - 1, 2, 2, '#444444'); // left ear
        renderer.drawRect(headCx + rx - 1, headCy - 1, 2, 2, '#444444'); // right ear
        break;
      }
      case 'cap': {
        // Baseball cap: dome + forward brim
        renderer.drawRect(headCx - rx, headCy - ry - 2, rx * 2, 3, '#4a4a8a');
        renderer.drawRect(headCx - rx - 2, headCy - ry + 1, 4, 1, '#4a4a8a'); // brim
        break;
      }
      case 'scarf': {
        // 2-3px colored region around neck
        const scarfColor = '#cc4444';
        renderer.drawRect(headCx - rx + 1, headCy + ry - 1, rx * 2 - 2, 3, scarfColor);
        break;
      }
      case 'badge': {
        // 2x2 colored square on upper chest (below head)
        renderer.drawRect(headCx - 1, headCy + ry + 2, 2, 2, '#d4a040');
        break;
      }
      case 'bandana': {
        // Triangle over forehead
        renderer.drawRect(headCx - rx, headCy - ry, rx * 2, 2, '#cc4444');
        renderer.drawRect(headCx - rx + 1, headCy - ry - 1, rx * 2 - 2, 1, '#cc4444');
        break;
      }
      case 'sweatband': {
        // 1px colored line across forehead
        renderer.drawRect(headCx - rx + 1, headCy - ry + 2, rx * 2 - 2, 1, '#ff6b6b');
        break;
      }
      case 'walkman': {
        // Small 2x3 rect at waist + 1px line to ear
        renderer.drawRect(headCx + rx - 2, headCy + ry + 8, 2, 3, '#888888');
        renderer.drawRect(headCx + rx - 1, headCy + 1, 1, ry + 7, '#555555'); // wire
        break;
      }
      case 'circlet': {
        // Thin 1px band around head with gem dot
        renderer.drawRect(headCx - rx, headCy - ry + 1, rx * 2, 1, '#d4a040');
        renderer.drawRect(headCx, headCy - ry + 1, 1, 1, '#cc4444'); // gem
        break;
      }
    }
  }

  /**
   * Get total height of a character (for Z-sorting).
   */
  static getCharacterHeight(bodyType) {
    const t = this.BODY_TEMPLATES[bodyType] || this.BODY_TEMPLATES.average;
    return t.headRy * 2 + t.bodyH + t.legUpper + t.legLower + 4;
  }

  static _resolveColor(colorName) {
    if (!colorName) return '#4a86c8';
    if (colorName.startsWith('#')) return colorName;
    return this.CLOTHING_COLORS[colorName] || colorName;
  }

  static _darken(hex, amount) {
    return T.darken(hex, amount);
  }
}
