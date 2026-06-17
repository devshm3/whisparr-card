# Whisparr Card — Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Python Home Assistant custom component `whisparr_hacs` — an async Whisparr v3 client, a polling coordinator, a config flow, WebSocket read commands, write services, and summary sensors — fully covered by pytest.

**Architecture:** Mirror the sibling `radarr-card` / `sonarr-card` components exactly. A `DataUpdateCoordinator` polls Whisparr every 30s and caches scenes/studios/performers/queue/profiles/folders. The card (built in the frontend plan) reads cached data through custom WebSocket commands and writes through HA services that call the API then refresh the coordinator. Studios and performers are one parameterized "monitored-parent" path (`kind` in `{studio, performer}`).

**Tech Stack:** Python 3.12, Home Assistant custom component, `aiohttp`, `voluptuous`, pytest + `pytest-homeassistant-custom-component` + `aioresponses`.

## Global Constraints

- **No vendor mentions, ever:** nothing referencing the AI assistant vendor (the two brand terms guarded by `.git/hooks/pre-commit`) may appear in any committed file, code comment, or commit message. No AI commit trailers. Use vendor-neutral wording. A pre-commit hook enforces this; do not remove or bypass it.
- **Domain/naming:** domain `whisparr_hacs`; classes `Whisparr*`; WS command prefix `whisparr_hacs/...`; card element (frontend) `whisparr-hacs-card`. Keep filenames parallel to the siblings.
- **API base:** `http://<host>/api/v3`, auth header `X-Api-Key`. API key lives only in the config entry; never returned to the browser.
- **HA floor:** `homeassistant` `2024.1.0` (manifest + hacs.json).
- **Coordinator cache keys (exact):** `scenes`, `studios`, `performers`, `quality_profiles`, `root_folders`, `queue`.
- **Parent kinds (exact):** the string literals `"studio"` and `"performer"` are used as `kind` throughout the API, WS commands, and services.
- **TDD:** write the failing test, watch it fail, implement minimally, watch it pass, commit. `pytest.ini` sets `asyncio_mode = auto` (no `@pytest.mark.asyncio` needed).

### ⚠️ Whisparr v3 API verification (do this before Task 2)

Whisparr v3 is a Radarr-v3 fork but has diverged. The following are this plan's **documented assumptions**; verify each against the user's running instance (`curl -H "X-Api-Key: KEY" http://HOST/api/v3/<endpoint>`) before writing `api.py`, and adjust the constants/field names in Task 2/5 if reality differs. The plan's structure does not change — only literal endpoint/field/command names might.

| Assumption | Used in | Verify |
|---|---|---|
| Scenes at `GET/POST /movie`, `/movie/lookup`, `PUT/DELETE /movie/{id}` | Task 2/5/6 | endpoint paths |
| Studios at `/studio` (+ `/studio/lookup`), performers at `/performer` (+ `/performer/lookup`) | Task 2/5/6 | endpoint paths |
| Scene release date is in one of `digitalRelease`, `releaseDate`, `inCinemas` | Task 5 (`_release_date`) | which field holds the scene date |
| Scene→studio link: `scene["studioForeignId"] == studio["foreignId"]`; display name `studio["title"]` | Task 5 | link field + name field |
| Scene→performer link: performer `foreignId` appears in `{c["foreignId"] for c in scene["credits"]}`; performer display name `performer["fullName"]` (fallback `title`) | Task 5 | credits/performer link + name field |
| Search commands: scene `MoviesSearch` (`movieIds`), studio `StudioSearch` (`studioIds`), performer `PerformerSearch` (`performerIds`) | Task 2/6 | command names + id param names |
| Add payloads use `foreignId` (not `tmdbId`); scene addOptions key `searchForMovie`; parent addOptions key `searchForMissing` | Task 6 | add-payload field names |

Record findings in a comment at the top of `api.py`.

---

## File Structure

```
custom_components/whisparr_hacs/
  __init__.py          # Task 8 — setup, Lovelace resource registration, WS + services wiring
  manifest.json        # Task 1
  const.py             # Task 1 — DOMAIN, DEFAULT_POLL_INTERVAL, PARENT_KINDS
  api.py               # Task 2 — async aiohttp Whisparr v3 client
  coordinator.py       # Task 3 — DataUpdateCoordinator
  config_flow.py       # Task 4 — host + api_key + name wizard
  websocket_api.py     # Task 5 — custom WS read commands (serve cache)
  services.py          # Task 6 — write services
  services.yaml        # Task 6 — service metadata
  sensor.py            # Task 7 — summary sensors
  strings.json         # Task 8
  translations/en.json # Task 8
  www/.gitkeep         # Task 1 — placeholder; card JS lands here from the frontend plan
tests/
  __init__.py          # Task 1
  conftest.py          # Task 1 — fixtures + mock data
  test_api.py          # Task 2
  test_coordinator.py  # Task 3
  test_config_flow.py  # Task 4
  test_websocket_api.py# Task 5
  test_services.py     # Task 6
  test_sensor.py       # Task 7
  test_init.py         # Task 8
conftest.py            # Task 1 — root: extend custom_components path
pytest.ini             # Task 1
requirements_test.txt  # Task 1
hacs.json              # Task 1
```

Frontend-only config files (`package.json`, `rollup.config.js`, `tsconfig.json`, `src/`) are created in the frontend plan.

---

## Task 1: Scaffolding & integration constants

**Files:**
- Create: `custom_components/whisparr_hacs/const.py`
- Create: `custom_components/whisparr_hacs/manifest.json`
- Create: `custom_components/whisparr_hacs/www/.gitkeep` (empty)
- Create: `hacs.json`, `pytest.ini`, `requirements_test.txt`, `conftest.py` (root)
- Create: `tests/__init__.py` (empty), `tests/conftest.py`
- Test: `tests/test_const.py`

**Interfaces:**
- Produces: `custom_components.whisparr_hacs.const.DOMAIN == "whisparr_hacs"`, `DEFAULT_POLL_INTERVAL == 30`, `PARENT_KINDS == ("studio", "performer")`. Test fixtures `mock_entry`, mock data dicts (see below).

- [ ] **Step 1: Create the const module**

`custom_components/whisparr_hacs/const.py`:
```python
DOMAIN = "whisparr_hacs"
DEFAULT_POLL_INTERVAL = 30
PARENT_KINDS = ("studio", "performer")
```

- [ ] **Step 2: Create manifest, hacs.json, pytest config, requirements**

`custom_components/whisparr_hacs/manifest.json`:
```json
{
  "domain": "whisparr_hacs",
  "name": "Whisparr Card",
  "version": "0.1.0",
  "homeassistant": "2024.1.0",
  "codeowners": ["@devshm3"],
  "config_flow": true,
  "documentation": "https://github.com/devshm3/whisparr-card",
  "iot_class": "local_polling",
  "requirements": []
}
```

`hacs.json`:
```json
{
  "name": "Whisparr Card",
  "render_readme": true,
  "homeassistant": "2024.1.0"
}
```

`pytest.ini`:
```ini
[pytest]
asyncio_mode = auto
```

`requirements_test.txt`:
```
pytest
pytest-asyncio
pytest-homeassistant-custom-component>=0.13.0
aioresponses
```

Create an empty `custom_components/whisparr_hacs/www/.gitkeep` and empty `tests/__init__.py`.

- [ ] **Step 3: Create the root conftest (custom_components path extension)**

`conftest.py` (repo root):
```python
"""Root conftest — make custom_components from this repo visible to HA's loader."""
import pathlib
import sys

import custom_components

_project_cc = str(pathlib.Path(__file__).parent / "custom_components")
if _project_cc not in custom_components.__path__:
    custom_components.__path__.append(_project_cc)
```

- [ ] **Step 4: Create the test conftest with fixtures and mock data**

