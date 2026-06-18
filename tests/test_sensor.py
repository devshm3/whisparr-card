from unittest.mock import MagicMock

from custom_components.whisparr_hacs.sensor import (
    WhisparrTotalScenesSensor, WhisparrMissingScenesSensor, WhisparrDownloadingSensor,
    WhisparrTotalStudiosSensor, WhisparrTotalPerformersSensor,
)
from tests.conftest import MOCK_SCENE, MOCK_SCENE_MISSING, MOCK_STUDIO, MOCK_PERFORMER


def _coord():
    c = MagicMock()
    c.data = {
        "scenes": [MOCK_SCENE, MOCK_SCENE_MISSING],
        "studios": [MOCK_STUDIO],
        "performers": [MOCK_PERFORMER],
        "queue": [{"movieId": 2}],
    }
    return c


def test_total_scenes():
    assert WhisparrTotalScenesSensor(_coord(), "e", "W").native_value == 2


def test_missing_scenes_counts_monitored_without_file():
    assert WhisparrMissingScenesSensor(_coord(), "e", "W").native_value == 1


def test_downloading_counts_queue():
    assert WhisparrDownloadingSensor(_coord(), "e", "W").native_value == 1


def test_total_studios_and_performers():
    assert WhisparrTotalStudiosSensor(_coord(), "e", "W").native_value == 1
    assert WhisparrTotalPerformersSensor(_coord(), "e", "W").native_value == 1


def test_native_value_none_without_data():
    c = MagicMock()
    c.data = None
    assert WhisparrTotalScenesSensor(c, "e", "W").native_value is None
