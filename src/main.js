import { Renderer } from './engine/Renderer.js';
import { AssetLoader } from './engine/AssetLoader.js';
import { InputManager } from './engine/InputManager.js';
import { ProceduralAssets } from './engine/ProceduralAssets.js';
import { GameLoader } from './engine/GameLoader.js';
import { ContentRegistry } from './engine/ContentRegistry.js';
import { SceneManager } from './systems/SceneManager.js';
import { VerbSystem } from './systems/VerbSystem.js';
import { InventorySystem } from './systems/InventorySystem.js';
import { DialogueSystem } from './systems/DialogueSystem.js';
import { WalkingSystem } from './systems/WalkingSystem.js';
import { ScriptRunner } from './systems/ScriptRunner.js';
import { SaveSystem } from './systems/SaveSystem.js';
import { CharacterSystem } from './systems/CharacterSystem.js';
import { CharacterGenerator } from './engine/CharacterGenerator.js';
import { PuzzleSystem } from './systems/PuzzleSystem.js';
import { AudioSystem } from './systems/AudioSystem.js';
import { LightingSystem } from './engine/LightingSystem.js';
import { registerAllTemplates } from './templates/index.js';

/**
 * GameEngine — Data-driven game engine orchestrating all systems.
 * All game content is loaded from YAML DSL files via GameLoader.
 */
class GameEngine {
  constructor() {
    this.canvas = document.getElementById('game-canvas');

    // These get initialized properly after content is loaded
    this.renderer = null;
    this.input = null;
    this.assets = new AssetLoader();
    this.scenes = new SceneManager();
    this.verbs = new VerbSystem();
    this.inventory = new InventorySystem();
    this.dialogue = new DialogueSystem();
    this.walking = new WalkingSystem();
    this.scripts = new ScriptRunner();
    this.save = new SaveSystem();
    this.audio = new AudioSystem();
    this.lighting = new LightingSystem();

    // Frame counter for animated props
    this._frameCount = 0;

    // These are set after loading
    this.content = null;
    this.characters = null;
    this.puzzles = null;

    // Game state flags
    this.flags = {};
    this.messageText = '';
    this.messageTimer = 0;
    this.showingEnding = false;
    this.endingTimer = 0;

    // Pause menu
    this._pauseMenuOpen = false;

    // Current room NPC cache
    this._currentRoomNpcs = [];

    // Audio footstep throttle
    this._footstepTimer = 0;
    this._footstepInterval = 14; // frames between footstep sounds

    // Time of day system
    this._timeOfDayPeriods = ['morning', 'afternoon', 'evening', 'night'];
    this._timeOfDayIndex = 0;
    this.timeOfDay = 'morning';
    this._timeOfDayTimer = 0;
    this._timeOfDayInterval = 3600; // ~60s at 60fps per period

    // Ambient bark state
    this._barkCooldown = 0;
    this._barkText = '';
    this._barkNpc = null;
    this._barkTimer = 0;

    // Pause menu layout
    this._pauseMenuLayout = { startY: 75, itemHeight: 18, minX: 100, maxX: 220 };
  }

  async init() {
    // Load game content from YAML DSL
    const contentPath = './content/enchanted_tankard';
    let gameDef;
    try {
      gameDef = await GameLoader.load(contentPath);
    } catch (err) {
      console.error('Failed to load game content:', err);
      throw err;
    }

    // Initialize content registry
    this.content = new ContentRegistry(gameDef);

    // Initialize renderer with game resolution
    const res = this.content.resolution;
    this.renderer = new Renderer(this.canvas, res.width, res.height);
    this.input = new InputManager(this.canvas, res.width, res.height);

    // Initialize data-driven systems
    this.characters = new CharacterSystem(this.content);
    this.puzzles = new PuzzleSystem(this.content);

    // Register all rooms from content
    for (const [id, room] of Object.entries(this.content.getAllRooms())) {
      this.scenes.registerRoom(id, room);
    }

    // Register all room templates
    registerAllTemplates();

    // Generate procedural pixel art assets (legacy path)
    ProceduralAssets.generateAll(this.assets);

    // Generate template-based backgrounds (new path — additive, won't overwrite legacy)
    ProceduralAssets.generateTemplateBackgrounds(this.assets, this.content);

    // Simulate brief loading for effect
    const loadingFill = document.getElementById('loading-fill');
    if (loadingFill) loadingFill.style.width = '100%';
    await new Promise(r => setTimeout(r, 500));

    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.classList.add('hidden');

    // Initialize starting room
    this.scenes.loadRoom(this.content.startRoom);
    this.walking.setPosition(this.content.startPosition.x, this.content.startPosition.y);
    this._refreshRoomNpcs();
    this._configureLighting();

    // Check for saved game
    if (this.save.hasSave()) {
      this.loadGame();
    }

    // Start game loop
    this.lastTime = performance.now();
    this._loop();
  }

  /**
   * Refresh the NPC list for the current room.
   */
  _refreshRoomNpcs() {
    const roomId = this.scenes.currentRoomId;
    this._currentRoomNpcs = roomId ? this.characters.getNpcsInRoom(roomId) : [];
  }

