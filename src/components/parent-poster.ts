import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Parent, ParentKind } from '../types.js';

@customElement('whisparr-parent-poster')
export class WhisparrParentPoster extends LitElement {
  @property({ attribute: false }) parent!: Parent;
  @property() kind: ParentKind = 'studio';
  @property({ type: Boolean }) selected = false;
  @property({ type: Number }) radius = 8;

  static styles = css`
    :host { display: block; cursor: pointer; }

    .wrap {
      border: 2px solid transparent;
      border-radius: var(--r, 8px);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      position: relative;
      transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
    }
    .wrap:hover { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35); transform: scale(1.025); }
    .wrap.selected {
      border-color: var(--rc-accent, var(--primary-color));
      box-shadow: 0 0 0 2px var(--rc-accent, var(--primary-color)), 0 6px 20px rgba(0, 0, 0, 0.35);
    }

    /* performer = portrait 2/3 */
    .wrap.performer { aspect-ratio: 2 / 3; }
    /* studio = landscape 16/7 */
    .wrap.studio { aspect-ratio: 16 / 7; }

    img {
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.04));
      display: block; height: 100%; object-fit: cover; width: 100%;
    }
    /* studio art is a logo — show the whole thing, never crop it */
    .wrap.studio img { object-fit: contain; padding: 8px; box-sizing: border-box; }

    .placeholder {
      align-items: center;
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.05));
      color: var(--rc-text-secondary, var(--secondary-text-color));
      display: flex;
      font-size: 0.85rem;
      height: 100%;
      justify-content: center;
      padding: 8px;
      text-align: center;
      width: 100%;
    }

    .monitored-dot {
      border-radius: 50%;
      height: 8px;
      left: 6px;
      position: absolute;
      top: 6px;
      width: 8px;
    }
    .monitored-dot.on  { background: var(--rc-accent, var(--primary-color)); }
    .monitored-dot.off { background: var(--rc-text-secondary, rgba(255,255,255,0.3)); }

    .footer {
      background: linear-gradient(transparent, rgba(0,0,0,0.65));
      bottom: 0; left: 0; right: 0;
      padding: 18px 8px 6px;
      position: absolute;
    }
    .footer-name {
      color: #fff;
      font-size: 0.82rem;
      font-weight: 700;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .footer-sub {
      align-items: center;
      display: flex;
      font-size: 0.72rem;
      justify-content: space-between;
      margin-top: 2px;
    }
    .footer-scenes { color: rgba(255,255,255,0.7); }
    .footer-missing { color: rgba(255,255,255,0.7); }
    .footer-missing.warn { color: var(--rc-accent, #f57c00); }
  `;

  private get _artUrl(): string {
    const imgs = this.parent?.images ?? [];
    if (this.kind === 'performer') {
      const img = imgs.find(i => i.coverType === 'headshot')
        ?? imgs.find(i => i.coverType === 'poster')
        ?? imgs[0];
      return img?.remoteUrl ?? '';
    } else {
      // studio
      const img = imgs.find(i => i.coverType === 'logo')
        ?? imgs.find(i => i.coverType === 'fanart')
        ?? imgs[0];
      return img?.remoteUrl ?? '';
    }
  }

  render() {
    const p = this.parent;
    const artUrl = this._artUrl;
    const sceneCount = p.sceneCount ?? 0;
    const missingCount = p.missingCount ?? 0;
    const monitored = p.monitored;
    const name = p.displayName ?? p.title ?? p.fullName ?? '';

    return html`
      <div
        class="wrap ${this.kind} ${this.selected ? 'selected' : ''}"
        style="--r:${this.radius}px"
        @click=${() => this.dispatchEvent(new CustomEvent('poster-click', {
          detail: p, bubbles: true, composed: true,
        }))}
      >
        ${artUrl
          ? html`<img src=${artUrl} alt=${name} loading="lazy" @error=${(e: Event) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />`
          : html`<div class="placeholder">${name}</div>`}

        <span class="monitored-dot ${monitored ? 'on' : 'off'}"></span>

        <div class="footer">
          <div class="footer-name">${name}</div>
          <div class="footer-sub">
            <span class="footer-scenes">${sceneCount} scenes</span>
            <span class="footer-missing ${missingCount > 0 ? 'warn' : ''}">${missingCount} missing</span>
          </div>
        </div>
      </div>
    `;
  }
}
