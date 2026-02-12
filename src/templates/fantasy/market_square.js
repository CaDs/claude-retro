/**
 * market_square.js — Medieval Market Square room template.
 *
 * Outdoor bustling market scene: cobblestone ground, market stalls with awnings,
 * crates and barrels, a fountain or well in the center, buildings in background.
 * Uses PixelArtToolkit primitives exclusively. 5-layer rendering contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';
import { drawCobblestone, drawSkyBands, drawStoneWall, drawWindow, drawDoor } from '../_base.js';

export const metadata = {
  id: 'fantasy/market_square',
  name: 'Market Square',
  setting: 'fantasy',
  category: 'exterior',
  palette: 'village_day',
  params: {
    hasWell:       { type: 'boolean', default: true,  label: 'Central well or fountain' },
    stallCount:    { type: 'number',  default: 3,     label: 'Number of market stalls (2-4)', min: 2, max: 4 },
    timeOfDay:     { type: 'string',  default: 'day', label: 'Time of day', options: ['morning', 'day', 'afternoon'] },
    crowdLevel:    { type: 'string',  default: 'medium', label: 'Market activity', options: ['sparse', 'medium', 'busy'] },
  },
};

export function generate(ctx, P, params = {}) {
  const p = { ...Object.fromEntries(Object.entries(metadata.params).map(([k, v]) => [k, v.default])), ...params };
  _base(ctx, P, p);
  _structures(ctx, P, p);
  _details(ctx, P, p);
  _shading(ctx, P, p);
  _atmosphere(ctx, P, p);
}

// =========================================================================
//  Layer 1 — BASE: Sky, background buildings, ground
// =========================================================================

function _base(ctx, P, params) {
  // --- Sky bands (varies by time of day) ---
  let skyBands;
  if (params.timeOfDay === 'morning') {
    skyBands = [
      { y: 0,  h: 15, color: P.light_blue },
      { y: 15, h: 15, color: P.blue },
      { y: 30, h: 15, color: P.dark_blue },
    ];
  } else if (params.timeOfDay === 'afternoon') {
    skyBands = [
      { y: 0,  h: 15, color: P.yellow },
      { y: 15, h: 15, color: P.light_blue },
      { y: 30, h: 15, color: P.blue },
    ];
  } else {
    // day
    skyBands = [
      { y: 0,  h: 20, color: P.light_blue },
      { y: 20, h: 25, color: P.blue },
    ];
  }
  drawSkyBands(ctx, P, skyBands);

  // --- Background buildings row ---
  // Building 1 (left) — stone
  T.rect(ctx, 5, 30, 65, 35, P.gray);
  drawStoneWall(ctx, P, 5, 30, 65, 35, {
    wallColor: P.gray,
    mortarColor: P.dark_gray,
    brickW: 20,
    brickH: 7,
  });
  // Roof — red pitched
  T.polygonFill(ctx, [[3, 30], [37, 18], [72, 30]], P.red);
  T.line(ctx, 3, 30, 37, 18, P.yellow); // highlight left slope

  // Windows on left building
  drawWindow(ctx, P, 18, 38, 12, 10, { glassColor: P.dark_blue, frameColor: P.dark_brown });
  drawWindow(ctx, P, 45, 38, 12, 10, { glassColor: P.dark_blue, frameColor: P.dark_brown });

  // Building 2 (center-left) — taller, wood
  T.rect(ctx, 75, 25, 50, 40, P.brown);
  // Vertical plank grain
  for (let gx = 80; gx < 125; gx += 8) {
    T.line(ctx, gx, 25, gx, 65, P.dark_brown);
  }
  // Roof — brown peaked
  T.polygonFill(ctx, [[72, 25], [100, 12], [128, 25]], P.dark_brown);
  T.line(ctx, 72, 25, 100, 12, P.tan); // highlight

  // Windows
  drawWindow(ctx, P, 85, 35, 12, 10, { glassColor: P.dark_blue, frameColor: P.black });
  drawWindow(ctx, P, 105, 35, 12, 10, { glassColor: P.dark_blue, frameColor: P.black });

  // Building 3 (center-right) — stone with door
  T.rect(ctx, 130, 28, 60, 37, P.tan);
  drawStoneWall(ctx, P, 130, 28, 60, 37, {
    wallColor: P.tan,
    mortarColor: P.brown,
    brickW: 18,
    brickH: 7,
  });
  // Roof — red
  T.polygonFill(ctx, [[128, 28], [160, 16], [192, 28]], P.red);
  T.line(ctx, 128, 28, 160, 16, P.yellow);

  // Door on center building
  drawDoor(ctx, P, 155, 45, 14, 20, {
    frameColor: P.dark_brown,
    panelColor: P.brown,
    handleColor: P.yellow,
    side: 'right',
  });

  // Window
  drawWindow(ctx, P, 138, 38, 10, 10, { glassColor: P.dark_blue, frameColor: P.dark_brown });

  // Building 4 (right edge) — partial stone
  T.rect(ctx, 195, 32, 50, 33, P.gray);
  drawStoneWall(ctx, P, 195, 32, 50, 33, {
    wallColor: P.gray,
    mortarColor: P.dark_gray,
    brickW: 20,
    brickH: 7,
  });
  // Partial roof
  T.polygonFill(ctx, [[193, 32], [220, 22], [247, 32]], P.dark_red);
  T.line(ctx, 193, 32, 220, 22, P.red);

  // Window
  drawWindow(ctx, P, 205, 40, 12, 10, { glassColor: P.dark_blue, frameColor: P.dark_brown });

  // --- Ground: full-width cobblestone ---
  drawCobblestone(ctx, P, 65, 75, {
    baseColor: P.gray,
    stoneColor1: P.dark_gray,
    stoneColor2: P.brown,
    highlightColor: P.white,
    shadowColor: P.black,
  });
}

// =========================================================================
//  Layer 2 — STRUCTURES: Market stalls, well/fountain, large props
// =========================================================================

function _structures(ctx, P, params) {
  // --- Central well or fountain (conditional) ---
  if (params.hasWell) {
    const wellX = 145;
    const wellY = 85;

    // Stone base — circular
    T.ellipse(ctx, wellX, wellY + 12, 20, 10, P.gray);
    // Mortar line detail
    T.ellipse(ctx, wellX, wellY + 12, 19, 9, P.dark_gray);
    T.ellipse(ctx, wellX, wellY + 12, 18, 8, P.gray);

    // Well wall — vertical rect
    T.rect(ctx, wellX - 18, wellY, 36, 15, P.gray);
    // Brick lines
    for (let wy = wellY + 3; wy < wellY + 15; wy += 4) {
      T.line(ctx, wellX - 18, wy, wellX + 18, wy, P.dark_gray);
    }
    // Vertical mortar lines
    for (let wx = wellX - 15; wx < wellX + 18; wx += 8) {
      T.line(ctx, wx, wellY, wx, wellY + 15, P.dark_gray);
    }

    // Highlight on well wall
    T.line(ctx, wellX - 18, wellY, wellX - 18, wellY + 15, P.white);

    // Well roof — small triangular cap
    T.polygonFill(ctx, [
      [wellX - 22, wellY],
      [wellX, wellY - 12],
      [wellX + 22, wellY],
    ], P.red);
    T.line(ctx, wellX - 22, wellY, wellX, wellY - 12, P.yellow);

    // Support posts
    T.rect(ctx, wellX - 20, wellY, 3, 15, P.dark_brown);
    T.rect(ctx, wellX + 17, wellY, 3, 15, P.dark_brown);
    T.line(ctx, wellX - 20, wellY, wellX - 20, wellY + 15, P.tan);
    T.line(ctx, wellX + 17, wellY, wellX + 17, wellY + 15, P.tan);

    // Bucket on rope — small detail
    T.rect(ctx, wellX - 3, wellY + 5, 6, 6, P.brown);
    T.line(ctx, wellX, wellY - 10, wellX, wellY + 5, P.dark_gray);
    T.ellipse(ctx, wellX, wellY + 11, 2, 1, P.dark_brown);
  }

  // --- Market stalls (configurable count) ---
  const stallCount = Math.min(4, Math.max(2, params.stallCount));
  const stallPositions = [
    { x: 15,  y: 85, awningColor: P.red },
    { x: 90,  y: 90, awningColor: P.yellow },
    { x: 210, y: 88, awningColor: P.blue },
    { x: 270, y: 85, awningColor: P.dark_green },
  ];

  for (let i = 0; i < stallCount; i++) {
    const stall = stallPositions[i];
    _drawStall(ctx, P, stall.x, stall.y, stall.awningColor);
  }
}

/**
 * Helper to draw a single market stall with awning and counter.
 */
