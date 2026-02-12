/**
 * ExportPanel.js
 *
 * Export panel for the Game Creator. Provides export options, validation results,
 * and file preview before download.
 */

import { Validator } from '../Validator.js';
import { ExportBuilder } from '../ExportBuilder.js';
import { PlayTestLauncher } from '../PlayTestLauncher.js';

export class ExportPanel {
  constructor(app) {
    this.app = app;
  }

  /**
   * Render the export panel into left and right panel areas.
   * @param {HTMLElement} leftPanel
   * @param {HTMLElement} rightPanel
   */
  render(leftPanel, rightPanel) {
    this._renderLeftPanel(leftPanel);
    this._renderRightPanel(rightPanel);
  }

  /**
   * Render the left panel: game info summary and export buttons.
   * @param {HTMLElement} leftPanel
   */
  _renderLeftPanel(leftPanel) {
    leftPanel.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'creator-left-panel__header';
    header.innerHTML = `<span class="creator-left-panel__title">Export</span>`;
    leftPanel.appendChild(header);

    const body = document.createElement('div');
    body.style.cssText = 'padding:14px;overflow-y:auto;flex:1;';

    // --- Game Info Summary ---
    const state = this.app.state;
    const summary = document.createElement('div');
    summary.className = 'creator-form-section';
    summary.innerHTML = `
      <div class="creator-form-section__title">Game Info</div>
      <div style="display:flex;flex-direction:column;gap:8px;font-size:12px;">
        <div style="display:flex;justify-content:space-between;">
          <span style="color:var(--color-muted);">Title:</span>
          <span style="color:var(--color-text);font-weight:500;">${this._esc(state.game.title)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:var(--color-muted);">Version:</span>
          <span style="color:var(--color-text);">${this._esc(state.game.version)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:var(--color-muted);">Setting:</span>
          <span style="color:var(--color-text);">${this._esc(state.game.setting || 'None')}</span>
        </div>
      </div>
    `;
    body.appendChild(summary);

    // --- Content Summary ---
    const content = document.createElement('div');
    content.className = 'creator-form-section';
    content.innerHTML = `
      <div class="creator-form-section__title">Content</div>
      <div style="display:flex;flex-direction:column;gap:8px;font-size:12px;">
        <div style="display:flex;justify-content:space-between;">
          <span style="color:var(--color-muted);">Rooms:</span>
          <span class="creator-badge creator-badge--secondary">${state.rooms.length}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:var(--color-muted);">NPCs:</span>
          <span class="creator-badge creator-badge--secondary">${state.npcs.length}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:var(--color-muted);">Items:</span>
          <span class="creator-badge creator-badge--secondary">${state.items.length}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:var(--color-muted);">Puzzles:</span>
          <span class="creator-badge creator-badge--secondary">${state.puzzles.length}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:var(--color-muted);">Dialogues:</span>
          <span class="creator-badge creator-badge--secondary">${Object.keys(state.dialogues).length}</span>
        </div>
      </div>
    `;
    body.appendChild(content);

    // --- Divider ---
    const divider = document.createElement('div');
    divider.className = 'creator-divider';
    body.appendChild(divider);

    // --- Export Buttons ---
    const exportSection = document.createElement('div');
    exportSection.className = 'creator-form-section';
    exportSection.innerHTML = `<div class="creator-form-section__title">Export Options</div>`;

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-top:8px;';

    // Download ZIP button
    const zipBtn = document.createElement('button');
    zipBtn.className = 'creator-btn creator-btn--primary';
    zipBtn.textContent = 'Download ZIP';
    zipBtn.addEventListener('click', () => this._downloadZip());
    btnContainer.appendChild(zipBtn);

    // Download YAML button
    const yamlBtn = document.createElement('button');
    yamlBtn.className = 'creator-btn creator-btn--secondary';
    yamlBtn.textContent = 'Download game.yaml';
    yamlBtn.addEventListener('click', () => this._downloadGameYaml());
    btnContainer.appendChild(yamlBtn);

    // Copy to Clipboard button
    const clipboardBtn = document.createElement('button');
    clipboardBtn.className = 'creator-btn creator-btn--secondary';
    clipboardBtn.textContent = 'Copy to Clipboard';
    clipboardBtn.addEventListener('click', () => this._copyToClipboard());
    btnContainer.appendChild(clipboardBtn);

    exportSection.appendChild(btnContainer);
    body.appendChild(exportSection);

    // --- Play Test Button (placeholder) ---
    const playSection = document.createElement('div');
    playSection.className = 'creator-form-section';
    playSection.innerHTML = `<div class="creator-form-section__title">Testing</div>`;

    const playBtn = document.createElement('button');
    playBtn.className = 'creator-btn';
    playBtn.textContent = 'Play Test';
    playBtn.addEventListener('click', () => this._playTest());
    playSection.appendChild(playBtn);
    body.appendChild(playSection);

    leftPanel.appendChild(body);
  }

