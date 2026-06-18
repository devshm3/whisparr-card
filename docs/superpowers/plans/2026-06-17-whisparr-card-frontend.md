# Whisparr Card — Frontend (Lit Card) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Lit dashboard card `<whisparr-hacs-card>` — a three-tab (Scenes / Studios / Performers) card that reads the backend's WebSocket commands and writes through its services — and compile it to the committed `custom_components/whisparr_hacs/www/whisparr-hacs-card.js`.

**Architecture:** This is a **mirror-port** of the sibling cards in `/home/devin/projects/radarr-card` (flat movie view → our Scenes tab) and `/home/devin/projects/sonarr-card` (monitored-parent-with-children view → our Studios & Performers tabs). The spec mandates staying near-identical to them. The card holds a `_view` tab state; the Scenes tab mirrors radarr's flat poster grid + detail; the Studios and Performers tabs share one parameterized parent grid + parent-detail (which lists the parent's scenes as rows with per-scene controls). Backend (Plan 1, already merged) is unchanged.

**Tech Stack:** TypeScript, Lit 3, Rollup (`@rollup/plugin-typescript` + node-resolve + terser) → single ES module. No JS unit-test framework (the siblings have none) — per-task verification is `npm run build` (TypeScript typecheck via the rollup plugin + successful bundle); the final gate is manual verification in Home Assistant.

## Global Constraints

- **No vendor mentions, ever:** nothing referencing the AI assistant vendor (the two brand terms guarded by `.git/hooks/pre-commit` and `.git/hooks/commit-msg`) may appear in any committed file, comment, or commit message. No AI commit trailers. The hooks enforce this — do not remove, bypass (`--no-verify`), or modify them.
- **Naming:** card element `whisparr-hacs-card`; child components prefixed `whisparr-` (e.g. `whisparr-scene-poster`); `DOMAIN = 'whisparr_hacs'`; WS command prefix `whisparr_hacs/...`; service domain `whisparr_hacs`.
- **Build output (exact):** `custom_components/whisparr_hacs/www/whisparr-hacs-card.js` (committed). Rollup input `src/card.ts`, format `es`, terser on.
- **Three tabs:** Scenes (default), Studios, Performers. Config `default_view` selects the initial tab; config can hide the Studios and/or Performers tab.
- **Scenes grid:** horizontal "long poster" art (aspect-ratio 16/9). Columns 2–3, **default 2, min 2, max 3** — clamp the configured value into [2,3]. Scene sort: `added` (default), `released`, `title`. Filters: all / available / missing / downloading / unmonitored.
- **Studios/Performers:** parent grid (2–3 cols, same clamp), each tile shows artwork + name + scene count + missing count + monitored indicator; sort `added` (default) / `title`; opening a parent shows a detail panel with parent-level Monitored toggle + "Search all" and the parent's scenes as **rows** (thumbnail, title, date · quality · size, status pill, per-scene monitor toggle + per-scene search).
- **Theming:** style to HA CSS variables aliased into local `--rc-*` custom properties with the glass/material appearance switch — copy the sibling token blocks verbatim. No hardcoded colors that break theming.
- **Security:** the card never handles the API key; it only calls WS commands / services by `entry_id`.
- **TypeScript:** `strict: true`, `experimentalDecorators: true`, `useDefineForClassFields: false` (copy the sibling `tsconfig.json`).

### Backend contract (already implemented — Plan 1, merged to main)

WebSocket reads (via `hass.connection.sendMessagePromise`), all take `entry_id`:
- `whisparr_hacs/get_scenes` — opt `search`, `filter` (available|missing|downloading|unmonitored), `sort` (title|added|released) → `{ scenes: Scene[] }` (each enriched with `inQueue`, `available`, optional `queueItem`).
- `whisparr_hacs/get_parents` — req `kind` (studio|performer), opt `search`, `sort` (title|added) → `{ parents: Parent[] }` (each enriched with `displayName`, `sceneCount`, `missingCount`).
- `whisparr_hacs/get_parent_scenes` — req `kind`, `parent_id` (int), opt `search`/`filter`/`sort` → `{ scenes: Scene[] }`.
- `whisparr_hacs/lookup_scene` — req `term` → `{ results: Scene[] }` (each flagged `inLibrary`).
- `whisparr_hacs/lookup_parent` — req `kind`, `term` → `{ results: Parent[] }` (each flagged `inLibrary`).
- `whisparr_hacs/get_config` → `{ quality_profiles: QualityProfile[], root_folders: RootFolder[] }`.

Services (via `hass.callService('whisparr_hacs', …)`):
- `add_scene` { entry_id, foreign_id, title, quality_profile_id, root_folder, monitored?, search_on_add? }
- `add_parent` { entry_id, kind, foreign_id, title, quality_profile_id, root_folder, monitored?, search_on_add? }
- `set_monitored` { entry_id, kind (scene|studio|performer), item_id, monitored }
- `trigger_search` { entry_id, kind (scene|studio|performer), item_id }
- `delete` { entry_id, kind (scene|studio|performer), item_id, delete_files? }

