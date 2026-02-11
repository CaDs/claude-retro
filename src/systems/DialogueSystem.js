/**
 * DialogueSystem — Branching conversation tree with choice selection.
 * Supports DSL dialogue format with conditions, multi-actions, and idle lines.
 */
export class DialogueSystem {
  constructor() {
    this.active = false;
    this.dialogueTree = null;
    this.currentNode = null;
    this.npcName = '';
    this.displayText = '';
    this.textTimer = 0;
    this.textSpeed = 2; // chars per frame
    this.fullText = '';
    this.displayIndex = 0;
    this.waitingForChoice = false;
    this.waitingForClick = false;
    this.onComplete = null;
    this.onAction = null; // Callback for game actions triggered by dialogue

    // Exhaustion / idle line tracking
    this._exhaustedNpcs = {};  // npcId → true
    this._idleLineIndex = {};  // npcId → next idle line index
  }

  /**
   * Check if an NPC's dialogue is exhausted and show an idle line instead.
   * Returns true if an idle line was shown (caller should skip starting normal dialogue).
   */
  tryIdleLine(npcName, npcId, tree) {
    if (!this._exhaustedNpcs[npcId]) return false;
    if (!tree || !tree.idleLines || tree.idleLines.length === 0) return false;

    // Get next idle line (round-robin)
    const idx = this._idleLineIndex[npcId] || 0;
    const line = tree.idleLines[idx];
    this._idleLineIndex[npcId] = (idx + 1) % tree.idleLines.length;

    // Show as a simple one-shot dialogue
    this.active = true;
    this.dialogueTree = { nodes: { idle: { text: line } } };
    this.npcName = npcName;
    this.onAction = null;
    this.onComplete = null;
    this.goToNode('idle');
    return true;
  }

  /**
   * Reset exhaustion for an NPC (e.g., when game state changes via dialogue override).
   */
  resetExhaustion(npcId) {
    delete this._exhaustedNpcs[npcId];
  }

  /**
   * Start a dialogue tree.
   * @param {string} npcName - NPC's display name
   * @param {string} npcId - NPC's unique ID (for exhaustion tracking)
   * @param {Object} tree - Dialogue tree definition
   * @param {Function} onAction - Callback for dialogue actions
   * @param {Function} onComplete - Called when dialogue ends
   * @param {Object} [gameState] - { flags, inventory } for condition checking
   */
  start(npcName, tree, onAction, onComplete, npcId, gameState) {
    this.active = true;
    this.dialogueTree = tree;
    this.npcName = npcName;
    this.onAction = onAction;
    this.onComplete = onComplete;
    this._currentNpcId = npcId || null;
    this._gameState = gameState || null;
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

    // Execute actions on entering this node (DSL format: array of actions)
    if (node.actions && this.onAction) {
      for (const action of node.actions) {
        this.onAction(action);
      }
    }
    // Legacy format: single action object
    if (node.action && this.onAction) {
      this.onAction(node.action);
    }

    // Track exhaustion
    if (node.exhausted && this._currentNpcId) {
      this._exhaustedNpcs[this._currentNpcId] = true;
    }
  }

  /**
   * Get visible choices, filtering by conditions.
   */
  _getVisibleChoices() {
    if (!this.currentNode || !this.currentNode.choices) return [];
    if (!this._gameState) return this.currentNode.choices;

    return this.currentNode.choices.filter(choice => {
      if (!choice.condition) return true;
      return this._evaluateCondition(choice.condition);
    });
  }

  /**
   * Evaluate a condition against game state.
   */
  _evaluateCondition(cond) {
    if (!cond || !this._gameState) return true;
    const { flags, inventory } = this._gameState;

    if (cond.hasFlag) return !!(flags && flags[cond.hasFlag]);
    if (cond.notFlag) return !(flags && flags[cond.notFlag]);
    if (cond.hasItem) return !!(inventory && inventory.hasItem(cond.hasItem));
    if (cond.and) return cond.and.every(c => this._evaluateCondition(c));
    if (cond.or) return cond.or.some(c => this._evaluateCondition(c));
    if (cond.not) return !this._evaluateCondition(cond.not);

    return true;
  }

