# Retro Adventure Engine

A data-driven, SCUMM-inspired point-and-click adventure game engine with a visual Game Creator. Built with vanilla JavaScript and Vite. All game content is defined in YAML, all art is procedurally generated — no external image assets required.

![The Enchanted Tankard](./public/screenshots/village_square.png)

## Features

### Game Engine
- **YAML-driven content** — rooms, items, NPCs, dialogues, and puzzles defined in human-readable YAML files
- **Procedural pixel art** — all backgrounds, characters, and item icons generated at runtime from trait descriptors
- **Classic 9-verb UI** — Give, Open, Close, Pick up, Look at, Talk to, Use, Push, Pull
- **Branching dialogues** — conversation trees with conditions, actions, idle lines, and exhaustion
- **Puzzle DSL** — lock-and-key pattern with trigger/condition/action chains
- **Save/Load** — localStorage-based persistence
- **4 settings** — Fantasy Medieval, Science Fiction, Contemporary, 1980s Retro (32 room templates total)

### Game Creator
- **Visual editor** — 7-tab workflow for authoring complete games without writing code
- **Live canvas preview** — 320×200 pixel-art preview with interactive overlays for hotspots, exits, and walkable areas
- **Character preview** — real-time trait-based character rendering as you edit NPCs
- **PlayTest** — one-click launch to play your game in the engine
- **Session persistence** — auto-saves to localStorage, resume where you left off
- **ZIP export** — downloads a complete YAML game package ready to play

## Quick Start

```bash
git clone <repo-url>
cd claude_retro
npm install
npm run dev        # Opens game player at http://localhost:3000
```

- **Game Player**: `http://localhost:3000` — plays the bundled demo game
- **Game Creator**: `http://localhost:3000/creator.html` — visual editor for authoring new games

```bash
npm run build      # Production build to dist/
npm run preview    # Preview production build
```

## Game Creator Guide

The Game Creator is a browser-based visual editor that outputs complete YAML game definitions. It follows a 7-tab workflow.

### Layout

The editor uses a 4-column grid:

| Left Panel | Canvas | Right Panel | YAML Preview |
|---|---|---|---|
| Lists (rooms, NPCs, items) | 320×200 live preview | Detail forms & editors | Real-time YAML output |

### Workflow

#### 1. Settings
Pick one of 4 settings: **Fantasy Medieval**, **Science Fiction**, **Contemporary**, or **1980s Retro**. This determines available room templates, palettes, character traits, props, and item icons. Other tabs are locked until a setting is chosen.

#### 2. Rooms
Design rooms using the template picker and palette selector. Five sub-modes let you edit different aspects:
- **Info** — name, description, template, palette selection
- **Hotspots** — interactive objects with verb responses (draw rects on canvas)
- **Exits** — connections to other rooms with spawn points (draw rects on canvas)
- **Walkable** — areas the player can move through (draw rects on canvas)
- **Props** — decorative objects placed in the scene

The first room created automatically becomes the start room.

#### 3. NPCs
Define characters with trait-based appearance (body type, skin tone, hair, clothing, accessories). Assign placements to rooms with position, size, facing direction, and walk-to points. Link to dialogue trees.

#### 4. Dialogues
Build branching conversation trees with a node editor. Each node has text, choices (with optional conditions), and actions. Supports idle lines for exhausted NPCs.

#### 5. Items
Create inventory items with procedural icon generation, use-on targets, and verb responses.

#### 6. Puzzles
Wire up interactions with trigger patterns (verb + target, or verb + item + target), conditions (flags, inventory checks), and action sequences.

#### 7. Export
Run validation to catch errors (missing exits, unlinked dialogues, rooms without walkable areas), then export as a ZIP file containing all YAML files.

### Session Persistence

The Creator auto-saves to `localStorage` every time you make a change (debounced at 500ms). Reloading the page restores your session. Click **New Game** to clear the session and start fresh.

### PlayTest

Click **Play Test** in the Export tab to serialize your game to `sessionStorage` and open the game player in a new tab with `?playtest=1`. The engine loads directly from session data — no YAML files needed.

### Export Output

The ZIP file contains:

