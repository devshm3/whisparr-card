import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Scene } from '../types.js';

function sceneStatus(scene: Scene): 'available' | 'missing' | 'downloading' | 'unmonitored' {
  if (scene.inQueue && !scene.hasFile) return 'downloading';
  if (scene.hasFile) return 'available';
  if (scene.monitored) return 'missing';
  return 'unmonitored';
}

function _release(scene: Scene): string {
  return scene.digitalRelease ?? scene.releaseDate ?? scene.added ?? '';
}

@customElement('whisparr-scene-poster')
export class WhisparrScenePoster extends LitElement {
  @property({ attribute: false }) scene!: Scene;
  @property({ type: Boolean }) selected = false;
  @property({ type: Boolean }) showBadge = true;
  @property({ type: Number }) radius = 8;

  static styles = css`
    :host { display: block; cursor: pointer; }
    .wrap {
      aspect-ratio: 16 / 9;
      border: 2px solid transparent;
      border-radius: var(--r, 8px);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      position: relative;
      transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
    }
    .wrap:hover {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
      transform: scale(1.025);
    }
    .wrap.selected {
      border-color: var(--rc-accent, var(--primary-color));
      box-shadow: 0 0 0 2px var(--rc-accent, var(--primary-color)), 0 6px 20px rgba(0, 0, 0, 0.35);
    }
    img {
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.04));
      display: block;
      height: 100%;
      object-fit: cover;
      width: 100%;
    }
    .placeholder {
      align-items: center;
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.04));
      color: var(--rc-text-secondary, var(--secondary-text-color));
      display: flex;
      flex-direction: column;
      font-size: 0.72rem;
      gap: 4px;
      height: 100%;
      justify-content: center;
      padding: 8px;
      text-align: center;
    }
    .badge {
      border-radius: 10px;
      top: 6px;
      right: 6px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 2px 7px;
      position: absolute;
      text-transform: uppercase;
    }
    .badge.available    { background: #43a047; color: #fff; }
    .badge.missing      { background: #f57c00; color: #fff; }
    .badge.downloading  { background: #1e88e5; color: #fff; }
    .badge.unmonitored  { background: #757575; color: #fff; }
    .footer {
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
      bottom: 0;
      left: 0;
      padding: 18px 8px 6px;
      position: absolute;
      right: 0;
    }
    .footer-title {
      color: #fff;
      font-size: 0.75rem;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .footer-sub {
      align-items: center;
      color: var(--rc-text-secondary, rgba(255,255,255,0.65));
      display: flex;
      font-size: 0.62rem;
      justify-content: space-between;
      margin-top: 2px;
    }
    .progress-bar {
      background: rgba(0,0,0,0.4);
      bottom: 0;
      height: 4px;
      left: 0;
      position: absolute;
      right: 0;
    }
    .progress-fill {
      background: var(--primary-color);
      height: 100%;
      transition: width 1s linear;
    }
  `;

  private get _poster(): string {
    return (
      this.scene?.images?.find(
        i => i.coverType === 'screenshot' || i.coverType === 'fanart' || i.coverType === 'poster',
      )?.remoteUrl ??
      this.scene?.images?.[0]?.remoteUrl ??
      ''
    );
  }

  private get _downloadPct(): number {
    const q = this.scene?.queueItem;
    if (!q || q.size === 0) return 0;
    return Math.round((1 - q.sizeleft / q.size) * 100);
  }

  render() {
    const status = sceneStatus(this.scene);
    const dateStr = _release(this.scene).slice(0, 10);
    const badgeLabel = status === 'downloading' ? `${this._downloadPct}%` : status;

    return html`
      <div
        class="wrap ${this.selected ? 'selected' : ''}"
        style="--r:${this.radius}px"
        @click=${() => this.dispatchEvent(new CustomEvent('poster-click', {
          detail: this.scene, bubbles: true, composed: true,
        }))}
      >
        ${this._poster
          ? html`<img src=${this._poster} alt=${this.scene.title} loading="lazy"
              @error=${(e: Event) => ((e.target as HTMLImageElement).style.display = 'none')} />`
          : html`<div class="placeholder">
              <span>${this.scene.title}</span>
              ${this.scene.year ? html`<span>(${this.scene.year})</span>` : nothing}
            </div>`}

        ${this.showBadge && this.scene.inLibrary !== false ? html`
          <span class="badge ${status}">${badgeLabel}</span>
        ` : nothing}

        <div class="footer">
          <div class="footer-title">${this.scene.title}</div>
          <div class="footer-sub">
            <span>${this.scene.studioTitle ?? ''}</span>
            <span>${dateStr}</span>
          </div>
        </div>

        ${this.scene.queueItem ? html`
          <div class="progress-bar">
            <div class="progress-fill" style="width:${this._downloadPct}%"></div>
          </div>
        ` : nothing}
      </div>
    `;
  }
}
