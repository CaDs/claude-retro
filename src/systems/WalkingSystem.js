/**
 * WalkingSystem — Handles player character walking with simple pathfinding.
 */
export class WalkingSystem {
  constructor() {
    // Player state
    this.x = 160;
    this.y = 110;
    this.targetX = 160;
    this.targetY = 110;
    this.walking = false;
    this.speed = 1.2;
    this.direction = 'right'; // 'left', 'right'
    this.frame = 0;
    this.frameTimer = 0;
    this.frameSpeed = 8; // frames between animation updates
    this.totalFrames = 4; // walk cycle frames

    // Sprite dimensions
    this.spriteWidth = 16;
    this.spriteHeight = 24;

    // Callback when destination reached
    this.onArrived = null;
  }

  /**
   * Walk to a target position.
   */
  walkTo(tx, ty, onArrived) {
    this.targetX = tx;
    this.targetY = ty;
    this.walking = true;
    this.onArrived = onArrived || null;

    // Set facing direction
    if (tx < this.x) this.direction = 'left';
    else if (tx > this.x) this.direction = 'right';
  }

  /**
   * Instantly teleport to position.
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.walking = false;
  }

  /**
   * Update walking state each frame.
   */
  update() {
    if (!this.walking) return;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < this.speed) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.walking = false;
      this.frame = 0;
      if (this.onArrived) {
        const cb = this.onArrived;
        this.onArrived = null;
        cb();
      }
      return;
    }

    // Move towards target
    this.x += (dx / dist) * this.speed;
    this.y += (dy / dist) * this.speed;

    // Update facing direction
    if (dx < -0.5) this.direction = 'left';
    else if (dx > 0.5) this.direction = 'right';

    // Animate walk cycle
    this.frameTimer++;
    if (this.frameTimer >= this.frameSpeed) {
      this.frameTimer = 0;
      this.frame = (this.frame + 1) % this.totalFrames;
    }
  }

  /**
   * Render the player character.
   */
  render(renderer, assets) {
    const sprite = assets.get('player');

    if (sprite) {
      // Sprite sheet: columns = frames, rows = [idle, walk_right, walk_left]
      const row = this.walking ? (this.direction === 'right' ? 1 : 2) : 0;
      const col = this.walking ? this.frame : 0;

      renderer.drawSprite(sprite,
        col * this.spriteWidth, row * this.spriteHeight,
        this.spriteWidth, this.spriteHeight,
        Math.floor(this.x - this.spriteWidth / 2),
        Math.floor(this.y - this.spriteHeight),
        this.spriteWidth, this.spriteHeight
      );
    } else {
      // Fallback: draw a simple character rectangle
      const px = Math.floor(this.x - 6);
      const py = Math.floor(this.y - 20);

      // Body
      renderer.drawRect(px + 2, py + 8, 8, 12, '#5a4a2a');
      // Head
      renderer.drawRect(px + 3, py, 6, 8, '#d4a574');
      // Eyes
      renderer.drawRect(px + 4, py + 3, 2, 2, '#222');
      renderer.drawRect(px + 7, py + 3, 2, 2, '#222');
      // Simple walking animation
      if (this.walking) {
        const legOffset = this.frame % 2 === 0 ? 0 : 2;
        renderer.drawRect(px + 2, py + 20, 3, 4, '#3a2a1a');
        renderer.drawRect(px + 7, py + 20 + legOffset, 3, 4, '#3a2a1a');
      } else {
        renderer.drawRect(px + 2, py + 20, 3, 4, '#3a2a1a');
        renderer.drawRect(px + 7, py + 20, 3, 4, '#3a2a1a');
      }
    }
  }
}
