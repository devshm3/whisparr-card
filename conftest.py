"""Root conftest — make custom_components from this repo visible to HA's loader."""
import pathlib
import sys

import custom_components

_project_cc = str(pathlib.Path(__file__).parent / "custom_components")
if _project_cc not in custom_components.__path__:
    custom_components.__path__.append(_project_cc)
