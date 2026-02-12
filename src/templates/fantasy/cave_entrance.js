/**
 * cave_entrance.js — Cave Entrance room template.
 *
 * A cave entrance view — rocky cliff face with a dark cave opening,
 * vegetation, rocks/boulders, stalactites visible at the cave mouth.
 * Uses PixelArtToolkit primitives exclusively. 5-layer rendering contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';
import { drawDirtGround, drawSkyBands } from '../_base.js';

export const metadata = {
  id: 'fantasy/cave_entrance',
  name: 'Cave Entrance',
  setting: 'fantasy',
  category: 'exterior',
  palette: 'forest_deep',
  params: {
    caveSize:      { type: 'string',  default: 'large', label: 'Cave opening size', options: ['small', 'medium', 'large'] },
    vegetation:    { type: 'string',  default: 'dense', label: 'Vegetation density', options: ['sparse', 'medium', 'dense'] },
    timeOfDay:     { type: 'string',  default: 'day',   label: 'Time of day', options: ['dawn', 'day', 'dusk'] },
    hasTorches:    { type: 'boolean', default: false,   label: 'Lit torches at entrance' },
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
//  Layer 1 — BASE: Sky, cliff rock face, ground
// =========================================================================

function _base(ctx, P, params) {
  // --- Sky bands (varies by time of day) ---
  let skyBands;
  if (params.timeOfDay === 'dawn') {
    skyBands = [
      { y: 0,  h: 12, color: P.yellow },
      { y: 12, h: 12, color: P.blue },
      { y: 24, h: 14, color: P.dark_blue },
    ];
  } else if (params.timeOfDay === 'dusk') {
    skyBands = [
      { y: 0,  h: 12, color: P.dark_blue },
      { y: 12, h: 14, color: P.blue },
      { y: 26, h: 14, color: P.red },
    ];
  } else {
    // day
    skyBands = [
      { y: 0,  h: 15, color: P.light_green },
      { y: 15, h: 25, color: P.dark_blue },
    ];
  }
  drawSkyBands(ctx, P, skyBands);

  // --- Cliff rock face (layered polygon approach) ---
  // Main cliff body — large irregular polygon
  T.polygonFill(ctx, [
    [0, 35],
    [40, 28],
    [90, 30],
    [145, 22],
    [210, 25],
    [270, 30],
    [320, 35],
    [320, 90],
    [0, 90],
  ], P.dark_gray);

  // Dither rock texture over cliff face
  T.dither(ctx, 0, 25, 320, 65, P.dark_gray, P.gray, 0.3, 4);

  // Rock stratification lines (horizontal bands for sediment layers)
  for (let sy = 32; sy < 90; sy += 12) {
    T.line(ctx, 0, sy, 320, sy, P.brown);
    T.line(ctx, 0, sy + 1, 320, sy + 1, P.tan);
  }

  // Additional rocky outcroppings (polygon overlays)
  T.polygonFill(ctx, [
    [20, 45],
    [35, 40],
    [50, 44],
    [52, 52],
    [22, 54],
  ], P.gray);
  T.dither(ctx, 20, 40, 32, 14, P.gray, P.dark_gray, 0.25, 4);

  T.polygonFill(ctx, [
    [260, 42],
    [280, 38],
    [300, 43],
    [298, 50],
    [262, 52],
  ], P.gray);
  T.dither(ctx, 260, 38, 40, 14, P.gray, P.dark_gray, 0.25, 4);

  // --- Ground: dirt with rocks and grass patches ---
  drawDirtGround(ctx, P, 90, 50, {
    baseColor: P.dark_brown,
    darkColor: P.brown,
    lightColor: P.tan,
    pebbleColor: P.dark_gray,
  });

  // Additional grass patches on ground
  for (let i = 0; i < 8; i++) {
    const gx = (i * 41 + 15) % 310;
    const gy = 92 + (i * 7) % 45;
    const gw = 8 + (i * 5) % 12;
    T.dither(ctx, gx, gy, gw, 3, P.dark_brown, P.dark_green, 0.5, 4);
  }
}

// =========================================================================
//  Layer 2 — STRUCTURES: Cave opening, large boulders
// =========================================================================

function _structures(ctx, P, params) {
  // --- Cave opening (size depends on param) ---
  let caveX, caveY, caveW, caveH;
  if (params.caveSize === 'small') {
    caveX = 130;
    caveY = 50;
    caveW = 60;
    caveH = 40;
  } else if (params.caveSize === 'medium') {
    caveX = 120;
    caveY = 45;
    caveW = 80;
    caveH = 45;
  } else {
    // large
    caveX = 100;
    caveY = 40;
    caveW = 120;
    caveH = 50;
  }

  // Cave mouth — irregular arch shape (polygon)
  T.polygonFill(ctx, [
    [caveX, caveY + caveH],
    [caveX + 10, caveY + 25],
    [caveX + 20, caveY + 10],
    [caveX + caveW / 2, caveY],
    [caveX + caveW - 20, caveY + 10],
    [caveX + caveW - 10, caveY + 25],
    [caveX + caveW, caveY + caveH],
  ], P.black);

  // Rocky rim around cave mouth (irregular polygon edges)
  // Left side rim
  T.polygonFill(ctx, [
    [caveX - 5, caveY + caveH],
    [caveX - 2, caveY + 20],
    [caveX + 8, caveY + 8],
    [caveX + 18, caveY + 12],
    [caveX + 10, caveY + caveH],
  ], P.gray);

  // Right side rim
  T.polygonFill(ctx, [
    [caveX + caveW - 10, caveY + caveH],
    [caveX + caveW - 18, caveY + 12],
    [caveX + caveW - 8, caveY + 8],
    [caveX + caveW + 2, caveY + 20],
    [caveX + caveW + 5, caveY + caveH],
  ], P.gray);

  // Top rim arch
  T.polygonFill(ctx, [
    [caveX + 22, caveY + 8],
    [caveX + caveW / 2, caveY - 5],
    [caveX + caveW - 22, caveY + 8],
    [caveX + caveW - 20, caveY + 10],
    [caveX + caveW / 2, caveY],
    [caveX + 20, caveY + 10],
  ], P.gray);

  // Dither rocky texture on rim
  T.dither(ctx, caveX - 5, caveY - 5, 20, caveH + 5, P.gray, P.dark_gray, 0.35, 4);
  T.dither(ctx, caveX + caveW - 15, caveY - 5, 20, caveH + 5, P.gray, P.dark_gray, 0.35, 4);
  T.dither(ctx, caveX + 20, caveY - 5, caveW - 40, 15, P.gray, P.dark_gray, 0.35, 4);

  // --- Stalactites at cave mouth ---
  const stalactiteCount = params.caveSize === 'large' ? 5 : params.caveSize === 'medium' ? 3 : 2;
  for (let i = 0; i < stalactiteCount; i++) {
    const sx = caveX + 20 + (i * (caveW - 40) / (stalactiteCount - 1));
    const sh = 8 + (i % 3) * 4;
    _drawStalactite(ctx, P, sx, caveY + 2, sh);
  }

  // --- Large boulders near entrance ---
  // Boulder 1 (left)
  _drawBoulder(ctx, P, 45, 95, 28, 22);

  // Boulder 2 (right)
  _drawBoulder(ctx, P, 260, 100, 24, 18);

  // Boulder 3 (center-left, smaller)
  _drawBoulder(ctx, P, 85, 105, 18, 14);

  // Boulder 4 (near cave, right)
  if (params.caveSize !== 'small') {
    _drawBoulder(ctx, P, caveX + caveW + 10, 88, 22, 16);
  }
}

/**
 * Helper to draw a stalactite.
 */
