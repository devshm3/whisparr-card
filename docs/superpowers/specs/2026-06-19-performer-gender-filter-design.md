# Performer gender filter — design

**Date:** 2026-06-19
**Status:** Approved

## Goal

Let a user hide performers of a given gender from the Performers tab via a
persistent card option.

## Data model (verified)

Whisparr's `Gender` enum (`src/NzbDrone.Core/Tv/Actor.cs`) is `Female | Male |
Other`, serialized as a string by the Servarr API. Each performer resource is
expected to carry a top-level `gender` string. This was confirmed from source,
not a live instance, so the filter degrades gracefully: a performer with a
missing/unrecognized gender is treated as not-female and not-male.

## Behavior

New card option `performer_gender`: `'all'` (default) · `'female'` · `'male'`.

- `all` — show every performer (no change from today).
- `female` — show only performers whose `gender == "Female"` (case-insensitive).
- `male` — show only `gender == "Male"`.
- `Other`, unknown, or missing gender → shown only under `all`; hidden whenever
  `female` or `male` is selected.

Scope: applies to the **Performers library grid only** (the `get_parents` read
path). It does **not** filter live "Search Whisparr" lookup results (searching
by name should never hide a hit). Studios are unaffected.

Edge case accepted: if the instance returns no gender data, selecting
`female`/`male` yields an empty Performers grid — an acceptable signal the data
is absent. Default `all` keeps the feature opt-in.

## Architecture (mirrors the existing server-side filtering contract)

### Backend — `custom_components/whisparr_hacs/websocket_api.py`
- `ws_get_parents` schema gains `vol.Optional("gender"): vol.In(["all",
  "female", "male"])`.
- `_build_parents_result` filters performers by `gender` when the value is
  `female`/`male` (case-insensitive match on `p.get("gender")`). No effect when
  `kind == "studio"` or when the value is `all`/absent.

### Frontend
- `types.ts` — `CardConfig.performer_gender?: 'all' | 'female' | 'male'`;
  `Parent.gender?: string`.
- `card.ts` — default `performer_gender: 'all'` in `setConfig`; pass it to
  `getParents` when `_activeKind === 'performer'`.
- `whisparr-api.ts` — `getParents` opts gains `gender?: string`, added to the WS
  message when present.
- `editor.ts` — a "Performers to show" dropdown (All / Female only / Male only).

### Tests — `tests/test_websocket_api.py`, `tests/conftest.py`
- Add `gender` to `MOCK_PERFORMER` (Female).
- New tests: `gender=female`/`male`/`all` filter the performer list correctly;
  studios are untouched by the param; Other/unknown excluded under female/male.

## Out of scope
- Filtering scenes by performer gender.
- Live lookup/add-search filtering.
- Any studio-side gender concept (studios have none).
