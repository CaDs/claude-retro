/**
 * cantina.js — Sci-fi space cantina/bar room template.
 *
 * Generates a seedy bar interior with counter, stools, booths along walls,
 * neon signs, shelves with alien drinks, smoky atmosphere, and low lighting.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'scifi/cantina',
  name: 'Cantina',
  setting: 'scifi',
  category: 'interior',
  palette: 'ship_bridge',
  params: {
    neonColor: { type: 'enum', options: ['cyan', 'orange', 'yellow'], default: 'cyan', label: 'Neon Signs' },
    boothCount: { type: 'enum', options: ['2', '3', '4'], default: '3', label: 'Booths' },
    crowdLevel: { type: 'enum', options: ['empty', 'sparse', 'busy'], default: 'sparse', label: 'Crowd' },
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
//  Layer 1 (BASE): Ceiling, walls, floor
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  // --- Ceiling (rows 0-12) ---
  // Dark, low ceiling with ventilation ducts
  T.rect(ctx, 0, 0, 320, 12, P.black);

  // Ceiling panels with metal ribbing
  for (let x = 0; x < 320; x += 32) {
    T.rect(ctx, x, 0, 1, 12, P.dark_gray);
  }

  // Horizontal duct lines
  T.rect(ctx, 0, 3, 320, 1, P.dark_gray);
  T.rect(ctx, 0, 7, 320, 1, P.dark_gray);

  // Subtle ceiling texture
  T.dither(ctx, 0, 0, 320, 12, P.black, P.dark_gray, 0.1, 4);

  // --- Back Wall (rows 12-55) ---
  // Dark industrial wall with panels
  T.rect(ctx, 0, 12, 320, 43, P.dark_blue);

  // Wall panel grid — large square panels
  for (let x = 0; x < 320; x += 40) {
    T.rect(ctx, x, 12, 1, 43, P.dark_gray);
  }
  for (let y = 12; y < 55; y += 14) {
    T.rect(ctx, 0, y, 320, 1, P.dark_gray);
  }

  // Wall texture — metallic dither
  T.dither(ctx, 0, 12, 320, 43, P.dark_blue, P.black, 0.15, 4);

  // Top trim strip
  T.rect(ctx, 0, 12, 320, 1, P.gray);

  // Bottom wall trim
  T.rect(ctx, 0, 54, 320, 1, P.dark_gray);

  // --- Floor (rows 55-140) ---
  // Dark metal floor tiles
  T.rect(ctx, 0, 55, 320, 85, P.dark_gray);

  // Floor tile grid pattern
  for (let y = 55; y < 140; y += 8) {
    T.rect(ctx, 0, y, 320, 1, P.black);
  }

  for (let x = 0; x < 320; x += 16) {
    T.rect(ctx, x, 55, 1, 85, P.black);
  }

  // Dithered floor texture
  T.dither(ctx, 0, 55, 320, 85, P.dark_gray, P.black, 0.25, 4);

  // Worn path in center (darker, more traffic)
  T.rect(ctx, 120, 55, 80, 85, T.darken(P.dark_gray, 15));
  T.dither(ctx, 120, 55, 80, 85, T.darken(P.dark_gray, 15), P.black, 0.3, 4);
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Bar counter, stools, booths, shelves, door
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- Bar counter (center-back) ---
  _drawBarCounter(ctx, P);

  // --- Bar stools ---
  _drawBarStools(ctx, P);

  // --- Booths along walls ---
  const boothCount = parseInt(params.boothCount) || 3;
  _drawBooths(ctx, P, boothCount);

  // --- Shelves behind bar ---
  _drawBarShelves(ctx, P);

  // --- Entry door (right side) ---
  _drawEntryDoor(ctx, P);

  // --- Ventilation fan (left wall) ---
  _drawVentFan(ctx, P);
}

function _drawBarCounter(ctx, P) {
  const barX = 70;
  const barY = 48;
  const barW = 180;
  const barH = 24;

  // Bar top surface
  T.rect(ctx, barX, barY, barW, 3, P.gray);
  T.dither(ctx, barX, barY, barW, 3, P.gray, P.light_gray, 0.2, 4);

  // Bar front face — metallic panels
  T.rect(ctx, barX, barY + 3, barW, barH - 3, P.dark_gray);
  T.dither(ctx, barX, barY + 3, barW, barH - 3, P.dark_gray, P.black, 0.2, 4);

  // Panel dividers on bar front
  for (let x = barX + 20; x < barX + barW; x += 30) {
    T.rect(ctx, x, barY + 3, 1, barH - 3, P.black);
    T.rect(ctx, x + 1, barY + 3, 1, barH - 3, P.gray);
  }

  // Bar footrail strip
  T.rect(ctx, barX, barY + barH - 2, barW, 2, P.gray);

  // Bar edge highlights
  T.rect(ctx, barX, barY, barW, 1, P.light_gray);
  T.rect(ctx, barX, barY, 1, barH, P.black);
  T.rect(ctx, barX + barW - 1, barY, 1, barH, P.black);
}

function _drawBarStools(ctx, P) {
  const stoolPositions = [90, 130, 170, 210];

  for (const x of stoolPositions) {
    _drawStool(ctx, P, x, 72);
  }
}

function _drawStool(ctx, P, x, y) {
  // Seat — circular top
  T.circleFill(ctx, x, y, 5, P.gray);
  T.circleFill(ctx, x, y, 4, P.dark_gray);

  // Central post
  T.rect(ctx, x - 1, y + 5, 3, 8, P.dark_gray);

  // Base ring
  T.rect(ctx, x - 4, y + 13, 9, 2, P.gray);

  // Seat highlight
  T.pixel(ctx, x - 2, y - 2, P.light_gray);
}

function _drawBooths(ctx, P, count) {
  // Left wall booths
  for (let i = 0; i < count; i++) {
    const boothY = 20 + i * 32;
    _drawBooth(ctx, P, 4, boothY, 'left');
  }

  // Right wall booths
  const rightCount = Math.max(1, count - 1);
  for (let i = 0; i < rightCount; i++) {
    const boothY = 20 + i * 32;
    _drawBooth(ctx, P, 280, boothY, 'right');
  }
}

function _drawBooth(ctx, P, x, y, side) {
  const w = 32;
  const h = 24;
  const seatH = 6;

  if (side === 'left') {
    // Left-side booth (opening faces right)

    // Backrest (against wall)
    T.rect(ctx, x, y, 4, h, P.blue);
    T.dither(ctx, x, y, 4, h, P.blue, P.dark_blue, 0.2, 4);

    // Side panels
    T.rect(ctx, x + 4, y, 3, h, P.blue);
    T.rect(ctx, x + 4, y + h - 1, w - 4, 3, P.blue);

    // Seat cushion
    T.rect(ctx, x + 4, y + h - seatH, w - 4, seatH, P.mid_blue);
    T.dither(ctx, x + 4, y + h - seatH, w - 4, seatH, P.mid_blue, P.blue, 0.15, 4);

    // Table in front of booth
    T.rect(ctx, x + w - 2, y + 10, 16, 12, P.dark_gray);
    T.rect(ctx, x + w - 1, y + 11, 14, 2, P.gray);
  } else {
    // Right-side booth (opening faces left)

    // Backrest (against wall)
    T.rect(ctx, x + w - 4, y, 4, h, P.blue);
    T.dither(ctx, x + w - 4, y, 4, h, P.blue, P.dark_blue, 0.2, 4);

    // Side panels
    T.rect(ctx, x + w - 7, y, 3, h, P.blue);
    T.rect(ctx, x, y + h - 1, w - 4, 3, P.blue);

    // Seat cushion
    T.rect(ctx, x, y + h - seatH, w - 4, seatH, P.mid_blue);
    T.dither(ctx, x, y + h - seatH, w - 4, seatH, P.mid_blue, P.blue, 0.15, 4);

    // Table in front of booth
    T.rect(ctx, x - 14, y + 10, 16, 12, P.dark_gray);
    T.rect(ctx, x - 13, y + 11, 14, 2, P.gray);
  }
}

function _drawBarShelves(ctx, P) {
  const shelfX = 80;
  const shelfW = 160;

  // Three shelf levels behind bar
  const shelfY1 = 15;
  const shelfY2 = 23;
  const shelfY3 = 31;

  for (const sy of [shelfY1, shelfY2, shelfY3]) {
    // Shelf surface
    T.rect(ctx, shelfX, sy, shelfW, 2, P.dark_gray);
    T.rect(ctx, shelfX, sy, shelfW, 1, P.gray);

    // Shelf brackets
    T.rect(ctx, shelfX, sy, 2, 6, P.dark_gray);
    T.rect(ctx, shelfX + shelfW - 2, sy, 2, 6, P.dark_gray);
  }

  // Bottles on shelves (colored rectangles)
  _drawBottle(ctx, P, 90, shelfY1 - 6, P.orange);
  _drawBottle(ctx, P, 105, shelfY1 - 8, P.cyan);
  _drawBottle(ctx, P, 120, shelfY1 - 6, P.yellow);
  _drawBottle(ctx, P, 135, shelfY1 - 7, P.bright_cyan);
  _drawBottle(ctx, P, 150, shelfY1 - 6, P.blue);
  _drawBottle(ctx, P, 165, shelfY1 - 8, P.orange);
  _drawBottle(ctx, P, 180, shelfY1 - 6, P.yellow);
  _drawBottle(ctx, P, 195, shelfY1 - 7, P.cyan);
  _drawBottle(ctx, P, 210, shelfY1 - 6, P.bright_cyan);

  _drawBottle(ctx, P, 95, shelfY2 - 7, P.yellow);
  _drawBottle(ctx, P, 110, shelfY2 - 6, P.cyan);
  _drawBottle(ctx, P, 125, shelfY2 - 8, P.orange);
  _drawBottle(ctx, P, 140, shelfY2 - 6, P.blue);
  _drawBottle(ctx, P, 155, shelfY2 - 7, P.bright_cyan);
  _drawBottle(ctx, P, 170, shelfY2 - 6, P.yellow);
  _drawBottle(ctx, P, 185, shelfY2 - 8, P.cyan);
  _drawBottle(ctx, P, 200, shelfY2 - 6, P.orange);
  _drawBottle(ctx, P, 215, shelfY2 - 7, P.blue);

  _drawBottle(ctx, P, 100, shelfY3 - 6, P.cyan);
  _drawBottle(ctx, P, 115, shelfY3 - 7, P.yellow);
  _drawBottle(ctx, P, 130, shelfY3 - 6, P.bright_cyan);
  _drawBottle(ctx, P, 145, shelfY3 - 8, P.orange);
  _drawBottle(ctx, P, 160, shelfY3 - 6, P.blue);
  _drawBottle(ctx, P, 175, shelfY3 - 7, P.yellow);
  _drawBottle(ctx, P, 190, shelfY3 - 6, P.cyan);
  _drawBottle(ctx, P, 205, shelfY3 - 8, P.orange);
}

function _drawBottle(ctx, P, x, y, color) {
  // Bottle body — narrow rectangle
  T.rect(ctx, x, y, 3, 6, color);

  // Bottle neck
  T.rect(ctx, x + 1, y - 2, 1, 2, color);

  // Glint highlight
  T.pixel(ctx, x, y, P.white);
}

function _drawEntryDoor(ctx, P) {
  const doorX = 280;
  const doorY = 24;
  const doorW = 24;
  const doorH = 30;

  // Door frame
  T.rect(ctx, doorX, doorY, doorW, doorH, P.dark_gray);
  T.rect(ctx, doorX + 1, doorY + 1, doorW - 2, doorH - 2, P.gray);

  // Door panels (double sliding door seam)
  const halfW = Math.floor(doorW / 2) - 1;
  T.rect(ctx, doorX + 2, doorY + 2, halfW, doorH - 4, P.gray);
  T.rect(ctx, doorX + 2 + halfW + 2, doorY + 2, halfW, doorH - 4, P.gray);

  // Center seam
  T.rect(ctx, doorX + halfW + 1, doorY + 2, 2, doorH - 4, P.black);

  // Panel texture
  T.dither(ctx, doorX + 2, doorY + 2, halfW, doorH - 4, P.gray, P.dark_gray, 0.15, 4);
  T.dither(ctx, doorX + 2 + halfW + 2, doorY + 2, halfW, doorH - 4, P.gray, P.dark_gray, 0.15, 4);

  // Access panel light
  T.rect(ctx, doorX - 6, doorY + 10, 4, 6, P.black);
  T.rect(ctx, doorX - 5, doorY + 11, 2, 4, P.cyan);
}

function _drawVentFan(ctx, P) {
  const fanX = 12;
  const fanY = 30;
  const fanR = 8;

  // Fan housing — circular frame
  T.circleFill(ctx, fanX, fanY, fanR, P.black);
  T.circleFill(ctx, fanX, fanY, fanR - 1, P.dark_gray);

  // Fan blades (simple cross pattern)
  T.line(ctx, fanX - 5, fanY, fanX + 5, fanY, P.gray);
  T.line(ctx, fanX, fanY - 5, fanX, fanY + 5, P.gray);
  T.line(ctx, fanX - 4, fanY - 4, fanX + 4, fanY + 4, P.gray);
  T.line(ctx, fanX - 4, fanY + 4, fanX + 4, fanY - 4, P.gray);

  // Center hub
  T.circleFill(ctx, fanX, fanY, 2, P.dark_gray);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Neon signs, glass racks, lights, decorations
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  const neonColor = params.neonColor || 'cyan';
  const neonColorCode = (neonColor === 'cyan') ? P.cyan :
                        (neonColor === 'orange') ? P.orange : P.yellow;

  // --- Main neon sign above bar ---
  _drawNeonSign(ctx, P, 130, 16, neonColorCode);

  // --- Smaller neon accent (left wall) ---
  _drawSmallNeon(ctx, P, 20, 18, neonColorCode);

  // --- Ceiling strip lights ---
  _drawCeilingLights(ctx, P);

  // --- Glasses and mugs on bar counter ---
  _drawGlassware(ctx, P);

  // --- Small plants or decor on tables ---
  _drawTableDecor(ctx, P, params);

  // --- Wall posters / screens ---
  _drawWallScreens(ctx, P);

  // --- Bar taps / dispensers ---
  _drawBarTaps(ctx, P);
}

function _drawNeonSign(ctx, P, x, y, color) {
  // Simplified neon text: "BAR"
  // B
  T.rect(ctx, x, y, 1, 7, color);
  T.rect(ctx, x, y, 4, 1, color);
  T.rect(ctx, x, y + 3, 4, 1, color);
  T.rect(ctx, x, y + 6, 4, 1, color);
  T.rect(ctx, x + 4, y, 1, 7, color);

  // A
  T.rect(ctx, x + 8, y + 1, 1, 6, color);
  T.rect(ctx, x + 9, y, 3, 1, color);
  T.rect(ctx, x + 9, y + 3, 3, 1, color);
  T.rect(ctx, x + 12, y + 1, 1, 6, color);

  // R
  T.rect(ctx, x + 16, y, 1, 7, color);
  T.rect(ctx, x + 16, y, 4, 1, color);
  T.rect(ctx, x + 16, y + 3, 4, 1, color);
  T.rect(ctx, x + 20, y, 1, 3, color);
  T.line(ctx, x + 19, y + 4, x + 20, y + 6, color);
}

function _drawSmallNeon(ctx, P, x, y, color) {
  // Small vertical neon strip
  for (let i = 0; i < 12; i += 3) {
    T.rect(ctx, x, y + i, 3, 2, color);
  }
}

function _drawCeilingLights(ctx, P) {
  const lightPositions = [40, 100, 160, 220, 280];

  for (const x of lightPositions) {
    // Recessed light fixture
    T.rect(ctx, x - 4, 2, 8, 4, P.black);
    T.rect(ctx, x - 3, 3, 6, 2, P.yellow);

    // Fixture frame
    T.rect(ctx, x - 4, 2, 8, 1, P.dark_gray);
    T.rect(ctx, x - 4, 6, 8, 1, P.dark_gray);
  }
}

function _drawGlassware(ctx, P) {
  // Glasses on bar counter
  _drawGlass(ctx, P, 85, 50, P.cyan);
  _drawGlass(ctx, P, 115, 50, P.light_blue);
  _drawGlass(ctx, P, 145, 50, P.cyan);
  _drawGlass(ctx, P, 185, 50, P.light_blue);
  _drawGlass(ctx, P, 220, 50, P.cyan);

  // Mug
  _drawMug(ctx, P, 155, 50);
  _drawMug(ctx, P, 200, 50);
}

function _drawGlass(ctx, P, x, y, liquidColor) {
  // Glass body
  T.rect(ctx, x, y, 3, 4, P.dark_blue);

  // Liquid inside
  T.rect(ctx, x, y + 2, 3, 2, liquidColor);

  // Glass highlight
  T.pixel(ctx, x, y, P.white);
}

function _drawMug(ctx, P, x, y) {
  // Mug body
  T.rect(ctx, x, y, 4, 4, P.gray);
  T.rect(ctx, x + 1, y + 1, 2, 2, P.dark_gray);

  // Handle
  T.pixel(ctx, x + 4, y + 1, P.gray);
  T.pixel(ctx, x + 4, y + 2, P.gray);
}

function _drawTableDecor(ctx, P, params) {
  const crowdLevel = params.crowdLevel || 'sparse';

  if (crowdLevel !== 'empty') {
    // Small candle lights on booth tables
    _drawCandle(ctx, P, 45, 32);
    _drawCandle(ctx, P, 265, 32);

    if (crowdLevel === 'busy') {
      _drawCandle(ctx, P, 45, 64);
      _drawCandle(ctx, P, 265, 64);
    }
  }
}

function _drawCandle(ctx, P, x, y) {
  // Candle holder
  T.rect(ctx, x, y, 3, 2, P.dark_gray);

  // Flame
  T.pixel(ctx, x + 1, y - 1, P.yellow);
  T.pixel(ctx, x + 1, y - 2, P.orange);
}

function _drawWallScreens(ctx, P) {
  // Info screen (left wall, upper)
  T.rect(ctx, 24, 14, 12, 8, P.black);
  T.rect(ctx, 25, 15, 10, 6, P.dark_blue);

  // Screen content — simple lines
  T.rect(ctx, 26, 16, 6, 1, P.cyan);
  T.rect(ctx, 26, 18, 8, 1, P.cyan);

  // Poster/screen (right wall)
  T.rect(ctx, 266, 16, 10, 14, P.dark_gray);
  T.rect(ctx, 267, 17, 8, 12, P.orange);
  T.dither(ctx, 267, 17, 8, 12, P.orange, P.dark_red, 0.3, 4);
}

function _drawBarTaps(ctx, P) {
  // Beer/drink taps behind bar counter
  const tapPositions = [100, 120, 140, 160, 180, 200];

  for (const tx of tapPositions) {
    // Tap handle
    T.rect(ctx, tx, 44, 2, 3, P.gray);
    T.pixel(ctx, tx, 43, P.light_gray);
  }
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Bar glow, neon spill, booth shadows, ambient darkness
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  const neonColor = params.neonColor || 'cyan';
  const neonColorCode = (neonColor === 'cyan') ? P.cyan :
                        (neonColor === 'orange') ? P.orange : P.yellow;

  // --- Neon sign glow onto wall and bar ---
  T.scatterCircle(ctx, 150, 16, 50, neonColorCode, 0.15);
  T.scatterCircle(ctx, 150, 35, 40, neonColorCode, 0.08);

  // --- Small neon glow (left wall) ---
  T.scatterCircle(ctx, 20, 24, 25, neonColorCode, 0.12);

  // --- Ceiling light pools on floor ---
  T.scatterCircle(ctx, 40, 85, 30, P.yellow, 0.08);
  T.scatterCircle(ctx, 100, 90, 30, P.yellow, 0.08);
  T.scatterCircle(ctx, 160, 95, 35, P.yellow, 0.1);
  T.scatterCircle(ctx, 220, 90, 30, P.yellow, 0.08);
  T.scatterCircle(ctx, 280, 85, 30, P.yellow, 0.08);

  // --- Bar counter shadow on floor ---
  T.scatter(ctx, 70, 72, 180, 12, P.black, 0.25);

  // --- Booth shadows ---
  T.scatter(ctx, 4, 40, 40, 15, P.black, 0.2);
  T.scatter(ctx, 276, 40, 40, 15, P.black, 0.2);

  // --- Stool shadows ---
  T.scatterCircle(ctx, 90, 82, 8, P.black, 0.15);
  T.scatterCircle(ctx, 130, 82, 8, P.black, 0.15);
  T.scatterCircle(ctx, 170, 82, 8, P.black, 0.15);
  T.scatterCircle(ctx, 210, 82, 8, P.black, 0.15);

  // --- General floor darkness gradient (edges darker) ---
  T.scatter(ctx, 0, 100, 60, 40, P.black, 0.15);
  T.scatter(ctx, 260, 100, 60, 40, P.black, 0.15);

  // --- Ceiling shadow (depth) ---
  T.scatter(ctx, 0, 0, 320, 10, P.black, 0.2);

  // --- Door area shadow ---
  T.scatter(ctx, 280, 54, 40, 30, P.black, 0.12);

  // --- Vent fan shadow ---
  T.scatterCircle(ctx, 12, 30, 12, P.black, 0.18);

  // --- Under-shelf shadows ---
  T.scatter(ctx, 80, 21, 160, 3, P.black, 0.2);
  T.scatter(ctx, 80, 29, 160, 3, P.black, 0.2);
  T.scatter(ctx, 80, 37, 160, 3, P.black, 0.2);
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Smoke/haze, neon ambient wash, dust motes
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  const neonColor = params.neonColor || 'cyan';
  const neonColorCode = (neonColor === 'cyan') ? P.cyan :
                        (neonColor === 'orange') ? P.orange : P.yellow;
  const crowdLevel = params.crowdLevel || 'sparse';

  // --- Overall low-light dingy atmosphere ---
  T.scatter(ctx, 0, 0, 320, 140, P.black, 0.15);

  // --- Neon color wash across upper room ---
  T.scatter(ctx, 0, 12, 320, 50, neonColorCode, 0.04);
  T.scatterCircle(ctx, 150, 20, 80, neonColorCode, 0.06);

  // --- Smoke/haze layers (more if crowded) ---
  const smokeIntensity = (crowdLevel === 'busy') ? 0.12 :
                         (crowdLevel === 'sparse') ? 0.08 : 0.05;

  // Upper haze band
  T.scatter(ctx, 0, 20, 320, 30, P.light_gray, smokeIntensity);

  // Mid-room haze pockets
  T.scatterCircle(ctx, 60, 60, 40, P.pale_gray, smokeIntensity * 0.7);
  T.scatterCircle(ctx, 180, 70, 50, P.pale_gray, smokeIntensity * 0.7);
  T.scatterCircle(ctx, 260, 65, 35, P.pale_gray, smokeIntensity * 0.7);

  // Lower smoke drift
  T.scatter(ctx, 0, 80, 320, 40, P.gray, smokeIntensity * 0.5);

  // --- Dust motes / particles in light beams ---
  const motePositions = [
    [42, 45], [38, 55], [44, 62], [98, 48], [102, 58], [95, 68],
    [158, 50], [162, 60], [156, 72], [218, 52], [222, 63], [216, 75],
    [278, 46], [282, 56], [285, 67],
  ];

  for (const [mx, my] of motePositions) {
    T.pixel(ctx, mx, my, P.pale_gray);
  }

  // --- Neon glow particles floating near signs ---
  T.pixel(ctx, 135, 22, neonColorCode);
  T.pixel(ctx, 148, 18, neonColorCode);
  T.pixel(ctx, 162, 24, neonColorCode);
  T.pixel(ctx, 22, 26, neonColorCode);
  T.pixel(ctx, 18, 32, neonColorCode);

  // --- Candle flicker glow (if present) ---
  if (crowdLevel !== 'empty') {
    T.scatterCircle(ctx, 45, 32, 8, P.orange, 0.08);
    T.scatterCircle(ctx, 265, 32, 8, P.orange, 0.08);

    if (crowdLevel === 'busy') {
      T.scatterCircle(ctx, 45, 64, 8, P.orange, 0.08);
      T.scatterCircle(ctx, 265, 64, 8, P.orange, 0.08);
    }
  }

  // --- Corner vignette (darken edges) ---
  T.scatter(ctx, 0, 0, 30, 40, P.black, 0.1);
  T.scatter(ctx, 290, 0, 30, 40, P.black, 0.1);
  T.scatter(ctx, 0, 100, 40, 40, P.black, 0.1);
  T.scatter(ctx, 280, 100, 40, 40, P.black, 0.1);
}