  /**
   * Configure lighting for the current room.
   * Reads from YAML definition if available, falls back to legacy hardcoded values.
   */
  _configureLighting() {
    this.lighting.clear();
    const roomId = this.scenes.currentRoomId;
    const room = this.content.getRoom(roomId);

    // New path: read lighting from room YAML definition
    if (room && room.lighting) {
      if (room.lighting.ambient) {
        this.lighting.setAmbient(room.lighting.ambient.color, room.lighting.ambient.intensity);
      }
      for (const light of (room.lighting.lights || [])) {
        this.lighting.addLight(light.x, light.y, light.radius, light.color, light.intensity, light.flicker);
      }
      return;
    }

    // Legacy fallback: hardcoded lighting per room
    this._configureLightingLegacy(roomId);
  }

  /**
   * Legacy hardcoded lighting for existing Enchanted Tankard rooms.
   */
  _configureLightingLegacy(roomId) {
    switch (roomId) {
      case 'tavern':
        this.lighting.setAmbient('#1a1000', 0.15);
        this.lighting.addLight(27, 65, 60, '#ff8844', 0.6, true);  // fireplace
        this.lighting.addLight(123, 8, 30, '#ffaa44', 0.4, true);   // lantern left
        this.lighting.addLight(203, 8, 30, '#ffaa44', 0.4, true);   // lantern right
        break;
      case 'village_square':
        this.lighting.setAmbient('#000020', 0.05);
        break;
      case 'forest_path':
        this.lighting.setAmbient('#002200', 0.2);
        this.lighting.addLight(95, 70, 15, '#eeee66', 0.3, false);  // light shaft
        this.lighting.addLight(160, 70, 15, '#eeee66', 0.3, false);
        this.lighting.addLight(225, 70, 15, '#eeee66', 0.3, false);
        this.lighting.addLight(215, 110, 20, '#44ff44', 0.2, true);  // mushroom glow
        break;
      case 'temple':
        this.lighting.setAmbient('#050510', 0.25);
        this.lighting.addLight(110, 75, 30, '#ffaa33', 0.5, true);   // altar glow (flickering)
        this.lighting.addLight(290, 40, 45, '#aabbcc', 0.35, false); // wall opening (steady)
        break;
    }
  }

  /**
   * Play the BGM track assigned to a room (if any).
   * Skips if the same track is already playing.
   */
  _playRoomMusic(roomId) {
    if (!this.audio.initialized) return;
    const track = this.content.getRoomMusic(roomId);
    if (track && track.id !== this.audio._currentTrackId) {
      this.audio.playTrack(track);
    } else if (!track) {
      this.audio.stopTrack();
    }
  }

  /**
   * Main game loop.
   */
  _loop() {
    requestAnimationFrame(() => this._loop());

    this._frameCount++;
    this.input.update();
    this.update();
    this.render();
  }

