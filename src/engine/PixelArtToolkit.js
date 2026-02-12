/**
 * PixelArtToolkit — Low-level drawing primitives for EGA-style pixel art.
 * Static utility class used by ProceduralAssets and CharacterGenerator.
 * All methods operate directly on a CanvasRenderingContext2D.
 *
 * RENDERING LAYER CONTRACT:
 * Room backgrounds are generated in 5 ordered layers:
 *   Layer 1 (BASE):       Sky, ground, walls — use rect(), dither(), ditherGradient()
 *   Layer 2 (STRUCTURES): Buildings, furniture — use rect(), polygon(), dither() for textures
 *   Layer 3 (DETAILS):    Decorative objects — use rect(), pixel(), ellipse(), line()
 *   Layer 4 (SHADING):    Shadows, depth — use scatter(), scatterCircle() ONLY
 *   Layer 5 (ATMOSPHERE): Ambient effects — use scatter(), scatterCircle(), pixel() ONLY
 *
 * Rule: Layers 4-5 must NEVER use dither() or any other opaque fill method.
 * Only scatter/scatterCircle (overlay methods) preserve existing art underneath.
 *
 * Method classification:
 *   OPAQUE (overwrites all pixels):  dither(), ditherGradient(), ditherGradientMulti(), rect()
 *   OVERLAY (alpha compositing):     scatter(), scatterCircle(), pixel()
 */
export class PixelArtToolkit {

  // ========== Basic drawing ==========

  static pixel(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  }

