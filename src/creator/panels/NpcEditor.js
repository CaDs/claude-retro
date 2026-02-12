/**
 * NpcEditor.js
 *
 * Panel for creating and editing NPC definitions. Left panel shows NPC list,
 * right panel provides trait pickers with a live character preview canvas,
 * placement management, and per-verb response editing.
 */

import { CharacterGenerator } from '../../engine/CharacterGenerator.js';
import { settings } from '../../settings/index.js';

// --- Base trait values for new NPCs ---
const BASE_TRAITS = {
  bodyType: 'average',
  skinTone: 'fair',
  hairStyle: 'short',
  hairColor: 'brown',
  clothingColor: '#4a86c8',
  facial: 'none',
};

/** Return setting-appropriate default traits for new NPCs */
function getDefaultTraits(settingId) {
  switch (settingId) {
    case 'scifi':
      return { ...BASE_TRAITS, clothing: 'jumpsuit', footwear: 'boots', accessory: 'none' };
    case 'contemporary':
      return { ...BASE_TRAITS, clothing: 'jacket', footwear: 'sneakers', accessory: 'none' };
    case 'eighties':
      return { ...BASE_TRAITS, clothing: 'neon_jacket', footwear: 'high_tops', accessory: 'sunglasses' };
    default:
      return { ...BASE_TRAITS, clothing: 'tunic', footwear: 'boots', accessory: 'none' };
  }
}

// --- Static trait options (setting-independent) ---
const BODY_TYPES = ['slim', 'average', 'stocky', 'tall'];
const SKIN_TONES = ['fair', 'tan', 'brown', 'dark', 'pale'];
const HAIR_STYLES = ['short', 'long', 'ponytail', 'messy', 'braided', 'bald'];
const HAIR_COLORS = ['brown', 'black', 'blonde', 'red', 'gray', 'white'];
const FACIAL_TYPES = ['beard', 'mustache', 'goatee', 'none'];

export class NpcEditor {
  constructor(app) {
    this.app = app;
    this.selectedNpcId = null;
    this._previewCanvas = null;
    this._previewCtx = null;
  }

  render(leftPanel, rightPanel) {
    this._renderLeftPanel(leftPanel, rightPanel);
    this._renderRightPanel(leftPanel, rightPanel);
  }

  // ==========================================================================
  // Left panel — NPC list
  // ==========================================================================

  _renderLeftPanel(leftPanel, rightPanel) {
    leftPanel.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'creator-left-panel__header';
    header.innerHTML = `
      <span class="creator-left-panel__title">NPCs</span>
      <button class="creator-left-panel__add-btn" id="add-npc-btn">+</button>
    `;
    leftPanel.appendChild(header);

    const list = document.createElement('div');
    list.className = 'creator-left-panel__list';

    for (const npc of this.app.state.npcs) {
      const item = document.createElement('div');
      item.className = 'creator-card';
      if (npc.id === this.selectedNpcId) item.classList.add('creator-card--active');

      const firstRoom = npc.placements && npc.placements.length > 0
        ? npc.placements[0].room || 'Unknown room'
        : 'No placement';

      item.innerHTML = `
        <div class="creator-card__info">
          <div class="creator-card__name">${this._esc(npc.name || npc.id)}</div>
          <div class="creator-card__desc">${this._esc(firstRoom)}</div>
        </div>
      `;
      item.addEventListener('click', () => {
        this.selectedNpcId = npc.id;
        this.render(leftPanel, rightPanel);
      });
      list.appendChild(item);
    }

    if (!this.app.state.npcs.length) {
      list.innerHTML = '<div class="creator-empty"><span class="creator-empty__text">No NPCs</span><span class="creator-empty__hint">Click + to add one</span></div>';
    }

    leftPanel.appendChild(list);

    leftPanel.querySelector('#add-npc-btn').addEventListener('click', () => {
      const id = 'npc_' + (this.app.state.npcs.length + 1);
      this.app.state.addNpc({
        id,
        name: 'New NPC',
        traits: { ...getDefaultTraits(this.app.state.game.setting) },
        placements: [],
        responses: {},
      });
      this.selectedNpcId = id;
      this.render(leftPanel, rightPanel);
    });
  }

