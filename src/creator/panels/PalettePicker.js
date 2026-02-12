export class PalettePicker {
  constructor(app) {
    this.app = app;
  }

  render(container, palette, overrides, onChange) {
    container.innerHTML = '';
    if (!palette) return;

    const grid = document.createElement('div');
    grid.className = 'creator-palette';

    for (const [name, color] of Object.entries(palette)) {
      const swatch = document.createElement('div');
      swatch.className = 'creator-swatch';
      const displayColor = (overrides && overrides[name]) || color;
      swatch.style.backgroundColor = displayColor;
      swatch.title = `${name}: ${displayColor}`;

      // Color picker on click
      swatch.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = displayColor;
        input.addEventListener('input', () => {
          const newOverrides = { ...(overrides || {}), [name]: input.value };
          onChange(newOverrides);
        });
        input.click();
      });

      grid.appendChild(swatch);
    }

    container.appendChild(grid);
  }
}
