/**
 * _base.js — Shared drawing helper functions for room templates.
 *
 * All helpers use PixelArtToolkit (T) primitives exclusively.
 * No raw canvas API calls. Each function accepts (ctx, P, ...params)
 * where P is a palette object with named color entries.
 *
 * 5-Layer rendering contract:
 *   Layer 1 (BASE):       Sky, ground, walls — rect, dither
 *   Layer 2 (STRUCTURES): Buildings, furniture — rect, polygon
 *   Layer 3 (DETAILS):    Decorative objects — rect, pixel, ellipse, line
 *   Layer 4 (SHADING):    Shadows — scatter, scatterCircle ONLY
 *   Layer 5 (ATMOSPHERE): Ambient effects — scatter, scatterCircle, pixel ONLY
 */

import { PixelArtToolkit as T } from '../engine/PixelArtToolkit.js';

// ---------------------------------------------------------------------------
//  WALL GENERATORS (Layers 1-2)
// ---------------------------------------------------------------------------

/**
 * Draw a stone wall with brick pattern and mortar grid.
 * Layer 1-2: Uses rect for base fill and mortar lines.
 *
 * @param {object} opts
 * @param {string} opts.wallColor   - Override for P.gray
 * @param {string} opts.mortarColor - Override for P.dark_gray
 * @param {number} opts.brickW      - Brick width in pixels (default 22)
 * @param {number} opts.brickH      - Brick height in pixels (default 8)
 */
export function drawStoneWall(ctx, P, x, y, w, h, opts = {}) {
  const wallColor   = opts.wallColor   || P.gray      || '#777777';
  const mortarColor = opts.mortarColor || P.dark_gray  || '#444444';
  const brickW      = opts.brickW      || 22;
  const brickH      = opts.brickH      || 8;

  // Base fill
  T.rect(ctx, x, y, w, h, wallColor);

  // Horizontal mortar lines
  for (let row = y; row < y + h; row += brickH) {
    T.rect(ctx, x, row, w, 1, mortarColor);
  }

  // Vertical mortar lines — offset every other row for brick stagger
  const rows = Math.ceil(h / brickH);
  for (let r = 0; r < rows; r++) {
    const ry = y + r * brickH;
    const offset = (r % 2 === 0) ? 0 : Math.floor(brickW / 2);
    for (let col = x + offset; col < x + w; col += brickW) {
      T.rect(ctx, col, ry, 1, Math.min(brickH, y + h - ry), mortarColor);
    }
  }
}

/**
 * Draw a wood-plank wall with grain lines.
 * Layer 1-2: Uses rect for planks and line for wood grain detail.
 *
 * @param {object} opts
 * @param {string} opts.baseColor      - Override for P.brown
 * @param {string} opts.grainColor     - Override for P.dark_brown
 * @param {string} opts.highlightColor - Override for P.tan
 * @param {number} opts.plankH         - Plank height in pixels (default 7)
 */
export function drawWoodWall(ctx, P, x, y, w, h, opts = {}) {
  const baseColor      = opts.baseColor      || P.brown      || '#5a3a15';
  const grainColor     = opts.grainColor     || P.dark_brown || '#3a1a00';
  const highlightColor = opts.highlightColor || P.tan        || '#8a6a3a';
  const plankH         = opts.plankH         || 7;

  // Base fill
  T.rect(ctx, x, y, w, h, baseColor);

  // Plank separator lines and grain
  const rows = Math.ceil(h / plankH);
  for (let r = 0; r < rows; r++) {
    const py = y + r * plankH;

    // Dark separator line at the bottom of each plank
    T.rect(ctx, x, py + plankH - 1, w, 1, grainColor);

    // Highlight line at the top of each plank
    T.rect(ctx, x, py, w, 1, highlightColor);

    // Horizontal grain lines within the plank (pseudo-random spacing)
    const grainY = py + 2 + (r * 3) % (plankH - 3);
    if (grainY < py + plankH - 1) {
      T.line(ctx, x + (r * 7) % 12, grainY, x + w - (r * 5) % 10, grainY, grainColor);
    }
  }
}

// ---------------------------------------------------------------------------
//  FLOOR GENERATORS (Layer 1)
// ---------------------------------------------------------------------------