function _drawStalactite(ctx, P, x, y, h) {
  // Narrow triangle pointing down
  T.polygonFill(ctx, [
    [x - 2, y],
    [x, y + h],
    [x + 2, y],
  ], P.gray);

  // Highlight left edge
  T.line(ctx, x - 2, y, x, y + h, P.white);

  // Shadow right edge
  T.line(ctx, x + 2, y, x, y + h, P.dark_gray);
}

/**
 * Helper to draw a large boulder.
 */
function _drawBoulder(ctx, P, x, y, w, h) {
  // Irregular boulder shape (polygon)
  T.polygonFill(ctx, [
    [x, y + h / 2],
    [x + w / 4, y],
    [x + 3 * w / 4, y],
    [x + w, y + h / 2],
    [x + 3 * w / 4, y + h],
    [x + w / 4, y + h],
  ], P.dark_gray);

  // Dither for rock texture
  T.dither(ctx, x, y, w, h, P.dark_gray, P.gray, 0.3, 4);

  // Cracks (dark lines)
  T.line(ctx, x + w / 3, y + 2, x + w / 2, y + h - 2, P.black);
  T.line(ctx, x + 2 * w / 3, y + 4, x + 2 * w / 3, y + h - 4, P.brown);

  // Highlight top-left for roundness
  T.scatter(ctx, x, y, w / 2, h / 3, P.white, 0.15, 4);
}

// =========================================================================
//  Layer 3 — DETAILS: Vegetation, vines, small rocks, torches
// =========================================================================

