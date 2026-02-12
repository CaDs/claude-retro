/**
 * DialogueEditor.js
 *
 * Panel for creating and editing dialogue trees. Left panel shows a list of
 * dialogue trees; right panel provides a node graph editor with a node list,
 * node detail form, choices, actions, idle lines, and collapsible sections.
 *
 * Dialogue trees are stored in state.dialogues[dialogueId] as:
 * {
 *   id, nodes: { [key]: { text, speaker, choices, next, action } },
 *   idleLines: []
 * }
 */

// Action type definitions with their associated field configs.
const ACTION_TYPES = [
  { id: 'none',       label: 'None',        fields: [] },
  { id: 'setFlag',    label: 'Set Flag',    fields: [{ key: 'flag', label: 'Flag Name', type: 'text' }] },
  { id: 'removeFlag', label: 'Remove Flag', fields: [{ key: 'flag', label: 'Flag Name', type: 'text' }] },
  { id: 'addItem',    label: 'Add Item',    fields: [{ key: 'item', label: 'Item ID',   type: 'text' }] },
  { id: 'removeItem', label: 'Remove Item', fields: [{ key: 'item', label: 'Item ID',   type: 'text' }] },
  { id: 'say',        label: 'Say',         fields: [{ key: 'text', label: 'Text',      type: 'text' }] },
];

export class DialogueEditor {
  constructor(app) {
    this.app = app;
    this.selectedDialogueId = null;
    this.selectedNodeKey = null;
    this._leftPanel = null;
    this._rightPanel = null;
  }

  /**
   * Render the dialogue editor into the two-panel layout.
   * @param {HTMLElement} leftPanel
   * @param {HTMLElement} rightPanel
   */
  render(leftPanel, rightPanel) {
    this._leftPanel = leftPanel;
    this._rightPanel = rightPanel;
    this._renderLeft();
    this._renderRight();
  }

  // ==========================================================================
  // Left Panel -- dialogue tree list
  // ==========================================================================

  _renderLeft() {
    const leftPanel = this._leftPanel;
    if (!leftPanel) return;
    leftPanel.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.className = 'creator-left-panel__header';
    header.innerHTML = `
      <span class="creator-left-panel__title">Dialogues</span>
      <button class="creator-left-panel__add-btn" id="add-dialogue-btn">+</button>
    `;
    leftPanel.appendChild(header);

    // List
    const list = document.createElement('div');
    list.className = 'creator-left-panel__list';

    const dialogueIds = Object.keys(this.app.state.dialogues);

    for (const dId of dialogueIds) {
      const tree = this.app.state.getDialogue(dId);
      if (!tree) continue;

      const nodeCount = tree.nodes ? Object.keys(tree.nodes).length : 0;

      const item = document.createElement('div');
      item.className = 'creator-card';
      if (dId === this.selectedDialogueId) item.classList.add('creator-card--active');

      item.innerHTML = `
        <div class="creator-card__info">
          <div class="creator-card__name">${this._esc(tree.id || dId)}</div>
          <div class="creator-card__desc">${nodeCount} node${nodeCount !== 1 ? 's' : ''}</div>
        </div>
      `;

      item.addEventListener('click', () => {
        this.selectedDialogueId = dId;
        this.selectedNodeKey = null;
        this._renderLeft();
        this._renderRight();
      });

      // Context menu for dialogue management
      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this._showDialogueContextMenu(e, dId);
      });

