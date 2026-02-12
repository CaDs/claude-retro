/**
 * ItemEditor.js
 *
 * Panel for editing game items (inventory objects).
 * Displays a list of item cards in the left panel and item properties in the right panel.
 */

import { settings } from '../../settings/index.js';

export class ItemEditor {
  constructor(app) {
    this.app = app;
    this.selectedItemId = null;
  }

  /**
   * Render the item editor panels.
   * @param {HTMLElement} leftPanel - The left panel container (item list)
   * @param {HTMLElement} rightPanel - The right panel container (item properties)
   */
  render(leftPanel, rightPanel) {
    this._renderLeftPanel(leftPanel);
    this._renderRightPanel(rightPanel);
  }

  /**
   * Render the left panel: item list with add button.
   * @private
   */
  _renderLeftPanel(container) {
    container.innerHTML = '';

    const items = this.app.state.items;

    // Header with title and add button
    const header = document.createElement('div');
    header.className = 'creator-form-section';
    header.innerHTML = `
      <div class="creator-form-section__title" style="display:flex;align-items:center;justify-content:space-between;">
        <span>Items</span>
        <button class="creator-btn creator-btn--small" id="add-item-btn">+ Add</button>
      </div>
    `;
    container.appendChild(header);

    header.querySelector('#add-item-btn').addEventListener('click', () => {
      this._addItem();
    });

    // Item list
    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'creator-empty';
      empty.innerHTML = '<span class="creator-empty__text">No items</span><span class="creator-empty__hint">Click + Add to create one</span>';
      container.appendChild(empty);
      return;
    }

    for (const item of items) {
      const card = this._createItemCard(item);
      container.appendChild(card);
    }
  }

  /**
   * Create a card UI for a single item.
   * @private
   */
  _createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'creator-card';
    if (item.id === this.selectedItemId) {
      card.classList.add('creator-card--active');
    }

    card.style.cssText = 'cursor:pointer;padding:8px 10px;';
    card.innerHTML = `
      <div class="creator-card__name">${this._esc(item.name)}</div>
      <div class="creator-card__desc">Icon: ${this._esc(item.icon.generator || 'none')}</div>
    `;

    card.addEventListener('click', () => {
      this.selectedItemId = item.id;
      this.render(card.closest('.creator-left-panel__body'), card.closest('.creator-layout').querySelector('.creator-right-panel__body'));
    });

    return card;
  }

  /**
   * Render the right panel: item properties editor.
   * @private
   */
  _renderRightPanel(container) {
    container.innerHTML = '';

    if (!this.selectedItemId) {
      const empty = document.createElement('div');
      empty.className = 'creator-empty';
      empty.innerHTML = '<span class="creator-empty__text">No item selected</span><span class="creator-empty__hint">Select an item from the list</span>';
      container.appendChild(empty);
      return;
    }

    const item = this.app.state.getItem(this.selectedItemId);
    if (!item) {
      container.innerHTML = '<div class="creator-empty"><span class="creator-empty__text">Item not found</span></div>';
      return;
    }

    const form = document.createElement('div');
    form.style.cssText = 'padding:10px;';

    // Item Info Section
    const infoSection = this._createSection('Item Info');

    // ID field (readonly)
    infoSection.appendChild(this._createField('ID', 'text', item.id, null, true));

    // Name field
    infoSection.appendChild(this._createField('Name', 'text', item.name, (val) => {
      this.app.state.updateItem(item.id, { name: val });
    }));

    // Description field (textarea)
    infoSection.appendChild(this._createTextarea('Description', item.description, (val) => {
      this.app.state.updateItem(item.id, { description: val });
    }));

    form.appendChild(infoSection);

    // Icon Section
    const iconSection = this._createSection('Icon');

    const settingDef = settings[this.app.state.game.setting];
    const iconTypes = settingDef?.itemIcons || [];

    iconSection.appendChild(this._createSelect('Icon Type', iconTypes, item.icon.generator, (val) => {
      this.app.state.updateItem(item.id, { icon: { generator: val } });
    }));

    form.appendChild(iconSection);

    // Responses Section
    const responsesSection = this._createSection('Verb Responses');
    const verbs = this.app.state.game.verbs;

    for (const verb of verbs) {
      const responses = item.responses || {};
      responsesSection.appendChild(this._createField(verb.label, 'text', responses[verb.id] || '', (val) => {
        const newResponses = { ...item.responses };
        if (val.trim()) {
          newResponses[verb.id] = val;
        } else {
          delete newResponses[verb.id];
        }
        this.app.state.updateItem(item.id, { responses: newResponses });
      }));
    }

    form.appendChild(responsesSection);

    // Use Default Section
    const useDefaultSection = this._createSection('Use Default');
    useDefaultSection.appendChild(this._createTextarea('Default "use" response', item.useDefault || '', (val) => {
      this.app.state.updateItem(item.id, { useDefault: val });
    }));

    form.appendChild(useDefaultSection);

    // Delete button
    const divider = document.createElement('div');
    divider.className = 'creator-divider';
    form.appendChild(divider);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'creator-btn creator-btn--small creator-btn--danger';
    deleteBtn.textContent = 'Delete Item';
    deleteBtn.style.cssText = 'margin-top:12px;width:100%;';
    deleteBtn.addEventListener('click', () => {
      this._deleteItem(item.id);
    });
    form.appendChild(deleteBtn);

    container.appendChild(form);
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
  _createField(label, type, value, onChange, readonly = false) {
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
    input.readOnly = readonly;
    if (onChange) {
      input.addEventListener('change', () => onChange(input.value));
    }
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
    textarea.rows = 3;
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
      option.value = opt;
      option.textContent = opt;
      if (opt === value) {
        option.selected = true;
      }
      select.appendChild(option);
    }

    select.addEventListener('change', () => onChange(select.value));
    field.appendChild(select);

    return field;
  }

  /**
   * Add a new item to the game.
   * @private
   */
  _addItem() {
    const newItem = this.app.state.addItem({
      name: 'New Item',
      description: '',
      icon: { generator: null },
      responses: {},
      useDefault: "I can't use that here.",
    });
    this.selectedItemId = newItem.id;
    this.render(
      document.querySelector('.creator-left-panel__body'),
      document.querySelector('.creator-right-panel__body')
    );
  }

  /**
   * Delete an item from the game.
   * @private
   */
  _deleteItem(itemId) {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    this.app.state.removeItem(itemId);
    this.selectedItemId = null;
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