function _details(ctx, P, params) {
  // --- Vegetation: bushes and grass tufts ---
  const vegDensity = params.vegetation === 'dense' ? 12 : params.vegetation === 'medium' ? 8 : 4;

  for (let i = 0; i < vegDensity; i++) {
    const vx = (i * 29 + 12) % 310;
    const vy = 100 + (i * 11) % 35;
    _drawBush(ctx, P, vx, vy);
  }

  // --- Grass tufts ---
  for (let i = 0; i < vegDensity * 2; i++) {
    const gx = (i * 17 + 5) % 315;
    const gy = 95 + (i * 7) % 40;
    _drawGrassTuft(ctx, P, gx, gy);
  }

  // --- Vines hanging from cliff/cave rim ---
  if (params.vegetation === 'dense' || params.vegetation === 'medium') {
    for (let i = 0; i < 6; i++) {
      const vx = 30 + i * 50;
      const vy = 35 + (i % 3) * 8;
      const vh = 10 + (i % 4) * 8;
      _drawVine(ctx, P, vx, vy, vh);
    }
  }

  // --- Small rocks scattered on ground ---
  for (let i = 0; i < 15; i++) {
    const rx = (i * 23 + 8) % 315;
    const ry = 95 + (i * 13) % 42;
    const rw = 3 + (i % 3);
    const rh = 2 + (i % 2);
    T.rect(ctx, rx, ry, rw, rh, P.gray);
    T.pixel(ctx, rx, ry, P.white);
  }

  // --- Torches (conditional) ---
  if (params.hasTorches) {
    const caveX = params.caveSize === 'large' ? 100 : params.caveSize === 'medium' ? 120 : 130;
    const caveW = params.caveSize === 'large' ? 120 : params.caveSize === 'medium' ? 80 : 60;

    // Left torch
    _drawTorch(ctx, P, caveX - 15, 70);

    // Right torch
    _drawTorch(ctx, P, caveX + caveW + 10, 70);
  }

  // --- Mushrooms near cave entrance ---
  for (let i = 0; i < 4; i++) {
    const mx = 110 + i * 25;
    const my = 88 + (i % 2) * 4;
    _drawMushroom(ctx, P, mx, my);
  }

  // --- Moss patches on boulders and cliff ---
  T.scatter(ctx, 45, 95, 28, 10, P.dark_green, 0.4, 4);
  T.scatter(ctx, 260, 100, 24, 8, P.dark_green, 0.4, 4);
  T.scatter(ctx, 20, 50, 30, 20, P.green, 0.3, 4);
  T.scatter(ctx, 270, 45, 30, 20, P.green, 0.3, 4);
}

/**
 * Helper to draw a bush.
 */
function _drawBush(ctx, P, x, y) {
  // Irregular bush shape (clustered circles)
  T.ellipse(ctx, x, y, 6, 4, P.dark_green);
  T.ellipse(ctx, x - 3, y + 2, 4, 3, P.dark_green);
  T.ellipse(ctx, x + 3, y + 2, 4, 3, P.dark_green);

  // Highlight pixels for texture
  T.pixel(ctx, x - 2, y - 1, P.green);
  T.pixel(ctx, x + 1, y, P.green);
  T.scatter(ctx, x - 6, y, 12, 6, P.green, 0.2, 4);
}

/**
 * Helper to draw a grass tuft.
 */
function _drawGrassTuft(ctx, P, x, y) {
  // Vertical grass blades (short lines)
  T.line(ctx, x, y, x, y - 3, P.dark_green);
  T.line(ctx, x + 1, y, x + 1, y - 4, P.green);
  T.line(ctx, x + 2, y, x + 2, y - 2, P.dark_green);
  T.line(ctx, x - 1, y, x - 1, y - 2, P.green);
}

/**
 * Helper to draw a hanging vine.
 */
function _drawVine(ctx, P, x, y, h) {
  // Main vine line
  T.line(ctx, x, y, x, y + h, P.dark_green);

  // Leaves along the vine (small pixels)
  for (let ly = y + 2; ly < y + h; ly += 3) {
    T.pixel(ctx, x - 1, ly, P.green);
    T.pixel(ctx, x + 1, ly + 1, P.green);
  }
}

/**
 * Helper to draw a lit torch.
 */
function _drawTorch(ctx, P, x, y) {
  // Torch post
  T.rect(ctx, x, y, 3, 20, P.dark_brown);
  T.line(ctx, x, y, x, y + 20, P.tan);

  // Torch head (basket)
  T.rect(ctx, x - 2, y - 5, 7, 6, P.brown);
  T.line(ctx, x - 2, y - 5, x - 2, y + 1, P.dark_brown);
  T.line(ctx, x + 4, y - 5, x + 4, y + 1, P.dark_brown);

  // Flame (layered polygons)
  T.polygonFill(ctx, [
    [x - 1, y - 5],
    [x + 1, y - 12],
    [x + 4, y - 5],
  ], P.red);

  T.polygonFill(ctx, [
    [x, y - 6],
    [x + 1, y - 11],
    [x + 3, y - 6],
  ], P.yellow);

  // Flame core
  T.pixel(ctx, x + 1, y - 9, P.white);
}

