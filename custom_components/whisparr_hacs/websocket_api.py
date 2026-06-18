# custom_components/whisparr_hacs/websocket_api.py
from __future__ import annotations

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PARENT_KINDS

_RELEASE_FIELDS = ("digitalRelease", "releaseDate", "inCinemas")


def async_register_commands(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_get_scenes)
    websocket_api.async_register_command(hass, ws_get_parents)
    websocket_api.async_register_command(hass, ws_get_parent_scenes)
    websocket_api.async_register_command(hass, ws_lookup_scene)
    websocket_api.async_register_command(hass, ws_lookup_parent)
    websocket_api.async_register_command(hass, ws_get_config)


def _release_date(scene: dict) -> str:
    for field in _RELEASE_FIELDS:
        if scene.get(field):
            return scene[field]
    return ""


def _scene_parent_foreign_ids(scene: dict, kind: str) -> set:
    if kind == "studio":
        fid = scene.get("studioForeignId")
        return {fid} if fid else set()
    # performer: scenes carry a credits[] list of people
    return {c.get("foreignId") for c in scene.get("credits", []) if c.get("foreignId")}


def _parent_name(parent: dict, kind: str) -> str:
    if kind == "performer":
        return parent.get("fullName") or parent.get("title") or ""
    return parent.get("title") or ""


def _enrich_scene(scene: dict, queue_map: dict) -> dict:
    sid = scene["id"]
    monitored = bool(scene.get("monitored", True))
    enriched = {
        **scene,
        "monitored": monitored,
        "inQueue": sid in queue_map,
        "available": bool(scene.get("hasFile")) and monitored,
    }
    if sid in queue_map:
        q = queue_map[sid]
        enriched["queueItem"] = {
            "size": q.get("size", 0),
            "sizeleft": q.get("sizeleft", 0),
            "timeleft": q.get("timeleft"),
            "status": q.get("status", ""),
            "protocol": q.get("protocol", ""),
        }
    return enriched


def _apply_scene_query(scenes: list, search: str, filter_val, sort: str) -> list:
    out = scenes
    if search:
        s = search.lower()
        out = [m for m in out if s in m.get("title", "").lower()]
    if filter_val == "available":
        out = [m for m in out if m.get("available")]
    elif filter_val == "missing":
        out = [m for m in out if not m.get("hasFile") and m.get("monitored")]
    elif filter_val == "downloading":
        out = [m for m in out if m.get("inQueue") and not m.get("hasFile")]
    elif filter_val == "unmonitored":
        out = [m for m in out if not m.get("monitored")]
    if sort == "title":
        out = sorted(out, key=lambda m: m.get("title", "").lower())
    elif sort == "released":
        out = sorted(out, key=_release_date, reverse=True)
    else:  # "added" (default)
        out = sorted(out, key=lambda m: m.get("added", ""), reverse=True)
    return out


def _coordinator(hass, connection, msg):
    coordinator = hass.data.get(DOMAIN, {}).get(msg["entry_id"])
    if coordinator is None:
        connection.send_error(msg["id"], "not_found", "Config entry not found")
        return None
    return coordinator


async def _build_scenes_result(coordinator, msg):
    queue_map = {item["movieId"]: item for item in coordinator.data.get("queue", []) if "movieId" in item}
    scenes = [_enrich_scene(s, queue_map) for s in coordinator.data["scenes"]]
    scenes = _apply_scene_query(scenes, msg.get("search", ""), msg.get("filter"), msg.get("sort", "added"))
    return {"scenes": scenes}


async def _build_parents_result(coordinator, msg):
    kind = msg["kind"]
    scenes = coordinator.data["scenes"]
    parents = []
    for p in coordinator.data[f"{kind}s"]:
        fid = p.get("foreignId")
        members = [s for s in scenes if fid in _scene_parent_foreign_ids(s, kind)] if fid else []
        missing = sum(1 for s in members if not s.get("hasFile") and s.get("monitored"))
        parents.append({**p, "displayName": _parent_name(p, kind), "sceneCount": len(members), "missingCount": missing})
    search = msg.get("search", "").lower()
    if search:
        parents = [p for p in parents if search in p["displayName"].lower()]
    if msg.get("sort", "added") == "title":
        parents = sorted(parents, key=lambda p: p["displayName"].lower())
    else:
        parents = sorted(parents, key=lambda p: p.get("added", ""), reverse=True)
    return {"parents": parents}


