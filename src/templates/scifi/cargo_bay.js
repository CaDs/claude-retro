/**
 * cargo_bay.js — Sci-fi spaceship cargo bay room template.
 *
 * Generates a large industrial cargo hold with stacked crates, metal floor
 * markings, cargo doors, overhead cranes/rails, and harsh industrial lighting.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'scifi/cargo_bay',
  name: 'Cargo Bay',
  setting: 'scifi',
  category: 'interior',
  palette: 'corridor_dark',
  params: {
    crateCount: { type: 'enum', options: ['2', '3', '4'], default: '3', label: 'Crates' },
    cargoDoorsOpen: { type: 'boolean', default: false, label: 'Cargo Doors Open' },
    craneActive: { type: 'boolean', default: true, label: 'Crane Visible' },
    hazardLights: { type: 'boolean', default: true, label: 'Hazard Lights' },
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
//  Layer 1 (BASE): Ceiling, walls, floor, cargo bay structure
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  // --- Ceiling (rows 0-18) ---
  // Dark industrial ceiling with ribbed support beams
  T.rect(ctx, 0, 0, 320, 18, P.black);

  // Support beam ribs every 4 pixels
  for (let y = 2; y < 18; y += 4) {
    T.rect(ctx, 0, y, 320, 1, P.dark_gray);
    T.rect(ctx, 0, y + 1, 320, 1, P.black);
  }

  // Ceiling I-beam structures — vertical divisions
  for (let x = 0; x < 320; x += 64) {
    T.rect(ctx, x, 0, 3, 18, P.dark_gray);
    T.rect(ctx, x + 1, 0, 1, 18, P.gray);
    T.dither(ctx, x, 0, 3, 18, P.dark_gray, P.black, 0.3, 4);
  }

  // --- Walls (rows 18-72) ---
  // Main wall area — dark blue-gray metal panels
  T.rect(ctx, 0, 18, 320, 54, P.dark_blue);
  T.dither(ctx, 0, 18, 320, 54, P.dark_blue, P.black, 0.15, 4);

  // Wall panel dividers — large industrial panels
  for (let x = 0; x < 320; x += 80) {
    T.rect(ctx, x, 18, 2, 54, P.dark_gray);
    T.rect(ctx, x, 18, 1, 54, P.gray);
  }

  // Horizontal trim lines on walls
  T.rect(ctx, 0, 18, 320, 1, P.gray);
  T.rect(ctx, 0, 45, 320, 1, P.dark_gray);
  T.rect(ctx, 0, 71, 320, 1, P.gray);

  // Wall rivets — small dots along panel edges
  for (let x = 5; x < 320; x += 80) {
    for (let y = 25; y < 70; y += 12) {
      T.pixel(ctx, x, y, P.gray);
      T.pixel(ctx, x + 1, y, P.dark_gray);
    }
  }

  // --- Floor (rows 72-140) ---
  // Heavy duty metal floor plating
  T.rect(ctx, 0, 72, 320, 68, P.dark_gray);
  T.dither(ctx, 0, 72, 320, 68, P.dark_gray, P.black, 0.25, 4);

  // Floor plate grid — horizontal seams
  for (let y = 72; y < 140; y += 12) {
    T.rect(ctx, 0, y, 320, 2, P.black);
    T.rect(ctx, 0, y + 2, 320, 1, P.gray);
  }

  // Floor plate grid — vertical seams
  for (let x = 0; x < 320; x += 32) {
    T.rect(ctx, x, 72, 2, 68, P.black);
    T.rect(ctx, x + 2, 72, 1, 68, P.dark_gray);
  }

  // Floor edge highlight
  T.rect(ctx, 0, 72, 320, 1, P.gray);

  // Floor loading zone markings — yellow caution stripes
  T.rect(ctx, 130, 72, 60, 2, P.yellow);
  T.rect(ctx, 130, 138, 60, 2, P.yellow);

  // Diagonal hazard stripes in loading zone
  for (let x = 130; x < 190; x += 8) {
    T.line(ctx, x, 74, x + 4, 78, P.yellow);
    T.line(ctx, x, 134, x + 4, 138, P.yellow);
  }

  // Recessed loading zone area
  T.rect(ctx, 135, 76, 50, 60, T.darken(P.dark_gray, 15));
  T.dither(ctx, 135, 76, 50, 60, T.darken(P.dark_gray, 15), P.black, 0.3, 4);
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Cargo crates, doors, crane, structural elements
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  const crateCount = parseInt(params.crateCount) || 3;

  // --- Cargo door (back wall center) ---
  _drawCargoDoor(ctx, P, params.cargoDoorsOpen);

  // --- Cargo crates stacked on floor ---
  _drawCargoCrates(ctx, P, crateCount);

  // --- Overhead crane/hoist system ---
  if (params.craneActive) {
    _drawOverheadCrane(ctx, P);
  }

  // --- Structural support columns ---
  _drawSupportColumns(ctx, P);

  // --- Wall-mounted equipment lockers ---
  _drawEquipmentLockers(ctx, P);
}

function _drawCargoDoor(ctx, P, isOpen) {
  const doorX = 110;
  const doorY = 22;
  const doorW = 100;
  const doorH = 50;

  // Door frame — heavy industrial frame
  T.rect(ctx, doorX - 4, doorY - 2, doorW + 8, doorH + 4, P.gray);
  T.rect(ctx, doorX - 3, doorY - 1, doorW + 6, doorH + 2, P.dark_gray);

  if (isOpen) {
    // Open door — show dark interior bay
    T.rect(ctx, doorX, doorY, doorW, doorH, P.black);

    // Interior depth shadow gradient
    for (let d = 0; d < 6; d++) {
      T.rect(ctx, doorX + d, doorY + d, doorW - d * 2, doorH - d * 2, P.black);
    }

    // Partial door panels retracted upward
    T.rect(ctx, doorX + 5, doorY - 15, doorW - 10, 12, P.gray);
    T.dither(ctx, doorX + 5, doorY - 15, doorW - 10, 12, P.gray, P.dark_gray, 0.2, 4);

    // Door panel seams
    for (let x = doorX + 10; x < doorX + doorW - 10; x += 15) {
      T.rect(ctx, x, doorY - 15, 1, 12, P.dark_gray);
    }
  } else {
    // Closed door — multi-panel design
    T.rect(ctx, doorX, doorY, doorW, doorH, P.gray);
    T.dither(ctx, doorX, doorY, doorW, doorH, P.gray, P.dark_gray, 0.2, 4);

    // Door panel seams — 5 vertical panels
    for (let i = 1; i < 5; i++) {
      const panelX = doorX + (i * doorW / 5);
      T.rect(ctx, panelX, doorY, 2, doorH, P.dark_gray);
      T.rect(ctx, panelX + 1, doorY, 1, doorH, P.black);
    }

    // Horizontal reinforcement bars
    for (let y = doorY + 10; y < doorY + doorH; y += 15) {
      T.rect(ctx, doorX, y, doorW, 2, P.dark_gray);
      T.rect(ctx, doorX, y, doorW, 1, P.black);
    }

    // Rivets along door panels
    for (let px = doorX + 8; px < doorX + doorW; px += 20) {
      for (let py = doorY + 6; py < doorY + doorH; py += 12) {
        T.pixel(ctx, px, py, P.dark_gray);
        T.pixel(ctx, px + 1, py + 1, P.gray);
      }
    }
  }

  // Door control panel beside door
  T.rect(ctx, doorX - 12, doorY + 15, 8, 18, P.dark_gray);
  T.rect(ctx, doorX - 11, doorY + 16, 6, 16, P.black);

  // Control buttons
  T.rect(ctx, doorX - 10, doorY + 18, 4, 3, isOpen ? P.green : P.red);
  T.rect(ctx, doorX - 10, doorY + 23, 4, 3, P.yellow);
  T.rect(ctx, doorX - 10, doorY + 28, 4, 3, P.blue);
}

function _drawCargoCrates(ctx, P, count) {
  const cratePositions = [
    { x: 20, y: 88, w: 42, h: 38 },
    { x: 245, y: 92, w: 38, h: 34 },
    { x: 28, y: 60, w: 36, h: 28 },  // Stacked on first crate
    { x: 200, y: 100, w: 40, h: 26 },
  ];

  for (let i = 0; i < Math.min(count, cratePositions.length); i++) {
    const crate = cratePositions[i];
    _drawSingleCrate(ctx, P, crate.x, crate.y, crate.w, crate.h, i);
  }
}

function _drawSingleCrate(ctx, P, x, y, w, h, index) {
  // Crate body — dark metal/composite material
  const crateColor = (index % 2 === 0) ? P.dark_gray : P.mid_blue;
  T.rect(ctx, x, y, w, h, crateColor);
  T.dither(ctx, x, y, w, h, crateColor, P.black, 0.2, 4);

  // Corner reinforcement brackets
  const bracketSize = 4;
  T.rect(ctx, x, y, bracketSize, bracketSize, P.gray);
  T.rect(ctx, x + w - bracketSize, y, bracketSize, bracketSize, P.gray);
  T.rect(ctx, x, y + h - bracketSize, bracketSize, bracketSize, P.gray);
  T.rect(ctx, x + w - bracketSize, y + h - bracketSize, bracketSize, bracketSize, P.gray);

  // Edge trim
  T.rect(ctx, x, y, w, 1, P.gray);
  T.rect(ctx, x, y, 1, h, P.gray);
  T.rect(ctx, x + w - 1, y, 1, h, P.dark_gray);
  T.rect(ctx, x, y + h - 1, w, 1, P.dark_gray);

  // Crate banding straps
  const midY = y + Math.floor(h / 2);
  T.rect(ctx, x, midY - 1, w, 3, P.dark_gray);
  T.rect(ctx, x, midY, w, 1, P.gray);

  // Stenciled markings — cargo number or warning symbol
  const markX = x + Math.floor(w / 2) - 8;
  const markY = y + 6;

  if (index % 3 === 0) {
    // Hazard symbol — triangle
    T.line(ctx, markX + 8, markY, markX, markY + 12, P.orange);
    T.line(ctx, markX, markY + 12, markX + 16, markY + 12, P.orange);
    T.line(ctx, markX + 16, markY + 12, markX + 8, markY, P.orange);
    T.pixel(ctx, markX + 8, markY + 6, P.orange);
    T.pixel(ctx, markX + 8, markY + 10, P.orange);
  } else {
    // Cargo ID bars
    for (let bx = 0; bx < 12; bx += 3) {
      const barH = 3 + (bx % 7);
      T.rect(ctx, markX + bx, markY, 2, barH, P.yellow);
    }
  }

  // Rivets on crate edges
  for (let ry = y + 6; ry < y + h - 6; ry += 8) {
    T.pixel(ctx, x + 2, ry, P.pale_gray);
    T.pixel(ctx, x + w - 3, ry, P.pale_gray);
  }
}

function _drawOverheadCrane(ctx, P) {
  // Crane rail running across ceiling
  const railY = 16;
  T.rect(ctx, 0, railY, 320, 2, P.gray);
  T.rect(ctx, 0, railY + 1, 320, 1, P.dark_gray);

  // Rail support brackets
  for (let x = 30; x < 320; x += 60) {
    T.rect(ctx, x, 4, 2, 14, P.dark_gray);
    T.rect(ctx, x, 4, 1, 14, P.gray);
  }

  // Crane trolley positioned at x = 140
  const trolleyX = 140;
  T.rect(ctx, trolleyX - 6, railY - 3, 12, 5, P.dark_gray);
  T.rect(ctx, trolleyX - 5, railY - 2, 10, 3, P.gray);

  // Trolley wheels
  T.pixel(ctx, trolleyX - 4, railY + 2, P.black);
  T.pixel(ctx, trolleyX + 3, railY + 2, P.black);

  // Hoist cable descending from trolley
  const cableLength = 40;
  for (let cy = railY + 3; cy < railY + cableLength; cy++) {
    T.pixel(ctx, trolleyX, cy, P.dark_gray);
  }

  // Hook at end of cable
  const hookY = railY + cableLength;
  T.rect(ctx, trolleyX - 2, hookY, 4, 6, P.gray);
  T.pixel(ctx, trolleyX - 1, hookY + 5, P.gray);
  T.pixel(ctx, trolleyX, hookY + 6, P.gray);
  T.pixel(ctx, trolleyX + 1, hookY + 5, P.gray);
}

function _drawSupportColumns(ctx, P) {
  // Heavy I-beam support columns on left and right edges
  const columns = [
    { x: 8, y: 18, h: 54 },
    { x: 308, y: 18, h: 54 },
  ];

  for (const col of columns) {
    // Column body
    T.rect(ctx, col.x, col.y, 6, col.h, P.dark_gray);
    T.dither(ctx, col.x, col.y, 6, col.h, P.dark_gray, P.black, 0.25, 4);

    // I-beam flanges
    T.rect(ctx, col.x - 1, col.y, 8, 1, P.gray);
    T.rect(ctx, col.x - 1, col.y + col.h - 1, 8, 1, P.gray);

    // Vertical highlight on left edge
    T.rect(ctx, col.x, col.y, 1, col.h, P.gray);

    // Rivets along column
    for (let ry = col.y + 8; ry < col.y + col.h - 8; ry += 12) {
      T.pixel(ctx, col.x + 2, ry, P.pale_gray);
      T.pixel(ctx, col.x + 4, ry, P.pale_gray);
    }
  }
}

function _drawEquipmentLockers(ctx, P) {
  // Wall-mounted storage lockers on left wall
  const lockerX = 18;
  const lockerY = 24;
  const lockerW = 24;
  const lockerH = 40;

  // Locker frame
  T.rect(ctx, lockerX, lockerY, lockerW, lockerH, P.dark_gray);
  T.rect(ctx, lockerX + 1, lockerY + 1, lockerW - 2, lockerH - 2, P.mid_blue);
  T.dither(ctx, lockerX + 1, lockerY + 1, lockerW - 2, lockerH - 2, P.mid_blue, P.black, 0.2, 4);

  // Locker door seam (vertical center)
  const midX = lockerX + Math.floor(lockerW / 2);
  T.rect(ctx, midX, lockerY, 1, lockerH, P.black);

  // Vent slots on locker doors
  for (let vy = lockerY + 6; vy < lockerY + lockerH - 6; vy += 3) {
    T.rect(ctx, lockerX + 4, vy, 7, 1, P.black);
    T.rect(ctx, midX + 3, vy, 7, 1, P.black);
  }

  // Lock mechanism
  T.rect(ctx, midX - 2, lockerY + lockerH - 10, 4, 4, P.dark_red);
  T.pixel(ctx, midX, lockerY + lockerH - 8, P.red);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Indicators, labels, buttons, floor details
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Overhead warning lights ---
  if (params.hazardLights) {
    for (let x = 40; x < 300; x += 80) {
      // Light housing
      T.rect(ctx, x - 3, 2, 6, 4, P.dark_gray);
      T.rect(ctx, x - 2, 3, 4, 2, P.orange);

      // Mounting bracket
      T.pixel(ctx, x, 1, P.gray);
      T.pixel(ctx, x, 6, P.gray);
    }
  }

  // --- Wall-mounted status panels ---
  _drawStatusPanel(ctx, P, 240, 26, 32, 20);
  _drawStatusPanel(ctx, P, 276, 26, 32, 20);

  // --- Floor guide strips ---
  // Yellow taxi lines for cargo movement
  for (let y = 80; y < 135; y += 20) {
    T.rect(ctx, 5, y, 50, 2, P.yellow);
    T.rect(ctx, 265, y, 50, 2, P.yellow);
  }

  // --- Floor anchor points for cargo securing ---
  const anchors = [
    [68, 96], [68, 120], [252, 96], [252, 120],
    [110, 110], [210, 110],
  ];

  for (const [ax, ay] of anchors) {
    T.rect(ctx, ax - 2, ay - 2, 5, 5, P.dark_gray);
    T.rect(ctx, ax - 1, ay - 1, 3, 3, P.black);
    T.pixel(ctx, ax, ay, P.gray);
  }

  // --- Ventilation grates on walls ---
  for (let vx = 50; vx < 100; vx += 25) {
    T.rect(ctx, vx, 56, 18, 12, P.black);
    for (let vy = 58; vy < 67; vy += 2) {
      T.rect(ctx, vx + 1, vy, 16, 1, P.dark_gray);
    }
  }

  // --- Emergency equipment markers ---
  // Fire extinguisher icon on wall
  T.rect(ctx, 290, 48, 8, 14, P.dark_red);
  T.rect(ctx, 291, 49, 6, 12, P.red);
  T.rect(ctx, 292, 47, 4, 2, P.dark_gray);

  // --- Cargo bay number stenciled on floor ---
  const bayX = 150;
  const bayY = 120;
  // "BAY 3" stencil effect
  T.rect(ctx, bayX, bayY, 3, 8, P.yellow);
  T.rect(ctx, bayX, bayY, 6, 1, P.yellow);
  T.rect(ctx, bayX, bayY + 4, 5, 1, P.yellow);
  T.rect(ctx, bayX, bayY + 8, 6, 1, P.yellow);

  T.rect(ctx, bayX + 8, bayY, 3, 8, P.yellow);
  T.rect(ctx, bayX + 8, bayY, 5, 1, P.yellow);
  T.rect(ctx, bayX + 8, bayY + 4, 4, 1, P.yellow);

  // --- Overhead cable conduits ---
  for (let cx = 100; cx < 220; cx += 60) {
    T.rect(ctx, cx, 12, 2, 6, P.dark_gray);
    T.rect(ctx, cx, 12, 1, 6, P.gray);
  }

  // --- Wall piping ---
  T.rect(ctx, 0, 38, 50, 2, P.dark_teal);
  T.rect(ctx, 0, 39, 50, 1, P.teal);
  for (let px = 5; px < 50; px += 10) {
    T.rect(ctx, px, 36, 1, 6, P.dark_gray);
  }

  // --- Caution stripes on floor edge ---
  for (let sx = 0; sx < 320; sx += 12) {
    T.rect(ctx, sx, 71, 6, 1, P.yellow);
  }

  // --- Small maintenance access hatches ---
  T.rect(ctx, 75, 125, 14, 10, P.dark_gray);
  T.rect(ctx, 76, 126, 12, 8, P.black);
  T.rect(ctx, 78, 128, 8, 4, P.dark_gray);

  // Hatch handle
  T.pixel(ctx, 82, 130, P.yellow);
  T.pixel(ctx, 83, 130, P.yellow);
}

function _drawStatusPanel(ctx, P, x, y, w, h) {
  // Panel background
  T.rect(ctx, x, y, w, h, P.black);
  T.rect(ctx, x, y, w, 1, P.gray);
  T.rect(ctx, x, y + h - 1, w, 1, P.gray);
  T.rect(ctx, x, y, 1, h, P.gray);
  T.rect(ctx, x + w - 1, y, 1, h, P.gray);

  // Status bars
  for (let by = y + 3; by < y + h - 3; by += 4) {
    const barW = 4 + ((by * 7) % (w - 10));
    T.rect(ctx, x + 3, by, barW, 2, P.teal);
  }

  // Indicator lights
  const lights = [P.green, P.yellow, P.green];
  for (let i = 0; i < lights.length; i++) {
    T.pixel(ctx, x + 3 + i * 4, y + h - 3, lights[i]);
  }
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Crate shadows, overhead lighting, ambient occlusion
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  const crateCount = parseInt(params.crateCount) || 3;

  // --- Crate shadows on floor ---
  const crateShadows = [
    { x: 18, y: 126, w: 46, h: 10 },
    { x: 243, y: 126, w: 42, h: 8 },
    { x: 26, y: 88, w: 40, h: 6 },
    { x: 198, y: 126, w: 44, h: 6 },
  ];

  for (let i = 0; i < Math.min(crateCount, crateShadows.length); i++) {
    const shadow = crateShadows[i];
    T.scatter(ctx, shadow.x, shadow.y, shadow.w, shadow.h, P.black, 0.25);
  }

  // --- Overhead crane shadow ---
  if (params.craneActive) {
    T.scatter(ctx, 135, 56, 10, 12, P.black, 0.15);
  }

  // --- General floor shadow gradient (darker at edges) ---
  T.scatter(ctx, 0, 100, 60, 40, P.black, 0.15);
  T.scatter(ctx, 260, 100, 60, 40, P.black, 0.15);

  // --- Ceiling shadow along top edge ---
  T.scatter(ctx, 0, 0, 320, 10, P.black, 0.2);

  // --- Support column shadows ---
  T.scatter(ctx, 14, 18, 8, 54, P.black, 0.12);
  T.scatter(ctx, 298, 18, 8, 54, P.black, 0.12);

  // --- Cargo door recess shadow ---
  if (!params.cargoDoorsOpen) {
    T.scatter(ctx, 106, 20, 108, 54, P.black, 0.08);
  }

  // --- Under-locker shadow ---
  T.scatter(ctx, 18, 64, 24, 4, P.black, 0.18);

  // --- Ambient occlusion in corners ---
  T.scatter(ctx, 0, 0, 30, 30, P.black, 0.15);
  T.scatter(ctx, 290, 0, 30, 30, P.black, 0.15);
  T.scatter(ctx, 0, 110, 30, 30, P.black, 0.15);
  T.scatter(ctx, 290, 110, 30, 30, P.black, 0.15);

  // --- Overhead light pools from hazard lights ---
  if (params.hazardLights) {
    for (let x = 40; x < 300; x += 80) {
      T.scatterCircle(ctx, x, 6, 25, P.orange, 0.08);
    }
  }
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Industrial haze, light spill, ambient effects
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  // --- Industrial atmosphere: cool blue-gray ambient ---
  T.scatter(ctx, 0, 0, 320, 140, P.dark_blue, 0.04);

  // --- Overhead light wash from ceiling fixtures ---
  if (params.hazardLights) {
    for (let x = 40; x < 300; x += 80) {
      T.scatterCircle(ctx, x, 20, 40, P.orange, 0.06);
    }
  }

  // --- Cargo door light spill (if open) ---
  if (params.cargoDoorsOpen) {
    T.scatterCircle(ctx, 160, 47, 70, P.light_gray, 0.05);
    T.scatter(ctx, 120, 72, 80, 30, P.pale_gray, 0.03);
  }

  // --- Status panel glow ---
  T.scatterCircle(ctx, 256, 36, 20, P.teal, 0.06);
  T.scatterCircle(ctx, 292, 36, 20, P.teal, 0.06);

  // --- Dust motes in air (suspended particles) ---
  const motePositions = [
    [65, 35], [145, 28], [225, 42], [180, 58], [95, 48],
    [255, 52], [120, 65], [200, 38], [40, 45], [280, 55],
    [110, 90], [205, 95], [75, 110], [245, 105],
  ];

  for (const [mx, my] of motePositions) {
    T.pixel(ctx, mx, my, P.pale_gray);
  }

  // --- Floor reflections from overhead lights ---
  for (let x = 40; x < 300; x += 80) {
    T.scatterCircle(ctx, x, 130, 15, P.light_gray, 0.03);
  }

  // --- Subtle vignette: darken extreme corners ---
  T.scatter(ctx, 0, 0, 25, 20, P.black, 0.08);
  T.scatter(ctx, 295, 0, 25, 20, P.black, 0.08);
  T.scatter(ctx, 0, 120, 25, 20, P.black, 0.08);
  T.scatter(ctx, 295, 120, 25, 20, P.black, 0.08);

  // --- Haze effect from floor level rising ---
  T.scatter(ctx, 0, 120, 320, 20, P.dark_gray, 0.02);
}
