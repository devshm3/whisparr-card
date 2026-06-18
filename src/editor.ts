import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant } from './ha-types.js';
import type { CardConfig } from './types.js';

interface ConfigEntry {
  entry_id: string;
  title: string;
  domain: string;
}

const DOMAIN = 'whisparr_hacs';

@customElement('whisparr-hacs-card-editor')
export class WhisparrHacsCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _entries: ConfigEntry[] = [];

  private _config?: CardConfig;
  private _entriesLoaded = false;

  setConfig(config: CardConfig) {
    this._config = { ...config };
    this.requestUpdate();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('hass') && this.hass && !this._entriesLoaded) {
      this._entriesLoaded = true;
      this._loadEntries();
    }
  }

  // The entry is auto-detected, so the card editor hides it for a single
  // instance and only shows a picker when multiple instances exist.
  private async _loadEntries() {
    try {
      const entries = await this.hass!.connection.sendMessagePromise<ConfigEntry[]>({
        type: 'config_entries/get',
        domain: DOMAIN,
      });
      this._entries = entries.filter(e => e.domain === DOMAIN);
      if (this._entries.length === 1 && !this._config?.entry_id) {
        this._fire({ entry_id: this._entries[0].entry_id });
      }
    } catch {
      this._entries = [];
    }
  }

  static styles = css`
    .form { display: flex; flex-direction: column; gap: 12px; padding: 16px; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field-row { display: flex; align-items: center; gap: 8px; }
    label { color: var(--secondary-text-color); font-size: 0.85rem; }
    input:not([type=checkbox]), select {
      background: var(--card-background-color, #1c1c1e);
      border: 1px solid var(--divider-color, rgba(255,255,255,0.12));
      border-radius: 6px; color: var(--primary-text-color);
      padding: 6px 10px; width: 100%; box-sizing: border-box;
    }
  `;

  render() {
    if (!this._config) return html``;
    const c = this._config;
    return html`
      <div class="form">
        ${this._entries.length > 1 ? html`
          <div class="field">
            <label>Instance</label>
            <select @change=${(e: Event) => this._fire({ entry_id: (e.target as HTMLSelectElement).value })}>
              <option value="" ?selected=${!c.entry_id}>Select…</option>
              ${this._entries.map(entry => html`
                <option value=${entry.entry_id} ?selected=${c.entry_id === entry.entry_id}>
                  ${entry.title}
                </option>
              `)}
            </select>
          </div>
        ` : ''}
        <div class="field">
          <label>Card Title (default: "Scenes")</label>
          <input .value=${c.card_title ?? ''} @change=${this._str('card_title')} />
        </div>
        <div class="field">
          <label>Appearance</label>
          <select @change=${this._str('appearance')}>
            ${(['glass', 'material'] as const).map(a => html`
              <option value=${a} ?selected=${(c.appearance ?? 'glass') === a}>
                ${a === 'glass' ? 'Glass (default)' : 'Material You'}
              </option>
            `)}
          </select>
        </div>
        <div class="field">
          <label>Default View</label>
          <select @change=${this._str('default_view')}>
            ${(['scenes', 'studios', 'performers'] as const).map(v => html`
              <option value=${v} ?selected=${(c.default_view ?? 'scenes') === v}>${v}</option>`)}
          </select>
        </div>
        <div class="field">
          <label>Default Sort</label>
          <select @change=${this._str('default_sort')}>
            ${(['added', 'released', 'title'] as const).map(s => html`
              <option value=${s} ?selected=${(c.default_sort ?? 'added') === s}>${s}</option>`)}
          </select>
        </div>
        <div class="field">
          <label>Columns (2–3, default: 2)</label>
          <input type="number" min="2" max="3" .value=${String(c.columns ?? 2)}
            @change=${(e: Event) => this._fire({ columns: Number((e.target as HTMLInputElement).value) })} />
        </div>
        <div class="field">
          <label>Page Size (default: 25)</label>
          <input type="number" min="10" max="200" .value=${String(c.page_size ?? 25)}
            @change=${(e: Event) => this._fire({ page_size: Number((e.target as HTMLInputElement).value) })} />
        </div>
        <div class="field">
          <label>Poster Border Radius px (default: 8)</label>
          <input type="number" min="0" max="24" .value=${String(c.poster_radius ?? 8)}
            @change=${(e: Event) => this._fire({ poster_radius: Number((e.target as HTMLInputElement).value) })} />
        </div>
        ${this._checkbox('Show Studios Tab', 'show_studios_tab')}
        ${this._checkbox('Show Performers Tab', 'show_performers_tab')}
        ${this._checkbox('Show Status Badges', 'show_status_badges')}
        ${this._checkbox('Show Filter Counts', 'show_filter_counts')}
        ${this._checkbox('Show Quality Profile', 'show_quality')}
        ${this._checkbox('Show File Info', 'show_file_info')}
        ${this._checkbox('Show Refresh Button', 'show_refresh_button')}
      </div>
    `;
  }

  private _checkbox(label: string, key: keyof CardConfig) {
    return html`
      <div class="field-row">
        <input type="checkbox" ?checked=${(this._config as any)[key] !== false}
          @change=${(e: Event) => this._fire({ [key]: (e.target as HTMLInputElement).checked } as Partial<CardConfig>)} />
        <label>${label}</label>
      </div>
    `;
  }

  private _str(key: keyof CardConfig) {
    return (e: Event) => this._fire({ [key]: (e.target as HTMLInputElement).value } as Partial<CardConfig>);
  }

  private _fire(partial: Partial<CardConfig>) {
    this._config = { ...this._config!, ...partial };
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config }, bubbles: true, composed: true,
    }));
    this.requestUpdate();
  }
}
