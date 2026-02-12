/**
 * video_store.js — 80s video rental store interior room template.
 *
 * Generates a retro video store with VHS shelves, new releases wall,
 * TV playing a movie, beaded curtain, posters, counter with register.
 * All art uses PixelArtToolkit primitives following the 5-layer contract.
 */

import { PixelArtToolkit as T } from '../../engine/PixelArtToolkit.js';
import { drawWoodWall, drawWoodFloor, applyWarmWash } from '../_base.js';

export const metadata = {
  id: 'eighties/video_store',
  name: 'Video Store',
  setting: 'eighties',
  category: 'interior',
  palette: 'record_store_dark',
  params: {
    shelfDensity: { type: 'enum', options: ['sparse', 'normal', 'packed'], default: 'normal', label: 'Shelf Density' },
    hasTv: { type: 'boolean', default: true, label: 'TV Display' },
    hasBeadCurtain: { type: 'boolean', default: true, label: 'Beaded Curtain' },
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
//  Layer 1 (BASE): Ceiling, walls, carpet floor
// ---------------------------------------------------------------------------

function _base(ctx, P, params) {
  // --- Ceiling (rows 0-14) ---
  T.rect(ctx, 0, 0, 320, 15, P.dark_gray);
  T.dither(ctx, 0, 0, 320, 15, P.dark_gray, P.black, 0.15, 4);

  // Ceiling tiles
  for (let x = 0; x < 320; x += 20) {
    T.rect(ctx, x, 0, 1, 15, P.black);
  }
  for (let y = 0; y < 15; y += 7) {
    T.rect(ctx, 0, y, 320, 1, P.black);
  }

  // Fluorescent light strips
  T.rect(ctx, 60, 3, 40, 3, P.gray);
  T.rect(ctx, 61, 4, 38, 1, P.white);
  T.rect(ctx, 180, 3, 40, 3, P.gray);
  T.rect(ctx, 181, 4, 38, 1, P.white);

  // --- Walls (rows 15-76) ---
  // Use wood paneling for that 80s aesthetic
  drawWoodWall(ctx, P, 0, 15, 320, 62, {
    baseColor: P.dark_brown,
    grainColor: P.black,
    highlightColor: P.brown,
    plankH: 8,
  });

  // Wall baseboard trim
  T.rect(ctx, 0, 75, 320, 1, P.brown);
  T.rect(ctx, 0, 76, 320, 1, P.tan);

  // --- Carpet floor (rows 77-140) ---
  T.rect(ctx, 0, 77, 320, 63, P.dark_red);
  T.dither(ctx, 0, 77, 320, 63, P.dark_red, P.black, 0.25, 4);

  // Carpet pattern — 80s geometric
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 20; col++) {
      const dx = col * 16 + (row % 2) * 8;
      const dy = 78 + row * 8;
      // Small square pattern
      if (dx < 318 && dy < 138) {
        T.pixel(ctx, dx + 2, dy + 2, P.red);
        T.pixel(ctx, dx + 3, dy + 2, P.red);
        T.pixel(ctx, dx + 2, dy + 3, P.red);
        T.pixel(ctx, dx + 3, dy + 3, P.red);
      }
    }
  }

  // Carpet stripes
  for (let cx = 0; cx < 320; cx += 5) {
    const cy = 100 + (cx % 10 === 0 ? 0 : 1);
    T.pixel(ctx, cx, cy, P.orange);
  }
}

// ---------------------------------------------------------------------------
//  Layer 2 (STRUCTURES): Shelving units, counter, TV stand, beaded curtain
// ---------------------------------------------------------------------------

function _structures(ctx, P, params) {
  // --- Left wall VHS shelves ---
  _drawVhsShelves(ctx, P, params, 8, 25);

  // --- New Releases wall display (center back) ---
  _drawNewReleasesWall(ctx, P, params);

  // --- Right wall VHS shelves ---
  _drawVhsShelves(ctx, P, params, 240, 25);

  // --- Counter with register ---
  _drawCounter(ctx, P);

  // --- TV display stand ---
  if (params.hasTv) {
    _drawTvStand(ctx, P);
  }

  // --- Beaded curtain to back room ---
  if (params.hasBeadCurtain) {
    _drawBeadCurtain(ctx, P);
  }
}

