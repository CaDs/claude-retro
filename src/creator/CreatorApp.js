/**
 * CreatorApp.js — Main orchestrator for the Game Creator application.
 *
 * Builds DOM structure matching creator.css class names, initializes state
 * and subsystems, manages tab navigation, and wires up reactive re-rendering.
 *
 * Layout: 4-column grid — left | canvas | right | yaml
 * Three draggable dividers between columns.
 */

import { registerAllTemplates } from '../templates/index.js';
import { settings } from '../settings/index.js';
import { CreatorState } from './CreatorState.js';
import { PreviewCanvas } from './PreviewCanvas.js';
import { DragResize } from './DragResize.js';
import { SettingSelector } from './panels/SettingSelector.js';
import { RoomEditor } from './panels/RoomEditor.js';
import { NpcEditor } from './panels/NpcEditor.js';
import { DialogueEditor } from './panels/DialogueEditor.js';
import { ItemEditor } from './panels/ItemEditor.js';
import { PuzzleEditor } from './panels/PuzzleEditor.js';
import { ExportPanel } from './panels/ExportPanel.js';
import { YamlPreview } from './panels/YamlPreview.js';

const TABS = [
  { id: 'settings', label: 'Settings',  requiresSetting: false },
  { id: 'rooms',    label: 'Rooms',     requiresSetting: true  },
  { id: 'npcs',      label: 'NPCs',       requiresSetting: true  },
  { id: 'dialogues', label: 'Dialogues', requiresSetting: true  },
  { id: 'items',     label: 'Items',     requiresSetting: true  },
  { id: 'puzzles',   label: 'Puzzles',   requiresSetting: true  },
  { id: 'export',    label: 'Export',    requiresSetting: true  },
];

class CreatorApp {
  constructor() {
    this.state = new CreatorState();
    this.root = document.getElementById('creator-root');
    this.activeTab = 'settings';
    this.preview = null;
    this._panels = {};
    this._renderScheduled = false;
    this._dragResize = null;
  }

  init() {
    if (!this.root) {
      console.error('[CreatorApp] No #creator-root element found.');
      return;
    }

    registerAllTemplates();

    this._buildLayout();
    this.preview = new PreviewCanvas(this.root.querySelector('.creator-canvas-area'));

    // Pre-register all setting palettes so templates can resolve them immediately
    for (const setting of Object.values(settings)) {
      for (const [id, palette] of Object.entries(setting.palettes)) {
        this.preview.paletteRegistry.register(id, palette);
      }
    }

    this._panels = {
      settings:  new SettingSelector(this),
      rooms:     new RoomEditor(this),
      npcs:      new NpcEditor(this),
      dialogues: new DialogueEditor(this),
      items:     new ItemEditor(this),
      puzzles:   new PuzzleEditor(this),
      export:    new ExportPanel(this),
      yaml:      new YamlPreview(this),
    };

    // Set up draggable dividers between panels
    this._dragResize = new DragResize(this.root, [
      { cssVar: '--left-panel-width',  min: 140, max: 350, selector: '.creator-left-panel',  side: 'right' },
      { cssVar: '--right-panel-width', min: 200, max: 400, selector: '.creator-right-panel', side: 'left'  },
      { cssVar: '--yaml-panel-width',  min: 180, max: 500, selector: '.creator-yaml-panel',  side: 'left'  },
    ]);

    this.state.onChange(() => this._onStateChange());

    // Restore session if available
    const restored = this.state.loadFromLocalStorage();
    if (restored && this.state.game.setting) {
      console.log('[CreatorApp] Restored session from localStorage');
    }

    this._renderTab();
  }

  _buildLayout() {
    const tabButtons = TABS.map(t => {
      const cls = ['creator-tab'];
      if (t.id === this.activeTab) cls.push('creator-tab--active');
      const disabled = t.requiresSetting ? 'disabled' : '';
      return `<button class="${cls.join(' ')}" data-tab="${t.id}" ${disabled}>${t.label}</button>`;
    }).join('');

    this.root.className = 'creator-app';
    this.root.innerHTML = `
      <header class="creator-header">
        <span class="creator-header__logo">Game Creator</span>
        <nav class="creator-tabs">${tabButtons}</nav>
        <button class="creator-btn creator-btn--small creator-header__new-btn" id="new-game-btn">New Game</button>
      </header>
      <aside class="creator-left-panel">
        <div class="creator-left-panel__body"></div>
      </aside>
      <section class="creator-canvas-area"></section>
      <aside class="creator-right-panel">
        <div class="creator-right-panel__body"></div>
      </aside>
      <aside class="creator-yaml-panel">
        <div class="creator-yaml-panel__header">
          <span class="creator-yaml-panel__title">YAML Preview</span>
        </div>
        <div class="creator-yaml-preview"></div>
      </aside>
    `;

    this.root.querySelector('.creator-tabs').addEventListener('click', (e) => {
      const btn = e.target.closest('.creator-tab');
      if (!btn || btn.disabled) return;
      this.setTab(btn.dataset.tab);
    });

    this.root.querySelector('#new-game-btn').addEventListener('click', () => {
      if (!confirm('Start a new game? All unsaved progress will be lost.')) return;
      CreatorState.clearSavedSession();
      window.location.reload();
    });
  }

