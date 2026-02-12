/**
 * tavern.js — Medieval Tavern room template.
 *
 * Parameterized from the existing ProceduralAssets tavern code.
 * Interior scene: wooden ceiling, stone/wood back wall, wood/stone/dirt floor,
 * optional fireplace, bar counter with shelves, cabinet, barrel, and a door.
 *
 * Uses PixelArtToolkit primitives exclusively. 5-layer rendering contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';
import { drawStoneWall, drawWoodWall, drawWoodFloor, drawDirtGround } from '../_base.js';

export const metadata = {
  id: 'fantasy/tavern',
  name: 'Medieval Tavern',
  setting: 'fantasy',
  category: 'interior',
  palette: 'tavern_warm',
  params: {
    hasFireplace:  { type: 'boolean', default: true,    label: 'Fireplace' },
    hasBarCounter: { type: 'boolean', default: true,    label: 'Bar counter with shelves' },
    wallMaterial:  { type: 'string',  default: 'stone', label: 'Wall material', options: ['stone', 'wood'] },
    floorMaterial: { type: 'string',  default: 'wood',  label: 'Floor material', options: ['wood', 'stone', 'dirt'] },
    doorSide:      { type: 'string',  default: 'left',  label: 'Door side', options: ['left', 'right'] },
    mood:          { type: 'string',  default: 'warm',  label: 'Mood', options: ['warm', 'dim', 'bright'] },
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
  // --- Ceiling: solid dark wood with vertical grain lines ---
  T.rect(ctx, 0, 0, 320, 25, P.dark_brown);
  // Dark blue vertical grain for wood texture
  for (let gx = 7; gx < 320; gx += 14) {
    T.line(ctx, gx, 0, gx, 25, P.dark_blue);
  }
  // Wooden beams
  T.rect(ctx, 0, 0, 320, 3, P.brown);
  T.rect(ctx, 50, 0, 4, 25, P.brown);
  T.rect(ctx, 160, 0, 4, 25, P.brown);
  T.rect(ctx, 270, 0, 4, 25, P.brown);
  // Beam highlights
  T.line(ctx, 50, 0, 50, 25, P.tan);
  T.line(ctx, 160, 0, 160, 25, P.tan);
  T.line(ctx, 270, 0, 270, 25, P.tan);

  // --- Back wall ---
  if (params.wallMaterial === 'wood') {
    drawWoodWall(ctx, P, 0, 25, 320, 50, {
      baseColor: P.brown,
      grainColor: P.dark_brown,
      highlightColor: P.tan,
      plankH: 8,
    });
  } else {
    // Stone wall with alternating brick shading
    T.rect(ctx, 0, 25, 320, 50, P.gray);
    // Alternating dark_gray brick fills for depth
    for (let row = 0; row < 6; row++) {
      const sy = 26 + row * 8;
      const offset = (row % 2) * 11;
      for (let col = 0; col < 16; col++) {
        const sx = col * 22 + offset;
        if ((col + row) % 2 === 0) {
          T.rect(ctx, sx + 1, sy + 1, 20, 6, P.dark_gray);
        }
      }
    }
    // Mortar lines (horizontal)
    for (let row = 0; row < 6; row++) {
      const sy = 26 + row * 8;
      T.line(ctx, 0, sy, 320, sy, P.dark_gray);
    }
    // Mortar lines (vertical, staggered brick)
    for (let row = 0; row < 6; row++) {
      const sy = 26 + row * 8;
      const offset = (row % 2) * 11;
      for (let col = 0; col < 16; col++) {
        const sx = col * 22 + offset;
        T.line(ctx, sx, sy, sx, sy + 8, P.dark_gray);
      }
    }
  }

  // --- Floor ---
  if (params.floorMaterial === 'stone') {
    // Stone floor — re-use cobblestone-like rects
    T.rect(ctx, 0, 75, 320, 65, P.gray);
    for (let row = 0; row < 9; row++) {
      const y = 76 + row * 7;
      T.line(ctx, 0, y, 320, y, P.dark_gray);
      for (let g = 0; g < 4; g++) {
        const gx = 15 + g * 80 + row * 13;
        T.line(ctx, gx, y + 1, gx, y + 6, P.dark_gray);
      }
      if (row % 2 === 0) {
        T.line(ctx, 0, y + 1, 320, y + 1, P.light_gray);
      }
    }
  } else if (params.floorMaterial === 'dirt') {
    drawDirtGround(ctx, P, 75, 65, {
      baseColor: P.brown,
      darkColor: P.dark_brown,
      lightColor: P.tan,
      pebbleColor: P.gray,
    });
  } else {
    // Wood floor — solid wood planks with grain detail
    T.rect(ctx, 0, 75, 320, 65, P.brown);
    // Plank lines + grain
    for (let i = 0; i < 9; i++) {
      const y = 76 + i * 7;
      T.line(ctx, 0, y, 320, y, P.dark_brown);
      // Dark brown vertical grain lines (3-4 per plank)
      for (let g = 0; g < 4; g++) {
        const gx = 15 + g * 80 + i * 13;
        T.line(ctx, gx, y + 1, gx, y + 6, P.dark_brown);
      }
      // Tan highlight on top edge of alternating planks
      if (i % 2 === 0) {
        T.line(ctx, 0, y + 1, 320, y + 1, P.tan);
      }
    }
  }
}

// =========================================================================
//  Layer 2 — STRUCTURES: Fireplace, bar counter, shelves, cabinet, barrel, door
// =========================================================================

function _structures(ctx, P, params) {
  // --- Fireplace (conditional) ---
  if (params.hasFireplace) {
    // Position on opposite side of the door
    const fpLeft = params.doorSide === 'left' ? 270 : 5;

    // Solid stone body with mortar grid
    T.rect(ctx, fpLeft, 32, 45, 53, P.dark_gray);
    // Gray mortar grid lines
    for (let gy = 38; gy < 85; gy += 6) {
      T.line(ctx, fpLeft, gy, fpLeft + 45, gy, P.gray);
    }
    for (let gx = fpLeft; gx < fpLeft + 45; gx += 9) {
      const off = ((gx - fpLeft) / 9 | 0) % 2 === 0 ? 0 : 3;
      T.line(ctx, gx, 32 + off, gx, 85, P.gray);
    }
    // Arch top (polygon)
    T.polygonFill(ctx, [
      [fpLeft + 5, 40], [fpLeft + 10, 36], [fpLeft + 35, 36], [fpLeft + 40, 40],
    ], P.dark_gray);
    // Fireplace opening
    T.rect(ctx, fpLeft + 7, 40, 31, 38, P.black);
    // Mantle shelf
    T.rect(ctx, fpLeft - 3, 32, 51, 4, P.gray);
    T.line(ctx, fpLeft - 3, 32, fpLeft + 48, 32, P.light_gray);
    // Stone surround bricks
    for (let r = 0; r < 5; r++) {
      const fy = 40 + r * 6;
      T.line(ctx, fpLeft, fy, fpLeft + 7, fy, P.gray);
      T.line(ctx, fpLeft + 38, fy, fpLeft + 45, fy, P.gray);
    }

    // Fire glow in opening (static version)
    const fc = fpLeft + 7; // fire center offset
    T.polygonFill(ctx, [[fc + 6, 75], [fc + 10, 60], [fc + 15, 55], [fc + 20, 58], [fc + 24, 75]], P.dark_red);
    T.polygonFill(ctx, [[fc + 8, 75], [fc + 12, 63], [fc + 16, 58], [fc + 21, 62], [fc + 23, 75]], P.red);
    T.polygonFill(ctx, [[fc + 11, 75], [fc + 14, 66], [fc + 17, 62], [fc + 20, 66], [fc + 22, 75]], P.orange);
    T.polygonFill(ctx, [[fc + 13, 75], [fc + 15, 68], [fc + 18, 65], [fc + 20, 68], [fc + 21, 75]], P.yellow);
    // Logs — solid with bark lines
    T.rect(ctx, fpLeft + 2, 74, 28, 4, P.dark_brown);
    T.line(ctx, fpLeft + 8, 74, fpLeft + 8, 78, P.brown);
    T.line(ctx, fpLeft + 16, 74, fpLeft + 16, 78, P.brown);
    T.line(ctx, fpLeft + 24, 74, fpLeft + 24, 78, P.brown);
    T.line(ctx, fpLeft + 2, 74, fpLeft + 30, 74, P.dark_brown);
  }

  // --- Bar counter (conditional) ---
  if (params.hasBarCounter) {
    // Bar counter — solid body with grain lines
    T.rect(ctx, 85, 65, 140, 20, P.brown);
    // Vertical grain lines on counter body
    for (let gx = 105; gx < 225; gx += 20) {
      T.line(ctx, gx, 65, gx, 85, P.dark_brown);
    }
    // Counter top surface (solid lighter wood)
    T.rect(ctx, 85, 62, 140, 4, P.tan);
    T.line(ctx, 85, 62, 225, 62, P.amber);
    // Counter edge shadow
    T.line(ctx, 85, 66, 225, 66, P.dark_brown);
    // Counter legs
    T.rect(ctx, 88, 80, 5, 12, P.dark_brown);
    T.rect(ctx, 218, 80, 5, 12, P.dark_brown);

    // Shelves behind bar
    for (const sy of [28, 42, 56]) {
      T.rect(ctx, 90, sy, 120, 3, P.brown);
      T.line(ctx, 90, sy, 210, sy, P.tan);
      // Bracket triangles
      T.polygonFill(ctx, [[90, sy + 3], [90, sy + 7], [94, sy + 3]], P.brown);
      T.polygonFill(ctx, [[210, sy + 3], [210, sy + 7], [206, sy + 3]], P.brown);
    }

    // Cabinet (right, behind bar) — solid with grain lines
    T.rect(ctx, 230, 32, 30, 50, P.brown);
    // Vertical grain lines
    T.line(ctx, 237, 32, 237, 82, P.dark_brown);
    T.line(ctx, 244, 32, 244, 82, P.dark_brown);
    T.line(ctx, 251, 32, 251, 82, P.dark_brown);
    // Left highlight, right shadow
    T.line(ctx, 230, 32, 230, 82, P.tan);
    T.line(ctx, 259, 32, 259, 82, P.dark_brown);
    // Door panels
    T.rect(ctx, 233, 35, 24, 20, P.dark_brown);
    T.rect(ctx, 233, 58, 24, 20, P.dark_brown);
    T.rect(ctx, 244, 42, 2, 8, P.tan);
    T.rect(ctx, 244, 65, 2, 8, P.tan);
    T.pixel(ctx, 244, 46, P.light_gray);
    T.line(ctx, 232, 34, 258, 34, P.dark_brown);
    T.line(ctx, 232, 56, 258, 56, P.dark_brown);

    // Ale barrel (far right) — solid with stave detail
    T.rect(ctx, 272, 78, 30, 32, P.brown);
    T.ellipse(ctx, 287, 85, 14, 8, P.tan);
    // Stave lines
    for (let i = 0; i < 4; i++) {
      T.line(ctx, 275 + i * 7, 78, 275 + i * 7, 110, P.dark_brown);
    }
    // Tan left highlight for roundness
    T.line(ctx, 273, 80, 273, 108, P.tan);
    // Iron rings
    T.rect(ctx, 270, 82, 34, 2, P.tan);
    T.rect(ctx, 270, 98, 34, 2, P.tan);
    // Tap
    T.rect(ctx, 285, 88, 4, 5, P.dark_brown);
    T.pixel(ctx, 289, 90, P.dark_gray);
  }

  // --- Door ---
  if (params.doorSide === 'right') {
    // Door on right side — solid with grain lines
    T.rect(ctx, 302, 40, 18, 50, P.dark_brown);
    // Vertical grain lines
    T.line(ctx, 305, 40, 305, 90, P.brown);
    T.line(ctx, 310, 40, 310, 90, P.brown);
    T.line(ctx, 315, 40, 315, 90, P.brown);
    // Inner panel + edge + handle
    T.rect(ctx, 304, 42, 14, 45, P.brown);
    T.line(ctx, 318, 42, 318, 87, P.dark_brown);
    T.rect(ctx, 305, 60, 3, 3, P.tan);
    T.pixel(ctx, 306, 61, P.amber);
  } else {
    // Door on left side — solid with grain lines (original)
    T.rect(ctx, 0, 40, 18, 50, P.dark_brown);
    // Vertical grain lines
    T.line(ctx, 5, 40, 5, 90, P.brown);
    T.line(ctx, 10, 40, 10, 90, P.brown);
    T.line(ctx, 15, 40, 15, 90, P.brown);
    // Inner panel + edge + handle
    T.rect(ctx, 2, 42, 14, 45, P.brown);
    T.line(ctx, 2, 42, 2, 87, P.dark_brown);
    T.rect(ctx, 12, 60, 3, 3, P.tan);
    T.pixel(ctx, 13, 61, P.amber);
  }
}

// =========================================================================
//  Layer 3 — DETAILS: Bottles on shelves, hanging lanterns
// =========================================================================

function _details(ctx, P, params) {
  if (params.hasBarCounter) {
    // Bottles on shelves — use palette colors
    const bottleColors = [P.dark_gray, P.dark_red, P.dark_blue, P.brown, P.dark_gray];
    for (let i = 0; i < 8; i++) {
      const bx = 95 + i * 14;
      const color = bottleColors[i % bottleColors.length];
      T.rect(ctx, bx, 45, 5, 10, color);
      T.rect(ctx, bx + 1, 43, 3, 3, color);
      T.pixel(ctx, bx + 1, 44, P.light_gray); // highlight
    }
    for (let i = 0; i < 6; i++) {
      const bx = 100 + i * 16;
      const color = bottleColors[(i + 2) % bottleColors.length];
      T.rect(ctx, bx, 31, 5, 10, color);
      T.rect(ctx, bx + 1, 29, 3, 3, color);
      T.pixel(ctx, bx + 1, 30, P.light_gray);
    }
  }

  // Hanging lanterns
  for (const lx of [120, 200]) {
    T.rect(ctx, lx, 4, 6, 8, P.tan);
    T.rect(ctx, lx + 1, 7, 4, 4, P.yellow);
    T.line(ctx, lx + 3, 0, lx + 3, 4, P.dark_gray);
    // Small glow circle
    T.scatter(ctx, lx - 4, 2, 14, 14, P.amber, 0.1, 4);
  }
}

// =========================================================================
//  Layer 4 — SHADING: Shadows (scatter/scatterCircle only)
// =========================================================================

function _shading(ctx, P, params) {
  if (params.hasBarCounter) {
    // Under-counter shadow
    T.scatter(ctx, 85, 85, 140, 6, P.black, 0.4, 4);
  }

  if (params.hasFireplace) {
    // Fireplace glow on floor — warm radial scatter
    const fpCenterX = params.doorSide === 'left' ? 292 : 27;
    T.scatterCircle(ctx, fpCenterX, 85, 40, P.orange, 0.12, 4);
  }

  // Ambient occlusion lines
  T.scatter(ctx, 0, 24, 320, 2, P.black, 0.5, 4); // wall-ceiling join
  T.scatter(ctx, 0, 74, 320, 2, P.black, 0.5, 4); // wall-floor join
}

// =========================================================================
//  Layer 5 — ATMOSPHERE: Ambient effects (scatter/scatterCircle/pixel only)
// =========================================================================

function _atmosphere(ctx, P, params) {
  if (params.mood === 'dim') {
    // Darker wash — subdued amber + blue shadow
    T.scatter(ctx, 0, 0, 320, 140, P.dark_blue, 0.06, 4);
    T.scatter(ctx, 0, 0, 320, 140, P.amber, 0.02, 4);
  } else if (params.mood === 'bright') {
    // Brighter wash — stronger amber + yellow highlights
    T.scatter(ctx, 0, 0, 320, 140, P.amber, 0.05, 4);
    T.scatter(ctx, 0, 0, 320, 140, P.yellow, 0.02, 4);
  } else {
    // Warm (default) — subtle amber overlay
    T.scatter(ctx, 0, 0, 320, 140, P.amber, 0.03, 4);
  }
}
