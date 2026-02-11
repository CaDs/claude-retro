/**
 * SaveSystem — Serialize/deserialize game state to localStorage.
 */
export class SaveSystem {
  constructor(storageKey = 'enchanted_tankard_save') {
    this.storageKey = storageKey;
  }

  /**
   * Save current game state.
   */
  save(gameState) {
    try {
      const data = JSON.stringify(gameState);
      localStorage.setItem(this.storageKey, data);
      return true;
    } catch (e) {
      console.error('Failed to save game:', e);
      return false;
    }
  }

  /**
   * Load saved game state.
   */
  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load save:', e);
      return null;
    }
  }

  /**
   * Check if a save exists.
   */
  hasSave() {
    return localStorage.getItem(this.storageKey) !== null;
  }

  /**
   * Delete the save.
   */
  deleteSave() {
    localStorage.removeItem(this.storageKey);
  }
}