  // ==========================================================================
  // Right panel — NPC editor
  // ==========================================================================

  _renderRightPanel(leftPanel, rightPanel) {
    rightPanel.innerHTML = '';

    if (!this.selectedNpcId) {
      rightPanel.innerHTML = '<div class="creator-empty"><span class="creator-empty__text">No NPC selected</span><span class="creator-empty__hint">Select or add an NPC to edit</span></div>';
      return;
    }

    const npc = this.app.state.getNpc(this.selectedNpcId);
    if (!npc) {
      rightPanel.innerHTML = '<div class="creator-empty"><span class="creator-empty__text">NPC not found</span></div>';
      return;
    }

    const body = document.createElement('div');
    body.style.cssText = 'padding:12px 14px;overflow-y:auto;height:100%;';

    // --- NPC Info ---
    this._appendInfoSection(body, npc, leftPanel, rightPanel);

    // --- Live Preview ---
    this._appendPreviewSection(body, npc);

    // --- Appearance ---
    this._appendAppearanceSection(body, npc, leftPanel, rightPanel);

    // --- Placements ---
    this._appendPlacementsSection(body, npc, leftPanel, rightPanel);

    // --- Responses ---
    this._appendResponsesSection(body, npc);

    // --- Delete ---
    const divider = document.createElement('div');
    divider.className = 'creator-divider';
    body.appendChild(divider);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'creator-btn creator-btn--small creator-btn--danger';
    deleteBtn.textContent = 'Delete NPC';
    deleteBtn.style.cssText = 'margin-top:8px;width:100%;';
    deleteBtn.addEventListener('click', () => {
      this.app.state.removeNpc(npc.id);
      this.selectedNpcId = null;
      this.render(leftPanel, rightPanel);
    });
    body.appendChild(deleteBtn);

    rightPanel.appendChild(body);

    // Initial preview render
    this._renderPreview(npc.traits);
  }

  // ==========================================================================
  // NPC Info section
  // ==========================================================================

  _appendInfoSection(container, npc, leftPanel, rightPanel) {
    const section = document.createElement('div');
    section.className = 'creator-form-section';
    section.innerHTML = `
      <div class="creator-form-section__title">NPC Info</div>
      <div class="creator-field">
        <label class="creator-field__label">ID</label>
        <input class="creator-input" value="${this._esc(npc.id)}" readonly style="opacity:0.6;cursor:default;" />
      </div>
      <div class="creator-field">
        <label class="creator-field__label">Name</label>
        <input class="creator-input" id="npc-name" value="${this._esc(npc.name || '')}" />
      </div>
    `;
    container.appendChild(section);

    section.querySelector('#npc-name').addEventListener('change', (e) => {
      this.app.state.updateNpc(npc.id, { name: e.target.value });
      this.render(leftPanel, rightPanel);
    });
  }

  // ==========================================================================
  // Live Preview section
  // ==========================================================================

  _appendPreviewSection(container, npc) {
    const section = document.createElement('div');
    section.className = 'creator-form-section';
    section.innerHTML = '<div class="creator-form-section__title">Preview</div>';

    const canvasWrap = document.createElement('div');
    canvasWrap.style.cssText = 'display:flex;justify-content:center;padding:8px 0;background:#1a1a2e;border-radius:4px;';

    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 64;
    canvas.style.cssText = 'width:144px;height:192px;image-rendering:pixelated;';
    canvasWrap.appendChild(canvas);
    section.appendChild(canvasWrap);
    container.appendChild(section);

    this._previewCanvas = canvas;
    this._previewCtx = canvas.getContext('2d');
    this._previewCtx.imageSmoothingEnabled = false;
  }

