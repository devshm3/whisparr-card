export type View = 'scenes' | 'studios' | 'performers';
export type ParentKind = 'studio' | 'performer';

export interface MediaImage { coverType: string; remoteUrl: string }

export interface QueueItem {
  size: number;
  sizeleft: number;
  timeleft?: string;
  status: string;
  protocol?: string;
}

export interface Scene {
  id: number;
  foreignId?: string;
  title: string;
  year?: number;
  overview?: string;
  monitored: boolean;
  hasFile?: boolean;
  added?: string;
  digitalRelease?: string;
  releaseDate?: string;
  studioTitle?: string;
  studioForeignId?: string;
  images?: MediaImage[];
  credits?: Array<{ foreignId?: string; personName?: string }>;
  movieFile?: { quality?: { quality?: { name?: string } }; size?: number };
  qualityProfileId?: number;
  // enriched by the backend / lookup client
  inLibrary?: boolean;
  inQueue?: boolean;
  available?: boolean;
  queueItem?: QueueItem;
}

export interface Parent {
  id: number;
  foreignId?: string;
  title?: string;
  fullName?: string;
  monitored: boolean;
  added?: string;
  gender?: string;
  images?: MediaImage[];
  // enriched by the backend get_parents
  displayName?: string;
  sceneCount?: number;
  missingCount?: number;
  inLibrary?: boolean;
}

export interface QualityProfile { id: number; name: string }
export interface RootFolder { path: string; freeSpace: number }

export interface CardConfig {
  entry_id: string;
  default_view?: View;
  show_studios_tab?: boolean;
  show_performers_tab?: boolean;
  columns?: number;            // clamped to [2,3] at use
  default_sort?: 'added' | 'released' | 'title';
  default_filter?: string;
  performer_gender?: 'all' | 'female' | 'male';
  show_status_badges?: boolean;
  poster_radius?: number;
  card_title?: string;
  page_size?: number;
  show_quality?: boolean;
  show_file_info?: boolean;
  show_filter_counts?: boolean;
  show_refresh_button?: boolean;
  appearance?: 'glass' | 'material';
}
