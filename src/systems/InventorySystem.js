/**
 * InventorySystem — Manages the player's inventory and renders the item panel.
 */
export class InventorySystem {
  constructor() {
    this.items = []; // Array of item objects { id, name, icon }
    this.scrollOffset = 0;
    this.maxVisible = 8; // 4 columns × 2 rows
    this.selectedItem = null;

    // Layout — fills the right side of the bottom panel edge-to-edge.
    // Panel area: x=162 → 320 (158px), y=152 → 200 (48px)
    this.x = 162;
    this.y = 152;
    this.cols = 4;
    this.rows = 2;
    this.gap = 2; // gap between slots only (no outer margin)
    this.panelWidth = 158;
    this.panelHeight = 48;

    // Slot sizes calculated to fill the panel exactly
    this.slotWidth = Math.floor((this.panelWidth - (this.cols - 1) * this.gap) / this.cols);
    this.slotHeight = Math.floor((this.panelHeight - (this.rows - 1) * this.gap) / this.rows);
  }

  /** Get the pixel position of a slot by column/row */
  _slotPos(col, row) {
    return {
      sx: this.x + col * (this.slotWidth + this.gap),
      sy: this.y + row * (this.slotHeight + this.gap),
    };
  }

  /**
   * Add an item to inventory.
   */
  addItem(item) {
    if (!this.items.find(i => i.id === item.id)) {
      this.items.push(item);
    }
  }

  /**
   * Remove an item from inventory.
   */
  removeItem(itemId) {
    this.items = this.items.filter(i => i.id !== itemId);
    if (this.selectedItem && this.selectedItem.id === itemId) {
      this.selectedItem = null;
    }
  }

  /**
   * Check if player has an item.
   */
  hasItem(itemId) {
    return this.items.some(i => i.id === itemId);
  }

  /**
   * Get item by ID.
   */
  getItem(itemId) {
    return this.items.find(i => i.id === itemId) || null;
  }

  /**
   * Update inventory interaction.
   */
  update(input, assets) {
    const visible = this.getVisibleItems();
    for (let i = 0; i < visible.length; i++) {
      const { sx, sy } = this._slotPos(i % this.cols, Math.floor(i / this.cols));

      if (input.isClickInRect(sx, sy, this.slotWidth, this.slotHeight)) {
        this.selectedItem = visible[i];
        return visible[i];
      }
    }

    // Scroll arrows
    if (this.items.length > this.maxVisible) {
      // Up arrow
      if (input.isClickInRect(this.x + this.panelWidth - 12, this.y, 12, 12)) {
        this.scrollOffset = Math.max(0, this.scrollOffset - this.cols);
      }
      // Down arrow
      if (input.isClickInRect(this.x + this.panelWidth - 12, this.y + this.panelHeight - 12, 12, 12)) {
        this.scrollOffset = Math.min(
          Math.max(0, this.items.length - this.maxVisible),
          this.scrollOffset + this.cols
        );
      }
    }

    return null;
  }

  /**
   * Get the currently visible items based on scroll offset.
   */
  getVisibleItems() {
    return this.items.slice(this.scrollOffset, this.scrollOffset + this.maxVisible);
  }

  /**
   * Get the item under the mouse cursor.
   */
  getHoveredItem(input) {
    const visible = this.getVisibleItems();
    for (let i = 0; i < visible.length; i++) {
      const { sx, sy } = this._slotPos(i % this.cols, Math.floor(i / this.cols));

      if (input.isMouseInRect(sx, sy, this.slotWidth, this.slotHeight)) {
        return visible[i];
      }
    }
    return null;
  }

  /**
   * Render the inventory panel.
   */
  render(renderer, assets) {
    // Item slots (edge-to-edge, no panel border)
    const visible = this.getVisibleItems();
    for (let i = 0; i < this.maxVisible; i++) {
      const { sx, sy } = this._slotPos(i % this.cols, Math.floor(i / this.cols));

      // Slot background
      const item = visible[i];
      const isSelected = item && this.selectedItem && item.id === this.selectedItem.id;
      renderer.drawRect(sx, sy, this.slotWidth, this.slotHeight,
        isSelected ? '#4a6fa5' : '#0f0f1e');
      renderer.drawRectOutline(sx, sy, this.slotWidth, this.slotHeight,
        isSelected ? '#7a9fd5' : '#2a2a45');

      // Item icon
      if (item) {
        const icon = assets.get(`item_${item.id}`);
        if (icon) {
          renderer.drawImage(icon, sx + 2, sy + 2, this.slotWidth - 4, this.slotHeight - 4);
        } else {
          // Fallback: draw item name abbreviation
          renderer.drawText(item.name.substring(0, 4), sx + 2, sy + 8, {
            size: 6, color: '#888', shadow: false
          });
        }
      }
    }

    // Scroll indicators
    if (this.items.length > this.maxVisible) {
      if (this.scrollOffset > 0) {
        renderer.drawText('▲', this.x + this.panelWidth - 10, this.y + 2, {
          size: 7, color: '#888', shadow: false
        });
      }
      if (this.scrollOffset + this.maxVisible < this.items.length) {
        renderer.drawText('▼', this.x + this.panelWidth - 10, this.y + this.panelHeight - 10, {
          size: 7, color: '#888', shadow: false
        });
      }
    }
  }
}
