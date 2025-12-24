<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# A portable, MCP-based “vibe‑coding” stack can give any AI chat the power to manage GitHub repos, Godot projects, and horror‑game asset pipelines, including PR automation and token handling, without requiring admin rights. The core ingredients are: MCP servers for Git/GitHub and filesystem, a Godot‑side AI bridge, and a small “identity broker” that replaces manual GITHUB_SECRETS with short‑lived, chat‑initiated tokens.[modelcontextprotocol+2](https://modelcontextprotocol.io/examples)​

Below is a concrete, implementation‑level blueprint tailored to your horror‑focused, multi‑chat, no‑admin environment.

1. Core Architecture: “Universal Vibe Agent”
Design around a three‑layer MCP architecture so any compliant AI chat (Perplexity/Comet‑style MCP, Gemini, Grok, etc.) can plug in.[github+1](https://github.com/modelcontextprotocol/servers)​
Client (AI chat / host)
Runs in the user’s browser or desktop app and speaks MCP.
Loads a config like your DevAssistant JSON, wiring in github and filesystem servers.[modelcontextprotocol](https://modelcontextprotocol.io/examples)​
Tooling MCP servers (“hands”)
@modelcontextprotocol/server-github (or server-git) for branch/commit/PR operations.[github+1](https://github.com/modelcontextprotocol/servers)​
@modelcontextprotocol/server-filesystem pointed at the Godot workspace for code and asset IO.[modelcontextprotocol+1](https://modelcontextprotocol.io/examples)​
Optional custom servers: server-godot (project introspection, running export scripts) and server-assets (hooks into external asset generators).
Identity broker (Vault proxy)
Small web service that holds GitHub App keys and issues short‑lived installation tokens on demand instead of relying on static GITHUB_SECRETS.youtube​
Exposed to the MCP servers via env vars or a simple HTTP API.
This makes the “vibe”/natural‑language orchestration portable across chat providers: each chat just needs MCP support and the same server manifest.[github+1](https://github.com/modelcontextprotocol/servers)​
2. GitHub \& PR Orchestration from Chat
Your sample MCP config is already close to what is needed to let the AI fully manage PRs while enforcing human review. Build on it with:[modelcontextprotocol](https://modelcontextprotocol.io/examples)​
GitHub MCP server capabilities
Use @modelcontextprotocol/server-github or a similar community server that supports: read repo, list branches, open PRs, comment, and merge.[github+1](https://github.com/modelcontextprotocol/servers)​
Configure minimal scopes: read:repos, write:pull-requests, write:issues; disable direct write:merge if you want review‑gated merges only.
Workflow integration
Store CI/CD and game‑build workflows in .github/workflows as usual.
Let the AI:
Edit workflow YAML via filesystem server.[modelcontextprotocol](https://modelcontextprotocol.io/examples)​
Create a feature branch, commit changes, and open a PR with a summary and check‑list.[github+1](https://github.com/modelcontextprotocol/servers)​
Monitor workflow status by reading GitHub checks or status APIs via the GitHub server.[github](https://github.com/modelcontextprotocol/servers)​
Human‑in‑the‑loop enforcement
Add branch protection on main so PRs require at least one review and passing checks.
In the MCP host, mark all write tools as “approval‑required”, so the model can propose but the user must click “Run” to execute.[modelcontextprotocol+1](https://modelcontextprotocol.io/examples)​
This gives you the “AI does the plumbing, human taps to confirm” vibe‑coding flow you described.
3. Godot + Horror Asset Pipelines
To bridge AI chats and Godot for horror‑focused assets and procedural generation, combine a Godot plugin like Fuku with filesystem and asset MCP servers.[godotengine+1](https://godotengine.org/asset-library/asset/2689)​
Godot‑side integration
Install Fuku (AI assistant plugin for Godot 4.x) so prompts inside the editor can generate or refactor GDScript, shaders, and scene files.[godotengine](https://godotengine.org/asset-library/asset/2689)​
Add an “AI Context Generator” step that exports project structure (nodes, scripts, signals) into JSON which the MCP client can feed into the model as context.[godotengine](https://godotengine.org/asset-library/asset/2689)​
Filesystem integration to the same workspace
Point server-filesystem to the Godot project directory (e.g., ./workspace/my_horror_game).[modelcontextprotocol](https://modelcontextprotocol.io/examples)​
AI can:
Generate GDScript for procedural level generation, sanity systems, event triggers.
Drop textures, audio files, and scene variants into known asset folders.
Horror‑asset generation workflow (prioritized)
Texture/tileset pipeline:
AI calls external generators (e.g., PBR texture services) via HTTP from a custom server-assets, then saves images into /assets/textures/horror/….[github](https://github.com/modelcontextprotocol/servers)​
Use an offline tool (Materialize or similar) to derive normal/roughness maps before import into Godot’s StandardMaterial3D.
2D horror UI and overlays:
Generate cracked glass, film grain, grime overlays as PNGs and wire them into Godot CanvasLayer scenes.
Audio pipeline:
Generate whispers, drones, creaks from online audio tools, then post‑process in Audacity or directly in Godot via AudioBuses and effects chains (reverb, pitch shift, EQ).[godotengine](https://godotengine.org/asset-library/asset/2689)​
The AI chat becomes the conductor: “Generate a new fleshy corridor texture, wire it into the corridor scene as an alternate material, and add a randomized whisper loop in that area.”
4. Secrets Without GITHUB_SECRETS: Identity Broker + GitHub App
To remove manual GITHUB_SECRETS handling and let chats manage access automatically, introduce a GitHub App + Manifest flow + OIDC‑style short‑lived tokens.youtube​[github](https://github.com/modelcontextprotocol/servers)​
GitHub App Manifest flow
Create a GitHub App using the manifest registration flow so users just follow a link, name the app, and approve scopes; no manual key copy/paste.youtube​
The callback to your broker receives the app’s installation id and private key, which you store in an encrypted backend.
Broker behavior
Exposes an internal API: POST /token { repo, scopes }.
Signs a JWT with the app private key and exchanges it for an installation access token from GitHub, valid for about an hour.youtube​
Returns that token to the server-github via env or ephemeral config so it can execute Git operations.
Integration with AI chat
When the user types “Connect my GitHub”, the chat presents an “Install App” link produced by the broker.
After the one‑time install, the chat never asks the user for PATs or secrets; it simply requests tokens via the broker when needed.youtube​
This pattern mirrors modern OIDC/Workload Identity Federation approaches and eliminates static secrets while still keeping the experience “one‑click” from the user’s perspective.youtube​
5. No‑Admin / Enterprise‑Friendly Deployment
To support tight enterprise machines with no admin, use user‑space strategies that avoid system‑wide installs.[modelcontextprotocol+1](https://modelcontextprotocol.io/examples)​
Browser‑only mode
Run the MCP host as a web app/PWA.
Implement filesystem access using the browser’s File System Access API so the user chooses a folder and grants read/write rights without installing anything.
Run lightweight MCP servers (Git, filesystem, asset) in WebAssembly inside the browser, so they can manipulate files directly without native binaries.
Portable “suitcase” stack
Ship Godot as a portable ZIP; enable portable mode so all settings live within that folder.
Use npx -y @modelcontextprotocol/server-filesystem and npx -y @modelcontextprotocol/server-github so Node‑based servers run from the project directory without global install.[github+1](https://github.com/modelcontextprotocol/servers)​
Provide a single “start‑vibe” script that spawns the MCP servers in the current user context.
Cloud container fallback (Codespaces)
For users with extremely locked‑down desktops, host the entire pipeline in GitHub Codespaces or similar.[github](https://github.com/modelcontextprotocol/servers)​
Inside the devcontainer, install MCP servers, Godot headless, and asset tools; the AI chat connects over forwarded ports using the GitHub API.
This combination lets the same architecture run locally, in‑browser, or in the cloud, all with the same vibe‑coding semantics but without requiring admin permissions.

If you want, the next step can be: a concrete servers.json/.devcontainer.json pair plus a Godot folder layout specifically tuned for an AI‑driven horror asset pipeline, so you can drop it into a public “Vibe Horror Starter” repo and begin experimenting immediately.
[https://modelcontextprotocol.io/examples](https://modelcontextprotocol.io/examples)
[https://godotengine.org/asset-library/asset/2689](https://godotengine.org/asset-library/asset/2689)
[https://github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
[https://www.youtube.com/watch?v=lsWOx9bzAwY](https://www.youtube.com/watch?v=lsWOx9bzAwY)
[https://github.com/no-fluff/awesome-vibe-coding](https://github.com/no-fluff/awesome-vibe-coding)
[https://www.youtube.com/watch?v=NmOAUrlJawI](https://www.youtube.com/watch?v=NmOAUrlJawI)
[https://dev.to/wasp/a-structured-workflow-for-vibe-coding-full-stack-apps-352l](https://dev.to/wasp/a-structured-workflow-for-vibe-coding-full-stack-apps-352l)
[https://www.youtube.com/watch?v=1DlNVROQ6DI](https://www.youtube.com/watch?v=1DlNVROQ6DI)
[https://www.leanware.co/insights/guide-to-vibe-coding](https://www.leanware.co/insights/guide-to-vibe-coding)
[https://stemsearchgroup.com/vibe-codings-public-scrutiny-why-mastering-ai-assisted-development-is-more-critical-than-ever/](https://stemsearchgroup.com/vibe-codings-public-scrutiny-why-mastering-ai-assisted-development-is-more-critical-than-ever/)

Yes—the next step being a concrete, drop‑in “Vibe Horror Starter” makes sense, and the stack you outlined maps cleanly onto current MCP, Godot, and GitHub App capabilities. Below is a focused, implementation‑level starter you can adapt into a public repo.[^1_1][^1_2]

## servers.json (MCP stack)

This assumes Node‑based MCP servers launched via npx from the repo root, with a broker‑issued GitHub App token exposed as an env var or HTTP endpoint.[^1_3][^1_2]

```jsonc
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem"
      ],
      "env": {
        "MCP_FS_ROOT": "./godot-project",
        "MCP_FS_MODE": "rw"
      }
    },
    "git": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-git"
      ],
      "env": {
        "MCP_GIT_REPO_PATH": "./godot-project",
        "MCP_GIT_DEFAULT_BRANCH": "main"
      }
    },
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_BROKER_URL": "https://your-broker.example.com/token",
        "GITHUB_APP_ID": "YOUR_APP_ID",
        "GITHUB_INSTALLATION_ID": "DYNAMIC_OR_PER_USER",
        "GITHUB_REPO_OWNER": "your-org-or-user",
        "GITHUB_REPO_NAME": "vibe-horror-starter",
        "GITHUB_MIN_SCOPES": "read:repo,write:pull_request,write:issue"
      }
    },
    "assets": {
      "command": "node",
      "args": [
        "./tools/server-assets.mjs"
      ],
      "env": {
        "ASSET_OUT_DIR": "./godot-project/assets/generated",
        "TEXTURE_API_URL": "https://your-texture-api.example.com",
        "AUDIO_API_URL": "https://your-audio-api.example.com"
      }
    },
    "godot-introspect": {
      "command": "node",
      "args": [
        "./tools/server-godot-introspect.mjs"
      ],
      "env": {
        "GODOT_PROJECT_ROOT": "./godot-project"
      }
    }
  }
}
```

Key behaviors (what you instruct the AI to do in “vibe mode”):

- Use **filesystem** to edit GDScript, scenes, shaders, and .github workflows.[^1_2]
- Use **git** to create feature branches and commits locally.[^1_2]
- Use **github** only for PRs/comments/status; merges gated via branch protection.[^1_2]
- Use **assets** for “generate horror texture/ambience X and drop into the correct folder”.
- Use **godot-introspect** to dump project structure and recommended entrypoints for changes.


## .devcontainer.json (Codespaces / container)

This devcontainer glues Godot, MCP servers, and Git tooling into one repeatable environment.[^1_2]

```jsonc
{
  "name": "Vibe Horror Starter",
  "image": "mcr.microsoft.com/devcontainers/universal:2",
  "features": {
    "ghcr.io/devcontainers/features/node:1": {
      "version": "20"
    },
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  "postCreateCommand": "bash .devcontainer/setup.sh",
  "forwardPorts": [ 6010, 6011 ],
  "remoteEnv": {
    "GODOT_HEADLESS_BIN": "/usr/local/bin/godot4-headless",
    "MCP_FS_ROOT": "/workspace/godot-project"
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-vscode.gitlens",
        "streetsidesoftware.code-spell-checker"
      ]
    }
  }
}
```

Example `.devcontainer/setup.sh` sketch:

```bash
#!/usr/bin/env bash
set -e

# Godot headless (for CI/export)
wget -O /tmp/godot-linux-headless.tar.xz https://downloads.tuxfamily.org/godotengine/4.2.2/mono/Godot_v4.2.2-stable_mono_linux_headless.64.zip
# unpack and move to /usr/local/bin/godot4-headless (details elided)

npm install -D @modelcontextprotocol/server-filesystem @modelcontextprotocol/server-git @modelcontextprotocol/server-github

echo "Devcontainer setup complete."
```


## Godot folder layout for horror pipeline

Within the repo, assume:

```text
vibe-horror-starter/
  servers.json
  .devcontainer/
    devcontainer.json
    setup.sh
  tools/
    server-assets.mjs
    server-godot-introspect.mjs
  godot-project/
    project.godot
    addons/
      fuku/
    scenes/
      core/
        main.tscn
        player.tscn
        enemy_base.tscn
      environments/
        corridor_flesh.tscn
        ward_room.tscn
      ui/
        hud.tscn
        sanity_overlay.tscn
    scripts/
      core/
        main.gd
        player.gd
        game_state.gd
        sanity_system.gd
      environments/
        corridor_controller.gd
        ambient_triggers.gd
      ai/
        scare_director.gd
        pacing_manager.gd
      util/
        audio_zones.gd
        random_utils.gd
    assets/
      textures/
        base/
          walls/
          floors/
        overlays/
          film_grain/
          grime/
          sigils/
        generated/
          flesh_corridors/
          entities/
      audio/
        ambience/
          drones/
          hospital/
        sfx/
          creaks/
          whispers/
          jumps/
        generated/
          whispers/
          reversed_voices/
      shaders/
        post/
          chromatic_aberration.tres
          grain_glitch.tres
          sanity_distort.tres
    .github/
      workflows/
        ci.yml
        export-nightly.yml
```

Why this layout works for AI:

- Clear **generated** subtrees where the model can safely drop new textures/audio without clobbering curated assets.[^1_1]
- Dedicated `ai/` and `util/` scripts where the model can centralize “scare director” and pacing logic instead of scattering behavior.[^1_1]
- Post‑processing shaders staged under `shaders/post/` for easy wiring into a global environment or camera effects layer.[^1_1]


## Minimal GitHub workflows for AI‑managed PRs

Example `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [ main ]

jobs:
  lint-and-sanity-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Install linters
        run: |
          pip install gdtoolkit
      - name: Lint GDScript
        run: |
          gdformat --check godot-project/scripts
```

Guidance for the AI agent:

- For code/asset edits, always:

1) Use filesystem → edit under `godot-project`.
2) Use git → new branch `feat/{slug}`, commit with descriptive message.
3) Use github → open PR with checklist: “playtest corridor”, “verify sanity overlay”, “CI green”.[^1_2]


## Identity broker contract (for the servers.json)

Loose HTTP contract the GitHub MCP server can rely on:

- `POST /token` with body:

```json
{ "repo": "your-org-or-user/vibe-horror-starter", "scopes": ["read:repo", "write:pull_request", "write:issue"] }
```

- Response:

```json
{ "token": "ghs_xxx", "expires_at": "2025-12-24T11:20:00Z" }
```


The Node‑side server-github wrapper simply calls this before each operation and injects `Authorization: Bearer <token>` into GitHub API calls, never persisting the token.[^1_3]

If you want, the next iteration can be: concrete `server-assets.mjs` and `server-godot-introspect.mjs` skeletons plus a Godot `autoload` script (`sanity_system.gd`) wired to a default scene so the first “vibe” changes are immediately visible in‑engine.
<span style="display:none">[^1_10][^1_4][^1_5][^1_6][^1_7][^1_8][^1_9]</span>

<div align="center">⁂</div>

[^1_1]: https://godotengine.org/asset-library/asset/2689

[^1_2]: https://modelcontextprotocol.io/examples

[^1_3]: https://github.com/modelcontextprotocol/typescript-sdk

[^1_4]: https://github.com/geeknik/my-awesome-stars

[^1_5]: https://github.com/IndieMinimalist/awesome-stars

[^1_6]: https://lib.rs/command-line-utilities

[^1_7]: https://news.ycombinator.com/item?id=46138952

[^1_8]: https://tagpacker.com/api/users/56f2af5e4532800b2ca77b45/links?format=html\&linkIds=[]

[^1_9]: https://www.reddit.com/r/vibecoding/comments/1p1aeyt/whats_the_best_vibe_coding_tool_out_right_now_as/

[^1_10]: https://github.com/mimikun/stars


---

# Yes.

Below is a concrete, “drop‑in” starter design you can turn into a public **Vibe Horror Starter** repo: one `servers.json`, one `devcontainer.json`, and a Godot folder layout wired for MCP‑driven horror development.[^2_1][^2_2][^2_3]

***

## 1. Repo Layout for Vibe Horror Starter

Use a single repo that is friendly to Codespaces, portable local use, and MCP servers.[^2_2][^2_3]

- **Root layout**
    - `/godot/` – Godot 4 project root (`project.godot`, `addons/`, `scenes/`, `scripts/`).
    - `/godot/assets/horror/` – curated or generated horror textures, tilesets, audio. Seed this with CC0 or MIT assets from itch.io horror packs.[^2_3]
    - `/mcp/` – helper scripts and config for MCP servers.
    - `/.devcontainer/` – container definition so Codespaces / devcontainers come up pre‑wired to MCP.[^2_4][^2_2]
    - `/docs/` – guide for using the repo with different AI chats (Perplexity‑style MCP, others).
- **Godot specifics**
    - Install a horror template like “Horror FPS Template” under `/godot/addons/horror_fps_template` to give instant mechanics (camcorder, night vision, inventory).[^2_5]
    - Add Fuku AI assistant as an addon under `/godot/addons/fuku_ai/` so prompts in‑editor can co‑evolve with MCP‑side edits.[^2_6]

This gives an immediate “playable horror sandbox” the AI can mutate via filesystem and Godot‑side tools.[^2_5][^2_6]

***

## 2. MCP Servers Config (`servers.json` / `mcp.config`)

Provide a ready‑made config file so any MCP‑aware client can attach the same way.[^2_7][^2_8]

- **Core servers**
    - `github` → `npx -y @modelcontextprotocol/server-github` with read/write PR scopes.[^2_8]
    - `filesystem` → `npx -y @modelcontextprotocol/server-filesystem ./godot`.[^2_8]
    - `devcontainer` (optional) → use an existing devcontainer MCP server to let the AI modify and rebuild the devcontainer if needed.[^2_1][^2_2]
- **Example minimal config** (high‑level description)
    - `github` server with tools: list repos, branches, issues, PRs, create/update PR, comment.[^2_9][^2_8]
    - `filesystem` server with list/read/write restricted to `./godot`.[^2_2][^2_8]
    - Capabilities set to require explicit user approval for write operations.[^2_8]

This mirrors your `DevAssistant` JSON but ships as a reusable template that any chat client can load.[^2_8]

***

## 3. Devcontainer for Codespaces / Cloud Use

Give users a one‑file setup for running everything in Codespaces or VS Code devcontainers with MCP servers preinstalled.[^2_4][^2_2]

- **Key devcontainer features**
    - Base image: Node + Python + Godot headless, or reuse an existing MCP‑devcontainer server project as a base.[^2_2][^2_4]
    - `postCreateCommand`:
        - `npm install -g @modelcontextprotocol/server-github @modelcontextprotocol/server-filesystem` or rely on `npx` use only.[^2_2][^2_8]
        - Install Godot dependencies, asset tools as needed.
    - `forwardPorts`: expose MCP server ports (e.g., 3001–3003) so the AI chat can connect from outside the container.[^2_2]
- **AI‑boosted devcontainer pattern**
    - Follow patterns from MCP devcontainer servers that already integrate filesystem operations and safety modes (plan vs act).[^2_10][^2_2]
    - Document a simple command like `npm run start:mcp` that starts all servers for that workspace.[^2_2]

This lets “enterprise‑locked” users fall straight into a cloud dev experience with full AI orchestration.[^2_4][^2_2]

***

## 4. Horror Asset On‑Rails Flow

Encode the horror‑focused pipeline as conventions plus a few helper scripts so the AI knows exactly where to put and how to wire assets.[^2_3][^2_5]

- **Folder contracts**
    - `/godot/assets/horror/textures/tilesets/…` – seamless floors, walls, ceilings.
    - `/godot/assets/horror/audio/ambience/…` – loops and stingers.
    - `/godot/assets/horror/ui/overlays/…` – cracked glass, film grain, blood splatter.[^2_3]
- **Scene hooks**
    - Main hallway or demo level has a “vibe injector” script that loads any textures placed in the tileset folder and cycles them at runtime, letting the AI add new variants just by saving new images.
    - Audio manager autoload scans `/audio/ambience` and registers each file as a named bus track; the AI needs only to drop a new file and add a line to a registry JSON the game reads.
- **Seed assets**
    - Curate CC0/CC‑BY horror packs from itch.io tagged `Godot` and `Horror` as starting content.[^2_3]
    - Include licensing notes so the AI (and the user) know which folders are CC0 vs attribution‑required.

This makes the pipeline legible to the model and guarantees that “generate a new wet concrete corridor texture and wire it in” maps to straightforward file operations plus minor script edits.

***

## 5. How to Use It from Any AI Chat

Document a minimal “session protocol” so different chat platforms behave consistently against the same MCP servers.[^2_11][^2_7]

- **Connect phase**
    - User selects the repo (local folder or Codespace).
    - AI host loads `servers.json` and tests connectivity to `github`, `filesystem`, and optionally `devcontainer`.[^2_7][^2_2]
- **Vibe‑coding loop**
    - User describes mood/goal: “Make the hospital wing feel more oppressive and add a sanity mechanic.”
    - AI plan:
        - Edit Godot GDScript for sanity system.
        - Generate new textures/audio and save to agreed folders.
        - Open a GitHub branch + PR summarizing changes.
- **Review \& merge**
    - User runs the game from Godot or a scripted headless test.
    - If satisfied, user clicks “approve” so the MCP host executes the merge tool on the GitHub server.[^2_9][^2_8]

If you like, the next iteration can be a fully spelled‑out example of each of those config files (`servers.json`, `.devcontainer/devcontainer.json`, and a `README` skeleton) that you can paste directly into a new GitHub repo as the first version of the Googolswarm‑style horror vibe‑coding starter.
<span style="display:none">[^2_12][^2_13]</span>

<div align="center">⁂</div>

[^2_1]: https://mcpservers.org/servers/Siddhant-K-code/mcp-devcontainer

[^2_2]: https://github.com/gergelyszerovay/mcp-server-aibd-devcontainer

[^2_3]: https://itch.io/game-assets/free/tag-godot/tag-horror

[^2_4]: https://github.com/AI-QL/mcp-devcontainers

[^2_5]: https://godotengine.org/asset-library/asset/2990

[^2_6]: https://godotengine.org/asset-library/asset/2689

[^2_7]: https://code.visualstudio.com/docs/copilot/customization/mcp-servers

[^2_8]: https://modelcontextprotocol.io/examples

[^2_9]: https://github.com/modelcontextprotocol/servers

[^2_10]: https://mcpmarket.com/server/devcontainers-1

[^2_11]: https://www.docker.com/blog/the-model-context-protocol-simplifying-building-ai-apps-with-anthropic-claude-desktop-and-docker/

[^2_12]: https://dev.to/aws/running-model-context-protocol-mcp-servers-on-containers-using-finch-kj8

[^2_13]: https://lobehub.com/mcp/siddhant-k-code-mcp-devcontainer


---

# A name that will index well, feel credible, and ride existing “vibe coding + MCP + Godot” trends is:

VibeForge: AI Game Dev MCP Stack
This hits your goals because:
“Vibe” and “MCP” are already emerging keywords around AI‑assisted coding and tool integration, so you benefit from existing searches.[pixellab+1](https://www.pixellab.ai/vibe-coding)​youtube​
“Forge” and “Game Dev Stack” signal a practical, production‑oriented toolkit rather than a toy demo, which matches what developers and guides on AI‑dev tools and templates already reference.[dev+3](https://dev.to/yigit-konur/the-ultimate-mcp-guide-for-vibe-coding-what-1000-reddit-developers-actually-use-2025-edition-11ie)​
Including “AI Game Dev” and “Godot” (in the repo description and tags, even if not in the short name) aligns with current AI + Godot + vibe‑coding content on blogs, templates, and tutorials, improving both search and AI‑chat discoverability.[huggingface+3](https://huggingface.co/blog/vibegame)​
Recommended full GitHub repo name + tagline:
Repo: VibeForge-AI-GameDev-MCP-Stack
Tagline: “Universal MCP‑powered vibe‑coding starter stack for AI‑assisted Godot and horror game development.”
If you want variants to alias or reserve:
VibeForge-Horror-AI-Godot (horror‑focused entry point)
Awesome-VibeCoding-AI-GameDev (to echo the “awesome‑lists” ecosystem for extra credibility and cross‑linking).[github+1](https://github.com/DataTalksClub/ai-dev-tools-zoomcamp)​
[https://www.pixellab.ai/vibe-coding](https://www.pixellab.ai/vibe-coding)
[https://dev.to/yigit-konur/the-ultimate-mcp-guide-for-vibe-coding-what-1000-reddit-developers-actually-use-2025-edition-11ie](https://dev.to/yigit-konur/the-ultimate-mcp-guide-for-vibe-coding-what-1000-reddit-developers-actually-use-2025-edition-11ie)
[https://www.youtube.com/watch?v=KSzKBAXz5YA](https://www.youtube.com/watch?v=KSzKBAXz5YA)
[https://github.com/DataTalksClub/ai-dev-tools-zoomcamp](https://github.com/DataTalksClub/ai-dev-tools-zoomcamp)
[https://dev.to/dimeloper/mastering-ai-assisted-software-development-from-prompts-to-production-ready-code-54n8](https://dev.to/dimeloper/mastering-ai-assisted-software-development-from-prompts-to-production-ready-code-54n8)
[https://huggingface.co/blog/vibegame](https://huggingface.co/blog/vibegame)
[https://github.com/ThiDiamondDev/horror-fps-template](https://github.com/ThiDiamondDev/horror-fps-template)
[https://github.com/NuclearPhoenixx/Godot-Horror-Demo-2D](https://github.com/NuclearPhoenixx/Godot-Horror-Demo-2D)
[https://www.reddit.com/r/ChatGPTCoding/comments/1peogl6/best_practices_for_vibecoding_gamedev_especially/](https://www.reddit.com/r/ChatGPTCoding/comments/1peogl6/best_practices_for_vibecoding_gamedev_especially/)
[https://www.reddit.com/r/mcp/comments/1lc3bgm/cool_mcps_for_vibe_coding/](https://www.reddit.com/r/mcp/comments/1lc3bgm/cool_mcps_for_vibe_coding/)

VibeForge: AI Game Dev MCP Stack is a strong primary name and repo slug for what you are building, and it aligns well with how “vibe coding”, MCP, and AI game‑dev are currently showing up in blogs, tools, and talks.  It reads credible, hints at production workflows rather than a toy, and should rank and autocomplete well in the “vibe coding + MCP + game dev” query cluster.[^3_1][^3_2][^3_3][^3_4][^3_5]

## Why “VibeForge” Works Now

- The **“vibe coding”** term is quickly standardizing as shorthand for AI‑assisted, conversational coding, including in formal writeups and high‑signal blogs.[^3_3][^3_4]
- Dedicated MCP + vibe‑coding content (PixelLab’s MCP toolkit, GitHub Universe talks on MCP‑assisted vibe coding) already pairs these keywords, so “MCP Stack” rides that same stream.[^3_2][^3_5][^3_1]
- “Forge” suggests a serious, builder‑grade toolchain, which matches how advanced vibe‑coding workflows are being framed (shipping and maintaining real systems, not just demos).[^3_6][^3_5]


## SEO and Trend Alignment

- Including **AI Game Dev** in the repo name or description puts you in the overlap between vibe‑coding explainers and AI‑powered game tutorials, which is where a lot of current traffic sits.[^3_7][^3_6]
- Explicit **Godot** mentions in the description, topics, and README tap into the existing Godot + AI/game‑AI tutorials (e.g., RL agents, AI‑driven behaviors) that developers are already using as entry points.[^3_8][^3_7]
- Variants like `VibeForge-Horror-AI-Godot` and an “awesome‑style” alias benefit from the ecosystem of curated AI/dev lists and zoomcamps, which often become de facto discovery hubs for newcomers.[^3_9][^3_7]


## Practical Repo Naming Strategy

- Primary repo: **VibeForge-AI-GameDev-MCP-Stack**
    - Description: “Universal MCP‑powered vibe‑coding starter stack for AI‑assisted Godot and horror game development.”
- Optional satellites or aliases:
    - **VibeForge-Horror-AI-Godot** – sample or template repo pinned in the main README.
    - **Awesome-VibeCoding-AI-GameDev** – a curated index that links back to VibeForge and to other MCP/vibe‑coding tools.[^3_5][^3_2]

If you want, the next step can be concrete GitHub metadata (topics, README front‑matter, and example description strings) tuned specifically to rank on “vibe coding”, “MCP server”, “AI Godot horror”, and “AI game dev starter”.
<span style="display:none">[^3_10][^3_11]</span>

<div align="center">⁂</div>

[^3_1]: https://www.pixellab.ai/vibe-coding

[^3_2]: https://github.com/pixellab-code/pixellab-mcp

[^3_3]: https://en.wikipedia.org/wiki/Vibe_coding

[^3_4]: https://blog.replit.com/what-is-vibe-coding

[^3_5]: https://www.youtube.com/watch?v=PvdptUZ3XeU

[^3_6]: https://www.youtube.com/watch?v=zznpkSOjLK4

[^3_7]: https://thomassimonini.substack.com/p/creating-an-engaging-ai-powered-game

[^3_8]: https://huggingface.co/learn/deep-rl-course/en/unitbonus3/godotrl

[^3_9]: https://github.com/AI-QL/mcp-devcontainers

[^3_10]: https://www.pixellab.ai/termsofservice

[^3_11]: https://www.reddit.com/r/ClaudeAI/comments/1j6z4ft/what_is_the_exact_definition_of_vibe_coding/


---

# VibeForge-AI-GameDev-MCP-Stack is the ultimate MCP-powered starter for vibe-coding games with AI chats. Build horror Godot projects via Perplexity, Grok, or any MCP client—auto PRs, asset pipelines, procedural textures/audio. No admin needed. Portable, Codespaces-ready. (187 chars)[modelcontextprotocol+3](https://modelcontextprotocol.io/examples)​

Repo Structure
text
VibeForge-AI-GameDev-MCP-Stack/
├── .devcontainer/
│   └── devcontainer.json          \# Codespaces MCP + Godot setup
├── .github/
│   └── workflows/                 \# CI/CD for builds, asset tests
├── godot/                         \# Godot 4.x horror project
│   ├── project.godot
│   ├── addons/
│   │   ├── fuku_ai/               \# AI assistant plugin
│   │   └── horror_fps_template/   \# Starter mechanics
│   ├── assets/horror/
│   │   ├── textures/tilesets/     \# Procedural/AI-generated
│   │   ├── audio/ambience/        \# Whispers, drones (CC0)
│   │   └── ui/overlays/           \# Grain, blood splatter
│   ├── scenes/                    \# Levels, UI (vibe-injector hooks)
│   └── scripts/                   \# GDScript: sanity, procedural gen
├── mcp/
│   ├── servers.json               \# GitHub/filesystem/devcontainer MCP
│   └── start-mcp.sh               \# Portable server launcher (npx)
├── docs/                          \# Vibe-coding guides per AI chat
└── README.md                      \# Quickstart, prompts, licenses

Drop into any MCP chat: "Connect servers.json, generate fleshy corridor texture, PR it."[github+3](https://github.com/gergelyszerovay/mcp-server-aibd-devcontainer)​
[https://modelcontextprotocol.io/examples](https://modelcontextprotocol.io/examples)
[https://godotengine.org/asset-library/asset/2689](https://godotengine.org/asset-library/asset/2689)
[https://github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
[https://github.com/gergelyszerovay/mcp-server-aibd-devcontainer](https://github.com/gergelyszerovay/mcp-server-aibd-devcontainer)
[https://mcpservers.org/servers/Siddhant-K-code/mcp-devcontainer](https://mcpservers.org/servers/Siddhant-K-code/mcp-devcontainer)
[https://itch.io/game-assets/free/tag-godot/tag-horror](https://itch.io/game-assets/free/tag-godot/tag-horror)

That description and structure are excellent as a repo‑ready “front page” for VibeForge; only tiny edits are worth considering for clarity and keyword density.[^4_1][^4_2]

## Polished 187‑char Description

VibeForge-AI-GameDev-MCP-Stack is the ultimate MCP-powered starter for vibe-coding Godot horror games with AI chats. Auto PRs, asset pipelines, procedural textures/audio. No admin. Codespaces-ready.[^4_3][^4_1]

## Repo Structure (lightly annotated)

```text
VibeForge-AI-GameDev-MCP-Stack/
├── .devcontainer/
│   └── devcontainer.json          # Codespaces/devcontainer MCP + Godot setup
├── .github/
│   └── workflows/                 # CI/CD for builds, lint, basic asset tests
├── godot/                         # Godot 4.x horror project
│   ├── project.godot
│   ├── addons/
│   │   ├── fuku_ai/               # In-editor AI assistant (Fuku plugin)
│   │   └── horror_fps_template/   # Starter horror mechanics/template
│   ├── assets/horror/
│   │   ├── textures/tilesets/     # Procedural / AI-generated tilesets
│   │   ├── audio/ambience/        # Whispers, drones, loops (CC0 from itch.io)
│   │   └── ui/overlays/           # Grain, grime, blood splatter overlays
│   ├── scenes/                    # Levels, UI, “vibe-injector” hooks
│   └── scripts/                   # GDScript: sanity, procedural gen, scares
├── mcp/
│   ├── servers.json               # GitHub/filesystem/devcontainer MCP config
│   └── start-mcp.sh               # Portable launcher (npx; no admin needed)
├── docs/                          # Vibe-coding guides per AI chat (Perplexity, Grok, etc.)
└── README.md                      # Quickstart, prompts, licenses, asset credits
```

This matches how Fuku, MCP devcontainer servers, and itch.io horror assets are typically integrated, so most AI‑dev and Godot users will recognize the patterns immediately.[^4_2][^4_4][^4_5]

## Suggested README Callout Line

Drop into any MCP chat:
“Connect `mcp/servers.json`, then generate a fleshy corridor texture and open a PR wiring it into the demo level.”[^4_6][^4_2]
<span style="display:none">[^4_10][^4_11][^4_7][^4_8][^4_9]</span>

<div align="center">⁂</div>

[^4_1]: https://code.visualstudio.com/docs/copilot/customization/mcp-servers

[^4_2]: https://github.com/gergelyszerovay/mcp-server-aibd-devcontainer

[^4_3]: https://mcpservers.org/servers/Siddhant-K-code/mcp-devcontainer

[^4_4]: https://godotengine.org/asset-library/asset/2689

[^4_5]: https://itch.io/game-assets/free/tag-godot/tag-horror

[^4_6]: https://modelcontextprotocol.io/examples

[^4_7]: https://github.com/AI-QL/mcp-devcontainers

[^4_8]: https://github.com/crunchloop/mcp-devcontainers

[^4_9]: https://mcpmarket.com/server/devcontainers-1

[^4_10]: https://godotassetlibrary.com/asset/BsUEQ1/fuku---ollama-integration-for-godot

[^4_11]: https://itch.io/game-assets/tag-godot/tag-horror
