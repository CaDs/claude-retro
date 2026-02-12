/**
 * park.js — Contemporary park scene room template.
 *
 * Generates a peaceful park with grass, trees, park bench, pathway,
 * pond/fountain, sky with clouds, fence or hedge border.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';
import { drawSkyBands } from '../_base.js';

export const metadata = {
  id: 'contemporary/park',
  name: 'Park',
  setting: 'contemporary',
  category: 'exterior',
  palette: 'park_green',
  params: {
    season: { type: 'enum', options: ['spring', 'summer', 'autumn'], default: 'summer', label: 'Season' },
    waterFeature: { type: 'enum', options: ['pond', 'fountain', 'none'], default: 'pond', label: 'Water Feature' },
    hasBench: { type: 'boolean', default: true, label: 'Park Bench' },
    borderType: { type: 'enum', options: ['fence', 'hedge', 'none'], default: 'fence', label: 'Border' },
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
//  Layer 1 (BASE): Sky with clouds, grass, pathway
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  // --- Sky with seasonal variations (rows 0-60) ---
  const skyBands = _getSkyBands(P, params.season);
  drawSkyBands(ctx, P, skyBands);

  // --- Grass (rows 60-140) ---
  const grassColors = _getGrassColors(P, params.season);
  T.rect(ctx, 0, 60, 320, 80, grassColors.base);
  T.dither(ctx, 0, 60, 320, 80, grassColors.base, grassColors.dark, 0.15, 4);

  // Grass patches — varied green tones
  for (let i = 0; i < 8; i++) {
    const px = (i * 47) % 300;
    const py = 60 + (i * 13) % 70;
    const pw = 25 + (i * 11) % 30;
    const ph = 8 + (i * 7) % 10;
    T.dither(ctx, px, py, pw, ph, grassColors.base, grassColors.light, 0.25, 4);
  }

  // --- Pathway — winding gravel path (rows 80-140) ---
  _drawPathway(ctx, P);

  // --- Horizon line grass detail ---
  T.rect(ctx, 0, 60, 320, 1, grassColors.dark);
}

function _getSkyBands(P, season) {
  if (season === 'spring') {
    return [
      { y: 0, h: 20, color: P.light_blue },
      { y: 20, h: 20, color: P.blue },
      { y: 40, h: 20, color: P.light_blue },
    ];
  } else if (season === 'autumn') {
    return [
      { y: 0, h: 15, color: P.light_blue },
      { y: 15, h: 20, color: P.blue },
      { y: 35, h: 25, color: P.light_blue },
    ];
  } else {
    return [
      { y: 0, h: 18, color: P.light_blue },
      { y: 18, h: 22, color: P.blue },
      { y: 40, h: 20, color: P.light_blue },
    ];
  }
}

function _getGrassColors(P, season) {
  if (season === 'spring') {
    return {
      base: P.bright_green || P.light_green,
      light: P.light_green,
      dark: P.green,
    };
  } else if (season === 'autumn') {
    return {
      base: P.green,
      light: P.light_green,
      dark: P.dark_green,
    };
  } else {
    return {
      base: P.green,
      light: P.light_green,
      dark: P.dark_green,
    };
  }
}

function _drawPathway(ctx, P) {
  const pathBase = P.tan || P.gray;
  const pathDark = P.brown || P.dark_gray;

  // Main path — curved sections using polygons
  // Left entrance section
  T.polygonFill(ctx, [
    [0, 95], [40, 92], [45, 102], [0, 105],
  ], pathBase);

  // Middle curving section
  T.polygonFill(ctx, [
    [40, 92], [120, 88], [130, 98], [45, 102],
  ], pathBase);

  // Right section to pond
  T.polygonFill(ctx, [
    [120, 88], [200, 92], [205, 102], [130, 98],
  ], pathBase);

  // Far right exit
  T.polygonFill(ctx, [
    [200, 92], [320, 95], [320, 105], [205, 102],
  ], pathBase);

  // Path texture — gravel dither
  T.dither(ctx, 0, 92, 320, 15, pathBase, pathDark, 0.18, 4);

  // Path edge definition — top edge darker
  T.scatter(ctx, 0, 92, 320, 2, pathDark, 0.3);
  T.scatter(ctx, 0, 105, 320, 2, pathDark, 0.3);

  // Small pebbles scattered on path
  for (let i = 0; i < 20; i++) {
    const px = (i * 19 + 7) % 318;
    const py = 93 + (i * 11) % 11;
    T.pixel(ctx, px, py, P.gray);
  }
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Trees, bench, pond/fountain, border fence/hedge
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- Border based on param ---
  if (params.borderType === 'fence') {
    _drawFence(ctx, P);
  } else if (params.borderType === 'hedge') {
    _drawHedge(ctx, P, params);
  }

  // --- Trees ---
  _drawTree(ctx, P, 40, 40, params.season, 'large');
  _drawTree(ctx, P, 260, 45, params.season, 'medium');
  _drawTree(ctx, P, 150, 35, params.season, 'small');
  _drawTree(ctx, P, 310, 50, params.season, 'medium');

  // --- Park bench ---
  if (params.hasBench) {
    _drawParkBench(ctx, P, 80, 98);
  }

  // --- Water feature ---
  if (params.waterFeature === 'pond') {
    _drawPond(ctx, P, 220, 110);
  } else if (params.waterFeature === 'fountain') {
    _drawFountain(ctx, P, 230, 95);
  }
}

function _drawTree(ctx, P, x, y, season, size) {
  const sizes = {
    small: { trunkW: 3, trunkH: 12, foliageR: 12 },
    medium: { trunkW: 4, trunkH: 16, foliageR: 16 },
    large: { trunkW: 5, trunkH: 20, foliageR: 20 },
  };
  const config = sizes[size];

  // Trunk
  T.rect(ctx, x, y + config.foliageR, config.trunkW, config.trunkH, P.dark_brown);
  T.rect(ctx, x, y + config.foliageR, 1, config.trunkH, P.brown); // Highlight edge

  // Trunk texture
  T.dither(ctx, x, y + config.foliageR, config.trunkW, config.trunkH, P.dark_brown, P.brown, 0.12, 4);

  // Foliage — seasonal colors
  const foliageColors = _getFoliageColors(P, season);

  // Large foliage circle (approximated with rects)
  const r = config.foliageR;
  T.ellipse(ctx, x + Math.floor(config.trunkW / 2), y + r, r, r, foliageColors.dark);
  T.circleFill(ctx, x + Math.floor(config.trunkW / 2), y + r, r - 2, foliageColors.base);

  // Foliage detail layers
  T.dither(ctx, x - r + 2, y + 2, r * 2 - 4, r * 2 - 4, foliageColors.base, foliageColors.light, 0.2, 4);

  // Highlight clusters on foliage
  T.scatterCircle(ctx, x + Math.floor(config.trunkW / 2), y + r - 4, r / 2, foliageColors.light, 0.3);
}

function _getFoliageColors(P, season) {
  if (season === 'spring') {
    return {
      base: P.light_green,
      light: P.bright_green,
      dark: P.green,
    };
  } else if (season === 'autumn') {
    return {
      base: P.yellow,
      light: P.tan,
      dark: P.brown,
    };
  } else {
    return {
      base: P.green,
      light: P.light_green,
      dark: P.dark_green,
    };
  }
}

function _drawParkBench(ctx, P, x, y) {
  // Bench seat slats
  for (let i = 0; i < 3; i++) {
    const sy = y + 4 + i * 2;
    T.rect(ctx, x, sy, 28, 1, P.brown);
  }

  // Bench back slats
  for (let i = 0; i < 3; i++) {
    const sy = y - 4 + i * 2;
    T.rect(ctx, x + 2, sy, 24, 1, P.brown);
  }

  // Armrests
  T.rect(ctx, x, y - 6, 2, 16, P.dark_brown);
  T.rect(ctx, x + 26, y - 6, 2, 16, P.dark_brown);

  // Legs
  T.rect(ctx, x + 2, y + 10, 2, 8, P.dark_brown);
  T.rect(ctx, x + 24, y + 10, 2, 8, P.dark_brown);

  // Support bar
  T.rect(ctx, x + 2, y + 16, 24, 1, P.dark_brown);

  // Metal frame details
  T.pixel(ctx, x, y - 6, P.gray);
  T.pixel(ctx, x + 26, y - 6, P.gray);

  // Bench highlights
  T.rect(ctx, x, y + 4, 28, 1, P.tan);
}

function _drawPond(ctx, P, x, y) {
  // Pond shape — irregular ellipse
  T.ellipse(ctx, x, y, 35, 20, P.dark_green);
  T.ellipse(ctx, x, y, 33, 18, P.dark_blue);
  T.ellipse(ctx, x, y, 30, 16, P.blue);

  // Water surface
  T.dither(ctx, x - 30, y - 16, 60, 32, P.blue, P.dark_blue, 0.2, 4);

  // Water highlights — ripples
  T.scatter(ctx, x - 28, y - 14, 56, 3, P.light_blue, 0.25);
  T.scatter(ctx, x - 25, y - 8, 50, 3, P.light_blue, 0.2);
  T.scatter(ctx, x - 22, y, 44, 3, P.light_blue, 0.18);

  // Reflective glints
  T.pixel(ctx, x - 10, y - 8, P.white);
  T.pixel(ctx, x + 5, y - 2, P.white);
  T.pixel(ctx, x - 15, y + 4, P.white);

  // Pond edge grass overhang
  T.scatter(ctx, x - 35, y - 20, 70, 4, P.green, 0.3);
  T.scatter(ctx, x - 35, y + 16, 70, 4, P.green, 0.3);

  // Lily pads
  _drawLilyPad(ctx, P, x - 12, y - 5);
  _drawLilyPad(ctx, P, x + 8, y + 3);
  _drawLilyPad(ctx, P, x - 5, y + 8);
}

function _drawLilyPad(ctx, P, x, y) {
  // Pad body
  T.ellipse(ctx, x, y, 4, 3, P.green);
  T.ellipse(ctx, x, y, 3, 2, P.light_green);

  // Notch in pad
  T.pixel(ctx, x + 2, y, P.dark_blue);

  // Highlight
  T.pixel(ctx, x - 1, y - 1, P.bright_green);
}

function _drawFountain(ctx, P, x, y) {
  // Base basin — circular stone
  T.ellipse(ctx, x, y + 18, 20, 8, P.gray);
  T.ellipse(ctx, x, y + 18, 18, 6, P.light_gray);

  // Water in basin
  T.ellipse(ctx, x, y + 18, 16, 5, P.dark_blue);
  T.ellipse(ctx, x, y + 18, 14, 4, P.blue);

  // Central pedestal
  T.rect(ctx, x - 3, y + 10, 6, 8, P.gray);
  T.rect(ctx, x - 2, y + 11, 4, 6, P.light_gray);

  // Pedestal top bowl
  T.ellipse(ctx, x, y + 9, 6, 3, P.gray);
  T.ellipse(ctx, x, y + 9, 5, 2, P.dark_blue);

  // Water jet — vertical stream
  T.rect(ctx, x - 1, y + 2, 2, 7, P.light_blue);
  T.rect(ctx, x, y + 3, 1, 6, P.white);

  // Water droplets falling
  T.pixel(ctx, x - 4, y + 6, P.light_blue);
  T.pixel(ctx, x + 3, y + 7, P.light_blue);
  T.pixel(ctx, x - 2, y + 9, P.blue);
  T.pixel(ctx, x + 2, y + 8, P.blue);

  // Spray at top
  T.pixel(ctx, x - 1, y + 1, P.white);
  T.pixel(ctx, x, y, P.white);
  T.pixel(ctx, x + 1, y + 1, P.white);

  // Basin water ripples
  T.scatter(ctx, x - 16, y + 16, 32, 5, P.light_blue, 0.2);
}

function _drawFence(ctx, P) {
  const fenceY = 65;
  const fenceH = 15;

  // Horizontal rails
  T.rect(ctx, 0, fenceY + 2, 320, 2, P.brown);
  T.rect(ctx, 0, fenceY + 10, 320, 2, P.brown);

  // Vertical posts
  for (let x = 0; x < 320; x += 20) {
    T.rect(ctx, x, fenceY, 3, fenceH, P.dark_brown);
    T.rect(ctx, x, fenceY, 1, fenceH, P.brown); // Highlight
  }

  // Post caps
  for (let x = 0; x < 320; x += 20) {
    T.rect(ctx, x - 1, fenceY - 1, 5, 1, P.brown);
  }
}

function _drawHedge(ctx, P, params) {
  const hedgeY = 62;
  const hedgeH = 12;
  const foliageColors = _getFoliageColors(P, params.season);

  // Hedge base
  T.rect(ctx, 0, hedgeY, 320, hedgeH, foliageColors.dark);
  T.dither(ctx, 0, hedgeY, 320, hedgeH, foliageColors.dark, foliageColors.base, 0.3, 4);

  // Hedge top texture — rounded bumps
  for (let x = 0; x < 320; x += 10) {
    const bumpH = 2 + (x % 3);
    T.rect(ctx, x, hedgeY - bumpH, 9, bumpH + 1, foliageColors.base);
    T.pixel(ctx, x + 4, hedgeY - bumpH, foliageColors.light);
  }

  // Highlight clusters
  T.scatter(ctx, 0, hedgeY, 320, 6, foliageColors.light, 0.15);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Flowers, birds, trash bin, lamp post, picnic table
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Lamp post ---
  _drawLampPost(ctx, P, 190, 80);

  // --- Trash bin ---
  _drawTrashBin(ctx, P, 60, 112);

  // --- Flowers in patches ---
  _drawFlowerPatch(ctx, P, 20, 118, params.season);
  _drawFlowerPatch(ctx, P, 140, 125, params.season);
  _drawFlowerPatch(ctx, P, 290, 115, params.season);

  // --- Birds in sky ---
  _drawBird(ctx, P, 80, 20);
  _drawBird(ctx, P, 100, 18);
  _drawBird(ctx, P, 200, 25);

  // --- Picnic table (small distant) ---
  _drawPicnicTable(ctx, P, 280, 75);

  // --- Fallen leaves (if autumn) ---
  if (params.season === 'autumn') {
    for (let i = 0; i < 15; i++) {
      const lx = (i * 23 + 10) % 310;
      const ly = 70 + (i * 17) % 50;
      T.pixel(ctx, lx, ly, P.yellow);
      T.pixel(ctx, lx + 1, ly, P.brown);
    }
  }

  // --- Butterflies (if spring/summer) ---
  if (params.season === 'spring' || params.season === 'summer') {
    T.pixel(ctx, 110, 75, P.yellow);
    T.pixel(ctx, 111, 75, P.yellow);
    T.pixel(ctx, 170, 82, P.yellow);
    T.pixel(ctx, 171, 82, P.yellow);
  }

  // --- Grass detail strokes ---
  for (let i = 0; i < 30; i++) {
    const gx = (i * 13 + 5) % 318;
    const gy = 65 + (i * 11) % 70;
    T.pixel(ctx, gx, gy, P.dark_green);
  }

  // --- Pathway edge stones ---
  T.pixel(ctx, 35, 92, P.gray);
  T.pixel(ctx, 36, 92, P.light_gray);
  T.pixel(ctx, 118, 88, P.gray);
  T.pixel(ctx, 119, 88, P.light_gray);
  T.pixel(ctx, 198, 92, P.gray);
  T.pixel(ctx, 199, 92, P.light_gray);
}

function _drawLampPost(ctx, P, x, y) {
  // Pole
  T.rect(ctx, x, y, 2, 42, P.black);
  T.rect(ctx, x, y, 1, 42, P.dark_gray); // Highlight

  // Lamp fixture — classic park style
  T.rect(ctx, x - 3, y - 4, 8, 4, P.black);
  T.rect(ctx, x - 2, y - 3, 6, 2, P.dark_gray);

  // Glass bulb area
  T.rect(ctx, x - 1, y - 2, 4, 2, P.yellow);

  // Decorative top finial
  T.pixel(ctx, x, y - 5, P.black);
  T.pixel(ctx, x + 1, y - 5, P.black);

  // Base
  T.rect(ctx, x - 2, y + 40, 6, 2, P.dark_gray);
}

function _drawTrashBin(ctx, P, x, y) {
  // Bin body
  T.rect(ctx, x, y + 4, 10, 12, P.dark_green);
  T.dither(ctx, x, y + 4, 10, 12, P.dark_green, P.green, 0.15, 4);

  // Lid — domed
  T.rect(ctx, x - 1, y + 2, 12, 2, P.green);
  T.rect(ctx, x, y + 1, 10, 1, P.light_green);
  T.rect(ctx, x + 2, y, 6, 1, P.green);

  // Opening slot
  T.rect(ctx, x + 3, y + 8, 4, 2, P.black);

  // "Keep Park Clean" label area
  T.rect(ctx, x + 2, y + 12, 6, 2, P.white);
}

function _drawFlowerPatch(ctx, P, x, y, season) {
  // Only show flowers in spring/summer
  if (season === 'autumn') {
    return;
  }

  const flowerColors = (season === 'spring')
    ? [P.yellow, P.white, P.light_blue]
    : [P.red, P.yellow, P.white];

  // Stems
  for (let i = 0; i < 5; i++) {
    const sx = x + i * 3;
    T.pixel(ctx, sx, y, P.dark_green);
    T.pixel(ctx, sx, y - 1, P.green);

    // Flower head
    const color = flowerColors[i % flowerColors.length];
    T.pixel(ctx, sx, y - 2, color);
    T.pixel(ctx, sx - 1, y - 2, color);
    T.pixel(ctx, sx + 1, y - 2, color);
    T.pixel(ctx, sx, y - 3, color);

    // Center
    T.pixel(ctx, sx, y - 2, P.yellow);
  }
}

function _drawBird(ctx, P, x, y) {
  // Simple V-shape bird silhouette
  T.pixel(ctx, x, y, P.black);
  T.pixel(ctx, x - 1, y + 1, P.black);
  T.pixel(ctx, x + 1, y + 1, P.black);
}

function _drawPicnicTable(ctx, P, x, y) {
  // Table top
  T.rect(ctx, x, y + 4, 20, 2, P.brown);

  // Table legs
  T.rect(ctx, x + 2, y + 6, 2, 6, P.dark_brown);
  T.rect(ctx, x + 16, y + 6, 2, 6, P.dark_brown);

  // Benches
  T.rect(ctx, x - 2, y + 10, 10, 1, P.brown);
  T.rect(ctx, x + 12, y + 10, 10, 1, P.brown);

  // Bench legs
  T.pixel(ctx, x, y + 11, P.dark_brown);
  T.pixel(ctx, x + 6, y + 11, P.dark_brown);
  T.pixel(ctx, x + 14, y + 11, P.dark_brown);
  T.pixel(ctx, x + 20, y + 11, P.dark_brown);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Tree shadows, bench shadows, water feature shadows
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  // --- Tree shadows on grass ---
  T.scatter(ctx, 48, 60, 16, 20, P.black, 0.15);
  T.scatter(ctx, 268, 61, 12, 16, P.black, 0.15);
  T.scatter(ctx, 158, 55, 8, 12, P.black, 0.15);
  T.scatter(ctx, 318, 68, 8, 14, P.black, 0.15);

  // --- Bench shadow ---
  if (params.hasBench) {
    T.scatter(ctx, 108, 98, 20, 12, P.black, 0.18);
  }

  // --- Pond/fountain shadow ---
  if (params.waterFeature === 'pond') {
    T.scatter(ctx, 255, 110, 30, 8, P.black, 0.12);
  } else if (params.waterFeature === 'fountain') {
    T.scatter(ctx, 248, 100, 16, 12, P.black, 0.16);
  }

  // --- Lamp post shadow ---
  T.scatter(ctx, 192, 80, 2, 42, P.black, 0.14);

  // --- Trash bin shadow ---
  T.scatter(ctx, 70, 112, 8, 10, P.black, 0.13);

  // --- Picnic table shadow ---
  T.scatter(ctx, 300, 75, 16, 8, P.black, 0.11);

  // --- Fence/hedge shadow on grass ---
  if (params.borderType !== 'none') {
    T.scatter(ctx, 0, 77, 320, 5, P.black, 0.1);
  }

  // --- General ground depth shadows at far edges ---
  T.scatter(ctx, 0, 130, 320, 10, P.black, 0.08);
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Ambient lighting, sun rays, seasonal effects
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  if (params.season === 'spring') {
    // --- Spring: warm gentle light, cherry blossom petals ---
    T.scatter(ctx, 0, 0, 320, 140, P.white, 0.02);
    T.scatter(ctx, 0, 0, 320, 60, P.light_blue, 0.03);

    // Blossom petals falling
    const petals = [
      [45, 35], [52, 48], [68, 42], [75, 55], [88, 38],
      [155, 40], [162, 52], [170, 45], [180, 38],
      [265, 50], [272, 58], [285, 52], [295, 45],
    ];
    for (const [px, py] of petals) {
      T.pixel(ctx, px, py, P.white);
    }

  } else if (params.season === 'autumn') {
    // --- Autumn: warm golden light, leaf particles ---
    T.scatter(ctx, 0, 0, 320, 140, P.yellow, 0.04);
    T.scatter(ctx, 0, 0, 320, 60, P.tan, 0.03);

    // Falling leaves drifting
    const leaves = [
      [48, 45], [55, 52], [70, 48], [82, 55], [95, 50],
      [160, 48], [168, 55], [175, 50], [185, 45],
      [268, 52], [275, 58], [288, 54], [298, 48],
    ];
    for (const [lx, ly] of leaves) {
      T.pixel(ctx, lx, ly, P.yellow);
      T.pixel(ctx, lx + 1, ly, P.brown);
    }

  } else {
    // --- Summer: bright warm sunlight, heat shimmer ---
    T.scatter(ctx, 0, 0, 320, 140, P.yellow, 0.03);
    T.scatter(ctx, 0, 0, 320, 60, P.white, 0.02);

    // Sun position (upper right)
    T.scatterCircle(ctx, 290, 15, 25, P.yellow, 0.08);
    T.scatterCircle(ctx, 290, 15, 15, P.white, 0.06);

    // Sunbeams through trees
    T.scatter(ctx, 40, 40, 20, 60, P.white, 0.03);
    T.scatter(ctx, 260, 45, 16, 50, P.white, 0.03);

    // Heat shimmer above grass
    T.scatter(ctx, 0, 60, 320, 3, P.white, 0.04);
  }

  // --- Clouds (all seasons) ---
  _drawCloud(ctx, P, 60, 10);
  _drawCloud(ctx, P, 180, 15);
  _drawCloud(ctx, P, 280, 8);

  // --- General ambient depth ---
  T.scatter(ctx, 0, 0, 10, 140, P.black, 0.02);
  T.scatter(ctx, 310, 0, 10, 140, P.black, 0.02);

  // --- Water sparkles (if water feature present) ---
  if (params.waterFeature === 'pond') {
    T.pixel(ctx, 210, 105, P.white);
    T.pixel(ctx, 225, 110, P.white);
    T.pixel(ctx, 235, 115, P.white);
  } else if (params.waterFeature === 'fountain') {
    T.pixel(ctx, 228, 98, P.white);
    T.pixel(ctx, 232, 100, P.white);
    T.pixel(ctx, 230, 102, P.white);
  }
}

function _drawCloud(ctx, P, x, y) {
  // Fluffy cloud using white pixels and scatter
  T.ellipse(ctx, x, y, 12, 4, P.white);
  T.ellipse(ctx, x + 8, y, 10, 4, P.white);
  T.ellipse(ctx, x + 4, y - 2, 8, 3, P.white);

  T.scatter(ctx, x - 12, y - 2, 32, 8, P.white, 0.4);
}
