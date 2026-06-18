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