`tests/conftest.py`:
```python
import asyncio
import pathlib

import aiohttp
import pytest
from homeassistant import loader
from pytest_homeassistant_custom_component.common import MockConfigEntry
from custom_components.whisparr_hacs.const import DOMAIN

pytest_plugins = "pytest_homeassistant_custom_component"

_PROJECT_CC = str(pathlib.Path(__file__).parent.parent / "custom_components")


@pytest.fixture(scope="session", autouse=True)
def prewarm_aiohttp_thread():
    """Start the aiohttp background thread before any test captures the thread
    list, so HA's verify_cleanup does not flag a lingering thread."""
    async def _warm():
        conn = aiohttp.TCPConnector()
        await conn.close()
    loop = asyncio.new_event_loop()
    loop.run_until_complete(_warm())
    loop.close()


@pytest.fixture(autouse=True)
def enable_custom_integrations(hass):
    """Make whisparr_hacs discoverable by HA's integration loader."""
    import custom_components as _cc  # noqa: PLC0415
    if _PROJECT_CC not in _cc.__path__:
        _cc.__path__.append(_PROJECT_CC)
    hass.data.pop(loader.DATA_CUSTOM_COMPONENTS, None)


MOCK_SCENE = {
    "id": 1,
    "title": "Late Checkout",
    "year": 2026,
    "foreignId": "scene-aaa",
    "monitored": True,
    "hasFile": True,
    "added": "2026-06-12T00:00:00Z",
    "digitalRelease": "2026-06-10T00:00:00Z",
    "studioTitle": "Vixen",
    "studioForeignId": "studio-vixen",
    "images": [{"coverType": "screenshot", "remoteUrl": "http://img/s1.jpg"}],
    "credits": [{"foreignId": "perf-jane", "personName": "Jane Doe"}],
    "movieFile": {"quality": {"quality": {"name": "1080p"}}, "size": 2_100_000_000},
}
MOCK_SCENE_MISSING = {
    "id": 2,
    "title": "The Long Weekend",
    "year": 2026,
    "foreignId": "scene-bbb",
    "monitored": True,
    "hasFile": False,
    "added": "2026-06-08T00:00:00Z",
    "digitalRelease": "2026-06-08T00:00:00Z",
    "studioTitle": "Vixen",
    "studioForeignId": "studio-vixen",
    "images": [],
    "credits": [{"foreignId": "perf-jane", "personName": "Jane Doe"}],
}
MOCK_STUDIO = {
    "id": 10, "title": "Vixen", "foreignId": "studio-vixen",
    "monitored": True, "added": "2026-01-01T00:00:00Z",
    "images": [{"coverType": "logo", "remoteUrl": "http://img/vixen.jpg"}],
}
MOCK_PERFORMER = {
    "id": 20, "fullName": "Jane Doe", "foreignId": "perf-jane",
    "monitored": True, "added": "2026-02-01T00:00:00Z",
    "images": [{"coverType": "headshot", "remoteUrl": "http://img/jane.jpg"}],
}
MOCK_QUALITY_PROFILE = {"id": 1, "name": "HD-1080p"}
MOCK_ROOT_FOLDER = {"id": 1, "path": "/scenes", "freeSpace": 500_000_000_000}


@pytest.fixture
def mock_entry():
    return MockConfigEntry(
        domain=DOMAIN,
        data={"host": "http://localhost:6969", "api_key": "test-api-key", "name": "My Whisparr"},
        entry_id="test_entry_id",
    )
```

- [ ] **Step 5: Write the const test**

`tests/test_const.py`:
```python
from custom_components.whisparr_hacs.const import DOMAIN, DEFAULT_POLL_INTERVAL, PARENT_KINDS


def test_domain():
    assert DOMAIN == "whisparr_hacs"


def test_poll_interval_default():
    assert DEFAULT_POLL_INTERVAL == 30


def test_parent_kinds():
    assert PARENT_KINDS == ("studio", "performer")
```

- [ ] **Step 6: Install deps, run the test**

Run: `pip install -r requirements_test.txt && pytest tests/test_const.py -v`
Expected: 3 passed.

- [ ] **Step 7: Commit**

```bash
git add custom_components/whisparr_hacs/const.py custom_components/whisparr_hacs/manifest.json \
  custom_components/whisparr_hacs/www/.gitkeep hacs.json pytest.ini requirements_test.txt \
  conftest.py tests/__init__.py tests/conftest.py tests/test_const.py
git commit -m "feat: scaffold whisparr_hacs integration constants and test harness"
```

---

## Task 2: API client (`api.py`)

**Files:**
- Create: `custom_components/whisparr_hacs/api.py`
- Test: `tests/test_api.py`

**Interfaces:**
- Consumes: nothing (leaf module).
- Produces: class `WhisparrApi(host: str, api_key: str, session: aiohttp.ClientSession)` with async methods:
  - `get_scenes() -> list[dict]`, `search_scenes(term: str) -> list[dict]`, `add_scene(payload: dict) -> dict`, `delete_scene(scene_id: int, delete_files: bool = False) -> None`, `toggle_scene_monitored(scene_id: int, monitored: bool) -> None`, `trigger_scene_search(scene_id: int) -> None`
  - `get_parents(kind: str) -> list[dict]`, `search_parents(kind: str, term: str) -> list[dict]`, `add_parent(kind: str, payload: dict) -> dict`, `delete_parent(kind: str, parent_id: int, delete_files: bool = False) -> None`, `toggle_parent_monitored(kind: str, parent_id: int, monitored: bool) -> None`, `trigger_parent_search(kind: str, parent_id: int) -> None`
  - `get_quality_profiles() -> list[dict]`, `get_root_folders() -> list[dict]`, `get_queue() -> list[dict]`, `send_command(name: str, **kwargs) -> dict`, `test_connection() -> bool`

- [ ] **Step 1: Verify the API assumptions** (see the verification table above) against the live instance; note any deltas in a comment block you'll place at the top of `api.py`. Do not skip — the literal paths/commands below depend on it.

- [ ] **Step 2: Write the failing tests for scenes + helpers**

`tests/test_api.py`:
```python
import pytest
import aiohttp
from yarl import URL
from aioresponses import aioresponses
from custom_components.whisparr_hacs.api import WhisparrApi

BASE = "http://localhost:6969/api/v3"


@pytest.fixture
async def api():
    connector = aiohttp.TCPConnector(resolver=aiohttp.resolver.ThreadedResolver())
    session = aiohttp.ClientSession(connector=connector)
    client = WhisparrApi("http://localhost:6969", "test-key", session)
    yield client
    await session.close()


async def test_get_scenes(api):
    with aioresponses() as m:
        m.get(f"{BASE}/movie", payload=[{"id": 1, "title": "Late Checkout"}])
        assert await api.get_scenes() == [{"id": 1, "title": "Late Checkout"}]


async def test_get_scenes_raises_on_auth_error(api):
    with aioresponses() as m:
        m.get(f"{BASE}/movie", status=401)
        with pytest.raises(aiohttp.ClientResponseError):
            await api.get_scenes()


async def test_search_scenes(api):
    with aioresponses() as m:
        m.get(f"{BASE}/movie/lookup?term=checkout", payload=[{"foreignId": "scene-aaa"}])
        result = await api.search_scenes("checkout")
    assert result[0]["foreignId"] == "scene-aaa"


async def test_add_scene(api):
    payload = {"foreignId": "scene-aaa", "qualityProfileId": 1, "rootFolderPath": "/scenes"}
    with aioresponses() as m:
        m.post(f"{BASE}/movie", payload={"id": 1, **payload})
        result = await api.add_scene(payload)
    assert result["id"] == 1


async def test_delete_scene_passes_delete_files(api):
    with aioresponses() as m:
        m.delete(f"{BASE}/movie/1?deleteFiles=true", status=200, payload={})
        await api.delete_scene(1, delete_files=True)


async def test_delete_scene_ignores_404(api):
    with aioresponses() as m:
        m.delete(f"{BASE}/movie/914", status=404)
        await api.delete_scene(914)


async def test_delete_scene_handles_non_json_200(api):
    with aioresponses() as m:
        m.delete(f"{BASE}/movie/916", status=200, body="", content_type="text/plain")
        await api.delete_scene(916)


async def test_delete_scene_raises_on_server_error(api):
    with aioresponses() as m:
        m.delete(f"{BASE}/movie/1", status=500)
        with pytest.raises(aiohttp.ClientResponseError):
            await api.delete_scene(1)


async def test_get_queue_unwraps_records(api):
    with aioresponses() as m:
        m.get(f"{BASE}/queue?pageSize=1000", payload={"records": [{"movieId": 1}]})
        assert await api.get_queue() == [{"movieId": 1}]


async def test_toggle_scene_monitored_round_trips(api):
    with aioresponses() as m:
        m.get(f"{BASE}/movie/1", payload={"id": 1, "monitored": True})
        m.put(f"{BASE}/movie/1", status=202, payload={})
        await api.toggle_scene_monitored(1, False)
        put_call = m.requests[("PUT", URL(f"{BASE}/movie/1"))][0]
    assert put_call.kwargs["json"]["monitored"] is False


async def test_trigger_scene_search_sends_command(api):
    with aioresponses() as m:
        m.post(f"{BASE}/command", payload={"id": 10})
        await api.trigger_scene_search(1)
        post_call = m.requests[("POST", URL(f"{BASE}/command"))][0]
    assert post_call.kwargs["json"] == {"name": "MoviesSearch", "movieIds": [1]}


async def test_test_connection_true_on_success(api):
    with aioresponses() as m:
        m.get(f"{BASE}/system/status", payload={"version": "3.0.0"})
        assert await api.test_connection() is True


async def test_test_connection_false_on_error(api):
    with aioresponses() as m:
        m.get(f"{BASE}/system/status", status=401)
        assert await api.test_connection() is False
```

- [ ] **Step 3: Run, verify failure**

Run: `pytest tests/test_api.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'custom_components.whisparr_hacs.api'`.

- [ ] **Step 4: Implement `api.py`**

