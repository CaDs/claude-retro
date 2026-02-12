/**
 * ship_bridge.js — Sci-fi spaceship bridge room template.
 *
 * Generates a detailed command bridge interior with viewscreen,
 * console stations, command chair, and ambient lighting effects.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'scifi/ship_bridge',
  name: 'Ship Bridge',
  setting: 'scifi',
  category: 'interior',
  palette: 'ship_bridge',
  params: {
    hasViewscreen: { type: 'boolean', default: true, label: 'Viewscreen' },
    hasCommandChair: { type: 'boolean', default: true, label: 'Command Chair' },
    consoleCount: { type: 'enum', options: ['2', '3', '4'], default: '3', label: 'Consoles' },
    mood: { type: 'enum', options: ['normal', 'red_alert', 'dim'], default: 'normal', label: 'Mood' },
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
//  Layer 1 (BASE): Ceiling, walls, floor
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  const isDim = params.mood === 'dim';

  // --- Ceiling (rows 0-15) ---
  // Dark metal ceiling panels
  const ceilColor = isDim ? P.black : P.dark_gray;
  const ceilAccent = isDim ? P.dark_gray : P.gray;
  T.rect(ctx, 0, 0, 320, 16, ceilColor);

  // Ceiling panel lines — horizontal ribbing every 3 pixels
  for (let y = 2; y < 16; y += 3) {
    T.rect(ctx, 0, y, 320, 1, P.black);
  }

  // Ceiling panel vertical dividers
  for (let x = 0; x < 320; x += 40) {
    T.rect(ctx, x, 0, 1, 16, P.black);
    // Subtle highlight on right edge of each panel
    T.rect(ctx, x + 1, 0, 1, 16, ceilAccent);
  }

  // Dithered texture on ceiling for metallic look
  T.dither(ctx, 0, 0, 320, 16, ceilColor, P.black, 0.15, 4);

  // --- Walls (rows 16-75) ---
  // Main wall panels — dark blue-gray metal
  const wallBase = isDim ? T.darken(P.dark_blue, 20) : P.dark_blue;
  const wallAccent = isDim ? P.dark_gray : P.dark_gray;
  T.rect(ctx, 0, 16, 320, 60, wallBase);

  // Dithered metallic texture on walls
  T.dither(ctx, 0, 16, 320, 60, wallBase, wallAccent, 0.12, 4);

  // Horizontal wall trim lines
  T.rect(ctx, 0, 16, 320, 1, P.gray);    // top trim
  T.rect(ctx, 0, 40, 320, 1, P.dark_gray); // mid trim
  T.rect(ctx, 0, 75, 320, 1, P.gray);    // bottom trim

  // Vertical wall panel dividers
  for (let x = 64; x < 320; x += 64) {
    T.rect(ctx, x, 16, 1, 60, P.dark_gray);
    T.rect(ctx, x + 1, 16, 1, 60, wallAccent);
  }

  // --- Floor (rows 76-140) ---
  // Dark floor tiles with grid pattern
  const floorBase = isDim ? P.black : P.dark_gray;
  const floorLine = isDim ? P.dark_gray : P.gray;
  T.rect(ctx, 0, 76, 320, 64, floorBase);

  // Dithered floor texture
  T.dither(ctx, 0, 76, 320, 64, floorBase, P.black, 0.2, 4);

  // Floor tile grid — horizontal lines
  for (let y = 76; y < 140; y += 10) {
    T.rect(ctx, 0, y, 320, 1, floorLine);
  }

  // Floor tile grid — vertical lines with perspective convergence
  for (let x = 0; x < 320; x += 20) {
    T.rect(ctx, x, 76, 1, 64, floorLine);
  }

  // Floor center stripe (walkway)
  T.rect(ctx, 140, 76, 40, 64, T.darken(floorBase, 10));
  T.rect(ctx, 140, 76, 1, 64, P.blue);
  T.rect(ctx, 179, 76, 1, 64, P.blue);

  // Floor edge highlight
  T.rect(ctx, 0, 76, 320, 1, P.light_gray);
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Viewscreen, consoles, command chair, door
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  const count = parseInt(params.consoleCount) || 3;

  // --- Viewscreen ---
  if (params.hasViewscreen) {
    _drawViewscreen(ctx, P, params);
  }

  // --- Console stations ---
  _drawConsoles(ctx, P, count, params);

  // --- Command chair ---
  if (params.hasCommandChair) {
    _drawCommandChair(ctx, P);
  }

  // --- Sliding door (left wall) ---
  _drawSlidingDoor(ctx, P);
}

function _drawViewscreen(ctx, P, params) {
  const vsX = 80, vsY = 18, vsW = 160, vsH = 50;

  // Viewscreen frame — thick dark border
  T.rect(ctx, vsX - 3, vsY - 2, vsW + 6, vsH + 4, P.dark_gray);
  T.rect(ctx, vsX - 2, vsY - 1, vsW + 4, vsH + 2, P.gray);
  T.rect(ctx, vsX - 1, vsY, vsW + 2, vsH, P.dark_gray);

  // Screen area — deep space background
  T.rect(ctx, vsX, vsY, vsW, vsH, P.black);

  // Starfield — scattered white and blue dots
  const starPositions = [
    [8, 5], [22, 12], [45, 8], [67, 22], [90, 15], [110, 30],
    [130, 10], [15, 35], [50, 40], [75, 28], [100, 42], [140, 18],
    [35, 20], [120, 38], [60, 45], [95, 7], [148, 25], [155, 40],
    [25, 30], [70, 14], [115, 20], [82, 38], [42, 33], [128, 44],
  ];
  for (let i = 0; i < starPositions.length; i++) {
    const sx = vsX + starPositions[i][0];
    const sy = vsY + starPositions[i][1];
    const color = (i % 3 === 0) ? P.light_blue : (i % 3 === 1) ? P.white : P.cyan;
    T.pixel(ctx, sx, sy, color);
  }

  // Distant planet — small circle in upper right of screen
  T.circleFill(ctx, vsX + 130, vsY + 16, 8, P.dark_blue);
  T.circleFill(ctx, vsX + 130, vsY + 16, 7, P.blue);
  // Planet highlight crescent
  for (let i = 0; i < 6; i++) {
    T.pixel(ctx, vsX + 126 + i, vsY + 11 + i, P.light_blue);
  }

  // Nebula wisps — dithered patches
  T.dither(ctx, vsX + 20, vsY + 25, 40, 15, P.black, P.dark_blue, 0.15, 4);
  T.dither(ctx, vsX + 90, vsY + 10, 30, 20, P.black, P.dark_red, 0.1, 4);

  // Screen frame inner edge highlight
  T.rect(ctx, vsX, vsY, vsW, 1, P.dark_gray);
  T.rect(ctx, vsX, vsY, 1, vsH, P.dark_gray);
}

function _drawConsoles(ctx, P, count, params) {
  // Console desk positions — evenly distributed along the front
  const consoleW = 50;
  const consoleH = 18;
  const consoleY = 85;  // top of console desk on the floor

  const totalWidth = count * consoleW + (count - 1) * 12;
  const startX = Math.floor((320 - totalWidth) / 2);

  for (let i = 0; i < count; i++) {
    const cx = startX + i * (consoleW + 12);

    // Console desk body — trapezoidal shape
    T.polygonFill(ctx, [
      [cx + 3, consoleY],
      [cx + consoleW - 3, consoleY],
      [cx + consoleW, consoleY + consoleH],
      [cx, consoleY + consoleH],
    ], P.dark_gray);

    // Console desk top surface
    T.rect(ctx, cx + 3, consoleY, consoleW - 6, 2, P.gray);

    // Console desk front panel
    T.rect(ctx, cx + 1, consoleY + 2, consoleW - 2, consoleH - 2, P.dark_gray);
    T.dither(ctx, cx + 1, consoleY + 2, consoleW - 2, consoleH - 2, P.dark_gray, P.black, 0.2, 4);

    // Screen on console — recessed rectangle
    const scrW = 30;
    const scrH = 8;
    const scrX = cx + Math.floor((consoleW - scrW) / 2);
    const scrY = consoleY + 3;
    T.rect(ctx, scrX, scrY, scrW, scrH, P.black);

    // Screen content — green or blue readout lines
    const screenColor = (i % 2 === 0) ? P.green : P.light_blue;
    for (let lineY = scrY + 1; lineY < scrY + scrH - 1; lineY += 2) {
      const lineW = 4 + ((lineY * 7 + i * 13) % (scrW - 8));
      T.rect(ctx, scrX + 2, lineY, lineW, 1, screenColor);
    }

    // Button row below screen
    const btnY = consoleY + 12;
    for (let b = 0; b < 5; b++) {
      const btnX = cx + 8 + b * 7;
      const btnColor = [P.red, P.green, P.yellow, P.blue, P.cyan][b % 5];
      T.rect(ctx, btnX, btnY, 3, 2, btnColor);
    }

    // Side panel trim
    T.rect(ctx, cx, consoleY, 1, consoleH, P.gray);
    T.rect(ctx, cx + consoleW - 1, consoleY, 1, consoleH, P.black);
  }
}

function _drawCommandChair(ctx, P) {
  const chairX = 148;
  const chairY = 108;

  // Chair base / pedestal
  T.rect(ctx, chairX + 4, chairY + 14, 16, 4, P.dark_gray);
  T.rect(ctx, chairX + 8, chairY + 18, 8, 3, P.dark_gray);

  // Seat
  T.rect(ctx, chairX + 2, chairY + 10, 20, 5, P.gray);
  T.dither(ctx, chairX + 2, chairY + 10, 20, 5, P.gray, P.dark_gray, 0.2, 4);

  // Backrest
  T.rect(ctx, chairX + 4, chairY, 16, 11, P.gray);
  T.dither(ctx, chairX + 4, chairY, 16, 11, P.gray, P.dark_gray, 0.15, 4);

  // Backrest top curve highlight
  T.rect(ctx, chairX + 5, chairY, 14, 1, P.light_gray);

  // Armrests
  T.rect(ctx, chairX, chairY + 8, 4, 3, P.dark_gray);
  T.rect(ctx, chairX + 20, chairY + 8, 4, 3, P.dark_gray);

  // Armrest control panels (small button arrays)
  T.pixel(ctx, chairX + 1, chairY + 9, P.red);
  T.pixel(ctx, chairX + 2, chairY + 9, P.green);
  T.pixel(ctx, chairX + 21, chairY + 9, P.blue);
  T.pixel(ctx, chairX + 22, chairY + 9, P.yellow);
}

function _drawSlidingDoor(ctx, P) {
  const doorX = 5;
  const doorY = 28;
  const doorW = 22;
  const doorH = 48;

  // Door frame — recessed into wall
  T.rect(ctx, doorX - 2, doorY - 2, doorW + 4, doorH + 4, P.dark_gray);
  T.rect(ctx, doorX - 1, doorY - 1, doorW + 2, doorH + 2, P.gray);

  // Door panels (two halves)
  const halfW = Math.floor(doorW / 2) - 1;
  T.rect(ctx, doorX, doorY, halfW, doorH, P.gray);
  T.rect(ctx, doorX + halfW + 2, doorY, halfW, doorH, P.gray);

  // Center seam
  T.rect(ctx, doorX + halfW, doorY, 2, doorH, P.black);

  // Dither texture on door panels
  T.dither(ctx, doorX, doorY, halfW, doorH, P.gray, P.dark_gray, 0.15, 4);
  T.dither(ctx, doorX + halfW + 2, doorY, halfW, doorH, P.gray, P.dark_gray, 0.15, 4);

  // Door frame top/bottom trim
  T.rect(ctx, doorX - 2, doorY - 2, doorW + 4, 2, P.light_gray);
  T.rect(ctx, doorX - 2, doorY + doorH, doorW + 4, 2, P.light_gray);

  // Access panel beside door
  T.rect(ctx, doorX + doorW + 4, doorY + 15, 8, 12, P.dark_gray);
  T.rect(ctx, doorX + doorW + 5, doorY + 16, 6, 10, P.black);
  T.rect(ctx, doorX + doorW + 6, doorY + 18, 4, 3, P.green);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Indicators, screen content, buttons, status panels
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  const isRedAlert = params.mood === 'red_alert';

  // --- Ceiling strip lights ---
  for (let x = 10; x < 310; x += 30) {
    const lightColor = isRedAlert ? P.red : P.light_blue;
    T.rect(ctx, x, 1, 12, 2, lightColor);
    // Small mounting brackets
    T.pixel(ctx, x - 1, 1, P.gray);
    T.pixel(ctx, x + 12, 1, P.gray);
  }

  // --- Wall status panels (left and right of viewscreen) ---
  _drawStatusPanel(ctx, P, 10, 20, 55, 30, isRedAlert);
  _drawStatusPanel(ctx, P, 255, 20, 55, 30, isRedAlert);

  // --- Upper wall indicator strip ---
  for (let x = 68; x < 252; x += 12) {
    const dotColor = isRedAlert ? P.red : [P.green, P.cyan, P.yellow, P.blue][((x / 12) | 0) % 4];
    T.pixel(ctx, x, 18, dotColor);
    T.pixel(ctx, x + 1, 18, dotColor);
  }

  // --- Floor guide lights along center walkway ---
  for (let y = 80; y < 140; y += 8) {
    T.pixel(ctx, 141, y, P.blue);
    T.pixel(ctx, 178, y, P.blue);
  }

  // --- Railing / safety rail across the mid-bridge ---
  T.rect(ctx, 40, 82, 240, 1, P.gray);
  T.rect(ctx, 40, 83, 240, 1, P.dark_gray);
  // Railing posts
  for (let x = 40; x <= 280; x += 30) {
    T.rect(ctx, x, 78, 1, 6, P.gray);
    T.pixel(ctx, x, 77, P.light_gray);
  }

  // --- Small tactical display on right wall ---
  T.rect(ctx, 290, 42, 22, 18, P.black);
  T.rect(ctx, 289, 41, 24, 1, P.gray);
  T.rect(ctx, 289, 60, 24, 1, P.gray);
  // Grid pattern in tactical display
  for (let gx = 292; gx < 310; gx += 4) {
    T.line(ctx, gx, 43, gx, 58, P.dark_green);
  }
  for (let gy = 44; gy < 59; gy += 4) {
    T.line(ctx, 291, gy, 311, gy, P.dark_green);
  }
  // Blip on tactical display
  T.pixel(ctx, 300, 50, P.green);
  T.pixel(ctx, 301, 50, P.green);
  T.pixel(ctx, 300, 51, P.green);

  // --- Shield/power indicators on lower wall ---
  for (let i = 0; i < 4; i++) {
    const ix = 70 + i * 8;
    const barH = 3 + (i * 5) % 8;
    T.rect(ctx, ix, 68 - barH, 4, barH, P.green);
    T.rect(ctx, ix, 68, 4, 1, P.dark_gray);
  }

  // --- Comms speaker grille on left wall ---
  T.rect(ctx, 38, 50, 16, 12, P.dark_gray);
  for (let gy = 51; gy < 62; gy += 2) {
    T.rect(ctx, 39, gy, 14, 1, P.black);
  }

  // --- Red alert lights on walls (if applicable) ---
  if (isRedAlert) {
    T.rect(ctx, 2, 18, 4, 4, P.red);
    T.rect(ctx, 314, 18, 4, 4, P.red);
    T.rect(ctx, 2, 55, 4, 4, P.red);
    T.rect(ctx, 314, 55, 4, 4, P.red);
  }

  // --- Floor vent grates ---
  for (let vx = 20; vx < 120; vx += 50) {
    T.rect(ctx, vx, 130, 16, 6, P.black);
    for (let vy = 131; vy < 136; vy += 2) {
      T.rect(ctx, vx + 1, vy, 14, 1, P.dark_gray);
    }
  }
  for (let vx = 200; vx < 310; vx += 50) {
    T.rect(ctx, vx, 130, 16, 6, P.black);
    for (let vy = 131; vy < 136; vy += 2) {
      T.rect(ctx, vx + 1, vy, 14, 1, P.dark_gray);
    }
  }
}

function _drawStatusPanel(ctx, P, x, y, w, h, isRedAlert) {
  // Panel background
  T.rect(ctx, x, y, w, h, P.black);
  T.rect(ctx, x, y, w, 1, P.gray);
  T.rect(ctx, x, y + h - 1, w, 1, P.gray);
  T.rect(ctx, x, y, 1, h, P.gray);
  T.rect(ctx, x + w - 1, y, 1, h, P.gray);

  // Readout lines — simulated data
  for (let ly = y + 3; ly < y + h - 3; ly += 3) {
    const lineW = 8 + ((ly * 11) % (w - 16));
    const lineColor = isRedAlert ? P.red : P.cyan;
    T.rect(ctx, x + 3, ly, lineW, 1, lineColor);
  }

  // Status indicator dots along bottom
  for (let dx = x + 4; dx < x + w - 4; dx += 6) {
    const dotColor = isRedAlert ? P.red : P.green;
    T.pixel(ctx, dx, y + h - 3, dotColor);
  }

  // Corner bracket decorations
  T.pixel(ctx, x + 1, y + 1, P.light_gray);
  T.pixel(ctx, x + w - 2, y + 1, P.light_gray);
  T.pixel(ctx, x + 1, y + h - 2, P.light_gray);
  T.pixel(ctx, x + w - 2, y + h - 2, P.light_gray);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Console glow, viewscreen light cast
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  const isRedAlert = params.mood === 'red_alert';
  const isDim = params.mood === 'dim';
  const count = parseInt(params.consoleCount) || 3;

  // --- Console screen glow on floor ---
  const consoleW = 50;
  const totalWidth = count * consoleW + (count - 1) * 12;
  const startX = Math.floor((320 - totalWidth) / 2);

  for (let i = 0; i < count; i++) {
    const cx = startX + i * (consoleW + 12) + Math.floor(consoleW / 2);
    const glowColor = (i % 2 === 0) ? P.green : P.light_blue;
    T.scatterCircle(ctx, cx, 106, 20, glowColor, isDim ? 0.06 : 0.12);
  }

  // --- Viewscreen light cast onto floor ---
  if (params.hasViewscreen) {
    T.scatterCircle(ctx, 160, 90, 60, P.light_blue, isDim ? 0.04 : 0.08);
    // Broader but fainter viewscreen ambient
    T.scatter(ctx, 80, 76, 160, 30, P.dark_blue, isDim ? 0.03 : 0.06);
  }

  // --- Command chair shadow ---
  if (params.hasCommandChair) {
    T.scatter(ctx, 146, 122, 28, 8, P.black, 0.15);
  }

  // --- General floor shadow gradient (darker at edges) ---
  T.scatter(ctx, 0, 100, 50, 40, P.black, 0.12);
  T.scatter(ctx, 270, 100, 50, 40, P.black, 0.12);

  // --- Ceiling shadow along top edge ---
  T.scatter(ctx, 0, 0, 320, 6, P.black, 0.15);

  // --- Red alert pulsing light patches ---
  if (isRedAlert) {
    T.scatterCircle(ctx, 3, 20, 30, P.red, 0.15);
    T.scatterCircle(ctx, 317, 20, 30, P.red, 0.15);
    T.scatterCircle(ctx, 3, 57, 25, P.red, 0.12);
    T.scatterCircle(ctx, 317, 57, 25, P.red, 0.12);
    T.scatter(ctx, 0, 76, 320, 64, P.dark_red, 0.06);
  }

  // --- Door area shadow ---
  T.scatter(ctx, 0, 28, 35, 50, P.black, 0.08);

  // --- Under-console shadows ---
  for (let i = 0; i < count; i++) {
    const cx = startX + i * (consoleW + 12);
    T.scatter(ctx, cx, 103, consoleW, 6, P.black, 0.18);
  }
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Ambient washes, subtle effects
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  const isRedAlert = params.mood === 'red_alert';
  const isDim = params.mood === 'dim';

  if (isRedAlert) {
    // --- Red alert: red wash over entire scene ---
    T.scatter(ctx, 0, 0, 320, 140, P.red, 0.05);
    // Pulsing red from ceiling lights
    for (let x = 10; x < 310; x += 30) {
      T.scatterCircle(ctx, x + 6, 4, 18, P.red, 0.08);
    }
  } else if (isDim) {
    // --- Dim mode: heavy darkness, minimal light ---
    T.scatter(ctx, 0, 0, 320, 140, P.black, 0.2);
    // Only console screens provide light
    T.scatterCircle(ctx, 160, 70, 80, P.dark_blue, 0.04);
  } else {
    // --- Normal: cool blue ambient wash ---
    T.scatter(ctx, 0, 0, 320, 140, P.blue, 0.03);

    // Subtle ceiling light pools
    for (let x = 10; x < 310; x += 30) {
      T.scatterCircle(ctx, x + 6, 8, 22, P.light_blue, 0.05);
    }

    // Viewscreen ambient spill into room
    if (params.hasViewscreen) {
      T.scatterCircle(ctx, 160, 40, 100, P.dark_blue, 0.03);
    }
  }

  // --- Dust motes / ambient particles (always present, very subtle) ---
  const motePositions = [
    [45, 30], [120, 50], [200, 25], [270, 45], [80, 65],
    [180, 70], [250, 60], [30, 55], [155, 35], [300, 38],
  ];
  for (const [mx, my] of motePositions) {
    const moteColor = isRedAlert ? P.dark_red : P.light_gray;
    T.pixel(ctx, mx, my, moteColor);
  }

  // --- Floor reflections from overhead lights ---
  if (!isDim) {
    for (let x = 10; x < 310; x += 30) {
      T.scatterCircle(ctx, x + 6, 130, 12, P.light_gray, 0.03);
    }
  }

  // --- Subtle vignette: darken corners ---
  T.scatter(ctx, 0, 0, 40, 30, P.black, 0.06);
  T.scatter(ctx, 280, 0, 40, 30, P.black, 0.06);
  T.scatter(ctx, 0, 110, 40, 30, P.black, 0.06);
  T.scatter(ctx, 280, 110, 40, 30, P.black, 0.06);
}
