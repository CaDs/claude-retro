/**
 * PlayTestLauncher.js
 *
 * Serializes the current Game Creator state to sessionStorage
 * and opens the main game (index.html) in a new tab for live testing.
 */

export class PlayTestLauncher {
  static STORAGE_KEY = 'creator_playtest_data';

  /**
   * Launch a playtest session.
   * @param {import('./CreatorState').CreatorState} state - The creator state to test
   */
  static launch(state) {
    // Build a game data object that matches what GameLoader.load() produces
    const gameData = PlayTestLauncher._buildGameData(state);

    // Store in sessionStorage so it survives the new tab open
    sessionStorage.setItem(PlayTestLauncher.STORAGE_KEY, JSON.stringify(gameData));

    // Open the game in a new tab with a query param to signal playtest mode
    window.open('index.html?playtest=1', '_blank');
  }

  /**
   * Check if playtest data exists in sessionStorage.
   * Called by GameLoader to determine if we should use creator data instead of YAML files.
   * @returns {object|null}
   */
  static getPlaytestData() {
    const raw = sessionStorage.getItem(PlayTestLauncher.STORAGE_KEY);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      // Clear after reading so refreshing the game page loads normally
      sessionStorage.removeItem(PlayTestLauncher.STORAGE_KEY);
      return data;
    } catch {
      return null;
    }
  }

  /**
   * Build a game data structure matching what GameLoader produces.
   * @private
   */
  static _buildGameData(state) {
    // Handle null/undefined state gracefully
    if (!state) {
      return PlayTestLauncher._getDefaultGameData();
    }

    const game = state.game || {};
    const rooms = state.rooms || [];
    const npcs = state.npcs || [];
    const items = state.items || [];
    const puzzles = state.puzzles || [];
    const dialogues = state.dialogues || [];

    // Build rooms array with normalized format
    const normalizedRooms = rooms.map(room => ({
      id: room.id || 'unknown_room',
      name: room.name || 'Unnamed Room',
      background: room.background || {},
      hotspots: (room.hotspots || []).map(h => ({
        id: h.id || 'unknown_hotspot',
        name: h.name || 'Unnamed Hotspot',
        x: h.rect?.x ?? 0,
        y: h.rect?.y ?? 0,
        width: h.rect?.width ?? 10,
        height: h.rect?.height ?? 10,
        walkTo: h.walkTo || null,
        visible: h.visible !== false,
        responses: h.responses || {},
      })),
      exits: (room.exits || []).map(e => ({
        id: e.id || 'unknown_exit',
        name: e.name || 'Unnamed Exit',
        x: e.rect?.x ?? 0,
        y: e.rect?.y ?? 0,
        width: e.rect?.width ?? 10,
        height: e.rect?.height ?? 10,
        target: e.target || '',
        walkTo: e.walkTo || null,
        spawnAt: e.spawnAt || null,
        lookAt: e.lookAt || `Exit to ${e.target || 'another room'}`,
      })),
      walkableAreas: room.walkableAreas || [],
      visuals: room.visuals || [],
    }));

    // Build NPCs array
    const normalizedNpcs = npcs.map(npc => ({
      id: npc.id || 'unknown_npc',
      name: npc.name || 'Unnamed NPC',
      traits: npc.traits || {},
      placements: (npc.placements || []).map(p => ({
        room: p.room || '',
        x: p.x ?? 0,
        y: p.y ?? 0,
        direction: p.direction || 'right',
      })),
      dialogue: npc.dialogue || null,
      responses: npc.responses || {},
      idleLines: npc.idleLines || [],
    }));

    // Build items array
    const normalizedItems = items.map(item => ({
      id: item.id || 'unknown_item',
      name: item.name || 'Unnamed Item',
      icon: item.icon || 'default',
      useDefault: item.useDefault || '',
      responses: item.responses || {},
    }));

    // Build puzzles array
    const normalizedPuzzles = puzzles.map(puzzle => ({
      id: puzzle.id || 'unknown_puzzle',
      trigger: puzzle.trigger || '',
      conditions: puzzle.conditions || [],
      actions: puzzle.actions || [],
    }));

    // Build dialogues
    const normalizedDialogues = dialogues.map(dlg => ({
      id: dlg.id || 'unknown_dialogue',
      nodes: (dlg.nodes || []).map(node => ({
        id: node.id || 'unknown_node',
        text: node.text || '',
        choices: node.choices || [],
        next: node.next || null,
        action: node.action || null,
      })),
      idleLines: dlg.idleLines || [],
    }));

    // Determine start room (first room if not specified)
    const startRoom = game.startRoom || (normalizedRooms[0]?.id ?? '');

    // Default verbs if none specified
    const defaultVerbs = [
      'Walk to', 'Look at', 'Pick up', 'Use', 'Open', 'Close', 'Talk to', 'Push', 'Pull'
    ];

    return {
      game: {
        title: game.title || 'Playtest Game',
        resolution: game.resolution || { width: 320, height: 200 },
        startRoom: startRoom,
        verbs: (game.verbs && game.verbs.length > 0) ? game.verbs : defaultVerbs,
        defaultResponses: game.defaultResponses || {},
      },
      rooms: normalizedRooms,
      npcs: normalizedNpcs,
      items: normalizedItems,
      puzzles: normalizedPuzzles,
      dialogues: normalizedDialogues,
    };
  }

  /**
   * Return a minimal valid game data structure for empty state.
   * @private
   */
  static _getDefaultGameData() {
    return {
      game: {
        title: 'Empty Playtest Game',
        resolution: { width: 320, height: 200 },
        startRoom: 'default_room',
        verbs: [
          'Walk to', 'Look at', 'Pick up', 'Use', 'Open', 'Close', 'Talk to', 'Push', 'Pull'
        ],
        defaultResponses: {
          'Walk to': 'I can\'t walk there.',
          'Look at': 'I don\'t see anything special.',
          'Pick up': 'I can\'t pick that up.',
          'Use': 'That doesn\'t work.',
          'Open': 'I can\'t open that.',
          'Close': 'I can\'t close that.',
          'Talk to': 'There\'s no one to talk to.',
          'Push': 'I can\'t push that.',
          'Pull': 'I can\'t pull that.',
        },
      },
      rooms: [
        {
          id: 'default_room',
          name: 'Empty Room',
          background: {},
          hotspots: [],
          exits: [],
          walkableAreas: [],
          visuals: [],
        }
      ],
      npcs: [],
      items: [],
      puzzles: [],
      dialogues: [],
    };
  }
}
