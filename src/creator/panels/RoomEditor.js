import { TemplatePicker } from './TemplatePicker.js';
import { ParameterPanel } from './ParameterPanel.js';
import { PalettePicker } from './PalettePicker.js';
import { HotspotEditor } from './HotspotEditor.js';
import { ExitEditor } from './ExitEditor.js';
import { WalkableAreaEditor } from './WalkableAreaEditor.js';
import { PropPlacer } from './PropPlacer.js';
import { CanvasOverlay } from '../CanvasOverlay.js';
import { TemplateRegistry } from '../../engine/TemplateRegistry.js';

const MODES = [
  { id: 'info',      label: 'Info' },
  { id: 'hotspots',  label: 'Hotspots' },
  { id: 'exits',     label: 'Exits' },
  { id: 'walkable',  label: 'Walkable' },
  { id: 'props',     label: 'Props' },
];

export class RoomEditor {
  constructor(app) {
    this.app = app;
    this.selectedRoomId = null;
    this.editMode = 'info';

    // Sub-editors
    this.templatePicker = new TemplatePicker(app);
    this.paramPanel = new ParameterPanel(app);
    this.palettePicker = new PalettePicker(app);
    this.hotspotEditor = new HotspotEditor(app);
    this.exitEditor = new ExitEditor(app);
    this.walkableEditor = new WalkableAreaEditor(app);
    this.propPlacer = new PropPlacer(app);

    // Canvas overlay (initialized lazily when canvas wrapper is available)
    this.overlay = null;
    this._leftPanel = null;
    this._rightPanel = null;
  }

  render(leftPanel, rightPanel) {
    this._leftPanel = leftPanel;
    this._rightPanel = rightPanel;

    // --- Left panel: room list ---
    leftPanel.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'creator-left-panel__header';
    header.innerHTML = `
      <span class="creator-left-panel__title">Rooms</span>
      <button class="creator-left-panel__add-btn" id="add-room-btn">+</button>
    `;
    leftPanel.appendChild(header);

    const list = document.createElement('div');
    list.className = 'creator-left-panel__list';

    for (const room of this.app.state.rooms) {
      const item = document.createElement('div');
      item.className = 'creator-card';
      if (room.id === this.selectedRoomId) item.classList.add('creator-card--active');

      const isStart = room.id === this.app.state.game.startRoom;
      item.innerHTML = `
        <div class="creator-card__info">
          <div class="creator-card__name">${room.name || room.id}${isStart ? ' <span class="creator-badge creator-badge--accent" style="margin-left:4px;font-size:7px;">START</span>' : ''}</div>
          <div class="creator-card__desc">${room.background?.template || 'No template'}</div>
        </div>
      `;

      item.addEventListener('click', () => {
        this.selectedRoomId = room.id;
        this._renderRight();
        this._renderLeft();
        this._updatePreview();
        this._syncOverlay();
      });

      // Context menu for room management
      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this._showRoomContextMenu(e, room);
      });