  /**
   * Re-render the character preview using CharacterGenerator.
   */
  _renderPreview(traits) {
    if (!this._previewCanvas || !this._previewCtx) return;
    const ctx = this._previewCtx;
    ctx.clearRect(0, 0, 48, 64);

    // Build a minimal renderer proxy that CharacterGenerator can use
    const proxy = {
      drawRect(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
      },
      bufCtx: ctx,
      _proxyOffX: 0,
      _proxyOffY: 0,
    };

    // Center character in the 48x64 canvas; draw at ~(12, 8) to leave margin
    CharacterGenerator.draw(proxy, 12, 8, traits || {}, 0, 'right');
  }

  // ==========================================================================
  // Appearance section
  // ==========================================================================

  _appendAppearanceSection(container, npc, leftPanel, rightPanel) {
    const section = document.createElement('div');
    section.className = 'creator-form-section';
    section.innerHTML = '<div class="creator-form-section__title">Appearance</div>';

    const traits = npc.traits || {};
    const settingId = this.app.state.game.setting;
    const settingData = settingId ? settings[settingId] : null;
    const charTraits = settingData && settingData.characterTraits ? settingData.characterTraits : {};

    // Clothing options: from setting, or fallback
    const clothingOptions = charTraits.clothing || ['tunic', 'apron', 'robe', 'armor', 'vest'];
    const accessoryOptions = charTraits.accessory || ['hood', 'hat', 'headband', 'eyepatch', 'glasses', 'crown', 'none'];
    const footwearOptions = charTraits.footwear || ['boots', 'shoes', 'sandals', 'none'];

    const traitDefs = [
      { key: 'bodyType',      label: 'Body Type',      options: BODY_TYPES },
      { key: 'skinTone',      label: 'Skin Tone',      options: SKIN_TONES },
      { key: 'hairStyle',     label: 'Hair Style',     options: HAIR_STYLES },
      { key: 'hairColor',     label: 'Hair Color',     options: HAIR_COLORS },
      { key: 'clothing',      label: 'Clothing',       options: clothingOptions },
      { key: 'clothingColor', label: 'Clothing Color', type: 'color' },
      { key: 'facial',        label: 'Facial Hair',    options: FACIAL_TYPES },
      { key: 'accessory',     label: 'Accessory',      options: accessoryOptions },
      { key: 'footwear',      label: 'Footwear',       options: footwearOptions },
    ];

    for (const def of traitDefs) {
      const field = document.createElement('div');
      field.className = 'creator-field';
      field.style.cssText = 'margin-top:6px;';

      const label = document.createElement('label');
      label.className = 'creator-field__label';
      label.textContent = def.label;
      field.appendChild(label);

      if (def.type === 'color') {
        // Color input for clothingColor
        const input = document.createElement('input');
        input.className = 'creator-input';
        input.type = 'color';
        input.value = traits[def.key] || '#4a86c8';
        input.style.cssText = 'height:28px;padding:2px;';
        input.addEventListener('input', () => {
          const updated = { ...npc.traits, [def.key]: input.value };
          this.app.state.updateNpc(npc.id, { traits: updated });
          this._renderPreview(updated);
        });
        field.appendChild(input);
      } else {
        // Select dropdown
        const select = document.createElement('select');
        select.className = 'creator-select';
        for (const opt of def.options) {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          if (traits[def.key] === opt) option.selected = true;
          select.appendChild(option);
        }
        select.addEventListener('change', () => {
          const updated = { ...npc.traits, [def.key]: select.value };
          this.app.state.updateNpc(npc.id, { traits: updated });
          this._renderPreview(updated);
        });
        field.appendChild(select);
      }

      section.appendChild(field);
    }

    container.appendChild(section);
  }

  // ==========================================================================
  // Placements section
  // ==========================================================================

