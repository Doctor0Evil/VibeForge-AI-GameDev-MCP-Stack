# MCP & Portable Godot Quickstart

This document contains concise, production-ready guidance for running a minimal MCP setup (suitcase stack), running the filesystem server on Windows without admin, making portable Godot zips, mounting both on USB, and wiring a PWA editor with the File System Access API.

## 1. Minimal `servers.json` for the suitcase stack (with `npx` filesystem)

Portable, single-root setup:

```json
{
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "${workspaceFolder}"
      ]
    },
    "git": {
      "command": "git",
      "args": ["status", "--porcelain=v2"]
    }
  }
}
```

This matches the “5‑minute MCP setup” pattern that runs `@modelcontextprotocol/server-filesystem` via `npx` and a single allowed root directory.

---

## 2. Configure `servers.json` to run filesystem on Windows without admin

You only need a user‑level Node install; no admin, no global packages.

**Config snippet (e.g., `mcp/servers.json` or client config):**

```json
{
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\YourUser\\Projects\\VibeForge"
      ]
    }
  }
}
```

Notes:

- Use an existing, absolute Windows path; keep drive letter casing consistent to avoid path‑scope bugs.
- If `npx` is on `PATH`, this works without admin; `npx` will download the package into your user cache and run it.

**If `npx` is flaky**:

1. Install the server once in dev deps:

```bash
npm install --save-dev @modelcontextprotocol/server-filesystem
```

2. Point `servers.json` at the local Node script:

```json
{
  "servers": {
    "filesystem": {
      "command": "node",
      "args": [
        "node_modules/@modelcontextprotocol/server-filesystem/dist/index.js",
        "."
      ]
    }
  }
}
```

This avoids global installs while staying admin‑less.

---

## 3. Create a portable ZIP of Godot (Windows + Linux)

Godot’s official zips are already portable; you just download, unzip, and (optionally) bundle your project.

### Windows editor (portable)

1. Download the **standard ZIP** for your Godot version (not the installer).
2. Extract e.g. to `D:\tools\godot-4.3-portable\`.
3. (Optional) Create a `data` dir next to the exe so config stays local:

   - `Godot_v4.3-stable_win64.exe`
   - `data/`

4. Run `Godot_v4.3-stable_win64.exe` directly; no install, registry, or admin needed.

### Linux editor (portable)

1. Download the Linux `.zip` / `.xz` build of the editor.
2. Extract somewhere in your home or USB drive, e.g. `/media/usb/godot-4.3-portable`.
3. Ensure executable bit is set:

```bash
chmod +x Godot_v4.3-stable_linux.x86_64
```

4. Run it directly; no system install needed.

### Portable game build (both OSes)

1. In Godot: `Project → Export…`, create platform preset (Windows/Linux).
2. Set export path into a `build/` folder (e.g. `build/win/VibeGame.exe`).
3. Export, then zip the build folder.

---

## 4. Mount USB portable Godot + portable VS Code

Example layout on USB:

- `X:\tools\godot\Godot_v4.3-stable_win64.exe`
- `X:\tools\vscode\Code.exe`
- `X:\projects\vibeforge\`

Start VS Code from USB: `X:\tools\vscode\Code.exe X:\projects\vibeforge`.
Start Godot from USB: `X:\tools\godot\Godot_v4.3-stable_win64.exe --path X:\projects\vibeforge\godot`.

Put `mcp/servers.json` inside the project and point your MCP client at it.

---

## 5. Integrate File System Access API in a PWA editor

Use the File System Access API to let the PWA open a project folder and edit files in place.

### Core API wiring

```js
let projectDirHandle = null;

async function pickProjectFolder() {
  projectDirHandle = await window.showDirectoryPicker();
}

async function readFile(relPath) {
  const handle = await projectDirHandle.getFileHandle(relPath);
  const file = await handle.getFile();
  return await file.text();
}

async function writeFile(relPath, contents) {
  const handle = await projectDirHandle.getFileHandle(relPath, { create: true });
  const writable = await handle.createWritable();
  await writable.write(contents);
  await writable.close();
}
```

### UI integration

Attach these helpers to simple buttons and an editor instance; serve over HTTPS or `localhost` so the File System Access API is available.

---

## References

- Model Context Protocol docs and server packages
- File System Access API docs
- Godot export and portability notes