function _drawStall(ctx, P, x, y, awningColor) {
  // Stall posts
  T.rect(ctx, x, y, 3, 30, P.dark_brown);
  T.rect(ctx, x + 35, y, 3, 30, P.dark_brown);
  T.line(ctx, x, y, x, y + 30, P.tan);
  T.line(ctx, x + 35, y, x + 35, y + 30, P.tan);

  // Awning (striped if red or yellow)
  T.polygonFill(ctx, [
    [x - 3, y],
    [x + 20, y - 8],
    [x + 41, y],
  ], awningColor);

  if (awningColor === P.red || awningColor === P.yellow) {
    // Vertical stripes
    for (let sx = x; sx < x + 38; sx += 6) {
      T.line(ctx, sx, y - 5, sx, y, P.white);
    }
  }

  // Highlight on awning left edge
  T.line(ctx, x - 3, y, x + 20, y - 8, P.white);

  // Counter surface — wood plank
  T.rect(ctx, x - 2, y + 22, 42, 5, P.brown);
  T.line(ctx, x - 2, y + 22, x + 40, y + 22, P.tan);
  T.line(ctx, x - 2, y + 26, x + 40, y + 26, P.dark_brown);

  // Counter body (vertical grain)
  T.rect(ctx, x, y + 27, 38, 8, P.brown);
  for (let gx = x + 5; gx < x + 38; gx += 8) {
    T.line(ctx, gx, y + 27, gx, y + 35, P.dark_brown);
  }
}