  static rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
  }

  // ========== Bresenham line ==========

  static line(ctx, x0, y0, x1, y1, color) {
    x0 = Math.floor(x0); y0 = Math.floor(y0);
    x1 = Math.floor(x1); y1 = Math.floor(y1);
    ctx.fillStyle = color;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      ctx.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }

  // ========== Circle (midpoint algorithm, 8-way symmetry) ==========

  static circle(ctx, cx, cy, r, color) {
    cx = Math.floor(cx); cy = Math.floor(cy); r = Math.floor(r);
    ctx.fillStyle = color;
    let x = r, y = 0, d = 1 - r;

    const plot8 = (px, py) => {
      ctx.fillRect(cx + px, cy + py, 1, 1);
      ctx.fillRect(cx - px, cy + py, 1, 1);
      ctx.fillRect(cx + px, cy - py, 1, 1);
      ctx.fillRect(cx - px, cy - py, 1, 1);
      ctx.fillRect(cx + py, cy + px, 1, 1);
      ctx.fillRect(cx - py, cy + px, 1, 1);
      ctx.fillRect(cx + py, cy - px, 1, 1);
      ctx.fillRect(cx - py, cy - px, 1, 1);
    };

    while (x >= y) {
      plot8(x, y);
      y++;
      if (d <= 0) {
        d += 2 * y + 1;
      } else {
        x--;
        d += 2 * (y - x) + 1;
      }
    }
  }

  static circleFill(ctx, cx, cy, r, color) {
    cx = Math.floor(cx); cy = Math.floor(cy); r = Math.floor(r);
    ctx.fillStyle = color;
    let x = r, y = 0, d = 1 - r;

    const hline = (x1, x2, hy) => {
      ctx.fillRect(Math.min(x1, x2), hy, Math.abs(x2 - x1) + 1, 1);
    };

    while (x >= y) {
      hline(cx - x, cx + x, cy + y);
      hline(cx - x, cx + x, cy - y);
      hline(cx - y, cx + y, cy + x);
      hline(cx - y, cx + y, cy - x);
      y++;
      if (d <= 0) {
        d += 2 * y + 1;
      } else {
        x--;
        d += 2 * (y - x) + 1;
      }
    }
  }

  // ========== Ellipse (midpoint, two-region) ==========

  static ellipse(ctx, cx, cy, rx, ry, color) {
    cx = Math.floor(cx); cy = Math.floor(cy);
    rx = Math.floor(rx); ry = Math.floor(ry);
    if (rx <= 0 || ry <= 0) return;
    ctx.fillStyle = color;

    const rx2 = rx * rx, ry2 = ry * ry;
    let x = 0, y = ry;
    let px = 0, py = 2 * rx2 * y;

    const plot4 = (px, py) => {
      ctx.fillRect(cx + px, cy + py, 1, 1);
      ctx.fillRect(cx - px, cy + py, 1, 1);
      ctx.fillRect(cx + px, cy - py, 1, 1);
      ctx.fillRect(cx - px, cy - py, 1, 1);
    };

    // Region 1
    let d1 = ry2 - rx2 * ry + 0.25 * rx2;
    while (px < py) {
      plot4(x, y);
      x++; px += 2 * ry2;
      if (d1 < 0) {
        d1 += ry2 + px;
      } else {
        y--; py -= 2 * rx2;
        d1 += ry2 + px - py;
      }
    }

    // Region 2
    let d2 = ry2 * (x + 0.5) * (x + 0.5) + rx2 * (y - 1) * (y - 1) - rx2 * ry2;
    while (y >= 0) {
      plot4(x, y);
      y--; py -= 2 * rx2;
      if (d2 > 0) {
        d2 += rx2 - py;
      } else {
        x++; px += 2 * ry2;
        d2 += ry2 + rx2 - py + px;
      }
    }
  }

  static ellipseFill(ctx, cx, cy, rx, ry, color) {
    cx = Math.floor(cx); cy = Math.floor(cy);
    rx = Math.floor(rx); ry = Math.floor(ry);
    if (rx <= 0 || ry <= 0) return;
    ctx.fillStyle = color;

    for (let y = -ry; y <= ry; y++) {
      const xSpan = Math.floor(rx * Math.sqrt(1 - (y * y) / (ry * ry)));
      ctx.fillRect(cx - xSpan, cy + y, xSpan * 2 + 1, 1);
    }
  }

  // ========== Polygon ==========

  static polygon(ctx, points, color) {
    if (points.length < 2) return;
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      this.line(ctx, a[0], a[1], b[0], b[1], color);
    }
  }

  static polygonFill(ctx, points, color) {
    if (points.length < 3) return;
    ctx.fillStyle = color;

    // Find bounding box
    let minY = Infinity, maxY = -Infinity;
    for (const p of points) {
      if (p[1] < minY) minY = p[1];
      if (p[1] > maxY) maxY = p[1];
    }
    minY = Math.floor(minY);
    maxY = Math.floor(maxY);

    // Scanline fill
    for (let y = minY; y <= maxY; y++) {
      const intersections = [];
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        const ay = a[1], by = b[1];
        if ((ay <= y && by > y) || (by <= y && ay > y)) {
          const t = (y - ay) / (by - ay);
          intersections.push(Math.floor(a[0] + t * (b[0] - a[0])));
        }
      }
      intersections.sort((a, b) => a - b);
      for (let i = 0; i < intersections.length - 1; i += 2) {
        ctx.fillRect(intersections[i], y, intersections[i + 1] - intersections[i] + 1, 1);
      }
    }
  }

  // ========== Dithering (Bayer ordered) ==========

  static BAYER_2x2 = [
    [0, 2],
    [3, 1],
  ];

  static BAYER_4x4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ];

  /**
   * OPAQUE FILL — Fill a rectangular region with ordered Bayer dithering between two colors.
   * WARNING: This draws EVERY pixel in the region (choosing color1 or color2).
   * It will OVERWRITE any existing art in the area.
   *
   * Use for: base textures (wood floors, stone walls, bark, cobblestones).
   * Use in rendering layers: BASE, STRUCTURES, DETAILS (layers 1-3).
   * For overlays that preserve existing art, use scatter() or scatterCircle() instead.
   *
   * @param {number} ratio - 0.0 = all color1, 1.0 = all color2
   * @param {number} matrixSize - 2 or 4 (default 4)
   */
  static dither(ctx, x, y, w, h, color1, color2, ratio, matrixSize) {
    x = Math.floor(x); y = Math.floor(y);
    const c1 = this.parseColor(color1);
    const c2 = this.parseColor(color2);
    const matrix = matrixSize === 2 ? this.BAYER_2x2 : this.BAYER_4x4;
    const size = matrixSize === 2 ? 2 : 4;
    const levels = size * size;

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const threshold = (matrix[(y + py) % size][(x + px) % size] + 0.5) / levels;
        const useC2 = ratio > threshold;
        const c = useC2 ? c2 : c1;
        ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
        ctx.fillRect(x + px, y + py, 1, 1);
      }
    }
  }

  /**
   * Dithered gradient across a region.
   * @param {string} direction - 'vertical', 'horizontal'
   */
  static ditherGradient(ctx, x, y, w, h, color1, color2, direction) {
    x = Math.floor(x); y = Math.floor(y);
    const c1 = this.parseColor(color1);
    const c2 = this.parseColor(color2);
    const matrix = this.BAYER_4x4;

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const ratio = direction === 'horizontal'
          ? px / (w - 1 || 1)
          : py / (h - 1 || 1);
        const threshold = (matrix[(y + py) % 4][(x + px) % 4] + 0.5) / 16;
        const useC2 = ratio > threshold;
        const c = useC2 ? c2 : c1;
        ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
        ctx.fillRect(x + px, y + py, 1, 1);
      }
    }
  }

  /**
   * Multi-stop dithered gradient. Stops is an array of { pos: 0-1, color: '#hex' }.
   */
  static ditherGradientMulti(ctx, x, y, w, h, stops, direction) {
    x = Math.floor(x); y = Math.floor(y);
    const parsedStops = stops.map(s => ({ pos: s.pos, c: this.parseColor(s.color) }));
    const matrix = this.BAYER_4x4;

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const t = direction === 'horizontal'
          ? px / (w - 1 || 1)
          : py / (h - 1 || 1);

        // Find the two bounding stops
        let lo = parsedStops[0], hi = parsedStops[parsedStops.length - 1];
        for (let i = 0; i < parsedStops.length - 1; i++) {
          if (t >= parsedStops[i].pos && t <= parsedStops[i + 1].pos) {
            lo = parsedStops[i];
            hi = parsedStops[i + 1];
            break;
          }
        }

        const range = hi.pos - lo.pos || 1;
        const localT = (t - lo.pos) / range;
        const threshold = (matrix[(y + py) % 4][(x + px) % 4] + 0.5) / 16;
        const c = localT > threshold ? hi.c : lo.c;
        ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
        ctx.fillRect(x + px, y + py, 1, 1);
      }
    }
  }

  // ========== Overlay methods (preserve existing art) ==========

  /**
   * OVERLAY METHOD — Semi-transparent rectangle fill using globalAlpha.
   * Draws accentColor at the given opacity over existing art.
   *
   * Use for: atmosphere washes, glow halos, shadow tints, light shafts, dust.
   * Use in rendering layers: SHADING, ATMOSPHERE (layers 4-5).
   * For opaque base fills, use dither() instead.
   *
   * @param {number} ratio - 0.0 = fully transparent, 1.0 = solid fill of accentColor
   * @param {number} matrixSize - Unused, kept for API compatibility
   */
  static scatter(ctx, x, y, w, h, accentColor, ratio, matrixSize) {
    ctx.save();
    ctx.globalAlpha = ratio;
    ctx.fillStyle = accentColor;
    ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
    ctx.restore();
  }

  /**
   * OVERLAY METHOD — Radial gradient fill with alpha falloff.
   * Draws a circular glow that fades from intensity at center to transparent at edge.
   *
   * Use for: point light glows, fireplace warmth, lantern halos, mushroom glow.
   *
   * @param {number} cx - Center X
   * @param {number} cy - Center Y
   * @param {number} radius - Radius in pixels
   * @param {string} accentColor - Color for the glow
   * @param {number} intensity - Alpha at center (0.0 to 1.0)
   * @param {number} matrixSize - Unused, kept for API compatibility
   */
  static scatterCircle(ctx, cx, cy, radius, accentColor, intensity, matrixSize) {
    cx = Math.floor(cx); cy = Math.floor(cy); radius = Math.floor(radius);
    const [r, g, b] = this.parseColor(accentColor);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, `rgba(${r},${g},${b},${intensity})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ========== Color utilities ==========

  static parseColor(hex) {
    if (typeof hex !== 'string') return [0, 0, 0];
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    return [
      parseInt(hex.slice(0, 2), 16) || 0,
      parseInt(hex.slice(2, 4), 16) || 0,
      parseInt(hex.slice(4, 6), 16) || 0,
    ];
  }

  static toHex(r, g, b) {
    return '#' + [r, g, b].map(c =>
      Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')
    ).join('');
  }

  static darken(hex, amount) {
    const [r, g, b] = this.parseColor(hex);
    return this.toHex(r - amount, g - amount, b - amount);
  }

  static lighten(hex, amount) {
    const [r, g, b] = this.parseColor(hex);
    return this.toHex(r + amount, g + amount, b + amount);
  }

  /**
   * Blend two hex colors by ratio (0 = color1, 1 = color2).
   */
  static blend(color1, color2, ratio) {
    const c1 = this.parseColor(color1);
    const c2 = this.parseColor(color2);
    return this.toHex(
      c1[0] + (c2[0] - c1[0]) * ratio,
      c1[1] + (c2[1] - c1[1]) * ratio,
      c1[2] + (c2[2] - c1[2]) * ratio,
    );
  }
}
