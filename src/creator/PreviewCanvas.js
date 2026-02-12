import { TemplateRegistry } from '../engine/TemplateRegistry.js';
import { PaletteRegistry } from '../engine/PaletteRegistry.js';

export class PreviewCanvas {
  constructor(container) {
    this.container = container;
    this.scale = 3;

    // Wrapper div for CSS styling
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'creator-canvas-wrapper';

    this.canvas = document.createElement('canvas');
    this.canvas.width = 320 * this.scale;
    this.canvas.height = 140 * this.scale;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.wrapper.appendChild(this.canvas);
    this.container.appendChild(this.wrapper);

    // Internal buffer at native resolution
    this._buf = document.createElement('canvas');
    this._buf.width = 320;
    this._buf.height = 140;
    this._bufCtx = this._buf.getContext('2d');
    this._bufCtx.imageSmoothingEnabled = false;

    this.paletteRegistry = new PaletteRegistry();

    this.showHotspots = false;
    this.showWalkable = false;
    this.showGrid = false;
  }

  renderRoom(roomDef) {
    const bufCtx = this._bufCtx;
    bufCtx.fillStyle = '#000000';
    bufCtx.fillRect(0, 0, 320, 140);

    if (roomDef && roomDef.background && roomDef.background.template) {
      const templateId = roomDef.background.template;
      if (TemplateRegistry.has(templateId)) {
        let palette = this.paletteRegistry.get(
          roomDef.background.palette || TemplateRegistry.getMetadata(templateId).palette
        );
        if (roomDef.background.paletteOverrides) {
          palette = this.paletteRegistry.applyOverrides(palette, roomDef.background.paletteOverrides);
        }
        const meta = TemplateRegistry.getMetadata(templateId);
        const params = { ...this._getDefaults(meta), ...(roomDef.background.params || {}) };
        TemplateRegistry.generate(templateId, bufCtx, palette, params);
      }
    }

    // Overlays
    if (this.showHotspots && roomDef && roomDef.hotspots) {
      bufCtx.save();
      bufCtx.globalAlpha = 0.3;
      bufCtx.fillStyle = '#00ff00';
      for (const hs of roomDef.hotspots) {
        bufCtx.fillRect(hs.rect.x, hs.rect.y, hs.rect.width, hs.rect.height);
      }
      bufCtx.restore();
    }
    if (this.showWalkable && roomDef && roomDef.walkableArea) {
      bufCtx.save();
      bufCtx.globalAlpha = 0.2;
      bufCtx.fillStyle = '#0088ff';
      for (const r of (roomDef.walkableArea.rects || [])) {
        bufCtx.fillRect(r.x, r.y, r.width, r.height);
      }
      bufCtx.restore();
    }

    // Render prop markers
    if (roomDef && roomDef.visuals && roomDef.visuals.length > 0) {
      bufCtx.save();
      for (const prop of roomDef.visuals) {
        // Small colored marker
        bufCtx.fillStyle = 'rgba(255, 165, 0, 0.7)';
        bufCtx.fillRect(prop.x - 4, prop.y - 4, 8, 8);
        bufCtx.strokeStyle = '#fff';
        bufCtx.lineWidth = 1;
        bufCtx.strokeRect(prop.x - 4, prop.y - 4, 8, 8);
        // Label
        bufCtx.fillStyle = '#fff';
        bufCtx.font = '5px monospace';
        bufCtx.fillText((prop.type || '').substring(0, 8), prop.x - 4, prop.y - 6);
      }
      bufCtx.restore();
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this._buf, 0, 0, this.canvas.width, this.canvas.height);
  }

  _getDefaults(meta) {
    const defaults = {};
    if (meta && meta.params) {
      for (const [key, def] of Object.entries(meta.params)) {
        defaults[key] = def.default;
      }
    }
    return defaults;
  }

  clear() {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
