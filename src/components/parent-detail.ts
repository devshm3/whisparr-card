import { LitElement, html, css, PropertyValues, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Parent, ParentKind, Scene, QualityProfile, RootFolder } from '../types.js';

@customElement('whisparr-parent-detail')
export class WhisparrParentDetail extends LitElement {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ attribute: false }) parent?: Parent;
  @property() kind: ParentKind = 'studio';
  @property({ attribute: false }) scenes: Scene[] = [];
  @property({ type: Boolean }) loading = false;
  @property({ attribute: false }) qualityProfiles: QualityProfile[] = [];
  @property({ attribute: false }) rootFolders: RootFolder[] = [];
  @property({ type: Boolean }) showQuality = true;
  @property({ type: Boolean }) showFileInfo = true;

  @state() private _profileId?: number;
  @state() private _folder?: string;
  @state() private _monitored = true;
  @state() private _searchOnAdd = true;
  @state() private _adding = false;
  @state() private _addError?: string;
  @state() private _confirmDelete = false;
  // Optimistic monitored state so toggles flip instantly before the round-trip.
  @state() private _optimisticParent?: boolean;
  @state() private _optimisticScenes: Record<number, boolean> = {};

  static styles = css`
    :host {
      display: block;
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, opacity 0.2s ease;
    }
    :host([open]) { max-height: 4000px; opacity: 1; }

    .panel {
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--rc-outline, rgba(255, 255, 255, 0.08));
      border-radius: var(--rc-radius, 12px);
      display: grid;
      gap: 16px;
      grid-template-columns: auto 1fr;
      margin: 0 8px 8px;
      padding: 16px;
    }

    .hero-art img {
      border-radius: 8px;
      display: block;
    }
    .hero-art.performer img { width: 100px; }
    .hero-art.studio img   { width: 160px; }

    .hero-art-placeholder {
      align-items: center;
      background: var(--rc-surface-container, rgba(255,255,255,0.05));
      border-radius: 8px;
      color: var(--rc-text-secondary, var(--secondary-text-color));
      display: flex;
      font-size: 0.78rem;
      justify-content: center;
      padding: 12px;
      text-align: center;
    }
    .hero-art-placeholder.performer { aspect-ratio: 2/3; width: 100px; }
    .hero-art-placeholder.studio    { aspect-ratio: 16/7; width: 160px; }

    h2 { font-size: 1.15rem; margin: 0 0 4px; color: var(--rc-text, var(--primary-text-color)); }
    .stat-line { color: var(--rc-text-secondary, var(--secondary-text-color)); font-size: 0.82rem; line-height: 1.6; margin-bottom: 4px; }

    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    button.action {
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.07));
      border: 1px solid var(--rc-outline, rgba(255, 255, 255, 0.12));
      border-radius: var(--rc-control-radius, 8px);
      color: var(--rc-text, var(--primary-text-color));
      cursor: pointer;
      font-size: 0.84rem;
      padding: 6px 14px;
      transition: background 0.15s;
    }
    button.action:hover { background: color-mix(in srgb, var(--rc-text, #fff) 12%, transparent); }
    button.action.primary {
      background: var(--rc-accent-container, var(--primary-color));
      border-color: var(--rc-accent-container, var(--primary-color));
      color: var(--rc-on-accent, var(--text-primary-color, #fff));
    }
    button.action.primary:disabled { opacity: 0.5; cursor: default; }
    button.action.danger { border-color: #f44336; color: #f44336; }
    button.action.danger:hover { background: rgba(244,67,54,0.12); }

    /* Scene rows */
    .scenes { grid-column: 1 / -1; margin-top: 4px; }
    .loading-line {
      color: var(--rc-text-secondary, var(--secondary-text-color));
      font-size: 0.85rem;
      padding: 8px 2px;
    }
    .scene-row {
      align-items: center;
      border-bottom: 1px solid var(--rc-outline, rgba(255,255,255,0.06));
      display: flex;
      gap: 10px;
      padding: 8px 2px;
    }
    .scene-thumb {
      aspect-ratio: 16 / 9;
      background: var(--rc-surface-container, rgba(255,255,255,0.04));
      border-radius: 4px;
      flex-shrink: 0;
      overflow: hidden;
      width: 80px;
    }
    .scene-thumb img { display: block; height: 100%; object-fit: cover; width: 100%; }
    .scene-thumb-placeholder {
      align-items: center;
      display: flex;
      height: 100%;
      justify-content: center;
      width: 100%;
    }
    .scene-info { flex: 1; min-width: 0; }
    .scene-title {
      color: var(--rc-text, var(--primary-text-color));
      font-size: 0.85rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .scene-sub { color: var(--rc-text-secondary, var(--secondary-text-color)); font-size: 0.75rem; margin-top: 2px; }
    .pill {
      border-radius: 10px;
      flex-shrink: 0;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 2px 7px;
      text-transform: uppercase;
    }
    .pill.file    { background: #43a047; color: #fff; }
    .pill.missing { background: #757575; color: #fff; }
    .pill.pct     { background: #f57c00; color: #fff; }

    .toggle {
      background: color-mix(in srgb, var(--rc-text, #fff) 18%, transparent);
      border: none; border-radius: 11px;
      cursor: pointer; flex-shrink: 0;
      height: 18px; position: relative; width: 32px;
      transition: background 0.15s;
    }
    .toggle.on { background: var(--rc-accent, var(--primary-color)); }
    .toggle::after {
      background: #fff; border-radius: 50%; content: '';
      height: 14px; width: 14px; position: absolute; top: 2px; left: 2px;
      transition: left 0.15s;
    }
    .toggle.on::after { left: 16px; }

    .icon-btn {
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.07));
      border: 1px solid var(--rc-outline, rgba(255, 255, 255, 0.12));
      border-radius: var(--rc-control-radius, 6px);
      color: var(--rc-text, var(--primary-text-color));
      cursor: pointer; flex-shrink: 0; font-size: 0.8rem; padding: 4px 8px;
    }
    .icon-btn:hover { background: color-mix(in srgb, var(--rc-text, #fff) 13%, transparent); }

    /* Add form */
    .add-form { grid-column: 1 / -1; }
    .form-row { align-items: center; display: flex; gap: 10px; margin-bottom: 10px; }
    .form-row label { font-size: 0.84rem; min-width: 120px; color: var(--rc-text-secondary, var(--secondary-text-color)); }
    select {
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.06));
      border: 1px solid var(--rc-outline, rgba(255, 255, 255, 0.1));
      border-radius: var(--rc-control-radius, 6px);
      color: var(--rc-text, var(--primary-text-color));
      flex: 1; padding: 6px 10px;
    }
    .add-error { color: var(--error-color, #f44336); font-size: 0.8rem; margin-bottom: 8px; }
  `;

  private get _artUrl(): string {
    const imgs = this.parent?.images ?? [];
    if (this.kind === 'performer') {
      const img = imgs.find(i => i.coverType === 'headshot')
        ?? imgs.find(i => i.coverType === 'poster')
        ?? imgs[0];
      return img?.remoteUrl ?? '';
    } else {
      const img = imgs.find(i => i.coverType === 'logo')
        ?? imgs.find(i => i.coverType === 'fanart')
        ?? imgs[0];
      return img?.remoteUrl ?? '';
    }
  }

  protected willUpdate(changed: PropertyValues): void {
    if (!changed.has('parent')) return;
    const prev = changed.get('parent') as Parent | undefined;
    const sameParent = prev != null && this.parent != null && prev.id === this.parent.id;
    if (sameParent) {
      // Reconcile optimistic scene toggles after a refresh.
      if (this._optimisticParent !== undefined && this.parent?.monitored === this._optimisticParent) {
        this._optimisticParent = undefined;
      }
      return;
    }
    // Different parent: reset all transient state.
    this._optimisticParent = undefined;
    this._optimisticScenes = {};
    this._confirmDelete = false;
    this._addError = undefined;
    this._adding = false;
    this._profileId = undefined;
    this._folder = undefined;
    this._monitored = true;
    this._searchOnAdd = true;
  }

  private _sceneThumb(scene: Scene): string {
    return scene.images?.[0]?.remoteUrl ?? '';
  }

  private _sceneSubLine(scene: Scene): string {
    const releaseDate = scene.releaseDate ?? scene.digitalRelease;
    const dateStr = releaseDate ? releaseDate.slice(0, 10) : '';

    if (scene.inQueue && scene.queueItem) {
      const q = scene.queueItem;
      const pct = q.size > 0 ? Math.round((1 - q.sizeleft / q.size) * 100) : 0;
      return `downloading ${pct}%`;
    }

    if (!scene.hasFile) {
      return [dateStr, 'not downloaded'].filter(Boolean).join(' · ');
    }

    const parts: string[] = [];
    if (dateStr) parts.push(dateStr);
    if (this.showQuality) {
      const qName = scene.movieFile?.quality?.quality?.name;
      if (qName) parts.push(qName);
    }
    if (this.showFileInfo && scene.movieFile?.size !== undefined) {
      const sz = scene.movieFile.size;
      parts.push(sz > 1e9 ? `${(sz / 1e9).toFixed(1)} GB` : `${Math.round(sz / 1e6)} MB`);
    }
    return parts.filter(Boolean).join(' · ');
  }

  private _scenePill(scene: Scene): { cls: string; label: string } {
    if (scene.inQueue && scene.queueItem) {
      const q = scene.queueItem;
      const pct = q.size > 0 ? Math.round((1 - q.sizeleft / q.size) * 100) : 0;
      return { cls: 'pct', label: `${pct}%` };
    }
    if (scene.hasFile) return { cls: 'file', label: 'FILE' };
    return { cls: 'missing', label: 'MISSING' };
  }

  render() {
    if (!this.parent) return html``;
    const p = this.parent;
    const name = p.displayName ?? p.title ?? p.fullName ?? '';
    const artUrl = this._artUrl;
    const inLibrary = p.inLibrary !== false;

    return html`
      <div class="panel">
        <div class="hero-art ${this.kind}">
          ${artUrl
            ? html`<img src=${artUrl} alt=${name} />`
            : html`<div class="hero-art-placeholder ${this.kind}">${name}</div>`}
        </div>
        <div>
          <h2>${name}</h2>
          ${inLibrary ? this._renderStatLine(p) : nothing}
          ${inLibrary ? this._renderManageActions(p) : nothing}
        </div>

        ${inLibrary ? this._renderScenes() : this._renderAddForm(p)}
      </div>
    `;
  }

  private _renderStatLine(p: Parent) {
    const sceneCount = p.sceneCount ?? 0;
    const missingCount = p.missingCount ?? 0;
    const downloaded = this.scenes.filter(s => s.hasFile).length;
    const monitored = this._optimisticParent ?? p.monitored;
    return html`
      <div class="stat-line">
        ${sceneCount} scenes · ${downloaded} downloaded · ${missingCount} missing · ${monitored ? 'monitored' : 'unmonitored'}
      </div>
    `;
  }

  private _renderManageActions(p: Parent) {
    const monitored = this._optimisticParent ?? p.monitored;
    return html`
      <div class="actions">
        <button class="action" @click=${() => this._toggleParent(p)}>
          ${monitored ? '◉ Monitored' : '◯ Unmonitored'}
        </button>
        <button class="action" @click=${() => this._searchParent(p)}>⌕ Search all</button>
        ${this._confirmDelete ? html`
          <button class="action danger" @click=${() => this._deleteParent(p)}>Confirm delete</button>
          <button class="action" @click=${() => { this._confirmDelete = false; }}>Cancel</button>
        ` : html`
          <button class="action danger" @click=${() => { this._confirmDelete = true; }}>Delete</button>
        `}
      </div>
    `;
  }

  private _renderScenes() {
    return html`
      <div class="scenes">
        ${this.loading ? html`<div class="loading-line">Loading…</div>` : nothing}
        ${this.scenes.map(scene => {
          const monitored = this._optimisticScenes[scene.id] ?? scene.monitored;
          const thumb = this._sceneThumb(scene);
          const sub = this._sceneSubLine(scene);
          const pill = this._scenePill(scene);
          return html`
            <div class="scene-row">
              <div class="scene-thumb">
                ${thumb
                  ? html`<img src=${thumb} alt=${scene.title} loading="lazy" />`
                  : html`<div class="scene-thumb-placeholder"></div>`}
              </div>
              <div class="scene-info">
                <div class="scene-title">${scene.title}</div>
                <div class="scene-sub">${sub}</div>
              </div>
              <span class="pill ${pill.cls}">${pill.label}</span>
              <button
                class="toggle ${monitored ? 'on' : ''}"
                title="Toggle monitored"
                @click=${() => this._toggleScene(scene)}
              ></button>
              <button class="icon-btn" title="Search scene" @click=${() => this._searchScene(scene)}>⌕</button>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderAddForm(p: Parent) {
    return html`
      <div class="add-form">
        <div class="form-row">
          <label>Quality Profile</label>
          <select @change=${(e: Event) => { this._profileId = Number((e.target as HTMLSelectElement).value); }}>
            <option value="">Select…</option>
            ${this.qualityProfiles.map(qp => html`<option value=${qp.id}>${qp.name}</option>`)}
          </select>
        </div>
        <div class="form-row">
          <label>Root Folder</label>
          <select @change=${(e: Event) => { this._folder = (e.target as HTMLSelectElement).value; }}>
            <option value="">Select…</option>
            ${this.rootFolders.map(f => html`<option value=${f.path}>${f.path}</option>`)}
          </select>
        </div>
        <div class="form-row">
          <label>Monitored</label>
          <input type="checkbox" ?checked=${this._monitored}
            @change=${(e: Event) => { this._monitored = (e.target as HTMLInputElement).checked; }} />
        </div>
        <div class="form-row">
          <label>Search on add</label>
          <input type="checkbox" ?checked=${this._searchOnAdd}
            @change=${(e: Event) => { this._searchOnAdd = (e.target as HTMLInputElement).checked; }} />
        </div>
        ${this._addError ? html`<div class="add-error">${this._addError}</div>` : nothing}
        <button
          class="action primary"
          ?disabled=${this._adding || !this._profileId || !this._folder}
          @click=${() => this._addParent(p)}
        >${this._adding ? 'Adding…' : '+ Add to library'}</button>
      </div>
    `;
  }

  private _toggleParent(p: Parent) {
    const next = !(this._optimisticParent ?? p.monitored);
    this._optimisticParent = next;
    this.dispatchEvent(new CustomEvent('toggle-monitored', {
      detail: { kind: this.kind, item: p, monitored: next },
      bubbles: true, composed: true,
    }));
  }

  private _searchParent(p: Parent) {
    this.dispatchEvent(new CustomEvent('search-now', {
      detail: { kind: this.kind, item: p },
      bubbles: true, composed: true,
    }));
  }

  private _deleteParent(p: Parent) {
    this._confirmDelete = false;
    this.dispatchEvent(new CustomEvent('delete-parent', {
      detail: p, bubbles: true, composed: true,
    }));
  }

  private _toggleScene(scene: Scene) {
    const next = !(this._optimisticScenes[scene.id] ?? scene.monitored);
    this._optimisticScenes = { ...this._optimisticScenes, [scene.id]: next };
    this.dispatchEvent(new CustomEvent('scene-toggle-monitored', {
      detail: { scene, monitored: next },
      bubbles: true, composed: true,
    }));
  }

  private _searchScene(scene: Scene) {
    this.dispatchEvent(new CustomEvent('scene-search', {
      detail: { scene },
      bubbles: true, composed: true,
    }));
  }

  private _addParent(p: Parent) {
    if (!this._profileId || !this._folder) return;
    this._adding = true;
    this._addError = undefined;
    this.dispatchEvent(new CustomEvent('add-parent', {
      detail: {
        parent: p,
        qualityProfileId: this._profileId,
        rootFolder: this._folder,
        monitored: this._monitored,
        searchOnAdd: this._searchOnAdd,
      },
      bubbles: true, composed: true,
    }));
  }

  addComplete(error?: string) {
    this._adding = false;
    if (error) this._addError = error;
  }
}