```
game.yaml              # Game manifest
protagonist.yaml       # Player character traits
rooms/
  room_id.yaml         # One file per room
npcs.yaml              # All NPC definitions
items.yaml             # All item definitions
puzzles.yaml           # All puzzle definitions
dialogues/
  dialogue_id.yaml     # One file per dialogue tree
```

---

## YAML DSL Reference

All game content is defined in YAML files. This section documents every field and valid value.

### game.yaml — Game Manifest

The top-level manifest references all content files and defines global configuration.

```yaml
game:
  title: "The Enchanted Tankard"
  version: "1.0"
  resolution: { width: 320, height: 200 }
  viewportHeight: 140
  startRoom: village_square
  startPosition: { x: 160, y: 120 }

  verbs:
    - { id: give, label: "Give" }
    - { id: open, label: "Open" }
    - { id: close, label: "Close" }
    - { id: pick_up, label: "Pick up" }
    - { id: look_at, label: "Look at" }
    - { id: talk_to, label: "Talk to" }
    - { id: use, label: "Use" }
    - { id: push, label: "Push" }
    - { id: pull, label: "Pull" }

  defaultResponses:
    look_at: "Nothing special about it."
    pick_up: "I can't pick that up."
    use: "I can't use that."
    open: "It doesn't open."
    close: "It's not open."
    push: "It won't budge."
    pull: "Nothing happens."
    give: "I don't think they want that."
    talk_to: "I don't think talking to that will help."

  protagonist: protagonist.yaml
  items: items.yaml
  npcs: npcs.yaml
  puzzles: puzzles.yaml
  rooms:
    - rooms/village_square.yaml
    - rooms/tavern.yaml
    - rooms/forest_path.yaml
  dialogues:
    - dialogues/bartender.yaml
    - dialogues/hermit.yaml
```

| Field | Type | Description |
|---|---|---|
| `title` | string | Game title displayed to the player |
| `version` | string | Version identifier |
| `resolution` | `{width, height}` | Internal resolution (always 320×200) |
| `viewportHeight` | number | Height of the game viewport in pixels (140 = rows 0–139) |
| `startRoom` | string | Room ID where the player begins |
| `startPosition` | `{x, y}` | Player's starting coordinates |
| `verbs` | array | The 9 verbs with `id` and display `label` |
| `defaultResponses` | map | Fallback text for each verb when no specific response exists |
| `protagonist` | string | Path to protagonist YAML file |
| `items` | string | Path to items YAML file |
| `npcs` | string | Path to NPCs YAML file |
| `puzzles` | string | Path to puzzles YAML file |
| `rooms` | array of strings | Paths to room YAML files |
| `dialogues` | array of strings | Paths to dialogue YAML files |

### protagonist.yaml — Player Character

Defines the player character's appearance and movement speed.

```yaml
protagonist:
  id: squire
  name: "Young Squire"
  description: "A young aspiring knight on a quest."
  walkSpeed: 1.5

  traits:
    bodyType: slim
    gender: female
    skinTone: fair
    hairStyle: long
    hairColor: red
    clothing: vest
    clothingColor: blue
    facial: none
    accessory: none
    footwear: boots
```

