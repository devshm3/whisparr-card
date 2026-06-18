import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Scene } from '../types.js';
import './scene-poster.js';

@customElement('whisparr-scene-grid')
export class WhisparrSceneGrid extends LitElement {
  @property({ attribute: false }) scenes: Scene[] = [];
  @property({ type: Number }) columns = 2;
  @property({ type: Number }) selectedSceneId?: number;
  @property({ type: Boolean }) showBadges = true;
  @property({ type: Number }) posterRadius = 8;

  static styles = css`
    :host { display: block; padding: 8px; }
    .grid { display: grid; gap: 8px; }
    .empty {
      color: var(--secondary-text-color);
      padding: 32px;
      text-align: center;
    }
  `;

  render() {
    if (!this.scenes.length) {
      return html`<div class="empty">No scenes found</div>`;
    }
    const cols = Math.min(3, Math.max(2, this.columns || 2));
    return html`
      <div class="grid" style="grid-template-columns:repeat(${cols},1fr)">
        ${this.scenes.map(s => html`
          <whisparr-scene-poster
            .scene=${s}
            ?selected=${s.id === this.selectedSceneId}
            ?showBadge=${this.showBadges}
            .radius=${this.posterRadius}
          ></whisparr-scene-poster>
        `)}
      </div>
    `;
  }
}
