/**
 * ScriptRunner — Executes scripted sequences (cutscenes, interaction responses).
 * Processes a queue of actions sequentially.
 */
export class ScriptRunner {
  constructor() {
    this.running = false;
    this.queue = [];
    this.currentAction = null;
    this.waitTimer = 0;
    this.onActionComplete = null;
  }

  /**
   * Run a sequence of scripted actions.
   * @param {Array} actions - Array of action objects
   * @param {Function} onComplete - Called when sequence finishes
   */
  run(actions, onComplete) {
    this.queue = [...actions];
    this.running = true;
    this.onActionComplete = onComplete || null;
    this._next();
  }

  /**
   * Process next action in queue.
   */
  _next() {
    if (this.queue.length === 0) {
      this.running = false;
      this.currentAction = null;
      if (this.onActionComplete) {
        this.onActionComplete();
      }
      return;
    }
    this.currentAction = this.queue.shift();
  }

  /**
   * Update — called each frame by the game.
   * The game passes handler functions for each action type.
   */
  update(handlers) {
    if (!this.running || !this.currentAction) return;

    // Wait action
    if (this.currentAction.type === 'wait') {
      this.waitTimer++;
      if (this.waitTimer >= (this.currentAction.frames || 60)) {
        this.waitTimer = 0;
        this._next();
      }
      return;
    }

    // All other actions are dispatched to handlers and advance immediately
    const handler = handlers[this.currentAction.type];
    if (handler) {
      const result = handler(this.currentAction);
      // If handler returns a promise or 'async', wait for callback
      if (result === 'async') {
        // Handler will call scriptRunner.advance() when done
        return;
      }
    } else {
      console.warn(`No handler for script action: ${this.currentAction.type}`);
    }

    this._next();
  }

  /**
   * Advance to next action (called externally for async actions).
   */
  advance() {
    this._next();
  }

  /**
   * Check if currently running.
   */
  isRunning() {
    return this.running;
  }

  /**
   * Cancel the current sequence.
   */
  cancel() {
    this.queue = [];
    this.running = false;
    this.currentAction = null;
  }
}
