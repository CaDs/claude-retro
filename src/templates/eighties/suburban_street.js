/**
 * suburban_street.js — 80s suburban street exterior room template.
 *
 * Generates a warm suburban street scene with houses, lawns, white picket fences,
 * mailboxes, parked cars (station wagon or convertible), trees, blue sky, power lines,
 * and fire hydrants. Captures the quintessential 80s American suburb aesthetic.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';
import { drawSkyBands } from '../_base.js';

export const metadata = {
  id: 'eighties/suburban_street',
  name: 'Suburban Street',
  setting: 'eighties',
  category: 'exterior',
  palette: 'suburban_warm',
  params: {
    carType: { type: 'enum', options: ['wagon', 'convertible', 'sedan'], default: 'wagon', label: 'Car Type' },
    timeOfDay: { type: 'enum', options: ['morning', 'noon', 'afternoon'], default: 'noon', label: 'Time of Day' },
    hasFences: { type: 'boolean', default: true, label: 'Picket Fences' },
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
//  Layer 1 (BASE): Sky, street, sidewalk, grass
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  const isMorning = params.timeOfDay === 'morning';
  const isAfternoon = params.timeOfDay === 'afternoon';

  // --- Sky (rows 0-52) ---
  let skyBands;
  if (isMorning) {
    skyBands = [
      { y: 0, h: 15, color: P.light_blue },
      { y: 15, h: 20, color: P.blue },
      { y: 35, h: 17, color: P.light_blue },
    ];
  } else if (isAfternoon) {
    skyBands = [
      { y: 0, h: 18, color: P.blue },
      { y: 18, h: 20, color: P.light_blue },
      { y: 38, h: 14, color: P.blue },
    ];
  } else {
    // Noon — brightest sky
    skyBands = [
      { y: 0, h: 20, color: P.light_blue },
      { y: 20, h: 18, color: P.blue },
      { y: 38, h: 14, color: P.light_blue },
    ];
  }
  drawSkyBands(ctx, P, skyBands);

  // --- Horizon grass line (distant background) ---
  T.rect(ctx, 0, 52, 320, 8, P.green);
  T.dither(ctx, 0, 52, 320, 8, P.green, P.dark_green, 0.2, 4);

  // --- Sidewalk (rows 60-72) ---
  T.rect(ctx, 0, 60, 320, 12, P.gray);
  T.dither(ctx, 0, 60, 320, 12, P.gray, P.dark_gray, 0.15, 4);

  // Sidewalk crack lines
  for (let x = 0; x < 320; x += 40) {
    T.rect(ctx, x, 60, 1, 12, P.dark_gray);
  }
  T.rect(ctx, 0, 66, 320, 1, P.dark_gray);

  // --- Asphalt street (rows 72-110) ---
  T.rect(ctx, 0, 72, 320, 38, P.dark_gray);
  T.dither(ctx, 0, 72, 320, 38, P.dark_gray, P.black, 0.25, 4);

  // Street center line — dashed yellow
  for (let x = 10; x < 320; x += 20) {
    T.rect(ctx, x, 90, 12, 2, P.off_white);
  }

  // --- Front lawn / grass (rows 110-140) ---
  T.rect(ctx, 0, 110, 320, 30, P.green);
  T.dither(ctx, 0, 110, 320, 30, P.green, P.light_green, 0.2, 4);
  T.dither(ctx, 0, 110, 320, 30, P.green, P.dark_green, 0.15, 4);

  // Grass texture — scattered darker green pixels
  for (let i = 0; i < 60; i++) {
    const gx = (i * 23 + 11) % 320;
    const gy = 110 + (i * 17 + 7) % 30;
    T.pixel(ctx, gx, gy, P.dark_green);
  }
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Houses, fences, trees, parked car, mailboxes
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- Background houses ---
  _drawBackgroundHouses(ctx, P);

  // --- Trees ---
  _drawTrees(ctx, P);

  // --- White picket fences ---
  if (params.hasFences) {
    _drawPicketFences(ctx, P);
  }

  // --- Parked car on street ---
  _drawParkedCar(ctx, P, params.carType);

  // --- Mailboxes ---
  _drawMailboxes(ctx, P);

  // --- Fire hydrant ---
  _drawFireHydrant(ctx, P);
}

function _drawBackgroundHouses(ctx, P) {
  // Three houses visible in the background
  const houses = [
    { x: 20, w: 65, roofColor: P.brown, wallColor: P.beige },
    { x: 130, w: 70, roofColor: P.dark_brown, wallColor: P.tan },
    { x: 240, w: 60, roofColor: P.brown, wallColor: P.off_white },
  ];

  for (const house of houses) {
    const hx = house.x;
    const hy = 32;
    const hw = house.w;
    const hh = 28;

    // House wall
    T.rect(ctx, hx, hy, hw, hh, house.wallColor);
    T.dither(ctx, hx, hy, hw, hh, house.wallColor, T.darken(house.wallColor, 15), 0.1, 4);

    // Roof — triangular
    const roofPeakX = hx + Math.floor(hw / 2);
    const roofPeakY = hy - 10;
    T.polygonFill(ctx, [
      [hx - 2, hy],
      [roofPeakX, roofPeakY],
      [hx + hw + 2, hy],
    ], house.roofColor);

    // Roof shingles texture
    for (let sy = roofPeakY + 2; sy < hy; sy += 3) {
      const lineW = Math.floor((sy - roofPeakY) / (hy - roofPeakY) * hw) + 4;
      const lineX = roofPeakX - Math.floor(lineW / 2);
      T.rect(ctx, lineX, sy, lineW, 1, P.dark_brown);
    }

    // Windows
    const winY = hy + 6;
    const win1X = hx + 8;
    const win2X = hx + hw - 16;
    _drawHouseWindow(ctx, P, win1X, winY);
    _drawHouseWindow(ctx, P, win2X, winY);

    // Door
    const doorX = hx + Math.floor(hw / 2) - 5;
    const doorY = hy + 14;
    T.rect(ctx, doorX, doorY, 10, 16, P.dark_brown);
    T.rect(ctx, doorX + 1, doorY + 1, 8, 14, P.brown);
    // Door handle
    T.pixel(ctx, doorX + 7, doorY + 8, P.off_white);

    // Chimney (on left side)
    const chimX = hx + 10;
    const chimY = roofPeakY + 4;
    T.rect(ctx, chimX, chimY, 4, 8, P.dark_brown);
    T.rect(ctx, chimX + 1, chimY + 1, 2, 6, P.brown);
  }
}

function _drawHouseWindow(ctx, P, x, y) {
  const winW = 8;
  const winH = 8;

  // Window frame
  T.rect(ctx, x, y, winW, winH, P.dark_brown);

  // Glass
  T.rect(ctx, x + 1, y + 1, winW - 2, winH - 2, P.dark_blue);

  // Crossbar
  T.rect(ctx, x + 1, y + Math.floor(winH / 2), winW - 2, 1, P.dark_brown);
  T.rect(ctx, x + Math.floor(winW / 2), y + 1, 1, winH - 2, P.dark_brown);

  // Glint
  T.pixel(ctx, x + 2, y + 2, P.light_blue);
}

function _drawTrees(ctx, P) {
  const trees = [
    { x: 100, y: 50, size: 'large' },
    { x: 210, y: 54, size: 'medium' },
    { x: 40, y: 110, size: 'small' },
    { x: 280, y: 115, size: 'small' },
  ];

  for (const tree of trees) {
    const tx = tree.x;
    const ty = tree.y;
    const isLarge = tree.size === 'large';
    const isMedium = tree.size === 'medium';

    // Trunk
    const trunkW = isLarge ? 4 : 3;
    const trunkH = isLarge ? 16 : (isMedium ? 12 : 8);
    T.rect(ctx, tx - Math.floor(trunkW / 2), ty, trunkW, trunkH, P.dark_brown);
    T.rect(ctx, tx - Math.floor(trunkW / 2) + 1, ty, 1, trunkH, P.brown);

    // Foliage — circular clusters
    const foliageR = isLarge ? 12 : (isMedium ? 10 : 7);
    T.circleFill(ctx, tx, ty - 4, foliageR, P.green);
    T.circleFill(ctx, tx - 6, ty - 2, foliageR - 2, P.dark_green);
    T.circleFill(ctx, tx + 6, ty - 2, foliageR - 2, P.light_green);
    T.circleFill(ctx, tx, ty - 8, foliageR - 3, P.light_green);

    // Dither foliage for texture
    T.dither(ctx, tx - foliageR, ty - 4 - foliageR, foliageR * 2, foliageR * 2, P.green, P.dark_green, 0.2, 4);
  }
}

function _drawPicketFences(ctx, P) {
  // Fence along front lawn
  const fences = [
    { x: 0, w: 140 },
    { x: 180, w: 140 },
  ];

  for (const fence of fences) {
    const fx = fence.x;
    const fy = 110;
    const fw = fence.w;

    // Horizontal rails
    T.rect(ctx, fx, fy + 2, fw, 1, P.white);
    T.rect(ctx, fx, fy + 6, fw, 1, P.white);

    // Vertical pickets
    for (let px = fx; px < fx + fw; px += 5) {
      T.rect(ctx, px, fy, 2, 10, P.white);
      // Pointed top
      T.pixel(ctx, px, fy - 1, P.white);
      T.pixel(ctx, px + 1, fy - 1, P.white);
      T.pixel(ctx, px, fy - 2, P.off_white);
    }

    // Fence posts (thicker posts at intervals)
    for (let postX = fx; postX < fx + fw; postX += 30) {
      T.rect(ctx, postX, fy - 2, 3, 14, P.off_white);
      T.pixel(ctx, postX + 1, fy - 3, P.white);
    }
  }
}

function _drawParkedCar(ctx, P, carType) {
  const cx = 220;
  const cy = 80;

  if (carType === 'wagon') {
    _drawStationWagon(ctx, P, cx, cy);
  } else if (carType === 'convertible') {
    _drawConvertible(ctx, P, cx, cy);
  } else {
    _drawSedan(ctx, P, cx, cy);
  }
}

function _drawStationWagon(ctx, P, cx, cy) {
  const carW = 40;
  const carH = 14;

  // Car body — main box
  T.rect(ctx, cx, cy, carW, carH, P.tan);
  T.dither(ctx, cx, cy, carW, carH, P.tan, P.brown, 0.1, 4);

  // Roof
  T.rect(ctx, cx + 2, cy - 4, carW - 4, 4, P.beige);
  T.rect(ctx, cx + 3, cy - 4, carW - 6, 3, P.tan);

  // Windows
  T.rect(ctx, cx + 5, cy - 3, 8, 2, P.dark_blue);
  T.rect(ctx, cx + 16, cy - 3, 10, 2, P.dark_blue);
  T.pixel(ctx, cx + 6, cy - 3, P.light_blue);

  // Wheels
  T.circleFill(ctx, cx + 8, cy + carH, 3, P.black);
  T.circleFill(ctx, cx + 8, cy + carH, 2, P.dark_gray);
  T.circleFill(ctx, cx + carW - 8, cy + carH, 3, P.black);
  T.circleFill(ctx, cx + carW - 8, cy + carH, 2, P.dark_gray);

  // Bumpers
  T.rect(ctx, cx - 1, cy + 6, 2, 4, P.gray);
  T.rect(ctx, cx + carW - 1, cy + 6, 2, 4, P.gray);

  // Headlight
  T.rect(ctx, cx, cy + 4, 1, 2, P.off_white);

  // Wood paneling (classic wagon detail)
  T.rect(ctx, cx + 2, cy + 3, carW - 4, 1, P.dark_brown);
  T.rect(ctx, cx + 2, cy + 8, carW - 4, 1, P.dark_brown);
  for (let wx = cx + 10; wx < cx + carW - 4; wx += 8) {
    T.rect(ctx, wx, cy + 3, 1, 6, P.dark_brown);
  }
}

function _drawConvertible(ctx, P, cx, cy) {
  const carW = 38;
  const carH = 12;

  // Car body — sleeker profile
  T.polygonFill(ctx, [
    [cx, cy + 6],
    [cx + 2, cy + 2],
    [cx + carW - 2, cy + 2],
    [cx + carW, cy + 6],
    [cx + carW, cy + carH],
    [cx, cy + carH],
  ], P.tan);

  // Hood/trunk detail
  T.rect(ctx, cx + 2, cy + 3, carW - 4, carH - 3, P.beige);
  T.dither(ctx, cx + 2, cy + 3, carW - 4, carH - 3, P.beige, P.tan, 0.1, 4);

  // Windshield area (convertible is open)
  T.rect(ctx, cx + 12, cy, 14, 3, P.dark_blue);
  T.pixel(ctx, cx + 14, cy + 1, P.light_blue);

  // Seats visible
  T.rect(ctx, cx + 14, cy + 2, 4, 4, P.brown);
  T.rect(ctx, cx + 20, cy + 2, 4, 4, P.brown);

  // Wheels
  T.circleFill(ctx, cx + 8, cy + carH, 3, P.black);
  T.circleFill(ctx, cx + 8, cy + carH, 2, P.dark_gray);
  T.circleFill(ctx, cx + carW - 8, cy + carH, 3, P.black);
  T.circleFill(ctx, cx + carW - 8, cy + carH, 2, P.dark_gray);

  // Bumpers
  T.rect(ctx, cx - 1, cy + 6, 2, 4, P.gray);
  T.rect(ctx, cx + carW - 1, cy + 6, 2, 4, P.gray);

  // Headlight
  T.rect(ctx, cx, cy + 5, 1, 2, P.off_white);

  // Chrome trim
  T.rect(ctx, cx + 1, cy + carH - 1, carW - 2, 1, P.white);
}

function _drawSedan(ctx, P, cx, cy) {
  const carW = 36;
  const carH = 12;

  // Car body
  T.rect(ctx, cx, cy + 2, carW, carH, P.beige);
  T.dither(ctx, cx, cy + 2, carW, carH, P.beige, P.tan, 0.1, 4);

  // Roof
  T.rect(ctx, cx + 8, cy - 2, 20, 4, P.tan);

  // Windows
  T.rect(ctx, cx + 10, cy - 1, 6, 2, P.dark_blue);
  T.rect(ctx, cx + 20, cy - 1, 6, 2, P.dark_blue);
  T.pixel(ctx, cx + 11, cy - 1, P.light_blue);

  // Wheels
  T.circleFill(ctx, cx + 8, cy + carH + 2, 3, P.black);
  T.circleFill(ctx, cx + 8, cy + carH + 2, 2, P.dark_gray);
  T.circleFill(ctx, cx + carW - 8, cy + carH + 2, 3, P.black);
  T.circleFill(ctx, cx + carW - 8, cy + carH + 2, 2, P.dark_gray);

  // Bumpers
  T.rect(ctx, cx - 1, cy + 6, 2, 4, P.gray);
  T.rect(ctx, cx + carW - 1, cy + 6, 2, 4, P.gray);

  // Headlight
  T.rect(ctx, cx, cy + 5, 1, 2, P.off_white);
}

function _drawMailboxes(ctx, P) {
  const mailboxes = [
    { x: 60, flag: true },
    { x: 160, flag: false },
  ];

  for (const mb of mailboxes) {
    const mx = mb.x;
    const my = 108;

    // Post
    T.rect(ctx, mx, my, 2, 12, P.dark_brown);

    // Mailbox body
    T.rect(ctx, mx - 3, my - 4, 8, 4, P.white);
    T.rect(ctx, mx - 2, my - 3, 6, 2, P.gray);

    // Flag (if raised)
    if (mb.flag) {
      T.rect(ctx, mx + 5, my - 3, 3, 1, P.tan);
      T.pixel(ctx, mx + 8, my - 3, P.tan);
    }
  }
}

function _drawFireHydrant(ctx, P) {
  const hx = 15;
  const hy = 64;

  // Hydrant body
  T.rect(ctx, hx, hy, 6, 8, P.tan);
  T.dither(ctx, hx, hy, 6, 8, P.tan, P.brown, 0.15, 4);

  // Top cap
  T.rect(ctx, hx - 1, hy - 2, 8, 2, P.tan);

  // Side nozzles
  T.rect(ctx, hx - 2, hy + 3, 2, 2, P.gray);
  T.rect(ctx, hx + 6, hy + 3, 2, 2, P.gray);

  // Base
  T.rect(ctx, hx - 1, hy + 8, 8, 2, P.brown);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Power lines, clouds, lawn ornaments, street details
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Power lines across sky ---
  _drawPowerLines(ctx, P);

  // --- Clouds ---
  _drawClouds(ctx, P);

  // --- Lawn decorations ---
  _drawLawnOrnaments(ctx, P);

  // --- Street signs ---
  _drawStreetSign(ctx, P);

  // --- Sidewalk details ---
  // Chalk drawings
  T.pixel(ctx, 120, 65, P.light_blue);
  T.pixel(ctx, 121, 65, P.light_blue);
  T.pixel(ctx, 120, 66, P.light_blue);

  // Gum/stain on sidewalk
  T.pixel(ctx, 200, 68, P.dark_gray);

  // --- Street litter ---
  T.pixel(ctx, 80, 100, P.off_white);
  T.pixel(ctx, 190, 95, P.brown);
}

function _drawPowerLines(ctx, P) {
  // Utility poles
  const poles = [
    { x: 90, y: 44 },
    { x: 230, y: 44 },
  ];

  for (const pole of poles) {
    const px = pole.x;
    const py = pole.y;

    // Pole
    T.rect(ctx, px, py, 2, 28, P.dark_brown);
    T.pixel(ctx, px + 1, py, P.brown);

    // Crossbar
    T.rect(ctx, px - 4, py + 4, 10, 1, P.dark_brown);

    // Transformer box
    T.rect(ctx, px - 2, py + 8, 6, 4, P.dark_gray);
  }

  // Power lines spanning between poles
  T.line(ctx, 90, 48, 230, 48, P.black);
  T.line(ctx, 90, 50, 230, 50, P.black);
  T.line(ctx, 90, 52, 230, 52, P.black);

  // Lines extending off-screen
  T.line(ctx, 0, 50, 90, 50, P.black);
  T.line(ctx, 230, 50, 320, 50, P.black);
}

function _drawClouds(ctx, P) {
  const clouds = [
    { x: 40, y: 12, w: 25 },
    { x: 180, y: 8, w: 30 },
    { x: 280, y: 15, w: 20 },
  ];

  for (const cloud of clouds) {
    const cx = cloud.x;
    const cy = cloud.y;
    const cw = cloud.w;

    // Cloud puffs — overlapping circles
    T.circleFill(ctx, cx, cy, 6, P.white);
    T.circleFill(ctx, cx + 8, cy - 1, 7, P.white);
    T.circleFill(ctx, cx + 16, cy, 6, P.white);
    T.circleFill(ctx, cx + 12, cy + 2, 5, P.white);

    // Subtle shading on bottom
    T.scatter(ctx, cx - 6, cy + 4, cw, 3, P.light_blue, 0.15);
  }
}

function _drawLawnOrnaments(ctx, P) {
  // Pink flamingo
  const fx = 50;
  const fy = 120;
  T.rect(ctx, fx, fy, 2, 6, P.dark_brown); // legs
  T.rect(ctx, fx + 1, fy - 4, 3, 4, P.tan); // body
  T.pixel(ctx, fx + 2, fy - 5, P.tan); // head
  T.pixel(ctx, fx + 3, fy - 5, P.tan); // beak

  // Garden gnome
  const gx = 270;
  const gy = 125;
  T.rect(ctx, gx, gy, 4, 6, P.beige); // body
  T.pixel(ctx, gx + 1, gy - 1, P.tan); // head
  T.pixel(ctx, gx + 2, gy - 1, P.tan);
  T.pixel(ctx, gx + 1, gy - 2, P.tan); // hat
  T.pixel(ctx, gx + 2, gy - 2, P.tan);

  // Sprinkler
  const sx = 140;
  const sy = 128;
  T.rect(ctx, sx, sy, 2, 4, P.green);
  T.pixel(ctx, sx - 1, sy, P.light_blue); // water spray
  T.pixel(ctx, sx + 3, sy, P.light_blue);
  T.pixel(ctx, sx, sy - 1, P.light_blue);
}

function _drawStreetSign(ctx, P) {
  const signX = 10;
  const signY = 62;

  // Sign post
  T.rect(ctx, signX, signY, 1, 10, P.gray);

  // Sign board
  T.rect(ctx, signX - 4, signY - 6, 9, 6, P.green);
  T.rect(ctx, signX - 3, signY - 5, 7, 4, P.white);

  // Street name text placeholder
  T.rect(ctx, signX - 2, signY - 4, 5, 1, P.black);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Shadows from houses, trees, car, objects
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  const isMorning = params.timeOfDay === 'morning';
  const isAfternoon = params.timeOfDay === 'afternoon';

  // Shadow direction: morning = right-facing, afternoon = left-facing, noon = short
  const shadowOffsetX = isMorning ? 8 : (isAfternoon ? -8 : 0);
  const shadowOffsetY = isMorning ? 4 : (isAfternoon ? 4 : 2);
  const shadowIntensity = isMorning ? 0.12 : (isAfternoon ? 0.14 : 0.08);

  // --- House shadows on ground ---
  T.scatter(ctx, 20 + shadowOffsetX, 60 + shadowOffsetY, 65, 8, P.black, shadowIntensity);
  T.scatter(ctx, 130 + shadowOffsetX, 60 + shadowOffsetY, 70, 8, P.black, shadowIntensity);
  T.scatter(ctx, 240 + shadowOffsetX, 60 + shadowOffsetY, 60, 8, P.black, shadowIntensity);

  // --- Tree shadows on grass ---
  T.scatter(ctx, 100 + shadowOffsetX, 66 + shadowOffsetY, 20, 12, P.black, shadowIntensity);
  T.scatter(ctx, 210 + shadowOffsetX, 66 + shadowOffsetY, 16, 10, P.black, shadowIntensity);
  T.scatter(ctx, 40 + shadowOffsetX, 118 + shadowOffsetY, 12, 10, P.black, shadowIntensity);
  T.scatter(ctx, 280 + shadowOffsetX, 123 + shadowOffsetY, 12, 8, P.black, shadowIntensity);

  // --- Car shadow ---
  T.scatter(ctx, 220 + shadowOffsetX, 94 + shadowOffsetY, 40, 8, P.black, shadowIntensity);

  // --- Fence shadows on lawn ---
  if (params.hasFences) {
    T.scatter(ctx, 0 + shadowOffsetX, 120 + shadowOffsetY, 140, 6, P.black, shadowIntensity * 0.6);
    T.scatter(ctx, 180 + shadowOffsetX, 120 + shadowOffsetY, 140, 6, P.black, shadowIntensity * 0.6);
  }

  // --- Mailbox shadows ---
  T.scatter(ctx, 60 + shadowOffsetX, 118 + shadowOffsetY, 4, 3, P.black, shadowIntensity);
  T.scatter(ctx, 160 + shadowOffsetX, 118 + shadowOffsetY, 4, 3, P.black, shadowIntensity);

  // --- Fire hydrant shadow ---
  T.scatter(ctx, 15 + shadowOffsetX, 70 + shadowOffsetY, 6, 3, P.black, shadowIntensity);

  // --- Utility pole shadows ---
  T.scatter(ctx, 90 + shadowOffsetX, 60 + shadowOffsetY, 3, 12, P.black, shadowIntensity);
  T.scatter(ctx, 230 + shadowOffsetX, 60 + shadowOffsetY, 3, 12, P.black, shadowIntensity);

  // --- General ground shading (distant to near gradient) ---
  T.scatter(ctx, 0, 52, 320, 8, P.dark_green, 0.06);
  T.scatter(ctx, 0, 130, 320, 10, P.dark_green, 0.08);
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Warm sunlight, haze, sky depth
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  const isMorning = params.timeOfDay === 'morning';
  const isAfternoon = params.timeOfDay === 'afternoon';

  if (isMorning) {
    // --- Morning: cooler, fresher light ---
    T.scatter(ctx, 0, 0, 320, 140, P.light_blue, 0.04);
    T.scatter(ctx, 0, 0, 320, 60, P.white, 0.02);
    // Morning glow from left
    T.scatterCircle(ctx, 40, 20, 60, P.white, 0.06);
  } else if (isAfternoon) {
    // --- Afternoon: warmer, golden hour approach ---
    T.scatter(ctx, 0, 0, 320, 140, P.beige, 0.05);
    T.scatter(ctx, 0, 0, 320, 60, P.tan, 0.03);
    // Afternoon glow from right
    T.scatterCircle(ctx, 280, 20, 60, P.tan, 0.07);
  } else {
    // --- Noon: bright, neutral ---
    T.scatter(ctx, 0, 0, 320, 140, P.white, 0.05);
    T.scatter(ctx, 0, 0, 320, 60, P.light_blue, 0.02);
  }

  // --- Sky depth haze (lighter at horizon) ---
  T.scatter(ctx, 0, 45, 320, 15, P.white, 0.08);

  // --- Heat shimmer on asphalt (subtle wavy pixels) ---
  const shimmerPositions = [
    [30, 85], [70, 88], [110, 83], [150, 86], [190, 84], [230, 87], [270, 85],
  ];
  for (const [sx, sy] of shimmerPositions) {
    T.pixel(ctx, sx, sy, P.off_white);
  }

  // --- Grass light highlights ---
  const grassHighlights = [
    [25, 115], [60, 125], [95, 118], [140, 130], [180, 122], [220, 135], [265, 128], [300, 132],
  ];
  for (const [gx, gy] of grassHighlights) {
    T.pixel(ctx, gx, gy, P.light_green);
  }

  // --- Atmospheric dust/pollen particles in sunlight ---
  const hazePositions = [
    [50, 30], [100, 35], [150, 28], [200, 32], [250, 36], [290, 30],
    [35, 48], [85, 45], [135, 42], [185, 46], [235, 44], [280, 47],
    [60, 65], [120, 62], [180, 68], [240, 64],
  ];

  for (const [hx, hy] of hazePositions) {
    T.pixel(ctx, hx, hy, P.white);
  }

  // --- Vignette: subtle edge darkening ---
  T.scatter(ctx, 0, 0, 15, 15, P.black, 0.03);
  T.scatter(ctx, 305, 0, 15, 15, P.black, 0.03);
  T.scatter(ctx, 0, 125, 15, 15, P.black, 0.03);
  T.scatter(ctx, 305, 125, 15, 15, P.black, 0.03);
}