> **Field-name caveat (carried from Plan 1):** scene/studio/performer field names (`foreignId`, `studioForeignId`, `credits[].foreignId`, `digitalRelease`, performer `fullName`, image `coverType` values) are documented assumptions pending live-instance verification. The card's `types.ts` mirrors them; if the live API differs, the same fields are adjusted here and in the backend together. Do not block on this.

---

## File Structure

```
package.json            # Task 1 — name whisparr-hacs-card, build/watch scripts, lit + rollup devDeps
rollup.config.js        # Task 1 — input src/card.ts → www/whisparr-hacs-card.js (es, terser)
tsconfig.json           # Task 1 — copy sibling
src/
  ha-types.ts           # Task 1 — HomeAssistant interface (copy sibling verbatim)
  types.ts              # Task 1 — Scene, Parent, QualityProfile, RootFolder, CardConfig, View
  whisparr-api.ts       # Task 2 — WS reads + service writes
  components/
    filter-chips.ts     # Task 3 — whisparr-filter-chips (copy sonarr)
    tab-bar.ts          # Task 3 — whisparr-tab-bar (new: Scenes/Studios/Performers segmented control)
    scene-poster.ts     # Task 4 — whisparr-scene-poster (horizontal 16/9 + footer + badge + progress)
    scene-grid.ts       # Task 4 — whisparr-scene-grid (2–3 cols)
    scene-detail.ts     # Task 5 — whisparr-scene-detail (flat: file info, monitor, search, delete, add-form)
    parent-poster.ts    # Task 6 — whisparr-parent-poster (logo/headshot + name + counts + monitored dot)
    parent-detail.ts    # Task 6 — whisparr-parent-detail (hero + scene rows w/ per-scene controls)
  card.ts               # Task 7 — <whisparr-hacs-card>: tab switch + scenes view + parents view
  editor.ts             # Task 8 — visual editor (entry_id, default_view, tab visibility, columns, sort)
custom_components/whisparr_hacs/www/whisparr-hacs-card.js  # Task 9 — built artifact (committed)
custom_components/whisparr_hacs/__init__.py                # Task 9 — keep/confirm _CARD_VERSION
```

Per-task gate unless noted: `npm run build` exits 0 (TypeScript typecheck + bundle) and the bundle is regenerated. The implementer commits `src/` changes per task; the built `www/*.js` is committed only in Task 9 (one artifact commit) to avoid noisy rebuilds mid-plan.

---

## Task 1: Frontend scaffold + shared types

**Files:** Create `package.json`, `rollup.config.js`, `tsconfig.json`, `src/ha-types.ts`, `src/types.ts`, `src/card.ts` (temporary stub).
**Interfaces produced:** the `Scene`, `Parent`, `QualityProfile`, `RootFolder`, `CardConfig`, `View` types; a buildable `whisparr-hacs-card` stub element.

- [ ] **Step 1: package.json**
```json
{
  "name": "whisparr-hacs-card",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "rollup -c",
    "watch": "rollup -c --watch"
  },
  "devDependencies": {
    "@rollup/plugin-node-resolve": "^15.2.3",
    "@rollup/plugin-terser": "^0.4.4",
    "@rollup/plugin-typescript": "^12.3.0",
    "lit": "^3.1.0",
    "rollup": "^4.12.0",
    "tslib": "^2.8.1",
    "typescript": "^5.3.3"
  }
}
```

- [ ] **Step 2: rollup.config.js**
```js
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/card.ts',
  output: {
    file: 'custom_components/whisparr_hacs/www/whisparr-hacs-card.js',
    format: 'es',
    sourcemap: false,
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    resolve(),
    terser(),
  ],
};
```

- [ ] **Step 3: tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "lib": ["ES2019", "DOM"],
    "strict": true,
    "declaration": false,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 4: src/ha-types.ts** — copy verbatim from `/home/devin/projects/sonarr-card/src/ha-types.ts`:
```ts
export interface HomeAssistant {
  connection: {
    sendMessagePromise<T>(msg: Record<string, unknown>): Promise<T>;
  };
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>
  ): Promise<void>;
  states: Record<string, { state: string; attributes: Record<string, unknown> }>;
  language: string;
  themes?: { darkMode?: boolean };
}
```

