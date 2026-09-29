import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  statfs,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "..");
const origin = (
  process.env.MAPSOURCE_CONTRACT_ORIGIN ?? "https://api.mapsource.io"
).replace(/\/$/, "");
const maximumBytes = 8 * 1024 * 1024;
const safetyFloor = 256 * 1024 * 1024;
const sources = {
  openapi: "/api/openapi.json",
  mcp: "/mcp.json",
  llms: "/llms.txt",
  llmsFull: "/llms-full.txt",
};

function assertProjectPath(path) {
  if (!path.startsWith(`${root}${sep}`))
    throw new Error(`Refusing to write outside the repository: ${path}`);
}

async function fetchBounded(path) {
  const url = `${origin}${path}`;
  const response = await fetch(url, {
    headers: {
      accept: path.endsWith(".json") ? "application/json" : "text/plain",
    },
  });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > maximumBytes)
    throw new Error(`${url} exceeds the ${maximumBytes}-byte contract limit`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > maximumBytes)
    throw new Error(`${url} exceeds the ${maximumBytes}-byte contract limit`);
  return {
    url,
    bytes,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}

function json(bytes, label) {
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error(`${label} is not valid JSON`);
  }
}

function publishedOperationIds(openapi) {
  const methods = new Set(["get", "post", "put", "delete", "patch"]);
  const ids = new Set();
  for (const item of Object.values(openapi.paths ?? {})) {
    for (const [method, definition] of Object.entries(item ?? {})) {
      if (methods.has(method) && definition?.operationId)
        ids.add(definition.operationId);
    }
  }
  return ids;
}

function toolSource(definitions) {
  return `/* Generated from contracts/mcp.json by scripts/sync-contracts.mjs. Do not edit. */\nexport const toolDefinitions = ${JSON.stringify(definitions, null, 2)} as const;\n\nexport const toolNames = Object.freeze(toolDefinitions.map(tool => tool.name));\nexport type MapsourceToolName = (typeof toolNames)[number];\nexport type MapsourceToolDefinition = (typeof toolDefinitions)[number];\n`;
}

function toolMarkdown(definitions) {
  const rows = definitions.map((tool) => {
    const operations = Object.keys(tool._meta?.["mapsource/operations"] ?? {})
      .map((name) => `\`${name}\``)
      .join(", ");
    return `| \`${tool.name}\` | ${String(tool.description ?? "").replaceAll("|", "\\|")} | ${operations || "—"} |`;
  });
  return `# Mapsource MCP tools\n\nGenerated from the deployed MCP card. Tool definitions are refreshed live by the adapter at connection time; this table records the package release contract.\n\n| Tool | Purpose | Operations |\n|---|---|---|\n${rows.join("\n")}\n`;
}

let temporary;
try {
  const filesystem = await statfs(root);
  const freeBytes = filesystem.bavail * filesystem.bsize;
  const projectedBytes = maximumBytes * Object.keys(sources).length;
  if (freeBytes - projectedBytes < safetyFloor)
    throw new Error(
      `Contract sync would cross the ${safetyFloor}-byte free-space floor`,
    );
  temporary = await mkdtemp(join(root, ".mapsource-mcp-contract-sync-"));
  assertProjectPath(temporary);
  const entries = await Promise.all(
    Object.entries(sources).map(async ([name, path]) => [
      name,
      await fetchBounded(path),
    ]),
  );
  const fetched = Object.fromEntries(entries);
  const openapi = json(fetched.openapi.bytes, "OpenAPI document");
  const mcp = json(fetched.mcp.bytes, "MCP card");
  const ids = publishedOperationIds(openapi);
  const definitions = mcp.toolDefinitions ?? [];
  if (ids.size !== 62 || Object.keys(openapi.paths ?? {}).length !== 58)
    throw new Error("Expected 62 method operations across 58 OpenAPI paths");
  if (new Set(mcp.tools ?? []).size !== 13 || definitions.length !== 13)
    throw new Error("Expected 13 MCP tools and definitions");
  const pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
  const server = {
    $schema:
      "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
    name: pkg.mcpName,
    title: "Mapsource",
    description: pkg.description,
    repository: {
      url: "https://github.com/robit-man/mapsource-mcp",
      source: "github",
    },
    version: pkg.version,
    websiteUrl: "https://mapsource.io/docs/agents",
    packages: [
      {
        registryType: "npm",
        registryBaseUrl: "https://registry.npmjs.org",
        identifier: pkg.name,
        version: pkg.version,
        transport: { type: "stdio" },
        environmentVariables: [
          {
            name: "MAPSOURCE_API_KEY",
            description: "Mapsource subscription key",
            isRequired: true,
            isSecret: true,
            format: "string",
          },
        ],
      },
    ],
  };
  const files = {
    "contracts/openapi.json": `${JSON.stringify(openapi, null, 2)}\n`,
    "contracts/mcp.json": `${JSON.stringify(mcp, null, 2)}\n`,
    "contracts/llms-full.txt": new TextDecoder().decode(fetched.llmsFull.bytes),
    "llms.txt": new TextDecoder().decode(fetched.llms.bytes),
    "src/generated/tools.ts": toolSource(definitions),
    "docs/tools.md": toolMarkdown(definitions),
    "server.json": `${JSON.stringify(server, null, 2)}\n`,
    "contracts/source.json": `${JSON.stringify({ origin, sources: Object.fromEntries(Object.entries(fetched).map(([name, value]) => [name, { url: value.url, sha256: value.sha256, bytes: value.bytes.byteLength }])) }, null, 2)}\n`,
  };
  for (const [relative, content] of Object.entries(files)) {
    const staging = join(temporary, relative.replaceAll("/", "__"));
    const destination = resolve(root, relative);
    assertProjectPath(destination);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(staging, content, "utf8");
    await rename(staging, destination);
  }
  process.stdout.write(
    `Synchronized ${ids.size} operations and ${definitions.length} MCP tools from ${origin}.\n`,
  );
} finally {
  if (temporary) await rm(temporary, { recursive: true, force: true });
}
