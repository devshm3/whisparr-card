# custom_components/whisparr_hacs/sensor.py
from __future__ import annotations

from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import WhisparrCoordinator


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    coordinator: WhisparrCoordinator = hass.data[DOMAIN][entry.entry_id]
    name = entry.data["name"]
    async_add_entities([
        WhisparrTotalScenesSensor(coordinator, entry.entry_id, name),
        WhisparrMissingScenesSensor(coordinator, entry.entry_id, name),
        WhisparrDownloadingSensor(coordinator, entry.entry_id, name),
        WhisparrTotalStudiosSensor(coordinator, entry.entry_id, name),
        WhisparrTotalPerformersSensor(coordinator, entry.entry_id, name),
    ])


class _Base(CoordinatorEntity, SensorEntity):
    _attr_state_class = SensorStateClass.MEASUREMENT
    _key = ""
    _label = ""
    _icon = "mdi:movie-open"

    def __init__(self, coordinator: WhisparrCoordinator, entry_id: str, display_name: str) -> None:
        super().__init__(coordinator)
        self._attr_icon = self._icon
        self._attr_name = f"{display_name} {self._label}"
        self._attr_unique_id = f"{entry_id}_{self._key}"


class WhisparrTotalScenesSensor(_Base):
    _key, _label, _icon = "total_scenes", "Total Scenes", "mdi:movie-open"

    @property
    def native_value(self):
        if not self.coordinator.data:
            return None
        return len(self.coordinator.data["scenes"])


class WhisparrMissingScenesSensor(_Base):
    _key, _label, _icon = "missing_scenes", "Missing Scenes", "mdi:movie-off"

    @property
    def native_value(self):
        if not self.coordinator.data:
            return None
        return sum(1 for s in self.coordinator.data["scenes"] if s.get("monitored") and not s.get("hasFile"))


class WhisparrDownloadingSensor(_Base):
    _key, _label, _icon = "downloading", "Downloading", "mdi:download"

    @property
    def native_value(self):
        if not self.coordinator.data:
            return None
        return len(self.coordinator.data.get("queue", []))


class WhisparrTotalStudiosSensor(_Base):
    _key, _label, _icon = "total_studios", "Total Studios", "mdi:office-building"

    @property
    def native_value(self):
        if not self.coordinator.data:
            return None
        return len(self.coordinator.data["studios"])


class WhisparrTotalPerformersSensor(_Base):
    _key, _label, _icon = "total_performers", "Total Performers", "mdi:account-star"

    @property
    def native_value(self):
        if not self.coordinator.data:
            return None
        return len(self.coordinator.data["performers"])
