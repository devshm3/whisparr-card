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
# bump on every rebuilt-card ship so browsers fetch fresh JS
_CARD_VERSION = "1"
_CARD_BASE_URL = f"/{DOMAIN}/whisparr-hacs-card.js"
_CARD_URL = f"{_CARD_BASE_URL}?v={_CARD_VERSION}"

PLATFORMS = ["sensor"]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    hass.data.setdefault(DOMAIN, {})
    if hass.http is not None:
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
