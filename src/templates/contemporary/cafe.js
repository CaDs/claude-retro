/**
 * cafe.js — Contemporary cafe interior room template.
 *
 * Generates a cozy cafe with tables with chairs, counter with espresso machine,
 * menu board on wall, pendant lights, tiled floor, pastry display case.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'contemporary/cafe',
  name: 'Café',
  setting: 'contemporary',
  category: 'interior',
  palette: 'city_day',
  params: {
    windowSize: { type: 'select', options: ['small', 'large'], default: 'large' },
    tableCount: { type: 'select', options: ['few', 'many'], default: 'few' },
    hasPlants: { type: 'boolean', default: true },
    floorStyle: { type: 'select', options: ['tile', 'wood'], default: 'wood' },
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
  T.rect(ctx, 0, 0, 320, 16, P.off_white || P.white);
  T.dither(ctx, 0, 0, 320, 16, P.off_white || P.white, P.beige, 0.04, 4);

  // Ceiling trim at bottom
  T.rect(ctx, 0, 15, 320, 1, P.tan);

  // --- Walls (rows 16-70) ---
  const wallColor = P.beige;
  T.rect(ctx, 0, 16, 320, 54, wallColor);
  T.dither(ctx, 0, 16, 320, 54, wallColor, P.tan, 0.05, 4);

  // Wainscoting — lower wall panel
  T.rect(ctx, 0, 48, 320, 22, P.tan);
  T.dither(ctx, 0, 48, 320, 22, P.tan, P.brown, 0.08, 4);

  // Wainscoting top rail
  T.rect(ctx, 0, 48, 320, 1, P.brown);
  T.rect(ctx, 0, 49, 320, 1, P.tan);

  // Wainscoting vertical panels
  for (let x = 0; x < 320; x += 30) {
    T.rect(ctx, x, 50, 1, 18, P.brown);
  }

  // Baseboard
  T.rect(ctx, 0, 69, 320, 1, P.dark_brown);

  // --- Floor (rows 70-140) ---
  if (params.floorStyle === 'tile') {
    _drawTiledFloor(ctx, P);
  } else {
    _drawWoodenFloor(ctx, P);
  }
}

function _drawTiledFloor(ctx, P) {
  const tileBase = P.light_gray;
  const tileDark = P.gray;
  const tileSize = 12;

  T.rect(ctx, 0, 70, 320, 70, tileBase);

  // Checkerboard pattern
  for (let row = 0; row < Math.ceil(70 / tileSize); row++) {
    for (let col = 0; col < Math.ceil(320 / tileSize); col++) {
      const ty = 70 + row * tileSize;
      const tx = col * tileSize;

      // Alternating pattern
      if ((row + col) % 2 === 0) {
        T.rect(ctx, tx, ty, tileSize, tileSize, P.white);
      }

      // Grout lines
      T.rect(ctx, tx, ty, tileSize, 1, tileDark);
      T.rect(ctx, tx, ty, 1, tileSize, tileDark);
    }
  }

  // Subtle tile texture
  T.dither(ctx, 0, 70, 320, 70, tileBase, tileDark, 0.04, 4);
}

function _drawWoodenFloor(ctx, P) {
  const floorWood = P.wood || '#8B6F47';
  const darkWood = P.dark_brown || '#5C4A3A';

  T.rect(ctx, 0, 70, 320, 70, floorWood);

  // Wood planks - horizontal boards
  for (let y = 70; y < 140; y += 8) {
    T.line(ctx, 0, y, 320, y, darkWood);

    // Random plank divisions (vertical seams)
    for (let x = 40; x < 320; x += 30 + (y % 20)) {
      T.line(ctx, x, y, x, Math.min(y + 8, 140), darkWood);
    }
  }

  // Wood grain texture
  T.dither(ctx, 0, 70, 320, 70, floorWood, darkWood, 0.06, 8);
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Counter, espresso machine, tables, chairs, display case
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- Counter with espresso machine ---
  _drawCounter(ctx, P);

  // --- Pastry display case ---
  _drawDisplayCase(ctx, P, 240, 48);

  // --- Large front window ---
  const windowWidth = params.windowSize === 'large' ? 120 : 80;
  const windowX = params.windowSize === 'large' ? 180 : 200;
  _drawLargeWindow(ctx, P, windowX, 20, windowWidth, 35);

  // --- Tables based on count ---
  if (params.tableCount === 'few') {
    _drawCafeTable(ctx, P, 50, 90);
    _drawCafeTable(ctx, P, 140, 95);
  } else {
    _drawCafeTable(ctx, P, 50, 90);
    _drawCafeTable(ctx, P, 140, 95);
    _drawCafeTable(ctx, P, 230, 88);
    _drawCafeTable(ctx, P, 95, 110);
  }

  // --- Menu board on wall ---
  _drawMenuBoard(ctx, P, 120, 22);

  // --- Pendant lights ---
  _drawPendantLight(ctx, P, 70, 8);
  _drawPendantLight(ctx, P, 160, 8);
  _drawPendantLight(ctx, P, 250, 8);
}

function _drawCounter(ctx, P) {
  const cx = 10, cy = 42;

  // Counter base cabinet
  T.rect(ctx, cx, cy + 18, 80, 28, P.dark_brown);
  T.dither(ctx, cx, cy + 18, 80, 28, P.dark_brown, P.brown, 0.12, 4);

  // Counter top surface
  T.rect(ctx, cx - 1, cy + 16, 82, 3, P.dark_gray);
  T.rect(ctx, cx - 1, cy + 16, 82, 1, P.gray);

  // Cabinet doors
  for (let i = 0; i < 3; i++) {
    const dx = cx + 4 + i * 24;
    T.rect(ctx, dx, cy + 22, 20, 20, P.brown);
    T.rect(ctx, dx + 1, cy + 23, 18, 18, P.dark_brown);
    // Handles
    T.rect(ctx, dx + 9, cy + 31, 2, 1, P.gray);
  }

  // Backsplash
  T.rect(ctx, cx, cy + 10, 80, 6, P.white);
  T.dither(ctx, cx, cy + 10, 80, 6, P.white, P.light_gray, 0.08, 4);

  // Backsplash tile lines
  for (let x = cx; x < cx + 80; x += 10) {
    T.rect(ctx, x, cy + 10, 1, 6, P.light_gray);
  }

  // --- Espresso machine ---
  _drawEspressoMachine(ctx, P, cx + 15, cy + 8);

  // --- Cash register ---
  _drawCashRegister(ctx, P, cx + 55, cy + 14);

  // --- Coffee cups on counter ---
  T.rect(ctx, cx + 8, cy + 15, 3, 3, P.white);
  T.pixel(ctx, cx + 9, cy + 16, P.dark_brown); // Coffee inside
  T.pixel(ctx, cx + 11, cy + 17, P.white); // Handle
}

function _drawEspressoMachine(ctx, P, x, y) {
  // Machine body
  T.rect(ctx, x, y + 4, 20, 12, P.dark_gray);
  T.rect(ctx, x + 1, y + 5, 18, 10, P.gray);

  // Top section — boiler
  T.rect(ctx, x + 4, y, 12, 4, P.gray);
  T.rect(ctx, x + 5, y + 1, 10, 2, P.dark_gray);

  // Group head (brewing unit)
  T.rect(ctx, x + 7, y + 14, 6, 2, P.dark_gray);

  // Portafilter handle
  T.rect(ctx, x + 5, y + 14, 3, 1, P.dark_brown);

  // Steam wand
  T.line(ctx, x + 3, y + 8, x + 1, y + 12, P.dark_gray);
  T.pixel(ctx, x + 1, y + 12, P.gray);

  // Drip tray
  T.rect(ctx, x + 2, y + 16, 16, 1, P.black);

  // Control buttons
  T.pixel(ctx, x + 8, y + 8, P.red);
  T.pixel(ctx, x + 11, y + 8, P.green);

  // Chrome highlights
  T.rect(ctx, x + 1, y + 5, 1, 10, P.light_gray);
  T.pixel(ctx, x + 8, y + 1, P.white);
}

function _drawCashRegister(ctx, P, x, y) {
  // Register body
  T.rect(ctx, x, y + 2, 14, 6, P.dark_gray);
  T.rect(ctx, x + 1, y + 3, 12, 4, P.gray);

  // Display screen
  T.rect(ctx, x + 4, y + 4, 6, 2, P.dark_blue);
  T.pixel(ctx, x + 5, y + 5, P.green); // LED digits

  // Cash drawer
  T.rect(ctx, x + 1, y + 8, 12, 3, P.dark_brown);
  T.rect(ctx, x + 2, y + 9, 10, 1, P.brown);

  // Keypad buttons
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      T.pixel(ctx, x + 3 + col * 3, y + 5 + row * 2, P.light_gray);
    }
  }

  // Receipt printer top
  T.rect(ctx, x + 2, y, 10, 2, P.gray);
  T.rect(ctx, x + 3, y + 1, 8, 1, P.dark_gray);
}

function _drawLargeWindow(ctx, P, x, y, width, height) {
  const windowGlass = P.sky || '#87CEEB';

  // Window frame
  T.rect(ctx, x - 3, y - 3, width + 6, height + 6, P.trim || P.brown);

  // Window panes (glass)
  T.rect(ctx, x, y, width, height, windowGlass);

  // Window grid - divided into 4 panes
  const midX = x + Math.floor(width / 2);
  const midY = y + Math.floor(height / 2);
  T.rect(ctx, midX - 1, y, 2, height, P.trim || P.brown); // Vertical divider
  T.rect(ctx, x, midY - 1, width, 2, P.trim || P.brown); // Horizontal divider

  // Window sill
  T.rect(ctx, x - 5, y + height + 3, width + 10, 4, P.trim || P.brown);

  // Street view through window (simplified buildings across street)
  T.dither(ctx, x + 2, y + 2, width - 4, Math.floor(height / 2) - 2, P.sky || '#87CEEB', P.light || '#B0D8F0', 0.3, 42);

  // Buildings visible through window
  T.rect(ctx, x + 10, y + Math.floor(height * 0.6), 20, Math.floor(height * 0.4), '#8B8B8B');
  T.rect(ctx, x + 35, y + Math.floor(height * 0.5), 25, Math.floor(height * 0.5), '#9B9B9B');
  if (width > 90) {
    T.rect(ctx, x + 65, y + Math.floor(height * 0.55), 18, Math.floor(height * 0.45), '#7B7B7B');
  }

  // Small windows in buildings (lit)
  for (let wx = x + 12; wx < x + 28; wx += 6) {
    T.rect(ctx, wx, y + Math.floor(height * 0.7), 3, 4, '#FFE87C');
  }

  // Glass reflections
  T.line(ctx, x + 3, y + 3, x + 3, y + height - 3, '#FFFFFF44');
  T.line(ctx, x + 3, y + 3, x + width - 3, y + 3, '#FFFFFF44');
}

function _drawDisplayCase(ctx, P, x, y) {
  // Glass case frame
  T.rect(ctx, x, y + 2, 50, 22, P.dark_gray);
  T.rect(ctx, x + 1, y + 3, 48, 20, P.gray);

  // Glass panels
  T.rect(ctx, x + 2, y + 4, 46, 18, P.light_blue);
  T.dither(ctx, x + 2, y + 4, 46, 18, P.light_blue, P.blue, 0.05, 4);

  // Glass reflections
  T.rect(ctx, x + 3, y + 5, 10, 2, P.white);
  T.pixel(ctx, x + 4, y + 6, P.white);

  // Interior shelves
  T.rect(ctx, x + 4, y + 12, 40, 1, P.light_gray);

  // Pastries on shelves
  // Top shelf
  _drawPastry(ctx, P, x + 8, y + 7, 'croissant');
  _drawPastry(ctx, P, x + 16, y + 7, 'muffin');
  _drawPastry(ctx, P, x + 24, y + 7, 'donut');
  _drawPastry(ctx, P, x + 32, y + 7, 'croissant');

  // Bottom shelf
  _drawPastry(ctx, P, x + 10, y + 15, 'cake');
  _drawPastry(ctx, P, x + 20, y + 15, 'tart');
  _drawPastry(ctx, P, x + 30, y + 15, 'muffin');

  // Case base
  T.rect(ctx, x, y + 24, 50, 4, P.dark_brown);
  T.rect(ctx, x + 1, y + 25, 48, 2, P.brown);
}

function _drawPastry(ctx, P, x, y, type) {
  if (type === 'croissant') {
    T.rect(ctx, x, y + 2, 6, 2, P.tan);
    T.rect(ctx, x + 1, y + 1, 4, 1, P.tan);
    T.pixel(ctx, x + 1, y + 2, P.brown);
  } else if (type === 'muffin') {
    T.rect(ctx, x, y + 1, 5, 3, P.brown);
    T.rect(ctx, x + 1, y, 3, 1, P.tan);
    T.pixel(ctx, x + 2, y, P.brown);
  } else if (type === 'donut') {
    T.ellipse(ctx, x + 2, y + 2, 3, 2, P.tan);
    T.pixel(ctx, x + 2, y + 2, P.white); // Hole
    T.pixel(ctx, x + 1, y + 1, P.red); // Frosting
    T.pixel(ctx, x + 3, y + 1, P.red);
  } else if (type === 'cake') {
    T.rect(ctx, x, y + 2, 6, 2, P.brown);
    T.rect(ctx, x + 1, y + 1, 4, 1, P.white); // Frosting
    T.pixel(ctx, x + 2, y, P.red); // Cherry
  } else if (type === 'tart') {
    T.rect(ctx, x, y + 2, 5, 2, P.tan);
    T.rect(ctx, x + 1, y + 1, 3, 1, P.red); // Fruit filling
    T.pixel(ctx, x + 2, y + 1, P.white); // Glaze
  }
}

function _drawCafeTable(ctx, P, x, y) {
  // Table top — round
  T.ellipse(ctx, x, y, 12, 6, P.dark_brown);
  T.ellipse(ctx, x, y, 10, 5, P.brown);

  // Table top highlight
  T.scatter(ctx, x - 8, y - 3, 16, 6, P.tan, 0.15);

  // Central pedestal
  T.rect(ctx, x - 2, y + 5, 4, 14, P.dark_brown);

  // Base
  T.ellipse(ctx, x, y + 18, 8, 3, P.dark_brown);

  // --- Chairs (2 per table) ---
  _drawCafeChair(ctx, P, x - 18, y + 6);
  _drawCafeChair(ctx, P, x + 14, y + 6);

  // --- Items on table ---
  // Coffee cup
  T.rect(ctx, x - 4, y - 2, 3, 2, P.white);
  T.pixel(ctx, x - 3, y - 1, P.dark_brown);
  T.pixel(ctx, x - 1, y, P.white); // Handle

  // Saucer
  T.ellipse(ctx, x - 3, y, 4, 2, P.white);
}

function _drawCafeChair(ctx, P, x, y) {
  // Seat
  T.rect(ctx, x, y + 4, 10, 6, P.dark_brown);
  T.rect(ctx, x, y + 4, 10, 1, P.brown);

  // Backrest
  T.rect(ctx, x + 1, y, 8, 5, P.dark_brown);
  T.rect(ctx, x + 1, y, 8, 1, P.brown);

  // Legs — front two visible
  T.rect(ctx, x + 1, y + 10, 2, 8, P.dark_brown);
  T.rect(ctx, x + 7, y + 10, 2, 8, P.dark_brown);
}

function _drawMenuBoard(ctx, P, x, y) {
  // Chalkboard frame
  T.rect(ctx, x, y, 60, 24, P.dark_brown);
  T.rect(ctx, x + 1, y + 1, 58, 22, P.brown);

  // Chalkboard surface
  T.rect(ctx, x + 2, y + 2, 56, 20, P.black);
  T.dither(ctx, x + 2, y + 2, 56, 20, P.black, P.dark_gray, 0.08, 4);

  // Chalk writing — menu items
  T.rect(ctx, x + 6, y + 4, 20, 1, P.white); // "COFFEE"
  T.rect(ctx, x + 8, y + 6, 8, 1, P.light_gray); // "Espresso"
  T.rect(ctx, x + 8, y + 8, 10, 1, P.light_gray); // "Cappuccino"
  T.rect(ctx, x + 8, y + 10, 6, 1, P.light_gray); // "Latte"

  T.rect(ctx, x + 32, y + 4, 20, 1, P.white); // "PASTRIES"
  T.rect(ctx, x + 34, y + 6, 10, 1, P.light_gray); // "Croissant"
  T.rect(ctx, x + 34, y + 8, 8, 1, P.light_gray); // "Muffin"
  T.rect(ctx, x + 34, y + 10, 6, 1, P.light_gray); // "Donut"

  // Prices
  T.pixel(ctx, x + 18, y + 6, P.white);
  T.pixel(ctx, x + 20, y + 8, P.white);
  T.pixel(ctx, x + 18, y + 10, P.white);
  T.pixel(ctx, x + 46, y + 6, P.white);
  T.pixel(ctx, x + 44, y + 8, P.white);
  T.pixel(ctx, x + 42, y + 10, P.white);

  // Decorative coffee cup drawing
  T.pixel(ctx, x + 10, y + 16, P.white);
  T.pixel(ctx, x + 11, y + 17, P.white);
  T.pixel(ctx, x + 12, y + 16, P.white);
  T.pixel(ctx, x + 11, y + 15, P.white);

  // Steam lines
  T.pixel(ctx, x + 10, y + 14, P.light_gray);
  T.pixel(ctx, x + 12, y + 13, P.light_gray);

  // Chalk tray
  T.rect(ctx, x + 2, y + 22, 56, 1, P.brown);
  T.pixel(ctx, x + 8, y + 22, P.white); // Chalk piece
  T.pixel(ctx, x + 12, y + 22, P.white);
}

function _drawPoster(ctx, P, x, y, theme) {
  // Poster frame
  T.rect(ctx, x, y, 20, 16, P.dark_brown);
  T.rect(ctx, x + 1, y + 1, 18, 14, P.brown);

  // Poster background
  T.rect(ctx, x + 2, y + 2, 16, 12, P.beige);

  if (theme === 'coffee') {
    // Coffee cup illustration
    T.rect(ctx, x + 6, y + 6, 8, 6, P.dark_brown);
    T.rect(ctx, x + 7, y + 7, 6, 4, P.brown);
    T.pixel(ctx, x + 14, y + 9, P.dark_brown); // Handle

    // Steam
    T.pixel(ctx, x + 8, y + 5, P.gray);
    T.pixel(ctx, x + 10, y + 4, P.gray);
    T.pixel(ctx, x + 12, y + 5, P.gray);

  } else if (theme === 'pastry') {
    // Croissant illustration
    T.rect(ctx, x + 6, y + 8, 8, 3, P.tan);
    T.rect(ctx, x + 7, y + 7, 6, 1, P.tan);
    T.pixel(ctx, x + 7, y + 8, P.brown);
    T.pixel(ctx, x + 12, y + 9, P.brown);
  }

  // Text area
  T.rect(ctx, x + 4, y + 12, 12, 1, P.black);
}

function _drawPendantLight(ctx, P, x, y) {
  // Ceiling mount
  T.pixel(ctx, x, y, P.dark_gray);

  // Cord
  T.rect(ctx, x, y, 1, 8, P.dark_gray);

  // Lamp shade — conical
  T.polygonFill(ctx, [
    [x - 4, y + 14], [x + 4, y + 14], [x + 2, y + 8], [x - 2, y + 8],
  ], P.dark_brown);

  // Shade interior highlight
  T.rect(ctx, x - 2, y + 9, 4, 1, P.brown);

  // Visible bulb at bottom
  T.pixel(ctx, x, y + 13, P.yellow);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Wall decorations, plants, napkin holder, tip jar
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Potted plants (if enabled) ---
  if (params.hasPlants) {
    _drawPottedPlant(ctx, P, 295, 56);

    // Window sill plant
    const plantX = params.windowSize === 'large' ? 210 : 220;
    _drawSmallPlant(ctx, P, plantX, 60);
  }

  // --- Condiment station on counter ---
  _drawCondimentStation(ctx, P, 72, 60);

  // --- Tip jar ---
  T.rect(ctx, 52, 60, 4, 5, P.white);
  T.rect(ctx, 53, 61, 2, 3, P.light_gray);
  T.pixel(ctx, 53, 62, P.green); // Dollar bill

  // --- Wall outlet ---
  T.rect(ctx, 280, 58, 3, 5, P.white);
  T.pixel(ctx, 281, 60, P.black);
  T.pixel(ctx, 281, 62, P.black);

  // --- Napkin holders on tables ---
  T.rect(ctx, 54, 88, 2, 3, P.dark_gray);
  T.pixel(ctx, 54, 89, P.white); // Napkin
  T.rect(ctx, 144, 93, 2, 3, P.dark_gray);
  T.pixel(ctx, 144, 94, P.white);

  // --- Sugar packets on condiment station ---
  T.pixel(ctx, 74, 62, P.white);
  T.pixel(ctx, 75, 62, P.white);
  T.pixel(ctx, 76, 62, P.tan);

  // --- Coffee bean decoration on wall ---
  _drawCoffeeBeanArt(ctx, P, 100, 35);

  // --- Floor mat at counter ---
  T.rect(ctx, 12, 72, 25, 8, P.dark_red);
  T.dither(ctx, 12, 72, 25, 8, P.dark_red, P.red, 0.2, 4);

  // --- Baseboard heating vent ---
  T.rect(ctx, 200, 68, 20, 2, P.dark_gray);
  for (let i = 0; i < 10; i++) {
    T.pixel(ctx, 202 + i * 2, 69, P.black);
  }

  // --- Light switches near entrance ---
  T.rect(ctx, 8, 42, 3, 5, P.white);
  T.rect(ctx, 9, 44, 1, 2, P.light_gray);
}

function _drawPottedPlant(ctx, P, x, y) {
  // Pot
  T.polygonFill(ctx, [
    [x, y + 3], [x + 8, y + 3], [x + 7, y + 10], [x + 1, y + 10],
  ], P.dark_brown);

  T.rect(ctx, x - 1, y + 2, 10, 2, P.brown);

  // Soil
  T.rect(ctx, x + 1, y + 4, 6, 2, P.dark_brown);

  // Leaves — fern-like
  const leaves = [
    [x + 2, y - 2], [x + 3, y - 3], [x + 4, y - 4], [x + 5, y - 3], [x + 6, y - 2],
    [x + 1, y - 1], [x + 7, y - 1], [x + 3, y], [x + 5, y],
  ];
  for (const [lx, ly] of leaves) {
    T.pixel(ctx, lx, ly, P.green);
  }

  // Stem
  T.rect(ctx, x + 4, y, 1, 4, P.dark_green);
}

function _drawSmallPlant(ctx, P, x, y) {
  // Small pot
  T.rect(ctx, x, y + 4, 10, 6, P.dark_brown);
  T.rect(ctx, x + 1, y + 3, 8, 2, P.brown);

  // Leaves
  T.pixel(ctx, x + 3, y, P.green);
  T.pixel(ctx, x + 4, y - 1, P.green);
  T.pixel(ctx, x + 5, y, P.green);
  T.pixel(ctx, x + 2, y + 1, P.green);
  T.pixel(ctx, x + 6, y + 1, P.green);
  T.pixel(ctx, x + 7, y + 2, P.green);
  T.rect(ctx, x + 3, y + 2, 4, 4, P.green);
}

function _drawCondimentStation(ctx, P, x, y) {
  // Tray base
  T.rect(ctx, x, y + 5, 12, 2, P.gray);

  // Sugar dispenser
  T.rect(ctx, x + 1, y + 1, 3, 4, P.white);
  T.rect(ctx, x + 2, y + 2, 1, 2, P.tan); // Sugar inside
  T.pixel(ctx, x + 2, y + 1, P.gray); // Lid

  // Cream pitcher
  T.rect(ctx, x + 5, y + 2, 3, 3, P.white);
  T.pixel(ctx, x + 8, y + 3, P.white); // Spout

  // Straw/stirrer holder
  T.rect(ctx, x + 9, y + 1, 2, 4, P.dark_gray);
  T.pixel(ctx, x + 10, y, P.brown); // Stirrer sticking out
}

function _drawCoffeeBeanArt(ctx, P, x, y) {
  // Simple coffee bean shapes in a circle pattern
  const beans = [
    [x, y - 4], [x + 4, y - 2], [x + 5, y + 2], [x + 2, y + 5],
    [x - 2, y + 5], [x - 5, y + 2], [x - 4, y - 2],
  ];

  for (const [bx, by] of beans) {
    T.ellipse(ctx, bx, by, 2, 3, P.dark_brown);
    T.pixel(ctx, bx, by, P.brown); // Bean crease
  }
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Furniture shadows, counter shadows, pendant light shadows
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  // --- Counter shadow on floor ---
  T.scatter(ctx, 10, 72, 82, 8, P.black, 0.14);

  // --- Display case shadow ---
  T.scatter(ctx, 240, 72, 52, 6, P.black, 0.13);

  // --- Table shadows ---
  if (params.tableCount === 'few') {
    T.scatter(ctx, 38, 100, 24, 8, P.black, 0.12);
    T.scatter(ctx, 128, 105, 24, 8, P.black, 0.12);
    // Chair shadows
    T.scatter(ctx, 30, 108, 12, 6, P.black, 0.1);
    T.scatter(ctx, 62, 108, 12, 6, P.black, 0.1);
    T.scatter(ctx, 120, 113, 12, 6, P.black, 0.1);
    T.scatter(ctx, 152, 113, 12, 6, P.black, 0.1);
  } else {
    T.scatter(ctx, 38, 100, 24, 8, P.black, 0.12);
    T.scatter(ctx, 128, 105, 24, 8, P.black, 0.12);
    T.scatter(ctx, 218, 98, 24, 8, P.black, 0.12);
    T.scatter(ctx, 83, 120, 24, 8, P.black, 0.12);
    // Chair shadows
    T.scatter(ctx, 30, 108, 12, 6, P.black, 0.1);
    T.scatter(ctx, 62, 108, 12, 6, P.black, 0.1);
    T.scatter(ctx, 120, 113, 12, 6, P.black, 0.1);
    T.scatter(ctx, 152, 113, 12, 6, P.black, 0.1);
    T.scatter(ctx, 210, 106, 12, 6, P.black, 0.1);
    T.scatter(ctx, 242, 106, 12, 6, P.black, 0.1);
    T.scatter(ctx, 75, 128, 12, 6, P.black, 0.1);
    T.scatter(ctx, 107, 128, 12, 6, P.black, 0.1);
  }

  // --- Pendant light shadows on floor ---
  T.scatterCircle(ctx, 70, 90, 15, P.black, 0.08);
  T.scatterCircle(ctx, 160, 90, 15, P.black, 0.08);
  T.scatterCircle(ctx, 250, 90, 15, P.black, 0.08);

  // --- Plant shadows (if plants enabled) ---
  if (params.hasPlants) {
    T.scatter(ctx, 304, 66, 6, 8, P.black, 0.1);
    const plantX = params.windowSize === 'large' ? 210 : 220;
    T.scatter(ctx, plantX, 70, 10, 4, P.black, 0.1);
  }

  // --- Menu board shadow on wall ---
  T.scatter(ctx, 122, 46, 60, 4, P.black, 0.08);

  // --- Window frame depth shadows ---
  const windowX = params.windowSize === 'large' ? 180 : 200;
  const windowWidth = params.windowSize === 'large' ? 120 : 80;
  T.line(ctx, windowX - 3, 17, windowX - 3, 60, '#00000033');
  T.line(ctx, windowX - 3, 17, windowX + windowWidth + 3, 17, '#00000033');

  // --- General depth at corners ---
  T.scatter(ctx, 0, 70, 15, 70, P.black, 0.06);
  T.scatter(ctx, 305, 70, 15, 70, P.black, 0.06);
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Pendant light pools, warm ambience, window light
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  const warmColor = P.tan || '#D2B48C';
  const lightColor = P.beige || '#F5F5DC';

  // --- Warm ambient lighting ---
  T.scatter(ctx, 0, 0, 320, 140, warmColor, 0.04);
  T.scatter(ctx, 0, 0, 320, 140, lightColor, 0.02);

  // --- Pendant light pools ---
  T.scatterCircle(ctx, 70, 22, 38, lightColor, 0.1);
  T.scatterCircle(ctx, 70, 22, 25, P.white, 0.06);
  T.scatterCircle(ctx, 160, 22, 38, lightColor, 0.1);
  T.scatterCircle(ctx, 160, 22, 25, P.white, 0.06);
  T.scatterCircle(ctx, 250, 22, 38, lightColor, 0.1);
  T.scatterCircle(ctx, 250, 22, 25, P.white, 0.06);

  // --- Pendant light glow cones downward ---
  T.scatter(ctx, 66, 22, 8, 60, lightColor, 0.04);
  T.scatter(ctx, 156, 22, 8, 60, lightColor, 0.04);
  T.scatter(ctx, 246, 22, 8, 60, lightColor, 0.04);

  // --- Window sunlight streaming in ---
  const windowX = params.windowSize === 'large' ? 180 : 200;
  const windowWidth = params.windowSize === 'large' ? 120 : 80;

  // Warm sunlight from window onto floor
  T.dither(ctx, windowX - 10, 80, windowWidth + 20, 30, 'transparent', '#FFD70022', 0.2, 400);

  // Light rays from window
  for (let i = 0; i < 5; i++) {
    const rayX = windowX + (windowWidth / 6) * (i + 1);
    const rayWidth = 8;
    const rayEndY = 100;
    // Dithered light beam
    T.dither(ctx, rayX - rayWidth, 25, rayWidth * 2, rayEndY - 25, 'transparent', '#FFF8DC22', 0.12, i * 100);
  }

  // Dust particles in light rays
  for (let i = 0; i < 15; i++) {
    const px = windowX + (Math.sin(i * 1.2) * 0.5 + 0.5) * windowWidth;
    const py = 30 + (i * 5);
    if (py < 110) {
      T.pixel(ctx, Math.floor(px), Math.floor(py), '#FFFFFF88');
    }
  }

  // --- Espresso machine LED glow ---
  T.scatterCircle(ctx, 33, 58, 10, P.red || '#FF0000', 0.05);
  T.scatterCircle(ctx, 36, 58, 10, P.green || '#00FF00', 0.05);

  // --- Display case interior lighting ---
  T.scatter(ctx, 242, 50, 46, 18, P.white, 0.06);

  // --- Vignette at edges ---
  T.scatter(ctx, 0, 0, 20, 140, P.black, 0.04);
  T.scatter(ctx, 300, 0, 20, 140, P.black, 0.04);
  T.scatter(ctx, 0, 120, 320, 20, P.black, 0.03);

  // --- Steam from espresso machine ---
  for (let i = 0; i < 8; i++) {
    const steamX = 30 + Math.sin(i * 0.8) * 3;
    const steamY = 48 - i * 2;
    const opacity = Math.max(0, (16 - i * 2)).toString(16).padStart(2, '0');
    T.pixel(ctx, Math.floor(steamX), Math.floor(steamY), '#FFFFFF' + opacity);
  }

  // --- Floor reflections near lights ---
  if (params.floorStyle === 'tile') {
    for (let fx = 30; fx < 290; fx += 25) {
      T.pixel(ctx, fx, 74 + (fx % 3), P.white);
    }
  }

  // --- Coffee aroma wisps ---
  const aromaPoints = [
    { x: 25, baseY: 63 },
    { x: 80, baseY: 61 }
  ];

  aromaPoints.forEach((aroma, idx) => {
    for (let i = 0; i < 6; i++) {
      const wispX = aroma.x + Math.sin((i + idx) * 1.5) * 4;
      const wispY = aroma.baseY - i * 3;
      const opacity = Math.max(0, (6 - i) * 8).toString(16).padStart(2, '0');
      T.pixel(ctx, Math.floor(wispX), Math.floor(wispY), '#8B7355' + opacity);
    }
  });

  // --- Warm glow on counter top from overhead lights ---
  T.dither(ctx, 15, 60, 130, 2, 'transparent', '#FFF8DC22', 0.25, 500);

  // --- Glass reflection shimmer on window ---
  for (let i = 0; i < 3; i++) {
    const shimmerX = windowX + 15 + i * 35;
    T.line(ctx, shimmerX, 25, shimmerX + 8, 30, '#FFFFFF33');
  }
}
