/**
 * PuzzleEditor.js
 *
 * Panel for editing puzzles (verb+target interactions with conditions and scripted actions).
 * Displays a list of puzzle cards in the left panel and puzzle properties in the right panel.
 */

export class PuzzleEditor {
  constructor(app) {
    this.app = app;
    this.selectedPuzzleId = null;
  }

  /**
   * Render the puzzle editor panels.
   * @param {HTMLElement} leftPanel - The left panel container (puzzle list)
   * @param {HTMLElement} rightPanel - The right panel container (puzzle properties)
   */
  render(leftPanel, rightPanel) {
    this._renderLeftPanel(leftPanel);
    this._renderRightPanel(rightPanel);
  }

  /**
   * Render the left panel: puzzle list with add button.
   * @private
   */
  _renderLeftPanel(container) {
    container.innerHTML = '';

    const puzzles = this.app.state.puzzles;

    // Header with title and add button
    const header = document.createElement('div');
    header.className = 'creator-form-section';
    header.innerHTML = `
      <div class="creator-form-section__title" style="display:flex;align-items:center;justify-content:space-between;">
        <span>Puzzles</span>
        <button class="creator-btn creator-btn--small" id="add-puzzle-btn">+ Add</button>
      </div>
    `;
    container.appendChild(header);

    header.querySelector('#add-puzzle-btn').addEventListener('click', () => {
      this._addPuzzle();
    });

    // Puzzle list
    if (puzzles.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'creator-empty';
      empty.innerHTML = '<span class="creator-empty__text">No puzzles</span><span class="creator-empty__hint">Click + Add to create one</span>';
      container.appendChild(empty);
      return;
    }

    for (const puzzle of puzzles) {
      const card = this._createPuzzleCard(puzzle);
      container.appendChild(card);
    }
  }

  /**
   * Create a card UI for a single puzzle.
   * @private
   */
  _createPuzzleCard(puzzle) {
    const card = document.createElement('div');
    card.className = 'creator-card';
    if (puzzle.id === this.selectedPuzzleId) {
      card.classList.add('creator-card--active');
    }

    const trigger = puzzle.trigger || {};
    const triggerText = trigger.item
      ? `${trigger.verb} ${trigger.item} on ${trigger.target}`
      : `${trigger.verb} ${trigger.target}`;

    card.style.cssText = 'cursor:pointer;padding:8px 10px;';
    card.innerHTML = `
      <div class="creator-card__name">${this._esc(triggerText)}</div>
      <div class="creator-card__desc">${puzzle.actions?.length || 0} action(s)</div>
    `;

    card.addEventListener('click', () => {
      this.selectedPuzzleId = puzzle.id;
      this.render(card.closest('.creator-left-panel__body'), card.closest('.creator-layout').querySelector('.creator-right-panel__body'));
    });

    return card;
  }

