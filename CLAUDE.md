# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A retro pixel-art point-and-click graphic adventure game engine inspired by classic LucasArts titles (Monkey Island, etc.), plus a visual **Game Creator** for authoring games without code. Built with vanilla JavaScript and Vite. All game content is defined in YAML DSL files.

Do not add Co-Authored-By trailers to commit messages.

## Commands

```bash
npm run dev      # Start Vite dev server on http://localhost:3000 (auto-opens browser)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

No test framework or linter is configured. Vite config (`vite.config.js`) defines dual entry points: `index.html` (game player) and `creator.html` (visual editor).

## Architecture

### Two Applications, Shared Engine

The project contains two apps sharing the same engine code:

1. **Game Player** (`index.html` → `src/main.js`) — Runs adventure games from YAML content files
2. **Game Creator** (`creator.html` → `src/creator/CreatorApp.js`) — Visual editor that outputs YAML game definitions

### Engine Module Organization

```
src/
├── main.js                    # GameEngine class — orchestrator & main loop
├── engine/
│   ├── Renderer.js            # Double-buffer canvas (320×200 pixel art + hi-res text)
│   ├── AssetLoader.js         # Asset cache (procedurally generated canvases)
│   ├── InputManager.js        # Mouse input tracking
│   ├── ProceduralAssets.js    # Generates item icons, cursor, and props (room backgrounds use templates)
│   ├── CharacterGenerator.js  # Trait-based procedural character sprite assembly
│   ├── PixelArtToolkit.js     # Drawing primitives (darken, lighten, ellipseFill, polygonFill, line, etc.)
│   ├── GameLoader.js          # Fetches & parses YAML game definition files
│   └── ContentRegistry.js     # Central lookup API for all loaded game content
├── systems/
│   ├── SceneManager.js        # Room registration, loading, background rendering
│   ├── VerbSystem.js          # 9-verb UI bar and action text
│   ├── InventorySystem.js     # Item list, scrolling, selection
│   ├── DialogueSystem.js      # Branching conversation trees with typewriter effect
│   ├── WalkingSystem.js       # Player movement and walk cycles
│   ├── ScriptRunner.js        # Queued action sequences for puzzle resolution
│   ├── CharacterSystem.js     # NPC placement, rendering, and interaction
│   ├── PuzzleSystem.js        # Resolves verb+target interactions from DSL definitions
│   └── SaveSystem.js          # localStorage serialization
├── settings/                  # Setting definitions (fantasy, scifi, contemporary, eighties)
└── templates/                 # Procedural room background generators (8 per setting, 32 total)
```

**Mediator pattern**: Systems have **no cross-dependencies**. `GameEngine` wires everything together — systems receive what they need via method parameters and never import each other.

### Game Creator Module

```
src/creator/
├── CreatorApp.js          # Main orchestrator — 7-tab navigation, layout, wires panels
├── CreatorState.js        # Central state + CRUD + observer pattern (_notify on changes)
├── PreviewCanvas.js       # 320×200 canvas scaled 3x, palette/template registries
├── CanvasOverlay.js       # Interactive DOM overlay for drawing/editing rects on canvas
├── ExportBuilder.js       # Converts CreatorState → YAML files (game.yaml, rooms, npcs, etc.)
├── PlayTestLauncher.js    # Serializes state → sessionStorage, opens player with ?playtest=1
├── Validator.js           # Pre-export validation (rooms exist, exits resolve, etc.)
├── DragResize.js          # Draggable panel dividers
├── panels/
│   ├── SettingSelector.js # Setting picker (fantasy/scifi/contemporary/eighties)
│   ├── RoomEditor.js      # Room design with 5 sub-modes (info, hotspots, exits, walkable, props)
│   ├── NpcEditor.js       # NPC traits, placement, live preview via CharacterGenerator
│   ├── DialogueEditor.js  # Branching dialogue tree editor
│   ├── ItemEditor.js      # Item definition and icon generation
│   ├── PuzzleEditor.js    # Puzzle trigger/condition/action editor
│   ├── ExportPanel.js     # Validation results & YAML export/download
│   ├── YamlPreview.js     # Real-time YAML preview panel
│   ├── HotspotEditor.js   # Sub-editor for room hotspot rects and responses
│   ├── ExitEditor.js      # Sub-editor for room exit rects, targets, spawn points
│   └── WalkableAreaEditor.js  # Sub-editor for walkable area rects
└── styles/
    └── creator.css        # 4-column grid layout + all component styles
