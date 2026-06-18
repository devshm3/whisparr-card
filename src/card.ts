import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant } from './ha-types.js';
import type { CardConfig } from './types.js';

@customElement('whisparr-hacs-card')
export class WhisparrHacsCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: CardConfig;

  setConfig(config: CardConfig) {
    if (!config.entry_id) throw new Error('entry_id is required');
    this._config = config;
  }

  render() {
    return html`<ha-card><div style="padding:16px">Whisparr card (scaffold)</div></ha-card>`;
  }
}
