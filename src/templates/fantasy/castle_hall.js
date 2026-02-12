/**
 * castle_hall.js — Grand Castle Hall room template.
 *
 * A majestic interior scene: tall stone walls, ornate pillars supporting vaulted ceiling,
 * arched stained-glass windows letting in colored light, royal banners hanging from walls,
 * a red carpet running down the center, wrought-iron torch sconces, suit of armor display.
 *
 * Uses PixelArtToolkit primitives exclusively. 5-layer rendering contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';
import { drawStoneWall, drawWindow } from '../_base.js';

export const metadata = {
  id: 'fantasy/castle_hall',
  name: 'Castle Hall',
  setting: 'fantasy',
  category: 'interior',
  palette: 'castle_grand',
  params: {
    hasBanners:    { type: 'boolean', default: true,    label: 'Royal Banners' },
    hasPillars:    { type: 'boolean', default: true,    label: 'Stone Pillars' },
    hasArmor:      { type: 'boolean', default: true,    label: 'Suit of Armor' },
    carpetColor:   { type: 'string',  default: 'red',   label: 'Carpet Color', options: ['red', 'blue', 'purple'] },
    windowStyle:   { type: 'string',  default: 'stained', label: 'Window Style', options: ['stained', 'plain'] },
    lighting:      { type: 'string',  default: 'warm',  label: 'Lighting', options: ['warm', 'cool', 'dramatic'] },
  },
};

export function generate(ctx, P, params = {}) {
  const p = { ...Object.fromEntries(Object.entries(metadata.params).map(([k, v]) => [k, v.default])), ...params };
  _base(ctx, P, p);
  _structures(ctx, P, p);
  _details(ctx, P, p);
  _shading(ctx, P, p);
  _atmosphere(ctx, P, p);
}

// =========================================================================
//  Layer 1 — BASE: Ceiling, back wall, floor
// =========================================================================

function _base(ctx, P, params) {
  // --- Vaulted ceiling with stone ribs ---
  // Dark stone ceiling base
  T.rect(ctx, 0, 0, 320, 30, P.dark_gray);

  // Ceiling stone block texture
  for (let row = 0; row < 4; row++) {
    const cy = row * 7;
    const offset = (row % 2) * 15;
    for (let col = 0; col < 12; col++) {
      const cx = col * 30 + offset;
      if ((col + row) % 2 === 0) {
        T.rect(ctx, cx + 1, cy + 1, 28, 5, P.gray);
      }
    }
    T.line(ctx, 0, cy, 320, cy, P.black);
  }

  // Vaulted ceiling ribs (arched stone supports)
  for (const ribX of [80, 160, 240]) {
    T.rect(ctx, ribX - 2, 0, 4, 30, P.gray);
    T.line(ctx, ribX - 2, 0, ribX - 2, 30, P.light_gray);
    T.line(ctx, ribX + 2, 0, ribX + 2, 30, P.dark_gray);
  }

  // Central keystone arch detail
  T.rect(ctx, 156, 0, 8, 6, P.light_gray);
  T.rect(ctx, 157, 1, 6, 4, P.white);

  // --- Back wall: Tall stone wall with architectural detail ---
  // Main stone wall area
  drawStoneWall(ctx, P, 0, 30, 320, 50, {
    wallColor: P.gray,
    mortarColor: P.dark_gray,
    brickW: 20,
    brickH: 8,
  });

  // Stone trim at top of wall (below ceiling)
  T.rect(ctx, 0, 30, 320, 4, P.light_gray);
  T.line(ctx, 0, 30, 320, 30, P.white);
  T.line(ctx, 0, 33, 320, 33, P.dark_gray);

  // --- Floor: Polished stone tiles with carpet runner ---
  // Base stone tile floor
  T.rect(ctx, 0, 80, 320, 60, P.gray);

  // Large tile pattern (16x16 tiles)
  for (let row = 0; row < 4; row++) {
    const fy = 80 + row * 15;
    T.line(ctx, 0, fy, 320, fy, P.dark_gray);
    for (let col = 0; col < 21; col++) {
      const fx = col * 16;
      T.line(ctx, fx, 80, fx, 140, P.dark_gray);
      // Alternating tile shading for checkerboard effect
      if ((row + col) % 2 === 0) {
        T.rect(ctx, fx + 1, fy + 1, 15, 14, P.light_gray);
      }
    }
  }

  // Carpet runner down the center
  const carpetColorMap = {
    red: P.dark_red,
    blue: P.dark_blue,
    purple: P.dark_purple || P.dark_blue,
  };
  const carpetColor = carpetColorMap[params.carpetColor] || P.dark_red;
  const carpetX = 120;
  const carpetW = 80;

  // Carpet body
  T.rect(ctx, carpetX, 80, carpetW, 60, carpetColor);

  // Carpet border trim (darker edges)
  T.rect(ctx, carpetX, 80, 3, 60, P.black);
  T.rect(ctx, carpetX + carpetW - 3, 80, 3, 60, P.black);

  // Carpet decorative pattern (diamonds)
  for (let i = 0; i < 4; i++) {
    const dy = 88 + i * 13;
    const dcx = carpetX + carpetW / 2;
    T.polygonFill(ctx, [
      [dcx, dy],
      [dcx - 4, dy + 4],
      [dcx, dy + 8],
      [dcx + 4, dy + 4],
    ], P.yellow);
    T.polygonFill(ctx, [
      [dcx, dy + 1],
      [dcx - 3, dy + 4],
      [dcx, dy + 7],
      [dcx + 3, dy + 4],
    ], carpetColor);
  }

  // Carpet fringe at near edge
  for (let fx = carpetX; fx < carpetX + carpetW; fx += 3) {
    T.line(ctx, fx, 137, fx, 140, carpetColor);
  }
}

// =========================================================================
//  Layer 2 — STRUCTURES: Pillars, windows, banners, armor stand
// =========================================================================

function _structures(ctx, P, params) {
  // --- Stone pillars (conditional) ---
  if (params.hasPillars) {
    for (const pillarX of [20, 300]) {
      // Pillar base
      T.rect(ctx, pillarX - 12, 75, 24, 5, P.dark_gray);
      T.line(ctx, pillarX - 12, 75, pillarX + 12, 75, P.light_gray);

      // Pillar shaft
      T.rect(ctx, pillarX - 8, 35, 16, 40, P.gray);

      // Vertical highlights and shadows for cylindrical appearance
      T.line(ctx, pillarX - 8, 35, pillarX - 8, 75, P.dark_gray);
      T.line(ctx, pillarX - 6, 35, pillarX - 6, 75, P.light_gray);
      T.line(ctx, pillarX + 6, 35, pillarX + 6, 75, P.dark_gray);
      T.line(ctx, pillarX + 8, 35, pillarX + 8, 75, P.light_gray);

      // Fluting detail (vertical grooves)
      for (let i = -4; i <= 4; i += 4) {
        T.line(ctx, pillarX + i, 36, pillarX + i, 74, P.dark_gray);
      }

      // Capital (top ornament)
      T.rect(ctx, pillarX - 10, 32, 20, 3, P.light_gray);
      T.line(ctx, pillarX - 10, 32, pillarX + 10, 32, P.white);
      T.line(ctx, pillarX - 10, 34, pillarX + 10, 34, P.gray);

      // Capital decorative band
      T.rect(ctx, pillarX - 9, 33, 18, 1, P.yellow);
    }
  }

  // --- Arched windows ---
  const windowConfigs = [
    { x: 50, y: 36, w: 24, h: 38 },
    { x: 246, y: 36, w: 24, h: 38 },
  ];

  for (const win of windowConfigs) {
    // Window recess (inset into wall)
    T.rect(ctx, win.x - 2, win.y - 2, win.w + 4, win.h + 4, P.dark_gray);

    // Arched top
    T.polygonFill(ctx, [
      [win.x, win.y + 10],
      [win.x + 4, win.y + 2],
      [win.x + win.w / 2, win.y],
      [win.x + win.w - 4, win.y + 2],
      [win.x + win.w, win.y + 10],
    ], P.dark_gray);

    if (params.windowStyle === 'stained') {
      // Stained glass sections
      const glassColors = [P.dark_blue, P.dark_red, P.dark_purple || P.dark_blue, P.dark_green || P.dark_blue];
      const sections = 4;
      const sectionH = Math.floor(win.h / sections);

      for (let i = 0; i < sections; i++) {
        const glassY = win.y + i * sectionH;
        const glassColor = glassColors[i % glassColors.length];
        T.rect(ctx, win.x + 2, glassY + 2, win.w - 4, sectionH - 2, glassColor);
      }

      // Cross bars
      const midX = win.x + win.w / 2;
      T.rect(ctx, midX - 1, win.y, 2, win.h, P.black);
      for (let i = 1; i < sections; i++) {
        const barY = win.y + i * sectionH;
        T.rect(ctx, win.x, barY - 1, win.w, 2, P.black);
      }
    } else {
      // Plain glass
      T.rect(ctx, win.x + 2, win.y + 2, win.w - 4, win.h - 4, P.dark_blue);
      // Reflection glint
      T.pixel(ctx, win.x + 4, win.y + 4, P.white);
    }

    // Stone frame
    T.rect(ctx, win.x, win.y, win.w, win.h, P.gray);
    T.rect(ctx, win.x + 2, win.y + 2, win.w - 4, win.h - 4, P.black);

    // Re-draw glass in proper position
    if (params.windowStyle === 'stained') {
      const glassColors = [P.dark_blue, P.dark_red, P.dark_purple || P.dark_blue, P.dark_green || P.dark_blue];
      const sections = 4;
      const sectionH = Math.floor((win.h - 4) / sections);

      for (let i = 0; i < sections; i++) {
        const glassY = win.y + 2 + i * sectionH;
        const glassColor = glassColors[i % glassColors.length];
        T.rect(ctx, win.x + 3, glassY + 1, win.w - 6, sectionH - 2, glassColor);
      }

      const midX = win.x + win.w / 2;
      T.rect(ctx, midX - 1, win.y + 2, 2, win.h - 4, P.dark_gray);
      for (let i = 1; i < sections; i++) {
        const barY = win.y + 2 + i * sectionH;
        T.rect(ctx, win.x + 3, barY - 1, win.w - 6, 2, P.dark_gray);
      }
    } else {
      T.rect(ctx, win.x + 3, win.y + 3, win.w - 6, win.h - 6, P.dark_blue);
      T.pixel(ctx, win.x + 5, win.y + 5, P.white);
      T.pixel(ctx, win.x + 6, win.y + 6, P.light_gray);
    }
  }

  // --- Royal banners (conditional) ---
  if (params.hasBanners) {
    const bannerPositions = [
      { x: 90, y: 32 },
      { x: 230, y: 32 },
    ];

    for (const banner of bannerPositions) {
      // Banner pole
      T.rect(ctx, banner.x, banner.y, 2, 50, P.dark_brown);
      T.line(ctx, banner.x, banner.y, banner.x, banner.y + 50, P.brown);

      // Banner fabric
      T.rect(ctx, banner.x + 2, banner.y + 2, 18, 28, P.dark_red);

      // Banner emblem (simplified heraldic shield)
      T.polygonFill(ctx, [
        [banner.x + 11, banner.y + 8],
        [banner.x + 7, banner.y + 12],
        [banner.x + 7, banner.y + 18],
        [banner.x + 11, banner.y + 22],
        [banner.x + 15, banner.y + 18],
        [banner.x + 15, banner.y + 12],
      ], P.yellow);

      // Inner shield detail
      T.rect(ctx, banner.x + 10, banner.y + 13, 3, 5, P.dark_red);

      // Banner edge trim
      T.line(ctx, banner.x + 2, banner.y + 2, banner.x + 20, banner.y + 2, P.yellow);
      T.line(ctx, banner.x + 2, banner.y + 2, banner.x + 2, banner.y + 30, P.yellow);

      // Banner tassels at bottom
      for (let tx = 0; tx < 18; tx += 4) {
        T.line(ctx, banner.x + 2 + tx, banner.y + 30, banner.x + 2 + tx + 1, banner.y + 34, P.dark_red);
      }
    }
  }

  // --- Suit of armor display (conditional) ---
  if (params.hasArmor) {
    const armorX = params.hasPillars ? 290 : 280;
    const armorY = 78;

    // Wooden stand base
    T.rect(ctx, armorX - 10, armorY + 50, 20, 4, P.brown);
    T.line(ctx, armorX - 10, armorY + 50, armorX + 10, armorY + 50, P.tan);

    // Stand post
    T.rect(ctx, armorX - 2, armorY + 20, 4, 30, P.dark_brown);

    // Helmet
    T.rect(ctx, armorX - 6, armorY, 12, 10, P.gray);
    T.rect(ctx, armorX - 5, armorY + 1, 10, 8, P.dark_gray);
    T.line(ctx, armorX - 6, armorY, armorX - 6, armorY + 10, P.light_gray);
    T.line(ctx, armorX + 6, armorY, armorX + 6, armorY + 10, P.dark_gray);

    // Visor slit
    T.rect(ctx, armorX - 4, armorY + 4, 8, 2, P.black);

    // Helmet plume holder
    T.rect(ctx, armorX - 1, armorY - 2, 2, 3, P.yellow);
    T.line(ctx, armorX, armorY - 2, armorX, armorY - 4, P.red);

    // Breastplate
    T.rect(ctx, armorX - 8, armorY + 10, 16, 18, P.gray);
    T.line(ctx, armorX - 8, armorY + 10, armorX - 8, armorY + 28, P.light_gray);
    T.line(ctx, armorX + 8, armorY + 10, armorX + 8, armorY + 28, P.dark_gray);
    T.rect(ctx, armorX - 7, armorY + 11, 14, 16, P.dark_gray);

    // Central ridge line for depth
    T.line(ctx, armorX, armorY + 10, armorX, armorY + 28, P.light_gray);

    // Pauldrons (shoulders)
    T.rect(ctx, armorX - 10, armorY + 10, 3, 8, P.gray);
    T.rect(ctx, armorX + 7, armorY + 10, 3, 8, P.gray);
    T.line(ctx, armorX - 10, armorY + 10, armorX - 10, armorY + 18, P.light_gray);
    T.line(ctx, armorX + 9, armorY + 10, armorX + 9, armorY + 18, P.dark_gray);

    // Gauntlets
    T.rect(ctx, armorX - 10, armorY + 18, 3, 10, P.dark_gray);
    T.rect(ctx, armorX + 7, armorY + 18, 3, 10, P.dark_gray);
    T.pixel(ctx, armorX - 9, armorY + 19, P.light_gray);
    T.pixel(ctx, armorX + 8, armorY + 19, P.light_gray);

    // Tassets (hip armor)
    T.rect(ctx, armorX - 8, armorY + 28, 6, 8, P.gray);
    T.rect(ctx, armorX + 2, armorY + 28, 6, 8, P.gray);

    // Greaves (leg armor)
    T.rect(ctx, armorX - 6, armorY + 36, 4, 14, P.dark_gray);
    T.rect(ctx, armorX + 2, armorY + 36, 4, 14, P.dark_gray);
    T.line(ctx, armorX - 6, armorY + 36, armorX - 6, armorY + 50, P.light_gray);
    T.line(ctx, armorX + 5, armorY + 36, armorX + 5, armorY + 50, P.black);
  }

  // --- Torch sconces on walls ---
  for (const torchX of [5, 315]) {
    const torchY = 48;

    // Wall bracket (wrought iron)
    T.polygonFill(ctx, [
      [torchX, torchY],
      [torchX + (torchX < 160 ? 8 : -8), torchY + 4],
      [torchX + (torchX < 160 ? 8 : -8), torchY + 8],
      [torchX, torchY + 12],
    ], P.black);

    // Bracket attachment rivets
    T.pixel(ctx, torchX, torchY + 2, P.gray);
    T.pixel(ctx, torchX, torchY + 10, P.gray);

    // Torch handle
    const handleX = torchX + (torchX < 160 ? 8 : -8);
    T.rect(ctx, handleX, torchY + 4, 2, 8, P.dark_brown);

    // Torch head (flame)
    const flameX = handleX + (torchX < 160 ? 2 : -2);
    T.rect(ctx, flameX - 2, torchY, 4, 4, P.dark_brown);
    T.polygonFill(ctx, [
      [flameX, torchY - 6],
      [flameX - 2, torchY],
      [flameX + 2, torchY],
    ], P.orange);
    T.polygonFill(ctx, [
      [flameX, torchY - 5],
      [flameX - 1, torchY],
      [flameX + 1, torchY],
    ], P.yellow);
    T.pixel(ctx, flameX, torchY - 4, P.white);
  }
}

// =========================================================================
//  Layer 3 — DETAILS: Decorative elements, highlights
// =========================================================================

function _details(ctx, P, params) {
  // Wall sconce flame glow detail
  for (const glowX of [5, 315]) {
    T.pixel(ctx, glowX + (glowX < 160 ? 8 : -8), 42, P.yellow);
    T.pixel(ctx, glowX + (glowX < 160 ? 7 : -7), 43, P.orange);
  }

  // Carpet highlights (sheen effect)
  for (let i = 0; i < 3; i++) {
    const hx = 140 + i * 20;
    const hy = 95 + i * 12;
    T.pixel(ctx, hx, hy, P.red);
    T.pixel(ctx, hx + 1, hy, P.red);
  }

  // Floor tile grout highlights
  for (let i = 0; i < 8; i++) {
    const tx = 10 + i * 40;
    const ty = 90 + (i % 3) * 15;
    T.pixel(ctx, tx, ty, P.light_gray);
  }

  // Stone wall weathering marks
  for (let i = 0; i < 12; i++) {
    const wx = 5 + i * 26;
    const wy = 35 + (i % 4) * 10;
    T.pixel(ctx, wx, wy, P.dark_gray);
    if (i % 3 === 0) {
      T.pixel(ctx, wx + 1, wy + 1, P.dark_gray);
    }
  }

  // Pillar capital ornaments (if pillars present)
  if (params.hasPillars) {
    for (const px of [20, 300]) {
      // Decorative acanthus leaf suggestion
      T.pixel(ctx, px - 7, 33, P.yellow);
      T.pixel(ctx, px + 7, 33, P.yellow);
      T.pixel(ctx, px, 33, P.yellow);
    }
  }

  // Banner fabric folds
  if (params.hasBanners) {
    for (const bx of [90, 230]) {
      for (let fold = 0; fold < 5; fold++) {
        const fy = bx + 6 + fold * 5;
        T.line(ctx, bx + 2, fy, bx + 20, fy, P.black);
      }
    }
  }
}

// =========================================================================
//  Layer 4 — SHADING: Shadows (scatter/scatterCircle only)
// =========================================================================

function _shading(ctx, P, params) {
  // Ambient occlusion: ceiling-to-wall transition
  T.scatter(ctx, 0, 29, 320, 3, P.black, 0.5, 4);

  // Wall-to-floor transition shadow
  T.scatter(ctx, 0, 78, 320, 3, P.black, 0.5, 4);

  // Pillar shadows on floor
  if (params.hasPillars) {
    T.scatter(ctx, 12, 80, 16, 60, P.black, 0.3, 4);
    T.scatter(ctx, 292, 80, 16, 60, P.black, 0.3, 4);
  }

  // Carpet edge shadows
  T.scatter(ctx, 120, 80, 3, 60, P.black, 0.4, 4);
  T.scatter(ctx, 197, 80, 3, 60, P.black, 0.4, 4);

  // Window recess shadows
  T.scatter(ctx, 48, 34, 28, 42, P.black, 0.15, 4);
  T.scatter(ctx, 244, 34, 28, 42, P.black, 0.15, 4);

  // Banner shadows on wall
  if (params.hasBanners) {
    T.scatter(ctx, 92, 34, 20, 30, P.black, 0.2, 4);
    T.scatter(ctx, 232, 34, 20, 30, P.black, 0.2, 4);
  }

  // Torch glow on walls
  for (const glowX of [5, 315]) {
    T.scatterCircle(ctx, glowX + (glowX < 160 ? 8 : -8), 48, 25, P.orange, 0.15, 4);
  }

  // Dramatic lighting from windows (if stained glass)
  if (params.windowStyle === 'stained') {
    // Colored light pools on floor
    T.scatterCircle(ctx, 62, 100, 30, P.dark_blue, 0.08, 4);
    T.scatterCircle(ctx, 258, 100, 30, P.dark_red, 0.08, 4);
  }
}

// =========================================================================
//  Layer 5 — ATMOSPHERE: Ambient effects (scatter/scatterCircle/pixel only)
// =========================================================================

function _atmosphere(ctx, P, params) {
  if (params.lighting === 'warm') {
    // Golden ambient light
    T.scatter(ctx, 0, 0, 320, 140, P.amber, 0.04, 4);
    T.scatter(ctx, 0, 0, 320, 140, P.yellow, 0.02, 4);
  } else if (params.lighting === 'cool') {
    // Cool moonlight through windows
    T.scatter(ctx, 0, 0, 320, 140, P.dark_blue, 0.05, 4);
    T.scatter(ctx, 0, 0, 320, 140, P.white, 0.01, 4);
  } else if (params.lighting === 'dramatic') {
    // High contrast with deep shadows
    T.scatter(ctx, 0, 0, 320, 140, P.black, 0.08, 4);
    T.scatter(ctx, 0, 40, 320, 40, P.orange, 0.06, 4);
  }

  // Dust motes in sunbeams from windows
  for (let i = 0; i < 20; i++) {
    const mx = 50 + (i * 17) % 220;
    const my = 35 + (i * 23) % 45;
    if (mx < 74 || (mx > 220 && mx < 270)) {
      T.pixel(ctx, mx, my, P.white);
    }
  }
}
