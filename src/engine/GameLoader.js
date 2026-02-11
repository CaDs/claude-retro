import yaml from 'js-yaml';

/**
 * GameLoader — Fetches and parses YAML game definition files.
 * Returns a normalized GameDefinition object.
 */
export class GameLoader {
  /**
   * Load a complete game from a manifest YAML file.
   * @param {string} basePath - Base URL path to the content directory
   * @returns {Promise<object>} Normalized game definition
   */
  static async load(basePath) {
    const manifest = await this._loadYaml(`${basePath}/game.yaml`);
    const game = manifest.game;

    // Load all referenced files in parallel
    const [protagonist, items, npcs, puzzles, roomResults, dialogueResults, musicResult] = await Promise.all([
      this._loadYaml(`${basePath}/${game.protagonist}`),
      this._loadYaml(`${basePath}/${game.items}`),
      this._loadYaml(`${basePath}/${game.npcs}`),
      this._loadYaml(`${basePath}/${game.puzzles}`),
      Promise.all(game.rooms.map(path => this._loadYaml(`${basePath}/${path}`))),
      Promise.all(game.dialogues.map(path => this._loadYaml(`${basePath}/${path}`))),
      game.music ? this._loadYaml(`${basePath}/${game.music}`) : Promise.resolve(null),
    ]);

    return {
      title: game.title,
      version: game.version,
      resolution: game.resolution,
      viewportHeight: game.viewportHeight || 140,
      startRoom: game.startRoom,
      startPosition: game.startPosition,
      verbs: game.verbs,
      defaultResponses: game.defaultResponses,
      protagonist: protagonist.protagonist,
      items: this._normalizeItems(items.items),
      npcs: npcs.npcs,
      puzzles: this._normalizePuzzles(puzzles.puzzles),
      rooms: this._normalizeRooms(roomResults),
      dialogues: this._normalizeDialogues(dialogueResults),
      music: musicResult ? this._normalizeMusic(musicResult.music) : null,
    };
  }

  /**
   * Fetch and parse a single YAML file.
   */
  static async _loadYaml(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    return yaml.load(text);
  }

  /**
   * Normalize items array into a keyed map.
   */
  static _normalizeItems(items) {
    const map = {};
    for (const item of items) {
      map[item.id] = item;
    }
    return map;
  }

  /**
   * Normalize puzzles into a lookup-friendly structure.
   * Builds trigger keys for fast matching.
   */
  static _normalizePuzzles(puzzles) {
    return puzzles.map(puzzle => {
      const trigger = puzzle.trigger;
      // Build a lookup key: "verb:target" or "verb:item:target"
      let key;
      if (trigger.item) {
        key = `${trigger.verb}:${trigger.item}:${trigger.target}`;
      } else {
        key = `${trigger.verb}:${trigger.target}`;
      }
      return {
        ...puzzle,
        _key: key,
      };
    });
  }

  /**
   * Normalize room definitions into a keyed map.
   * Converts DSL rect format to flat x/y/width/height for engine compat.
   */
  static _normalizeRooms(roomResults) {
    const map = {};
    for (const result of roomResults) {
      const room = result.room;
      // Convert hotspots from DSL format to engine format
      if (room.hotspots) {
        room.hotspots = room.hotspots.map(hs => ({
          id: hs.id,
          name: hs.name,
          x: hs.rect.x,
          y: hs.rect.y,
          width: hs.rect.width,
          height: hs.rect.height,
          walkToX: hs.walkTo?.x,
          walkToY: hs.walkTo?.y,
          visible: hs.visible !== undefined ? hs.visible : undefined,
          // Flatten responses into verb properties for engine compat
          lookAt: hs.responses?.look_at || null,
          pickUp: hs.responses?.pick_up || null,
          use: hs.responses?.use || null,
          open: hs.responses?.open || null,
          close: hs.responses?.close || null,
          push: hs.responses?.push || null,
          pull: hs.responses?.pull || null,
          _responses: hs.responses || {},
        }));
      }
      // Convert exits from DSL format
      if (room.exits) {
        room.exits = room.exits.map(exit => ({
          id: exit.id,
          x: exit.rect.x,
          y: exit.rect.y,
          width: exit.rect.width,
          height: exit.rect.height,
          target: exit.target,
          spawnX: exit.spawnAt?.x,
          spawnY: exit.spawnAt?.y,
          name: exit.name,
          lookAt: exit.lookAt || null,
        }));
      }
      // Preserve visuals array for Z-sorted prop rendering
      room.visuals = room.visuals || [];

      // NPCs are managed by CharacterSystem, not rooms
      // but we keep an empty array for compat
      room.npcs = [];
      map[room.id] = room;
    }
    return map;
  }

  /**
   * Normalize dialogues into a keyed map.
   */
  static _normalizeDialogues(dialogueResults) {
    const map = {};
    for (const result of dialogueResults) {
      const dlg = result.dialogue;
      map[dlg.id] = dlg;
    }
    return map;
  }

  /**
   * Normalize music definition.
   * Parses space-separated note strings into arrays and builds lookup maps.
   */
  static _normalizeMusic(music) {
    if (!music) return null;

    const tracks = {};
    for (const track of (music.tracks || [])) {
      // Parse channel note strings into arrays
      const channels = (track.channels || []).map(ch => ({
        instrument: ch.instrument,
        notes: this._parseNoteList(ch.notes),
      }));
      tracks[track.id] = {
        id: track.id,
        bpm: track.bpm || 120,
        loopLength: track.loopLength || 64,
        channels,
      };
    }

    return {
      tracks,
      roomMusic: music.roomMusic || {},
    };
  }

  /**
   * Parse a YAML note list into a flat array of note strings.
   * Input can be an array of space-separated strings like:
   *   ["C4 - E4 - G4", "A4 - C5 -"]
   * Output: ["C4", "-", "E4", "-", "G4", "A4", "-", "C5", "-"]
   * Dashes represent rests (silence).
   */
  static _parseNoteList(notes) {
    if (!notes || !Array.isArray(notes)) return [];
    const result = [];
    for (const line of notes) {
      if (typeof line === 'string') {
        const tokens = line.split(/\s+/).filter(t => t.length > 0);
        for (const token of tokens) {
          result.push(token === '-' ? null : token);
        }
      } else if (line === null || line === undefined) {
        result.push(null);
      } else {
        result.push(line);
      }
    }
    return result;
  }
}