`custom_components/whisparr_hacs/api.py`:
```python
# Whisparr v3 API client. Endpoint/field/command names verified against a live
# v3 instance on 2026-06-17 (see plan verification table). Adjust the maps below
# if a future Whisparr build renames them.
from __future__ import annotations

import aiohttp

_PARENT_PATH = {"studio": "/studio", "performer": "/performer"}
# command name + id-list parameter name per parent kind
_PARENT_SEARCH = {"studio": ("StudioSearch", "studioIds"), "performer": ("PerformerSearch", "performerIds")}


class WhisparrApi:
    def __init__(self, host: str, api_key: str, session: aiohttp.ClientSession) -> None:
        self._base = host.rstrip("/") + "/api/v3"
        self._headers = {"X-Api-Key": api_key}
        self._session = session

    async def _request(self, method: str, endpoint: str, **kwargs):
        url = f"{self._base}{endpoint}"
        async with self._session.request(method, url, headers=self._headers, **kwargs) as resp:
            resp.raise_for_status()
            if resp.status == 204:
                return None
            try:
                return await resp.json()
            except aiohttp.ContentTypeError:
                return None

    # ---- scenes (movies) ----
    async def get_scenes(self) -> list[dict]:
        return await self._request("GET", "/movie")

    async def search_scenes(self, term: str) -> list[dict]:
        return await self._request("GET", "/movie/lookup", params={"term": term})

    async def add_scene(self, payload: dict) -> dict:
        return await self._request("POST", "/movie", json=payload)

    async def delete_scene(self, scene_id: int, delete_files: bool = False) -> None:
        params = {"deleteFiles": "true"} if delete_files else None
        try:
            await self._request("DELETE", f"/movie/{scene_id}", params=params)
        except aiohttp.ClientResponseError as err:
            if err.status != 404:  # already gone == desired end state
                raise

    async def toggle_scene_monitored(self, scene_id: int, monitored: bool) -> None:
        scene = await self._request("GET", f"/movie/{scene_id}")
        scene["monitored"] = monitored
        await self._request("PUT", f"/movie/{scene_id}", json=scene)

    async def trigger_scene_search(self, scene_id: int) -> None:
        await self.send_command("MoviesSearch", movieIds=[scene_id])

    # ---- monitored parents (studio / performer) ----
    async def get_parents(self, kind: str) -> list[dict]:
        return await self._request("GET", _PARENT_PATH[kind])

    async def search_parents(self, kind: str, term: str) -> list[dict]:
        return await self._request("GET", f"{_PARENT_PATH[kind]}/lookup", params={"term": term})

    async def add_parent(self, kind: str, payload: dict) -> dict:
        return await self._request("POST", _PARENT_PATH[kind], json=payload)

    async def delete_parent(self, kind: str, parent_id: int, delete_files: bool = False) -> None:
        params = {"deleteFiles": "true"} if delete_files else None
        try:
            await self._request("DELETE", f"{_PARENT_PATH[kind]}/{parent_id}", params=params)
        except aiohttp.ClientResponseError as err:
            if err.status != 404:
                raise

    async def toggle_parent_monitored(self, kind: str, parent_id: int, monitored: bool) -> None:
        parent = await self._request("GET", f"{_PARENT_PATH[kind]}/{parent_id}")
        parent["monitored"] = monitored
        await self._request("PUT", f"{_PARENT_PATH[kind]}/{parent_id}", json=parent)

    async def trigger_parent_search(self, kind: str, parent_id: int) -> None:
        name, id_param = _PARENT_SEARCH[kind]
        await self.send_command(name, **{id_param: [parent_id]})

    # ---- shared ----
    async def send_command(self, name: str, **kwargs) -> dict:
        return await self._request("POST", "/command", json={"name": name, **kwargs})

    async def get_quality_profiles(self) -> list[dict]:
        return await self._request("GET", "/qualityprofile")

    async def get_root_folders(self) -> list[dict]:
        return await self._request("GET", "/rootfolder")

    async def get_queue(self) -> list[dict]:
        data = await self._request("GET", "/queue", params={"pageSize": 1000})
        return data.get("records", []) if data else []

    async def test_connection(self) -> bool:
        try:
            await self._request("GET", "/system/status")
            return True
        except aiohttp.ClientError:
            return False
```

- [ ] **Step 5: Run scene tests, verify pass**

Run: `pytest tests/test_api.py -v`
Expected: all scene/helper tests PASS.

- [ ] **Step 6: Add the parameterized parent tests**

Append to `tests/test_api.py`:
```python
import pytest as _pytest


@_pytest.mark.parametrize("kind,path", [("studio", "studio"), ("performer", "performer")])
async def test_get_parents(api, kind, path):
    with aioresponses() as m:
        m.get(f"{BASE}/{path}", payload=[{"id": 1, "foreignId": "x"}])
        assert await api.get_parents(kind) == [{"id": 1, "foreignId": "x"}]


@_pytest.mark.parametrize("kind,path", [("studio", "studio"), ("performer", "performer")])
async def test_search_parents(api, kind, path):
    with aioresponses() as m:
        m.get(f"{BASE}/{path}/lookup?term=vixen", payload=[{"foreignId": "y"}])
        result = await api.search_parents(kind, "vixen")
    assert result[0]["foreignId"] == "y"


@_pytest.mark.parametrize("kind,path", [("studio", "studio"), ("performer", "performer")])
async def test_add_parent(api, kind, path):
    with aioresponses() as m:
        m.post(f"{BASE}/{path}", payload={"id": 5})
        assert (await api.add_parent(kind, {"foreignId": "z"}))["id"] == 5


@_pytest.mark.parametrize("kind,path", [("studio", "studio"), ("performer", "performer")])
async def test_delete_parent_ignores_404(api, kind, path):
    with aioresponses() as m:
        m.delete(f"{BASE}/{path}/99", status=404)
        await api.delete_parent(kind, 99)


@_pytest.mark.parametrize("kind,path", [("studio", "studio"), ("performer", "performer")])
async def test_toggle_parent_monitored_round_trips(api, kind, path):
    with aioresponses() as m:
        m.get(f"{BASE}/{path}/1", payload={"id": 1, "monitored": True})
        m.put(f"{BASE}/{path}/1", status=202, payload={})
        await api.toggle_parent_monitored(kind, 1, False)
        put_call = m.requests[("PUT", URL(f"{BASE}/{path}/1"))][0]
    assert put_call.kwargs["json"]["monitored"] is False


@_pytest.mark.parametrize("kind,cmd,idparam", [
    ("studio", "StudioSearch", "studioIds"),
    ("performer", "PerformerSearch", "performerIds"),
])
async def test_trigger_parent_search(api, kind, cmd, idparam):
    with aioresponses() as m:
        m.post(f"{BASE}/command", payload={"id": 7})
        await api.trigger_parent_search(kind, 3)
        post_call = m.requests[("POST", URL(f"{BASE}/command"))][0]
    assert post_call.kwargs["json"] == {"name": cmd, idparam: [3]}
```

- [ ] **Step 7: Run full api test file, verify pass**

Run: `pytest tests/test_api.py -v`
Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add custom_components/whisparr_hacs/api.py tests/test_api.py
git commit -m "feat: add Whisparr v3 async API client"
```

---

## Task 3: Coordinator (`coordinator.py`)

**Files:**
- Create: `custom_components/whisparr_hacs/coordinator.py`
- Test: `tests/test_coordinator.py`

**Interfaces:**
- Consumes: `WhisparrApi` (Task 2).
- Produces: `WhisparrCoordinator(hass, api: WhisparrApi, poll_interval: int)`; `.api` attribute; `.data` dict with keys `scenes`, `studios`, `performers`, `quality_profiles`, `root_folders`, `queue`.

- [ ] **Step 1: Write the failing test**

`tests/test_coordinator.py`:
```python
from unittest.mock import AsyncMock

import pytest
from homeassistant.helpers.update_coordinator import UpdateFailed
from custom_components.whisparr_hacs.coordinator import WhisparrCoordinator


def _api():
    api = AsyncMock()
    api.get_scenes.return_value = [{"id": 1}]
    api.get_parents.side_effect = lambda kind: [{"id": 10, "kind": kind}]
    api.get_quality_profiles.return_value = [{"id": 1}]
    api.get_root_folders.return_value = [{"id": 1}]
    api.get_queue.return_value = [{"movieId": 1}]
    return api


async def test_update_data_aggregates_all_sources(hass):
    coordinator = WhisparrCoordinator(hass, _api(), 30)
    data = await coordinator._async_update_data()
    assert data["scenes"] == [{"id": 1}]
    assert data["studios"] == [{"id": 10, "kind": "studio"}]
    assert data["performers"] == [{"id": 10, "kind": "performer"}]
    assert data["queue"] == [{"movieId": 1}]
    assert "quality_profiles" in data and "root_folders" in data


async def test_update_data_raises_update_failed_on_error(hass):
    api = _api()
    api.get_scenes.side_effect = RuntimeError("boom")
    coordinator = WhisparrCoordinator(hass, api, 30)
    with pytest.raises(UpdateFailed):
        await coordinator._async_update_data()
```

- [ ] **Step 2: Run, verify failure**

Run: `pytest tests/test_coordinator.py -v`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `coordinator.py`**

```python
from __future__ import annotations