  /**
   * Render the right panel: validation results and file preview.
   * @param {HTMLElement} rightPanel
   */
  _renderRightPanel(rightPanel) {
    rightPanel.innerHTML = '';

    const body = document.createElement('div');
    body.style.cssText = 'padding:14px;overflow-y:auto;height:100%;';

    // --- Validation Section ---
    const validationSection = document.createElement('div');
    validationSection.className = 'creator-form-section';
    validationSection.innerHTML = `<div class="creator-form-section__title">Validation</div>`;

    const issues = Validator.validate(this.app.state);
    const errors = issues.filter(i => i.level === 'error');
    const warnings = issues.filter(i => i.level === 'warning');

    if (issues.length === 0) {
      // No issues - show success message
      const successCard = document.createElement('div');
      successCard.className = 'creator-card';
      successCard.style.cssText = 'border-left:4px solid var(--color-success);padding:12px;margin-top:8px;';
      successCard.innerHTML = `
        <div style="color:var(--color-success);font-weight:600;font-size:12px;margin-bottom:4px;">All checks passed!</div>
        <div style="color:var(--color-muted);font-size:11px;">Your game is ready to export.</div>
      `;
      validationSection.appendChild(successCard);
    } else {
      // Show errors
      if (errors.length > 0) {
        const errorHeader = document.createElement('div');
        errorHeader.style.cssText = 'margin-top:8px;margin-bottom:6px;font-size:11px;color:var(--color-error);font-weight:600;';
        errorHeader.textContent = `Errors (${errors.length})`;
        validationSection.appendChild(errorHeader);

        for (const error of errors) {
          const card = document.createElement('div');
          card.className = 'creator-card';
          card.style.cssText = 'border-left:4px solid var(--color-error);padding:10px;margin-bottom:6px;';
          card.innerHTML = `<div style="font-size:11px;color:var(--color-text);">${this._esc(error.message)}</div>`;
          validationSection.appendChild(card);
        }
      }

      // Show warnings
      if (warnings.length > 0) {
        const warningHeader = document.createElement('div');
        warningHeader.style.cssText = 'margin-top:12px;margin-bottom:6px;font-size:11px;color:var(--color-warning);font-weight:600;';
        warningHeader.textContent = `Warnings (${warnings.length})`;
        validationSection.appendChild(warningHeader);

        for (const warning of warnings) {
          const card = document.createElement('div');
          card.className = 'creator-card';
          card.style.cssText = 'border-left:4px solid var(--color-warning);padding:10px;margin-bottom:6px;';
          card.innerHTML = `<div style="font-size:11px;color:var(--color-text);">${this._esc(warning.message)}</div>`;
          validationSection.appendChild(card);
        }
      }
    }

    body.appendChild(validationSection);

    // --- Divider ---
    const divider = document.createElement('div');
    divider.className = 'creator-divider';
    body.appendChild(divider);

    // --- File Preview Section ---
    const previewSection = document.createElement('div');
    previewSection.className = 'creator-form-section';
    previewSection.innerHTML = `<div class="creator-form-section__title">File Preview</div>`;

    const files = ExportBuilder.buildFiles(this.app.state);
    const fileList = document.createElement('div');
    fileList.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-top:8px;';

    for (const file of files) {
      const fileCard = document.createElement('div');
      fileCard.className = 'creator-card';
      fileCard.style.cssText = 'padding:8px 10px;cursor:default;';
      fileCard.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:11px;color:var(--color-text);font-family:var(--font-mono);">${this._esc(file.path)}</div>
          <div style="font-size:10px;color:var(--color-muted);">${ExportBuilder.formatSize(file.content)}</div>
        </div>
      `;
      fileList.appendChild(fileCard);
    }

    previewSection.appendChild(fileList);

    // Total size
    const totalSize = files.reduce((sum, f) => sum + new Blob([f.content]).size, 0);
    const totalCard = document.createElement('div');
    totalCard.style.cssText = 'margin-top:8px;padding:8px 10px;border-top:1px solid var(--color-border);display:flex;justify-content:space-between;align-items:center;';
    totalCard.innerHTML = `
      <div style="font-size:11px;color:var(--color-muted);font-weight:600;">Total</div>
      <div style="font-size:11px;color:var(--color-text);font-weight:600;">${ExportBuilder.formatSize(files.map(f => f.content).join(''))}</div>
    `;
    previewSection.appendChild(totalCard);

    body.appendChild(previewSection);
    rightPanel.appendChild(body);
  }

  // ========================================================================
  // Export actions
  // ========================================================================

  /**
   * Download all game files as a ZIP archive.
   */
  async _downloadZip() {
    this._showToast('Generating ZIP...', 'warning');

    try {
      const blob = await ExportBuilder.buildZip(this.app.state);
      const filename = ExportBuilder.generateFilename(this.app.state, 'zip');
      this._downloadBlob(blob, filename);
      this._showToast('ZIP downloaded successfully!', 'success');
    } catch (err) {
      console.error('[ExportPanel] ZIP export failed:', err);
      this._showToast('Export failed. See console for details.', 'error');
    }
  }

  /**
   * Download just the main game.yaml file.
   */
  _downloadGameYaml() {
    try {
      const files = ExportBuilder.buildFiles(this.app.state);
      const gameFile = files.find(f => f.path === 'game.yaml');
      if (!gameFile) {
        this._showToast('game.yaml not found.', 'error');
        return;
      }

      const blob = new Blob([gameFile.content], { type: 'text/yaml; charset=utf-8' });
      const filename = ExportBuilder.generateFilename(this.app.state, 'yaml');
      this._downloadBlob(blob, filename);
      this._showToast('game.yaml downloaded!', 'success');
    } catch (err) {
      console.error('[ExportPanel] YAML export failed:', err);
      this._showToast('Export failed. See console for details.', 'error');
    }
  }

  /**
   * Copy game.yaml content to clipboard.
   */
  async _copyToClipboard() {
    try {
      const files = ExportBuilder.buildFiles(this.app.state);
      const gameFile = files.find(f => f.path === 'game.yaml');
      if (!gameFile) {
        this._showToast('game.yaml not found.', 'error');
        return;
      }

      await navigator.clipboard.writeText(gameFile.content);
      this._showToast('Copied to clipboard!', 'success');
    } catch (err) {
      console.error('[ExportPanel] Clipboard copy failed:', err);
      this._showToast('Failed to copy. See console for details.', 'error');
    }
  }

  /**
   * Play test the game.
   */
  _playTest() {
    PlayTestLauncher.launch(this.app.state);
  }

  // ========================================================================
  // Utilities
  // ========================================================================

  /**
   * Trigger a browser download for a Blob.
   * @param {Blob} blob
   * @param {string} filename
   */
  _downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Show a toast notification.
   * @param {string} message
   * @param {'success'|'warning'|'error'} type
   */
  _showToast(message, type = 'success') {
    // Find or create toast container
    let container = document.querySelector('.creator-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'creator-toast-container';
      document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `creator-toast creator-toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Escape HTML entities for safe display.
   * @param {string} str
   * @returns {string}
   */
  _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
