/**
 * VerbSystem — The classic 9-verb action bar.
 * Renders the verb grid and tracks the currently selected verb.
 */
export class VerbSystem {
  constructor() {
    this.verbs = [
      'Give',    'Open',    'Close',
      'Pick up', 'Look at', 'Talk to',
      'Use',     'Push',    'Pull',
    ];
    this.selectedVerb = 'Look at'; // Default verb
    this.selectedItem = null; // For "Use X with Y" style actions
    this.actionText = '';

    // Layout config (positioned in bottom panel)
    this.x = 2;
    this.y = 152;
    this.verbWidth = 51;
    this.verbHeight = 11;
    this.cols = 3;
    this.padding = 1;
  }

  /**
   * Update verb selection based on input.
   */
  update(input) {
    for (let i = 0; i < this.verbs.length; i++) {
      const col = i % this.cols;
      const row = Math.floor(i / this.cols);
      const vx = this.x + col * (this.verbWidth + this.padding);
      const vy = this.y + row * (this.verbHeight + this.padding);

      if (input.isClickInRect(vx, vy, this.verbWidth, this.verbHeight)) {
        this.selectedVerb = this.verbs[i];
        this.selectedItem = null; // Reset item selection
        return true;
      }
    }
    return false;
  }

  /**
   * Build action text based on current state.
   */
  buildActionText(hoveredName) {
    let text = this.selectedVerb;
    if (this.selectedItem) {
      text += ` ${this.selectedItem.name}`;
      if (hoveredName && hoveredName !== this.selectedItem.name) {
        text += ` with ${hoveredName}`;
      }
    } else if (hoveredName) {
      text += ` ${hoveredName}`;
    }
    this.actionText = text;
    return text;
  }

  /**
   * Render the verb bar.
   */
  render(renderer) {
    // Background panel
    renderer.drawRect(0, 148, 160, 52, '#1a1a2e');
    renderer.drawRectOutline(0, 148, 160, 52, '#3a3a5e');

    // Action text line
    renderer.drawRect(0, 140, 320, 11, '#12121e');
    renderer.drawTextHiRes(this.actionText, 4, 142, {
      color: '#e0c088', size: 8
    });

    // Verb buttons
    for (let i = 0; i < this.verbs.length; i++) {
      const col = i % this.cols;
      const row = Math.floor(i / this.cols);
      const vx = this.x + col * (this.verbWidth + this.padding);
      const vy = this.y + row * (this.verbHeight + this.padding);

      const isSelected = this.verbs[i] === this.selectedVerb;
      const isHovered = renderer.bufCtx ? false : false; // Will be set by Game

      // Button background
      renderer.drawRect(vx, vy, this.verbWidth, this.verbHeight,
        isSelected ? '#4a6fa5' : '#252540');

      // Button text
      renderer.drawTextHiRes(this.verbs[i], vx + 3, vy + 2, {
        color: isSelected ? '#fff' : '#a0a0c0',
        size: 7,
        shadow: false,
      });
    }
  }

  /**
   * Check if mouse is over verb area.
   */
  isInVerbArea(x, y) {
    return x >= this.x && x < this.x + (this.verbWidth + this.padding) * this.cols
      && y >= this.y && y < this.y + (this.verbHeight + this.padding) * 3;
  }
}
