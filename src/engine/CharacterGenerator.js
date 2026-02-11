/**
 * CharacterGenerator — Trait-based procedural pixel-art character assembly.
 * Produces deterministic character sprites from high-level trait descriptions.
 *
 * Works like a paper-doll system:
 *  1. Select body template based on bodyType/gender
 *  2. Apply skin tone palette
 *  3. Draw hair style + color
 *  4. Draw clothing type + color
 *  5. Overlay accessories
 *  6. Optional: add facial features (NPC-only, e.g. beard/mustache)
 */
export class CharacterGenerator {
  // --- Skin tone palettes ---
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

  // --- Body templates (width, height, proportions) ---
  static BODY_TEMPLATES = {
    slim:    { bodyW: 12, bodyH: 16, headW: 10, headH: 10, shoulderW: 12 },
    average: { bodyW: 14, bodyH: 16, headW: 10, headH: 10, shoulderW: 14 },
    stocky:  { bodyW: 16, bodyH: 18, headW: 12, headH: 12, shoulderW: 16 },
    tall:    { bodyW: 14, bodyH: 20, headW: 10, headH: 10, shoulderW: 14 },
  };

  /**
   * Generate a character sprite and draw it directly.
   * @param {CanvasRenderingContext2D|object} renderer - Renderer with drawRect method
   * @param {number} x - Base X position
   * @param {number} y - Base Y position
   * @param {object} traits - Character trait descriptor
   */
  static draw(renderer, x, y, traits) {
    const template = this.BODY_TEMPLATES[traits.bodyType] || this.BODY_TEMPLATES.average;
    const skin = this.SKIN_TONES[traits.skinTone] || this.SKIN_TONES.fair;
    const hairColor = this.HAIR_COLORS[traits.hairColor] || this.HAIR_COLORS.brown;
    const clothColor = this._resolveColor(traits.clothingColor);

    // Calculate centering offset
    const cx = Math.floor((20 - template.bodyW) / 2); // center within a 20px wide cell

    // --- 1. Body (torso) ---
    renderer.drawRect(x + cx, y + template.headH, template.bodyW, template.bodyH, clothColor);

    // --- 2. Apply clothing pattern ---
    this._drawClothing(renderer, x + cx, y + template.headH, template, clothColor, traits.clothing);

    // --- 3. Head ---
    const headX = x + Math.floor((20 - template.headW) / 2);
    const headY = y;
    renderer.drawRect(headX, headY, template.headW, template.headH, skin.base);

    // --- 4. Eyes ---
    const eyeY = headY + Math.floor(template.headH * 0.4);
    const eyeSpacing = Math.floor(template.headW * 0.3);
    renderer.drawRect(headX + eyeSpacing - 1, eyeY, 2, 2, '#222');
    renderer.drawRect(headX + template.headW - eyeSpacing - 1, eyeY, 2, 2, '#222');

    // --- 5. Hair ---
    this._drawHair(renderer, headX, headY, template, hairColor, traits.hairStyle);

    // --- 6. Facial features (NPC only) ---
    if (traits.facial && traits.facial !== 'none') {
      this._drawFacial(renderer, headX, headY, template, hairColor, traits.facial);
    }

    // --- 7. Accessories ---
    if (traits.accessory && traits.accessory !== 'none') {
      this._drawAccessory(renderer, headX, headY, template, traits.accessory);
    }
  }

  /**
   * Apply clothing pattern overlay.
   */
  static _drawClothing(renderer, bodyX, bodyY, template, baseColor, type) {
    switch (type) {
      case 'apron': {
        // Draw apron over body
        const apronColor = '#f0f0f0';
        const apronW = Math.floor(template.bodyW * 0.6);
        const apronX = bodyX + Math.floor((template.bodyW - apronW) / 2);
        renderer.drawRect(apronX, bodyY + 2, apronW, template.bodyH - 4, apronColor);
        break;
      }
      case 'robe': {
        // Robe extends slightly wider and longer
        renderer.drawRect(bodyX - 1, bodyY, template.bodyW + 2, template.bodyH + 2, baseColor);
        // Rope belt
        renderer.drawRect(bodyX, bodyY + Math.floor(template.bodyH * 0.5), template.bodyW, 2, '#8B7355');
        break;
      }
      case 'armor': {
        // Metallic overlay on shoulders
        const metalColor = '#8a8a8a';
        renderer.drawRect(bodyX, bodyY, template.bodyW, 4, metalColor);
        renderer.drawRect(bodyX + 2, bodyY + 4, template.bodyW - 4, 2, metalColor);
        break;
      }
      case 'vest': {
        // Vest is body-only, slightly darker
        const vestDark = this._darken(baseColor, 30);
        renderer.drawRect(bodyX + 2, bodyY, template.bodyW - 4, template.bodyH - 2, vestDark);
        break;
      }
      case 'tunic':
      default:
        // Tunic is the default — just the base color (already drawn as body)
        // Add a darker belt
        renderer.drawRect(bodyX, bodyY + Math.floor(template.bodyH * 0.6), template.bodyW, 2, this._darken(baseColor, 40));
        break;
    }
  }

