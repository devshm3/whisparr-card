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
