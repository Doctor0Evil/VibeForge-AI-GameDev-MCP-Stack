#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[mcp] Starting MCP-compatible servers from ${ROOT_DIR}"

cd "${ROOT_DIR}"

# Install local JS deps if needed
if [ -f package.json ] && [ ! -d node_modules ]; then
  echo "[mcp] Installing node dependencies..."
  npm install
fi

# Start asset/file-drop skeleton (no network port exposed yet)
node tools/server-assets.mjs &

# Start Godot introspection server (one-shot JSON output per call)
node tools/server-godot-introspect.mjs --watch &

wait
