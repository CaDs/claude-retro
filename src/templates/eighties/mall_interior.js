/**
 * mall_interior.js — 80s shopping mall interior room template.
 *
 * Generates a bright, glossy mall concourse with shiny tiled floors, store fronts,
 * neon signage, potted palms, fountain, food court seating, and overhead skylights.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';
import { drawSkyBands } from '../_base.js';

export const metadata = {
  id: 'eighties/mall_interior',
  name: 'Mall Interior',
  setting: 'eighties',
  category: 'interior',
  palette: 'mall_bright',
  params: {
    hasStorefronts: { type: 'boolean', default: true, label: 'Store Fronts' },
    hasFountain: { type: 'boolean', default: true, label: 'Fountain' },
    hasPalms: { type: 'boolean', default: true, label: 'Potted Palms' },
    skylight: { type: 'enum', options: ['bright', 'normal', 'dim'], default: 'normal', label: 'Skylight' },
  },
};

export function generate(ctx, P, params) {
  _base(ctx, P, params);
  _structures(ctx, P, params);
  _details(ctx, P, params);
  _shading(ctx, P, params);
  _atmosphere(ctx, P, params);
}

// ---------------------------------------------------------------------------
//  Layer 1 (BASE): Ceiling with skylights, walls, glossy tiled floor
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  const isBright = params.skylight === 'bright';
  const isDim = params.skylight === 'dim';

  // --- Ceiling (rows 0-18) ---
  const ceilColor = isDim ? P.light_gray : P.off_white;
  const ceilTileColor = P.white;

  T.rect(ctx, 0, 0, 320, 18, ceilColor);

  // Skylight panels — glass and aluminum frames
  for (let x = 20; x < 320; x += 60) {
    const panelW = 40;
    // Frame
    T.rect(ctx, x, 0, panelW, 12, P.light_gray);
    // Glass center
    T.rect(ctx, x + 2, 0, panelW - 4, 10, isBright ? P.white : P.off_white);
    T.dither(ctx, x + 2, 0, panelW - 4, 10, isBright ? P.white : P.off_white, P.pale_pink, 0.1, 4);
    // Frame dividers
    T.rect(ctx, x + Math.floor(panelW / 2), 0, 1, 12, P.gray);
  }

  // Ceiling tile grid beyond skylights
  for (let x = 0; x < 320; x += 40) {
    T.rect(ctx, x, 12, 1, 6, P.gray);
  }
  T.rect(ctx, 0, 12, 320, 1, P.gray);
  T.rect(ctx, 0, 17, 320, 1, P.light_gray);

  // --- Walls (rows 18-65) ---
  T.rect(ctx, 0, 18, 320, 47, P.off_white);
  T.dither(ctx, 0, 18, 320, 47, P.off_white, P.white, 0.1, 4);

  // Upper wall trim — colorful accent stripe
  T.rect(ctx, 0, 18, 320, 2, P.pink);
  T.rect(ctx, 0, 20, 320, 1, P.blue);

  // Lower wall baseboard
  T.rect(ctx, 0, 64, 320, 1, P.gray);
  T.rect(ctx, 0, 65, 320, 1, P.light_gray);

  // Wall panel vertical dividers
  for (let x = 70; x < 320; x += 70) {
    T.rect(ctx, x, 22, 1, 43, P.light_gray);
    T.rect(ctx, x + 1, 22, 1, 43, P.white);
  }

  // --- Tiled floor (rows 66-140) ---
  T.rect(ctx, 0, 66, 320, 74, P.white);

  // Tile grid — alternating light_gray and white tiles
  const tileSize = 16;
  const floorRows = Math.ceil(74 / tileSize);
  const floorCols = Math.ceil(320 / tileSize);

  for (let r = 0; r < floorRows; r++) {
    for (let c = 0; c < floorCols; c++) {
      const tx = c * tileSize;
      const ty = 66 + r * tileSize;
      const tileColor = ((r + c) % 2 === 0) ? P.white : P.off_white;
      T.rect(ctx, tx, ty, tileSize, tileSize, tileColor);
    }
  }

  // Grout lines between tiles
  for (let x = 0; x <= 320; x += tileSize) {
    T.rect(ctx, x, 66, 1, 74, P.light_gray);
  }
  for (let y = 66; y <= 140; y += tileSize) {
    T.rect(ctx, 0, y, 320, 1, P.light_gray);
  }

  // Floor reflections — subtle scatter for glossy effect
  T.dither(ctx, 0, 66, 320, 74, P.white, P.pale_pink, 0.05, 4);
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Store fronts, fountain, planters, benches
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- Store fronts on back wall ---
  if (params.hasStorefronts) {
    _drawStoreFronts(ctx, P);
  }

  // --- Fountain centerpiece ---
  if (params.hasFountain) {
    _drawFountain(ctx, P);
  }

  // --- Potted palms / planters ---
  if (params.hasPalms) {
    _drawPlantPots(ctx, P);
  }

  // --- Food court seating area ---
  _drawFoodCourtSeating(ctx, P);

  // --- Escalator ---
  _drawEscalator(ctx, P);
}

function _drawStoreFronts(ctx, P) {
  // Three store fronts — left, center, right
  const stores = [
    { x: 8, w: 56, name: 'RECORDS' },
    { x: 120, w: 72, name: 'FASHION' },
    { x: 242, w: 64, name: 'ARCADE' },
  ];

  for (const store of stores) {
    const sx = store.x;
    const sy = 24;
    const sw = store.w;
    const sh = 40;

    // Store frame
    T.rect(ctx, sx, sy, sw, sh, P.dark_gray);

    // Glass window front
    T.rect(ctx, sx + 2, sy + 2, sw - 4, sh - 4, P.blue);
    T.dither(ctx, sx + 2, sy + 2, sw - 4, sh - 4, P.blue, P.dark_blue, 0.2, 4);

    // Store signage above
    const signY = sy - 4;
    T.rect(ctx, sx + 4, signY, sw - 8, 3, P.pink);
    T.rect(ctx, sx + 5, signY + 1, sw - 10, 1, P.white);

    // Display items visible through window
    const itemY = sy + 10;
    // Row of products
    for (let ix = sx + 8; ix < sx + sw - 8; ix += 12) {
      const itemColor = [P.red, P.yellow, P.green, P.pink][Math.floor((ix / 12) % 4)];
      T.rect(ctx, ix, itemY, 8, 12, itemColor);
      T.pixel(ctx, ix + 1, itemY + 1, T.lighten(itemColor, 30));
    }

    // Door on right side
    T.rect(ctx, sx + sw - 16, sy + 4, 12, sh - 8, P.dark_gray);
    T.rect(ctx, sx + sw - 15, sy + 5, 10, sh - 10, P.gray);
    // Door handle
    T.rect(ctx, sx + sw - 8, sy + Math.floor(sh / 2), 2, 3, P.yellow);

    // Security gate tracks (partial gate)
    T.rect(ctx, sx, sy + sh - 2, sw, 2, P.dark_gray);
  }
}

function _drawFountain(ctx, P) {
  const fx = 145;
  const fy = 86;
  const fr = 25;

  // Fountain basin — circular outer rim
  T.circleFill(ctx, fx, fy, fr, P.gray);
  T.circleFill(ctx, fx, fy, fr - 2, P.white);

  // Water pool
  T.circleFill(ctx, fx, fy, fr - 4, P.blue);
  T.dither(ctx, fx - fr + 4, fy - fr + 4, (fr - 4) * 2, (fr - 4) * 2, P.blue, P.dark_blue, 0.15, 4);

  // Center pedestal
  T.circleFill(ctx, fx, fy, 8, P.light_gray);
  T.circleFill(ctx, fx, fy, 6, P.white);

  // Water spouts (top of pedestal)
  T.pixel(ctx, fx, fy - 7, P.pale_pink);
  T.pixel(ctx, fx - 1, fy - 7, P.pale_pink);
  T.pixel(ctx, fx + 1, fy - 7, P.pale_pink);

  // Fountain coins at bottom
  T.pixel(ctx, fx - 8, fy + 6, P.yellow);
  T.pixel(ctx, fx + 5, fy + 4, P.yellow);
  T.pixel(ctx, fx - 3, fy + 8, P.yellow);
  T.pixel(ctx, fx + 10, fy + 2, P.yellow);
}

function _drawPlantPots(ctx, P) {
  const pots = [
    { x: 30, y: 95 },
    { x: 260, y: 100 },
    { x: 80, y: 125 },
  ];

  for (const pot of pots) {
    const px = pot.x;
    const py = pot.y;

    // Pot body — trapezoid shape
    T.polygonFill(ctx, [
      [px - 6, py],
      [px + 6, py],
      [px + 8, py + 12],
      [px - 8, py + 12],
    ], P.tan);
    T.dither(ctx, px - 8, py, 16, 12, P.tan, P.brown, 0.15, 4);

    // Pot rim
    T.rect(ctx, px - 7, py - 1, 14, 2, P.brown);

    // Palm fronds — simple radiating lines from center
    const frondCount = 7;
    for (let f = 0; f < frondCount; f++) {
      const angle = (f / frondCount) * Math.PI - Math.PI / 2;
      const frondLen = 10 + (f % 3) * 3;
      const fx = px + Math.floor(Math.cos(angle) * frondLen);
      const fy = py - 8 + Math.floor(Math.sin(angle) * frondLen);
      T.line(ctx, px, py - 8, fx, fy, P.green);
      // Frond leaves
      T.pixel(ctx, fx - 1, fy, P.green);
      T.pixel(ctx, fx + 1, fy, P.green);
    }

    // Trunk
    T.rect(ctx, px - 1, py - 8, 2, 8, P.brown);
  }
}

function _drawFoodCourtSeating(ctx, P) {
  // Small seating area — two tables with chairs
  const tables = [
    { x: 200, y: 115 },
    { x: 240, y: 120 },
  ];

  for (const table of tables) {
    const tx = table.x;
    const ty = table.y;

    // Table top
    T.rect(ctx, tx, ty, 14, 10, P.white);
    T.rect(ctx, tx + 1, ty + 1, 12, 8, P.light_gray);

    // Table leg (center support)
    T.rect(ctx, tx + 6, ty + 10, 2, 4, P.gray);

    // Chairs — two per table (left and right)
    // Left chair
    T.rect(ctx, tx - 6, ty + 2, 5, 6, P.red);
    T.rect(ctx, tx - 6, ty, 5, 2, P.red); // backrest
    // Right chair
    T.rect(ctx, tx + 15, ty + 2, 5, 6, P.red);
    T.rect(ctx, tx + 15, ty, 5, 2, P.red); // backrest

    // Tray/food on table
    T.rect(ctx, tx + 3, ty + 3, 4, 3, P.yellow);
    T.pixel(ctx, tx + 9, ty + 4, P.brown);
  }
}

function _drawEscalator(ctx, P) {
  const ex = 10;
  const ey = 65;

  // Escalator side panels — angled
  T.polygonFill(ctx, [
    [ex, ey],
    [ex + 50, ey + 35],
    [ex + 50, ey + 40],
    [ex, ey + 10],
  ], P.dark_gray);

  T.polygonFill(ctx, [
    [ex + 8, ey],
    [ex + 58, ey + 35],
    [ex + 58, ey + 40],
    [ex + 8, ey + 10],
  ], P.dark_gray);

  // Escalator steps — angled rectangles
  for (let s = 0; s < 8; s++) {
    const sx = ex + 4 + s * 6;
    const sy = ey + 2 + s * 4;
    T.rect(ctx, sx, sy, 8, 2, P.gray);
    T.pixel(ctx, sx + 1, sy, P.light_gray);
  }

  // Handrails
  T.line(ctx, ex + 1, ey + 1, ex + 51, ey + 36, P.black);
  T.line(ctx, ex + 7, ey + 1, ex + 57, ey + 36, P.black);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Neon store signs, directory kiosk, trash bins, details
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Neon store signs ---
  _drawNeonSigns(ctx, P);

  // --- Mall directory kiosk ---
  _drawDirectoryKiosk(ctx, P);

  // --- Trash receptacles ---
  _drawTrashBins(ctx, P);

  // --- Overhead banners / decorations ---
  _drawBanners(ctx, P);

  // --- Pay phone booth ---
  _drawPayPhone(ctx, P);

  // --- Floor details ---
  // Scattered debris
  T.pixel(ctx, 55, 120, P.gray);
  T.pixel(ctx, 175, 128, P.tan);
  T.pixel(ctx, 290, 115, P.light_gray);

  // Wet floor sign
  T.rect(ctx, 100, 110, 6, 8, P.yellow);
  T.rect(ctx, 101, 111, 4, 6, P.black);
  T.rect(ctx, 102, 113, 2, 2, P.yellow);
}

function _drawNeonSigns(ctx, P) {
  // Sign above left store
  const s1x = 20;
  const s1y = 22;
  T.rect(ctx, s1x, s1y, 30, 5, P.pink);
  T.rect(ctx, s1x + 1, s1y + 1, 28, 3, P.white);
  T.rect(ctx, s1x + 3, s1y + 2, 24, 1, P.pink);

  // Sign above center store
  const s2x = 135;
  const s2y = 22;
  T.rect(ctx, s2x, s2y, 40, 5, P.blue);
  T.rect(ctx, s2x + 1, s2y + 1, 38, 3, P.white);
  T.rect(ctx, s2x + 3, s2y + 2, 34, 1, P.blue);

  // Sign above right store
  const s3x = 255;
  const s3y = 22;
  T.rect(ctx, s3x, s3y, 36, 5, P.green);
  T.rect(ctx, s3x + 1, s3y + 1, 34, 3, P.white);
  T.rect(ctx, s3x + 3, s3y + 2, 30, 1, P.green);
}

function _drawDirectoryKiosk(ctx, P) {
  const kx = 220;
  const ky = 90;

  // Kiosk stand
  T.rect(ctx, kx, ky, 16, 22, P.dark_gray);
  T.rect(ctx, kx + 1, ky + 1, 14, 20, P.gray);

  // Directory screen
  T.rect(ctx, kx + 2, ky + 2, 12, 14, P.black);
  T.rect(ctx, kx + 3, ky + 3, 10, 12, P.dark_blue);
  T.dither(ctx, kx + 3, ky + 3, 10, 12, P.dark_blue, P.blue, 0.2, 4);

  // Screen text lines
  for (let ly = ky + 5; ly < ky + 13; ly += 2) {
    T.rect(ctx, kx + 4, ly, 8, 1, P.white);
  }

  // "DIRECTORY" header
  T.rect(ctx, kx + 4, ky + 4, 8, 1, P.yellow);

  // Kiosk base
  T.rect(ctx, kx - 1, ky + 22, 18, 8, P.dark_gray);
  T.rect(ctx, kx, ky + 23, 16, 6, P.gray);
}

function _drawTrashBins(ctx, P) {
  const bins = [
    { x: 68, y: 108 },
    { x: 185, y: 118 },
  ];

  for (const bin of bins) {
    const bx = bin.x;
    const by = bin.y;

    // Bin body — cylinder
    T.rect(ctx, bx, by, 8, 12, P.tan);
    T.dither(ctx, bx, by, 8, 12, P.tan, P.brown, 0.15, 4);

    // Bin rim
    T.rect(ctx, bx - 1, by - 1, 10, 2, P.dark_gray);

    // Bin opening
    T.rect(ctx, bx + 2, by, 4, 1, P.black);

    // Trash visible inside
    T.pixel(ctx, bx + 3, by + 2, P.white);
    T.pixel(ctx, bx + 5, by + 3, P.yellow);
  }
}

function _drawBanners(ctx, P) {
  // Hanging banners from ceiling
  const banners = [
    { x: 40, color: P.pink },
    { x: 160, color: P.yellow },
    { x: 280, color: P.green },
  ];

  for (const banner of banners) {
    const bx = banner.x;
    const by = 10;
    const bh = 20;

    // Banner fabric
    T.rect(ctx, bx, by, 12, bh, banner.color);
    T.dither(ctx, bx, by, 12, bh, banner.color, T.darken(banner.color, 20), 0.1, 4);

    // Banner text/logo placeholder
    T.rect(ctx, bx + 2, by + 4, 8, 1, P.white);
    T.rect(ctx, bx + 3, by + 7, 6, 1, P.white);
    T.rect(ctx, bx + 4, by + 10, 4, 1, P.white);

    // Hanging cord
    T.rect(ctx, bx + 6, 0, 1, by, P.dark_gray);
  }
}

function _drawPayPhone(ctx, P) {
  const px = 295;
  const py = 68;

  // Phone booth enclosure — partial
  T.rect(ctx, px, py, 18, 28, P.dark_gray);
  T.rect(ctx, px + 1, py + 1, 16, 26, P.gray);

  // Phone unit
  T.rect(ctx, px + 3, py + 10, 12, 14, P.black);
  T.rect(ctx, px + 4, py + 11, 10, 12, P.dark_gray);

  // Keypad
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const kx = px + 5 + c * 3;
      const ky = py + 16 + r * 3;
      T.rect(ctx, kx, ky, 2, 2, P.light_gray);
    }
  }

  // Coin slot
  T.rect(ctx, px + 7, py + 12, 4, 2, P.black);

  // Handset cord
  T.pixel(ctx, px + 6, py + 22, P.dark_gray);
  T.pixel(ctx, px + 7, py + 23, P.dark_gray);
  T.pixel(ctx, px + 8, py + 22, P.dark_gray);

  // "PHONE" sign
  T.rect(ctx, px + 2, py + 4, 14, 4, P.blue);
  T.rect(ctx, px + 3, py + 5, 12, 2, P.white);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Floor reflections, shadows, fountain glints
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  const isBright = params.skylight === 'bright';
  const isDim = params.skylight === 'dim';

  // --- Skylight light pools on floor ---
  if (!isDim) {
    for (let x = 30; x < 320; x += 60) {
      const lightRadius = isBright ? 35 : 25;
      const lightIntensity = isBright ? 0.15 : 0.08;
      T.scatterCircle(ctx, x + 20, 90, lightRadius, P.white, lightIntensity);
    }
  }

  // --- Store front reflections on floor ---
  if (params.hasStorefronts) {
    T.scatterCircle(ctx, 35, 100, 30, P.pink, 0.04);
    T.scatterCircle(ctx, 155, 100, 35, P.blue, 0.05);
    T.scatterCircle(ctx, 275, 100, 30, P.green, 0.04);
  }

  // --- Fountain water sparkles ---
  if (params.hasFountain) {
    const fx = 145;
    const fy = 86;
    T.scatterCircle(ctx, fx, fy, 18, P.white, 0.12);
    T.scatterCircle(ctx, fx, fy, 25, P.pale_pink, 0.06);
  }

  // --- Plant pot shadows ---
  if (params.hasPalms) {
    T.scatter(ctx, 22, 107, 16, 6, P.black, 0.08);
    T.scatter(ctx, 252, 112, 16, 6, P.black, 0.08);
    T.scatter(ctx, 72, 137, 16, 4, P.black, 0.08);
  }

  // --- Food court table shadows ---
  T.scatter(ctx, 200, 125, 14, 4, P.black, 0.06);
  T.scatter(ctx, 240, 130, 14, 4, P.black, 0.06);

  // --- Escalator shadow ---
  T.scatter(ctx, 10, 75, 50, 30, P.black, 0.08);

  // --- General floor corner darkening ---
  T.scatter(ctx, 0, 66, 25, 74, P.black, 0.05);
  T.scatter(ctx, 295, 66, 25, 74, P.black, 0.05);
  T.scatter(ctx, 0, 120, 320, 20, P.black, 0.04);

  // --- Ceiling shadow near edges ---
  T.scatter(ctx, 0, 0, 320, 3, P.gray, 0.06);

  // --- Pay phone booth shadow ---
  T.scatter(ctx, 295, 96, 20, 6, P.black, 0.08);
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Ambient light wash, haze, glossy highlights
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  const isBright = params.skylight === 'bright';
  const isDim = params.skylight === 'dim';

  if (isDim) {
    // --- Dim lighting: cooler tones, less brightness ---
    T.scatter(ctx, 0, 0, 320, 140, P.gray, 0.08);
    T.scatter(ctx, 0, 18, 320, 122, P.dark_gray, 0.04);
  } else if (isBright) {
    // --- Bright lighting: intense white wash from skylights ---
    T.scatter(ctx, 0, 0, 320, 140, P.white, 0.06);
    T.scatter(ctx, 0, 0, 320, 65, P.pale_pink, 0.03);
  } else {
    // --- Normal lighting: pleasant warm mall ambience ---
    T.scatter(ctx, 0, 0, 320, 140, P.pale_pink, 0.04);
    T.scatter(ctx, 0, 0, 320, 65, P.white, 0.02);
  }

  // --- Neon sign glow halos ---
  if (params.hasStorefronts) {
    T.scatterCircle(ctx, 35, 23, 20, P.pink, 0.06);
    T.scatterCircle(ctx, 155, 23, 25, P.blue, 0.06);
    T.scatterCircle(ctx, 273, 23, 22, P.green, 0.06);
  }

  // --- Fountain mist atmosphere ---
  if (params.hasFountain) {
    const fx = 145;
    const fy = 86;
    T.scatterCircle(ctx, fx, fy, 35, P.pale_pink, 0.03);
    T.scatterCircle(ctx, fx, fy, 20, P.white, 0.04);
  }

  // --- Floor glossy highlights (scattered bright pixels for shine) ---
  const shinePositions = [
    [45, 80], [95, 75], [160, 78], [220, 82], [275, 76],
    [50, 105], [130, 100], [190, 110], [260, 108],
    [35, 130], [110, 125], [180, 135], [240, 132], [295, 128],
  ];

  for (const [sx, sy] of shinePositions) {
    T.pixel(ctx, sx, sy, P.white);
  }

  // --- Ambient haze particles (dust in sunbeams) ---
  if (!isDim) {
    const hazePositions = [
      [25, 35], [70, 40], [115, 32], [165, 38], [210, 34], [255, 42], [300, 36],
      [40, 50], [90, 55], [140, 48], [185, 52], [235, 46], [280, 54],
      [60, 28], [125, 25], [175, 30], [225, 27], [270, 31],
    ];

    for (const [hx, hy] of hazePositions) {
      T.pixel(ctx, hx, hy, P.white);
    }
  }

  // --- Vignette: subtle edge darkening for depth ---
  T.scatter(ctx, 0, 0, 20, 20, P.black, 0.04);
  T.scatter(ctx, 300, 0, 20, 20, P.black, 0.04);
  T.scatter(ctx, 0, 120, 20, 20, P.black, 0.04);
  T.scatter(ctx, 300, 120, 20, 20, P.black, 0.04);
}