**Trait values** — see [Character Traits Reference](#character-traits-reference) for all valid values per field.

### rooms/*.yaml — Room Definitions

Each room defines its background, walkable areas, interactive hotspots, and exits.

```yaml
room:
  id: village_square
  name: "Village Square"
  bgColor: "#2a4a2a"
  description: "The bustling village square."

  background:
    type: procedural
    generator: village_square

  visuals:
    - { type: barrel, x: 75, y: 88 }
    - { type: crate, x: 90, y: 92 }

  walkableArea:
    rects:
      - { x: 20, y: 80, width: 280, height: 60 }

  hotspots:
    - id: well
      name: "Stone Well"
      rect: { x: 135, y: 65, width: 50, height: 45 }
      walkTo: { x: 160, y: 110 }
      visible: true
      responses:
        look_at: "An old stone well."
        pick_up: "It's far too heavy."

  exits:
    - id: to_tavern
      rect: { x: 285, y: 48, width: 26, height: 32 }
      walkTo: { x: 290, y: 110 }
      target: tavern
      spawnAt: { x: 30, y: 115 }
      name: "Tavern"
      lookAt: "The Rusty Dragon Tavern."
```

#### Room Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique room identifier |
| `name` | string | Display name |
| `bgColor` | string | Hex fallback background color |
| `description` | string | Room description text |
| `background` | object | Procedural background config |
| `background.type` | string | Always `"procedural"` |
| `background.generator` | string | Template ID (e.g., `tavern`, `village_square`) |
| `visuals` | array | Decorative props rendered in the scene |
| `walkableArea.rects` | array | Rectangles where the player can walk |

#### Hotspot Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique hotspot ID (used in puzzle triggers) |
| `name` | string | Display name shown in action text |
| `rect` | `{x, y, width, height}` | Clickable area in game coordinates |
| `walkTo` | `{x, y}` | Where the player walks before interacting |
| `visible` | boolean | Whether the hotspot is initially visible (default: `true`). Hidden hotspots can be revealed by puzzles. |
| `responses` | map | Verb ID → response text (e.g., `look_at`, `pick_up`, `use`, `open`, `push`, etc.) |

#### Exit Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique exit ID |
| `rect` | `{x, y, width, height}` | Clickable area |
| `walkTo` | `{x, y}` | Where the player walks before transitioning |
| `target` | string | Destination room ID |
| `spawnAt` | `{x, y}` | Player position in the target room |
| `name` | string | Display name for the exit |
| `lookAt` | string | Text shown when using Look At on the exit |

#### Visuals (Props)

| Field | Type | Description |
|---|---|---|
| `type` | string | Prop type from the setting's prop list |
| `x` | number | X position |
| `y` | number | Y position |
| `variant` | string | Optional variant (e.g., `cluster`, `small`) |

### npcs.yaml — NPC Definitions

```yaml
npcs:
  - id: bartender
    name: "Bartender Gruff"
    traits:
      bodyType: stocky
      gender: male
      skinTone: tan
      hairStyle: bald
      hairColor: brown
      facial: mustache
      clothing: apron
      clothingColor: brown
      accessory: none
      footwear: boots

    placements:
      - room: tavern
        position: { x: 165, y: 52 }
        size: { width: 20, height: 30 }
        walkTo: { x: 160, y: 100 }
        facing: left

    dialogue: bartender
    dialogueOverrides:
      - condition: { or: [{ hasItem: old_key }, { hasFlag: got_tankard }] }
        dialogue: bartender_after_key

    barks:
      - "*polishes a glass*"
      - "What'll it be?"
      - "Keep it down over there!"

    responses:
      look_at: "A burly man with a magnificent beard."
      pick_up: "I don't think he'd appreciate that."
      use: "I should talk to him instead."
```

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique NPC identifier |
| `name` | string | Display name |
| `traits` | object | Character appearance traits (see [Character Traits Reference](#character-traits-reference)) |
| `placements` | array | Where the NPC appears (can appear in multiple rooms) |
| `placements[].room` | string | Room ID |
| `placements[].position` | `{x, y}` | NPC position in the room |
| `placements[].size` | `{width, height}` | NPC display size |
| `placements[].walkTo` | `{x, y}` | Where the player walks to interact |
| `placements[].facing` | string | `"left"` or `"right"` (default: `"right"`) |
| `dialogue` | string | Default dialogue tree ID |
| `dialogueOverrides` | array | Conditional dialogue switches |
| `dialogueOverrides[].condition` | object | Condition expression (see [Conditions](#conditions)) |
| `dialogueOverrides[].dialogue` | string | Dialogue tree ID to use when condition is met |
| `barks` | array of strings | Random ambient lines shown when idle |
| `responses` | map | Verb ID → response text for non-Talk To verbs |

### items.yaml — Item Definitions

```yaml
items:
  - id: gold_coin
    name: "Gold Coin"
    description: "A shiny gold coin with a dragon engraved on one side."
    icon: { generator: gold_coin }
    useOn:
      bartender: puzzle
      well: "I'm not throwing money down a well."
    useDefault: "I can't spend that here."
    responses:
      look_at: "A shiny gold coin with a dragon engraved on one side."
```

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique item identifier |
| `name` | string | Display name |
| `description` | string | Item description |
| `icon` | object | `{ generator: "icon_type" }` — procedural icon from the setting's icon list |
| `useOn` | map | Target ID → response text, or `"puzzle"` to delegate to PuzzleSystem |
| `useDefault` | string | Fallback text when using item on an unrecognized target |
| `responses` | map | Verb ID → response text (e.g., `look_at`, `use`) |

### puzzles.yaml — Puzzle Definitions

Puzzles resolve verb+target interactions with conditions and action sequences.

```yaml
puzzles:
  - id: rope_in_well
    trigger: { verb: use, item: rope, target: well }
    conditions:
      - hasItem: rope
    actions:
      - say: "I'll lower the rope into the well..."
      - wait: 40
      - say: "A gold coin! It was stuck in a crack."
      - addItem: gold_coin
      - removeItem: rope
      - setFlag: got_coin_from_well
    failText: "I need something to lower into the well first."
```

#### Trigger Patterns

| Pattern | Format | Example |
|---|---|---|
| Verb + Target | `{ verb: look_at, target: notice_board }` | Look at a hotspot |
| Verb + Item + Target | `{ verb: use, item: rope, target: well }` | Use inventory item on a hotspot/NPC |
| Verb + Target (pick up) | `{ verb: pick_up, target: rope_on_stall }` | Pick up a hotspot object |

The engine builds lookup keys: `verb:target` or `verb:item:target`.

#### Conditions

All conditions must pass for the puzzle to trigger. If any fail, `failText` is shown instead.

| Condition | Description | Example |
|---|---|---|
| `hasItem: "id"` | Player has the item in inventory | `hasItem: rope` |
| `notItem: "id"` | Player does NOT have the item | `notItem: gold_coin` |
| `hasFlag: "name"` | Boolean flag is set to true | `hasFlag: hermit_bribed` |
| `notFlag: "name"` | Boolean flag is not set | `notFlag: got_tankard` |

#### Actions

Actions execute sequentially when all conditions pass.

| Action | Description | Example |
|---|---|---|
| `say: "text"` | Player speaks the text | `say: "I'll take this rope."` |
| `addItem: "id"` | Add item to inventory | `addItem: gold_coin` |
| `removeItem: "id"` | Remove item from inventory | `removeItem: rope` |
| `setFlag: "name"` | Set a boolean flag to true | `setFlag: got_coin_from_well` |
| `wait: frames` | Pause for N frames (~60fps) | `wait: 40` |
| `hideHotspot: {room, id}` | Hide a hotspot in a room | `hideHotspot: { room: village_square, id: rope_on_stall }` |
| `showEnding: true` | Trigger the game ending screen | `showEnding: true` |

#### Interaction Resolution Priority

When the player performs an action, the engine resolves it in this order:
1. **PuzzleSystem** — checks for matching trigger keys with passing conditions
2. **Hotspot/NPC responses** — verb-specific response text on the object
3. **Default responses** — per-verb fallback from `game.yaml`

### dialogues/*.yaml — Dialogue Trees

Dialogue trees define branching NPC conversations with conditions and actions.

```yaml
dialogue:
  id: bartender
  startNode: start

  idleLines:
    - "Still here? Want me to recite the menu?"
    - "I once arm-wrestled a troll. Didn't go well for the table."

  nodes:
    start:
      text: "Welcome to the Rusty Dragon! What can I do for ye?"
      choices:
        - text: "I need the Enchanted Tankard."
          next: ask_tankard
        - text: "Tell me about this tavern."
          next: about_tavern
        - text: "Nothing, just passing through."
          next: goodbye

    ask_tankard:
      text: "Bring me a gold coin and I'll give you the key."
      choices:
        - text: "I have a gold coin! Here you go."
          next: give_coin
          condition: { hasItem: gold_coin }
        - text: "Where would I find one?"
          next: coin_hint

    give_coin:
      text: "A deal's a deal! Here's the key."
      actions:
        - removeItem: gold_coin
        - addItem: old_key
        - setFlag: has_key
      next: goodbye_happy

    goodbye:
      text: "Come back anytime, squire!"
      exhausted: true
```

#### Dialogue Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique dialogue tree identifier (referenced by NPC `dialogue` field) |
| `startNode` | string | Node ID where the conversation begins |
| `idleLines` | array of strings | Lines shown after the NPC is exhausted (cycles round-robin) |

#### Node Fields

| Field | Type | Description |
|---|---|---|
| `text` | string | NPC speech text (displayed with typewriter effect) |
| `choices` | array | Branching options presented to the player |
| `next` | string | Auto-advance to this node ID (when no choices) |
| `actions` | array | Actions executed when this node is reached |
| `exhausted` | boolean | If `true`, marks the NPC as exhausted when this node is reached |

#### Choice Fields

| Field | Type | Description |
|---|---|---|
| `text` | string | Choice text shown to the player |
| `next` | string | Target node ID when selected |
| `condition` | object | Condition that must pass for this choice to appear |
| `actions` | array | Actions executed when this choice is selected |

#### Conditions

Conditions in dialogue choices control visibility. They support logical operators:

| Condition | Description |
|---|---|
| `hasFlag: "name"` | Flag is true |
| `notFlag: "name"` | Flag is false |
| `hasItem: "id"` | Item is in inventory |
| `and: [...]` | All sub-conditions must be true |
| `or: [...]` | Any sub-condition must be true |
| `not: {...}` | Negate a sub-condition |

Actions in dialogue nodes use the same format as puzzle actions (`say`, `addItem`, `removeItem`, `setFlag`, etc.).

#### Exhaustion

When the player reaches a node with `exhausted: true`, the NPC is flagged as exhausted. Subsequent interactions show cycling `idleLines` instead of restarting the dialogue tree. Dialogue overrides (via `dialogueOverrides` on the NPC) can reset exhaustion by switching to a different tree.

---

## Settings & Templates

The engine ships with 4 settings, each providing 8 room templates (32 total), palettes, props, character traits, and item icons.

### Fantasy Medieval

*Swords, sorcery, taverns and dungeons*

| | |
|---|---|
| **Templates** | tavern, village_square, forest_path, temple_ruins, castle_hall, dungeon_cell, market_square, cave_entrance |
| **Palettes** | tavern_warm, village_day, forest_deep, temple_mystic, castle_grand, dungeon_dark |
| **Clothing** | tunic, apron, robe, armor, vest, cloak, dress, merchant_garb |
| **Accessories** | hood, hat, headband, eyepatch, glasses, crown, helmet, circlet, none |
| **Footwear** | boots, shoes, sandals, armored_boots, none |
| **Props** | barrel, table, chair, torch_sconce, cauldron, chest, banner, throne, well, cart, statue, bookshelf, rug, crate, lamp |
| **Item Icons** | weapon_sword, weapon_dagger, weapon_staff, potion, scroll, key, coin, gem, ring, book, rope, lantern, food, drink |

### Science Fiction

*Starships, colonies, alien worlds and high technology*

| | |
|---|---|
| **Templates** | ship_bridge, colony_hub, corridor, cargo_bay, lab_interior, alien_planet, cantina, engine_room |
| **Palettes** | ship_bridge, colony_hub, corridor_dark, lab_bright, alien_planet |
| **Clothing** | jumpsuit, uniform, labcoat, spacesuit, tunic, vest, robe, armor |
| **Accessories** | visor, headset, goggles, helmet, eyepatch, circlet, glasses, none |
| **Footwear** | boots, mag_boots, shoes, sandals, none |
| **Props** | console, terminal, pipe, vent, hologram, reactor, antenna, pod, crate, lamp, table, chair |
| **Item Icons** | weapon_blaster, weapon_phaser, keycard, datapad, medkit, circuit, power_cell, food, drink, tool |

### Contemporary

*Modern-day cities, offices, apartments and streets*

| | |
|---|---|
| **Templates** | apartment, city_street, office, park, cafe, subway_station, warehouse, parking_lot |
| **Palettes** | apartment_neutral, city_day, office_bright, park_green, subway_dark |
| **Clothing** | jacket, suit, hoodie, tshirt, tunic, vest, robe, apron |
| **Accessories** | sunglasses, hat, headphones, glasses, cap, scarf, badge, none |
| **Footwear** | sneakers, shoes, boots, sandals, none |
| **Props** | bench, trash_can, lamppost, mailbox, dumpster, planter, atm, table, chair, crate, lamp |
| **Item Icons** | key, phone, wallet, flashlight, toolbox, note, food, drink, usb_drive, badge |

### 1980s Retro

*Arcades, malls, neon lights and cassette tapes*

| | |
|---|---|
| **Templates** | arcade, mall_interior, suburban_street, record_store, diner, video_store, high_school, basement |
| **Palettes** | arcade_neon, mall_bright, suburban_warm, record_store_dark, diner_warm |
| **Clothing** | neon_jacket, leather_jacket, band_tee, tracksuit, tunic, vest, hoodie, tshirt |
| **Accessories** | sunglasses, headband, sweatband, walkman, cap, bandana, glasses, none |
| **Footwear** | high_tops, sneakers, boots, shoes, none |
| **Props** | arcade_cabinet, neon_sign, boombox, poster, skateboard, cassette, tv, table, chair, crate, lamp |
| **Item Icons** | cassette_tape, walkman, coin, key, skateboard, vhs_tape, food, drink, note, badge |

### Character Traits Reference

These traits are shared across all settings. Settings restrict which clothing, accessories, and footwear are available.

| Trait | Valid Values |
|---|---|
| `bodyType` | `slim`, `average`, `stocky`, `tall` |
| `gender` | `male`, `female` |
| `skinTone` | `fair`, `tan`, `brown`, `dark`, `pale` |
| `hairStyle` | `short`, `long`, `ponytail`, `messy`, `braided`, `bald` |
| `hairColor` | `brown`, `black`, `blonde`, `red`, `gray`, `white` |
| `clothing` | Setting-dependent (see tables above) |
| `clothingColor` | `blue`, `red`, `green`, `brown`, `purple`, `white`, `black`, `yellow`, `orange`, `gray`, or `#hex` |
| `facial` | `beard`, `mustache`, `goatee`, `none` |
| `accessory` | Setting-dependent (see tables above) |
| `footwear` | Setting-dependent (see tables above) |

---

## Architecture Overview

### Module Map

```
src/
├── main.js                    # GameEngine — orchestrator & main loop
├── engine/
│   ├── Renderer.js            # Double-buffer canvas (320×200 pixel art + hi-res text)
│   ├── AssetLoader.js         # Asset cache (procedurally generated canvases)
│   ├── InputManager.js        # Mouse input tracking
│   ├── ProceduralAssets.js    # Generates all visual assets
│   ├── CharacterGenerator.js  # Trait-based character sprite assembly
│   ├── PixelArtToolkit.js     # Drawing primitives
│   ├── GameLoader.js          # Fetches & parses YAML game definitions
│   └── ContentRegistry.js     # Central lookup API for loaded game content
├── systems/
│   ├── SceneManager.js        # Room loading & background rendering
│   ├── VerbSystem.js          # 9-verb UI bar
│   ├── InventorySystem.js     # Item list, scrolling, selection
│   ├── DialogueSystem.js      # Branching conversations with typewriter effect
│   ├── WalkingSystem.js       # Player movement and walk cycles
│   ├── ScriptRunner.js        # Queued action sequences
│   ├── CharacterSystem.js     # NPC placement and rendering
│   ├── PuzzleSystem.js        # Verb+target interaction resolution
│   └── SaveSystem.js          # localStorage serialization
├── creator/
│   ├── CreatorApp.js          # Main orchestrator — 7-tab navigation
│   ├── CreatorState.js        # Central state + observer pattern
│   ├── PreviewCanvas.js       # 320×200 canvas scaled 3x
│   ├── CanvasOverlay.js       # Interactive rect drawing overlay
│   ├── ExportBuilder.js       # State → YAML + ZIP export
│   ├── PlayTestLauncher.js    # Serializes state for live testing
│   ├── Validator.js           # Pre-export validation
│   └── panels/               # UI panels for each tab
├── settings/                  # Setting definitions (fantasy, scifi, contemporary, eighties)
└── templates/                 # 8 room background generators per setting (32 total)
```

### Design Patterns

- **Mediator pattern** — systems have no cross-dependencies. `GameEngine` wires everything together; systems receive what they need via method parameters and never import each other.
- **Observer pattern** — the Creator uses `CreatorState._notify()` to trigger re-renders across all panels. `CreatorApp` batches re-renders via `queueMicrotask()`.

### Rendering Pipeline

Fixed **320×200 internal resolution** (classic VGA) with double-buffer rendering:
- **Pixel art layer** — offscreen buffer at 320×200, scaled to display canvas with `imageSmoothingEnabled = false`
- **Hi-res text layer** — text rendered directly on the scaled canvas for crisp readability

Screen layout: game viewport (rows 0–139), action text bar (140–150), verb grid + inventory (151–200).

### All Art is Procedural

No external image assets. Room backgrounds are generated by template functions at startup. Characters are rendered each frame by `CharacterGenerator.draw()` from trait descriptors. Item icons are generated procedurally per setting.

---

## Project Structure

```
claude_retro/
├── index.html                         # Game player entry
├── creator.html                       # Game Creator entry
├── vite.config.js                     # Dual entry points
├── public/
│   └── content/
│       └── enchanted_tankard/         # Demo game (YAML DSL)
│           ├── game.yaml              # Manifest
│           ├── protagonist.yaml       # Player character
│           ├── items.yaml             # Item definitions
│           ├── npcs.yaml              # NPC definitions
│           ├── puzzles.yaml           # Puzzle definitions
│           ├── rooms/                 # Room definitions
│           └── dialogues/             # Dialogue trees
├── src/
│   ├── main.js                        # GameEngine class
│   ├── engine/                        # Core engine modules
│   ├── systems/                       # Game systems
│   ├── creator/                       # Game Creator (visual editor)
│   │   ├── panels/                    # Tab panel components
│   │   └── styles/                    # Creator CSS
│   ├── settings/                      # Setting definitions
│   └── templates/                     # Room background generators
│       ├── _base.js                   # Shared drawing helpers
│       ├── fantasy/                   # 8 fantasy templates
│       ├── scifi/                     # 8 sci-fi templates
│       ├── contemporary/             # 8 contemporary templates
│       └── eighties/                  # 8 eighties templates
└── package.json
```

---

## Adding Content

### New Room

1. Create `public/content/<game>/rooms/new_room.yaml` with background, walkable area, hotspots, and exits
2. Add the path to `game.yaml` under `rooms`
3. Connect it from another room via an exit with matching `target` and `spawnAt`

### New NPC

1. Add the NPC definition to `npcs.yaml` with traits, placements, and dialogue reference
2. Create the dialogue tree in `dialogues/npc_name.yaml`
3. Add the dialogue path to `game.yaml` under `dialogues`

### New Item

1. Add the item to `items.yaml` with icon generator, useOn targets, and responses
2. Items enter the player's inventory via puzzle `addItem` actions or dialogue actions

### New Puzzle

1. Add the puzzle to `puzzles.yaml` with trigger, conditions, and actions
2. Reference existing hotspot/NPC IDs in the trigger's `target` field
3. Use `"puzzle"` as the `useOn` value in items.yaml for item+target combinations

### New Dialogue

1. Create `dialogues/npc_name.yaml` with a start node and branching nodes
2. End conversation branches with `exhausted: true` on terminal nodes
3. Add `idleLines` for post-exhaustion ambient dialogue
4. Reference the dialogue ID in the NPC's `dialogue` field

---

## Roadmap

- [ ] Sound & music system (chip-tune playback from YAML-defined note sequences)
- [ ] LLM-powered descriptions (AI-generated flavor text for unmatched interactions)
- [ ] Sprite sheet animation support (walking, idle, custom character animations)
- [ ] Global state browser (debug UI to visualize flags and puzzle dependency trees)
- [ ] Multiple game support (load different game packages from a menu)

---

Built by CaDs. Inspired by the classics of the 90s.