  /**
   * Update all game systems.
   */
  update() {
    // Lazy-init audio on first click (browser autoplay policy)
    if (this.input.clicked && !this.audio.initialized) {
      this.audio.init();
      // Start BGM for the current room
      this._playRoomMusic(this.scenes.currentRoomId);
    }

    // Escape key: toggle pause menu or cancel dialogue
    if (this.input.escapePressed) {
      if (this._pauseMenuOpen) {
        this._pauseMenuOpen = false;
        return;
      } else if (this.dialogue.active) {
        this.dialogue.end();
        return;
      } else {
        this._pauseMenuOpen = true;
        return;
      }
    }

    // Pause menu: handle clicks then skip all game updates
    if (this._pauseMenuOpen) {
      if (this.input.clicked) {
        this._handlePauseMenuClick(this.input.clickX, this.input.clickY);
      }
      return;
    }

    // Clear barks during dialogue/scripts so they don't freeze on screen
    if (this.dialogue.active || this.scripts.isRunning()) {
      this._barkTimer = 0;
      this._barkNpc = null;
    }

    // Don't process game input during dialogues or scripts
    if (this.dialogue.active) {
      this.dialogue.update(this.input, this.renderer);
      return;
    }

    if (this.scripts.isRunning()) {
      this.scripts.update(this._getScriptHandlers());
      return;
    }

    if (this.showingEnding) {
      this.endingTimer++;
      return;
    }

    // Update walking
    this.walking.update();

    // Footstep SFX while walking
    if (this.walking.walking) {
      this._footstepTimer++;
      if (this._footstepTimer >= this._footstepInterval) {
        this._footstepTimer = 0;
        this.audio.playSfx('footstep');
      }
    } else {
      this._footstepTimer = 0;
    }

    // Time of day cycling
    this._timeOfDayTimer++;
    if (this._timeOfDayTimer >= this._timeOfDayInterval) {
      this._timeOfDayTimer = 0;
      this._timeOfDayIndex = (this._timeOfDayIndex + 1) % this._timeOfDayPeriods.length;
      this.timeOfDay = this._timeOfDayPeriods[this._timeOfDayIndex];
    }

    // Ambient bark system
    this._updateBarks();

    // Message timer
    if (this.messageTimer > 0) {
      this.messageTimer--;
      if (this.messageTimer <= 0) this.messageText = '';
    }

    // Find what's under the cursor
    const hoveredHotspot = this._getHoveredHotspot();
    const hoveredExit = this._getHoveredExit();
    const hoveredNpc = this._getHoveredNpc();
    const hoveredInvItem = this.inventory.getHoveredItem(this.input);
    const hoveredName = hoveredNpc?.name || hoveredHotspot?.name ||
                        hoveredExit?.name || hoveredInvItem?.name || '';

    // Build action text
    this.verbs.buildActionText(hoveredName);

    // Handle verb bar clicks
    if (this.verbs.update(this.input)) {
      // Verb was selected, clear item selection
      this.inventory.selectedItem = null;
      this.audio.playSfx('ui_click');
      return;
    }

    // Handle inventory clicks
    const clickedItem = this.inventory.update(this.input, this.assets);
    if (clickedItem) {
      // If "Use" is selected, set this as the subject
      if (this.verbs.selectedVerb === 'Use' || this.verbs.selectedVerb === 'Give') {
        this.verbs.selectedItem = clickedItem;
      } else if (this.verbs.selectedVerb === 'Look at') {
        const itemDef = this.content.getItem(clickedItem.id);
        if (itemDef) this.showMessage(itemDef.description);
      }
      return;
    }

    // Handle clicks in the game viewport
    const vh = this.content.viewportHeight;
    if (this.input.clicked && this.input.clickY < vh) {
      const clickX = this.input.clickX;
      const clickY = this.input.clickY;

      // Find objects at click position (not hover position)
      const clickedNpc = this._findNpcAt(clickX, clickY);
      const clickedHotspot = this._findHotspotAt(clickX, clickY);
      const clickedExit = this._findExitAt(clickX, clickY);

      // Check NPC click
      if (clickedNpc) {
        this._handleNpcInteraction(clickedNpc);
        return;
      }

      // Check hotspot click
      if (clickedHotspot) {
        this._handleHotspotInteraction(clickedHotspot);
        return;
      }

      // Check exit click
      if (clickedExit) {
        this._handleExitInteraction(clickedExit);
        return;
      }

      // Otherwise walk to destination
      if (clickY >= 80 && clickY <= vh) {
        const walkTarget = this.scenes.getClosestWalkable(clickX, clickY);
        this.walking.walkTo(walkTarget.x, walkTarget.y);
      }
    }

  }

  /**
   * Get walk-to position for an object (hotspot or NPC).
   */
  _getWalkTarget(obj) {
    return {
      x: obj.walkToX || obj.x + obj.width / 2,
      y: obj.walkToY || obj.y + obj.height,
    };
  }

  /**
   * Handle clicking on a hotspot.
   */
  _handleHotspotInteraction(hotspot) {
    const verb = this.verbs.selectedVerb.toLowerCase();
    const verbId = verb.replace(/\s+/g, '_'); // 'look at' → 'look_at'
    const item = this.verbs.selectedItem;

    // Walk to hotspot first, then interact
    const { x: walkX, y: walkY } = this._getWalkTarget(hotspot);

    this.walking.walkTo(walkX, walkY, () => {
      // 1. Check puzzles first (item + target)
      if (item) {
        const result = this.puzzles.tryResolveWithItem(verbId, item.id, hotspot.id, this.flags, this.inventory);
        if (result) {
          if (result.failText) {
            this.showMessage(result.failText);
          } else if (result.actions) {
            this.scripts.run(this.puzzles.toScriptActions(result.actions), () => {
              this.verbs.selectedItem = null;
            });
          }
          return;
        }

        // Check item useOn for this target
        const itemDef = this.content.getItem(item.id);
        if (itemDef && itemDef.useOn) {
          const useOnResult = itemDef.useOn[hotspot.id];
          if (useOnResult === 'puzzle') {
            // Already checked puzzles above — show fail text or default
            this.showMessage(itemDef.useDefault || this._getDefaultResponse(verbId));
            return;
          } else if (typeof useOnResult === 'string') {
            this.showMessage(useOnResult);
            this.verbs.selectedItem = null;
            return;
          }
        }

        // Item useDefault
        if (itemDef && itemDef.useDefault) {
          this.showMessage(itemDef.useDefault);
          this.verbs.selectedItem = null;
          return;
        }
      }

      // 2. Verb + target puzzle (e.g., 'pick_up:rope_on_stall')
      const result = this.puzzles.tryResolve(verbId, hotspot.id, this.flags, this.inventory);
      if (result) {
        if (result.failText) {
          this.showMessage(result.failText);
        } else if (result.actions) {
          this.scripts.run(this.puzzles.toScriptActions(result.actions), () => {
            this.verbs.selectedItem = null;
          });
        }
        return;
      }

      // 3. Hotspot's built-in responses
      const verbKey = verb.replace(/\s+(\w)/g, (_, c) => c.toUpperCase()); // 'look at' → 'lookAt'
      const response = hotspot[verbKey] || hotspot._responses?.[verbId];
      if (response) {
        this.showMessage(response);
        return;
      }

      // 4. Default response
      this.showMessage(this._getDefaultResponse(verbId));
    });
  }

