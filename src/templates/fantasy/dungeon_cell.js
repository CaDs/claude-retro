/**
 * dungeon_cell.js — Dark Dungeon Cell room template.
 *
 * A grim prison cell: rough stone walls with moisture stains, rusted iron bars on one side,
 * a small barred window high on the wall letting in moonlight, chains hanging from walls,
 * scattered straw on the damp floor, a wooden bucket, moss patches on stone.
 *
 * Uses PixelArtToolkit primitives exclusively. 5-layer rendering contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';
import { drawStoneWall } from '../_base.js';

export const metadata = {
  id: 'fantasy/dungeon_cell',
  name: 'Dungeon Cell',
  setting: 'fantasy',
  category: 'interior',
  palette: 'dungeon_dark',
  params: {
    hasBars:       { type: 'boolean', default: true,    label: 'Iron Bars' },
    hasChains:     { type: 'boolean', default: true,    label: 'Wall Chains' },
    hasWindow:     { type: 'boolean', default: true,    label: 'Barred Window' },
    moistureLevel: { type: 'string',  default: 'medium', label: 'Dampness', options: ['dry', 'medium', 'wet'] },
    moonlight:     { type: 'string',  default: 'full',  label: 'Moonlight', options: ['none', 'crescent', 'full'] },
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
  // --- Rough stone ceiling with visible support beams ---
  // Dark stone base
  T.rect(ctx, 0, 0, 320, 20, P.dark_gray);

  // Rough stone texture (irregular blocks)
  for (let row = 0; row < 3; row++) {
    const cy = row * 6;
    const offset = (row % 2) * 12;
    for (let col = 0; col < 15; col++) {
      const cx = col * 24 + offset;
      if ((col + row) % 3 === 1) {
        T.rect(ctx, cx + 1, cy + 1, 22, 4, P.gray);
      }
    }
  }

  // Wooden support beam across ceiling
  T.rect(ctx, 0, 5, 320, 4, P.dark_brown);
  T.line(ctx, 0, 5, 320, 5, P.brown);
  T.line(ctx, 0, 8, 320, 8, P.black);

  // Beam grain lines
  for (let gx = 10; gx < 320; gx += 25) {
    T.line(ctx, gx, 5, gx, 8, P.dark_brown);
  }

  // --- Back wall: Rough-hewn stone blocks with deterioration ---
  drawStoneWall(ctx, P, 0, 20, 320, 55, {
    wallColor: P.dark_gray,
    mortarColor: P.black,
    brickW: 18,
    brickH: 9,
  });

  // Additional weathering: cracks and missing mortar
  for (let i = 0; i < 15; i++) {
    const wx = 5 + i * 20;
    const wy = 25 + (i % 5) * 10;
    T.line(ctx, wx, wy, wx + 3, wy + 4, P.black);
  }

  // Moss patches on damp stone
  const mossColor = P.dark_green || P.dark_blue;
  if (params.moistureLevel !== 'dry') {
    for (let m = 0; m < 8; m++) {
      const mx = 10 + m * 35;
      const my = 30 + (m % 3) * 14;
      T.rect(ctx, mx, my, 6 + (m % 3) * 2, 3 + (m % 2), mossColor);
      T.dither(ctx, mx, my, 6 + (m % 3) * 2, 3 + (m % 2), mossColor, P.dark_gray, 0.5, 4);
    }
  }

  // --- Floor: Damp stone with scattered straw ---
  // Base stone floor (darker, uneven)
  T.rect(ctx, 0, 75, 320, 65, P.dark_gray);

  // Irregular flagstone pattern
  const flagstoneLines = [78, 86, 95, 105, 116, 128];
  for (const fy of flagstoneLines) {
    T.line(ctx, 0, fy, 320, fy, P.black);
  }

  // Vertical breaks (irregular)
  for (let i = 0; i < 20; i++) {
    const fx = 15 + i * 16;
    const fstart = flagstoneLines[(i % (flagstoneLines.length - 1))];
    const fend = flagstoneLines[(i % (flagstoneLines.length - 1)) + 1];
    T.line(ctx, fx, fstart, fx, fend, P.black);
  }

  // Moisture stains on floor
  if (params.moistureLevel === 'medium' || params.moistureLevel === 'wet') {
    for (let w = 0; w < 6; w++) {
      const stainX = 20 + w * 50;
      const stainY = 80 + (w % 3) * 18;
      const stainW = 25 + (w % 2) * 15;
      const stainH = 12 + (w % 2) * 8;
      T.dither(ctx, stainX, stainY, stainW, stainH, P.dark_gray, P.black, 0.6, 4);
    }
  }

  if (params.moistureLevel === 'wet') {
    // Puddles (darker areas)
    T.rect(ctx, 200, 125, 40, 12, P.black);
    T.dither(ctx, 200, 125, 40, 12, P.black, P.dark_blue, 0.3, 4);
    T.rect(ctx, 50, 110, 30, 8, P.black);
    T.dither(ctx, 50, 110, 30, 8, P.black, P.dark_blue, 0.3, 4);
  }

  // Scattered straw on floor
  for (let s = 0; s < 60; s++) {
    const strawX = 5 + (s * 17) % 310;
    const strawY = 78 + (s * 23) % 60;
    const strawLen = 3 + (s % 4);
    const strawAngle = (s % 8) - 4;

    T.line(ctx, strawX, strawY, strawX + strawLen + strawAngle, strawY + strawAngle, P.tan);
  }

  // Straw clumps (denser patches)
  for (let c = 0; c < 4; c++) {
    const clumpX = 40 + c * 70;
    const clumpY = 100 + (c % 2) * 20;
    T.rect(ctx, clumpX, clumpY, 20, 8, P.brown);
    T.dither(ctx, clumpX, clumpY, 20, 8, P.brown, P.tan, 0.7, 4);
  }
}

// =========================================================================
//  Layer 2 — STRUCTURES: Iron bars, window, chains, bucket
// =========================================================================

function _structures(ctx, P, params) {
  // --- Iron bars (prison cell front) ---
  if (params.hasBars) {
    const barSpacing = 16;
    const barCount = 10;
    const barStartX = 90;
    const barTop = 25;
    const barBottom = 120;

    // Horizontal rails
    T.rect(ctx, barStartX - 5, barTop, barCount * barSpacing + 5, 3, P.dark_gray);
    T.line(ctx, barStartX - 5, barTop, barStartX + barCount * barSpacing, barTop, P.gray);
    T.line(ctx, barStartX - 5, barTop + 2, barStartX + barCount * barSpacing, barTop + 2, P.black);

    T.rect(ctx, barStartX - 5, 70, barCount * barSpacing + 5, 3, P.dark_gray);
    T.line(ctx, barStartX - 5, 70, barStartX + barCount * barSpacing, 70, P.gray);
    T.line(ctx, barStartX - 5, 72, barStartX + barCount * barSpacing, 72, P.black);

    T.rect(ctx, barStartX - 5, barBottom, barCount * barSpacing + 5, 3, P.dark_gray);
    T.line(ctx, barStartX - 5, barBottom, barStartX + barCount * barSpacing, barBottom, P.gray);
    T.line(ctx, barStartX - 5, barBottom + 2, barStartX + barCount * barSpacing, barBottom + 2, P.black);

    // Vertical bars
    for (let b = 0; b < barCount; b++) {
      const bx = barStartX + b * barSpacing;
      T.rect(ctx, bx, barTop, 3, barBottom - barTop + 3, P.dark_gray);
      T.line(ctx, bx, barTop, bx, barBottom + 3, P.gray);
      T.line(ctx, bx + 2, barTop, bx + 2, barBottom + 3, P.black);
    }

    // Rust stains on bars
    for (let r = 0; r < 15; r++) {
      const rustBar = r % barCount;
      const rustX = barStartX + rustBar * barSpacing;
      const rustY = barTop + 5 + (r * 11) % 85;
      T.pixel(ctx, rustX + 1, rustY, P.dark_red);
      if (r % 3 === 0) {
        T.pixel(ctx, rustX + 1, rustY + 1, P.dark_red);
      }
    }

    // Lock mechanism on one bar
    const lockX = barStartX + 4 * barSpacing;
    T.rect(ctx, lockX - 3, 68, 8, 8, P.dark_gray);
    T.rect(ctx, lockX - 2, 69, 6, 6, P.black);
    T.rect(ctx, lockX, 71, 2, 3, P.black);
    T.pixel(ctx, lockX, 70, P.gray);
  }

  // --- Small barred window (high on wall) ---
  if (params.hasWindow) {
    const winX = 240;
    const winY = 28;
    const winW = 30;
    const winH = 20;

    // Window recess (deep inset)
    T.rect(ctx, winX - 3, winY - 3, winW + 6, winH + 6, P.black);
    T.rect(ctx, winX - 2, winY - 2, winW + 4, winH + 4, P.dark_gray);

    // Window opening (night sky)
    T.rect(ctx, winX, winY, winW, winH, P.dark_blue);

    // Stars visible through window
    if (params.moonlight !== 'none') {
      for (let st = 0; st < 6; st++) {
        const starX = winX + 3 + (st * 7) % (winW - 6);
        const starY = winY + 2 + (st * 5) % (winH - 4);
        T.pixel(ctx, starX, starY, P.white);
      }
    }

    // Moon (if applicable)
    if (params.moonlight === 'full') {
      T.circleFill(ctx, winX + winW / 2, winY + winH / 2, 5, P.white);
      T.circleFill(ctx, winX + winW / 2, winY + winH / 2, 4, P.light_gray);
    } else if (params.moonlight === 'crescent') {
      T.circleFill(ctx, winX + winW / 2 - 2, winY + winH / 2, 4, P.white);
      T.circleFill(ctx, winX + winW / 2 + 1, winY + winH / 2, 4, P.dark_blue);
    }

    // Iron bars across window
    for (let wb = 0; wb < 4; wb++) {
      const barX = winX + 6 + wb * 7;
      T.rect(ctx, barX, winY - 2, 2, winH + 4, P.dark_gray);
      T.line(ctx, barX, winY - 2, barX, winY + winH + 2, P.gray);
      T.pixel(ctx, barX, winY + winH / 2, P.dark_red); // rust
    }

    // Horizontal bar
    T.rect(ctx, winX, winY + winH / 2, winW, 2, P.dark_gray);
    T.line(ctx, winX, winY + winH / 2, winX + winW, winY + winH / 2, P.gray);
  }

  // --- Chains hanging from walls ---
  if (params.hasChains) {
    const chainPositions = [
      { x: 20, y: 30 },
      { x: 60, y: 35 },
    ];

    for (const chain of chainPositions) {
      // Wall anchor ring
      T.rect(ctx, chain.x - 2, chain.y - 2, 4, 4, P.dark_gray);
      T.pixel(ctx, chain.x - 1, chain.y - 1, P.gray);
      T.pixel(ctx, chain.x + 1, chain.y - 1, P.black);

      // Chain links hanging down
      for (let link = 0; link < 12; link++) {
        const linkY = chain.y + link * 4;
        if (linkY > 75) break; // Stop at floor

        // Link (simplified rectangular loop)
        T.rect(ctx, chain.x - 1, linkY, 2, 3, P.dark_gray);
        T.pixel(ctx, chain.x - 1, linkY, P.gray);
        T.pixel(ctx, chain.x + 1, linkY + 2, P.black);
      }

      // Shackle at bottom
      const shackleY = Math.min(chain.y + 48, 73);
      T.rect(ctx, chain.x - 3, shackleY, 6, 3, P.dark_gray);
      T.rect(ctx, chain.x - 2, shackleY + 1, 4, 1, P.black);
      T.pixel(ctx, chain.x - 3, shackleY, P.gray);
      T.pixel(ctx, chain.x + 3, shackleY + 2, P.black);

      // Rust on chain
      for (let r = 0; r < 6; r++) {
        const rustY = chain.y + 5 + r * 7;
        if (rustY < shackleY) {
          T.pixel(ctx, chain.x, rustY, P.dark_red);
        }
      }
    }
  }

  // --- Wooden bucket in corner ---
  const bucketX = 280;
  const bucketY = 115;

  // Bucket body (cylindrical)
  T.rect(ctx, bucketX, bucketY, 18, 20, P.dark_brown);

  // Stave lines (vertical planks)
  for (let stave = 0; stave < 4; stave++) {
    const sx = bucketX + 3 + stave * 4;
    T.line(ctx, sx, bucketY, sx, bucketY + 20, P.brown);
  }

  // Iron hoops
  T.rect(ctx, bucketX - 1, bucketY + 2, 20, 2, P.dark_gray);
  T.rect(ctx, bucketX - 1, bucketY + 15, 20, 2, P.dark_gray);
  T.line(ctx, bucketX - 1, bucketY + 2, bucketX + 19, bucketY + 2, P.gray);
  T.line(ctx, bucketX - 1, bucketY + 15, bucketX + 19, bucketY + 15, P.gray);

  // Top rim (ellipse for perspective)
  T.ellipse(ctx, bucketX + 9, bucketY, 8, 3, P.brown);
  T.ellipse(ctx, bucketX + 9, bucketY, 7, 2, P.dark_brown);

  // Highlights and shadows for roundness
  T.line(ctx, bucketX, bucketY + 5, bucketX, bucketY + 18, P.brown);
  T.line(ctx, bucketX + 18, bucketY + 5, bucketX + 18, bucketY + 18, P.black);

  // --- Crack in floor stone ---
  T.line(ctx, 150, 85, 165, 95, P.black);
  T.line(ctx, 165, 95, 170, 108, P.black);
  for (let i = 0; i < 3; i++) {
    T.pixel(ctx, 151 + i * 7, 86 + i * 4, P.black);
  }
}

// =========================================================================
//  Layer 3 — DETAILS: Small objects, texture highlights
// =========================================================================

function _details(ctx, P, params) {
  // Wall texture detail: individual stone chips and pits
  for (let i = 0; i < 30; i++) {
    const detailX = 8 + (i * 19) % 305;
    const detailY = 22 + (i * 13) % 50;
    T.pixel(ctx, detailX, detailY, P.black);
    if (i % 4 === 0) {
      T.pixel(ctx, detailX + 1, detailY, P.gray);
    }
  }

  // Straw detail (individual strands on top of clumps)
  for (let s = 0; s < 20; s++) {
    const sx = 40 + (s * 31) % 240;
    const sy = 95 + (s * 17) % 35;
    T.pixel(ctx, sx, sy, P.tan);
    T.pixel(ctx, sx + 1, sy, P.tan);
  }

  // Water droplets on walls (if moist)
  if (params.moistureLevel !== 'dry') {
    for (let d = 0; d < 15; d++) {
      const dropX = 10 + (d * 23) % 300;
      const dropY = 25 + (d * 11) % 45;
      T.pixel(ctx, dropX, dropY, P.dark_blue);
      if (d % 3 === 0) {
        T.pixel(ctx, dropX, dropY + 1, P.dark_blue);
      }
    }
  }

  // Rust detail on chains
  if (params.hasChains) {
    T.pixel(ctx, 20, 45, P.dark_red);
    T.pixel(ctx, 60, 50, P.dark_red);
    T.pixel(ctx, 21, 52, P.dark_red);
  }

  // Moonlight reflection on wet floor
  if (params.hasWindow && params.moonlight !== 'none' && params.moistureLevel === 'wet') {
    for (let i = 0; i < 8; i++) {
      const refX = 200 + (i * 5);
      const refY = 126 + (i % 3);
      T.pixel(ctx, refX, refY, P.dark_blue);
    }
  }

  // Small rocks/pebbles on floor
  for (let p = 0; p < 10; p++) {
    const pebbleX = 15 + (p * 29) % 290;
    const pebbleY = 80 + (p * 19) % 55;
    T.pixel(ctx, pebbleX, pebbleY, P.gray);
    T.pixel(ctx, pebbleX + 1, pebbleY, P.dark_gray);
  }

  // Carved tally marks on wall (prisoner counting days)
  const tallyX = 180;
  const tallyY = 55;
  for (let t = 0; t < 5; t++) {
    T.line(ctx, tallyX + t * 2, tallyY, tallyX + t * 2, tallyY + 4, P.dark_gray);
  }
  // Cross mark
  T.line(ctx, tallyX, tallyY + 2, tallyX + 8, tallyY + 2, P.dark_gray);

  // Second set of tally marks
  for (let t = 0; t < 5; t++) {
    T.line(ctx, tallyX + 12 + t * 2, tallyY, tallyX + 12 + t * 2, tallyY + 4, P.dark_gray);
  }
  T.line(ctx, tallyX + 12, tallyY + 2, tallyX + 20, tallyY + 2, P.dark_gray);

  // Spider web in upper corner
  const webX = 8;
  const webY = 22;
  T.line(ctx, webX, webY, webX + 10, webY + 8, P.gray);
  T.line(ctx, webX, webY + 8, webX + 10, webY, P.gray);
  T.line(ctx, webX + 5, webY, webX + 5, webY + 8, P.gray);
  T.line(ctx, webX, webY + 4, webX + 10, webY + 4, P.gray);

  // Radial web strands
  for (let r = 0; r < 3; r++) {
    const angle = r * 2;
    T.line(ctx, webX + 5, webY + 4, webX + angle, webY + angle + 2, P.gray);
  }
}

// =========================================================================
//  Layer 4 — SHADING: Shadows (scatter/scatterCircle only)
// =========================================================================

function _shading(ctx, P, params) {
  // Deep ambient occlusion throughout (very dark dungeon)
  T.scatter(ctx, 0, 0, 320, 140, P.black, 0.35, 4);

  // Ceiling-to-wall transition shadow
  T.scatter(ctx, 0, 19, 320, 3, P.black, 0.6, 4);

  // Wall-to-floor transition shadow
  T.scatter(ctx, 0, 73, 320, 4, P.black, 0.6, 4);

  // Dark corners (vignette effect)
  T.scatterCircle(ctx, 0, 0, 60, P.black, 0.5, 4);
  T.scatterCircle(ctx, 320, 0, 60, P.black, 0.5, 4);
  T.scatterCircle(ctx, 0, 140, 60, P.black, 0.5, 4);
  T.scatterCircle(ctx, 320, 140, 60, P.black, 0.5, 4);

  // Bar shadows on floor
  if (params.hasBars) {
    for (let b = 0; b < 10; b++) {
      const barShadowX = 90 + b * 16;
      T.scatter(ctx, barShadowX, 120, 3, 20, P.black, 0.4, 4);
    }
  }

  // Moonlight streaming through window
  if (params.hasWindow && params.moonlight !== 'none') {
    const lightIntensity = params.moonlight === 'full' ? 0.15 : 0.08;

    // Light beam cone from window
    T.scatter(ctx, 240, 50, 30, 30, P.dark_blue, lightIntensity, 4);
    T.scatter(ctx, 230, 80, 50, 30, P.dark_blue, lightIntensity * 0.6, 4);
    T.scatter(ctx, 220, 110, 70, 30, P.dark_blue, lightIntensity * 0.4, 4);

    // Window bar shadows cast by moonlight
    for (let wb = 0; wb < 4; wb++) {
      const shadowX = 235 + wb * 7 - 20;
      T.scatter(ctx, shadowX, 80, 2, 60, P.black, 0.5, 4);
    }
  }

  // Chain shadows on wall
  if (params.hasChains) {
    T.scatter(ctx, 21, 31, 2, 45, P.black, 0.4, 4);
    T.scatter(ctx, 61, 36, 2, 45, P.black, 0.4, 4);
  }

  // Bucket shadow
  T.scatter(ctx, 281, 136, 18, 4, P.black, 0.5, 4);
}

// =========================================================================
//  Layer 5 — ATMOSPHERE: Ambient effects (scatter/scatterCircle/pixel only)
// =========================================================================

function _atmosphere(ctx, P, params) {
  // Overall oppressive darkness
  T.scatter(ctx, 0, 0, 320, 140, P.black, 0.25, 4);

  // Cold blue undertone (dungeon chill)
  T.scatter(ctx, 0, 0, 320, 140, P.dark_blue, 0.08, 4);

  // Moonlight atmospheric glow
  if (params.hasWindow && params.moonlight !== 'none') {
    const glowIntensity = params.moonlight === 'full' ? 0.06 : 0.03;
    T.scatter(ctx, 200, 0, 120, 140, P.dark_blue, glowIntensity, 4);
    T.scatter(ctx, 220, 20, 80, 100, P.white, glowIntensity * 0.3, 4);
  }

  // Dampness atmosphere (greenish tint on wet stone)
  if (params.moistureLevel === 'wet') {
    const dampColor = P.dark_green || P.dark_blue;
    T.scatter(ctx, 0, 0, 320, 140, dampColor, 0.04, 4);
  }

  // Dust particles in moonlight beam
  if (params.hasWindow && params.moonlight !== 'none') {
    for (let d = 0; d < 25; d++) {
      const dustX = 220 + (d * 13) % 80;
      const dustY = 50 + (d * 17) % 80;
      T.pixel(ctx, dustX, dustY, P.gray);
    }
  }

  // Subtle torch glow if there were distant torches (ambient warm flicker)
  // Very faint orange on left edge suggesting distant light source
  T.scatter(ctx, 0, 40, 40, 60, P.orange, 0.02, 4);
}