- [ ] **Step 5: src/types.ts**
```ts
export type View = 'scenes' | 'studios' | 'performers';
export type ParentKind = 'studio' | 'performer';

export interface MediaImage { coverType: string; remoteUrl: string }

export interface QueueItem {
  size: number;
  sizeleft: number;
  timeleft?: string;
  status: string;
  protocol?: string;
}

export interface Scene {
  id: number;
  foreignId?: string;
  title: string;
  year?: number;
  overview?: string;
  monitored: boolean;
  hasFile?: boolean;
  added?: string;
  digitalRelease?: string;
  releaseDate?: string;
  studioTitle?: string;
  studioForeignId?: string;
  images?: MediaImage[];
  credits?: Array<{ foreignId?: string; personName?: string }>;
  movieFile?: { quality?: { quality?: { name?: string } }; size?: number };
  qualityProfileId?: number;
  // enriched by the backend / lookup client
  inLibrary?: boolean;
  inQueue?: boolean;
  available?: boolean;
  queueItem?: QueueItem;
}

export interface Parent {
  id: number;
  foreignId?: string;
  title?: string;
  fullName?: string;
  monitored: boolean;
  added?: string;
  images?: MediaImage[];
  // enriched by the backend get_parents
  displayName?: string;
  sceneCount?: number;
  missingCount?: number;
  inLibrary?: boolean;
}

export interface QualityProfile { id: number; name: string }
export interface RootFolder { path: string; freeSpace: number }

export interface CardConfig {
  entry_id: string;
  default_view?: View;
  show_studios_tab?: boolean;
  show_performers_tab?: boolean;
  columns?: number;            // clamped to [2,3] at use
  default_sort?: 'added' | 'released' | 'title';
  default_filter?: string;
  show_status_badges?: boolean;
  poster_radius?: number;
  card_title?: string;
  page_size?: number;
  show_quality?: boolean;
  show_file_info?: boolean;
  show_filter_counts?: boolean;
  show_refresh_button?: boolean;
  appearance?: 'glass' | 'material';
}
```

- [ ] **Step 6: src/card.ts (temporary stub — replaced in Task 7)**
```ts
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
```

- [ ] **Step 7: install + build**
Run: `npm install && npm run build`
Expected: exits 0; `custom_components/whisparr_hacs/www/whisparr-hacs-card.js` is (re)written and non-empty.

- [ ] **Step 8: add node_modules + dist to gitignore if missing, then commit src only**
Confirm `.gitignore` already ignores `node_modules/` (it does — from Plan 1). Do NOT commit `node_modules/` or the built `www/*.js` yet (Task 9 commits the artifact).
```bash
git add package.json rollup.config.js tsconfig.json src/ha-types.ts src/types.ts src/card.ts
git commit -m "feat(card): scaffold Lit card build + shared types"
```

---

## Task 2: API client (`src/whisparr-api.ts`)

**Files:** Create `src/whisparr-api.ts`.
**Interfaces consumed:** `HomeAssistant`, `Scene`, `Parent`, `ParentKind`, `QualityProfile`, `RootFolder` (Task 1).
**Interfaces produced (exact signatures later tasks import):**
`getScenes(hass, entryId, opts?: {filter?; sort?; search?}) => Promise<Scene[]>`,
`getParents(hass, entryId, kind, opts?: {sort?; search?}) => Promise<Parent[]>`,
`getParentScenes(hass, entryId, kind, parentId, opts?: {filter?; sort?; search?}) => Promise<Scene[]>`,
`lookupScene(hass, entryId, term) => Promise<Scene[]>`,
`lookupParent(hass, entryId, kind, term) => Promise<Parent[]>`,
`getConfig(hass, entryId) => Promise<{quality_profiles; root_folders}>`,
`addScene(hass, entryId, scene, qualityProfileId, rootFolder, monitored?, searchOnAdd?) => Promise<void>`,
`addParent(hass, entryId, kind, parent, qualityProfileId, rootFolder, monitored?, searchOnAdd?) => Promise<void>`,
`setMonitored(hass, entryId, kind, itemId, monitored) => Promise<void>`,
`triggerSearch(hass, entryId, kind, itemId) => Promise<void>`,
`deleteItem(hass, entryId, kind, itemId, deleteFiles?) => Promise<void>`.