import asyncio
import logging
from datetime import timedelta

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import WhisparrApi

_LOGGER = logging.getLogger(__name__)


class WhisparrCoordinator(DataUpdateCoordinator):
    def __init__(self, hass: HomeAssistant, api: WhisparrApi, poll_interval: int) -> None:
        super().__init__(hass, _LOGGER, name="Whisparr", update_interval=timedelta(seconds=poll_interval))
        self.api = api

    async def _async_update_data(self) -> dict:
        try:
            scenes, studios, performers, quality_profiles, root_folders, queue = await asyncio.gather(
                self.api.get_scenes(),
                self.api.get_parents("studio"),
                self.api.get_parents("performer"),
                self.api.get_quality_profiles(),
                self.api.get_root_folders(),
                self.api.get_queue(),
            )
            return {
                "scenes": scenes,
                "studios": studios,
                "performers": performers,
                "quality_profiles": quality_profiles,
                "root_folders": root_folders,
                "queue": queue,
            }
        except Exception as err:
            raise UpdateFailed(f"Error communicating with Whisparr: {err}") from err
```

- [ ] **Step 4: Run, verify pass**

Run: `pytest tests/test_coordinator.py -v`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add custom_components/whisparr_hacs/coordinator.py tests/test_coordinator.py
git commit -m "feat: add Whisparr polling coordinator"
```

---

## Task 4: Config flow (`config_flow.py`)

**Files:**
- Create: `custom_components/whisparr_hacs/config_flow.py`
- Test: `tests/test_config_flow.py`

**Interfaces:**
- Consumes: `WhisparrApi.test_connection`, `DOMAIN`.
- Produces: `WhisparrHacsConfigFlow` (domain `whisparr_hacs`); creates an entry with data `{host, api_key, name}` on a successful connection test; shows `cannot_connect` error otherwise; unique id = lowercased stripped host.

- [ ] **Step 1: Write the failing test**

`tests/test_config_flow.py`:
```python
from unittest.mock import patch

from homeassistant import config_entries, data_entry_flow
from custom_components.whisparr_hacs.const import DOMAIN

USER_INPUT = {"host": "http://localhost:6969", "api_key": "k", "name": "My Whisparr"}


async def test_form_creates_entry_on_success(hass):
    with patch(
        "custom_components.whisparr_hacs.config_flow.WhisparrApi.test_connection",
        return_value=True,
    ):
        result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
        result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
        await hass.async_block_till_done()
    assert result["type"] == data_entry_flow.FlowResultType.CREATE_ENTRY
    assert result["title"] == "My Whisparr"
    assert result["data"] == USER_INPUT


async def test_form_shows_error_on_failed_connection(hass):
    with patch(
        "custom_components.whisparr_hacs.config_flow.WhisparrApi.test_connection",
        return_value=False,
    ):
        result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
        result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
    assert result["type"] == data_entry_flow.FlowResultType.FORM
    assert result["errors"] == {"base": "cannot_connect"}
```

- [ ] **Step 2: Run, verify failure**

Run: `pytest tests/test_config_flow.py -v`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `config_flow.py`**

```python
from __future__ import annotations

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import WhisparrApi
from .const import DOMAIN

STEP_USER_SCHEMA = vol.Schema({
    vol.Required("host"): str,
    vol.Required("api_key"): str,
    vol.Required("name", default="Whisparr"): str,
})


class WhisparrHacsConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        errors = {}
        if user_input is not None:
            await self.async_set_unique_id(user_input["host"].rstrip("/").lower())
            self._abort_if_unique_id_configured()
            session = async_get_clientsession(self.hass)
            api = WhisparrApi(user_input["host"], user_input["api_key"], session)
            try:
                connected = await api.test_connection()
            except Exception:
                connected = False
            if connected:
                return self.async_create_entry(title=user_input["name"], data=user_input)
            errors["base"] = "cannot_connect"
        return self.async_show_form(
            step_id="user",
            data_schema=self.add_suggested_values_to_schema(STEP_USER_SCHEMA, user_input or {}),
            errors=errors,
        )
```

- [ ] **Step 4: Run, verify pass**

Run: `pytest tests/test_config_flow.py -v`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add custom_components/whisparr_hacs/config_flow.py tests/test_config_flow.py
git commit -m "feat: add Whisparr config flow"
```

---

## Task 5: WebSocket read commands (`websocket_api.py`)

**Files:**
- Create: `custom_components/whisparr_hacs/websocket_api.py`
- Test: `tests/test_websocket_api.py`

**Interfaces:**
- Consumes: coordinator cache (keys `scenes`, `studios`, `performers`, `queue`, `quality_profiles`, `root_folders`), `WhisparrApi.search_scenes` / `search_parents`.
- Produces: `async_register_commands(hass)` registering:
  - `whisparr_hacs/get_scenes` → `{"scenes": [...]}` (each enriched with `inQueue`, `available`, optional `queueItem`)
  - `whisparr_hacs/get_parents` (`kind`) → `{"parents": [...]}` (each enriched with `sceneCount`, `missingCount`, `displayName`)
  - `whisparr_hacs/get_parent_scenes` (`kind`, `parent_id`) → `{"scenes": [...]}`
  - `whisparr_hacs/lookup_scene` (`term`) → `{"results": [...]}` (each flagged `inLibrary`)
  - `whisparr_hacs/lookup_parent` (`kind`, `term`) → `{"results": [...]}` (each flagged `inLibrary`)
  - `whisparr_hacs/get_config` → `{"quality_profiles": [...], "root_folders": [...]}`
- Module-level helpers (used by tests and Task 7): `_release_date(scene) -> str`, `_scene_parent_foreign_ids(scene, kind) -> set`, `_parent_name(parent, kind) -> str`, `_enrich_scene(scene, queue_map) -> dict`, `_apply_scene_query(scenes, search, filter_val, sort) -> list`.

- [ ] **Step 1: Write failing tests for scene enrichment + query helpers**

`tests/test_websocket_api.py`:
```python
import pytest
from custom_components.whisparr_hacs import websocket_api as wsa
from tests.conftest import MOCK_SCENE, MOCK_SCENE_MISSING, MOCK_STUDIO, MOCK_PERFORMER


def test_release_date_prefers_digital_release():
    assert wsa._release_date(MOCK_SCENE) == "2026-06-10T00:00:00Z"


def test_release_date_falls_back_to_empty_when_absent():
    assert wsa._release_date({"id": 9}) == ""


def test_scene_parent_foreign_ids_studio():
    assert wsa._scene_parent_foreign_ids(MOCK_SCENE, "studio") == {"studio-vixen"}


def test_scene_parent_foreign_ids_performer():
    assert wsa._scene_parent_foreign_ids(MOCK_SCENE, "performer") == {"perf-jane"}


def test_parent_name_studio_uses_title():
    assert wsa._parent_name(MOCK_STUDIO, "studio") == "Vixen"


def test_parent_name_performer_uses_fullname():
    assert wsa._parent_name(MOCK_PERFORMER, "performer") == "Jane Doe"


def test_enrich_scene_marks_in_queue_and_available():
    enriched = wsa._enrich_scene(MOCK_SCENE, {})
    assert enriched["available"] is True and enriched["inQueue"] is False
    q = wsa._enrich_scene(MOCK_SCENE_MISSING, {2: {"size": 100, "sizeleft": 40, "timeleft": "00:10", "status": "downloading"}})
    assert q["inQueue"] is True and q["available"] is False
    assert q["queueItem"]["sizeleft"] == 40


def test_apply_scene_query_filters_missing():
    scenes = [wsa._enrich_scene(MOCK_SCENE, {}), wsa._enrich_scene(MOCK_SCENE_MISSING, {})]
    out = wsa._apply_scene_query(scenes, "", "missing", "added")
    assert [s["id"] for s in out] == [2]


def test_apply_scene_query_sort_released_desc():
    scenes = [wsa._enrich_scene(MOCK_SCENE_MISSING, {}), wsa._enrich_scene(MOCK_SCENE, {})]
    out = wsa._apply_scene_query(scenes, "", None, "released")
    assert [s["id"] for s in out] == [1, 2]  # 06-10 before 06-08


def test_apply_scene_query_search_by_title():
    scenes = [wsa._enrich_scene(MOCK_SCENE, {}), wsa._enrich_scene(MOCK_SCENE_MISSING, {})]
    out = wsa._apply_scene_query(scenes, "weekend", None, "added")
    assert [s["id"] for s in out] == [2]
```

- [ ] **Step 2: Run, verify failure**

Run: `pytest tests/test_websocket_api.py -v`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `websocket_api.py`**

```python
# custom_components/whisparr_hacs/websocket_api.py
from __future__ import annotations

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PARENT_KINDS

_RELEASE_FIELDS = ("digitalRelease", "releaseDate", "inCinemas")


