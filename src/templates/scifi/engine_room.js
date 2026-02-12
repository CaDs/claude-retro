/**
 * engine_room.js — Sci-fi spaceship engine room template.
 *
 * Generates a ship's engineering bay with large central reactor core or engine,
 * pipes and conduits everywhere, catwalks, control panels, steam vents, and
 * vibrant reactor glow. All art uses PixelArtToolkit primitives following
 * the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'scifi/engine_room',
  name: 'Engine Room',
  setting: 'scifi',
  category: 'interior',
  palette: 'corridor_dark',
  params: {
    reactorGlow: { type: 'enum', options: ['orange', 'red', 'teal'], default: 'orange', label: 'Reactor Glow' },
    pipeCount: { type: 'enum', options: ['minimal', 'normal', 'dense'], default: 'normal', label: 'Pipe Density' },
    ventActivity: { type: 'enum', options: ['calm', 'active'], default: 'active', label: 'Steam Vents' },
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
//  Layer 1 (BASE): Ceiling, walls, floor, structural grid
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  // --- Ceiling (rows 0-18) ---
  // Dark industrial ceiling with exposed beams and cable trays
  T.rect(ctx, 0, 0, 320, 18, P.black);

  // Ceiling structural beams
  for (let x = 0; x < 320; x += 50) {
    T.rect(ctx, x, 0, 6, 18, P.dark_gray);
    T.rect(ctx, x + 1, 0, 1, 18, P.gray);
  }

  // Horizontal support ribs
  T.rect(ctx, 0, 4, 320, 1, P.dark_gray);
  T.rect(ctx, 0, 10, 320, 1, P.dark_gray);
  T.rect(ctx, 0, 16, 320, 1, P.gray);

  // Ceiling texture
  T.dither(ctx, 0, 0, 320, 18, P.black, P.dark_gray, 0.12, 4);

  // --- Back Wall (rows 18-65) ---
  // Dark metal wall with large panel sections
  T.rect(ctx, 0, 18, 320, 47, P.dark_blue);

  // Wall panel grid — large riveted sections
  for (let x = 0; x < 320; x += 64) {
    T.rect(ctx, x, 18, 2, 47, P.dark_gray);
  }
  for (let y = 18; y < 65; y += 16) {
    T.rect(ctx, 0, y, 320, 1, P.dark_gray);
  }

  // Wall texture — industrial dither
  T.dither(ctx, 0, 18, 320, 47, P.dark_blue, P.black, 0.2, 4);

  // Wall trim
  T.rect(ctx, 0, 18, 320, 1, P.gray);
  T.rect(ctx, 0, 64, 320, 1, P.dark_gray);

  // --- Floor (rows 65-140) ---
  // Metal grate floor with dark void beneath
  T.rect(ctx, 0, 65, 320, 75, P.dark_gray);

  // Grate grid pattern — horizontal bars
  for (let y = 65; y < 140; y += 4) {
    T.rect(ctx, 0, y, 320, 2, P.gray);
    T.rect(ctx, 0, y + 2, 320, 2, P.black);
  }

  // Vertical grate bars
  for (let x = 0; x < 320; x += 8) {
    for (let y = 65; y < 140; y += 4) {
      T.rect(ctx, x, y, 1, 2, P.gray);
    }
  }

  // Floor texture
  T.dither(ctx, 0, 65, 320, 75, P.dark_gray, P.black, 0.3, 4);

  // Darker pit/void visible through grate in center
  T.rect(ctx, 100, 90, 120, 50, P.black);
  T.dither(ctx, 100, 90, 120, 50, P.black, P.dark_blue, 0.08, 4);
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Reactor core, catwalks, control panels, pipes
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  const glowColor = params.reactorGlow || 'orange';

  // --- Central reactor core ---
  _drawReactorCore(ctx, P, glowColor);

  // --- Catwalks (foreground platforms) ---
  _drawCatwalks(ctx, P);

  // --- Control panels (left and right) ---
  _drawControlPanel(ctx, P, 10, 70);
  _drawControlPanel(ctx, P, 270, 70);

  // --- Major pipe systems ---
  const pipeCount = params.pipeCount || 'normal';
  _drawPipeSystems(ctx, P, pipeCount);

  // --- Conduit channels along walls ---
  _drawConduits(ctx, P);

  // --- Ladder (right wall) ---
  _drawLadder(ctx, P, 295, 25);

  // --- Vent grates ---
  _drawVentGrate(ctx, P, 20, 50, 16, 10);
  _drawVentGrate(ctx, P, 284, 45, 16, 10);
}

function _drawReactorCore(ctx, P, glowType) {
  const coreX = 160;
  const coreY = 50;
  const coreR = 22;

  // Core outer housing — cylindrical structure
  T.circleFill(ctx, coreX, coreY, coreR + 4, P.dark_gray);
  T.circleFill(ctx, coreX, coreY, coreR + 3, P.gray);
  T.circleFill(ctx, coreX, coreY, coreR + 2, P.dark_gray);

  // Core chamber glass/window
  T.circleFill(ctx, coreX, coreY, coreR, P.black);

  // Core glow interior (depends on glow type)
  let innerColor, midColor, brightColor;
  if (glowType === 'orange') {
    innerColor = P.dark_red;
    midColor = P.orange;
    brightColor = P.yellow;
  } else if (glowType === 'red') {
    innerColor = P.dark_red;
    midColor = P.red;
    brightColor = P.orange;
  } else {
    // teal
    innerColor = P.dark_teal;
    midColor = P.teal;
    brightColor = P.white;
  }

  T.circleFill(ctx, coreX, coreY, coreR - 2, innerColor);
  T.circleFill(ctx, coreX, coreY, coreR - 6, midColor);
  T.circleFill(ctx, coreX, coreY, coreR - 12, brightColor);

  // Core center hotspot
  T.circleFill(ctx, coreX, coreY, 4, brightColor);

  // Reactor housing ribs/bands
  for (let offset = -20; offset <= 20; offset += 10) {
    const bandY = coreY + offset;
    if (Math.abs(offset) < coreR + 3) {
      T.rect(ctx, coreX - 26, bandY, 52, 2, P.black);
      T.rect(ctx, coreX - 26, bandY + 1, 52, 1, P.gray);
    }
  }

  // Top and bottom pipe connections
  _drawReactorPipe(ctx, P, coreX, coreY - coreR - 8, 'vertical', 'top');
  _drawReactorPipe(ctx, P, coreX, coreY + coreR + 6, 'vertical', 'bottom');

  // Side pipe connections
  _drawReactorPipe(ctx, P, coreX - coreR - 8, coreY, 'horizontal', 'left');
  _drawReactorPipe(ctx, P, coreX + coreR + 6, coreY, 'horizontal', 'right');
}

function _drawReactorPipe(ctx, P, x, y, direction, side) {
  if (direction === 'vertical') {
    const pipeH = (side === 'top') ? 8 : 6;
    const pipeY = (side === 'top') ? y : y;
    T.rect(ctx, x - 3, pipeY, 6, pipeH, P.dark_gray);
    T.rect(ctx, x - 2, pipeY, 1, pipeH, P.gray);
    T.rect(ctx, x + 2, pipeY, 1, pipeH, P.black);

    // Flange
    T.rect(ctx, x - 4, (side === 'top') ? pipeY : pipeY + pipeH - 2, 8, 2, P.gray);
  } else {
    // horizontal
    const pipeW = 8;
    const pipeX = (side === 'left') ? x - pipeW : x;
    T.rect(ctx, pipeX, y - 3, pipeW, 6, P.dark_gray);
    T.rect(ctx, pipeX, y - 2, pipeW, 1, P.gray);
    T.rect(ctx, pipeX, y + 2, pipeW, 1, P.black);

    // Flange
    T.rect(ctx, (side === 'left') ? pipeX : pipeX + pipeW - 2, y - 4, 2, 8, P.gray);
  }
}

function _drawCatwalks(ctx, P) {
  // Left catwalk
  const leftY = 90;
  T.rect(ctx, 0, leftY, 90, 4, P.gray);
  T.rect(ctx, 0, leftY, 90, 1, P.light_gray);
  T.rect(ctx, 0, leftY + 3, 90, 1, P.black);

  // Catwalk grate pattern
  for (let x = 0; x < 90; x += 4) {
    T.rect(ctx, x, leftY + 1, 1, 2, P.black);
  }

  // Catwalk railing
  T.rect(ctx, 0, leftY - 6, 90, 1, P.gray);
  for (let x = 0; x < 90; x += 10) {
    T.rect(ctx, x, leftY - 6, 1, 6, P.gray);
  }

  // Right catwalk
  const rightY = 95;
  T.rect(ctx, 230, rightY, 90, 4, P.gray);
  T.rect(ctx, 230, rightY, 90, 1, P.light_gray);
  T.rect(ctx, 230, rightY + 3, 90, 1, P.black);

  // Catwalk grate pattern
  for (let x = 230; x < 320; x += 4) {
    T.rect(ctx, x, rightY + 1, 1, 2, P.black);
  }

  // Catwalk railing
  T.rect(ctx, 230, rightY - 6, 90, 1, P.gray);
  for (let x = 230; x < 320; x += 10) {
    T.rect(ctx, x, rightY - 6, 1, 6, P.gray);
  }

  // Support struts under catwalks
  for (let x = 10; x < 90; x += 25) {
    T.rect(ctx, x, leftY + 4, 2, 20, P.dark_gray);
  }
  for (let x = 240; x < 320; x += 25) {
    T.rect(ctx, x, rightY + 4, 2, 20, P.dark_gray);
  }
}

function _drawControlPanel(ctx, P, x, y) {
  const panelW = 32;
  const panelH = 40;

  // Panel body
  T.rect(ctx, x, y, panelW, panelH, P.dark_gray);
  T.rect(ctx, x + 1, y + 1, panelW - 2, panelH - 2, P.gray);

  // Screen inset
  const screenW = 20;
  const screenH = 14;
  const screenX = x + Math.floor((panelW - screenW) / 2);
  const screenY = y + 4;
  T.rect(ctx, screenX, screenY, screenW, screenH, P.black);
  T.rect(ctx, screenX + 1, screenY + 1, screenW - 2, screenH - 2, P.dark_blue);

  // Screen readout lines
  for (let ly = screenY + 2; ly < screenY + screenH - 2; ly += 2) {
    const lineW = 6 + ((ly * 7) % 10);
    T.rect(ctx, screenX + 2, ly, lineW, 1, P.teal);
  }

  // Button grid below screen
  const btnStartY = screenY + screenH + 3;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const btnX = x + 4 + col * 6;
      const btnY = btnStartY + row * 4;
      const btnColor = [P.red, P.yellow, P.teal, P.orange][col % 4];
      T.rect(ctx, btnX, btnY, 3, 2, btnColor);
    }
  }

  // Panel edge highlights
  T.rect(ctx, x, y, panelW, 1, P.light_gray);
  T.rect(ctx, x, y, 1, panelH, P.light_gray);
  T.rect(ctx, x + panelW - 1, y, 1, panelH, P.black);
  T.rect(ctx, x, y + panelH - 1, panelW, 1, P.black);
}

function _drawPipeSystems(ctx, P, density) {
  const pipeConfigs = (density === 'minimal') ? 6 :
                      (density === 'dense') ? 14 : 10;

  // Vertical pipes along left wall
  _drawPipe(ctx, P, 35, 18, 6, 30, 'vertical');
  _drawPipe(ctx, P, 50, 20, 5, 35, 'vertical');
  _drawPipe(ctx, P, 65, 18, 7, 28, 'vertical');

  if (density !== 'minimal') {
    _drawPipe(ctx, P, 78, 22, 5, 32, 'vertical');
  }

  if (density === 'dense') {
    _drawPipe(ctx, P, 88, 20, 6, 30, 'vertical');
  }

  // Vertical pipes along right wall
  _drawPipe(ctx, P, 255, 18, 6, 30, 'vertical');
  _drawPipe(ctx, P, 240, 20, 5, 35, 'vertical');
  _drawPipe(ctx, P, 225, 18, 7, 28, 'vertical');

  if (density !== 'minimal') {
    _drawPipe(ctx, P, 212, 22, 5, 32, 'vertical');
  }

  if (density === 'dense') {
    _drawPipe(ctx, P, 202, 20, 6, 30, 'vertical');
  }

  // Horizontal pipes across ceiling
  _drawPipe(ctx, P, 10, 6, 100, 4, 'horizontal');
  _drawPipe(ctx, P, 210, 8, 90, 5, 'horizontal');

  if (density !== 'minimal') {
    _drawPipe(ctx, P, 50, 12, 80, 4, 'horizontal');
  }

  if (density === 'dense') {
    _drawPipe(ctx, P, 140, 10, 60, 5, 'horizontal');
  }

  // Diagonal pipes connecting systems
  if (density !== 'minimal') {
    T.line(ctx, 65, 48, 135, 70, P.gray);
    T.line(ctx, 66, 48, 136, 70, P.gray);
    T.line(ctx, 255, 48, 185, 72, P.gray);
    T.line(ctx, 254, 48, 184, 72, P.gray);
  }
}

function _drawPipe(ctx, P, x, y, diameter, length, direction) {
  if (direction === 'vertical') {
    // Pipe body
    T.rect(ctx, x, y, diameter, length, P.gray);

    // Shading
    T.rect(ctx, x, y, 1, length, P.light_gray);
    T.rect(ctx, x + diameter - 1, y, 1, length, P.dark_gray);

    // Pipe joints/flanges every 12 pixels
    for (let offset = 0; offset < length; offset += 12) {
      T.rect(ctx, x - 1, y + offset, diameter + 2, 2, P.light_gray);
    }
  } else {
    // Pipe body
    T.rect(ctx, x, y, length, diameter, P.gray);

    // Shading
    T.rect(ctx, x, y, length, 1, P.light_gray);
    T.rect(ctx, x, y + diameter - 1, length, 1, P.dark_gray);

    // Pipe joints/flanges every 16 pixels
    for (let offset = 0; offset < length; offset += 16) {
      T.rect(ctx, x + offset, y - 1, 2, diameter + 2, P.light_gray);
    }
  }
}

function _drawConduits(ctx, P) {
  // Cable conduits running along walls
  // Left wall conduits
  T.rect(ctx, 2, 26, 3, 36, P.dark_gray);
  T.rect(ctx, 2, 26, 1, 36, P.gray);

  T.rect(ctx, 8, 28, 2, 30, P.black);
  T.rect(ctx, 8, 28, 1, 30, P.dark_gray);

  // Right wall conduits
  T.rect(ctx, 315, 26, 3, 36, P.dark_gray);
  T.rect(ctx, 317, 26, 1, 36, P.gray);

  T.rect(ctx, 310, 30, 2, 28, P.black);
  T.rect(ctx, 310, 30, 1, 28, P.dark_gray);
}

function _drawLadder(ctx, P, x, y) {
  const ladderW = 8;
  const ladderH = 36;

  // Ladder rails
  T.rect(ctx, x, y, 2, ladderH, P.gray);
  T.rect(ctx, x + ladderW - 2, y, 2, ladderH, P.gray);

  // Ladder rungs
  for (let offset = 0; offset < ladderH; offset += 6) {
    T.rect(ctx, x + 2, y + offset, ladderW - 4, 2, P.gray);
  }

  // Rail highlights
  T.rect(ctx, x, y, 1, ladderH, P.light_gray);
  T.rect(ctx, x + ladderW - 2, y, 1, ladderH, P.light_gray);
}

function _drawVentGrate(ctx, P, x, y, w, h) {
  // Vent frame
  T.rect(ctx, x, y, w, h, P.black);
  T.rect(ctx, x, y, w, 1, P.gray);
  T.rect(ctx, x, y + h - 1, w, 1, P.gray);
  T.rect(ctx, x, y, 1, h, P.gray);
  T.rect(ctx, x + w - 1, y, 1, h, P.gray);

  // Grate slats
  for (let gy = y + 2; gy < y + h - 2; gy += 2) {
    T.rect(ctx, x + 2, gy, w - 4, 1, P.dark_gray);
  }
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Warning lights, gauges, labels, rivets, steam vents
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  const ventActivity = params.ventActivity || 'active';

  // --- Ceiling warning lights ---
  _drawWarningLight(ctx, P, 80, 2, P.red);
  _drawWarningLight(ctx, P, 240, 2, P.red);

  // --- Status indicator strips on walls ---
  _drawStatusStrip(ctx, P, 100, 22);
  _drawStatusStrip(ctx, P, 190, 22);

  // --- Reactor status gauges ---
  _drawGauge(ctx, P, 145, 85);
  _drawGauge(ctx, P, 175, 85);

  // --- Pressure gauges on pipes ---
  _drawPressureGauge(ctx, P, 35, 40);
  _drawPressureGauge(ctx, P, 255, 42);

  // --- Caution stripes on reactor base ---
  _drawCautionStripes(ctx, P, 130, 72, 60);

  // --- Rivets on wall panels ---
  _drawRivets(ctx, P);

  // --- Steam vent outlets ---
  if (ventActivity === 'active') {
    _drawVentOutlet(ctx, P, 25, 58, 'active');
    _drawVentOutlet(ctx, P, 288, 52, 'active');
    _drawVentOutlet(ctx, P, 160, 20, 'active');
  } else {
    _drawVentOutlet(ctx, P, 25, 58, 'calm');
    _drawVentOutlet(ctx, P, 288, 52, 'calm');
    _drawVentOutlet(ctx, P, 160, 20, 'calm');
  }

  // --- Control panel indicator lights ---
  _drawIndicatorLight(ctx, P, 15, 72, P.teal);
  _drawIndicatorLight(ctx, P, 20, 72, P.yellow);
  _drawIndicatorLight(ctx, P, 25, 72, P.red);

  _drawIndicatorLight(ctx, P, 275, 72, P.teal);
  _drawIndicatorLight(ctx, P, 280, 72, P.yellow);
  _drawIndicatorLight(ctx, P, 285, 72, P.red);

  // --- Hazard markings on floor grates ---
  _drawFloorHazard(ctx, P, 120, 110);
  _drawFloorHazard(ctx, P, 200, 115);
}

function _drawWarningLight(ctx, P, x, y, color) {
  // Light housing
  T.rect(ctx, x, y, 6, 4, P.dark_gray);

  // Light lens
  T.rect(ctx, x + 1, y + 1, 4, 2, color);

  // Bright center
  T.pixel(ctx, x + 2, y + 1, P.white);
}

function _drawStatusStrip(ctx, P, x, y) {
  // Strip background
  T.rect(ctx, x, y, 30, 8, P.black);

  // Status bars
  T.rect(ctx, x + 2, y + 2, 4, 4, P.teal);
  T.rect(ctx, x + 8, y + 2, 4, 4, P.yellow);
  T.rect(ctx, x + 14, y + 2, 4, 4, P.teal);
  T.rect(ctx, x + 20, y + 2, 4, 4, P.red);

  // Frame
  T.rect(ctx, x, y, 30, 1, P.gray);
  T.rect(ctx, x, y + 7, 30, 1, P.gray);
}

function _drawGauge(ctx, P, x, y) {
  // Gauge body
  T.circleFill(ctx, x, y, 6, P.black);
  T.circleFill(ctx, x, y, 5, P.dark_gray);

  // Gauge face
  T.circleFill(ctx, x, y, 4, P.black);

  // Needle (pointing at random position)
  T.line(ctx, x, y, x + 3, y - 2, P.red);

  // Center dot
  T.pixel(ctx, x, y, P.white);

  // Frame
  for (let angle = 0; angle < 360; angle += 90) {
    const rad = (angle * Math.PI) / 180;
    const px = Math.round(x + 5 * Math.cos(rad));
    const py = Math.round(y + 5 * Math.sin(rad));
    T.pixel(ctx, px, py, P.gray);
  }
}

function _drawPressureGauge(ctx, P, x, y) {
  // Small circular gauge on pipe
  T.circleFill(ctx, x, y, 4, P.dark_gray);
  T.circleFill(ctx, x, y, 3, P.black);

  // Needle
  T.pixel(ctx, x - 1, y - 1, P.yellow);
  T.pixel(ctx, x, y, P.yellow);
}

function _drawCautionStripes(ctx, P, x, y, w) {
  // Yellow and black diagonal stripes
  for (let offset = 0; offset < w; offset += 8) {
    T.rect(ctx, x + offset, y, 4, 3, P.yellow);
    T.rect(ctx, x + offset + 4, y, 4, 3, P.black);
  }
}

function _drawRivets(ctx, P) {
  // Rivets along wall panel seams
  const rivetPositions = [
    [64, 22], [64, 35], [64, 48], [64, 61],
    [128, 22], [128, 35], [128, 48], [128, 61],
    [192, 22], [192, 35], [192, 48], [192, 61],
    [256, 22], [256, 35], [256, 48], [256, 61],
  ];

  for (const [rx, ry] of rivetPositions) {
    T.pixel(ctx, rx, ry, P.gray);
    T.pixel(ctx, rx + 1, ry, P.light_gray);
  }
}

function _drawVentOutlet(ctx, P, x, y, state) {
  // Vent pipe nozzle
  T.rect(ctx, x, y, 6, 4, P.gray);
  T.rect(ctx, x + 1, y + 1, 4, 2, P.black);

  if (state === 'active') {
    // Steam cloud visible (drawn in details layer as pixel hints)
    T.pixel(ctx, x + 6, y + 1, P.pale_gray);
    T.pixel(ctx, x + 8, y, P.pale_gray);
    T.pixel(ctx, x + 7, y + 2, P.light_gray);
  }
}

function _drawIndicatorLight(ctx, P, x, y, color) {
  // Small indicator LED
  T.pixel(ctx, x, y, color);
  T.pixel(ctx, x + 1, y, color);
  T.pixel(ctx, x, y + 1, color);
  T.pixel(ctx, x + 1, y + 1, color);
}

function _drawFloorHazard(ctx, P, x, y) {
  // Small hazard marking on floor
  T.rect(ctx, x, y, 8, 4, P.yellow);
  T.rect(ctx, x + 2, y + 1, 4, 2, P.black);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Reactor glow cast, catwalk shadows, ambient lighting
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  const glowColor = params.reactorGlow || 'orange';

  let glowBase, glowMid, glowBright;
  if (glowColor === 'orange') {
    glowBase = P.dark_red;
    glowMid = P.orange;
    glowBright = P.yellow;
  } else if (glowColor === 'red') {
    glowBase = P.dark_red;
    glowMid = P.red;
    glowBright = P.orange;
  } else {
    // teal
    glowBase = P.dark_teal;
    glowMid = P.teal;
    glowBright = P.white;
  }

  // --- Reactor core glow onto surroundings ---
  // Strong glow at center
  T.scatterCircle(ctx, 160, 50, 50, glowMid, 0.25);
  T.scatterCircle(ctx, 160, 50, 70, glowBase, 0.15);

  // Glow onto floor
  T.scatterCircle(ctx, 160, 90, 80, glowMid, 0.18);
  T.scatter(ctx, 100, 100, 120, 40, glowBase, 0.12);

  // Glow onto ceiling
  T.scatterCircle(ctx, 160, 30, 60, glowBase, 0.1);

  // Glow onto walls
  T.scatterCircle(ctx, 160, 40, 90, glowBase, 0.08);

  // --- Catwalk shadows on floor ---
  T.scatter(ctx, 0, 94, 90, 8, P.black, 0.3);
  T.scatter(ctx, 230, 99, 90, 8, P.black, 0.3);

  // --- Control panel shadows ---
  T.scatter(ctx, 10, 110, 32, 10, P.black, 0.2);
  T.scatter(ctx, 270, 110, 32, 10, P.black, 0.2);

  // --- Pipe shadows on walls ---
  T.scatter(ctx, 35, 48, 8, 15, P.black, 0.15);
  T.scatter(ctx, 50, 55, 6, 12, P.black, 0.15);
  T.scatter(ctx, 255, 48, 8, 15, P.black, 0.15);
  T.scatter(ctx, 240, 55, 6, 12, P.black, 0.15);

  // --- Ceiling shadow (depth and recesses) ---
  T.scatter(ctx, 0, 0, 320, 8, P.black, 0.25);

  // --- Floor grate shadow (void beneath) ---
  T.scatter(ctx, 100, 90, 120, 50, P.black, 0.4);

  // --- General edge darkness ---
  T.scatter(ctx, 0, 65, 40, 75, P.black, 0.15);
  T.scatter(ctx, 280, 65, 40, 75, P.black, 0.15);

  // --- Warning light glow ---
  T.scatterCircle(ctx, 80, 4, 15, P.red, 0.12);
  T.scatterCircle(ctx, 240, 4, 15, P.red, 0.12);
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Reactor light wash, steam wisps, dust particles
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  const glowColor = params.reactorGlow || 'orange';
  const ventActivity = params.ventActivity || 'active';

  let ambientColor;
  if (glowColor === 'orange') {
    ambientColor = P.orange;
  } else if (glowColor === 'red') {
    ambientColor = P.red;
  } else {
    ambientColor = P.teal;
  }

  // --- Reactor ambient light wash across entire room ---
  T.scatter(ctx, 0, 0, 320, 140, ambientColor, 0.06);

  // --- Stronger wash near reactor ---
  T.scatterCircle(ctx, 160, 50, 100, ambientColor, 0.08);
  T.scatterCircle(ctx, 160, 50, 60, ambientColor, 0.1);

  // --- Steam wisps from vents (if active) ---
  if (ventActivity === 'active') {
    // Left vent steam
    T.scatter(ctx, 26, 55, 20, 15, P.pale_gray, 0.12);
    T.scatterCircle(ctx, 35, 60, 12, P.light_gray, 0.08);
    T.scatter(ctx, 30, 50, 15, 10, P.white, 0.04);

    // Right vent steam
    T.scatter(ctx, 288, 50, 20, 15, P.pale_gray, 0.12);
    T.scatterCircle(ctx, 295, 55, 12, P.light_gray, 0.08);
    T.scatter(ctx, 290, 48, 15, 10, P.white, 0.04);

    // Top vent steam
    T.scatter(ctx, 160, 18, 18, 12, P.pale_gray, 0.1);
    T.scatterCircle(ctx, 165, 22, 10, P.light_gray, 0.06);
  } else {
    // Calm — minimal steam
    T.scatter(ctx, 28, 58, 10, 8, P.pale_gray, 0.05);
    T.scatter(ctx, 290, 52, 10, 8, P.pale_gray, 0.05);
  }

  // --- Heat distortion shimmer near reactor (scatter particles) ---
  const heatPositions = [
    [155, 48], [165, 46], [158, 52], [162, 44], [152, 50],
    [168, 51], [154, 45], [166, 49], [160, 43], [156, 54],
  ];
  for (const [hx, hy] of heatPositions) {
    T.pixel(ctx, hx, hy, ambientColor);
  }

  // --- Dust particles in light beams ---
  const dustPositions = [
    [40, 38], [48, 42], [55, 35], [72, 40], [85, 36],
    [105, 45], [118, 38], [135, 42], [148, 37],
    [172, 39], [185, 44], [202, 36], [215, 41],
    [235, 38], [248, 43], [265, 35], [278, 40], [290, 37],
    [30, 65], [60, 68], [90, 70], [230, 72], [260, 68], [295, 66],
  ];
  for (const [dx, dy] of dustPositions) {
    T.pixel(ctx, dx, dy, P.light_gray);
  }

  // --- Reactor core bright rays (pixel lines radiating out) ---
  const rayPositions = [
    [160, 28], [160, 72], [138, 50], [182, 50],
    [145, 35], [175, 35], [145, 65], [175, 65],
  ];
  for (const [rx, ry] of rayPositions) {
    T.pixel(ctx, rx, ry, P.yellow);
  }

  // --- Warning light pulsing glow ---
  T.scatterCircle(ctx, 80, 4, 20, P.red, 0.06);
  T.scatterCircle(ctx, 240, 4, 20, P.red, 0.06);

  // --- Corner vignette (darken edges) ---
  T.scatter(ctx, 0, 0, 30, 40, P.black, 0.12);
  T.scatter(ctx, 290, 0, 30, 40, P.black, 0.12);
  T.scatter(ctx, 0, 100, 40, 40, P.black, 0.12);
  T.scatter(ctx, 280, 100, 40, 40, P.black, 0.12);

  // --- Overall industrial dimness ---
  T.scatter(ctx, 0, 0, 320, 140, P.black, 0.08);
}
