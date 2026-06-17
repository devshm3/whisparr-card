# Whisparr Home Assistant Card — Design

**Date:** 2026-06-17
**Status:** Approved (design); pending implementation plan

## Summary

A Home Assistant HACS integration (`whisparr_hacs`) that exposes **Whisparr v3** control from a single Lovelace card `<whisparr-hacs-card>`. It is a deliberate port of the two sibling projects in adjacent directories — `radarr-card` (flat movie model) and `sonarr-card` (monitored-parent model) — and must stay near-identical to them in look, feel, build, and backend structure so a user running all three keeps a consistent dashboard.

Whisparr is a hybrid of the two because it has three entity types to manage:

- **Scenes** — individual items with a file and download state (radarr-like, flat).
- **Studios** — monitored parents that own scenes (sonarr-like).
- **Performers** — monitored parents that own scenes (same pattern as studios).

The card surfaces all three in one card via a three-tab switch, defaulting to Scenes.

## Goals

- Browse scenes, studios, and performers from one card; search Whisparr and add new ones.
- Monitor/unmonitor at parent (studio/performer) and individual-scene granularity.
- Trigger searches/downloads and delete, matching the siblings' write-action parity.
- Default scene ordering by **recency** (most recently added), not Whisparr's alphabetical default.

## Non-goals

- No exposure of the API key to the browser, ever.
- No second/standalone card now (single card with tabs; splitting later is cheap because components are shared).
- No multi-instance-in-one-card; one config entry = one Whisparr instance = one card.

## Whisparr v3 API model

Whisparr v3 is a Radarr-v3 fork (`/api/v3` base, `X-Api-Key` header). Relevant resources:

| Card concept | Whisparr v3 endpoint(s) | Sibling analog |
|---|---|---|
| Scene | `/api/v3/movie`, `/api/v3/movie/lookup` | Radarr movie (flat, `hasFile`) |
| Studio | `/api/v3/studio` (+ lookup), add via add-studio service | Sonarr series (monitored parent → children) |
| Performer | `/api/v3/performer` (+ lookup) | Same parent pattern as studio |
| Quality profiles | `/api/v3/qualityprofile` | identical |
| Root folders | `/api/v3/rootfolder` | identical |
| Queue (downloads) | `/api/v3/queue` | identical |
| Commands (search) | `/api/v3/command` | identical |
| Connection test | `/api/v3/system/status` | identical |

**Studios and performers are structurally identical** — a monitored parent that owns scenes. The backend and card therefore treat them through one **parameterized "monitored-parent" path** (same WS command shape, same services, same detail component), differing only by endpoint and artwork shape (studio logo vs performer headshot).

**Scene→parent linkage:** scenes (movies) reference their studio/performer via a field on the movie object. The exact field names, the add-payload shape, the lookup/search endpoints, and the search-command names **must be verified against the running Whisparr v3 instance before writing `api.py`** — Whisparr's API has diverged from both Radarr and the auto-generated SDKs (e.g. the `devopsarr/whisparr-py` SDK does not yet expose studio/performer). Do not assume Radarr field names. (Tracked: implementation Task — verify API fields.)

## Architecture — data-flow contract (identical to siblings; preserve)