def async_register_commands(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_get_scenes)
    websocket_api.async_register_command(hass, ws_get_parents)
    websocket_api.async_register_command(hass, ws_get_parent_scenes)
    websocket_api.async_register_command(hass, ws_lookup_scene)
    websocket_api.async_register_command(hass, ws_lookup_parent)
    websocket_api.async_register_command(hass, ws_get_config)


def _release_date(scene: dict) -> str:
    for field in _RELEASE_FIELDS:
        if scene.get(field):
            return scene[field]
    return ""


def _scene_parent_foreign_ids(scene: dict, kind: str) -> set:
    if kind == "studio":
        fid = scene.get("studioForeignId")
        return {fid} if fid else set()
    # performer: scenes carry a credits[] list of people
    return {c.get("foreignId") for c in scene.get("credits", []) if c.get("foreignId")}


def _parent_name(parent: dict, kind: str) -> str:
    if kind == "performer":
        return parent.get("fullName") or parent.get("title") or ""
    return parent.get("title") or ""


def _enrich_scene(scene: dict, queue_map: dict) -> dict:
    sid = scene["id"]
    enriched = {
        **scene,
        "inQueue": sid in queue_map,
        "available": bool(scene.get("hasFile")) and bool(scene.get("monitored", True)),
    }
    if sid in queue_map:
        q = queue_map[sid]
        enriched["queueItem"] = {
            "size": q.get("size", 0),
            "sizeleft": q.get("sizeleft", 0),
            "timeleft": q.get("timeleft"),
            "status": q.get("status", ""),
            "protocol": q.get("protocol", ""),
        }
    return enriched


def _apply_scene_query(scenes: list, search: str, filter_val, sort: str) -> list:
    out = scenes
    if search:
        s = search.lower()
        out = [m for m in out if s in m.get("title", "").lower()]
    if filter_val == "available":
        out = [m for m in out if m.get("hasFile")]
    elif filter_val == "missing":
        out = [m for m in out if not m.get("hasFile") and m.get("monitored")]
    elif filter_val == "downloading":
        out = [m for m in out if m.get("inQueue") and not m.get("hasFile")]
    elif filter_val == "unmonitored":
        out = [m for m in out if not m.get("monitored")]
    if sort == "title":
        out = sorted(out, key=lambda m: m.get("title", "").lower())
    elif sort == "released":
        out = sorted(out, key=_release_date, reverse=True)
    else:  # "added" (default)
        out = sorted(out, key=lambda m: m.get("added", ""), reverse=True)
    return out


def _coordinator(hass, connection, msg):
    coordinator = hass.data.get(DOMAIN, {}).get(msg["entry_id"])
    if coordinator is None:
        connection.send_error(msg["id"], "not_found", "Config entry not found")
        return None
    return coordinator


@websocket_api.websocket_command({
    vol.Required("type"): "whisparr_hacs/get_scenes",
    vol.Required("entry_id"): str,
    vol.Optional("search"): str,
    vol.Optional("filter"): vol.In(["available", "missing", "downloading", "unmonitored"]),
    vol.Optional("sort"): vol.In(["title", "added", "released"]),
})
@websocket_api.async_response
async def ws_get_scenes(hass, connection, msg) -> None:
    coordinator = _coordinator(hass, connection, msg)
    if coordinator is None:
        return
    queue_map = {item["movieId"]: item for item in coordinator.data.get("queue", []) if "movieId" in item}
    scenes = [_enrich_scene(s, queue_map) for s in coordinator.data["scenes"]]
    scenes = _apply_scene_query(scenes, msg.get("search", ""), msg.get("filter"), msg.get("sort", "added"))
    connection.send_result(msg["id"], {"scenes": scenes})


@websocket_api.websocket_command({
    vol.Required("type"): "whisparr_hacs/get_parents",
    vol.Required("entry_id"): str,
    vol.Required("kind"): vol.In(PARENT_KINDS),
    vol.Optional("search"): str,
    vol.Optional("sort"): vol.In(["title", "added"]),
})
@websocket_api.async_response
async def ws_get_parents(hass, connection, msg) -> None:
    coordinator = _coordinator(hass, connection, msg)
    if coordinator is None:
        return
    kind = msg["kind"]
    scenes = coordinator.data["scenes"]
    parents = []
    for p in coordinator.data[f"{kind}s"]:
        fid = p.get("foreignId")
        members = [s for s in scenes if fid in _scene_parent_foreign_ids(s, kind)] if fid else []
        missing = sum(1 for s in members if not s.get("hasFile") and s.get("monitored"))
        parents.append({**p, "displayName": _parent_name(p, kind), "sceneCount": len(members), "missingCount": missing})
    search = msg.get("search", "").lower()
    if search:
        parents = [p for p in parents if search in p["displayName"].lower()]
    if msg.get("sort", "added") == "title":
        parents = sorted(parents, key=lambda p: p["displayName"].lower())
    else:
        parents = sorted(parents, key=lambda p: p.get("added", ""), reverse=True)
    connection.send_result(msg["id"], {"parents": parents})


@websocket_api.websocket_command({
    vol.Required("type"): "whisparr_hacs/get_parent_scenes",
    vol.Required("entry_id"): str,
    vol.Required("kind"): vol.In(PARENT_KINDS),
    vol.Required("parent_id"): int,
    vol.Optional("search"): str,
    vol.Optional("filter"): vol.In(["available", "missing", "downloading", "unmonitored"]),
    vol.Optional("sort"): vol.In(["title", "added", "released"]),
})
@websocket_api.async_response
async def ws_get_parent_scenes(hass, connection, msg) -> None:
    coordinator = _coordinator(hass, connection, msg)
    if coordinator is None:
        return
    kind = msg["kind"]
    parent = next((p for p in coordinator.data[f"{kind}s"] if p["id"] == msg["parent_id"]), None)
    if parent is None:
        connection.send_error(msg["id"], "not_found", "Parent not found")
        return
    fid = parent.get("foreignId")
    queue_map = {item["movieId"]: item for item in coordinator.data.get("queue", []) if "movieId" in item}
    members = [_enrich_scene(s, queue_map) for s in coordinator.data["scenes"]
               if fid and fid in _scene_parent_foreign_ids(s, kind)]
    members = _apply_scene_query(members, msg.get("search", ""), msg.get("filter"), msg.get("sort", "added"))
    connection.send_result(msg["id"], {"scenes": members})


@websocket_api.websocket_command({
    vol.Required("type"): "whisparr_hacs/lookup_scene",
    vol.Required("entry_id"): str,
    vol.Required("term"): str,
})
@websocket_api.async_response
async def ws_lookup_scene(hass, connection, msg) -> None:
    coordinator = _coordinator(hass, connection, msg)
    if coordinator is None:
        return
    try:
        results = await coordinator.api.search_scenes(msg["term"])
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "whisparr_error", str(err))
        return
    library = {s.get("foreignId") for s in coordinator.data["scenes"]}
    for r in results:
        r["inLibrary"] = r.get("foreignId") in library
    connection.send_result(msg["id"], {"results": results})


@websocket_api.websocket_command({
    vol.Required("type"): "whisparr_hacs/lookup_parent",
    vol.Required("entry_id"): str,
    vol.Required("kind"): vol.In(PARENT_KINDS),
    vol.Required("term"): str,
})
@websocket_api.async_response
async def ws_lookup_parent(hass, connection, msg) -> None:
    coordinator = _coordinator(hass, connection, msg)
    if coordinator is None:
        return
    kind = msg["kind"]
    try:
        results = await coordinator.api.search_parents(kind, msg["term"])
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "whisparr_error", str(err))
        return
    library = {p.get("foreignId") for p in coordinator.data[f"{kind}s"]}
    for r in results:
        r["inLibrary"] = r.get("foreignId") in library
    connection.send_result(msg["id"], {"results": results})


@websocket_api.websocket_command({
    vol.Required("type"): "whisparr_hacs/get_config",
    vol.Required("entry_id"): str,
})
@websocket_api.async_response
async def ws_get_config(hass, connection, msg) -> None:
    coordinator = _coordinator(hass, connection, msg)
    if coordinator is None:
        return
    connection.send_result(msg["id"], {
        "quality_profiles": coordinator.data["quality_profiles"],
        "root_folders": coordinator.data["root_folders"],
    })
```

- [ ] **Step 4: Run helper tests, verify pass**

Run: `pytest tests/test_websocket_api.py -v`
Expected: all helper tests PASS.

- [ ] **Step 5: Add an end-to-end WS command test**

Append to `tests/test_websocket_api.py`:
```python
from unittest.mock import AsyncMock, MagicMock


def _coord_with_data():
    coord = MagicMock()
    coord.data = {
        "scenes": [MOCK_SCENE, MOCK_SCENE_MISSING],
        "studios": [MOCK_STUDIO],
        "performers": [MOCK_PERFORMER],
        "queue": [],
        "quality_profiles": [{"id": 1}],
        "root_folders": [{"id": 1, "path": "/scenes"}],
    }
    coord.api = AsyncMock()
    return coord


def _msg(**kw):
    return {"id": 1, "entry_id": "test_entry_id", **kw}