  _appendPlacementsSection(container, npc, leftPanel, rightPanel) {
    const section = document.createElement('div');
    section.className = 'creator-form-section';

    const titleRow = document.createElement('div');
    titleRow.className = 'creator-form-section__title';
    titleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';
    titleRow.innerHTML = `
      <span>Placements</span>
      <button class="creator-btn creator-btn--small" id="add-placement-btn">+ Add</button>
    `;
    section.appendChild(titleRow);

    const placements = npc.placements || [];

    if (placements.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'creator-empty';
      empty.style.cssText = 'padding:8px 0;';
      empty.innerHTML = '<span class="creator-empty__text">No placements</span>';
      section.appendChild(empty);
    }

    for (let i = 0; i < placements.length; i++) {
      const placement = placements[i];
      const card = this._createPlacementCard(placement, i, npc, leftPanel, rightPanel);
      section.appendChild(card);
    }

    container.appendChild(section);

    section.querySelector('#add-placement-btn').addEventListener('click', () => {
      const updatedPlacements = [...placements, {
        room: this.app.state.rooms.length > 0 ? this.app.state.rooms[0].id : '',
        position: { x: 160, y: 100 },
        size: { width: 24, height: 40 },
        facing: 'right',
        walkTo: { x: 160, y: 110 },
      }];
      this.app.state.updateNpc(npc.id, { placements: updatedPlacements });
      this.render(leftPanel, rightPanel);
    });
  }

  _createPlacementCard(placement, index, npc, leftPanel, rightPanel) {
    const card = document.createElement('div');
    card.className = 'creator-card';
    card.style.cssText = 'margin-top:6px;padding:8px 10px;';

    // Room dropdown
    const roomField = document.createElement('div');
    roomField.className = 'creator-field';
    roomField.style.cssText = 'margin-bottom:6px;';

    const roomLabel = document.createElement('label');
    roomLabel.className = 'creator-field__label';
    roomLabel.textContent = 'Room';
    roomField.appendChild(roomLabel);

    const roomSelect = document.createElement('select');
    roomSelect.className = 'creator-select';
    for (const room of this.app.state.rooms) {
      const option = document.createElement('option');
      option.value = room.id;
      option.textContent = room.name || room.id;
      if (placement.room === room.id) option.selected = true;
      roomSelect.appendChild(option);
    }
    if (this.app.state.rooms.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = '(no rooms)';
      roomSelect.appendChild(option);
    }
    roomSelect.addEventListener('change', () => {
      placement.room = roomSelect.value;
      this._updatePlacements(npc);
    });
    roomField.appendChild(roomSelect);
    card.appendChild(roomField);

    // Position: x, y
    const posLabel = document.createElement('div');
    posLabel.className = 'creator-field__label';
    posLabel.textContent = 'Position';
    posLabel.style.cssText = 'margin-bottom:4px;';
    card.appendChild(posLabel);

    const posFields = document.createElement('div');
    posFields.className = 'creator-field--coords';
    posFields.appendChild(this._createNumberInput('X', placement.position ? placement.position.x : 0, (val) => {
      if (!placement.position) placement.position = { x: 0, y: 0 };
      placement.position.x = val;
      this._updatePlacements(npc);
    }));
    posFields.appendChild(this._createNumberInput('Y', placement.position ? placement.position.y : 0, (val) => {
      if (!placement.position) placement.position = { x: 0, y: 0 };
      placement.position.y = val;
      this._updatePlacements(npc);
    }));
    card.appendChild(posFields);

    // Size: width, height
    const sizeLabel = document.createElement('div');
    sizeLabel.className = 'creator-field__label';
    sizeLabel.textContent = 'Size';
    sizeLabel.style.cssText = 'margin-top:6px;margin-bottom:4px;';
    card.appendChild(sizeLabel);

    const sizeFields = document.createElement('div');
    sizeFields.className = 'creator-field--coords';
    const size = placement.size || { width: 24, height: 40 };
    sizeFields.appendChild(this._createNumberInput('W', size.width, (val) => {
      if (!placement.size) placement.size = { width: 24, height: 40 };
      placement.size.width = val;
      this._updatePlacements(npc);
    }));
    sizeFields.appendChild(this._createNumberInput('H', size.height, (val) => {
      if (!placement.size) placement.size = { width: 24, height: 40 };
      placement.size.height = val;
      this._updatePlacements(npc);
    }));
    card.appendChild(sizeFields);

    // Facing dropdown
    const facingField = document.createElement('div');
    facingField.className = 'creator-field';
    facingField.style.cssText = 'margin-top:6px;';

    const facingLabel = document.createElement('label');
    facingLabel.className = 'creator-field__label';
    facingLabel.textContent = 'Facing';
    facingField.appendChild(facingLabel);

    const facingSelect = document.createElement('select');
    facingSelect.className = 'creator-select';
    for (const dir of ['left', 'right']) {
      const option = document.createElement('option');
      option.value = dir;
      option.textContent = dir;
      if (placement.facing === dir) option.selected = true;
      facingSelect.appendChild(option);
    }
    facingSelect.addEventListener('change', () => {
      placement.facing = facingSelect.value;
      this._updatePlacements(npc);
    });
    facingField.appendChild(facingSelect);
    card.appendChild(facingField);

    // WalkTo: x, y
    const walkLabel = document.createElement('div');
    walkLabel.className = 'creator-field__label';
    walkLabel.textContent = 'Walk To';
    walkLabel.style.cssText = 'margin-top:6px;margin-bottom:4px;';
    card.appendChild(walkLabel);

    const walkFields = document.createElement('div');
    walkFields.className = 'creator-field--coords';
    const walkTo = placement.walkTo || { x: 0, y: 0 };
    walkFields.appendChild(this._createNumberInput('X', walkTo.x, (val) => {
      if (!placement.walkTo) placement.walkTo = { x: 0, y: 0 };
      placement.walkTo.x = val;
      this._updatePlacements(npc);
    }));
    walkFields.appendChild(this._createNumberInput('Y', walkTo.y, (val) => {
      if (!placement.walkTo) placement.walkTo = { x: 0, y: 0 };
      placement.walkTo.y = val;
      this._updatePlacements(npc);
    }));
    card.appendChild(walkFields);

    // Delete placement button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'creator-btn creator-btn--small creator-btn--danger';
    deleteBtn.textContent = 'Remove Placement';
    deleteBtn.style.cssText = 'margin-top:8px;width:100%;';
    deleteBtn.addEventListener('click', () => {
      const updated = [...(npc.placements || [])];
      updated.splice(index, 1);
      this.app.state.updateNpc(npc.id, { placements: updated });
      this.render(leftPanel, rightPanel);
    });
    card.appendChild(deleteBtn);

    return card;
  }

