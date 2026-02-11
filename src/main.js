import { Renderer } from './engine/Renderer.js';
import { AssetLoader } from './engine/AssetLoader.js';
import { InputManager } from './engine/InputManager.js';
import { ProceduralAssets } from './engine/ProceduralAssets.js';
import { SceneManager } from './systems/SceneManager.js';
import { VerbSystem } from './systems/VerbSystem.js';
import { InventorySystem } from './systems/InventorySystem.js';
import { DialogueSystem } from './systems/DialogueSystem.js';
import { WalkingSystem } from './systems/WalkingSystem.js';
import { ScriptRunner } from './systems/ScriptRunner.js';
import { SaveSystem } from './systems/SaveSystem.js';
import { CONFIG } from './data/gameConfig.js';
import { ITEMS } from './data/items.js';
import { PUZZLES, DEFAULT_RESPONSES } from './data/puzzles.js';
import { villageSquare } from './data/rooms/village_square.js';
import { tavern } from './data/rooms/tavern.js';
import { forestPath } from './data/rooms/forest_path.js';
import { bartenderDialogue, bartenderDialogueAfterKey } from './data/dialogues/bartender.js';
import { hermitDialogue } from './data/dialogues/hermit.js';

/**
 * Main Game class — orchestrates all systems.
 */
