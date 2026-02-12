/**
 * alien_planet.js — Sci-fi alien planet surface room template.
 *
 * Generates an otherworldly alien landscape with strange colored sky, unusual rock
 * formations, alien vegetation (glowing mushrooms/plants), and possibly distant
 * structures. All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';

export const metadata = {
  id: 'scifi/alien_planet',
  name: 'Alien Planet',
  setting: 'scifi',
  category: 'exterior',
  palette: 'alien_planet',
  params: {
    rockFormations: { type: 'enum', options: ['few', 'many', 'massive'], default: 'many', label: 'Rock Formations' },
    vegetation: { type: 'boolean', default: true, label: 'Alien Flora' },
    distantStructure: { type: 'boolean', default: true, label: 'Distant Structure' },
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
//  Layer 1 (BASE): Sky, horizon, ground — alien world foundation
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  // --- Sky (rows 0-65) ---
  // Multi-band alien sky — deep purple to magenta gradient
  T.rect(ctx, 0, 0, 320, 20, P.deep_purple);
  T.rect(ctx, 0, 20, 320, 18, P.dark_purple);
  T.rect(ctx, 0, 38, 320, 15, P.purple);
  T.rect(ctx, 0, 53, 320, 12, P.light_purple);

  // Subtle gradient transitions between sky bands
  T.dither(ctx, 0, 18, 320, 4, P.deep_purple, P.dark_purple, 0.3, 4);
  T.dither(ctx, 0, 36, 320, 4, P.dark_purple, P.purple, 0.3, 4);
  T.dither(ctx, 0, 51, 320, 4, P.purple, P.light_purple, 0.3, 4);

  // Strange cloud wisps — irregular organic shapes
  T.dither(ctx, 20, 8, 60, 12, P.deep_purple, P.magenta, 0.2, 4);
  T.dither(ctx, 180, 15, 80, 18, P.deep_purple, P.dark_purple, 0.25, 4);
  T.dither(ctx, 240, 25, 50, 15, P.dark_purple, P.purple, 0.2, 4);

  // --- Horizon line (row 65) ---
  T.rect(ctx, 0, 65, 320, 1, P.dark_brown);

  // --- Ground (rows 66-140) ---
  // Alien soil — dark brown/purple tinted earth
  T.rect(ctx, 0, 66, 320, 74, P.dark_brown);
  T.dither(ctx, 0, 66, 320, 74, P.dark_brown, P.deep_purple, 0.15, 4);

  // Ground texture patches — darker and lighter areas
  for (let i = 0; i < 8; i++) {
    const px = (i * 47) % 300;
    const pw = 30 + (i * 23) % 50;
    const py = 66 + (i * 11) % 60;
    const ph = 8 + (i * 7) % 15;
    T.dither(ctx, px, py, pw, ph, P.dark_brown, P.brown, 0.3, 4);
  }

  // Darker crevices and depressions
  for (let i = 0; i < 5; i++) {
    const px = 20 + (i * 67) % 270;
    const pw = 20 + (i * 13) % 35;
    const py = 75 + (i * 17) % 50;
    const ph = 6 + (i * 5) % 10;
    T.dither(ctx, px, py, pw, ph, P.dark_brown, P.black, 0.4, 4);
  }

  // Strange mineral deposits — orange/yellow crystalline patches
  for (let i = 0; i < 6; i++) {
    const mx = 30 + (i * 53) % 260;
    const mw = 12 + (i * 7) % 18;
    const my = 80 + (i * 19) % 45;
    const mh = 4 + (i * 3) % 6;
    const mineralColor = (i % 2 === 0) ? P.orange : P.yellow;
    T.dither(ctx, mx, my, mw, mh, P.dark_brown, mineralColor, 0.25, 4);
  }

  // Ground edge detail
  T.rect(ctx, 0, 66, 320, 1, P.brown);
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Rock formations, alien structures, major features
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- Rock formations ---
  if (params.rockFormations === 'massive') {
    _drawMassiveRockFormation(ctx, P);
  } else if (params.rockFormations === 'many') {
    _drawMultipleRockFormations(ctx, P);
  } else {
    _drawFewRockFormations(ctx, P);
  }

  // --- Distant alien structure ---
  if (params.distantStructure) {
    _drawDistantStructure(ctx, P);
  }

  // --- Large alien flora (if enabled, will add more in details layer) ---
  if (params.vegetation) {
    _drawLargeAlienPlant(ctx, P, 80, 90);
    _drawLargeAlienPlant(ctx, P, 240, 95);
  }
}

function _drawMassiveRockFormation(ctx, P) {
  // Giant rock spire dominating the scene
  const baseX = 140;
  const baseY = 100;
  const baseW = 60;
  const height = 70;

  // Rock base — irregular polygon
  T.polygonFill(ctx, [
    [baseX, baseY + 40],
    [baseX - 15, baseY + 20],
    [baseX - 10, baseY],
    [baseX + 10, baseY - height],
    [baseX + 20, baseY],
    [baseX + 25, baseY + 20],
    [baseX + baseW - 20, baseY + 40],
  ], P.dark_gray);

  // Rock texture dither
  T.dither(ctx, baseX - 15, baseY - height, baseW + 15, height + 40, P.dark_gray, P.black, 0.3, 4);

  // Rock highlight edge on left side
  for (let y = baseY - height; y < baseY + 40; y += 2) {
    const highlightX = baseX - 10 + Math.floor((y - (baseY - height)) * 0.05);
    T.pixel(ctx, highlightX, y, P.brown);
  }

  // Cracks and crevices
  T.line(ctx, baseX + 5, baseY - 50, baseX + 8, baseY + 20, P.black);
  T.line(ctx, baseX - 5, baseY - 30, baseX - 2, baseY + 10, P.black);

  // Additional medium rocks nearby
  _drawSingleRock(ctx, P, 60, 110, 35, 30);
  _drawSingleRock(ctx, P, 220, 115, 28, 25);
}

function _drawMultipleRockFormations(ctx, P) {
  // Several rock formations scattered across the landscape
  const rocks = [
    { x: 30, y: 95, w: 40, h: 45 },
    { x: 100, y: 100, w: 32, h: 40 },
    { x: 180, y: 105, w: 38, h: 35 },
    { x: 250, y: 98, w: 45, h: 42 },
  ];

  for (const rock of rocks) {
    _drawSingleRock(ctx, P, rock.x, rock.y, rock.w, rock.h);
  }
}

function _drawFewRockFormations(ctx, P) {
  // Just a couple of rock outcroppings
  _drawSingleRock(ctx, P, 50, 105, 35, 35);
  _drawSingleRock(ctx, P, 230, 110, 40, 30);
}

function _drawSingleRock(ctx, P, x, y, w, h) {
  // Irregular rock shape using polygon
  T.polygonFill(ctx, [
    [x, y + h],
    [x + w * 0.1, y + h * 0.6],
    [x + w * 0.2, y + h * 0.3],
    [x + w * 0.4, y],
    [x + w * 0.7, y + h * 0.2],
    [x + w * 0.9, y + h * 0.5],
    [x + w, y + h],
  ], P.dark_gray);

  // Rock texture
  T.dither(ctx, x, y, w, h, P.dark_gray, P.black, 0.35, 4);
  T.dither(ctx, x, y, w, h, P.dark_gray, P.brown, 0.15, 4);

  // Highlight edge on upper left
  for (let i = 0; i < Math.floor(h * 0.4); i += 2) {
    const hx = x + Math.floor(w * 0.2) + i / 3;
    const hy = y + Math.floor(h * 0.3) + i;
    T.pixel(ctx, hx, hy, P.brown);
  }

  // Cracks
  const crackY1 = y + Math.floor(h * 0.2);
  const crackY2 = y + Math.floor(h * 0.8);
  T.line(ctx, x + w / 3, crackY1, x + w / 3 + 5, crackY2, P.black);
}

function _drawDistantStructure(ctx, P) {
  // Mysterious alien structure on the horizon — geometric monolith
  const strX = 260;
  const strY = 45;
  const strW = 18;
  const strH = 20;

  // Main structure body
  T.rect(ctx, strX, strY, strW, strH, P.dark_purple);
  T.dither(ctx, strX, strY, strW, strH, P.dark_purple, P.black, 0.3, 4);

  // Structure top — pyramid cap
  T.polygonFill(ctx, [
    [strX, strY],
    [strX + strW / 2, strY - 6],
    [strX + strW, strY],
  ], P.purple);

  // Glowing energy core in center
  T.rect(ctx, strX + 7, strY + 8, 4, 6, P.magenta);
  T.rect(ctx, strX + 8, strY + 9, 2, 4, P.light_purple);

  // Structure edge highlights
  T.rect(ctx, strX, strY, 1, strH, P.purple);

  // Smaller adjacent structures
  T.rect(ctx, strX - 8, strY + 10, 6, 10, P.deep_purple);
  T.rect(ctx, strX + strW + 2, strY + 12, 5, 8, P.deep_purple);
}

function _drawLargeAlienPlant(ctx, P, x, y) {
  // Tall alien plant with bulbous top
  const stalkH = 25;
  const stalkW = 3;

  // Stalk
  T.rect(ctx, x, y, stalkW, stalkH, P.dark_green);
  T.rect(ctx, x, y, 1, stalkH, P.green);

  // Bulbous top — organic shape
  T.ellipse(ctx, x + 1, y - 4, 6, 8, P.light_green);
  T.circleFill(ctx, x + 1, y - 4, 6, P.dark_green);
  T.circleFill(ctx, x + 1, y - 4, 5, P.green);
  T.circleFill(ctx, x + 1, y - 4, 3, P.light_green);

  // Glowing spots on bulb
  T.pixel(ctx, x - 2, y - 5, P.bright_green);
  T.pixel(ctx, x + 3, y - 3, P.bright_green);
  T.pixel(ctx, x, y - 7, P.bright_green);

  // Small tendrils
  T.line(ctx, x - 1, y + 5, x - 4, y + 8, P.dark_green);
  T.line(ctx, x + stalkW + 1, y + 7, x + stalkW + 3, y + 10, P.dark_green);
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Alien vegetation, crystals, surface details, small objects
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Distant planet/moon in sky ---
  T.circleFill(ctx, 50, 18, 12, P.dark_purple);
  T.circleFill(ctx, 50, 18, 11, P.purple);
  T.circleFill(ctx, 50, 18, 10, P.light_purple);

  // Crescent highlight on planet
  for (let i = 0; i < 8; i++) {
    T.pixel(ctx, 44 + i, 14 + i, P.magenta);
  }

  // --- Stars in darker upper sky ---
  const stars = [
    [15, 8], [88, 5], [142, 12], [205, 7], [268, 10], [310, 6],
    [35, 14], [165, 9], [245, 15], [285, 11],
  ];

  for (const [sx, sy] of stars) {
    T.pixel(ctx, sx, sy, P.white);
    if ((sx + sy) % 3 === 0) {
      T.pixel(ctx, sx + 1, sy, P.light_purple);
    }
  }

  // --- Alien vegetation (if enabled) ---
  if (params.vegetation) {
    // Glowing mushrooms scattered on ground
    _drawGlowingMushroom(ctx, P, 45, 125, 6, P.magenta);
    _drawGlowingMushroom(ctx, P, 58, 128, 5, P.light_purple);
    _drawGlowingMushroom(ctx, P, 120, 130, 7, P.purple);
    _drawGlowingMushroom(ctx, P, 155, 127, 6, P.magenta);
    _drawGlowingMushroom(ctx, P, 200, 132, 5, P.light_purple);
    _drawGlowingMushroom(ctx, P, 265, 129, 8, P.purple);
    _drawGlowingMushroom(ctx, P, 290, 131, 5, P.magenta);

    // Strange tendril plants
    _drawTendrilPlant(ctx, P, 25, 115);
    _drawTendrilPlant(ctx, P, 140, 118);
    _drawTendrilPlant(ctx, P, 220, 120);

    // Crystal flowers
    _drawCrystalFlower(ctx, P, 105, 123);
    _drawCrystalFlower(ctx, P, 185, 125);
    _drawCrystalFlower(ctx, P, 245, 122);

    // Alien grass tufts
    for (let gx = 10; gx < 310; gx += 20) {
      const gy = 125 + (gx * 3) % 12;
      _drawGrassTuft(ctx, P, gx, gy);
    }
  }

  // --- Crystal formations on ground ---
  _drawCrystalFormation(ctx, P, 70, 115, P.orange);
  _drawCrystalFormation(ctx, P, 165, 118, P.yellow);
  _drawCrystalFormation(ctx, P, 280, 112, P.orange);

  // --- Strange rock spires (small) ---
  for (let i = 0; i < 5; i++) {
    const sx = 40 + i * 60;
    const sy = 105 + (i * 7) % 15;
    const sh = 8 + (i * 3) % 10;
    T.rect(ctx, sx, sy, 2, sh, P.dark_gray);
    T.pixel(ctx, sx, sy, P.brown);
  }

  // --- Ground fissures (cracks in alien soil) ---
  T.line(ctx, 15, 90, 45, 110, P.black);
  T.line(ctx, 45, 110, 60, 135, P.black);

  T.line(ctx, 130, 95, 145, 115, P.black);
  T.line(ctx, 145, 115, 155, 138, P.black);

  T.line(ctx, 210, 100, 235, 125, P.black);

  // --- Steam vents (alien geothermal activity) ---
  T.rect(ctx, 95, 132, 6, 4, P.black);
  T.rect(ctx, 96, 133, 4, 2, P.deep_purple);

  T.rect(ctx, 190, 135, 5, 3, P.black);
  T.rect(ctx, 191, 136, 3, 1, P.deep_purple);

  // --- Alien artifacts scattered on ground ---
  // Strange metallic fragment
  T.rect(ctx, 175, 128, 8, 4, P.dark_gray);
  T.pixel(ctx, 176, 129, P.light_purple);
  T.pixel(ctx, 180, 130, P.magenta);

  // Glowing orb
  T.circleFill(ctx, 230, 126, 3, P.magenta);
  T.pixel(ctx, 230, 126, P.light_purple);

  // --- Distant mountains silhouette on horizon ---
  for (let mx = 0; mx < 320; mx += 40) {
    const mh = 8 + (mx / 10) % 15;
    T.polygonFill(ctx, [
      [mx, 65],
      [mx + 15, 65 - mh],
      [mx + 30, 65 - mh + 5],
      [mx + 40, 65],
    ], P.deep_purple);
  }
}

function _drawGlowingMushroom(ctx, P, x, y, size, glowColor) {
  // Mushroom stalk
  const stalkH = Math.floor(size * 0.6);
  const stalkW = Math.max(2, Math.floor(size * 0.3));
  T.rect(ctx, x, y, stalkW, stalkH, P.dark_brown);

  // Mushroom cap
  const capR = Math.floor(size / 2);
  T.circleFill(ctx, x + Math.floor(stalkW / 2), y - capR, capR, glowColor);
  T.circleFill(ctx, x + Math.floor(stalkW / 2), y - capR, capR - 1, T.lighten(glowColor, 30));

  // Glowing spots on cap
  for (let i = 0; i < 3; i++) {
    const spotX = x - capR + 2 + i * Math.floor(size / 2);
    const spotY = y - capR;
    T.pixel(ctx, spotX, spotY, P.white);
  }
}

function _drawTendrilPlant(ctx, P, x, y) {
  // Multiple curving tendrils
  for (let i = 0; i < 3; i++) {
    const startX = x + i * 3;
    const length = 8 + i * 2;

    for (let j = 0; j < length; j++) {
      const tx = startX + Math.floor(Math.sin(j * 0.5) * 2);
      const ty = y + j;
      T.pixel(ctx, tx, ty, P.dark_green);
    }

    // Tip bulb
    const tipX = startX + Math.floor(Math.sin((length - 1) * 0.5) * 2);
    const tipY = y + length;
    T.pixel(ctx, tipX, tipY, P.green);
    T.pixel(ctx, tipX, tipY + 1, P.light_green);
  }
}

function _drawCrystalFlower(ctx, P, x, y) {
  // Center
  T.pixel(ctx, x, y, P.yellow);

  // Petals radiating outward
  const petals = [
    [-2, -2], [0, -3], [2, -2],
    [-3, 0], [3, 0],
    [-2, 2], [0, 3], [2, 2],
  ];

  for (const [dx, dy] of petals) {
    T.pixel(ctx, x + dx, y + dy, P.orange);
  }
}

function _drawGrassTuft(ctx, P, x, y) {
  // Several thin blades
  for (let i = 0; i < 3; i++) {
    const bladeX = x + i;
    const bladeH = 3 + i;
    T.rect(ctx, bladeX, y, 1, bladeH, P.dark_green);
    T.pixel(ctx, bladeX, y, P.green);
  }
}

function _drawCrystalFormation(ctx, P, x, y, color) {
  // Several angular crystal spikes
  const crystals = [
    { x: 0, y: 0, w: 3, h: 10 },
    { x: 4, y: 3, w: 3, h: 8 },
    { x: 8, y: 1, w: 2, h: 9 },
  ];

  for (const crystal of crystals) {
    const cx = x + crystal.x;
    const cy = y + crystal.y;

    // Crystal body — tapered polygon
    T.polygonFill(ctx, [
      [cx, cy + crystal.h],
      [cx + Math.floor(crystal.w / 2), cy],
      [cx + crystal.w, cy + crystal.h],
    ], color);

    // Highlight edge
    T.line(ctx, cx + Math.floor(crystal.w / 2), cy, cx, cy + crystal.h, T.lighten(color, 40));

    // Facet line
    T.line(ctx, cx + Math.floor(crystal.w / 2), cy + 2, cx + crystal.w, cy + crystal.h, T.darken(color, 20));
  }
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Rock shadows, plant shadows, ambient occlusion
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  // --- Rock formation shadows on ground ---
  if (params.rockFormations === 'massive') {
    T.scatter(ctx, 125, 140, 80, 0, P.black, 0.3);
    T.scatter(ctx, 55, 135, 40, 5, P.black, 0.25);
    T.scatter(ctx, 215, 135, 32, 5, P.black, 0.25);
  } else if (params.rockFormations === 'many') {
    T.scatter(ctx, 25, 135, 45, 5, P.black, 0.25);
    T.scatter(ctx, 95, 135, 37, 5, P.black, 0.25);
    T.scatter(ctx, 175, 135, 43, 5, P.black, 0.25);
    T.scatter(ctx, 245, 135, 50, 5, P.black, 0.25);
  } else {
    T.scatter(ctx, 45, 135, 40, 5, P.black, 0.25);
    T.scatter(ctx, 225, 135, 45, 5, P.black, 0.25);
  }

  // --- Large plant shadows ---
  if (params.vegetation) {
    T.scatter(ctx, 76, 115, 12, 6, P.black, 0.2);
    T.scatter(ctx, 236, 120, 12, 6, P.black, 0.2);
  }

  // --- General ground shadow gradient (darker in foreground) ---
  T.scatter(ctx, 0, 125, 320, 15, P.black, 0.12);

  // --- Horizon shadow — atmospheric depth ---
  T.scatter(ctx, 0, 60, 320, 10, P.black, 0.15);

  // --- Distant structure shadow ---
  if (params.distantStructure) {
    T.scatter(ctx, 258, 65, 22, 3, P.black, 0.2);
  }

  // --- Rock crevice shadows (internal darkness) ---
  if (params.rockFormations === 'massive') {
    T.scatter(ctx, 135, 50, 15, 40, P.black, 0.2);
  }

  // --- Ambient occlusion in corners and edges ---
  T.scatter(ctx, 0, 0, 40, 40, P.black, 0.1);
  T.scatter(ctx, 280, 0, 40, 40, P.black, 0.1);
  T.scatter(ctx, 0, 110, 40, 30, P.black, 0.15);
  T.scatter(ctx, 280, 110, 40, 30, P.black, 0.15);

  // --- Ground depression shadows ---
  T.scatter(ctx, 30, 85, 30, 15, P.black, 0.18);
  T.scatter(ctx, 140, 95, 40, 20, P.black, 0.18);
  T.scatter(ctx, 250, 90, 35, 18, P.black, 0.18);
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Alien sky glow, fog, bioluminescence, particles
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  // --- Purple atmospheric wash across entire scene ---
  T.scatter(ctx, 0, 0, 320, 140, P.purple, 0.04);

  // --- Upper sky magenta glow ---
  T.scatter(ctx, 0, 0, 320, 40, P.magenta, 0.03);

  // --- Horizon glow — distant light source (alien sun) ---
  T.scatterCircle(ctx, 280, 50, 80, P.light_purple, 0.08);
  T.scatterCircle(ctx, 280, 50, 120, P.purple, 0.04);

  // --- Ground fog/mist rising from surface ---
  T.scatter(ctx, 0, 115, 320, 25, P.deep_purple, 0.06);

  // --- Bioluminescent glow from mushrooms ---
  if (params.vegetation) {
    T.scatterCircle(ctx, 45, 125, 10, P.magenta, 0.12);
    T.scatterCircle(ctx, 58, 128, 8, P.light_purple, 0.12);
    T.scatterCircle(ctx, 120, 130, 12, P.purple, 0.12);
    T.scatterCircle(ctx, 155, 127, 10, P.magenta, 0.12);
    T.scatterCircle(ctx, 200, 132, 8, P.light_purple, 0.12);
    T.scatterCircle(ctx, 265, 129, 14, P.purple, 0.12);
    T.scatterCircle(ctx, 290, 131, 8, P.magenta, 0.12);

    // Large plant bioluminescence
    T.scatterCircle(ctx, 81, 65, 20, P.bright_green, 0.1);
    T.scatterCircle(ctx, 241, 70, 20, P.bright_green, 0.1);
  }

  // --- Crystal glow ---
  T.scatterCircle(ctx, 75, 120, 15, P.orange, 0.08);
  T.scatterCircle(ctx, 170, 123, 15, P.yellow, 0.08);
  T.scatterCircle(ctx, 285, 117, 15, P.orange, 0.08);

  // --- Distant structure energy glow ---
  if (params.distantStructure) {
    T.scatterCircle(ctx, 269, 55, 25, P.magenta, 0.15);
    T.scatterCircle(ctx, 269, 55, 40, P.light_purple, 0.08);
  }

  // --- Alien spores/particles floating in air ---
  const spores = [
    [25, 45], [60, 52], [105, 48], [145, 55], [190, 50],
    [230, 58], [275, 53], [310, 47], [40, 70], [85, 68],
    [130, 75], [175, 72], [220, 78], [265, 70], [295, 74],
    [15, 95], [70, 90], [120, 98], [170, 92], [215, 100],
    [260, 95], [305, 88],
  ];

  for (const [sx, sy] of spores) {
    const sporeColor = ((sx + sy) % 3 === 0) ? P.light_purple : ((sx + sy) % 3 === 1) ? P.magenta : P.bright_green;
    T.pixel(ctx, sx, sy, sporeColor);

    // Some spores have a trailing glow
    if ((sx + sy) % 5 === 0) {
      T.pixel(ctx, sx - 1, sy + 1, T.darken(sporeColor, 40));
    }
  }

  // --- Steam/gas rising from vents ---
  T.scatterCircle(ctx, 98, 125, 12, P.pale_gray, 0.08);
  T.scatterCircle(ctx, 192, 130, 10, P.pale_gray, 0.08);

  // --- Subtle vignette: darken extreme corners ---
  T.scatter(ctx, 0, 0, 35, 30, P.black, 0.08);
  T.scatter(ctx, 285, 0, 35, 30, P.black, 0.08);
  T.scatter(ctx, 0, 110, 35, 30, P.black, 0.08);
  T.scatter(ctx, 285, 110, 35, 30, P.black, 0.08);

  // --- Atmospheric haze depth — lighter purple wash in mid-ground ---
  T.scatter(ctx, 0, 50, 320, 30, P.light_purple, 0.03);
}