  _updatePlacements(npc) {
    this.app.state.updateNpc(npc.id, { placements: [...(npc.placements || [])] });
  }

  // ==========================================================================
  // Responses section (per-verb, like HotspotEditor)
  // ==========================================================================

  _appendResponsesSection(container, npc) {
    const section = document.createElement('div');
    section.className = 'creator-form-section';

    const header = document.createElement('div');
    header.className = 'creator-collapse__header';
    header.innerHTML = `
      <span class="creator-collapse__arrow">&#9654;</span>
      <span>Responses</span>
    `;
    section.appendChild(header);

    const body = document.createElement('div');
    body.className = 'creator-collapse__body';
    body.style.display = 'none';

    const responses = npc.responses || {};
    const verbs = this.app.state.game.verbs;

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
        const updated = { ...(npc.responses || {}) };
        if (input.value.trim()) {
          updated[verb.id] = input.value;
        } else {
          delete updated[verb.id];
        }
        this.app.state.updateNpc(npc.id, { responses: updated });
      });
      field.appendChild(input);
      body.appendChild(field);
    }

    section.appendChild(body);

    header.addEventListener('click', () => {
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      header.querySelector('.creator-collapse__arrow').textContent = isOpen ? '\u25B6' : '\u25BC';
      section.classList.toggle('creator-collapse--open', !isOpen);
    });

    container.appendChild(section);
  }

  // ==========================================================================
  // Shared helpers
  // ==========================================================================

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

  _esc(str) {
    return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
