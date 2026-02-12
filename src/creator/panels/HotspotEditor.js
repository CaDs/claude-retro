/**
 * HotspotEditor.js
 *
 * Panel for editing room hotspots (interactive areas).
 * Displays a list of hotspot cards and provides editing forms for each hotspot.
 */

export class HotspotEditor {
  constructor(app) {
    this.app = app;
    this.selectedIndex = -1;
  }

  /**
   * Render the hotspot editor panel.
   * @param {HTMLElement} container - The container to render into
   * @param {string} roomId - The ID of the room being edited
   * @param {(index: number) => void} [onSelect] - Callback when a hotspot is selected
   */
  render(container, roomId, onSelect) {
    this.onSelect = onSelect;
    container.innerHTML = '';

    const room = this.app.state.getRoom(roomId);
    if (!room) {
      container.innerHTML = '<div class="creator-empty"><span class="creator-empty__text">Room not found</span></div>';
      return;
    }

    const hotspots = room.hotspots || [];
    const verbs = this.app.state.game.verbs;

    // Header with title and add button
    const header = document.createElement('div');
    header.className = 'creator-form-section';
    header.innerHTML = `
      <div class="creator-form-section__title" style="display:flex;align-items:center;justify-content:space-between;">
        <span>Hotspots</span>
        <button class="creator-btn creator-btn--small" id="add-hotspot-btn">+ Add</button>
      </div>
    `;
    container.appendChild(header);

    header.querySelector('#add-hotspot-btn').addEventListener('click', () => {
      this._addHotspot(roomId, hotspots);
    });

    // Hotspot list
    if (hotspots.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'creator-empty';
      empty.innerHTML = '<span class="creator-empty__text">No hotspots</span><span class="creator-empty__hint">Click + Add to create one</span>';
      container.appendChild(empty);
      return;
    }

    for (let i = 0; i < hotspots.length; i++) {
      const hotspot = hotspots[i];
      const card = this._createHotspotCard(hotspot, i, roomId, hotspots, verbs);
      container.appendChild(card);
    }
  }

  /**
   * Set the selected hotspot index (called from external sources like canvas overlay).
   * @param {number} index
   */
  setSelectedIndex(index) {
    this.selectedIndex = index;
  }