function _drawVhsShelves(ctx, P, params, baseX, baseY) {
  const isDense = params.shelfDensity === 'packed';
  const isSparse = params.shelfDensity === 'sparse';

  // Shelf backing
  T.rect(ctx, baseX, baseY, 28, 48, P.dark_brown);
  T.dither(ctx, baseX, baseY, 28, 48, P.dark_brown, P.black, 0.12, 4);

  // Shelf boards — 4 shelves
  for (let s = 0; s < 4; s++) {
    const sy = baseY + s * 12;
    T.rect(ctx, baseX, sy, 28, 2, P.brown);
    T.rect(ctx, baseX, sy, 28, 1, P.tan);
  }

  // VHS tapes on shelves
  const tapesPerShelf = isDense ? 7 : isSparse ? 4 : 6;
  const tapeColors = [P.dark_purple, P.dark_gray, P.red, P.orange, P.yellow, P.purple, P.white];

  for (let shelf = 0; shelf < 4; shelf++) {
    const sy = baseY + shelf * 12 + 2;
    const tapeCount = Math.max(2, tapesPerShelf - (shelf % 2));

    for (let t = 0; t < tapeCount; t++) {
      const tx = baseX + 2 + t * 4;
      const tapeColor = tapeColors[(shelf * 7 + t) % tapeColors.length];

      // VHS spine
      T.rect(ctx, tx, sy, 3, 9, tapeColor);
      T.rect(ctx, tx, sy, 3, 1, T.lighten(tapeColor, 20));

      // Tape label line
      T.rect(ctx, tx, sy + 3, 3, 1, P.white);
      T.rect(ctx, tx, sy + 6, 3, 1, P.white);
    }
  }

  // Shelf support brackets
  T.rect(ctx, baseX, baseY, 2, 48, P.black);
  T.rect(ctx, baseX + 26, baseY, 2, 48, P.black);
}

function _drawNewReleasesWall(ctx, P, params) {
  const nx = 90, ny = 18, nw = 140, nh = 56;

  // Wall section backing
  T.rect(ctx, nx, ny, nw, nh, P.dark_brown);
  T.dither(ctx, nx, ny, nw, nh, P.dark_brown, P.brown, 0.1, 4);

  // "NEW RELEASES" sign at top
  T.rect(ctx, nx + 20, ny + 2, 100, 8, P.red);
  T.rect(ctx, nx + 21, ny + 3, 98, 6, P.yellow);
  // Sign text simulation
  T.rect(ctx, nx + 25, ny + 5, 90, 1, P.black);
  T.rect(ctx, nx + 27, ny + 7, 86, 1, P.black);

  // VHS box covers displayed — 3 rows of 4
  const boxW = 18;
  const boxH = 12;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const bx = nx + 20 + col * 28;
      const by = ny + 14 + row * 16;

      // Box cover — colorful movie art
      const coverColors = [
        [P.dark_purple, P.purple, P.white],
        [P.dark_red, P.red, P.yellow],
        [P.dark_gray, P.gray, P.orange],
        [P.dark_blue, P.blue, P.white],
      ];
      const palette = coverColors[(row * 4 + col) % 4];

      T.rect(ctx, bx, by, boxW, boxH, P.black);
      T.rect(ctx, bx + 1, by + 1, boxW - 2, boxH - 2, palette[0]);
      T.rect(ctx, bx + 3, by + 2, boxW - 6, boxH - 5, palette[1]);
      T.rect(ctx, bx + 4, by + 7, boxW - 8, 3, palette[2]);

      // Title text simulation
      T.rect(ctx, bx + 2, by + boxH - 2, boxW - 4, 1, P.white);
    }
  }
}