  /**
   * Render the right panel: puzzle properties editor.
   * @private
   */
  _renderRightPanel(container) {
    container.innerHTML = '';

    if (!this.selectedPuzzleId) {
      const empty = document.createElement('div');
      empty.className = 'creator-empty';
      empty.innerHTML = '<span class="creator-empty__text">No puzzle selected</span><span class="creator-empty__hint">Select a puzzle from the list</span>';
      container.appendChild(empty);
      return;
    }

    const puzzle = this.app.state.getPuzzle(this.selectedPuzzleId);
    if (!puzzle) {
      container.innerHTML = '<div class="creator-empty"><span class="creator-empty__text">Puzzle not found</span></div>';
      return;
    }

    const form = document.createElement('div');
    form.style.cssText = 'padding:10px;';

    // Trigger Section
    const triggerSection = this._createSection('Trigger');
    const trigger = puzzle.trigger || { verb: null, target: null };

    const verbs = this.app.state.game.verbs;
    triggerSection.appendChild(this._createSelect('Verb', verbs.map(v => ({ value: v.id, label: v.label })), trigger.verb, (val) => {
      const newTrigger = { ...trigger, verb: val };
      this.app.state.updatePuzzle(puzzle.id, { trigger: newTrigger });
    }));

    triggerSection.appendChild(this._createField('Target', 'text', trigger.target || '', (val) => {
      const newTrigger = { ...trigger, target: val };
      this.app.state.updatePuzzle(puzzle.id, { trigger: newTrigger });
    }));

    triggerSection.appendChild(this._createField('Secondary Target (optional)', 'text', trigger.item || '', (val) => {
      const newTrigger = { ...trigger, item: val || undefined };
      this.app.state.updatePuzzle(puzzle.id, { trigger: newTrigger });
    }));

    form.appendChild(triggerSection);

    // Conditions Section
    const conditionsSection = this._createConditionsSection(puzzle);
    form.appendChild(conditionsSection);

    // Fail Text Section
    const failSection = this._createSection('Fail Text');
    failSection.appendChild(this._createField('Text shown when conditions fail', 'text', puzzle.failText || '', (val) => {
      this.app.state.updatePuzzle(puzzle.id, { failText: val });
    }));
    form.appendChild(failSection);

    // Actions Section
    const actionsSection = this._createActionsSection(puzzle);
    form.appendChild(actionsSection);

    // Delete button
    const divider = document.createElement('div');
    divider.className = 'creator-divider';
    form.appendChild(divider);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'creator-btn creator-btn--small creator-btn--danger';
    deleteBtn.textContent = 'Delete Puzzle';
    deleteBtn.style.cssText = 'margin-top:12px;width:100%;';
    deleteBtn.addEventListener('click', () => {
      this._deletePuzzle(puzzle.id);
    });
    form.appendChild(deleteBtn);

    container.appendChild(form);
  }