// =========================================================================
//  Layer 3 — DETAILS: Crates, barrels, produce, signage
// =========================================================================

function _details(ctx, P, params) {
  // --- Crates near stalls ---
  // Crate 1 (left of leftmost stall)
  _drawCrate(ctx, P, 45, 105, 12, 12);

  // Crate 2 (near center, stacked)
  _drawCrate(ctx, P, 110, 110, 12, 12);
  _drawCrate(ctx, P, 110, 98, 12, 12);

  // Crate 3 (right side)
  _drawCrate(ctx, P, 250, 108, 14, 12);

  // --- Barrels ---
  // Barrel 1 (left)
  _drawBarrel(ctx, P, 70, 105, 10, 15);

  // Barrel 2 (right)
  _drawBarrel(ctx, P, 295, 108, 10, 15);

  // --- Produce on stall counters (simple colored rects/ellipses) ---
  // Stall 1 (left) — red apples
  for (let i = 0; i < 4; i++) {
    const px = 18 + i * 6;
    T.ellipse(ctx, px, 110, 3, 2, P.red);
    T.pixel(ctx, px - 1, 109, P.yellow); // highlight
  }

  // Stall 2 — yellow grain sacks
  T.rect(ctx, 95, 113, 8, 6, P.tan);
  T.rect(ctx, 104, 113, 8, 6, P.tan);
  T.line(ctx, 95, 113, 103, 113, P.yellow);
  T.line(ctx, 104, 113, 112, 113, P.yellow);

  // Stall 3 — blue fish (if present)
  if (params.stallCount >= 3) {
    for (let i = 0; i < 3; i++) {
      const fx = 215 + i * 8;
      T.ellipse(ctx, fx, 111, 4, 2, P.blue);
      T.pixel(ctx, fx - 1, 110, P.light_blue);
    }
  }

  // Stall 4 — dark green vegetables
  if (params.stallCount >= 4) {
    for (let i = 0; i < 3; i++) {
      const vx = 275 + i * 7;
      T.ellipse(ctx, vx, 109, 3, 3, P.dark_green);
      T.pixel(ctx, vx, 108, P.green);
    }
  }

  // --- Sign post (left side) ---
  T.rect(ctx, 8, 75, 3, 25, P.dark_brown);
  T.line(ctx, 8, 75, 8, 100, P.tan);
  // Sign board
  T.rect(ctx, 4, 78, 15, 8, P.tan);
  T.line(ctx, 4, 78, 19, 78, P.white);
  T.line(ctx, 4, 85, 19, 85, P.brown);
  // Decorative edge
  T.rect(ctx, 4, 78, 15, 1, P.dark_brown);

  // --- Small crowd indicator items (if busy) ---
  if (params.crowdLevel === 'busy') {
    // Small baskets scattered around
    _drawBasket(ctx, P, 135, 118);
    _drawBasket(ctx, P, 180, 120);
    _drawBasket(ctx, P, 60, 115);
  } else if (params.crowdLevel === 'medium') {
    _drawBasket(ctx, P, 160, 120);
  }

  // --- Decorative bunting between buildings (if day or afternoon) ---
  if (params.timeOfDay !== 'morning') {
    for (let bx = 40; bx < 280; bx += 30) {
      // Small triangular flags
      T.polygonFill(ctx, [
        [bx, 30],
        [bx + 4, 35],
        [bx + 8, 30],
      ], (bx / 30) % 2 === 0 ? P.red : P.yellow);
      // Rope line
      T.pixel(ctx, bx + 4, 28, P.dark_gray);
      T.pixel(ctx, bx + 4, 29, P.dark_gray);
    }
  }
}

/**
 * Helper to draw a wooden crate.
 */
function _drawCrate(ctx, P, x, y, w, h) {
  // Crate body — wood
  T.rect(ctx, x, y, w, h, P.brown);
  // Vertical slat lines
  for (let cx = x + 3; cx < x + w; cx += 4) {
    T.line(ctx, cx, y, cx, y + h, P.dark_brown);
  }
  // Horizontal strapping (metal bands)
  T.rect(ctx, x, y + 2, w, 1, P.dark_gray);
  T.rect(ctx, x, y + h - 3, w, 1, P.dark_gray);

  // Highlight left edge
  T.line(ctx, x, y, x, y + h, P.tan);
  // Shadow bottom edge
  T.line(ctx, x, y + h - 1, x + w, y + h - 1, P.dark_brown);
}

