/**
 * CanvasOverlay.js — Mouse interaction system for drawing/editing rectangles
 * on a 320x200 pixel-art preview canvas in the game creator tool.
 *
 * Uses DOM divs positioned over the canvas wrapper for visual overlays.
 * All coordinates are translated between screen pixels and the 320x200
 * internal coordinate system via a configurable scale factor.
 */

const RECT_TYPES = ['hotspot', 'exit', 'walkable'];

const TYPE_STYLES = {
  hotspot:  { bg: 'rgba(0, 255, 0, 0.2)',   border: '#00ff00' },
  exit:     { bg: 'rgba(0, 100, 255, 0.2)',  border: '#0064ff' },
  walkable: { bg: 'rgba(0, 200, 255, 0.15)', border: '#00c8ff' },
};

const HANDLE_DIRS = ['nw', 'ne', 'sw', 'se'];

const MIN_RECT_SIZE = 4; // minimum rect dimension in internal coords

export class CanvasOverlay {
  /**
   * @param {HTMLElement} canvasWrapper - The .creator-canvas-wrapper div
   */
  constructor(canvasWrapper) {
    this.wrapper = canvasWrapper;
    this.scale = 3;
    this.mode = 'select';

    // Rect data: { hotspot: [], exit: [], walkable: [] }
    this._rects = { hotspot: [], exit: [], walkable: [] };
    this._npcMarkers = [];
    this._visibility = { hotspot: true, exit: true, walkable: true, npc: true };

    // Selection state
    this._selectedType = null;
    this._selectedIndex = -1;

    // Drag state
    this._dragging = false;
    this._dragAction = null; // 'create' | 'move' | 'resize'
    this._dragHandle = null; // 'nw' | 'ne' | 'sw' | 'se'
    this._dragStart = { x: 0, y: 0 };
    this._dragOrigRect = null;

    // Callbacks
    this.onRectCreated = null;
    this.onRectMoved = null;
    this.onRectResized = null;
    this.onRectSelected = null;
    this.onRectDeleted = null;
    this.onNpcPlaced = null;

    // Create overlay container
    this._overlay = document.createElement('div');
    this._overlay.style.cssText = 'position:absolute;inset:0;pointer-events:auto;overflow:hidden;';
    this.wrapper.style.position = 'relative';
    this.wrapper.appendChild(this._overlay);

    // Bind event handlers
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);

    this._overlay.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('keydown', this._onKeyDown);