@websocket_api.websocket_command({
    vol.Required("type"): "whisparr_hacs/get_scenes",
    vol.Required("entry_id"): str,
    vol.Optional("search"): str,
    vol.Optional("filter"): vol.In(["available", "missing", "downloading", "unmonitored"]),
    vol.Optional("sort"): vol.In(["title", "added", "released"]),
})
@websocket_api.async_response
async def ws_get_scenes(hass, connection, msg) -> None:
    coordinator = _coordinator(hass, connection, msg)
    if coordinator is None:
        return
    result = await _build_scenes_result(coordinator, msg)
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({
    vol.Required("type"): "whisparr_hacs/get_parents",
    vol.Required("entry_id"): str,
    vol.Required("kind"): vol.In(PARENT_KINDS),
    vol.Optional("search"): str,
    vol.Optional("sort"): vol.In(["title", "added"]),
})
@websocket_api.async_response
async def ws_get_parents(hass, connection, msg) -> None:
    coordinator = _coordinator(hass, connection, msg)
    if coordinator is None:
        return
    result = await _build_parents_result(coordinator, msg)
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({
    vol.Required("type"): "whisparr_hacs/get_parent_scenes",
    vol.Required("entry_id"): str,
    vol.Required("kind"): vol.In(PARENT_KINDS),
    vol.Required("parent_id"): int,
    vol.Optional("search"): str,
    vol.Optional("filter"): vol.In(["available", "missing", "downloading", "unmonitored"]),
    vol.Optional("sort"): vol.In(["title", "added", "released"]),
})
@websocket_api.async_response
async def ws_get_parent_scenes(hass, connection, msg) -> None:
    coordinator = _coordinator(hass, connection, msg)
    if coordinator is None:
        return
    kind = msg["kind"]
    parent = next((p for p in coordinator.data[f"{kind}s"] if p["id"] == msg["parent_id"]), None)
    if parent is None:
        connection.send_error(msg["id"], "not_found", "Parent not found")
        return
    fid = parent.get("foreignId")
    queue_map = {item["movieId"]: item for item in coordinator.data.get("queue", []) if "movieId" in item}
    members = [_enrich_scene(s, queue_map) for s in coordinator.data["scenes"]
               if fid and fid in _scene_parent_foreign_ids(s, kind)]
    members = _apply_scene_query(members, msg.get("search", ""), msg.get("filter"), msg.get("sort", "added"))
    connection.send_result(msg["id"], {"scenes": members})


@websocket_api.websocket_command({
    vol.Required("type"): "whisparr_hacs/lookup_scene",
    vol.Required("entry_id"): str,
    vol.Required("term"): str,
})
@websocket_api.async_response
async def ws_lookup_scene(hass, connection, msg) -> None:
    coordinator = _coordinator(hass, connection, msg)
    if coordinator is None:
        return
    try:
        results = await coordinator.api.search_scenes(msg["term"])
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "whisparr_error", str(err))
        return
    library = {s.get("foreignId") for s in coordinator.data["scenes"]}
    for r in results:
        r["inLibrary"] = r.get("foreignId") in library
    connection.send_result(msg["id"], {"results": results})


@websocket_api.websocket_command({
    vol.Required("type"): "whisparr_hacs/lookup_parent",
    vol.Required("entry_id"): str,
    vol.Required("kind"): vol.In(PARENT_KINDS),
    vol.Required("term"): str,
})
@websocket_api.async_response
async def ws_lookup_parent(hass, connection, msg) -> None:
    coordinator = _coordinator(hass, connection, msg)
    if coordinator is None:
        return
    kind = msg["kind"]
    try:
        results = await coordinator.api.search_parents(kind, msg["term"])
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "whisparr_error", str(err))
        return
    library = {p.get("foreignId") for p in coordinator.data[f"{kind}s"]}
    for r in results:
        r["inLibrary"] = r.get("foreignId") in library
    connection.send_result(msg["id"], {"results": results})


@websocket_api.websocket_command({
    vol.Required("type"): "whisparr_hacs/get_config",
    vol.Required("entry_id"): str,
})
@websocket_api.async_response
async def ws_get_config(hass, connection, msg) -> None:
    coordinator = _coordinator(hass, connection, msg)
    if coordinator is None:
        return
    connection.send_result(msg["id"], {
        "quality_profiles": coordinator.data["quality_profiles"],
        "root_folders": coordinator.data["root_folders"],
    })
