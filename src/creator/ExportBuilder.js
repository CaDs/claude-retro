/**
 * ExportBuilder.js
 *
 * Generates YAML file contents from CreatorState ready for download.
 * Supports exporting as individual files or as a ZIP archive.
 */

import yaml from 'js-yaml';

export class ExportBuilder {
  /**
   * Generate all YAML files from state.
   * @param {CreatorState} state
   * @returns {Array<{path: string, content: string}>} Array of file entries
   */
  static buildFiles(state) {
    const files = [];

    // --- game.yaml (always required) ---
    files.push({
      path: 'game.yaml',
      content: yaml.dump(state.toYaml(), { lineWidth: 120, noRefs: true }),
    });

    // --- rooms/*.yaml (one file per room) ---
    for (const room of state.rooms) {
      const roomYaml = state.toRoomYaml(room.id);
      if (roomYaml) {
        files.push({
          path: `rooms/${room.id}.yaml`,
          content: yaml.dump(roomYaml, { lineWidth: 120, noRefs: true }),
        });
      }
    }

    // --- npcs.yaml (if NPCs exist) ---
    if (state.npcs.length > 0) {
      files.push({
        path: 'npcs.yaml',
        content: yaml.dump(state.toNpcsYaml(), { lineWidth: 120, noRefs: true }),
      });
    }

    // --- items.yaml (if items exist) ---
    if (state.items.length > 0) {
      files.push({
        path: 'items.yaml',
        content: yaml.dump(state.toItemsYaml(), { lineWidth: 120, noRefs: true }),
      });
    }

    // --- puzzles.yaml (if puzzles exist) ---
    if (state.puzzles.length > 0) {
      files.push({
        path: 'puzzles.yaml',
        content: yaml.dump(state.toPuzzlesYaml(), { lineWidth: 120, noRefs: true }),
      });
    }

    // --- dialogues/*.yaml (one file per dialogue tree) ---
    for (const dialogueId of Object.keys(state.dialogues)) {
      const dialogueYaml = state.toDialogueYaml(dialogueId);
      if (dialogueYaml) {
        files.push({
          path: `dialogues/${dialogueId}.yaml`,
          content: yaml.dump(dialogueYaml, { lineWidth: 120, noRefs: true }),
        });
      }
    }

    return files;
  }

  /**
   * Build a ZIP blob containing all YAML files.
   * Uses dynamic import for jszip to keep bundle size small.
   * Falls back to single concatenated text file if JSZip is unavailable.
   * @param {CreatorState} state
   * @returns {Promise<Blob>}
   */
  static async buildZip(state) {
    const files = this.buildFiles(state);

    try {
      // Try to load JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add all files to the ZIP
      for (const file of files) {
        zip.file(file.path, file.content);
      }

      // Generate the ZIP blob
      return await zip.generateAsync({ type: 'blob' });
    } catch (e) {
      console.warn('[ExportBuilder] JSZip not available, falling back to concatenated text file:', e);

      // Fallback: create a single concatenated text file
      let combined = '# Game Content Export\n';
      combined += '# This file contains all game YAML files concatenated together.\n';
      combined += '# Extract each section into separate files as indicated by the headers.\n\n';

      for (const file of files) {
        combined += `# ========================================\n`;
        combined += `# File: ${file.path}\n`;
        combined += `# ========================================\n\n`;
        combined += file.content;
        combined += '\n\n';
      }

      return new Blob([combined], { type: 'text/yaml; charset=utf-8' });
    }
  }

  /**
   * Get a human-readable size estimate for a string.
   * @param {string} content
   * @returns {string} Size formatted as KB or Bytes
   */
  static formatSize(content) {
    const bytes = new Blob([content]).size;
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${bytes} bytes`;
  }

  /**
   * Generate a downloadable filename based on game title and timestamp.
   * @param {CreatorState} state
   * @param {string} extension  File extension (e.g. 'zip', 'yaml')
   * @returns {string}
   */
  static generateFilename(state, extension) {
    const title = (state.game.title || 'my_game')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return `${title}_${timestamp}.${extension}`;
  }
}
