#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const ASSETS_ROOT = path.join(ROOT, "godot", "assets", "generated");

const DIRS = [
  path.join(ASSETS_ROOT, "textures"),
  path.join(ASSETS_ROOT, "audio")
];

function ensureDirs() {
  for (const d of DIRS) {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  }
}

function writeStubAsset(kind, name) {
  const now = new Date().toISOString();
  const safeName = name.replace(/[^a-zA-Z0-9_\-\.]/g, "_") || "unnamed";
  const ext = kind === "audio" ? ".txt" : ".png.txt";
  const outDir =
    kind === "audio"
      ? path.join(ASSETS_ROOT, "audio")
      : path.join(ASSETS_ROOT, "textures");
  const outPath = path.join(outDir, `${safeName}${ext}`);
  const payload = `Stub ${kind} asset for '${name}' @ ${now}\n`;

  fs.writeFileSync(outPath, payload, "utf8");
  return path.relative(ROOT, outPath).replace(/\\/g, "/");
}

function handleGenerate(payload) {
  const { type, name = "vibe_asset" } = payload || {};
  if (!type || (type !== "texture" && type !== "audio")) {
    return {
      ok: false,
      error: "type must be 'texture' or 'audio'"
    };
  }
  const rel = writeStubAsset(type === "audio" ? "audio" : "texture", name);
  return {
    ok: true,
    path: rel
  };
}

/**
 * Protocol:
 * - stdin: JSON line, e.g. { "action": "generate", "type": "texture", "name": "sanity_noise_01" }
 * - stdout: JSON line with { ok, path | error }
 */
function main() {
  ensureDirs();

  let buf = "";
  process.stdin.setEncoding("utf8");

  process.stdin.on("data", chunk => {
    buf += chunk;
    if (!buf.includes("\n")) return;
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      let payload;
      try {
        payload = JSON.parse(line);
      } catch (e) {
        process.stdout.write(
          JSON.stringify({ ok: false, error: "invalid JSON" }) + "\n"
        );
        continue;
      }

      if (payload.action === "generate") {
        const res = handleGenerate(payload);
        process.stdout.write(JSON.stringify(res) + "\n");
      } else if (payload.action === "ping") {
        process.stdout.write(JSON.stringify({ ok: true, pong: true }) + "\n");
      } else {
        process.stdout.write(
          JSON.stringify({ ok: false, error: "unknown action" }) + "\n"
        );
      }
    }
  });

  process.stdin.on("end", () => {
    process.exit(0);
  });
}

main();
