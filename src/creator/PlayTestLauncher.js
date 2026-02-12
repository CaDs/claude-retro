/**
 * PlayTestLauncher.js
 *
 * Serializes the current Game Creator state to sessionStorage
 * and opens the main game (index.html) in a new tab for live testing.
 *
 * The output of _buildGameData() MUST exactly match the object shape
 * returned by GameLoader.load() so the engine can consume it directly.
 * Key normalizations:
 *   - rooms → keyed map, hotspots/exits flattened (rect → x/y/width/height)
 *   - items → keyed map
 *   - puzzles → array with _key field, conditions/actions in engine DSL
 *   - dialogues → keyed map
 *   - flat top-level (no game: wrapper)
 */

export class PlayTestLauncher {
  static STORAGE_KEY = 'creator_playtest_data';

  /**
   * Launch a playtest session.
   * @param {import('./CreatorState').CreatorState} state - The creator state to test
   */
  static launch(state) {
    const gameData = PlayTestLauncher._buildGameData(state);
    sessionStorage.setItem(PlayTestLauncher.STORAGE_KEY, JSON.stringify(gameData));
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
      sessionStorage.removeItem(PlayTestLauncher.STORAGE_KEY);
      return data;
    } catch {
      return null;
    }
  }

  /**
   * Build a game data structure matching GameLoader.load() output exactly.
   * See GameLoader.js:36-53 for the reference shape.
   * @private
   */
  static _buildGameData(state) {
    if (!state) return PlayTestLauncher._getDefaultGameData();

    const game = state.game || {};

    return {
      title:            game.title || 'Playtest Game',
      setting:          game.setting || null,
      version:          game.version || '1.0',
      resolution:       game.resolution || { width: 320, height: 200 },
      viewportHeight:   game.viewportHeight || 140,
      startRoom:        game.startRoom || ((state.rooms || [])[0]?.id ?? ''),
      startPosition:    game.startPosition || { x: 160, y: 120 },
      verbs:            game.verbs || [],
      defaultResponses: game.defaultResponses || {},
      protagonist:      PlayTestLauncher._buildProtagonist(game.setting),
      items:            PlayTestLauncher._buildItems(state.items || []),
      npcs:             state.npcs || [],
      puzzles:          PlayTestLauncher._buildPuzzles(state.puzzles || []),
      rooms:            PlayTestLauncher._buildRooms(state.rooms || []),
      dialogues:        PlayTestLauncher._buildDialogues(state.dialogues || {}),
      music:            null,
    };
  }

  /**
   * Build rooms as a keyed map with flattened hotspots/exits.
   * Matches GameLoader._normalizeRooms() output (GameLoader.js:104-165).
   * @private
   */
  static _buildRooms(rooms) {
    const map = {};
    for (const room of rooms) {
      map[room.id] = {
        id:           room.id,
        name:         room.name || 'Unnamed Room',
        description:  room.description || '',
        background:   room.background || {},
        lighting:     room.lighting || null,
        walkableArea: room.walkableArea || { rects: [] },
        visuals:      room.visuals || [],
        npcs:         [],  // NPCs managed by CharacterSystem, not rooms
        hotspots:     (room.hotspots || []).map(hs => ({
          id:       hs.id,
          name:     hs.name,
          x:        hs.rect?.x ?? 0,
          y:        hs.rect?.y ?? 0,
          width:    hs.rect?.width ?? 10,
          height:   hs.rect?.height ?? 10,
          walkToX:  hs.walkTo?.x,
          walkToY:  hs.walkTo?.y,
          visible:  hs.visible !== undefined ? hs.visible : undefined,
          lookAt:   hs.responses?.look_at || null,
          pickUp:   hs.responses?.pick_up || null,
          use:      hs.responses?.use || null,
          open:     hs.responses?.open || null,
          close:    hs.responses?.close || null,
          push:     hs.responses?.push || null,
          pull:     hs.responses?.pull || null,
          _responses: hs.responses || {},
        })),
        exits: (room.exits || []).map(exit => ({
          id:     exit.id,
          x:      exit.rect?.x ?? 0,
          y:      exit.rect?.y ?? 0,
          width:  exit.rect?.width ?? 10,
          height: exit.rect?.height ?? 10,
          target: exit.target || '',
          spawnX: exit.spawnAt?.x,
          spawnY: exit.spawnAt?.y,
          name:   exit.name,
          lookAt: exit.lookAt || null,
        })),
      };
    }
    return map;
  }

  /**
   * Build items as a keyed map.
   * Matches GameLoader._normalizeItems() output (GameLoader.js:71-77).
   * @private
   */
  static _buildItems(items) {
    const map = {};
    for (const item of items) {
      map[item.id] = { ...item };
    }
    return map;
  }

  /**
   * Build puzzles array with _key field and translate conditions/actions
   * from editor format to engine DSL format.
   * Matches GameLoader._normalizePuzzles() output (GameLoader.js:83-98).
   * Condition/action format matches PuzzleSystem expectations (PuzzleSystem.js:25-91).
   * @private
   */
  static _buildPuzzles(puzzles) {
    return puzzles.map(p => {
      const trigger = p.trigger || {};

      // Build lookup key matching GameLoader._normalizePuzzles
      let key;
      if (trigger.item) {
        key = `${trigger.verb}:${trigger.item}:${trigger.target}`;
      } else {
        key = `${trigger.verb}:${trigger.target}`;
      }

      const obj = {
        id:      p.id,
        trigger: { ...trigger },
        _key:    key,
      };

      // Translate conditions from editor format to engine DSL
      if (p.conditions && p.conditions.length > 0) {
        obj.conditions = p.conditions.map(c => {
          if (c.type === 'hasItem')  return { hasItem: c.value };
          if (c.type === '!hasItem') return { notItem: c.value };
          if (c.type === 'hasFlag')  return { hasFlag: c.value };
          if (c.type === '!hasFlag') return { notFlag: c.value };
          return { ...c };
        });
      }

      // Translate actions from editor format to engine DSL
      if (p.actions && p.actions.length > 0) {
        obj.actions = p.actions.map(a => {
          if (a.type === 'say')         return { say: a.text };
          if (a.type === 'addItem')     return { addItem: a.itemId };
          if (a.type === 'removeItem')  return { removeItem: a.itemId };
          if (a.type === 'setFlag')     return { setFlag: a.flag };
          if (a.type === 'removeFlag')  return { removeFlag: a.flag };
          if (a.type === 'walkTo')      return { walkTo: { x: a.x, y: a.y } };
          if (a.type === 'changeRoom')  return { changeRoom: { room: a.roomId, spawnX: a.spawnX, spawnY: a.spawnY } };
          if (a.type === 'showHotspot') return { showHotspot: { id: a.hotspotId } };
          if (a.type === 'hideHotspot') return { hideHotspot: { id: a.hotspotId } };
          if (a.type === 'playSound')   return { playSound: a.sound };
          return { ...a };
        });
      }

      if (p.failText) obj.failText = p.failText;
      return obj;
    });
  }

  /**
   * Build dialogues as a keyed map.
   * Matches GameLoader._normalizeDialogues() output (GameLoader.js:170-177).
   * @private
   */
  static _buildDialogues(dialogues) {
    const map = {};
    for (const [dId, tree] of Object.entries(dialogues)) {
      map[dId] = { ...tree };
    }
    return map;
  }

  /**
   * Build default protagonist traits based on setting.
   * @private
   */
  static _buildProtagonist(setting) {
    const base = {
      bodyType: 'average',
      skinTone: 'fair',
      hairStyle: 'short',
      hairColor: 'brown',
      clothingColor: '#4a86c8',
      facial: 'none',
    };
    switch (setting) {
      case 'scifi':
        return { ...base, clothing: 'jumpsuit', footwear: 'boots', accessory: 'none' };
      case 'contemporary':
        return { ...base, clothing: 'jacket', footwear: 'sneakers', accessory: 'none' };
      case 'eighties':
        return { ...base, clothing: 'neon_jacket', footwear: 'high_tops', accessory: 'sunglasses' };
      default:
        return { ...base, clothing: 'tunic', footwear: 'boots', accessory: 'none' };
    }
  }

  /**
   * Return a minimal valid game data structure for empty/null state.
   * @private
   */
  static _getDefaultGameData() {
    return {
      title: 'Empty Playtest Game',
      setting: null,
      version: '1.0',
      resolution: { width: 320, height: 200 },
      viewportHeight: 140,
      startRoom: 'default_room',
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
      protagonist: {
        bodyType: 'average',
        skinTone: 'fair',
        hairStyle: 'short',
        hairColor: 'brown',
        clothing: 'tunic',
        clothingColor: '#4a86c8',
        facial: 'none',
        footwear: 'boots',
        accessory: 'none',
      },
      items: {},
      npcs: [],
      puzzles: [],
      rooms: {
        default_room: {
          id: 'default_room',
          name: 'Empty Room',
          description: '',
          background: {},
          lighting: null,
          walkableArea: { rects: [{ x: 20, y: 80, width: 280, height: 60 }] },
          hotspots: [],
          exits: [],
          visuals: [],
          npcs: [],
        },
      },
      dialogues: {},
      music: null,
    };
  }
}
