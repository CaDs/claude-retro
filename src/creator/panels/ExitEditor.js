/**
 * ExitEditor.js
 *
 * Panel for editing room exits (doorways/passages to other rooms).
 * Displays a list of exit cards and provides editing forms for each exit.
 */

export class ExitEditor {
  constructor(app) {
    this.app = app;
    this.selectedIndex = -1;
  }

  /**
   * Render the exit editor panel.
   * @param {HTMLElement} container - The container to render into
   * @param {string} roomId - The ID of the room being edited
   * @param {(index: number) => void} [onSelect] - Callback when an exit is selected
   */
  render(container, roomId, onSelect) {
    this.onSelect = onSelect;
    container.innerHTML = '';

    const room = this.app.state.getRoom(roomId);
    if (!room) {
      container.innerHTML = '<div class="creator-empty"><span class="creator-empty__text">Room not found</span></div>';
      return;
    }

    const exits = room.exits || [];
    const rooms = this.app.state.rooms;

    // Header with title and add button
    const header = document.createElement('div');
    header.className = 'creator-form-section';
    header.innerHTML = `
      <div class="creator-form-section__title" style="display:flex;align-items:center;justify-content:space-between;">
        <span>Exits</span>
        <button class="creator-btn creator-btn--small" id="add-exit-btn">+ Add</button>
      </div>
    `;
    container.appendChild(header);

    header.querySelector('#add-exit-btn').addEventListener('click', () => {
      this._addExit(roomId, exits);
    });

    // Exit list
    if (exits.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'creator-empty';
      empty.innerHTML = '<span class="creator-empty__text">No exits</span><span class="creator-empty__hint">Exits connect rooms. Draw a rectangle where players walk to leave, or click + Add.</span>';
      container.appendChild(empty);
      return;
    }

    for (let i = 0; i < exits.length; i++) {
      const exit = exits[i];
      const card = this._createExitCard(exit, i, roomId, exits, rooms);
      container.appendChild(card);
    }
  }

  /**
   * Set the selected exit index (called from external sources like canvas overlay).
   * @param {number} index
   */
  setSelectedIndex(index) {
    this.selectedIndex = index;
  }

