/**
 * parking_lot.js — Contemporary outdoor parking lot room template.
 *
 * Generates an outdoor parking lot scene with asphalt ground, painted parking lines,
 * a few parked cars (simple pixel shapes), lampposts, chain-link fence, building wall
 * in background, and sky. All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'contemporary/parking_lot',
  name: 'Parking Lot',
  setting: 'contemporary',
  category: 'exterior',
  palette: 'city_day',
  params: {
    carCount: { type: 'enum', options: ['few', 'normal', 'many'], default: 'normal', label: 'Cars' },
    timeOfDay: { type: 'enum', options: ['day', 'dusk'], default: 'day', label: 'Time' },
    hasFence: { type: 'boolean', default: true, label: 'Chain Fence' },
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
//  Layer 1 (BASE): Sky, building wall, asphalt ground, parking lines
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  const isDusk = params.timeOfDay === 'dusk';

  // --- Sky (rows 0-48) ---
  if (isDusk) {
    T.rect(ctx, 0, 0, 320, 20, P.dark_blue);
    T.rect(ctx, 0, 20, 320, 14, P.blue);
    T.rect(ctx, 0, 34, 320, 14, P.light_blue);
    T.ditherGradient(ctx, 0, 20, 320, 28, P.blue, P.light_blue, 'vertical');
  } else {
    T.rect(ctx, 0, 0, 320, 20, P.light_blue);
    T.rect(ctx, 0, 20, 320, 28, P.blue);
    T.ditherGradient(ctx, 0, 0, 320, 48, P.light_blue, P.blue, 'vertical');
  }

  // --- Clouds ---
  _drawCloud(ctx, P, 40, 8, 24, 6);
  _drawCloud(ctx, P, 150, 12, 30, 7);
  _drawCloud(ctx, P, 260, 6, 20, 5);

  // --- Background building wall (rows 48-76) ---
  const buildingY = 48;
  const buildingH = 29;
  T.rect(ctx, 0, buildingY, 320, buildingH, P.concrete);
  T.dither(ctx, 0, buildingY, 320, buildingH, P.concrete, P.gray, 0.12, 4);

  // Brick pattern on building
  const brickH = 4;
  for (let by = buildingY; by < buildingY + buildingH; by += brickH) {
    T.rect(ctx, 0, by, 320, 1, P.gray);
    const offset = ((by - buildingY) / brickH) % 2 === 0 ? 0 : 12;
    for (let bx = offset; bx < 320; bx += 24) {
      T.rect(ctx, bx, by, 1, brickH, P.gray);
    }
  }

  // Building windows
  for (let wx = 20; wx < 300; wx += 40) {
    _drawBuildingWindow(ctx, P, wx, buildingY + 6, 12, 16);
  }

  // Building roofline
  T.rect(ctx, 0, buildingY, 320, 1, P.dark_gray);

  // --- Asphalt ground (rows 77-140) ---
  const groundY = 77;
  const groundH = 63;
  T.rect(ctx, 0, groundY, 320, groundH, P.dark_gray);
  T.dither(ctx, 0, groundY, 320, groundH, P.dark_gray, P.black, 0.2, 4);

  // Asphalt texture variation
  T.dither(ctx, 20, groundY + 10, 80, 30, P.dark_gray, P.gray, 0.15, 4);
  T.dither(ctx, 140, groundY + 25, 60, 20, P.dark_gray, P.gray, 0.12, 4);
  T.dither(ctx, 240, groundY + 40, 70, 18, P.dark_gray, P.gray, 0.1, 4);

  // --- Parking space lines (white) ---
  _drawParkingLines(ctx, P, groundY);

  // --- Curb at building base ---
  T.rect(ctx, 0, groundY - 1, 320, 2, P.concrete);
  T.rect(ctx, 0, groundY - 1, 320, 1, P.light_gray);
}

function _drawCloud(ctx, P, x, y, w, h) {
  // Simple cloud shape using overlapping ellipses approximated as rects
  T.rect(ctx, x + 4, y, w - 8, h, P.white);
  T.rect(ctx, x, y + 2, w, h - 4, P.white);
  T.dither(ctx, x, y, w, h, P.white, P.light_gray, 0.1, 4);

  // Cloud puffs
  T.rect(ctx, x + 2, y + 1, 6, h - 2, P.white);
  T.rect(ctx, x + w - 8, y + 1, 6, h - 2, P.white);
}

function _drawBuildingWindow(ctx, P, x, y, w, h) {
  // Window frame
  T.rect(ctx, x, y, w, h, P.dark_gray);
  T.rect(ctx, x + 1, y + 1, w - 2, h - 2, P.dark_blue);

  // Cross bars
  const midX = x + Math.floor(w / 2);
  const midY = y + Math.floor(h / 2);
  T.rect(ctx, x + 1, midY, w - 2, 1, P.dark_gray);
  T.rect(ctx, midX, y + 1, 1, h - 2, P.dark_gray);

  // Window glint
  T.pixel(ctx, x + 2, y + 2, P.white);
}

function _drawParkingLines(ctx, P, groundY) {
  // Parking space dividers — vertical lines
  for (let px = 30; px < 320; px += 40) {
    T.rect(ctx, px, groundY + 10, 2, 50, P.white);
  }

  // Horizontal lane divider
  T.rect(ctx, 0, groundY + 32, 320, 2, P.yellow);
  // Dashed pattern
  for (let dx = 0; dx < 320; dx += 12) {
    T.rect(ctx, dx + 6, groundY + 32, 4, 2, P.dark_gray);
  }

  // Arrow markings on pavement (abstract)
  _drawArrowMarking(ctx, P, 60, groundY + 18);
  _drawArrowMarking(ctx, P, 180, groundY + 18);

  // Handicap parking symbol
  _drawHandicapSymbol(ctx, P, 140, groundY + 45);
}

function _drawArrowMarking(ctx, P, x, y) {
  // Simple arrow pointing up
  T.rect(ctx, x, y + 4, 2, 6, P.white);
  T.pixel(ctx, x - 1, y + 5, P.white);
  T.pixel(ctx, x + 2, y + 5, P.white);
  T.pixel(ctx, x - 2, y + 6, P.white);
  T.pixel(ctx, x + 3, y + 6, P.white);
}

function _drawHandicapSymbol(ctx, P, x, y) {
  // Wheelchair icon (abstract)
  // Background blue square
  T.rect(ctx, x, y, 12, 12, P.blue);

  // White stick figure in wheelchair
  T.pixel(ctx, x + 6, y + 2, P.white);
  T.pixel(ctx, x + 7, y + 2, P.white);
  T.rect(ctx, x + 6, y + 3, 2, 3, P.white);
  T.rect(ctx, x + 4, y + 5, 2, 3, P.white);
  T.rect(ctx, x + 8, y + 5, 2, 3, P.white);
  T.rect(ctx, x + 5, y + 8, 4, 1, P.white);
  T.pixel(ctx, x + 3, y + 9, P.white);
  T.pixel(ctx, x + 4, y + 9, P.white);
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Parked cars, lampposts, fence
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- Parked cars ---
  const carCount = params.carCount;
  if (carCount === 'few') {
    _drawCar(ctx, P, 50, 88, P.red);
    _drawCar(ctx, P, 210, 92, P.blue);
  } else if (carCount === 'normal') {
    _drawCar(ctx, P, 35, 86, P.blue);
    _drawCar(ctx, P, 95, 88, P.red);
    _drawCar(ctx, P, 175, 90, P.dark_gray);
    _drawCar(ctx, P, 250, 92, P.green);
  } else if (carCount === 'many') {
    _drawCar(ctx, P, 32, 86, P.blue);
    _drawCar(ctx, P, 72, 87, P.yellow);
    _drawCar(ctx, P, 112, 88, P.red);
    _drawCar(ctx, P, 152, 89, P.dark_gray);
    _drawCar(ctx, P, 192, 90, P.brown);
    _drawCar(ctx, P, 232, 91, P.green);
    _drawCar(ctx, P, 272, 92, P.dark_blue);
  }

  // --- Lampposts ---
  _drawLamppost(ctx, P, 10, 78);
  _drawLamppost(ctx, P, 160, 78);
  _drawLamppost(ctx, P, 310, 78);

  // --- Chain-link fence (right side) ---
  if (params.hasFence) {
    _drawChainFence(ctx, P, 285, 62, 35, 78);
  }

  // --- Dumpster near building ---
  _drawDumpster(ctx, P, 280, 70);
}

function _drawCar(ctx, P, x, y, color) {
  const cw = 28;
  const ch = 14;

  // Car body
  T.rect(ctx, x, y + 6, cw, ch - 6, color);
  T.dither(ctx, x, y + 6, cw, ch - 6, color, T.darken(color, 20), 0.1, 4);

  // Car roof (cabin)
  const roofW = 16;
  const roofX = x + 6;
  T.rect(ctx, roofX, y, roofW, 8, color);
  T.dither(ctx, roofX, y, roofW, 8, color, T.darken(color, 15), 0.12, 4);

  // Car roof edges
  T.rect(ctx, roofX, y, roofW, 1, T.lighten(color, 30));
  T.rect(ctx, roofX, y, 1, 8, T.lighten(color, 20));

  // Windows (dark blue glass)
  T.rect(ctx, roofX + 2, y + 1, 5, 5, P.dark_blue);
  T.rect(ctx, roofX + 9, y + 1, 5, 5, P.dark_blue);
  T.pixel(ctx, roofX + 2, y + 1, P.light_blue);
  T.pixel(ctx, roofX + 9, y + 1, P.light_blue);

  // Headlights
  T.pixel(ctx, x, y + 9, P.yellow);
  T.pixel(ctx, x, y + 11, P.yellow);

  // Taillights
  T.pixel(ctx, x + cw - 1, y + 9, P.red);
  T.pixel(ctx, x + cw - 1, y + 11, P.red);

  // Wheels (black circles)
  T.rect(ctx, x + 2, y + ch - 3, 5, 4, P.black);
  T.rect(ctx, x + 3, y + ch - 2, 3, 2, P.dark_gray);
  T.rect(ctx, x + cw - 7, y + ch - 3, 5, 4, P.black);
  T.rect(ctx, x + cw - 6, y + ch - 2, 3, 2, P.dark_gray);

  // Car body highlights
  T.rect(ctx, x, y + 6, cw, 1, T.lighten(color, 30));
  T.rect(ctx, x, y + 6, 1, ch - 6, T.lighten(color, 20));

  // Car body shadows
  T.rect(ctx, x + cw - 1, y + 6, 1, ch - 6, T.darken(color, 30));
  T.rect(ctx, x, y + ch - 1, cw, 1, T.darken(color, 30));
}

function _drawLamppost(ctx, P, x, y) {
  // Pole
  T.rect(ctx, x, y, 2, 48, P.dark_gray);
  T.rect(ctx, x, y, 1, 48, P.gray);

  // Base
  T.rect(ctx, x - 2, y + 46, 6, 4, P.dark_gray);
  T.rect(ctx, x - 2, y + 46, 6, 1, P.gray);

  // Lamp head
  T.rect(ctx, x - 4, y - 6, 10, 6, P.dark_gray);
  T.rect(ctx, x - 3, y - 5, 8, 4, P.gray);

  // Bulb housing
  T.rect(ctx, x - 2, y - 4, 6, 3, P.yellow);
  T.dither(ctx, x - 2, y - 4, 6, 3, P.yellow, P.white, 0.2, 4);
}

function _drawChainFence(ctx, P, x, y, w, h) {
  // Fence posts
  for (let px = x; px <= x + w; px += 12) {
    T.rect(ctx, px, y, 2, h, P.gray);
    T.rect(ctx, px, y, 1, h, P.light_gray);
  }

  // Horizontal support bars
  T.rect(ctx, x, y + 2, w, 1, P.gray);
  T.rect(ctx, x, y + h - 3, w, 1, P.gray);
  T.rect(ctx, x, y + Math.floor(h / 2), w, 1, P.gray);

  // Chain-link diamond pattern
  for (let fy = y + 4; fy < y + h - 4; fy += 4) {
    for (let fx = x; fx < x + w; fx += 4) {
      const offset = ((fy - y) / 4) % 2 === 0 ? 0 : 2;
      T.pixel(ctx, fx + offset, fy, P.light_gray);
      T.pixel(ctx, fx + offset + 1, fy + 1, P.light_gray);
      T.pixel(ctx, fx + offset, fy + 2, P.light_gray);
    }
  }
}

function _drawDumpster(ctx, P, x, y) {
  const dw = 20;
  const dh = 14;

  // Dumpster body
  T.rect(ctx, x, y, dw, dh, P.green);
  T.dither(ctx, x, y, dw, dh, P.green, P.dark_gray, 0.15, 4);

  // Dumpster edges
  T.rect(ctx, x, y, dw, 1, T.lighten(P.green, 30));
  T.rect(ctx, x, y, 1, dh, T.lighten(P.green, 20));
  T.rect(ctx, x + dw - 1, y, 1, dh, T.darken(P.green, 30));
  T.rect(ctx, x, y + dh - 1, dw, 1, T.darken(P.green, 30));

  // Lid
  T.rect(ctx, x, y - 2, dw, 2, P.dark_gray);
  T.rect(ctx, x, y - 2, dw, 1, P.gray);

  // Wheels underneath
  T.rect(ctx, x + 2, y + dh, 3, 2, P.black);
  T.rect(ctx, x + dw - 5, y + dh, 3, 2, P.black);

  // Trash inside (overflowing)
  T.pixel(ctx, x + 4, y - 3, P.white);
  T.pixel(ctx, x + 7, y - 4, P.brown);
  T.pixel(ctx, x + 10, y - 3, P.tan);
  T.pixel(ctx, x + 13, y - 4, P.blue);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Shopping cart, debris, signage, weeds
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Shopping cart abandoned ---
  _drawShoppingCart(ctx, P, 125, 114);

  // --- Debris on ground ---
  // Paper bag
  T.rect(ctx, 70, 118, 4, 5, P.tan);
  T.dither(ctx, 70, 118, 4, 5, P.tan, P.brown, 0.2, 4);

  // Soda can
  T.rect(ctx, 190, 120, 2, 4, P.red);
  T.pixel(ctx, 190, 120, P.white);

  // Cigarette butt
  T.pixel(ctx, 155, 125, P.white);
  T.pixel(ctx, 156, 125, P.tan);

  // Plastic bag
  T.pixel(ctx, 240, 122, P.light_gray);
  T.pixel(ctx, 241, 122, P.white);
  T.pixel(ctx, 240, 123, P.white);

  // --- Weeds growing through cracks in asphalt ---
  _drawWeed(ctx, P, 18, 105);
  _drawWeed(ctx, P, 105, 128);
  _drawWeed(ctx, P, 265, 115);

  // --- Parking meter ---
  _drawParkingMeter(ctx, P, 5, 102);

  // --- Speed bump ---
  T.rect(ctx, 0, 110, 320, 3, P.yellow);
  T.rect(ctx, 0, 110, 320, 1, P.dark_yellow);
  for (let bx = 0; bx < 320; bx += 12) {
    T.rect(ctx, bx + 6, 110, 4, 3, P.black);
  }

  // --- Oil stain on pavement ---
  T.dither(ctx, 145, 95, 12, 8, P.dark_gray, P.black, 0.4, 4);

  // --- Painted curb (red — no parking) ---
  T.rect(ctx, 0, 76, 20, 1, P.red);

  // --- Security camera on building ---
  T.rect(ctx, 200, 72, 5, 3, P.dark_gray);
  T.pixel(ctx, 202, 73, P.red);

  // --- Vent on building wall ---
  T.rect(ctx, 100, 58, 12, 8, P.dark_gray);
  for (let vy = 60; vy < 66; vy += 2) {
    T.rect(ctx, 101, vy, 10, 1, P.gray);
  }

  // --- Fire hydrant ---
  _drawFireHydrant(ctx, P, 240, 72);
}

function _drawShoppingCart(ctx, P, x, y) {
  // Cart basket
  T.rect(ctx, x, y, 12, 8, P.gray);
  T.rect(ctx, x + 1, y + 1, 10, 6, P.dark_gray);

  // Cart handle
  T.rect(ctx, x + 10, y - 4, 2, 6, P.gray);

  // Wheels
  T.pixel(ctx, x + 2, y + 8, P.black);
  T.pixel(ctx, x + 9, y + 8, P.black);
}

function _drawWeed(ctx, P, x, y) {
  // Weed stem
  T.pixel(ctx, x, y, P.green);
  T.pixel(ctx, x, y - 1, P.green);
  T.pixel(ctx, x + 1, y - 2, P.green);
  T.pixel(ctx, x + 1, y - 3, P.green);

  // Leaves
  T.pixel(ctx, x - 1, y - 1, P.green);
  T.pixel(ctx, x + 2, y - 2, P.green);
}

function _drawParkingMeter(ctx, P, x, y) {
  // Pole
  T.rect(ctx, x, y, 2, 24, P.gray);
  T.rect(ctx, x, y, 1, 24, P.light_gray);

  // Meter head
  T.rect(ctx, x - 2, y - 8, 6, 8, P.dark_gray);
  T.rect(ctx, x - 1, y - 7, 4, 6, P.gray);

  // Display screen
  T.rect(ctx, x, y - 6, 2, 3, P.dark_blue);
  T.pixel(ctx, x, y - 6, P.green);

  // Coin slot
  T.pixel(ctx, x + 1, y - 3, P.black);

  // Base
  T.rect(ctx, x - 1, y + 23, 4, 2, P.dark_gray);
}

function _drawFireHydrant(ctx, P, x, y) {
  // Hydrant body
  T.rect(ctx, x, y, 6, 10, P.red);
  T.dither(ctx, x, y, 6, 10, P.red, P.dark_gray, 0.1, 4);
  T.rect(ctx, x, y, 1, 10, T.lighten(P.red, 30));

  // Top cap
  T.rect(ctx, x + 1, y - 2, 4, 2, P.dark_gray);

  // Side outlets
  T.pixel(ctx, x - 1, y + 4, P.dark_gray);
  T.pixel(ctx, x + 6, y + 4, P.dark_gray);

  // Chain (hanging from cap)
  T.pixel(ctx, x + 2, y - 1, P.light_gray);
  T.pixel(ctx, x + 3, y, P.light_gray);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Car shadows, lamppost shadows, building shadow
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  // --- Car shadows on ground ---
  const carCount = params.carCount;
  if (carCount === 'few') {
    T.scatter(ctx, 48, 102, 32, 8, P.black, 0.2);
    T.scatter(ctx, 208, 106, 32, 8, P.black, 0.2);
  } else if (carCount === 'normal') {
    T.scatter(ctx, 33, 100, 32, 8, P.black, 0.2);
    T.scatter(ctx, 93, 102, 32, 8, P.black, 0.2);
    T.scatter(ctx, 173, 104, 32, 8, P.black, 0.2);
    T.scatter(ctx, 248, 106, 32, 8, P.black, 0.2);
  } else if (carCount === 'many') {
    T.scatter(ctx, 30, 100, 32, 8, P.black, 0.2);
    T.scatter(ctx, 70, 101, 32, 8, P.black, 0.2);
    T.scatter(ctx, 110, 102, 32, 8, P.black, 0.2);
    T.scatter(ctx, 150, 103, 32, 8, P.black, 0.2);
    T.scatter(ctx, 190, 104, 32, 8, P.black, 0.2);
    T.scatter(ctx, 230, 105, 32, 8, P.black, 0.2);
    T.scatter(ctx, 270, 106, 32, 8, P.black, 0.2);
  }

  // --- Lamppost shadows ---
  const isDusk = params.timeOfDay === 'dusk';
  if (!isDusk) {
    T.scatter(ctx, 11, 126, 2, 14, P.black, 0.15);
    T.scatter(ctx, 161, 126, 2, 14, P.black, 0.15);
    T.scatter(ctx, 311, 126, 2, 14, P.black, 0.15);
  }

  // --- Dumpster shadow ---
  T.scatter(ctx, 281, 84, 20, 4, P.black, 0.18);

  // --- Shopping cart shadow ---
  T.scatter(ctx, 126, 122, 12, 3, P.black, 0.12);

  // --- Parking meter shadow ---
  T.scatter(ctx, 6, 126, 2, 8, P.black, 0.1);

  // --- Fire hydrant shadow ---
  T.scatter(ctx, 241, 82, 6, 3, P.black, 0.12);

  // --- Fence shadow on ground ---
  if (params.hasFence) {
    T.scatter(ctx, 286, 140, 34, 0, P.black, 0.15);
  }

  // --- Building shadow on curb ---
  T.scatter(ctx, 0, 77, 320, 6, P.black, 0.1);

  // --- General depth gradient on asphalt ---
  T.scatter(ctx, 0, 77, 320, 20, P.black, 0.08);
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Sunlight, sky ambience, heat shimmer (day), dusk glow
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  const isDusk = params.timeOfDay === 'dusk';

  if (isDusk) {
    // --- Dusk: warm orange/purple wash ---
    T.scatter(ctx, 0, 0, 320, 50, P.blue, 0.05);
    T.scatter(ctx, 0, 30, 320, 20, P.red, 0.03);

    // Lamppost glow halos (lights are ON at dusk)
    T.scatterCircle(ctx, 9, 72, 40, P.yellow, 0.1);
    T.scatterCircle(ctx, 9, 72, 25, P.yellow, 0.08);
    T.scatterCircle(ctx, 159, 72, 40, P.yellow, 0.1);
    T.scatterCircle(ctx, 159, 72, 25, P.yellow, 0.08);
    T.scatterCircle(ctx, 309, 72, 40, P.yellow, 0.1);
    T.scatterCircle(ctx, 309, 72, 25, P.yellow, 0.08);

    // Light pools on ground from lampposts
    T.scatterCircle(ctx, 9, 100, 50, P.yellow, 0.06);
    T.scatterCircle(ctx, 159, 100, 50, P.yellow, 0.06);
    T.scatterCircle(ctx, 309, 100, 50, P.yellow, 0.06);

    // Cool blue undertone in shadows
    T.scatter(ctx, 0, 77, 320, 63, P.dark_blue, 0.04);
  } else {
    // --- Day: bright sunlight wash ---
    T.scatter(ctx, 0, 0, 320, 140, P.yellow, 0.03);
    T.scatter(ctx, 0, 0, 320, 50, P.light_blue, 0.04);

    // Sun position (top right) — bright wash
    T.scatterCircle(ctx, 280, 20, 60, P.yellow, 0.06);
    T.scatterCircle(ctx, 280, 20, 40, P.white, 0.05);

    // Sunlight on ground
    T.scatter(ctx, 0, 77, 320, 63, P.yellow, 0.04);

    // Heat shimmer effect — scattered light pixels on asphalt
    const shimmerPositions = [
      [45, 95], [88, 100], [135, 98], [178, 105], [220, 102],
      [265, 108], [302, 110], [60, 118], [115, 115], [195, 120],
      [250, 125], [38, 130], [158, 128], [285, 135],
    ];
    for (const [sx, sy] of shimmerPositions) {
      T.pixel(ctx, sx, sy, P.white);
    }
  }

  // --- Sky depth gradient ---
  T.scatter(ctx, 0, 0, 320, 10, P.white, 0.03);

  // --- Building facade lighting variation ---
  if (!isDusk) {
    T.scatter(ctx, 0, 48, 160, 29, P.yellow, 0.02);
  } else {
    T.scatter(ctx, 160, 48, 160, 29, P.blue, 0.03);
  }

  // --- Car window glints ---
  const carCount = params.carCount;
  if (carCount === 'few') {
    T.pixel(ctx, 58, 88, P.white);
    T.pixel(ctx, 218, 92, P.white);
  } else if (carCount === 'normal') {
    T.pixel(ctx, 43, 86, P.white);
    T.pixel(ctx, 103, 88, P.white);
    T.pixel(ctx, 183, 90, P.white);
    T.pixel(ctx, 258, 92, P.white);
  } else if (carCount === 'many') {
    T.pixel(ctx, 40, 86, P.white);
    T.pixel(ctx, 80, 87, P.white);
    T.pixel(ctx, 120, 88, P.white);
    T.pixel(ctx, 160, 89, P.white);
    T.pixel(ctx, 200, 90, P.white);
    T.pixel(ctx, 240, 91, P.white);
    T.pixel(ctx, 280, 92, P.white);
  }

  // --- Vignette darkening at edges ---
  T.scatter(ctx, 0, 0, 15, 15, P.black, 0.04);
  T.scatter(ctx, 305, 0, 15, 15, P.black, 0.04);
  T.scatter(ctx, 0, 125, 15, 15, P.black, 0.04);
  T.scatter(ctx, 305, 125, 15, 15, P.black, 0.04);

  // --- Fence atmospheric depth ---
  if (params.hasFence) {
    T.scatter(ctx, 285, 62, 35, 78, P.light_gray, 0.02);
  }

  // --- Dust/pollen particles in air (day only) ---
  if (!isDusk) {
    const airParticles = [
      [25, 60], [80, 55], [120, 62], [170, 58], [210, 65],
      [260, 60], [295, 63], [55, 85], [145, 80], [235, 88],
    ];
    for (const [px, py] of airParticles) {
      T.pixel(ctx, px, py, P.white);
    }
  }
}
