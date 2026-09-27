import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sdk = await import(pathToFileURL(resolve(root, "dist/server.js")));
const tools = await import(
  pathToFileURL(resolve(root, "dist/generated/tools.js"))
);
if (typeof sdk.createMapsourceServer !== "function")
  throw new Error("createMapsourceServer export is missing");
if (tools.toolNames.length !== 13)
  throw new Error(
    `Built tool inventory contains ${tools.toolNames.length} tools`,
  );
const check = spawnSync(
  process.execPath,
  [resolve(root, "dist/cli.js"), "--check"],
  { cwd: root, encoding: "utf8", timeout: 30_000 },
);
if (check.status !== 0)
  throw new Error(check.stderr || "Live MCP connection check failed");
const result = JSON.parse(check.stdout);
if (result.toolCount !== 13)
  throw new Error(
    `Live MCP server exposed ${result.toolCount} tools, expected 13`,
  );
process.stdout.write(
  "Built adapter imports successfully and discovers all 13 live tools.\n",
);
