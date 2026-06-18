import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const FILTERS: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'missing', label: 'Missing' },
  { key: 'downloading', label: 'Downloading' },
  { key: 'unmonitored', label: 'Unmonitored' },
];

@customElement('whisparr-filter-chips')
export class WhisparrFilterChips extends LitElement {
  @property() activeFilter = 'all';
  @property({ attribute: false }) counts?: Record<string, number>;

  static styles = css`
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 10px 16px;
    }
    button {
      background: var(--rc-chip-bg, rgba(255, 255, 255, 0.05));
      border: 1px solid var(--rc-outline, rgba(255, 255, 255, 0.09));
      border-radius: var(--rc-chip-radius, 20px);
      color: var(--rc-text-secondary, var(--secondary-text-color));
      cursor: pointer;
      font-size: 0.82rem;
      letter-spacing: 0.02em;
      padding: 4px 14px;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    button.active::before { content: var(--rc-chip-check, ""); }
    button:hover {
      background: color-mix(in srgb, var(--rc-text, #fff) 8%, transparent);
      color: var(--rc-text, var(--primary-text-color));
    }
    button.active {
      background: var(--rc-accent-container, var(--primary-color));
      border-color: var(--rc-accent-container, var(--primary-color));
      color: var(--rc-on-accent, var(--text-primary-color, #fff));
      font-weight: 600;
    }
    .count {
      background: color-mix(in srgb, var(--rc-text, #fff) 15%, transparent);
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 1px 6px;
    }
    button.active .count {
      background: color-mix(in srgb, var(--rc-on-accent, #000) 22%, transparent);
    }
  `;

  render() {
    return html`${FILTERS.map(f => html`
      <button
        class=${f.key === this.activeFilter ? 'active' : ''}
        @click=${() => this._select(f.key)}
      >${f.label}${this.counts ? html`<span class="count">${this.counts[f.key] ?? 0}</span>` : ''}</button>
    `)}`;
  }

  private _select(key: string) {
    this.dispatchEvent(new CustomEvent('filter-change', {
      detail: key, bubbles: true, composed: true,
    }));
  }
}
