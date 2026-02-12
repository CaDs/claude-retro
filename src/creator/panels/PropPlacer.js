import { settings } from '../../settings/index.js';

export class PropPlacer {
  constructor(app) {
    this.app = app;
    this.activeBrush = null;
    this.selectedIndex = null;
  }

  render(container, roomId, onPropSelected) {
    container.innerHTML = '';

    const room = this.app.state.getRoom(roomId);
    if (!room) {
      container.innerHTML = '<span style="font-size:11px;color:var(--color-muted);">Room not found.</span>';
      return;
    }

    const settingDef = settings[this.app.state.game.setting];
    if (!settingDef || !settingDef.props) {
      container.innerHTML = '<span style="font-size:11px;color:var(--color-muted);">No props available for this setting.</span>';
      return;
    }

    const visuals = room.visuals || [];

    // Prop palette section
    const paletteSection = document.createElement('div');
    paletteSection.className = 'creator-form-section';
    paletteSection.style.cssText = 'margin-bottom:16px;';

    const paletteTitle = document.createElement('div');
    paletteTitle.className = 'creator-form-section__title';
    paletteTitle.textContent = 'Available Props';
    paletteSection.appendChild(paletteTitle);

    const paletteGrid = document.createElement('div');
    paletteGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:6px;';

    settingDef.props.forEach((propName) => {
      const btn = document.createElement('button');
      btn.className = 'creator-badge';
      if (this.activeBrush === propName) btn.classList.add('creator-badge--secondary');
      btn.textContent = propName.replace(/_/g, ' ');
      btn.style.cssText = 'padding:6px 8px;font-size:10px;text-align:center;cursor:pointer;border:1px solid var(--color-border);border-radius:3px;background:var(--color-bg-secondary);';
      if (this.activeBrush === propName) {
        btn.style.background = 'var(--color-primary)';
        btn.style.color = 'var(--color-text-inverse)';
      }
      btn.addEventListener('click', () => {
        this.activeBrush = propName;
        this.selectedIndex = null;
        this.render(container, roomId, onPropSelected);
        if (onPropSelected) onPropSelected(null);
      });
      paletteGrid.appendChild(btn);
    });

    paletteSection.appendChild(paletteGrid);
    container.appendChild(paletteSection);

    // Placed props section
    const placedSection = document.createElement('div');
    placedSection.className = 'creator-form-section';

    const placedTitle = document.createElement('div');
    placedTitle.className = 'creator-form-section__title';
    placedTitle.textContent = 'Placed Props';
    placedSection.appendChild(placedTitle);

    if (!visuals.length) {
      const empty = document.createElement('div');
      empty.className = 'creator-empty';
      empty.innerHTML = '<span class="creator-empty__text">No props placed</span><span class="creator-empty__hint">Click a prop above and click on the canvas to place</span>';
      placedSection.appendChild(empty);
    } else {
      const list = document.createElement('div');
      list.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

      visuals.forEach((prop, index) => {
        const card = document.createElement('div');
        card.className = 'creator-card';
        if (index === this.selectedIndex) card.classList.add('creator-card--active');

        const info = document.createElement('div');
        info.className = 'creator-card__info';
        info.innerHTML = `
          <div class="creator-card__name">${(prop.type || 'unknown').replace(/_/g, ' ')}</div>
          <div class="creator-card__desc">x:${prop.x} y:${prop.y}</div>
        `;
        card.appendChild(info);

        card.addEventListener('click', () => {
          this.selectedIndex = index;
          this.activeBrush = null;
          this.render(container, roomId, onPropSelected);
          if (onPropSelected) onPropSelected(index);
        });

        list.appendChild(card);

        // If selected, show detail editor
        if (index === this.selectedIndex) {
          const detailPanel = document.createElement('div');
          detailPanel.style.cssText = 'margin-top:8px;padding:10px;background:rgba(0,0,0,0.2);border-radius:4px;';

          // X field
          const xField = this._createNumberField('X', prop.x, (val) => {
            const updated = [...visuals];
            updated[index] = { ...updated[index], x: val };
            this.app.state.updateRoom(roomId, { visuals: updated });
            this.render(container, roomId, onPropSelected);
          });
          detailPanel.appendChild(xField);

          // Y field
          const yField = this._createNumberField('Y', prop.y, (val) => {
            const updated = [...visuals];
            updated[index] = { ...updated[index], y: val };
            this.app.state.updateRoom(roomId, { visuals: updated });
            this.render(container, roomId, onPropSelected);
          });
          detailPanel.appendChild(yField);

          // Delete button
          const delBtn = document.createElement('button');
          delBtn.className = 'creator-btn creator-btn--danger creator-btn--small';
          delBtn.textContent = 'Delete Prop';
          delBtn.style.cssText = 'margin-top:8px;width:100%;';
          delBtn.addEventListener('click', () => {
            const updated = visuals.filter((_, i) => i !== index);
            this.app.state.updateRoom(roomId, { visuals: updated });
            this.selectedIndex = null;
            this.render(container, roomId, onPropSelected);
            if (onPropSelected) onPropSelected(null);
          });
          detailPanel.appendChild(delBtn);

          list.appendChild(detailPanel);
        }
      });

      placedSection.appendChild(list);
    }

    container.appendChild(placedSection);
  }

  getActiveBrush() {
    return this.activeBrush;
  }

  setSelectedIndex(index) {
    this.selectedIndex = index;
    this.activeBrush = null;
  }

  _createNumberField(label, value, onChange) {
    const field = document.createElement('div');
    field.className = 'creator-field creator-field--inline creator-field--coords';

    const labelEl = document.createElement('label');
    labelEl.className = 'creator-field__label';
    labelEl.textContent = label;

    const input = document.createElement('input');
    input.className = 'creator-input creator-input--number';
    input.type = 'number';
    input.value = value;
    input.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) onChange(val);
    });

    field.appendChild(labelEl);
    field.appendChild(input);

    return field;
  }
}