  /**
   * Handle clicking on an NPC.
   */
  _handleNpcInteraction(npc) {
    const verb = this.verbs.selectedVerb.toLowerCase();
    const verbId = verb.replace(/\s+/g, '_');
    const item = this.verbs.selectedItem;

    const { x: walkX, y: walkY } = this._getWalkTarget(npc);

    this.walking.walkTo(walkX, walkY, () => {
      // Use item on NPC
      if (item && (verbId === 'use' || verbId === 'give')) {
        // Check puzzle first
        const puzzleResult = this.puzzles.tryResolveWithItem(verbId, item.id, npc.id, this.flags, this.inventory);
        if (puzzleResult) {
          if (puzzleResult.failText) {
            this.showMessage(puzzleResult.failText);
          } else if (puzzleResult.actions) {
            this.scripts.run(this.puzzles.toScriptActions(puzzleResult.actions), () => {
              this.verbs.selectedItem = null;
            });
          }
          return;
        }

        // Check item useOn for this NPC
        const itemDef = this.content.getItem(item.id);
        if (itemDef && itemDef.useOn) {
          const useOnResult = itemDef.useOn[npc.id];
          if (useOnResult === 'puzzle') {
            // Puzzle not matched — defer to dialogue or show default
            this._startDialogue(npc);
            return;
          } else if (typeof useOnResult === 'string') {
            this.showMessage(useOnResult);
            this.verbs.selectedItem = null;
            return;
          }
        }

        // Default: start dialogue for give/use
        this._startDialogue(npc);
        return;
      }

      // Talk to NPC
      if (verbId === 'talk_to' || verbId === 'use') {
        this._startDialogue(npc);
      } else if (verbId === 'look_at') {
        // Check NPC responses
        const npcResponse = this.characters.getNpcResponse(npc.id, 'look_at');
        this.showMessage(npcResponse || npc.lookAt || `It's ${npc.name}.`);
      } else {
        // Check NPC-specific response for this verb
        const npcResponse = this.characters.getNpcResponse(npc.id, verbId);
        if (npcResponse) {
          this.showMessage(npcResponse);
        } else {
          this.showMessage(this._getDefaultResponse(verbId));
        }
      }
    });
  }

  /**
   * Handle clicking on an exit.
   */
  _handleExitInteraction(exit) {
    const verb = this.verbs.selectedVerb.toLowerCase();

    if (verb === 'look at') {
      this.showMessage(exit.lookAt || `It leads to ${exit.name}.`);
      return;
    }

    // Walk to exit, then transition
    const walkX = exit.walkTo?.x || (exit.x + exit.width / 2);
    const walkY = exit.walkTo?.y || Math.min(exit.y + exit.height, 135);

    this.walking.walkTo(walkX, walkY, async () => {
      this.audio.playSfx('door');
      await this.renderer.fadeOut();
      this.scenes.loadRoom(exit.target);
      this.walking.setPosition(exit.spawnX, exit.spawnY);
      this.verbs.selectedItem = null;
      this._refreshRoomNpcs();
      this._configureLighting();
      this._playRoomMusic(exit.target);
      await this.renderer.fadeIn();
    });
  }

  /**
   * Start a dialogue with an NPC.
   */
  _startDialogue(npc) {
    const npcDef = npc._npcDef || this.content.getNpc(npc.id);
    if (!npcDef) {
      this.showMessage(`${npc.name} doesn't seem to want to talk right now.`);
      return;
    }

    // Get the appropriate dialogue tree (with overrides)
    const tree = this.content.getDialogueForNpc(npcDef, this.flags, this.inventory);
    if (!tree) {
      this.showMessage(`${npc.name} doesn't seem to want to talk right now.`);
      return;
    }

    // Check for idle lines first (exhausted NPC)
    if (this.dialogue.tryIdleLine(npc.name, npc.id, tree)) {
      return;
    }

    // Start the dialogue tree with game state for condition checking
    this.audio.playSfx('talk');
    const gameState = { flags: this.flags, inventory: this.inventory };
    this.dialogue.start(npc.name, tree, (action) => {
      this._handleDialogueAction(action);
    }, () => {
      // Dialogue complete
    }, npc.id, gameState);
  }

