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
import { PuzzleSystem } from './systems/PuzzleSystem.js';

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

    // Current room NPC cache
    this._currentRoomNpcs = [];
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

    // Generate procedural pixel art assets
    ProceduralAssets.generateAll(this.assets);

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
   * Main game loop.
   */
  _loop() {
    requestAnimationFrame(() => this._loop());

    this.input.update();
    this.update();
    this.render();
  }

  /**
   * Update all game systems.
   */
  update() {
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

    // Save/Load buttons (centered under verb grid)
    if (this.input.clicked) {
      // Save button area
      if (this.input.isClickInRect(20, 188, 50, 10)) {
        this.saveGame();
        this.showMessage('Game saved!');
      }
      // Load button area
      if (this.input.isClickInRect(82, 188, 50, 10)) {
        if (this.save.hasSave()) {
          this.loadGame();
          this.showMessage('Game loaded!');
        } else {
          this.showMessage('No save found.');
        }
      }
    }
  }

  /**
   * Handle clicking on a hotspot.
   */
  _handleHotspotInteraction(hotspot) {
    const verb = this.verbs.selectedVerb.toLowerCase();
    const verbId = verb.replace(/\s+/g, '_'); // 'look at' → 'look_at'
    const item = this.verbs.selectedItem;

    // Walk to hotspot first, then interact
    const walkX = hotspot.walkToX || hotspot.x + hotspot.width / 2;
    const walkY = hotspot.walkToY || hotspot.y + hotspot.height;

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

    const walkX = npc.walkToX || npc.x + npc.width / 2;
    const walkY = npc.walkToY || npc.y + npc.height;

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
      await this.renderer.fadeOut();
      this.scenes.loadRoom(exit.target);
      this.walking.setPosition(exit.spawnX, exit.spawnY);
      this.verbs.selectedItem = null;
      this._refreshRoomNpcs();
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
      },
      add_item: (action) => {
        const itemDef = this.content.getItem(action.item);
        if (itemDef) {
          this.inventory.addItem({ id: itemDef.id, name: itemDef.name });
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

    // Render NPCs using CharacterGenerator
    this._renderNpcs();

    // Render player using unified CharacterGenerator
    this.characters.drawProtagonist(this.renderer, this.walking.x, this.walking.y, this.walking.walking ? this.walking.frame : 0);

    // Render hotspot highlights (when hovering)
    this._renderHotspotHighlights();

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

    // Save/Load buttons
    this._renderSaveLoadButtons();

    // Custom cursor
    this._renderCursor();

    // Ending screen
    if (this.showingEnding) {
      this._renderEnding();
    }

    this.renderer.end();
  }

  /**
   * Render NPCs in the current room using CharacterGenerator.
   */
  _renderNpcs() {
    for (const npc of this._currentRoomNpcs) {
      this.characters.drawNpc(this.renderer, npc);
    }
  }

  /**
   * Render hotspot highlight rectangles when hovering.
   */
  _renderHotspotHighlights() {
    const room = this.scenes.getRoom();
    if (!room) return;

    // Highlight hovered hotspots
    if (room.hotspots) {
      for (const hs of room.hotspots) {
        if (hs.visible === false) continue;
        if (this.input.isMouseInRect(hs.x, hs.y, hs.width, hs.height)) {
          this.renderer.drawRectOutline(hs.x, hs.y, hs.width, hs.height, 'rgba(255,221,87,0.4)');
        }
      }
    }

    // Highlight hovered exits
    if (room.exits) {
      for (const exit of room.exits) {
        if (this.input.isMouseInRect(exit.x, exit.y, exit.width, exit.height)) {
          this.renderer.drawRectOutline(exit.x, exit.y, exit.width, exit.height, 'rgba(100,200,255,0.4)');
        }
      }
    }

    // Highlight hovered NPCs
    for (const npc of this._currentRoomNpcs) {
      if (this.input.isMouseInRect(npc.x, npc.y, npc.width, npc.height)) {
        this.renderer.drawRectOutline(npc.x, npc.y, npc.width, npc.height, 'rgba(255,150,100,0.4)');
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
   * Render save/load buttons.
   */
  _renderSaveLoadButtons() {
    // Save button — centered under verb grid
    this.renderer.drawRect(20, 188, 50, 10, '#252540');
    this.renderer.drawRectOutline(20, 188, 50, 10, '#3a3a5e');
    this.renderer.drawTextHiRes('Save', 32, 189, { size: 7, color: '#a0a0c0', shadow: false });

    // Load button — centered under verb grid
    this.renderer.drawRect(82, 188, 50, 10, '#252540');
    this.renderer.drawRectOutline(82, 188, 50, 10, '#3a3a5e');
    this.renderer.drawTextHiRes('Load', 94, 189, { size: 7, color: '#a0a0c0', shadow: false });
  }

  /**
   * Render custom cursor.
   */
  _renderCursor() {
    const cursorImg = this.assets.get('cursor');
    if (cursorImg) {
      this.renderer.drawImage(cursorImg, this.input.mouseX, this.input.mouseY, 8, 8);
    } else {
      // Fallback crosshair cursor
      const cx = this.input.mouseX;
      const cy = this.input.mouseY;
      this.renderer.drawRect(cx, cy - 3, 1, 7, '#ffdd57');
      this.renderer.drawRect(cx - 3, cy, 7, 1, '#ffdd57');
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