```

**State flow**: User action → panel calls `this.app.state.addRoom(data)` → `CreatorState._notify()` → all listeners re-render. CreatorApp batches re-renders via `queueMicrotask()`.

**UI layout**: 4-column grid — Left panel (lists) | Canvas (320×200 preview) | Right panel (detail forms) | YAML preview.

### Settings & Templates System

4 settings define the available templates, palettes, props, and character traits:

```
src/settings/{fantasy,scifi,contemporary,eighties}.js  # Setting metadata + trait catalogs
src/templates/{setting}/*.js                           # 8 room templates per setting (32 total)
src/templates/_base.js                                 # Shared drawing helpers (drawStoneWall, etc.)
```

Each template exports `metadata` (id, name, parameterized options) + `generate(ctx, P, params)`. Templates use `PixelArtToolkit` (imported as `T`) exclusively — no raw canvas API. They follow a **5-layer rendering contract**: BASE → STRUCTURES → DETAILS → SHADING → ATMOSPHERE.

### Data-Driven Content (YAML DSL)

Game content lives in `public/content/enchanted_tankard/` as YAML files:

```
public/content/enchanted_tankard/
├── game.yaml          # Manifest: setting, resolution, verbs, default responses, file references
├── protagonist.yaml   # Player character traits
├── items.yaml         # Item definitions
├── npcs.yaml          # NPC definitions with traits, placements, dialogue refs
├── puzzles.yaml       # Puzzle triggers, conditions, and action sequences
├── rooms/             # Room definitions (hotspots, exits, walkable areas)
└── dialogues/         # NPC dialogue trees (nodes, choices, actions, idle lines)
```

All content authoring should be done in YAML files or via the Game Creator.

### Content Loading Pipeline

1. `GameLoader.load()` fetches `game.yaml`, then all referenced files in parallel
2. `GameLoader` normalizes DSL format into engine objects (e.g., YAML `rect:` → flat `x/y/width/height`)
3. `ContentRegistry` provides lookup APIs (`getRoom()`, `findPuzzle()`, `getDialogueForNpc()`)
4. PlayTest mode: `GameLoader` checks for `?playtest=1` and loads from `sessionStorage` instead of YAML

### Rendering Pipeline

Fixed **320×200 internal resolution** (classic VGA) using double-buffer:
- **Pixel art layer**: Offscreen buffer at 320×200, scaled to display canvas with `imageSmoothingEnabled = false`
- **Hi-res text layer**: Text queued during frame, flushed in `Renderer.end()` directly on scaled canvas

Screen layout: game viewport (rows 0–139), action text bar (140–150), verb grid + inventory (151–200).

### All Art is Procedural

**No external image assets**. Room backgrounds generated by templates at startup. Characters rendered each frame by `CharacterGenerator.draw()` from trait descriptors.

### Character Rendering (Trait-Based)

`CharacterGenerator` is a paper-doll system assembling pixel-art characters from traits:

- `bodyType`: slim, average, stocky, tall
- `skinTone`: fair, tan, brown, dark, pale
- `hairStyle`: short, long, ponytail, messy, braided, bald
- `hairColor`: brown, black, blonde, red, gray, white
- `clothing`: tunic, apron, robe, armor, vest, jumpsuit, uniform, labcoat, spacesuit, jacket, leather_jacket, neon_jacket, hoodie, tshirt, band_tee, tracksuit, suit, cloak, dress, merchant_garb
- `clothingColor`: named color or `#hex`
- `facial`: beard, mustache, goatee, none
- `accessory`: hood, hat, headband, eyepatch, glasses, crown, visor, headset, goggles, helmet, sunglasses, headphones, cap, scarf, badge, bandana, sweatband, walkman, circlet, none
- `footwear`: boots, shoes, sandals, sneakers, high_tops, mag_boots, armored_boots, none

Setting-specific defaults: fantasy → tunic/boots, scifi → jumpsuit/boots, contemporary → jacket/sneakers, eighties → neon_jacket/high_tops/sunglasses.

### Game Loop & Input Priority

Update order (first match blocks the rest):
1. **DialogueSystem** — blocks all input when active
2. **ScriptRunner** — blocks during puzzle sequences
3. **WalkingSystem** + interaction handling — normal gameplay

Click resolution: Dialogue → ScriptRunner → Verb bar → Inventory → NPCs → Hotspots → Exits → Walk.

### Interaction Model (Verb + Object)

Classic 9-verb system resolved by priority:
1. **PuzzleSystem** — trigger keys like `verb:target`, `verb:item:target` with conditions
2. **Hotspot/NPC built-in responses** — verb properties on the object
3. **Default responses** — per-verb fallback text from `game.yaml`

### Game State

- `GameEngine.flags` — boolean flag map for quest progression
- `InventorySystem.items` — array of item objects
- Hidden hotspots — `hotspot.visible = false`
- Dialogue exhaustion — tracks which NPCs have been fully talked to
- Save/Load — `localStorage` (key derived from game title, e.g. `the_enchanted_tankard_save`)

### Adding Content

**New room**: Create `public/content/enchanted_tankard/rooms/new_room.yaml`, add to `game.yaml`'s `rooms` list, set `background: { template: 'setting/template_name' }` and optional `lighting:`, connect via exits.

**New template**: Create `src/templates/{setting}/name.js` exporting `metadata` + `generate(ctx, P, params)`. Register in `src/templates/index.js`. Follow the 5-layer contract using `PixelArtToolkit` only.

**New item**: Add to `items.yaml`, generate icon in `ProceduralAssets.generateItemIcon()`.

**New puzzle**: Add to `puzzles.yaml` with `trigger`, optional `conditions`, and `actions` array.

**New NPC**: Add to `npcs.yaml` with traits, placements, dialogue ref. Create dialogue tree in `dialogues/`, add to `game.yaml`'s `dialogues` list.