  /**
   * Handle actions triggered by dialogue nodes.
   * Supports DSL format: { setFlag: 'x' }, { addItem: 'y' }, { removeItem: 'z' }
   * as well as legacy format: { type: 'set_flag', flag: 'x' }
   */
  _handleDialogueAction(action) {
    if (!action) return;

    // DSL format actions
    if (action.setFlag) {
      this.flags[action.setFlag] = true;
      return;
    }
    if (action.addItem) {
      const itemDef = this.content.getItem(action.addItem);
      if (itemDef) {
        this.inventory.addItem({ id: itemDef.id, name: itemDef.name });
        this.audio.playSfx('pickup');
      }
      return;
    }
    if (action.removeItem) {
      this.inventory.removeItem(action.removeItem);
      return;
    }

    // Legacy format actions
    switch (action.type) {
      case 'set_flag':
        this.flags[action.flag] = true;
        break;
      case 'trade':
        if (action.give && this.inventory.hasItem(action.give)) {
          this.inventory.removeItem(action.give);
        }
        if (action.receive) {
          const itemDef = this.content.getItem(action.receive);
          if (itemDef) {
            this.inventory.addItem({ id: itemDef.id, name: itemDef.name });
          }
        }
        break;
      case 'add_item': {
        const itemDef = this.content.getItem(action.item);
        if (itemDef) {
          this.inventory.addItem({ id: itemDef.id, name: itemDef.name });
          this.audio.playSfx('pickup');
        }
        break;
      }
      case 'check_item':
        if (!this.inventory.hasItem(action.item)) {
          this.dialogue.goToNode('coin_hint');
        }
        break;
    }
  }

  /**
   * Get script action handlers.
   */
  _getScriptHandlers() {
    return {
      say: (action) => {
        this.showMessage(action.text, 120);
        this.audio.playSfx('talk');
      },
      add_item: (action) => {
        const itemDef = this.content.getItem(action.item);
        if (itemDef) {
          this.inventory.addItem({ id: itemDef.id, name: itemDef.name });
          this.audio.playSfx('pickup');
        }
      },
      remove_item: (action) => {
        this.inventory.removeItem(action.item);
      },
      set_flag: (action) => {
        this.flags[action.flag] = true;
      },
      hide_hotspot: (action) => {
        const room = this.scenes.rooms[action.room];
        if (room && room.hotspots) {
          const hs = room.hotspots.find(h => h.id === action.hotspot);
          if (hs) hs.visible = false;
        }
      },
      show_ending: () => {
        this.showingEnding = true;
        this.endingTimer = 0;
      },
    };
  }

  /**
   * Get default response for a verb.
   */
  _getDefaultResponse(verbId) {
    return this.content.defaultResponses?.[verbId] || "I can't do that.";
  }

  /**
   * Get the hotspot under the mouse.
   */
  _getHoveredHotspot() {
    const room = this.scenes.getRoom();
    if (!room || !room.hotspots) return null;

    for (const hs of room.hotspots) {
      if (hs.visible === false) continue;
      if (this.input.isMouseInRect(hs.x, hs.y, hs.width, hs.height)) {
        return hs;
      }
    }
    return null;
  }

  /**
   * Get the exit under the mouse.
   */
  _getHoveredExit() {
    const room = this.scenes.getRoom();
    if (!room || !room.exits) return null;

    for (const exit of room.exits) {
      if (this.input.isMouseInRect(exit.x, exit.y, exit.width, exit.height)) {
        return exit;
      }
    }
    return null;
  }

  /**
   * Get the NPC under the mouse.
   */
  _getHoveredNpc() {
    for (const npc of this._currentRoomNpcs) {
      if (this.input.isMouseInRect(npc.x, npc.y, npc.width, npc.height)) {
        return npc;
      }
    }
    return null;
  }

  /**
   * Find a hotspot at a specific point.
   */
  _findHotspotAt(x, y) {
    const room = this.scenes.getRoom();
    if (!room || !room.hotspots) return null;
    for (const hs of room.hotspots) {
      if (hs.visible === false) continue;
      if (this.input.isInRect(x, y, hs.x, hs.y, hs.width, hs.height)) {
        return hs;
      }
    }
    return null;
  }

  /**
   * Find an exit at a specific point.
   */
  _findExitAt(x, y) {
    const room = this.scenes.getRoom();
    if (!room || !room.exits) return null;
    for (const exit of room.exits) {
      if (this.input.isInRect(x, y, exit.x, exit.y, exit.width, exit.height)) {
        return exit;
      }
    }
    return null;
  }

  /**
   * Find an NPC at a specific point.
   */
  _findNpcAt(x, y) {
    for (const npc of this._currentRoomNpcs) {
      if (this.input.isInRect(x, y, npc.x, npc.y, npc.width, npc.height)) {
        return npc;
      }
    }
    return null;
  }

  /**
   * Display a message. Duration scales with text length.
   */
  showMessage(text, frames) {
    this.messageText = text;
    // Dynamic duration: ~60 frames per word, minimum 120, max 600
    if (frames === undefined) {
      const wordCount = text.split(/\s+/).length;
      frames = Math.max(120, Math.min(600, wordCount * 60));
    }
    this.messageTimer = frames;
  }

