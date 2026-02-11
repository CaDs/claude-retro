/**
 * PuzzleSystem — Resolves puzzle interactions from DSL definitions.
 * Handles trigger matching, condition checking, and action execution.
 */
export class PuzzleSystem {
  constructor(content) {
    this.content = content;
  }

  /**
   * Try to resolve a verb + target interaction as a puzzle.
   * @param {string} verb - Verb ID (e.g., 'pick_up', 'use')
   * @param {string} targetId - Hotspot or NPC ID
   * @param {object} flags - Current game flags
   * @param {object} inventory - InventorySystem instance
   * @returns {{ puzzle: object, actions: Array }|null} Matched puzzle or null
   */
  tryResolve(verb, targetId, flags, inventory) {
    // Look for a direct verb:target puzzle
    const puzzle = this.content.findPuzzleWithFlags(verb, targetId, flags);
    if (!puzzle) return null;

    // Check item conditions
    if (puzzle.conditions) {
      const conditionsMet = puzzle.conditions.every(cond => {
        if (cond.hasItem) return inventory.hasItem(cond.hasItem);
        if (cond.notItem) return !inventory.hasItem(cond.notItem);
        if (cond.hasFlag) return !!flags[cond.hasFlag];
        if (cond.notFlag) return !flags[cond.notFlag];
        return true;
      });
      if (!conditionsMet) {
        return puzzle.failText ? { failText: puzzle.failText } : null;
      }
    }

    return { puzzle, actions: puzzle.actions };
  }

  /**
   * Try to resolve a verb + item + target interaction as a puzzle.
   * @param {string} verb - Verb ID (e.g., 'use', 'give')
   * @param {string} itemId - Item being used
   * @param {string} targetId - Target hotspot or NPC
   * @param {object} flags - Current game flags
   * @param {object} inventory - InventorySystem instance
   * @returns {{ puzzle: object, actions: Array }|null} Matched puzzle or null
   */
  tryResolveWithItem(verb, itemId, targetId, flags, inventory) {
    const puzzle = this.content.findItemPuzzle(verb, itemId, targetId);
    if (!puzzle) return null;

    // Check conditions
    if (puzzle.conditions) {
      const conditionsMet = puzzle.conditions.every(cond => {
        if (cond.hasItem) return inventory.hasItem(cond.hasItem);
        if (cond.notItem) return !inventory.hasItem(cond.notItem);
        if (cond.hasFlag) return !!flags[cond.hasFlag];
        if (cond.notFlag) return !flags[cond.notFlag];
        return true;
      });
      if (!conditionsMet) {
        return puzzle.failText ? { failText: puzzle.failText } : null;
      }
    }

    return { puzzle, actions: puzzle.actions };
  }

  /**
   * Convert DSL puzzle actions to ScriptRunner-compatible format.
   * @param {Array} actions - DSL actions array
   * @returns {Array} ScriptRunner actions
   */
  toScriptActions(actions) {
    return actions.map(action => {
      if (action.say) return { type: 'say', text: action.say };
      if (action.addItem) return { type: 'add_item', item: action.addItem };
      if (action.removeItem) return { type: 'remove_item', item: action.removeItem };
      if (action.setFlag) return { type: 'set_flag', flag: action.setFlag };
      if (action.wait) return { type: 'wait', duration: action.wait };
      if (action.showEnding) return { type: 'show_ending' };
      if (action.hideHotspot) return {
        type: 'hide_hotspot',
        room: action.hideHotspot.room,
        hotspot: action.hideHotspot.id,
      };
      // Pass through unknown actions
      return action;
    });
  }
}
