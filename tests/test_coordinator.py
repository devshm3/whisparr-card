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
