/**
 * subway_station.js — Contemporary subway station platform room template.
 *
 * Generates an underground subway platform with tiled walls, platform edge,
 * tracks below, columns, overhead signs, benches, and tunnel openings.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';
import { drawStoneWall } from '../_base.js';

export const metadata = {
  id: 'contemporary/subway_station',
  name: 'Subway Station',
  setting: 'contemporary',
  category: 'interior',
  palette: 'subway_dark',
  params: {
    hasBenches: { type: 'boolean', default: true, label: 'Benches' },
    hasTrash: { type: 'boolean', default: true, label: 'Trash Can' },
    trainSide: { type: 'enum', options: ['left', 'right', 'both'], default: 'right', label: 'Tunnel Side' },
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
//  Layer 1 (BASE): Ceiling, tiled walls, platform floor, tracks
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  // --- Ceiling (rows 0-18) ---
  T.rect(ctx, 0, 0, 320, 19, P.dark_gray);
  T.dither(ctx, 0, 0, 320, 19, P.dark_gray, P.black, 0.15, 4);

  // Ceiling structural beams
  for (let bx = 40; bx < 320; bx += 80) {
    T.rect(ctx, bx, 0, 6, 19, P.gray);
    T.rect(ctx, bx, 0, 1, 19, P.mid_gray);
  }

  // --- Tiled walls (rows 19-76) ---
  const wallTop = 19;
  const wallHeight = 58;
  T.rect(ctx, 0, wallTop, 320, wallHeight, P.mid_gray);

  // Tile grid — horizontal and vertical lines
  const tileSize = 12;
  // Horizontal lines
  for (let ty = wallTop; ty < wallTop + wallHeight; ty += tileSize) {
    T.rect(ctx, 0, ty, 320, 1, P.gray);
  }
  // Vertical lines
  for (let tx = 0; tx < 320; tx += tileSize) {
    T.rect(ctx, tx, wallTop, 1, wallHeight, P.gray);
  }

  // Tile variation — some tiles darker
  for (let row = 0; row < Math.ceil(wallHeight / tileSize); row++) {
    for (let col = 0; col < Math.ceil(320 / tileSize); col++) {
      if ((row + col * 3) % 5 === 0) {
        const tx = col * tileSize;
        const ty = wallTop + row * tileSize;
        T.dither(ctx, tx + 1, ty + 1, tileSize - 1, tileSize - 1, P.mid_gray, P.dark_gray, 0.3, 4);
      }
    }
  }

  // --- Platform floor (rows 77-98) ---
  const platformY = 77;
  const platformH = 22;
  T.rect(ctx, 0, platformY, 320, platformH, P.gray);
  T.dither(ctx, 0, platformY, 320, platformH, P.gray, P.mid_gray, 0.1, 4);

  // Yellow safety line at platform edge
  const safetyY = platformY + platformH - 3;
  T.rect(ctx, 0, safetyY, 320, 2, P.yellow);
  // Dashed pattern on yellow line
  for (let dx = 0; dx < 320; dx += 8) {
    T.rect(ctx, dx + 4, safetyY, 3, 2, P.dark_yellow);
  }

  // --- Track area (rows 99-140) ---
  const trackY = 99;
  const trackH = 41;
  T.rect(ctx, 0, trackY, 320, trackH, P.black);
  T.dither(ctx, 0, trackY, 320, trackH, P.black, P.dark_gray, 0.08, 4);

  // Gravel/ballast texture
  for (let i = 0; i < 120; i++) {
    const gx = (i * 17 + 5) % 318;
    const gy = trackY + 2 + (i * 7) % (trackH - 4);
    T.pixel(ctx, gx, gy, P.dark_brown);
  }

  // --- Rails ---
  _drawRails(ctx, P, trackY);

  // --- Drainage grate ---
  T.rect(ctx, 145, platformY + 12, 30, 8, P.dark_gray);
  for (let gx = 146; gx < 175; gx += 3) {
    T.rect(ctx, gx, platformY + 13, 1, 6, P.black);
  }
}

function _drawRails(ctx, P, trackY) {
  // Left rail
  const rail1Y = trackY + 18;
  const rail1X1 = 60;
  const rail1X2 = 100;
  T.rect(ctx, rail1X1, rail1Y, rail1X2 - rail1X1, 2, P.gray);
  T.rect(ctx, rail1X1, rail1Y, rail1X2 - rail1X1, 1, P.light_gray);

  // Right rail
  const rail2X1 = 220;
  const rail2X2 = 260;
  T.rect(ctx, rail2X1, rail1Y, rail2X2 - rail2X1, 2, P.gray);
  T.rect(ctx, rail2X1, rail1Y, rail2X2 - rail2X1, 1, P.light_gray);

  // Crossties (sleepers)
  const tieW = 50;
  const tieH = 3;
  for (let i = 0; i < 8; i++) {
    const tieX = 80 + i * 20;
    const tieY = rail1Y + 1;
    T.rect(ctx, tieX, tieY, tieW, tieH, P.dark_brown);
    T.rect(ctx, tieX, tieY, tieW, 1, P.brown);
  }

  // Third rail (electrified) — off to the side
  const rail3X = 35;
  const rail3Y = rail1Y + 6;
  T.rect(ctx, rail3X, rail3Y, 180, 2, P.dark_brown);
  T.rect(ctx, rail3X, rail3Y, 180, 1, P.brown);
  // Warning stripes on third rail insulators
  for (let i = 0; i < 6; i++) {
    const ix = rail3X + 10 + i * 30;
    T.rect(ctx, ix, rail3Y - 2, 6, 5, P.dark_yellow);
    T.rect(ctx, ix + 1, rail3Y - 1, 2, 3, P.black);
    T.rect(ctx, ix + 3, rail3Y - 1, 2, 3, P.black);
  }
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Columns, tunnel openings, signs, benches
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- Tunnel openings ---
  if (params.trainSide === 'left' || params.trainSide === 'both') {
    _drawTunnelOpening(ctx, P, 10, 26, 50, 48);
  }
  if (params.trainSide === 'right' || params.trainSide === 'both') {
    _drawTunnelOpening(ctx, P, 260, 26, 50, 48);
  }

  // --- Support columns ---
  _drawColumn(ctx, P, 90, 20, 12, 78);
  _drawColumn(ctx, P, 218, 20, 12, 78);

  // --- Overhead directional signs ---
  _drawSign(ctx, P, 120, 14, 80, 10, 'DOWNTOWN');

  // --- Benches ---
  if (params.hasBenches) {
    _drawBench(ctx, P, 30, 82);
    _drawBench(ctx, P, 230, 82);
  }

  // --- Vending machine ---
  _drawVendingMachine(ctx, P, 180, 50);
}

function _drawTunnelOpening(ctx, P, x, y, w, h) {
  // Tunnel mouth — arched opening
  T.rect(ctx, x, y + 8, w, h - 8, P.black);

  // Arch top
  const archCenterX = x + Math.floor(w / 2);
  const archRadius = Math.floor(w / 2) - 2;
  for (let r = 0; r < archRadius; r++) {
    const archW = Math.floor(Math.sqrt(archRadius * archRadius - r * r)) * 2;
    const archX = archCenterX - Math.floor(archW / 2);
    T.rect(ctx, archX, y + 8 - r, archW, 1, P.black);
  }

  // Tunnel frame
  T.rect(ctx, x, y + 6, w, 2, P.gray);
  T.rect(ctx, x - 1, y + 8, 2, h - 8, P.gray);
  T.rect(ctx, x + w - 1, y + 8, 2, h - 8, P.gray);

  // Darkness gradient inside tunnel
  T.dither(ctx, x + 2, y + 10, w - 4, 20, P.black, P.dark_gray, 0.1, 4);
}

function _drawColumn(ctx, P, x, y, w, h) {
  // Column body
  T.rect(ctx, x, y, w, h, P.mid_gray);
  T.dither(ctx, x, y, w, h, P.mid_gray, P.gray, 0.1, 4);

  // Column edges — vertical highlights and shadows
  T.rect(ctx, x, y, 1, h, P.light_gray);
  T.rect(ctx, x + w - 1, y, 1, h, P.dark_gray);

  // Capital at top
  T.rect(ctx, x - 2, y, w + 4, 3, P.gray);
  T.rect(ctx, x - 2, y, w + 4, 1, P.light_gray);

  // Base at bottom
  T.rect(ctx, x - 2, y + h - 3, w + 4, 3, P.gray);
  T.rect(ctx, x - 2, y + h - 3, w + 4, 1, P.mid_gray);
}

function _drawSign(ctx, P, x, y, w, h, text) {
  // Sign background — backlit panel
  T.rect(ctx, x, y, w, h, P.white);
  T.dither(ctx, x, y, w, h, P.white, P.pale_gray, 0.15, 4);

  // Sign border
  T.rect(ctx, x, y, w, 1, P.gray);
  T.rect(ctx, x, y + h - 1, w, 1, P.gray);
  T.rect(ctx, x, y, 1, h, P.gray);
  T.rect(ctx, x + w - 1, y, 1, h, P.gray);

  // Text representation — simple black bars (abstracted text)
  const textY = y + 3;
  const textX = x + 8;
  const barCount = 6;
  for (let i = 0; i < barCount; i++) {
    const barX = textX + i * 11;
    T.rect(ctx, barX, textY, 8, 4, P.black);
  }
}

function _drawBench(ctx, P, x, y) {
  // Bench seat
  T.rect(ctx, x, y, 36, 4, P.dark_blue);
  T.dither(ctx, x, y, 36, 4, P.dark_blue, P.blue, 0.2, 4);
  T.rect(ctx, x, y, 36, 1, P.blue);

  // Bench back
  T.rect(ctx, x, y - 8, 36, 4, P.dark_blue);
  T.dither(ctx, x, y - 8, 36, 4, P.dark_blue, P.blue, 0.2, 4);
  T.rect(ctx, x, y - 8, 36, 1, P.blue);

  // Bench legs (metal frame)
  T.rect(ctx, x + 2, y + 4, 2, 10, P.gray);
  T.rect(ctx, x + 32, y + 4, 2, 10, P.gray);
  T.rect(ctx, x + 2, y - 8, 2, 8, P.gray);
  T.rect(ctx, x + 32, y - 8, 2, 8, P.gray);

  // Connecting bar between legs
  T.rect(ctx, x + 2, y + 2, 32, 1, P.dark_gray);
}

function _drawVendingMachine(ctx, P, x, y) {
  const vw = 22;
  const vh = 26;

  // Machine body
  T.rect(ctx, x, y, vw, vh, P.red);
  T.dither(ctx, x, y, vw, vh, P.red, P.dark_gray, 0.15, 4);

  // Machine frame
  T.rect(ctx, x, y, vw, 1, P.light_gray);
  T.rect(ctx, x, y, 1, vh, P.light_gray);
  T.rect(ctx, x + vw - 1, y, 1, vh, P.dark_gray);
  T.rect(ctx, x, y + vh - 1, vw, 1, P.dark_gray);

  // Display window
  T.rect(ctx, x + 3, y + 3, vw - 6, 8, P.black);
  T.rect(ctx, x + 4, y + 4, vw - 8, 6, P.dark_blue);

  // Product rows visible through window (abstract)
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const px = x + 5 + col * 4;
      const py = y + 5 + row * 3;
      T.pixel(ctx, px, py, P.orange);
      T.pixel(ctx, px + 1, py, P.yellow);
    }
  }

  // Button panel
  T.rect(ctx, x + 3, y + 14, vw - 6, 8, P.dark_gray);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      const bx = x + 5 + i * 4;
      const by = y + 16 + j * 3;
      T.pixel(ctx, bx, by, P.gray);
    }
  }

  // Coin slot
  T.rect(ctx, x + 8, y + 23, 6, 2, P.black);

  // Brand logo (abstract stripe)
  T.rect(ctx, x + 6, y + 1, 10, 1, P.white);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Signs, posters, trash can, emergency box, lights
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Platform number sign on wall ---
  _drawPlatformNumber(ctx, P, 160, 30);

  // --- Movie poster on wall ---
  _drawPoster(ctx, P, 50, 40, 18, 24);
  _drawPoster(ctx, P, 252, 36, 18, 24);

  // --- Trash can ---
  if (params.hasTrash) {
    _drawTrashCan(ctx, P, 140, 82);
  }

  // --- Emergency call box ---
  _drawEmergencyBox(ctx, P, 280, 50);

  // --- Fire extinguisher ---
  _drawFireExtinguisher(ctx, P, 270, 58);

  // --- Ceiling lights ---
  for (let lx = 60; lx < 300; lx += 80) {
    _drawCeilingLight(ctx, P, lx, 2);
  }

  // --- Platform edge markers ---
  for (let mx = 10; mx < 320; mx += 40) {
    T.rect(ctx, mx, 95, 3, 3, P.orange);
  }

  // --- Tactile paving at platform edge ---
  for (let px = 0; px < 320; px += 4) {
    T.pixel(ctx, px, 94, P.dark_yellow);
    T.pixel(ctx, px + 2, 95, P.dark_yellow);
  }

  // --- Security camera ---
  T.rect(ctx, 200, 16, 6, 4, P.dark_gray);
  T.rect(ctx, 201, 17, 4, 2, P.black);
  T.pixel(ctx, 203, 18, P.red);

  // --- Electrical conduit on ceiling ---
  T.rect(ctx, 0, 12, 100, 1, P.gray);
  T.rect(ctx, 220, 12, 100, 1, P.gray);
}

function _drawPlatformNumber(ctx, P, x, y) {
  // Circle background
  const radius = 8;
  T.circleFill(ctx, x + radius, y + radius, radius, P.blue);
  T.circle(ctx, x + radius, y + radius, radius, P.white);

  // Number "2" representation — abstract bars
  T.rect(ctx, x + 5, y + 5, 6, 2, P.white);
  T.rect(ctx, x + 9, y + 7, 2, 2, P.white);
  T.rect(ctx, x + 5, y + 9, 6, 2, P.white);
  T.rect(ctx, x + 5, y + 11, 2, 2, P.white);
  T.rect(ctx, x + 5, y + 13, 6, 2, P.white);
}

function _drawPoster(ctx, P, x, y, w, h) {
  // Poster background
  T.rect(ctx, x, y, w, h, P.dark_blue);
  T.dither(ctx, x, y, w, h, P.dark_blue, P.blue, 0.3, 4);

  // Poster border
  T.rect(ctx, x, y, w, 1, P.white);
  T.rect(ctx, x, y + h - 1, w, 1, P.white);
  T.rect(ctx, x, y, 1, h, P.white);
  T.rect(ctx, x + w - 1, y, 1, h, P.white);

  // Abstract poster content — title and image
  T.rect(ctx, x + 2, y + 2, w - 4, 6, P.red);
  T.rect(ctx, x + 4, y + 10, w - 8, 8, P.yellow);
  T.rect(ctx, x + 3, y + 20, w - 6, 2, P.white);
}

function _drawTrashCan(ctx, P, x, y) {
  // Can body
  T.rect(ctx, x, y + 2, 12, 14, P.dark_gray);
  T.dither(ctx, x, y + 2, 12, 14, P.dark_gray, P.gray, 0.15, 4);

  // Can rim
  T.rect(ctx, x - 1, y, 14, 2, P.gray);
  T.rect(ctx, x - 1, y, 14, 1, P.light_gray);

  // Opening (top flap)
  T.rect(ctx, x + 2, y + 1, 8, 1, P.black);

  // Trash visible inside
  T.pixel(ctx, x + 4, y + 4, P.white);
  T.pixel(ctx, x + 7, y + 5, P.orange);
  T.pixel(ctx, x + 5, y + 6, P.blue);
}

function _drawEmergencyBox(ctx, P, x, y) {
  // Box body
  T.rect(ctx, x, y, 10, 12, P.red);
  T.rect(ctx, x + 1, y + 1, 8, 10, P.dark_gray);

  // Glass front
  T.rect(ctx, x + 2, y + 2, 6, 8, P.dark_blue);
  T.pixel(ctx, x + 3, y + 3, P.white);

  // Phone handset inside (abstract)
  T.rect(ctx, x + 3, y + 5, 4, 3, P.white);
}

function _drawFireExtinguisher(ctx, P, x, y) {
  // Cylinder
  T.rect(ctx, x, y, 6, 16, P.red);
  T.dither(ctx, x, y, 6, 16, P.red, P.dark_gray, 0.1, 4);
  T.rect(ctx, x, y, 1, 16, P.orange);

  // Top cap
  T.rect(ctx, x + 1, y - 2, 4, 2, P.dark_gray);

  // Hose
  T.pixel(ctx, x + 5, y + 2, P.black);
  T.pixel(ctx, x + 6, y + 3, P.black);
  T.pixel(ctx, x + 6, y + 4, P.black);

  // Label
  T.rect(ctx, x + 1, y + 6, 4, 3, P.white);
}

function _drawCeilingLight(ctx, P, x, y) {
  // Light fixture housing
  T.rect(ctx, x, y, 24, 6, P.dark_gray);
  T.rect(ctx, x + 1, y + 1, 22, 4, P.gray);

  // Fluorescent tube glow
  T.rect(ctx, x + 2, y + 2, 20, 2, P.white);
  T.dither(ctx, x + 2, y + 2, 20, 2, P.white, P.pale_gray, 0.2, 4);

  // Fixture screws
  T.pixel(ctx, x + 2, y + 1, P.dark_gray);
  T.pixel(ctx, x + 21, y + 1, P.dark_gray);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Column shadows, bench shadows, depth
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  // --- Column shadows on floor ---
  T.scatter(ctx, 88, 98, 16, 8, P.black, 0.15);
  T.scatter(ctx, 216, 98, 16, 8, P.black, 0.15);

  // --- Bench shadows ---
  if (params.hasBenches) {
    T.scatter(ctx, 28, 92, 40, 6, P.black, 0.12);
    T.scatter(ctx, 228, 92, 40, 6, P.black, 0.12);
  }

  // --- Vending machine shadow ---
  T.scatter(ctx, 180, 76, 24, 4, P.black, 0.1);

  // --- Trash can shadow ---
  if (params.hasTrash) {
    T.scatter(ctx, 139, 96, 14, 3, P.black, 0.08);
  }

  // --- Tunnel depth shadows ---
  if (params.trainSide === 'left' || params.trainSide === 'both') {
    T.scatter(ctx, 10, 26, 50, 48, P.black, 0.25);
  }
  if (params.trainSide === 'right' || params.trainSide === 'both') {
    T.scatter(ctx, 260, 26, 50, 48, P.black, 0.25);
  }

  // --- Platform edge depth shadow into track area ---
  T.scatter(ctx, 0, 98, 320, 4, P.black, 0.2);

  // --- Track area depth gradient ---
  T.scatter(ctx, 0, 99, 320, 20, P.black, 0.15);

  // --- Wall-ceiling junction shadow ---
  T.scatter(ctx, 0, 19, 320, 3, P.black, 0.12);

  // --- Corner depth shadows ---
  T.scatter(ctx, 0, 19, 30, 80, P.black, 0.08);
  T.scatter(ctx, 290, 19, 30, 80, P.black, 0.08);

  // --- Poster shadows on wall ---
  T.scatter(ctx, 51, 64, 18, 2, P.black, 0.06);
  T.scatter(ctx, 253, 60, 18, 2, P.black, 0.06);
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Harsh fluorescent lighting, dust particles
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  // --- Harsh fluorescent wash over entire scene ---
  T.scatter(ctx, 0, 0, 320, 99, P.pale_gray, 0.04);

  // --- Ceiling light pools ---
  for (let lx = 60; lx < 300; lx += 80) {
    T.scatterCircle(ctx, lx + 12, 8, 40, P.white, 0.05);
    T.scatterCircle(ctx, lx + 12, 8, 25, P.white, 0.03);
  }

  // --- Light spill on platform floor ---
  T.scatter(ctx, 0, 77, 320, 22, P.pale_gray, 0.03);

  // --- Light glow pools on platform from overhead ---
  for (let lx = 60; lx < 300; lx += 80) {
    T.scatterCircle(ctx, lx + 12, 85, 50, P.white, 0.04);
  }

  // --- Tunnel darkness enhancement ---
  if (params.trainSide === 'left' || params.trainSide === 'both') {
    T.scatterCircle(ctx, 35, 50, 40, P.black, 0.15);
  }
  if (params.trainSide === 'right' || params.trainSide === 'both') {
    T.scatterCircle(ctx, 285, 50, 40, P.black, 0.15);
  }

  // --- Dust particles in the air ---
  const dustPositions = [
    [45, 35], [80, 42], [110, 28], [145, 38], [175, 45],
    [200, 32], [235, 40], [265, 35], [290, 48], [120, 55],
    [180, 60], [95, 50], [215, 52], [160, 48], [75, 58],
  ];
  for (const [dx, dy] of dustPositions) {
    T.pixel(ctx, dx, dy, P.white);
  }

  // --- Track area darkness gradient ---
  T.scatter(ctx, 0, 120, 320, 20, P.black, 0.08);

  // --- Cool blue undertone in shadows ---
  T.scatter(ctx, 0, 0, 30, 99, P.dark_blue, 0.02);
  T.scatter(ctx, 290, 0, 30, 99, P.dark_blue, 0.02);

  // --- Sign glow halos ---
  T.scatterCircle(ctx, 160, 19, 60, P.white, 0.03);

  // --- Vignette darkening at edges ---
  T.scatter(ctx, 0, 0, 20, 20, P.black, 0.06);
  T.scatter(ctx, 300, 0, 20, 20, P.black, 0.06);
  T.scatter(ctx, 0, 120, 20, 20, P.black, 0.06);
  T.scatter(ctx, 300, 120, 20, 20, P.black, 0.06);

  // --- Emergency box red glow ---
  T.scatterCircle(ctx, 285, 56, 15, P.red, 0.03);

  // --- Vending machine display glow ---
  T.scatterCircle(ctx, 191, 57, 20, P.blue, 0.02);
}
