# SFM — Simple File Manager

> A fast, keyboard-friendly file manager for Windows, built with Electron.

---

**Project structure (important files & folders)**

- `package.json` — project manifest, scripts, and author metadata
- `readme.md` — this file
- `src/` — application source
	- `main/` — Electron main process, preload, and IPC helpers
	- `renderer/` — renderer process UI, components, views and styles
	- `assets/` — bundled icons and static assets (includes Bootstrap Icons)
	- `workers/` — Node worker threads for filesystem and background tasks
	- `shared/` — shared modules (e.g., `gio.js`)
- `wdio.conf.js`, `types.js` — test / tooling configs
- `screenshots/` — project screenshots used in the README

This application is targeted for Windows (uses native icon resolution and Windows-specific device support).


## Screenshots

<div align="left">
	<img src="screenshots/thumb_nails.png" alt="Thumbnails view" width="400"/>
	<img src="screenshots/search.png" alt="Search UI" width="400"/>
	<img src="screenshots/properties.png" alt="Properties dialog" width="400"/>
	<img src="screenshots/settings.png" alt="Settings dialog" width="400"/>
	<!-- <img src="screenshots/copy_overwrite.png" alt="Copy/Overwrite dialog" width="400"/> -->
</div>

---

## Features

### Navigation
- **Multi-tab browsing** with persistent tab history and back / forward navigation
- **Breadcrumb bar** with inline location input and path autocomplete
- **Sidebar** with quick links to Home, Documents, Downloads, Music, Pictures, Videos, Recent Files, and File System root
- **Recent files** view

### File Operations
- **Copy, cut, paste** files and folders
- **Drag-and-drop** to move or copy between locations (hold `Ctrl` to copy)
- **Rename** files and folders inline
- **Create** new folders
- **Delete** files and folders
- **Overwrite conflict resolution** — choose to replace or skip per file

### Views & Sorting
- **List view** and **Grid view**
- Configurable **columns** (name, size, modified, created, accessed, type, path, count)
- Resizable columns with persistent widths
- **Sort** by name, size, modified, created, or accessed — ascending or descending
- **Filter** files by name in the current view
- **Show / hide hidden files**

### Selection
- **Click**, **Ctrl+click**, and **Shift+click** selection
- **Drag-select** with a rubber-band rectangle
- **Auto-scroll** when dragging near the top or bottom edge of the view
- **Select all** (`Ctrl+A`)

### Compression & Archives
- **Compress** selected files to `tar.gz`, `tar.xz`, or `zip`
- **Extract** archives in place
- Progress indicator with cancel support

### Network & Devices
- **SSHFS** and **SSH** connections (public key or password authentication)
- **SMB / Windows Share** connections
- **Mount and unmount** drives and removable media
- **MTP** mobile device support (phones, tablets)
- **Disk usage indicator** per device in the sidebar
- **Connect to Network** button in the Devices panel

### Workspace Bookmarks
- **Pin folders** to the Workspace sidebar for quick access
- Rename, remove, and reorder bookmarks
- Folder icons displayed per bookmark

### File Properties
- Size, permissions, MIME type, timestamps, and more
- **Folder size** calculation in the background

### Icons & Thumbnails
- System-resolved file and folder icons via native GIO
- **Lazy-loaded icons** for large directories
- Resizable icons (`Ctrl+Wheel`)

### Settings
- View preference (list / grid)
- Default sort order and direction
- Startup location
- Disk utility application
- Show / hide hidden files
- Icon sizes (grid and list independently)

### Keyboard Shortcuts

| Action | Shortcut |
|---|---|
| New folder | `Ctrl+Shift+N` |
| Cut | `Ctrl+X` |
| Copy | `Ctrl+C` |
| Paste | `Ctrl+V` |
| Rename | `F2` |
| Delete | `Delete` |
| Select all | `Ctrl+A` |
| Open in new tab | `Ctrl+T` |
| Navigate back | `Alt+Left` |
| Navigate forward | `Alt+Right` |
| Go to location | `Ctrl+L` |

---

## Requirements

- Windows 10 / 11 (x86-64)
- Node.js ≥ 18

---

## Installation

```bash
git clone https://github.com/sahilbajaj2004/FileManager.git
cd FileManager
npm install
```

## Run / Development

- Install dependencies:

```bash
npm install
```

- Start the app in development (Electron):

```bash
npm start
```

- Build a Windows installer:

```bash
npm run build
```

- Run tests (Jest):

```bash
npm test
```

Notes:
- Requires Node.js >= 18 and a Windows environment.
- Electron is launched from the project root; if you open the project in VS Code, run `npm start` in an integrated terminal.
- The build output is written to the `dist/` directory when using `npm run build`.
```

---

## Build

Produces a Windows installer:

```bash
npm run build
```

Output is written to the `dist/` directory.

---

## Tech Stack

| Component | Technology |
|---|---|
| Shell | Electron |
| Native FS / Icons | GIO (custom N-API addon) |
| Icons | Bootstrap Icons |
| Workers | Node.js Worker Threads |
| Tests | Jest |

---

## Contributing

Contributions, issues, and pull requests are welcome.
Please open an issue first to discuss significant changes.

---

## Author

**Sahil Bajaj** — [sahilbajaj2004@gmail.com](mailto:sahilbajaj2004@gmail.com)
[https://github.com/sahilbajaj2004/FileManager](https://github.com/sahilbajaj2004/FileManager)