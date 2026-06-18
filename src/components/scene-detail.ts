import { LitElement, html, css, PropertyValues, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Scene, QualityProfile, RootFolder } from '../types.js';

@customElement('whisparr-scene-detail')
export class WhisparrSceneDetail extends LitElement {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ attribute: false }) scene?: Scene;
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
  @state() private _searchQueued = false;

  static styles = css`
    :host {
      display: block;
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, opacity 0.2s ease;
    }
    :host([open]) { max-height: 1200px; opacity: 1; }

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
    .poster img {
      border-radius: 8px;
      display: block;
      width: 120px;
    }
    .poster-placeholder {
      align-items: center;
      aspect-ratio: 2 / 3;
      background: var(--rc-surface-container, rgba(255,255,255,0.05));
      border-radius: 8px;
      color: var(--secondary-text-color);
      display: flex;
      flex-direction: column;
      font-size: 0.75rem;
      gap: 4px;
      justify-content: center;
      padding: 8px;
      text-align: center;
      width: 120px;
    }
    h2 { font-size: 1.15rem; margin: 0 0 4px; color: var(--rc-text, var(--primary-text-color)); }
    .meta { color: var(--rc-text-secondary, var(--secondary-text-color)); font-size: 0.82rem; line-height: 1.6; }
    .info-row { color: var(--rc-text-secondary, var(--secondary-text-color)); font-size: 0.8rem; margin-top: 4px; }
    .info-row strong { color: var(--rc-text, var(--primary-text-color)); }
    .overview { font-size: 0.88rem; line-height: 1.55; margin-top: 8px; color: var(--rc-text, var(--primary-text-color)); }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }

    button {
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.07));
      border: 1px solid var(--rc-outline, rgba(255, 255, 255, 0.12));
      border-radius: var(--rc-control-radius, 8px);
      color: var(--rc-text, var(--primary-text-color));
      cursor: pointer;
      font-size: 0.84rem;
      padding: 6px 14px;
      transition: background 0.15s;
    }
    button:hover { background: color-mix(in srgb, var(--rc-text, #fff) 12%, transparent); }
    button.primary {
      background: var(--rc-accent-container, var(--primary-color));
      border-color: var(--rc-accent-container, var(--primary-color));
      color: var(--rc-on-accent, var(--text-primary-color, #fff));
    }
    button.primary:disabled { opacity: 0.5; cursor: default; }
    button.primary:hover:not(:disabled) { filter: brightness(1.1); }
    button.danger { border-color: #f44336; color: #f44336; }
    button.danger:hover { background: rgba(244,67,54,0.12); }
    button.monitored-on  { border-color: #43a047; color: #43a047; }
    button.monitored-off { border-color: #757575; color: #9e9e9e; }
    button.success { border-color: #43a047; color: #43a047; }

    .add-form { grid-column: 1 / -1; }
    .form-row {
      align-items: center;
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }
    .form-row label { font-size: 0.84rem; min-width: 120px; }
    select {
      background: var(--rc-surface-container, rgba(255, 255, 255, 0.06));
      border: 1px solid var(--rc-outline, rgba(255, 255, 255, 0.1));
      border-radius: var(--rc-control-radius, 6px);
      color: var(--rc-text, var(--primary-text-color));
      flex: 1;
      padding: 6px 10px;
    }
    .add-error { color: var(--error-color, #f44336); font-size: 0.8rem; margin-bottom: 8px; }
    .download-progress {
      grid-column: 1 / -1;
      margin-top: 4px;
    }
    .progress-header {
      align-items: center;
      display: flex;
      font-size: 0.8rem;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    .progress-label { color: var(--rc-text-secondary, var(--secondary-text-color)); }
    .progress-time { color: var(--rc-text, var(--primary-text-color)); font-weight: 500; }
    .progress-track {
      background: color-mix(in srgb, var(--rc-text, #fff) 8%, transparent);
      border-radius: 4px;
      height: 6px;
      overflow: hidden;
    }
    .progress-fill {
      background: var(--rc-accent, var(--primary-color));
      border-radius: 4px;
      height: 100%;
      transition: width 1s linear;
    }
    .progress-pct {
      color: var(--rc-text-secondary, var(--secondary-text-color));
      font-size: 0.75rem;
      margin-top: 4px;
      text-align: right;
    }
  `;

  private get _poster(): string {
    return this.scene?.images?.find(i => i.coverType === 'poster')?.remoteUrl ?? '';
  }

  private get _showAddForm(): boolean {
    return this.scene?.inLibrary === false;
  }

  private get _downloadPct(): number {
    const q = this.scene?.queueItem;
    if (!q || q.size === 0) return 0;
    return Math.round((1 - q.sizeleft / q.size) * 100);
  }

  private _formatTimeLeft(timeleft?: string): string {
    if (!timeleft) return '';
    const parts = timeleft.split(':').map(Number);
    if (parts.length !== 3) return timeleft;
    const [h, m] = parts;
    if (h > 0) return `${h}h ${m}m left`;
    if (m > 0) return `${m}m left`;
    return '< 1m left';
  }

  private get _qualityProfileName(): string | undefined {
    if (!this.showQuality || !this.scene?.qualityProfileId) return undefined;
    return this.qualityProfiles.find(p => p.id === this.scene!.qualityProfileId)?.name;
  }

  private get _fileInfoStr(): string | undefined {
    if (!this.showFileInfo || !this.scene?.movieFile) return undefined;
    const { quality, size } = this.scene.movieFile;
    if (size === undefined) return undefined;
    const qName = quality?.quality?.name ?? '';
    const sizeStr = size > 1e9
      ? `${(size / 1e9).toFixed(1)} GB`
      : `${Math.round(size / 1e6)} MB`;
    return [qName, sizeStr].filter(Boolean).join(' · ');
  }

  protected updated(changed: PropertyValues): void {
    if (changed.has('scene')) {
      this._profileId = undefined;
      this._folder = undefined;
      this._monitored = true;
      this._searchOnAdd = true;
      this._adding = false;
      this._addError = undefined;
      this._confirmDelete = false;
      this._searchQueued = false;
    }
  }

  render() {
    if (!this.scene) return html``;
    const s = this.scene;
    const releaseDate = s.releaseDate ?? s.digitalRelease;
    return html`
      <div class="panel">
        <div class="poster">
          ${this._poster
            ? html`<img src=${this._poster} alt=${s.title} />`
            : html`
              <div class="poster-placeholder">
                <span>${s.title}</span>
                ${s.year ? html`<span>(${s.year})</span>` : nothing}
              </div>
            `}
        </div>
        <div>
          <h2>${s.title}${s.year ? html` <span style="font-weight:400;opacity:.7">(${s.year})</span>` : ''}</h2>
          <div class="meta">
            ${[
              s.studioTitle ?? '',
              releaseDate ? releaseDate.slice(0, 10) : '',
            ].filter(Boolean).join(' · ')}
          </div>
          ${this._qualityProfileName ? html`
            <div class="info-row"><strong>Quality:</strong> ${this._qualityProfileName}</div>
          ` : nothing}
          ${this._fileInfoStr ? html`
            <div class="info-row"><strong>File:</strong> ${this._fileInfoStr}</div>
          ` : nothing}
          ${s.hasFile ? html`
            <div class="info-row"><strong>Status:</strong> Downloaded</div>
          ` : html`
            <div class="info-row"><strong>Status:</strong> Missing</div>
          `}
          ${s.overview ? html`<div class="overview">${s.overview}</div>` : ''}

          ${!this._showAddForm ? html`
            <div class="actions">
              <button
                class=${s.monitored ? 'monitored-on' : 'monitored-off'}
                @click=${this._toggleMonitored}
              >${s.monitored ? '● Monitored' : '○ Unmonitored'}</button>

              <button
                class=${this._searchQueued ? 'success' : ''}
                ?disabled=${this._searchQueued}
                @click=${this._searchNow}
              >${this._searchQueued ? '✓ Search queued' : 'Search now'}</button>

              ${this._confirmDelete ? html`
                <button class="danger" @click=${this._deleteScene}>Confirm delete</button>
                <button @click=${() => { this._confirmDelete = false; }}>Cancel</button>
              ` : html`
                <button class="danger" @click=${() => { this._confirmDelete = true; }}>Delete</button>
              `}
            </div>
          ` : html`
            <div class="actions">
              <span style="color:var(--secondary-text-color);font-size:.85rem">Not in library</span>
            </div>
          `}
        </div>

        ${this.scene.queueItem ? html`
          <div class="download-progress">
            <div class="progress-header">
              <span class="progress-label">Downloading${this.scene.queueItem.protocol ? ` · ${this.scene.queueItem.protocol}` : ''}</span>
              <span class="progress-time">${this._formatTimeLeft(this.scene.queueItem.timeleft)}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:${this._downloadPct}%"></div>
            </div>
            <div class="progress-pct">${this._downloadPct}%</div>
          </div>
        ` : nothing}

        ${this._showAddForm ? html`
          <div class="add-form">
            <div class="form-row">
              <label>Quality Profile</label>
              <select @change=${(e: Event) => this._profileId = Number((e.target as HTMLSelectElement).value)}>
                <option value="">Select…</option>
                ${this.qualityProfiles.map(p => html`<option value=${p.id}>${p.name}</option>`)}
              </select>
            </div>
            <div class="form-row">
              <label>Root Folder</label>
              <select @change=${(e: Event) => this._folder = (e.target as HTMLSelectElement).value}>
                <option value="">Select…</option>
                ${this.rootFolders.map(f => html`<option value=${f.path}>${f.path}</option>`)}
              </select>
            </div>
            <div class="form-row">
              <label>Monitored</label>
              <input type="checkbox" ?checked=${this._monitored}
                @change=${(e: Event) => this._monitored = (e.target as HTMLInputElement).checked} />
            </div>
            <div class="form-row">
              <label>Search on add</label>
              <input type="checkbox" ?checked=${this._searchOnAdd}
                @change=${(e: Event) => this._searchOnAdd = (e.target as HTMLInputElement).checked} />
            </div>
            ${this._addError ? html`<div class="add-error">${this._addError}</div>` : ''}
            <button
              class="primary"
              ?disabled=${this._adding || !this._profileId || !this._folder}
              @click=${this._addScene}
            >${this._adding ? 'Adding…' : '+ Add to library'}</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  private _toggleMonitored() {
    this.dispatchEvent(new CustomEvent('toggle-monitored', {
      detail: { scene: this.scene, monitored: !this.scene!.monitored },
      bubbles: true,
      composed: true,
    }));
  }

  private _searchNow() {
    this._searchQueued = true;
    this.dispatchEvent(new CustomEvent('search-now', {
      detail: { scene: this.scene },
      bubbles: true,
      composed: true,
    }));
  }

  private _deleteScene() {
    this._confirmDelete = false;
    this.dispatchEvent(new CustomEvent('delete-scene', { detail: this.scene, bubbles: true, composed: true }));
  }

  private _addScene() {
    if (!this._profileId || !this._folder) return;
    this._adding = true;
    this._addError = undefined;
    this.dispatchEvent(new CustomEvent('add-scene', {
      detail: {
        scene: this.scene,
        qualityProfileId: this._profileId,
        rootFolder: this._folder,
        monitored: this._monitored,
        searchOnAdd: this._searchOnAdd,
      },
      bubbles: true,
      composed: true,
    }));
  }

  addComplete(error?: string) {
    this._adding = false;
    if (error) this._addError = error;
  }
}