/**
 * Helper to draw a barrel.
 */
function _drawBarrel(ctx, P, x, y, w, h) {
  // Barrel body — vertical staves
  T.rect(ctx, x, y, w, h, P.brown);
  // Stave lines
  for (let bx = x + 2; bx < x + w; bx += 3) {
    T.line(ctx, bx, y, bx, y + h, P.dark_brown);
  }
  // Iron bands
  T.rect(ctx, x - 1, y + 2, w + 2, 1, P.dark_gray);
  T.rect(ctx, x - 1, y + h - 3, w + 2, 1, P.dark_gray);

  // Barrel top (ellipse)
  T.ellipse(ctx, x + w / 2, y + 2, w / 2, 2, P.tan);

  // Highlight left edge for roundness
  T.line(ctx, x, y, x, y + h, P.tan);
}

/**
 * Helper to draw a small wicker basket.
 */
function _drawBasket(ctx, P, x, y) {
  T.rect(ctx, x, y, 8, 5, P.tan);
  // Weave pattern
  for (let bx = x + 1; bx < x + 8; bx += 2) {
    T.line(ctx, bx, y, bx, y + 5, P.brown);
  }
  T.line(ctx, x, y + 2, x + 8, y + 2, P.brown);
  // Highlight
  T.pixel(ctx, x, y, P.yellow);
}

// =========================================================================
//  Layer 4 — SHADING: Shadows (scatter/scatterCircle only)
// =========================================================================

function _shading(ctx, P, params) {
  // --- Building shadows on ground (scatter only) ---
  T.scatter(ctx, 5, 65, 60, 3, P.black, 0.4, 4);
  T.scatter(ctx, 75, 65, 50, 3, P.black, 0.4, 4);
  T.scatter(ctx, 130, 65, 60, 3, P.black, 0.4, 4);
  T.scatter(ctx, 195, 65, 50, 3, P.black, 0.4, 4);

  // --- Stall shadows on ground ---
  if (params.stallCount >= 1) {
    T.scatter(ctx, 13, 115, 40, 6, P.black, 0.35, 4);
  }
  if (params.stallCount >= 2) {
    T.scatter(ctx, 88, 120, 40, 6, P.black, 0.35, 4);
  }
  if (params.stallCount >= 3) {
    T.scatter(ctx, 208, 118, 40, 6, P.black, 0.35, 4);
  }
  if (params.stallCount >= 4) {
    T.scatter(ctx, 268, 115, 40, 6, P.black, 0.35, 4);
  }

  // --- Well shadow (if present) ---
  if (params.hasWell) {
    T.scatterCircle(ctx, 145, 100, 22, P.black, 0.3, 4);
  }

  // --- Crate and barrel shadows ---
  T.scatter(ctx, 45, 117, 12, 4, P.black, 0.4, 4);
  T.scatter(ctx, 110, 122, 12, 4, P.black, 0.4, 4);
  T.scatter(ctx, 250, 120, 14, 4, P.black, 0.4, 4);
  T.scatter(ctx, 70, 120, 10, 4, P.black, 0.4, 4);
  T.scatter(ctx, 295, 123, 10, 4, P.black, 0.4, 4);

  // --- Ambient occlusion at building base ---
  T.scatter(ctx, 0, 64, 320, 2, P.black, 0.5, 4);
}

// =========================================================================
//  Layer 5 — ATMOSPHERE: Ambient effects (scatter/scatterCircle/pixel only)
// =========================================================================

function _atmosphere(ctx, P, params) {
  if (params.timeOfDay === 'morning') {
    // Cool morning light with slight blue tint
    T.scatter(ctx, 0, 0, 320, 140, P.light_blue, 0.04, 4);
    T.scatter(ctx, 0, 0, 320, 140, P.yellow, 0.02, 4);
  } else if (params.timeOfDay === 'afternoon') {
    // Warm golden afternoon light
    T.scatter(ctx, 0, 0, 320, 140, P.yellow, 0.06, 4);
    T.scatter(ctx, 0, 0, 320, 140, P.red, 0.02, 4);
  } else {
    // Bright day — subtle warm overlay
    T.scatter(ctx, 0, 0, 320, 140, P.yellow, 0.03, 4);
  }

  // --- Dust motes in sunlight (sparse pixels) ---
  if (params.crowdLevel === 'busy' || params.crowdLevel === 'medium') {
    for (let i = 0; i < 8; i++) {
      const dx = (i * 37 + 23) % 318;
      const dy = 50 + (i * 19) % 70;
      T.pixel(ctx, dx, dy, P.white);
    }
  }
}