      list.appendChild(item);
    }

    if (!this.app.state.rooms.length) {
      list.innerHTML = '<div class="creator-empty"><span class="creator-empty__text">No rooms</span><span class="creator-empty__hint">Click + to add one</span></div>';
    }

    leftPanel.appendChild(list);

    leftPanel.querySelector('#add-room-btn').addEventListener('click', () => {
      let id = 'room_' + (this.app.state.rooms.length + 1);
      while (this.app.state.getRoom(id)) {
        id = 'room_' + Date.now();
      }
      this.app.state.addRoom({
        id,
        name: 'New Room',
        description: '',
        background: { template: null, params: {}, palette: null, paletteOverrides: {} },
        lighting: { ambient: { color: '#000000', intensity: 0 }, lights: [] },
        walkableArea: { rects: [{ x: 20, y: 80, width: 280, height: 60 }] },
        hotspots: [],
        exits: [],
        visuals: [],
      });
      this.selectedRoomId = id;
      this._renderLeft();
      this._renderRight();
    });

    // --- Right panel ---
    this._renderRight();
  }

  _renderLeft() {
    if (this._leftPanel && this._rightPanel) {
      // Re-render just the left panel list part
      this.render(this._leftPanel, this._rightPanel);
    }
  }

  _renderRight() {
    const rightPanel = this._rightPanel;
    if (!rightPanel) return;
    rightPanel.innerHTML = '';

    if (!this.selectedRoomId) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'creator-empty';
      emptyDiv.innerHTML = `
        <span class="creator-empty__icon">&#x1f3e0;</span>
        <span class="creator-empty__text">No room selected</span>
        <span class="creator-empty__hint">Select a room from the list, or create your first one.</span>
      `;
      if (!this.app.state.rooms.length) {
        const createBtn = document.createElement('button');
        createBtn.className = 'creator-btn creator-btn--primary creator-btn--small';
        createBtn.textContent = 'Create your first room';
        createBtn.style.marginTop = '12px';
        createBtn.addEventListener('click', () => {
          this._leftPanel.querySelector('#add-room-btn').click();
        });
        emptyDiv.appendChild(createBtn);
      }
      rightPanel.appendChild(emptyDiv);
      return;
    }

    const room = this.app.state.getRoom(this.selectedRoomId);
    if (!room) return;

    const body = document.createElement('div');
    body.style.cssText = 'padding:0;overflow-y:auto;height:100%;';

    // Mode toolbar
    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'display:flex;gap:2px;padding:8px 10px;border-bottom:1px solid var(--color-border);flex-shrink:0;flex-wrap:wrap;';
    for (const mode of MODES) {
      const btn = document.createElement('button');
      btn.className = 'creator-btn creator-btn--small';
      if (mode.id === this.editMode) btn.classList.add('creator-btn--primary');
      btn.textContent = mode.label;
      btn.addEventListener('click', () => {
        this.editMode = mode.id;
        this._renderRight();
        this._syncOverlayMode();
      });
      toolbar.appendChild(btn);
    }
    body.appendChild(toolbar);

    // Mode hint line
    const hints = {
      info: 'Configure room template, palette, and background parameters',
      hotspots: 'Interactive objects \u2014 things players can look at, pick up, or use',
      exits: 'Doorways connecting this room to other rooms',
      walkable: 'Floor areas where the player character can walk',
      props: 'Decorative scene elements from the setting catalog',
    };
    const hint = document.createElement('div');
    hint.className = 'creator-hint';
    hint.style.cssText = 'padding:4px 10px 8px;border-bottom:1px solid var(--color-border);';
    hint.textContent = hints[this.editMode] || '';
    body.appendChild(hint);

    // Content area
    const content = document.createElement('div');
    content.style.cssText = 'padding:12px 14px;';
    body.appendChild(content);

    switch (this.editMode) {
      case 'info':
        this._renderInfoMode(content, room);
        break;
      case 'hotspots':
        this.hotspotEditor.render(content, this.selectedRoomId, (index) => {
          if (this.overlay) this.overlay.onRectSelected && this.overlay.setRects('hotspot', room.hotspots || []);
        });
        break;
      case 'exits':
        this.exitEditor.render(content, this.selectedRoomId, (index) => {
          if (this.overlay) this.overlay.setRects('exit', room.exits || []);
        });
        break;
      case 'walkable':
        this.walkableEditor.render(content, this.selectedRoomId, (index) => {
          if (this.overlay) this.overlay.setRects('walkable', room.walkableArea?.rects || []);
        });
        break;
      case 'props':
        this.propPlacer.render(content, this.selectedRoomId, (index) => {
          // When a prop is selected in the list, deselect brush
          if (this.overlay && index !== null) {
            this.overlay.setMode('select');
          } else if (this.overlay) {
            this.overlay.setMode('placeProp');
          }
        });
        break;
    }

    rightPanel.appendChild(body);
    this._updatePreview();
    this._initOverlay();
    this._syncOverlay();
  }

  _renderInfoMode(container, room) {
    container.innerHTML = `
      <div class="creator-form-section">
        <div class="creator-form-section__title">Room Info</div>
        <div class="creator-field">
          <label class="creator-field__label">Name</label>
          <input class="creator-input" id="room-name" value="${this._esc(room.name || '')}" />
        </div>
        <div class="creator-field">
          <label class="creator-field__label">Description</label>
          <input class="creator-input" id="room-desc" value="${this._esc(room.description || '')}" />
        </div>
      </div>
      <div class="creator-form-section">
        <div class="creator-form-section__title">Template</div>
        <div id="template-picker-area"></div>
      </div>
      <div class="creator-form-section">
        <div class="creator-form-section__title">Parameters</div>
        <div id="param-panel-area"></div>
      </div>
      <div class="creator-form-section">
        <div class="creator-form-section__title">Palette</div>
        <div id="palette-picker-area"></div>
      </div>
    `;

    container.querySelector('#room-name').addEventListener('change', (e) => {
      this.app.state.updateRoom(this.selectedRoomId, { name: e.target.value });
      this._renderLeft();
    });
    container.querySelector('#room-desc').addEventListener('change', (e) => {
      this.app.state.updateRoom(this.selectedRoomId, { description: e.target.value });
    });

    // Template picker
    this.templatePicker.render(
      container.querySelector('#template-picker-area'),
      this.app.state.game.setting,
      room.background.template,
      (templateId) => {
        const meta = TemplateRegistry.getMetadata(templateId);
        this.app.state.updateRoom(this.selectedRoomId, {
          background: { ...room.background, template: templateId, palette: meta.palette },
        });
        this._renderRight();
        this._updatePreview();
      }
    );

    // Parameter panel
    if (room.background.template) {
      this.paramPanel.render(
        container.querySelector('#param-panel-area'),
        room.background.template,
        room.background.params || {},
        (newParams) => {
          this.app.state.updateRoom(this.selectedRoomId, {
            background: { ...room.background, params: newParams },
          });
          this._updatePreview();
        }
      );

      // Palette picker
      const meta = TemplateRegistry.getMetadata(room.background.template);
      const paletteId = room.background.palette || (meta && meta.palette);
      const basePalette = paletteId ? this.app.preview.paletteRegistry.get(paletteId) : null;
      if (basePalette) {
        this.palettePicker.render(
          container.querySelector('#palette-picker-area'),
          basePalette,
          room.background.paletteOverrides || {},
          (newOverrides) => {
            this.app.state.updateRoom(this.selectedRoomId, {
              background: { ...room.background, paletteOverrides: newOverrides },
            });
            this._updatePreview();
          }
        );
      } else {
        container.querySelector('#palette-picker-area').innerHTML = '<span style="font-size:11px;color:var(--color-muted);">No palette available.</span>';
      }
    } else {
      container.querySelector('#param-panel-area').innerHTML = '<span class="creator-hint">Choose a template above to see its options</span>';
      container.querySelector('#palette-picker-area').innerHTML = '<span class="creator-hint">Choose a template to customize its colors</span>';
    }
  }

  _initOverlay() {
    if (this.overlay) return;
    const wrapper = this.app.preview && this.app.preview.wrapper;
    if (!wrapper) return;

    this.overlay = new CanvasOverlay(wrapper);

    this.overlay.onRectCreated = (type, rect) => {
      const room = this.app.state.getRoom(this.selectedRoomId);
      if (!room) return;
      if (type === 'hotspot') {
        const hotspots = [...(room.hotspots || []), {
          id: 'hotspot_' + Date.now(),
          name: 'New Hotspot',
          rect,
          walkTo: { x: rect.x + Math.floor(rect.width / 2), y: rect.y + rect.height },
          visible: true,
          responses: {},
        }];
        this.app.state.updateRoom(this.selectedRoomId, { hotspots });
      } else if (type === 'exit') {
        const exits = [...(room.exits || []), {
          id: 'exit_' + Date.now(),
          name: 'New Exit',
          rect,
          target: null,
          spawnAt: { x: 160, y: 120 },
          walkTo: { x: rect.x + Math.floor(rect.width / 2), y: rect.y + rect.height },
          lookAt: '',
        }];
        this.app.state.updateRoom(this.selectedRoomId, { exits });
      } else if (type === 'walkable') {
        const rects = [...(room.walkableArea?.rects || []), rect];
        this.app.state.updateRoom(this.selectedRoomId, { walkableArea: { rects } });
      }
      this._renderRight();
    };

    this.overlay.onRectMoved = (type, index, rect) => {
      this._updateRectInRoom(type, index, rect);
    };

    this.overlay.onRectResized = (type, index, rect) => {
      this._updateRectInRoom(type, index, rect);
    };

    this.overlay.onRectDeleted = (type, index) => {
      const room = this.app.state.getRoom(this.selectedRoomId);
      if (!room) return;
      if (type === 'hotspot') {
        const hotspots = [...room.hotspots];
        hotspots.splice(index, 1);
        this.app.state.updateRoom(this.selectedRoomId, { hotspots });
      } else if (type === 'exit') {
        const exits = [...room.exits];
        exits.splice(index, 1);
        this.app.state.updateRoom(this.selectedRoomId, { exits });
      } else if (type === 'walkable') {
        const rects = [...(room.walkableArea?.rects || [])];
        rects.splice(index, 1);
        this.app.state.updateRoom(this.selectedRoomId, { walkableArea: { rects } });
      }
      this._renderRight();
    };

    this.overlay.onPropPlaced = (x, y) => {
      const brush = this.propPlacer.getActiveBrush();
      if (!brush) return;
      const room = this.app.state.getRoom(this.selectedRoomId);
      if (!room) return;
      const visuals = [...(room.visuals || []), { type: brush, x, y }];
      this.app.state.updateRoom(this.selectedRoomId, { visuals });
      this._renderRight();
    };

    this.overlay.onNpcPlaced = (x, y) => {
      const npcEditor = this.app._panels.npcs;
      if (!npcEditor || !npcEditor._pendingPlacement) return;

      npcEditor.applyPlacement(x, y);
      this.overlay.setMode('select');
    };
  }

  _updateRectInRoom(type, index, rect) {
    const room = this.app.state.getRoom(this.selectedRoomId);
    if (!room) return;
    if (type === 'hotspot' && room.hotspots[index]) {
      const hotspots = [...room.hotspots];
      hotspots[index] = { ...hotspots[index], rect };
      this.app.state.updateRoom(this.selectedRoomId, { hotspots });
    } else if (type === 'exit' && room.exits[index]) {
      const exits = [...room.exits];
      exits[index] = { ...exits[index], rect };
      this.app.state.updateRoom(this.selectedRoomId, { exits });
    } else if (type === 'walkable') {
      const rects = [...(room.walkableArea?.rects || [])];
      rects[index] = rect;
      this.app.state.updateRoom(this.selectedRoomId, { walkableArea: { rects } });
    }
  }

  _syncOverlayMode() {
    if (!this.overlay) return;
    const modeMap = {
      info: 'select',
      hotspots: 'drawHotspot',
      exits: 'drawExit',
      walkable: 'drawWalkable',
      props: 'placeProp',
    };
    this.overlay.setMode(modeMap[this.editMode] || 'select');
    this._syncOverlay();
  }

  _syncOverlay() {
    if (!this.overlay || !this.selectedRoomId) return;
    const room = this.app.state.getRoom(this.selectedRoomId);
    if (!room) return;

    // Update overlay rects from room data
    this.overlay.setRects('hotspot', (room.hotspots || []).map(h => h.rect));
    this.overlay.setRects('exit', (room.exits || []).map(e => e.rect));
    this.overlay.setRects('walkable', room.walkableArea?.rects || []);

    // Show relevant overlay types based on edit mode
    this.overlay.setVisible('hotspot', this.editMode === 'hotspots' || this.editMode === 'info');
    this.overlay.setVisible('exit', this.editMode === 'exits' || this.editMode === 'info');
    this.overlay.setVisible('walkable', this.editMode === 'walkable' || this.editMode === 'info');
  }

  _showRoomContextMenu(e, room) {
    // Remove any existing context menu
    const existing = document.querySelector('.creator-context-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.className = 'creator-context-menu';
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';

    const isStart = room.id === this.app.state.game.startRoom;

    const items = [
      { label: isStart ? 'Start Room' : 'Set as Start', action: () => {
        this.app.state.updateGameMeta({ startRoom: room.id });
        this._renderLeft();
      }, disabled: isStart },
      { label: 'Duplicate', action: () => {
        const clone = JSON.parse(JSON.stringify(room));
        clone.id = room.id + '_copy';
        clone.name = room.name + ' (Copy)';
        this.app.state.addRoom(clone);
        this.selectedRoomId = clone.id;
        this._renderLeft();
        this._renderRight();
      }},
      { label: 'Delete', danger: true, action: () => {
        this.app.state.removeRoom(room.id);
        if (this.selectedRoomId === room.id) {
          this.selectedRoomId = this.app.state.rooms.length ? this.app.state.rooms[0].id : null;
        }
        this._renderLeft();
        this._renderRight();
      }},
    ];

    for (const item of items) {
      const el = document.createElement('div');
      el.className = 'creator-context-menu__item';
      if (item.danger) el.classList.add('creator-context-menu__item--danger');
      if (item.disabled) el.style.opacity = '0.4';
      el.textContent = item.label;
      if (!item.disabled) {
        el.addEventListener('click', () => {
          menu.remove();
          item.action();
        });
      }
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

  _updatePreview() {
    if (!this.selectedRoomId) return;
    const room = this.app.state.getRoom(this.selectedRoomId);
    if (room) this.app.preview.renderRoom(room);
  }

  _esc(str) {
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }
}