/**
 * Draw a full-width wood floor with horizontal planks.
 * Layer 1: Uses rect for planks, line for grain detail.
 *
 * @param {number} y - Top Y position of the floor area
 * @param {number} h - Height of the floor area
 * @param {object} opts
 * @param {string} opts.baseColor      - Override for P.brown
 * @param {string} opts.grainColor     - Override for P.dark_brown
 * @param {string} opts.highlightColor - Override for P.tan
 * @param {number} opts.plankH         - Plank height in pixels (default 7)
 */
export function drawWoodFloor(ctx, P, y, h, opts = {}) {
  const baseColor      = opts.baseColor      || P.brown      || '#5a3a15';
  const grainColor     = opts.grainColor     || P.dark_brown || '#3a1a00';
  const highlightColor = opts.highlightColor || P.tan        || '#8a6a3a';
  const plankH         = opts.plankH         || 7;

  // Full-width base fill (320 px internal resolution)
  T.rect(ctx, 0, y, 320, h, baseColor);

  // Planks with grain
  const rows = Math.ceil(h / plankH);
  for (let r = 0; r < rows; r++) {
    const py = y + r * plankH;

    // Highlight at top edge of plank
    T.rect(ctx, 0, py, 320, 1, highlightColor);

    // Dark line at bottom edge
    if (r < rows - 1) {
      T.rect(ctx, 0, py + plankH - 1, 320, 1, grainColor);
    }

    // Grain detail — two short lines per plank at varying positions
    const g1y = py + 2 + (r * 3) % Math.max(1, plankH - 4);
    const g2y = py + 3 + (r * 5) % Math.max(1, plankH - 4);
    if (g1y < py + plankH - 1) {
      T.line(ctx, (r * 17) % 40, g1y, 320 - (r * 11) % 30, g1y, grainColor);
    }
    if (g2y < py + plankH - 1 && g2y !== g1y) {
      T.line(ctx, (r * 13) % 50, g2y, 320 - (r * 7) % 35, g2y, grainColor);
    }
  }
}

/**
 * Draw a full-width cobblestone ground.
 * Layer 1: Uses rect for base, dither for stone texture, pixel for highlights.
 *
 * @param {number} y - Top Y position
 * @param {number} h - Height of the ground area
 * @param {object} opts
 * @param {string} opts.baseColor      - Background mortar color
 * @param {string} opts.stoneColor1    - Primary stone color
 * @param {string} opts.stoneColor2    - Secondary stone color (variation)
 * @param {string} opts.highlightColor - Specular highlight color
 * @param {string} opts.shadowColor    - Gap/shadow color
 */
export function drawCobblestone(ctx, P, y, h, opts = {}) {
  const baseColor      = opts.baseColor      || P.gray       || '#777777';
  const stoneColor1    = opts.stoneColor1    || P.dark_gray  || '#555555';
  const stoneColor2    = opts.stoneColor2    || P.brown      || '#6a4a2a';
  const highlightColor = opts.highlightColor || P.light_gray || P.white || '#aaaaaa';
  const shadowColor    = opts.shadowColor    || P.black      || '#000000';

  // Base mortar fill
  T.rect(ctx, 0, y, 320, h, shadowColor);

  // Cobblestone grid — irregular-looking stones
  const stoneW = 14;
  const stoneH = 8;
  const cols = Math.ceil(320 / stoneW) + 1;
  const rows = Math.ceil(h / stoneH) + 1;

  for (let r = 0; r < rows; r++) {
    const rowOffset = (r % 2 === 0) ? 0 : Math.floor(stoneW / 2);
    for (let c = 0; c < cols; c++) {
      const sx = c * stoneW + rowOffset - 2;
      const sy = y + r * stoneH;
      // Alternate stone colors for visual variety
      const color = ((r + c) % 3 === 0) ? stoneColor2 : stoneColor1;

      // Stone body (inset by 1px for mortar gap)
      T.rect(ctx, sx + 1, sy + 1, stoneW - 2, stoneH - 2, color);

      // Dither a slight texture on each stone
      T.dither(ctx, sx + 1, sy + 1, stoneW - 2, stoneH - 2, color, baseColor, 0.2, 4);

      // Highlight pixel at top-left of each stone
      T.pixel(ctx, sx + 2, sy + 1, highlightColor);
    }
  }
}

/**
 * Draw a full-width dirt/earth ground with scattered patches and pebbles.
 * Layer 1: Uses rect for base, dither for texture, pixel for pebbles.
 *
 * @param {number} y - Top Y position
 * @param {number} h - Height of the ground area
 * @param {object} opts
 * @param {string} opts.baseColor    - Primary dirt color
 * @param {string} opts.darkColor    - Darker dirt variation
 * @param {string} opts.lightColor   - Lighter dirt highlight
 * @param {string} opts.pebbleColor  - Color for scattered pebble pixels
 */