  /**
   * Draw hair based on style.
   */
  static _drawHair(renderer, headX, headY, template, hairColor, style) {
    switch (style) {
      case 'short':
        // Hair on top
        renderer.drawRect(headX, headY - 2, template.headW, 4, hairColor.base);
        renderer.drawRect(headX, headY, 2, 4, hairColor.base); // sideburn left
        renderer.drawRect(headX + template.headW - 2, headY, 2, 4, hairColor.base); // sideburn right
        break;
      case 'long':
        // Hair on top and down sides
        renderer.drawRect(headX - 1, headY - 2, template.headW + 2, 4, hairColor.base);
        renderer.drawRect(headX - 2, headY, 2, template.headH + 4, hairColor.base);
        renderer.drawRect(headX + template.headW, headY, 2, template.headH + 4, hairColor.base);
        break;
      case 'ponytail':
        // Hair on top + tail to side
        renderer.drawRect(headX, headY - 2, template.headW, 4, hairColor.base);
        renderer.drawRect(headX + template.headW, headY + 2, 4, 8, hairColor.base);
        break;
      case 'messy':
        // Spiky uneven hair
        renderer.drawRect(headX, headY - 3, template.headW, 4, hairColor.base);
        renderer.drawRect(headX + 2, headY - 5, 3, 3, hairColor.highlight);
        renderer.drawRect(headX + template.headW - 4, headY - 4, 3, 3, hairColor.highlight);
        break;
      case 'braided':
        // Hair top + braids
        renderer.drawRect(headX, headY - 2, template.headW, 3, hairColor.base);
        renderer.drawRect(headX - 1, headY + 2, 2, template.headH + 6, hairColor.base);
        renderer.drawRect(headX + template.headW - 1, headY + 2, 2, template.headH + 6, hairColor.base);
        break;
      case 'bald':
      default:
        // No hair drawn, just a slight highlight on head
        renderer.drawRect(headX + 2, headY, template.headW - 4, 2, hairColor.highlight || '#d4a574');
        break;
    }
  }

  /**
   * Draw facial hair (NPC extension).
   */
  static _drawFacial(renderer, headX, headY, template, hairColor, type) {
    const chinY = headY + template.headH - 3;
    switch (type) {
      case 'beard':
        renderer.drawRect(headX + 2, chinY, template.headW - 4, 5, hairColor.base);
        break;
      case 'mustache':
        renderer.drawRect(headX + 2, chinY - 1, template.headW - 4, 3, hairColor.base);
        break;
      case 'goatee':
        renderer.drawRect(headX + Math.floor(template.headW / 2) - 2, chinY, 4, 4, hairColor.base);
        break;
    }
  }

  /**
   * Draw accessory.
   */
  static _drawAccessory(renderer, headX, headY, template, type) {
    switch (type) {
      case 'hood':
        renderer.drawRect(headX - 1, headY - 3, template.headW + 2, 5, '#888');
        renderer.drawRect(headX - 2, headY - 1, 2, template.headH * 0.6, '#888');
        renderer.drawRect(headX + template.headW, headY - 1, 2, template.headH * 0.6, '#888');
        break;
      case 'hat':
        renderer.drawRect(headX - 2, headY - 5, template.headW + 4, 3, '#5a3a2a');
        renderer.drawRect(headX, headY - 7, template.headW, 3, '#5a3a2a');
        break;
      case 'headband':
        renderer.drawRect(headX - 1, headY + 1, template.headW + 2, 2, '#c84a4a');
        break;
      case 'eyepatch':
        renderer.drawRect(headX + 2, headY + Math.floor(template.headH * 0.3), 4, 3, '#222');
        break;
      case 'glasses':
        renderer.drawRect(headX + 1, headY + Math.floor(template.headH * 0.3), 3, 3, '#4a4a8a');
        renderer.drawRect(headX + template.headW - 4, headY + Math.floor(template.headH * 0.3), 3, 3, '#4a4a8a');
        break;
      case 'crown':
        renderer.drawRect(headX, headY - 4, template.headW, 3, '#d4a040');
        renderer.drawRect(headX + 1, headY - 6, 2, 3, '#d4a040');
        renderer.drawRect(headX + template.headW - 3, headY - 6, 2, 3, '#d4a040');
        renderer.drawRect(headX + Math.floor(template.headW / 2) - 1, headY - 7, 2, 3, '#d4a040');
        break;
    }
  }

  /**
   * Resolve a clothing color — supports named colors or hex strings.
   */
  static _resolveColor(colorName) {
    if (!colorName) return '#4a86c8';
    if (colorName.startsWith('#')) return colorName;
    return this.CLOTHING_COLORS[colorName] || colorName;
  }

  /**
   * Darken a hex color by a given amount.
   */
  static _darken(hex, amount) {
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