  /**
   * Create a card UI for a single exit.
   * @private
   */
  _createExitCard(exit, index, roomId, exits, rooms) {
    const card = document.createElement('div');
    card.className = 'creator-card';
    if (index === this.selectedIndex) {
      card.classList.add('creator-card--active');
    }

    // Card header showing name and target
    const cardHeader = document.createElement('div');
    cardHeader.className = 'creator-card__info';
    cardHeader.style.cssText = 'cursor:pointer;padding:8px 10px;';
    const targetRoom = this.app.state.getRoom(exit.target);
    const targetName = targetRoom ? targetRoom.name : exit.target || 'No target';
    cardHeader.innerHTML = `
      <div class="creator-card__name">${this._esc(exit.name || exit.id)}</div>
      <div class="creator-card__desc">To: ${this._esc(targetName)}</div>
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
      form.appendChild(this._createField('ID', 'text', exit.id, (val) => {
        exit.id = val;
        this._updateExits(roomId, exits);
      }));

      // Name field
      form.appendChild(this._createField('Name', 'text', exit.name, (val) => {
        exit.name = val;
        this._updateExits(roomId, exits);
      }));

      // Target room dropdown
      const targetField = this._createRoomDropdown('Target Room', exit.target, rooms, (val) => {
        exit.target = val;
        this._updateExits(roomId, exits);
      });
      form.appendChild(targetField);

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
      rectFields.appendChild(this._createNumberInput('X', exit.rect.x, (val) => {
        exit.rect.x = val;
        this._updateExits(roomId, exits);
      }));
      rectFields.appendChild(this._createNumberInput('Y', exit.rect.y, (val) => {
        exit.rect.y = val;
        this._updateExits(roomId, exits);
      }));
      rectFields.appendChild(this._createNumberInput('W', exit.rect.width, (val) => {
        exit.rect.width = val;
        this._updateExits(roomId, exits);
      }));
      rectFields.appendChild(this._createNumberInput('H', exit.rect.height, (val) => {
        exit.rect.height = val;
        this._updateExits(roomId, exits);
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
      const walkTo = exit.walkTo || { x: 0, y: 0 };
      walkToFields.appendChild(this._createNumberInput('X', walkTo.x, (val) => {
        if (!exit.walkTo) exit.walkTo = { x: 0, y: 0 };
        exit.walkTo.x = val;
        this._updateExits(roomId, exits);
      }));
      walkToFields.appendChild(this._createNumberInput('Y', walkTo.y, (val) => {
        if (!exit.walkTo) exit.walkTo = { x: 0, y: 0 };
        exit.walkTo.y = val;
        this._updateExits(roomId, exits);
      }));
      walkToSection.appendChild(walkToFields);
      form.appendChild(walkToSection);

      // SpawnAt fields
      const spawnAtSection = document.createElement('div');
      spawnAtSection.style.cssText = 'margin-top:8px;';

      const spawnAtTitle = document.createElement('div');
      spawnAtTitle.className = 'creator-field__label';
      spawnAtTitle.textContent = 'Spawn At (in target room)';
      spawnAtTitle.style.cssText = 'margin-bottom:4px;';
      spawnAtSection.appendChild(spawnAtTitle);

      const spawnAtFields = document.createElement('div');
      spawnAtFields.className = 'creator-field--coords';
      const spawnAt = exit.spawnAt || { x: 160, y: 120 };
      spawnAtFields.appendChild(this._createNumberInput('X', spawnAt.x, (val) => {
        if (!exit.spawnAt) exit.spawnAt = { x: 160, y: 120 };
        exit.spawnAt.x = val;
        this._updateExits(roomId, exits);
      }));
      spawnAtFields.appendChild(this._createNumberInput('Y', spawnAt.y, (val) => {
        if (!exit.spawnAt) exit.spawnAt = { x: 160, y: 120 };
        exit.spawnAt.y = val;
        this._updateExits(roomId, exits);
      }));
      spawnAtSection.appendChild(spawnAtFields);
      form.appendChild(spawnAtSection);

      // LookAt text field
      form.appendChild(this._createField('Look At', 'text', exit.lookAt || '', (val) => {
        exit.lookAt = val;
        this._updateExits(roomId, exits);
      }));

      // Delete button
      const divider = document.createElement('div');
      divider.className = 'creator-divider';
      form.appendChild(divider);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'creator-btn creator-btn--small creator-btn--danger';
      deleteBtn.textContent = 'Delete Exit';
      deleteBtn.style.cssText = 'margin-top:8px;width:100%;';
      deleteBtn.addEventListener('click', () => {
        this._deleteExit(roomId, exits, index);
      });
      form.appendChild(deleteBtn);

      card.appendChild(form);
    }

    return card;
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
   * Create a room dropdown field.
   * @private
   */
  _createRoomDropdown(label, currentValue, rooms, onChange) {
    const field = document.createElement('div');
    field.className = 'creator-field';
    field.style.cssText = 'margin-top:8px;';

    const labelEl = document.createElement('label');
    labelEl.className = 'creator-field__label';
    labelEl.textContent = label;
    field.appendChild(labelEl);

    const select = document.createElement('select');
    select.className = 'creator-select';

    // Empty option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '(Select a room)';
    select.appendChild(emptyOption);

    // Room options
    for (const room of rooms) {
      const option = document.createElement('option');
      option.value = room.id;
      option.textContent = room.name || room.id;
      if (room.id === currentValue) {
        option.selected = true;
      }
      select.appendChild(option);
    }

    select.addEventListener('change', () => onChange(select.value));
    field.appendChild(select);

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
   * Add a new exit to the room.
   * @private
   */
  _addExit(roomId, exits) {
    const newExit = {
      id: `exit_${exits.length + 1}`,
      name: 'New Exit',
      rect: { x: 100, y: 60, width: 40, height: 30 },
      target: '',
      walkTo: { x: 120, y: 90 },
      spawnAt: { x: 160, y: 120 },
      lookAt: '',
    };
    exits.push(newExit);
    this.selectedIndex = exits.length - 1;
    this._updateExits(roomId, exits);
  }

  /**
   * Delete an exit from the room.
   * @private
   */
  _deleteExit(roomId, exits, index) {
    exits.splice(index, 1);
    this.selectedIndex = -1;
    this._updateExits(roomId, exits);
    if (this.onSelect) this.onSelect(-1);
  }

  /**
   * Update the room's exits in state.
   * @private
   */
  _updateExits(roomId, exits) {
    this.app.state.updateRoom(roomId, { exits });
  }

  /**
   * Escape HTML for safe rendering.
   * @private
   */
  _esc(str) {
    return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
