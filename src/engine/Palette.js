/**
 * Palette — EGA-style 16-color palette definitions per scene.
 * Each scene uses exactly 16 colors. Rich visuals come from dithering
 * between palette entries rather than adding more colors.
 */
export class Palette {

  // Shared character colors every scene palette must include
  static COMMON_CHARS = {
    skin_base: '#d4a574',
    skin_shadow: '#a0724a',
  };

  // Scene palette definitions — each exactly 16 colors
  static PALETTES = {

    tavern: {
      black:       '#000000',
      dark_brown:  '#3a1a00',
      brown:       '#5a3a15',
      tan:         '#8a6a3a',
      amber:       '#c89922',
      dark_red:    '#8b2500',
      red:         '#cc4411',
      orange:      '#dd7722',
      yellow:      '#ffcc44',
      dark_gray:   '#444444',
      gray:        '#777777',
      light_gray:  '#aaaaaa',
      dark_blue:   '#1a1a3a',
      white:       '#e8e0d0',
      skin_base:   '#d4a574',
      skin_shadow: '#a0724a',
    },

    village_square: {
      black:       '#000000',
      dark_brown:  '#3a2a15',
      brown:       '#6a4a2a',
      tan:         '#9a7a5a',
      dark_blue:   '#223366',
      blue:        '#4477aa',
      light_blue:  '#88aadd',
      white:       '#e8e8e8',
      dark_green:  '#1a4a1a',
      green:       '#3a7a3a',
      dark_gray:   '#555555',
      gray:        '#888888',
      red:         '#aa3333',
      yellow:      '#ccaa33',
      skin_base:   '#d4a574',
      skin_shadow: '#a0724a',
    },

    forest_path: {
      black:       '#000000',
      dark_green:  '#0f2a0f',
      green:       '#1a5a1a',
      light_green: '#3a8a3a',
      dark_brown:  '#2a1a0a',
      brown:       '#5a3a15',
      tan:         '#8a6a3a',
      dark_blue:   '#1a2a4a',
      blue:        '#4477aa',
      dark_gray:   '#444444',
      gray:        '#777777',
      red:         '#cc4444',
      yellow:      '#ddcc44',
      white:       '#ddddcc',
      skin_base:   '#d4a574',
      skin_shadow: '#a0724a',
    },

    temple: {
      black:        '#000000',
      deep_blue:    '#0a0a2a',
      dark_purple:  '#1a1040',
      purple:       '#2a1855',
      dark_stone:   '#2a2a3a',
      stone:        '#4a4a5a',
      light_stone:  '#6a6a7a',
      pale_stone:   '#8a8a9a',
      dark_gold:    '#7a5a10',
      gold:         '#c89922',
      bright_gold:  '#ffcc44',
      dark_teal:    '#0a3a3a',
      teal:         '#2a6a6a',
      vine_green:   '#2a5a2a',
      skin_base:    '#d4a574',
      skin_shadow:  '#a0724a',
    },
  };

  /**
   * Get the 16-color palette object for a scene.
   * @param {string} sceneId
   * @returns {object} Named color map
   */
  static get(sceneId) {
    return this.PALETTES[sceneId] || this.PALETTES.tavern;
  }

  /**
   * Get palette as a flat array of hex strings (for auditing).
   */
  static getArray(sceneId) {
    return Object.values(this.get(sceneId));
  }

  /**
   * Register a new named palette at runtime.
   * @param {string} id - Palette identifier
   * @param {object} colorMap - Named color map (16 entries)
   */
  static register(id, colorMap) {
    this.PALETTES[id] = colorMap;
  }

  /**
   * Return a new palette with specific colors overridden.
   * @param {object} palette - Base palette object
   * @param {object} overrides - Key/value pairs to replace
   * @returns {object} New palette with overrides applied
   */
  static applyOverrides(palette, overrides) {
    if (!overrides || !Object.keys(overrides).length) return palette;
    return { ...palette, ...overrides };
  }

  /**
   * Check if a palette exists.
   */
  static has(id) {
    return id in this.PALETTES;
  }

  /**
   * Snap any color to the nearest palette entry (Euclidean distance in RGB).
   */
  static closest(color, palette) {
    const [r, g, b] = _parseHex(color);
    const entries = Object.values(palette);
    let bestDist = Infinity, bestColor = entries[0];

    for (const entry of entries) {
      const [er, eg, eb] = _parseHex(entry);
      const dist = (r - er) ** 2 + (g - eg) ** 2 + (b - eb) ** 2;
      if (dist < bestDist) {
        bestDist = dist;
        bestColor = entry;
      }
    }
    return bestColor;
  }
}

function _parseHex(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  return [
    parseInt(hex.slice(0, 2), 16) || 0,
    parseInt(hex.slice(2, 4), 16) || 0,
    parseInt(hex.slice(4, 6), 16) || 0,
  ];
}