  /**
   * Render everything.
   */
  render() {
    this.renderer.begin();

    // Render room background
    this.scenes.renderBackground(this.renderer, this.assets);

    // Time-of-day indicator (top-right of game viewport)
    this._renderTimeOfDay();

    // Z-sorted rendering of props, NPCs, and protagonist
    this._renderZSorted();

    // Lighting overlay
    this.lighting.render(this.renderer, this._frameCount);

    // Render ambient NPC bark bubble
    if (this._barkTimer > 0 && this._barkNpc) {
      this._renderBark();
    }

    // Message text (above UI panel)
    if (this.messageText) {
      this._renderMessageBox();
    }

    // Render dialogue overlay
    this.dialogue.render(this.renderer, this.input);

    // UI Panel background
    renderer_drawUIPanel(this.renderer);

    // Render verb bar
    this.verbs.render(this.renderer);

    // Render inventory
    this.inventory.render(this.renderer, this.assets);

    // Pause menu overlay
    if (this._pauseMenuOpen) {
      this._renderPauseMenu();
    }

    // Custom cursor
    this._renderCursor();

    // Ending screen
    if (this.showingEnding) {
      this._renderEnding();
    }

    this.renderer.end();
  }

  /**
   * Z-sorted rendering of all scene entities: props, NPCs, protagonist.
   * Entities are sorted by their bottom Y coordinate (+ optional zOffset).
   */
  _renderZSorted() {
    const renderables = [];

    // Collect room props (visuals)
    const room = this.scenes.getRoom();
    if (room && room.visuals) {
      for (const prop of room.visuals) {
        const size = ProceduralAssets.getPropSize(prop.type, prop.variant);
        renderables.push({
          kind: 'prop',
          data: prop,
          sortY: prop.y + size.height + (prop.zOffset || 0),
        });
      }
    }

    // Collect NPCs
    for (const npc of this._currentRoomNpcs) {
      renderables.push({
        kind: 'npc',
        data: npc,
        sortY: npc.y + npc.height + (npc.zOffset || 0),
      });
    }

    // Collect protagonist
    const protoTraits = this.characters.protagonist?.traits;
    const protoHeight = protoTraits
      ? CharacterGenerator.getCharacterHeight(protoTraits.bodyType)
      : 30;
    renderables.push({
      kind: 'protagonist',
      sortY: this.walking.y + protoHeight,
    });

    // Sort by sortY ascending (back to front)
    renderables.sort((a, b) => a.sortY - b.sortY);

    // Draw in order
    for (const r of renderables) {
      switch (r.kind) {
        case 'prop':
          ProceduralAssets.drawProp(this.renderer, r.data.type, r.data.x, r.data.y, r.data.variant, this._frameCount);
          break;
        case 'npc':
          this.lighting.drawCharacterShadow(this.renderer, r.data.x + r.data.width / 2, r.data.y + r.data.height, r.data.width);
          this.characters.drawNpc(this.renderer, r.data, 0, r.data.facing);
          break;
        case 'protagonist': {
          let frame;
          if (this.walking.walking) {
            frame = this.walking.frame;
          } else if (this.walking.isIdle) {
            frame = 8 + this.walking.idleFrame;
          } else {
            frame = 0;
          }
          this.lighting.drawCharacterShadow(this.renderer, this.walking.x + 10, this.walking.y + protoHeight, 16);
          this.characters.drawProtagonist(
            this.renderer,
            this.walking.x,
            this.walking.y,
            frame,
            this.walking.direction
          );
          break;
        }
      }
    }
  }

  /**
   * Render message box.
   */
  _renderMessageBox() {
    const px = this.walking.x;
    const py = Math.max(10, this.walking.y - 50);
    const maxW = 200;
    const startX = Math.max(4, Math.min(px - maxW / 2, 320 - maxW - 4));

    const textOptions = {
      color: '#fff',
      size: 7,
      lineHeight: 10,
    };

    // Calculate height dynamically
    const textHeight = this.renderer.measureTextWrappedHiRes(this.messageText, maxW, textOptions);

    // Draw a semi-transparent background for readability
    this.renderer.drawRect(startX - 4, py - 4, maxW + 8, textHeight + 8, 'rgba(0,0,0,0.6)');

    this.renderer.drawTextWrappedHiRes(this.messageText, startX, py, maxW, textOptions);
  }

  /**
   * Render pause menu overlay.
   */
  _renderPauseMenu() {
    // Dark overlay over full 320x200
    this.renderer.drawRect(0, 0, 320, 200, 'rgba(0,0,0,0.75)');

    // Title
    this.renderer.drawTextHiRes('PAUSED', 160, 40, {
      align: 'center', color: '#ffdd57', size: 12,
    });

    // Menu items
    const items = ['Resume', 'Save Game', 'Load Game', 'Restart'];
    const { startY, itemHeight, minX, maxX } = this._pauseMenuLayout;
    for (let i = 0; i < items.length; i++) {
      const y = startY + i * itemHeight;
      const isHovered = this.input.mouseY >= y && this.input.mouseY < y + itemHeight
        && this.input.mouseX >= minX && this.input.mouseX < maxX;
      this.renderer.drawTextHiRes(items[i], 160, y, {
        align: 'center',
        color: isHovered ? '#ffdd57' : '#a0c0ff',
        size: 8,
      });
    }

    // Hint at bottom
    this.renderer.drawTextHiRes('Press ESC to resume', 160, 160, {
      align: 'center', color: '#666', size: 6,
    });
  }

