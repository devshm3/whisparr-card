import type { HomeAssistant } from './ha-types.js';
import type { Scene, Parent, ParentKind, QualityProfile, RootFolder } from './types.js';

const DOMAIN = 'whisparr_hacs';

interface SceneQuery { filter?: string; sort?: string; search?: string }

export async function getScenes(hass: HomeAssistant, entryId: string, opts: SceneQuery = {}): Promise<Scene[]> {
  const msg: Record<string, unknown> = { type: `${DOMAIN}/get_scenes`, entry_id: entryId };
  if (opts.filter && opts.filter !== 'all') msg['filter'] = opts.filter;
  if (opts.sort) msg['sort'] = opts.sort;
  if (opts.search) msg['search'] = opts.search;
  const resp = await hass.connection.sendMessagePromise<{ scenes: Scene[] }>(msg);
  return resp.scenes;
}

export async function getParents(
  hass: HomeAssistant, entryId: string, kind: ParentKind, opts: { sort?: string; search?: string; gender?: string } = {}
): Promise<Parent[]> {
  const msg: Record<string, unknown> = { type: `${DOMAIN}/get_parents`, entry_id: entryId, kind };
  if (opts.sort) msg['sort'] = opts.sort;
  if (opts.search) msg['search'] = opts.search;
  if (opts.gender && opts.gender !== 'all') msg['gender'] = opts.gender;
  const resp = await hass.connection.sendMessagePromise<{ parents: Parent[] }>(msg);
  return resp.parents;
}

export async function getParentScenes(
  hass: HomeAssistant, entryId: string, kind: ParentKind, parentId: number, opts: SceneQuery = {}
): Promise<Scene[]> {
  const msg: Record<string, unknown> = { type: `${DOMAIN}/get_parent_scenes`, entry_id: entryId, kind, parent_id: parentId };
  if (opts.filter && opts.filter !== 'all') msg['filter'] = opts.filter;
  if (opts.sort) msg['sort'] = opts.sort;
  if (opts.search) msg['search'] = opts.search;
  const resp = await hass.connection.sendMessagePromise<{ scenes: Scene[] }>(msg);
  return resp.scenes;
}

export async function lookupScene(hass: HomeAssistant, entryId: string, term: string): Promise<Scene[]> {
  const resp = await hass.connection.sendMessagePromise<{ results: Scene[] }>({
    type: `${DOMAIN}/lookup_scene`, entry_id: entryId, term,
  });
  return resp.results;
}

export async function lookupParent(hass: HomeAssistant, entryId: string, kind: ParentKind, term: string): Promise<Parent[]> {
  const resp = await hass.connection.sendMessagePromise<{ results: Parent[] }>({
    type: `${DOMAIN}/lookup_parent`, entry_id: entryId, kind, term,
  });
  return resp.results;
}

export async function getConfig(
  hass: HomeAssistant, entryId: string
): Promise<{ quality_profiles: QualityProfile[]; root_folders: RootFolder[] }> {
  return hass.connection.sendMessagePromise({ type: `${DOMAIN}/get_config`, entry_id: entryId });
}

export async function addScene(
  hass: HomeAssistant, entryId: string, scene: Scene,
  qualityProfileId: number, rootFolder: string, monitored = true, searchOnAdd = true
): Promise<void> {
  await hass.callService(DOMAIN, 'add_scene', {
    entry_id: entryId, foreign_id: scene.foreignId, title: scene.title,
    quality_profile_id: qualityProfileId, root_folder: rootFolder, monitored, search_on_add: searchOnAdd,
  });
}

export async function addParent(
  hass: HomeAssistant, entryId: string, kind: ParentKind, parent: Parent,
  qualityProfileId: number, rootFolder: string, monitored = true, searchOnAdd = true
): Promise<void> {
  await hass.callService(DOMAIN, 'add_parent', {
    entry_id: entryId, kind, foreign_id: parent.foreignId,
    title: parent.displayName ?? parent.title ?? parent.fullName,
    quality_profile_id: qualityProfileId, root_folder: rootFolder, monitored, search_on_add: searchOnAdd,
  });
}

export async function setMonitored(
  hass: HomeAssistant, entryId: string, kind: string, itemId: number, monitored: boolean
): Promise<void> {
  await hass.callService(DOMAIN, 'set_monitored', { entry_id: entryId, kind, item_id: itemId, monitored });
}

export async function triggerSearch(
  hass: HomeAssistant, entryId: string, kind: string, itemId: number
): Promise<void> {
  await hass.callService(DOMAIN, 'trigger_search', { entry_id: entryId, kind, item_id: itemId });
}

export async function deleteItem(
  hass: HomeAssistant, entryId: string, kind: string, itemId: number, deleteFiles = false
): Promise<void> {
  await hass.callService(DOMAIN, 'delete', { entry_id: entryId, kind, item_id: itemId, delete_files: deleteFiles });
}
