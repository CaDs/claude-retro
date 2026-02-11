import { CharacterGenerator } from '../engine/CharacterGenerator.js';

/**
 * CharacterSystem — Manages protagonist and NPC characters.
 * Handles NPC placement, rendering, and interaction lookups.
 */
export class CharacterSystem {
  constructor(content) {
    this.content = content;
    this.protagonist = content.protagonist;
  }

  /**
   * Get NPCs placed in the given room, with their position and size.
   * Returns data compatible with room NPC rendering.
   */
  getNpcsInRoom(roomId) {
    const npcs = this.content.getNpcsInRoom(roomId);
    return npcs.map(npc => {
      const placement = npc.placements.find(p => p.room === roomId);
      return {
        id: npc.id,
        name: npc.name,
        x: placement.position.x,
        y: placement.position.y,
        width: placement.size?.width || 20,
        height: placement.size?.height || 30,
        walkToX: placement.walkTo?.x || placement.position.x,
        walkToY: placement.walkTo?.y || placement.position.y + 50,
        dialogueKey: npc.dialogue,
        lookAt: npc.responses?.look_at || `It's ${npc.name}.`,
        _npcDef: npc, // keep reference for rendering traits
      };
    });
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
  drawNpc(renderer, npc) {
    const npcDef = npc._npcDef || this.content.getNpc(npc.id);
    if (!npcDef || !npcDef.traits) return;
    CharacterGenerator.draw(renderer, npc.x, npc.y, npcDef.traits);
  }

  /**
   * Draw the protagonist at the given position.
   */
  drawProtagonist(renderer, x, y) {
    if (this.protagonist && this.protagonist.traits) {
      CharacterGenerator.draw(renderer, x, y, this.protagonist.traits);
    }
  }
}
