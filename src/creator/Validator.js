/**
 * Validator.js
 *
 * Validates the game state for common issues before export. Returns a list of
 * errors (blocking issues) and warnings (non-critical suggestions).
 */

export class Validator {
  /**
   * Validate the entire game state and return an array of issues.
   * @param {CreatorState} state
   * @returns {Array<{level: 'error'|'warning', message: string}>}
   */
  static validate(state) {
    const issues = [];

    // --- Critical errors that prevent export ---

    // Check: has at least one room
    if (state.rooms.length === 0) {
      issues.push({
        level: 'error',
        message: 'No rooms defined. Add at least one room to your game.',
      });
    }

    // Check: startRoom references a valid room
    if (state.game.startRoom) {
      const startRoom = state.getRoom(state.game.startRoom);
      if (!startRoom) {
        issues.push({
          level: 'error',
          message: `Start room "${state.game.startRoom}" does not exist. Update the start room.`,
        });
      }
    } else {
      issues.push({
        level: 'error',
        message: 'No start room set. Select a room to be the starting location.',
      });
    }

    // Check: all exit targets reference valid rooms
    for (const room of state.rooms) {
      if (!room.exits) continue;
      for (const exit of room.exits) {
        if (!exit.target) {
          issues.push({
            level: 'error',
            message: `Exit "${exit.id || exit.name}" in room "${room.name}" has no target room.`,
          });
        } else if (!state.getRoom(exit.target)) {
          issues.push({
            level: 'error',
            message: `Exit "${exit.id || exit.name}" in room "${room.name}" references non-existent room "${exit.target}".`,
          });
        }
      }
    }

    // Check: rooms have templates assigned
    for (const room of state.rooms) {
      if (!room.background || !room.background.template) {
        issues.push({
          level: 'error',
          message: `Room "${room.name}" has no background template assigned.`,
        });
      }
    }

    // Check: rooms have walkable areas
    for (const room of state.rooms) {
      if (!room.walkableArea || !room.walkableArea.rects || room.walkableArea.rects.length === 0) {
        issues.push({
          level: 'warning',
          message: `Room "${room.name}" has no walkable area defined. Players won't be able to navigate.`,
        });
      }
    }

    // Check: all NPC dialogue references exist in state.dialogues
    for (const npc of state.npcs) {
      if (npc.dialogue && !state.getDialogue(npc.dialogue)) {
        issues.push({
          level: 'error',
          message: `NPC "${npc.name}" references non-existent dialogue tree "${npc.dialogue}".`,
        });
      }

      // Check dialogue overrides
      if (npc.dialogueOverrides) {
        for (const override of npc.dialogueOverrides) {
          if (override.dialogue && !state.getDialogue(override.dialogue)) {
            issues.push({
              level: 'error',
              message: `NPC "${npc.name}" has dialogue override referencing non-existent tree "${override.dialogue}".`,
            });
          }
        }
      }
    }

    // Check: all NPC placements reference valid rooms
    for (const npc of state.npcs) {
      if (!npc.placements) continue;
      for (const placement of npc.placements) {
        if (!state.getRoom(placement.room)) {
          issues.push({
            level: 'error',
            message: `NPC "${npc.name}" has placement in non-existent room "${placement.room}".`,
          });
        }
      }
    }

    // Check: puzzle triggers reference valid verbs
    const validVerbs = new Set(state.game.verbs.map(v => v.id));
    for (const puzzle of state.puzzles) {
      if (puzzle.trigger && puzzle.trigger.verb && !validVerbs.has(puzzle.trigger.verb)) {
        issues.push({
          level: 'error',
          message: `Puzzle "${puzzle.id}" uses invalid verb "${puzzle.trigger.verb}".`,
        });
      }

      // Check puzzle trigger has required fields
      if (!puzzle.trigger || !puzzle.trigger.verb) {
        issues.push({
          level: 'error',
          message: `Puzzle "${puzzle.id}" has no verb specified in trigger.`,
        });
      }

      if (!puzzle.trigger || !puzzle.trigger.target) {
        issues.push({
          level: 'error',
          message: `Puzzle "${puzzle.id}" has no target specified in trigger.`,
        });
      }
    }

    // Check: puzzle conditions reference valid items/flags
    for (const puzzle of state.puzzles) {
      if (!puzzle.conditions) continue;
      for (const condition of puzzle.conditions) {
        if (condition.hasItem) {
          if (!state.getItem(condition.hasItem)) {
            issues.push({
              level: 'warning',
              message: `Puzzle "${puzzle.id}" condition references non-existent item "${condition.hasItem}".`,
            });
          }
        }
      }
    }

    // Check: puzzle actions reference valid targets
    for (const puzzle of state.puzzles) {
      if (!puzzle.actions) continue;
      for (const action of puzzle.actions) {
        // Check giveItem references
        if (action.giveItem && !state.getItem(action.giveItem)) {
          issues.push({
            level: 'warning',
            message: `Puzzle "${puzzle.id}" action references non-existent item "${action.giveItem}".`,
          });
        }

        // Check removeItem references
        if (action.removeItem && !state.getItem(action.removeItem)) {
          issues.push({
            level: 'warning',
            message: `Puzzle "${puzzle.id}" action references non-existent item "${action.removeItem}".`,
          });
        }

        // Check changeRoom references
        if (action.changeRoom && !state.getRoom(action.changeRoom)) {
          issues.push({
            level: 'warning',
            message: `Puzzle "${puzzle.id}" action references non-existent room "${action.changeRoom}".`,
          });
        }
      }
    }

    // --- Non-critical warnings ---

    // Warning: no items defined
    if (state.items.length === 0) {
      issues.push({
        level: 'warning',
        message: 'No items defined. Consider adding inventory items for puzzles.',
      });
    }

    // Warning: no puzzles defined
    if (state.puzzles.length === 0) {
      issues.push({
        level: 'warning',
        message: 'No puzzles defined. Add puzzles to make your game interactive.',
      });
    }

    // Warning: no NPCs defined
    if (state.npcs.length === 0) {
      issues.push({
        level: 'warning',
        message: 'No NPCs defined. Add characters to bring your world to life.',
      });
    }

    // Warning: rooms with no hotspots or exits
    for (const room of state.rooms) {
      const hasHotspots = room.hotspots && room.hotspots.length > 0;
      const hasExits = room.exits && room.exits.length > 0;
      if (!hasHotspots && !hasExits) {
        issues.push({
          level: 'warning',
          message: `Room "${room.name}" has no hotspots or exits. Players may get stuck.`,
        });
      }
    }

    // Warning: NPCs without dialogue
    for (const npc of state.npcs) {
      if (!npc.dialogue && (!npc.barks || npc.barks.length === 0)) {
        issues.push({
          level: 'warning',
          message: `NPC "${npc.name}" has no dialogue or barks. Consider adding conversation.`,
        });
      }
    }

    // Warning: NPCs without placements
    for (const npc of state.npcs) {
      if (!npc.placements || npc.placements.length === 0) {
        issues.push({
          level: 'warning',
          message: `NPC "${npc.name}" has no room placements. They won't appear in the game.`,
        });
      }
    }

    // Warning: items without icons
    for (const item of state.items) {
      if (!item.icon || !item.icon.generator) {
        issues.push({
          level: 'warning',
          message: `Item "${item.name}" has no icon generator set. It won't display properly.`,
        });
      }
    }

    return issues;
  }
}
