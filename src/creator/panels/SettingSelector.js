import { settings } from '../../settings/index.js';
import { TemplateRegistry } from '../../engine/TemplateRegistry.js';

export class SettingSelector {
  constructor(app) {
    this.app = app;
  }

  /**
   * Renders the setting selection screen into the full canvas area.
   * Shows a 2x2 grid of setting cards with palette swatches and template thumbnails.
   */
  render(canvasArea) {
    canvasArea.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:32px 24px;overflow-y:auto;width:100%;height:100%;';

    const heading = document.createElement('h2');
    heading.style.cssText = 'font-family:var(--font-pixel);font-size:12px;color:var(--color-text);margin-bottom:8px;letter-spacing:0.5px;';
    heading.textContent = 'Choose Your Setting';
    wrapper.appendChild(heading);

    const subtitle = document.createElement('p');
    subtitle.style.cssText = 'font-size:13px;color:var(--color-muted);margin-bottom:24px;text-align:center;max-width:500px;';
    subtitle.textContent = 'Select the creative universe for your adventure game. This determines available room templates, palettes, props, and character options.';
    wrapper.appendChild(subtitle);

    // Getting Started steps
    const gettingStarted = document.createElement('div');
    gettingStarted.className = 'creator-getting-started';
    gettingStarted.style.marginBottom = '24px';

    const steps = [
      { title: 'Choose a setting', desc: 'Determines room templates, color palettes, and character options available to you.' },
      { title: 'Build your rooms', desc: 'Design backgrounds, place hotspots, connect exits between rooms.' },
      { title: 'Add characters & puzzles', desc: 'Create NPCs, write dialogues, define item interactions.' },
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = document.createElement('div');
      step.className = 'creator-getting-started__step';
      step.innerHTML = `
        <span class="creator-getting-started__number">${i + 1}</span>
        <div class="creator-getting-started__content">
          <div class="creator-getting-started__title">${steps[i].title}</div>
          <div class="creator-getting-started__desc">${steps[i].desc}</div>
        </div>
      `;
      gettingStarted.appendChild(step);
    }
    wrapper.appendChild(gettingStarted);

    const grid = document.createElement('div');
    grid.className = 'creator-setting-grid';

    for (const setting of Object.values(settings)) {
      const card = document.createElement('div');
      card.className = 'creator-setting-card';
      if (this.app.state.game.setting === setting.id) {
        card.classList.add('creator-setting-card--selected');
      }

      // Palette swatch preview
      const firstPalette = Object.values(setting.palettes)[0];
      const swatchColors = firstPalette ? Object.values(firstPalette).slice(0, 8) : [];

      // Try to render a thumbnail from the first available template
      const thumbCanvas = this._renderSettingThumb(setting);

      card.innerHTML = `
        <div class="creator-setting-card__thumb"></div>
        <div class="creator-setting-card__body">
          <div style="display:flex;gap:3px;margin-bottom:8px;flex-wrap:wrap;">
            ${swatchColors.map(c => `<span style="width:16px;height:16px;border-radius:2px;background:${c};display:inline-block;border:1px solid rgba(255,255,255,0.1);"></span>`).join('')}
          </div>
          <div class="creator-setting-card__name">${setting.name}</div>
          <div class="creator-setting-card__desc">${setting.description}</div>
          <div style="margin-top:6px;font-size:11px;color:var(--color-secondary);">${setting.templates.length} room templates</div>
        </div>
      `;

      // Insert the thumbnail canvas
      if (thumbCanvas) {
        const thumbSlot = card.querySelector('.creator-setting-card__thumb');
        thumbSlot.appendChild(thumbCanvas);
      }

      card.addEventListener('click', () => {
        this.app.state.setSetting(setting.id);
        this.app.setTab('rooms');
      });

      grid.appendChild(card);
    }

    wrapper.appendChild(grid);
    canvasArea.appendChild(wrapper);
  }

  /** Try to render a small thumbnail of the first template in the setting */
  _renderSettingThumb(setting) {
    if (!setting.templates || !setting.templates.length) return null;
    const templateId = setting.templates[0];
    if (!TemplateRegistry.has(templateId)) return null;

    const meta = TemplateRegistry.getMetadata(templateId);
    const firstPalette = Object.values(setting.palettes)[0];
    if (!firstPalette) return null;

    try {
      const buf = document.createElement('canvas');
      buf.width = 320;
      buf.height = 140;
      const ctx = buf.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      const defaults = {};
      for (const [k, v] of Object.entries(meta.params || {})) defaults[k] = v.default;
      TemplateRegistry.generate(templateId, ctx, firstPalette, defaults);

      const thumb = document.createElement('canvas');
      thumb.width = 320;
      thumb.height = 140;
      thumb.style.cssText = 'width:100%;height:100%;display:block;image-rendering:pixelated;';
      const tCtx = thumb.getContext('2d');
      tCtx.imageSmoothingEnabled = false;
      tCtx.drawImage(buf, 0, 0);
      return thumb;
    } catch (e) {
      console.warn('Setting thumb failed:', setting.id, e);
      return null;
    }
  }
}
