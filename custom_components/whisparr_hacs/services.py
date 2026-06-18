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
        await coordinator.async_request_refresh()

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
