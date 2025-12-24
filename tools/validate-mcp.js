#!/usr/bin/env node
/* Minimal structural validation for mcp/servers.json
 * Optional: when NODE_ENV=ci, fetch the official MCP servers schema and validate
 * against it using Ajv. This keeps the suitcase stack light during normal use but
 * provides strict checks in CI.
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "mcp", "servers.json");
const SCHEMA_URL = "https://raw.githubusercontent.com/modelcontextprotocol/spec/main/schemas/servers.v1.json";

function fail(msg) {
  console.error(`[mcp-validate] ERROR: ${msg}`);
  process.exit(1);
}

function warn(msg) {
  console.warn(`[mcp-validate] WARN: ${msg}`);
}

async function validateAgainstSchema(json) {
  if (process.env.NODE_ENV !== "ci") {
    console.log("[mcp-validate] NODE_ENV!=ci; skipping remote schema validation (to keep the suitcase stack light).");
    return;
  }

  let Ajv;
  try {
    Ajv = require("ajv");
  } catch (e) {
    fail("Ajv is not installed. To enable schema validation in CI, install 'ajv' (e.g., 'npm install ajv').");
  }

  let schema;
  try {
    const res = await fetch(SCHEMA_URL);
    if (!res.ok) {
      fail(`Failed to fetch schema (status=${res.status}) from ${SCHEMA_URL}`);
    }
    schema = await res.json();
  } catch (e) {
    fail(`Could not load schema from ${SCHEMA_URL}: ${e.message}`);
  }

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const valid = validate(json);
  if (!valid) {
    console.error("[mcp-validate] Schema validation failed:");
    console.error(JSON.stringify(validate.errors, null, 2));
    process.exit(1);
  }

  console.log("[mcp-validate] Schema validation passed against official schema.");
}

async function main() {
  if (!fs.existsSync(CONFIG_PATH)) {
    fail(`Config file not found at ${CONFIG_PATH}`);
  }

  let raw;
  try {
    raw = fs.readFileSync(CONFIG_PATH, "utf8");
  } catch (e) {
    fail(`Unable to read config: ${e.message}`);
  }

  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    fail(`Invalid JSON: ${e.message}`);
  }

  if (typeof json !== "object" || json === null) {
    fail("Root must be an object.");
  }

  const servers = json.servers;
  if (!servers || typeof servers !== "object" || Array.isArray(servers)) {
    fail("Missing or invalid 'servers' object.");
  }

  const names = Object.keys(servers);
  if (!names.length) {
    fail("'servers' must contain at least one server definition.");
  }

  for (const name of names) {
    const s = servers[name];
    if (typeof s !== "object" || s === null) {
      fail(`Server '${name}' must be an object.`);
    }

    if (typeof s.command !== "string" || !s.command.trim()) {
      fail(`Server '${name}' is missing a non-empty 'command' string.`);
    }

    if (s.args !== undefined && !Array.isArray(s.args)) {
      fail(`Server '${name}' has 'args' but it is not an array.`);
    }

    // Optional but recommended:
    if (!s.args || s.args.length === 0) {
      warn(`Server '${name}' has no 'args'; ensure this is intentional.`);
    }
  }

  console.log("[mcp-validate] servers.json looks structurally valid.");

  // Optional: strict schema validation (only in CI)
  await validateAgainstSchema(json);
}

main().catch(err => {
  console.error(`[mcp-validate] Unexpected error: ${err && err.stack ? err.stack : err}`);
  process.exit(1);
});
