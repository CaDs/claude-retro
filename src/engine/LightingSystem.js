/**
 * LightingSystem — Per-room ambient lighting, point lights, and character shadows.
 * Uses canvas compositing for lightweight real-time lighting effects.
 */
export class LightingSystem {
  constructor() {
    this.ambient = { color: [0, 0, 0], intensity: 0 };
    this.lights = [];
    this._frameCount = 0;

    // Reusable offscreen buffer for lighting overlay
    this._canvas = null;
    this._ctx = null;
  }

  /**
   * Configure ambient lighting for the current room.
   * @param {string} color - Hex color for ambient overlay
   * @param {number} intensity - 0.0 to 1.0
   */
  setAmbient(color, intensity) {
    const hex = color.replace('#', '');
    this.ambient = {
      color: [
        parseInt(hex.slice(0, 2), 16) || 0,
        parseInt(hex.slice(2, 4), 16) || 0,
        parseInt(hex.slice(4, 6), 16) || 0,
      ],
      intensity: Math.max(0, Math.min(1, intensity)),
    };
  }

  /**
   * Add a point light source.
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} radius - Light radius in pixels
   * @param {string} color - Hex color
   * @param {number} intensity - 0.0 to 1.0
   * @param {boolean} flicker - Whether the light should flicker
   */
  addLight(x, y, radius, color, intensity, flicker = false) {
    const hex = color.replace('#', '');
    this.lights.push({
      x, y, radius,
      color: [
        parseInt(hex.slice(0, 2), 16) || 0,
        parseInt(hex.slice(2, 4), 16) || 0,
        parseInt(hex.slice(4, 6), 16) || 0,
      ],
      intensity: Math.max(0, Math.min(1, intensity)),
      flicker,
    });
  }

  /**
   * Clear all lights (call on room change).
   */
  clear() {
    this.lights = [];
    this.ambient = { color: [0, 0, 0], intensity: 0 };
  }

  /**
   * Render the lighting overlay on top of the scene.
   * Uses 'multiply' compositing for a subtle darkening/coloring effect.
   * @param {object} renderer - Renderer with bufCtx
   * @param {number} frameCount - Global frame counter for flicker
   */
  render(renderer, frameCount) {
    if (this.ambient.intensity <= 0 && this.lights.length === 0) return;

    this._frameCount = frameCount || 0;

    // Ensure offscreen buffer exists
    if (!this._canvas) {
      this._canvas = document.createElement('canvas');
      this._canvas.width = 320;
      this._canvas.height = 140;
      this._ctx = this._canvas.getContext('2d');
    }

    const ctx = this._ctx;
    ctx.clearRect(0, 0, 320, 140);

    // Fill with ambient color
    if (this.ambient.intensity > 0) {
      const [r, g, b] = this.ambient.color;
      ctx.fillStyle = `rgba(${r},${g},${b},${this.ambient.intensity})`;
      ctx.fillRect(0, 0, 320, 140);
    }

    // Subtract light areas using 'destination-out' to create bright spots
    ctx.globalCompositeOperation = 'destination-out';
    for (const light of this.lights) {
      let intensity = light.intensity;
      if (light.flicker) {
        // Subtle random flicker
        const flick = Math.sin(this._frameCount * 0.15 + light.x) * 0.1
                    + Math.sin(this._frameCount * 0.08 + light.y) * 0.05;
        intensity = Math.max(0.05, Math.min(1, intensity + flick));
      }

      const grad = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius);
      grad.addColorStop(0, `rgba(0,0,0,${intensity})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    // Add warm glow for light sources
    for (const light of this.lights) {
      let intensity = light.intensity * 0.15;
      if (light.flicker) {
        const flick = Math.sin(this._frameCount * 0.12 + light.x) * 0.03;
        intensity += flick;
      }
      const [r, g, b] = light.color;
      const grad = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius * 0.7);
      grad.addColorStop(0, `rgba(${r},${g},${b},${Math.max(0, intensity)})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(light.x, light.y, light.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Composite onto the game buffer
    renderer.bufCtx.drawImage(this._canvas, 0, 0);
  }

  /**
   * Draw a character shadow (dark ellipse at feet).
   * @param {object} renderer - Renderer with bufCtx
   * @param {number} x - Character center X
   * @param {number} y - Character foot Y
   * @param {number} width - Shadow width
   */
  drawCharacterShadow(renderer, x, y, width) {
    const ctx = renderer.bufCtx;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(Math.floor(x), Math.floor(y), Math.floor(width / 2), 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
