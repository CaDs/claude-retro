/**
 * Renderer — Handles all canvas drawing at internal resolution with pixel-perfect scaling.
 */
export class Renderer {
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = width;
    this.height = height;

    // Create offscreen buffer at internal resolution
    this.buffer = document.createElement('canvas');
    this.buffer.width = width;
    this.buffer.height = height;
    this.bufCtx = this.buffer.getContext('2d');
    this.bufCtx.imageSmoothingEnabled = false;

    // Fade overlay
    this.fadeAlpha = 0;
    this.fadeTarget = 0;
    this.fadeSpeed = 0.05;

    // Hi-res text overlay queue
    this._hiResQueue = [];

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;
    const scale = Math.min(
      Math.floor(windowW / this.width),
      Math.floor(windowH / this.height)
    ) || 1;

    this.canvas.width = this.width * scale;
    this.canvas.height = this.height * scale;
    this.ctx.imageSmoothingEnabled = false;
    this.scale = scale;
  }

  /**
   * Begin a frame — clears the buffer.
   */
  begin() {
    this.bufCtx.fillStyle = '#000';
    this.bufCtx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * End a frame — draws buffer to visible canvas, then draws hi-res text overlay.
   */
  end() {
    // Apply fade overlay
    if (this.fadeAlpha > 0.01) {
      this.bufCtx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
      this.bufCtx.fillRect(0, 0, this.width, this.height);
    }

    // Animate fade
    if (Math.abs(this.fadeAlpha - this.fadeTarget) > 0.01) {
      this.fadeAlpha += (this.fadeTarget - this.fadeAlpha) * this.fadeSpeed * 3;
    } else {
      this.fadeAlpha = this.fadeTarget;
    }

    // Scale buffer to canvas (pixel art layer)
    this.ctx.drawImage(this.buffer, 0, 0, this.canvas.width, this.canvas.height);

    // Draw hi-res text overlay on top
    if (this._hiResQueue && this._hiResQueue.length > 0) {
      for (const cmd of this._hiResQueue) {
        cmd();
      }
    }
    this._hiResQueue = [];
  }

  /**
   * Draw text at high resolution (directly on display canvas, not buffer).
   * Coordinates are in internal (320×200) space — they get scaled to canvas.
   */
  drawTextHiRes(text, x, y, options = {}) {
    const {
      color = '#e0c088',
      size = 8,
      align = 'left',
      shadow = true,
      maxWidth,
    } = options;

    this._hiResQueue.push(() => {
      const s = this.scale;
      const fontSize = Math.round(size * s * 0.85); // slightly smaller factor for better fit
      const sx = Math.floor(x * s);
      const sy = Math.floor(y * s);

      this.ctx.font = `${fontSize}px 'Press Start 2P', monospace`;
      this.ctx.textAlign = align;
      this.ctx.textBaseline = 'top';

      if (shadow) {
        this.ctx.fillStyle = '#000';
        this.ctx.fillText(text, sx + Math.ceil(s * 0.5), sy + Math.ceil(s * 0.5), maxWidth ? maxWidth * s : undefined);
      }

      this.ctx.fillStyle = color;
      this.ctx.fillText(text, sx, sy, maxWidth ? maxWidth * s : undefined);
    });
  }

  /**
   * Word-wrap text into lines, returning the lines and total height.
   */
  _wrapLines(text, maxWidth, options = {}) {
    const { size = 8, lineHeight = 12 } = options;
    const s = this.scale;
    const fontSize = Math.round(size * s * 0.85);
    this.ctx.font = `${fontSize}px 'Press Start 2P', monospace`;

    const words = text.split(' ');
    const scaledMaxWidth = maxWidth * s;
    const lines = [];
    let line = '';

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      if (this.ctx.measureText(testLine).width > scaledMaxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);

    return { lines, height: lines.length * lineHeight };
  }

  /**
   * Measure wrapped text height without drawing.
   */
  measureTextWrappedHiRes(text, maxWidth, options = {}) {
    return this._wrapLines(text, maxWidth, options).height;
  }

  /**
   * Draw word-wrapped text at high resolution.
   * Returns total height in internal coordinates.
   */
  drawTextWrappedHiRes(text, x, y, maxWidth, options = {}) {
    const { lineHeight = 12 } = options;
    const { lines } = this._wrapLines(text, maxWidth, options);
    let dy = 0;
    for (const line of lines) {
      this.drawTextHiRes(line, x, y + dy, options);
      dy += lineHeight;
    }
    return dy;
  }

  /**
   * Draw an image at position.
   */
  drawImage(img, x, y, w, h) {
    if (!img) return;
    if (w !== undefined && h !== undefined) {
      this.bufCtx.drawImage(img, Math.floor(x), Math.floor(y), w, h);
    } else {
      this.bufCtx.drawImage(img, Math.floor(x), Math.floor(y));
    }
  }

  /**
   * Draw an image on the hi-res overlay (renders on top of everything).
   * Coordinates are in internal (320×200) space.
   */
  drawImageHiRes(img, x, y, w, h) {
    if (!img) return;
    this._hiResQueue.push(() => {
      const sx = this.canvas.width / this.width;
      const sy = this.canvas.height / this.height;
      this.ctx.imageSmoothingEnabled = false;
      this.ctx.drawImage(img, Math.floor(x * sx), Math.floor(y * sy), Math.floor(w * sx), Math.floor(h * sy));
    });
  }

  /**
   * Draw a sub-region of an image (sprite sheet).
   */
  drawSprite(img, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (!img) return;
    this.bufCtx.drawImage(img,
      sx, sy, sw, sh,
      Math.floor(dx), Math.floor(dy), dw || sw, dh || sh
    );
  }

  /**
   * Draw pixel-art text.
   */
  drawText(text, x, y, options = {}) {
    const {
      color = '#e0c088',
      size = 8,
      align = 'left',
      shadow = true,
      maxWidth = this.width,
    } = options;

    this.bufCtx.font = `${size}px 'Press Start 2P', monospace`;
    this.bufCtx.textAlign = align;
    this.bufCtx.textBaseline = 'top';

    if (shadow) {
      this.bufCtx.fillStyle = '#000';
      this.bufCtx.fillText(text, Math.floor(x) + 1, Math.floor(y) + 1, maxWidth);
    }

    this.bufCtx.fillStyle = color;
    this.bufCtx.fillText(text, Math.floor(x), Math.floor(y), maxWidth);
  }

  /**
   * Draw word-wrapped text, returns total rendered height.
   */
  drawTextWrapped(text, x, y, maxWidth, options = {}) {
    const { size = 8, lineHeight = 12 } = options;
    this.bufCtx.font = `${size}px 'Press Start 2P', monospace`;

    const words = text.split(' ');
    let line = '';
    let dy = 0;

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const metrics = this.bufCtx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        this.drawText(line, x, y + dy, options);
        line = word;
        dy += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) {
      this.drawText(line, x, y + dy, options);
      dy += lineHeight;
    }
    return dy;
  }

  /**
   * Draw a filled rectangle.
   */
  drawRect(x, y, w, h, color) {
    this.bufCtx.fillStyle = color;
    this.bufCtx.fillRect(Math.floor(x), Math.floor(y), w, h);
  }

  /**
   * Draw a rectangle outline.
   */
  drawRectOutline(x, y, w, h, color, lineWidth = 1) {
    this.bufCtx.strokeStyle = color;
    this.bufCtx.lineWidth = lineWidth;
    this.bufCtx.strokeRect(Math.floor(x) + 0.5, Math.floor(y) + 0.5, w - 1, h - 1);
  }

  /**
   * Start a fade to black.
   */
  fadeOut() {
    this.fadeTarget = 1;
    return new Promise(resolve => {
      const check = () => {
        if (this.fadeAlpha >= 0.99) { this.fadeAlpha = 1; resolve(); }
        else requestAnimationFrame(check);
      };
      check();
    });
  }

  /**
   * Fade back in.
   */
  fadeIn() {
    this.fadeTarget = 0;
    return new Promise(resolve => {
      const check = () => {
        if (this.fadeAlpha <= 0.01) { this.fadeAlpha = 0; resolve(); }
        else requestAnimationFrame(check);
      };
      check();
    });
  }
}
