/**
 * corridor.js — Sci-fi dark spaceship/station corridor template.
 *
 * Generates a moody industrial corridor with metal walls, grated floors,
 * overhead pipes, dim emergency lighting, control panels, doors at ends,
 * and optional flickering light effects for atmospheric tension.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'scifi/corridor',
  name: 'Dark Corridor',
  setting: 'scifi',
  category: 'interior',
  palette: 'corridor_dark',
  params: {
    hasPipes: { type: 'boolean', default: true, label: 'Overhead Pipes' },
    hasFlicker: { type: 'boolean', default: true, label: 'Flickering Light' },
    doorState: { type: 'enum', options: ['both_closed', 'left_open', 'right_open'], default: 'both_closed', label: 'Doors' },
    alertLevel: { type: 'enum', options: ['normal', 'caution', 'emergency'], default: 'normal', label: 'Alert' },
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
//  Layer 1 (BASE): Ceiling, walls, floor grating
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  const isEmergency = params.alertLevel === 'emergency';

  // --- Ceiling (rows 0-20) ---
  const ceilColor = P.dark_gray;
  const ceilAccent = P.black;

  T.rect(ctx, 0, 0, 320, 21, ceilColor);

  // Ceiling panel grid — industrial metal plates
  for (let y = 0; y < 21; y += 4) {
    T.rect(ctx, 0, y, 320, 1, ceilAccent);
  }
  for (let x = 0; x < 320; x += 32) {
    T.rect(ctx, x, 0, 1, 21, ceilAccent);
    T.rect(ctx, x + 1, 0, 1, 21, P.gray);
  }

  // Dithered metallic texture
  T.dither(ctx, 0, 0, 320, 21, ceilColor, ceilAccent, 0.2, 4);

  // --- Walls (rows 21-85) ---
  const wallColor = P.dark_blue;
  const wallPanel = P.blue;
  const wallShadow = P.black;

  // Perspective-narrowing walls — create corridor depth
  for (let y = 21; y < 86; y++) {
    const indent = Math.floor((y - 21) * 0.3);
    T.rect(ctx, indent, y, 320 - indent * 2, 1, wallColor);
  }

  // Wall panel sections with rivets and trim
  for (let y = 25; y < 82; y += 18) {
    for (let x = 8; x < 312; x += 40) {
      // Panel frame
      T.rect(ctx, x, y, 36, 14, wallPanel);
      T.rect(ctx, x, y, 36, 1, P.mid_blue);
      T.rect(ctx, x, y + 13, 36, 1, wallShadow);

      // Dithered panel texture
      T.dither(ctx, x + 1, y + 1, 34, 12, wallPanel, wallColor, 0.18, 4);

      // Corner rivets
      T.pixel(ctx, x + 2, y + 2, P.gray);
      T.pixel(ctx, x + 33, y + 2, P.gray);
      T.pixel(ctx, x + 2, y + 11, P.gray);
      T.pixel(ctx, x + 33, y + 11, P.gray);
    }
  }

  // Horizontal wall trim at top and bottom
  T.rect(ctx, 0, 21, 320, 1, P.gray);
  T.rect(ctx, 0, 85, 320, 1, P.light_gray);

  // --- Floor grating (rows 86-140) ---
  const grateColor = P.dark_gray;
  const grateGap = P.black;
  const grateHighlight = P.gray;

  T.rect(ctx, 0, 86, 320, 54, grateGap);

  // Horizontal grating bars with gaps between
  for (let y = 86; y < 140; y += 3) {
    T.rect(ctx, 0, y, 320, 2, grateColor);
    T.rect(ctx, 0, y, 320, 1, grateHighlight);
  }

  // Vertical support struts
  for (let x = 0; x < 320; x += 20) {
    T.rect(ctx, x, 86, 2, 54, grateColor);
    T.rect(ctx, x, 86, 1, 54, grateHighlight);
  }

  // Dithered grate texture
  T.dither(ctx, 0, 86, 320, 54, grateColor, grateGap, 0.15, 4);

  // Floor edge highlight where grating meets wall
  T.rect(ctx, 0, 86, 320, 1, P.light_gray);
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Doors, control panels, wall conduits, floor hatches
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- End-of-corridor doors ---
  const doorState = params.doorState;

  // Left door (distance perspective — smaller)
  _drawCorridorDoor(ctx, P, 135, 30, 50, 40, doorState === 'left_open');

  // Right door (foreground — larger)
  _drawCorridorDoor(ctx, P, 250, 50, 60, 50, doorState === 'right_open');

  // --- Wall-mounted control panels ---
  _drawControlPanel(ctx, P, 20, 45, params.alertLevel);
  _drawControlPanel(ctx, P, 280, 62, params.alertLevel);

  // --- Floor access hatch ---
  _drawFloorHatch(ctx, P, 140, 110);

  // --- Wall conduit runs ---
  _drawWallConduit(ctx, P, 10, 28, 300, false);  // horizontal upper wall
  _drawWallConduit(ctx, P, 10, 75, 300, false);  // horizontal lower wall
}

function _drawCorridorDoor(ctx, P, x, y, w, h, isOpen) {
  // Heavy blast door with status lights

  if (isOpen) {
    // Open state: door panels retracted into walls
    const panelW = Math.floor(w / 3);

    // Left panel (retracted)
    T.rect(ctx, x - panelW, y, panelW, h, P.gray);
    T.dither(ctx, x - panelW, y, panelW, h, P.gray, P.dark_gray, 0.2, 4);

    // Right panel (retracted)
    T.rect(ctx, x + w, y, panelW, h, P.gray);
    T.dither(ctx, x + w, y, panelW, h, P.gray, P.dark_gray, 0.2, 4);

    // Doorway opening — dark interior visible
    T.rect(ctx, x, y, w, h, P.black);

    // Dim light from beyond
    T.scatter(ctx, x + 10, y + 5, w - 20, h - 10, P.dark_blue, 0.15);

    // Status light — green when open
    T.rect(ctx, x + Math.floor(w / 2) - 2, y - 3, 4, 2, P.teal);
  } else {
    // Closed state: full door panels
    T.rect(ctx, x, y, w, h, P.dark_gray);

    // Door frame
    T.rect(ctx, x - 2, y - 1, w + 4, h + 2, P.gray);
    T.rect(ctx, x - 1, y, w + 2, h, P.dark_gray);

    // Door panels (two halves)
    const halfW = Math.floor(w / 2) - 1;
    T.rect(ctx, x, y, halfW, h, P.gray);
    T.rect(ctx, x + halfW + 2, y, halfW, h, P.gray);

    // Center seam with hydraulic seal
    T.rect(ctx, x + halfW, y, 2, h, P.black);
    T.rect(ctx, x + halfW, y + Math.floor(h / 2), 2, 2, P.orange);

    // Panel texture
    T.dither(ctx, x, y, halfW, h, P.gray, P.light_gray, 0.15, 4);
    T.dither(ctx, x + halfW + 2, y, halfW, h, P.gray, P.light_gray, 0.15, 4);

    // Panel horizontal reinforcement bars
    for (let dy = 8; dy < h - 4; dy += 10) {
      T.rect(ctx, x + 2, y + dy, halfW - 4, 2, P.light_gray);
      T.rect(ctx, x + halfW + 4, y + dy, halfW - 4, 2, P.light_gray);
    }

    // Warning stripe on frame
    for (let sx = x; sx < x + w; sx += 6) {
      T.rect(ctx, sx, y - 1, 3, 1, P.orange);
    }

    // Status light — red when closed
    T.rect(ctx, x + Math.floor(w / 2) - 2, y - 3, 4, 2, P.dark_red);
  }
}

function _drawControlPanel(ctx, P, x, y, alertLevel) {
  const panelW = 22;
  const panelH = 28;

  // Panel housing
  T.rect(ctx, x, y, panelW, panelH, P.dark_gray);
  T.rect(ctx, x + 1, y + 1, panelW - 2, panelH - 2, P.black);

  // Panel frame highlights
  T.rect(ctx, x, y, panelW, 1, P.gray);
  T.rect(ctx, x, y, 1, panelH, P.gray);

  // Display screen at top
  T.rect(ctx, x + 3, y + 3, 16, 8, P.dark_blue);

  // Screen readout lines
  const statusColor = alertLevel === 'emergency' ? P.red : alertLevel === 'caution' ? P.orange : P.teal;
  for (let ly = y + 4; ly < y + 10; ly += 2) {
    const lineW = 6 + ((ly * 7) % 8);
    T.rect(ctx, x + 4, ly, lineW, 1, statusColor);
  }

  // Button array below screen
  const buttonRows = [
    [P.teal, P.teal, P.teal],
    [P.yellow, P.yellow, P.yellow],
    [P.red, P.red, P.red],
  ];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const bx = x + 4 + col * 5;
      const by = y + 14 + row * 4;
      T.rect(ctx, bx, by, 3, 2, buttonRows[row][col]);
    }
  }

  // Alert status indicator
  if (alertLevel === 'emergency') {
    T.rect(ctx, x + panelW - 4, y + 2, 3, 3, P.red);
  } else if (alertLevel === 'caution') {
    T.rect(ctx, x + panelW - 4, y + 2, 3, 3, P.orange);
  }
}

function _drawFloorHatch(ctx, P, x, y) {
  const hatchW = 40;
  const hatchH = 20;

  // Hatch frame
  T.rect(ctx, x, y, hatchW, hatchH, P.gray);

  // Hatch plate
  T.rect(ctx, x + 2, y + 2, hatchW - 4, hatchH - 4, P.dark_gray);
  T.dither(ctx, x + 2, y + 2, hatchW - 4, hatchH - 4, P.dark_gray, P.black, 0.25, 4);

  // Diagonal warning stripes
  for (let d = 0; d < hatchW + hatchH; d += 6) {
    T.line(ctx, x + 2 + d, y + 2, x + 2 + d - hatchH, y + 2 + hatchH, P.orange);
  }

  // Corner bolts
  T.pixel(ctx, x + 3, y + 3, P.light_gray);
  T.pixel(ctx, x + hatchW - 4, y + 3, P.light_gray);
  T.pixel(ctx, x + 3, y + hatchH - 4, P.light_gray);
  T.pixel(ctx, x + hatchW - 4, y + hatchH - 4, P.light_gray);

  // Handle in center
  T.rect(ctx, x + hatchW / 2 - 3, y + hatchH / 2 - 1, 6, 2, P.yellow);
}

function _drawWallConduit(ctx, P, x, y, w, vertical) {
  if (vertical) {
    // Vertical conduit run
    T.rect(ctx, x, y, 3, w, P.dark_gray);
    T.rect(ctx, x, y, 1, w, P.gray);
    T.rect(ctx, x + 2, y, 1, w, P.black);

    // Support brackets every 20 pixels
    for (let by = y; by < y + w; by += 20) {
      T.rect(ctx, x - 1, by, 5, 2, P.gray);
    }
  } else {
    // Horizontal conduit run
    T.rect(ctx, x, y, w, 3, P.dark_gray);
    T.rect(ctx, x, y, w, 1, P.gray);
    T.rect(ctx, x, y + 2, w, 1, P.black);

    // Support brackets every 40 pixels
    for (let bx = x; bx < x + w; bx += 40) {
      T.rect(ctx, bx, y - 1, 2, 5, P.gray);
    }
  }
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Emergency lights, warning signs, pipes, vents, cables
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  const alertLevel = params.alertLevel;
  const hasFlicker = params.hasFlicker;
  const isEmergency = alertLevel === 'emergency';

  // --- Emergency lighting strips on ceiling ---
  const lightColor = isEmergency ? P.red : P.orange;

  for (let lx = 40; lx < 280; lx += 80) {
    T.rect(ctx, lx, 8, 24, 3, P.black);
    T.rect(ctx, lx + 1, 9, 22, 1, lightColor);

    // Mounting brackets
    T.pixel(ctx, lx - 1, 9, P.gray);
    T.pixel(ctx, lx + 24, 9, P.gray);

    // Flicker effect on one light
    if (hasFlicker && lx === 120) {
      // Reduced brightness for flicker
      T.rect(ctx, lx + 1, 9, 22, 1, P.dark_gray);
      T.scatter(ctx, lx + 1, 9, 22, 1, lightColor, 0.3);
    }
  }

  // --- Overhead pipes ---
  if (params.hasPipes) {
    // Large pipe running length of corridor
    _drawPipe(ctx, P, 5, 2, 310, false, P.dark_teal);

    // Smaller parallel pipe
    _drawPipe(ctx, P, 5, 6, 310, false, P.blue);

    // Vertical drop pipes
    _drawPipe(ctx, P, 70, 2, 20, true, P.dark_gray);
    _drawPipe(ctx, P, 240, 2, 20, true, P.dark_gray);
  }

  // --- Wall-mounted warning signs ---
  _drawWarningSign(ctx, P, 60, 50, 'CAUTION', P.orange);
  _drawWarningSign(ctx, P, 230, 66, 'DANGER', P.red);

  // --- Vent grilles on walls ---
  _drawWallVent(ctx, P, 100, 40);
  _drawWallVent(ctx, P, 200, 58);

  // --- Hanging cables ---
  for (let cx = 50; cx < 270; cx += 60) {
    const cableLen = 8 + ((cx * 3) % 6);
    T.line(ctx, cx, 18, cx + 2, 18 + cableLen, P.dark_blue);
    T.pixel(ctx, cx + 2, 18 + cableLen, P.blue);
  }

  // --- Alert status beacons on walls ---
  if (isEmergency) {
    // Flashing red beacons
    T.rect(ctx, 15, 23, 4, 4, P.dark_red);
    T.rect(ctx, 301, 23, 4, 4, P.dark_red);

    T.pixel(ctx, 16, 24, P.red);
    T.pixel(ctx, 17, 24, P.red);
    T.pixel(ctx, 302, 24, P.red);
    T.pixel(ctx, 303, 24, P.red);
  } else if (alertLevel === 'caution') {
    // Yellow caution lights
    T.rect(ctx, 15, 23, 4, 4, P.orange);
    T.rect(ctx, 301, 23, 4, 4, P.orange);
  }

  // --- Floor safety line markings ---
  for (let fx = 10; fx < 310; fx += 20) {
    T.rect(ctx, fx, 86, 8, 1, P.yellow);
  }

  // --- Junction box on wall ---
  T.rect(ctx, 160, 55, 12, 14, P.dark_gray);
  T.rect(ctx, 161, 56, 10, 12, P.black);

  // Junction box internals
  T.pixel(ctx, 163, 58, P.red);
  T.pixel(ctx, 165, 58, P.teal);
  T.pixel(ctx, 167, 58, P.yellow);
  T.line(ctx, 163, 59, 163, 66, P.dark_red);
  T.line(ctx, 165, 59, 165, 66, P.dark_teal);
  T.line(ctx, 167, 59, 167, 66, P.orange);

  // --- Exposed wiring along wall edges ---
  for (let wy = 30; wy < 80; wy += 12) {
    T.line(ctx, 2, wy, 2, wy + 8, P.dark_red);
    T.line(ctx, 317, wy + 2, 317, wy + 10, P.dark_blue);
  }

  // --- Floor drain grates ---
  for (let dx = 30; dx < 290; dx += 80) {
    T.rect(ctx, dx, 125, 10, 8, P.black);
    for (let dy = 126; dy < 133; dy += 2) {
      T.rect(ctx, dx + 1, dy, 8, 1, P.dark_gray);
    }
  }
}

function _drawPipe(ctx, P, x, y, length, vertical, color) {
  if (vertical) {
    // Vertical pipe
    T.rect(ctx, x, y, 4, length, color);
    T.rect(ctx, x, y, 1, length, P.lighten(color, 20));
    T.rect(ctx, x + 3, y, 1, length, P.black);

    // Pipe joints every 15 pixels
    for (let jy = y; jy < y + length; jy += 15) {
      T.rect(ctx, x - 1, jy, 6, 2, P.gray);
    }
  } else {
    // Horizontal pipe
    T.rect(ctx, x, y, length, 4, color);
    T.rect(ctx, x, y, length, 1, T.lighten(color, 20));
    T.rect(ctx, x, y + 3, length, 1, P.black);

    // Pipe joints every 30 pixels
    for (let jx = x; jx < x + length; jx += 30) {
      T.rect(ctx, jx, y - 1, 2, 6, P.gray);
    }
  }
}

function _drawWarningSign(ctx, P, x, y, text, color) {
  const signW = 32;
  const signH = 10;

  // Sign background — caution stripes
  T.rect(ctx, x, y, signW, signH, P.black);

  for (let sx = 0; sx < signW; sx += 4) {
    T.rect(ctx, x + sx, y, 2, signH, color);
  }

  // Sign frame
  T.rect(ctx, x, y, signW, 1, P.light_gray);
  T.rect(ctx, x, y + signH - 1, signW, 1, P.light_gray);
  T.rect(ctx, x, y, 1, signH, P.light_gray);
  T.rect(ctx, x + signW - 1, y, 1, signH, P.light_gray);

  // Text representation — just a few pixels suggesting letters
  T.rect(ctx, x + 4, y + 3, 2, 4, P.white);
  T.rect(ctx, x + 8, y + 3, 2, 4, P.white);
  T.rect(ctx, x + 12, y + 3, 2, 4, P.white);
  T.rect(ctx, x + 16, y + 3, 2, 4, P.white);
  T.rect(ctx, x + 20, y + 3, 2, 4, P.white);
  T.rect(ctx, x + 24, y + 3, 2, 4, P.white);
}

function _drawWallVent(ctx, P, x, y) {
  const ventW = 18;
  const ventH = 10;

  T.rect(ctx, x, y, ventW, ventH, P.black);

  // Horizontal vent slats
  for (let vy = y + 1; vy < y + ventH - 1; vy += 2) {
    T.rect(ctx, x + 1, vy, ventW - 2, 1, P.dark_gray);
  }

  // Vent frame
  T.rect(ctx, x, y, ventW, 1, P.gray);
  T.rect(ctx, x, y + ventH - 1, ventW, 1, P.gray);
  T.rect(ctx, x, y, 1, ventH, P.gray);
  T.rect(ctx, x + ventW - 1, y, 1, ventH, P.gray);

  // Corner screws
  T.pixel(ctx, x + 1, y + 1, P.pale_gray);
  T.pixel(ctx, x + ventW - 2, y + 1, P.pale_gray);
  T.pixel(ctx, x + 1, y + ventH - 2, P.pale_gray);
  T.pixel(ctx, x + ventW - 2, y + ventH - 2, P.pale_gray);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Light pools, door shadows, atmospheric depth
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  const alertLevel = params.alertLevel;
  const hasFlicker = params.hasFlicker;
  const isEmergency = alertLevel === 'emergency';

  // --- Emergency light pools on floor and walls ---
  const lightColor = isEmergency ? P.red : P.orange;

  for (let lx = 40; lx < 280; lx += 80) {
    const intensity = (hasFlicker && lx === 120) ? 0.05 : 0.1;

    // Pool on floor
    T.scatterCircle(ctx, lx + 12, 95, 30, lightColor, intensity);

    // Wall wash
    T.scatterCircle(ctx, lx + 12, 50, 25, lightColor, intensity * 0.7);
  }

  // --- Door area shadows ---
  // Left door (distant)
  T.scatter(ctx, 130, 70, 60, 16, P.black, 0.2);

  // Right door (foreground)
  T.scatter(ctx, 245, 100, 70, 20, P.black, 0.25);

  // --- Control panel glow ---
  T.scatterCircle(ctx, 31, 59, 15, P.teal, 0.08);
  T.scatterCircle(ctx, 291, 76, 15, P.teal, 0.08);

  // --- Floor hatch shadow ---
  T.scatter(ctx, 140, 110, 40, 20, P.black, 0.15);

  // --- Corridor depth darkening (perspective) ---
  // Darken toward the back (top of image)
  T.scatter(ctx, 0, 21, 320, 30, P.black, 0.2);

  // Darken floor edges
  T.scatter(ctx, 0, 86, 40, 54, P.black, 0.15);
  T.scatter(ctx, 280, 86, 40, 54, P.black, 0.15);

  // --- Pipe shadows on ceiling ---
  if (params.hasPipes) {
    T.scatter(ctx, 5, 7, 310, 3, P.black, 0.2);
  }

  // --- Wall panel shadow depth ---
  for (let y = 25; y < 82; y += 18) {
    for (let x = 8; x < 312; x += 40) {
      T.scatter(ctx, x + 18, y + 7, 18, 7, P.black, 0.1);
    }
  }

  // --- Grating below-floor darkness ---
  for (let y = 88; y < 140; y += 3) {
    T.scatter(ctx, 0, y + 2, 320, 1, P.black, 0.3);
  }

  // --- Emergency beacon halos ---
  if (isEmergency) {
    T.scatterCircle(ctx, 17, 25, 20, P.red, 0.15);
    T.scatterCircle(ctx, 303, 25, 20, P.red, 0.15);
  }
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Mood lighting, haze, steam, subtle effects
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  const alertLevel = params.alertLevel;
  const isEmergency = alertLevel === 'emergency';
  const isCaution = alertLevel === 'caution';

  if (isEmergency) {
    // --- Emergency: Red alert wash over entire scene ---
    T.scatter(ctx, 0, 0, 320, 140, P.red, 0.12);

    // Pulsing red from emergency lights
    for (let lx = 40; lx < 280; lx += 80) {
      T.scatterCircle(ctx, lx + 12, 15, 35, P.red, 0.1);
    }

    // Red beacon pulses
    T.scatterCircle(ctx, 17, 25, 30, P.red, 0.08);
    T.scatterCircle(ctx, 303, 25, 30, P.red, 0.08);
  } else if (isCaution) {
    // --- Caution: Amber/orange warning ambience ---
    T.scatter(ctx, 0, 0, 320, 140, P.orange, 0.06);

    // Overhead light halos
    for (let lx = 40; lx < 280; lx += 80) {
      T.scatterCircle(ctx, lx + 12, 18, 28, P.orange, 0.08);
    }
  } else {
    // --- Normal: Dim blue-gray industrial lighting ---
    T.scatter(ctx, 0, 0, 320, 140, P.dark_blue, 0.1);

    // Cool overhead light spill
    for (let lx = 40; lx < 280; lx += 80) {
      T.scatterCircle(ctx, lx + 12, 20, 25, P.mid_blue, 0.06);
    }
  }

  // --- Steam/vapor wisps from vents ---
  const steamPositions = [
    [105, 48], [205, 66], [35, 132], [280, 128],
  ];

  for (const [sx, sy] of steamPositions) {
    T.scatter(ctx, sx - 5, sy - 3, 12, 8, P.pale_gray, 0.08);
  }

  // --- Dust motes in air ---
  const motePositions = [
    [45, 35], [120, 45], [200, 38], [270, 42], [80, 60],
    [160, 55], [240, 65], [30, 75], [190, 70], [295, 58],
    [65, 95], [145, 100], [225, 92], [50, 110], [180, 115],
  ];

  for (const [mx, my] of motePositions) {
    T.pixel(ctx, mx, my, P.pale_gray);
  }

  // --- Atmospheric haze/depth fog ---
  // Stronger at far end (top) of corridor
  T.scatter(ctx, 0, 21, 320, 25, P.dark_blue, 0.15);

  // Lighter haze in mid-corridor
  T.scatter(ctx, 60, 50, 200, 30, P.mid_blue, 0.05);

  // --- Glow from floor grating (light from below) ---
  for (let gx = 40; gx < 280; gx += 80) {
    T.scatterCircle(ctx, gx, 135, 18, P.dark_teal, 0.04);
  }

  // --- Control panel screen glow spill ---
  T.scatterCircle(ctx, 31, 59, 18, P.teal, 0.05);
  T.scatterCircle(ctx, 291, 76, 18, P.teal, 0.05);

  // --- Subtle vignette: darken corners ---
  T.scatter(ctx, 0, 0, 35, 30, P.black, 0.08);
  T.scatter(ctx, 285, 0, 35, 30, P.black, 0.08);
  T.scatter(ctx, 0, 110, 35, 30, P.black, 0.08);
  T.scatter(ctx, 285, 110, 35, 30, P.black, 0.08);

  // --- Flickering light atmospheric disturbance ---
  if (params.hasFlicker) {
    // Random scatter around flickering light to enhance effect
    T.scatter(ctx, 110, 8, 35, 15, P.dark_gray, 0.12);
  }

  // --- Floor reflections from emergency lights ---
  if (!isEmergency) {
    for (let lx = 40; lx < 280; lx += 80) {
      T.scatterCircle(ctx, lx + 12, 135, 12, P.light_gray, 0.02);
    }
  }
}