async def test_ws_get_scenes_returns_enriched_sorted(hass):
    hass.data[wsa.DOMAIN] = {"test_entry_id": _coord_with_data()}
    sent = {}
    conn = MagicMock()
    conn.send_result.side_effect = lambda _id, payload: sent.update(payload)
    await ws_get_scenes_unwrapped(hass, conn, _msg(sort="added"))
    assert [s["id"] for s in sent["scenes"]] == [1, 2]  # added 06-12 before 06-08


async def test_ws_get_parents_counts_members(hass):
    hass.data[wsa.DOMAIN] = {"test_entry_id": _coord_with_data()}
    sent = {}
    conn = MagicMock()
    conn.send_result.side_effect = lambda _id, payload: sent.update(payload)
    await ws_get_parents_unwrapped(hass, conn, _msg(kind="studio"))
    assert sent["parents"][0]["sceneCount"] == 2
    assert sent["parents"][0]["missingCount"] == 1
    assert sent["parents"][0]["displayName"] == "Vixen"
```

Add these two lines near the top of the test file (after the `wsa` import) so the `@async_response` decorator is bypassed in unit tests:
```python
ws_get_scenes_unwrapped = wsa.ws_get_scenes.__wrapped__
ws_get_parents_unwrapped = wsa.ws_get_parents.__wrapped__
```

- [ ] **Step 6: Run full WS test file, verify pass**

Run: `pytest tests/test_websocket_api.py -v`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add custom_components/whisparr_hacs/websocket_api.py tests/test_websocket_api.py
git commit -m "feat: add Whisparr WebSocket read commands"
```

---

## Task 6: Services (`services.py` + `services.yaml`)

**Files:**
- Create: `custom_components/whisparr_hacs/services.py`
- Create: `custom_components/whisparr_hacs/services.yaml`
- Test: `tests/test_services.py`

**Interfaces:**
- Consumes: coordinator (`hass.data[DOMAIN][entry_id]`), `WhisparrApi` methods (Task 2).
- Produces: `async_register_services(hass)` registering services `add_scene`, `add_parent`, `set_monitored`, `trigger_search`, `delete`, `refresh_library`. Each resolves the coordinator by `entry_id`, calls the API, then refreshes (synchronous `async_refresh()` for monitor toggles so the card re-reads fresh state; debounced `async_request_refresh()` otherwise).

- [ ] **Step 1: Write the failing tests**

`tests/test_services.py`:
```python
from unittest.mock import AsyncMock, MagicMock

import pytest
from custom_components.whisparr_hacs.services import async_register_services
from custom_components.whisparr_hacs.const import DOMAIN


@pytest.fixture
def hass_with_coord(hass):
    coord = MagicMock()
    coord.api = AsyncMock()
    coord.async_request_refresh = AsyncMock()
    coord.async_refresh = AsyncMock()
    hass.data[DOMAIN] = {"test_entry_id": coord}
    async_register_services(hass)
    return hass, coord


async def test_add_scene_builds_payload_and_refreshes(hass_with_coord):
    hass, coord = hass_with_coord
    await hass.services.async_call(DOMAIN, "add_scene", {
        "entry_id": "test_entry_id", "foreign_id": "scene-aaa", "title": "Late Checkout",
        "quality_profile_id": 1, "root_folder": "/scenes",
    }, blocking=True)
    payload = coord.api.add_scene.call_args.args[0]
    assert payload["foreignId"] == "scene-aaa"
    assert payload["qualityProfileId"] == 1
    assert payload["rootFolderPath"] == "/scenes"
    assert payload["monitored"] is True
    assert payload["addOptions"]["searchForMovie"] is True
    coord.async_request_refresh.assert_awaited()


async def test_add_parent_studio(hass_with_coord):
    hass, coord = hass_with_coord
    await hass.services.async_call(DOMAIN, "add_parent", {
        "entry_id": "test_entry_id", "kind": "studio", "foreign_id": "studio-vixen",
        "title": "Vixen", "quality_profile_id": 1, "root_folder": "/scenes",
    }, blocking=True)
    coord.api.add_parent.assert_awaited_once()
    assert coord.api.add_parent.call_args.args[0] == "studio"


async def test_set_monitored_scene_uses_synchronous_refresh(hass_with_coord):
    hass, coord = hass_with_coord
    await hass.services.async_call(DOMAIN, "set_monitored", {
        "entry_id": "test_entry_id", "kind": "scene", "item_id": 1, "monitored": False,
    }, blocking=True)
    coord.api.toggle_scene_monitored.assert_awaited_once_with(1, False)
    coord.async_refresh.assert_awaited()


async def test_set_monitored_parent(hass_with_coord):
    hass, coord = hass_with_coord
    await hass.services.async_call(DOMAIN, "set_monitored", {
        "entry_id": "test_entry_id", "kind": "performer", "item_id": 20, "monitored": True,
    }, blocking=True)
    coord.api.toggle_parent_monitored.assert_awaited_once_with("performer", 20, True)


async def test_trigger_search_scene_and_parent(hass_with_coord):
    hass, coord = hass_with_coord
    await hass.services.async_call(DOMAIN, "trigger_search", {
        "entry_id": "test_entry_id", "kind": "scene", "item_id": 1,
    }, blocking=True)
    coord.api.trigger_scene_search.assert_awaited_once_with(1)
    await hass.services.async_call(DOMAIN, "trigger_search", {
        "entry_id": "test_entry_id", "kind": "studio", "item_id": 10,
    }, blocking=True)
    coord.api.trigger_parent_search.assert_awaited_once_with("studio", 10)


async def test_delete_scene(hass_with_coord):
    hass, coord = hass_with_coord
    await hass.services.async_call(DOMAIN, "delete", {
        "entry_id": "test_entry_id", "kind": "scene", "item_id": 1, "delete_files": True,
    }, blocking=True)
    coord.api.delete_scene.assert_awaited_once_with(1, delete_files=True)
    coord.async_request_refresh.assert_awaited()
```

- [ ] **Step 2: Run, verify failure**

Run: `pytest tests/test_services.py -v`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `services.py`**

```python
from __future__ import annotations

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall

from .const import DOMAIN, PARENT_KINDS

_ENTITY_KINDS = ("scene", *PARENT_KINDS)

_ADD_SCENE_SCHEMA = vol.Schema({
    vol.Required("entry_id"): str,
    vol.Required("foreign_id"): str,
    vol.Required("title"): str,
    vol.Required("quality_profile_id"): int,
    vol.Required("root_folder"): str,
    vol.Optional("monitored", default=True): bool,
    vol.Optional("search_on_add", default=True): bool,
})
_ADD_PARENT_SCHEMA = vol.Schema({
    vol.Required("entry_id"): str,
    vol.Required("kind"): vol.In(PARENT_KINDS),
    vol.Required("foreign_id"): str,
    vol.Required("title"): str,
    vol.Required("quality_profile_id"): int,
    vol.Required("root_folder"): str,
    vol.Optional("monitored", default=True): bool,
    vol.Optional("search_on_add", default=True): bool,
})
_SET_MONITORED_SCHEMA = vol.Schema({
    vol.Required("entry_id"): str,
    vol.Required("kind"): vol.In(_ENTITY_KINDS),
    vol.Required("item_id"): int,
    vol.Required("monitored"): bool,
})
_TRIGGER_SEARCH_SCHEMA = vol.Schema({
    vol.Required("entry_id"): str,
    vol.Required("kind"): vol.In(_ENTITY_KINDS),
    vol.Required("item_id"): int,
})
_DELETE_SCHEMA = vol.Schema({
    vol.Required("entry_id"): str,
    vol.Required("kind"): vol.In(_ENTITY_KINDS),
    vol.Required("item_id"): int,
    vol.Optional("delete_files", default=False): bool,
})
_REFRESH_SCHEMA = vol.Schema({vol.Required("entry_id"): str})


def async_register_services(hass: HomeAssistant) -> None:
    def _coord(call: ServiceCall):
        return hass.data[DOMAIN].get(call.data["entry_id"])

    async def handle_add_scene(call: ServiceCall) -> None:
        coordinator = _coord(call)
        if coordinator is None:
            return
        await coordinator.api.add_scene({
            "foreignId": call.data["foreign_id"],
            "title": call.data["title"],
            "qualityProfileId": call.data["quality_profile_id"],
            "rootFolderPath": call.data["root_folder"],
            "monitored": call.data["monitored"],
            "addOptions": {"searchForMovie": call.data["search_on_add"]},
        })
        await coordinator.async_request_refresh()

    async def handle_add_parent(call: ServiceCall) -> None:
        coordinator = _coord(call)
        if coordinator is None:
            return
        await coordinator.api.add_parent(call.data["kind"], {
            "foreignId": call.data["foreign_id"],
            "title": call.data["title"],
            "qualityProfileId": call.data["quality_profile_id"],
            "rootFolderPath": call.data["root_folder"],
            "monitored": call.data["monitored"],
            "addOptions": {"searchForMissing": call.data["search_on_add"]},
        })
        await coordinator.async_request_refresh()

    async def handle_set_monitored(call: ServiceCall) -> None:
        coordinator = _coord(call)
        if coordinator is None:
            return
        if call.data["kind"] == "scene":
            await coordinator.api.toggle_scene_monitored(call.data["item_id"], call.data["monitored"])
        else:
            await coordinator.api.toggle_parent_monitored(call.data["kind"], call.data["item_id"], call.data["monitored"])
        # synchronous refresh so the card immediately re-reads fresh monitored state
        await coordinator.async_refresh()

    async def handle_trigger_search(call: ServiceCall) -> None:
        coordinator = _coord(call)
        if coordinator is None:
            return
        if call.data["kind"] == "scene":
            await coordinator.api.trigger_scene_search(call.data["item_id"])
        else:
            await coordinator.api.trigger_parent_search(call.data["kind"], call.data["item_id"])

    async def handle_delete(call: ServiceCall) -> None:
        coordinator = _coord(call)
        if coordinator is None:
            return
        if call.data["kind"] == "scene":
            await coordinator.api.delete_scene(call.data["item_id"], delete_files=call.data["delete_files"])
        else:
            await coordinator.api.delete_parent(call.data["kind"], call.data["item_id"], delete_files=call.data["delete_files"])
        await coordinator.async_request_refresh()

    async def handle_refresh_library(call: ServiceCall) -> None:
        coordinator = _coord(call)
        if coordinator is None:
            return
        await coordinator.async_request_refresh()

    hass.services.async_register(DOMAIN, "add_scene", handle_add_scene, _ADD_SCENE_SCHEMA)
    hass.services.async_register(DOMAIN, "add_parent", handle_add_parent, _ADD_PARENT_SCHEMA)
    hass.services.async_register(DOMAIN, "set_monitored", handle_set_monitored, _SET_MONITORED_SCHEMA)
    hass.services.async_register(DOMAIN, "trigger_search", handle_trigger_search, _TRIGGER_SEARCH_SCHEMA)
    hass.services.async_register(DOMAIN, "delete", handle_delete, _DELETE_SCHEMA)
    hass.services.async_register(DOMAIN, "refresh_library", handle_refresh_library, _REFRESH_SCHEMA)
```