  /**
   * Handle clicks on pause menu items.
   */
  _handlePauseMenuClick(clickX, clickY) {
    const items = ['resume', 'save', 'load', 'restart'];
    const { startY, itemHeight, minX, maxX } = this._pauseMenuLayout;
    for (let i = 0; i < items.length; i++) {
      const y = startY + i * itemHeight;
      if (clickY >= y && clickY < y + itemHeight && clickX >= minX && clickX < maxX) {
        switch (items[i]) {
          case 'resume':
            this._pauseMenuOpen = false;
            break;
          case 'save':
            this.saveGame();
            this._pauseMenuOpen = false;
            this.showMessage('Game saved!');
            break;
          case 'load':
            if (this.save.hasSave()) {
              this.loadGame();
              this._pauseMenuOpen = false;
              this.showMessage('Game loaded!');
            } else {
              this._pauseMenuOpen = false;
              this.showMessage('No save found.');
            }
            break;
          case 'restart':
            this.save.deleteSave();
            this._restartGame();
            break;
        }
        return;
      }
    }
  }

  /**
   * Reset all game state to initial values (full restart without reload).
   */
  _restartGame() {
    this._pauseMenuOpen = false;

    // Reset game state
    this.flags = {};
    this.messageText = '';
    this.messageTimer = 0;
    this.showingEnding = false;
    this.endingTimer = 0;

    // Reset time of day
    this._timeOfDayIndex = 0;
    this.timeOfDay = 'morning';
    this._timeOfDayTimer = 0;

    // Reset barks
    this._barkCooldown = 0;
    this._barkText = '';
    this._barkNpc = null;
    this._barkTimer = 0;

    // Reset systems
    this.inventory.items = [];
    this.inventory.selectedItem = null;
    this.dialogue.end();
    this.dialogue.restoreExhaustionState({ exhaustedNpcs: {}, idleLineIndex: {} });
    this.scripts.queue = [];
    this.scripts.running = false;
    this.scripts.currentAction = null;
    this.scripts.waitTimer = 0;
    this.verbs.selectedVerb = 'Look at';
    this.verbs.selectedItem = null;

    // Reload all rooms to reset hotspot visibility
    for (const [id, room] of Object.entries(this.content.getAllRooms())) {
      this.scenes.registerRoom(id, room);
    }

    // Move to starting room/position
    this.scenes.loadRoom(this.content.startRoom);
    this.walking.setPosition(this.content.startPosition.x, this.content.startPosition.y);
    this._refreshRoomNpcs();
    this._configureLighting();
  }

  /**
   * Render time-of-day indicator.
   */
  _renderTimeOfDay() {
    const labels = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night' };
    const colors = { morning: '#ffdd57', afternoon: '#ffaa33', evening: '#cc7733', night: '#6688cc' };
    const label = labels[this.timeOfDay] || this.timeOfDay;
    const color = colors[this.timeOfDay] || '#888';
    this.renderer.drawTextHiRes(label, 310, 2, { size: 6, color, align: 'right' });
  }

  /**
   * Update ambient bark system — periodically show speech bubbles over NPCs.
   */
  _updateBarks() {
    // Count down active bark display
    if (this._barkTimer > 0) {
      this._barkTimer--;
      if (this._barkTimer <= 0) {
        this._barkText = '';
        this._barkNpc = null;
      }
      return; // Don't start new bark while one is showing
    }

    // Count down cooldown between barks
    if (this._barkCooldown > 0) {
      this._barkCooldown--;
      return;
    }

    // Pick a random NPC with barks in the current room
    const npcsWithBarks = this._currentRoomNpcs.filter(npc => {
      const npcDef = npc._npcDef;
      return npcDef && npcDef.barks && npcDef.barks.length > 0;
    });

    if (npcsWithBarks.length === 0) {
      this._barkCooldown = 300; // Check again in ~5s
      return;
    }

    const npc = npcsWithBarks[Math.floor(Math.random() * npcsWithBarks.length)];
    const barks = npc._npcDef.barks;
    this._barkText = barks[Math.floor(Math.random() * barks.length)];
    this._barkNpc = npc;
    this._barkTimer = 180; // Show for ~3s
    this._barkCooldown = 600 + Math.floor(Math.random() * 1200); // 10-30s until next
  }