  /**
   * Update the dialogue system each frame.
   */
  update(input, renderer) {
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
    const visibleChoices = this._getVisibleChoices();
    if (visibleChoices.length > 0) {
      this.waitingForChoice = true;
      this._visibleChoices = visibleChoices;
      // Handle choice selection
      if (input.clicked) {
        const choiceIdx = this._getChoiceAtClick(input.clickY, renderer);
        if (choiceIdx >= 0 && choiceIdx < visibleChoices.length) {
          const choice = visibleChoices[choiceIdx];
          // Execute choice actions (DSL: array)
          if (choice.actions && this.onAction) {
            for (const action of choice.actions) {
              this.onAction(action);
            }
          }
          // Legacy: single action
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
  _getChoiceAtClick(clickY, renderer) {
    const choices = this._visibleChoices || this.currentNode?.choices || [];
    if (!choices.length) return -1;

    // Dynamically calculate startY based on text height
    let startY = 70;
    if (renderer) {
      const textHeight = renderer.measureTextWrappedHiRes(this.displayText, 280, { size: 8, lineHeight: 12 });
      startY = 24 + textHeight + 12; // 24 (top margin) + text height + 12 (padding)
    }

    let cursorY = startY;
    for (let i = 0; i < choices.length; i++) {
      const choiceText = `${i + 1}. ${choices[i].text}`;
      const choiceHeight = renderer.measureTextWrappedHiRes(choiceText, 280, { size: 7, lineHeight: 10 });
      if (clickY >= cursorY && clickY < cursorY + choiceHeight) {
        return i;
      }
      cursorY += choiceHeight + 2;
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
    this._visibleChoices = null;
    this._gameState = null;
    if (this.onComplete) {
      this.onComplete();
    }
  }

  /**
   * Get exhaustion state for save/load.
   */
  getExhaustionState() {
    return {
      exhaustedNpcs: { ...this._exhaustedNpcs },
      idleLineIndex: { ...this._idleLineIndex },
    };
  }

  /**
   * Restore exhaustion state from save.
   */
  restoreExhaustionState(state) {
    if (state) {
      this._exhaustedNpcs = state.exhaustedNpcs || {};
      this._idleLineIndex = state.idleLineIndex || {};
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
    const textOptions = { color: '#fff', size: 8, lineHeight: 12 };
    renderer.drawTextWrappedHiRes(this.displayText, 20, 24, 280, textOptions);

    // Choices
    const visibleChoices = this._visibleChoices || [];
    if (this.waitingForChoice && visibleChoices.length > 0) {
      // Calculate dynamic start Y based on text height
      const textHeight = renderer.measureTextWrappedHiRes(this.displayText, 280, textOptions);
      const startY = 24 + textHeight + 12;

      let cursorY = startY;
      for (let i = 0; i < visibleChoices.length; i++) {
        // Ensure choice is within screen bounds (basic clipping)
        if (cursorY > 135) break;

        const choiceText = `${i + 1}. ${visibleChoices[i].text}`;
        const choiceOpts = { size: 7, lineHeight: 10 };
        const choiceHeight = renderer.measureTextWrappedHiRes(choiceText, 280, choiceOpts);

        const isHovered = input.mouseY >= cursorY && input.mouseY < cursorY + choiceHeight
          && input.mouseX >= 20 && input.mouseX < 300;

        renderer.drawTextWrappedHiRes(
          choiceText,
          24, cursorY, 280,
          {
            color: isHovered ? '#ffdd57' : '#a0c0ff',
            size: 7,
            lineHeight: 10,
          }
        );
        cursorY += choiceHeight + 2;
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