  /**
   * Create a card UI for a single hotspot.
   * @private
   */
  _createHotspotCard(hotspot, index, roomId, hotspots, verbs) {
    const card = document.createElement('div');
    card.className = 'creator-card';
    if (index === this.selectedIndex) {
      card.classList.add('creator-card--active');
    }

    // Card header showing name and rect
    const cardHeader = document.createElement('div');
    cardHeader.className = 'creator-card__info';
    cardHeader.style.cssText = 'cursor:pointer;padding:8px 10px;';
    cardHeader.innerHTML = `
      <div class="creator-card__name">${this._esc(hotspot.name || hotspot.id)}</div>
      <div class="creator-card__desc">Rect: ${hotspot.rect.x},${hotspot.rect.y} ${hotspot.rect.width}×${hotspot.rect.height}</div>
    `;
    cardHeader.addEventListener('click', () => {
      this.selectedIndex = index;
      if (this.onSelect) this.onSelect(index);
      this.render(cardHeader.closest('.creator-right-panel__body'), roomId, this.onSelect);
    });
    card.appendChild(cardHeader);

    // Expanded editor form (shown when selected)
    if (index === this.selectedIndex) {
      const form = document.createElement('div');
      form.style.cssText = 'padding:10px;border-top:1px solid var(--color-border);';

      // ID field
      form.appendChild(this._createField('ID', 'text', hotspot.id, (val) => {
        hotspot.id = val;
        this._updateHotspots(roomId, hotspots);
      }));

      // Name field
      form.appendChild(this._createField('Name', 'text', hotspot.name, (val) => {
        hotspot.name = val;
        this._updateHotspots(roomId, hotspots);
      }));

      // Rect fields (x, y, width, height)
      const rectSection = document.createElement('div');
      rectSection.style.cssText = 'margin-top:8px;';

      const rectTitle = document.createElement('div');
      rectTitle.className = 'creator-field__label';
      rectTitle.textContent = 'Rectangle';
      rectTitle.style.cssText = 'margin-bottom:4px;';
      rectSection.appendChild(rectTitle);

      const rectFields = document.createElement('div');
      rectFields.className = 'creator-field--coords';
      rectFields.appendChild(this._createNumberInput('X', hotspot.rect.x, (val) => {
        hotspot.rect.x = val;
        this._updateHotspots(roomId, hotspots);
      }));
      rectFields.appendChild(this._createNumberInput('Y', hotspot.rect.y, (val) => {
        hotspot.rect.y = val;
        this._updateHotspots(roomId, hotspots);
      }));
      rectFields.appendChild(this._createNumberInput('W', hotspot.rect.width, (val) => {
        hotspot.rect.width = val;
        this._updateHotspots(roomId, hotspots);
      }));
      rectFields.appendChild(this._createNumberInput('H', hotspot.rect.height, (val) => {
        hotspot.rect.height = val;
        this._updateHotspots(roomId, hotspots);
      }));
      rectSection.appendChild(rectFields);
      form.appendChild(rectSection);

      // WalkTo fields
      const walkToSection = document.createElement('div');
      walkToSection.style.cssText = 'margin-top:8px;';

      const walkToTitle = document.createElement('div');
      walkToTitle.className = 'creator-field__label';
      walkToTitle.textContent = 'Walk To';
      walkToTitle.style.cssText = 'margin-bottom:4px;';
      walkToSection.appendChild(walkToTitle);

      const walkToFields = document.createElement('div');
      walkToFields.className = 'creator-field--coords';
      const walkTo = hotspot.walkTo || { x: 0, y: 0 };
      walkToFields.appendChild(this._createNumberInput('X', walkTo.x, (val) => {
        if (!hotspot.walkTo) hotspot.walkTo = { x: 0, y: 0 };
        hotspot.walkTo.x = val;
        this._updateHotspots(roomId, hotspots);
      }));
      walkToFields.appendChild(this._createNumberInput('Y', walkTo.y, (val) => {
        if (!hotspot.walkTo) hotspot.walkTo = { x: 0, y: 0 };
        hotspot.walkTo.y = val;
        this._updateHotspots(roomId, hotspots);
      }));
      walkToSection.appendChild(walkToFields);
      form.appendChild(walkToSection);

      // Visible checkbox
      form.appendChild(this._createCheckbox('Visible', hotspot.visible !== false, (val) => {
        hotspot.visible = val;
        this._updateHotspots(roomId, hotspots);
      }));

      // Responses collapsible section
      const responsesCollapse = this._createResponsesSection(hotspot, roomId, hotspots, verbs);
      form.appendChild(responsesCollapse);

      // Delete button
      const divider = document.createElement('div');
      divider.className = 'creator-divider';
      form.appendChild(divider);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'creator-btn creator-btn--small creator-btn--danger';
      deleteBtn.textContent = 'Delete Hotspot';
      deleteBtn.style.cssText = 'margin-top:8px;width:100%;';
      deleteBtn.addEventListener('click', () => {
        this._deleteHotspot(roomId, hotspots, index);
      });
      form.appendChild(deleteBtn);

      card.appendChild(form);
    }

    return card;
  }

