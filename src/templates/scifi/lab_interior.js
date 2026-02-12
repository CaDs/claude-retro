/**
 * lab_interior.js — Sci-fi science laboratory room template.
 *
 * Generates a bright, clean research lab with white/teal surfaces, workstations
 * with monitors, test tubes and equipment, examination table, and bright clinical
 * overhead lighting. All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'scifi/lab_interior',
  name: 'Lab Interior',
  setting: 'scifi',
  category: 'interior',
  palette: 'lab_bright',
  params: {
    workstationCount: { type: 'enum', options: ['2', '3', '4'], default: '3', label: 'Workstations' },
    hasExamTable: { type: 'boolean', default: true, label: 'Exam Table' },
    hasEquipment: { type: 'boolean', default: true, label: 'Lab Equipment' },
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
//  Layer 1 (BASE): Ceiling, walls, floor — clean lab environment
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  // --- Ceiling (rows 0-20) ---
  // Clean white ceiling with recessed lighting panels
  T.rect(ctx, 0, 0, 320, 20, P.off_white);

  // Ceiling panel seams — subtle gray lines
  for (let y = 4; y < 20; y += 8) {
    T.rect(ctx, 0, y, 320, 1, P.light_gray);
  }

  // Vertical ceiling panel dividers
  for (let x = 0; x < 320; x += 64) {
    T.rect(ctx, x, 0, 1, 20, P.light_gray);
  }

  // Recessed lighting panels — bright white strips
  for (let x = 20; x < 300; x += 80) {
    T.rect(ctx, x, 4, 40, 6, P.white);
    T.rect(ctx, x + 1, 5, 38, 4, P.pale_blue);

    // Subtle light panel frame
    T.rect(ctx, x, 4, 40, 1, P.light_gray);
    T.rect(ctx, x, 10, 40, 1, P.light_gray);
  }

  // --- Walls (rows 20-70) ---
  // Clean teal/white wall panels — sterile medical/lab environment
  T.rect(ctx, 0, 20, 320, 50, P.off_white);

  // Teal accent stripe across mid-wall
  T.rect(ctx, 0, 38, 320, 12, P.light_teal);
  T.rect(ctx, 0, 39, 320, 1, P.teal);
  T.rect(ctx, 0, 49, 320, 1, P.teal);

  // Wall panel vertical dividers
  for (let x = 0; x < 320; x += 60) {
    T.rect(ctx, x, 20, 1, 50, P.light_gray);
  }

  // Wall trim lines
  T.rect(ctx, 0, 20, 320, 1, P.light_gray);
  T.rect(ctx, 0, 69, 320, 1, P.teal);

  // --- Floor (rows 70-140) ---
  // Clean white tiles with subtle grid
  T.rect(ctx, 0, 70, 320, 70, P.white);

  // Tile grid — horizontal lines
  for (let y = 70; y < 140; y += 10) {
    T.rect(ctx, 0, y, 320, 1, P.light_gray);
  }

  // Tile grid — vertical lines
  for (let x = 0; x < 320; x += 16) {
    T.rect(ctx, x, 70, 1, 70, P.light_gray);
  }

  // Floor edge highlight
  T.rect(ctx, 0, 70, 320, 1, P.pale_blue);

  // Subtle dither texture on floor for non-perfect cleanliness
  T.dither(ctx, 0, 70, 320, 70, P.white, P.off_white, 0.05, 4);
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Workstations, exam table, storage cabinets, equipment
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  const workstationCount = parseInt(params.workstationCount) || 3;

  // --- Lab workstations with monitors ---
  _drawWorkstations(ctx, P, workstationCount);

  // --- Examination table ---
  if (params.hasExamTable) {
    _drawExamTable(ctx, P);
  }

  // --- Storage cabinets and shelving ---
  _drawStorageCabinets(ctx, P);

  // --- Lab equipment stands ---
  if (params.hasEquipment) {
    _drawLabEquipment(ctx, P);
  }

  // --- Wall-mounted displays ---
  _drawWallDisplays(ctx, P);
}

function _drawWorkstations(ctx, P, count) {
  const stationW = 48;
  const stationH = 22;
  const stationY = 82;
  const spacing = 8;

  const totalWidth = count * stationW + (count - 1) * spacing;
  const startX = Math.floor((320 - totalWidth) / 2);

  for (let i = 0; i < count; i++) {
    const sx = startX + i * (stationW + spacing);

    // Desk body — clean white/teal surface
    T.rect(ctx, sx, stationY, stationW, stationH, P.off_white);
    T.rect(ctx, sx, stationY, stationW, 2, P.teal);

    // Desk front panel
    T.rect(ctx, sx + 2, stationY + 2, stationW - 4, stationH - 2, P.light_gray);
    T.dither(ctx, sx + 2, stationY + 2, stationW - 4, stationH - 2, P.light_gray, P.gray, 0.1, 4);

    // Monitor on desk
    const monW = 26;
    const monH = 18;
    const monX = sx + Math.floor((stationW - monW) / 2);
    const monY = stationY - 20;

    // Monitor base stand
    T.rect(ctx, monX + 10, stationY - 2, 6, 3, P.gray);

    // Monitor frame
    T.rect(ctx, monX, monY, monW, monH, P.dark_gray);
    T.rect(ctx, monX + 1, monY + 1, monW - 2, monH - 2, P.gray);

    // Monitor screen
    T.rect(ctx, monX + 2, monY + 2, monW - 4, monH - 4, P.dark_teal);

    // Screen content — data readout
    const screenColor = (i % 2 === 0) ? P.teal : P.light_green;
    for (let ly = monY + 4; ly < monY + monH - 4; ly += 2) {
      const lineW = 3 + ((ly * 11 + i * 7) % (monW - 10));
      T.rect(ctx, monX + 4, ly, lineW, 1, screenColor);
    }

    // Graph or waveform on one monitor
    if (i === 1) {
      for (let gx = monX + 4; gx < monX + monW - 4; gx += 2) {
        const gy = monY + 8 + Math.floor(Math.sin(gx * 0.3) * 3);
        T.pixel(ctx, gx, gy, P.green);
      }
    }

    // Keyboard on desk surface
    const keyW = 18;
    const keyH = 4;
    const keyX = sx + Math.floor((stationW - keyW) / 2);
    const keyY = stationY + 4;
    T.rect(ctx, keyX, keyY, keyW, keyH, P.gray);
    T.dither(ctx, keyX, keyY, keyW, keyH, P.gray, P.dark_gray, 0.15, 4);

    // Key detail lines
    for (let kx = keyX + 2; kx < keyX + keyW - 2; kx += 2) {
      T.pixel(ctx, kx, keyY + 1, P.dark_gray);
      T.pixel(ctx, kx, keyY + 3, P.dark_gray);
    }

    // Mouse beside keyboard
    T.rect(ctx, keyX + keyW + 2, keyY + 1, 3, 2, P.light_gray);

    // Desk storage drawer handles
    T.rect(ctx, sx + 8, stationY + 12, 4, 2, P.dark_gray);
    T.rect(ctx, sx + stationW - 12, stationY + 12, 4, 2, P.dark_gray);
  }
}

function _drawExamTable(ctx, P) {
  const tableX = 240;
  const tableY = 95;
  const tableW = 60;
  const tableH = 24;

  // Table surface
  T.rect(ctx, tableX, tableY, tableW, tableH, P.off_white);
  T.rect(ctx, tableX, tableY, tableW, 2, P.light_gray);

  // Table padding — simulated cushion texture
  T.dither(ctx, tableX + 2, tableY + 2, tableW - 4, tableH - 4, P.off_white, P.pale_blue, 0.1, 4);

  // Table legs — adjustable medical table base
  T.rect(ctx, tableX + 10, tableY + tableH, 4, 8, P.gray);
  T.rect(ctx, tableX + tableW - 14, tableY + tableH, 4, 8, P.gray);

  // Center support column
  T.rect(ctx, tableX + 26, tableY + tableH, 8, 12, P.gray);
  T.rect(ctx, tableX + 27, tableY + tableH, 6, 10, P.light_gray);

  // Hydraulic base
  T.rect(ctx, tableX + 20, tableY + tableH + 12, 20, 3, P.dark_gray);

  // Side rail for equipment attachment
  T.rect(ctx, tableX - 2, tableY + 6, 2, 12, P.gray);

  // Overhead articulating arm mount point
  T.rect(ctx, tableX + tableW + 2, tableY - 8, 4, 10, P.gray);
  T.rect(ctx, tableX + tableW + 3, tableY - 18, 2, 10, P.gray);
}

function _drawStorageCabinets(ctx, P) {
  // Wall-mounted storage on left side
  const cabX = 8;
  const cabY = 30;
  const cabW = 40;
  const cabH = 36;

  // Cabinet body
  T.rect(ctx, cabX, cabY, cabW, cabH, P.off_white);
  T.rect(ctx, cabX, cabY, cabW, 1, P.teal);
  T.rect(ctx, cabX, cabY + cabH - 1, cabW, 1, P.teal);

  // Cabinet door seams (3 compartments stacked)
  const compH = Math.floor(cabH / 3);
  for (let i = 1; i < 3; i++) {
    T.rect(ctx, cabX, cabY + i * compH, cabW, 1, P.light_gray);
  }

  // Door handles
  for (let i = 0; i < 3; i++) {
    const handleY = cabY + i * compH + Math.floor(compH / 2);
    T.rect(ctx, cabX + cabW - 6, handleY, 3, 2, P.gray);
  }

  // Glass window in top compartment — view of stored items
  T.rect(ctx, cabX + 4, cabY + 4, cabW - 8, compH - 8, P.pale_blue);
  T.dither(ctx, cabX + 4, cabY + 4, cabW - 8, compH - 8, P.pale_blue, P.light_teal, 0.2, 4);

  // Items visible through glass — test tubes
  for (let tx = cabX + 8; tx < cabX + cabW - 8; tx += 6) {
    T.rect(ctx, tx, cabY + 8, 2, 6, P.teal);
    T.pixel(ctx, tx, cabY + 7, P.light_green);
  }
}

function _drawLabEquipment(ctx, P) {
  // Equipment stand with beakers and instruments
  const standX = 18;
  const standY = 100;

  // Stand cart
  T.rect(ctx, standX, standY, 32, 20, P.light_gray);
  T.rect(ctx, standX, standY, 32, 1, P.gray);

  // Cart legs with wheels
  T.rect(ctx, standX + 2, standY + 20, 2, 8, P.gray);
  T.rect(ctx, standX + 28, standY + 20, 2, 8, P.gray);
  T.pixel(ctx, standX + 2, standY + 28, P.black);
  T.pixel(ctx, standX + 29, standY + 28, P.black);

  // Beakers on cart — various sizes
  _drawBeaker(ctx, P, standX + 4, standY + 4, 8, 12, P.teal);
  _drawBeaker(ctx, P, standX + 14, standY + 6, 6, 10, P.light_green);
  _drawBeaker(ctx, P, standX + 22, standY + 5, 7, 11, P.orange);

  // Microscope on right side of room
  _drawMicroscope(ctx, P, 280, 96);
}

function _drawBeaker(ctx, P, x, y, w, h, liquidColor) {
  // Beaker glass body
  T.rect(ctx, x, y, w, h, P.pale_blue);
  T.rect(ctx, x + 1, y + 1, w - 2, h - 2, P.off_white);

  // Liquid level
  const liquidLevel = Math.floor(h * 0.6);
  const liquidY = y + h - liquidLevel;
  T.rect(ctx, x + 1, liquidY, w - 2, liquidLevel - 1, liquidColor);

  // Liquid surface highlight
  T.rect(ctx, x + 1, liquidY, w - 2, 1, T.lighten(liquidColor, 40));

  // Glass edge highlights
  T.rect(ctx, x, y, 1, h, P.light_gray);
  T.rect(ctx, x + w - 1, y, 1, h, P.pale_blue);

  // Volume markings
  for (let my = y + 3; my < y + h - 2; my += 3) {
    T.pixel(ctx, x + 1, my, P.light_gray);
  }
}

function _drawMicroscope(ctx, P, x, y) {
  // Base
  T.rect(ctx, x, y + 20, 18, 4, P.dark_gray);
  T.rect(ctx, x + 1, y + 21, 16, 2, P.gray);

  // Stand column
  T.rect(ctx, x + 8, y + 6, 2, 14, P.gray);

  // Stage (slide platform)
  T.rect(ctx, x + 4, y + 12, 10, 2, P.light_gray);

  // Objective lenses
  T.rect(ctx, x + 7, y + 8, 4, 4, P.dark_gray);

  // Eyepiece tube
  T.rect(ctx, x + 10, y, 3, 8, P.gray);
  T.rect(ctx, x + 10, y, 3, 1, P.light_gray);

  // Focus knobs
  T.pixel(ctx, x + 6, y + 14, P.dark_teal);
  T.pixel(ctx, x + 12, y + 14, P.dark_teal);
}

function _drawWallDisplays(ctx, P) {
  // Large wall-mounted display screen
  const dispX = 220;
  const dispY = 24;
  const dispW = 60;
  const dispH = 40;

  // Display frame
  T.rect(ctx, dispX, dispY, dispW, dispH, P.gray);
  T.rect(ctx, dispX + 1, dispY + 1, dispW - 2, dispH - 2, P.light_gray);

  // Screen area
  T.rect(ctx, dispX + 2, dispY + 2, dispW - 4, dispH - 4, P.dark_teal);

  // Screen content — medical scan or data visualization
  // Header bar
  T.rect(ctx, dispX + 3, dispY + 3, dispW - 6, 3, P.teal);

  // Data grid
  for (let gy = dispY + 8; gy < dispY + dispH - 4; gy += 6) {
    for (let gx = dispX + 6; gx < dispX + dispW - 6; gx += 8) {
      const cellColor = ((gx + gy) % 16 === 0) ? P.light_green : P.teal;
      T.rect(ctx, gx, gy, 6, 4, cellColor);
    }
  }

  // Graph overlay
  for (let gx = dispX + 6; gx < dispX + dispW - 6; gx++) {
    const gy = dispY + 20 + Math.floor(Math.sin(gx * 0.2) * 6);
    T.pixel(ctx, gx, gy, P.green);
  }
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Buttons, indicators, labels, small objects
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Ceiling air vents ---
  for (let vx = 100; vx < 220; vx += 60) {
    T.rect(ctx, vx, 12, 20, 6, P.light_gray);
    for (let vy = 13; vy < 17; vy++) {
      T.rect(ctx, vx + 1, vy, 18, 1, P.gray);
    }
  }

  // --- Wall-mounted emergency equipment ---
  // Eye wash station
  T.rect(ctx, 4, 54, 10, 12, P.light_green);
  T.rect(ctx, 5, 55, 8, 10, P.green);
  T.pixel(ctx, 8, 58, P.white);
  T.pixel(ctx, 9, 58, P.white);

  // First aid kit
  T.rect(ctx, 310, 54, 8, 10, P.white);
  T.rect(ctx, 311, 55, 6, 8, P.off_white);
  T.rect(ctx, 313, 57, 2, 4, P.dark_red);
  T.rect(ctx, 312, 58, 4, 2, P.dark_red);

  // --- Floor-mounted power outlets ---
  for (let ox = 40; ox < 280; ox += 80) {
    T.rect(ctx, ox, 136, 6, 3, P.gray);
    T.pixel(ctx, ox + 2, 137, P.black);
    T.pixel(ctx, ox + 4, 137, P.black);
  }

  // --- Test tube rack on workstation ---
  const rackX = 60;
  const rackY = 88;
  T.rect(ctx, rackX, rackY, 16, 4, P.gray);

  // Test tubes in rack
  for (let i = 0; i < 5; i++) {
    const tubeX = rackX + 2 + i * 3;
    const tubeColors = [P.teal, P.light_green, P.orange, P.yellow, P.pale_blue];
    T.rect(ctx, tubeX, rackY - 6, 2, 6, P.pale_blue);
    T.rect(ctx, tubeX, rackY - 4, 2, 4, tubeColors[i]);
    T.pixel(ctx, tubeX, rackY - 6, P.light_gray);
  }

  // --- Petri dishes ---
  T.circleFill(ctx, 95, 88, 4, P.pale_blue);
  T.circleFill(ctx, 95, 88, 3, P.off_white);
  T.pixel(ctx, 93, 86, P.light_green);
  T.pixel(ctx, 96, 88, P.light_green);

  // --- Status indicator lights on walls ---
  const statusLights = [
    [58, 24], [118, 24], [178, 24],
  ];

  for (const [lx, ly] of statusLights) {
    T.rect(ctx, lx, ly, 4, 4, P.dark_gray);
    T.rect(ctx, lx + 1, ly + 1, 2, 2, P.green);
  }

  // --- Caution tape boundary on floor ---
  for (let tx = 230; tx < 310; tx += 12) {
    T.rect(ctx, tx, 92, 6, 1, P.yellow);
    T.rect(ctx, tx + 6, 92, 6, 1, P.black);
  }

  // --- Lab safety signs on walls ---
  // Biohazard symbol simplified
  T.rect(ctx, 296, 34, 12, 12, P.orange);
  T.ellipse(ctx, 302, 40, 3, 3, P.black);
  T.pixel(ctx, 302, 36, P.black);
  T.pixel(ctx, 299, 42, P.black);
  T.pixel(ctx, 305, 42, P.black);

  // --- Paper notes/clipboards on workstations ---
  T.rect(ctx, 125, 85, 8, 6, P.white);
  T.rect(ctx, 126, 86, 6, 4, P.off_white);
  T.rect(ctx, 127, 87, 4, 1, P.dark_gray);
  T.rect(ctx, 127, 89, 4, 1, P.dark_gray);

  // --- Pipettes in holder ---
  T.rect(ctx, 210, 86, 6, 3, P.gray);
  for (let i = 0; i < 3; i++) {
    T.rect(ctx, 211 + i * 2, 80, 1, 6, P.pale_blue);
    T.pixel(ctx, 211 + i * 2, 79, P.orange);
  }

  // --- Floor drainage grate ---
  T.rect(ctx, 160, 128, 12, 8, P.gray);
  T.rect(ctx, 161, 129, 10, 6, P.black);
  for (let gx = 162; gx < 170; gx += 2) {
    T.rect(ctx, gx, 130, 1, 4, P.dark_gray);
  }

  // --- Lab coat hook on wall ---
  T.rect(ctx, 192, 52, 8, 2, P.gray);
  T.pixel(ctx, 196, 54, P.off_white);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Equipment shadows, under-table darkness, ambient occlusion
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  const workstationCount = parseInt(params.workstationCount) || 3;

  // --- Workstation shadows on floor ---
  const stationW = 48;
  const spacing = 8;
  const totalWidth = workstationCount * stationW + (workstationCount - 1) * spacing;
  const startX = Math.floor((320 - totalWidth) / 2);

  for (let i = 0; i < workstationCount; i++) {
    const sx = startX + i * (stationW + spacing);
    T.scatter(ctx, sx, 104, stationW, 8, P.black, 0.15);
  }

  // --- Exam table shadow ---
  if (params.hasExamTable) {
    T.scatter(ctx, 238, 119, 64, 10, P.black, 0.18);
  }

  // --- Storage cabinet wall shadow ---
  T.scatter(ctx, 6, 66, 44, 6, P.black, 0.12);

  // --- Equipment stand shadow ---
  if (params.hasEquipment) {
    T.scatter(ctx, 16, 120, 36, 8, P.black, 0.2);
  }

  // --- General floor shadow gradient (edges darker) ---
  T.scatter(ctx, 0, 110, 40, 30, P.black, 0.08);
  T.scatter(ctx, 280, 110, 40, 30, P.black, 0.08);

  // --- Wall display mount shadow ---
  T.scatter(ctx, 218, 64, 64, 6, P.black, 0.1);

  // --- Subtle ceiling shadow along edges ---
  T.scatter(ctx, 0, 0, 320, 4, P.black, 0.06);

  // --- Under-workstation darkness ---
  for (let i = 0; i < workstationCount; i++) {
    const sx = startX + i * (stationW + spacing);
    T.scatter(ctx, sx + 2, 96, stationW - 4, 8, P.black, 0.25);
  }
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Clinical lighting, clean ambient, subtle reflections
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  // --- Bright clinical lighting: cool white-blue ambient wash ---
  T.scatter(ctx, 0, 0, 320, 140, P.pale_blue, 0.02);

  // --- Overhead light panels — strong downward illumination pools ---
  for (let x = 20; x < 300; x += 80) {
    T.scatterCircle(ctx, x + 20, 10, 35, P.white, 0.08);
    T.scatterCircle(ctx, x + 20, 50, 50, P.pale_blue, 0.05);
  }

  // --- Monitor screen glow onto workstations ---
  const workstationCount = parseInt(params.workstationCount) || 3;
  const stationW = 48;
  const spacing = 8;
  const totalWidth = workstationCount * stationW + (workstationCount - 1) * spacing;
  const startX = Math.floor((320 - totalWidth) / 2);

  for (let i = 0; i < workstationCount; i++) {
    const sx = startX + i * (stationW + spacing) + Math.floor(stationW / 2);
    const glowColor = (i % 2 === 0) ? P.teal : P.light_green;
    T.scatterCircle(ctx, sx, 72, 25, glowColor, 0.06);
  }

  // --- Wall display glow ---
  T.scatterCircle(ctx, 250, 44, 40, P.teal, 0.08);

  // --- Floor reflections from overhead lights (clean, polished tiles) ---
  for (let x = 20; x < 300; x += 80) {
    T.scatterCircle(ctx, x + 20, 130, 18, P.white, 0.04);
  }

  // --- Subtle teal accent wash in lower half (reflects wall stripe) ---
  T.scatter(ctx, 0, 70, 320, 70, P.light_teal, 0.015);

  // --- Dust motes suspended in bright light beams ---
  const motePositions = [
    [55, 32], [130, 28], [205, 35], [175, 48], [90, 42],
    [245, 38], [110, 56], [195, 52], [30, 45], [290, 50],
    [65, 85], [155, 90], [220, 95], [280, 88],
  ];

  for (const [mx, my] of motePositions) {
    T.pixel(ctx, mx, my, P.white);
  }

  // --- Subtle vignette: very light darkening at corners ---
  T.scatter(ctx, 0, 0, 30, 25, P.black, 0.03);
  T.scatter(ctx, 290, 0, 30, 25, P.black, 0.03);
  T.scatter(ctx, 0, 115, 30, 25, P.black, 0.03);
  T.scatter(ctx, 290, 115, 30, 25, P.black, 0.03);

  // --- Equipment glow effects ---
  if (params.hasEquipment) {
    // Beaker liquid glow
    T.scatterCircle(ctx, 22, 110, 12, P.teal, 0.05);
    T.scatterCircle(ctx, 32, 112, 10, P.light_green, 0.05);
  }

  // --- Storage cabinet glass reflection ---
  T.scatter(ctx, 12, 34, 32, 12, P.pale_blue, 0.04);
}