export function drawDirtGround(ctx, P, y, h, opts = {}) {
  const baseColor   = opts.baseColor   || P.brown      || '#6a4a2a';
  const darkColor   = opts.darkColor   || P.dark_brown || '#3a2a15';
  const lightColor  = opts.lightColor  || P.tan        || '#9a7a5a';
  const pebbleColor = opts.pebbleColor || P.gray       || '#888888';

  // Base fill
  T.rect(ctx, 0, y, 320, h, baseColor);

  // Dither patches for natural variation (3-4 patches across the width)
  for (let i = 0; i < 5; i++) {
    const px = (i * 73) % 300;
    const pw = 30 + (i * 19) % 40;
    const py = y + (i * 7) % Math.max(1, h - 6);
    const ph = Math.min(6 + (i * 3) % 5, h);
    T.dither(ctx, px, py, pw, ph, baseColor, darkColor, 0.4, 4);
  }

  // Light patches
  for (let i = 0; i < 3; i++) {
    const px = 20 + (i * 97) % 260;
    const pw = 20 + (i * 13) % 30;
    const py = y + (i * 11) % Math.max(1, h - 4);
    const ph = Math.min(4 + (i * 2) % 4, h);
    T.dither(ctx, px, py, pw, ph, baseColor, lightColor, 0.3, 4);
  }

  // Scattered pebbles
  for (let i = 0; i < 12; i++) {
    const px = (i * 29 + 7) % 318;
    const py = y + 1 + (i * 13 + 3) % Math.max(1, h - 2);
    T.pixel(ctx, px, py, pebbleColor);
  }
}

// ---------------------------------------------------------------------------
//  SKY (Layer 1)
// ---------------------------------------------------------------------------

/**
 * Draw layered sky color bands with subtle scatter transitions between them.
 * Layer 1 (base) + Layer 5 (scatter transitions).
 *
 * @param {Array<{y: number, h: number, color: string}>} bands
 *   Ordered list of horizontal color bands from top to bottom.
 */
export function drawSkyBands(ctx, P, bands) {
  // Layer 1: Fill each band as a solid rect
  for (const band of bands) {
    T.rect(ctx, 0, band.y, 320, band.h, band.color);
  }

  // Subtle scatter transitions between adjacent bands
  for (let i = 0; i < bands.length - 1; i++) {
    const upper = bands[i];
    const lower = bands[i + 1];
    const transitionY = upper.y + upper.h;
    const transitionH = Math.min(3, lower.h);

    // Blend the upper color into the top of the lower band
    T.scatter(ctx, 0, transitionY, 320, transitionH, upper.color, 0.25);
  }
}

// ---------------------------------------------------------------------------
//  ARCHITECTURAL ELEMENTS (Layers 2-3)
// ---------------------------------------------------------------------------

/**
 * Draw a window with frame, glass pane, and glint pixel.
 * Layer 2-3: Uses rect for frame and glass, pixel for glint.
 *
 * @param {object} opts
 * @param {string} opts.frameColor - Override for P.dark_brown
 * @param {string} opts.glassColor - Override for P.dark_blue
 * @param {string} opts.glintColor - Override for P.white
 */
export function drawWindow(ctx, P, x, y, w, h, opts = {}) {
  const frameColor = opts.frameColor || P.dark_brown || '#3a1a00';
  const glassColor = opts.glassColor || P.dark_blue  || '#1a1a3a';
  const glintColor = opts.glintColor || P.white      || '#e8e8e8';

  // Outer frame
  T.rect(ctx, x, y, w, h, frameColor);

  // Glass pane (inset 2px)
  T.rect(ctx, x + 2, y + 2, w - 4, h - 4, glassColor);

  // Cross-bar (horizontal + vertical dividers)
  const midX = x + Math.floor(w / 2);
  const midY = y + Math.floor(h / 2);
  T.rect(ctx, x + 1, midY, w - 2, 1, frameColor);
  T.rect(ctx, midX, y + 1, 1, h - 2, frameColor);

  // Glint pixel — top-left pane
  T.pixel(ctx, x + 3, y + 3, glintColor);
}

