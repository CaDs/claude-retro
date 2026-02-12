/**
 * warehouse.js — Contemporary industrial warehouse room template.
 *
 * Generates an industrial warehouse interior with concrete floor, metal shelving
 * with boxes, overhead fluorescent lights, loading dock door, forklift, and
 * fire extinguisher. All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'contemporary/warehouse',
  name: 'Warehouse',
  setting: 'contemporary',
  category: 'interior',
  palette: 'city_day',
  params: {
    hasForklift: { type: 'boolean', default: true, label: 'Forklift' },
    shelvingDensity: { type: 'enum', options: ['sparse', 'normal', 'dense'], default: 'normal', label: 'Shelving' },
    doorState: { type: 'enum', options: ['closed', 'open'], default: 'closed', label: 'Loading Door' },
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
//  Layer 1 (BASE): Ceiling, concrete walls, floor
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  // --- Ceiling (rows 0-20) ---
  T.rect(ctx, 0, 0, 320, 21, P.dark_gray);
  T.dither(ctx, 0, 0, 320, 21, P.dark_gray, P.gray, 0.12, 4);

  // Ceiling I-beams
  for (let bx = 50; bx < 320; bx += 90) {
    T.rect(ctx, bx, 0, 8, 21, P.gray);
    T.rect(ctx, bx, 0, 1, 21, P.light_gray);
    T.rect(ctx, bx + 7, 0, 1, 21, P.dark_gray);
  }

  // --- Walls (rows 21-75) ---
  const wallTop = 21;
  const wallHeight = 55;
  T.rect(ctx, 0, wallTop, 320, wallHeight, P.concrete);
  T.dither(ctx, 0, wallTop, 320, wallHeight, P.concrete, P.gray, 0.08, 4);

  // Concrete block pattern — horizontal seams
  for (let wy = wallTop + 12; wy < wallTop + wallHeight; wy += 12) {
    T.rect(ctx, 0, wy, 320, 1, P.gray);
  }

  // Vertical seams — staggered every other row
  const blockRows = Math.ceil(wallHeight / 12);
  for (let r = 0; r < blockRows; r++) {
    const ry = wallTop + r * 12;
    const offset = (r % 2 === 0) ? 0 : 30;
    for (let wx = offset; wx < 320; wx += 60) {
      T.rect(ctx, wx, ry, 1, 12, P.gray);
    }
  }

  // --- Concrete floor (rows 76-140) ---
  const floorY = 76;
  const floorH = 64;
  T.rect(ctx, 0, floorY, 320, floorH, P.concrete);
  T.dither(ctx, 0, floorY, 320, floorH, P.concrete, P.gray, 0.15, 4);

  // Expansion joints in concrete
  T.rect(ctx, 0, floorY + 20, 320, 1, P.dark_gray);
  T.rect(ctx, 0, floorY + 42, 320, 1, P.dark_gray);

  // Vertical expansion joint
  T.rect(ctx, 160, floorY, 1, floorH, P.dark_gray);

  // Floor cracks
  _drawFloorCrack(ctx, P, 45, floorY + 10, 25);
  _drawFloorCrack(ctx, P, 210, floorY + 32, 35);
  _drawFloorCrack(ctx, P, 120, floorY + 50, 18);

  // Oil stains on floor
  T.dither(ctx, 90, floorY + 28, 15, 12, P.concrete, P.black, 0.3, 4);
  T.dither(ctx, 240, floorY + 45, 20, 10, P.concrete, P.dark_gray, 0.25, 4);

  // Painted floor markings — yellow safety lines
  T.rect(ctx, 0, floorY + 2, 320, 2, P.yellow);
  T.rect(ctx, 0, floorY + 2, 320, 1, P.dark_yellow);
}

function _drawFloorCrack(ctx, P, x, y, length) {
  // Jagged crack line
  let cx = x;
  let cy = y;
  for (let i = 0; i < length; i++) {
    T.pixel(ctx, cx, cy, P.dark_gray);
    cx += 1;
    cy += (i % 3 === 0) ? 1 : ((i % 5 === 0) ? -1 : 0);
  }
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Shelving units, loading dock door, forklift
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- Loading dock door (right side) ---
  _drawLoadingDoor(ctx, P, params.doorState);

  // --- Shelving units ---
  const density = params.shelvingDensity;
  if (density === 'sparse') {
    _drawShelvingUnit(ctx, P, 20, 32, 40, 44);
    _drawShelvingUnit(ctx, P, 140, 38, 35, 38);
  } else if (density === 'normal') {
    _drawShelvingUnit(ctx, P, 20, 32, 40, 44);
    _drawShelvingUnit(ctx, P, 70, 36, 35, 40);
    _drawShelvingUnit(ctx, P, 140, 38, 35, 38);
  } else if (density === 'dense') {
    _drawShelvingUnit(ctx, P, 15, 30, 35, 46);
    _drawShelvingUnit(ctx, P, 55, 34, 38, 42);
    _drawShelvingUnit(ctx, P, 100, 36, 32, 40);
    _drawShelvingUnit(ctx, P, 140, 38, 35, 38);
  }

  // --- Forklift ---
  if (params.hasForklift) {
    _drawForklift(ctx, P, 200, 86);
  }

  // --- Pallet stacks on floor ---
  _drawPallet(ctx, P, 110, 96);
  _drawPallet(ctx, P, 160, 100);
}

function _drawLoadingDoor(ctx, P, doorState) {
  const dx = 260;
  const dy = 26;
  const dw = 50;
  const dh = 50;

  // Door frame
  T.rect(ctx, dx, dy, dw, dh, P.dark_gray);
  T.rect(ctx, dx - 2, dy, 2, dh, P.gray);
  T.rect(ctx, dx, dy - 2, dw, 2, P.gray);

  if (doorState === 'closed') {
    // Roll-up door — horizontal slats
    for (let sy = dy; sy < dy + dh; sy += 3) {
      T.rect(ctx, dx, sy, dw, 2, P.light_gray);
      T.rect(ctx, dx, sy, dw, 1, P.white);
      T.rect(ctx, dx, sy + 2, dw, 1, P.gray);
    }

    // Door handle at bottom center
    const handleY = dy + dh - 4;
    T.rect(ctx, dx + 22, handleY, 6, 3, P.red);
  } else {
    // Open door — view outside
    T.rect(ctx, dx, dy, dw, dh, P.light_blue);
    T.ditherGradient(ctx, dx, dy, dw, 20, P.light_blue, P.blue, 'vertical');

    // Outdoor ground visible
    T.rect(ctx, dx, dy + 40, dw, 10, P.concrete);

    // Rolled-up door at top
    T.rect(ctx, dx, dy - 6, dw, 6, P.light_gray);
    for (let sx = dx; sx < dx + dw; sx += 3) {
      T.rect(ctx, sx, dy - 6, 1, 6, P.gray);
    }
  }
}

function _drawShelvingUnit(ctx, P, x, y, w, h) {
  // Shelving frame — vertical posts
  T.rect(ctx, x, y, 2, h, P.dark_gray);
  T.rect(ctx, x + w - 2, y, 2, h, P.dark_gray);
  T.rect(ctx, x, y, 1, h, P.gray);
  T.rect(ctx, x + w - 2, y, 1, h, P.gray);

  // Horizontal shelves — 4 levels
  const shelfCount = 4;
  const shelfSpacing = Math.floor(h / shelfCount);
  for (let s = 0; s <= shelfCount; s++) {
    const sy = y + s * shelfSpacing;
    T.rect(ctx, x, sy, w, 2, P.gray);
    T.rect(ctx, x, sy, w, 1, P.light_gray);
  }

  // Boxes on shelves
  const boxColors = [P.brown, P.tan, P.dark_brown, P.red, P.blue, P.green];
  for (let s = 0; s < shelfCount; s++) {
    const shelfY = y + s * shelfSpacing + 2;
    const boxH = shelfSpacing - 4;
    let boxX = x + 2;
    let colorIdx = s * 3;

    while (boxX < x + w - 6) {
      const boxW = 6 + (colorIdx * 5) % 8;
      if (boxX + boxW > x + w - 2) break;
      const color = boxColors[colorIdx % boxColors.length];
      _drawBox(ctx, P, boxX, shelfY, boxW, Math.min(boxH, shelfSpacing - 3), color);
      boxX += boxW + 1;
      colorIdx++;
    }
  }
}

function _drawBox(ctx, P, x, y, w, h, color) {
  // Box body
  T.rect(ctx, x, y, w, h, color);
  T.dither(ctx, x, y, w, h, color, T.darken(color, 20), 0.1, 4);

  // Box edges
  T.rect(ctx, x, y, w, 1, T.lighten(color, 30));
  T.rect(ctx, x, y, 1, h, T.lighten(color, 20));
  T.rect(ctx, x + w - 1, y, 1, h, T.darken(color, 30));
  T.rect(ctx, x, y + h - 1, w, 1, T.darken(color, 30));

  // Tape on box (if wide enough)
  if (w > 8 && h > 6) {
    const tapeY = y + Math.floor(h / 2);
    T.rect(ctx, x + 1, tapeY, w - 2, 1, P.tan);
  }
}

function _drawForklift(ctx, P, x, y) {
  const fw = 30;
  const fh = 24;

  // Forklift body — main chassis
  T.rect(ctx, x, y + 10, fw, fh - 10, P.yellow);
  T.dither(ctx, x, y + 10, fw, fh - 10, P.yellow, P.dark_yellow, 0.15, 4);

  // Forklift body edges
  T.rect(ctx, x, y + 10, fw, 1, P.dark_yellow);
  T.rect(ctx, x, y + 10, 1, fh - 10, P.dark_yellow);

  // Operator cage frame
  T.rect(ctx, x + 8, y + 2, 14, 10, P.dark_gray);
  T.rect(ctx, x + 9, y + 3, 12, 8, P.blue);
  T.dither(ctx, x + 9, y + 3, 12, 8, P.blue, P.dark_blue, 0.2, 4);

  // Cage bars
  T.rect(ctx, x + 8, y + 2, 1, 10, P.gray);
  T.rect(ctx, x + 15, y + 2, 1, 10, P.gray);
  T.rect(ctx, x + 21, y + 2, 1, 10, P.gray);
  T.rect(ctx, x + 8, y + 2, 14, 1, P.gray);

  // Forks — extending forward
  const forkY = y + 16;
  T.rect(ctx, x - 10, forkY, 12, 2, P.gray);
  T.rect(ctx, x - 10, forkY + 4, 12, 2, P.gray);
  T.rect(ctx, x - 10, forkY, 12, 1, P.light_gray);
  T.rect(ctx, x - 10, forkY + 4, 12, 1, P.light_gray);

  // Mast (vertical lift structure)
  T.rect(ctx, x + 2, y, 3, 26, P.dark_gray);
  T.rect(ctx, x + 2, y, 1, 26, P.gray);

  // Wheels
  T.rect(ctx, x + 2, y + 33, 6, 5, P.black);
  T.rect(ctx, x + 3, y + 34, 4, 3, P.dark_gray);
  T.rect(ctx, x + 22, y + 33, 6, 5, P.black);
  T.rect(ctx, x + 23, y + 34, 4, 3, P.dark_gray);

  // Headlight
  T.pixel(ctx, x + 1, y + 12, P.yellow);

  // Warning stripes on body
  for (let sx = x + 4; sx < x + 24; sx += 4) {
    T.rect(ctx, sx, y + 32, 2, 2, P.black);
  }
}

function _drawPallet(ctx, P, x, y) {
  // Pallet top slats
  T.rect(ctx, x, y, 20, 2, P.brown);
  T.rect(ctx, x, y + 4, 20, 2, P.brown);
  T.rect(ctx, x, y + 8, 20, 2, P.brown);

  // Pallet supports underneath
  T.rect(ctx, x + 1, y + 10, 2, 4, P.dark_brown);
  T.rect(ctx, x + 9, y + 10, 2, 4, P.dark_brown);
  T.rect(ctx, x + 17, y + 10, 2, 4, P.dark_brown);

  // Wood grain detail
  for (let sx = x; sx < x + 20; sx += 8) {
    T.pixel(ctx, sx + 2, y + 1, P.dark_brown);
    T.pixel(ctx, sx + 5, y + 5, P.dark_brown);
  }
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Fire extinguisher, signage, lights, electrical box
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Ceiling fluorescent lights ---
  for (let lx = 80; lx < 280; lx += 80) {
    _drawCeilingLight(ctx, P, lx, 4);
  }

  // --- Fire extinguisher on wall ---
  _drawFireExtinguisher(ctx, P, 15, 50);

  // --- Electrical panel box ---
  _drawElectricalPanel(ctx, P, 240, 45);

  // --- Safety signs on wall ---
  _drawSafetySign(ctx, P, 50, 28, 'CAUTION');
  _drawSafetySign(ctx, P, 180, 24, 'EXIT');

  // --- Floor stripes near loading door ---
  for (let sx = 260; sx < 310; sx += 8) {
    T.rect(ctx, sx, 76, 4, 2, P.yellow);
    T.rect(ctx, sx + 4, 76, 4, 2, P.black);
  }

  // --- Ventilation grille on wall ---
  _drawVentGrille(ctx, P, 120, 30);

  // --- Chain hanging from ceiling ---
  for (let cy = 14; cy < 26; cy += 2) {
    T.pixel(ctx, 145, cy, P.dark_gray);
  }

  // --- Ceiling sprinkler heads ---
  for (let sx = 60; sx < 300; sx += 60) {
    T.rect(ctx, sx, 18, 3, 3, P.red);
    T.pixel(ctx, sx + 1, 19, P.dark_gray);
  }

  // --- Forklift charging station (if forklift present) ---
  if (params.hasForklift) {
    _drawChargingStation(ctx, P, 185, 65);
  }

  // --- Warehouse number stencil on floor ---
  _drawFloorStencil(ctx, P, 280, 120, 'A3');
}

function _drawCeilingLight(ctx, P, x, y) {
  // Light fixture housing
  T.rect(ctx, x, y, 28, 8, P.dark_gray);
  T.rect(ctx, x + 1, y + 1, 26, 6, P.gray);

  // Fluorescent tubes
  T.rect(ctx, x + 2, y + 2, 24, 4, P.white);
  T.dither(ctx, x + 2, y + 2, 24, 4, P.white, P.light_gray, 0.15, 4);

  // Fixture frame detail
  T.rect(ctx, x, y, 28, 1, P.light_gray);
  T.rect(ctx, x, y + 7, 28, 1, P.black);
}

function _drawFireExtinguisher(ctx, P, x, y) {
  // Wall mount bracket
  T.rect(ctx, x - 2, y - 2, 10, 2, P.dark_gray);

  // Cylinder
  T.rect(ctx, x, y, 6, 18, P.red);
  T.dither(ctx, x, y, 6, 18, P.red, P.dark_gray, 0.08, 4);
  T.rect(ctx, x, y, 1, 18, T.lighten(P.red, 30));

  // Top cap
  T.rect(ctx, x + 1, y - 3, 4, 3, P.black);

  // Handle
  T.rect(ctx, x + 2, y - 2, 2, 6, P.dark_gray);

  // Pressure gauge
  T.pixel(ctx, x + 2, y + 6, P.white);
  T.pixel(ctx, x + 3, y + 6, P.green);

  // Label
  T.rect(ctx, x + 1, y + 10, 4, 4, P.white);
  T.pixel(ctx, x + 2, y + 11, P.black);
}

function _drawElectricalPanel(ctx, P, x, y) {
  // Panel box
  T.rect(ctx, x, y, 14, 20, P.light_gray);
  T.rect(ctx, x + 1, y + 1, 12, 18, P.gray);

  // Panel door frame
  T.rect(ctx, x + 2, y + 2, 10, 16, P.dark_gray);
  T.rect(ctx, x + 3, y + 3, 8, 14, P.gray);

  // Warning label
  T.rect(ctx, x + 4, y + 4, 6, 3, P.yellow);
  T.pixel(ctx, x + 6, y + 5, P.black);
  T.pixel(ctx, x + 7, y + 5, P.black);

  // Door handle
  T.rect(ctx, x + 11, y + 10, 2, 1, P.dark_gray);

  // Breaker switches (if door is imagined open)
  for (let by = y + 8; by < y + 16; by += 3) {
    T.rect(ctx, x + 5, by, 2, 2, P.black);
    T.rect(ctx, x + 8, by, 2, 2, P.black);
  }
}

function _drawSafetySign(ctx, P, x, y, text) {
  // Sign background
  const sw = 28;
  const sh = 8;
  T.rect(ctx, x, y, sw, sh, P.yellow);
  T.rect(ctx, x + 1, y + 1, sw - 2, sh - 2, P.black);
  T.rect(ctx, x + 2, y + 2, sw - 4, sh - 4, P.yellow);

  // Text representation — abstract bars
  const barCount = text === 'EXIT' ? 3 : 5;
  for (let i = 0; i < barCount; i++) {
    const bx = x + 4 + i * 4;
    T.rect(ctx, bx, y + 3, 3, 2, P.black);
  }
}

function _drawVentGrille(ctx, P, x, y) {
  // Grille frame
  T.rect(ctx, x, y, 16, 10, P.dark_gray);
  T.rect(ctx, x + 1, y + 1, 14, 8, P.black);

  // Horizontal slats
  for (let gy = y + 2; gy < y + 9; gy += 2) {
    T.rect(ctx, x + 2, gy, 12, 1, P.gray);
  }
}

function _drawChargingStation(ctx, P, x, y) {
  // Station post
  T.rect(ctx, x, y, 8, 12, P.dark_gray);
  T.rect(ctx, x + 1, y + 1, 6, 10, P.gray);

  // Plug socket
  T.rect(ctx, x + 2, y + 4, 4, 4, P.black);
  T.pixel(ctx, x + 3, y + 5, P.yellow);
  T.pixel(ctx, x + 4, y + 5, P.yellow);

  // Power indicator light
  T.pixel(ctx, x + 4, y + 2, P.green);

  // Cable hanging
  for (let cy = y + 8; cy < y + 16; cy++) {
    T.pixel(ctx, x + 6, cy, P.black);
  }
}

function _drawFloorStencil(ctx, P, x, y, text) {
  // Large stenciled letters on floor — abstract representation
  T.rect(ctx, x, y, 6, 8, P.yellow);
  T.rect(ctx, x + 1, y + 1, 4, 2, P.concrete);
  T.rect(ctx, x + 1, y + 5, 4, 2, P.concrete);

  T.rect(ctx, x + 10, y, 6, 8, P.yellow);
  T.rect(ctx, x + 11, y + 3, 4, 2, P.concrete);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Shelving shadows, forklift shadow, depth
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  // --- Shelving unit shadows on floor ---
  if (params.shelvingDensity === 'sparse') {
    T.scatter(ctx, 18, 76, 44, 6, P.black, 0.15);
    T.scatter(ctx, 138, 76, 39, 5, P.black, 0.15);
  } else if (params.shelvingDensity === 'normal') {
    T.scatter(ctx, 18, 76, 44, 6, P.black, 0.15);
    T.scatter(ctx, 68, 76, 39, 5, P.black, 0.15);
    T.scatter(ctx, 138, 76, 39, 5, P.black, 0.15);
  } else if (params.shelvingDensity === 'dense') {
    T.scatter(ctx, 13, 76, 39, 6, P.black, 0.15);
    T.scatter(ctx, 53, 76, 42, 6, P.black, 0.15);
    T.scatter(ctx, 98, 76, 36, 5, P.black, 0.15);
    T.scatter(ctx, 138, 76, 39, 5, P.black, 0.15);
  }

  // --- Forklift shadow ---
  if (params.hasForklift) {
    T.scatter(ctx, 198, 110, 34, 10, P.black, 0.18);
  }

  // --- Pallet shadows ---
  T.scatter(ctx, 108, 110, 24, 5, P.black, 0.12);
  T.scatter(ctx, 158, 114, 24, 5, P.black, 0.12);

  // --- Loading door shadow/depth ---
  if (params.doorState === 'closed') {
    T.scatter(ctx, 260, 76, 50, 4, P.black, 0.1);
  } else {
    T.scatter(ctx, 260, 76, 50, 8, P.black, 0.08);
  }

  // --- Ceiling beam shadows on walls ---
  for (let bx = 50; bx < 320; bx += 90) {
    T.scatter(ctx, bx, 21, 8, 10, P.black, 0.08);
  }

  // --- Wall-ceiling junction shadow ---
  T.scatter(ctx, 0, 21, 320, 4, P.black, 0.1);

  // --- Floor edge shadows (perspective depth) ---
  T.scatter(ctx, 0, 76, 40, 64, P.black, 0.06);
  T.scatter(ctx, 280, 76, 40, 64, P.black, 0.06);

  // --- Electrical panel shadow ---
  T.scatter(ctx, 241, 65, 14, 2, P.black, 0.06);

  // --- Fire extinguisher shadow ---
  T.scatter(ctx, 16, 68, 6, 2, P.black, 0.06);
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Harsh industrial lighting, dust, depth haze
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  // --- Bright fluorescent wash over upper area ---
  T.scatter(ctx, 0, 0, 320, 76, P.white, 0.05);

  // --- Ceiling light pools ---
  for (let lx = 80; lx < 280; lx += 80) {
    T.scatterCircle(ctx, lx + 14, 8, 45, P.white, 0.06);
    T.scatterCircle(ctx, lx + 14, 8, 30, P.white, 0.04);
  }

  // --- Light spill on floor ---
  T.scatter(ctx, 0, 76, 320, 20, P.white, 0.04);

  // --- Floor light pools from ceiling ---
  for (let lx = 80; lx < 280; lx += 80) {
    T.scatterCircle(ctx, lx + 14, 100, 60, P.white, 0.05);
  }

  // --- Dust particles floating in air ---
  const dustPositions = [
    [30, 25], [65, 32], [95, 18], [125, 28], [155, 35],
    [185, 22], [215, 30], [245, 26], [275, 33], [110, 42],
    [140, 48], [170, 45], [200, 50], [230, 47], [85, 55],
    [50, 60], [180, 58], [260, 52], [40, 38], [290, 40],
  ];
  for (const [dx, dy] of dustPositions) {
    T.pixel(ctx, dx, dy, P.white);
  }

  // --- Outdoor light spill if door open ---
  if (params.doorState === 'open') {
    T.scatterCircle(ctx, 285, 50, 50, P.light_blue, 0.06);
    T.scatter(ctx, 260, 26, 50, 50, P.light_blue, 0.04);
    // Sunbeam through door
    T.scatter(ctx, 240, 76, 80, 40, P.yellow, 0.03);
  }

  // --- Cool blue undertone in corners ---
  T.scatter(ctx, 0, 0, 40, 76, P.dark_blue, 0.02);
  T.scatter(ctx, 280, 0, 40, 76, P.dark_blue, 0.02);

  // --- Depth haze toward back ---
  T.scatter(ctx, 0, 21, 320, 30, P.light_gray, 0.03);

  // --- Vignette darkening at edges ---
  T.scatter(ctx, 0, 0, 20, 20, P.black, 0.05);
  T.scatter(ctx, 300, 0, 20, 20, P.black, 0.05);
  T.scatter(ctx, 0, 120, 20, 20, P.black, 0.05);
  T.scatter(ctx, 300, 120, 20, 20, P.black, 0.05);

  // --- Forklift headlight glow ---
  if (params.hasForklift) {
    T.scatterCircle(ctx, 201, 98, 25, P.yellow, 0.04);
  }

  // --- Warning light glow on electrical panel ---
  T.scatterCircle(ctx, 246, 49, 12, P.yellow, 0.03);

  // --- Fire extinguisher reflective gleam ---
  T.scatterCircle(ctx, 18, 59, 8, P.red, 0.02);
}