- **Reads** (card → backend): the card calls `hass.connection.sendMessagePromise()` against custom WebSocket commands in `websocket_api.py`. Handlers serve the **coordinator's cached poll data** — they do not call Whisparr. Filtering, sorting, and in-library search happen server-side over the cache.
- **Live lookup** (adding new content): dedicated lookup WS commands (scene / studio / performer) are the only read paths that hit Whisparr directly.
- **Writes**: card → `hass.callService()` → `services.py` → `api.py` → Whisparr, then `coordinator.async_request_refresh()` so the next read reflects the change.
- The API key lives only in the HA config entry; never sent to the browser.
- One config entry = one instance = one card, keyed by `entry_id`. The card auto-detects the entry via `config_entries/get`.
- Card JS is registered into the Lovelace resource collection (storage mode) at startup with a `?v=N` cache-buster from a `_CARD_VERSION` constant in `__init__.py`. Bump it on every rebuilt card ship. (This is the siblings' current approach; an older `add_extra_js_url` method is stale — follow the code in the sibling `__init__.py`.)

## Coordinator data

The `DataUpdateCoordinator` polls every 30s and caches: `movies` (scenes), `studios`, `performers`, `queue`, `quality_profiles`, `root_folders`. Availability/missing/downloading state for scenes is derived from `hasFile` + queue membership (radarr-style); parent-level counts (scene count, missing, monitored) are derived by joining scenes to their parent.

## WebSocket commands

- `whisparr_hacs/get_scenes` — params: `entry_id`, optional `search`, `filter` (available|missing|downloading|unmonitored), `sort` (added|released|title). Returns scenes enriched with `inQueue`, `available`, `queueItem` (size/sizeleft/timeleft/status).
- `whisparr_hacs/get_parents` — params: `entry_id`, `kind` (studio|performer), optional `search`, `sort` (added|title). Returns parents enriched with scene count, missing count, monitored.
- `whisparr_hacs/get_parent_scenes` — params: `entry_id`, `kind`, parent id, optional `search`/`filter`/`sort`. Returns the parent's scenes (for the detail panel).
- `whisparr_hacs/lookup_scene` / `lookup_parent` (kind) — live Whisparr lookup for adding; results flagged `inLibrary`.
- `whisparr_hacs/get_config` — returns quality profiles + root folders for add dialogs.

(Command set mirrors sonarr/radarr; parents are parameterized by `kind` to avoid duplicating studio vs performer handlers.)

## Services (`services.yaml`, automatable; each refreshes the coordinator)

- `add_scene` — from a lookup result (+ quality profile, root folder, monitored, search-on-add).
- `add_studio` / `add_performer` — add monitored parent (+ quality profile, root folder, search-on-add).
- `set_monitored` — toggle monitored on any entity: scene, studio, performer (parent toggle updates the parent; per-scene toggle updates the movie).
- `search` — trigger a download search: per-scene, studio-wide, or performer-wide (maps to the corresponding Whisparr command).
- `delete` — delete a scene/studio/performer, optional `delete_files`. Idempotent (treat 404 as success).

## Sensors (per config entry)

Total Scenes · Missing Scenes · Downloading · Total Studios · Total Performers. (Mirrors the siblings' summary-sensor pattern.)

## Card UI

**Structure:** one `<whisparr-hacs-card>` with a three-tab switch — **Scenes (default)** · Studios · Performers. Card config options: auto `entry_id`, `default_view`, visible-tabs toggles, scene `columns`/density, default scene sort. Every option has a default in `setConfig()` and a field in the visual editor.

**Scenes tab:**
- Horizontal "long poster" grid, **2–3 per row** — default 2, minimum 2 (incl. mobile), maximum 3; column count configurable (auto-fit by target poster width, clamped to 2–3).
- Toolbar: search + sort control (**Added** default, Released, Title).
- Filter chips: All / Available / Missing / Downloading / Unmonitored.
- Poster overlays: status badge (FILE / MISSING / download %), monitored dot, download progress bar on in-progress items; title, studio name, date.
- Tap → scene detail: file/quality/size, monitor toggle, search, delete.

**Studios & Performers tabs (shared component, parameterized by kind):**
- Parent grid, 2–3 per row: artwork (studio logo / performer headshot) + monitored dot + name + scene count + missing count.
- Sort: **Added** default + Title.
- Tap → detail panel:
  - Hero: parent name, stats (scene count · downloaded · missing · monitored), parent-level **Monitored** toggle + **Search all** button.
  - Toolbar: filter scenes + sort.
  - **Scene rows (Style A):** thumbnail · title · (date · quality · size / download state) · status pill (FILE / MISSING / %) · per-scene monitor toggle (●/○) + per-scene search (⟳).

**Theming:** styles to HA CSS variables (`--card-background-color`, `--primary-color`, `--primary-text-color`, `--ha-card-border-radius`, …) aliased into local `--rc-*` custom properties, glassmorphism default; no hardcoded colors that break theming.

## Repository layout (mirror the siblings)

```
custom_components/whisparr_hacs/
  __init__.py            # static path, Lovelace resource registration (_CARD_VERSION), WS + services
  manifest.json          # domain whisparr_hacs, config_flow: true, iot_class local_polling
  config_flow.py         # host + api_key + name; verify via /system/status
  const.py               # DOMAIN, DEFAULT_POLL_INTERVAL
  api.py                 # async aiohttp Whisparr v3 client (/api/v3, X-Api-Key)
  coordinator.py         # DataUpdateCoordinator (30s); caches scenes/studios/performers/queue/profiles/folders
  websocket_api.py       # custom WS read commands (serve cache; parameterized parents)
  services.py            # write actions; each refreshes coordinator
  sensor.py              # summary sensors
  services.yaml, strings.json, translations/en.json
  www/whisparr-hacs-card.js   # compiled card (committed)
src/
  card.ts                # <whisparr-hacs-card> + tab switch + customCards registration
  editor.ts              # visual editor
  whisparr-api.ts        # WS reads via hass.connection, writes via hass.callService
  types.ts, ha-types.ts
  components/            # scene grid + poster + scene detail; parent grid + parent detail (scene rows); filter chips; tab bar
tests/                   # one file per backend module (aioresponses-mocked)
rollup.config.js, tsconfig.json, package.json, hacs.json, pytest.ini, conftest.py
```

## Naming conventions

Domain `whisparr_hacs`; card element `whisparr-hacs-card`; WS prefix `whisparr_hacs/...`; classes `Whisparr*`; card JS `whisparr-hacs-card.js`. Keep filenames parallel to the siblings so the repos stay diffable.

## Testing

pytest + `pytest-homeassistant-custom-component` (`asyncio_mode=auto`), one test file per backend module (`test_api`, `test_coordinator`, `test_websocket_api`, `test_services`, `test_sensor`, `test_config_flow`, `test_init`); `aioresponses` mocks the Whisparr HTTP API. Root `conftest.py` appends this repo's `custom_components/` onto the package path (as in siblings). Frontend bundled with Rollup → committed `www/whisparr-hacs-card.js`; rebuild + commit after any `src/` change and bump `_CARD_VERSION`.

## Decisions log

- Studio/performer model: first-class Whisparr v3 entities (`/api/v3/studio`, `/api/v3/performer`), not Collections.
- Card structure: one card, three tabs, default Scenes; config for default view + tab visibility.
- Scene sort: default Added; offer Added / Released / Title.
- Scene grid: 2–3 per row, default 2, min 2, max 3, configurable density.
- Studio/performer detail: list scenes with per-scene monitor + search (Style A scene rows).
- Studio/performer sort: default Added + Title (no Released — parents lack a single release date).
- Performers in scope now (third tab), sharing the studio component.
- Full write parity with siblings: add, delete, toggle monitored, trigger search.

## Open items (resolve at implementation time)

- Verify exact Whisparr v3 field/endpoint names against a running instance before writing `api.py`: studio/performer payload + lookup endpoints, scene→parent reference field, add-payload shape, and search-command names.
- Confirm performer artwork aspect (headshot/portrait) vs studio logo handling in the shared parent grid.
```
