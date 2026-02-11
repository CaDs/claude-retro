/**
 * WalkingSystem — Handles player character walking with simple pathfinding.
 * Also manages idle animation state (breathing bob + blink).
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

    // Idle animation state
    this.idleTimer = 0;        // frames standing still
    this.idleFrame = 0;        // 0 (breathe) or 1 (blink)
    this.idleFrameTimer = 0;
    this.idleFrameSpeed = 40;  // ~667ms per idle frame at 60fps
    this.idleThreshold = 120;  // ~2s before idle starts
    this.isIdle = false;

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

    // Reset idle state
    this.idleTimer = 0;
    this.idleFrame = 0;
    this.idleFrameTimer = 0;
    this.isIdle = false;

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

    // Reset idle state
    this.idleTimer = 0;
    this.idleFrame = 0;
    this.idleFrameTimer = 0;
    this.isIdle = false;
  }

  /**
   * Update walking state each frame.
   */
  update() {
    if (!this.walking) {
      // Idle animation logic
      this.idleTimer++;
      if (this.idleTimer >= this.idleThreshold) {
        this.isIdle = true;
        this.idleFrameTimer++;
        if (this.idleFrameTimer >= this.idleFrameSpeed) {
          this.idleFrameTimer = 0;
          this.idleFrame = (this.idleFrame + 1) % 2;
        }
      }
      return;
    }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < this.speed) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.walking = false;
      this.frame = 0;

      // Reset idle state when stopping
      this.idleTimer = 0;
      this.idleFrame = 0;
      this.idleFrameTimer = 0;
      this.isIdle = false;

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
}
