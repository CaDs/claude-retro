/**
 * high_school.js — 80s high school hallway interior room template.
 *
 * Generates a classic high school corridor with lockers, trophy case,
 * bulletin board, school banner, tiled floor, fluorescent lights, doors.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'eighties/high_school',
  name: 'High School Hallway',
  setting: 'eighties',
  category: 'interior',
  palette: 'mall_bright',
  params: {
    lockerColor: { type: 'enum', options: ['blue', 'tan', 'green'], default: 'blue', label: 'Locker Color' },
    hasTrophyCase: { type: 'boolean', default: true, label: 'Trophy Case' },
    hasBanner: { type: 'boolean', default: true, label: 'School Banner' },
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
//  Layer 1 (BASE): Ceiling, walls, tiled floor
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  // --- Ceiling (rows 0-16) ---
  T.rect(ctx, 0, 0, 320, 17, P.white);
  T.dither(ctx, 0, 0, 320, 17, P.white, P.off_white, 0.15, 4);

  // Ceiling tile grid
  for (let x = 0; x < 320; x += 16) {
    T.rect(ctx, x, 0, 1, 17, P.light_gray);
  }
  for (let y = 0; y < 17; y += 8) {
    T.rect(ctx, 0, y, 320, 1, P.light_gray);
  }

  // Fluorescent light panels
  const lightPositions = [40, 120, 200, 280];
  for (const lx of lightPositions) {
    T.rect(ctx, lx, 2, 30, 6, P.pale_pink);
    T.rect(ctx, lx + 1, 3, 28, 4, P.white);
    T.dither(ctx, lx + 1, 3, 28, 4, P.white, P.pale_pink, 0.1, 4);

    // Light grid detail
    T.rect(ctx, lx + 14, 3, 1, 4, P.light_gray);
    T.rect(ctx, lx + 1, 5, 28, 1, P.light_gray);
  }

  // --- Walls (rows 17-74) ---
  // Painted cinderblock
  T.rect(ctx, 0, 17, 320, 58, P.off_white);
  T.dither(ctx, 0, 17, 320, 58, P.off_white, P.pale_pink, 0.08, 4);

  // Cinderblock texture pattern
  for (let y = 17; y < 75; y += 6) {
    for (let x = 0; x < 320; x += 12) {
      const offset = ((y - 17) / 6) % 2 === 0 ? 0 : 6;
      T.rect(ctx, x + offset, y, 11, 5, P.off_white);
      T.rect(ctx, x + offset, y, 11, 1, P.light_gray);
      T.rect(ctx, x + offset, y, 1, 5, P.light_gray);
    }
  }

  // Wall trim stripe
  T.rect(ctx, 0, 73, 320, 1, P.tan);
  T.rect(ctx, 0, 74, 320, 1, P.brown);

  // --- Floor (rows 75-140) — vinyl tile ---
  T.rect(ctx, 0, 75, 320, 65, P.tan);

  // Checkerboard tile pattern
  const tileSize = 8;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 40; col++) {
      if ((row + col) % 2 === 0) {
        T.rect(ctx, col * tileSize, 75 + row * tileSize, tileSize, tileSize, P.brown);
      }
    }
  }

  // Tile grout lines
  for (let x = 0; x < 320; x += tileSize) {
    T.rect(ctx, x, 75, 1, 65, P.light_gray);
  }
  for (let y = 75; y < 140; y += tileSize) {
    T.rect(ctx, 0, y, 320, 1, P.light_gray);
  }
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Lockers, trophy case, bulletin board, doors
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- Left wall lockers ---
  _drawLockerBank(ctx, P, params, 8, 25, 'left');

  // --- Right wall lockers ---
  _drawLockerBank(ctx, P, params, 220, 25, 'right');

  // --- Trophy case ---
  if (params.hasTrophyCase) {
    _drawTrophyCase(ctx, P);
  }

  // --- Bulletin board ---
  _drawBulletinBoard(ctx, P);

  // --- Classroom doors ---
  _drawClassroomDoors(ctx, P);

  // --- Water fountain ---
  _drawWaterFountain(ctx, P);

  // --- School banner ---
  if (params.hasBanner) {
    _drawSchoolBanner(ctx, P);
  }
}

function _drawLockerBank(ctx, P, params, baseX, baseY, side) {
  const lockerColorMap = {
    blue: P.blue,
    tan: P.tan,
    green: P.green,
  };
  const mainColor = lockerColorMap[params.lockerColor] || P.blue;
  const darkColor = T.darken(mainColor, 30);

  const lockerW = 8;
  const lockerH = 46;
  const lockerCount = 8;

  // Locker bank backing
  T.rect(ctx, baseX, baseY, lockerW * lockerCount, lockerH, darkColor);

  // Individual lockers
  for (let i = 0; i < lockerCount; i++) {
    const lx = baseX + i * lockerW;

    // Locker body
    T.rect(ctx, lx, baseY, lockerW - 1, lockerH, mainColor);
    T.dither(ctx, lx, baseY, lockerW - 1, lockerH, mainColor, darkColor, 0.1, 4);

    // Locker door panel (inset)
    T.rect(ctx, lx + 1, baseY + 2, lockerW - 3, lockerH - 4, darkColor);
    T.rect(ctx, lx + 1, baseY + 3, lockerW - 3, lockerH - 6, mainColor);

    // Vent slots at top
    for (let v = 0; v < 4; v++) {
      T.rect(ctx, lx + 2, baseY + 4 + v * 2, lockerW - 5, 1, P.dark_gray);
    }

    // Lock/handle
    T.pixel(ctx, lx + 3, baseY + 24, P.dark_gray);
    T.pixel(ctx, lx + 4, baseY + 24, P.dark_gray);

    // Number label
    const labelY = baseY + 18;
    T.pixel(ctx, lx + 2, labelY, P.white);
    T.pixel(ctx, lx + 3, labelY, P.white);

    // Random locker decoration stickers
    if (i % 3 === 0) {
      T.pixel(ctx, lx + 3, baseY + 32, P.red);
    }
    if (i % 4 === 1) {
      T.pixel(ctx, lx + 2, baseY + 28, P.pink);
      T.pixel(ctx, lx + 3, baseY + 28, P.pink);
    }
    if (i % 5 === 2) {
      T.pixel(ctx, lx + 4, baseY + 36, P.yellow);
    }
  }

  // Top shelf bar
  T.rect(ctx, baseX, baseY - 2, lockerW * lockerCount, 2, P.gray);
  T.rect(ctx, baseX, baseY - 2, lockerW * lockerCount, 1, P.light_gray);
}

function _drawTrophyCase(ctx, P) {
  const tx = 80, ty = 22, tw = 50, th = 48;

  // Case backing wall
  T.rect(ctx, tx, ty, tw, th, P.off_white);

  // Glass case frame
  T.rect(ctx, tx, ty, tw, th, P.dark_gray);
  T.rect(ctx, tx + 2, ty + 2, tw - 4, th - 4, P.gray);

  // Glass pane
  T.rect(ctx, tx + 3, ty + 3, tw - 6, th - 6, P.dark_blue);
  T.dither(ctx, tx + 3, ty + 3, tw - 6, th - 6, P.dark_blue, P.blue, 0.15, 4);

  // Shelves inside
  T.rect(ctx, tx + 4, ty + 18, tw - 8, 1, P.brown);
  T.rect(ctx, tx + 4, ty + 36, tw - 8, 1, P.brown);

  // Trophies on top shelf
  // Trophy 1
  T.rect(ctx, tx + 8, ty + 11, 4, 6, P.yellow);
  T.pixel(ctx, tx + 9, ty + 10, P.yellow);
  T.pixel(ctx, tx + 10, ty + 10, P.yellow);
  T.rect(ctx, tx + 7, ty + 10, 6, 1, P.yellow);

  // Trophy 2
  T.rect(ctx, tx + 18, ty + 12, 3, 5, P.yellow);
  T.pixel(ctx, tx + 19, ty + 11, P.yellow);
  T.rect(ctx, tx + 17, ty + 11, 5, 1, P.yellow);

  // Trophy 3
  T.rect(ctx, tx + 28, ty + 10, 5, 7, P.yellow);
  T.pixel(ctx, tx + 30, ty + 9, P.yellow);
  T.rect(ctx, tx + 27, ty + 9, 7, 1, P.yellow);

  // Items on middle shelf
  // Plaque
  T.rect(ctx, tx + 6, ty + 22, 8, 12, P.brown);
  T.rect(ctx, tx + 7, ty + 23, 6, 10, P.yellow);

  // Ball
  T.circleFill(ctx, tx + 20, ty + 28, 4, P.red);

  // Medal
  T.rect(ctx, tx + 32, ty + 26, 6, 8, P.dark_gray);
  T.pixel(ctx, tx + 34, ty + 24, P.yellow);
  T.pixel(ctx, tx + 35, ty + 24, P.yellow);

  // Items on bottom shelf
  // Ribbon
  T.rect(ctx, tx + 10, ty + 42, 4, 6, P.blue);
  T.pixel(ctx, tx + 11, ty + 48, P.blue);
  T.pixel(ctx, tx + 12, ty + 48, P.blue);

  // Banner/pennant
  T.rect(ctx, tx + 22, ty + 40, 8, 8, P.red);
  T.pixel(ctx, tx + 30, ty + 44, P.red);

  // Glass glint
  T.pixel(ctx, tx + 4, ty + 4, P.white);
  T.pixel(ctx, tx + 5, ty + 4, P.white);
}

function _drawBulletinBoard(ctx, P) {
  const bx = 150, by = 24, bw = 60, bh = 40;

  // Cork board
  T.rect(ctx, bx, by, bw, bh, P.brown);
  T.dither(ctx, bx, by, bw, bh, P.brown, P.tan, 0.3, 4);

  // Frame
  T.rect(ctx, bx - 2, by - 2, bw + 4, 2, P.dark_gray);
  T.rect(ctx, bx - 2, by + bh, bw + 4, 2, P.dark_gray);
  T.rect(ctx, bx - 2, by, 2, bh, P.dark_gray);
  T.rect(ctx, bx + bw, by, 2, bh, P.dark_gray);

  // Posted flyers and notices
  // Flyer 1 — dance
  T.rect(ctx, bx + 4, by + 4, 16, 12, P.pink);
  T.rect(ctx, bx + 5, by + 5, 14, 10, P.pale_pink);
  T.rect(ctx, bx + 7, by + 7, 10, 2, P.red);
  T.rect(ctx, bx + 8, by + 11, 8, 1, P.red);

  // Flyer 2 — sports
  T.rect(ctx, bx + 24, by + 3, 14, 14, P.blue);
  T.rect(ctx, bx + 25, by + 4, 12, 12, P.white);
  T.rect(ctx, bx + 27, by + 6, 8, 3, P.blue);
  T.rect(ctx, bx + 28, by + 11, 6, 1, P.blue);

  // Flyer 3 — yearbook
  T.rect(ctx, bx + 42, by + 6, 14, 12, P.yellow);
  T.rect(ctx, bx + 43, by + 7, 12, 10, P.white);
  T.rect(ctx, bx + 45, by + 9, 8, 2, P.red);
  T.rect(ctx, bx + 46, by + 13, 6, 1, P.red);

  // Flyer 4 — club meeting
  T.rect(ctx, bx + 6, by + 20, 18, 14, P.green);
  T.rect(ctx, bx + 7, by + 21, 16, 12, P.white);
  T.rect(ctx, bx + 9, by + 23, 12, 3, P.green);
  T.rect(ctx, bx + 10, by + 28, 10, 1, P.green);

  // Flyer 5 — calendar
  T.rect(ctx, bx + 30, by + 22, 12, 14, P.white);
  T.rect(ctx, bx + 31, by + 23, 10, 12, P.off_white);
  // Grid
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      T.rect(ctx, bx + 32 + c * 3, by + 24 + r * 3, 2, 2, P.gray);
    }
  }

  // Pushpins
  const pinPositions = [[bx + 10, by + 4], [bx + 30, by + 6], [bx + 48, by + 8], [bx + 12, by + 22], [bx + 36, by + 24]];
  for (const [px, py] of pinPositions) {
    T.pixel(ctx, px, py, P.red);
  }
}

function _drawClassroomDoors(ctx, P) {
  // Door 1 — left side
  const d1x = 0, d1y = 26;
  T.rect(ctx, d1x, d1y, 22, 48, P.brown);
  T.rect(ctx, d1x + 1, d1y + 1, 20, 46, P.tan);

  // Door window
  T.rect(ctx, d1x + 4, d1y + 6, 14, 18, P.dark_gray);
  T.rect(ctx, d1x + 5, d1y + 7, 12, 16, P.dark_blue);
  T.pixel(ctx, d1x + 6, d1y + 8, P.white);

  // Door handle
  T.pixel(ctx, d1x + 18, d1y + 28, P.gray);
  T.pixel(ctx, d1x + 18, d1y + 29, P.gray);

  // Room number
  T.rect(ctx, d1x + 8, d1y + 32, 6, 4, P.white);
  T.rect(ctx, d1x + 9, d1y + 33, 4, 2, P.black);

  // Door 2 — right side
  const d2x = 298, d2y = 26;
  T.rect(ctx, d2x, d2y, 22, 48, P.brown);
  T.rect(ctx, d2x + 1, d2y + 1, 20, 46, P.tan);

  // Door window
  T.rect(ctx, d2x + 4, d2y + 6, 14, 18, P.dark_gray);
  T.rect(ctx, d2x + 5, d2y + 7, 12, 16, P.dark_blue);
  T.pixel(ctx, d2x + 6, d2y + 8, P.white);

  // Door handle
  T.pixel(ctx, d2x + 3, d2y + 28, P.gray);
  T.pixel(ctx, d2x + 3, d2y + 29, P.gray);

  // Room number
  T.rect(ctx, d2x + 8, d2y + 32, 6, 4, P.white);
  T.rect(ctx, d2x + 9, d2y + 33, 4, 2, P.black);
}

function _drawWaterFountain(ctx, P) {
  const fx = 60, fy = 48;

  // Fountain body
  T.rect(ctx, fx, fy, 12, 24, P.gray);
  T.dither(ctx, fx, fy, 12, 24, P.gray, P.light_gray, 0.15, 4);

  // Basin
  T.rect(ctx, fx + 1, fy + 2, 10, 8, P.dark_gray);
  T.rect(ctx, fx + 2, fy + 3, 8, 6, P.dark_blue);

  // Spout
  T.rect(ctx, fx + 5, fy + 5, 2, 3, P.gray);
  T.pixel(ctx, fx + 6, fy + 4, P.light_gray);

  // Water stream
  T.pixel(ctx, fx + 6, fy + 6, P.blue);
  T.pixel(ctx, fx + 6, fy + 7, P.blue);

  // Drain
  T.pixel(ctx, fx + 5, fy + 8, P.black);

  // Push button
  T.rect(ctx, fx + 2, fy + 12, 3, 2, P.dark_gray);

  // Base pedestal
  T.rect(ctx, fx + 2, fy + 20, 8, 4, P.dark_gray);
}

function _drawSchoolBanner(ctx, P) {
  const bnx = 130, bny = 18;

  // Banner fabric
  T.rect(ctx, bnx, bny, 60, 10, P.red);
  T.dither(ctx, bnx, bny, 60, 10, P.red, P.dark_red, 0.1, 4);

  // Banner text — "GO WILDCATS"
  T.rect(ctx, bnx + 4, bny + 3, 52, 4, P.white);
  T.rect(ctx, bnx + 6, bny + 4, 48, 2, P.yellow);

  // Banner edge trim
  T.rect(ctx, bnx, bny, 60, 1, P.yellow);
  T.rect(ctx, bnx, bny + 9, 60, 1, P.yellow);

  // Hanging strings
  T.pixel(ctx, bnx + 5, bny - 1, P.dark_gray);
  T.pixel(ctx, bnx + 5, bny - 2, P.dark_gray);
  T.pixel(ctx, bnx + 55, bny - 1, P.dark_gray);
  T.pixel(ctx, bnx + 55, bny - 2, P.dark_gray);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Decorations, trash, backpack, floor marks
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Fire alarm on wall ---
  T.rect(ctx, 42, 34, 6, 8, P.red);
  T.rect(ctx, 43, 35, 4, 6, P.white);
  T.rect(ctx, 45, 40, 1, 2, P.dark_gray); // pull handle

  // --- Fire extinguisher ---
  T.rect(ctx, 215, 44, 4, 12, P.red);
  T.pixel(ctx, 216, 43, P.dark_gray);
  T.pixel(ctx, 217, 43, P.dark_gray);
  T.rect(ctx, 215, 56, 4, 1, P.dark_gray); // bracket

  // --- Trash can ---
  T.rect(ctx, 132, 62, 8, 12, P.dark_gray);
  T.rect(ctx, 133, 63, 6, 10, P.gray);
  // Trash inside
  T.pixel(ctx, 135, 67, P.white);
  T.pixel(ctx, 134, 69, P.yellow);

  // --- Backpack on floor (student left it) ---
  T.rect(ctx, 100, 118, 12, 8, P.blue);
  T.rect(ctx, 101, 119, 10, 6, P.dark_blue);
  T.rect(ctx, 104, 120, 4, 4, P.red); // pocket
  T.pixel(ctx, 106, 118, P.gray); // strap

  // --- Spilled papers on floor ---
  T.rect(ctx, 180, 125, 4, 6, P.white);
  T.rect(ctx, 181, 126, 2, 4, P.off_white);
  T.rect(ctx, 185, 128, 3, 5, P.white);

  // --- Pencil on floor ---
  T.rect(ctx, 160, 130, 6, 1, P.yellow);
  T.pixel(ctx, 160, 130, P.pink); // eraser

  // --- Floor scuff marks ---
  T.pixel(ctx, 90, 110, P.dark_gray);
  T.pixel(ctx, 91, 110, P.dark_gray);
  T.pixel(ctx, 200, 115, P.dark_gray);
  T.pixel(ctx, 250, 122, P.dark_gray);

  // --- "Wet Floor" sign ---
  T.rect(ctx, 65, 78, 8, 14, P.yellow);
  T.rect(ctx, 66, 79, 6, 10, P.black);
  T.rect(ctx, 67, 81, 4, 6, P.yellow);

  // --- Exit sign above door ---
  T.rect(ctx, 4, 22, 14, 5, P.red);
  T.rect(ctx, 5, 23, 12, 3, P.white);
  T.rect(ctx, 6, 24, 10, 1, P.black);

  // --- School mascot logo on wall ---
  T.rect(ctx, 240, 30, 14, 14, P.white);
  T.rect(ctx, 241, 31, 12, 12, P.red);
  T.circleFill(ctx, 247, 37, 4, P.yellow);
  // Wildcat eye
  T.pixel(ctx, 246, 36, P.black);
  T.pixel(ctx, 248, 36, P.black);

  // --- Poster tape remnants on wall ---
  T.pixel(ctx, 72, 66, P.tan);
  T.pixel(ctx, 73, 66, P.tan);
  T.pixel(ctx, 140, 68, P.tan);

  // --- Security camera ---
  T.rect(ctx, 280, 18, 4, 3, P.black);
  T.pixel(ctx, 282, 19, P.red); // LED

  // --- Electrical conduit on ceiling ---
  T.rect(ctx, 0, 16, 320, 1, P.gray);

  // --- Locker combination lock hanging ---
  T.pixel(ctx, 24, 68, P.dark_gray);
  T.pixel(ctx, 24, 69, P.dark_gray);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Shadows from lockers, doors, fixtures
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  // --- Locker bank shadows ---
  T.scatter(ctx, 8, 71, 64, 4, P.black, 0.1);
  T.scatter(ctx, 220, 71, 64, 4, P.black, 0.1);

  // --- Trophy case shadow ---
  if (params.hasTrophyCase) {
    T.scatter(ctx, 80, 70, 50, 5, P.black, 0.12);
  }

  // --- Bulletin board shadow ---
  T.scatter(ctx, 150, 64, 60, 3, P.black, 0.08);

  // --- Door shadows ---
  T.scatter(ctx, 22, 30, 3, 44, P.black, 0.1);
  T.scatter(ctx, 295, 30, 3, 44, P.black, 0.1);

  // --- Water fountain shadow ---
  T.scatter(ctx, 72, 52, 4, 20, P.black, 0.08);

  // --- Backpack shadow ---
  T.scatter(ctx, 112, 120, 4, 6, P.black, 0.12);

  // --- General floor shadow gradient ---
  T.scatter(ctx, 0, 110, 320, 30, P.black, 0.05);

  // --- Ceiling shadow depth ---
  T.scatter(ctx, 0, 0, 320, 2, P.black, 0.06);

  // --- Under-locker darkness ---
  T.scatter(ctx, 8, 69, 64, 6, P.black, 0.15);
  T.scatter(ctx, 220, 69, 64, 6, P.black, 0.15);

  // --- Trophy case glass reflection darkening ---
  if (params.hasTrophyCase) {
    T.scatter(ctx, 83, 25, 44, 42, P.black, 0.08);
  }

  // --- Corner vignettes ---
  T.scatter(ctx, 0, 75, 15, 15, P.black, 0.08);
  T.scatter(ctx, 305, 75, 15, 15, P.black, 0.08);
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Fluorescent brightness, institutional feel
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  // --- Bright fluorescent wash (top half) ---
  T.scatter(ctx, 0, 0, 320, 60, P.white, 0.04);

  // --- Individual light panel glows ---
  const lightPositions = [40, 120, 200, 280];
  for (const lx of lightPositions) {
    T.scatterCircle(ctx, lx + 15, 5, 30, P.white, 0.06);
    T.scatterCircle(ctx, lx + 15, 40, 35, P.pale_pink, 0.03);
  }

  // --- Pale pink institutional tint ---
  T.scatter(ctx, 0, 0, 320, 140, P.pale_pink, 0.02);

  // --- Trophy case reflection pool on floor ---
  if (params.hasTrophyCase) {
    T.scatterCircle(ctx, 105, 80, 25, P.yellow, 0.02);
  }

  // --- Slight warm floor reflection ---
  T.scatter(ctx, 0, 85, 320, 30, P.tan, 0.02);

  // --- Dust motes in light beams ---
  const dustPositions = [
    [45, 25], [50, 35], [65, 30], [125, 28], [135, 40],
    [205, 32], [215, 45], [285, 30], [295, 38], [160, 42],
    [80, 18], [190, 20], [240, 22], [110, 48], [175, 35],
    [55, 50], [265, 35], [145, 25], [220, 50], [100, 32],
  ];

  for (const [dx, dy] of dustPositions) {
    T.pixel(ctx, dx, dy, P.white);
  }

  // --- Vignette: subtle edge darkening ---
  T.scatter(ctx, 0, 0, 20, 20, P.black, 0.04);
  T.scatter(ctx, 300, 0, 20, 20, P.black, 0.04);
  T.scatter(ctx, 0, 120, 20, 20, P.black, 0.04);
  T.scatter(ctx, 300, 120, 20, 20, P.black, 0.04);

  // --- Slight cool blue tint in shadows ---
  T.scatter(ctx, 0, 90, 320, 50, P.dark_blue, 0.01);

  // --- Overall bright institutional atmosphere ---
  T.scatter(ctx, 0, 0, 320, 140, P.off_white, 0.02);
}
