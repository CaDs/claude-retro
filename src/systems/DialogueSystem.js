/**
 * DialogueSystem — Branching conversation tree with choice selection.
 */
export class DialogueSystem {
  constructor() {
    this.active = false;
    this.dialogueTree = null;
    this.currentNode = null;
    this.npcName = '';
    this.displayText = '';
    this.choices = [];
    this.textTimer = 0;
    this.textSpeed = 2; // chars per frame
    this.fullText = '';
    this.displayIndex = 0;
    this.waitingForChoice = false;
    this.waitingForClick = false;
    this.onComplete = null;
    this.onAction = null; // Callback for game actions triggered by dialogue
  }

  /**
   * Start a dialogue tree.
   * @param {string} npcName - NPC's display name
   * @param {Object} tree - Dialogue tree definition
   * @param {Function} onAction - Callback for dialogue actions
   * @param {Function} onComplete - Called when dialogue ends
   */
  start(npcName, tree, onAction, onComplete) {
    this.active = true;
    this.dialogueTree = tree;
    this.npcName = npcName;
    this.onAction = onAction;
    this.onComplete = onComplete;
    this.goToNode(tree.startNode || 'start');
  }

  /**
   * Navigate to a specific node in the tree.
   */
  goToNode(nodeId) {
    if (!this.dialogueTree || !this.dialogueTree.nodes[nodeId]) {
      this.end();
      return;
    }

    const node = this.dialogueTree.nodes[nodeId];
    this.currentNode = node;

    if (node.text) {
      this.fullText = node.text;
      this.displayText = '';
      this.displayIndex = 0;
      this.waitingForClick = false;
      this.waitingForChoice = false;
    }

    // Execute any actions on entering this node
    if (node.action && this.onAction) {
      this.onAction(node.action);
    }
  }

  /**
   * Update the dialogue system each frame.
   */
  update(input) {
    if (!this.active) return;

    // Typewriter text reveal
    if (this.displayIndex < this.fullText.length) {
      this.displayIndex = Math.min(
        this.displayIndex + this.textSpeed,
        this.fullText.length
      );
      this.displayText = this.fullText.substring(0, Math.floor(this.displayIndex));

      // Click to skip typewriter
      if (input.clicked) {
        this.displayIndex = this.fullText.length;
        this.displayText = this.fullText;
      }
      return;
    }

    // Text fully revealed — show choices or wait for click
    if (this.currentNode.choices && this.currentNode.choices.length > 0) {
      this.waitingForChoice = true;
      // Handle choice selection
      if (input.clicked) {
        const choiceIdx = this._getChoiceAtClick(input.clickY);
        if (choiceIdx >= 0 && choiceIdx < this.currentNode.choices.length) {
          const choice = this.currentNode.choices[choiceIdx];
          if (choice.action && this.onAction) {
            this.onAction(choice.action);
          }
          if (choice.next) {
            this.goToNode(choice.next);
          } else {
            this.end();
          }
        }
      }
    } else if (this.currentNode.next) {
      // Auto-advance on click
      this.waitingForClick = true;
      if (input.clicked) {
        this.goToNode(this.currentNode.next);
      }
    } else {
      // End of dialogue
      this.waitingForClick = true;
      if (input.clicked) {
        this.end();
      }
    }
  }

  /**
   * Determine which choice was clicked based on Y position.
   */
  _getChoiceAtClick(clickY) {
    if (!this.currentNode.choices) return -1;
    const startY = 70;
    const lineHeight = 14;
    for (let i = 0; i < this.currentNode.choices.length; i++) {
      const cy = startY + i * lineHeight;
      if (clickY >= cy && clickY < cy + lineHeight) {
        return i;
      }
    }
    return -1;
  }

  /**
   * End the dialogue.
   */
  end() {
    this.active = false;
    this.dialogueTree = null;
    this.currentNode = null;
    this.choices = [];
    if (this.onComplete) {
      this.onComplete();
    }
  }

  /**
   * Render the dialogue overlay.
   */
  render(renderer, input) {
    if (!this.active) return;

    // Darken game area
    renderer.drawRect(0, 0, 320, 140, 'rgba(0, 0, 0, 0.6)');

    // NPC name
    renderer.drawTextHiRes(this.npcName, 160, 8, {
      align: 'center', color: '#ffdd57', size: 8
    });

    // Speech text
    renderer.drawTextWrappedHiRes(this.displayText, 20, 24, 280, {
      color: '#fff', size: 8, lineHeight: 12
    });

    // Choices
    if (this.waitingForChoice && this.currentNode.choices) {
      const startY = 70;
      const lineHeight = 14;

      for (let i = 0; i < this.currentNode.choices.length; i++) {
        const cy = startY + i * lineHeight;
        const isHovered = input.mouseY >= cy && input.mouseY < cy + lineHeight
          && input.mouseX >= 20 && input.mouseX < 300;

        renderer.drawTextHiRes(
          `${i + 1}. ${this.currentNode.choices[i].text}`,
          24, cy,
          {
            color: isHovered ? '#ffdd57' : '#a0c0ff',
            size: 7,
          }
        );
      }
    }

    // Click to continue prompt
    if (this.waitingForClick && !this.waitingForChoice) {
      const blink = Math.floor(Date.now() / 500) % 2;
      if (blink) {
        renderer.drawTextHiRes('▼ Click to continue', 160, 128, {
          align: 'center', color: '#888', size: 7
        });
      }
    }
  }
}
