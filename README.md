# Whisparr Card

A Home Assistant integration that gives you full Whisparr v3 control from a single Lovelace card — browse studios, performers, and scenes, search and add new content, monitor downloads, and toggle monitoring without leaving your dashboard.

[![Open your Home Assistant instance and add this integration.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=devshm3&repository=whisparr-card&category=integration)

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/devshm3)

![Whisparr Card](docs/images/hero.png)

<!-- Screenshot files live in docs/images/ — see docs/images/README.md for the
     expected filenames. Replace any placeholder that 404s with your own capture. -->

## Features

- **Three tabs** — **Scenes** (a poster grid), **Studios**, and **Performers** (monitored parents with their scenes)
- **Landscape posters** — built for Whisparr's wide scene artwork, not vertical movie posters
- **Scene grid** — browse scenes with filter tabs (All / Available / Missing / Downloading / Unmonitored) and an inline detail panel for quality, file info, and overview
- **Sort by recency** — scenes default to most-recently-added, with **Added / Released / Title** sort options
- **Studios & performers** — open a studio or performer to manage its monitored state, "search all", and its scenes grouped into collapsible **release-year** sections
- **Performer gender filter** — optionally show only female or only male performers (see `performer_gender`)
- **Unified search** — filters your library instantly; falls through to a live Whisparr lookup for titles not yet in your collection
- **Add content** — pick quality profile, root folder, and monitored state, then add a scene, studio, or performer directly from the card
- **Download progress** — active downloads show a progress bar and time remaining, auto-refreshing every 15 seconds
- **Monitored toggle** — flip a scene, studio, or performer between monitored and unmonitored in place
- **Two-step delete** — confirm before removing anything from Whisparr
- **Summary sensors** — scenes, missing, downloading, studios, and performers per Whisparr instance
- **Automatable services** — add, delete, refresh, toggle monitored, and trigger search via HA services
- **Multi-instance** — one card per Whisparr instance
- **Two looks** — choose **Glass** (theme-adaptive translucent) or **Material You** (MD3, auto light/dark)
- **Fully adaptive** — uses HA CSS variables, works with any theme

## Appearance

Choose the card's look in the visual editor (or with `appearance:` in YAML).
**Glass** adapts to your Home Assistant theme; **Material You** renders Material
Design 3 surfaces and auto-switches between light and dark with your HA mode.

### Glass

| Dark | Light |
|------|-------|
| ![Glass appearance, dark mode](docs/images/glass-dark.png) | ![Glass appearance, light mode](docs/images/glass-light.png) |

### Material You

| Dark | Light |
|------|-------|
| ![Material You appearance, dark mode](docs/images/material-dark.png) | ![Material You appearance, light mode](docs/images/material-light.png) |

### Other views

| Studio detail (year-grouped scenes) | Add a scene (Whisparr search) |
|-------------------------------------|-------------------------------|
| ![Studio detail with year accordion](docs/images/studio-detail.png) | ![Add a scene via Whisparr search](docs/images/add-scene.png) |

## Requirements

- Home Assistant 2024.1 or later
- Whisparr v3 or later

## Installation

### Via HACS (recommended)

1. Click the badge above, or open HACS → Integrations → ⋮ → Custom repositories, add `https://github.com/devshm3/whisparr-card`, category **Integration**
2. Download **Whisparr Card** and restart Home Assistant
3. Go to **Settings → Devices & Services → Add Integration → Whisparr Card**
4. Enter your Whisparr URL (e.g. `http://192.168.1.10:6969`) and API key
5. Add the **Whisparr Card** to any dashboard — the card JS loads automatically, no resource entry needed

### Manual

1. Copy `custom_components/whisparr_hacs/` into your HA config `custom_components/` directory
2. Restart Home Assistant
3. Configure the integration via **Settings → Devices & Services → Add Integration → Whisparr Card**

## Card Configuration

