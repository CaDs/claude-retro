import yaml from 'js-yaml';

export class YamlPreview {
  constructor(app) {
    this.app = app;
  }

  render(container) {
    container.innerHTML = '';

    // Generate YAML from state
    const state = this.app.state;
    let yamlObj;

    // Show room YAML if a room is selected in room editor
    if (this.app.activeTab === 'rooms' && this.app._panels.rooms && this.app._panels.rooms.selectedRoomId) {
      const room = state.getRoom(this.app._panels.rooms.selectedRoomId);
      if (room) {
        yamlObj = { room: this._cleanRoom(room) };
      }
    }

    if (!yamlObj && !state.game.setting) {
      // Show welcome text when no setting is chosen yet
      const welcomeLines = [
        '# Welcome to the Game Creator!',
        '#',
        '# This panel shows a live YAML preview of your game',
        '# data as you build it. The YAML DSL format is what',
        '# the engine reads at runtime.',
        '#',
        '# Get started by choosing a setting on the left.',
        '# As you add rooms, NPCs, items, and puzzles, the',
        '# corresponding YAML will appear here.',
        '#',
        '# You can export the final YAML bundle from the',
        '# Export tab when your game is ready.',
      ];
      for (const line of welcomeLines) {
        const span = document.createElement('span');
        span.className = 'yaml-line';
        span.textContent = line;
        container.appendChild(span);
      }
      return;
    }

    if (!yamlObj) {
      // Show game manifest
      yamlObj = { game: this._cleanGame(state) };
    }

    let yamlStr;
    try {
      yamlStr = yaml.dump(yamlObj, { lineWidth: 120, noRefs: true });
    } catch (e) {
      yamlStr = '# Error generating YAML\n' + e.message;
    }

    // Render with line numbers using yaml-line spans
    const lines = yamlStr.split('\n');
    for (const line of lines) {
      const span = document.createElement('span');
      span.className = 'yaml-line';
      span.textContent = line;
      container.appendChild(span);
    }
  }

  _cleanGame(state) {
    return {
      title: state.game.title,
      setting: state.game.setting,
      version: state.game.version,
      resolution: state.game.resolution,
      viewportHeight: state.game.viewportHeight,
      startRoom: state.game.startRoom,
      startPosition: state.game.startPosition,
      verbs: state.game.verbs,
      defaultResponses: state.game.defaultResponses,
      rooms: state.rooms.map(r => `rooms/${r.id}.yaml`),
    };
  }

  _cleanRoom(room) {
    const obj = {
      id: room.id,
      name: room.name,
      description: room.description,
    };
    if (room.background && room.background.template) {
      obj.background = { template: room.background.template };
      if (room.background.params && Object.keys(room.background.params).length) {
        obj.background.params = room.background.params;
      }
      if (room.background.palette) obj.background.palette = room.background.palette;
      if (room.background.paletteOverrides && Object.keys(room.background.paletteOverrides).length) {
        obj.background.paletteOverrides = room.background.paletteOverrides;
      }
    }
    if (room.lighting) obj.lighting = room.lighting;
    if (room.walkableArea) obj.walkableArea = room.walkableArea;
    if (room.hotspots && room.hotspots.length) obj.hotspots = room.hotspots;
    if (room.exits && room.exits.length) obj.exits = room.exits;
    if (room.visuals && room.visuals.length) obj.visuals = room.visuals;
    return obj;
  }
}
