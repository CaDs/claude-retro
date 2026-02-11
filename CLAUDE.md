# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Enchanted Tankard** — A retro pixel-art point-and-click graphic adventure game inspired by classic LucasArts titles (Monkey Island, etc.). Built as a vanilla JavaScript browser game with no framework dependencies.

## Commands

```bash
npm run dev      # Start Vite dev server on http://localhost:3000 (auto-opens browser)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

No test framework is configured. No linter is configured.

## Architecture

### Module Organization

```
src/
├── main.js              # Game class — orchestrator & main loop
├── engine/              # Renderer, AssetLoader, InputManager, ProceduralAssets
├── systems/             # SceneManager, VerbSystem, InventorySystem, DialogueSystem,
│                        #   WalkingSystem, ScriptRunner, SaveSystem
└── data/                # Pure data: gameConfig, items, puzzles, rooms/*, dialogues/*
```

**Mediator pattern**: Systems have **no cross-dependencies**. The `Game` class wires everything together — systems receive what they need via method parameters and never import each other.

### Naming Conventions

- **Classes/files**: PascalCase (`SceneManager.js`)
- **Data exports**: UPPER_SNAKE for constants (`ITEMS`, `PUZZLES`, `CONFIG`), camelCase for definitions (`villageSquare`, `hermitDialogue`)
- **Private methods**: Leading underscore (`_tryPuzzle()`, `_resize()`)
- **Hotspot verb handlers**: camelCase of verb name (`lookAt`, `pickUp`, `talkTo`)

### Rendering Pipeline

The game renders at a fixed **320×200 internal resolution** (classic VGA) using a double-buffer approach:
- **Pixel art layer**: Drawn to an offscreen `<canvas>` buffer at 320×200, then scaled to the display canvas with `imageSmoothingEnabled = false` for crisp pixel art.
- **Hi-res text layer**: Text is drawn directly on the scaled display canvas (bypassing the pixel buffer) for readable text at any zoom level. These calls are queued during the frame and flushed in `Renderer.end()`.

The screen layout is: game viewport (rows 0–139), action text bar (140–150), verb grid + inventory panel (151–200).

### All Art is Procedural

There are **no external image assets**. All room backgrounds, item icons, NPC sprites, and the cursor are generated at startup via `ProceduralAssets.generateAll()`, which draws pixel art onto offscreen canvases and stores them in `AssetLoader`'s cache. To add new visual assets, add a static generator method to `ProceduralAssets` and register the result in `generateAll()`.

### Game Loop & System Priority

`main.js` contains the `Game` class which orchestrates everything. The update order matters:
1. **DialogueSystem** — blocks all other input when active
2. **ScriptRunner** — blocks game input when running puzzle sequences
3. **WalkingSystem** + interaction handling — normal gameplay

### Input Resolution Priority

When processing a click, the first matching handler consumes it:
1. **DialogueSystem** (if active) → choice selection or text advance
2. **ScriptRunner** (if running) → blocked
3. **Verb bar** (rows 152–200, left) → verb selection
4. **Inventory panel** (rows 152–200, right) → item selection/scroll
5. **Game viewport** (rows 0–139) → NPCs → Hotspots → Exits → Walk to point

### Interaction Model (Verb + Object)

Uses a classic 9-verb system (`Give`, `Open`, `Close`, `Pick up`, `Look at`, `Talk to`, `Use`, `Push`, `Pull`). Interactions are resolved by:
1. **Puzzle lookup** — keyed as `verb:hotspotId`, `verb:itemId:hotspotId`, or `verb:hotspotId:flag:value` in `data/puzzles.js`. Puzzles can have conditions and trigger scripted action sequences.
2. **Hotspot built-in responses** — verbs map to camelCase properties on hotspot objects (e.g., `lookAt`, `pickUp`).
3. **Default responses** — fallback text per verb in `DEFAULT_RESPONSES`.

### Dialogue Trees

Defined as node graphs in `data/dialogues/`. Each node has `text`, optional `choices` (with `next` node refs), optional `action` objects, and optional `next` for auto-advance. Actions trigger game state changes via the `_handleDialogueAction` callback in `Game`.

### Game State

- **`Game.flags`** — simple boolean flag map for quest progression (e.g., `got_tankard`, `hermit_hint_received`)
- **`InventorySystem.items`** — array of item objects from `data/items.js`
- **Hidden hotspots** — `hotspot.visible = false` removes them from the room
- **Save/Load** — serializes room, position, inventory, flags, and hidden hotspots to `localStorage` (key: `enchanted_tankard_save`)

### Data Layer (`src/data/`)

- `gameConfig.js` — resolution, start room/position constants
- `items.js` — item definitions (`ITEMS` object keyed by ID)
- `puzzles.js` — puzzle/interaction definitions and default verb responses
- `rooms/*.js` — room definitions with hotspots, exits, NPCs, walkable areas
- `dialogues/*.js` — NPC dialogue trees

### Adding Content

**New room**: Create a room definition file in `data/rooms/`, add a procedural background generator in `ProceduralAssets`, register the room in `Game.init()` via `scenes.registerRoom()`, and connect it via exits from existing rooms.

**New item**: Add to `ITEMS` in `data/items.js`, generate an icon in `ProceduralAssets.generateItemIcon()`, and register it in `ProceduralAssets.generateAll()`.

**New puzzle**: Add an entry to `PUZZLES` in `data/puzzles.js` with the appropriate `verb:object` key pattern, conditions, and action sequence.

**New NPC**: Add to a room's `npcs` array, create a dialogue tree in `data/dialogues/`, register it in `Game.dialogues`, and add rendering logic in `Game._renderNpcs()`.
