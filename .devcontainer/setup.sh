#!/usr/bin/env bash
set -euo pipefail

echo "[devcontainer] Installing global tools..."

# Node / JS tooling
npm install -g pnpm

# Create core directories
mkdir -p \
  godot/assets/generated/textures \
  godot/assets/generated/audio \
  godot/scenes \
  godot/scripts/core \
  tools \
  mcp

# Godot CLI placeholder (user must bind actual path or add to PATH)
if ! command -v godot &>/dev/null; then
  echo "[devcontainer] WARNING: 'godot' CLI not found in PATH."
  echo "  - Install Godot or bind it via PATH for CI/lint steps that use it."
fi

echo "[devcontainer] Done."
