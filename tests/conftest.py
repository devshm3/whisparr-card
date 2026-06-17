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
