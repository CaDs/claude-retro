/**
 * SceneManager — Manages room loading, hotspot detection, and room transitions.
 */
export class SceneManager {
  constructor() {
    this.rooms = {};
    this.currentRoom = null;
    this.currentRoomId = null;
  }

  /**
   * Register a room definition.
   */
  registerRoom(id, roomDef) {
    this.rooms[id] = roomDef;
  }

  /**
   * Load a room by ID.
   */
  loadRoom(id) {
    const room = this.rooms[id];
    if (!room) {
      console.error(`Room not found: ${id}`);
      return null;
    }
    this.currentRoom = room;
    this.currentRoomId = id;
    return room;
  }

  /**
   * Get current room data.
   */
  getRoom() {
    return this.currentRoom;
  }

  /**
   * Find a hotspot at the given coordinates.
   */
  getHotspotAt(x, y) {
    if (!this.currentRoom || !this.currentRoom.hotspots) return null;

    for (const hotspot of this.currentRoom.hotspots) {
      if (!hotspot.enabled && hotspot.enabled !== undefined) continue;

      const hx = hotspot.x;
      const hy = hotspot.y;
      const hw = hotspot.width;
      const hh = hotspot.height;

      if (x >= hx && x < hx + hw && y >= hy && y < hy + hh) {
        return hotspot;
      }
    }
    return null;
  }

  /**
   * Find an exit at the given coordinates.
   */
  getExitAt(x, y) {
    if (!this.currentRoom || !this.currentRoom.exits) return null;

    for (const exit of this.currentRoom.exits) {
      if (x >= exit.x && x < exit.x + exit.width &&
          y >= exit.y && y < exit.y + exit.height) {
        return exit;
      }
    }
    return null;
  }

  /**
   * Check if a point is in the walkable area.
   */
  isWalkable(x, y) {
    if (!this.currentRoom || !this.currentRoom.walkableArea) return true;

    const wa = this.currentRoom.walkableArea;

    // Simple rect-based walkable area
    if (wa.rects) {
      return wa.rects.some(r =>
        x >= r.x && x < r.x + r.width &&
        y >= r.y && y < r.y + r.height
      );
    }

    // Polygon-based
    if (wa.polygon) {
      return this._pointInPolygon(x, y, wa.polygon);
    }

    return true;
  }

  /**
   * Get the closest walkable point to target.
   */
  getClosestWalkable(tx, ty) {
    if (this.isWalkable(tx, ty)) return { x: tx, y: ty };

    // Clamp to walkable area rects
    if (this.currentRoom.walkableArea && this.currentRoom.walkableArea.rects) {
      let closest = null;
      let minDist = Infinity;

      for (const r of this.currentRoom.walkableArea.rects) {
        const cx = Math.max(r.x, Math.min(tx, r.x + r.width));
        const cy = Math.max(r.y, Math.min(ty, r.y + r.height));
        const dist = Math.hypot(cx - tx, cy - ty);
        if (dist < minDist) {
          minDist = dist;
          closest = { x: cx, y: cy };
        }
      }
      return closest || { x: tx, y: ty };
    }

    return { x: tx, y: ty };
  }

  _pointInPolygon(px, py, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      const intersect = ((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Render the room background.
   */
  renderBackground(renderer, assets) {
    if (!this.currentRoom) return;
    const bg = assets.get(`room_${this.currentRoomId}`);
    if (bg) {
      renderer.drawImage(bg, 0, 0, 320, 140);
    } else {
      // Fallback colored background
      renderer.drawRect(0, 0, 320, 140, this.currentRoom.bgColor || '#2a1a3a');
      renderer.drawText(this.currentRoom.name || this.currentRoomId, 10, 10, {
        color: '#666', size: 8
      });
    }
  }

  /**
   * Render room title.
   */
  renderTitle(renderer) {
    if (!this.currentRoom) return;
    // Room name at top
    // renderer.drawText(this.currentRoom.name, 160, 2, {
    //   align: 'center', color: '#888', size: 7
    // });
  }
}