function _drawCounter(ctx, P) {
  const cx = 260, cy = 48;

  // Counter body
  T.rect(ctx, cx, cy, 52, 28, P.brown);
  T.dither(ctx, cx, cy, 52, 28, P.brown, P.dark_brown, 0.15, 4);

  // Counter top surface
  T.rect(ctx, cx - 1, cy - 2, 54, 3, P.tan);
  T.rect(ctx, cx - 1, cy - 2, 54, 1, P.brown);

  // Front panel
  T.rect(ctx, cx + 2, cy + 4, 48, 20, P.dark_brown);
  T.rect(ctx, cx + 3, cy + 5, 46, 18, P.brown);

  // Cash register
  T.rect(ctx, cx + 18, cy + 2, 20, 16, P.dark_gray);
  T.rect(ctx, cx + 19, cy + 3, 18, 10, P.gray);
  T.dither(ctx, cx + 19, cy + 3, 18, 10, P.gray, P.dark_gray, 0.1, 4);

  // Register display
  T.rect(ctx, cx + 21, cy + 4, 14, 5, P.black);
  T.rect(ctx, cx + 22, cy + 5, 12, 3, P.orange);

  // Register buttons
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      T.rect(ctx, cx + 20 + c * 4, cy + 11 + r * 3, 3, 2, P.white);
    }
  }

  // Counter base visible below
  T.rect(ctx, cx, cy + 28, 52, 48, P.dark_brown);
  T.dither(ctx, cx, cy + 28, 52, 48, P.dark_brown, P.black, 0.2, 4);

  // Candy display on counter
  T.rect(ctx, cx + 2, cy - 12, 12, 10, P.dark_gray);
  T.rect(ctx, cx + 3, cy - 11, 10, 8, P.black);
  // Candy inside
  T.pixel(ctx, cx + 5, cy - 9, P.red);
  T.pixel(ctx, cx + 7, cy - 8, P.yellow);
  T.pixel(ctx, cx + 9, cy - 10, P.orange);
  T.pixel(ctx, cx + 6, cy - 7, P.purple);
}

function _drawTvStand(ctx, P) {
  const tx = 38, ty = 42;

  // Stand/cart
  T.rect(ctx, tx, ty, 26, 30, P.dark_gray);
  T.dither(ctx, tx, ty, 26, 30, P.dark_gray, P.black, 0.12, 4);

  // Shelf surface
  T.rect(ctx, tx - 1, ty - 1, 28, 2, P.gray);

  // TV set
  T.rect(ctx, tx + 2, ty + 2, 22, 18, P.black);
  T.rect(ctx, tx + 3, ty + 3, 20, 14, P.dark_gray);

  // Screen bezel
  T.rect(ctx, tx + 4, ty + 4, 18, 12, P.black);

  // Screen content — playing a movie (action scene)
  T.rect(ctx, tx + 5, ty + 5, 16, 10, P.dark_blue);
  T.dither(ctx, tx + 5, ty + 5, 16, 10, P.dark_blue, P.blue, 0.3, 4);

  // Movie scene elements
  T.rect(ctx, tx + 7, ty + 10, 4, 4, P.orange); // explosion
  T.pixel(ctx, tx + 9, ty + 9, P.yellow);
  T.pixel(ctx, tx + 8, ty + 11, P.red);
  T.rect(ctx, tx + 14, ty + 12, 3, 2, P.gray); // car/figure

  // TV controls
  T.rect(ctx, tx + 24, ty + 8, 1, 8, P.gray);
  T.pixel(ctx, tx + 24, ty + 9, P.white);
  T.pixel(ctx, tx + 24, ty + 12, P.white);

  // VCR below TV
  T.rect(ctx, tx + 3, ty + 20, 20, 4, P.black);
  T.rect(ctx, tx + 4, ty + 21, 18, 2, P.dark_gray);
  T.rect(ctx, tx + 6, ty + 21, 2, 2, P.red); // recording LED
  T.rect(ctx, tx + 10, ty + 21, 8, 1, P.orange); // display

  // Stand wheels
  T.pixel(ctx, tx + 2, ty + 28, P.black);
  T.pixel(ctx, tx + 24, ty + 28, P.black);
}