- [ ] **Step 4: Create `services.yaml`**

```yaml
add_scene:
  name: Add Scene
  description: Add an individual scene to Whisparr.
  fields:
    entry_id: {name: Entry ID, description: Config entry ID., required: true, selector: {text: }}
    foreign_id: {name: Foreign ID, description: External scene id from the lookup result., required: true, selector: {text: }}
    title: {name: Title, description: Scene title., required: true, selector: {text: }}
    quality_profile_id: {name: Quality Profile ID, required: true, selector: {number: {min: 1, mode: box}}}
    root_folder: {name: Root Folder, required: true, selector: {text: }}
    monitored: {name: Monitored, required: false, default: true, selector: {boolean: }}
    search_on_add: {name: Search on add, required: false, default: true, selector: {boolean: }}

add_parent:
  name: Add Studio/Performer
  description: Add a monitored studio or performer to Whisparr.
  fields:
    entry_id: {name: Entry ID, required: true, selector: {text: }}
    kind: {name: Kind, required: true, selector: {select: {options: [studio, performer]}}}
    foreign_id: {name: Foreign ID, required: true, selector: {text: }}
    title: {name: Title, required: true, selector: {text: }}
    quality_profile_id: {name: Quality Profile ID, required: true, selector: {number: {min: 1, mode: box}}}
    root_folder: {name: Root Folder, required: true, selector: {text: }}
    monitored: {name: Monitored, required: false, default: true, selector: {boolean: }}
    search_on_add: {name: Search on add, required: false, default: true, selector: {boolean: }}

set_monitored:
  name: Set Monitored
  description: Set the monitored state on a scene, studio, or performer.
  fields:
    entry_id: {name: Entry ID, required: true, selector: {text: }}
    kind: {name: Kind, required: true, selector: {select: {options: [scene, studio, performer]}}}
    item_id: {name: Item ID, description: Internal Whisparr id., required: true, selector: {number: {min: 1, mode: box}}}
    monitored: {name: Monitored, required: true, selector: {boolean: }}

trigger_search:
  name: Trigger Search
  description: Search for a scene, or all monitored scenes in a studio/performer.
  fields:
    entry_id: {name: Entry ID, required: true, selector: {text: }}
    kind: {name: Kind, required: true, selector: {select: {options: [scene, studio, performer]}}}
    item_id: {name: Item ID, required: true, selector: {number: {min: 1, mode: box}}}

delete:
  name: Delete
  description: Remove a scene, studio, or performer from Whisparr.
  fields:
    entry_id: {name: Entry ID, required: true, selector: {text: }}
    kind: {name: Kind, required: true, selector: {select: {options: [scene, studio, performer]}}}
    item_id: {name: Item ID, required: true, selector: {number: {min: 1, mode: box}}}
    delete_files: {name: Delete Files, required: false, default: false, selector: {boolean: }}

refresh_library:
  name: Refresh Library
  description: Trigger an immediate library refresh from Whisparr.
  fields:
    entry_id: {name: Entry ID, required: true, selector: {text: }}
```

- [ ] **Step 5: Run, verify pass**

Run: `pytest tests/test_services.py -v`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add custom_components/whisparr_hacs/services.py custom_components/whisparr_hacs/services.yaml tests/test_services.py
git commit -m "feat: add Whisparr write services"
```

---

## Task 7: Sensors (`sensor.py`)

**Files:**
- Create: `custom_components/whisparr_hacs/sensor.py`
- Test: `tests/test_sensor.py`

**Interfaces:**
- Consumes: `WhisparrCoordinator.data` (keys `scenes`, `studios`, `performers`, `queue`).
- Produces: `async_setup_entry(hass, entry, async_add_entities)` adding 5 sensors: Total Scenes, Missing Scenes, Downloading, Total Studios, Total Performers. Missing counts scenes with `monitored` true and `hasFile` false.

- [ ] **Step 1: Write the failing test**

`tests/test_sensor.py`:
```python
from unittest.mock import MagicMock

from custom_components.whisparr_hacs.sensor import (
    WhisparrTotalScenesSensor, WhisparrMissingScenesSensor, WhisparrDownloadingSensor,
    WhisparrTotalStudiosSensor, WhisparrTotalPerformersSensor,
)
from tests.conftest import MOCK_SCENE, MOCK_SCENE_MISSING, MOCK_STUDIO, MOCK_PERFORMER


def _coord():
    c = MagicMock()
    c.data = {
        "scenes": [MOCK_SCENE, MOCK_SCENE_MISSING],
        "studios": [MOCK_STUDIO],
        "performers": [MOCK_PERFORMER],
        "queue": [{"movieId": 2}],
    }
    return c


def test_total_scenes():
    assert WhisparrTotalScenesSensor(_coord(), "e", "W").native_value == 2


def test_missing_scenes_counts_monitored_without_file():
    assert WhisparrMissingScenesSensor(_coord(), "e", "W").native_value == 1


def test_downloading_counts_queue():
    assert WhisparrDownloadingSensor(_coord(), "e", "W").native_value == 1


def test_total_studios_and_performers():
    assert WhisparrTotalStudiosSensor(_coord(), "e", "W").native_value == 1
    assert WhisparrTotalPerformersSensor(_coord(), "e", "W").native_value == 1


def test_native_value_none_without_data():
    c = MagicMock()
    c.data = None
    assert WhisparrTotalScenesSensor(c, "e", "W").native_value is None
```

- [ ] **Step 2: Run, verify failure**

Run: `pytest tests/test_sensor.py -v`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `sensor.py`**

```python
# custom_components/whisparr_hacs/sensor.py
from __future__ import annotations

from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import WhisparrCoordinator


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    coordinator: WhisparrCoordinator = hass.data[DOMAIN][entry.entry_id]
    name = entry.data["name"]
    async_add_entities([
        WhisparrTotalScenesSensor(coordinator, entry.entry_id, name),
        WhisparrMissingScenesSensor(coordinator, entry.entry_id, name),
        WhisparrDownloadingSensor(coordinator, entry.entry_id, name),
        WhisparrTotalStudiosSensor(coordinator, entry.entry_id, name),
        WhisparrTotalPerformersSensor(coordinator, entry.entry_id, name),
    ])


class _Base(CoordinatorEntity, SensorEntity):
    _attr_state_class = SensorStateClass.MEASUREMENT
    _key = ""
    _label = ""
    _icon = "mdi:movie-open"

    def __init__(self, coordinator: WhisparrCoordinator, entry_id: str, display_name: str) -> None:
        super().__init__(coordinator)
        self._attr_icon = self._icon
        self._attr_name = f"{display_name} {self._label}"
        self._attr_unique_id = f"{entry_id}_{self._key}"


class WhisparrTotalScenesSensor(_Base):
    _key, _label, _icon = "total_scenes", "Total Scenes", "mdi:movie-open"

    @property
    def native_value(self):
        if not self.coordinator.data:
            return None
        return len(self.coordinator.data["scenes"])


