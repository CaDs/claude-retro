/**
 * forest_path.js — Forest Path room template.
 *
 * Parameterized from the existing ProceduralAssets forest_path code.
 * Exterior scene: dense canopy, forest floor, winding/straight dirt path,
 * large trees, optional hermit shelter, mushroom ring, stump, and ferns.
 *
 * Uses PixelArtToolkit primitives exclusively. 5-layer rendering contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'fantasy/forest_path',
  name: 'Forest Path',
  setting: 'fantasy',
  category: 'exterior',
  palette: 'forest_path',
  params: {
    pathStyle:       { type: 'string',  default: 'winding',  label: 'Path style', options: ['winding', 'straight', 'none'] },
    hasShelter:      { type: 'boolean', default: true,       label: 'Hermit shelter' },
    density:         { type: 'string',  default: 'dense',    label: 'Canopy density', options: ['dense', 'sparse', 'moderate'] },
    hasMushroomRing: { type: 'boolean', default: true,       label: 'Mushroom ring' },
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
//  Layer 1 — BASE: Canopy, forest floor, path
// =========================================================================

function _base(ctx, P, params) {
  // --- Dense canopy — overlapping ellipses in green tones ---
  // Start with dark background
  T.rect(ctx, 0, 0, 320, 50, P.dark_green);

  // Canopy blobs (back layer) — full set for dense, reduced for sparse
  const canopyBlobs = [
    [30, 10, 35, 18], [80, 5, 40, 20], [140, 8, 30, 15],
    [200, 3, 38, 18], [260, 7, 35, 16], [310, 5, 30, 14],
    [0, 15, 28, 12], [55, 20, 30, 10], [120, 18, 25, 12],
    [180, 22, 28, 10], [240, 20, 32, 12], [290, 18, 25, 10],
  ];
  const blobCount = params.density === 'dense' ? canopyBlobs.length
    : params.density === 'moderate' ? 8
    : 5;
  for (let i = 0; i < blobCount; i++) {
    const [cx, cy, rx, ry] = canopyBlobs[i];
    T.ellipseFill(ctx, cx, cy, rx, ry, P.dark_green);
  }

  // Middle canopy layer
  const midBlobs = [
    [15, 8, 20, 10], [50, 12, 18, 9], [100, 6, 22, 11],
    [130, 14, 16, 8], [165, 10, 20, 10], [210, 8, 18, 9],
    [245, 14, 22, 10], [275, 4, 16, 8], [305, 12, 18, 9],
    [40, 22, 14, 7], [155, 20, 16, 8], [225, 18, 14, 7],
  ];
  const midCount = params.density === 'dense' ? midBlobs.length
    : params.density === 'moderate' ? 8
    : 4;
  for (let i = 0; i < midCount; i++) {
    const [cx, cy, rx, ry] = midBlobs[i];
    T.ellipseFill(ctx, cx, cy, rx, ry, P.green);
  }

  // Small light_green highlight ellipses
  const highlightBlobs = [
    [25, 6, 8, 4], [90, 10, 7, 3], [150, 5, 9, 4],
    [195, 8, 6, 3], [250, 10, 8, 4], [300, 8, 7, 3],
    [60, 16, 6, 3], [175, 18, 7, 3],
  ];
  const hlCount = params.density === 'dense' ? highlightBlobs.length
    : params.density === 'moderate' ? 5
    : 3;
  for (let i = 0; i < hlCount; i++) {
    const [cx, cy, rx, ry] = highlightBlobs[i];
    T.ellipseFill(ctx, cx, cy, rx, ry, P.light_green);
  }

  // Front canopy details
  for (let i = 0; i < blobCount; i++) {
    const [cx, cy, rx, ry] = canopyBlobs[i];
    T.ellipseFill(ctx, cx + 5, cy + 3, rx - 8, ry - 5, P.green);
  }

  // Sky peeks through gaps (more visible when sparse)
  T.ellipseFill(ctx, 95, 8, 6, 5, P.dark_blue);
  if (params.density !== 'dense') {
    T.ellipseFill(ctx, 175, 12, 5, 4, P.blue);
    T.ellipseFill(ctx, 280, 6, 4, 3, P.dark_blue);
  }
  if (params.density === 'sparse') {
    T.ellipseFill(ctx, 50, 10, 7, 5, P.blue);
    T.ellipseFill(ctx, 220, 8, 6, 4, P.dark_blue);
  }

  // --- Ground: solid dark green base with brown earth patches ---
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
  // Moss and earth patches (~35)
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

  // --- Path ---
  if (params.pathStyle === 'winding') {
    // Winding dirt path — polygon shape (original)
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
    // Path stones / pebbles (~18)
    for (let i = 0; i < 18; i++) {
      const px = 100 + (i * 11) % 125;
      const py = 105 + (i * 7) % 30;
      T.pixel(ctx, px, py, P.gray);
      T.pixel(ctx, px + 1, py, P.dark_gray);
    }
  } else if (params.pathStyle === 'straight') {
    // Straight dirt path — simple polygon running center-to-bottom
    T.polygonFill(ctx, [
      [135, 80], [185, 80], [195, 140], [125, 140],
    ], P.tan);
    // Dirt variation patches
    const dirtPatches = [
      [140, 90, 6, 3], [155, 100, 5, 2], [165, 110, 7, 3], [145, 120, 6, 2],
      [170, 130, 5, 2], [150, 95, 4, 3], [175, 105, 5, 2], [160, 125, 7, 2],
    ];
    for (const [dx, dy, dw, dh] of dirtPatches) {
      T.rect(ctx, dx, dy, dw, dh, P.brown);
    }
    // Rut marks
    T.line(ctx, 145, 85, 140, 135, P.dark_brown);
    T.line(ctx, 175, 85, 180, 135, P.dark_brown);
    // Pebbles
    for (let i = 0; i < 14; i++) {
      const px = 138 + (i * 7) % 50;
      const py = 88 + (i * 9) % 48;
      T.pixel(ctx, px, py, P.gray);
      T.pixel(ctx, px + 1, py, P.dark_gray);
    }
  }
  // pathStyle 'none' — no path drawn, just the forest floor
}

// =========================================================================
//  Layer 2 — STRUCTURES: Trees, hermit shelter
// =========================================================================

function _structures(ctx, P, params) {
  // --- Large tree (left) — tapered polygon trunk ---
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
  // Moss on trunk — pixel cluster
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

  // --- Medium tree (right) — solid trunk with bark lines ---
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

  // --- Small background trees ---
  _miniTree(ctx, 148, 28, P.dark_green, P.green, P.dark_brown);
  _miniTree(ctx, 178, 24, P.green, P.light_green, P.dark_brown);

  // --- Hermit shelter (conditional) ---
  if (params.hasShelter) {
    // Solid walls with plank lines
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
}

// Small helper tree for background
function _miniTree(ctx, x, y, dark, light, trunk) {
  T.rect(ctx, x + 6, y + 14, 5, 12, trunk);
  T.ellipseFill(ctx, x + 8, y + 6, 10, 9, dark);
  T.ellipseFill(ctx, x + 8, y + 4, 7, 6, light);
}

// =========================================================================
//  Layer 3 — DETAILS: Mushrooms, stump, bucket, ferns
// =========================================================================

function _details(ctx, P, params) {
  // --- Mushroom ring (conditional) ---
  if (params.hasMushroomRing) {
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
  }

  // --- Old stump — solid with horizontal grain lines ---
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

  // --- Bucket near stump — solid with vertical stave lines ---
  T.polygonFill(ctx, [[262, 87], [274, 87], [276, 98], [260, 98]], P.tan);
  // Vertical stave lines
  T.line(ctx, 264, 87, 263, 98, P.brown);
  T.line(ctx, 267, 87, 266, 98, P.brown);
  T.line(ctx, 270, 87, 270, 98, P.brown);
  T.line(ctx, 273, 87, 274, 98, P.brown);
  T.ellipse(ctx, 268, 87, 7, 2, P.brown);
  T.line(ctx, 263, 84, 268, 82, P.tan);
  T.line(ctx, 268, 82, 273, 84, P.tan);

  // --- Fern clusters ---
  for (const [fx, fy] of [[85, 95], [145, 110], [235, 100], [290, 108]]) {
    T.pixel(ctx, fx, fy, P.green);
    T.pixel(ctx, fx - 1, fy + 1, P.light_green);
    T.pixel(ctx, fx + 1, fy + 1, P.light_green);
    T.pixel(ctx, fx - 2, fy + 2, P.green);
    T.pixel(ctx, fx + 2, fy + 2, P.green);
  }
}

// =========================================================================
//  Layer 4 — SHADING: Light shafts, tree shadows (scatter/scatterCircle only)
// =========================================================================

function _shading(ctx, P, params) {
  // Light shafts — scattered yellow overlay (preserves trees/canopy underneath)
  const shaftCount = params.density === 'dense' ? 5 : params.density === 'moderate' ? 4 : 3;
  const shaftPositions = [30, 95, 160, 225, 290];
  for (let i = 0; i < shaftCount; i++) {
    const sx = shaftPositions[i];
    const intensity = params.density === 'sparse' ? 0.09 : 0.06;
    T.scatter(ctx, sx - 5, 0, 20, 140, P.yellow, intensity, 4);
  }

  // Tree shadows on ground
  T.scatter(ctx, 35, 100, 40, 8, P.black, 0.35, 4);
  T.scatter(ctx, 250, 90, 35, 8, P.black, 0.35, 4);
}

// =========================================================================
//  Layer 5 — ATMOSPHERE: Dust motes (scatter/scatterCircle/pixel only)
// =========================================================================

function _atmosphere(ctx, P, params) {
  // Scattered bright dust motes in light shaft areas
  const motes = [[35, 40], [40, 80], [98, 55], [100, 30], [165, 45],
                 [170, 70], [228, 35], [230, 60], [295, 50], [292, 85]];
  for (const [mx, my] of motes) {
    T.pixel(ctx, mx, my, P.yellow);
  }
}
