/**
 * office.js — Contemporary office interior room template.
 *
 * Generates a modern office space with cubicle walls, desks with monitors,
 * office chairs, fluorescent ceiling lights, water cooler, carpet floor, whiteboard.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'contemporary/office',
  name: 'Office',
  setting: 'contemporary',
  category: 'interior',
  palette: 'office_bright',
  params: {
    cubicleLayout: { type: 'enum', options: ['single', 'double', 'triple'], default: 'double', label: 'Cubicles' },
    hasWaterCooler: { type: 'boolean', default: true, label: 'Water Cooler' },
    hasWhiteboard: { type: 'boolean', default: true, label: 'Whiteboard' },
    carpetColor: { type: 'enum', options: ['blue', 'gray', 'brown'], default: 'blue', label: 'Carpet' },
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
//  Layer 1 (BASE): Ceiling, walls, carpet floor
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  // --- Ceiling with fluorescent light panels (rows 0-18) ---
  T.rect(ctx, 0, 0, 320, 18, P.white);
  T.dither(ctx, 0, 0, 320, 18, P.white, P.light_gray, 0.04, 4);

  // Fluorescent light panels — bright rectangles
  _drawFluorescentPanel(ctx, P, 40, 4, 60, 10);
  _drawFluorescentPanel(ctx, P, 140, 4, 60, 10);
  _drawFluorescentPanel(ctx, P, 240, 4, 60, 10);

  // Ceiling grid lines
  for (let x = 0; x < 320; x += 80) {
    T.rect(ctx, x, 0, 1, 18, P.light_gray);
  }

  // --- Walls (rows 18-72) ---
  const wallColor = P.off_white || P.white;
  T.rect(ctx, 0, 18, 320, 54, wallColor);
  T.dither(ctx, 0, 18, 320, 54, wallColor, P.light_gray, 0.03, 4);

  // Crown molding at ceiling junction
  T.rect(ctx, 0, 17, 320, 1, P.light_gray);
  T.rect(ctx, 0, 18, 320, 1, P.pale_blue);

  // Baseboard at floor junction
  T.rect(ctx, 0, 70, 320, 1, P.light_gray);
  T.rect(ctx, 0, 71, 320, 1, P.white);

  // --- Carpet floor (rows 72-140) ---
  const carpetColors = {
    blue: P.pale_blue || P.light_blue,
    gray: P.light_gray,
    brown: P.tan,
  };
  const carpetBase = carpetColors[params.carpetColor] || P.pale_blue;
  const carpetDark = T.darken(carpetBase, 15);

  T.rect(ctx, 0, 72, 320, 68, carpetBase);
  T.dither(ctx, 0, 72, 320, 68, carpetBase, carpetDark, 0.12, 4);

  // Carpet tile seams
  for (let y = 72; y < 140; y += 17) {
    T.rect(ctx, 0, y, 320, 1, carpetDark);
  }
  for (let x = 0; x < 320; x += 40) {
    T.rect(ctx, x, 72, 1, 68, carpetDark);
  }
}

function _drawFluorescentPanel(ctx, P, x, y, w, h) {
  // Panel frame
  T.rect(ctx, x, y, w, h, P.light_gray);

  // Bright light area
  T.rect(ctx, x + 1, y + 1, w - 2, h - 2, P.white);

  // Grid pattern inside
  const midX = x + Math.floor(w / 2);
  const midY = y + Math.floor(h / 2);
  T.rect(ctx, midX, y + 1, 1, h - 2, P.light_gray);
  T.rect(ctx, x + 1, midY, w - 2, 1, P.light_gray);
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Cubicle walls, desks, chairs, water cooler
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- Cubicles based on layout param ---
  if (params.cubicleLayout === 'single') {
    _drawCubicle(ctx, P, 30, 38, 'left');
  } else if (params.cubicleLayout === 'double') {
    _drawCubicle(ctx, P, 20, 38, 'left');
    _drawCubicle(ctx, P, 140, 38, 'right');
  } else if (params.cubicleLayout === 'triple') {
    _drawCubicle(ctx, P, 10, 38, 'left');
    _drawCubicle(ctx, P, 120, 38, 'center');
    _drawCubicle(ctx, P, 230, 38, 'right');
  }

  // --- Water cooler ---
  if (params.hasWaterCooler) {
    _drawWaterCooler(ctx, P, 280, 46);
  }

  // --- Whiteboard on wall ---
  if (params.hasWhiteboard) {
    _drawWhiteboard(ctx, P, 200, 24);
  }

  // --- Door (right edge) ---
  _drawOfficeDoor(ctx, P);
}

function _drawCubicle(ctx, P, x, y, position) {
  const wallH = 28;
  const wallW = 70;

  // Cubicle walls — three sides
  // Back wall
  T.rect(ctx, x, y, wallW, wallH, P.gray);
  T.rect(ctx, x + 1, y + 1, wallW - 2, wallH - 2, P.light_gray);
  T.dither(ctx, x + 1, y + 1, wallW - 2, wallH - 2, P.light_gray, P.gray, 0.08, 4);

  // Left wall
  T.rect(ctx, x, y, 2, wallH, P.gray);
  T.rect(ctx, x + 1, y + 1, 1, wallH - 2, P.light_gray);

  // Right wall
  T.rect(ctx, x + wallW - 2, y, 2, wallH, P.gray);
  T.rect(ctx, x + wallW - 2, y + 1, 1, wallH - 2, P.light_gray);

  // --- Desk ---
  _drawDesk(ctx, P, x + 8, y + 20);

  // --- Office chair ---
  _drawOfficeChair(ctx, P, x + 25, y + 36);

  // --- Monitor on desk ---
  _drawMonitor(ctx, P, x + 18, y + 14);

  // --- Keyboard ---
  T.rect(ctx, x + 14, y + 26, 10, 3, P.dark_gray);
  T.dither(ctx, x + 14, y + 26, 10, 3, P.dark_gray, P.gray, 0.15, 2);

  // --- Mouse ---
  T.rect(ctx, x + 26, y + 26, 3, 2, P.gray);
  T.pixel(ctx, x + 27, y + 27, P.red); // LED

  // --- Nameplate on cubicle wall ---
  T.rect(ctx, x + 4, y + 4, 14, 4, P.white);
  T.rect(ctx, x + 5, y + 5, 12, 2, P.blue);

  // --- Cork board ---
  T.rect(ctx, x + 25, y + 4, 18, 12, P.tan);
  T.dither(ctx, x + 25, y + 4, 18, 12, P.tan, P.brown, 0.25, 4);

  // Pinned notes on cork board
  T.rect(ctx, x + 27, y + 6, 6, 4, P.yellow);
  T.rect(ctx, x + 35, y + 8, 5, 5, P.white);
  T.pixel(ctx, x + 28, y + 7, P.red); // Push pin
  T.pixel(ctx, x + 36, y + 9, P.blue); // Push pin
}

function _drawDesk(ctx, P, x, y) {
  // Desktop surface
  T.rect(ctx, x, y, 50, 16, P.brown);
  T.rect(ctx, x, y, 50, 1, P.tan);
  T.dither(ctx, x, y, 50, 16, P.brown, P.dark_brown, 0.08, 4);

  // Desk legs
  T.rect(ctx, x + 2, y + 14, 3, 26, P.dark_gray);
  T.rect(ctx, x + 45, y + 14, 3, 26, P.dark_gray);

  // Drawer handle
  T.rect(ctx, x + 22, y + 10, 6, 1, P.dark_gray);
}

function _drawMonitor(ctx, P, x, y) {
  // Monitor bezel
  T.rect(ctx, x, y, 20, 14, P.black);
  T.rect(ctx, x + 1, y + 1, 18, 12, P.dark_gray);

  // Screen — lit blue
  T.rect(ctx, x + 2, y + 2, 16, 10, P.dark_blue);
  T.rect(ctx, x + 3, y + 3, 14, 8, P.blue);

  // Screen content — abstract UI elements
  T.rect(ctx, x + 4, y + 4, 12, 1, P.white);
  T.rect(ctx, x + 4, y + 6, 8, 1, P.light_gray);
  T.rect(ctx, x + 4, y + 8, 6, 1, P.light_gray);
  T.pixel(ctx, x + 14, y + 7, P.green); // Status indicator

  // Screen glare
  T.rect(ctx, x + 3, y + 3, 4, 2, P.light_blue);
  T.pixel(ctx, x + 4, y + 4, P.white);

  // Stand
  T.rect(ctx, x + 8, y + 14, 4, 3, P.dark_gray);
  T.rect(ctx, x + 6, y + 17, 8, 2, P.gray);
}

function _drawOfficeChair(ctx, P, x, y) {
  // Seat
  T.rect(ctx, x, y + 8, 14, 8, P.dark_blue);
  T.dither(ctx, x, y + 8, 14, 8, P.dark_blue, P.blue, 0.15, 4);
  T.rect(ctx, x, y + 8, 14, 1, P.blue);

  // Backrest
  T.rect(ctx, x + 2, y, 10, 10, P.dark_blue);
  T.dither(ctx, x + 2, y, 10, 10, P.dark_blue, P.blue, 0.15, 4);
  T.rect(ctx, x + 2, y, 10, 1, P.blue);

  // Armrests
  T.rect(ctx, x - 1, y + 7, 3, 6, P.black);
  T.rect(ctx, x + 12, y + 7, 3, 6, P.black);

  // Central pole
  T.rect(ctx, x + 6, y + 16, 2, 8, P.dark_gray);

  // Wheel base — 5-star approximation
  T.rect(ctx, x + 2, y + 23, 10, 2, P.gray);
  T.rect(ctx, x + 6, y + 22, 2, 3, P.gray);
  T.pixel(ctx, x + 3, y + 24, P.dark_gray); // Wheel
  T.pixel(ctx, x + 10, y + 24, P.dark_gray); // Wheel
}

function _drawWaterCooler(ctx, P, x, y) {
  // Base cabinet
  T.rect(ctx, x, y + 18, 16, 16, P.gray);
  T.rect(ctx, x + 1, y + 19, 14, 14, P.light_gray);

  // Cabinet door
  T.rect(ctx, x + 3, y + 21, 10, 10, P.white);
  T.rect(ctx, x + 4, y + 22, 8, 8, P.light_gray);
  T.pixel(ctx, x + 11, y + 26, P.dark_gray); // Handle

  // Water bottle holder top
  T.rect(ctx, x + 2, y + 14, 12, 4, P.dark_gray);

  // Water bottle (5-gallon jug)
  T.rect(ctx, x + 3, y + 4, 10, 10, P.light_blue);
  T.dither(ctx, x + 3, y + 4, 10, 10, P.light_blue, P.blue, 0.2, 4);

  // Water inside
  T.rect(ctx, x + 4, y + 8, 8, 6, P.blue);

  // Bottle neck
  T.rect(ctx, x + 6, y + 2, 4, 2, P.light_blue);

  // Highlights on bottle
  T.rect(ctx, x + 4, y + 5, 2, 4, P.white);
  T.pixel(ctx, x + 5, y + 6, P.white);

  // Dispenser taps
  T.pixel(ctx, x + 5, y + 16, P.blue); // Cold tap
  T.pixel(ctx, x + 10, y + 16, P.red); // Hot tap
}

function _drawWhiteboard(ctx, P, x, y) {
  // Frame
  T.rect(ctx, x, y, 60, 30, P.dark_gray);
  T.rect(ctx, x + 1, y + 1, 58, 28, P.gray);

  // White surface
  T.rect(ctx, x + 2, y + 2, 56, 26, P.white);
  T.dither(ctx, x + 2, y + 2, 56, 26, P.white, P.off_white, 0.05, 4);

  // Marker writing — abstract diagrams
  // Flowchart boxes
  T.rect(ctx, x + 6, y + 6, 10, 6, P.blue);
  T.rect(ctx, x + 7, y + 7, 8, 4, P.white);

  T.rect(ctx, x + 24, y + 8, 12, 6, P.blue);
  T.rect(ctx, x + 25, y + 9, 10, 4, P.white);

  T.rect(ctx, x + 44, y + 7, 10, 6, P.blue);
  T.rect(ctx, x + 45, y + 8, 8, 4, P.white);

  // Connecting arrows
  T.line(ctx, x + 16, y + 9, x + 24, y + 11, P.black);
  T.line(ctx, x + 36, y + 11, x + 44, y + 10, P.black);
  T.pixel(ctx, x + 24, y + 11, P.black); // Arrow head
  T.pixel(ctx, x + 44, y + 10, P.black);

  // Notes in red
  T.rect(ctx, x + 8, y + 18, 16, 1, P.red);
  T.rect(ctx, x + 8, y + 20, 12, 1, P.red);
  T.rect(ctx, x + 8, y + 22, 10, 1, P.red);

  // Bullet points in green
  T.pixel(ctx, x + 32, y + 18, P.green);
  T.rect(ctx, x + 34, y + 18, 8, 1, P.black);
  T.pixel(ctx, x + 32, y + 21, P.green);
  T.rect(ctx, x + 34, y + 21, 10, 1, P.black);

  // Marker tray
  T.rect(ctx, x + 1, y + 29, 58, 2, P.gray);
  T.pixel(ctx, x + 8, y + 29, P.blue); // Blue marker
  T.pixel(ctx, x + 12, y + 29, P.red); // Red marker
  T.pixel(ctx, x + 16, y + 29, P.green); // Green marker
  T.pixel(ctx, x + 20, y + 29, P.black); // Black marker

  // Eraser
  T.rect(ctx, x + 50, y + 29, 4, 2, P.tan);
}

function _drawOfficeDoor(ctx, P) {
  const dx = 290, dy = 20, dw = 20, dh = 52;

  // Door frame
  T.rect(ctx, dx - 1, dy, dw + 2, dh, P.white);
  T.rect(ctx, dx, dy + 1, dw, dh - 1, P.light_gray);

  // Door panel
  T.rect(ctx, dx, dy + 1, dw, dh - 1, P.brown);
  T.dither(ctx, dx, dy + 1, dw, dh - 1, P.brown, P.dark_brown, 0.08, 4);

  // Panel insets
  T.rect(ctx, dx + 2, dy + 4, dw - 4, 18, P.tan);
  T.rect(ctx, dx + 3, dy + 5, dw - 6, 16, P.brown);

  T.rect(ctx, dx + 2, dy + 26, dw - 4, 20, P.tan);
  T.rect(ctx, dx + 3, dy + 27, dw - 6, 18, P.brown);

  // Door handle
  T.rect(ctx, dx + dw - 4, dy + 30, 2, 4, P.dark_gray);
  T.pixel(ctx, dx + dw - 4, dy + 31, P.gray);

  // Window in upper panel
  T.rect(ctx, dx + 6, dy + 8, 8, 10, P.dark_blue);
  T.rect(ctx, dx + 7, dy + 9, 6, 8, P.light_blue);
  T.pixel(ctx, dx + 8, dy + 10, P.white); // Glint
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Plants, file cabinet, trash bin, outlet, clock
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Potted plant on floor ---
  _drawPottedPlant(ctx, P, 75, 60);

  // --- File cabinet ---
  _drawFileCabinet(ctx, P, 250, 50);

  // --- Trash bin under desk ---
  _drawTrashBin(ctx, P, 35, 90);

  // --- Wall clock ---
  _drawClock(ctx, P, 170, 26);

  // --- Electrical outlet on wall ---
  T.rect(ctx, 15, 56, 4, 6, P.white);
  T.pixel(ctx, 16, 58, P.black);
  T.pixel(ctx, 18, 58, P.black);
  T.pixel(ctx, 17, 60, P.black);

  // --- Fire extinguisher on wall ---
  _drawFireExtinguisher(ctx, P, 100, 48);

  // --- Stack of papers on desk ---
  if (params.cubicleLayout !== 'single') {
    T.rect(ctx, 150, 60, 8, 6, P.white);
    T.dither(ctx, 150, 60, 8, 6, P.white, P.light_gray, 0.2, 2);
    T.rect(ctx, 150, 60, 8, 1, P.light_gray);
    T.rect(ctx, 151, 61, 6, 1, P.white);
  }

  // --- Coffee mug ---
  T.rect(ctx, 42, 58, 4, 3, P.white);
  T.rect(ctx, 43, 59, 2, 1, P.dark_brown); // Coffee
  T.pixel(ctx, 46, 60, P.white); // Handle

  // --- Stapler ---
  T.rect(ctx, 164, 62, 4, 2, P.red);
  T.pixel(ctx, 165, 62, P.dark_red);

  // --- Pen holder ---
  T.rect(ctx, 52, 58, 3, 4, P.blue);
  T.pixel(ctx, 53, 57, P.black); // Pen tip
  T.pixel(ctx, 54, 57, P.yellow); // Pencil
}

function _drawPottedPlant(ctx, P, x, y) {
  // Pot
  T.polygonFill(ctx, [
    [x, y + 4], [x + 10, y + 4], [x + 8, y + 12], [x + 2, y + 12],
  ], P.dark_brown);
  T.rect(ctx, x - 1, y + 3, 12, 2, P.brown);

  // Soil
  T.rect(ctx, x + 1, y + 5, 8, 2, P.dark_brown);

  // Leaves — simple pixel tree
  const leaves = [
    [x + 3, y - 2], [x + 4, y - 3], [x + 5, y - 4], [x + 6, y - 3], [x + 7, y - 2],
    [x + 2, y - 1], [x + 8, y - 1], [x + 4, y], [x + 5, y - 1], [x + 6, y],
    [x + 3, y + 1], [x + 7, y + 1], [x + 5, y + 2],
  ];
  for (const [lx, ly] of leaves) {
    T.pixel(ctx, lx, ly, P.green);
  }

  // Stem
  T.rect(ctx, x + 5, y + 2, 1, 3, P.dark_green);
}

function _drawFileCabinet(ctx, P, x, y) {
  // Cabinet body
  T.rect(ctx, x, y, 20, 24, P.gray);
  T.rect(ctx, x + 1, y + 1, 18, 22, P.light_gray);

  // Drawers (4 drawers)
  for (let i = 0; i < 4; i++) {
    const dy = y + 2 + i * 5;
    T.rect(ctx, x + 2, dy, 16, 4, P.white);
    T.rect(ctx, x + 3, dy + 1, 14, 2, P.light_gray);

    // Drawer handle
    T.rect(ctx, x + 9, dy + 2, 2, 1, P.dark_gray);

    // Label holder
    T.rect(ctx, x + 5, dy + 1, 10, 1, P.gray);
  }
}

function _drawTrashBin(ctx, P, x, y) {
  // Bin body — tapered
  T.polygonFill(ctx, [
    [x + 2, y], [x + 10, y], [x + 12, y + 14], [x, y + 14],
  ], P.dark_gray);

  // Rim
  T.rect(ctx, x + 1, y - 1, 10, 1, P.gray);

  // Trash inside (crumpled paper)
  T.pixel(ctx, x + 4, y + 2, P.white);
  T.pixel(ctx, x + 7, y + 3, P.white);
  T.pixel(ctx, x + 5, y + 5, P.yellow);
}

function _drawClock(ctx, P, x, y) {
  // Clock body
  T.rect(ctx, x, y, 14, 14, P.white);
  T.rect(ctx, x + 1, y + 1, 12, 12, P.off_white);

  // Clock face circle
  T.ellipse(ctx, x + 7, y + 7, 5, 5, P.black);

  // Hour marks
  T.pixel(ctx, x + 7, y + 3, P.black);  // 12
  T.pixel(ctx, x + 11, y + 7, P.black); // 3
  T.pixel(ctx, x + 7, y + 11, P.black); // 6
  T.pixel(ctx, x + 3, y + 7, P.black);  // 9

  // Hands
  T.line(ctx, x + 7, y + 7, x + 7, y + 4, P.black);   // Hour
  T.line(ctx, x + 7, y + 7, x + 10, y + 6, P.dark_gray); // Minute

  // Center dot
  T.pixel(ctx, x + 7, y + 7, P.red);
}

function _drawFireExtinguisher(ctx, P, x, y) {
  // Body
  T.rect(ctx, x, y + 4, 6, 14, P.red);
  T.dither(ctx, x, y + 4, 6, 14, P.red, P.dark_red, 0.12, 4);

  // Top cap
  T.rect(ctx, x + 1, y + 2, 4, 2, P.dark_gray);

  // Nozzle hose
  T.line(ctx, x + 3, y + 6, x + 6, y + 8, P.black);
  T.pixel(ctx, x + 6, y + 8, P.dark_gray);

  // Pressure gauge
  T.pixel(ctx, x + 2, y + 8, P.white);
  T.pixel(ctx, x + 3, y + 8, P.yellow);

  // Wall mount bracket
  T.rect(ctx, x - 1, y + 10, 8, 2, P.dark_gray);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Furniture shadows, cubicle wall shadows
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  // --- Cubicle shadows on floor ---
  if (params.cubicleLayout === 'single') {
    T.scatter(ctx, 30, 72, 72, 8, P.black, 0.15);
  } else if (params.cubicleLayout === 'double') {
    T.scatter(ctx, 20, 72, 72, 8, P.black, 0.15);
    T.scatter(ctx, 140, 72, 72, 8, P.black, 0.15);
  } else if (params.cubicleLayout === 'triple') {
    T.scatter(ctx, 10, 72, 72, 8, P.black, 0.15);
    T.scatter(ctx, 120, 72, 72, 8, P.black, 0.15);
    T.scatter(ctx, 230, 72, 72, 8, P.black, 0.15);
  }

  // --- Office chair shadows ---
  T.scatter(ctx, 50, 95, 16, 6, P.black, 0.12);
  if (params.cubicleLayout !== 'single') {
    T.scatter(ctx, 165, 95, 16, 6, P.black, 0.12);
  }

  // --- Water cooler shadow ---
  if (params.hasWaterCooler) {
    T.scatter(ctx, 296, 72, 10, 12, P.black, 0.14);
  }

  // --- File cabinet shadow ---
  T.scatter(ctx, 270, 72, 14, 8, P.black, 0.13);

  // --- Plant shadow ---
  T.scatter(ctx, 84, 72, 8, 6, P.black, 0.1);

  // --- Door shadow ---
  T.scatter(ctx, 288, 72, 24, 6, P.black, 0.11);

  // --- Desk shadows ---
  T.scatter(ctx, 36, 76, 52, 6, P.black, 0.1);
  if (params.cubicleLayout !== 'single') {
    T.scatter(ctx, 146, 76, 52, 6, P.black, 0.1);
  }

  // --- Whiteboard shadow on wall ---
  if (params.hasWhiteboard) {
    T.scatter(ctx, 202, 54, 60, 4, P.black, 0.08);
  }
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Fluorescent lighting ambience, screen glows
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  // --- Bright fluorescent wash over entire scene ---
  T.scatter(ctx, 0, 0, 320, 140, P.white, 0.04);

  // --- Light pools from ceiling panels ---
  T.scatterCircle(ctx, 70, 18, 50, P.white, 0.06);
  T.scatterCircle(ctx, 170, 18, 50, P.white, 0.06);
  T.scatterCircle(ctx, 270, 18, 50, P.white, 0.06);

  // --- Monitor screen glow (blue) ---
  T.scatterCircle(ctx, 48, 58, 18, P.light_blue, 0.08);
  if (params.cubicleLayout !== 'single') {
    T.scatterCircle(ctx, 168, 58, 18, P.light_blue, 0.08);
  }
  if (params.cubicleLayout === 'triple') {
    T.scatterCircle(ctx, 278, 58, 18, P.light_blue, 0.08);
  }

  // --- Slight cool blue tint (office sterility) ---
  T.scatter(ctx, 0, 0, 320, 140, P.pale_blue, 0.02);

  // --- Subtle vignette at edges ---
  T.scatter(ctx, 0, 0, 15, 140, P.black, 0.02);
  T.scatter(ctx, 305, 0, 15, 140, P.black, 0.02);
  T.scatter(ctx, 0, 125, 320, 15, P.black, 0.02);

  // --- Dust particles in fluorescent light ---
  const dustPositions = [
    [35, 30], [85, 25], [145, 32], [195, 28], [255, 35],
    [60, 50], [125, 48], [210, 52], [275, 45],
  ];
  for (const [dx, dy] of dustPositions) {
    T.pixel(ctx, dx, dy, P.white);
  }

  // --- Reflection on floor near lights ---
  for (let fx = 40; fx < 280; fx += 20) {
    T.pixel(ctx, fx, 75 + (fx % 4), P.white);
  }
}
