# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Enchanted Tankard** — A retro pixel-art point-and-click graphic adventure game inspired by classic LucasArts titles (Monkey Island, etc.). Built as a vanilla JavaScript browser game with no framework dependencies. All game content is defined in YAML DSL files and loaded at runtime.

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
├── main.js              # GameEngine class — orchestrator & main loop
├── engine/
│   ├── Renderer.js      # Double-buffer canvas rendering (320×200 pixel art + hi-res text)
│   ├── AssetLoader.js   # Asset cache (procedurally generated canvases)
│   ├── InputManager.js  # Mouse input tracking
│   ├── ProceduralAssets.js  # Generates all visual assets (backgrounds, icons, cursor)
│   ├── CharacterGenerator.js # Trait-based procedural character sprite assembly
│   ├── GameLoader.js    # Fetches & parses YAML game definition files
│   └── ContentRegistry.js   # Central lookup API for all loaded game content
└── systems/
    ├── SceneManager.js    # Room registration, loading, background rendering
    ├── VerbSystem.js      # 9-verb UI bar and action text
    ├── InventorySystem.js # Item list, scrolling, selection
    ├── DialogueSystem.js  # Branching conversation trees with typewriter effect
    ├── WalkingSystem.js   # Player movement and walk cycles
    ├── ScriptRunner.js    # Queued action sequences for puzzle resolution
    ├── CharacterSystem.js # NPC placement, rendering, and interaction via CharacterGenerator
    ├── PuzzleSystem.js    # Resolves verb+target interactions from DSL definitions
    └── SaveSystem.js      # localStorage serialization
```

**Mediator pattern**: Systems have **no cross-dependencies**. The `GameEngine` class in `main.js` wires everything together — systems receive what they need via method parameters and never import each other.

### Data-Driven Content (YAML DSL)

All game content lives in `public/content/enchanted_tankard/` as YAML files, loaded at runtime by `GameLoader`:

```
public/content/enchanted_tankard/
├── game.yaml          # Manifest: resolution, verbs, default responses, file references
├── protagonist.yaml   # Player character traits
├── items.yaml         # Item definitions
├── npcs.yaml          # NPC definitions with traits, placements, dialogue refs
├── puzzles.yaml       # Puzzle triggers, conditions, and action sequences
├── rooms/             # Room definitions (hotspots, exits, walkable areas)
└── dialogues/         # NPC dialogue trees (nodes, choices, actions, idle lines)
```

The legacy `src/data/` JS files still exist but are **not used** by the engine. All content authoring should be done in the YAML files.

### Content Loading Pipeline

1. `GameLoader.load()` fetches `game.yaml`, then all referenced YAML files in parallel
2. `GameLoader` normalizes the DSL format into engine-compatible objects (e.g., YAML `rect:` → flat `x/y/width/height`)
3. A `ContentRegistry` instance provides lookup APIs (`getRoom()`, `findPuzzle()`, `getDialogueForNpc()`, etc.)
4. `CharacterSystem` and `PuzzleSystem` wrap `ContentRegistry` for domain-specific operations

### Rendering Pipeline

Fixed **320×200 internal resolution** (classic VGA) using a double-buffer approach:
- **Pixel art layer**: Drawn to an offscreen `<canvas>` buffer at 320×200, then scaled to the display canvas with `imageSmoothingEnabled = false`.
- **Hi-res text layer**: Text calls are queued during the frame and flushed in `Renderer.end()`, drawn directly on the scaled display canvas for readable text at any zoom.

Screen layout: game viewport (rows 0–139), action text bar (140–150), verb grid + inventory panel (151–200).

### All Art is Procedural

There are **no external image assets**. All room backgrounds, item icons, and the cursor are generated at startup via `ProceduralAssets.generateAll()`. Characters (protagonist + NPCs) are rendered each frame by `CharacterGenerator.draw()` using trait descriptors from YAML.

### Character Rendering (Trait-Based)

`CharacterGenerator` is a paper-doll system that assembles pixel-art characters from trait properties defined in YAML:
- `bodyType`: slim, average, stocky, tall
- `skinTone`: fair, tan, brown, dark, pale
- `hairStyle`: short, long, ponytail, messy, braided, bald
- `hairColor`: brown, black, blonde, red, gray, white
- `clothing`: tunic, apron, robe, armor, vest
- `clothingColor`: named color or `#hex`
- `facial`: beard, mustache, goatee, none
- `accessory`: hood, hat, headband, eyepatch, glasses, crown, none
- `footwear`: boots, shoes, sandals, none

### Game Loop & System Priority

`GameEngine` update order matters — first match blocks the rest:
1. **DialogueSystem** — blocks all other input when active
2. **ScriptRunner** — blocks game input when running puzzle sequences
3. **WalkingSystem** + interaction handling — normal gameplay

### Input Resolution Priority

When processing a click:
1. **DialogueSystem** (if active) → choice selection or text advance
2. **ScriptRunner** (if running) → blocked
3. **Verb bar** (rows 152–200, left) → verb selection
4. **Inventory panel** (rows 152–200, right) → item selection/scroll
5. **Game viewport** (rows 0–139) → NPCs → Hotspots → Exits → Walk to point

### Interaction Model (Verb + Object)

Classic 9-verb system. Interactions resolved by priority:
1. **PuzzleSystem** — trigger keys like `verb:target`, `verb:item:target` with optional flag/item conditions
2. **Hotspot/NPC built-in responses** — verb properties on the object (`lookAt`, `pickUp`, etc.)
3. **Default responses** — per-verb fallback text from `game.yaml`

### Dialogue Trees

Defined as node graphs in YAML. Each node has `text`, optional `choices` (with `next` refs and optional `conditions`), optional `action` objects, and optional `next` for auto-advance. NPCs support `dialogueOverrides` for conditionally swapping entire dialogue trees, and `idleLines` for post-exhaustion random barks.

### Game State

- **`GameEngine.flags`** — boolean flag map for quest progression
- **`InventorySystem.items`** — array of item objects
- **Hidden hotspots** — `hotspot.visible = false`
- **Dialogue exhaustion** — tracks which NPCs have been fully talked to
- **Save/Load** — serializes all state to `localStorage` (key: `enchanted_tankard_save`)

### NPC Management

NPCs are defined globally in `npcs.yaml` with `placements` arrays specifying which rooms they appear in. `CharacterSystem.getNpcsInRoom()` resolves the current room's NPCs. This is unlike the legacy system where NPCs were defined per-room.

### Adding Content

**New room**: Create `public/content/enchanted_tankard/rooms/new_room.yaml`, add its path to `game.yaml`'s `rooms` list, add a procedural background generator in `ProceduralAssets`, and connect via exits from existing rooms.

**New item**: Add to `items.yaml`, generate an icon in `ProceduralAssets.generateItemIcon()`.

**New puzzle**: Add to `puzzles.yaml` with `trigger` (verb + target), optional `conditions`, and `actions` array.

**New NPC**: Add to `npcs.yaml` with traits, placements, and dialogue reference. Create a dialogue tree in `dialogues/`, add its path to `game.yaml`'s `dialogues` list. The `CharacterGenerator` handles rendering automatically from traits.

**New dialogue**: Create `dialogues/name.yaml` with `id`, `nodes` graph, and optional `idleLines`. Reference it from the NPC definition.