- [ ] **Step 1: write the client**
```ts
import type { HomeAssistant } from './ha-types.js';
import type { Scene, Parent, ParentKind, QualityProfile, RootFolder } from './types.js';

const DOMAIN = 'whisparr_hacs';

interface SceneQuery { filter?: string; sort?: string; search?: string }

export async function getScenes(hass: HomeAssistant, entryId: string, opts: SceneQuery = {}): Promise<Scene[]> {
  const msg: Record<string, unknown> = { type: `${DOMAIN}/get_scenes`, entry_id: entryId };
  if (opts.filter && opts.filter !== 'all') msg['filter'] = opts.filter;
  if (opts.sort) msg['sort'] = opts.sort;
  if (opts.search) msg['search'] = opts.search;
  const resp = await hass.connection.sendMessagePromise<{ scenes: Scene[] }>(msg);
  return resp.scenes;
}

export async function getParents(
  hass: HomeAssistant, entryId: string, kind: ParentKind, opts: { sort?: string; search?: string } = {}
): Promise<Parent[]> {
  const msg: Record<string, unknown> = { type: `${DOMAIN}/get_parents`, entry_id: entryId, kind };
  if (opts.sort) msg['sort'] = opts.sort;
  if (opts.search) msg['search'] = opts.search;
  const resp = await hass.connection.sendMessagePromise<{ parents: Parent[] }>(msg);
  return resp.parents;
}

export async function getParentScenes(
  hass: HomeAssistant, entryId: string, kind: ParentKind, parentId: number, opts: SceneQuery = {}
): Promise<Scene[]> {
  const msg: Record<string, unknown> = { type: `${DOMAIN}/get_parent_scenes`, entry_id: entryId, kind, parent_id: parentId };
  if (opts.filter && opts.filter !== 'all') msg['filter'] = opts.filter;
  if (opts.sort) msg['sort'] = opts.sort;
  if (opts.search) msg['search'] = opts.search;
  const resp = await hass.connection.sendMessagePromise<{ scenes: Scene[] }>(msg);
  return resp.scenes;
}

export async function lookupScene(hass: HomeAssistant, entryId: string, term: string): Promise<Scene[]> {
  const resp = await hass.connection.sendMessagePromise<{ results: Scene[] }>({
    type: `${DOMAIN}/lookup_scene`, entry_id: entryId, term,
  });
  return resp.results;
}

export async function lookupParent(hass: HomeAssistant, entryId: string, kind: ParentKind, term: string): Promise<Parent[]> {
  const resp = await hass.connection.sendMessagePromise<{ results: Parent[] }>({
    type: `${DOMAIN}/lookup_parent`, entry_id: entryId, kind, term,
  });
  return resp.results;
}

export async function getConfig(
  hass: HomeAssistant, entryId: string
): Promise<{ quality_profiles: QualityProfile[]; root_folders: RootFolder[] }> {
  return hass.connection.sendMessagePromise({ type: `${DOMAIN}/get_config`, entry_id: entryId });
}

export async function addScene(
  hass: HomeAssistant, entryId: string, scene: Scene,
  qualityProfileId: number, rootFolder: string, monitored = true, searchOnAdd = true
): Promise<void> {
  await hass.callService(DOMAIN, 'add_scene', {
    entry_id: entryId, foreign_id: scene.foreignId, title: scene.title,
    quality_profile_id: qualityProfileId, root_folder: rootFolder, monitored, search_on_add: searchOnAdd,
  });
}

export async function addParent(
  hass: HomeAssistant, entryId: string, kind: ParentKind, parent: Parent,
  qualityProfileId: number, rootFolder: string, monitored = true, searchOnAdd = true
): Promise<void> {
  await hass.callService(DOMAIN, 'add_parent', {
    entry_id: entryId, kind, foreign_id: parent.foreignId,
    title: parent.displayName ?? parent.title ?? parent.fullName,
    quality_profile_id: qualityProfileId, root_folder: rootFolder, monitored, search_on_add: searchOnAdd,
  });
}

export async function setMonitored(
  hass: HomeAssistant, entryId: string, kind: string, itemId: number, monitored: boolean
): Promise<void> {
  await hass.callService(DOMAIN, 'set_monitored', { entry_id: entryId, kind, item_id: itemId, monitored });
}

export async function triggerSearch(
  hass: HomeAssistant, entryId: string, kind: string, itemId: number
): Promise<void> {
  await hass.callService(DOMAIN, 'trigger_search', { entry_id: entryId, kind, item_id: itemId });
}

export async function deleteItem(
  hass: HomeAssistant, entryId: string, kind: string, itemId: number, deleteFiles = false
): Promise<void> {
  await hass.callService(DOMAIN, 'delete', { entry_id: entryId, kind, item_id: itemId, delete_files: deleteFiles });
}
```

- [ ] **Step 2: build** — `npm run build` exits 0 (typecheck passes). Commit:
```bash
git add src/whisparr-api.ts
git commit -m "feat(card): add WebSocket + service API client"
```

---

## Task 3: filter-chips + tab-bar

**Files:** Create `src/components/filter-chips.ts`, `src/components/tab-bar.ts`.

- [ ] **Step 1: filter-chips.ts** — port `/home/devin/projects/sonarr-card/src/components/filter-chips.ts` verbatim, changing ONLY the element name `sonarr-filter-chips` → `whisparr-filter-chips` and the class `SonarrFilterChips` → `WhisparrFilterChips`. Keep the five filters (all/available/missing/downloading/unmonitored), the `activeFilter`/`counts` properties, the `filter-change` CustomEvent, and the `--rc-*` styles unchanged.

- [ ] **Step 2: tab-bar.ts (new component)**
```ts
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
```

- [ ] **Step 3: build** — `npm run build` exits 0. Commit:
```bash
git add src/components/filter-chips.ts src/components/tab-bar.ts
git commit -m "feat(card): add filter chips and tab bar"
```

---

## Task 4: scene-poster + scene-grid (horizontal)

