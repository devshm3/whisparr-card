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
