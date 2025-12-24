## 🎮 Vibe Horror Starter Kit

**Production-ready scaffold** for MCP-driven Godot horror prototyping:

### ✅ Core Features Delivered
- **MCP servers.json** — filesystem/git/github/assets/godot-introspect
- **Devcontainer** — Node20 + GodotTools + auto-setup
- **Asset pipeline** — file-drop stub (`tools/server-assets.mjs`)
- **SanitySystem** — autoload GDScript w/ signals, thresholds, recovery
- **Demo scene** — `demo_sanity.tscn` exercises Sanity via UI buttons
- **CI** — GDScript lint + asset folder validation

### 🚀 Quickstart
1. Codespaces → `godot/` → Add `Sanity` autoload
2. Run `demo_sanity.tscn`  
3. MCP prompt: "Generate texture 'creeping_shadow_01' → wire to Sanity break"

### 📋 Next Integration
- Real asset APIs (textures/audio)
- Sanity-driven horror effects (distortion, whispers)
- ALN scripting layer

Closes #TODO-vibeforge-starter
