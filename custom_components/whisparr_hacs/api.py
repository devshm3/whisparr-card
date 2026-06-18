# Whisparr v3 API client. Endpoint/field/command names verified against a live
# v3 instance on 2026-06-17 (see plan verification table). Adjust the maps below
# if a future Whisparr build renames them.
from __future__ import annotations

import aiohttp

_PARENT_PATH = {"studio": "/studio", "performer": "/performer"}
# command name + id-list parameter name per parent kind
_PARENT_SEARCH = {"studio": ("StudioSearch", "studioIds"), "performer": ("PerformerSearch", "performerIds")}


class WhisparrApi:
    def __init__(self, host: str, api_key: str, session: aiohttp.ClientSession) -> None:
        self._base = host.rstrip("/") + "/api/v3"
        self._headers = {"X-Api-Key": api_key}
        self._session = session

    async def _request(self, method: str, endpoint: str, **kwargs):
        url = f"{self._base}{endpoint}"
        async with self._session.request(method, url, headers=self._headers, **kwargs) as resp:
            resp.raise_for_status()
            if resp.status == 204:
                return None
            try:
                return await resp.json()
            except aiohttp.ContentTypeError:
                return None

    # ---- scenes (movies) ----
    async def get_scenes(self) -> list[dict]:
        return await self._request("GET", "/movie")

    async def search_scenes(self, term: str) -> list[dict]:
        return await self._request("GET", "/movie/lookup", params={"term": term})

    async def add_scene(self, payload: dict) -> dict:
        return await self._request("POST", "/movie", json=payload)

    async def delete_scene(self, scene_id: int, delete_files: bool = False) -> None:
        params = {"deleteFiles": "true"} if delete_files else None
        try:
            await self._request("DELETE", f"/movie/{scene_id}", params=params)
        except aiohttp.ClientResponseError as err:
            if err.status != 404:  # already gone == desired end state
                raise

    async def toggle_scene_monitored(self, scene_id: int, monitored: bool) -> None:
        scene = await self._request("GET", f"/movie/{scene_id}")
        scene["monitored"] = monitored
        await self._request("PUT", f"/movie/{scene_id}", json=scene)

    async def trigger_scene_search(self, scene_id: int) -> None:
        await self.send_command("MoviesSearch", movieIds=[scene_id])

    # ---- monitored parents (studio / performer) ----
    async def get_parents(self, kind: str) -> list[dict]:
        return await self._request("GET", _PARENT_PATH[kind])

    async def search_parents(self, kind: str, term: str) -> list[dict]:
        return await self._request("GET", f"{_PARENT_PATH[kind]}/lookup", params={"term": term})

    async def add_parent(self, kind: str, payload: dict) -> dict:
        return await self._request("POST", _PARENT_PATH[kind], json=payload)

    async def delete_parent(self, kind: str, parent_id: int, delete_files: bool = False) -> None:
        params = {"deleteFiles": "true"} if delete_files else None
        try:
            await self._request("DELETE", f"{_PARENT_PATH[kind]}/{parent_id}", params=params)
        except aiohttp.ClientResponseError as err:
            if err.status != 404:
                raise

    async def toggle_parent_monitored(self, kind: str, parent_id: int, monitored: bool) -> None:
        parent = await self._request("GET", f"{_PARENT_PATH[kind]}/{parent_id}")
        parent["monitored"] = monitored
        await self._request("PUT", f"{_PARENT_PATH[kind]}/{parent_id}", json=parent)

    async def trigger_parent_search(self, kind: str, parent_id: int) -> None:
        name, id_param = _PARENT_SEARCH[kind]
        await self.send_command(name, **{id_param: [parent_id]})

    # ---- shared ----
    async def send_command(self, name: str, **kwargs) -> dict:
        return await self._request("POST", "/command", json={"name": name, **kwargs})

    async def get_quality_profiles(self) -> list[dict]:
        return await self._request("GET", "/qualityprofile")

    async def get_root_folders(self) -> list[dict]:
        return await self._request("GET", "/rootfolder")

    async def get_queue(self) -> list[dict]:
        data = await self._request("GET", "/queue", params={"pageSize": 1000})
        return data.get("records", []) if data else []

    async def test_connection(self) -> bool:
        try:
            await self._request("GET", "/system/status")
            return True
        except aiohttp.ClientError:
            return False
