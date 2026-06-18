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
        post_call = m.requests[("POST", URL(f"{BASE}/movie"))][0]
    assert result["id"] == 1
    assert post_call.kwargs["json"] == payload


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


async def test_get_queue_returns_empty_when_records_absent(api):
    with aioresponses() as m:
        m.get(f"{BASE}/queue?pageSize=1000", payload={})
        assert await api.get_queue() == []


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
        result = await api.add_parent(kind, {"foreignId": "z"})
        post_call = m.requests[("POST", URL(f"{BASE}/{path}"))][0]
    assert result["id"] == 5
    assert post_call.kwargs["json"] == {"foreignId": "z"}


@_pytest.mark.parametrize("kind,path", [("studio", "studio"), ("performer", "performer")])
async def test_delete_parent_ignores_404(api, kind, path):
    with aioresponses() as m:
        m.delete(f"{BASE}/{path}/99", status=404)
        await api.delete_parent(kind, 99)


@_pytest.mark.parametrize("kind,path", [("studio", "studio"), ("performer", "performer")])
async def test_delete_parent_raises_on_server_error(api, kind, path):
    with aioresponses() as m:
        m.delete(f"{BASE}/{path}/1", status=500)
        with pytest.raises(aiohttp.ClientResponseError):
            await api.delete_parent(kind, 1)


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
