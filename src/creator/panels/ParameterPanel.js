import { TemplateRegistry } from '../../engine/TemplateRegistry.js';

export class ParameterPanel {
  constructor(app) {
    this.app = app;
  }

  render(container, templateId, currentParams, onChange) {
    container.innerHTML = '';
    const meta = TemplateRegistry.getMetadata(templateId);
    if (!meta || !meta.params) return;

    for (const [key, def] of Object.entries(meta.params)) {
      const val = currentParams[key] !== undefined ? currentParams[key] : def.default;

      if (def.type === 'boolean') {
        const field = document.createElement('div');
        field.className = 'creator-field';

        const checkbox = document.createElement('label');
        checkbox.className = 'creator-checkbox';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!val;
        cb.addEventListener('change', () => {
          onChange({ ...currentParams, [key]: cb.checked });
        });

        const span = document.createElement('span');
        span.textContent = def.label || key;

        checkbox.appendChild(cb);
        checkbox.appendChild(span);
        field.appendChild(checkbox);
        container.appendChild(field);

      } else if (def.type === 'enum') {
        const field = document.createElement('div');
        field.className = 'creator-field';

        const label = document.createElement('label');
        label.className = 'creator-field__label';
        label.textContent = def.label || key;
        field.appendChild(label);

        const sel = document.createElement('select');
        sel.className = 'creator-select';
        for (const opt of def.options) {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          option.selected = opt === String(val);
          sel.appendChild(option);
        }
        sel.addEventListener('change', () => {
          onChange({ ...currentParams, [key]: sel.value });
        });
        field.appendChild(sel);
        container.appendChild(field);

      } else {
        const field = document.createElement('div');
        field.className = 'creator-field';

        const label = document.createElement('label');
        label.className = 'creator-field__label';
        label.textContent = def.label || key;
        field.appendChild(label);

        const inp = document.createElement('input');
        inp.type = 'text';
        inp.className = 'creator-input';
        inp.value = val || '';
        inp.addEventListener('change', () => {
          onChange({ ...currentParams, [key]: inp.value });
        });
        field.appendChild(inp);
        container.appendChild(field);
      }
    }
  }
}