  /**
   * Render a speech bubble above the barking NPC.
   */
  _renderBark() {
    const npc = this._barkNpc;
    const text = this._barkText;
    if (!npc || !text) return;

    const bubbleX = Math.max(4, Math.min(npc.x - 20, 320 - 80));
    const bubbleY = Math.max(4, npc.y - 18);
    const maxW = 72;

    // Background bubble
    const textHeight = this.renderer.measureTextWrappedHiRes(text, maxW, { size: 6, lineHeight: 8 });
    this.renderer.drawRect(bubbleX - 2, bubbleY - 2, maxW + 4, textHeight + 4, 'rgba(255,255,255,0.9)');
    this.renderer.drawRectOutline(bubbleX - 2, bubbleY - 2, maxW + 4, textHeight + 4, '#333');

    // Tail pointer
    this.renderer.drawRect(npc.x + 4, bubbleY + textHeight + 2, 4, 3, 'rgba(255,255,255,0.9)');

    // Text
    this.renderer.drawTextWrappedHiRes(text, bubbleX, bubbleY, maxW, {
      size: 6, lineHeight: 8, color: '#222',
    });
  }

  /**
   * Render custom cursor.
   */
  _renderCursor() {
    const cursorImg = this.assets.get('cursor');
    if (cursorImg) {
      // Draw on hi-res layer so cursor is always on top of text
      this.renderer.drawImageHiRes(cursorImg, this.input.mouseX, this.input.mouseY, 12, 12);
    } else {
      // Fallback crosshair cursor (hi-res text layer for visibility)
      const cx = this.input.mouseX;
      const cy = this.input.mouseY;
      this.renderer.drawTextHiRes('+', cx - 2, cy - 4, { size: 8, color: '#ffdd57', shadow: false });
    }
  }

  /**
   * Render the ending screen.
   */
  _renderEnding() {
    const alpha = Math.min(1, this.endingTimer / 60);
    this.renderer.drawRect(0, 0, 320, 200, `rgba(0, 0, 0, ${alpha * 0.85})`);

    if (this.endingTimer > 30) {
      const title = this.content.title || 'Quest Complete!';
      this.renderer.drawTextHiRes('Quest Complete!', 160, 40, {
        align: 'center', color: '#ffdd57', size: 12,
      });
      this.renderer.drawTextWrappedHiRes(
        'You have obtained the Enchanted Tankard and proven yourself worthy of the Knight\'s Guild!',
        40, 70, 240,
        { color: '#e0c088', size: 8, lineHeight: 14, align: 'center' }
      );
      this.renderer.drawTextHiRes('Thank you for playing!', 160, 130, {
        align: 'center', color: '#a0c0ff', size: 8,
      });
      this.renderer.drawTextHiRes(title, 160, 155, {
        align: 'center', color: '#888', size: 7,
      });
      this.renderer.drawTextHiRes('A Retro Adventure Demo', 160, 170, {
        align: 'center', color: '#666', size: 7,
      });
    }
  }

  /**
   * Save current game state.
   */
  saveGame() {
    const state = {
      room: this.scenes.currentRoomId,
      playerX: this.walking.x,
      playerY: this.walking.y,
      items: this.inventory.items.map(i => i.id),
      flags: { ...this.flags },
      hiddenHotspots: this._getHiddenHotspots(),
      dialogueExhaustion: this.dialogue.getExhaustionState(),
      timeOfDayIndex: this._timeOfDayIndex,
    };
    this.save.save(state);
  }

  /**
   * Load saved game state.
   */
  loadGame() {
    const state = this.save.load();
    if (!state) return;

    this.scenes.loadRoom(state.room);
    this.walking.setPosition(state.playerX, state.playerY);
    this.inventory.items = state.items.map(id => {
      const itemDef = this.content.getItem(id);
      return itemDef ? { id: itemDef.id, name: itemDef.name } : null;
    }).filter(Boolean);
    this.flags = state.flags || {};
    this._refreshRoomNpcs();
    this._configureLighting();

    // Restore hidden hotspots
    if (state.hiddenHotspots) {
      for (const { room, hotspot } of state.hiddenHotspots) {
        const r = this.scenes.rooms[room];
        if (r && r.hotspots) {
          const hs = r.hotspots.find(h => h.id === hotspot);
          if (hs) hs.visible = false;
        }
      }
    }

    // Restore dialogue exhaustion
    if (state.dialogueExhaustion) {
      this.dialogue.restoreExhaustionState(state.dialogueExhaustion);
    }

    // Restore time of day
    if (state.timeOfDayIndex !== undefined) {
      this._timeOfDayIndex = state.timeOfDayIndex;
      this.timeOfDay = this._timeOfDayPeriods[this._timeOfDayIndex];
      this._timeOfDayTimer = 0;
    }
  }

  /**
   * Get list of hidden hotspots for saving.
   */
  _getHiddenHotspots() {
    const hidden = [];
    for (const [roomId, room] of Object.entries(this.scenes.rooms)) {
      if (room.hotspots) {
        for (const hs of room.hotspots) {
          if (hs.visible === false) {
            hidden.push({ room: roomId, hotspot: hs.id });
          }
        }
      }
    }
    return hidden;
  }
}

/**
 * Draw the UI panel background.
 */
function renderer_drawUIPanel(renderer) {
  // Bottom panel separator line
  renderer.drawRect(0, 139, 320, 1, '#3a3a5e');
}

// Boot the game engine
const engine = new GameEngine();
engine.init().catch(err => {
  console.error('Failed to initialize game:', err);
});
