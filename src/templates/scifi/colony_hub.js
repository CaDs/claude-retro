/**
 * colony_hub.js — Sci-fi space colony central hub template.
 *
 * Generates a spacious colony hub interior with curved dome architecture,
 * metallic/concrete floors, vegetation planters, benches, info displays,
 * and distant views of space or planets through transparent dome segments.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'scifi/colony_hub',
  name: 'Colony Hub',
  setting: 'scifi',
  category: 'interior',
  palette: 'colony_hub',
  params: {
    plantCount: { type: 'enum', options: ['2', '3', '4'], default: '3', label: 'Planters' },
    hasBenches: { type: 'boolean', default: true, label: 'Benches' },
    skyView: { type: 'enum', options: ['stars', 'planet', 'nebula'], default: 'planet', label: 'Sky View' },
    timeOfDay: { type: 'enum', options: ['day', 'evening', 'night'], default: 'day', label: 'Time' },
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
//  Layer 1 (BASE): Dome ceiling, walls, floor
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  const isNight = params.timeOfDay === 'night';
  const isEvening = params.timeOfDay === 'evening';

  // --- Dome ceiling / sky view (rows 0-45) ---
  // Deep space visible through transparent dome segments
  const skyBase = isNight ? P.black : isEvening ? P.dark_blue : P.blue;
  T.rect(ctx, 0, 0, 320, 46, skyBase);

  // Dome structural arches — curved support beams
  _drawDomeArches(ctx, P, isNight);

  // Sky content will be added in structures layer (stars, planet, etc.)

  // --- Upper walls with curved segments (rows 46-70) ---
  const wallColor = isNight ? P.dark_gray : P.gray;
  const wallAccent = isNight ? P.black : P.dark_gray;

  // Curved wall transition from dome to vertical walls
  for (let y = 46; y < 58; y++) {
    const indent = Math.floor((58 - y) * 0.8);
    T.rect(ctx, indent, y, 320 - indent * 2, 1, wallColor);
  }

  // Vertical wall sections
  T.rect(ctx, 0, 58, 320, 13, wallColor);

  // Wall panel grid
  for (let x = 0; x < 320; x += 40) {
    T.rect(ctx, x, 46, 1, 25, wallAccent);
    if (x > 0) {
      T.rect(ctx, x + 1, 46, 1, 25, P.light_gray);
    }
  }

  // Horizontal trim lines on walls
  T.rect(ctx, 0, 58, 320, 1, P.light_gray);
  T.rect(ctx, 0, 65, 320, 1, wallAccent);
  T.rect(ctx, 0, 70, 320, 1, P.light_gray);

  // Dithered metallic texture on walls
  T.dither(ctx, 0, 46, 320, 25, wallColor, wallAccent, 0.15, 4);

  // --- Floor (rows 71-140) ---
  // Concrete/composite flooring with tile pattern
  const floorBase = isNight ? P.dark_gray : P.gray;
  const floorLine = isNight ? P.black : P.dark_gray;
  const floorHighlight = P.light_gray;

  T.rect(ctx, 0, 71, 320, 69, floorBase);

  // Floor tile grid — large square tiles
  for (let y = 71; y < 140; y += 12) {
    T.rect(ctx, 0, y, 320, 1, floorLine);
  }
  for (let x = 0; x < 320; x += 16) {
    T.rect(ctx, x, 71, 1, 69, floorLine);
  }

  // Floor edge highlight at wall join
  T.rect(ctx, 0, 71, 320, 1, floorHighlight);

  // Central pathway — slightly different color/texture
  T.rect(ctx, 120, 71, 80, 69, T.darken(floorBase, 8));
  T.rect(ctx, 120, 71, 1, 69, P.dark_blue);
  T.rect(ctx, 199, 71, 1, 69, P.dark_blue);

  // Dithered floor texture for realism
  T.dither(ctx, 0, 71, 320, 69, floorBase, floorLine, 0.18, 4);
}

function _drawDomeArches(ctx, P, isNight) {
  // Draw structural arches that support the transparent dome
  const archColor = isNight ? P.dark_gray : P.gray;
  const archHighlight = P.light_gray;

  // Three main arches across the dome
  for (let i = 0; i < 3; i++) {
    const archX = 53 + i * 107;

    // Arch beam — vertical rising to curve at top
    T.rect(ctx, archX, 16, 3, 30, archColor);

    // Arch curve at top — simple approximation
    for (let dy = 0; dy < 8; dy++) {
      const offset = Math.floor(Math.sqrt(64 - dy * dy) / 2);
      T.rect(ctx, archX - offset, 16 - dy, 1, 1, archColor);
      T.rect(ctx, archX + 2 + offset, 16 - dy, 1, 1, archColor);
    }

    // Highlight edge on left side of arch
    T.rect(ctx, archX, 16, 1, 30, archHighlight);
  }

  // Horizontal support ring around dome perimeter
  T.rect(ctx, 0, 45, 320, 2, archColor);
  T.rect(ctx, 0, 45, 320, 1, archHighlight);
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Planters, benches, info kiosks, exits
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  const count = parseInt(params.plantCount) || 3;

  // --- Sky view content (stars, planet, nebula) ---
  _drawSkyView(ctx, P, params);

  // --- Vegetation planters ---
  _drawPlanters(ctx, P, count);

  // --- Benches ---
  if (params.hasBenches) {
    _drawBench(ctx, P, 40, 95);
    _drawBench(ctx, P, 240, 95);
  }

  // --- Information kiosk (central feature) ---
  _drawInfoKiosk(ctx, P, 150, 85);

  // --- Exit doors on left and right walls ---
  _drawColonyDoor(ctx, P, 10, 58, false);  // left
  _drawColonyDoor(ctx, P, 290, 58, true);  // right
}

function _drawSkyView(ctx, P, params) {
  const skyType = params.skyView;
  const isNight = params.timeOfDay === 'night';

  // Stars — always present when viewing space
  const starPositions = [
    [15, 8], [42, 18], [78, 12], [105, 25], [134, 9], [168, 22],
    [195, 14], [223, 28], [254, 11], [287, 20], [35, 35], [90, 38],
    [145, 32], [200, 40], [265, 36], [310, 15], [58, 5], [178, 7],
    [120, 42], [240, 24], [25, 29], [185, 18], [302, 32], [70, 23],
  ];

  for (let i = 0; i < starPositions.length; i++) {
    const [sx, sy] = starPositions[i];
    const color = (i % 4 === 0) ? P.white : (i % 4 === 1) ? P.light_gray : (i % 4 === 2) ? P.blue : P.tan;
    T.pixel(ctx, sx, sy, color);
    if (i % 5 === 0) {
      T.pixel(ctx, sx + 1, sy, color);  // Brighter star
    }
  }

  // Specific sky view content
  if (skyType === 'planet') {
    // Large planet visible in upper right quadrant
    T.circleFill(ctx, 240, 20, 18, P.brown);
    T.circleFill(ctx, 240, 20, 17, P.tan);

    // Planet surface features — continents/oceans
    T.dither(ctx, 225, 10, 18, 12, P.tan, P.dark_brown, 0.3, 4);
    T.dither(ctx, 238, 18, 14, 10, P.tan, P.green, 0.25, 4);

    // Atmospheric glow ring
    for (let r = 19; r < 22; r++) {
      T.ellipse(ctx, 240, 20, r, r, P.light_blue, 0.15);
    }

    // Terminator shadow on left edge
    for (let dy = -15; dy < 15; dy++) {
      const dx = -Math.floor(Math.sqrt(Math.max(0, 225 - dy * dy)));
      T.scatter(ctx, 240 + dx - 2, 20 + dy, 4, 1, P.black, 0.4);
    }
  } else if (skyType === 'nebula') {
    // Colorful nebula clouds
    T.dither(ctx, 60, 8, 80, 30, P.black, P.dark_blue, 0.2, 4);
    T.dither(ctx, 70, 12, 60, 22, P.black, P.blue, 0.15, 4);
    T.scatter(ctx, 80, 15, 40, 18, P.orange, 0.12);
    T.scatter(ctx, 90, 18, 30, 14, P.yellow, 0.08);

    // Bright nebula core
    T.scatterCircle(ctx, 100, 24, 12, P.white, 0.1);
  }
  // 'stars' option just shows the starfield already drawn
}

function _drawPlanters(ctx, P, count) {
  const spacing = Math.floor(200 / (count + 1));
  const startX = 60;

  for (let i = 0; i < count; i++) {
    const px = startX + i * spacing;
    const py = 105;

    // Planter box — trapezoidal concrete/metal container
    T.polygonFill(ctx, [
      [px, py],
      [px + 30, py],
      [px + 28, py + 12],
      [px + 2, py + 12],
    ], P.dark_gray);

    // Planter interior — soil
    T.rect(ctx, px + 3, py + 2, 24, 9, P.dark_brown);
    T.dither(ctx, px + 3, py + 2, 24, 9, P.dark_brown, P.brown, 0.25, 4);

    // Plants — varied heights and colors
    const plantType = i % 3;
    if (plantType === 0) {
      // Tall grass-like plant
      for (let b = 0; b < 5; b++) {
        const bx = px + 6 + b * 4;
        T.rect(ctx, bx, py - 8, 2, 10, P.dark_green);
        T.rect(ctx, bx, py - 8, 1, 10, P.green);
        T.pixel(ctx, bx, py - 9, P.light_green);
      }
    } else if (plantType === 1) {
      // Broad-leaf plant
      T.rect(ctx, px + 14, py - 2, 2, 6, P.dark_brown);  // stem
      T.circleFill(ctx, px + 15, py - 5, 6, P.dark_green);
      T.circleFill(ctx, px + 15, py - 5, 5, P.green);
      T.scatter(ctx, px + 10, py - 9, 10, 8, P.light_green, 0.15);
    } else {
      // Spiky succulent
      T.rect(ctx, px + 12, py - 1, 6, 5, P.dark_green);
      for (let s = 0; s < 3; s++) {
        const sx = px + 13 + s * 2;
        T.rect(ctx, sx, py - 6 - s * 2, 1, 5 + s * 2, P.green);
        T.pixel(ctx, sx, py - 7 - s * 2, P.light_green);
      }
    }

    // Planter edge highlights
    T.rect(ctx, px, py, 30, 1, P.gray);
    T.rect(ctx, px, py, 1, 12, P.light_gray);
  }
}

function _drawBench(ctx, P, x, y) {
  // Modern colony bench — metal frame with seating surface

  // Seat surface
  T.rect(ctx, x, y, 32, 4, P.gray);
  T.dither(ctx, x, y, 32, 4, P.gray, P.dark_gray, 0.2, 4);

  // Seat edge highlight
  T.rect(ctx, x, y, 32, 1, P.light_gray);

  // Support legs
  T.rect(ctx, x + 2, y + 4, 2, 6, P.dark_gray);
  T.rect(ctx, x + 28, y + 4, 2, 6, P.dark_gray);

  // Backrest posts
  T.rect(ctx, x + 4, y - 8, 2, 8, P.dark_gray);
  T.rect(ctx, x + 26, y - 8, 2, 8, P.dark_gray);

  // Backrest horizontal bars
  T.rect(ctx, x + 4, y - 6, 24, 2, P.gray);
  T.rect(ctx, x + 4, y - 2, 24, 2, P.gray);

  // Metal texture on backrest
  T.dither(ctx, x + 4, y - 6, 24, 2, P.gray, P.light_gray, 0.15, 4);
  T.dither(ctx, x + 4, y - 2, 24, 2, P.gray, P.light_gray, 0.15, 4);
}

function _drawInfoKiosk(ctx, P, x, y) {
  // Central information terminal kiosk

  // Pedestal base
  T.rect(ctx, x - 8, y + 18, 16, 8, P.dark_gray);
  T.rect(ctx, x - 6, y + 26, 12, 3, P.gray);

  // Main column
  T.rect(ctx, x - 6, y, 12, 18, P.gray);
  T.dither(ctx, x - 6, y, 12, 18, P.gray, P.dark_gray, 0.18, 4);

  // Column edge highlights
  T.rect(ctx, x - 6, y, 1, 18, P.light_gray);
  T.rect(ctx, x + 5, y, 1, 18, P.black);

  // Display screen
  T.rect(ctx, x - 10, y + 2, 20, 12, P.black);
  T.rect(ctx, x - 11, y + 1, 22, 1, P.light_gray);
  T.rect(ctx, x - 11, y + 14, 22, 1, P.dark_gray);

  // Screen content — map/directory display
  T.rect(ctx, x - 8, y + 4, 16, 1, P.blue);
  T.rect(ctx, x - 8, y + 6, 12, 1, P.blue);
  T.rect(ctx, x - 8, y + 8, 14, 1, P.light_green);
  T.rect(ctx, x - 8, y + 10, 10, 1, P.light_green);

  // Location indicator dot
  T.pixel(ctx, x - 2, y + 7, P.orange);
  T.pixel(ctx, x - 1, y + 7, P.orange);
  T.pixel(ctx, x - 2, y + 8, P.orange);
  T.pixel(ctx, x - 1, y + 8, P.orange);

  // Control buttons below screen
  for (let b = 0; b < 4; b++) {
    const bx = x - 7 + b * 4;
    const bColor = [P.green, P.blue, P.yellow, P.orange][b];
    T.rect(ctx, bx, y + 16, 3, 2, bColor);
  }
}

function _drawColonyDoor(ctx, P, x, y, rightSide) {
  // Sliding door with status indicator

  const doorW = 18;
  const doorH = 34;

  // Door frame
  T.rect(ctx, x, y, doorW, doorH, P.dark_gray);
  T.rect(ctx, x + 1, y + 1, doorW - 2, doorH - 2, P.gray);

  // Door panels (closed position)
  T.rect(ctx, x + 2, y + 2, 6, doorH - 4, P.gray);
  T.rect(ctx, x + doorW - 8, y + 2, 6, doorH - 4, P.gray);

  // Center seam
  T.rect(ctx, x + 8, y + 2, 2, doorH - 4, P.black);

  // Panel texture
  T.dither(ctx, x + 2, y + 2, 6, doorH - 4, P.gray, P.light_gray, 0.15, 4);
  T.dither(ctx, x + doorW - 8, y + 2, 6, doorH - 4, P.gray, P.light_gray, 0.15, 4);

  // Status light above door
  const statusX = x + Math.floor(doorW / 2) - 1;
  T.rect(ctx, statusX, y - 3, 3, 2, P.green);

  // Access panel beside door
  const panelX = rightSide ? x - 10 : x + doorW + 2;
  T.rect(ctx, panelX, y + 10, 8, 14, P.dark_gray);
  T.rect(ctx, panelX + 1, y + 11, 6, 12, P.black);
  T.rect(ctx, panelX + 2, y + 13, 4, 3, P.blue);
  T.pixel(ctx, panelX + 3, y + 18, P.green);
  T.pixel(ctx, panelX + 4, y + 18, P.green);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Light fixtures, signage, floor markings, decorations
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  const isNight = params.timeOfDay === 'night';

  // --- Dome lighting fixtures ---
  for (let i = 0; i < 5; i++) {
    const lx = 30 + i * 65;
    const ly = 44;

    // Light fixture housing
    T.rect(ctx, lx, ly, 8, 3, P.dark_gray);

    // Light glow
    const lightColor = isNight ? P.white : P.yellow;
    T.rect(ctx, lx + 1, ly + 1, 6, 1, lightColor);
  }

  // --- Wall-mounted information displays ---
  _drawWallDisplay(ctx, P, 80, 50);
  _drawWallDisplay(ctx, P, 220, 50);

  // --- Directional floor markings ---
  // Arrows pointing toward exits
  T.rect(ctx, 25, 125, 1, 8, P.yellow);
  T.rect(ctx, 24, 125, 3, 1, P.yellow);
  T.pixel(ctx, 23, 126, P.yellow);
  T.pixel(ctx, 27, 126, P.yellow);

  T.rect(ctx, 294, 125, 1, 8, P.yellow);
  T.rect(ctx, 293, 125, 3, 1, P.yellow);
  T.pixel(ctx, 292, 126, P.yellow);
  T.pixel(ctx, 296, 126, P.yellow);

  // Central walkway guide line
  for (let y = 75; y < 135; y += 6) {
    T.rect(ctx, 158, y, 4, 2, P.dark_blue);
  }

  // --- Decorative wall panels with accent colors ---
  for (let i = 0; i < 6; i++) {
    const px = 20 + i * 50;
    T.rect(ctx, px, 60, 8, 8, P.black);
    T.rect(ctx, px + 1, 61, 6, 6, P.dark_blue);

    // Accent detail
    const accentColor = (i % 2 === 0) ? P.orange : P.light_green;
    T.rect(ctx, px + 3, 63, 2, 2, accentColor);
  }

  // --- Safety railing markers ---
  for (let rx = 10; rx < 110; rx += 20) {
    T.rect(ctx, rx, 71, 1, 3, P.orange);
  }
  for (let rx = 210; rx < 310; rx += 20) {
    T.rect(ctx, rx, 71, 1, 3, P.orange);
  }

  // --- Vent grilles in floor ---
  _drawVentGrille(ctx, P, 20, 128);
  _drawVentGrille(ctx, P, 280, 128);

  // --- Ceiling service hatches ---
  T.rect(ctx, 100, 40, 12, 4, P.dark_gray);
  T.rect(ctx, 101, 41, 10, 2, P.black);
  for (let hx = 102; hx < 110; hx += 2) {
    T.pixel(ctx, hx, 42, P.gray);
  }

  T.rect(ctx, 208, 40, 12, 4, P.dark_gray);
  T.rect(ctx, 209, 41, 10, 2, P.black);
  for (let hx = 210; hx < 218; hx += 2) {
    T.pixel(ctx, hx, 42, P.gray);
  }

  // --- Colony logo/emblem on center floor ---
  T.circleFill(ctx, 160, 130, 8, P.dark_blue);
  T.circleFill(ctx, 160, 130, 6, P.blue);
  T.pixel(ctx, 160, 127, P.white);
  T.pixel(ctx, 157, 130, P.white);
  T.pixel(ctx, 163, 130, P.white);
  T.pixel(ctx, 160, 133, P.white);

  // --- Status indicator strips on walls ---
  for (let sx = 25; sx < 125; sx += 8) {
    const dotColor = (sx / 8) % 3 === 0 ? P.green : (sx / 8) % 3 === 1 ? P.blue : P.yellow;
    T.pixel(ctx, sx, 66, dotColor);
  }
  for (let sx = 195; sx < 295; sx += 8) {
    const dotColor = (sx / 8) % 3 === 0 ? P.green : (sx / 8) % 3 === 1 ? P.blue : P.yellow;
    T.pixel(ctx, sx, 66, dotColor);
  }
}

function _drawWallDisplay(ctx, P, x, y) {
  // Wall-mounted info screen
  T.rect(ctx, x, y, 24, 14, P.dark_gray);
  T.rect(ctx, x + 1, y + 1, 22, 12, P.black);

  // Screen content — data readout
  T.rect(ctx, x + 3, y + 3, 14, 1, P.light_green);
  T.rect(ctx, x + 3, y + 5, 18, 1, P.light_green);
  T.rect(ctx, x + 3, y + 7, 12, 1, P.blue);
  T.rect(ctx, x + 3, y + 9, 16, 1, P.blue);

  // Status indicator
  T.pixel(ctx, x + 20, y + 3, P.green);
  T.pixel(ctx, x + 21, y + 3, P.green);
}

function _drawVentGrille(ctx, P, x, y) {
  T.rect(ctx, x, y, 18, 7, P.black);

  // Horizontal slats
  for (let vy = y + 1; vy < y + 7; vy += 2) {
    T.rect(ctx, x + 1, vy, 16, 1, P.dark_gray);
  }

  // Frame
  T.rect(ctx, x, y, 18, 1, P.gray);
  T.rect(ctx, x, y + 6, 18, 1, P.gray);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Shadows from structures, lighting gradients
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  const isNight = params.timeOfDay === 'night';
  const isEvening = params.timeOfDay === 'evening';

  // --- Dome lighting cast onto floor ---
  if (!isNight) {
    // Daylight from dome creates ambient floor brightness
    T.scatter(ctx, 80, 75, 160, 30, P.white, isEvening ? 0.04 : 0.08);
  }

  // --- Light fixture pools on floor ---
  for (let i = 0; i < 5; i++) {
    const lx = 33 + i * 65;
    T.scatterCircle(ctx, lx, 85, 25, P.yellow, isNight ? 0.12 : 0.06);
  }

  // --- Planter shadows ---
  const plantCount = parseInt(params.plantCount) || 3;
  const spacing = Math.floor(200 / (plantCount + 1));
  const startX = 60;

  for (let i = 0; i < plantCount; i++) {
    const px = startX + i * spacing;
    T.scatter(ctx, px, 118, 32, 6, P.black, 0.2);
  }

  // --- Bench shadows ---
  if (params.hasBenches) {
    T.scatter(ctx, 38, 102, 36, 5, P.black, 0.18);
    T.scatter(ctx, 238, 102, 36, 5, P.black, 0.18);
  }

  // --- Info kiosk shadow ---
  T.scatter(ctx, 138, 115, 24, 8, P.black, 0.22);

  // --- Wall corner shadows ---
  T.scatter(ctx, 0, 58, 30, 40, P.black, 0.15);
  T.scatter(ctx, 290, 58, 30, 40, P.black, 0.15);

  // --- Dome arch shadows on walls ---
  for (let i = 0; i < 3; i++) {
    const archX = 53 + i * 107;
    T.scatter(ctx, archX + 3, 16, 8, 30, P.black, 0.12);
  }

  // --- General floor edge darkening ---
  T.scatter(ctx, 0, 120, 40, 20, P.black, 0.1);
  T.scatter(ctx, 280, 120, 40, 20, P.black, 0.1);

  // --- Night-specific deep shadows ---
  if (isNight) {
    T.scatter(ctx, 0, 71, 320, 69, P.black, 0.25);
  }
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Ambient washes, dust particles, subtle effects
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  const isNight = params.timeOfDay === 'night';
  const isEvening = params.timeOfDay === 'evening';

  if (isNight) {
    // --- Night: Deep blue ambient wash ---
    T.scatter(ctx, 0, 0, 320, 140, P.dark_blue, 0.15);

    // Concentrated light pools from fixtures
    for (let i = 0; i < 5; i++) {
      const lx = 33 + i * 65;
      T.scatterCircle(ctx, lx, 50, 40, P.yellow, 0.08);
    }
  } else if (isEvening) {
    // --- Evening: Warm orange sunset-like glow ---
    T.scatter(ctx, 0, 0, 320, 140, P.orange, 0.06);

    // Dome glow from setting sun
    T.scatter(ctx, 180, 0, 120, 35, P.yellow, 0.05);
  } else {
    // --- Day: Bright clean lighting ---
    T.scatter(ctx, 0, 0, 320, 140, P.light_green, 0.02);

    // Skylight spill from dome
    T.scatter(ctx, 60, 46, 200, 30, P.white, 0.05);
  }

  // --- Dust motes floating in air (always present) ---
  const motePositions = [
    [55, 55], [130, 62], [205, 58], [275, 60], [85, 75],
    [160, 68], [235, 72], [40, 80], [180, 82], [295, 78],
    [110, 90], [190, 95], [260, 88], [70, 100], [220, 102],
  ];

  for (const [mx, my] of motePositions) {
    T.pixel(ctx, mx, my, P.white);
  }

  // --- Subtle atmospheric haze in distance ---
  T.scatter(ctx, 0, 46, 320, 15, P.light_gray, 0.04);

  // --- Floor reflections from overhead lights ---
  if (!isNight) {
    for (let i = 0; i < 5; i++) {
      const lx = 33 + i * 65;
      T.scatterCircle(ctx, lx, 135, 15, P.white, 0.03);
    }
  }

  // --- Vignette effect: slight darkening at edges ---
  T.scatter(ctx, 0, 0, 35, 45, P.black, 0.05);
  T.scatter(ctx, 285, 0, 35, 45, P.black, 0.05);
  T.scatter(ctx, 0, 100, 35, 40, P.black, 0.05);
  T.scatter(ctx, 285, 100, 35, 40, P.black, 0.05);

  // --- Subtle glow from info kiosk screen ---
  T.scatterCircle(ctx, 150, 91, 20, P.blue, 0.04);
}