**Files:** Create `src/components/scene-poster.ts`, `src/components/scene-grid.ts`.
**Interfaces produced:** `<whisparr-scene-poster .scene .selected .showBadge .radius>` emitting `poster-click` (detail = Scene); `<whisparr-scene-grid .scenes .columns .selectedSceneId .showBadges .posterRadius>` rendering posters.

- [ ] **Step 1: scene-poster.ts** — adapt `/home/devin/projects/radarr-card/src/components/movie-poster.ts`. Keep its structure (status fn, `_poster` getter, `_downloadPct` getter, badge + progress-bar, `poster-click` event) but make these exact changes:
  - Element `radarr-movie-poster` → `whisparr-scene-poster`; class `RadarrMoviePoster` → `WhisparrScenePoster`; property `movie: Movie` → `scene: Scene` (import `Scene` from `../types.js`); all `this.movie` → `this.scene`.
  - **Poster art is horizontal:** change `.wrap` `aspect-ratio: 2 / 3` → `aspect-ratio: 16 / 9`.
  - **Image source:** scenes have no `poster` coverType; use the first available image: `this.scene.images?.find(i => i.coverType === 'screenshot' || i.coverType === 'fanart' || i.coverType === 'poster')?.remoteUrl ?? this.scene.images?.[0]?.remoteUrl ?? ''`.
  - **Status fn** uses Scene fields: `if (scene.inQueue && !scene.hasFile) return 'downloading'; if (scene.hasFile) return 'available'; if (scene.monitored) return 'missing'; return 'unmonitored';` Badge labels/colors: available→`FILE` green, missing→`MISSING` orange, downloading→`%` blue (show `${_downloadPct}%`), unmonitored→grey. Keep the badge element; for downloading show the percentage as the badge text.
  - **Add a footer below the image** (inside `.wrap` is fine, or as a sibling block): show `this.scene.title` (one line, ellipsis) and a sub-line with `this.scene.studioTitle ?? ''` on the left and the date on the right. Date = `(_release(scene)).slice(0,10)` where `_release` returns the first of `digitalRelease`/`releaseDate`/`added` that is set. Use small, secondary-colored text and the `--rc-*` tokens.
  - **Monitored dot:** if `!scene.monitored`, render a small muted dot top-left; otherwise an accent dot. (Mirror the mockup; keep it subtle.)
  - Keep the `progress-bar`/`progress-fill` when `scene.queueItem` exists.

- [ ] **Step 2: scene-grid.ts** — adapt `/home/devin/projects/radarr-card/src/components/movie-grid.ts`:
  - Element `radarr-movie-grid` → `whisparr-scene-grid`; class → `WhisparrSceneGrid`; property `movies: Movie[]` → `scenes: Scene[]`; `selectedMovieId` → `selectedSceneId`; child `radarr-movie-poster` → `whisparr-scene-poster` with `.scene=${s}`.
  - Default `columns = 2`. In `render`, clamp: `const cols = Math.min(3, Math.max(2, this.columns || 2));` and use `repeat(${cols},1fr)`.
  - Empty state text: `No scenes found`.

- [ ] **Step 3: build** — `npm run build` exits 0. Commit:
```bash
git add src/components/scene-poster.ts src/components/scene-grid.ts
git commit -m "feat(card): add horizontal scene poster and grid"
```

---

## Task 5: scene-detail (flat scene panel)

**Files:** Create `src/components/scene-detail.ts`.
**Interfaces produced:** `<whisparr-scene-detail open .scene .qualityProfiles .rootFolders .showQuality .showFileInfo>` emitting `add-scene` (detail `{ scene, qualityProfileId, rootFolder, monitored, searchOnAdd }`), `delete-scene` (detail = Scene), `toggle-monitored` (detail `{ scene, monitored }`), `search-now` (detail `{ scene }`); public method `addComplete(err?: string)` to reset the add-form busy state.

