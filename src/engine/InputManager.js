/**
 * InputManager — Handles mouse input, maps to internal resolution, provides hit-testing.
 */
export class InputManager {
  constructor(canvas, internalWidth, internalHeight) {
    this.canvas = canvas;
    this.internalWidth = internalWidth;
    this.internalHeight = internalHeight;

    // Current state
    this.mouseX = 0;
    this.mouseY = 0;
    this.clicked = false;
    this.clickX = 0;
    this.clickY = 0;
    this.rightClicked = false;
    this.hoveredObject = null;

    // Escape key
    this.escapePressed = false;
    this._pendingEscape = false;

    // Event queue for this frame
    this._pendingClicks = [];
    this._pendingRightClicks = [];

    this._bindEvents();
  }

  _bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.internalWidth / rect.width;
      const scaleY = this.internalHeight / rect.height;
      this.mouseX = Math.floor((e.clientX - rect.left) * scaleX);
      this.mouseY = Math.floor((e.clientY - rect.top) * scaleY);
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.internalWidth / rect.width;
      const scaleY = this.internalHeight / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);
      this._pendingClicks.push({ x, y });
    });

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.internalWidth / rect.width;
      const scaleY = this.internalHeight / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);
      this._pendingRightClicks.push({ x, y });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this._pendingEscape = true;
      }
    });
  }

  /**
   * Called once per frame to consume pending events.
   */
  update() {
    this.clicked = false;
    this.rightClicked = false;
    this.escapePressed = false;

    if (this._pendingEscape) {
      this.escapePressed = true;
      this._pendingEscape = false;
    }

    if (this._pendingClicks.length > 0) {
      const click = this._pendingClicks.shift();
      this.clicked = true;
      this.clickX = click.x;
      this.clickY = click.y;
    }

    if (this._pendingRightClicks.length > 0) {
      this._pendingRightClicks.shift();
      this.rightClicked = true;
    }
  }

  /**
   * Check if a point is inside a rectangular region.
   */
  isInRect(x, y, rx, ry, rw, rh) {
    return x >= rx && x < rx + rw && y >= ry && y < ry + rh;
  }

  /**
   * Check if mouse is hovering over a rect.
   */
  isMouseInRect(rx, ry, rw, rh) {
    return this.isInRect(this.mouseX, this.mouseY, rx, ry, rw, rh);
  }

  /**
   * Check if the click was inside a rect.
   */
  isClickInRect(rx, ry, rw, rh) {
    return this.clicked && this.isInRect(this.clickX, this.clickY, rx, ry, rw, rh);
  }

  /**
   * Check if a point is inside a polygon (for walkable areas).
   */
  isPointInPolygon(px, py, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      const intersect = ((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }
}