  /**
   * Create the responses collapsible section.
   * @private
   */
  _createResponsesSection(hotspot, roomId, hotspots, verbs) {
    const section = document.createElement('div');
    section.style.cssText = 'margin-top:12px;';

    const header = document.createElement('div');
    header.className = 'creator-collapse__header';
    header.innerHTML = `
      <span class="creator-collapse__arrow">▶</span>
      <span>Responses</span>
    `;
    section.appendChild(header);

    const body = document.createElement('div');
    body.className = 'creator-collapse__body';
    body.style.display = 'none';

    const responses = hotspot.responses || {};

    for (const verb of verbs) {
      const field = document.createElement('div');
      field.className = 'creator-field';
      field.style.cssText = 'margin-top:6px;';

      const label = document.createElement('label');
      label.className = 'creator-field__label';
      label.textContent = verb.label;
      field.appendChild(label);

      const input = document.createElement('input');
      input.className = 'creator-input';
      input.value = responses[verb.id] || '';
      input.placeholder = 'Default response';
      input.addEventListener('change', () => {
        if (!hotspot.responses) hotspot.responses = {};
        if (input.value.trim()) {
          hotspot.responses[verb.id] = input.value;
        } else {
          delete hotspot.responses[verb.id];
        }
        this._updateHotspots(roomId, hotspots);
      });
      field.appendChild(input);
      body.appendChild(field);
    }

    section.appendChild(body);

    // Toggle collapse
    header.addEventListener('click', () => {
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      header.querySelector('.creator-collapse__arrow').textContent = isOpen ? '▶' : '▼';
      section.classList.toggle('creator-collapse--open', !isOpen);
    });

    return section;
  }

  /**
   * Create a text input field.
   * @private
   */
  _createField(label, type, value, onChange) {
    const field = document.createElement('div');
    field.className = 'creator-field';
    field.style.cssText = 'margin-top:8px;';

    const labelEl = document.createElement('label');
    labelEl.className = 'creator-field__label';
    labelEl.textContent = label;
    field.appendChild(labelEl);

    const input = document.createElement('input');
    input.className = 'creator-input';
    input.type = type;
    input.value = value || '';
    input.addEventListener('change', () => onChange(input.value));
    field.appendChild(input);

    return field;
  }

  /**
   * Create a number input with label.
   * @private
   */
  _createNumberInput(label, value, onChange) {
    const wrapper = document.createElement('div');
    wrapper.className = 'creator-field--inline';

    const labelEl = document.createElement('label');
    labelEl.className = 'creator-field__label';
    labelEl.textContent = label;
    wrapper.appendChild(labelEl);

    const input = document.createElement('input');
    input.className = 'creator-input creator-input--number';
    input.type = 'number';
    input.value = value || 0;
    input.addEventListener('change', () => onChange(parseInt(input.value, 10) || 0));
    wrapper.appendChild(input);

    return wrapper;
  }

  /**
   * Create a checkbox field.
   * @private
   */
  _createCheckbox(label, checked, onChange) {
    const field = document.createElement('div');
    field.className = 'creator-field';
    field.style.cssText = 'margin-top:8px;';

    const checkbox = document.createElement('label');
    checkbox.className = 'creator-checkbox';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.addEventListener('change', () => onChange(input.checked));

    const span = document.createElement('span');
    span.textContent = label;

    checkbox.appendChild(input);
    checkbox.appendChild(span);
    field.appendChild(checkbox);

    return field;
  }

  /**
   * Add a new hotspot to the room.
   * @private
   */
  _addHotspot(roomId, hotspots) {
    const newHotspot = {
      id: `hotspot_${hotspots.length + 1}`,
      name: 'New Hotspot',
      rect: { x: 100, y: 60, width: 40, height: 30 },
      walkTo: { x: 120, y: 90 },
      visible: true,
      responses: {},
    };
    hotspots.push(newHotspot);
    this.selectedIndex = hotspots.length - 1;
    this._updateHotspots(roomId, hotspots);
  }

  /**
   * Delete a hotspot from the room.
   * @private
   */
  _deleteHotspot(roomId, hotspots, index) {
    hotspots.splice(index, 1);
    this.selectedIndex = -1;
    this._updateHotspots(roomId, hotspots);
    if (this.onSelect) this.onSelect(-1);
  }

  /**
   * Update the room's hotspots in state.
   * @private
   */
  _updateHotspots(roomId, hotspots) {
    this.app.state.updateRoom(roomId, { hotspots });
  }

  /**
   * Escape HTML for safe rendering.
   * @private
   */
  _esc(str) {
    return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