- [ ] **Step 1: port the panel** — adapt `/home/devin/projects/radarr-card/src/components/movie-detail.ts`. Read it fully, then produce the whisparr equivalent with these exact changes:
  - Element `radarr-movie-detail` → `whisparr-scene-detail`; class `RadarrMovieDetail` → `WhisparrSceneDetail`; type `Movie` → `Scene`; all `movie` → `scene`.
  - **In-library scene** view shows: title, studio (`scene.studioTitle`), release date, file status. File info (when `scene.hasFile`): quality `scene.movieFile?.quality?.quality?.name` and size `scene.movieFile?.size` (format bytes → GB). Controls: a **Monitored** toggle (emits `toggle-monitored` `{ scene, monitored: !scene.monitored }`), a **Search** button (emits `search-now` `{ scene }`), and a **Delete** button (emits `delete-scene` = scene). Download progress when `scene.queueItem` (reuse the radarr percent logic).
  - **Lookup (not-in-library) scene** view (`scene.inLibrary === false`): the add-form — quality profile `<select>` (from `qualityProfiles`), root folder `<select>` (from `rootFolders`), a "Monitored" checkbox (default true), a "Search on add" checkbox (default true), and an **Add** button that emits `add-scene` with `{ scene, qualityProfileId, rootFolder, monitored, searchOnAdd }` and enters a busy state until `addComplete()` is called. (Radarr's detail has the analogous add-form keyed on tmdbId; here key on `scene.foreignId`. Radarr has no monitor-scope selector — scenes are single items — so do NOT add one.)
  - Keep the radarr `--rc-*` styling and layout idiom. Drop any movie-only concept that has no scene analog (e.g. there are no seasons here).

- [ ] **Step 2: build** — `npm run build` exits 0. Commit:
```bash
git add src/components/scene-detail.ts
git commit -m "feat(card): add scene detail panel"
```

---

## Task 6: parent-poster + parent-detail (studios & performers)

**Files:** Create `src/components/parent-poster.ts`, `src/components/parent-detail.ts`.
**Interfaces produced:**
- `<whisparr-parent-poster .parent .kind .selected .radius>` emitting `poster-click` (detail = Parent).
- `<whisparr-parent-detail open .parent .kind .scenes .loading .qualityProfiles .rootFolders .showQuality .showFileInfo>` emitting: `toggle-monitored` `{ kind, item, monitored }` (parent-level), `search-now` `{ kind, item }` (parent-level "Search all"), `delete-parent` (detail = Parent), `scene-toggle-monitored` `{ scene, monitored }` (per-scene), `scene-search` `{ scene }` (per-scene), and `add-parent` `{ parent, qualityProfileId, rootFolder, monitored, searchOnAdd }` for lookup results; public `addComplete(err?)`. The card supplies `.scenes` (fetched via `getParentScenes`) and toggles `.loading`.

- [ ] **Step 1: parent-poster.ts** — adapt `/home/devin/projects/sonarr-card/src/components/series-poster.ts`:
  - Element `sonarr-series-poster` → `whisparr-parent-poster`; class → `WhisparrParentPoster`; property `series: Series` → `parent: Parent`; add `@property() kind: ParentKind = 'studio'`.
  - **Artwork:** for `kind === 'performer'` use a portrait (`aspect-ratio: 2/3`) headshot image (`coverType` `headshot`/`poster`/first image); for studios use a landscape logo tile (`aspect-ratio: 16/7`, `coverType` `logo`/`fanart`/first image). If no image, render a placeholder block with the name centered.
  - **Footer:** `parent.displayName` (bold) and a sub-line `${parent.sceneCount ?? 0} scenes` left, `${parent.missingCount ?? 0} missing` right (color the missing count with the accent/warning token when > 0).
  - **Monitored dot** top-left (accent when monitored, muted otherwise). Keep `poster-click` emitting the parent. Keep the selected-border + hover styles.

- [ ] **Step 2: parent-detail.ts** — adapt `/home/devin/projects/sonarr-card/src/components/series-detail.ts` (read it fully; it renders series info + an add-form + per-SEASON rows with monitor/search). Produce the whisparr equivalent with these changes:
  - Element `sonarr-series-detail` → `whisparr-parent-detail`; class → `WhisparrParentDetail`; type `Series` → `Parent`; add `@property() kind: ParentKind`.
  - **In-library parent** view = the hero + rows layout from the mockup:
    - Hero: `parent.displayName`, a stat line `${sceneCount} scenes · <downloaded> downloaded · ${missingCount} missing · ${monitored ? 'monitored' : 'unmonitored'}`, a **Monitored** toggle (emits `toggle-monitored` `{ kind, item: parent, monitored: !parent.monitored }`), and a **Search all** button (emits `search-now` `{ kind, item: parent }`), and a **Delete** button (emits `delete-parent` = parent).
    - Below the hero, render the parent's **scenes as rows** (this replaces sonarr's season list). The card passes `.scenes` (already fetched). Each row: a small 16/9 thumbnail (first image), the title, a sub-line `date · quality · size` (or "downloading NN%" / "not downloaded"), a status pill (FILE / MISSING / %), a per-scene **monitor toggle** (●/○, emits `scene-toggle-monitored` `{ scene, monitored: !scene.monitored }`), and a per-scene **search** button (emits `scene-search` `{ scene }`). Show a "Loading…" line when `.loading`. Mirror sonarr's per-season row markup/handlers, retargeted from season→scene and the events renamed as above.
  - **Lookup (not-in-library) parent** view (`parent.inLibrary === false`): an add-form (quality profile, root folder, monitored checkbox default true, search-on-add checkbox default true, Add button) emitting `add-parent` and entering busy until `addComplete()`. (Mirror sonarr's add-form but DROP the monitor-scope `<select>` — there is no season-scope concept; a single `searchOnAdd` boolean replaces it.)
  - Keep the sonarr `--rc-*` styling.

- [ ] **Step 3: build** — `npm run build` exits 0. Commit:
```bash
git add src/components/parent-poster.ts src/components/parent-detail.ts
git commit -m "feat(card): add parent (studio/performer) poster and detail"
```

---

## Task 7: main card (`src/card.ts`) — tab switch + both views

**Files:** Replace `src/card.ts` (the Task 1 stub).
**Interfaces consumed:** all components (Tasks 3–6) + the API client (Task 2).

This is the integration task. Use `/home/devin/projects/sonarr-card/src/card.ts` as the structural template (state, `getConfigElement`/`getStubConfig`, `setConfig` with defaults, `updated` theming + first-load, `_loadData`, client-side filtering, search-with-live-lookup, `_renderGrid` with inline detail, the dialog "view all", the `--rc-*` styles block, the `customCards` registration), adapted as follows. Read that file fully first.

- [ ] **Step 1: write card.ts**. Required adaptations from the sonarr template:
  - Element `sonarr-hacs-card` → `whisparr-hacs-card`; class → `WhisparrHacsCard`; `DOMAIN = 'whisparr_hacs'`; editor element `whisparr-hacs-card-editor`; imports point at the whisparr components + `whisparr-api.js`; `customCards.push` uses type `whisparr-hacs-card`, name `Whisparr Card`, description "Browse and manage your Whisparr scenes, studios, and performers", documentationURL `https://github.com/devshm3/whisparr-card`.
  - **Tab state:** add `@state() private _view: View` initialized from `_config.default_view ?? 'scenes'`. Render `<whisparr-tab-bar .active=${this._view} .showStudios=${cfg.show_studios_tab !== false} .showPerformers=${cfg.show_performers_tab !== false} @view-change=${e => this._onViewChange(e.detail)}>` above the filter chips. `_onViewChange` sets `_view`, clears selection/search, and loads that view's data.
  - **setConfig defaults:** `{ default_view: 'scenes', show_studios_tab: true, show_performers_tab: true, columns: 2, default_sort: 'added', default_filter: 'all', show_status_badges: true, poster_radius: 8, page_size: 25, show_quality: true, show_file_info: true, show_filter_counts: true, show_refresh_button: true, ...config }`. Clamp `columns` into [2,3] wherever used.
  - **Scenes view** (`_view === 'scenes'`): mirror the sonarr flat flow but with scenes — state `_scenes`/`_filteredScenes`/`_selectedScene`; `getScenes` for the library; client-side filter via a `_matchesFilter(scene,key)` using Scene fields (`available`, `monitored`, `inQueue`/`hasFile` for downloading, `!monitored`); filter chips with counts; search box that filters the library and, on empty results, falls back to `lookupScene` (the "Search Whisparr →" affordance, replacing "Search TVDB"); render `whisparr-scene-grid` + inline `whisparr-scene-detail`; wire `add-scene`→`addScene`, `delete-scene`→`deleteItem('scene')`, `toggle-monitored`→`setMonitored('scene', scene.id, monitored)`, `search-now`→`triggerSearch('scene', scene.id)`. Sort control offering Added/Released/Title that re-calls `getScenes` with the chosen `sort` (default from config).
  - **Studios / Performers views** (`_view === 'studios' | 'performers'`, kind = `studio`|`performer`): use `getParents(kind)` for the grid (no filter chips needed — parents only sort by Added/Title; render a small sort toggle and a search box that filters parents and falls back to `lookupParent`). Render a grid of `whisparr-parent-poster .kind=${kind}`; on poster click, open the selected parent and call `getParentScenes(kind, parent.id)` into a `_parentScenes` state (set `_parentLoading` while fetching), rendering `whisparr-parent-detail .kind=${kind} .parent=${selected} .scenes=${_parentScenes} .loading=${_parentLoading}`. Wire: `toggle-monitored`→`setMonitored(kind, parent.id, monitored)` then reload parents + parent scenes; `search-now`→`triggerSearch(kind, parent.id)`; `delete-parent`→`deleteItem(kind, parent.id)`; `scene-toggle-monitored`→`setMonitored('scene', scene.id, monitored)` then reload parent scenes; `scene-search`→`triggerSearch('scene', scene.id)`; `add-parent`→`addParent(kind, …)`.
  - **getCardSize / getGridOptions:** keep the sonarr implementations (adjust the default columns to 2).
  - **Theming + dialog + states:** keep the sonarr `--rc-*` styles block and the loading/error/empty handling. The "view all" dialog applies to whichever grid is active (scenes or parents) — reuse the pattern, parameterized by the active view.
  - Keep DRY: the scene-rendering helper and parent-rendering helper should be separate methods; do not duplicate the grid+detail block across the main view and the dialog beyond what the sonarr template already does.

- [ ] **Step 2: build** — `npm run build` exits 0 (this is the big typecheck; fix any type errors against the interfaces above). Commit:
```bash
git add src/card.ts
git commit -m "feat(card): implement three-tab card (scenes, studios, performers)"
```

---

## Task 8: visual editor (`src/editor.ts`)

**Files:** Create `src/editor.ts`.

- [ ] **Step 1: port the editor** — adapt `/home/devin/projects/sonarr-card/src/editor.ts` (read it fully). Keep its structure (a `whisparr-hacs-card-editor` LitElement with `setConfig`, value-changed events writing back to config, the `--rc`-styled fields). Element `sonarr-hacs-card-editor` → `whisparr-hacs-card-editor`; class → `WhisparrHacsCardEditor`. Fields to expose (each with a default matching `setConfig`): `entry_id` (text), `card_title` (text), `default_view` (select: scenes/studios/performers), `show_studios_tab` (boolean), `show_performers_tab` (boolean), `columns` (number, min 2 max 3), `default_sort` (select: added/released/title), `appearance` (select: glass/material), and the existing display toggles (`show_status_badges`, `show_filter_counts`, `show_refresh_button`, `show_quality`, `show_file_info`, `page_size`, `poster_radius`). Drop any sonarr-only field that has no whisparr analog; do NOT invent new ones beyond `CardConfig`.

- [ ] **Step 2: build** — `npm run build` exits 0. Commit:
```bash
git add src/editor.ts
git commit -m "feat(card): add visual editor"
```

---

## Task 9: build artifact + ship

**Files:** `custom_components/whisparr_hacs/www/whisparr-hacs-card.js` (built), confirm `custom_components/whisparr_hacs/__init__.py` `_CARD_VERSION`.

- [ ] **Step 1: clean build**
Run: `npm run build`
Expected: exits 0; `custom_components/whisparr_hacs/www/whisparr-hacs-card.js` regenerated, non-empty, and is a single ES module (terser-minified). Sanity-check it defines the custom element: `grep -c "whisparr-hacs-card" custom_components/whisparr_hacs/www/whisparr-hacs-card.js` returns ≥ 1.

- [ ] **Step 2: confirm card version**
`_CARD_VERSION` in `__init__.py` is `"1"`. Since this is the first time the JS actually ships, leave it at `"1"` (no prior cached version exists). Add a one-line comment above it noting to bump on every subsequent rebuilt-card ship. If you change it, the resource URL cache-buster updates automatically.

- [ ] **Step 3: commit the built artifact**
```bash
git add custom_components/whisparr_hacs/www/whisparr-hacs-card.js custom_components/whisparr_hacs/__init__.py
git commit -m "build(card): compile and ship whisparr-hacs-card.js"
```

- [ ] **Step 4: full backend suite still green** (the JS file existing must not affect Python tests)
Run: `python3 -m pytest -q`
Expected: 63 passed.

---

## Self-Review (completed during planning)

- **Spec coverage:** three tabs + default_view + tab hiding (Tasks 7/8/1-config), horizontal 2–3-col scenes grid with clamp (Task 4/7), scene sort added/released/title (Tasks 2/7/8), filter chips (Task 3/7), scene detail with file info + monitor/search/delete + add-form (Task 5), studios+performers as one parameterized parent path (Tasks 6/7), parent grid tiles with counts + monitored (Task 6), parent detail with Monitored + Search all + scene rows with per-scene monitor/search (Task 6), live lookup for scenes + parents (Tasks 2/7), theming via `--rc-*` glass/material (Tasks 4–8 copy sibling tokens), API-key never touched by card (Task 2 uses entry_id only), build → committed `www/whisparr-hacs-card.js` + `_CARD_VERSION` (Task 9). Backend contract consumed exactly as Plan 1 defined it.
- **Placeholder scan:** new/small units (scaffold, types, api client, tab-bar) have complete code; the large mirror components (scene/parent detail, card, editor) give the exact sibling source path to port plus the enumerated, concrete adaptations and full interface/event contracts — concrete transformation instructions against real reference files, not vague TODOs. No "implement error handling"-style placeholders.
- **Type/interface consistency:** the API client signatures (Task 2) match the events/props the components emit/consume (Tasks 4–6) and the card wires (Task 7): `kind` is `'studio'|'performer'` for parents and `'scene'|'studio'|'performer'` for `setMonitored`/`triggerSearch`/`deleteItem`; `Scene`/`Parent` fields used in posters/details exist in `types.ts` (Task 1); event names (`poster-click`, `view-change`, `filter-change`, `add-scene`, `delete-scene`, `toggle-monitored`, `search-now`, `add-parent`, `delete-parent`, `scene-toggle-monitored`, `scene-search`) are defined where emitted and handled in the card.

## Notes for execution

- No JS test framework (matches siblings); the per-task gate is `npm run build` (typecheck + bundle). The real functional gate is the user's manual HA test after Task 9.
- `node_modules/` and the build are already git-ignored except the final `www/*.js` artifact, which is intentionally committed in Task 9.
- The Whisparr v3 field-name caveat (Plan 1) still applies: if a live instance reveals different field names, fix `types.ts` + the poster image/coverType selectors here alongside the backend.
```