function _drawBeadCurtain(ctx, P) {
  const bx = 280, by = 20, bw = 34, bh = 56;

  // Doorway/opening
  T.rect(ctx, bx, by, bw, bh, P.black);
  T.dither(ctx, bx, by, bw, bh, P.black, P.dark_gray, 0.1, 4);

  // Door frame
  T.rect(ctx, bx - 2, by - 2, 2, bh + 2, P.dark_brown);
  T.rect(ctx, bx + bw, by - 2, 2, bh + 2, P.dark_brown);
  T.rect(ctx, bx - 2, by - 2, bw + 4, 2, P.dark_brown);

  // Beaded strands — vertical strings of colored beads
  const strandCount = 12;
  const beadColors = [P.red, P.orange, P.yellow, P.purple, P.white, P.tan];

  for (let s = 0; s < strandCount; s++) {
    const sx = bx + 2 + s * 3;
    // Draw beads down the strand
    for (let b = 0; b < 18; b++) {
      const beadY = by + 2 + b * 3;
      const color = beadColors[(s + b) % beadColors.length];
      T.pixel(ctx, sx, beadY, color);
      if (b % 2 === 0) {
        T.pixel(ctx, sx, beadY + 1, color);
      }
    }
  }
}

// ---------------------------------------------------------------------------
//  Layer 3 (DETAILS): Movie posters, membership cards, stickers, floor items
// ---------------------------------------------------------------------------

function _details(ctx, P, params) {
  // --- Movie posters on walls ---
  _drawMoviePosters(ctx, P);

  // --- Membership card holder on counter ---
  const cx = 260;
  T.rect(ctx, cx + 3, 35, 10, 8, P.dark_gray);
  T.rect(ctx, cx + 4, 36, 8, 6, P.white);
  // Cards visible
  for (let i = 0; i < 3; i++) {
    T.rect(ctx, cx + 5 + i, 37, 1, 4, P.yellow);
  }

  // --- "BE KIND REWIND" sticker on counter ---
  T.rect(ctx, cx + 32, 38, 16, 6, P.red);
  T.rect(ctx, cx + 33, 39, 14, 4, P.white);
  T.rect(ctx, cx + 34, 40, 12, 1, P.black);
  T.rect(ctx, cx + 35, 42, 10, 1, P.black);

  // --- Promotional standee (cardboard cutout) ---
  T.rect(ctx, 70, 52, 14, 24, P.dark_gray);
  T.rect(ctx, 71, 53, 12, 20, P.dark_purple);
  T.rect(ctx, 73, 56, 8, 10, P.purple);
  T.pixel(ctx, 76, 59, P.white); // face
  T.pixel(ctx, 77, 59, P.white);

  // --- Popcorn machine near entrance ---
  T.rect(ctx, 8, 50, 12, 22, P.red);
  T.rect(ctx, 9, 51, 10, 8, P.dark_gray);
  T.rect(ctx, 10, 52, 8, 6, P.yellow);
  // Popcorn inside
  T.pixel(ctx, 12, 54, P.white);
  T.pixel(ctx, 14, 53, P.white);
  T.pixel(ctx, 13, 56, P.white);
  T.pixel(ctx, 15, 55, P.white);

  // --- Drop box for returns ---
  T.rect(ctx, 230, 62, 20, 14, P.dark_blue);
  T.rect(ctx, 231, 63, 18, 12, P.blue);
  T.rect(ctx, 235, 64, 10, 3, P.black); // slot
  T.rect(ctx, 233, 70, 14, 1, P.white); // "RETURNS" label

  // --- Scattered VHS tapes on floor (returns waiting to be shelved) ---
  T.rect(ctx, 100, 118, 6, 4, P.dark_purple);
  T.rect(ctx, 101, 118, 4, 1, P.purple);

  T.rect(ctx, 150, 125, 6, 4, P.red);
  T.rect(ctx, 151, 125, 4, 1, P.orange);

  T.rect(ctx, 190, 132, 6, 4, P.dark_gray);
  T.rect(ctx, 191, 132, 4, 1, P.gray);

  // --- Trash can near counter ---
  T.rect(ctx, 248, 66, 8, 10, P.dark_gray);
  T.rect(ctx, 249, 67, 6, 8, P.gray);
  T.dither(ctx, 249, 67, 6, 8, P.gray, P.dark_gray, 0.2, 4);

  // --- "OPEN" sign visible on door/window area ---
  T.rect(ctx, 2, 30, 12, 8, P.red);
  T.rect(ctx, 3, 31, 10, 6, P.white);
  T.rect(ctx, 4, 33, 8, 1, P.black);
  T.rect(ctx, 5, 35, 6, 1, P.black);

  // --- Ceiling fan ---
  T.pixel(ctx, 160, 8, P.dark_gray);
  T.rect(ctx, 155, 8, 10, 1, P.gray);
  T.rect(ctx, 159, 7, 2, 3, P.dark_gray);

  // --- Clock on wall ---
  T.circleFill(ctx, 120, 20, 4, P.white);
  T.circleFill(ctx, 120, 20, 3, P.black);
  T.pixel(ctx, 120, 18, P.white); // 12 o'clock mark
  T.line(ctx, 120, 20, 120, 18, P.white); // hour hand
  T.line(ctx, 120, 20, 122, 20, P.white); // minute hand

  // --- Exit sign above beaded curtain ---
  if (params.hasBeadCurtain) {
    T.rect(ctx, 285, 16, 14, 5, P.red);
    T.rect(ctx, 286, 17, 12, 3, P.white);
    T.rect(ctx, 287, 18, 10, 1, P.black);
  }
}

