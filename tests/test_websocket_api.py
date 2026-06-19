import pytest
from unittest.mock import AsyncMock, MagicMock
from custom_components.whisparr_hacs import websocket_api as wsa
from tests.conftest import MOCK_SCENE, MOCK_SCENE_MISSING, MOCK_STUDIO, MOCK_PERFORMER

ws_get_scenes_unwrapped = wsa.ws_get_scenes.__wrapped__
ws_get_parents_unwrapped = wsa.ws_get_parents.__wrapped__


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


def test_apply_scene_query_available_excludes_unmonitored_with_file():
    unmon = wsa._enrich_scene({"id": 9, "title": "X", "hasFile": True, "monitored": False, "added": "2026-01-01T00:00:00Z"}, {})
    have = wsa._enrich_scene(MOCK_SCENE, {})
    pool = [unmon, have]
    assert [s["id"] for s in wsa._apply_scene_query(pool, "", "available", "added")] == [1]
    assert [s["id"] for s in wsa._apply_scene_query(pool, "", "unmonitored", "added")] == [9]


async def test_ws_get_parents_counts_members(hass):
    hass.data[wsa.DOMAIN] = {"test_entry_id": _coord_with_data()}
    sent = {}
    conn = MagicMock()
    conn.send_result.side_effect = lambda _id, payload: sent.update(payload)
    await ws_get_parents_unwrapped(hass, conn, _msg(kind="studio"))
    assert sent["parents"][0]["sceneCount"] == 2
    assert sent["parents"][0]["missingCount"] == 1
    assert sent["parents"][0]["displayName"] == "Vixen"


async def test_ws_get_parents_tolerates_released_sort(hass):
    # "released" is scene-only; parents must not error on it — the schema accepts it
    # and _build_parents_result falls through to the default "added" sort.
    assert "released" in wsa.ws_get_parents._ws_schema.schema["sort"].container
    hass.data[wsa.DOMAIN] = {"test_entry_id": _coord_with_data()}
    sent = {}
    conn = MagicMock()
    conn.send_result.side_effect = lambda _id, payload: sent.update(payload)
    await ws_get_parents_unwrapped(hass, conn, _msg(kind="studio", sort="released"))
    assert "parents" in sent


# --- performer gender filter ---

_PERF_FEMALE = {"id": 20, "fullName": "Jane", "foreignId": "p-f", "monitored": True, "added": "2026-02-01T00:00:00Z", "gender": "Female", "images": []}
_PERF_MALE = {"id": 21, "fullName": "John", "foreignId": "p-m", "monitored": True, "added": "2026-02-02T00:00:00Z", "gender": "Male", "images": []}
_PERF_OTHER = {"id": 22, "fullName": "Sam", "foreignId": "p-o", "monitored": True, "added": "2026-02-03T00:00:00Z", "gender": "Other", "images": []}
_PERF_NONE = {"id": 23, "fullName": "Pat", "foreignId": "p-n", "monitored": True, "added": "2026-02-04T00:00:00Z", "images": []}


def _coord_with_performers():
    coord = MagicMock()
    coord.data = {
        "scenes": [],
        "studios": [MOCK_STUDIO],
        "performers": [_PERF_FEMALE, _PERF_MALE, _PERF_OTHER, _PERF_NONE],
        "queue": [],
        "quality_profiles": [],
        "root_folders": [],
    }
    coord.api = AsyncMock()
    return coord


async def _parent_ids(hass, **msg_kw):
    hass.data[wsa.DOMAIN] = {"test_entry_id": _coord_with_performers()}
    sent = {}
    conn = MagicMock()
    conn.send_result.side_effect = lambda _id, payload: sent.update(payload)
    await ws_get_parents_unwrapped(hass, conn, _msg(**msg_kw))
    return {p["id"] for p in sent["parents"]}


async def test_gender_female_shows_only_female(hass):
    assert await _parent_ids(hass, kind="performer", gender="female") == {20}


async def test_gender_male_shows_only_male(hass):
    assert await _parent_ids(hass, kind="performer", gender="male") == {21}


async def test_gender_all_shows_everyone(hass):
    assert await _parent_ids(hass, kind="performer", gender="all") == {20, 21, 22, 23}


async def test_gender_omitted_shows_everyone(hass):
    assert await _parent_ids(hass, kind="performer") == {20, 21, 22, 23}


async def test_gender_filter_ignored_for_studios(hass):
    # gender is a performer-only concept; passing it on a studio query must not drop studios.
    assert await _parent_ids(hass, kind="studio", gender="male") == {10}