    this._rectEls = { hotspot: [], exit: [], walkable: [] };
    this._npcEls = [];
  }

  // --- Public API ---

  setMode(mode) {
    this.mode = mode;
    this._deselect();
    this._updateCursor();
  }

  setRects(type, rects) {
    this._rects[type] = rects.map(r => ({ ...r }));
    this._rebuildType(type);
  }

  setNpcMarkers(markers) {
    this._npcMarkers = markers.map(m => ({ ...m }));
    this._rebuildNpcs();
  }

  setScale(scale) {
    this.scale = scale;
    this._rebuildAll();
  }

  setVisible(type, visible) {
    this._visibility[type] = visible;
    if (type === 'npc') {
      this._npcEls.forEach(el => { el.style.display = visible ? '' : 'none'; });
    } else {
      this._rectEls[type].forEach(el => { el.style.display = visible ? '' : 'none'; });
    }
  }

  destroy() {
    this._overlay.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('keydown', this._onKeyDown);
    this._overlay.remove();
  }

  // --- Coordinate conversion ---

  _screenToInternal(screenX, screenY) {
    const bounds = this._overlay.getBoundingClientRect();
    return {
      x: Math.round((screenX - bounds.left) / this.scale),
      y: Math.round((screenY - bounds.top) / this.scale),
    };
  }

  // --- DOM rebuild ---

  _rebuildAll() {
    for (const type of RECT_TYPES) {
      this._rebuildType(type);
    }
    this._rebuildNpcs();
  }

  _rebuildType(type) {
    // Remove old elements
    this._rectEls[type].forEach(el => el.remove());
    this._rectEls[type] = [];

    const rects = this._rects[type];
    const style = TYPE_STYLES[type];
    const visible = this._visibility[type];

    for (let i = 0; i < rects.length; i++) {
      const el = this._createRectEl(type, i, rects[i], style);
      if (!visible) el.style.display = 'none';
      this._overlay.appendChild(el);
      this._rectEls[type].push(el);
    }
  }

  _createRectEl(type, index, rect, style) {
    const el = document.createElement('div');
    el.className = 'creator-hotspot-rect';
    el.dataset.type = type;
    el.dataset.index = index;

    this._positionRectEl(el, rect, style);

    const isSelected = this._selectedType === type && this._selectedIndex === index;
    if (isSelected) {
      this._applySelectedStyle(el);
    }

    return el;
  }

  _positionRectEl(el, rect, style) {
    const s = this.scale;
    el.style.left = (rect.x * s) + 'px';
    el.style.top = (rect.y * s) + 'px';
    el.style.width = (rect.width * s) + 'px';
    el.style.height = (rect.height * s) + 'px';
    el.style.background = style.bg;
    el.style.borderColor = style.border;
  }

  _applySelectedStyle(el) {
    el.classList.add('creator-hotspot-rect--selected');

    // Add corner resize handles
    for (const dir of HANDLE_DIRS) {
      const handle = document.createElement('div');
      handle.className = `creator-hotspot-rect__handle creator-hotspot-rect__handle--${dir}`;
      handle.dataset.handle = dir;
      el.appendChild(handle);
    }
  }

  _rebuildNpcs() {
    this._npcEls.forEach(el => el.remove());
    this._npcEls = [];

    const visible = this._visibility.npc;

    for (const marker of this._npcMarkers) {
      const el = document.createElement('div');
      const s = this.scale;
      const dotSize = 10;
      el.style.cssText = `
        position:absolute;
        left:${marker.x * s - dotSize / 2}px;
        top:${marker.y * s - dotSize / 2}px;
        width:${dotSize}px;
        height:${dotSize}px;
        background:orange;
        border-radius:50%;
        border:1px solid #fff;
        pointer-events:none;
        z-index:5;
      `;
      if (marker.label) {
        el.title = marker.label;
      }
      if (!visible) el.style.display = 'none';
      this._overlay.appendChild(el);
      this._npcEls.push(el);
    }
  }

  // --- Selection ---

  _select(type, index) {
    if (this._selectedType === type && this._selectedIndex === index) return;
    this._deselect();
    this._selectedType = type;
    this._selectedIndex = index;

    const el = this._rectEls[type][index];
    if (el) this._applySelectedStyle(el);

    if (this.onRectSelected) this.onRectSelected(type, index);
  }

  _deselect() {
    if (this._selectedType !== null && this._selectedIndex >= 0) {
      const el = this._rectEls[this._selectedType]?.[this._selectedIndex];
      if (el) {
        el.classList.remove('creator-hotspot-rect--selected');
        // Remove handle elements
        el.querySelectorAll('.creator-hotspot-rect__handle').forEach(h => h.remove());
      }
      if (this.onRectSelected) this.onRectSelected(null, null);
    }
    this._selectedType = null;
    this._selectedIndex = -1;
  }

  // --- Hit testing ---

  _hitTestHandle(screenX, screenY) {
    if (this._selectedType === null || this._selectedIndex < 0) return null;

    const el = this._rectEls[this._selectedType]?.[this._selectedIndex];
    if (!el) return null;

    const handles = el.querySelectorAll('.creator-hotspot-rect__handle');
    for (const handle of handles) {
      const hb = handle.getBoundingClientRect();
      if (screenX >= hb.left && screenX <= hb.right && screenY >= hb.top && screenY <= hb.bottom) {
        return handle.dataset.handle;
      }
    }
    return null;
  }

  _hitTestRect(internalX, internalY) {
    // Check in reverse draw order (topmost first) across all visible types
    for (let t = RECT_TYPES.length - 1; t >= 0; t--) {
      const type = RECT_TYPES[t];
      if (!this._visibility[type]) continue;

      const rects = this._rects[type];
      for (let i = rects.length - 1; i >= 0; i--) {
        const r = rects[i];
        if (internalX >= r.x && internalX <= r.x + r.width &&
            internalY >= r.y && internalY <= r.y + r.height) {
          return { type, index: i };
        }
      }
    }
    return null;
  }

  // --- Mouse handlers ---

  _onMouseDown(e) {
    if (e.button !== 0) return;
    e.preventDefault();

    const internal = this._screenToInternal(e.clientX, e.clientY);

    // NPC placement mode
    if (this.mode === 'placeNpc') {
      if (this.onNpcPlaced) this.onNpcPlaced(internal.x, internal.y);
      return;
    }

    // Drawing modes
    if (this.mode === 'drawHotspot' || this.mode === 'drawExit' || this.mode === 'drawWalkable') {
      this._dragging = true;
      this._dragAction = 'create';
      this._dragStart = { ...internal };
      this._dragCreateType = this.mode.replace('draw', '').toLowerCase();
      return;
    }

    // Select mode
    if (this.mode === 'select') {
      // Check resize handles first
      const handle = this._hitTestHandle(e.clientX, e.clientY);
      if (handle) {
        this._dragging = true;
        this._dragAction = 'resize';
        this._dragHandle = handle;
        this._dragStart = { ...internal };
        this._dragOrigRect = { ...this._rects[this._selectedType][this._selectedIndex] };
        return;
      }

      // Check rect hit
      const hit = this._hitTestRect(internal.x, internal.y);
      if (hit) {
        this._select(hit.type, hit.index);
        this._dragging = true;
        this._dragAction = 'move';
        this._dragStart = { ...internal };
        this._dragOrigRect = { ...this._rects[hit.type][hit.index] };
        return;
      }

      // Click on empty space: deselect
      this._deselect();
    }
  }

  _onMouseMove(e) {
    if (!this._dragging) return;

    const internal = this._screenToInternal(e.clientX, e.clientY);

    if (this._dragAction === 'create') {
      this._updateCreatePreview(internal);
    } else if (this._dragAction === 'move') {
      this._updateMove(internal);
    } else if (this._dragAction === 'resize') {
      this._updateResize(internal);
    }
  }

  _onMouseUp(e) {
    if (!this._dragging) return;

    const internal = this._screenToInternal(e.clientX, e.clientY);
    this._dragging = false;

    if (this._dragAction === 'create') {
      this._finishCreate(internal);
    } else if (this._dragAction === 'move') {
      this._finishMove();
    } else if (this._dragAction === 'resize') {
      this._finishResize();
    }

    this._dragAction = null;
    this._dragHandle = null;
    this._dragOrigRect = null;
  }

  _onKeyDown(e) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this._selectedType !== null && this._selectedIndex >= 0 && this.mode === 'select') {
        const type = this._selectedType;
        const index = this._selectedIndex;
        this._deselect();
        this._rects[type].splice(index, 1);
        this._rebuildType(type);
        if (this.onRectDeleted) this.onRectDeleted(type, index);
      }
    }

    if (e.key === 'Escape') {
      this._deselect();
    }
  }

  // --- Drag: Create ---

  _updateCreatePreview(internal) {
    const type = this._dragCreateType;
    const style = TYPE_STYLES[type];
    const rect = this._normalizeRect(this._dragStart, internal);

    // Show a temporary preview element
    if (!this._previewEl) {
      this._previewEl = document.createElement('div');
      this._previewEl.className = 'creator-hotspot-rect';
      this._previewEl.style.pointerEvents = 'none';
      this._overlay.appendChild(this._previewEl);
    }
    this._positionRectEl(this._previewEl, rect, style);
  }

  _finishCreate(internal) {
    if (this._previewEl) {
      this._previewEl.remove();
      this._previewEl = null;
    }

    const rect = this._normalizeRect(this._dragStart, internal);
    if (rect.width < MIN_RECT_SIZE || rect.height < MIN_RECT_SIZE) return;

    const type = this._dragCreateType;
    this._rects[type].push({ ...rect });
    this._rebuildType(type);

    if (this.onRectCreated) this.onRectCreated(type, rect);
  }

  // --- Drag: Move ---

  _updateMove(internal) {
    const type = this._selectedType;
    const index = this._selectedIndex;
    const orig = this._dragOrigRect;
    const dx = internal.x - this._dragStart.x;
    const dy = internal.y - this._dragStart.y;

    const rect = this._rects[type][index];
    rect.x = Math.max(0, Math.min(320 - orig.width, orig.x + dx));
    rect.y = Math.max(0, Math.min(200 - orig.height, orig.y + dy));

    const el = this._rectEls[type][index];
    if (el) this._positionRectEl(el, rect, TYPE_STYLES[type]);
  }

  _finishMove() {
    const type = this._selectedType;
    const index = this._selectedIndex;
    if (type === null || index < 0) return;

    const rect = this._rects[type][index];
    if (this.onRectMoved) this.onRectMoved(type, index, { ...rect });
  }

  // --- Drag: Resize ---

  _updateResize(internal) {
    const type = this._selectedType;
    const index = this._selectedIndex;
    const orig = this._dragOrigRect;
    const handle = this._dragHandle;

    let x = orig.x;
    let y = orig.y;
    let w = orig.width;
    let h = orig.height;

    const right = orig.x + orig.width;
    const bottom = orig.y + orig.height;

    if (handle.includes('w')) {
      x = Math.min(internal.x, right - MIN_RECT_SIZE);
      x = Math.max(0, x);
      w = right - x;
    }
    if (handle.includes('e')) {
      w = Math.max(MIN_RECT_SIZE, internal.x - orig.x);
      w = Math.min(320 - x, w);
    }
    if (handle.includes('n')) {
      y = Math.min(internal.y, bottom - MIN_RECT_SIZE);
      y = Math.max(0, y);
      h = bottom - y;
    }
    if (handle.includes('s')) {
      h = Math.max(MIN_RECT_SIZE, internal.y - orig.y);
      h = Math.min(200 - y, h);
    }

    const rect = this._rects[type][index];
    rect.x = x;
    rect.y = y;
    rect.width = w;
    rect.height = h;

    const el = this._rectEls[type][index];
    if (el) this._positionRectEl(el, rect, TYPE_STYLES[type]);
  }

  _finishResize() {
    const type = this._selectedType;
    const index = this._selectedIndex;
    if (type === null || index < 0) return;

    const rect = this._rects[type][index];
    if (this.onRectResized) this.onRectResized(type, index, { ...rect });
  }

  // --- Helpers ---

  _normalizeRect(p1, p2) {
    const x = Math.max(0, Math.min(p1.x, p2.x));
    const y = Math.max(0, Math.min(p1.y, p2.y));
    const x2 = Math.min(320, Math.max(p1.x, p2.x));
    const y2 = Math.min(200, Math.max(p1.y, p2.y));
    return { x, y, width: x2 - x, height: y2 - y };
  }

  _updateCursor() {
    switch (this.mode) {
      case 'drawHotspot':
      case 'drawExit':
      case 'drawWalkable':
        this._overlay.style.cursor = 'crosshair';
        break;
      case 'placeNpc':
        this._overlay.style.cursor = 'cell';
        break;
      default:
        this._overlay.style.cursor = 'default';
        break;
    }
  }
}
