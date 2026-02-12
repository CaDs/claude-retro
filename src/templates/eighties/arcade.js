/**
 * arcade.js — 80s arcade interior room template.
 *
 * Generates a neon-lit arcade with cabinet machines, counter area,
 * prize shelf, and vibrant neon lighting effects.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'eighties/arcade',
  name: 'Arcade',
  setting: 'eighties',
  category: 'interior',
  palette: 'arcade_neon',
  params: {
    cabinetCount: { type: 'enum', options: ['2', '3', '4'], default: '3', label: 'Cabinets' },
    hasCounter: { type: 'boolean', default: true, label: 'Counter' },
    hasNeonSign: { type: 'boolean', default: true, label: 'Neon Sign' },
    mood: { type: 'enum', options: ['neon', 'dim', 'bright'], default: 'neon', label: 'Mood' },
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
//  Layer 1 (BASE): Dark ceiling, walls, patterned carpet
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  const isDim = params.mood === 'dim';
  const isBright = params.mood === 'bright';

  // --- Ceiling (rows 0-12) ---
  const ceilColor = isDim ? P.black : P.dark_purple;
  T.rect(ctx, 0, 0, 320, 13, ceilColor);
  T.dither(ctx, 0, 0, 320, 13, ceilColor, P.black, 0.2, 4);

  // Ceiling tile grid
  for (let x = 0; x < 320; x += 32) {
    T.rect(ctx, x, 0, 1, 13, P.black);
  }
  for (let y = 0; y < 13; y += 6) {
    T.rect(ctx, 0, y, 320, 1, P.black);
  }

  // Neon tube reflections on ceiling — colored stripes
  if (!isDim) {
    T.rect(ctx, 30, 3, 50, 1, P.hot_pink);
    T.rect(ctx, 120, 5, 40, 1, P.cyan);
    T.rect(ctx, 200, 3, 60, 1, P.purple);
    T.rect(ctx, 290, 5, 20, 1, P.magenta);
  }

  // --- Walls (rows 13-75) ---
  const wallBase = isDim ? P.black : P.dark_purple;
  const wallAccent = isDim ? P.dark_purple : P.purple;
  T.rect(ctx, 0, 13, 320, 63, wallBase);
  T.dither(ctx, 0, 13, 320, 63, wallBase, P.black, 0.15, 4);

  // Wall trim strip — neon accent at top
  T.rect(ctx, 0, 13, 320, 1, P.magenta);
  T.rect(ctx, 0, 14, 320, 1, P.hot_pink);

  // Lower wall trim
  T.rect(ctx, 0, 74, 320, 1, P.dark_gray);
  T.rect(ctx, 0, 75, 320, 1, P.gray);

  // Wall panel dividers
  for (let x = 80; x < 320; x += 80) {
    T.rect(ctx, x, 15, 1, 60, P.dark_gray);
    T.rect(ctx, x + 1, 15, 1, 60, wallAccent);
  }

  // --- Carpet (rows 76-140) ---
  const carpetBase = isDim ? P.black : P.dark_blue;
  const carpetAccent = isDim ? P.dark_blue : P.dark_purple;
  T.rect(ctx, 0, 76, 320, 64, carpetBase);

  // 80s-style carpet pattern — geometric diamonds/zigzag
  T.dither(ctx, 0, 76, 320, 64, carpetBase, carpetAccent, 0.2, 4);

  // Diamond pattern repeating on carpet
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 16; col++) {
      const dx = col * 20 + (row % 2) * 10;
      const dy = 76 + row * 8;
      // Small diamond shape
      T.pixel(ctx, dx + 4, dy + 1, P.dark_purple);
      T.pixel(ctx, dx + 3, dy + 2, P.dark_purple);
      T.pixel(ctx, dx + 5, dy + 2, P.dark_purple);
      T.pixel(ctx, dx + 2, dy + 3, P.dark_purple);
      T.pixel(ctx, dx + 6, dy + 3, P.dark_purple);
      T.pixel(ctx, dx + 3, dy + 4, P.dark_purple);
      T.pixel(ctx, dx + 5, dy + 4, P.dark_purple);
      T.pixel(ctx, dx + 4, dy + 5, P.dark_purple);
    }
  }

  // Zigzag accent lines on carpet
  for (let zx = 0; zx < 320; zx += 4) {
    const zy = 100 + ((zx / 4) % 2 === 0 ? 0 : 1);
    T.pixel(ctx, zx, zy, P.magenta);
    T.pixel(ctx, zx, zy + 20, P.cyan);
  }
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Arcade cabinets, counter, prize shelf, entrance
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  const count = parseInt(params.cabinetCount) || 3;

  // --- Arcade cabinets ---
  _drawArcadeCabinets(ctx, P, count, params);

  // --- Counter / register area ---
  if (params.hasCounter) {
    _drawCounter(ctx, P);
  }

  // --- Prize shelf ---
  _drawPrizeShelf(ctx, P);

  // --- Entrance archway ---
  _drawEntrance(ctx, P, params);
}

function _drawArcadeCabinets(ctx, P, count, params) {
  const cabinetW = 36;
  const cabinetH = 60;
  const spacing = 10;
  const totalWidth = count * cabinetW + (count - 1) * spacing;
  const startX = Math.floor((200 - totalWidth) / 2) + 10;
  const baseY = 76 - cabinetH + 14; // cabinets rest on the floor

  for (let i = 0; i < count; i++) {
    const cx = startX + i * (cabinetW + spacing);
    const cy = baseY;

    // Cabinet body — main box
    T.rect(ctx, cx, cy, cabinetW, cabinetH, P.dark_gray);
    T.dither(ctx, cx, cy, cabinetW, cabinetH, P.dark_gray, P.black, 0.12, 4);

    // Cabinet side panels — darker edge for 3D effect
    T.rect(ctx, cx, cy, 2, cabinetH, P.black);
    T.rect(ctx, cx + cabinetW - 2, cy, 2, cabinetH, P.black);

    // Top marquee / header with game title art
    const marqueeColors = [P.hot_pink, P.cyan, P.yellow, P.magenta];
    const marqueeColor = marqueeColors[i % marqueeColors.length];
    T.rect(ctx, cx + 3, cy + 2, cabinetW - 6, 8, P.black);
    T.rect(ctx, cx + 4, cy + 3, cabinetW - 8, 6, marqueeColor);
    T.dither(ctx, cx + 4, cy + 3, cabinetW - 8, 6, marqueeColor, P.black, 0.15, 4);
    // Title text simulation — horizontal lines
    T.rect(ctx, cx + 8, cy + 5, cabinetW - 16, 1, P.black);
    T.rect(ctx, cx + 10, cy + 7, cabinetW - 20, 1, P.black);

    // Screen area
    const scrX = cx + 4;
    const scrY = cy + 12;
    const scrW = cabinetW - 8;
    const scrH = 22;
    T.rect(ctx, scrX, scrY, scrW, scrH, P.black);

    // Screen bezel
    T.rect(ctx, scrX - 1, scrY - 1, scrW + 2, 1, P.gray);
    T.rect(ctx, scrX - 1, scrY + scrH, scrW + 2, 1, P.gray);
    T.rect(ctx, scrX - 1, scrY, 1, scrH, P.gray);
    T.rect(ctx, scrX + scrW, scrY, 1, scrH, P.gray);

    // Game graphics on screen — different per cabinet
    _drawScreenContent(ctx, P, scrX, scrY, scrW, scrH, i);

    // Control panel — angled area below screen
    const ctrlY = scrY + scrH + 2;
    T.polygonFill(ctx, [
      [cx + 3, ctrlY],
      [cx + cabinetW - 3, ctrlY],
      [cx + cabinetW - 2, ctrlY + 10],
      [cx + 2, ctrlY + 10],
    ], P.gray);
    T.dither(ctx, cx + 3, ctrlY, cabinetW - 6, 10, P.gray, P.dark_gray, 0.15, 4);

    // Joystick
    const joyX = cx + 10;
    const joyY = ctrlY + 3;
    T.rect(ctx, joyX, joyY, 3, 5, P.black);
    T.rect(ctx, joyX + 1, joyY - 1, 1, 1, P.black); // stick top
    // Joystick ball
    T.pixel(ctx, joyX, joyY - 1, P.dark_gray);
    T.pixel(ctx, joyX + 2, joyY - 1, P.dark_gray);
    T.pixel(ctx, joyX + 1, joyY - 2, P.gray);

    // Buttons — 2-3 colored buttons
    const btnColors = [P.hot_pink, P.cyan, P.yellow];
    for (let b = 0; b < 3; b++) {
      const bx = cx + 18 + b * 5;
      const by = ctrlY + 3 + (b === 1 ? -1 : 0);
      T.rect(ctx, bx, by, 3, 3, btnColors[b % 3]);
      T.pixel(ctx, bx + 1, by, T.lighten(btnColors[b % 3], 40));
    }

    // Coin slot area
    const coinY = ctrlY + 12;
    T.rect(ctx, cx + 12, coinY, 12, 8, P.black);
    T.rect(ctx, cx + 13, coinY + 1, 10, 6, P.dark_gray);
    // Coin slot
    T.rect(ctx, cx + 16, coinY + 2, 4, 1, P.black);
    // "INSERT COIN" text placeholder
    T.rect(ctx, cx + 14, coinY + 4, 8, 1, P.yellow);

    // Cabinet base / kick plate
    T.rect(ctx, cx + 1, cy + cabinetH - 6, cabinetW - 2, 6, P.black);
    T.rect(ctx, cx + 2, cy + cabinetH - 5, cabinetW - 4, 4, P.dark_gray);
  }
}

function _drawScreenContent(ctx, P, sx, sy, sw, sh, index) {
  // Different mini-game graphics per cabinet
  switch (index % 4) {
    case 0:
      // Space invaders style — rows of enemies and player ship
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
          const ex = sx + 3 + col * 5;
          const ey = sy + 2 + row * 4;
          T.pixel(ctx, ex, ey, P.green);
          T.pixel(ctx, ex + 1, ey, P.green);
          T.pixel(ctx, ex, ey + 1, P.green);
          T.pixel(ctx, ex + 1, ey + 1, P.green);
        }
      }
      // Player ship at bottom
      T.rect(ctx, sx + Math.floor(sw / 2) - 2, sy + sh - 4, 5, 2, P.cyan);
      T.pixel(ctx, sx + Math.floor(sw / 2), sy + sh - 5, P.cyan);
      // Laser
      T.line(ctx, sx + Math.floor(sw / 2), sy + sh - 6, sx + Math.floor(sw / 2), sy + 14, P.yellow);
      // Score text
      T.rect(ctx, sx + 2, sy + 1, 10, 1, P.cyan);
      break;

    case 1:
      // Pac-man style — maze lines and dots
      T.rect(ctx, sx + 2, sy + 4, sw - 4, 1, P.blue);
      T.rect(ctx, sx + 2, sy + sh - 5, sw - 4, 1, P.blue);
      T.rect(ctx, sx + 2, sy + 4, 1, sh - 8, P.blue);
      T.rect(ctx, sx + sw - 3, sy + 4, 1, sh - 8, P.blue);
      T.rect(ctx, sx + 10, sy + 8, 1, 8, P.blue);
      T.rect(ctx, sx + sw - 11, sy + 8, 1, 8, P.blue);
      // Dots
      for (let dx = sx + 5; dx < sx + sw - 4; dx += 3) {
        T.pixel(ctx, dx, sy + Math.floor(sh / 2), P.yellow);
      }
      // Pac-man
      T.pixel(ctx, sx + 8, sy + Math.floor(sh / 2), P.yellow);
      T.pixel(ctx, sx + 7, sy + Math.floor(sh / 2) - 1, P.yellow);
      T.pixel(ctx, sx + 7, sy + Math.floor(sh / 2) + 1, P.yellow);
      // Ghost
      T.pixel(ctx, sx + 18, sy + Math.floor(sh / 2), P.hot_pink);
      T.pixel(ctx, sx + 17, sy + Math.floor(sh / 2), P.hot_pink);
      T.pixel(ctx, sx + 17, sy + Math.floor(sh / 2) - 1, P.hot_pink);
      T.pixel(ctx, sx + 18, sy + Math.floor(sh / 2) - 1, P.hot_pink);
      break;

    case 2:
      // Racing style — road with perspective
      T.polygonFill(ctx, [
        [sx + Math.floor(sw / 2) - 2, sy + 2],
        [sx + Math.floor(sw / 2) + 2, sy + 2],
        [sx + sw - 2, sy + sh - 2],
        [sx + 2, sy + sh - 2],
      ], P.dark_gray);
      // Road center line
      for (let ry = sy + 4; ry < sy + sh - 2; ry += 3) {
        const roadWidth = 1 + Math.floor((ry - sy) / 8);
        const centerX = sx + Math.floor(sw / 2);
        T.pixel(ctx, centerX, ry, P.yellow);
      }
      // Car
      T.rect(ctx, sx + Math.floor(sw / 2) - 2, sy + sh - 6, 5, 3, P.hot_pink);
      T.pixel(ctx, sx + Math.floor(sw / 2), sy + sh - 7, P.hot_pink);
      // Speed lines on sides
      T.line(ctx, sx + 3, sy + sh - 3, sx + 6, sy + 6, P.green);
      T.line(ctx, sx + sw - 4, sy + sh - 3, sx + sw - 7, sy + 6, P.green);
      break;

    case 3:
      // Platformer style — platforms and character
      T.rect(ctx, sx + 2, sy + sh - 3, sw - 4, 2, P.green);
      T.rect(ctx, sx + 5, sy + sh - 10, 10, 2, P.green);
      T.rect(ctx, sx + 16, sy + sh - 15, 8, 2, P.green);
      // Character
      T.pixel(ctx, sx + 8, sy + sh - 12, P.cyan);
      T.pixel(ctx, sx + 8, sy + sh - 11, P.hot_pink);
      // Collectible
      T.pixel(ctx, sx + 19, sy + sh - 17, P.yellow);
      // Ladder
      T.line(ctx, sx + 13, sy + sh - 10, sx + 13, sy + sh - 3, P.orange);
      T.line(ctx, sx + 15, sy + sh - 10, sx + 15, sy + sh - 3, P.orange);
      for (let ly = sy + sh - 9; ly < sy + sh - 3; ly += 2) {
        T.rect(ctx, sx + 13, ly, 3, 1, P.orange);
      }
      break;
  }
}

function _drawCounter(ctx, P) {
  const cx = 240, cy = 44;

  // Counter body
  T.rect(ctx, cx, cy, 70, 32, P.dark_gray);
  T.dither(ctx, cx, cy, 70, 32, P.dark_gray, P.black, 0.15, 4);

  // Counter top surface
  T.rect(ctx, cx - 1, cy - 1, 72, 3, P.gray);
  T.rect(ctx, cx - 1, cy - 1, 72, 1, P.dark_gray);

  // Glass display front (shows prizes inside)
  T.rect(ctx, cx + 2, cy + 4, 40, 20, P.black);
  T.rect(ctx, cx + 3, cy + 5, 38, 18, P.dark_blue);
  T.dither(ctx, cx + 3, cy + 5, 38, 18, P.dark_blue, P.black, 0.3, 4);

  // Items visible in display case
  T.rect(ctx, cx + 6, cy + 14, 4, 6, P.yellow);   // small trophy
  T.pixel(ctx, cx + 7, cy + 13, P.yellow);
  T.rect(ctx, cx + 14, cy + 16, 6, 4, P.hot_pink); // plush
  T.rect(ctx, cx + 24, cy + 15, 3, 5, P.cyan);     // keychain
  T.rect(ctx, cx + 31, cy + 14, 5, 6, P.green);    // prize box

  // Cash register
  T.rect(ctx, cx + 48, cy + 2, 18, 14, P.dark_gray);
  T.rect(ctx, cx + 49, cy + 3, 16, 8, P.gray);
  T.dither(ctx, cx + 49, cy + 3, 16, 8, P.gray, P.dark_gray, 0.12, 4);

  // Register display
  T.rect(ctx, cx + 51, cy + 4, 12, 4, P.black);
  T.rect(ctx, cx + 52, cy + 5, 10, 2, P.green);

  // Register buttons
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      T.rect(ctx, cx + 50 + c * 4, cy + 10 + r * 3, 3, 2, P.dark_gray);
    }
  }

  // Counter base visible below
  T.rect(ctx, cx, cy + 32, 70, 44, P.dark_gray);
  T.dither(ctx, cx, cy + 32, 70, 44, P.dark_gray, P.black, 0.2, 4);

  // Counter front panel detail
  T.rect(ctx, cx + 2, cy + 34, 66, 1, P.gray);
  T.rect(ctx, cx + 2, cy + 50, 66, 1, P.gray);
}

function _drawPrizeShelf(ctx, P) {
  const sx = 252, sy = 18, sw = 58, sh = 24;

  // Shelf back panel
  T.rect(ctx, sx, sy, sw, sh, P.dark_purple);
  T.dither(ctx, sx, sy, sw, sh, P.dark_purple, P.black, 0.15, 4);

  // Shelf boards
  T.rect(ctx, sx, sy, sw, 2, P.dark_gray);
  T.rect(ctx, sx, sy + 11, sw, 2, P.dark_gray);
  T.rect(ctx, sx, sy + sh - 1, sw, 2, P.dark_gray);

  // Prizes on top shelf
  // Stuffed animal
  T.rect(ctx, sx + 3, sy + 3, 6, 7, P.hot_pink);
  T.pixel(ctx, sx + 4, sy + 4, P.black); // eye
  T.pixel(ctx, sx + 7, sy + 4, P.black); // eye

  // Small figure
  T.rect(ctx, sx + 14, sy + 5, 3, 5, P.cyan);
  T.pixel(ctx, sx + 15, sy + 4, P.cyan);

  // Stacked boxes
  T.rect(ctx, sx + 22, sy + 3, 8, 7, P.yellow);
  T.rect(ctx, sx + 23, sy + 4, 6, 5, P.orange);

  // Trophy
  T.rect(ctx, sx + 35, sy + 4, 5, 6, P.yellow);
  T.pixel(ctx, sx + 37, sy + 3, P.yellow);
  T.rect(ctx, sx + 34, sy + 3, 7, 1, P.yellow);

  // Poster/sticker roll
  T.rect(ctx, sx + 45, sy + 4, 8, 6, P.magenta);
  T.pixel(ctx, sx + 48, sy + 6, P.black); // star on it

  // Prizes on bottom shelf
  T.rect(ctx, sx + 3, sy + 14, 10, 7, P.green);  // board game box
  T.rect(ctx, sx + 4, sy + 15, 8, 2, P.yellow);   // label on box
  T.rect(ctx, sx + 18, sy + 15, 4, 6, P.cyan);    // action figure
  T.rect(ctx, sx + 26, sy + 14, 7, 7, P.orange);  // ball
  T.rect(ctx, sx + 38, sy + 16, 12, 5, P.hot_pink); // candy box
  T.rect(ctx, sx + 39, sy + 17, 10, 1, P.yellow);
}

function _drawEntrance(ctx, P, params) {
  const ex = 0, ey = 20, ew = 30, eh = 56;

  // Door frame
  T.rect(ctx, ex, ey, ew, eh, P.dark_gray);
  T.rect(ctx, ex + 1, ey + 1, ew - 2, eh - 2, P.gray);

  // Door — partially open, showing outside darkness
  T.rect(ctx, ex + 2, ey + 2, ew - 4, eh - 4, P.black);
  T.dither(ctx, ex + 2, ey + 2, ew - 4, eh - 4, P.black, P.dark_blue, 0.08, 4);

  // Door frame trim
  T.rect(ctx, ex, ey, ew, 2, P.gray);
  T.rect(ctx, ex, ey + eh - 2, ew, 2, P.gray);
  T.rect(ctx, ex + ew - 2, ey, 2, eh, P.gray);

  // Outside glow visible through door
  T.rect(ctx, ex + 4, ey + 10, 10, 30, P.dark_blue);
  T.dither(ctx, ex + 4, ey + 10, 10, 30, P.dark_blue, P.dark_purple, 0.2, 4);

  // Street light visible outside
  T.pixel(ctx, ex + 8, ey + 12, P.yellow);
  T.pixel(ctx, ex + 9, ey + 12, P.yellow);

  // Door handle
  T.rect(ctx, ex + ew - 6, ey + 30, 2, 4, P.gray);

  // Welcome mat on floor in front of entrance
  T.rect(ctx, ex + 2, ey + eh, ew + 4, 5, P.dark_gray);
  T.dither(ctx, ex + 2, ey + eh, ew + 4, 5, P.dark_gray, P.gray, 0.2, 4);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Neon signs, lights, posters, stickers
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  const count = parseInt(params.cabinetCount) || 3;

  // --- Neon sign on wall ---
  if (params.hasNeonSign) {
    _drawNeonSign(ctx, P);
  }

  // --- Ceiling lights ---
  _drawCeilingLights(ctx, P, params);

  // --- Wall posters ---
  _drawPosters(ctx, P);

  // --- Token exchange machine ---
  _drawTokenMachine(ctx, P);

  // --- Floor details ---
  // Scattered tokens on floor
  T.pixel(ctx, 45, 120, P.yellow);
  T.pixel(ctx, 130, 128, P.yellow);
  T.pixel(ctx, 205, 115, P.yellow);
  T.pixel(ctx, 90, 135, P.yellow);

  // Straw wrapper / trash
  T.rect(ctx, 170, 132, 4, 1, P.white);
  T.pixel(ctx, 260, 125, P.white);

  // "EXIT" sign above entrance
  T.rect(ctx, 5, 16, 20, 5, P.red);
  T.rect(ctx, 7, 17, 16, 3, P.black);
  T.rect(ctx, 8, 18, 14, 1, P.white);

  // Electrical conduit on wall near ceiling
  T.rect(ctx, 0, 15, 320, 1, P.dark_gray);

  // Fire extinguisher on wall near entrance
  T.rect(ctx, 34, 50, 4, 10, P.red);
  T.pixel(ctx, 35, 49, P.dark_gray);
  T.pixel(ctx, 36, 49, P.dark_gray);
  T.rect(ctx, 34, 60, 4, 1, P.dark_gray); // bracket

  // Power strip on floor near cabinets
  T.rect(ctx, 50, 138, 12, 2, P.white);
  T.pixel(ctx, 52, 138, P.black);
  T.pixel(ctx, 55, 138, P.black);
  T.pixel(ctx, 58, 138, P.black);

  // Wall-mounted score board / leaderboard
  T.rect(ctx, 168, 22, 30, 20, P.black);
  T.rect(ctx, 167, 21, 32, 1, P.gray);
  T.rect(ctx, 167, 42, 32, 1, P.gray);
  // Score lines
  for (let ly = 24; ly < 40; ly += 3) {
    T.rect(ctx, 170, ly, 20, 1, P.green);
    T.rect(ctx, 192, ly, 4, 1, P.yellow);
  }
  // "HIGH SCORES" header
  T.rect(ctx, 170, 23, 26, 1, P.cyan);

  // Gumball machine near counter
  if (params.hasCounter) {
    T.rect(ctx, 232, 56, 6, 12, P.dark_gray); // base
    T.circleFill(ctx, 235, 52, 5, P.red); // globe
    T.circleFill(ctx, 235, 52, 4, P.dark_gray); // glass
    // Gumballs inside
    T.pixel(ctx, 234, 51, P.hot_pink);
    T.pixel(ctx, 236, 50, P.cyan);
    T.pixel(ctx, 235, 53, P.yellow);
    T.pixel(ctx, 233, 52, P.green);
    T.pixel(ctx, 237, 52, P.orange);
  }
}

function _drawNeonSign(ctx, P) {
  // Large neon sign on back wall — "ARCADE" or decorative shape
  const nx = 70, ny = 20, nw = 80, nh = 14;

  // Sign backing
  T.rect(ctx, nx, ny, nw, nh, P.black);
  T.rect(ctx, nx - 1, ny - 1, nw + 2, 1, P.dark_gray);
  T.rect(ctx, nx - 1, ny + nh, nw + 2, 1, P.dark_gray);

  // Neon tube letters — simulated "ARCADE" using pixel blocks
  // A
  T.rect(ctx, nx + 5, ny + 3, 6, 8, P.black);
  T.pixel(ctx, nx + 7, ny + 3, P.hot_pink);
  T.pixel(ctx, nx + 6, ny + 4, P.hot_pink);
  T.pixel(ctx, nx + 8, ny + 4, P.hot_pink);
  T.pixel(ctx, nx + 5, ny + 5, P.hot_pink);
  T.pixel(ctx, nx + 9, ny + 5, P.hot_pink);
  T.rect(ctx, nx + 5, ny + 7, 5, 1, P.hot_pink);
  T.pixel(ctx, nx + 5, ny + 6, P.hot_pink);
  T.pixel(ctx, nx + 9, ny + 6, P.hot_pink);
  T.pixel(ctx, nx + 5, ny + 8, P.hot_pink);
  T.pixel(ctx, nx + 9, ny + 8, P.hot_pink);
  T.pixel(ctx, nx + 5, ny + 9, P.hot_pink);
  T.pixel(ctx, nx + 9, ny + 9, P.hot_pink);

  // R
  T.pixel(ctx, nx + 15, ny + 3, P.cyan);
  T.pixel(ctx, nx + 15, ny + 4, P.cyan);
  T.pixel(ctx, nx + 15, ny + 5, P.cyan);
  T.pixel(ctx, nx + 15, ny + 6, P.cyan);
  T.pixel(ctx, nx + 15, ny + 7, P.cyan);
  T.pixel(ctx, nx + 15, ny + 8, P.cyan);
  T.pixel(ctx, nx + 15, ny + 9, P.cyan);
  T.pixel(ctx, nx + 16, ny + 3, P.cyan);
  T.pixel(ctx, nx + 17, ny + 3, P.cyan);
  T.pixel(ctx, nx + 18, ny + 4, P.cyan);
  T.pixel(ctx, nx + 18, ny + 5, P.cyan);
  T.pixel(ctx, nx + 16, ny + 6, P.cyan);
  T.pixel(ctx, nx + 17, ny + 6, P.cyan);
  T.pixel(ctx, nx + 18, ny + 7, P.cyan);
  T.pixel(ctx, nx + 19, ny + 8, P.cyan);
  T.pixel(ctx, nx + 19, ny + 9, P.cyan);

  // C
  T.pixel(ctx, nx + 25, ny + 3, P.magenta);
  T.pixel(ctx, nx + 26, ny + 3, P.magenta);
  T.pixel(ctx, nx + 27, ny + 3, P.magenta);
  T.pixel(ctx, nx + 24, ny + 4, P.magenta);
  T.pixel(ctx, nx + 24, ny + 5, P.magenta);
  T.pixel(ctx, nx + 24, ny + 6, P.magenta);
  T.pixel(ctx, nx + 24, ny + 7, P.magenta);
  T.pixel(ctx, nx + 24, ny + 8, P.magenta);
  T.pixel(ctx, nx + 25, ny + 9, P.magenta);
  T.pixel(ctx, nx + 26, ny + 9, P.magenta);
  T.pixel(ctx, nx + 27, ny + 9, P.magenta);

  // A (second)
  T.pixel(ctx, nx + 35, ny + 3, P.yellow);
  T.pixel(ctx, nx + 34, ny + 4, P.yellow);
  T.pixel(ctx, nx + 36, ny + 4, P.yellow);
  T.pixel(ctx, nx + 33, ny + 5, P.yellow);
  T.pixel(ctx, nx + 37, ny + 5, P.yellow);
  T.rect(ctx, nx + 33, ny + 7, 5, 1, P.yellow);
  T.pixel(ctx, nx + 33, ny + 6, P.yellow);
  T.pixel(ctx, nx + 37, ny + 6, P.yellow);
  T.pixel(ctx, nx + 33, ny + 8, P.yellow);
  T.pixel(ctx, nx + 37, ny + 8, P.yellow);
  T.pixel(ctx, nx + 33, ny + 9, P.yellow);
  T.pixel(ctx, nx + 37, ny + 9, P.yellow);

  // D
  T.pixel(ctx, nx + 43, ny + 3, P.green);
  T.pixel(ctx, nx + 43, ny + 4, P.green);
  T.pixel(ctx, nx + 43, ny + 5, P.green);
  T.pixel(ctx, nx + 43, ny + 6, P.green);
  T.pixel(ctx, nx + 43, ny + 7, P.green);
  T.pixel(ctx, nx + 43, ny + 8, P.green);
  T.pixel(ctx, nx + 43, ny + 9, P.green);
  T.pixel(ctx, nx + 44, ny + 3, P.green);
  T.pixel(ctx, nx + 45, ny + 3, P.green);
  T.pixel(ctx, nx + 46, ny + 4, P.green);
  T.pixel(ctx, nx + 47, ny + 5, P.green);
  T.pixel(ctx, nx + 47, ny + 6, P.green);
  T.pixel(ctx, nx + 47, ny + 7, P.green);
  T.pixel(ctx, nx + 46, ny + 8, P.green);
  T.pixel(ctx, nx + 44, ny + 9, P.green);
  T.pixel(ctx, nx + 45, ny + 9, P.green);

  // E
  T.pixel(ctx, nx + 53, ny + 3, P.hot_pink);
  T.pixel(ctx, nx + 54, ny + 3, P.hot_pink);
  T.pixel(ctx, nx + 55, ny + 3, P.hot_pink);
  T.pixel(ctx, nx + 56, ny + 3, P.hot_pink);
  T.pixel(ctx, nx + 53, ny + 4, P.hot_pink);
  T.pixel(ctx, nx + 53, ny + 5, P.hot_pink);
  T.pixel(ctx, nx + 53, ny + 6, P.hot_pink);
  T.pixel(ctx, nx + 54, ny + 6, P.hot_pink);
  T.pixel(ctx, nx + 55, ny + 6, P.hot_pink);
  T.pixel(ctx, nx + 53, ny + 7, P.hot_pink);
  T.pixel(ctx, nx + 53, ny + 8, P.hot_pink);
  T.pixel(ctx, nx + 53, ny + 9, P.hot_pink);
  T.pixel(ctx, nx + 54, ny + 9, P.hot_pink);
  T.pixel(ctx, nx + 55, ny + 9, P.hot_pink);
  T.pixel(ctx, nx + 56, ny + 9, P.hot_pink);

  // Decorative stars around sign
  T.pixel(ctx, nx - 4, ny + 4, P.yellow);
  T.pixel(ctx, nx + nw + 3, ny + 4, P.yellow);
  T.pixel(ctx, nx + nw + 5, ny + 8, P.cyan);
  T.pixel(ctx, nx - 3, ny + 10, P.magenta);
}

function _drawCeilingLights(ctx, P, params) {
  const isDim = params.mood === 'dim';

  // Fluorescent tube lights
  for (let x = 40; x < 300; x += 60) {
    T.rect(ctx, x, 0, 30, 2, isDim ? P.dark_gray : P.gray);
    if (!isDim) {
      T.rect(ctx, x + 2, 1, 26, 1, P.white);
    }
    // Mounting brackets
    T.pixel(ctx, x, 2, P.dark_gray);
    T.pixel(ctx, x + 29, 2, P.dark_gray);
  }

  // Track lighting spots
  for (let x = 20; x < 300; x += 80) {
    T.rect(ctx, x, 10, 4, 3, P.dark_gray);
    if (!isDim) {
      T.pixel(ctx, x + 1, 12, P.yellow);
      T.pixel(ctx, x + 2, 12, P.yellow);
    }
  }
}

function _drawPosters(ctx, P) {
  // Movie / game poster on wall — left section
  T.rect(ctx, 42, 24, 18, 24, P.dark_blue);
  T.rect(ctx, 43, 25, 16, 22, P.blue);
  // Poster art — simplified
  T.rect(ctx, 45, 28, 12, 8, P.dark_purple);
  T.rect(ctx, 48, 30, 6, 4, P.hot_pink);
  T.rect(ctx, 45, 38, 12, 2, P.yellow);
  T.rect(ctx, 46, 42, 10, 1, P.white);
  T.rect(ctx, 47, 44, 8, 1, P.white);

  // Band poster — right section of wall
  T.rect(ctx, 210, 24, 16, 20, P.black);
  T.rect(ctx, 211, 25, 14, 18, P.purple);
  T.rect(ctx, 213, 27, 10, 6, P.hot_pink);
  T.rect(ctx, 213, 35, 10, 2, P.yellow);
  T.rect(ctx, 214, 39, 8, 1, P.white);

  // Sticker bomb area near cabinets (low on wall)
  for (let i = 0; i < 6; i++) {
    const sx = 60 + i * 15 + (i * 7) % 5;
    const sy = 68 + (i * 3) % 5;
    const colors = [P.hot_pink, P.cyan, P.yellow, P.green, P.orange, P.magenta];
    T.rect(ctx, sx, sy, 3, 3, colors[i]);
  }
}

function _drawTokenMachine(ctx, P) {
  const tx = 230, ty = 50;

  // Machine body
  T.rect(ctx, tx, ty, 14, 26, P.dark_gray);
  T.dither(ctx, tx, ty, 14, 26, P.dark_gray, P.gray, 0.1, 4);

  // Display panel
  T.rect(ctx, tx + 2, ty + 2, 10, 6, P.black);
  T.rect(ctx, tx + 3, ty + 3, 8, 4, P.green);

  // Bill slot
  T.rect(ctx, tx + 4, ty + 10, 6, 2, P.black);
  T.rect(ctx, tx + 5, ty + 10, 4, 1, P.dark_green);

  // Token dispenser at bottom
  T.rect(ctx, tx + 3, ty + 20, 8, 4, P.black);
  T.rect(ctx, tx + 4, ty + 21, 6, 2, P.dark_gray);

  // Token visible in dispenser
  T.pixel(ctx, tx + 6, ty + 22, P.yellow);
  T.pixel(ctx, tx + 7, ty + 22, P.yellow);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Screen glows, neon reflections
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  const count = parseInt(params.cabinetCount) || 3;
  const isDim = params.mood === 'dim';

  // --- Arcade cabinet screen glow on floor ---
  const cabinetW = 36;
  const spacing = 10;
  const totalWidth = count * cabinetW + (count - 1) * spacing;
  const startX = Math.floor((200 - totalWidth) / 2) + 10;

  const screenGlowColors = [P.green, P.blue, P.hot_pink, P.cyan];
  for (let i = 0; i < count; i++) {
    const cx = startX + i * (cabinetW + spacing) + Math.floor(cabinetW / 2);
    const glowColor = screenGlowColors[i % screenGlowColors.length];
    // Glow pool on floor below cabinet
    T.scatterCircle(ctx, cx, 95, 25, glowColor, isDim ? 0.06 : 0.12);
    // Upward glow on cabinet face
    T.scatterCircle(ctx, cx, 50, 15, glowColor, isDim ? 0.04 : 0.08);
  }

  // --- Neon sign glow on wall and ceiling ---
  if (params.hasNeonSign) {
    T.scatterCircle(ctx, 110, 27, 50, P.hot_pink, isDim ? 0.04 : 0.08);
    T.scatterCircle(ctx, 110, 27, 30, P.cyan, isDim ? 0.03 : 0.06);
    // Neon reflection on floor
    T.scatterCircle(ctx, 110, 100, 40, P.hot_pink, isDim ? 0.03 : 0.06);
  }

  // --- Counter area shadow ---
  if (params.hasCounter) {
    T.scatter(ctx, 240, 76, 72, 10, P.black, 0.15);
    // Register screen glow
    T.scatterCircle(ctx, 266, 50, 12, P.green, 0.06);
  }

  // --- Entrance light spill ---
  T.scatterCircle(ctx, 15, 76, 30, P.dark_blue, 0.08);

  // --- General floor shadow gradient (darker in corners) ---
  T.scatter(ctx, 0, 110, 320, 30, P.black, 0.08);
  T.scatter(ctx, 0, 76, 30, 64, P.black, 0.1);
  T.scatter(ctx, 290, 76, 30, 64, P.black, 0.08);

  // --- Ceiling shadow depth ---
  T.scatter(ctx, 0, 0, 320, 4, P.black, 0.12);

  // --- Cabinet side shadows ---
  for (let i = 0; i < count; i++) {
    const cx = startX + i * (cabinetW + spacing);
    T.scatter(ctx, cx + cabinetW, 30, 6, 50, P.black, 0.1);
  }

  // --- Prize shelf shadow on wall ---
  T.scatter(ctx, 252, 42, 60, 4, P.black, 0.08);

  // --- Under-counter shadow ---
  if (params.hasCounter) {
    T.scatter(ctx, 240, 74, 70, 4, P.black, 0.12);
  }
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Neon washes, ambient effects
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  const isDim = params.mood === 'dim';
  const isBright = params.mood === 'bright';

  if (isDim) {
    // --- Dim mode: heavy darkness, only screen glows visible ---
    T.scatter(ctx, 0, 0, 320, 140, P.black, 0.2);
    // Residual neon tint
    T.scatter(ctx, 0, 0, 320, 140, P.dark_purple, 0.02);
  } else if (isBright) {
    // --- Bright mode: well-lit, less neon atmosphere ---
    T.scatter(ctx, 0, 0, 320, 140, P.purple, 0.02);
    T.scatter(ctx, 0, 0, 320, 76, P.white, 0.03);
  } else {
    // --- Neon mode (default): heavy purple/pink neon atmosphere ---
    T.scatter(ctx, 0, 0, 320, 140, P.dark_purple, 0.04);
    T.scatter(ctx, 0, 0, 320, 140, P.hot_pink, 0.02);

    // Neon color pools on walls
    T.scatterCircle(ctx, 60, 40, 40, P.magenta, 0.04);
    T.scatterCircle(ctx, 200, 35, 35, P.cyan, 0.03);

    // Neon reflections on ceiling
    T.scatter(ctx, 0, 0, 320, 13, P.hot_pink, 0.03);
    T.scatter(ctx, 120, 0, 80, 13, P.cyan, 0.03);
  }

  // --- Neon sign halo (if present) ---
  if (params.hasNeonSign && !isDim) {
    T.scatterCircle(ctx, 110, 27, 70, P.hot_pink, 0.03);
    T.scatterCircle(ctx, 110, 27, 40, P.magenta, 0.02);
    // Individual letter glow halos
    T.scatterCircle(ctx, 77, 27, 10, P.hot_pink, 0.04);
    T.scatterCircle(ctx, 87, 27, 10, P.cyan, 0.04);
    T.scatterCircle(ctx, 97, 27, 10, P.magenta, 0.04);
    T.scatterCircle(ctx, 107, 27, 10, P.yellow, 0.04);
    T.scatterCircle(ctx, 117, 27, 10, P.green, 0.04);
    T.scatterCircle(ctx, 127, 27, 10, P.hot_pink, 0.04);
  }

  // --- Carpet neon reflections ---
  if (!isDim) {
    T.scatter(ctx, 50, 90, 100, 30, P.hot_pink, 0.02);
    T.scatter(ctx, 180, 95, 60, 25, P.cyan, 0.02);
  }

  // --- Ambient dust/haze particles ---
  const hazePositions = [
    [30, 35], [75, 55], [140, 30], [190, 50], [250, 40],
    [100, 45], [220, 60], [60, 25], [160, 65], [280, 55],
    [50, 70], [130, 20], [210, 38], [300, 48], [170, 58],
  ];
  for (const [hx, hy] of hazePositions) {
    const hazeColor = isDim ? P.dark_gray : P.purple;
    T.pixel(ctx, hx, hy, hazeColor);
  }

  // --- Vignette: darken edges ---
  T.scatter(ctx, 0, 0, 30, 30, P.black, 0.06);
  T.scatter(ctx, 290, 0, 30, 30, P.black, 0.06);
  T.scatter(ctx, 0, 110, 30, 30, P.black, 0.06);
  T.scatter(ctx, 290, 110, 30, 30, P.black, 0.06);

  // --- Screen flicker effect — random bright pixels near cabinets ---
  if (!isDim) {
    const flickerPositions = [
      [80, 42], [120, 38], [165, 45], [95, 50], [140, 35],
    ];
    for (const [fx, fy] of flickerPositions) {
      T.pixel(ctx, fx, fy, P.white);
    }
  }
}