class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.renderer = new Renderer(this.canvas, CONFIG.WIDTH, CONFIG.HEIGHT);
    this.input = new InputManager(this.canvas, CONFIG.WIDTH, CONFIG.HEIGHT);
    this.assets = new AssetLoader();
    this.scenes = new SceneManager();
    this.verbs = new VerbSystem();
    this.inventory = new InventorySystem();
    this.dialogue = new DialogueSystem();
    this.walking = new WalkingSystem();
    this.scripts = new ScriptRunner();
    this.save = new SaveSystem();

    // Game state flags
    this.flags = {};
    this.messageText = '';
    this.messageTimer = 0;
    this.showingEnding = false;
    this.endingTimer = 0;

    // Dialogues registry
    this.dialogues = {
      bartender: bartenderDialogue,
      hermit: hermitDialogue,
    };
  }

  async init() {
    // Register rooms
    this.scenes.registerRoom('village_square', villageSquare);
    this.scenes.registerRoom('tavern', tavern);
    this.scenes.registerRoom('forest_path', forestPath);

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
    this.scenes.loadRoom(CONFIG.START_ROOM);
    this.walking.setPosition(CONFIG.START_X, CONFIG.START_Y);

    // Check for saved game
    if (this.save.hasSave()) {
      this.loadGame();
    }

    // Start game loop
    this.lastTime = performance.now();
    this._loop();
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
      this.dialogue.update(this.input);
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
        const itemDef = ITEMS[clickedItem.id];
        if (itemDef) this.showMessage(itemDef.description);
      }
      return;
    }

    // Handle clicks in the game viewport
    if (this.input.clicked && this.input.clickY < 140) {
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
      if (clickY >= 80 && clickY <= 140) {
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
    const item = this.verbs.selectedItem;

    // Walk to hotspot first, then interact
    const walkX = hotspot.walkToX || hotspot.x + hotspot.width / 2;
    const walkY = hotspot.walkToY || hotspot.y + hotspot.height;

    this.walking.walkTo(walkX, walkY, () => {
      // Check puzzles first
      if (item) {
        // verb:item:hotspot pattern (e.g., "use:rope:well")
        const puzzleKey = `${verb}:${item.id}:${hotspot.id}`;
        if (this._tryPuzzle(puzzleKey)) return;
      }

      // verb:hotspot pattern (e.g., "pick up:rope_on_stall")
      const puzzleKey = `${verb}:${hotspot.id}`;
      if (this._tryPuzzle(puzzleKey)) return;

      // Check special flag-based puzzles
      const flagPuzzleKey = `${verb}:${hotspot.id}:flag:${this._getRelevantFlag(hotspot.id)}`;
      if (this._tryPuzzle(flagPuzzleKey)) return;

      // Use hotspot's built-in responses (map verb to camelCase property)
      const verbKey = verb.replace(/\s+(\w)/g, (_, c) => c.toUpperCase()); // 'look at' → 'lookAt'
      const response = hotspot[verbKey];
      if (response) {
        this.showMessage(response);
        return;
      }

      // Default response
      this.showMessage(DEFAULT_RESPONSES[verb] || 'I can\'t do that.');
    });
  }

  /**
   * Handle clicking on an NPC.
   */
  _handleNpcInteraction(npc) {
    const verb = this.verbs.selectedVerb.toLowerCase();

    const walkX = npc.walkToX || npc.x + npc.width / 2;
    const walkY = npc.walkToY || npc.y + npc.height;

    this.walking.walkTo(walkX, walkY, () => {
      if (verb === 'talk to' || verb === 'use') {
        this._startDialogue(npc);
      } else if (verb === 'look at') {
        this.showMessage(npc.lookAt || `It's ${npc.name}.`);
      } else if (verb === 'give' && this.verbs.selectedItem) {
        // Check for dialogue-based give
        this._startDialogue(npc);
      } else {
        this.showMessage(DEFAULT_RESPONSES[verb] || 'I can\'t do that.');
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
    const walkX = exit.x + exit.width / 2;
    const walkY = Math.min(exit.y + exit.height, 135);

    this.walking.walkTo(walkX, walkY, async () => {
      await this.renderer.fadeOut();
      this.scenes.loadRoom(exit.target);
      this.walking.setPosition(exit.spawnX, exit.spawnY);
      this.verbs.selectedItem = null;
      await this.renderer.fadeIn();
    });
  }

  /**
   * Try to execute a puzzle by key.
   */
  _tryPuzzle(key) {
    const puzzle = PUZZLES[key];
    if (!puzzle) return false;

    // Check conditions
    if (puzzle.conditions) {
      for (const cond of puzzle.conditions) {
        if (cond.type === 'has_item' && !this.inventory.hasItem(cond.item)) {
          if (puzzle.failText) this.showMessage(puzzle.failText);
          return true;
        }
        if (cond.type === 'has_flag' && !this.flags[cond.flag]) {
          if (puzzle.failText) this.showMessage(puzzle.failText);
          return true;
        }
      }
    }

    // Execute actions
    if (puzzle.actions) {
      this.scripts.run(puzzle.actions, () => {
        this.verbs.selectedItem = null;
      });
    }

    return true;
  }

  /**
   * Start a dialogue with an NPC.
   */
  _startDialogue(npc) {
    let tree = null;
    const key = npc.dialogueKey;

    // Select appropriate dialogue tree based on game state
    if (key === 'bartender') {
      tree = this.inventory.hasItem('old_key') || this.flags.got_tankard
        ? bartenderDialogueAfterKey
        : bartenderDialogue;
    } else {
      tree = this.dialogues[key];
    }

    if (!tree) {
      this.showMessage(`${npc.name} doesn't seem to want to talk right now.`);
      return;
    }

    this.dialogue.start(npc.name, tree, (action) => {
      this._handleDialogueAction(action);
    }, () => {
      // Dialogue complete
    });
  }

  /**
   * Handle actions triggered by dialogue nodes.
   */
  _handleDialogueAction(action) {
    if (!action) return;

    switch (action.type) {
      case 'set_flag':
        this.flags[action.flag] = true;
        break;

      case 'trade':
        if (action.give && this.inventory.hasItem(action.give)) {
          this.inventory.removeItem(action.give);
        }
        if (action.receive && ITEMS[action.receive]) {
          this.inventory.addItem(ITEMS[action.receive]);
        }
        break;

      case 'add_item':
        if (ITEMS[action.item]) {
          this.inventory.addItem(ITEMS[action.item]);
        }
        break;

      case 'check_item':
        // If player doesn't have the item, redirect dialogue
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
        if (ITEMS[action.item]) {
          this.inventory.addItem(ITEMS[action.item]);
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
   * Get a relevant flag for puzzle matching.
   */
  _getRelevantFlag(hotspotId) {
    if (hotspotId === 'notice_board' && this.flags.got_tankard) return 'got_tankard';
    return '';
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
    const room = this.scenes.getRoom();
    if (!room || !room.npcs) return null;

    for (const npc of room.npcs) {
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
    const room = this.scenes.getRoom();
    if (!room || !room.npcs) return null;
    for (const npc of room.npcs) {
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

    // Render NPCs (simple colored rectangles as fallback)
    this._renderNpcs();

    // Render player
    this.walking.render(this.renderer, this.assets);

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
   * Render NPCs in the current room.
   */
  _renderNpcs() {
    const room = this.scenes.getRoom();
    if (!room || !room.npcs) return;

    for (const npc of room.npcs) {
      // Fallback NPC rendering (colored rectangles)
      const nx = npc.x;
      const ny = npc.y;

      if (npc.id === 'bartender') {
        // Bartender - large burly figure
        this.renderer.drawRect(nx + 2, ny + 10, 16, 18, '#5a3a2a'); // body
        this.renderer.drawRect(nx + 4, ny, 12, 12, '#d4a574');       // head
        this.renderer.drawRect(nx + 6, ny + 12, 8, 4, '#f0f0f0');  // apron
        this.renderer.drawRect(nx + 5, ny + 4, 3, 2, '#222');       // eye
        this.renderer.drawRect(nx + 10, ny + 4, 3, 2, '#222');      // eye
        this.renderer.drawRect(nx + 5, ny + 8, 8, 3, '#8B4513');    // beard
      } else if (npc.id === 'hermit') {
        // Hermit - small hunched figure
        this.renderer.drawRect(nx + 3, ny + 10, 14, 18, '#3a5a3a'); // green shawl
        this.renderer.drawRect(nx + 5, ny + 2, 10, 10, '#d4a574');  // head
        this.renderer.drawRect(nx + 7, ny + 5, 2, 2, '#222');       // eye
        this.renderer.drawRect(nx + 11, ny + 5, 2, 2, '#222');      // eye
        this.renderer.drawRect(nx + 5, ny, 10, 4, '#888');           // hood
      }
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
    if (room.npcs) {
      for (const npc of room.npcs) {
        if (this.input.isMouseInRect(npc.x, npc.y, npc.width, npc.height)) {
          this.renderer.drawRectOutline(npc.x, npc.y, npc.width, npc.height, 'rgba(255,150,100,0.4)');
        }
      }
    }
  }

  /**
   * Render message box.
   */
  _renderMessageBox() {
    // Word-wrapped message above the player (hi-res text)
    const px = this.walking.x;
    const py = Math.max(10, this.walking.y - 50);
    const maxW = 200;
    const startX = Math.max(4, Math.min(px - maxW / 2, 320 - maxW - 4));

    // Draw a semi-transparent background for readability
    this.renderer.drawRect(startX - 2, py - 2, maxW + 4, 30, 'rgba(0,0,0,0.6)');

    this.renderer.drawTextWrappedHiRes(this.messageText, startX, py, maxW, {
      color: '#fff',
      size: 7,
      lineHeight: 10,
    });
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
      this.renderer.drawTextHiRes('The Enchanted Tankard', 160, 155, {
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
    this.inventory.items = state.items.map(id => ITEMS[id]).filter(Boolean);
    this.flags = state.flags || {};

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

// Boot the game
const game = new Game();
game.init().catch(err => {
  console.error('Failed to initialize game:', err);
});
