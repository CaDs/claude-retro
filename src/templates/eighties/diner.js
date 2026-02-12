/**
 * diner.js — 80s diner interior room template.
 *
 * Generates a classic American diner with checkered floor, red vinyl booths,
 * counter with stools, jukebox, milkshake machine, neon clock, pie case.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'eighties/diner',
  name: 'Diner',
  setting: 'eighties',
  category: 'interior',
  palette: 'diner_warm',
  params: {
    hasJukebox: { type: 'boolean', default: true, label: 'Jukebox' },
    boothCount: { type: 'enum', options: ['2', '3', '4'], default: '3', label: 'Booths' },
    hasPieCase: { type: 'boolean', default: true, label: 'Pie Display Case' },
    mood: { type: 'enum', options: ['cozy', 'normal', 'bright'], default: 'normal', label: 'Mood' },
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
//  Layer 1 (BASE): Ceiling, walls, checkered floor
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  const isCozy = params.mood === 'cozy';
  const isBright = params.mood === 'bright';

  // --- Ceiling (rows 0-12) ---
  const ceilColor = isCozy ? P.dark_brown : P.cream;
  T.rect(ctx, 0, 0, 320, 13, ceilColor);
  T.dither(ctx, 0, 0, 320, 13, ceilColor, P.tan, 0.1, 4);

  // Ceiling panels
  for (let x = 0; x < 320; x += 40) {
    T.rect(ctx, x, 0, 1, 13, P.tan);
  }
  for (let y = 0; y < 13; y += 6) {
    T.rect(ctx, 0, y, 320, 1, P.tan);
  }

  // --- Walls (rows 13-70) ---
  const wallBase = isCozy ? P.brown : P.cream;
  T.rect(ctx, 0, 13, 320, 58, wallBase);
  T.dither(ctx, 0, 13, 320, 58, wallBase, P.tan, 0.12, 4);

  // Wall trim stripe — classic diner horizontal band
  T.rect(ctx, 0, 13, 320, 2, P.teal);
  T.rect(ctx, 0, 14, 320, 1, P.light_teal);
  T.rect(ctx, 0, 40, 320, 3, P.teal);
  T.rect(ctx, 0, 41, 320, 1, P.light_teal);
  T.rect(ctx, 0, 69, 320, 2, P.teal);
  T.rect(ctx, 0, 69, 320, 1, P.dark_teal);

  // --- Checkered floor (rows 71-140) ---
  _drawCheckeredFloor(ctx, P);
}

function _drawCheckeredFloor(ctx, P) {
  const tileSize = 10;
  const startY = 71;
  const floorHeight = 69;

  const cols = Math.ceil(320 / tileSize);
  const rows = Math.ceil(floorHeight / tileSize);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tx = c * tileSize;
      const ty = startY + r * tileSize;
      const isWhite = (r + c) % 2 === 0;
      const color = isWhite ? P.white : P.black;

      T.rect(ctx, tx, ty, tileSize, tileSize, color);

      // Subtle tile texture
      if (isWhite) {
        T.dither(ctx, tx, ty, tileSize, tileSize, P.white, P.cream, 0.08, 4);
      } else {
        T.dither(ctx, tx, ty, tileSize, tileSize, P.black, P.dark_gray, 0.08, 4);
      }
    }
  }

  // Grout lines between tiles
  for (let x = 0; x < 320; x += tileSize) {
    T.rect(ctx, x, startY, 1, floorHeight, P.gray);
  }
  for (let y = startY; y < startY + floorHeight; y += tileSize) {
    T.rect(ctx, 0, y, 320, 1, P.gray);
  }
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Booths, counter, stools, jukebox
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- Red vinyl booths on left ---
  _drawBooths(ctx, P, params);

  // --- Counter with stools ---
  _drawCounter(ctx, P);

  // --- Jukebox ---
  if (params.hasJukebox) {
    _drawJukebox(ctx, P);
  }

  // --- Entrance/exit ---
  _drawEntrance(ctx, P);
}

function _drawBooths(ctx, P, params) {
  const boothCount = parseInt(params.boothCount) || 3;
  const boothW = 28;
  const boothH = 26;
  const spacing = 6;
  const startX = 10;
  const startY = 18;

  for (let i = 0; i < boothCount; i++) {
    const bx = startX;
    const by = startY + i * (boothH + spacing);

    // Booth bench back (high side)
    T.rect(ctx, bx, by, boothW, 16, P.dark_red);
    T.rect(ctx, bx + 1, by + 1, boothW - 2, 14, P.red);
    T.dither(ctx, bx + 1, by + 1, boothW - 2, 14, P.red, P.bright_red, 0.15, 4);

    // Vinyl tufting buttons
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const btnX = bx + 4 + col * 5;
        const btnY = by + 3 + row * 4;
        T.pixel(ctx, btnX, btnY, P.dark_red);
      }
    }

    // Bench seat
    T.rect(ctx, bx, by + 16, boothW, 10, P.dark_red);
    T.rect(ctx, bx + 1, by + 17, boothW - 2, 8, P.red);
    T.dither(ctx, bx + 1, by + 17, boothW - 2, 8, P.red, P.bright_red, 0.12, 4);

    // Seat tufting
    for (let col = 0; col < 5; col++) {
      T.pixel(ctx, bx + 3 + col * 5, by + 20, P.dark_red);
    }

    // Table in front of booth
    const tableX = bx + boothW + 2;
    const tableY = by + 18;
    const tableW = 18;
    const tableH = 12;

    // Table top
    T.rect(ctx, tableX, tableY, tableW, tableH, P.brown);
    T.rect(ctx, tableX + 1, tableY + 1, tableW - 2, tableH - 2, P.tan);
    T.dither(ctx, tableX + 1, tableY + 1, tableW - 2, tableH - 2, P.tan, P.brown, 0.1, 4);

    // Chrome edge
    T.rect(ctx, tableX, tableY, tableW, 1, P.white);
    T.rect(ctx, tableX, tableY + tableH - 1, tableW, 1, P.dark_gray);

    // Table leg
    T.rect(ctx, tableX + 8, tableY + tableH, 2, 8, P.dark_gray);
    T.rect(ctx, tableX + 8, tableY + tableH, 1, 8, P.gray);

    // Table base
    T.rect(ctx, tableX + 6, tableY + tableH + 8, 6, 2, P.dark_gray);

    // Items on table (random per booth)
    if (i === 0) {
      // Salt and pepper shakers
      T.rect(ctx, tableX + 4, tableY + 3, 2, 4, P.white);
      T.pixel(ctx, tableX + 4, tableY + 2, P.gray);
      T.rect(ctx, tableX + 7, tableY + 3, 2, 4, P.black);
      T.pixel(ctx, tableX + 7, tableY + 2, P.gray);
    } else if (i === 1) {
      // Ketchup bottle
      T.rect(ctx, tableX + 5, tableY + 3, 3, 5, P.red);
      T.pixel(ctx, tableX + 6, tableY + 2, P.white);
    } else if (i === 2) {
      // Coffee mug
      T.rect(ctx, tableX + 6, tableY + 4, 4, 3, P.white);
      T.rect(ctx, tableX + 7, tableY + 5, 2, 1, P.dark_brown);
      T.pixel(ctx, tableX + 10, tableY + 5, P.white); // handle
    }
  }
}

function _drawCounter(ctx, P) {
  const cx = 140;
  const cy = 42;
  const cw = 160;
  const ch = 29;

  // Counter body
  T.rect(ctx, cx, cy, cw, ch, P.brown);
  T.dither(ctx, cx, cy, cw, ch, P.brown, P.dark_brown, 0.15, 4);

  // Counter top — chrome/formica surface
  T.rect(ctx, cx - 1, cy - 1, cw + 2, 4, P.white);
  T.rect(ctx, cx - 1, cy - 1, cw + 2, 1, P.cream);
  T.rect(ctx, cx - 1, cy + 2, cw + 2, 1, P.gray);

  // Counter front panel
  T.rect(ctx, cx + 2, cy + 4, cw - 4, ch - 6, P.teal);
  T.dither(ctx, cx + 2, cy + 4, cw - 4, ch - 6, P.teal, P.dark_teal, 0.12, 4);

  // Chrome trim strips
  T.rect(ctx, cx, cy + 4, cw, 1, P.white);
  T.rect(ctx, cx, cy + 8, cw, 1, P.white);
  T.rect(ctx, cx, cy + ch - 4, cw, 1, P.white);

  // --- Stools in front of counter ---
  const stoolCount = 6;
  const stoolSpacing = Math.floor(cw / (stoolCount + 1));

  for (let i = 0; i < stoolCount; i++) {
    const sx = cx + (i + 1) * stoolSpacing;
    const sy = cy + ch + 10;

    // Stool seat
    T.circleFill(ctx, sx, sy, 6, P.dark_red);
    T.circleFill(ctx, sx, sy, 5, P.red);
    T.circleFill(ctx, sx, sy, 4, P.bright_red);
    T.dither(ctx, sx - 4, sy - 4, 8, 8, P.bright_red, P.red, 0.15, 4);

    // Chrome pole
    T.rect(ctx, sx - 1, sy + 5, 2, 15, P.gray);
    T.rect(ctx, sx - 1, sy + 5, 1, 15, P.white);

    // Base
    T.rect(ctx, sx - 3, sy + 20, 6, 2, P.dark_gray);
    T.rect(ctx, sx - 3, sy + 20, 6, 1, P.gray);
  }

  // --- Milkshake machine on counter ---
  const milkX = cx + 20;
  const milkY = cy + 5;
  T.rect(ctx, milkX, milkY, 16, 20, P.dark_gray);
  T.rect(ctx, milkX + 1, milkY + 1, 14, 18, P.gray);
  T.dither(ctx, milkX + 1, milkY + 1, 14, 18, P.gray, P.white, 0.1, 4);

  // Chrome band
  T.rect(ctx, milkX, milkY + 4, 16, 2, P.white);
  T.rect(ctx, milkX, milkY + 5, 16, 1, P.gray);

  // Mixer cup holder
  T.rect(ctx, milkX + 4, milkY + 14, 8, 5, P.dark_gray);
  T.rect(ctx, milkX + 5, milkY + 15, 6, 3, P.white);

  // Control knob
  T.rect(ctx, milkX + 10, milkY + 8, 3, 3, P.black);
  T.pixel(ctx, milkX + 11, milkY + 8, P.gray);

  // --- Coffee maker on counter ---
  const coffeeX = cx + 50;
  const coffeeY = cy + 6;
  T.rect(ctx, coffeeX, coffeeY, 12, 16, P.dark_gray);
  T.rect(ctx, coffeeX + 1, coffeeY + 1, 10, 14, P.gray);

  // Glass pot
  T.rect(ctx, coffeeX + 2, coffeeY + 8, 8, 6, P.black);
  T.rect(ctx, coffeeX + 3, coffeeY + 9, 6, 4, P.dark_brown);
  T.pixel(ctx, coffeeX + 4, coffeeY + 9, P.brown);

  // Control panel
  T.rect(ctx, coffeeX + 3, coffeeY + 2, 6, 4, P.black);
  T.pixel(ctx, coffeeX + 4, coffeeY + 3, P.red);

  // --- Cash register on counter ---
  const regX = cx + cw - 30;
  const regY = cy + 4;
  T.rect(ctx, regX, regY, 24, 16, P.dark_gray);
  T.rect(ctx, regX + 1, regY + 1, 22, 14, P.gray);
  T.dither(ctx, regX + 1, regY + 1, 22, 14, P.gray, P.white, 0.12, 4);

  // Register display
  T.rect(ctx, regX + 3, regY + 2, 18, 6, P.black);
  T.rect(ctx, regX + 4, regY + 3, 16, 4, P.dark_teal);
  T.rect(ctx, regX + 5, regY + 4, 4, 1, P.teal);

  // Buttons
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      T.rect(ctx, regX + 3 + c * 4, regY + 10 + r * 3, 3, 2, P.white);
      T.pixel(ctx, regX + 4 + c * 4, regY + 10 + r * 3, P.cream);
    }
  }

  // --- Pie display case ---
  if (params.hasPieCase) {
    _drawPieCase(ctx, P, cx + 80);
  }

  // --- Menu board on wall behind counter ---
  _drawMenuBoard(ctx, P, cx + 30);
}

function _drawPieCase(ctx, P, pcX) {
  const pcY = 24;

  // Case base
  T.rect(ctx, pcX, pcY, 32, 18, P.dark_gray);
  T.rect(ctx, pcX + 1, pcY + 1, 30, 16, P.gray);

  // Glass dome top
  T.rect(ctx, pcX + 2, pcY - 8, 28, 10, P.black);
  T.rect(ctx, pcX + 3, pcY - 7, 26, 8, P.dark_teal);
  T.dither(ctx, pcX + 3, pcY - 7, 26, 8, P.dark_teal, P.black, 0.3, 4);

  // Glass highlight
  T.pixel(ctx, pcX + 6, pcY - 5, P.white);
  T.pixel(ctx, pcX + 7, pcY - 6, P.white);

  // Pies inside (3 slices visible)
  // Slice 1 — cherry pie
  T.rect(ctx, pcX + 4, pcY + 8, 7, 6, P.brown);
  T.rect(ctx, pcX + 5, pcY + 9, 5, 4, P.red);
  T.pixel(ctx, pcX + 6, pcY + 10, P.bright_red);

  // Slice 2 — lemon pie
  T.rect(ctx, pcX + 13, pcY + 8, 6, 6, P.brown);
  T.rect(ctx, pcX + 14, pcY + 9, 4, 4, P.yellow);
  T.pixel(ctx, pcX + 15, pcY + 10, P.white);

  // Slice 3 — chocolate pie
  T.rect(ctx, pcX + 21, pcY + 8, 7, 6, P.brown);
  T.rect(ctx, pcX + 22, pcY + 9, 5, 4, P.dark_brown);
  T.pixel(ctx, pcX + 24, pcY + 10, P.brown);

  // Plate details
  T.pixel(ctx, pcX + 5, pcY + 13, P.white);
  T.pixel(ctx, pcX + 14, pcY + 13, P.white);
  T.pixel(ctx, pcX + 22, pcY + 13, P.white);
}

function _drawMenuBoard(ctx, P, mbX) {
  const mbY = 16;
  const mbW = 50;
  const mbH = 22;

  // Board backing
  T.rect(ctx, mbX, mbY, mbW, mbH, P.black);
  T.rect(ctx, mbX + 1, mbY + 1, mbW - 2, mbH - 2, P.dark_brown);

  // Menu header
  T.rect(ctx, mbX + 4, mbY + 2, mbW - 8, 3, P.white);
  T.rect(ctx, mbX + 5, mbY + 3, mbW - 10, 1, P.yellow);

  // Menu items (text simulation — horizontal lines)
  const itemY = mbY + 7;
  for (let i = 0; i < 5; i++) {
    T.rect(ctx, mbX + 4, itemY + i * 3, 20, 1, P.white);
    T.rect(ctx, mbX + 28, itemY + i * 3, 6, 1, P.yellow); // price
  }
}

function _drawJukebox(ctx, P) {
  const jx = 260;
  const jy = 18;
  const jw = 40;
  const jh = 52;

  // Jukebox body
  T.rect(ctx, jx, jy, jw, jh, P.dark_red);
  T.dither(ctx, jx, jy, jw, jh, P.dark_red, P.black, 0.15, 4);

  // Chrome side trim
  T.rect(ctx, jx, jy, 2, jh, P.gray);
  T.rect(ctx, jx, jy, 1, jh, P.white);
  T.rect(ctx, jx + jw - 2, jy, 2, jh, P.gray);
  T.rect(ctx, jx + jw - 1, jy, 1, jh, P.white);

  // Top arch (rounded top)
  T.rect(ctx, jx + 4, jy, jw - 8, 2, P.red);
  T.pixel(ctx, jx + 6, jy - 1, P.red);
  T.pixel(ctx, jx + 7, jy - 1, P.red);
  T.pixel(ctx, jx + jw - 8, jy - 1, P.red);
  T.pixel(ctx, jx + jw - 7, jy - 1, P.red);

  // Display window (song selection)
  T.rect(ctx, jx + 6, jy + 4, jw - 12, 14, P.black);
  T.rect(ctx, jx + 7, jy + 5, jw - 14, 12, P.dark_teal);
  T.dither(ctx, jx + 7, jy + 5, jw - 14, 12, P.dark_teal, P.black, 0.2, 4);

  // Song list lines (text simulation)
  for (let i = 0; i < 4; i++) {
    T.rect(ctx, jx + 9, jy + 7 + i * 3, 16, 1, P.yellow);
    T.rect(ctx, jx + 10, jy + 8 + i * 3, 12, 1, P.white);
  }

  // Selection buttons grid
  const btnStartY = jy + 22;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const btnX = jx + 6 + c * 7;
      const btnY = btnStartY + r * 6;
      T.rect(ctx, btnX, btnY, 5, 4, P.dark_gray);
      T.rect(ctx, btnX + 1, btnY + 1, 3, 2, P.gray);
      // Button label
      T.pixel(ctx, btnX + 2, btnY + 1, P.yellow);
    }
  }

  // Coin slot
  T.rect(ctx, jx + 14, jy + 44, 12, 3, P.black);
  T.rect(ctx, jx + 15, jy + 45, 10, 1, P.dark_gray);

  // Speaker grille on bottom
  T.rect(ctx, jx + 4, jy + 50, jw - 8, 8, P.black);
  for (let i = 0; i < 6; i++) {
    T.rect(ctx, jx + 6 + i * 5, jy + 52, 3, 4, P.dark_gray);
  }

  // Chrome base
  T.rect(ctx, jx, jy + jh, jw, 3, P.gray);
  T.rect(ctx, jx, jy + jh, jw, 1, P.white);
}

function _drawEntrance(ctx, P) {
  const ex = 0;
  const ey = 20;
  const ew = 32;
  const eh = 50;

  // Door frame
  T.rect(ctx, ex, ey, ew, eh, P.dark_brown);
  T.rect(ctx, ex + 1, ey + 1, ew - 2, eh - 2, P.brown);

  // Glass door
  T.rect(ctx, ex + 2, ey + 2, ew - 4, eh - 4, P.black);
  T.rect(ctx, ex + 3, ey + 3, ew - 6, eh - 6, P.dark_teal);
  T.dither(ctx, ex + 3, ey + 3, ew - 6, eh - 6, P.dark_teal, P.black, 0.25, 4);

  // "OPEN" decal on door
  T.rect(ctx, ex + 10, ey + 20, 12, 8, P.red);
  T.rect(ctx, ex + 11, ey + 21, 10, 6, P.white);
  T.rect(ctx, ex + 12, ey + 23, 8, 2, P.red); // text sim

  // Door handle
  T.rect(ctx, ex + ew - 6, ey + 28, 2, 5, P.gray);
  T.pixel(ctx, ex + ew - 6, ey + 28, P.white);

  // Welcome mat
  T.rect(ctx, ex + 2, ey + eh, ew + 4, 5, P.dark_red);
  T.dither(ctx, ex + 2, ey + eh, ew + 4, 5, P.dark_red, P.black, 0.3, 4);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Neon clock, signs, condiments, decorations
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Neon wall clock ---
  _drawNeonClock(ctx, P);

  // --- Ceiling lights/fans ---
  _drawCeilingLights(ctx, P, params);

  // --- Wall decorations ---
  _drawWallDecorations(ctx, P);

  // --- Napkin dispenser on counter ---
  T.rect(ctx, 210, 46, 8, 6, P.dark_gray);
  T.rect(ctx, 211, 47, 6, 4, P.gray);
  T.pixel(ctx, 213, 48, P.white); // napkin edge

  // --- Straw dispenser ---
  T.rect(ctx, 200, 46, 6, 8, P.dark_gray);
  T.rect(ctx, 201, 47, 4, 6, P.gray);
  T.pixel(ctx, 202, 48, P.red); // straw
  T.pixel(ctx, 203, 48, P.red);

  // --- Condiment bottles on counter ---
  T.rect(ctx, 156, 46, 3, 6, P.red); // ketchup
  T.pixel(ctx, 157, 45, P.white);
  T.rect(ctx, 161, 46, 3, 6, P.yellow); // mustard
  T.pixel(ctx, 162, 45, P.white);

  // --- Floor clutter ---
  // Dropped napkin
  T.rect(ctx, 88, 128, 4, 3, P.white);
  T.pixel(ctx, 89, 129, P.cream);

  // Straw wrapper
  T.rect(ctx, 174, 134, 5, 1, P.white);

  // Gum on floor
  T.pixel(ctx, 242, 131, P.dark_gray);
  T.pixel(ctx, 243, 131, P.dark_gray);

  // --- "EXIT" sign above entrance ---
  T.rect(ctx, 5, 16, 18, 5, P.red);
  T.rect(ctx, 6, 17, 16, 3, P.black);
  T.rect(ctx, 7, 18, 14, 1, P.white);

  // --- Fire extinguisher on wall ---
  T.rect(ctx, 120, 64, 4, 10, P.red);
  T.pixel(ctx, 121, 63, P.dark_gray);
  T.pixel(ctx, 122, 63, P.dark_gray);
  T.rect(ctx, 120, 74, 4, 1, P.dark_gray);
}

function _drawNeonClock(ctx, P) {
  const cx = 100;
  const cy = 16;

  // Clock body
  T.circleFill(ctx, cx, cy, 8, P.black);
  T.circleFill(ctx, cx, cy, 7, P.dark_teal);
  T.circleFill(ctx, cx, cy, 6, P.teal);
  T.dither(ctx, cx - 6, cy - 6, 12, 12, P.teal, P.dark_teal, 0.15, 4);

  // Clock face
  T.circleFill(ctx, cx, cy, 5, P.white);

  // Hour markers (12, 3, 6, 9)
  T.pixel(ctx, cx, cy - 4, P.black);
  T.pixel(ctx, cx + 4, cy, P.black);
  T.pixel(ctx, cx, cy + 4, P.black);
  T.pixel(ctx, cx - 4, cy, P.black);

  // Clock hands — 3:15
  T.line(ctx, cx, cy, cx + 2, cy, P.black); // hour
  T.line(ctx, cx, cy, cx, cy - 3, P.black); // minute

  // Center dot
  T.pixel(ctx, cx, cy, P.black);

  // Neon glow ring
  T.pixel(ctx, cx - 7, cy, P.light_teal);
  T.pixel(ctx, cx + 7, cy, P.light_teal);
  T.pixel(ctx, cx, cy - 7, P.light_teal);
  T.pixel(ctx, cx, cy + 7, P.light_teal);
}

function _drawCeilingLights(ctx, P, params) {
  const isCozy = params.mood === 'cozy';

  // Pendant lights
  for (let x = 60; x < 280; x += 80) {
    // Chain/cord
    T.rect(ctx, x, 13, 1, 6, P.dark_gray);

    // Light fixture
    T.rect(ctx, x - 3, 19, 7, 5, P.dark_gray);
    T.rect(ctx, x - 2, 20, 5, 3, P.gray);

    if (!isCozy) {
      T.pixel(ctx, x, 21, P.yellow);
    }
  }

  // Ceiling fan
  T.rect(ctx, 200, 8, 1, 5, P.dark_gray);
  // Fan blades
  T.rect(ctx, 190, 7, 20, 1, P.brown);
  T.rect(ctx, 200, 6, 1, 3, P.brown);
  // Hub
  T.rect(ctx, 199, 7, 3, 2, P.dark_gray);
}

function _drawWallDecorations(ctx, P) {
  // Framed poster — "Blue Plate Special"
  T.rect(ctx, 48, 18, 20, 16, P.dark_brown);
  T.rect(ctx, 49, 19, 18, 14, P.white);
  T.rect(ctx, 50, 20, 16, 12, P.teal);
  T.rect(ctx, 52, 23, 12, 2, P.yellow);
  T.rect(ctx, 53, 26, 10, 1, P.black);

  // License plate on wall
  T.rect(ctx, 76, 22, 16, 6, P.yellow);
  T.rect(ctx, 77, 23, 14, 4, P.black);
  T.rect(ctx, 78, 24, 12, 2, P.yellow); // text sim

  // Old advertisement sign
  T.rect(ctx, 104, 36, 18, 12, P.red);
  T.rect(ctx, 105, 37, 16, 10, P.cream);
  T.rect(ctx, 107, 39, 12, 2, P.red);
  T.rect(ctx, 108, 42, 10, 1, P.black);

  // Vintage Coca-Cola logo area
  T.rect(ctx, 308, 24, 10, 14, P.red);
  T.rect(ctx, 309, 25, 8, 12, P.white);
  T.ellipse(ctx, 313, 31, 3, 5, P.red);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Shadows from booths, counter, stools
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  const isCozy = params.mood === 'cozy';

  // --- Booth shadows on floor ---
  const boothCount = parseInt(params.boothCount) || 3;
  for (let i = 0; i < boothCount; i++) {
    const by = 18 + i * 32;
    T.scatter(ctx, 10, by + 26, 28, 6, P.black, 0.12);
    // Table shadow
    T.scatter(ctx, 40, by + 30, 18, 8, P.black, 0.1);
  }

  // --- Counter shadow on floor ---
  T.scatter(ctx, 140, 71, 160, 10, P.black, 0.15);

  // --- Stool shadows ---
  for (let i = 0; i < 6; i++) {
    const sx = 140 + (i + 1) * 26;
    T.scatter(ctx, sx - 4, 93, 8, 6, P.black, 0.1);
  }

  // --- Jukebox shadow ---
  if (params.hasJukebox) {
    T.scatter(ctx, 260, 70, 40, 8, P.black, 0.12);
    // Jukebox interior shadow
    T.scatter(ctx, 260, 18, 40, 52, P.black, isCozy ? 0.15 : 0.08);
  }

  // --- Entrance shadow ---
  T.scatter(ctx, 0, 70, 32, 8, P.black, 0.1);

  // --- Corner vignette ---
  T.scatter(ctx, 0, 0, 40, 40, P.black, 0.06);
  T.scatter(ctx, 280, 0, 40, 40, P.black, 0.06);
  T.scatter(ctx, 0, 100, 40, 40, P.black, 0.08);
  T.scatter(ctx, 280, 100, 40, 40, P.black, 0.08);

  // --- Ceiling shadow depth ---
  T.scatter(ctx, 0, 0, 320, 4, P.black, 0.1);

  // --- Counter interior shadow (below counter top) ---
  T.scatter(ctx, 140, 45, 160, 6, P.black, 0.12);

  // --- Neon clock glow ---
  T.scatterCircle(ctx, 100, 16, 12, P.teal, 0.08);

  // --- Pie case glass glint ---
  if (params.hasPieCase) {
    T.scatterCircle(ctx, 236, 18, 8, P.white, 0.04);
  }

  // --- Jukebox display glow ---
  if (params.hasJukebox) {
    T.scatterCircle(ctx, 280, 24, 15, P.dark_teal, 0.06);
  }
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Warm ambient lighting, cozy tones
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  const isCozy = params.mood === 'cozy';
  const isBright = params.mood === 'bright';

  if (isCozy) {
    // --- Cozy mode: warm, dim lighting ---
    T.scatter(ctx, 0, 0, 320, 140, P.dark_brown, 0.08);
    T.scatter(ctx, 0, 0, 320, 140, P.dark_red, 0.04);

    // Warm pools from pendant lights
    T.scatterCircle(ctx, 60, 40, 35, P.orange, 0.04);
    T.scatterCircle(ctx, 140, 45, 30, P.orange, 0.04);
    T.scatterCircle(ctx, 220, 40, 35, P.orange, 0.04);
  } else if (isBright) {
    // --- Bright mode: well-lit, clean ---
    T.scatter(ctx, 0, 0, 320, 140, P.cream, 0.04);
    T.scatter(ctx, 0, 0, 320, 71, P.white, 0.03);
  } else {
    // --- Normal mode: balanced warm tones ---
    T.scatter(ctx, 0, 0, 320, 140, P.tan, 0.04);
    T.scatter(ctx, 0, 0, 320, 140, P.orange, 0.02);

    // Light pools from ceiling fixtures
    T.scatterCircle(ctx, 60, 35, 40, P.yellow, 0.03);
    T.scatterCircle(ctx, 140, 40, 35, P.yellow, 0.03);
    T.scatterCircle(ctx, 220, 35, 40, P.yellow, 0.03);

    // Floor reflections from lights
    T.scatter(ctx, 40, 95, 60, 30, P.yellow, 0.02);
    T.scatter(ctx, 120, 90, 80, 35, P.orange, 0.02);
    T.scatter(ctx, 200, 95, 60, 30, P.yellow, 0.02);
  }

  // --- Neon clock halo ---
  T.scatterCircle(ctx, 100, 16, 20, P.teal, 0.04);
  T.scatterCircle(ctx, 100, 16, 12, P.light_teal, 0.03);

  // --- Jukebox display glow halo ---
  if (params.hasJukebox && !isCozy) {
    T.scatterCircle(ctx, 280, 24, 25, P.teal, 0.03);
    T.scatterCircle(ctx, 280, 24, 15, P.yellow, 0.02);
  }

  // --- Entrance light spill from outside ---
  T.scatterCircle(ctx, 16, 75, 30, P.cream, 0.06);

  // --- Ambient dust/haze particles ---
  const dustPositions = [
    [28, 38], [72, 52], [118, 32], [162, 48], [208, 42],
    [96, 28], [144, 58], [190, 34], [238, 54], [282, 38],
    [54, 68], [134, 24], [178, 62], [264, 46], [308, 56],
  ];
  for (const [dx, dy] of dustPositions) {
    const dustColor = isCozy ? P.brown : P.tan;
    T.pixel(ctx, dx, dy, dustColor);
  }

  // --- Booth area warm ambiance ---
  if (!isBright) {
    T.scatter(ctx, 0, 20, 70, 80, P.orange, 0.02);
  }

  // --- Counter chrome reflections ---
  T.scatter(ctx, 140, 41, 160, 3, P.white, 0.08);

  // --- Floor checkered pattern ambient softening ---
  T.scatter(ctx, 0, 71, 320, 69, P.tan, 0.03);
}
