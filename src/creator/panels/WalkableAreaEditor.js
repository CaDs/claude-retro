export class WalkableAreaEditor {
  constructor(app) {
    this.app = app;
    this.selectedIndex = null;
  }

  render(container, roomId, onSelect) {
    container.innerHTML = '';

    const room = this.app.state.getRoom(roomId);
    if (!room) {
      container.innerHTML = '<span style="font-size:11px;color:var(--color-muted);">Room not found.</span>';
      return;
    }

    const rects = room.walkableArea?.rects || [];

    // Add rect button
    const addBtn = document.createElement('button');
    addBtn.className = 'creator-left-panel__add-btn';
    addBtn.textContent = 'Add Rect';
    addBtn.style.cssText = 'width:100%;margin-bottom:12px;';
    addBtn.addEventListener('click', () => {
      const updated = [...rects, { x: 20, y: 80, width: 280, height: 60 }];
      this.app.state.updateRoom(roomId, { walkableArea: { rects: updated } });
      this.selectedIndex = updated.length - 1;
      this.render(container, roomId, onSelect);
      if (onSelect) onSelect(this.selectedIndex);
    });
    container.appendChild(addBtn);

    // Rect list
    if (!rects.length) {
      const empty = document.createElement('div');
      empty.className = 'creator-empty';
      empty.innerHTML = '<span class="creator-empty__text">No walkable areas</span><span class="creator-empty__hint">Walkable areas define where your character can move. Add at least one rectangle covering the floor.</span>';
      container.appendChild(empty);
      return;
    }

    const list = document.createElement('div');
    list.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

    rects.forEach((rect, index) => {
      const card = document.createElement('div');
      card.className = 'creator-card';
      if (index === this.selectedIndex) card.classList.add('creator-card--active');

      const info = document.createElement('div');
      info.className = 'creator-card__info';
      info.innerHTML = `
        <div class="creator-card__name">Rect ${index + 1}</div>
        <div class="creator-card__desc">x:${rect.x} y:${rect.y} w:${rect.width} h:${rect.height}</div>
      `;
      card.appendChild(info);

      card.addEventListener('click', () => {
        this.selectedIndex = index;
        this.render(container, roomId, onSelect);
        if (onSelect) onSelect(index);
      });

      list.appendChild(card);

      // If selected, show detail editor
      if (index === this.selectedIndex) {
        const detailPanel = document.createElement('div');
        detailPanel.style.cssText = 'margin-top:8px;padding:10px;background:rgba(0,0,0,0.2);border-radius:4px;';

        // X field
        const xField = this._createNumberField('X', rect.x, (val) => {
          const updated = [...rects];
          updated[index] = { ...updated[index], x: val };
          this.app.state.updateRoom(roomId, { walkableArea: { rects: updated } });
          this.render(container, roomId, onSelect);
        });
        detailPanel.appendChild(xField);

        // Y field
        const yField = this._createNumberField('Y', rect.y, (val) => {
          const updated = [...rects];
          updated[index] = { ...updated[index], y: val };
          this.app.state.updateRoom(roomId, { walkableArea: { rects: updated } });
          this.render(container, roomId, onSelect);
        });
        detailPanel.appendChild(yField);

        // Width field
        const wField = this._createNumberField('Width', rect.width, (val) => {
          const updated = [...rects];
          updated[index] = { ...updated[index], width: val };
          this.app.state.updateRoom(roomId, { walkableArea: { rects: updated } });
          this.render(container, roomId, onSelect);
        });
        detailPanel.appendChild(wField);

        // Height field
        const hField = this._createNumberField('Height', rect.height, (val) => {
          const updated = [...rects];
          updated[index] = { ...updated[index], height: val };
          this.app.state.updateRoom(roomId, { walkableArea: { rects: updated } });
          this.render(container, roomId, onSelect);
        });
        detailPanel.appendChild(hField);

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.className = 'creator-btn creator-btn--danger creator-btn--small';
        delBtn.textContent = 'Delete Rect';
        delBtn.style.cssText = 'margin-top:8px;width:100%;';
        delBtn.addEventListener('click', () => {
          const updated = rects.filter((_, i) => i !== index);
          this.app.state.updateRoom(roomId, { walkableArea: { rects: updated } });
          this.selectedIndex = null;
          this.render(container, roomId, onSelect);
          if (onSelect) onSelect(null);
        });
        detailPanel.appendChild(delBtn);

        list.appendChild(detailPanel);
      }
    });

    container.appendChild(list);
  }

  setSelectedIndex(index) {
    this.selectedIndex = index;
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
