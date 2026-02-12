import { TemplateRegistry } from '../../engine/TemplateRegistry.js';

export class TemplatePicker {
  constructor(app) {
    this.app = app;
    this._thumbCache = new Map();
  }

  render(container, settingId, currentTemplate, onSelect) {
    container.innerHTML = '';
    if (!settingId) return;

    const templates = TemplateRegistry.listBySetting(settingId);
    const grid = document.createElement('div');
    grid.className = 'creator-template-grid';

    for (const meta of templates) {
      const item = document.createElement('div');
      item.className = 'creator-template-thumb';
      if (meta.id === currentTemplate) item.classList.add('creator-template-thumb--selected');

      const thumb = this._getThumb(meta);
      item.appendChild(thumb);

      const label = document.createElement('span');
      label.className = 'creator-template-thumb__label';
      label.textContent = meta.name;
      item.appendChild(label);

      item.addEventListener('click', () => onSelect(meta.id));
      grid.appendChild(item);
    }

    container.appendChild(grid);
  }

  _getThumb(meta) {
    if (this._thumbCache.has(meta.id)) {
      return this._thumbCache.get(meta.id).cloneNode(true);
    }

    const buf = document.createElement('canvas');
    buf.width = 320; buf.height = 140;
    const bufCtx = buf.getContext('2d');
    bufCtx.imageSmoothingEnabled = false;

    const palette = this.app.preview.paletteRegistry.get(meta.palette);
    if (palette) {
      const defaults = {};
      for (const [k, v] of Object.entries(meta.params || {})) defaults[k] = v.default;
      try {
        TemplateRegistry.generate(meta.id, bufCtx, palette, defaults);
      } catch (e) {
        console.warn('Template thumb generation failed:', meta.id, e);
      }
    }

    const thumb = document.createElement('canvas');
    thumb.width = 160; thumb.height = 70;
    thumb.style.cssText = 'width:100%;height:100%;display:block;image-rendering:pixelated;';
    const thumbCtx = thumb.getContext('2d');
    thumbCtx.imageSmoothingEnabled = false;
    thumbCtx.drawImage(buf, 0, 0, 160, 70);

    this._thumbCache.set(meta.id, thumb);
    return thumb.cloneNode(true);
  }
}
