/**
 * ContentRegistry — Central store for all loaded game content.
 * Provides lookup APIs for rooms, items, puzzles, dialogues, NPCs.
 */
export class ContentRegistry {
  constructor(gameDef) {
    this._gameDef = gameDef;
    this.title = gameDef.title;
    this.setting = gameDef.setting || null;
    this.version = gameDef.version;
    this.resolution = gameDef.resolution;
    this.viewportHeight = gameDef.viewportHeight;
    this.startRoom = gameDef.startRoom;
    this.startPosition = gameDef.startPosition;
    this.verbs = gameDef.verbs;
    this.defaultResponses = gameDef.defaultResponses;
    this.protagonist = gameDef.protagonist;
    this._items = gameDef.items;       // keyed by ID
    this._npcs = gameDef.npcs;         // array
    this._puzzles = gameDef.puzzles;   // array with _key
    this._rooms = gameDef.rooms;       // keyed by ID
    this._dialogues = gameDef.dialogues; // keyed by ID
    this._music = gameDef.music;         // tracks + roomMusic mapping
  }

  // --- Items ---

  getItem(id) {
    return this._items[id] || null;
  }

  getAllItems() {
    return this._items;
  }

  // --- Rooms ---

  getRoom(id) {
    return this._rooms[id] || null;
  }

  getAllRooms() {
    return this._rooms;
  }

  // --- Puzzles ---

  /**
   * Find a puzzle matching the given trigger key.
   * Keys: "verb:target" or "verb:item:target"
   */
  findPuzzle(key) {
    return this._puzzles.find(p => p._key === key) || null;
  }

  /**
   * Find a puzzle by checking verb + target with optional flag conditions.
   * Supports the old "verb:target:flag:value" pattern for flag-gated puzzles.
   */
  findPuzzleWithFlags(verb, targetId, flags) {
    // First try exact flag-gated matches
    for (const puzzle of this._puzzles) {
      if (puzzle.trigger.verb !== verb || puzzle.trigger.target !== targetId) continue;
      if (puzzle.trigger.item) continue; // skip item-based puzzles

      // Check if puzzle has flag conditions
      if (puzzle.conditions && puzzle.conditions.length > 0) {
        const allMet = puzzle.conditions.every(cond => {
          if (cond.hasFlag) return flags[cond.hasFlag];
          if (cond.notFlag) return !flags[cond.notFlag];
          return true; // hasItem checked elsewhere
        });
        if (allMet) return puzzle;
      } else {
        // No conditions — direct match
        return puzzle;
      }
    }
    return null;
  }

  /**
   * Find a puzzle for a verb + item + target combo.
   */
  findItemPuzzle(verb, itemId, targetId) {
    const key = `${verb}:${itemId}:${targetId}`;
    return this._puzzles.find(p => p._key === key) || null;
  }

  // --- NPCs ---

  getNpc(id) {
    return this._npcs.find(n => n.id === id) || null;
  }

  getAllNpcs() {
    return this._npcs;
  }

  /**
   * Get NPCs placed in a specific room.
   */
  getNpcsInRoom(roomId) {
    return this._npcs.filter(npc =>
      npc.placements && npc.placements.some(p => p.room === roomId)
    );
  }

  /**
   * Get the placement data for an NPC in a specific room.
   */
  getNpcPlacement(npcId, roomId) {
    const npc = this.getNpc(npcId);
    if (!npc || !npc.placements) return null;
    return npc.placements.find(p => p.room === roomId) || null;
  }

  // --- Dialogues ---

  getDialogue(id) {
    return this._dialogues[id] || null;
  }

  /**
   * Get the appropriate dialogue for an NPC, considering overrides.
   */
  getDialogueForNpc(npc, flags, inventory) {
    // Check dialogue overrides first
    if (npc.dialogueOverrides) {
      for (const override of npc.dialogueOverrides) {
        const cond = override.condition;
        if (this._evaluateCondition(cond, flags, inventory)) {
          return this._dialogues[override.dialogue] || null;
        }
      }
    }
    // Default dialogue
    return this._dialogues[npc.dialogue] || null;
  }

  /**
   * Evaluate a condition object against current game state.
   */
  _evaluateCondition(cond, flags, inventory) {
    if (!cond) return true;

    if (cond.hasFlag) return !!flags[cond.hasFlag];
    if (cond.notFlag) return !flags[cond.notFlag];
    if (cond.hasItem) return inventory.hasItem(cond.hasItem);

    // Logical combinators
    if (cond.and) return cond.and.every(c => this._evaluateCondition(c, flags, inventory));
    if (cond.or) return cond.or.some(c => this._evaluateCondition(c, flags, inventory));
    if (cond.not) return !this._evaluateCondition(cond.not, flags, inventory);

    return true;
  }

  // --- Settings & Templates ---

  /**
   * Get the game's setting ID (e.g., 'fantasy', 'scifi').
   */
  getSetting() {
    return this.setting;
  }

  /**
   * Get the background template info for a room.
   * Returns { template, params, palette, paletteOverrides } or null.
   */
  getRoomTemplate(roomId) {
    const room = this.getRoom(roomId);
    if (!room || !room.background || !room.background.template) return null;
    return room.background;
  }

  /**
   * Get rooms that use template-based backgrounds.
   */
  getTemplateRooms() {
    const result = [];
    for (const [id, room] of Object.entries(this._rooms)) {
      if (room.background && room.background.template) {
        result.push(room);
      }
    }
    return result;
  }

  // --- Music ---

  /**
   * Get the music track for a given room, or null if none assigned.
   */
  getRoomMusic(roomId) {
    if (!this._music) return null;
    const trackId = this._music.roomMusic[roomId];
    if (!trackId) return null;
    return this._music.tracks[trackId] || null;
  }
}
