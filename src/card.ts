import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import type { HomeAssistant } from './ha-types.js';
import type { CardConfig, Scene, Parent, ParentKind, QualityProfile, RootFolder, View } from './types.js';
import {
  getScenes, getParents, getParentScenes, lookupScene, lookupParent,
  getConfig, addScene, addParent, setMonitored, triggerSearch, deleteItem,
} from './whisparr-api.js';
import './editor.js';
import './components/filter-chips.js';
import './components/tab-bar.js';
import './components/scene-grid.js';
import './components/scene-detail.js';
import './components/scene-poster.js';
import './components/parent-poster.js';
import './components/parent-detail.js';
import type { WhisparrSceneDetail } from './components/scene-detail.js';
import type { WhisparrParentDetail } from './components/parent-detail.js';

const DOMAIN = 'whisparr_hacs';

@customElement('whisparr-hacs-card')
export class WhisparrHacsCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config!: CardConfig;
  @state() private _view: View = 'scenes';

  // Scenes view state
  @state() private _scenes: Scene[] = [];
  @state() private _filteredScenes: Scene[] = [];
  @state() private _selectedScene?: Scene;
  @state() private _dialogSelectedScene?: Scene;

  // Parent (studios / performers) view state
  @state() private _parents: Parent[] = [];
  @state() private _filteredParents: Parent[] = [];
  @state() private _selectedParent?: Parent;
  @state() private _dialogSelectedParent?: Parent;
  @state() private _parentScenes: Scene[] = [];
  @state() private _parentLoading = false;

  // Shared state
  @state() private _qualityProfiles: QualityProfile[] = [];
  @state() private _rootFolders: RootFolder[] = [];
  @state() private _dialogOpen = false;
  @state() private _activeFilter = 'all';
  @state() private _searchTerm = '';
  @state() private _remoteForced = false;
  @state() private _isRemoteView = false;
  @state() private _sort = 'added';
  @state() private _loading = false;
  @state() private _error?: string;

  @query('dialog') private _dialog?: HTMLDialogElement;

  private _debounceTimer?: ReturnType<typeof setTimeout>;
  private _queueTimer?: ReturnType<typeof setInterval>;
  private _initialised = false;
  private _searchGen = 0;

  static getConfigElement() {
    return document.createElement('whisparr-hacs-card-editor');
  }

  static async getStubConfig(hass: HomeAssistant): Promise<Partial<CardConfig>> {
    try {
      const entries = await hass.connection.sendMessagePromise<Array<{ entry_id: string; domain: string }>>({
        type: 'config_entries/get',
        domain: DOMAIN,
      });
      const match = entries.find(e => e.domain === DOMAIN);
      return { entry_id: match?.entry_id ?? '' };
    } catch {
      return { entry_id: '' };
    }
  }

  setConfig(config: CardConfig) {
    if (!config.entry_id) throw new Error('entry_id is required');
    this._config = {
      default_view: 'scenes',
      show_studios_tab: true,
      show_performers_tab: true,
      columns: 2,
      default_sort: 'added',
      default_filter: 'all',
      show_status_badges: true,
      poster_radius: 8,
      page_size: 25,
      show_quality: true,
      show_file_info: true,
      show_filter_counts: true,
      show_refresh_button: true,
      ...config,
    };
    this._view = this._config.default_view ?? 'scenes';
    this._sort = this._config.default_sort ?? 'added';
    this._activeFilter = this._config.default_filter ?? 'all';
  }

  public getCardSize(): number {
    const cols = this._clampCols(this._config?.columns ?? 2);
    const shown = this._pageSize || 25;
    const rows = Math.max(1, Math.ceil(shown / cols));
    return 3 + rows * 3;
  }

  public getGridOptions(): { columns: string; rows: string } {
    return { columns: 'full', rows: 'auto' };
  }

  protected updated(changed: PropertyValues): void {
    if (changed.has('hass') || changed.has('_config')) {
      this.setAttribute('data-appearance', this._config?.appearance ?? 'glass');
      const dark = this.hass?.themes?.darkMode
        ?? window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.toggleAttribute('data-dark', !!dark);
    }
    if (changed.has('hass') && this.hass && this._config && !this._initialised) {
      this._initialised = true;
      this._loadData();
    }
    if (changed.has('_dialogOpen' as keyof this) && this._dialogOpen) {
      this._dialog?.showModal();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._queueTimer) { clearInterval(this._queueTimer); this._queueTimer = undefined; }
  }

  // ---- helpers ----

  private _clampCols(n: number): number {
    return Math.min(3, Math.max(2, n || 2));
  }

  private get _pageSize(): number {
    return this._config?.page_size ?? 25;
  }

  private get _displayScenes(): Scene[] {
    return this._pageSize > 0 ? this._filteredScenes.slice(0, this._pageSize) : this._filteredScenes;
  }

  private get _displayParents(): Parent[] {
    return this._pageSize > 0 ? this._filteredParents.slice(0, this._pageSize) : this._filteredParents;
  }

  private get _hasMoreScenes(): boolean {
    return this._pageSize > 0 && this._filteredScenes.length > this._pageSize;
  }

  private get _hasMoreParents(): boolean {
    return this._pageSize > 0 && this._filteredParents.length > this._pageSize;
  }

  private get _activeKind(): ParentKind {
    return this._view === 'performers' ? 'performer' : 'studio';
  }

  // ---- filter / search for scenes ----

  private _matchesFilter(s: Scene, key: string): boolean {
    switch (key) {
      case 'available':    return !!s.available;
      case 'missing':      return !!s.monitored && !s.available;
      case 'downloading':  return !!s.inQueue;
      case 'unmonitored':  return !s.monitored;
      default:             return true;
    }
  }

  private _applyActiveFilter(): void {
    this._filteredScenes = this._activeFilter === 'all'
      ? this._scenes
      : this._scenes.filter(s => this._matchesFilter(s, this._activeFilter));
  }

  private get _filterCounts(): Record<string, number> {
    const all = this._scenes;
    return {
      all:          all.length,
      available:    all.filter(s => this._matchesFilter(s, 'available')).length,
      missing:      all.filter(s => this._matchesFilter(s, 'missing')).length,
      downloading:  all.filter(s => this._matchesFilter(s, 'downloading')).length,
      unmonitored:  all.filter(s => this._matchesFilter(s, 'unmonitored')).length,
    };
  }

  // ---- data loading ----

  private async _loadData(preserveSelection = false): Promise<void> {
    this._loading = !preserveSelection;
    this._error = undefined;
    try {
      const cfg = await getConfig(this.hass, this._config.entry_id);
      this._qualityProfiles = cfg.quality_profiles;
      this._rootFolders = cfg.root_folders;

      if (this._view === 'scenes') {
        await this._loadScenes(preserveSelection);
      } else {
        await this._loadParents(preserveSelection);
      }
    } catch (e) {
      this._error = `Could not connect to Whisparr: ${e}`;
    } finally {
      this._loading = false;
    }
  }

  private async _loadScenes(preserveSelection = false): Promise<void> {
    const prevSelectedId = preserveSelection ? this._selectedScene?.id : undefined;
    const prevDialogId   = preserveSelection ? this._dialogSelectedScene?.id : undefined;

    const scenes = await getScenes(this.hass, this._config.entry_id, { sort: this._sort });
    this._scenes = scenes;
    if (!this._isRemoteView) {
      this._applyActiveFilter();
      if (prevSelectedId != null) {
        this._selectedScene = scenes.find(s => s.id === prevSelectedId) ?? this._selectedScene;
      }
      if (prevDialogId != null) {
        this._dialogSelectedScene = scenes.find(s => s.id === prevDialogId) ?? this._dialogSelectedScene;
      }
    }

    const hasDownloading = scenes.some(s => s.inQueue);
    if (hasDownloading && !this._queueTimer) {
      this._queueTimer = setInterval(() => this._loadData(true), 15000);
    } else if (!hasDownloading && this._queueTimer) {
      clearInterval(this._queueTimer);
      this._queueTimer = undefined;
    }
  }

  private async _loadParents(preserveSelection = false): Promise<void> {
    const prevSelectedId = preserveSelection ? this._selectedParent?.id : undefined;
    const prevDialogId   = preserveSelection ? this._dialogSelectedParent?.id : undefined;

    const kind = this._activeKind;
    const parents = await getParents(this.hass, this._config.entry_id, kind, { sort: this._sort });
    this._parents = parents;
    if (!this._isRemoteView) {
      this._filteredParents = parents;
      if (prevSelectedId != null) {
        const found = parents.find(p => p.id === prevSelectedId);
        if (found) this._selectedParent = found;
      }
      if (prevDialogId != null) {
        const found = parents.find(p => p.id === prevDialogId);
        if (found) this._dialogSelectedParent = found;
      }
    }
  }

  private async _reloadParentScenes(): Promise<void> {
    if (!this._selectedParent) return;
    this._parentLoading = true;
    try {
      this._parentScenes = await getParentScenes(
        this.hass, this._config.entry_id, this._activeKind, this._selectedParent.id
      );
    } finally {
      this._parentLoading = false;
    }
  }

  // ---- view switching ----

  private _onViewChange(view: View): void {
    if (view === this._view) return;
    this._view = view;
    this._searchTerm = '';
    this._remoteForced = false;
    this._isRemoteView = false;
    this._selectedScene = undefined;
    this._dialogSelectedScene = undefined;
    this._selectedParent = undefined;
    this._dialogSelectedParent = undefined;
    this._parentScenes = [];
    this._filteredParents = [];
    this._sort = this._config.default_sort ?? 'added';
    this._loadData();
  }

  // ---- search: scenes ----

  private _onSearchInput(e: Event): void {
    this._searchTerm = (e.target as HTMLInputElement).value;
    this._searchGen++;
    clearTimeout(this._debounceTimer);
    this._remoteForced = false;
    this._isRemoteView = false;
    const term = this._searchTerm.toLowerCase();
    if (term) {
      if (this._view === 'scenes') {
        this._filteredScenes = this._scenes.filter(
          s => s.title.toLowerCase().includes(term) || String(s.year ?? '').includes(term)
        );
        if (this._filteredScenes.length === 0) {
          this._debounceTimer = setTimeout(() => this._whisparrSceneSearch(), 400);
        }
      } else {
        this._filteredParents = this._parents.filter(
          p => (p.displayName ?? p.title ?? p.fullName ?? '').toLowerCase().includes(term)
        );
        if (this._filteredParents.length === 0) {
          this._debounceTimer = setTimeout(() => this._whisparrParentSearch(), 400);
        }
      }
    } else {
      if (this._view === 'scenes') {
        this._applyActiveFilter();
      } else {
        this._filteredParents = this._parents;
      }
    }
  }

  private _forceSearchWhisparr(): void {
    this._remoteForced = true;
    this._searchGen++;
    clearTimeout(this._debounceTimer);
    if (this._view === 'scenes') {
      this._whisparrSceneSearch();
    } else {
      this._whisparrParentSearch();
    }
  }

  private async _whisparrSceneSearch(): Promise<void> {
    if (!this._searchTerm) return;
    const gen = this._searchGen;
    try {
      const results = await lookupScene(this.hass, this._config.entry_id, this._searchTerm);
      if (this._searchGen === gen) {
        this._filteredScenes = results;
        this._isRemoteView = true;
      }
    } catch (_e) {
      // leave empty
    }
  }

  private async _whisparrParentSearch(): Promise<void> {
    if (!this._searchTerm) return;
    const gen = this._searchGen;
    try {
      const results = await lookupParent(this.hass, this._config.entry_id, this._activeKind, this._searchTerm);
      if (this._searchGen === gen) {
        this._filteredParents = results;
        this._isRemoteView = true;
      }
    } catch (_e) {
      // leave empty
    }
  }

  // ---- sort control ----

  private _onSortChange(sort: string): void {
    this._sort = sort;
    this._loadData();
  }

  // ---- filter chips ----

  private _onFilterChange(key: string): void {
    this._activeFilter = key;
    this._selectedScene = undefined;
    this._dialogSelectedScene = undefined;
    this._isRemoteView = false;
    this._remoteForced = false;
    this._searchTerm = '';
    this._applyActiveFilter();
  }

  // ---- poster clicks ----

  private _onScenePosterClick(scene: Scene): void {
    this._selectedScene = this._selectedScene?.id === scene.id ? undefined : scene;
  }

  private _onDialogScenePosterClick(scene: Scene): void {
    this._dialogSelectedScene = this._dialogSelectedScene?.id === scene.id ? undefined : scene;
  }

  private async _onParentPosterClick(parent: Parent): Promise<void> {
    if (this._selectedParent?.id === parent.id) {
      this._selectedParent = undefined;
      this._parentScenes = [];
      return;
    }
    this._selectedParent = parent;
    this._parentScenes = [];
    this._parentLoading = true;
    try {
      this._parentScenes = await getParentScenes(
        this.hass, this._config.entry_id, this._activeKind, parent.id
      );
    } finally {
      this._parentLoading = false;
    }
  }

  private async _onDialogParentPosterClick(parent: Parent): Promise<void> {
    if (this._dialogSelectedParent?.id === parent.id) {
      this._dialogSelectedParent = undefined;
      return;
    }
    this._dialogSelectedParent = parent;
  }

  // ---- scene events ----

  private async _onAddSceneEvent(e: CustomEvent): Promise<void> {
    const { scene, qualityProfileId, rootFolder, monitored, searchOnAdd } = e.detail;
    const panel = e.target as WhisparrSceneDetail;
    let err: string | undefined;
    try {
      await addScene(this.hass, this._config.entry_id, scene, qualityProfileId, rootFolder, monitored, searchOnAdd);
      this._selectedScene = undefined;
      this._dialogSelectedScene = undefined;
      this._searchTerm = '';
      this._isRemoteView = false;
      await this._loadData();
    } catch (ex) {
      err = String(ex);
    }
    panel.addComplete(err);
  }

  private async _onDeleteSceneEvent(e: CustomEvent): Promise<void> {
    const scene = e.detail as Scene;
    try {
      await deleteItem(this.hass, this._config.entry_id, 'scene', scene.id);
      this._selectedScene = undefined;
      this._dialogSelectedScene = undefined;
    } catch (ex) {
      this._error = `Delete failed: ${ex}`;
    } finally {
      await this._loadData();
    }
  }

  private async _onToggleMonitoredScene(e: CustomEvent): Promise<void> {
    const { scene, monitored } = e.detail as { scene: Scene; monitored: boolean };
    try {
      await setMonitored(this.hass, this._config.entry_id, 'scene', scene.id, monitored);
      await this._loadData(true);
    } catch (err) {
      this._error = `Could not update monitored: ${err}`;
    }
  }

  private async _onSearchNowScene(e: CustomEvent): Promise<void> {
    const { scene } = e.detail as { scene: Scene };
    try {
      await triggerSearch(this.hass, this._config.entry_id, 'scene', scene.id);
    } catch (err) {
      this._error = `Search failed: ${err}`;
    }
  }

  // ---- parent events ----

  private async _onToggleMonitoredParent(e: CustomEvent): Promise<void> {
    const { kind, item, monitored } = e.detail as { kind: ParentKind; item: Parent; monitored: boolean };
    try {
      await setMonitored(this.hass, this._config.entry_id, kind, item.id, monitored);
      await this._loadData(true);
      // Reload parent scenes if the toggled parent is selected
      if (this._selectedParent?.id === item.id) {
        await this._reloadParentScenes();
      }
    } catch (err) {
      this._error = `Could not update monitored: ${err}`;
    }
  }

  private async _onSearchNowParent(e: CustomEvent): Promise<void> {
    const { kind, item } = e.detail as { kind: ParentKind; item: Parent };
    try {
      await triggerSearch(this.hass, this._config.entry_id, kind, item.id);
    } catch (err) {
      this._error = `Search failed: ${err}`;
    }
  }

  private async _onDeleteParentEvent(e: CustomEvent): Promise<void> {
    const parent = e.detail as Parent;
    try {
      await deleteItem(this.hass, this._config.entry_id, this._activeKind, parent.id);
      this._selectedParent = undefined;
      this._dialogSelectedParent = undefined;
      this._parentScenes = [];
    } catch (ex) {
      this._error = `Delete failed: ${ex}`;
    } finally {
      await this._loadData();
    }
  }

  private async _onSceneToggleMonitored(e: CustomEvent): Promise<void> {
    const { scene, monitored } = e.detail as { scene: Scene; monitored: boolean };
    try {
      await setMonitored(this.hass, this._config.entry_id, 'scene', scene.id, monitored);
      await this._reloadParentScenes();
    } catch (err) {
      this._error = `Could not update monitored: ${err}`;
    }
  }

  private async _onSceneSearch(e: CustomEvent): Promise<void> {
    const { scene } = e.detail as { scene: Scene };
    try {
      await triggerSearch(this.hass, this._config.entry_id, 'scene', scene.id);
    } catch (err) {
      this._error = `Search failed: ${err}`;
    }
  }

  private async _onAddParentEvent(e: CustomEvent): Promise<void> {
    const { parent, qualityProfileId, rootFolder, monitored, searchOnAdd } = e.detail;
    const panel = e.target as WhisparrParentDetail;
    let err: string | undefined;
    try {
      await addParent(this.hass, this._config.entry_id, this._activeKind, parent, qualityProfileId, rootFolder, monitored, searchOnAdd);
      this._selectedParent = undefined;
      this._dialogSelectedParent = undefined;
      this._parentScenes = [];
      await this._loadData();
    } catch (ex) {
      err = String(ex);
    }
    panel.addComplete(err);
  }

  // ---- dialog ----

  private _openDialog(): void {
    this._dialogOpen = true;
  }

  private _onDialogClose(): void {
    this._dialogOpen = false;
    this._dialogSelectedScene = undefined;
    this._dialogSelectedParent = undefined;
  }

  // ---- render helpers ----

  private _renderSortControl() {
    const sorts = this._view === 'scenes'
      ? [['added', 'Added'], ['released', 'Released'], ['title', 'Title']]
      : [['added', 'Added'], ['title', 'Title']];
    return html`
      <div style="display:flex;gap:4px;padding:4px 16px 0;flex-wrap:wrap">
        ${sorts.map(([val, label]) => html`
          <button
            class="icon-btn"
            style=${this._sort === val ? 'border-color:var(--rc-accent);color:var(--rc-accent)' : ''}
            @click=${() => this._onSortChange(val)}
          >${label}</button>
        `)}
      </div>
    `;
  }

  private _renderSearchWhisparrLink() {
    if (!this._searchTerm || this._filteredScenes.length === 0 || this._remoteForced) return nothing;
    return html`
      <div style="padding:4px 16px 8px;text-align:right">
        <a style="color:var(--primary-color);font-size:.82rem;opacity:.85;text-decoration:none"
          href="#" @click=${(e: Event) => { e.preventDefault(); this._forceSearchWhisparr(); }}
        >Search Whisparr →</a>
      </div>
    `;
  }

  private _renderSearchWhisparrParentLink() {
    if (!this._searchTerm || this._filteredParents.length === 0 || this._remoteForced) return nothing;
    return html`
      <div style="padding:4px 16px 8px;text-align:right">
        <a style="color:var(--primary-color);font-size:.82rem;opacity:.85;text-decoration:none"
          href="#" @click=${(e: Event) => { e.preventDefault(); this._forceSearchWhisparr(); }}
        >Search Whisparr →</a>
      </div>
    `;
  }

  /** Render the scenes grid + inline detail panel. */
  private _renderSceneGrid(
    scenes: Scene[],
    selectedScene: Scene | undefined,
    onPosterClick: (s: Scene) => void,
  ) {
    if (!scenes.length) {
      return html`<div class="empty">${this._searchTerm ? 'No results' : 'No scenes found'}</div>`;
    }
    const cols = this._clampCols(this._config?.columns ?? 2);
    const selectedIdx = selectedScene != null
      ? scenes.findIndex(s => s.id === selectedScene.id)
      : -1;
    const rowEndIdx = selectedIdx >= 0
      ? Math.min(Math.floor(selectedIdx / cols) * cols + cols - 1, scenes.length - 1)
      : -1;

    return html`
      <div class="grid" style="grid-template-columns:repeat(${cols},1fr)">
        ${scenes.map((scene, idx) => html`
          <whisparr-scene-poster
            .scene=${scene}
            ?selected=${scene.id === selectedScene?.id}
            .showBadge=${this._config?.show_status_badges !== false}
            .radius=${this._config?.poster_radius ?? 8}
            @poster-click=${() => onPosterClick(scene)}
          ></whisparr-scene-poster>
          ${idx === rowEndIdx ? html`
            <div class="inline-detail">
              <whisparr-scene-detail
                open
                .scene=${selectedScene}
                .qualityProfiles=${this._qualityProfiles}
                .rootFolders=${this._rootFolders}
                .showQuality=${this._config?.show_quality !== false}
                .showFileInfo=${this._config?.show_file_info !== false}
                @add-scene=${(e: CustomEvent) => this._onAddSceneEvent(e)}
                @delete-scene=${(e: CustomEvent) => this._onDeleteSceneEvent(e)}
                @toggle-monitored=${(e: CustomEvent) => this._onToggleMonitoredScene(e)}
                @search-now=${(e: CustomEvent) => this._onSearchNowScene(e)}
              ></whisparr-scene-detail>
            </div>
          ` : nothing}
        `)}
      </div>
    `;
  }

  /** Render the parents grid + inline detail panel. */
  private _renderParentGrid(
    parents: Parent[],
    selectedParent: Parent | undefined,
    onPosterClick: (p: Parent) => void,
    parentScenes: Scene[],
    parentLoading: boolean,
  ) {
    if (!parents.length) {
      return html`<div class="empty">${this._searchTerm ? 'No results' : `No ${this._activeKind}s found`}</div>`;
    }
    const cols = this._clampCols(this._config?.columns ?? 2);
    const selectedIdx = selectedParent != null
      ? parents.findIndex(p => p.id === selectedParent.id)
      : -1;
    const rowEndIdx = selectedIdx >= 0
      ? Math.min(Math.floor(selectedIdx / cols) * cols + cols - 1, parents.length - 1)
      : -1;

    return html`
      <div class="grid" style="grid-template-columns:repeat(${cols},1fr)">
        ${parents.map((parent, idx) => html`
          <whisparr-parent-poster
            .parent=${parent}
            .kind=${this._activeKind}
            ?selected=${parent.id === selectedParent?.id}
            .radius=${this._config?.poster_radius ?? 8}
            @poster-click=${() => onPosterClick(parent)}
          ></whisparr-parent-poster>
          ${idx === rowEndIdx ? html`
            <div class="inline-detail">
              <whisparr-parent-detail
                open
                .parent=${selectedParent}
                .kind=${this._activeKind}
                .scenes=${parentScenes}
                .loading=${parentLoading}
                .qualityProfiles=${this._qualityProfiles}
                .rootFolders=${this._rootFolders}
                .showQuality=${this._config?.show_quality !== false}
                .showFileInfo=${this._config?.show_file_info !== false}
                @toggle-monitored=${(e: CustomEvent) => this._onToggleMonitoredParent(e)}
                @search-now=${(e: CustomEvent) => this._onSearchNowParent(e)}
                @delete-parent=${(e: CustomEvent) => this._onDeleteParentEvent(e)}
                @scene-toggle-monitored=${(e: CustomEvent) => this._onSceneToggleMonitored(e)}
                @scene-search=${(e: CustomEvent) => this._onSceneSearch(e)}
                @add-parent=${(e: CustomEvent) => this._onAddParentEvent(e)}
              ></whisparr-parent-detail>
            </div>
          ` : nothing}
        `)}
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
      --rc-text: var(--primary-text-color);
      --rc-text-secondary: var(--secondary-text-color);
      --rc-surface: var(--ha-card-background, var(--card-background-color));
      --rc-surface-container: color-mix(in srgb, var(--rc-text) 8%, transparent);
      --rc-outline: var(--divider-color, color-mix(in srgb, var(--rc-text) 12%, transparent));
      --rc-accent: var(--primary-color);
      --rc-accent-container: var(--primary-color);
      --rc-on-accent: var(--text-primary-color, #fff);
      --rc-radius: var(--ha-card-border-radius, 12px);
      --rc-control-radius: 8px;
      --rc-chip-radius: 20px;
      --rc-chip-bg: var(--rc-surface-container);
      --rc-chip-check: "";
    }
    :host([data-appearance="material"]) {
      --rc-text: #1c1b1a;
      --rc-text-secondary: #5f5b55;
      --rc-surface: color-mix(in srgb, var(--primary-color) 5%, #ffffff);
      --rc-surface-container: color-mix(in srgb, var(--primary-color) 8%, #ffffff);
      --rc-outline: color-mix(in srgb, var(--primary-color) 15%, #b5ada5);
      --rc-accent: var(--primary-color);
      --rc-accent-container: color-mix(in srgb, var(--primary-color) 22%, #ffffff);
      --rc-on-accent: color-mix(in srgb, var(--primary-color) 75%, #000000);
      --rc-radius: 24px;
      --rc-control-radius: 20px;
      --rc-chip-radius: 8px;
      --rc-chip-bg: transparent;
      --rc-chip-check: "✓ ";
    }
    :host([data-appearance="material"][data-dark]) {
      --rc-accent: var(--primary-color);
      --rc-text: #ece5df;
      --rc-text-secondary: #cbc3bb;
      --rc-surface: color-mix(in srgb, var(--primary-color) 6%, #1a1715);
      --rc-surface-container: color-mix(in srgb, var(--primary-color) 10%, #262220);
      --rc-outline: color-mix(in srgb, var(--primary-color) 15%, #4a443d);
      --rc-accent-container: color-mix(in srgb, var(--primary-color) 30%, #000000);
      --rc-on-accent: color-mix(in srgb, var(--primary-color) 60%, #ffffff);
    }
    ha-card {
      overflow: hidden;
      padding: 0;
    }
    :host([data-appearance="material"]) ha-card {
      background: var(--rc-surface);
      border-radius: var(--rc-radius);
      color: var(--rc-text);
    }
    .header {
      align-items: center;
      background: transparent;
      border-bottom: 1px solid var(--rc-outline);
      display: flex;
      gap: 8px;
      padding: 12px 16px;
    }
    .title {
      color: var(--rc-text);
      font-size: 1.05rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      white-space: nowrap;
    }
    .search {
      background: var(--rc-surface-container);
      border: 1px solid var(--rc-outline);
      border-radius: var(--rc-control-radius);
      color: var(--rc-text);
      flex: 1;
      font-size: 0.88rem;
      outline: none;
      padding: 7px 13px;
      transition: border-color 0.15s;
    }
    .search::placeholder { color: var(--rc-text-secondary); opacity: 0.7; }
    .search:focus { border-color: var(--rc-accent); }
    .icon-btn {
      background: var(--rc-surface-container);
      border: 1px solid var(--rc-outline);
      border-radius: var(--rc-control-radius);
      color: var(--rc-text);
      cursor: pointer;
      flex-shrink: 0;
      font-size: 1rem;
      line-height: 1;
      padding: 6px 10px;
      transition: background 0.15s;
      white-space: nowrap;
    }
    .icon-btn:hover { background: color-mix(in srgb, var(--rc-text) 14%, transparent); }
    .state-msg { color: var(--rc-text-secondary); padding: 40px 24px; text-align: center; }
    .error-msg { color: var(--error-color, #f44336); }
    .retry {
      background: var(--rc-surface-container);
      border: 1px solid var(--rc-outline);
      border-radius: var(--rc-control-radius);
      color: var(--rc-text);
      cursor: pointer;
      display: inline-block;
      margin-top: 10px;
      padding: 6px 16px;
      transition: background 0.15s;
    }
    .retry:hover { background: color-mix(in srgb, var(--rc-text) 12%, transparent); }
    .grid { display: grid; gap: 8px; padding: 8px; }
    .empty { color: var(--rc-text-secondary); padding: 32px; text-align: center; }
    .inline-detail { animation: slideDown 0.2s ease-out; grid-column: 1 / -1; }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .view-all {
      background: var(--rc-surface-container);
      border: 1px solid var(--rc-outline);
      border-radius: var(--rc-control-radius);
      box-sizing: border-box;
      color: var(--rc-accent);
      cursor: pointer;
      display: block;
      font-size: 0.88rem;
      margin: 0 8px 12px;
      padding: 10px;
      text-align: center;
      transition: background 0.15s;
      width: calc(100% - 16px);
    }
    .view-all:hover { background: color-mix(in srgb, var(--rc-text) 9%, transparent); }
    dialog {
      background: var(--card-background-color, #1c1c1e);
      border: none;
      box-sizing: border-box;
      height: 100dvh;
      inset: 0;
      margin: 0;
      max-height: 100%;
      max-width: 100%;
      overflow-y: auto;
      padding: 0;
      position: fixed;
      width: 100%;
    }
    :host([data-appearance="material"]) dialog {
      background: var(--rc-surface);
      color: var(--rc-text);
    }
    dialog::backdrop { background: rgba(0, 0, 0, 0.6); }
    .dialog-header {
      align-items: center;
      background: var(--rc-surface-container);
      border-bottom: 1px solid var(--rc-outline);
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      position: sticky;
      top: 0;
      z-index: 1;
    }
  `;

  render() {
    if (!this._config) return html``;
    const cfg = this._config;
    const title = cfg.card_title ?? 'Whisparr';
    const showCounts = cfg.show_filter_counts !== false;
    const isScenes = this._view === 'scenes';
    const searchPlaceholder = isScenes
      ? 'Search scenes…'
      : `Search ${this._activeKind}s…`;

    return html`
      <ha-card>
        <div class="header">
          <span class="title">${title}</span>
          <input class="search" type="search" .placeholder=${searchPlaceholder}
            .value=${this._searchTerm} @input=${this._onSearchInput} />
          ${cfg.show_refresh_button !== false ? html`
            <button class="icon-btn" @click=${() => this._loadData()} title="Refresh">↻</button>
          ` : nothing}
        </div>

        <whisparr-tab-bar
          .active=${this._view}
          .showStudios=${cfg.show_studios_tab !== false}
          .showPerformers=${cfg.show_performers_tab !== false}
          @view-change=${(e: CustomEvent<View>) => this._onViewChange(e.detail)}
        ></whisparr-tab-bar>

        ${isScenes ? html`
          <whisparr-filter-chips
            .activeFilter=${this._activeFilter}
            .counts=${showCounts ? this._filterCounts : undefined}
            @filter-change=${(e: CustomEvent<string>) => this._onFilterChange(e.detail)}
          ></whisparr-filter-chips>
        ` : nothing}

        ${this._renderSortControl()}

        ${this._loading ? html`<div class="state-msg">Loading…</div>` : ''}

        ${this._error ? html`
          <div class="state-msg error-msg">
            ${this._error}<br/>
            <button class="retry" @click=${() => { this._error = undefined; this._loadData(); }}>Retry</button>
          </div>
        ` : ''}

        ${!this._loading && !this._error ? html`
          ${isScenes ? html`
            ${this._renderSceneGrid(
              this._displayScenes,
              this._selectedScene,
              s => this._onScenePosterClick(s),
            )}
            ${this._hasMoreScenes ? html`
              <button class="view-all" @click=${this._openDialog}>
                View all ${this._filteredScenes.length} scenes →
              </button>
            ` : ''}
            ${this._renderSearchWhisparrLink()}
          ` : html`
            ${this._renderParentGrid(
              this._displayParents,
              this._selectedParent,
              p => this._onParentPosterClick(p),
              this._parentScenes,
              this._parentLoading,
            )}
            ${this._hasMoreParents ? html`
              <button class="view-all" @click=${this._openDialog}>
                View all ${this._filteredParents.length} ${this._activeKind}s →
              </button>
            ` : ''}
            ${this._renderSearchWhisparrParentLink()}
          `}
        ` : ''}
      </ha-card>

      <dialog @close=${this._onDialogClose}>
        ${this._dialogOpen ? html`
          <div class="dialog-header">
            <span class="title">${title}</span>
            <input class="search" type="search" .placeholder=${searchPlaceholder}
              .value=${this._searchTerm} @input=${this._onSearchInput} />
            <button class="icon-btn" @click=${() => this._dialog?.close()}>✕</button>
          </div>
          ${isScenes ? html`
            <whisparr-filter-chips
              .activeFilter=${this._activeFilter}
              .counts=${showCounts ? this._filterCounts : undefined}
              @filter-change=${(e: CustomEvent<string>) => this._onFilterChange(e.detail)}
            ></whisparr-filter-chips>
            ${this._renderSceneGrid(
              this._filteredScenes,
              this._dialogSelectedScene,
              s => this._onDialogScenePosterClick(s),
            )}
            ${this._renderSearchWhisparrLink()}
          ` : html`
            ${this._renderParentGrid(
              this._filteredParents,
              this._dialogSelectedParent,
              p => this._onDialogParentPosterClick(p),
              this._parentScenes,
              this._parentLoading,
            )}
            ${this._renderSearchWhisparrParentLink()}
          `}
        ` : ''}
      </dialog>
    `;
  }
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'whisparr-hacs-card',
  name: 'Whisparr Card',
  description: 'Browse and manage your Whisparr scenes, studios, and performers',
  preview: false,
  documentationURL: 'https://github.com/devshm3/whisparr-card',
});

console.info('%c WHISPARR-CARD %c 0.1.0 ', 'background:#e040fb;color:#1a1a1a;font-weight:700', 'background:#333;color:#fff');
