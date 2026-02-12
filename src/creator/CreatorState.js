/**
 * CreatorState.js
 *
 * Central state model for the Game Creator. Holds all game content being authored
 * (metadata, rooms, NPCs, items, puzzles, dialogues) and provides CRUD operations
 * with an observable change-notification system.
 *
 * Serialization helpers (`toYaml`, `toRoomYaml`, `fromYaml`) convert between the
 * in-memory representation and the YAML DSL format consumed by the game engine.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Deep-clone a plain object / array (no functions, no circular refs). */
function _clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/** Generate a short pseudo-random id (8 hex chars). */
function _uid() {
  return Math.random().toString(16).slice(2, 10);
}

// ---------------------------------------------------------------------------
// CreatorState
// ---------------------------------------------------------------------------

export class CreatorState {
  constructor() {
    // ----- game metadata -----
    this.game = {
      title: 'My Adventure',
      setting: null,          // set when user picks a setting (e.g. 'fantasy')
      version: '1.0',
      resolution: { width: 320, height: 200 },
      viewportHeight: 140,
      startRoom: null,
      startPosition: { x: 160, y: 120 },
      verbs: [
        { id: 'give',    label: 'Give' },
        { id: 'open',    label: 'Open' },
        { id: 'close',   label: 'Close' },
        { id: 'pick_up', label: 'Pick up' },
        { id: 'look_at', label: 'Look at' },
        { id: 'talk_to', label: 'Talk to' },
        { id: 'use',     label: 'Use' },
        { id: 'push',    label: 'Push' },
        { id: 'pull',    label: 'Pull' },
      ],
      defaultResponses: {
        look_at: "Nothing special about it.",
        pick_up: "I can't pick that up.",
        use:     "I can't use that.",
        open:    "It doesn't open.",
        close:   "It's not open.",
        push:    "It won't budge.",
        pull:    "Nothing happens.",
        give:    "I don't think they want that.",
        talk_to: "I don't think talking to that will help.",
      },
    };

    // ----- content arrays -----
    this.rooms     = [];
    this.npcs      = [];
    this.items     = [];
    this.puzzles   = [];
    this.dialogues = {};   // keyed by dialogue id

    // ----- observers -----
    /** @type {Array<(state: CreatorState) => void>} */
    this._listeners = [];
  }

  // ========================================================================
  // Event system
  // ========================================================================

