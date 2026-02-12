/**
 * city_street.js — Contemporary city street exterior room template.
 *
 * Generates a modern city street with sidewalk, road with lane markings,
 * buildings in background, streetlights, parked cars, fire hydrant, crosswalk.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';
import { drawSkyBands } from '../_base.js';

export const metadata = {
  id: 'contemporary/city_street',
  name: 'City Street',
  setting: 'contemporary',
  category: 'exterior',
  palette: 'city_day',
  params: {
    timeOfDay: { type: 'enum', options: ['day', 'dusk', 'night'], default: 'day', label: 'Time of Day' },
    hasCrosswalk: { type: 'boolean', default: true, label: 'Crosswalk' },
    carCount: { type: 'enum', options: ['0', '1', '2', '3'], default: '2', label: 'Parked Cars' },
    buildingStyle: { type: 'enum', options: ['modern', 'classic'], default: 'modern', label: 'Buildings' },
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
//  Layer 1 (BASE): Sky, background buildings, road, sidewalk
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  // --- Sky with bands based on time of day ---
  const skyBands = _getSkyBands(P, params.timeOfDay);
  drawSkyBands(ctx, P, skyBands);

  // --- Sidewalk (rows 90-140) ---
  const sidewalkBase = P.concrete || P.light_gray;
  const sidewalkDark = P.gray;
  T.rect(ctx, 0, 90, 320, 50, sidewalkBase);

  // Sidewalk panel lines — large concrete slabs
  for (let x = 0; x < 320; x += 40) {
    T.rect(ctx, x, 90, 1, 50, sidewalkDark);
  }
  for (let y = 90; y < 140; y += 25) {
    T.rect(ctx, 0, y, 320, 1, sidewalkDark);
  }

  // Sidewalk texture — subtle dither
  T.dither(ctx, 0, 90, 320, 50, sidewalkBase, sidewalkDark, 0.06, 4);

  // --- Road (rows 60-90) ---
  const roadBase = P.dark_gray;
  const roadLight = P.gray;
  T.rect(ctx, 0, 60, 320, 30, roadBase);
  T.dither(ctx, 0, 60, 320, 30, roadBase, P.black, 0.08, 4);

  // Center lane marking — dashed yellow line
  const laneY = 74;
  for (let x = 0; x < 320; x += 16) {
    T.rect(ctx, x, laneY, 10, 2, P.yellow);
  }

  // Road edge lines — white
  T.rect(ctx, 0, 60, 320, 1, P.white);
  T.rect(ctx, 0, 89, 320, 1, P.white);

  // --- Background city buildings (rows 25-60) ---
  _drawBackgroundBuildings(ctx, P, params);
}

function _getSkyBands(P, timeOfDay) {
  if (timeOfDay === 'night') {
    return [
      { y: 0, h: 15, color: P.dark_blue },
      { y: 15, h: 10, color: P.blue },
      { y: 25, h: 35, color: P.dark_blue },
    ];
  } else if (timeOfDay === 'dusk') {
    return [
      { y: 0, h: 12, color: P.dark_blue },
      { y: 12, h: 10, color: P.blue },
      { y: 22, h: 12, color: P.light_blue },
      { y: 34, h: 10, color: P.tan },
      { y: 44, h: 16, color: P.blue },
    ];
  } else {
    return [
      { y: 0, h: 20, color: P.light_blue },
      { y: 20, h: 15, color: P.blue },
      { y: 35, h: 25, color: P.light_blue },
    ];
  }
}

function _drawBackgroundBuildings(ctx, P, params) {
  const buildingBase = (params.buildingStyle === 'classic') ? P.brown : P.gray;
  const buildingLight = P.light_gray;
  const buildingDark = P.dark_gray;

  // Building 1 — Left tall modern
  T.rect(ctx, 10, 28, 35, 32, buildingDark);
  T.rect(ctx, 11, 29, 33, 30, buildingBase);

  // Windows — grid pattern
  for (let wx = 13; wx < 42; wx += 6) {
    for (let wy = 32; wy < 58; wy += 5) {
      T.rect(ctx, wx, wy, 3, 3, P.dark_blue);
      if ((wx + wy) % 11 === 0) {
        T.pixel(ctx, wx + 1, wy + 1, P.yellow); // Lit window
      }
    }
  }

  // Building 2 — Center shorter
  T.rect(ctx, 60, 38, 40, 22, buildingLight);
  T.rect(ctx, 61, 39, 38, 20, buildingBase);

  for (let wx = 64; wx < 96; wx += 7) {
    for (let wy = 42; wy < 58; wy += 5) {
      T.rect(ctx, wx, wy, 4, 3, P.dark_blue);
      if ((wx + wy) % 13 === 0) {
        T.pixel(ctx, wx + 1, wy + 1, P.yellow);
      }
    }
  }

  // Building 3 — Right medium with rooftop detail
  T.rect(ctx, 115, 32, 45, 28, buildingDark);
  T.rect(ctx, 116, 33, 43, 26, buildingLight);

  for (let wx = 119; wx < 156; wx += 6) {
    for (let wy = 36; wy < 58; wy += 5) {
      T.rect(ctx, wx, wy, 3, 3, P.dark_blue);
      if ((wx + wy) % 17 === 0) {
        T.pixel(ctx, wx + 1, wy + 1, P.yellow);
      }
    }
  }

  // Rooftop water tower
  T.rect(ctx, 128, 26, 8, 6, P.dark_gray);
  T.rect(ctx, 127, 25, 10, 1, P.gray);

  // Building 4 — Far right tall
  T.rect(ctx, 175, 25, 38, 35, buildingBase);
  T.rect(ctx, 176, 26, 36, 33, buildingLight);

  for (let wx = 179; wx < 209; wx += 6) {
    for (let wy = 30; wy < 58; wy += 5) {
      T.rect(ctx, wx, wy, 3, 3, P.dark_blue);
      if ((wx + wy) % 19 === 0) {
        T.pixel(ctx, wx + 1, wy + 1, P.yellow);
      }
    }
  }

  // Building 5 — Far left edge partial
  T.rect(ctx, 220, 35, 100, 25, buildingDark);
  T.rect(ctx, 221, 36, 99, 23, buildingBase);

  for (let wx = 224; wx < 316; wx += 7) {
    for (let wy = 40; wy < 58; wy += 5) {
      T.rect(ctx, wx, wy, 4, 3, P.dark_blue);
      if ((wx + wy) % 23 === 0) {
        T.pixel(ctx, wx + 1, wy + 1, P.yellow);
      }
    }
  }
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Parked cars, streetlights, fire hydrant, trash can
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- Crosswalk stripes ---
  if (params.hasCrosswalk) {
    _drawCrosswalk(ctx, P);
  }

  // --- Parked cars ---
  const carCount = parseInt(params.carCount);
  const carPositions = [
    { x: 20, y: 96, color: P.red },
    { x: 90, y: 96, color: P.blue },
    { x: 240, y: 96, color: P.dark_gray },
  ];

  for (let i = 0; i < carCount; i++) {
    const car = carPositions[i];
    _drawParkedCar(ctx, P, car.x, car.y, car.color);
  }

  // --- Streetlights ---
  _drawStreetlight(ctx, P, 160, 92, params.timeOfDay);
  _drawStreetlight(ctx, P, 280, 92, params.timeOfDay);

  // --- Fire hydrant ---
  _drawFireHydrant(ctx, P, 200, 110);

  // --- Trash can ---
  _drawTrashCan(ctx, P, 45, 112);
}

function _drawCrosswalk(ctx, P) {
  const stripeW = 10;
  const stripeH = 30;
  const startY = 60;
  const centerX = 155;

  for (let i = 0; i < 8; i++) {
    const sx = centerX - 40 + i * 11;
    T.rect(ctx, sx, startY, stripeW, stripeH, P.white);
    T.dither(ctx, sx, startY, stripeW, stripeH, P.white, P.light_gray, 0.15, 4);
  }
}

function _drawParkedCar(ctx, P, x, y, bodyColor) {
  // Car body — simple side view
  T.rect(ctx, x, y + 8, 30, 10, bodyColor);
  T.dither(ctx, x, y + 8, 30, 10, bodyColor, T.darken(bodyColor, 20), 0.1, 4);

  // Car roof
  T.rect(ctx, x + 6, y + 2, 18, 6, bodyColor);
  T.dither(ctx, x + 6, y + 2, 18, 6, bodyColor, T.darken(bodyColor, 20), 0.1, 4);

  // Roof highlight
  T.rect(ctx, x + 6, y + 2, 18, 1, T.lighten(bodyColor, 30));

  // Windows — dark blue glass
  T.rect(ctx, x + 8, y + 3, 6, 4, P.dark_blue);
  T.rect(ctx, x + 16, y + 3, 6, 4, P.dark_blue);

  // Window glints
  T.pixel(ctx, x + 9, y + 3, P.light_blue);
  T.pixel(ctx, x + 17, y + 3, P.light_blue);

  // Wheels — circles approximated as rects
  T.rect(ctx, x + 4, y + 16, 5, 5, P.black);
  T.rect(ctx, x + 5, y + 17, 3, 3, P.dark_gray);
  T.rect(ctx, x + 21, y + 16, 5, 5, P.black);
  T.rect(ctx, x + 22, y + 17, 3, 3, P.dark_gray);

  // Headlight
  T.pixel(ctx, x + 29, y + 12, P.yellow);

  // Door line
  T.line(ctx, x + 15, y + 8, x + 15, y + 17, T.darken(bodyColor, 30));
}

function _drawStreetlight(ctx, P, x, y, timeOfDay) {
  // Pole
  T.rect(ctx, x, y, 2, 48, P.dark_gray);
  T.rect(ctx, x, y, 1, 48, P.gray); // Highlight edge

  // Base
  T.rect(ctx, x - 2, y + 46, 6, 4, P.dark_gray);

  // Top fixture housing
  T.rect(ctx, x - 4, y - 6, 10, 6, P.dark_gray);
  T.rect(ctx, x - 3, y - 5, 8, 4, P.gray);

  // Light bulb glow
  if (timeOfDay === 'night' || timeOfDay === 'dusk') {
    T.rect(ctx, x - 2, y - 4, 6, 3, P.yellow);
    T.pixel(ctx, x, y - 3, P.white);
  } else {
    T.rect(ctx, x - 2, y - 4, 6, 3, P.light_gray);
  }

  // Arm connecting to pole
  T.rect(ctx, x - 4, y - 2, 6, 2, P.dark_gray);
}

function _drawFireHydrant(ctx, P, x, y) {
  // Main body
  T.rect(ctx, x, y + 4, 8, 10, P.red);
  T.dither(ctx, x, y + 4, 8, 10, P.red, P.dark_red, 0.15, 4);

  // Top cap
  T.rect(ctx, x - 1, y + 2, 10, 2, P.red);
  T.rect(ctx, x, y, 8, 2, P.dark_red);

  // Side nozzles
  T.rect(ctx, x - 2, y + 7, 3, 3, P.dark_gray);
  T.rect(ctx, x + 7, y + 7, 3, 3, P.dark_gray);
  T.pixel(ctx, x - 1, y + 8, P.gray);
  T.pixel(ctx, x + 8, y + 8, P.gray);

  // Base plate
  T.rect(ctx, x - 1, y + 14, 10, 2, P.dark_gray);

  // Highlight on body
  T.rect(ctx, x + 1, y + 5, 1, 8, T.lighten(P.red, 40));
}

function _drawTrashCan(ctx, P, x, y) {
  // Can body — trapezoid shape
  T.polygonFill(ctx, [
    [x + 2, y], [x + 12, y], [x + 14, y + 16], [x, y + 16],
  ], P.dark_gray);

  // Lid
  T.rect(ctx, x, y - 2, 14, 2, P.gray);
  T.rect(ctx, x + 1, y - 3, 12, 1, P.dark_gray);

  // Handle on lid
  T.pixel(ctx, x + 6, y - 3, P.light_gray);
  T.pixel(ctx, x + 7, y - 3, P.light_gray);

  // Body highlight edge
  T.line(ctx, x + 3, y, x + 1, y + 16, P.gray);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Stop sign, parking meter, mailbox, storefront signs
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Parking meter ---
  _drawParkingMeter(ctx, P, 70, 105);

  // --- Mailbox ---
  _drawMailbox(ctx, P, 140, 108);

  // --- Stop sign (distant background) ---
  _drawStopSign(ctx, P, 250, 68);

  // --- Storefront awning (building 2) ---
  T.rect(ctx, 62, 58, 36, 3, P.red);
  T.dither(ctx, 62, 58, 36, 3, P.red, P.dark_red, 0.2, 4);
  // Awning support rods
  T.line(ctx, 64, 58, 64, 60, P.dark_gray);
  T.line(ctx, 95, 58, 95, 60, P.dark_gray);

  // --- Newspaper stand ---
  _drawNewspaperStand(ctx, P, 180, 115);

  // --- Sidewalk cracks ---
  T.line(ctx, 15, 95, 22, 110, P.dark_gray);
  T.line(ctx, 108, 100, 115, 125, P.dark_gray);
  T.line(ctx, 195, 98, 200, 115, P.dark_gray);

  // --- Manhole cover on road ---
  T.ellipse(ctx, 130, 76, 6, 4, P.gray);
  T.ellipse(ctx, 130, 76, 4, 2, P.dark_gray);
  T.pixel(ctx, 129, 75, P.gray);
  T.pixel(ctx, 131, 77, P.gray);

  // --- Curb detail ---
  T.rect(ctx, 0, 89, 320, 1, P.light_gray);

  // --- Fire hydrant shadow detail ---
  T.pixel(ctx, 201, 116, P.dark_gray);
  T.pixel(ctx, 206, 116, P.dark_gray);

  // --- Litter (crushed can) ---
  T.pixel(ctx, 125, 120, P.gray);
  T.pixel(ctx, 126, 120, P.light_gray);
}

function _drawParkingMeter(ctx, P, x, y) {
  // Pole
  T.rect(ctx, x, y + 2, 2, 18, P.dark_gray);

  // Meter head
  T.rect(ctx, x - 2, y, 6, 4, P.gray);
  T.rect(ctx, x - 1, y + 1, 4, 2, P.light_gray);

  // Digital display
  T.pixel(ctx, x, y + 1, P.red);
  T.pixel(ctx, x + 1, y + 1, P.red);

  // Coin slot
  T.pixel(ctx, x + 1, y + 3, P.black);
}

function _drawMailbox(ctx, P, x, y) {
  // Body — blue USPS box
  T.rect(ctx, x, y + 4, 10, 14, P.blue);
  T.dither(ctx, x, y + 4, 10, 14, P.blue, P.dark_blue, 0.12, 4);

  // Top rounded section — approximated
  T.rect(ctx, x, y + 2, 10, 2, P.blue);
  T.rect(ctx, x + 1, y + 1, 8, 1, P.blue);
  T.rect(ctx, x + 2, y, 6, 1, P.blue);

  // Mail slot
  T.rect(ctx, x + 2, y + 8, 6, 2, P.black);

  // Handle
  T.rect(ctx, x + 9, y + 10, 1, 4, P.dark_gray);

  // USPS logo area (white rectangle)
  T.rect(ctx, x + 2, y + 12, 6, 3, P.white);

  // Post
  T.rect(ctx, x + 4, y + 18, 2, 12, P.dark_gray);
  T.rect(ctx, x + 3, y + 28, 4, 2, P.dark_gray);
}

function _drawStopSign(ctx, P, x, y) {
  // Octagon approximated as rectangle
  T.rect(ctx, x, y + 1, 8, 6, P.red);
  T.rect(ctx, x + 1, y, 6, 8, P.red);

  // White border
  T.rect(ctx, x + 1, y + 1, 6, 1, P.white);
  T.rect(ctx, x + 1, y + 6, 6, 1, P.white);
  T.rect(ctx, x + 1, y + 1, 1, 6, P.white);
  T.rect(ctx, x + 6, y + 1, 1, 6, P.white);

  // STOP letters (simplified)
  T.pixel(ctx, x + 2, y + 3, P.white);
  T.pixel(ctx, x + 5, y + 3, P.white);

  // Post
  T.rect(ctx, x + 3, y + 8, 2, 15, P.dark_gray);
}

function _drawNewspaperStand(ctx, P, x, y) {
  // Box body
  T.rect(ctx, x, y + 4, 14, 12, P.dark_blue);
  T.rect(ctx, x + 1, y + 5, 12, 10, P.blue);

  // Display window
  T.rect(ctx, x + 2, y + 6, 10, 6, P.light_gray);
  T.rect(ctx, x + 3, y + 7, 8, 4, P.white);

  // Headline text (abstract lines)
  T.rect(ctx, x + 4, y + 8, 6, 1, P.black);
  T.rect(ctx, x + 4, y + 9, 4, 1, P.black);

  // Coin slot
  T.rect(ctx, x + 6, y + 13, 2, 1, P.black);

  // Legs
  T.rect(ctx, x + 2, y + 16, 2, 9, P.dark_gray);
  T.rect(ctx, x + 10, y + 16, 2, 9, P.dark_gray);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Shadows from cars, streetlights, buildings
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  const carCount = parseInt(params.carCount);
  const carPositions = [20, 90, 240];

  // --- Car shadows on sidewalk ---
  for (let i = 0; i < carCount; i++) {
    const cx = carPositions[i];
    T.scatter(ctx, cx + 32, 96, 12, 18, P.black, 0.18);
  }

  // --- Streetlight shadows ---
  T.scatter(ctx, 162, 92, 3, 48, P.black, 0.12);
  T.scatter(ctx, 282, 92, 3, 48, P.black, 0.12);

  // --- Fire hydrant shadow ---
  T.scatter(ctx, 208, 110, 6, 8, P.black, 0.15);

  // --- Trash can shadow ---
  T.scatter(ctx, 59, 112, 8, 12, P.black, 0.14);

  // --- Parking meter shadow ---
  T.scatter(ctx, 72, 105, 2, 20, P.black, 0.1);

  // --- Mailbox shadow ---
  T.scatter(ctx, 150, 108, 6, 22, P.black, 0.13);

  // --- Newspaper stand shadow ---
  T.scatter(ctx, 194, 115, 8, 10, P.black, 0.11);

  // --- Building shadows on sidewalk (distant) ---
  T.scatter(ctx, 0, 90, 50, 8, P.black, 0.08);
  T.scatter(ctx, 110, 90, 60, 8, P.black, 0.08);
  T.scatter(ctx, 220, 90, 100, 8, P.black, 0.08);

  // --- Road tire marks ---
  T.scatter(ctx, 25, 70, 20, 2, P.black, 0.2);
  T.scatter(ctx, 95, 72, 18, 2, P.black, 0.2);

  // --- Crosswalk shadow (if present) ---
  if (params.hasCrosswalk) {
    T.scatter(ctx, 115, 60, 90, 2, P.black, 0.1);
  }
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Time-of-day lighting, dust, ambient wash
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  if (params.timeOfDay === 'night') {
    // --- Night: cool blue wash, streetlight pools ---
    T.scatter(ctx, 0, 0, 320, 140, P.dark_blue, 0.3);

    // Streetlight pools of yellow light
    T.scatterCircle(ctx, 160, 92, 40, P.yellow, 0.15);
    T.scatterCircle(ctx, 160, 92, 25, P.yellow, 0.1);
    T.scatterCircle(ctx, 280, 92, 40, P.yellow, 0.15);
    T.scatterCircle(ctx, 280, 92, 25, P.yellow, 0.1);

    // Window lights glowing
    T.scatter(ctx, 10, 28, 35, 32, P.yellow, 0.03);
    T.scatter(ctx, 60, 38, 40, 22, P.yellow, 0.03);
    T.scatter(ctx, 115, 32, 45, 28, P.yellow, 0.03);

    // Stars in sky
    T.pixel(ctx, 25, 5, P.white);
    T.pixel(ctx, 45, 8, P.white);
    T.pixel(ctx, 78, 3, P.white);
    T.pixel(ctx, 120, 7, P.white);
    T.pixel(ctx, 155, 4, P.white);
    T.pixel(ctx, 190, 9, P.white);
    T.pixel(ctx, 230, 6, P.white);
    T.pixel(ctx, 270, 8, P.white);
    T.pixel(ctx, 300, 5, P.white);

  } else if (params.timeOfDay === 'dusk') {
    // --- Dusk: warm orange/pink wash ---
    T.scatter(ctx, 0, 0, 320, 60, P.tan, 0.12);
    T.scatter(ctx, 0, 30, 320, 30, P.yellow, 0.06);
    T.scatter(ctx, 0, 60, 320, 80, P.dark_blue, 0.08);

    // Streetlight starting to glow
    T.scatterCircle(ctx, 160, 92, 30, P.yellow, 0.08);
    T.scatterCircle(ctx, 280, 92, 30, P.yellow, 0.08);

    // Building windows lighting up
    T.scatter(ctx, 10, 28, 35, 32, P.yellow, 0.04);
    T.scatter(ctx, 60, 38, 40, 22, P.yellow, 0.04);

  } else {
    // --- Day: warm ambient wash, subtle dust particles ---
    T.scatter(ctx, 0, 0, 320, 140, P.tan, 0.02);

    // Sun haze in upper sky
    T.scatterCircle(ctx, 280, 15, 50, P.yellow, 0.04);
    T.scatterCircle(ctx, 280, 15, 30, P.white, 0.02);

    // Dust particles floating in air
    const dustPositions = [
      [35, 45], [80, 38], [125, 52], [170, 41], [210, 48],
      [255, 55], [50, 70], [140, 68], [220, 72], [290, 65],
    ];
    for (const [dx, dy] of dustPositions) {
      T.pixel(ctx, dx, dy, P.white);
    }

    // Heat shimmer above road
    T.scatter(ctx, 0, 60, 320, 5, P.white, 0.02);
  }

  // --- General depth vignette ---
  T.scatter(ctx, 0, 0, 15, 140, P.black, 0.03);
  T.scatter(ctx, 305, 0, 15, 140, P.black, 0.03);
  T.scatter(ctx, 0, 125, 320, 15, P.black, 0.03);
}
