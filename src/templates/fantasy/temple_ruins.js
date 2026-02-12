/**
 * temple_ruins.js — Ancient Temple Ruins room template.
 *
 * Parameterized from the existing ProceduralAssets temple code.
 * Underground/interior scene: stone block walls, tiled floor, arched ceiling,
 * columns (some broken), optional altar, cracked wall opening, faded tapestry,
 * wall runes, fallen candelabra, and vine growth.
 *
 * Uses PixelArtToolkit primitives exclusively. 5-layer rendering contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'fantasy/temple_ruins',
  name: 'Temple Ruins',
  setting: 'fantasy',
  category: 'underground',
  palette: 'temple',
  params: {
    columnCount:   { type: 'number',  default: 3,          label: 'Column count (third is broken)', options: [1, 2, 3] },
    hasAltar:      { type: 'boolean', default: true,        label: 'Stone altar' },
    hasWallOpening:{ type: 'boolean', default: true,        label: 'Cracked wall opening' },
    hasTapestry:   { type: 'boolean', default: true,        label: 'Faded tapestry' },
    decay:         { type: 'string',  default: 'moderate',  label: 'Decay level', options: ['light', 'moderate', 'heavy'] },
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
//  Layer 1 — BASE: Stone block walls, tiled floor, wall opening
// =========================================================================

function _base(ctx, P, params) {
  // --- Back wall: solid stone blocks ---
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

  // --- Floor: alternating tile rects ---
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

  // --- Cracked wall opening (right side, conditional) ---
  if (params.hasWallOpening) {
    // Rough polygon hole
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
}

// =========================================================================
//  Layer 2 — STRUCTURES: Arched ceiling, columns, altar
// =========================================================================

function _structures(ctx, P, params) {
  // --- Arched ceiling — polygon ---
  T.polygonFill(ctx, [
    [0, 18], [40, 5], [100, 0], [160, -2], [220, 0], [280, 5], [320, 18],
    [320, 22], [280, 9], [220, 4], [160, 2], [100, 4], [40, 9], [0, 22],
  ], P.stone);
  T.line(ctx, 0, 22, 40, 9, P.light_stone);
  T.line(ctx, 40, 9, 100, 4, P.light_stone);
  T.line(ctx, 100, 4, 160, 2, P.light_stone);
  T.line(ctx, 160, 2, 220, 4, P.light_stone);
  T.line(ctx, 220, 4, 280, 9, P.light_stone);

  // --- Left column (intact, always drawn if columnCount >= 1) ---
  if (params.columnCount >= 1) {
    T.rect(ctx, 55, 20, 14, 55, P.stone);
    T.rect(ctx, 53, 20, 18, 4, P.light_stone); // capital
    T.rect(ctx, 53, 71, 18, 4, P.light_stone); // base
    T.line(ctx, 55, 24, 55, 71, P.light_stone); // left highlight
    T.line(ctx, 68, 24, 68, 71, P.dark_stone);  // right shadow
  }

  // --- Center column (intact, drawn if columnCount >= 2) ---
  if (params.columnCount >= 2) {
    T.rect(ctx, 153, 20, 14, 55, P.stone);
    T.rect(ctx, 151, 20, 18, 4, P.light_stone);
    T.rect(ctx, 151, 71, 18, 4, P.light_stone);
    T.line(ctx, 153, 24, 153, 71, P.light_stone);
    T.line(ctx, 166, 24, 166, 71, P.dark_stone);
  }

  // --- Right column (broken — top half only + rubble, drawn if columnCount >= 3) ---
  if (params.columnCount >= 3) {
    T.rect(ctx, 233, 45, 14, 30, P.stone);
    T.rect(ctx, 231, 71, 18, 4, P.light_stone); // base
    // Jagged break at top
    T.polygonFill(ctx, [
      [233, 45], [237, 42], [241, 46], [244, 43], [247, 45],
      [247, 48], [233, 48],
    ], P.stone);
    // Rubble pieces on floor (more rubble at higher decay)
    T.rect(ctx, 225, 90, 8, 5, P.light_stone);
    T.rect(ctx, 235, 92, 6, 4, P.stone);
    T.rect(ctx, 243, 88, 10, 6, P.light_stone);
    T.rect(ctx, 240, 95, 5, 3, P.pale_stone);
    if (params.decay === 'heavy') {
      T.rect(ctx, 220, 94, 5, 3, P.stone);
      T.rect(ctx, 250, 91, 7, 4, P.light_stone);
      T.rect(ctx, 228, 96, 4, 3, P.pale_stone);
    }
  }

  // --- Stone altar (conditional) ---
  if (params.hasAltar) {
    T.rect(ctx, 90, 80, 40, 20, P.stone);
    T.rect(ctx, 88, 78, 44, 4, P.light_stone); // altar top
    T.line(ctx, 88, 78, 131, 78, P.pale_stone); // top highlight
    // Subtle dither for altar surface texture
    T.dither(ctx, 90, 82, 40, 16, P.stone, P.dark_stone, 0.15, 4);
    // Gold vessel on altar
    T.rect(ctx, 104, 72, 12, 8, P.dark_gold);
    T.rect(ctx, 106, 70, 8, 4, P.gold);
    T.ellipseFill(ctx, 110, 70, 5, 2, P.bright_gold);
    T.pixel(ctx, 108, 74, P.bright_gold); // vessel glow dot
    T.pixel(ctx, 112, 74, P.bright_gold);
  }
}

// =========================================================================
//  Layer 3 — DETAILS: Runes, cracks, tapestry, candelabra, vines
// =========================================================================

function _details(ctx, P, params) {
  // --- Gold rune pixels on back wall ---
  const runePositions = [
    [30, 35], [32, 40], [34, 35], [36, 42],
    [130, 30], [133, 34], [136, 30], [132, 38],
    [190, 32], [193, 36], [196, 32], [191, 40],
  ];
  for (const [rx, ry] of runePositions) {
    T.pixel(ctx, rx, ry, P.gold);
  }

  // --- Wall cracks (lines) — more cracks at higher decay ---
  T.line(ctx, 80, 25, 85, 45, P.black);
  T.line(ctx, 85, 45, 82, 55, P.black);
  T.line(ctx, 200, 15, 205, 30, P.black);
  T.line(ctx, 205, 30, 202, 40, P.black);
  if (params.decay === 'moderate' || params.decay === 'heavy') {
    T.line(ctx, 150, 35, 148, 50, P.black);
    T.line(ctx, 50, 40, 55, 55, P.black);
  }
  if (params.decay === 'heavy') {
    T.line(ctx, 100, 20, 105, 38, P.black);
    T.line(ctx, 105, 38, 102, 48, P.black);
    T.line(ctx, 240, 25, 235, 42, P.black);
    T.line(ctx, 180, 10, 182, 25, P.black);
  }

  // --- Faded tapestry (left wall, conditional) ---
  if (params.hasTapestry) {
    T.rect(ctx, 10, 28, 18, 30, P.dark_purple);
    T.rect(ctx, 12, 30, 14, 26, P.purple);
    // Tapestry pattern — simple gold lines
    T.line(ctx, 15, 34, 22, 34, P.dark_gold);
    T.line(ctx, 15, 40, 22, 40, P.dark_gold);
    T.line(ctx, 15, 46, 22, 46, P.dark_gold);
    T.pixel(ctx, 18, 37, P.gold);
    T.pixel(ctx, 18, 43, P.gold);
    // Frayed bottom edge — more tattered at higher decay
    T.pixel(ctx, 12, 56, P.purple);
    T.pixel(ctx, 15, 58, P.dark_purple);
    T.pixel(ctx, 19, 57, P.purple);
    T.pixel(ctx, 23, 58, P.dark_purple);
    if (params.decay === 'heavy') {
      T.pixel(ctx, 14, 57, P.dark_purple);
      T.pixel(ctx, 17, 59, P.purple);
      T.pixel(ctx, 21, 58, P.dark_purple);
    }
  }

  // --- Fallen candelabra on floor (right area) ---
  // Horizontal shaft
  T.line(ctx, 175, 105, 210, 103, P.dark_gold);
  T.line(ctx, 175, 106, 210, 104, P.gold);
  // Candle stubs
  T.rect(ctx, 177, 101, 3, 4, P.pale_stone);
  T.rect(ctx, 195, 100, 3, 3, P.pale_stone);
  T.rect(ctx, 207, 99, 3, 4, P.pale_stone);
  // Base ring
  T.circle(ctx, 175, 106, 3, P.dark_gold);

  // --- Vine on broken column (drawn if column 3 exists) ---
  if (params.columnCount >= 3) {
    T.line(ctx, 236, 45, 238, 55, P.vine_green);
    T.line(ctx, 238, 55, 235, 62, P.vine_green);
    T.line(ctx, 235, 62, 237, 70, P.vine_green);
    T.pixel(ctx, 234, 50, P.vine_green);
    T.pixel(ctx, 239, 58, P.vine_green);
    T.pixel(ctx, 233, 65, P.vine_green);
    // Extra vine growth at higher decay
    if (params.decay === 'heavy') {
      T.line(ctx, 234, 48, 232, 56, P.vine_green);
      T.pixel(ctx, 231, 53, P.vine_green);
      T.pixel(ctx, 240, 62, P.vine_green);
      T.line(ctx, 237, 68, 240, 74, P.vine_green);
    }
  }

  // --- Extra decay details (floor debris) ---
  if (params.decay === 'moderate' || params.decay === 'heavy') {
    // Scattered stone chips on floor
    T.pixel(ctx, 70, 85, P.light_stone);
    T.pixel(ctx, 120, 90, P.pale_stone);
    T.pixel(ctx, 200, 88, P.stone);
    T.pixel(ctx, 160, 95, P.light_stone);
  }
  if (params.decay === 'heavy') {
    T.pixel(ctx, 45, 82, P.pale_stone);
    T.pixel(ctx, 95, 92, P.light_stone);
    T.pixel(ctx, 250, 86, P.stone);
    T.rect(ctx, 140, 100, 5, 3, P.light_stone);
    T.rect(ctx, 80, 95, 4, 3, P.stone);
  }
}

// =========================================================================
//  Layer 4 — SHADING: Column shadows, altar shadow (scatter/scatterCircle only)
// =========================================================================

function _shading(ctx, P, params) {
  // Column shadows on floor
  if (params.columnCount >= 1) {
    T.scatter(ctx, 50, 76, 24, 8, P.black, 0.3, 4);
  }
  if (params.columnCount >= 2) {
    T.scatter(ctx, 148, 76, 24, 8, P.black, 0.3, 4);
  }
  if (params.columnCount >= 3) {
    T.scatter(ctx, 228, 76, 24, 8, P.black, 0.25, 4);
  }

  // Altar shadow
  if (params.hasAltar) {
    T.scatter(ctx, 88, 100, 44, 6, P.black, 0.35, 4);
  }

  // Ceiling shadow band
  T.scatter(ctx, 0, 18, 270, 8, P.black, 0.2, 4);

  // Rubble shadow (if broken column exists)
  if (params.columnCount >= 3) {
    T.scatter(ctx, 224, 94, 30, 4, P.black, 0.2, 4);
  }
}

// =========================================================================
//  Layer 5 — ATMOSPHERE: Light shaft, altar glow, ambient washes, motes
//            (scatter/scatterCircle/pixel only)
// =========================================================================

function _atmosphere(ctx, P, params) {
  // Light shaft from wall opening
  if (params.hasWallOpening) {
    T.scatter(ctx, 270, 10, 45, 130, P.pale_stone, 0.06, 4);
    T.scatter(ctx, 265, 75, 50, 40, P.pale_stone, 0.04, 4);
  }

  // Altar glow — warm gold circle
  if (params.hasAltar) {
    T.scatterCircle(ctx, 110, 75, 25, P.bright_gold, 0.07, 4);
    T.scatterCircle(ctx, 110, 75, 15, P.gold, 0.05, 4);
  }

  // Cool blue ambient wash — stronger at higher decay
  const blueIntensity = params.decay === 'heavy' ? 0.05
    : params.decay === 'moderate' ? 0.03
    : 0.02;
  T.scatter(ctx, 0, 0, 260, 140, P.deep_blue, blueIntensity, 4);

  // Purple haze on floor — stronger at higher decay
  const hazeIntensity = params.decay === 'heavy' ? 0.06
    : params.decay === 'moderate' ? 0.04
    : 0.02;
  T.scatter(ctx, 0, 90, 260, 50, P.dark_purple, hazeIntensity, 4);

  // Dust motes in light shaft
  if (params.hasWallOpening) {
    const motes = [
      [280, 20], [290, 35], [285, 50], [295, 65],
      [275, 80], [288, 95], [300, 25], [278, 110],
    ];
    for (const [mx, my] of motes) {
      T.pixel(ctx, mx, my, P.pale_stone);
    }
  }
}
