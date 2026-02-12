/**
 * record_store.js — 80s record store interior room template.
 *
 * Generates a retro record store with shelves of vinyl, listening booth,
 * posters, counter with register, neon OPEN sign, and wood floor.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';
import { drawWoodFloor } from '../_base.js';

export const metadata = {
  id: 'eighties/record_store',
  name: 'Record Store',
  setting: 'eighties',
  category: 'interior',
  palette: 'record_store_dark',
  params: {
    hasBooth: { type: 'boolean', default: true, label: 'Listening Booth' },
    shelfStyle: { type: 'enum', options: ['full', 'sparse', 'crowded'], default: 'full', label: 'Shelf Style' },
    neonSign: { type: 'boolean', default: true, label: 'Neon OPEN Sign' },
    mood: { type: 'enum', options: ['dim', 'normal', 'bright'], default: 'normal', label: 'Mood' },
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
//  Layer 1 (BASE): Ceiling, walls, wood floor
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  const isDim = params.mood === 'dim';
  const isBright = params.mood === 'bright';

  // --- Ceiling (rows 0-10) ---
  const ceilColor = isDim ? P.black : P.dark_gray;
  T.rect(ctx, 0, 0, 320, 11, ceilColor);
  T.dither(ctx, 0, 0, 320, 11, ceilColor, P.black, 0.15, 4);

  // Ceiling tiles
  for (let x = 0; x < 320; x += 32) {
    T.rect(ctx, x, 0, 1, 11, P.black);
  }

  // Drop ceiling grid
  for (let y = 0; y < 11; y += 5) {
    T.rect(ctx, 0, y, 320, 1, P.black);
  }

  // --- Walls (rows 11-72) ---
  const wallBase = isDim ? P.black : P.dark_brown;
  T.rect(ctx, 0, 11, 320, 62, wallBase);
  T.dither(ctx, 0, 11, 320, 62, wallBase, P.black, 0.2, 4);

  // Wood paneling strips — horizontal trim
  T.rect(ctx, 0, 11, 320, 2, P.brown);
  T.rect(ctx, 0, 12, 320, 1, P.dark_brown);
  T.rect(ctx, 0, 71, 320, 2, P.brown);
  T.rect(ctx, 0, 71, 320, 1, P.tan);

  // Vertical wood dividers
  for (let x = 60; x < 320; x += 70) {
    T.rect(ctx, x, 13, 2, 58, P.dark_brown);
    T.rect(ctx, x + 1, 13, 1, 58, P.brown);
  }

  // --- Wood floor (rows 73-140) ---
  drawWoodFloor(ctx, P, 73, 67, {
    baseColor: P.brown,
    grainColor: P.dark_brown,
    highlightColor: P.tan,
    plankH: 6,
  });

  // Floor edge trim
  T.rect(ctx, 0, 73, 320, 1, P.dark_brown);
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Shelves, counter, listening booth
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- Record shelves on left wall ---
  _drawRecordShelves(ctx, P, params);

  // --- Counter with register on right ---
  _drawCounter(ctx, P);

  // --- Listening booth ---
  if (params.hasBooth) {
    _drawListeningBooth(ctx, P);
  }

  // --- Entrance/exit ---
  _drawEntrance(ctx, P);
}

function _drawRecordShelves(ctx, P, params) {
  const shelfX = 12;
  const shelfW = 140;
  const shelfCount = 5;
  const shelfSpacing = 11;
  const topY = 20;

  const isCrowded = params.shelfStyle === 'crowded';
  const isSparse = params.shelfStyle === 'sparse';

  for (let i = 0; i < shelfCount; i++) {
    const sy = topY + i * shelfSpacing;

    // Shelf board
    T.rect(ctx, shelfX, sy, shelfW, 2, P.dark_brown);
    T.rect(ctx, shelfX, sy, shelfW, 1, P.brown);

    // Shelf bracket
    T.rect(ctx, shelfX, sy, 2, 4, P.dark_gray);
    T.rect(ctx, shelfX + shelfW - 2, sy, 2, 4, P.dark_gray);

    // --- Vinyl records on shelf ---
    let recordCount = isCrowded ? 18 : isSparse ? 8 : 12;
    const recordW = 3;
    const spacing = Math.floor((shelfW - 10) / recordCount);

    for (let r = 0; r < recordCount; r++) {
      const rx = shelfX + 5 + r * spacing;
      const ry = sy - 8;
      const rh = 7;

      // Record spine color variety
      const colors = [P.red, P.orange, P.yellow, P.purple, P.dark_red, P.tan, P.white];
      const recordColor = colors[(i * recordCount + r) % colors.length];

      T.rect(ctx, rx, ry, recordW, rh, recordColor);

      // Spine highlight
      T.pixel(ctx, rx, ry, T.lighten(recordColor, 30));

      // Spine text simulation (tiny line)
      T.rect(ctx, rx + 1, ry + 2, 1, 3, P.black);
    }
  }

  // Shelf backing panel
  T.rect(ctx, shelfX, topY - 10, shelfW, 62, P.black);
  T.dither(ctx, shelfX, topY - 10, shelfW, 62, P.black, P.dark_brown, 0.1, 4);
}

function _drawCounter(ctx, P) {
  const cx = 220;
  const cy = 42;
  const cw = 80;
  const ch = 31;

  // Counter body
  T.rect(ctx, cx, cy, cw, ch, P.dark_brown);
  T.dither(ctx, cx, cy, cw, ch, P.dark_brown, P.black, 0.12, 4);

  // Counter top surface
  T.rect(ctx, cx - 1, cy - 1, cw + 2, 3, P.brown);
  T.rect(ctx, cx - 1, cy - 1, cw + 2, 1, P.tan);

  // Front panel detail
  T.rect(ctx, cx + 2, cy + 4, cw - 4, ch - 8, P.brown);
  T.dither(ctx, cx + 2, cy + 4, cw - 4, ch - 8, P.brown, P.dark_brown, 0.15, 4);

  // Wood grain lines on front panel
  T.rect(ctx, cx + 4, cy + 10, cw - 8, 1, P.dark_brown);
  T.rect(ctx, cx + 4, cy + 18, cw - 8, 1, P.dark_brown);
  T.rect(ctx, cx + 4, cy + 26, cw - 8, 1, P.dark_brown);

  // Cash register on counter
  const regX = cx + 8;
  const regY = cy + 4;
  T.rect(ctx, regX, regY, 24, 16, P.dark_gray);
  T.rect(ctx, regX + 1, regY + 1, 22, 14, P.gray);
  T.dither(ctx, regX + 1, regY + 1, 22, 14, P.gray, P.dark_gray, 0.1, 4);

  // Register display
  T.rect(ctx, regX + 3, regY + 2, 18, 6, P.black);
  T.rect(ctx, regX + 4, regY + 3, 16, 4, P.dark_red);
  T.rect(ctx, regX + 5, regY + 4, 4, 1, P.red); // LED display text sim

  // Register buttons
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      T.rect(ctx, regX + 3 + c * 4, regY + 10 + r * 3, 3, 2, P.dark_gray);
    }
  }

  // Cash drawer visible at bottom
  T.rect(ctx, regX + 2, regY + 14, 20, 2, P.black);

  // Price gun on counter
  T.rect(ctx, cx + 40, cy + 6, 8, 6, P.yellow);
  T.rect(ctx, cx + 41, cy + 7, 6, 4, P.orange);
  T.pixel(ctx, cx + 43, cy + 8, P.black);

  // Stacked records on counter
  T.rect(ctx, cx + 52, cy + 2, 16, 12, P.black);
  for (let i = 0; i < 5; i++) {
    const stackY = cy + 11 - i * 2;
    const stackColor = [P.dark_purple, P.red, P.orange, P.yellow, P.purple][i];
    T.rect(ctx, cx + 54, stackY, 12, 2, stackColor);
  }

  // Counter base shadow visible below
  T.rect(ctx, cx, cy + ch, cw, 42, P.dark_brown);
  T.dither(ctx, cx, cy + ch, cw, 42, P.dark_brown, P.black, 0.25, 4);
}

function _drawListeningBooth(ctx, P) {
  const bx = 168;
  const by = 18;
  const bw = 38;
  const bh = 54;

  // Booth walls (3 sides visible)
  // Back wall
  T.rect(ctx, bx, by, bw, bh, P.dark_brown);
  T.dither(ctx, bx, by, bw, bh, P.dark_brown, P.black, 0.15, 4);

  // Left wall
  T.polygonFill(ctx, [
    [bx, by],
    [bx - 8, by + 6],
    [bx - 8, by + bh + 6],
    [bx, by + bh],
  ], P.brown);
  T.dither(ctx, bx - 8, by + 6, 10, bh, P.brown, P.dark_brown, 0.12, 4);

  // Right wall
  T.polygonFill(ctx, [
    [bx + bw, by],
    [bx + bw + 8, by + 6],
    [bx + bw + 8, by + bh + 6],
    [bx + bw, by + bh],
  ], P.brown);
  T.dither(ctx, bx + bw, by + 6, 10, bh, P.brown, P.dark_brown, 0.12, 4);

  // Window in booth (glass)
  T.rect(ctx, bx + 4, by + 4, bw - 8, 14, P.black);
  T.rect(ctx, bx + 5, by + 5, bw - 10, 12, P.dark_gray);
  T.dither(ctx, bx + 5, by + 5, bw - 10, 12, P.dark_gray, P.black, 0.3, 4);

  // Window frame
  T.rect(ctx, bx + 4, by + 4, bw - 8, 1, P.tan);
  T.rect(ctx, bx + 4, by + 17, bw - 8, 1, P.tan);

  // Bench inside booth
  T.rect(ctx, bx + 6, by + 40, bw - 12, 10, P.dark_gray);
  T.rect(ctx, bx + 7, by + 41, bw - 14, 8, P.gray);

  // Turntable on shelf inside
  T.rect(ctx, bx + 8, by + 22, 22, 14, P.dark_gray);
  T.rect(ctx, bx + 9, by + 23, 20, 12, P.gray);
  // Platter
  T.circleFill(ctx, bx + 19, by + 29, 7, P.black);
  T.circleFill(ctx, bx + 19, by + 29, 6, P.dark_gray);
  // Center spindle
  T.circleFill(ctx, bx + 19, by + 29, 2, P.gray);
  // Record on platter
  T.circleFill(ctx, bx + 19, by + 29, 5, P.black);
  T.pixel(ctx, bx + 17, by + 29, P.purple); // label color

  // Tonearm
  T.line(ctx, bx + 28, by + 26, bx + 21, by + 32, P.gray);
  T.pixel(ctx, bx + 21, by + 32, P.white);

  // Headphones hanging on hook
  T.rect(ctx, bx + 32, by + 8, 1, 4, P.dark_gray);
  T.circleFill(ctx, bx + 30, by + 12, 2, P.black);
  T.circleFill(ctx, bx + 34, by + 12, 2, P.black);
  T.line(ctx, bx + 30, by + 11, bx + 34, by + 11, P.dark_gray);
}

function _drawEntrance(ctx, P) {
  const ex = 0;
  const ey = 18;
  const ew = 28;
  const eh = 54;

  // Door frame
  T.rect(ctx, ex, ey, ew, eh, P.dark_brown);
  T.rect(ctx, ex + 1, ey + 1, ew - 2, eh - 2, P.brown);

  // Glass door pane
  T.rect(ctx, ex + 2, ey + 2, ew - 4, eh - 4, P.black);
  T.rect(ctx, ex + 3, ey + 3, ew - 6, eh - 6, P.dark_gray);
  T.dither(ctx, ex + 3, ey + 3, ew - 6, eh - 6, P.dark_gray, P.black, 0.25, 4);

  // Door handle
  T.rect(ctx, ex + ew - 6, ey + 30, 2, 4, P.gray);

  // "PUSH" text simulation on door
  T.rect(ctx, ex + 8, ey + 28, 10, 1, P.white);
  T.rect(ctx, ex + 9, ey + 30, 8, 1, P.white);

  // Welcome mat
  T.rect(ctx, ex + 2, ey + eh, ew + 4, 4, P.dark_red);
  T.dither(ctx, ex + 2, ey + eh, ew + 4, 4, P.dark_red, P.black, 0.3, 4);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Posters, neon sign, stickers, decorations
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Neon OPEN sign in window ---
  if (params.neonSign) {
    _drawNeonOpenSign(ctx, P);
  }

  // --- Band posters on walls ---
  _drawBandPosters(ctx, P);

  // --- Price tags and sale signs ---
  _drawSaleSigns(ctx, P);

  // --- Floor clutter ---
  _drawFloorDetails(ctx, P);

  // --- Ceiling light fixtures ---
  _drawCeilingLights(ctx, P, params);

  // --- Electrical outlets on wall ---
  T.rect(ctx, 34, 68, 4, 3, P.gray);
  T.pixel(ctx, 35, 69, P.black);
  T.pixel(ctx, 36, 69, P.black);

  // --- Fire extinguisher ---
  T.rect(ctx, 158, 60, 4, 11, P.red);
  T.pixel(ctx, 159, 59, P.dark_gray);
  T.pixel(ctx, 160, 59, P.dark_gray);
  T.rect(ctx, 158, 71, 4, 1, P.dark_gray);

  // --- Clock on wall ---
  T.circleFill(ctx, 195, 16, 5, P.black);
  T.circleFill(ctx, 195, 16, 4, P.white);
  T.circleFill(ctx, 195, 16, 1, P.black);
  // Clock hands
  T.line(ctx, 195, 16, 195, 13, P.black);
  T.line(ctx, 195, 16, 197, 16, P.black);

  // --- Shopping basket on floor ---
  T.rect(ctx, 76, 125, 14, 8, P.dark_red);
  T.rect(ctx, 77, 126, 12, 6, P.red);
  T.dither(ctx, 77, 126, 12, 6, P.red, P.dark_red, 0.2, 4);
  // Basket handle
  T.line(ctx, 78, 125, 82, 122, P.dark_gray);
  T.line(ctx, 88, 125, 84, 122, P.dark_gray);
  T.line(ctx, 82, 122, 84, 122, P.dark_gray);
}

function _drawNeonOpenSign(ctx, P) {
  const nx = 8;
  const ny = 26;

  // Sign backing
  T.rect(ctx, nx, ny, 16, 10, P.black);

  // "OPEN" neon letters using pixels
  // O
  T.pixel(ctx, nx + 3, ny + 2, P.red);
  T.pixel(ctx, nx + 4, ny + 2, P.red);
  T.pixel(ctx, nx + 2, ny + 3, P.red);
  T.pixel(ctx, nx + 5, ny + 3, P.red);
  T.pixel(ctx, nx + 2, ny + 4, P.red);
  T.pixel(ctx, nx + 5, ny + 4, P.red);
  T.pixel(ctx, nx + 2, ny + 5, P.red);
  T.pixel(ctx, nx + 5, ny + 5, P.red);
  T.pixel(ctx, nx + 3, ny + 6, P.red);
  T.pixel(ctx, nx + 4, ny + 6, P.red);

  // P
  T.pixel(ctx, nx + 7, ny + 2, P.red);
  T.pixel(ctx, nx + 8, ny + 2, P.red);
  T.pixel(ctx, nx + 7, ny + 3, P.red);
  T.pixel(ctx, nx + 9, ny + 3, P.red);
  T.pixel(ctx, nx + 7, ny + 4, P.red);
  T.pixel(ctx, nx + 8, ny + 4, P.red);
  T.pixel(ctx, nx + 7, ny + 5, P.red);
  T.pixel(ctx, nx + 7, ny + 6, P.red);

  // E
  T.pixel(ctx, nx + 11, ny + 2, P.red);
  T.pixel(ctx, nx + 12, ny + 2, P.red);
  T.pixel(ctx, nx + 13, ny + 2, P.red);
  T.pixel(ctx, nx + 11, ny + 3, P.red);
  T.pixel(ctx, nx + 11, ny + 4, P.red);
  T.pixel(ctx, nx + 12, ny + 4, P.red);
  T.pixel(ctx, nx + 11, ny + 5, P.red);
  T.pixel(ctx, nx + 11, ny + 6, P.red);
  T.pixel(ctx, nx + 12, ny + 6, P.red);
  T.pixel(ctx, nx + 13, ny + 6, P.red);

  // N
  T.pixel(ctx, nx + 2, ny + 8, P.red);
  T.pixel(ctx, nx + 2, ny + 9, P.red);
  T.pixel(ctx, nx + 3, ny + 8, P.red);
  T.pixel(ctx, nx + 4, ny + 9, P.red);
  T.pixel(ctx, nx + 5, ny + 8, P.red);
  T.pixel(ctx, nx + 5, ny + 9, P.red);
}

function _drawBandPosters(ctx, P) {
  // Poster 1 — left wall above shelves
  T.rect(ctx, 40, 14, 18, 24, P.black);
  T.rect(ctx, 41, 15, 16, 22, P.dark_purple);
  T.rect(ctx, 43, 18, 12, 8, P.purple);
  T.rect(ctx, 44, 20, 10, 4, P.orange);
  T.rect(ctx, 43, 28, 12, 2, P.yellow);
  T.rect(ctx, 44, 32, 10, 1, P.white);

  // Poster 2 — wall between booth and counter
  T.rect(ctx, 210, 16, 16, 20, P.black);
  T.rect(ctx, 211, 17, 14, 18, P.red);
  T.rect(ctx, 213, 20, 10, 6, P.yellow);
  T.rect(ctx, 213, 28, 10, 2, P.white);

  // Poster 3 — small sticker near entrance
  T.rect(ctx, 32, 56, 8, 10, P.orange);
  T.rect(ctx, 33, 57, 6, 8, P.yellow);
  T.rect(ctx, 34, 59, 4, 4, P.black);
}

function _drawSaleSigns(ctx, P) {
  // "SALE" sign on wall
  T.rect(ctx, 64, 14, 20, 8, P.yellow);
  T.rect(ctx, 65, 15, 18, 6, P.orange);
  // "SALE" text simulation
  T.rect(ctx, 67, 17, 14, 1, P.black);
  T.rect(ctx, 68, 19, 12, 1, P.black);

  // Price stickers on shelf
  for (let i = 0; i < 4; i++) {
    const sx = 20 + i * 30;
    const sy = 34 + (i % 2) * 2;
    T.rect(ctx, sx, sy, 4, 3, P.white);
    T.pixel(ctx, sx + 1, sy + 1, P.black);
    T.pixel(ctx, sx + 2, sy + 1, P.black);
  }
}

function _drawFloorDetails(ctx, P) {
  // Scattered records on floor (dropped albums)
  T.rect(ctx, 48, 114, 10, 10, P.black);
  T.rect(ctx, 49, 115, 8, 8, P.dark_purple);
  T.circleFill(ctx, 53, 119, 2, P.purple);

  T.rect(ctx, 124, 128, 9, 9, P.black);
  T.rect(ctx, 125, 129, 7, 7, P.red);
  T.circleFill(ctx, 128, 132, 2, P.orange);

  // Receipt on floor
  T.rect(ctx, 94, 120, 3, 6, P.white);
  T.pixel(ctx, 95, 121, P.black);
  T.pixel(ctx, 95, 123, P.black);
  T.pixel(ctx, 95, 125, P.black);

  // Gum wrapper
  T.rect(ctx, 180, 133, 4, 2, P.purple);

  // Dust bunny
  T.pixel(ctx, 156, 137, P.gray);
  T.pixel(ctx, 157, 137, P.gray);
  T.pixel(ctx, 156, 138, P.gray);
}

function _drawCeilingLights(ctx, P, params) {
  const isDim = params.mood === 'dim';

  // Track lighting
  for (let x = 40; x < 280; x += 70) {
    T.rect(ctx, x, 8, 5, 3, P.dark_gray);
    if (!isDim) {
      T.pixel(ctx, x + 2, 10, P.yellow);
    }
  }

  // Fluorescent tube
  T.rect(ctx, 160, 0, 30, 2, isDim ? P.dark_gray : P.gray);
  if (!isDim) {
    T.rect(ctx, 162, 1, 26, 1, P.white);
  }
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Shadows from shelves, booth, counter
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  const isDim = params.mood === 'dim';

  // --- Shelf shadows on wall ---
  for (let i = 0; i < 5; i++) {
    const sy = 20 + i * 11;
    T.scatter(ctx, 12, sy + 2, 140, 4, P.black, 0.12);
  }

  // --- Record shadows on shelves ---
  for (let i = 0; i < 5; i++) {
    const sy = 20 + i * 11;
    T.scatter(ctx, 12, sy - 8, 140, 8, P.black, 0.08);
  }

  // --- Listening booth shadow on floor ---
  if (params.hasBooth) {
    T.scatter(ctx, 160, 72, 54, 10, P.black, 0.15);
    // Booth interior shadow
    T.scatter(ctx, 168, 18, 38, 54, P.black, isDim ? 0.25 : 0.15);
  }

  // --- Counter shadow ---
  T.scatter(ctx, 220, 73, 80, 8, P.black, 0.15);
  // Under counter shadow
  T.scatter(ctx, 220, 71, 80, 4, P.black, 0.12);

  // --- Entrance shadow ---
  T.scatter(ctx, 0, 72, 30, 8, P.black, 0.1);

  // --- Corner shadows (vignette) ---
  T.scatter(ctx, 0, 0, 40, 40, P.black, 0.08);
  T.scatter(ctx, 280, 0, 40, 40, P.black, 0.08);
  T.scatter(ctx, 0, 100, 40, 40, P.black, 0.1);
  T.scatter(ctx, 280, 100, 40, 40, P.black, 0.1);

  // --- Ceiling shadow depth ---
  T.scatter(ctx, 0, 0, 320, 4, P.black, 0.12);

  // --- Floor shadow gradient (darker in back) ---
  T.scatter(ctx, 0, 73, 320, 20, P.black, 0.06);

  // --- Counter register glow ---
  T.scatterCircle(ctx, 236, 50, 15, P.dark_red, 0.05);

  // --- Neon OPEN sign glow ---
  if (params.neonSign) {
    T.scatterCircle(ctx, 16, 31, 18, P.red, isDim ? 0.04 : 0.08);
  }
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Ambient lighting, warm tones
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  const isDim = params.mood === 'dim';
  const isBright = params.mood === 'bright';

  if (isDim) {
    // --- Dim mode: heavy darkness ---
    T.scatter(ctx, 0, 0, 320, 140, P.black, 0.25);
    T.scatter(ctx, 0, 0, 320, 140, P.dark_brown, 0.03);
  } else if (isBright) {
    // --- Bright mode: well-lit ---
    T.scatter(ctx, 0, 0, 320, 140, P.tan, 0.03);
    T.scatter(ctx, 0, 0, 320, 73, P.white, 0.04);
  } else {
    // --- Normal mode: warm ambient with purple/orange tones ---
    T.scatter(ctx, 0, 0, 320, 140, P.dark_brown, 0.05);
    T.scatter(ctx, 0, 0, 320, 140, P.dark_purple, 0.02);

    // Warm pools of light from ceiling
    T.scatterCircle(ctx, 70, 30, 40, P.orange, 0.03);
    T.scatterCircle(ctx, 190, 35, 35, P.yellow, 0.03);

    // Floor reflections
    T.scatter(ctx, 40, 90, 80, 30, P.orange, 0.02);
    T.scatter(ctx, 180, 95, 60, 25, P.yellow, 0.02);
  }

  // --- Neon OPEN sign halo ---
  if (params.neonSign && !isDim) {
    T.scatterCircle(ctx, 16, 31, 25, P.red, 0.04);
    T.scatterCircle(ctx, 16, 31, 15, P.orange, 0.03);
  }

  // --- Listening booth turntable glow ---
  if (params.hasBooth && !isDim) {
    T.scatterCircle(ctx, 187, 29, 12, P.dark_purple, 0.04);
  }

  // --- Ambient dust particles ---
  const dustPositions = [
    [25, 40], [68, 55], [112, 35], [158, 50], [204, 45],
    [95, 25], [142, 60], [188, 30], [236, 55], [280, 40],
    [52, 70], [130, 22], [175, 65], [260, 48], [305, 58],
  ];
  for (const [dx, dy] of dustPositions) {
    const dustColor = isDim ? P.dark_gray : P.gray;
    T.pixel(ctx, dx, dy, dustColor);
  }

  // --- Counter area warm glow ---
  if (!isDim) {
    T.scatterCircle(ctx, 260, 55, 30, P.orange, 0.03);
  }

  // --- Entrance light spill from outside ---
  T.scatterCircle(ctx, 14, 80, 25, P.mid_gray, 0.06);
}