function _drawMoviePosters(ctx, P) {
  // Poster 1 — left wall
  T.rect(ctx, 44, 22, 16, 20, P.black);
  T.rect(ctx, 45, 23, 14, 18, P.dark_purple);
  T.rect(ctx, 47, 26, 10, 8, P.purple);
  T.rect(ctx, 48, 35, 8, 2, P.yellow);
  T.rect(ctx, 47, 39, 10, 1, P.white);

  // Poster 2 — right wall
  T.rect(ctx, 260, 24, 14, 18, P.black);
  T.rect(ctx, 261, 25, 12, 16, P.dark_red);
  T.rect(ctx, 263, 28, 8, 6, P.red);
  T.rect(ctx, 264, 36, 6, 2, P.white);
  T.rect(ctx, 263, 39, 8, 1, P.yellow);

  // Poster 3 — near shelves
  T.rect(ctx, 210, 22, 14, 18, P.black);
  T.rect(ctx, 211, 23, 12, 16, P.dark_gray);
  T.rect(ctx, 213, 26, 8, 6, P.gray);
  T.rect(ctx, 214, 34, 6, 2, P.orange);
  T.rect(ctx, 213, 37, 8, 1, P.white);

  // Poster frame highlights
  T.rect(ctx, 44, 22, 16, 1, P.tan);
  T.rect(ctx, 260, 24, 14, 1, P.tan);
  T.rect(ctx, 210, 22, 14, 1, P.tan);
}

// ---------------------------------------------------------------------------
//  Layer 4 (SHADING): Shadows from shelves, counter, TV glow
// ---------------------------------------------------------------------------

