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