  /**
   * Register a listener that fires whenever state changes.
   * @param {(state: CreatorState) => void} fn
   * @returns {() => void} Unsubscribe function.
   */
  onChange(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter(l => l !== fn);
    };
  }

  /** Notify all listeners of a state change. */
  _notify() {
    for (const fn of this._listeners) {
      try { fn(this); } catch (e) { console.error('[CreatorState] listener error:', e); }
    }
  }

  // ========================================================================
  // Setting
  // ========================================================================

  /** Set the game setting (e.g. 'fantasy', 'scifi'). */
  setSetting(settingId) {
    this.game.setting = settingId;
    this._notify();
  }

  // ========================================================================
  // Game metadata helpers
  // ========================================================================

  /** Update top-level game metadata fields (title, version, startPosition, etc.). */
  updateGameMeta(changes) {
    Object.assign(this.game, changes);
    this._notify();
  }

  // ========================================================================
  // Room CRUD
  // ========================================================================

  /**
   * Add a new room. If this is the first room, it becomes the startRoom.
   * @param {object} room  Must include at least `id` and `name`.
   * @returns {object} The added room (with defaults applied).
   */
  addRoom(room) {
    const r = Object.assign({
      id: room.id || `room_${_uid()}`,
      name: 'Untitled Room',
      description: '',
      background: { type: 'procedural', generator: null, palette: null, paletteOverrides: {} },
      lighting: null,
      walkableArea: { rects: [] },
      hotspots: [],
      exits: [],
      visuals: [],
    }, _clone(room));

    this.rooms.push(r);

    // First room becomes the start room automatically.
    if (this.rooms.length === 1) {
      this.game.startRoom = r.id;
    }

    this._notify();
    return r;
  }

  /**
   * Merge changes into an existing room.
   * @param {string} id
   * @param {object} changes  Shallow-merged into the room object.
   */
  updateRoom(id, changes) {
    const room = this.getRoom(id);
    if (!room) { console.warn(`[CreatorState] updateRoom: room "${id}" not found`); return; }
    Object.assign(room, changes);
    this._notify();
  }

  /** Remove a room by id. Cleans up startRoom reference if needed. */
  removeRoom(id) {
    const idx = this.rooms.findIndex(r => r.id === id);
    if (idx === -1) return;
    this.rooms.splice(idx, 1);

    // If the removed room was startRoom, reassign or clear.
    if (this.game.startRoom === id) {
      this.game.startRoom = this.rooms.length > 0 ? this.rooms[0].id : null;
    }

    this._notify();
  }

  /** @returns {object|undefined} */
  getRoom(id) {
    return this.rooms.find(r => r.id === id);
  }

  // ========================================================================
  // NPC CRUD
  // ========================================================================

  /**
   * Add an NPC definition.
   * @param {object} npc  Must include at least `id` and `name`.
   * @returns {object} The added NPC (with defaults applied).
   */
  addNpc(npc) {
    const n = Object.assign({
      id: npc.id || `npc_${_uid()}`,
      name: 'Unnamed NPC',
      traits: {},
      placements: [],
      dialogue: null,
      dialogueOverrides: [],
      barks: [],
      responses: {},
    }, _clone(npc));

    this.npcs.push(n);
    this._notify();
    return n;
  }

  /**
   * Merge changes into an existing NPC.
   * @param {string} id
   * @param {object} changes
   */
  updateNpc(id, changes) {
    const npc = this.getNpc(id);
    if (!npc) { console.warn(`[CreatorState] updateNpc: npc "${id}" not found`); return; }
    Object.assign(npc, changes);
    this._notify();
  }

  /** Remove an NPC by id. */
  removeNpc(id) {
    const idx = this.npcs.findIndex(n => n.id === id);
    if (idx === -1) return;
    this.npcs.splice(idx, 1);
    this._notify();
  }

  /** @returns {object|undefined} */
  getNpc(id) {
    return this.npcs.find(n => n.id === id);
  }

  // ========================================================================
  // Item CRUD
  // ========================================================================

  /**
   * Add an item definition.
   * @param {object} item  Must include at least `id` and `name`.
   * @returns {object} The added item (with defaults applied).
   */
  addItem(item) {
    const i = Object.assign({
      id: item.id || `item_${_uid()}`,
      name: 'Unnamed Item',
      description: '',
      icon: { generator: null },
      useOn: {},
      useDefault: "I can't use that here.",
      responses: {},
    }, _clone(item));

    this.items.push(i);
    this._notify();
    return i;
  }

  /**
   * Merge changes into an existing item.
   * @param {string} id
   * @param {object} changes
   */
  updateItem(id, changes) {
    const item = this.getItem(id);
    if (!item) { console.warn(`[CreatorState] updateItem: item "${id}" not found`); return; }
    Object.assign(item, changes);
    this._notify();
  }

  /** Remove an item by id. */
  removeItem(id) {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx === -1) return;
    this.items.splice(idx, 1);
    this._notify();
  }

  /** @returns {object|undefined} */
  getItem(id) {
    return this.items.find(i => i.id === id);
  }

  // ========================================================================
  // Puzzle CRUD
  // ========================================================================

  /**
   * Add a puzzle definition.
   * @param {object} puzzle  Must include at least `id` and `trigger`.
   * @returns {object} The added puzzle (with defaults applied).
   */
  addPuzzle(puzzle) {
    const p = Object.assign({
      id: puzzle.id || `puzzle_${_uid()}`,
      trigger: { verb: null, target: null },
      conditions: [],
      actions: [],
      failText: null,
    }, _clone(puzzle));

    this.puzzles.push(p);
    this._notify();
    return p;
  }

  /**
   * Merge changes into an existing puzzle.
   * @param {string} id
   * @param {object} changes
   */
  updatePuzzle(id, changes) {
    const puzzle = this.getPuzzle(id);
    if (!puzzle) { console.warn(`[CreatorState] updatePuzzle: puzzle "${id}" not found`); return; }
    Object.assign(puzzle, changes);
    this._notify();
  }

  /** Remove a puzzle by id. */
  removePuzzle(id) {
    const idx = this.puzzles.findIndex(p => p.id === id);
    if (idx === -1) return;
    this.puzzles.splice(idx, 1);
    this._notify();
  }

  /** @returns {object|undefined} */
  getPuzzle(id) {
    return this.puzzles.find(p => p.id === id);
  }

  // ========================================================================
  // Dialogue CRUD
  // ========================================================================

  /**
   * Add or replace a dialogue tree.
   * @param {string} dialogueId
   * @param {object} tree  Dialogue tree object (nodes, idleLines, etc.).
   */
  setDialogue(dialogueId, tree) {
    this.dialogues[dialogueId] = _clone(tree);
    this._notify();
  }

  /** Get a dialogue tree by id. */
  getDialogue(dialogueId) {
    return this.dialogues[dialogueId] || null;
  }

  /** Remove a dialogue tree by id. */
  removeDialogue(dialogueId) {
    if (!(dialogueId in this.dialogues)) return;
    delete this.dialogues[dialogueId];
    this._notify();
  }

  // ========================================================================
  // Serialization  —  state -> YAML-ready objects
  // ========================================================================

  /**
   * Produce the top-level `game.yaml` object tree ready for `yaml.dump()`.
   * References rooms, dialogues, items, npcs, and puzzles by file path.
   */
  toYaml() {
    const g = this.game;

    // Build file reference lists.
    const roomPaths     = this.rooms.map(r => `rooms/${r.id}.yaml`);
    const dialoguePaths = Object.keys(this.dialogues).map(d => `dialogues/${d}.yaml`);

    return {
      game: {
        title:            g.title,
        version:          g.version,
        resolution:       { width: g.resolution.width, height: g.resolution.height },
        viewportHeight:   g.viewportHeight,
        startRoom:        g.startRoom,
        startPosition:    { x: g.startPosition.x, y: g.startPosition.y },
        verbs:            g.verbs.map(v => ({ id: v.id, label: v.label })),
        defaultResponses: { ...g.defaultResponses },
        items:            'items.yaml',
        npcs:             'npcs.yaml',
        puzzles:          'puzzles.yaml',
        rooms:            roomPaths,
        dialogues:        dialoguePaths,
      },
    };
  }

  /**
   * Produce a single room's YAML-ready object tree (for `rooms/<id>.yaml`).
   * @param {string} roomId
   * @returns {object|null}
   */
  toRoomYaml(roomId) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    const out = {
      room: {
        id:          room.id,
        name:        room.name,
        description: room.description,
      },
    };

    // Background
    if (room.background) {
      out.room.background = _clone(room.background);
    }

    // Lighting
    if (room.lighting != null) {
      out.room.lighting = _clone(room.lighting);
    }

    // Visuals
    if (room.visuals && room.visuals.length > 0) {
      out.room.visuals = _clone(room.visuals);
    }

    // Walkable area
    if (room.walkableArea && room.walkableArea.rects && room.walkableArea.rects.length > 0) {
      out.room.walkableArea = _clone(room.walkableArea);
    }

    // Hotspots
    if (room.hotspots && room.hotspots.length > 0) {
      out.room.hotspots = room.hotspots.map(h => {
        const obj = {
          id:   h.id,
          name: h.name,
          rect: { x: h.rect.x, y: h.rect.y, width: h.rect.width, height: h.rect.height },
        };
        if (h.walkTo)    obj.walkTo    = { x: h.walkTo.x, y: h.walkTo.y };
        if (h.visible === false) obj.visible = false;
        if (h.responses) obj.responses = { ...h.responses };
        return obj;
      });
    }

    // Exits
    if (room.exits && room.exits.length > 0) {
      out.room.exits = room.exits.map(e => {
        const obj = {
          id:     e.id,
          rect:   { x: e.rect.x, y: e.rect.y, width: e.rect.width, height: e.rect.height },
          target: e.target,
          name:   e.name,
        };
        if (e.walkTo)  obj.walkTo  = { x: e.walkTo.x, y: e.walkTo.y };
        if (e.spawnAt) obj.spawnAt = { x: e.spawnAt.x, y: e.spawnAt.y };
        if (e.lookAt)  obj.lookAt  = e.lookAt;
        return obj;
      });
    }

    return out;
  }

  /**
   * Produce the `npcs.yaml` object tree.
   * @returns {object}
   */
  toNpcsYaml() {
    return {
      npcs: this.npcs.map(npc => {
        const obj = {
          id:     npc.id,
          name:   npc.name,
          traits: { ...npc.traits },
        };
        if (npc.placements && npc.placements.length > 0) {
          obj.placements = npc.placements.map(p => {
            const placement = {
              room:     p.room,
              position: { x: p.position.x, y: p.position.y },
              size:     { width: p.size.width, height: p.size.height },
            };
            if (p.walkTo) placement.walkTo = { x: p.walkTo.x, y: p.walkTo.y };
            if (p.facing) placement.facing = p.facing;
            return placement;
          });
        }
        if (npc.dialogue) obj.dialogue = npc.dialogue;
        if (npc.dialogueOverrides && npc.dialogueOverrides.length > 0) {
          obj.dialogueOverrides = _clone(npc.dialogueOverrides);
        }
        if (npc.barks && npc.barks.length > 0) obj.barks = [...npc.barks];
        if (npc.responses && Object.keys(npc.responses).length > 0) {
          obj.responses = { ...npc.responses };
        }
        return obj;
      }),
    };
  }

  /**
   * Produce the `items.yaml` object tree.
   * @returns {object}
   */
  toItemsYaml() {
    return {
      items: this.items.map(item => {
        const obj = {
          id:          item.id,
          name:        item.name,
          description: item.description,
          icon:        _clone(item.icon),
        };
        if (item.useOn && Object.keys(item.useOn).length > 0)       obj.useOn = { ...item.useOn };
        if (item.useDefault)                                          obj.useDefault = item.useDefault;
        if (item.responses && Object.keys(item.responses).length > 0) obj.responses = { ...item.responses };
        return obj;
      }),
    };
  }

  /**
   * Produce the `puzzles.yaml` object tree.
   * @returns {object}
   */
  toPuzzlesYaml() {
    return {
      puzzles: this.puzzles.map(p => {
        const obj = {
          id:      p.id,
          trigger: _clone(p.trigger),
        };
        if (p.conditions && p.conditions.length > 0) obj.conditions = _clone(p.conditions);
        if (p.actions && p.actions.length > 0)        obj.actions    = _clone(p.actions);
        if (p.failText)                                obj.failText   = p.failText;
        return obj;
      }),
    };
  }

  /**
   * Produce a single dialogue tree's YAML-ready object.
   * @param {string} dialogueId
   * @returns {object|null}
   */
  toDialogueYaml(dialogueId) {
    const tree = this.getDialogue(dialogueId);
    if (!tree) return null;
    return _clone(tree);
  }

  // ========================================================================
  // Import  —  YAML-ready objects -> CreatorState
  // ========================================================================

  /**
   * Reconstruct a CreatorState from parsed YAML objects.
   *
   * @param {object} opts
   * @param {object} opts.gameYaml    Parsed `game.yaml` content (the `game:` key).
   * @param {object[]} opts.rooms     Array of parsed room YAML objects (each with `room:` key).
   * @param {object} [opts.npcsYaml]  Parsed `npcs.yaml` content (`npcs:` key).
   * @param {object} [opts.itemsYaml] Parsed `items.yaml` content (`items:` key).
   * @param {object} [opts.puzzlesYaml] Parsed `puzzles.yaml` content (`puzzles:` key).
   * @param {object} [opts.dialogues] Map of dialogueId -> parsed dialogue tree objects.
   * @returns {CreatorState}
   */
  static fromYaml({ gameYaml, rooms = [], npcsYaml, itemsYaml, puzzlesYaml, dialogues = {} }) {
    const state = new CreatorState();
    const g = gameYaml.game || gameYaml;

    // --- Game metadata ---
    state.game.title          = g.title            || state.game.title;
    state.game.version        = g.version          || state.game.version;
    state.game.startRoom      = g.startRoom        || null;
    state.game.viewportHeight = g.viewportHeight   || state.game.viewportHeight;

    if (g.resolution) {
      state.game.resolution = { width: g.resolution.width, height: g.resolution.height };
    }
    if (g.startPosition) {
      state.game.startPosition = { x: g.startPosition.x, y: g.startPosition.y };
    }
    if (g.verbs && Array.isArray(g.verbs)) {
      state.game.verbs = g.verbs.map(v => ({ id: v.id, label: v.label }));
    }
    if (g.defaultResponses) {
      state.game.defaultResponses = { ...state.game.defaultResponses, ...g.defaultResponses };
    }

    // --- Rooms ---
    for (const roomYaml of rooms) {
      const r = roomYaml.room || roomYaml;
      state.rooms.push({
        id:           r.id,
        name:         r.name         || r.id,
        description:  r.description  || '',
        background:   r.background   ? _clone(r.background)   : { type: 'procedural', generator: null },
        lighting:     r.lighting != null ? _clone(r.lighting) : null,
        walkableArea: r.walkableArea ? _clone(r.walkableArea) : { rects: [] },
        hotspots:     r.hotspots     ? _clone(r.hotspots)     : [],
        exits:        r.exits        ? _clone(r.exits)        : [],
        visuals:      r.visuals      ? _clone(r.visuals)      : [],
      });
    }

    // --- NPCs ---
    if (npcsYaml) {
      const npcList = npcsYaml.npcs || npcsYaml;
      if (Array.isArray(npcList)) {
        for (const npc of npcList) {
          state.npcs.push({
            id:                npc.id,
            name:              npc.name              || npc.id,
            traits:            npc.traits            ? _clone(npc.traits) : {},
            placements:        npc.placements        ? _clone(npc.placements) : [],
            dialogue:          npc.dialogue           || null,
            dialogueOverrides: npc.dialogueOverrides ? _clone(npc.dialogueOverrides) : [],
            barks:             npc.barks             ? [...npc.barks] : [],
            responses:         npc.responses         ? { ...npc.responses } : {},
          });
        }
      }
    }

    // --- Items ---
    if (itemsYaml) {
      const itemList = itemsYaml.items || itemsYaml;
      if (Array.isArray(itemList)) {
        for (const item of itemList) {
          state.items.push({
            id:          item.id,
            name:        item.name        || item.id,
            description: item.description || '',
            icon:        item.icon        ? _clone(item.icon) : { generator: null },
            useOn:       item.useOn       ? { ...item.useOn } : {},
            useDefault:  item.useDefault  || "I can't use that here.",
            responses:   item.responses   ? { ...item.responses } : {},
          });
        }
      }
    }

    // --- Puzzles ---
    if (puzzlesYaml) {
      const puzzleList = puzzlesYaml.puzzles || puzzlesYaml;
      if (Array.isArray(puzzleList)) {
        for (const p of puzzleList) {
          state.puzzles.push({
            id:         p.id,
            trigger:    p.trigger    ? _clone(p.trigger)    : { verb: null, target: null },
            conditions: p.conditions ? _clone(p.conditions) : [],
            actions:    p.actions    ? _clone(p.actions)    : [],
            failText:   p.failText   || null,
          });
        }
      }
    }

    // --- Dialogues ---
    for (const [dId, tree] of Object.entries(dialogues)) {
      state.dialogues[dId] = _clone(tree);
    }

    return state;
  }
}