function _shading(ctx, P, params) {
  // --- TV screen glow ---
  if (params.hasTv) {
    T.scatterCircle(ctx, 51, 51, 18, P.blue, 0.1);
    T.scatterCircle(ctx, 51, 75, 20, P.dark_blue, 0.08);
  }

  // --- Shelf shadows on wall ---
  T.scatter(ctx, 8, 73, 28, 4, P.black, 0.12);
  T.scatter(ctx, 240, 73, 28, 4, P.black, 0.12);

  // --- Counter shadow on floor ---
  T.scatter(ctx, 260, 76, 52, 6, P.black, 0.15);

  // --- New releases wall depth ---
  T.scatter(ctx, 90, 74, 140, 3, P.black, 0.1);

  // --- Beaded curtain doorway shadow ---
  if (params.hasBeadCurtain) {
    T.scatter(ctx, 280, 76, 34, 4, P.black, 0.12);
  }

  // --- General floor shadow gradient (darker near walls) ---
  T.scatter(ctx, 0, 110, 320, 30, P.black, 0.08);
  T.scatter(ctx, 0, 77, 6, 63, P.black, 0.1);
  T.scatter(ctx, 314, 77, 6, 63, P.black, 0.08);

  // --- Ceiling shadow depth ---
  T.scatter(ctx, 0, 0, 320, 3, P.black, 0.1);

  // --- Popcorn machine shadow ---
  T.scatter(ctx, 20, 60, 4, 16, P.black, 0.08);

  // --- VHS shelves shadow (3D depth) ---
  T.scatter(ctx, 36, 30, 3, 44, P.black, 0.1);
  T.scatter(ctx, 268, 30, 3, 44, P.black, 0.1);

  // --- Counter register shadow ---
  T.scatter(ctx, 278, 50, 14, 4, P.black, 0.06);

  // --- Under-counter darkness ---
  T.scatter(ctx, 260, 74, 52, 4, P.black, 0.15);
}

// ---------------------------------------------------------------------------
//  Layer 5 (ATMOSPHERE): Warm nostalgic wash, fluorescent tint, dust motes
// ---------------------------------------------------------------------------

function _atmosphere(ctx, P, params) {
  // --- Warm amber nostalgic wash ---
  applyWarmWash(ctx, P, 0.04);

  // --- Fluorescent ceiling light tint (slightly cool on top half) ---
  T.scatter(ctx, 0, 0, 320, 60, P.white, 0.02);

  // --- Subtle orange accent from popcorn machine area ---
  T.scatterCircle(ctx, 14, 61, 25, P.orange, 0.03);

  // --- TV blue glow atmospheric spread ---
  if (params.hasTv) {
    T.scatterCircle(ctx, 51, 51, 35, P.blue, 0.04);
    T.scatter(ctx, 30, 70, 50, 30, P.dark_blue, 0.02);
  }

  // --- Register display orange glow ---
  T.scatterCircle(ctx, 289, 52, 10, P.orange, 0.04);

  // --- Beaded curtain back room darkness ---
  if (params.hasBeadCurtain) {
    T.scatter(ctx, 280, 20, 34, 56, P.black, 0.15);
  }

  // --- Dust motes in light beams ---
  const dustPositions = [
    [65, 22], [70, 35], [85, 28], [100, 40], [115, 25],
    [185, 30], [195, 42], [210, 28], [225, 38], [200, 48],
    [50, 18], [180, 20], [300, 25], [160, 45], [140, 32],
    [90, 50], [250, 35], [120, 55], [175, 22], [280, 40],
  ];

  for (const [dx, dy] of dustPositions) {
    T.pixel(ctx, dx, dy, P.white);
  }

  // --- Vignette: darken edges ---
  T.scatter(ctx, 0, 0, 25, 25, P.black, 0.06);
  T.scatter(ctx, 295, 0, 25, 25, P.black, 0.06);
  T.scatter(ctx, 0, 115, 25, 25, P.black, 0.06);
  T.scatter(ctx, 295, 115, 25, 25, P.black, 0.06);

  // --- Overall warm nostalgic tint ---
  T.scatter(ctx, 0, 0, 320, 140, P.tan, 0.02);

  // --- Slight red carpet reflection upward ---
  T.scatter(ctx, 0, 60, 320, 20, P.dark_red, 0.02);
}