  setTab(tab) {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    for (const btn of this.root.querySelectorAll('.creator-tab')) {
      btn.classList.toggle('creator-tab--active', btn.dataset.tab === tab);
    }
    this._renderTab();
  }

  _renderTab() {
    const left = this.root.querySelector('.creator-left-panel__body');
    const right = this.root.querySelector('.creator-right-panel__body');
    const canvasArea = this.root.querySelector('.creator-canvas-area');

    left.innerHTML = '';
    right.innerHTML = '';

    // Show/hide canvas vs full-area content
    const leftPanel = this.root.querySelector('.creator-left-panel');
    const rightPanel = this.root.querySelector('.creator-right-panel');
    const yamlPanel = this.root.querySelector('.creator-yaml-panel');

    switch (this.activeTab) {
      case 'settings':
        // Settings uses full canvas area for the card grid, hide side panels but keep YAML
        leftPanel.style.display = 'none';
        rightPanel.style.display = 'none';
        yamlPanel.style.display = '';
        if (this._panels.settings) this._panels.settings.render(canvasArea);
        break;

      case 'rooms':
        leftPanel.style.display = '';
        rightPanel.style.display = '';
        yamlPanel.style.display = '';
        // Restore canvas if settings page replaced it
        this._ensureCanvas(canvasArea);
        if (this._panels.rooms) this._panels.rooms.render(left, right);
        break;

      case 'npcs':
        leftPanel.style.display = '';
        rightPanel.style.display = '';
        yamlPanel.style.display = '';
        this._ensureCanvas(canvasArea);
        if (this._panels.npcs) this._panels.npcs.render(left, right);
        break;

      case 'dialogues':
        leftPanel.style.display = '';
        rightPanel.style.display = '';
        yamlPanel.style.display = '';
        this._ensureCanvas(canvasArea);
        if (this._panels.dialogues) this._panels.dialogues.render(left, right);
        break;

      case 'items':
        leftPanel.style.display = '';
        rightPanel.style.display = '';
        yamlPanel.style.display = '';
        this._ensureCanvas(canvasArea);
        if (this._panels.items) this._panels.items.render(left, right);
        break;

      case 'puzzles':
        leftPanel.style.display = '';
        rightPanel.style.display = '';
        yamlPanel.style.display = '';
        this._ensureCanvas(canvasArea);
        if (this._panels.puzzles) this._panels.puzzles.render(left, right);
        break;

      case 'export':
        leftPanel.style.display = '';
        rightPanel.style.display = '';
        yamlPanel.style.display = '';
        this._ensureCanvas(canvasArea);
        if (this._panels.export) this._panels.export.render(left, right);
        break;

      default:
        leftPanel.style.display = '';
        rightPanel.style.display = '';
        yamlPanel.style.display = '';
        this._ensureCanvas(canvasArea);
        left.innerHTML = `<div class="creator-empty"><span class="creator-empty__text">${this.activeTab} editor</span><span class="creator-empty__hint">Coming soon</span></div>`;
        break;
    }

    // Always render YAML preview
    const yamlContainer = this.root.querySelector('.creator-yaml-preview');
    if (yamlContainer && this._panels.yaml) {
      this._panels.yaml.render(yamlContainer);
    }
  }

  /** Ensure the canvas element is in the canvas area (settings page may have replaced it) */
  _ensureCanvas(canvasArea) {
    if (this.preview && !canvasArea.contains(this.preview.wrapper)) {
      canvasArea.innerHTML = '';
      canvasArea.appendChild(this.preview.wrapper);
    }
  }

  _onStateChange() {
    this._syncTabStates();
    if (!this._renderScheduled) {
      this._renderScheduled = true;
      queueMicrotask(() => {
        this._renderScheduled = false;
        this._renderTab();
      });
    }
  }

  _syncTabStates() {
    const hasSetting = !!this.state.game.setting;
    for (const btn of this.root.querySelectorAll('.creator-tab')) {
      const tabDef = TABS.find(t => t.id === btn.dataset.tab);
      if (tabDef && tabDef.requiresSetting) {
        btn.disabled = !hasSetting;
      }
    }
  }
}

const app = new CreatorApp();
app.init();