  /**
   * Create the conditions collapsible section.
   * @private
   */
  _createConditionsSection(puzzle) {
    const section = document.createElement('div');
    section.className = 'creator-form-section';
    section.style.cssText = 'margin-bottom:16px;';

    const header = document.createElement('div');
    header.className = 'creator-collapse__header';
    header.innerHTML = `
      <span class="creator-collapse__arrow">▶</span>
      <span>Conditions</span>
    `;
    section.appendChild(header);

    const body = document.createElement('div');
    body.className = 'creator-collapse__body';
    body.style.display = 'none';

    const conditions = puzzle.conditions || [];

    // Render condition list
    for (let i = 0; i < conditions.length; i++) {
      const condCard = this._createConditionCard(puzzle, i);
      body.appendChild(condCard);
    }

    // Add condition button
    const addBtn = document.createElement('button');
    addBtn.className = 'creator-btn creator-btn--small';
    addBtn.textContent = '+ Add Condition';
    addBtn.style.cssText = 'margin-top:8px;width:100%;';
    addBtn.addEventListener('click', () => {
      const newConditions = [...conditions, { type: 'hasItem', value: '' }];
      this.app.state.updatePuzzle(puzzle.id, { conditions: newConditions });
      this._renderRightPanel(body.closest('.creator-right-panel__body'));
    });
    body.appendChild(addBtn);

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
   * Create a card for a single condition.
   * @private
   */
  _createConditionCard(puzzle, index) {
    const conditions = puzzle.conditions || [];
    const condition = conditions[index];

    const card = document.createElement('div');
    card.className = 'creator-card';
    card.style.cssText = 'margin-top:8px;padding:8px;';

    const form = document.createElement('div');

    const typeOptions = [
      { value: 'hasItem', label: 'Has Item' },
      { value: '!hasItem', label: 'Does NOT Have Item' },
      { value: 'hasFlag', label: 'Has Flag' },
      { value: '!hasFlag', label: 'Does NOT Have Flag' },
    ];

    form.appendChild(this._createSelect('Type', typeOptions, condition.type, (val) => {
      const newConditions = [...conditions];
      newConditions[index] = { ...condition, type: val };
      this.app.state.updatePuzzle(puzzle.id, { conditions: newConditions });
    }));

    form.appendChild(this._createField('Value', 'text', condition.value || '', (val) => {
      const newConditions = [...conditions];
      newConditions[index] = { ...condition, value: val };
      this.app.state.updatePuzzle(puzzle.id, { conditions: newConditions });
    }));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'creator-btn creator-btn--small creator-btn--danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.cssText = 'margin-top:8px;width:100%;';
    deleteBtn.addEventListener('click', () => {
      const newConditions = conditions.filter((_, i) => i !== index);
      this.app.state.updatePuzzle(puzzle.id, { conditions: newConditions });
      this._renderRightPanel(card.closest('.creator-right-panel__body'));
    });
    form.appendChild(deleteBtn);

    card.appendChild(form);
    return card;
  }

  /**
   * Create the actions collapsible section.
   * @private
   */
  _createActionsSection(puzzle) {
    const section = document.createElement('div');
    section.className = 'creator-form-section';
    section.style.cssText = 'margin-bottom:16px;';

    const header = document.createElement('div');
    header.className = 'creator-collapse__header';
    header.innerHTML = `
      <span class="creator-collapse__arrow">▶</span>
      <span>Actions</span>
    `;
    section.appendChild(header);

    const body = document.createElement('div');
    body.className = 'creator-collapse__body';
    body.style.display = 'none';

    const actions = puzzle.actions || [];

    // Render action list
    for (let i = 0; i < actions.length; i++) {
      const actionCard = this._createActionCard(puzzle, i);
      body.appendChild(actionCard);
    }

    // Add action button
    const addBtn = document.createElement('button');
    addBtn.className = 'creator-btn creator-btn--small';
    addBtn.textContent = '+ Add Action';
    addBtn.style.cssText = 'margin-top:8px;width:100%;';
    addBtn.addEventListener('click', () => {
      const newActions = [...actions, { type: 'say', speaker: '', text: '' }];
      this.app.state.updatePuzzle(puzzle.id, { actions: newActions });
      this._renderRightPanel(body.closest('.creator-right-panel__body'));
    });
    body.appendChild(addBtn);

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
   * Create a card for a single action.
   * @private
   */
  _createActionCard(puzzle, index) {
    const actions = puzzle.actions || [];
    const action = actions[index];

    const card = document.createElement('div');
    card.className = 'creator-card';
    card.style.cssText = 'margin-top:8px;padding:8px;';

    const form = document.createElement('div');

    // Action type selector
    const typeOptions = [
      { value: 'say', label: 'Say' },
      { value: 'addItem', label: 'Add Item' },
      { value: 'removeItem', label: 'Remove Item' },
      { value: 'setFlag', label: 'Set Flag' },
      { value: 'removeFlag', label: 'Remove Flag' },
      { value: 'walkTo', label: 'Walk To' },
      { value: 'changeRoom', label: 'Change Room' },
      { value: 'showHotspot', label: 'Show Hotspot' },
      { value: 'hideHotspot', label: 'Hide Hotspot' },
      { value: 'playSound', label: 'Play Sound' },
    ];

    form.appendChild(this._createSelect('Type', typeOptions, action.type, (val) => {
      const newActions = [...actions];
      newActions[index] = { type: val };
      this.app.state.updatePuzzle(puzzle.id, { actions: newActions });
      this._renderRightPanel(card.closest('.creator-right-panel__body'));
    }));

    // Type-specific fields
    const fieldsContainer = document.createElement('div');
    fieldsContainer.style.cssText = 'margin-top:8px;';

    switch (action.type) {
      case 'say':
        fieldsContainer.appendChild(this._createField('Speaker', 'text', action.speaker || '', (val) => {
          const newActions = [...actions];
          newActions[index] = { ...action, speaker: val };
          this.app.state.updatePuzzle(puzzle.id, { actions: newActions });
        }));
        fieldsContainer.appendChild(this._createTextarea('Text', action.text || '', (val) => {
          const newActions = [...actions];
          newActions[index] = { ...action, text: val };
          this.app.state.updatePuzzle(puzzle.id, { actions: newActions });
        }));
        break;

      case 'addItem':
      case 'removeItem':
        fieldsContainer.appendChild(this._createField('Item ID', 'text', action.itemId || '', (val) => {
          const newActions = [...actions];
          newActions[index] = { ...action, itemId: val };
          this.app.state.updatePuzzle(puzzle.id, { actions: newActions });
        }));
        break;

      case 'setFlag':
      case 'removeFlag':
        fieldsContainer.appendChild(this._createField('Flag', 'text', action.flag || '', (val) => {
          const newActions = [...actions];
          newActions[index] = { ...action, flag: val };
          this.app.state.updatePuzzle(puzzle.id, { actions: newActions });
        }));
        break;

      case 'walkTo':
        fieldsContainer.appendChild(this._createNumberField('X', action.x || 0, (val) => {
          const newActions = [...actions];
          newActions[index] = { ...action, x: val };
          this.app.state.updatePuzzle(puzzle.id, { actions: newActions });
        }));
        fieldsContainer.appendChild(this._createNumberField('Y', action.y || 0, (val) => {
          const newActions = [...actions];
          newActions[index] = { ...action, y: val };
          this.app.state.updatePuzzle(puzzle.id, { actions: newActions });
        }));
        break;

      case 'changeRoom':
        const rooms = this.app.state.rooms.map(r => ({ value: r.id, label: r.name }));
        fieldsContainer.appendChild(this._createSelect('Room', rooms, action.roomId || '', (val) => {
          const newActions = [...actions];
          newActions[index] = { ...action, roomId: val };
          this.app.state.updatePuzzle(puzzle.id, { actions: newActions });
        }));
        fieldsContainer.appendChild(this._createNumberField('Spawn X', action.spawnX || 0, (val) => {
          const newActions = [...actions];
          newActions[index] = { ...action, spawnX: val };
          this.app.state.updatePuzzle(puzzle.id, { actions: newActions });
        }));
        fieldsContainer.appendChild(this._createNumberField('Spawn Y', action.spawnY || 0, (val) => {
          const newActions = [...actions];
          newActions[index] = { ...action, spawnY: val };
          this.app.state.updatePuzzle(puzzle.id, { actions: newActions });
        }));
        break;

      case 'showHotspot':
      case 'hideHotspot':
        fieldsContainer.appendChild(this._createField('Hotspot ID', 'text', action.hotspotId || '', (val) => {
          const newActions = [...actions];
          newActions[index] = { ...action, hotspotId: val };
          this.app.state.updatePuzzle(puzzle.id, { actions: newActions });
        }));
        break;

      case 'playSound':
        fieldsContainer.appendChild(this._createField('Sound', 'text', action.sound || '', (val) => {
          const newActions = [...actions];
          newActions[index] = { ...action, sound: val };
          this.app.state.updatePuzzle(puzzle.id, { actions: newActions });
        }));
        break;
    }

    form.appendChild(fieldsContainer);

    // Move up/down buttons
    const moveButtons = document.createElement('div');
    moveButtons.style.cssText = 'display:flex;gap:4px;margin-top:8px;';

    if (index > 0) {
      const upBtn = document.createElement('button');
      upBtn.className = 'creator-btn creator-btn--small';
      upBtn.textContent = '↑ Up';
      upBtn.style.cssText = 'flex:1;';
      upBtn.addEventListener('click', () => {
        const newActions = [...actions];
        [newActions[index - 1], newActions[index]] = [newActions[index], newActions[index - 1]];
        this.app.state.updatePuzzle(puzzle.id, { actions: newActions });
        this._renderRightPanel(card.closest('.creator-right-panel__body'));
      });
      moveButtons.appendChild(upBtn);
    }

    if (index < actions.length - 1) {
      const downBtn = document.createElement('button');
      downBtn.className = 'creator-btn creator-btn--small';
      downBtn.textContent = '↓ Down';
      downBtn.style.cssText = 'flex:1;';
      downBtn.addEventListener('click', () => {
        const newActions = [...actions];
        [newActions[index], newActions[index + 1]] = [newActions[index + 1], newActions[index]];
        this.app.state.updatePuzzle(puzzle.id, { actions: newActions });
        this._renderRightPanel(card.closest('.creator-right-panel__body'));
      });
      moveButtons.appendChild(downBtn);
    }

    form.appendChild(moveButtons);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'creator-btn creator-btn--small creator-btn--danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.cssText = 'margin-top:8px;width:100%;';
    deleteBtn.addEventListener('click', () => {
      const newActions = actions.filter((_, i) => i !== index);
      this.app.state.updatePuzzle(puzzle.id, { actions: newActions });
      this._renderRightPanel(card.closest('.creator-right-panel__body'));
    });
    form.appendChild(deleteBtn);

    card.appendChild(form);
    return card;
  }

  /**
   * Create a form section with title.
   * @private
   */
  _createSection(title) {
    const section = document.createElement('div');
    section.className = 'creator-form-section';
    section.style.cssText = 'margin-bottom:16px;';

    const titleEl = document.createElement('div');
    titleEl.className = 'creator-form-section__title';
    titleEl.textContent = title;
    section.appendChild(titleEl);

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
    if (onChange) {
      input.addEventListener('change', () => onChange(input.value));
    }
    field.appendChild(input);

    return field;
  }

  /**
   * Create a number input field.
   * @private
   */
  _createNumberField(label, value, onChange) {
    const field = document.createElement('div');
    field.className = 'creator-field';
    field.style.cssText = 'margin-top:8px;';

    const labelEl = document.createElement('label');
    labelEl.className = 'creator-field__label';
    labelEl.textContent = label;
    field.appendChild(labelEl);

    const input = document.createElement('input');
    input.className = 'creator-input creator-input--number';
    input.type = 'number';
    input.value = value || 0;
    input.addEventListener('change', () => onChange(parseInt(input.value, 10) || 0));
    field.appendChild(input);

    return field;
  }

  /**
   * Create a textarea field.
   * @private
   */
  _createTextarea(label, value, onChange) {
    const field = document.createElement('div');
    field.className = 'creator-field';
    field.style.cssText = 'margin-top:8px;';

    const labelEl = document.createElement('label');
    labelEl.className = 'creator-field__label';
    labelEl.textContent = label;
    field.appendChild(labelEl);

    const textarea = document.createElement('textarea');
    textarea.className = 'creator-textarea';
    textarea.value = value || '';
    textarea.rows = 2;
    textarea.addEventListener('change', () => onChange(textarea.value));
    field.appendChild(textarea);

    return field;
  }

  /**
   * Create a select dropdown.
   * @private
   */
  _createSelect(label, options, value, onChange) {
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
    emptyOption.textContent = '-- Select --';
    select.appendChild(emptyOption);

    // Add options
    for (const opt of options) {
      const option = document.createElement('option');
      if (typeof opt === 'object') {
        option.value = opt.value;
        option.textContent = opt.label;
        if (opt.value === value) {
          option.selected = true;
        }
      } else {
        option.value = opt;
        option.textContent = opt;
        if (opt === value) {
          option.selected = true;
        }
      }
      select.appendChild(option);
    }

    select.addEventListener('change', () => onChange(select.value));
    field.appendChild(select);

    return field;
  }

  /**
   * Add a new puzzle to the game.
   * @private
   */
  _addPuzzle() {
    const newPuzzle = this.app.state.addPuzzle({
      trigger: { verb: null, target: null },
      conditions: [],
      actions: [],
      failText: null,
    });
    this.selectedPuzzleId = newPuzzle.id;
    this.render(
      document.querySelector('.creator-left-panel__body'),
      document.querySelector('.creator-right-panel__body')
    );
  }

  /**
   * Delete a puzzle from the game.
   * @private
   */
  _deletePuzzle(puzzleId) {
    if (!confirm('Delete this puzzle? This cannot be undone.')) return;
    this.app.state.removePuzzle(puzzleId);
    this.selectedPuzzleId = null;
    this.render(
      document.querySelector('.creator-left-panel__body'),
      document.querySelector('.creator-right-panel__body')
    );
  }

  /**
   * Escape HTML for safe rendering.
   * @private
   */
  _esc(str) {
    return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
