/**
 * village_square.js — Village Square room template.
 *
 * Parameterized from the existing ProceduralAssets village_square code.
 * Exterior scene: sky with clouds, cobblestone/dirt/grass ground,
 * flanking buildings, optional central well, market stall, and notice board.
 *
 * Uses PixelArtToolkit primitives exclusively. 5-layer rendering contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';
import { drawSkyBands, drawCobblestone, drawDirtGround } from '../_base.js';

export const metadata = {
  id: 'fantasy/village_square',
  name: 'Village Square',
  setting: 'fantasy',
  category: 'exterior',
  palette: 'village_square',
  params: {
    hasWell:        { type: 'boolean', default: true,          label: 'Central well' },
    hasMarketStall: { type: 'boolean', default: true,          label: 'Market stall' },
    hasNoticeBoard: { type: 'boolean', default: true,          label: 'Notice board' },
    skyType:        { type: 'string',  default: 'day',         label: 'Sky type', options: ['day', 'sunset', 'overcast'] },
    groundType:     { type: 'string',  default: 'cobblestone', label: 'Ground type', options: ['cobblestone', 'dirt', 'grass'] },
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
//  Layer 1 — BASE: Sky, ground
// =========================================================================

function _base(ctx, P, params) {
  // --- Sky ---
  if (params.skyType === 'sunset') {
    T.rect(ctx, 0, 0, 320, 10, P.dark_blue);
    T.rect(ctx, 0, 10, 320, 12, P.blue);
    T.rect(ctx, 0, 22, 320, 12, P.red);
    T.rect(ctx, 0, 34, 320, 10, P.yellow);
    T.rect(ctx, 0, 44, 320, 11, P.white);
    // Soft transitions
    T.scatter(ctx, 0, 8, 320, 4, P.blue, 0.3, 4);
    T.scatter(ctx, 0, 20, 320, 4, P.red, 0.25, 4);
    T.scatter(ctx, 0, 32, 320, 4, P.yellow, 0.25, 4);
    // Clouds
    T.ellipseFill(ctx, 52, 10, 16, 5, P.yellow);
    T.ellipseFill(ctx, 46, 8, 10, 4, P.yellow);
    T.ellipseFill(ctx, 190, 14, 14, 4, P.yellow);
    T.ellipseFill(ctx, 270, 8, 11, 4, P.yellow);
  } else if (params.skyType === 'overcast') {
    T.rect(ctx, 0, 0, 320, 20, P.dark_gray);
    T.rect(ctx, 0, 20, 320, 15, P.gray);
    T.rect(ctx, 0, 35, 320, 20, P.dark_gray);
    // Dense cloud cover
    T.scatter(ctx, 0, 18, 320, 4, P.gray, 0.3, 4);
    T.scatter(ctx, 0, 33, 320, 4, P.dark_gray, 0.25, 4);
    T.ellipseFill(ctx, 52, 10, 18, 6, P.gray);
    T.ellipseFill(ctx, 100, 14, 22, 5, P.gray);
    T.ellipseFill(ctx, 160, 8, 20, 6, P.gray);
    T.ellipseFill(ctx, 220, 12, 16, 5, P.gray);
    T.ellipseFill(ctx, 280, 10, 18, 5, P.gray);
  } else {
    // Day sky (original) — solid color bands
    T.rect(ctx, 0, 0, 320, 15, P.dark_blue);
    T.rect(ctx, 0, 15, 320, 14, P.blue);
    T.rect(ctx, 0, 29, 320, 14, P.light_blue);
    T.rect(ctx, 0, 43, 320, 12, P.white);
    // Soft transition pixels between bands
    T.scatter(ctx, 0, 13, 320, 4, P.blue, 0.3, 4);
    T.scatter(ctx, 0, 27, 320, 4, P.light_blue, 0.25, 4);
    // Clouds — overlapping ellipses
    T.ellipseFill(ctx, 52, 10, 16, 5, P.white);
    T.ellipseFill(ctx, 46, 8, 10, 4, P.white);
    T.ellipseFill(ctx, 190, 14, 14, 4, P.white);
    T.ellipseFill(ctx, 185, 12, 8, 3, P.white);
    T.ellipseFill(ctx, 270, 8, 11, 4, P.white);
  }

  // --- Ground ---
  if (params.groundType === 'dirt') {
    drawDirtGround(ctx, P, 75, 65, {
      baseColor: P.brown,
      darkColor: P.dark_brown,
      lightColor: P.tan,
      pebbleColor: P.gray,
    });
  } else if (params.groundType === 'grass') {
    // Grass ground — green base with tuft detail
    T.rect(ctx, 0, 75, 320, 65, P.dark_green);
    // Lighter green patches
    for (let i = 0; i < 12; i++) {
      const gx = (i * 31 + 5) % 310;
      const gy = 78 + (i * 11) % 55;
      T.rect(ctx, gx, gy, 10 + i % 6, 4 + i % 3, P.green);
    }
    // Grass tufts
    for (let i = 0; i < 30; i++) {
      const tx = (i * 37 + 3) % 316;
      const ty = 77 + (i * 13) % 58;
      T.pixel(ctx, tx, ty, P.green);
      T.pixel(ctx, tx + 1, ty - 1, P.green);
    }
  } else {
    // Cobblestone (original) — solid tiles
    T.rect(ctx, 0, 75, 320, 65, P.tan);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 20; col++) {
        const sx = col * 17 + (row % 2) * 8;
        const sy = 78 + row * 8;
        const shade = (col + row) % 3 === 0 ? P.dark_gray : P.gray;
        T.rect(ctx, sx, sy, 15, 6, shade);
        // Top edge highlight
        T.line(ctx, sx, sy, sx + 14, sy, P.tan);
        // Bottom edge shadow
        T.line(ctx, sx, sy + 6, sx + 14, sy + 6, P.dark_brown);
        // Left edge shadow
        T.line(ctx, sx, sy + 1, sx, sy + 5, P.dark_brown);
      }
    }
  }
}

// =========================================================================
//  Layer 2 — STRUCTURES: Buildings, well, market stall, notice board
// =========================================================================

function _structures(ctx, P, params) {
  // === Left building (x:0-40) — solid stone wall + mortar grid ===
  T.rect(ctx, 0, 25, 40, 50, P.dark_gray);
  // Mortar lines (horizontal)
  for (let r = 0; r < 6; r++) {
    const my = 27 + r * 8;
    T.line(ctx, 0, my, 39, my, P.gray);
  }
  // Mortar lines (vertical, staggered)
  for (let r = 0; r < 6; r++) {
    const my = 27 + r * 8;
    const off = (r % 2) * 10;
    for (let c = 0; c < 4; c++) {
      const mx = c * 20 + off;
      if (mx < 40) T.line(ctx, mx, my, mx, my + 8, P.gray);
    }
  }
  // Windows — nested rects with glass glint
  T.rect(ctx, 3, 30, 10, 12, P.dark_brown);
  T.rect(ctx, 5, 32, 6, 8, P.dark_blue);
  T.pixel(ctx, 6, 33, P.light_blue);
  T.rect(ctx, 20, 30, 10, 12, P.dark_brown);
  T.rect(ctx, 22, 32, 6, 8, P.dark_blue);
  T.pixel(ctx, 23, 33, P.light_blue);
  // Roof — polygonFill
  T.polygonFill(ctx, [[-3, 25], [20, 15], [43, 25]], P.dark_brown);
  T.line(ctx, -3, 25, 20, 15, P.brown);
  T.line(ctx, 20, 15, 43, 25, P.dark_brown);

  // === Right building / Tavern (x:270-320) — solid tan wall + mortar ===
  T.rect(ctx, 270, 28, 50, 47, P.tan);
  // Mortar lines
  for (let r = 0; r < 6; r++) {
    const my = 30 + r * 7;
    T.line(ctx, 270, my, 319, my, P.gray);
  }
  for (let r = 0; r < 6; r++) {
    const my = 30 + r * 7;
    const off = (r % 2) * 12;
    for (let c = 0; c < 4; c++) {
      const mx = 270 + c * 24 + off;
      if (mx < 320) T.line(ctx, mx, my, mx, my + 7, P.gray);
    }
  }
  // Window
  T.rect(ctx, 273, 35, 10, 10, P.dark_brown);
  T.rect(ctx, 275, 37, 6, 6, P.dark_blue);
  T.pixel(ctx, 276, 38, P.light_blue);
  // Tavern door — solid dark_brown with frame + handle
  T.rect(ctx, 289, 49, 18, 26, P.dark_brown);
  T.rect(ctx, 291, 51, 14, 22, P.brown);
  T.line(ctx, 289, 49, 306, 49, P.tan);       // top frame highlight
  T.line(ctx, 289, 49, 289, 75, P.tan);        // left frame highlight
  T.line(ctx, 306, 49, 306, 75, P.dark_brown); // right frame shadow
  T.rect(ctx, 300, 60, 3, 3, P.yellow);        // handle plate
  T.pixel(ctx, 301, 61, P.white);              // handle glint
  // Roof
  T.polygonFill(ctx, [[267, 28], [295, 18], [323, 28]], P.dark_brown);
  T.line(ctx, 267, 28, 295, 18, P.brown);
  // Tavern sign
  T.rect(ctx, 285, 32, 24, 12, P.dark_brown);
  T.rect(ctx, 287, 34, 20, 8, P.brown);
  for (let i = 0; i < 6; i++) {
    T.pixel(ctx, 289 + i * 3, 37, P.yellow);
    T.pixel(ctx, 290 + i * 3, 38, P.yellow);
  }

  // === Forest opening (x:130-190) — solid dark_green + tree crowns ===
  T.rect(ctx, 130, 30, 60, 25, P.dark_green);
  // Path hint — darker center
  T.rect(ctx, 145, 35, 30, 20, P.black);
  T.rect(ctx, 148, 38, 24, 14, P.dark_green);
  // Tree crowns framing the path (layered ellipses)
  T.ellipseFill(ctx, 130, 28, 14, 12, P.dark_green);
  T.ellipseFill(ctx, 128, 22, 10, 8, P.green);
  T.ellipseFill(ctx, 190, 30, 14, 12, P.dark_green);
  T.ellipseFill(ctx, 192, 24, 10, 8, P.green);
  // Central canopy top
  T.ellipseFill(ctx, 160, 26, 18, 8, P.dark_green);
  T.ellipseFill(ctx, 155, 22, 10, 6, P.green);
  T.ellipseFill(ctx, 168, 23, 8, 5, P.green);
  // Tree trunks at edges
  T.rect(ctx, 124, 28, 5, 27, P.dark_brown);
  T.line(ctx, 124, 28, 124, 55, P.brown);
  T.rect(ctx, 191, 30, 5, 25, P.dark_brown);
  T.line(ctx, 191, 30, 191, 55, P.brown);

  // === Well (conditional) ===
  if (params.hasWell) {
    // Stone body — solid rects + mortar lines
    T.rect(ctx, 140, 72, 40, 35, P.dark_gray);
    // Mortar lines on well body
    for (let r = 0; r < 4; r++) {
      const wy = 74 + r * 7;
      T.line(ctx, 140, wy, 179, wy, P.gray);
    }
    for (let r = 0; r < 4; r++) {
      const wy = 74 + r * 7;
      const off = (r % 2) * 7;
      for (let c = 0; c < 4; c++) {
        const wx = 140 + c * 14 + off;
        if (wx < 180) T.line(ctx, wx, wy, wx, wy + 7, P.gray);
      }
    }
    // Well rim — ellipse
    T.ellipseFill(ctx, 160, 72, 22, 4, P.gray);
    T.ellipse(ctx, 160, 72, 22, 4, P.dark_gray);
    // Well hole
    T.ellipseFill(ctx, 160, 74, 17, 3, P.black);
    // Water glint pixels
    T.pixel(ctx, 155, 75, P.dark_blue);
    T.pixel(ctx, 162, 75, P.dark_blue);
    // Well posts
    T.rect(ctx, 142, 50, 4, 22, P.dark_brown);
    T.rect(ctx, 174, 50, 4, 22, P.dark_brown);
    T.line(ctx, 142, 50, 142, 72, P.brown);
    T.line(ctx, 174, 50, 174, 72, P.brown);
    // Well roof
    T.polygonFill(ctx, [[136, 50], [160, 42], [184, 50]], P.dark_brown);
    T.line(ctx, 136, 50, 160, 42, P.brown);
    T.line(ctx, 160, 42, 184, 50, P.dark_brown);
    // Rope
    T.line(ctx, 159, 48, 159, 70, P.tan);
  }

  // === Market stall (conditional) ===
  if (params.hasMarketStall) {
    // Stall body — solid wood rect + frame lines
    T.rect(ctx, 15, 62, 55, 28, P.brown);
    T.line(ctx, 15, 62, 69, 62, P.tan);         // top edge highlight
    T.line(ctx, 15, 89, 69, 89, P.dark_brown);  // bottom edge shadow
    T.line(ctx, 15, 62, 15, 89, P.dark_brown);  // left edge
    T.line(ctx, 69, 62, 69, 89, P.dark_brown);  // right edge
    // Awning — striped red/white
    for (let i = 0; i < 10; i++) {
      const color = i % 2 === 0 ? P.red : P.white;
      T.rect(ctx, 13 + i * 6, 55, 6, 6, color);
    }
    T.line(ctx, 13, 55, 72, 55, P.dark_brown);
    T.line(ctx, 13, 61, 72, 61, P.dark_brown);
    // Stall legs
    T.rect(ctx, 15, 62, 3, 28, P.dark_brown);
    T.rect(ctx, 65, 62, 3, 28, P.dark_brown);
    // Goods on stall
    T.rect(ctx, 20, 65, 8, 8, P.yellow);
    T.pixel(ctx, 22, 67, P.white);               // gold item glint
    T.rect(ctx, 32, 65, 6, 10, P.dark_green);
    T.pixel(ctx, 34, 66, P.green);               // bottle highlight
    T.rect(ctx, 42, 67, 10, 6, P.tan);
    T.line(ctx, 42, 67, 51, 67, P.white);        // box top highlight
  }

  // === Notice board (conditional) ===
  if (params.hasNoticeBoard) {
    // Board body — solid wood
    T.rect(ctx, 250, 55, 30, 35, P.brown);
    // Frame border rects
    T.rect(ctx, 248, 53, 34, 3, P.dark_brown);
    T.rect(ctx, 248, 88, 34, 3, P.dark_brown);
    T.rect(ctx, 248, 53, 3, 38, P.dark_brown);
    T.rect(ctx, 279, 53, 3, 38, P.dark_brown);
    // Frame highlight
    T.line(ctx, 248, 53, 281, 53, P.tan);
    // Post
    T.rect(ctx, 263, 88, 4, 15, P.dark_brown);
    T.line(ctx, 263, 88, 263, 103, P.brown);
    // Notes — white rectangles
    T.rect(ctx, 253, 58, 12, 10, P.white);
    T.rect(ctx, 267, 60, 10, 8, P.white);
    T.rect(ctx, 255, 72, 14, 12, P.white);
    // Scribble lines on notes
    T.line(ctx, 255, 60, 262, 60, P.dark_gray);
    T.line(ctx, 255, 63, 260, 63, P.dark_gray);
    T.line(ctx, 269, 62, 274, 62, P.dark_gray);
    T.line(ctx, 269, 64, 275, 64, P.dark_gray);
    T.line(ctx, 257, 75, 266, 75, P.dark_gray);
    T.line(ctx, 257, 78, 264, 78, P.dark_gray);
  }

  // === Temple archway hint (left edge exit) ===
  T.rect(ctx, 0, 75, 15, 55, P.dark_gray);
  // Arch shape
  T.polygonFill(ctx, [[0, 75], [8, 68], [15, 75]], P.gray);
  // Stone block lines
  T.line(ctx, 0, 82, 14, 82, P.gray);
  T.line(ctx, 0, 90, 14, 90, P.gray);
  T.line(ctx, 0, 98, 14, 98, P.gray);
  T.line(ctx, 7, 75, 7, 105, P.gray);
  // Crumbling edge — a few stray pixels
  T.pixel(ctx, 15, 78, P.gray);
  T.pixel(ctx, 16, 85, P.dark_gray);
  T.pixel(ctx, 14, 92, P.gray);
  T.pixel(ctx, 16, 100, P.dark_gray);
}

// =========================================================================
//  Layer 3 — DETAILS: Scattered ground details, puddle, grass, leaves
// =========================================================================

function _details(ctx, P, params) {
  // Scattered ground details — dirt variation
  for (let i = 0; i < 20; i++) {
    const dx = (i * 47 + 11) % 310;
    const dy = 82 + (i * 13) % 50;
    T.pixel(ctx, dx, dy, i % 2 === 0 ? P.brown : P.dark_brown);
  }

  if (params.hasWell) {
    // Puddle pixel cluster (near well)
    T.pixel(ctx, 170, 112, P.dark_blue);
    T.pixel(ctx, 171, 113, P.blue);
    T.pixel(ctx, 172, 112, P.dark_blue);
    T.pixel(ctx, 171, 111, P.blue);
  }

  // Grass tufts near buildings
  T.pixel(ctx, 42, 76, P.green);
  T.pixel(ctx, 43, 75, P.dark_green);
  T.pixel(ctx, 44, 76, P.green);
  T.pixel(ctx, 268, 76, P.green);
  T.pixel(ctx, 269, 75, P.dark_green);
  T.pixel(ctx, 270, 76, P.green);

  // Fallen leaves
  T.pixel(ctx, 95, 88, P.brown);
  T.pixel(ctx, 96, 89, P.dark_brown);
  T.pixel(ctx, 210, 95, P.yellow);
  T.pixel(ctx, 211, 96, P.brown);
}

// =========================================================================
//  Layer 4 — SHADING: Shadows (scatter/scatterCircle only)
// =========================================================================

function _shading(ctx, P, params) {
  // Building shadows on ground
  T.scatter(ctx, 0, 75, 45, 10, P.black, 0.3, 4);
  T.scatter(ctx, 270, 75, 50, 10, P.black, 0.3, 4);

  if (params.hasWell) {
    // Well shadow
    T.scatter(ctx, 145, 105, 30, 5, P.black, 0.25, 4);
  }

  if (params.hasMarketStall) {
    // Shadow under market awning
    T.scatter(ctx, 15, 62, 55, 6, P.black, 0.2, 4);
  }
}

// =========================================================================
//  Layer 5 — ATMOSPHERE: Ambient washes (scatter/scatterCircle/pixel only)
// =========================================================================

function _atmosphere(ctx, P, params) {
  if (params.skyType === 'sunset') {
    // Warm sunset wash — orange tint
    T.scatter(ctx, 0, 0, 320, 140, P.red, 0.04, 4);
    T.scatter(ctx, 0, 0, 320, 140, P.yellow, 0.03, 4);
  } else if (params.skyType === 'overcast') {
    // Cool overcast wash — muted gray-blue
    T.scatter(ctx, 0, 0, 320, 140, P.dark_blue, 0.04, 4);
    T.scatter(ctx, 0, 0, 320, 140, P.dark_gray, 0.02, 4);
  } else {
    // Warm afternoon wash (original)
    T.scatter(ctx, 0, 0, 320, 140, P.yellow, 0.03, 4);
  }
}