/**
 * Draw a door with frame, panel detail, and handle.
 * Layer 2-3: Uses rect for frame/panels, pixel for handle.
 *
 * @param {object} opts
 * @param {string} opts.frameColor  - Override for P.dark_brown
 * @param {string} opts.panelColor  - Override for P.brown
 * @param {string} opts.handleColor - Override for P.yellow or P.amber
 * @param {string} opts.side        - Which side the handle is on: 'left' or 'right' (default 'right')
 */
export function drawDoor(ctx, P, x, y, w, h, opts = {}) {
  const frameColor  = opts.frameColor  || P.dark_brown || '#3a1a00';
  const panelColor  = opts.panelColor  || P.brown      || '#5a3a15';
  const handleColor = opts.handleColor || P.yellow     || P.amber || '#c89922';
  const side        = opts.side        || 'right';

  // Frame
  T.rect(ctx, x, y, w, h, frameColor);

  // Door panel (inset 2px)
  T.rect(ctx, x + 2, y + 2, w - 4, h - 4, panelColor);

  // Upper and lower panel grooves (decorative inset rectangles)
  const panelW = w - 8;
  const panelH = Math.floor((h - 10) / 2) - 1;
  if (panelW > 2 && panelH > 2) {
    T.rect(ctx, x + 4, y + 4, panelW, panelH, frameColor);
    T.rect(ctx, x + 5, y + 5, panelW - 2, panelH - 2, panelColor);

    const lowerPanelY = y + 4 + panelH + 2;
    T.rect(ctx, x + 4, lowerPanelY, panelW, panelH, frameColor);
    T.rect(ctx, x + 5, lowerPanelY + 1, panelW - 2, panelH - 2, panelColor);
  }

  // Handle — small dot on the appropriate side
  const handleX = (side === 'left') ? x + 4 : x + w - 5;
  const handleY = y + Math.floor(h / 2);
  T.pixel(ctx, handleX, handleY, handleColor);
  T.pixel(ctx, handleX, handleY + 1, handleColor);
}

/**
 * Draw a triangular roof via polygonFill.
 * Layer 2: Uses polygonFill for the roof body, optionally line for highlight edge.
 *
 * @param {number} x1    - Left base X
 * @param {number} y1    - Left base Y
 * @param {number} peakX - Peak X
 * @param {number} peakY - Peak Y
 * @param {number} x2    - Right base X
 * @param {number} y2    - Right base Y
 * @param {object} opts
 * @param {string} opts.color         - Override for P.dark_red or P.red
 * @param {boolean} opts.highlightEdge - Whether to draw a highlight line along the left slope (default true)
 */
export function drawRoof(ctx, P, x1, y1, peakX, peakY, x2, y2, opts = {}) {
  const color         = opts.color         || P.dark_red || P.red || '#8b2500';
  const highlightEdge = opts.highlightEdge !== undefined ? opts.highlightEdge : true;

  // Roof body
  T.polygonFill(ctx, [[x1, y1], [peakX, peakY], [x2, y2]], color);

  // Highlight along the left slope for a lit-edge effect
  if (highlightEdge) {
    const highlight = T.lighten(color, 30);
    T.line(ctx, x1, y1, peakX, peakY, highlight);
  }
}

// ---------------------------------------------------------------------------
//  ATMOSPHERE (Layer 5)
// ---------------------------------------------------------------------------

/**
 * Apply a warm amber overlay across the full scene.
 * Layer 5: Uses scatter only.
 *
 * @param {number} intensity - Alpha for the overlay (default 0.03)
 */
export function applyWarmWash(ctx, P, intensity = 0.03) {
  const color = P.amber || '#c89922';
  T.scatter(ctx, 0, 0, 320, 140, color, intensity);
}

/**
 * Apply a cool blue overlay across the full scene.
 * Layer 5: Uses scatter only.
 *
 * @param {number} intensity - Alpha for the overlay (default 0.03)
 */
export function applyCoolWash(ctx, P, intensity = 0.03) {
  const color = P.dark_blue || P.blue || '#223366';
  T.scatter(ctx, 0, 0, 320, 140, color, intensity);
}

/**
 * Apply a neon pink/purple overlay across the full scene.
 * Layer 5: Uses scatter only. Intended for 80s/synthwave settings.
 *
 * @param {number} intensity - Alpha for the overlay (default 0.03)
 */
export function applyNeonGlow(ctx, P, intensity = 0.03) {
  const color = P.neon_pink || P.dark_purple || '#cc44cc';
  T.scatter(ctx, 0, 0, 320, 140, color, intensity);
}
