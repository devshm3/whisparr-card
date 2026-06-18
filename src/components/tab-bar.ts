import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { View } from '../types.js';

@customElement('whisparr-tab-bar')
export class WhisparrTabBar extends LitElement {
  @property() active: View = 'scenes';
  @property({ type: Boolean }) showStudios = true;
  @property({ type: Boolean }) showPerformers = true;

  static styles = css`
    :host { display: flex; gap: 4px; padding: 10px 16px 0; }
    .seg {
      display: flex; gap: 4px;
      background: var(--rc-surface-container, rgba(255,255,255,.05));
      border-radius: var(--rc-control-radius, 8px);
      padding: 3px;
    }
    button {
      background: transparent; border: none;
      border-radius: var(--rc-control-radius, 8px);
      color: var(--rc-text-secondary, var(--secondary-text-color));
      cursor: pointer; font-size: 0.85rem; padding: 6px 14px;
      transition: background 0.15s, color 0.15s;
    }
    button.active {
      background: var(--rc-accent-container, var(--primary-color));
      color: var(--rc-on-accent, var(--text-primary-color, #fff));
      font-weight: 600;
    }
  `;

  private _select(v: View) {
    this.dispatchEvent(new CustomEvent('view-change', { detail: v, bubbles: true, composed: true }));
  }

  render() {
    const tab = (v: View, label: string) => html`
      <button class=${v === this.active ? 'active' : ''} @click=${() => this._select(v)}>${label}</button>`;
    return html`<div class="seg">
      ${tab('scenes', 'Scenes')}
      ${this.showStudios ? tab('studios', 'Studios') : ''}
      ${this.showPerformers ? tab('performers', 'Performers') : ''}
    </div>`;
  }
}
