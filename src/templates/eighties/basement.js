/**
 * basement.js — 80s suburban basement/rec room interior room template.
 *
 * Generates a cozy retro basement with wood paneling, shag carpet,
 * old couch, CRT TV with game console, posters, ping pong table, stairs.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';
import { drawWoodWall, applyWarmWash } from '../_base.js';

export const metadata = {
  id: 'eighties/basement',
  name: 'Basement Rec Room',
  setting: 'eighties',
  category: 'interior',
  palette: 'suburban_warm',
  params: {
    couchColor: { type: 'enum', options: ['brown', 'green', 'tan'], default: 'brown', label: 'Couch Color' },
    hasPingPong: { type: 'boolean', default: true, label: 'Ping Pong Table' },
    hasPosters: { type: 'boolean', default: true, label: 'Wall Posters' },
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
//  Layer 1 (BASE): Ceiling with exposed elements, wood paneling, shag carpet
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  // --- Ceiling (rows 0-18) — exposed pipes and ductwork ---
  T.rect(ctx, 0, 0, 320, 19, P.dark_gray);
  T.dither(ctx, 0, 0, 320, 19, P.dark_gray, P.black, 0.2, 4);

  // Ceiling joists/beams
  for (let x = 0; x < 320; x += 40) {
    T.rect(ctx, x, 0, 4, 19, P.dark_brown);
    T.rect(ctx, x, 0, 4, 1, P.brown);
  }

  // Exposed pipes
  T.rect(ctx, 60, 4, 80, 3, P.gray);
  T.rect(ctx, 60, 5, 80, 1, P.light_gray);
  T.rect(ctx, 200, 6, 100, 3, P.gray);
  T.rect(ctx, 200, 7, 100, 1, P.light_gray);

  // Ductwork
  T.rect(ctx, 10, 8, 40, 6, P.dark_gray);
  T.rect(ctx, 10, 9, 40, 4, P.gray);
  T.rect(ctx, 10, 10, 40, 1, P.light_gray);

  // Support brackets
  for (let bx = 20; bx < 280; bx += 60) {
    T.rect(ctx, bx, 12, 2, 6, P.black);
  }

  // Hanging light fixture
  T.rect(ctx, 160, 12, 1, 4, P.black); // chain
  T.rect(ctx, 157, 16, 6, 3, P.tan);
  T.rect(ctx, 158, 17, 4, 1, P.white); // bulb glow

  // --- Wood paneled walls (rows 19-76) ---
  drawWoodWall(ctx, P, 0, 19, 320, 58, {
    baseColor: P.brown,
    grainColor: P.dark_brown,
    highlightColor: P.tan,
    plankH: 7,
  });

  // Horizontal trim stripe at mid-wall
  T.rect(ctx, 0, 48, 320, 2, P.dark_brown);
  T.rect(ctx, 0, 48, 320, 1, P.tan);

  // Baseboard
  T.rect(ctx, 0, 75, 320, 1, P.dark_brown);
  T.rect(ctx, 0, 76, 320, 1, P.brown);

  // --- Shag carpet floor (rows 77-140) ---
  T.rect(ctx, 0, 77, 320, 63, P.dark_green);
  T.dither(ctx, 0, 77, 320, 63, P.dark_green, P.green, 0.4, 4);

  // Shag texture — scattered fuzzy pixels
  for (let i = 0; i < 200; i++) {
    const sx = (i * 17 + 7) % 320;
    const sy = 77 + (i * 13 + 5) % 63;
    T.pixel(ctx, sx, sy, P.green);
  }

  for (let i = 0; i < 150; i++) {
    const sx = (i * 23 + 11) % 320;
    const sy = 77 + (i * 19 + 3) % 63;
    T.pixel(ctx, sx, sy, P.light_green);
  }
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Couch, TV stand, console, ping pong table, stairs
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- Couch ---
  _drawCouch(ctx, P, params);

  // --- TV stand with CRT and game console ---
  _drawTvStand(ctx, P);

  // --- Ping pong table ---
  if (params.hasPingPong) {
    _drawPingPongTable(ctx, P);
  }

  // --- Stairs going up ---
  _drawStairs(ctx, P);

  // --- Shelving unit ---
  _drawShelves(ctx, P);

  // --- Mini fridge ---
  _drawMiniFridge(ctx, P);
}

function _drawCouch(ctx, P, params) {
  const couchColorMap = {
    brown: P.brown,
    green: P.green,
    tan: P.tan,
  };
  const mainColor = couchColorMap[params.couchColor] || P.brown;
  const darkColor = T.darken(mainColor, 30);

  const cx = 20, cy = 46;

  // Couch back
  T.rect(ctx, cx, cy, 50, 22, darkColor);
  T.rect(ctx, cx + 1, cy + 1, 48, 20, mainColor);
  T.dither(ctx, cx + 1, cy + 1, 48, 20, mainColor, darkColor, 0.15, 4);

  // Couch seat cushions
  T.rect(ctx, cx + 1, cy + 18, 48, 8, darkColor);
  T.rect(ctx, cx + 2, cy + 19, 46, 6, mainColor);

  // Cushion divisions
  T.rect(ctx, cx + 18, cy + 19, 1, 6, darkColor);
  T.rect(ctx, cx + 34, cy + 19, 1, 6, darkColor);

  // Armrests
  T.rect(ctx, cx, cy + 12, 4, 14, mainColor);
  T.rect(ctx, cx, cy + 12, 4, 1, T.lighten(mainColor, 20));
  T.rect(ctx, cx + 46, cy + 12, 4, 14, mainColor);
  T.rect(ctx, cx + 46, cy + 12, 4, 1, T.lighten(mainColor, 20));

  // Couch legs
  T.rect(ctx, cx + 2, cy + 26, 2, 4, P.dark_brown);
  T.rect(ctx, cx + 46, cy + 26, 2, 4, P.dark_brown);

  // Couch base visible below
  T.rect(ctx, cx + 2, cy + 26, 46, 50, darkColor);
  T.dither(ctx, cx + 2, cy + 26, 46, 50, darkColor, P.black, 0.2, 4);

  // Throw pillow on couch
  T.rect(ctx, cx + 8, cy + 14, 8, 6, P.red);
  T.dither(ctx, cx + 8, cy + 14, 8, 6, P.red, P.dark_red, 0.2, 4);
}

function _drawTvStand(ctx, P) {
  const tx = 90, ty = 40;

  // Stand body
  T.rect(ctx, tx, ty, 48, 32, P.dark_brown);
  T.dither(ctx, tx, ty, 48, 32, P.dark_brown, P.brown, 0.12, 4);

  // Stand top surface
  T.rect(ctx, tx - 1, ty - 2, 50, 3, P.brown);
  T.rect(ctx, tx - 1, ty - 2, 50, 1, P.tan);

  // CRT television
  T.rect(ctx, tx + 6, ty + 2, 36, 26, P.black);
  T.rect(ctx, tx + 7, ty + 3, 34, 22, P.dark_gray);

  // Screen bezel
  T.rect(ctx, tx + 9, ty + 5, 30, 18, P.black);

  // Screen content — playing a video game
  T.rect(ctx, tx + 10, ty + 6, 28, 16, P.dark_blue);
  T.dither(ctx, tx + 10, ty + 6, 28, 16, P.dark_blue, P.blue, 0.2, 4);

  // Game scene — platformer
  // Sky
  T.rect(ctx, tx + 11, ty + 7, 26, 8, P.light_blue);
  // Ground
  T.rect(ctx, tx + 11, ty + 15, 26, 6, P.green);
  T.rect(ctx, tx + 11, ty + 15, 26, 1, P.dark_green);
  // Character sprite
  T.rect(ctx, tx + 18, ty + 12, 3, 4, P.red);
  T.pixel(ctx, tx + 19, ty + 11, P.tan);
  // Enemies
  T.rect(ctx, tx + 28, ty + 13, 2, 3, P.dark_brown);
  T.rect(ctx, tx + 32, ty + 13, 2, 3, P.dark_brown);
  // Collectible coin
  T.pixel(ctx, tx + 24, ty + 10, P.yellow);

  // TV controls/vents on side
  T.rect(ctx, tx + 39, ty + 8, 2, 12, P.black);
  for (let v = 0; v < 4; v++) {
    T.pixel(ctx, tx + 40, ty + 10 + v * 2, P.gray);
  }

  // VCR/console below TV on stand shelf
  const consoleY = ty + 30;
  T.rect(ctx, tx + 8, consoleY, 32, 4, P.black);
  T.rect(ctx, tx + 9, consoleY + 1, 30, 2, P.dark_gray);

  // Power LED
  T.pixel(ctx, tx + 10, consoleY + 1, P.red);

  // Controller ports
  T.pixel(ctx, tx + 14, consoleY + 1, P.black);
  T.pixel(ctx, tx + 17, consoleY + 1, P.black);

  // Game cartridge inserted
  T.rect(ctx, tx + 22, consoleY - 2, 10, 3, P.tan);
  T.rect(ctx, tx + 23, consoleY - 1, 8, 1, P.black);

  // Controllers on floor in front
  _drawController(ctx, P, tx + 4, ty + 36);
  _drawController(ctx, P, tx + 32, ty + 38);

  // Stand cabinet doors
  T.rect(ctx, tx + 2, ty + 8, 18, 20, P.brown);
  T.rect(ctx, tx + 3, ty + 9, 16, 18, P.dark_brown);
  T.rect(ctx, tx + 28, ty + 8, 18, 20, P.brown);
  T.rect(ctx, tx + 29, ty + 9, 16, 18, P.dark_brown);

  // Door handles
  T.pixel(ctx, tx + 18, ty + 18, P.gray);
  T.pixel(ctx, tx + 28, ty + 18, P.gray);

  // Stand base visible below
  T.rect(ctx, tx, ty + 32, 48, 44, P.dark_brown);
  T.dither(ctx, tx, ty + 32, 48, 44, P.dark_brown, P.black, 0.2, 4);
}

function _drawController(ctx, P, cx, cy) {
  // Controller body
  T.rect(ctx, cx, cy, 10, 6, P.gray);
  T.dither(ctx, cx, cy, 10, 6, P.gray, P.dark_gray, 0.1, 4);

  // D-pad
  T.pixel(ctx, cx + 2, cy + 2, P.black);
  T.pixel(ctx, cx + 3, cy + 2, P.black);
  T.pixel(ctx, cx + 2, cy + 3, P.black);
  T.pixel(ctx, cx + 3, cy + 3, P.black);

  // Buttons
  T.pixel(ctx, cx + 6, cy + 2, P.red);
  T.pixel(ctx, cx + 8, cy + 2, P.red);
  T.pixel(ctx, cx + 7, cy + 3, P.red);

  // Cable
  T.rect(ctx, cx + 5, cy + 6, 1, 3, P.dark_gray);
}

function _drawPingPongTable(ctx, P) {
  const ptx = 180, pty = 50;

  // Table top
  T.rect(ctx, ptx, pty, 60, 20, P.dark_green);
  T.rect(ctx, ptx + 1, pty + 1, 58, 18, P.green);
  T.dither(ctx, ptx + 1, pty + 1, 58, 18, P.green, P.dark_green, 0.1, 4);

  // Center net line
  T.rect(ctx, ptx + 29, pty + 1, 2, 18, P.white);

  // Table edges
  T.rect(ctx, ptx + 1, pty + 1, 58, 1, P.white);
  T.rect(ctx, ptx + 1, pty + 18, 58, 1, P.white);
  T.rect(ctx, ptx + 1, pty + 1, 1, 18, P.white);
  T.rect(ctx, ptx + 58, pty + 1, 1, 18, P.white);

  // Net
  T.rect(ctx, ptx + 28, pty - 2, 4, 3, P.black);
  T.rect(ctx, ptx + 29, pty - 2, 2, 3, P.white);

  // Table legs
  T.rect(ctx, ptx + 4, pty + 20, 2, 16, P.dark_gray);
  T.rect(ctx, ptx + 54, pty + 20, 2, 16, P.dark_gray);
  T.rect(ctx, ptx + 4, pty + 36, 52, 2, P.dark_gray);

  // Base visible below
  T.rect(ctx, ptx + 2, pty + 36, 56, 40, P.dark_gray);
  T.dither(ctx, ptx + 2, pty + 36, 56, 40, P.dark_gray, P.black, 0.15, 4);

  // Ping pong paddles on table
  T.rect(ctx, ptx + 8, pty + 8, 6, 8, P.red);
  T.rect(ctx, ptx + 9, pty + 9, 4, 6, P.black);
  T.rect(ctx, ptx + 10, pty + 16, 2, 4, P.tan); // handle

  T.rect(ctx, ptx + 46, pty + 6, 6, 8, P.blue);
  T.rect(ctx, ptx + 47, pty + 7, 4, 6, P.black);
  T.rect(ctx, ptx + 48, pty + 14, 2, 4, P.tan); // handle

  // Ball
  T.pixel(ctx, ptx + 30, pty + 10, P.white);
  T.pixel(ctx, ptx + 31, pty + 10, P.white);
  T.pixel(ctx, ptx + 30, pty + 11, P.white);
  T.pixel(ctx, ptx + 31, pty + 11, P.white);
}

function _drawStairs(ctx, P) {
  const sx = 260, sy = 20;

  // Stair stringer/sides
  T.rect(ctx, sx, sy, 2, 56, P.dark_brown);
  T.rect(ctx, sx + 54, sy, 2, 56, P.dark_brown);

  // Steps — 7 steps going up
  for (let s = 0; s < 7; s++) {
    const stepY = sy + 8 + s * 8;
    const stepW = 56 - s * 6;

    // Tread (horizontal step surface)
    T.rect(ctx, sx, stepY, stepW, 3, P.brown);
    T.rect(ctx, sx, stepY, stepW, 1, P.tan);

    // Riser (vertical face)
    T.rect(ctx, sx, stepY + 3, stepW, 5, P.dark_brown);
  }

  // Handrail
  T.rect(ctx, sx + 54, sy, 2, 56, P.tan);
  T.rect(ctx, sx + 54, sy, 2, 1, P.brown);

  // Under-stairs storage door
  T.rect(ctx, sx + 2, sy + 50, 20, 26, P.dark_brown);
  T.rect(ctx, sx + 3, sy + 51, 18, 24, P.brown);
  T.pixel(ctx, sx + 18, sy + 63, P.gray); // door handle
}

function _drawShelves(ctx, P) {
  const shx = 245, shy = 22, shw = 14, shh = 40;

  // Shelf backing
  T.rect(ctx, shx, shy, shw, shh, P.dark_brown);

  // Shelf boards
  T.rect(ctx, shx, shy, shw, 2, P.brown);
  T.rect(ctx, shx, shy + 12, shw, 2, P.brown);
  T.rect(ctx, shx, shy + 26, shw, 2, P.brown);
  T.rect(ctx, shx, shy + 38, shw, 2, P.brown);

  // Items on shelves
  // Board games
  T.rect(ctx, shx + 2, shy + 3, 10, 8, P.red);
  T.rect(ctx, shx + 3, shy + 4, 8, 2, P.white);

  // Books
  T.rect(ctx, shx + 2, shy + 14, 3, 10, P.blue);
  T.rect(ctx, shx + 5, shy + 14, 3, 10, P.green);
  T.rect(ctx, shx + 8, shy + 14, 3, 10, P.tan);

  // Trophy
  T.rect(ctx, shx + 3, shy + 29, 4, 6, P.yellow);
  T.pixel(ctx, shx + 5, shy + 28, P.yellow);

  // Model car
  T.rect(ctx, shx + 9, shy + 31, 4, 2, P.red);
  T.pixel(ctx, shx + 9, shy + 32, P.black);
  T.pixel(ctx, shx + 12, shy + 32, P.black);
}

function _drawMiniFridge(ctx, P) {
  const fx = 150, fy = 52;

  // Fridge body
  T.rect(ctx, fx, fy, 16, 20, P.white);
  T.dither(ctx, fx, fy, 16, 20, P.white, P.off_white, 0.1, 4);

  // Door
  T.rect(ctx, fx + 1, fy + 1, 14, 18, P.off_white);
  T.rect(ctx, fx + 2, fy + 2, 12, 16, P.white);

  // Handle
  T.rect(ctx, fx + 13, fy + 10, 2, 4, P.gray);

  // Brand logo
  T.rect(ctx, fx + 4, fy + 4, 8, 3, P.red);

  // Base
  T.rect(ctx, fx, fy + 20, 16, 56, P.white);
  T.dither(ctx, fx, fy + 20, 16, 56, P.white, P.dark_gray, 0.05, 4);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Posters, decorations, floor items, lighting
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Wall posters ---
  if (params.hasPosters) {
    _drawPosters(ctx, P);
  }

  // --- Dart board ---
  T.circleFill(ctx, 170, 32, 6, P.black);
  T.circleFill(ctx, 170, 32, 5, P.red);
  T.circleFill(ctx, 170, 32, 3, P.white);
  T.circleFill(ctx, 170, 32, 1, P.red);
  // Dart stuck in board
  T.pixel(ctx, 172, 30, P.yellow);
  T.rect(ctx, 173, 30, 2, 1, P.gray);

  // --- Wall clock ---
  T.circleFill(ctx, 148, 26, 5, P.tan);
  T.circleFill(ctx, 148, 26, 4, P.white);
  // Clock hands
  T.pixel(ctx, 148, 24, P.black);
  T.pixel(ctx, 150, 26, P.black);

  // --- Electrical outlet on wall ---
  T.rect(ctx, 78, 70, 4, 6, P.beige);
  T.rect(ctx, 79, 71, 2, 4, P.black);
  T.pixel(ctx, 79, 72, P.black);
  T.pixel(ctx, 80, 72, P.black);
  T.pixel(ctx, 79, 74, P.black);
  T.pixel(ctx, 80, 74, P.black);

  // --- Extension cord on floor ---
  T.rect(ctx, 85, 120, 30, 1, P.black);
  T.rect(ctx, 95, 110, 1, 10, P.black);

  // --- Scattered items on floor ---
  // Soda can
  T.rect(ctx, 72, 116, 3, 6, P.red);
  T.rect(ctx, 72, 117, 3, 1, P.white);

  // Magazine
  T.rect(ctx, 124, 125, 8, 10, P.white);
  T.rect(ctx, 125, 126, 6, 3, P.blue);
  T.rect(ctx, 125, 130, 6, 1, P.black);

  // Pizza box
  T.rect(ctx, 56, 130, 12, 8, P.tan);
  T.rect(ctx, 57, 131, 10, 6, P.white);
  T.rect(ctx, 59, 133, 6, 2, P.red);

  // Scattered game cartridges
  T.rect(ctx, 140, 118, 6, 4, P.tan);
  T.rect(ctx, 141, 119, 4, 2, P.black);

  T.rect(ctx, 158, 132, 6, 4, P.gray);
  T.rect(ctx, 159, 133, 4, 2, P.black);

  // --- Rug under coffee table ---
  T.rect(ctx, 74, 96, 24, 18, P.dark_red);
  T.dither(ctx, 74, 96, 24, 18, P.dark_red, P.red, 0.3, 4);
  // Rug fringe
  for (let rx = 74; rx < 98; rx += 2) {
    T.pixel(ctx, rx, 114, P.tan);
  }

  // --- Coffee table on rug ---
  T.rect(ctx, 80, 100, 16, 10, P.brown);
  T.rect(ctx, 81, 101, 14, 1, P.tan);
  // Table legs
  T.rect(ctx, 82, 110, 2, 4, P.dark_brown);
  T.rect(ctx, 92, 110, 2, 4, P.dark_brown);
  // Items on coffee table
  T.rect(ctx, 84, 104, 4, 3, P.red); // soda can
  T.rect(ctx, 90, 105, 3, 2, P.white); // remote

  // --- Plant in corner ---
  T.rect(ctx, 4, 60, 8, 12, P.dark_brown);
  T.rect(ctx, 5, 61, 6, 10, P.brown);
  // Leaves
  T.pixel(ctx, 6, 58, P.green);
  T.pixel(ctx, 8, 57, P.green);
  T.pixel(ctx, 5, 59, P.dark_green);
  T.pixel(ctx, 9, 59, P.dark_green);
  T.pixel(ctx, 7, 56, P.light_green);

  // --- Laundry basket ---
  T.rect(ctx, 200, 68, 10, 8, P.tan);
  T.rect(ctx, 201, 69, 8, 6, P.beige);
  // Clothes inside
  T.pixel(ctx, 203, 71, P.blue);
  T.pixel(ctx, 205, 70, P.red);
  T.pixel(ctx, 207, 72, P.white);

  // --- Tool box under stairs ---
  T.rect(ctx, 264, 70, 10, 6, P.red);
  T.rect(ctx, 265, 71, 8, 4, P.dark_red);
  T.rect(ctx, 267, 72, 4, 1, P.gray); // handle

  // --- Hanging ceiling light pull chain ---
  T.rect(ctx, 160, 16, 1, 4, P.black);
  T.pixel(ctx, 160, 19, P.gray);

  // --- Smoke detector on ceiling ---
  T.rect(ctx, 220, 16, 6, 3, P.white);
  T.pixel(ctx, 222, 17, P.red); // LED
}

function _drawPosters(ctx, P) {
  // Band poster 1
  T.rect(ctx, 12, 24, 14, 18, P.black);
  T.rect(ctx, 13, 25, 12, 16, P.dark_brown);
  T.rect(ctx, 15, 28, 8, 6, P.brown);
  T.rect(ctx, 16, 36, 6, 2, P.white);
  T.rect(ctx, 15, 39, 8, 1, P.yellow);

  // Movie poster
  T.rect(ctx, 30, 26, 14, 18, P.black);
  T.rect(ctx, 31, 27, 12, 16, P.dark_blue);
  T.rect(ctx, 33, 30, 8, 6, P.blue);
  T.rect(ctx, 34, 37, 6, 2, P.red);
  T.rect(ctx, 33, 40, 8, 1, P.white);

  // Sports poster
  T.rect(ctx, 200, 25, 14, 18, P.black);
  T.rect(ctx, 201, 26, 12, 16, P.red);
  T.rect(ctx, 203, 29, 8, 6, P.white);
  T.rect(ctx, 204, 36, 6, 2, P.blue);
  T.rect(ctx, 203, 39, 8, 1, P.yellow);

  // Pin-up calendar
  T.rect(ctx, 220, 28, 12, 16, P.white);
  T.rect(ctx, 221, 29, 10, 8, P.beige);
  // Calendar grid below
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      T.rect(ctx, 222 + c * 3, 38 + r * 2, 2, 1, P.black);
    }
  }
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Shadows from furniture, stairs, TV glow
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  // --- TV screen glow ---
  T.scatterCircle(ctx, 114, 53, 22, P.blue, 0.12);
  T.scatterCircle(ctx, 114, 80, 30, P.dark_blue, 0.08);

  // --- Couch shadow on floor ---
  T.scatter(ctx, 20, 76, 50, 4, P.black, 0.15);

  // --- TV stand shadow ---
  T.scatter(ctx, 90, 76, 48, 4, P.black, 0.12);

  // --- Ping pong table shadow ---
  if (params.hasPingPong) {
    T.scatter(ctx, 180, 76, 60, 4, P.black, 0.12);
  }

  // --- Stairs shadow on wall ---
  T.scatter(ctx, 260, 24, 56, 52, P.black, 0.2);

  // --- Under-stairs darkness ---
  T.scatter(ctx, 260, 60, 30, 16, P.black, 0.25);

  // --- Shelving shadow ---
  T.scatter(ctx, 245, 62, 14, 3, P.black, 0.1);

  // --- Mini fridge shadow ---
  T.scatter(ctx, 166, 56, 4, 20, P.black, 0.08);

  // --- Coffee table shadow ---
  T.scatter(ctx, 80, 110, 16, 4, P.black, 0.12);

  // --- General floor shadow gradient (darker in corners) ---
  T.scatter(ctx, 0, 110, 320, 30, P.black, 0.08);
  T.scatter(ctx, 0, 77, 15, 63, P.black, 0.12);
  T.scatter(ctx, 305, 77, 15, 63, P.black, 0.1);

  // --- Ceiling shadow depth ---
  T.scatter(ctx, 0, 0, 320, 4, P.black, 0.15);

  // --- Exposed pipe shadows ---
  T.scatter(ctx, 60, 7, 80, 2, P.black, 0.1);
  T.scatter(ctx, 200, 9, 100, 2, P.black, 0.1);

  // --- Couch back shadow on wall ---
  T.scatter(ctx, 20, 44, 50, 4, P.black, 0.08);

  // --- Furniture depth shadows ---
  T.scatter(ctx, 68, 48, 4, 28, P.black, 0.1);
  T.scatter(ctx, 136, 42, 4, 34, P.black, 0.1);
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Warm cozy wash, TV glow spread, ambient dimness
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  // --- Warm nostalgic basement wash ---
  applyWarmWash(ctx, P, 0.05);

  // --- Ceiling light glow ---
  T.scatterCircle(ctx, 160, 17, 50, P.white, 0.08);
  T.scatterCircle(ctx, 160, 50, 60, P.tan, 0.04);

  // --- TV blue glow atmospheric spread ---
  T.scatterCircle(ctx, 114, 53, 45, P.blue, 0.06);
  T.scatterCircle(ctx, 114, 53, 60, P.light_blue, 0.03);
  T.scatter(ctx, 70, 70, 90, 40, P.dark_blue, 0.03);

  // --- Warm wood panel reflection ---
  T.scatter(ctx, 0, 40, 320, 40, P.brown, 0.02);

  // --- Shag carpet texture atmosphere ---
  T.scatter(ctx, 0, 90, 320, 50, P.green, 0.02);

  // --- Under-ceiling darkness ---
  T.scatter(ctx, 0, 0, 320, 18, P.black, 0.12);

  // --- Stairs area darkness ---
  T.scatter(ctx, 260, 20, 60, 56, P.black, 0.15);

  // --- Corner vignettes ---
  T.scatter(ctx, 0, 0, 30, 30, P.black, 0.08);
  T.scatter(ctx, 290, 0, 30, 30, P.black, 0.08);
  T.scatter(ctx, 0, 110, 30, 30, P.black, 0.1);
  T.scatter(ctx, 290, 110, 30, 30, P.black, 0.1);

  // --- Dust motes in light beams ---
  const dustPositions = [
    [155, 28], [165, 35], [170, 42], [150, 38], [175, 32],
    [120, 30], [190, 40], [160, 50], [145, 45], [180, 35],
    [100, 25], [220, 30], [140, 48], [200, 38], [130, 42],
  ];

  for (const [dx, dy] of dustPositions) {
    T.pixel(ctx, dx, dy, P.white);
  }

  // --- Overall warm dim cozy tint ---
  T.scatter(ctx, 0, 0, 320, 140, P.tan, 0.03);

  // --- Slight green carpet reflection upward ---
  T.scatter(ctx, 0, 60, 320, 20, P.dark_green, 0.02);

  // --- Ambient basement dimness ---
  T.scatter(ctx, 0, 0, 320, 140, P.black, 0.08);
}
