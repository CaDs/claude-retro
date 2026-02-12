/**
 * apartment.js — Contemporary apartment interior room template.
 *
 * Generates a modern apartment living space with optional window,
 * couch, kitchenette, bookshelf, and warm natural lighting.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'contemporary/apartment',
  name: 'Apartment',
  setting: 'contemporary',
  category: 'interior',
  palette: 'apartment_neutral',
  params: {
    hasWindow: { type: 'boolean', default: true, label: 'Window' },
    hasCouch: { type: 'boolean', default: true, label: 'Couch' },
    hasKitchenette: { type: 'boolean', default: false, label: 'Kitchenette' },
    wallColor: { type: 'enum', options: ['white', 'beige', 'blue'], default: 'beige', label: 'Wall Color' },
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
//  Layer 1 (BASE): Ceiling, walls, hardwood floor
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  // Resolve wall color from param
  const wallColors = {
    white: P.white,
    beige: P.beige,
    blue: P.light_blue,
  };
  const wallMain = wallColors[params.wallColor] || P.beige;
  const wallDark = T.darken(wallMain, 15);

  // --- Ceiling (rows 0-15) ---
  T.rect(ctx, 0, 0, 320, 16, P.white);
  // Subtle ceiling texture
  T.dither(ctx, 0, 0, 320, 16, P.white, P.light_gray, 0.05, 4);
  // Crown molding at bottom of ceiling
  T.rect(ctx, 0, 14, 320, 1, P.light_gray);
  T.rect(ctx, 0, 15, 320, 1, P.beige);

  // --- Walls (rows 16-75) ---
  T.rect(ctx, 0, 16, 320, 60, wallMain);
  // Very subtle wall texture for plaster effect
  T.dither(ctx, 0, 16, 320, 60, wallMain, wallDark, 0.04, 4);

  // Baseboard at bottom of wall
  T.rect(ctx, 0, 73, 320, 1, P.light_gray);
  T.rect(ctx, 0, 74, 320, 1, P.white);
  T.rect(ctx, 0, 75, 320, 1, P.light_gray);

  // --- Hardwood floor (rows 76-140) ---
  const floorBase = P.brown;
  const floorDark = P.dark_brown;
  const floorLight = P.tan;
  T.rect(ctx, 0, 76, 320, 64, floorBase);

  // Plank lines — horizontal
  const plankH = 8;
  for (let row = 0; row < 8; row++) {
    const py = 76 + row * plankH;

    // Top highlight of each plank
    T.rect(ctx, 0, py, 320, 1, floorLight);
    // Bottom dark edge of each plank
    T.rect(ctx, 0, py + plankH - 1, 320, 1, floorDark);

    // Plank seam vertical lines — staggered per row
    const offset = (row % 2 === 0) ? 0 : 30;
    for (let sx = offset; sx < 320; sx += 60) {
      T.rect(ctx, sx, py, 1, plankH, floorDark);
    }

    // Wood grain detail lines
    const grainY1 = py + 2 + (row * 3) % 4;
    const grainY2 = py + 4 + (row * 5) % 3;
    if (grainY1 < py + plankH - 1) {
      T.line(ctx, (row * 17) % 40, grainY1, 320 - (row * 11) % 30, grainY1, floorDark);
    }
    if (grainY2 < py + plankH - 1 && grainY2 !== grainY1) {
      T.line(ctx, (row * 23) % 50, grainY2, 320 - (row * 7) % 35, grainY2, floorDark);
    }
  }

  // Dither subtle variation across entire floor
  T.dither(ctx, 0, 76, 320, 64, floorBase, floorDark, 0.08, 4);
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Window, couch, kitchenette, door, bookshelf
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- Door frame (right side) ---
  _drawDoorFrame(ctx, P);

  // --- Bookshelf (always present, right of center) ---
  _drawBookshelf(ctx, P);

  // --- Window with curtains ---
  if (params.hasWindow) {
    _drawWindow(ctx, P);
  }

  // --- Couch ---
  if (params.hasCouch) {
    _drawCouch(ctx, P);
  }

  // --- Kitchenette ---
  if (params.hasKitchenette) {
    _drawKitchenette(ctx, P);
  }
}

function _drawWindow(ctx, P) {
  const wx = 100, wy = 20, ww = 60, wh = 45;

  // Window frame — white/light trim
  T.rect(ctx, wx - 3, wy - 2, ww + 6, wh + 4, P.white);
  T.rect(ctx, wx - 2, wy - 1, ww + 4, wh + 2, P.light_gray);

  // Glass area — city sky view
  T.rect(ctx, wx, wy, ww, wh, P.light_blue);

  // City skyline through window
  T.ditherGradient(ctx, wx, wy, ww, 20, P.light_blue, P.blue, 'vertical');

  // Building silhouettes
  T.rect(ctx, wx + 5, wy + 22, 8, 23, P.dark_gray);
  T.rect(ctx, wx + 16, wy + 18, 10, 27, P.gray);
  T.rect(ctx, wx + 29, wy + 25, 7, 20, P.dark_gray);
  T.rect(ctx, wx + 39, wy + 15, 12, 30, P.gray);
  T.rect(ctx, wx + 52, wy + 28, 8, 17, P.dark_gray);

  // Building windows — tiny lit rectangles
  for (let bx = wx + 6; bx < wx + 12; bx += 3) {
    for (let by = wy + 24; by < wy + 42; by += 4) {
      T.pixel(ctx, bx, by, P.beige);
    }
  }
  for (let bx = wx + 17; bx < wx + 25; bx += 3) {
    for (let by = wy + 20; by < wy + 42; by += 4) {
      T.pixel(ctx, bx, by, P.beige);
    }
  }
  for (let bx = wx + 40; bx < wx + 50; bx += 3) {
    for (let by = wy + 17; by < wy + 42; by += 4) {
      T.pixel(ctx, bx, by, P.beige);
    }
  }

  // Window cross-bars
  const midX = wx + Math.floor(ww / 2);
  const midY = wy + Math.floor(wh / 2);
  T.rect(ctx, wx, midY, ww, 2, P.white);
  T.rect(ctx, midX, wy, 2, wh, P.white);

  // Window sill
  T.rect(ctx, wx - 4, wy + wh + 2, ww + 8, 3, P.white);
  T.rect(ctx, wx - 4, wy + wh + 5, ww + 8, 1, P.light_gray);

  // --- Curtains ---
  // Left curtain
  T.rect(ctx, wx - 8, wy - 4, 10, wh + 10, P.dark_brown);
  T.dither(ctx, wx - 8, wy - 4, 10, wh + 10, P.dark_brown, P.brown, 0.2, 4);
  // Curtain fold lines
  T.line(ctx, wx - 5, wy - 4, wx - 5, wy + wh + 6, P.brown);
  T.line(ctx, wx - 3, wy - 4, wx - 3, wy + wh + 6, P.dark_brown);

  // Right curtain
  T.rect(ctx, wx + ww - 2, wy - 4, 10, wh + 10, P.dark_brown);
  T.dither(ctx, wx + ww - 2, wy - 4, 10, wh + 10, P.dark_brown, P.brown, 0.2, 4);
  T.line(ctx, wx + ww + 2, wy - 4, wx + ww + 2, wy + wh + 6, P.brown);
  T.line(ctx, wx + ww + 5, wy - 4, wx + ww + 5, wy + wh + 6, P.dark_brown);

  // Curtain rod
  T.rect(ctx, wx - 12, wy - 6, ww + 24, 2, P.dark_brown);
  // Rod finials
  T.rect(ctx, wx - 14, wy - 7, 3, 4, P.dark_brown);
  T.rect(ctx, wx + ww + 11, wy - 7, 3, 4, P.dark_brown);
}

function _drawCouch(ctx, P) {
  const cx = 30, cy = 88;

  // Couch body — main cushion area
  T.rect(ctx, cx, cy, 60, 20, P.dark_gray);
  T.dither(ctx, cx, cy, 60, 20, P.dark_gray, P.gray, 0.15, 4);

  // Couch back
  T.rect(ctx, cx, cy - 12, 60, 14, P.dark_gray);
  T.dither(ctx, cx, cy - 12, 60, 14, P.dark_gray, P.black, 0.1, 4);

  // Back top edge highlight
  T.rect(ctx, cx, cy - 12, 60, 1, P.gray);

  // Seat cushions — two cushion pads
  T.rect(ctx, cx + 2, cy + 2, 26, 8, P.gray);
  T.rect(ctx, cx + 32, cy + 2, 26, 8, P.gray);
  // Cushion divider
  T.rect(ctx, cx + 29, cy + 2, 2, 8, P.dark_gray);

  // Armrests
  T.rect(ctx, cx - 4, cy - 6, 5, 26, P.dark_gray);
  T.rect(ctx, cx + 59, cy - 6, 5, 26, P.dark_gray);
  T.dither(ctx, cx - 4, cy - 6, 5, 26, P.dark_gray, P.black, 0.1, 4);
  T.dither(ctx, cx + 59, cy - 6, 5, 26, P.dark_gray, P.black, 0.1, 4);

  // Armrest tops
  T.rect(ctx, cx - 4, cy - 6, 5, 1, P.gray);
  T.rect(ctx, cx + 59, cy - 6, 5, 1, P.gray);

  // Couch legs
  T.rect(ctx, cx, cy + 18, 3, 4, P.dark_brown);
  T.rect(ctx, cx + 57, cy + 18, 3, 4, P.dark_brown);

  // Throw pillow on couch
  T.rect(ctx, cx + 6, cy - 4, 10, 8, P.red);
  T.dither(ctx, cx + 6, cy - 4, 10, 8, P.red, P.dark_brown, 0.15, 4);
  T.rect(ctx, cx + 6, cy - 4, 10, 1, T.lighten(P.red, 30));
}

function _drawKitchenette(ctx, P) {
  const kx = 240, ky = 36;

  // Counter base
  T.rect(ctx, kx, ky + 24, 70, 40, P.dark_brown);
  T.dither(ctx, kx, ky + 24, 70, 40, P.dark_brown, P.brown, 0.15, 4);

  // Counter top surface
  T.rect(ctx, kx - 1, ky + 22, 72, 3, P.gray);
  T.rect(ctx, kx - 1, ky + 22, 72, 1, P.light_gray);

  // Cabinet doors on counter
  for (let i = 0; i < 3; i++) {
    const dx = kx + 4 + i * 22;
    T.rect(ctx, dx, ky + 28, 18, 16, P.brown);
    T.rect(ctx, dx + 1, ky + 29, 16, 14, P.dark_brown);
    // Cabinet handle
    T.rect(ctx, dx + 8, ky + 35, 3, 1, P.light_gray);
  }

  // Upper cabinets
  T.rect(ctx, kx, ky - 2, 70, 20, P.brown);
  T.dither(ctx, kx, ky - 2, 70, 20, P.brown, P.dark_brown, 0.12, 4);

  // Upper cabinet doors
  for (let i = 0; i < 3; i++) {
    const dx = kx + 3 + i * 22;
    T.rect(ctx, dx, ky, 18, 16, P.tan);
    T.rect(ctx, dx + 1, ky + 1, 16, 14, P.brown);
    // Handle
    T.rect(ctx, dx + 7, ky + 8, 4, 1, P.light_gray);
  }

  // Backsplash tile area
  T.rect(ctx, kx, ky + 18, 70, 5, P.white);
  // Tile grid
  for (let tx = kx; tx < kx + 70; tx += 8) {
    T.rect(ctx, tx, ky + 18, 1, 5, P.light_gray);
  }

  // Sink
  T.rect(ctx, kx + 28, ky + 22, 14, 3, P.dark_gray);
  T.rect(ctx, kx + 29, ky + 22, 12, 2, P.dark_blue);
  // Faucet
  T.rect(ctx, kx + 34, ky + 18, 2, 4, P.light_gray);
  T.rect(ctx, kx + 33, ky + 18, 4, 1, P.light_gray);
}

function _drawBookshelf(ctx, P) {
  const bx = 200, by = 28, bw = 30, bh = 48;

  // Shelf frame
  T.rect(ctx, bx, by, bw, bh, P.dark_brown);
  T.dither(ctx, bx, by, bw, bh, P.dark_brown, P.brown, 0.12, 4);

  // Shelf dividers (horizontal)
  const shelfCount = 4;
  const shelfH = Math.floor(bh / shelfCount);
  for (let s = 0; s <= shelfCount; s++) {
    const sy = by + s * shelfH;
    T.rect(ctx, bx, sy, bw, 2, P.brown);
  }

  // Books on shelves — varied colors and widths
  const bookColors = [P.red, P.dark_blue, P.green, P.dark_brown, P.tan, P.blue, P.dark_gray];
  for (let s = 0; s < shelfCount; s++) {
    const shelfTop = by + s * shelfH + 2;
    const bookH = shelfH - 3;
    let bookX = bx + 2;
    let colorIdx = s * 3;

    while (bookX < bx + bw - 4) {
      const bookW = 2 + (colorIdx * 7) % 4;
      if (bookX + bookW > bx + bw - 2) break;
      const color = bookColors[colorIdx % bookColors.length];
      T.rect(ctx, bookX, shelfTop, bookW, bookH, color);
      // Book spine highlight
      T.pixel(ctx, bookX, shelfTop, T.lighten(color, 40));
      bookX += bookW + 1;
      colorIdx++;
    }
  }
}

function _drawDoorFrame(ctx, P) {
  const dx = 285, dy = 24, dw = 22, dh = 52;

  // Door frame
  T.rect(ctx, dx - 2, dy, dw + 4, dh, P.white);
  T.rect(ctx, dx - 1, dy + 1, dw + 2, dh - 1, P.light_gray);

  // Door panel
  T.rect(ctx, dx, dy + 1, dw, dh - 1, P.beige);
  T.dither(ctx, dx, dy + 1, dw, dh - 1, P.beige, P.tan, 0.08, 4);

  // Panel grooves — upper and lower
  T.rect(ctx, dx + 3, dy + 4, dw - 6, 16, P.tan);
  T.rect(ctx, dx + 4, dy + 5, dw - 8, 14, P.beige);
  T.rect(ctx, dx + 3, dy + 26, dw - 6, 20, P.tan);
  T.rect(ctx, dx + 4, dy + 27, dw - 8, 18, P.beige);

  // Door handle
  T.rect(ctx, dx + dw - 5, dy + 28, 2, 4, P.light_gray);
  T.pixel(ctx, dx + dw - 5, dy + 29, P.white);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Picture, plant, lamp, rug, clock
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Framed picture on wall ---
  _drawFramedPicture(ctx, P, 55, 28, 22, 16);

  // --- Potted plant ---
  _drawPottedPlant(ctx, P, 185, 62);

  // --- Floor lamp ---
  _drawFloorLamp(ctx, P, 96, 56);

  // --- Area rug on floor ---
  _drawRug(ctx, P);

  // --- Wall clock ---
  _drawClock(ctx, P, 150, 24);

  // --- Electrical outlet on wall ---
  T.rect(ctx, 18, 60, 4, 6, P.white);
  T.pixel(ctx, 19, 62, P.dark_gray);
  T.pixel(ctx, 21, 62, P.dark_gray);
  T.pixel(ctx, 20, 64, P.dark_gray);

  // --- Light switch near door ---
  T.rect(ctx, 275, 42, 4, 6, P.white);
  T.rect(ctx, 276, 44, 2, 2, P.light_gray);

  // --- Small side table next to couch ---
  if (params.hasCouch) {
    T.rect(ctx, 94, 90, 14, 2, P.dark_brown);
    T.rect(ctx, 96, 92, 2, 16, P.dark_brown);
    T.rect(ctx, 104, 92, 2, 16, P.dark_brown);
    // Coffee mug on table
    T.rect(ctx, 98, 87, 5, 4, P.white);
    T.rect(ctx, 99, 88, 3, 2, P.dark_brown); // coffee inside
    T.pixel(ctx, 103, 89, P.white); // handle
  }

  // --- Window sill plant (if window present) ---
  if (params.hasWindow) {
    T.rect(ctx, 122, 62, 6, 5, P.dark_brown); // small pot
    T.pixel(ctx, 124, 60, P.green);
    T.pixel(ctx, 125, 59, P.green);
    T.pixel(ctx, 126, 60, P.green);
    T.pixel(ctx, 124, 58, P.green);
  }

  // --- Coat hooks near door ---
  T.pixel(ctx, 278, 35, P.dark_gray);
  T.pixel(ctx, 278, 36, P.dark_gray);
  T.pixel(ctx, 282, 35, P.dark_gray);
  T.pixel(ctx, 282, 36, P.dark_gray);

  // --- Floor trim details at edges ---
  // Baseboard corner shadows
  T.pixel(ctx, 0, 75, P.gray);
  T.pixel(ctx, 319, 75, P.gray);
}

function _drawFramedPicture(ctx, P, x, y, w, h) {
  // Frame
  T.rect(ctx, x, y, w, h, P.dark_brown);
  T.rect(ctx, x + 1, y + 1, w - 2, h - 2, P.brown);

  // Picture content — abstract landscape
  T.rect(ctx, x + 2, y + 2, w - 4, h - 4, P.light_blue);
  // Sky
  T.rect(ctx, x + 2, y + 2, w - 4, 5, P.blue);
  // Hills
  T.polygonFill(ctx, [
    [x + 2, y + 7], [x + 6, y + 4], [x + 10, y + 6],
    [x + 14, y + 3], [x + w - 2, y + 6], [x + w - 2, y + h - 2], [x + 2, y + h - 2],
  ], P.green);
  // Sun
  T.pixel(ctx, x + w - 5, y + 3, P.beige);
  T.pixel(ctx, x + w - 4, y + 3, P.beige);

  // Frame highlight
  T.rect(ctx, x, y, w, 1, T.lighten(P.dark_brown, 30));
}

function _drawPottedPlant(ctx, P, x, y) {
  // Pot
  T.polygonFill(ctx, [
    [x, y + 4], [x + 12, y + 4], [x + 10, y + 14], [x + 2, y + 14],
  ], P.dark_brown);
  T.rect(ctx, x - 1, y + 3, 14, 2, P.brown);

  // Soil
  T.rect(ctx, x + 1, y + 5, 10, 2, P.dark_brown);
  T.dither(ctx, x + 1, y + 5, 10, 2, P.dark_brown, P.brown, 0.3, 2);

  // Leaves — fan pattern
  T.pixel(ctx, x + 4, y - 2, P.green);
  T.pixel(ctx, x + 5, y - 3, P.green);
  T.pixel(ctx, x + 6, y - 4, P.green);
  T.pixel(ctx, x + 7, y - 3, P.green);
  T.pixel(ctx, x + 8, y - 2, P.green);
  T.pixel(ctx, x + 3, y - 1, P.green);
  T.pixel(ctx, x + 9, y - 1, P.green);
  T.pixel(ctx, x + 5, y, P.green);
  T.pixel(ctx, x + 6, y - 1, P.green);
  T.pixel(ctx, x + 7, y, P.green);
  // Stem
  T.line(ctx, x + 6, y + 1, x + 6, y + 5, P.dark_green);

  // Additional leaves
  T.pixel(ctx, x + 2, y, P.green);
  T.pixel(ctx, x + 1, y - 1, P.green);
  T.pixel(ctx, x + 10, y, P.green);
  T.pixel(ctx, x + 11, y - 1, P.green);
}

function _drawFloorLamp(ctx, P, x, y) {
  // Lamp shade — trapezoid
  T.polygonFill(ctx, [
    [x + 2, y], [x + 12, y], [x + 14, y + 8], [x, y + 8],
  ], P.beige);
  T.dither(ctx, x, y, 14, 8, P.beige, P.tan, 0.1, 4);

  // Shade rim
  T.rect(ctx, x, y + 8, 14, 1, P.dark_brown);
  T.rect(ctx, x + 2, y, 10, 1, P.dark_brown);

  // Bulb glow pixel
  T.pixel(ctx, x + 7, y + 9, P.beige);

  // Lamp pole
  T.rect(ctx, x + 6, y + 9, 2, 50, P.dark_gray);
  // Pole highlight
  T.rect(ctx, x + 6, y + 9, 1, 50, P.gray);

  // Base — circular disc
  T.rect(ctx, x + 2, y + 58, 10, 2, P.dark_gray);
  T.rect(ctx, x + 1, y + 59, 12, 2, P.dark_gray);
  T.rect(ctx, x + 2, y + 59, 10, 1, P.gray);
}

function _drawRug(ctx, P) {
  const rx = 60, ry = 108, rw = 120, rh = 24;

  // Rug base
  T.rect(ctx, rx, ry, rw, rh, P.dark_brown);
  T.dither(ctx, rx, ry, rw, rh, P.dark_brown, P.red, 0.3, 4);

  // Rug border
  T.rect(ctx, rx, ry, rw, 2, P.tan);
  T.rect(ctx, rx, ry + rh - 2, rw, 2, P.tan);
  T.rect(ctx, rx, ry, 2, rh, P.tan);
  T.rect(ctx, rx + rw - 2, ry, 2, rh, P.tan);

  // Inner border
  T.rect(ctx, rx + 4, ry + 4, rw - 8, 1, P.beige);
  T.rect(ctx, rx + 4, ry + rh - 5, rw - 8, 1, P.beige);
  T.rect(ctx, rx + 4, ry + 4, 1, rh - 8, P.beige);
  T.rect(ctx, rx + rw - 5, ry + 4, 1, rh - 8, P.beige);

  // Central pattern — simple geometric
  const cx = rx + Math.floor(rw / 2);
  const cy = ry + Math.floor(rh / 2);
  T.ellipse(ctx, cx, cy, 12, 5, P.tan);
  T.pixel(ctx, cx, cy, P.beige);
  // Diamond motifs at corners of inner border
  for (const [dx, dy] of [[rx + 8, ry + 8], [rx + rw - 9, ry + 8], [rx + 8, ry + rh - 9], [rx + rw - 9, ry + rh - 9]]) {
    T.pixel(ctx, dx, dy, P.beige);
    T.pixel(ctx, dx - 1, dy, P.tan);
    T.pixel(ctx, dx + 1, dy, P.tan);
    T.pixel(ctx, dx, dy - 1, P.tan);
    T.pixel(ctx, dx, dy + 1, P.tan);
  }
}

function _drawClock(ctx, P, x, y) {
  // Clock body — circle approximated as rect
  T.rect(ctx, x, y, 12, 12, P.dark_brown);
  T.rect(ctx, x + 1, y + 1, 10, 10, P.white);

  // Clock face — circle
  T.circle(ctx, x + 6, y + 6, 5, P.dark_brown);

  // Hour marks
  T.pixel(ctx, x + 6, y + 2, P.black);  // 12
  T.pixel(ctx, x + 10, y + 6, P.black);  // 3
  T.pixel(ctx, x + 6, y + 10, P.black);  // 6
  T.pixel(ctx, x + 2, y + 6, P.black);   // 9

  // Hands
  T.line(ctx, x + 6, y + 6, x + 6, y + 3, P.black);   // hour hand
  T.line(ctx, x + 6, y + 6, x + 9, y + 5, P.dark_gray); // minute hand

  // Center dot
  T.pixel(ctx, x + 6, y + 6, P.red);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Furniture shadows, window light
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  // --- Couch shadow on floor ---
  if (params.hasCouch) {
    T.scatter(ctx, 28, 108, 68, 8, P.black, 0.12);
  }

  // --- Bookshelf shadow on floor ---
  T.scatter(ctx, 200, 76, 32, 10, P.black, 0.1);

  // --- Door frame shadow ---
  T.scatter(ctx, 283, 76, 28, 8, P.black, 0.08);

  // --- Plant shadow ---
  T.scatter(ctx, 186, 76, 12, 4, P.black, 0.06);

  // --- Lamp shadow ---
  T.scatter(ctx, 94, 118, 16, 5, P.black, 0.08);

  // --- Window light cast on floor ---
  if (params.hasWindow) {
    // Bright rectangle of window light on the floor
    T.scatter(ctx, 90, 90, 70, 40, P.beige, 0.08);
    T.scatterCircle(ctx, 130, 105, 50, P.beige, 0.06);
    // Window cross shadow in the light patch
    T.scatter(ctx, 128, 90, 3, 40, P.dark_brown, 0.04);
    T.scatter(ctx, 90, 108, 70, 3, P.dark_brown, 0.04);
  }

  // --- Kitchenette shadows ---
  if (params.hasKitchenette) {
    T.scatter(ctx, 240, 76, 72, 6, P.black, 0.1);
    // Upper cabinet shadow on backsplash
    T.scatter(ctx, 240, 36, 70, 4, P.black, 0.08);
  }

  // --- Lamp light glow on ceiling ---
  T.scatterCircle(ctx, 103, 56, 30, P.beige, 0.06);

  // --- Rug subtle shadow at edges ---
  T.scatter(ctx, 58, 132, 124, 3, P.black, 0.06);

  // --- General depth: floor darker at far edges ---
  T.scatter(ctx, 0, 76, 20, 64, P.black, 0.06);
  T.scatter(ctx, 300, 76, 20, 64, P.black, 0.06);

  // --- Wall-ceiling junction shadow ---
  T.scatter(ctx, 0, 16, 320, 4, P.black, 0.04);

  // --- Side table shadow ---
  if (params.hasCouch) {
    T.scatter(ctx, 94, 108, 16, 4, P.black, 0.06);
  }
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Warm natural light wash
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  // --- Warm ambient wash over entire scene ---
  T.scatter(ctx, 0, 0, 320, 140, P.beige, 0.025);

  // --- Window daylight spill ---
  if (params.hasWindow) {
    // Warm light from window flooding into room
    T.scatterCircle(ctx, 130, 50, 80, P.beige, 0.04);
    // Light on nearby wall
    T.scatter(ctx, 88, 16, 80, 60, P.beige, 0.03);
    // Light shaft particles
    T.pixel(ctx, 112, 55, P.white);
    T.pixel(ctx, 118, 62, P.white);
    T.pixel(ctx, 125, 48, P.white);
    T.pixel(ctx, 135, 72, P.white);
    T.pixel(ctx, 108, 68, P.white);
  }

  // --- Lamp warm glow ---
  T.scatterCircle(ctx, 103, 64, 35, P.beige, 0.05);
  T.scatterCircle(ctx, 103, 64, 20, P.beige, 0.04);

  // --- Subtle cool shadow in corners away from light ---
  T.scatter(ctx, 0, 0, 30, 40, P.dark_blue, 0.03);
  T.scatter(ctx, 260, 0, 60, 30, P.dark_blue, 0.02);

  // --- Dust motes floating in light ---
  if (params.hasWindow) {
    const dustPositions = [
      [115, 40], [122, 55], [130, 35], [140, 60], [118, 70],
      [105, 45], [135, 50], [128, 65], [110, 58], [142, 42],
    ];
    for (const [dx, dy] of dustPositions) {
      T.pixel(ctx, dx, dy, P.white);
    }
  }

  // --- Vignette: subtle darkening at edges ---
  T.scatter(ctx, 0, 0, 20, 20, P.black, 0.04);
  T.scatter(ctx, 300, 0, 20, 20, P.black, 0.04);
  T.scatter(ctx, 0, 120, 20, 20, P.black, 0.04);
  T.scatter(ctx, 300, 120, 20, 20, P.black, 0.04);

  // --- Very subtle floor reflection shimmer ---
  for (let fx = 70; fx < 180; fx += 15) {
    T.pixel(ctx, fx, 115 + (fx % 5), P.beige);
  }
}
