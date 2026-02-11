import { CharacterGenerator } from '../engine/CharacterGenerator.js';

/**
 * CharacterSystem — Manages protagonist and NPC characters.
 * Handles NPC placement, rendering, and interaction lookups.
 * Supports time-of-day schedules for NPC positioning.
 */
export class CharacterSystem {
  constructor(content) {
    this.content = content;
    this.protagonist = content.protagonist;
  }

  /**
   * Get NPCs placed in the given room, with their position and size.
   * If timeOfDay is provided, checks NPC schedules for overrides.
   * @param {string} roomId
   * @param {string} [timeOfDay] - 'morning', 'afternoon', 'evening', or 'night'
   */
  getNpcsInRoom(roomId, timeOfDay) {
    const allNpcs = this.content.getAllNpcs();
    const results = [];

    for (const npc of allNpcs) {
      // Check schedule override first
      if (timeOfDay && npc.schedule && npc.schedule[timeOfDay]) {
        const sched = npc.schedule[timeOfDay];
        if (sched.room === roomId) {
          results.push(this._buildNpcData(npc, {
            room: roomId,
            position: sched.position || npc.placements?.[0]?.position,
            size: sched.size,
            facing: sched.facing,
            walkTo: sched.walkTo,
          }));
        }
        // If schedule specifies a different room, NPC is not in this room
        continue;
      }

      // Default placement
      if (!npc.placements) continue;
      const placement = npc.placements.find(p => p.room === roomId);
      if (placement) {
        results.push(this._buildNpcData(npc, placement));
      }
    }

    return results;
  }

  /**
   * Build NPC data object from an NPC definition and placement.
   */
  _buildNpcData(npc, placement) {
    return {
      id: npc.id,
      name: npc.name,
      x: placement.position.x,
      y: placement.position.y,
      width: placement.size?.width || 20,
      height: placement.size?.height || 30,
      facing: placement.facing || 'right',
      walkToX: placement.walkTo?.x || placement.position.x,
      walkToY: placement.walkTo?.y || placement.position.y + 50,
      dialogueKey: npc.dialogue,
      lookAt: npc.responses?.look_at || `It's ${npc.name}.`,
      _npcDef: npc,
    };
  }

  /**
   * Get NPC definition by ID.
   */
  getNpc(id) {
    return this.content.getNpc(id);
  }

  /**
   * Get an NPC's response for a given verb.
   */
  getNpcResponse(npcId, verb) {
    const npc = this.content.getNpc(npcId);
    if (!npc || !npc.responses) return null;
    return npc.responses[verb] || null;
  }

  /**
   * Draw an NPC using the CharacterGenerator.
   */
  drawNpc(renderer, npc, frame = 0, facing) {
    const npcDef = npc._npcDef || this.content.getNpc(npc.id);
    if (!npcDef || !npcDef.traits) return;
    const npcFacing = facing || npc.facing || 'right';
    CharacterGenerator.draw(renderer, npc.x, npc.y, npcDef.traits, frame, npcFacing);
  }

  /**
   * Draw the protagonist at the given position.
   */
  drawProtagonist(renderer, x, y, frame = 0, facing = 'right') {
    if (this.protagonist && this.protagonist.traits) {
      CharacterGenerator.draw(renderer, x, y, this.protagonist.traits, frame, facing);
    }
  }
}
