import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CardConfig } from './types.js';

// Placeholder — the full editor is implemented in the next task.
@customElement('whisparr-hacs-card-editor')
export class WhisparrHacsCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: unknown;
  @property({ attribute: false }) private _config?: CardConfig;

  setConfig(config: CardConfig) {
    this._config = config;
  }

  render() {
    return html`<div style="padding:16px;color:var(--secondary-text-color)">Editor coming soon</div>`;
  }
}