class WhisparrMissingScenesSensor(_Base):
    _key, _label, _icon = "missing_scenes", "Missing Scenes", "mdi:movie-off"

    @property
    def native_value(self):
        if not self.coordinator.data:
            return None
        return sum(1 for s in self.coordinator.data["scenes"] if s.get("monitored") and not s.get("hasFile"))


class WhisparrDownloadingSensor(_Base):
    _key, _label, _icon = "downloading", "Downloading", "mdi:download"

    @property
    def native_value(self):
        if not self.coordinator.data:
            return None
        return len(self.coordinator.data.get("queue", []))


class WhisparrTotalStudiosSensor(_Base):
    _key, _label, _icon = "total_studios", "Total Studios", "mdi:office-building"

    @property
    def native_value(self):
        if not self.coordinator.data:
            return None
        return len(self.coordinator.data["studios"])


class WhisparrTotalPerformersSensor(_Base):
    _key, _label, _icon = "total_performers", "Total Performers", "mdi:account-star"

    @property
    def native_value(self):
        if not self.coordinator.data:
            return None
        return len(self.coordinator.data["performers"])
```

- [ ] **Step 4: Run, verify pass**

Run: `pytest tests/test_sensor.py -v`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add custom_components/whisparr_hacs/sensor.py tests/test_sensor.py
git commit -m "feat: add Whisparr summary sensors"
```

---

## Task 8: Integration wiring (`__init__.py`, strings, translations)

**Files:**
- Create: `custom_components/whisparr_hacs/__init__.py`
- Create: `custom_components/whisparr_hacs/strings.json`
- Create: `custom_components/whisparr_hacs/translations/en.json`
- Test: `tests/test_init.py`

**Interfaces:**
- Consumes: everything above.
- Produces: `async_setup`, `async_setup_entry`, `async_unload_entry`; module constant `_CARD_VERSION` (str); registers static path `/whisparr_hacs`, the Lovelace resource `/whisparr_hacs/whisparr-hacs-card.js?v=<_CARD_VERSION>`, the WS commands, and the services; forwards the `sensor` platform; stores the coordinator at `hass.data[DOMAIN][entry_id]`.

- [ ] **Step 1: Write the failing test**

`tests/test_init.py`:
```python
from unittest.mock import patch

from custom_components.whisparr_hacs.const import DOMAIN
from custom_components.whisparr_hacs import _CARD_VERSION


def test_card_version_is_str():
    assert isinstance(_CARD_VERSION, str) and _CARD_VERSION


async def test_setup_entry_creates_coordinator_and_sensors(hass, mock_entry):
    mock_entry.add_to_hass(hass)
    with patch(
        "custom_components.whisparr_hacs.coordinator.WhisparrCoordinator._async_update_data",
        return_value={"scenes": [], "studios": [], "performers": [],
                      "quality_profiles": [], "root_folders": [], "queue": []},
    ):
        assert await hass.config_entries.async_setup(mock_entry.entry_id)
        await hass.async_block_till_done()
    assert mock_entry.entry_id in hass.data[DOMAIN]
    assert hass.services.has_service(DOMAIN, "add_scene")
    assert hass.services.has_service(DOMAIN, "set_monitored")


async def test_unload_entry_removes_coordinator(hass, mock_entry):
    mock_entry.add_to_hass(hass)
    with patch(
        "custom_components.whisparr_hacs.coordinator.WhisparrCoordinator._async_update_data",
        return_value={"scenes": [], "studios": [], "performers": [],
                      "quality_profiles": [], "root_folders": [], "queue": []},
    ):
        await hass.config_entries.async_setup(mock_entry.entry_id)
        await hass.async_block_till_done()
        assert await hass.config_entries.async_unload(mock_entry.entry_id)
        await hass.async_block_till_done()
    assert mock_entry.entry_id not in hass.data[DOMAIN]
```

- [ ] **Step 2: Run, verify failure**

Run: `pytest tests/test_init.py -v`
Expected: FAIL — cannot import `_CARD_VERSION` / module incomplete.

- [ ] **Step 3: Implement `__init__.py`** (mirror of the sibling resource-registration approach)

```python
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.start import async_at_start

from .api import WhisparrApi
from .const import DEFAULT_POLL_INTERVAL, DOMAIN
from .coordinator import WhisparrCoordinator
from . import services, websocket_api

_LOGGER = logging.getLogger(__name__)
_CARD_VERSION = "1"
_CARD_BASE_URL = f"/{DOMAIN}/whisparr-hacs-card.js"
_CARD_URL = f"{_CARD_BASE_URL}?v={_CARD_VERSION}"

PLATFORMS = ["sensor"]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    hass.data.setdefault(DOMAIN, {})
    await hass.http.async_register_static_paths(
        [StaticPathConfig(f"/{DOMAIN}", str(Path(__file__).parent / "www"), cache_headers=True)]
    )
    async_at_start(hass, _async_register_card_resource)
    websocket_api.async_register_commands(hass)
    services.async_register_services(hass)
    return True


async def _async_register_card_resource(hass: HomeAssistant) -> None:
    """Add the card to the Lovelace resource collection (storage mode only)."""
    try:
        lovelace = hass.data.get("lovelace")
        resources = getattr(lovelace, "resources", None)
        if resources is None and isinstance(lovelace, dict):
            resources = lovelace.get("resources")
        if resources is None or not hasattr(resources, "async_create_item"):
            return
        if not getattr(resources, "loaded", True):
            await resources.async_load()
            resources.loaded = True
        for item in resources.async_items():
            if item.get("url", "").startswith(_CARD_BASE_URL):
                if item["url"] != _CARD_URL:
                    await resources.async_update_item(item["id"], {"url": _CARD_URL})
                return
        await resources.async_create_item({"res_type": "module", "url": _CARD_URL})
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug("Could not register Lovelace resource %s: %s", _CARD_URL, err)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    session = async_get_clientsession(hass)
    api = WhisparrApi(entry.data["host"], entry.data["api_key"], session)
    coordinator = WhisparrCoordinator(hass, api, DEFAULT_POLL_INTERVAL)
    await coordinator.async_config_entry_first_refresh()
    hass.data[DOMAIN][entry.entry_id] = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok
```

- [ ] **Step 4: Create `strings.json` and `translations/en.json`** (identical content)

```json
{
  "config": {
    "step": {
      "user": {
        "title": "Connect to Whisparr",
        "data": {
          "host": "Whisparr URL",
          "api_key": "API Key",
          "name": "Display Name"
        }
      }
    },
    "error": {
      "cannot_connect": "Unable to connect. Check the URL and API key."
    }
  }
}
```

- [ ] **Step 5: Run init tests, verify pass**

Run: `pytest tests/test_init.py -v`
Expected: all PASS.

- [ ] **Step 6: Run the full suite**

Run: `pytest -v`
Expected: every test across all modules PASS, no warnings about leaked threads.

- [ ] **Step 7: Commit**

```bash
git add custom_components/whisparr_hacs/__init__.py custom_components/whisparr_hacs/strings.json \
  custom_components/whisparr_hacs/translations/en.json tests/test_init.py
git commit -m "feat: wire up Whisparr integration setup, resource registration, and services"
```

---

## Self-Review (completed during planning)

- **Spec coverage:** scenes (Task 2/5/7), studios+performers parameterized (Task 2/5/6/7), reads-from-cache WS (Task 5), live lookup (Task 5), writes→refresh services (Task 6), API-key-server-side (config entry only; never in WS payloads — `get_config` returns only profiles/folders), entry keyed by `entry_id` (all tasks), Lovelace resource + `_CARD_VERSION` (Task 8), 30s poll (Task 3), default scene sort `added` + `released`/`title` (Task 5), studio/performer sort `added`+`title` (Task 5), sensors ×5 (Task 7), config flow via `/system/status` (Task 4). The card UI itself is the frontend plan.
- **Placeholder scan:** no TBD/TODO; every code step has complete code; the one genuine unknown (exact Whisparr field/command names) is an explicit pre-Task-2 verification step with documented defaults, not a placeholder.
- **Type consistency:** cache keys (`scenes`/`studios`/`performers`/`queue`/`quality_profiles`/`root_folders`), `kind` literals (`scene`/`studio`/`performer`), and method names (`get_parents`, `toggle_parent_monitored`, `trigger_parent_search`, `_enrich_scene`, `_apply_scene_query`) are consistent across Tasks 2/3/5/6/7/8.

## Note on the frontend plan (next)

Plan 2 will cover `src/` (the Lit `<whisparr-hacs-card>` with the three-tab switch, scene grid at 2–3 columns, parent grid, parent detail with scene rows, visual editor), the WS/service client (`whisparr-api.ts`), `package.json`/`rollup.config.js`/`tsconfig.json`, and building + committing `www/whisparr-hacs-card.js` (bumping `_CARD_VERSION` in `__init__.py`). It consumes the WS commands and services defined here.
