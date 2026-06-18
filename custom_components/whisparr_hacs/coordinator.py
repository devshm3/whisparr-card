from __future__ import annotations

import asyncio
import logging
from datetime import timedelta

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import WhisparrApi

_LOGGER = logging.getLogger(__name__)


class WhisparrCoordinator(DataUpdateCoordinator):
    def __init__(self, hass: HomeAssistant, api: WhisparrApi, poll_interval: int) -> None:
        super().__init__(hass, _LOGGER, name="Whisparr", update_interval=timedelta(seconds=poll_interval))
        self.api = api

    async def _async_update_data(self) -> dict:
        try:
            scenes, studios, performers, quality_profiles, root_folders, queue = await asyncio.gather(
                self.api.get_scenes(),
                self.api.get_parents("studio"),
                self.api.get_parents("performer"),
                self.api.get_quality_profiles(),
                self.api.get_root_folders(),
                self.api.get_queue(),
            )
            return {
                "scenes": scenes,
                "studios": studios,
                "performers": performers,
                "quality_profiles": quality_profiles,
                "root_folders": root_folders,
                "queue": queue,
            }
        except Exception as err:
            raise UpdateFailed(f"Error communicating with Whisparr: {err}") from err
