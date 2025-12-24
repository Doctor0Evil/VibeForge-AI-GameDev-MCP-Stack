#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const GODOT_ROOT = path.join(ROOT, "godot");

function walk(dir, filterExts) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...walk(full, filterExts));
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (!filterExts.length || filterExts.includes(ext)) {
        out.push(full);
      }
    }
  }
  return out;
}

function introspect() {
  const scenes = walk(GODOT_ROOT, [".tscn", ".scn"]);
  const scripts = walk(GODOT_ROOT, [".gd", ".aln"]);

  return {
    root: GODOT_ROOT,
    scenes: scenes.map(p => path.relative(GODOT_ROOT, p).replace(/\\/g, "/")),
    scripts: scripts.map(p => path.relative(GODOT_ROOT, p).replace(/\\/g, "/")),
    timestamp: new Date().toISOString()
  };
}

function main() {
  const data = introspect();
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
}

main();
