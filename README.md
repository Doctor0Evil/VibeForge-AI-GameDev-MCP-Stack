# Vibe Horror Starter

A minimal, MCP-aware Godot starter focused on **vibe-first horror** prototyping with a shared sanity system and asset-drop pipeline.

## Features

- Autoload-friendly `SanitySystem` with normalized sanity, break thresholds, and signals.
- File-drop asset skeleton: tools for generating placeholder textures/audio into `godot/assets/generated`.
- Godot introspection helper for scenes/scripts as JSON for external agents.
- Devcontainer and CI wiring to keep layout consistent across machines.

## Getting started

1. Install Godot 4.x and ensure `godot` is on your PATH.
2. Open `godot/` as a project in Godot.
3. Add `res://scripts/core/sanity_system.gd` as an AutoLoad with name `Sanity`.
4. Open and run `res://scenes/demo_sanity.tscn`.

## MCP usage (high level)

- `mcp/servers.json` configures:
  - filesystem access
  - basic git/GitHub awareness
  - `assets` server for file-drop generation
  - `godot-introspect` server for scene/script listings

A typical prompt to your MCP client might be:

> Scan the Godot project, show me all scenes, then propose 3 sanity-driven event beats for `demo_sanity.tscn` and generate 2 stub texture filenames in `godot/assets/generated/textures`.

## Next steps

- Replace stub asset generation with real texture/audio calls (TODO: consider converting `tools/server-assets.mjs` to an HTTP JSON API for MCP clients / Express endpoint).
- Add an ALN or GDScript layer that maps sanity ranges to screen-space horror effects.
- Expand CI to run Godot unit tests once present.

---

## Documentation

See `docs/mcp-portable.md` for a concise MCP & portability quickstart (npx filesystem, Windows no-admin tips, portable Godot zips, USB layout, and PWA File System Access examples).