      list.appendChild(item);
    }

    if (dialogueIds.length === 0) {
      list.innerHTML = '<div class="creator-empty"><span class="creator-empty__text">No dialogues</span><span class="creator-empty__hint">Click + to add one</span></div>';
    }

    leftPanel.appendChild(list);

    // Add button handler
    leftPanel.querySelector('#add-dialogue-btn').addEventListener('click', () => {
      const count = dialogueIds.length + 1;
      const id = 'dialogue_' + count;
      this.app.state.setDialogue(id, {
        id,
        nodes: {
          start: { text: '', speaker: '', choices: [], next: null },
        },
        idleLines: [],
      });
      this.selectedDialogueId = id;
      this.selectedNodeKey = null;
      this._renderLeft();
      this._renderRight();
    });
  }

  // ==========================================================================
  // Right Panel -- dialogue editor
  // ==========================================================================

  _renderRight() {
    const rightPanel = this._rightPanel;
    if (!rightPanel) return;
    rightPanel.innerHTML = '';

    if (!this.selectedDialogueId) {
      rightPanel.innerHTML = '<div class="creator-empty"><span class="creator-empty__text">No dialogue selected</span><span class="creator-empty__hint">Select or add a dialogue to edit</span></div>';
      return;
    }

    const tree = this.app.state.getDialogue(this.selectedDialogueId);
    if (!tree) {
      rightPanel.innerHTML = '<div class="creator-empty"><span class="creator-empty__text">Dialogue not found</span></div>';
      return;
    }

    const body = document.createElement('div');
    body.style.cssText = 'padding:12px 14px;overflow-y:auto;height:100%;';

    // --- Dialogue Info section ---
    this._appendDialogueInfo(body, tree);

    // --- Idle Lines section ---
    this._appendIdleLines(body, tree);

    // --- Node List section ---
    this._appendNodeList(body, tree);

    // --- Node Editor (when node selected) ---
    if (this.selectedNodeKey && tree.nodes && tree.nodes[this.selectedNodeKey]) {
      this._appendNodeEditor(body, tree, this.selectedNodeKey);
    }

    rightPanel.appendChild(body);
  }

  // ==========================================================================
  // Dialogue Info section
  // ==========================================================================

  _appendDialogueInfo(container, tree) {
    const section = document.createElement('div');
    section.className = 'creator-form-section';

    const title = document.createElement('div');
    title.className = 'creator-form-section__title';
    title.textContent = 'Dialogue Info';
    section.appendChild(title);

    // ID field
    const idField = this._createField('ID', 'text', tree.id || this.selectedDialogueId, (val) => {
      const oldId = this.selectedDialogueId;
      const newId = val.trim();
      if (!newId || newId === oldId) return;

      // Rename: copy tree with new ID, remove old, update selection
      const updatedTree = JSON.parse(JSON.stringify(tree));
      updatedTree.id = newId;
      this.app.state.removeDialogue(oldId);
      this.app.state.setDialogue(newId, updatedTree);
      this.selectedDialogueId = newId;
      this._renderLeft();
      this._renderRight();
    });
    section.appendChild(idField);

    container.appendChild(section);
  }

  // ==========================================================================
  // Idle Lines section
  // ==========================================================================

  _appendIdleLines(container, tree) {
    const section = document.createElement('div');
    section.className = 'creator-form-section';

    const titleRow = document.createElement('div');
    titleRow.className = 'creator-form-section__title';
    titleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';
    titleRow.innerHTML = `
      <span>Idle Lines</span>
      <button class="creator-btn creator-btn--small" id="add-idle-line-btn">+ Add</button>
    `;
    section.appendChild(titleRow);

    const idleLines = tree.idleLines || [];

    if (idleLines.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'font-size:11px;color:var(--color-muted);padding:4px 0;';
      empty.textContent = 'No idle lines. These are random lines the NPC says after dialogue is exhausted.';
      section.appendChild(empty);
    }

    for (let i = 0; i < idleLines.length; i++) {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:4px;align-items:center;margin-top:4px;';

      const input = document.createElement('input');
      input.className = 'creator-input';
      input.style.cssText = 'flex:1;';
      input.value = idleLines[i];
      input.addEventListener('change', () => {
        const updated = [...idleLines];
        updated[i] = input.value;
        this._updateTree(tree, { idleLines: updated });
      });
      row.appendChild(input);

      const delBtn = document.createElement('button');
      delBtn.className = 'creator-btn creator-btn--small creator-btn--danger';
      delBtn.textContent = 'x';
      delBtn.style.cssText = 'padding:2px 6px;flex-shrink:0;';
      delBtn.addEventListener('click', () => {
        const updated = [...idleLines];
        updated.splice(i, 1);
        this._updateTree(tree, { idleLines: updated });
        this._renderRight();
      });
      row.appendChild(delBtn);

      section.appendChild(row);
    }

    container.appendChild(section);

    // Wire up the add button after it is in the DOM
    section.querySelector('#add-idle-line-btn').addEventListener('click', () => {
      const updated = [...idleLines, ''];
      this._updateTree(tree, { idleLines: updated });
      this._renderRight();
    });
  }

  // ==========================================================================
  // Node List section
  // ==========================================================================

  _appendNodeList(container, tree) {
    const section = document.createElement('div');
    section.className = 'creator-form-section';

    const titleRow = document.createElement('div');
    titleRow.className = 'creator-form-section__title';
    titleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';
    titleRow.innerHTML = `
      <span>Nodes</span>
      <button class="creator-btn creator-btn--small" id="add-node-btn">+ Add Node</button>
    `;
    section.appendChild(titleRow);

    const nodes = tree.nodes || {};
    const nodeKeys = Object.keys(nodes);

    if (nodeKeys.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'creator-empty';
      empty.innerHTML = '<span class="creator-empty__text">No nodes</span><span class="creator-empty__hint">Click + Add Node to create one</span>';
      section.appendChild(empty);
    }

    for (const key of nodeKeys) {
      const node = nodes[key];
      const card = document.createElement('div');
      card.className = 'creator-card';
      card.style.cssText = 'margin-top:4px;cursor:pointer;';
      if (key === this.selectedNodeKey) card.classList.add('creator-card--active');

      const textPreview = (node.text || '').length > 40
        ? node.text.substring(0, 40) + '...'
        : (node.text || '(empty)');
      const choiceCount = node.choices ? node.choices.length : 0;

      card.innerHTML = `
        <div class="creator-card__info" style="padding:6px 10px;">
          <div class="creator-card__name">${this._esc(key)}</div>
          <div class="creator-card__desc">${this._esc(textPreview)}${choiceCount > 0 ? ' | ' + choiceCount + ' choice' + (choiceCount !== 1 ? 's' : '') : ''}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectedNodeKey = key;
        this._renderRight();
      });

      section.appendChild(card);
    }

    container.appendChild(section);

    // Wire up add node button
    section.querySelector('#add-node-btn').addEventListener('click', () => {
      const existingKeys = Object.keys(tree.nodes || {});
      let newKey = 'node_' + (existingKeys.length + 1);
      // Ensure uniqueness
      while (existingKeys.includes(newKey)) {
        newKey = 'node_' + (parseInt(newKey.split('_')[1], 10) + 1);
      }

      const updatedNodes = { ...(tree.nodes || {}) };
      updatedNodes[newKey] = { text: '', speaker: '', choices: [], next: null };
      this._updateTree(tree, { nodes: updatedNodes });
      this.selectedNodeKey = newKey;
      this._renderRight();
    });
  }

  // ==========================================================================
  // Node Editor section
  // ==========================================================================

  _appendNodeEditor(container, tree, nodeKey) {
    const node = tree.nodes[nodeKey];

    const divider = document.createElement('div');
    divider.className = 'creator-divider';
    container.appendChild(divider);

    const section = document.createElement('div');
    section.className = 'creator-form-section';

    const title = document.createElement('div');
    title.className = 'creator-form-section__title';
    title.textContent = 'Edit Node: ' + nodeKey;
    section.appendChild(title);

    // Node Key field
    const keyField = this._createField('Node Key', 'text', nodeKey, (val) => {
      const newKey = val.trim();
      if (!newKey || newKey === nodeKey) return;
      if (tree.nodes[newKey]) {
        alert('A node with key "' + newKey + '" already exists.');
        return;
      }
      this._renameNode(tree, nodeKey, newKey);
    });
    section.appendChild(keyField);

    // Speaker field
    const speakerField = this._createField('Speaker', 'text', node.speaker || '', (val) => {
      node.speaker = val;
      this._saveNodes(tree);
    });
    section.appendChild(speakerField);

    // Text field (textarea)
    const textField = document.createElement('div');
    textField.className = 'creator-field';
    textField.style.cssText = 'margin-top:8px;';

    const textLabel = document.createElement('label');
    textLabel.className = 'creator-field__label';
    textLabel.textContent = 'Text';
    textField.appendChild(textLabel);

    const textarea = document.createElement('textarea');
    textarea.className = 'creator-textarea';
    textarea.rows = 3;
    textarea.value = node.text || '';
    textarea.addEventListener('change', () => {
      node.text = textarea.value;
      this._saveNodes(tree);
    });
    textField.appendChild(textarea);
    section.appendChild(textField);

    // Next field
    const nextField = this._createField('Next Node', 'text', node.next || '', (val) => {
      node.next = val.trim() || null;
      this._saveNodes(tree);
    });
    nextField.querySelector('input').placeholder = 'Node key or blank to end';
    section.appendChild(nextField);

    // --- Action section (collapsible) ---
    this._appendActionSection(section, tree, node);

    // --- Choices section (collapsible) ---
    this._appendChoicesSection(section, tree, node);

    // Delete node button
    const delDivider = document.createElement('div');
    delDivider.className = 'creator-divider';
    section.appendChild(delDivider);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'creator-btn creator-btn--small creator-btn--danger';
    deleteBtn.textContent = 'Delete Node';
    deleteBtn.style.cssText = 'margin-top:8px;width:100%;';
    deleteBtn.addEventListener('click', () => {
      this._deleteNode(tree, nodeKey);
    });
    section.appendChild(deleteBtn);

    container.appendChild(section);
  }

  // ==========================================================================
  // Action section (collapsible)
  // ==========================================================================

  _appendActionSection(container, tree, node) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'margin-top:12px;';

    const header = document.createElement('div');
    header.className = 'creator-collapse__header';
    header.innerHTML = `
      <span class="creator-collapse__arrow">&#9654;</span>
      <span>Action</span>
    `;
    wrapper.appendChild(header);

    const body = document.createElement('div');
    body.className = 'creator-collapse__body';
    body.style.display = 'none';

    const action = node.action || null;
    const currentType = action ? (action.type || 'none') : 'none';

    // Type dropdown
    const typeField = document.createElement('div');
    typeField.className = 'creator-field';
    typeField.style.cssText = 'margin-top:6px;';

    const typeLabel = document.createElement('label');
    typeLabel.className = 'creator-field__label';
    typeLabel.textContent = 'Type';
    typeField.appendChild(typeLabel);

    const typeSelect = document.createElement('select');
    typeSelect.className = 'creator-select';
    for (const at of ACTION_TYPES) {
      const opt = document.createElement('option');
      opt.value = at.id;
      opt.textContent = at.label;
      if (at.id === currentType) opt.selected = true;
      typeSelect.appendChild(opt);
    }
    typeField.appendChild(typeSelect);
    body.appendChild(typeField);

    // Dynamic fields container
    const fieldsContainer = document.createElement('div');
    fieldsContainer.id = 'action-fields-container';
    body.appendChild(fieldsContainer);

    // Render dynamic fields for current action type
    this._renderActionFields(fieldsContainer, tree, node, currentType);

    typeSelect.addEventListener('change', () => {
      const newType = typeSelect.value;
      if (newType === 'none') {
        node.action = null;
      } else {
        node.action = { type: newType };
      }
      this._saveNodes(tree);
      this._renderActionFields(fieldsContainer, tree, node, newType);
    });

    wrapper.appendChild(body);

    // Toggle
    header.addEventListener('click', () => {
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      header.querySelector('.creator-collapse__arrow').textContent = isOpen ? '\u25B6' : '\u25BC';
      wrapper.classList.toggle('creator-collapse--open', !isOpen);
    });

    container.appendChild(wrapper);
  }

  /**
   * Render the conditional fields for the selected action type.
   */
  _renderActionFields(container, tree, node, actionType) {
    container.innerHTML = '';

    const typeDef = ACTION_TYPES.find(at => at.id === actionType);
    if (!typeDef || typeDef.fields.length === 0) return;

    const action = node.action || {};

    for (const fieldDef of typeDef.fields) {
      const field = this._createField(fieldDef.label, fieldDef.type, action[fieldDef.key] || '', (val) => {
        if (!node.action) node.action = { type: actionType };
        node.action[fieldDef.key] = val;
        this._saveNodes(tree);
      });
      container.appendChild(field);
    }
  }

  // ==========================================================================
  // Choices section (collapsible)
  // ==========================================================================

  _appendChoicesSection(container, tree, node) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'margin-top:12px;';

    const choices = node.choices || [];

    const header = document.createElement('div');
    header.className = 'creator-collapse__header';
    header.innerHTML = `
      <span class="creator-collapse__arrow">&#9654;</span>
      <span>Choices (${choices.length})</span>
    `;
    wrapper.appendChild(header);

    const body = document.createElement('div');
    body.className = 'creator-collapse__body';
    body.style.display = 'none';

    // Add choice button at the top
    const addBtn = document.createElement('button');
    addBtn.className = 'creator-btn creator-btn--small';
    addBtn.textContent = '+ Add Choice';
    addBtn.style.cssText = 'margin-top:6px;margin-bottom:6px;';
    addBtn.addEventListener('click', () => {
      if (!node.choices) node.choices = [];
      node.choices.push({ text: '', next: null });
      this._saveNodes(tree);
      this._renderRight();
    });
    body.appendChild(addBtn);

    for (let i = 0; i < choices.length; i++) {
      const choice = choices[i];
      const choiceCard = this._createChoiceCard(tree, node, choice, i);
      body.appendChild(choiceCard);
    }

    if (choices.length === 0) {
      const hint = document.createElement('div');
      hint.style.cssText = 'font-size:11px;color:var(--color-muted);padding:4px 0;';
      hint.textContent = 'No choices. Use the "Next Node" field above for linear flow.';
      body.appendChild(hint);
    }

    wrapper.appendChild(body);

    // Toggle
    header.addEventListener('click', () => {
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      header.querySelector('.creator-collapse__arrow').textContent = isOpen ? '\u25B6' : '\u25BC';
      wrapper.classList.toggle('creator-collapse--open', !isOpen);
    });

    container.appendChild(wrapper);
  }

  /**
   * Create a card for a single choice entry.
   */
  _createChoiceCard(tree, node, choice, index) {
    const card = document.createElement('div');
    card.className = 'creator-card';
    card.style.cssText = 'margin-top:6px;padding:8px 10px;';

    // Choice label
    const choiceLabel = document.createElement('div');
    choiceLabel.style.cssText = 'font-size:10px;color:var(--color-muted);margin-bottom:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;';
    choiceLabel.textContent = 'Choice ' + (index + 1);
    card.appendChild(choiceLabel);

    // Text field
    const textField = this._createField('Text', 'text', choice.text || '', (val) => {
      choice.text = val;
      this._saveNodes(tree);
    });
    card.appendChild(textField);

    // Next field
    const nextField = this._createField('Next Node', 'text', choice.next || '', (val) => {
      choice.next = val.trim() || null;
      this._saveNodes(tree);
    });
    nextField.querySelector('input').placeholder = 'Node key or blank to end';
    card.appendChild(nextField);

    // Condition section (inline collapsible)
    this._appendChoiceCondition(card, tree, node, choice, index);

    // Delete choice button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'creator-btn creator-btn--small creator-btn--danger';
    deleteBtn.textContent = 'Remove Choice';
    deleteBtn.style.cssText = 'margin-top:8px;width:100%;';
    deleteBtn.addEventListener('click', () => {
      node.choices.splice(index, 1);
      this._saveNodes(tree);
      this._renderRight();
    });
    card.appendChild(deleteBtn);

    return card;
  }

  /**
   * Append condition fields to a choice card.
   */
  _appendChoiceCondition(container, tree, node, choice, index) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'margin-top:8px;';

    const condHeader = document.createElement('div');
    condHeader.className = 'creator-collapse__header';
    condHeader.style.cssText = 'font-size:11px;';
    condHeader.innerHTML = `
      <span class="creator-collapse__arrow" style="font-size:9px;">&#9654;</span>
      <span>Condition${choice.condition ? ' (set)' : ''}</span>
    `;
    wrapper.appendChild(condHeader);

    const condBody = document.createElement('div');
    condBody.className = 'creator-collapse__body';
    condBody.style.display = 'none';

    const condition = choice.condition || {};

    // hasFlag field
    const hasFlagField = this._createField('Has Flag', 'text', condition.hasFlag || '', (val) => {
      if (!choice.condition) choice.condition = {};
      if (val.trim()) {
        choice.condition.hasFlag = val.trim();
      } else {
        delete choice.condition.hasFlag;
      }
      this._cleanCondition(choice);
      this._saveNodes(tree);
    });
    hasFlagField.querySelector('input').placeholder = 'Flag name (optional)';
    condBody.appendChild(hasFlagField);

    // hasItem field
    const hasItemField = this._createField('Has Item', 'text', condition.hasItem || '', (val) => {
      if (!choice.condition) choice.condition = {};
      if (val.trim()) {
        choice.condition.hasItem = val.trim();
      } else {
        delete choice.condition.hasItem;
      }
      this._cleanCondition(choice);
      this._saveNodes(tree);
    });
    hasItemField.querySelector('input').placeholder = 'Item ID (optional)';
    condBody.appendChild(hasItemField);

    wrapper.appendChild(condBody);

    // Toggle
    condHeader.addEventListener('click', () => {
      const isOpen = condBody.style.display !== 'none';
      condBody.style.display = isOpen ? 'none' : 'block';
      condHeader.querySelector('.creator-collapse__arrow').textContent = isOpen ? '\u25B6' : '\u25BC';
      wrapper.classList.toggle('creator-collapse--open', !isOpen);
    });

    container.appendChild(wrapper);
  }

  /**
   * Remove the condition object entirely if it has no keys.
   */
  _cleanCondition(choice) {
    if (choice.condition && Object.keys(choice.condition).length === 0) {
      delete choice.condition;
    }
  }

  // ==========================================================================
  // Node operations
  // ==========================================================================

  /**
   * Rename a node key, updating all references (next, choice.next) across the tree.
   */
  _renameNode(tree, oldKey, newKey) {
    const nodes = tree.nodes || {};

    // Create new nodes object with renamed key
    const updatedNodes = {};
    for (const key of Object.keys(nodes)) {
      const targetKey = key === oldKey ? newKey : key;
      updatedNodes[targetKey] = JSON.parse(JSON.stringify(nodes[key]));
    }

    // Update all references pointing to oldKey
    for (const key of Object.keys(updatedNodes)) {
      const n = updatedNodes[key];
      if (n.next === oldKey) n.next = newKey;
      if (n.choices) {
        for (const c of n.choices) {
          if (c.next === oldKey) c.next = newKey;
        }
      }
    }

    this._updateTree(tree, { nodes: updatedNodes });
    this.selectedNodeKey = newKey;
    this._renderRight();
  }

  /**
   * Delete a node from the tree and clear references to it.
   */
  _deleteNode(tree, nodeKey) {
    const updatedNodes = { ...(tree.nodes || {}) };
    delete updatedNodes[nodeKey];

    // Clear references pointing to deleted node
    for (const key of Object.keys(updatedNodes)) {
      const n = updatedNodes[key];
      if (n.next === nodeKey) n.next = null;
      if (n.choices) {
        for (const c of n.choices) {
          if (c.next === nodeKey) c.next = null;
        }
      }
    }

    this._updateTree(tree, { nodes: updatedNodes });
    this.selectedNodeKey = null;
    this._renderRight();
  }

  // ==========================================================================
  // State helpers
  // ==========================================================================

  /**
   * Save the current nodes back to state (full tree replacement).
   */
  _saveNodes(tree) {
    this.app.state.setDialogue(this.selectedDialogueId, tree);
  }

  /**
   * Update partial tree properties and persist.
   */
  _updateTree(tree, changes) {
    Object.assign(tree, changes);
    this.app.state.setDialogue(this.selectedDialogueId, tree);
  }

  // ==========================================================================
  // Context menu
  // ==========================================================================

  _showDialogueContextMenu(e, dialogueId) {
    // Remove any existing context menu
    const existing = document.querySelector('.creator-context-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.className = 'creator-context-menu';
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';

    const items = [
      {
        label: 'Duplicate', action: () => {
          const tree = this.app.state.getDialogue(dialogueId);
          if (!tree) return;
          const clone = JSON.parse(JSON.stringify(tree));
          const newId = dialogueId + '_copy';
          clone.id = newId;
          this.app.state.setDialogue(newId, clone);
          this.selectedDialogueId = newId;
          this.selectedNodeKey = null;
          this._renderLeft();
          this._renderRight();
        }
      },
      {
        label: 'Delete', danger: true, action: () => {
          this.app.state.removeDialogue(dialogueId);
          if (this.selectedDialogueId === dialogueId) {
            this.selectedDialogueId = null;
            this.selectedNodeKey = null;
          }
          this._renderLeft();
          this._renderRight();
        }
      },
    ];

    for (const item of items) {
      const el = document.createElement('div');
      el.className = 'creator-context-menu__item';
      if (item.danger) el.classList.add('creator-context-menu__item--danger');
      el.textContent = item.label;
      el.addEventListener('click', () => {
        menu.remove();
        item.action();
      });
      menu.appendChild(el);
    }

    document.body.appendChild(menu);

    // Close on click outside
    const close = (ev) => {
      if (!menu.contains(ev.target)) {
        menu.remove();
        document.removeEventListener('mousedown', close);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', close), 0);
  }

  // ==========================================================================
  // Shared DOM helpers
  // ==========================================================================

  /**
   * Create a labeled text input field.
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
   * Escape HTML for safe rendering in innerHTML.
   */
  _esc(str) {
    return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
