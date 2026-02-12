/**
 * DragResize.js — Draggable panel divider system for the Game Creator.
 *
 * Creates thin resize handles between panels that update CSS custom properties
 * on mousedown → mousemove → mouseup. Supports horizontal (column) resizing.
 */

export class DragResize {
  /**
   * @param {HTMLElement} container  The .creator-app root element
   * @param {Array<{cssVar: string, min: number, max: number, selector: string, side: string}>} handles
   *   Each entry defines a resize handle:
   *   - cssVar:   CSS custom property to update (e.g. '--left-panel-width')
   *   - min/max:  Pixel constraints
   *   - selector: CSS selector for the panel element the handle attaches to
   *   - side:     'right' or 'left' — which edge of the panel the handle sits on
   */
  constructor(container, handles) {
    this.container = container;
    this.handles = handles;
    this._activeHandle = null;
    this._startX = 0;
    this._startWidth = 0;
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._els = [];

    this._create();
  }

  _create() {
    for (const cfg of this.handles) {
      const panel = this.container.querySelector(cfg.selector);
      if (!panel) continue;

      const handle = document.createElement('div');
      handle.className = 'creator-resize-handle creator-resize-handle--horizontal';
      handle.style.position = 'absolute';
      handle.style.top = '0';
      handle.style.bottom = '0';
      handle.style.width = '5px';
      handle.style.zIndex = '50';

      // Position the handle on the correct edge of the panel
      if (cfg.side === 'right') {
        handle.style.right = '-3px';
      } else {
        handle.style.left = '-3px';
      }

      panel.style.position = 'relative';
      panel.appendChild(handle);

      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this._activeHandle = cfg;
        this._startX = e.clientX;
        const current = parseInt(
          getComputedStyle(this.container).getPropertyValue(cfg.cssVar), 10
        );
        this._startWidth = current || cfg.min;
        document.addEventListener('mousemove', this._onMouseMove);
        document.addEventListener('mouseup', this._onMouseUp);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      });

      this._els.push(handle);
    }
  }

  _onMouseMove(e) {
    if (!this._activeHandle) return;
    const cfg = this._activeHandle;
    const dx = e.clientX - this._startX;
    // For 'right' side handles, dragging right increases width
    // For 'left' side handles, dragging left increases width
    const direction = cfg.side === 'right' ? 1 : -1;
    const newWidth = Math.round(
      Math.min(cfg.max, Math.max(cfg.min, this._startWidth + dx * direction))
    );
    this.container.style.setProperty(cfg.cssVar, newWidth + 'px');
  }

  _onMouseUp() {
    this._activeHandle = null;
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  destroy() {
    for (const el of this._els) {
      el.remove();
    }
    this._els = [];
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
  }
}