/**
 * Helper to draw a mushroom.
 */
function _drawMushroom(ctx, P, x, y) {
  // Mushroom stem
  T.rect(ctx, x, y, 2, 4, P.tan);
  T.pixel(ctx, x, y, P.white);

  // Mushroom cap
  T.ellipse(ctx, x + 1, y - 2, 3, 2, P.red);
  T.pixel(ctx, x - 1, y - 2, P.white);
  T.pixel(ctx, x + 2, y - 2, P.white);
}

// =========================================================================
//  Layer 4 — SHADING: Shadows (scatter/scatterCircle only)
// =========================================================================

function _shading(ctx, P, params) {
  // --- Cave interior darkness (deep shadow scatter) ---
  const caveX = params.caveSize === 'large' ? 100 : params.caveSize === 'medium' ? 120 : 130;
  const caveY = params.caveSize === 'large' ? 40 : params.caveSize === 'medium' ? 45 : 50;
  const caveW = params.caveSize === 'large' ? 120 : params.caveSize === 'medium' ? 80 : 60;
  const caveH = params.caveSize === 'large' ? 50 : params.caveSize === 'medium' ? 45 : 40;

  T.scatter(ctx, caveX + 15, caveY + 10, caveW - 30, caveH - 10, P.black, 0.7, 4);

  // --- Boulder shadows on ground ---
  T.scatter(ctx, 45, 117, 28, 5, P.black, 0.5, 4);
  T.scatter(ctx, 260, 118, 24, 5, P.black, 0.5, 4);
  T.scatter(ctx, 85, 119, 18, 4, P.black, 0.5, 4);

  if (params.caveSize !== 'small') {
    T.scatter(ctx, caveX + caveW + 10, 104, 22, 5, P.black, 0.5, 4);
  }

  // --- Cliff overhang shadow on ground ---
  T.scatter(ctx, 0, 90, 320, 3, P.black, 0.4, 4);

  // --- Ambient cave rim shadow ---
  T.scatterCircle(ctx, caveX + caveW / 2, caveY + caveH / 2, caveW / 2 + 10, P.black, 0.2, 4);

  // --- Torch glow (if present) ---
  if (params.hasTorches) {
    T.scatterCircle(ctx, caveX - 15, 70, 25, P.yellow, 0.15, 4);
    T.scatterCircle(ctx, caveX + caveW + 10, 70, 25, P.yellow, 0.15, 4);
  }
}

// =========================================================================
//  Layer 5 — ATMOSPHERE: Ambient effects (scatter/scatterCircle/pixel only)
// =========================================================================

function _atmosphere(ctx, P, params) {
  if (params.timeOfDay === 'dawn') {
    // Cool morning mist with warm sunrise highlights
    T.scatter(ctx, 0, 0, 320, 140, P.light_green, 0.05, 4);
    T.scatter(ctx, 0, 0, 320, 50, P.yellow, 0.04, 4);
  } else if (params.timeOfDay === 'dusk') {
    // Warm dusk glow with cooler shadows
    T.scatter(ctx, 0, 0, 320, 140, P.red, 0.05, 4);
    T.scatter(ctx, 0, 50, 320, 90, P.dark_blue, 0.04, 4);
  } else {
    // Day — subtle green forest ambient
    T.scatter(ctx, 0, 0, 320, 140, P.green, 0.03, 4);
  }

  // --- Mist at ground level (forest fog) ---
  if (params.vegetation === 'dense') {
    T.scatter(ctx, 0, 110, 320, 30, P.white, 0.08, 4);
  } else if (params.vegetation === 'medium') {
    T.scatter(ctx, 0, 115, 320, 25, P.white, 0.05, 4);
  }

  // --- Fireflies (if dusk) ---
  if (params.timeOfDay === 'dusk') {
    for (let i = 0; i < 6; i++) {
      const fx = (i * 53 + 27) % 315;
      const fy = 70 + (i * 19) % 50;
      T.pixel(ctx, fx, fy, P.yellow);
    }
  }

  // --- Dust particles in cave entrance (if torches lit) ---
  if (params.hasTorches) {
    const caveX = params.caveSize === 'large' ? 100 : params.caveSize === 'medium' ? 120 : 130;
    const caveW = params.caveSize === 'large' ? 120 : params.caveSize === 'medium' ? 80 : 60;

    for (let i = 0; i < 5; i++) {
      const dx = caveX + 20 + (i * 17) % (caveW - 40);
      const dy = 50 + (i * 11) % 30;
      T.pixel(ctx, dx, dy, P.tan);
    }
  }
}