The visual editor auto-populates all fields. The card auto-detects your Whisparr instance — no manual entry ID lookup needed.

### YAML options

```yaml
type: custom:whisparr-hacs-card
entry_id: <your_entry_id>        # auto-filled by the editor
card_title: Whisparr             # optional header override
appearance: glass                # glass | material (Material You; auto light/dark)
default_view: scenes             # scenes | studios | performers
default_sort: added              # added | released | title
default_filter: all              # all | available | missing | downloading | unmonitored
performer_gender: all            # all | female | male  (Performers tab only)
columns: 2                       # poster grid columns (2–3)
page_size: 25                    # items shown before "View all"
poster_radius: 8                 # poster corner radius in px
show_studios_tab: true           # show the Studios tab
show_performers_tab: true        # show the Performers tab
show_status_badges: true         # status overlay on posters
show_filter_counts: true         # item counts on filter tabs
show_quality: true               # quality profile in detail panels
show_file_info: true             # file size and codec in detail panels
show_refresh_button: true        # manual refresh button in header
```

### Option reference

| Option | Default | Description |
|--------|---------|-------------|
| `entry_id` | — | Integration entry ID (auto-filled by the editor) |
| `card_title` | `Whisparr` | Card header title |
| `appearance` | `glass` | Card look: `glass` (theme-adaptive translucent) or `material` (Material You / MD3, follows HA light/dark mode) |
| `default_view` | `scenes` | Tab shown on load: `scenes`, `studios`, or `performers` |
| `default_sort` | `added` | Initial sort: `added`, `released`, or `title` (`released` applies to scenes only) |
| `default_filter` | `all` | Active scene filter tab on load |
| `performer_gender` | `all` | Performers to show: `all`, `female`, or `male`. Other/unknown gender shows only under `all` |
| `columns` | `2` | Poster grid columns (2–3) |
| `page_size` | `25` | Items shown before "View all" |
| `poster_radius` | `8` | Poster corner radius in px |
| `show_studios_tab` | `true` | Show the Studios tab |
| `show_performers_tab` | `true` | Show the Performers tab |
| `show_status_badges` | `true` | Coloured status badge on each poster |
| `show_filter_counts` | `true` | Item count bubble on each filter tab |
| `show_quality` | `true` | Quality profile name in the detail panel |
| `show_file_info` | `true` | File size and video codec in the detail panel |
| `show_refresh_button` | `true` | Manual refresh button in the card header |

## Sensors

The integration creates five sensors per configured Whisparr instance:

| Sensor | Description |
|--------|-------------|
| Total Scenes | Total number of scenes in the library |
| Missing Scenes | Monitored scenes without a file |
| Downloading | Scenes currently downloading |
| Total Studios | Number of studios in the library |
| Total Performers | Number of performers in the library |

## Services

| Service | Parameters | Description |
|---------|------------|-------------|
| `whisparr_hacs.add_scene` | `entry_id`, `foreign_id`, `title`, `quality_profile_id`, `root_folder`, `monitored`, `search_on_add` | Add a scene to Whisparr |
| `whisparr_hacs.add_parent` | `entry_id`, `kind` (studio/performer), `foreign_id`, `title`, `quality_profile_id`, `root_folder`, `monitored`, `search_on_add` | Add a studio or performer to Whisparr |
| `whisparr_hacs.set_monitored` | `entry_id`, `kind` (scene/studio/performer), `item_id`, `monitored` | Set monitored state on a scene, studio, or performer |
| `whisparr_hacs.trigger_search` | `entry_id`, `kind` (scene/studio/performer), `item_id` | Trigger Whisparr to search now |
| `whisparr_hacs.delete` | `entry_id`, `kind` (scene/studio/performer), `item_id`, `delete_files` (optional) | Remove an item from Whisparr |
| `whisparr_hacs.refresh_library` | `entry_id` | Trigger a full library refresh |

All services are available under **Developer Tools → Services** in Home Assistant.
