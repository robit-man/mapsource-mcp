#!/usr/bin/env node
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import {
  connectRemote,
  createMapsourceServer,
  DEFAULT_MCP_URL,
} from "./server.js";
import { VERSION } from "./version.js";

const args = new Set(process.argv.slice(2));
const apiKey = process.env.MAPSOURCE_API_KEY?.trim() || undefined;
const url = process.env.MAPSOURCE_MCP_URL?.trim() || DEFAULT_MCP_URL;

function safeMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return apiKey ? message.replaceAll(apiKey, "[redacted]") : message;
}

async function main() {
  if (args.has("--version") || args.has("-v")) {
    process.stdout.write(`${VERSION}\n`);
    return;
  }
  if (args.has("--help") || args.has("-h")) {
    process.stdout.write(
      "mapsource-mcp\n\nRuns the Mapsource MCP stdio adapter.\n\nEnvironment:\n  MAPSOURCE_API_KEY  Subscription key (required for protected tools)\n  MAPSOURCE_MCP_URL   HTTPS remote endpoint override\n\nOptions:\n  --check             Connect, list tools, and exit\n  --version           Print the package version\n",
    );
    return;
  }
  if (args.has("--check")) {
    const remote = await connectRemote({ ...(apiKey ? { apiKey } : {}), url });
    try {
      const result = await remote.listTools();
      process.stdout.write(
        `${JSON.stringify({ endpoint: url, toolCount: result.tools.length, tools: result.tools.map((tool) => tool.name) }, null, 2)}\n`,
      );
    } finally {
      await remote.close();
    }
    return;
  }
  const handle = serveStdio(
    () => createMapsourceServer({ ...(apiKey ? { apiKey } : {}), url }),
    {
      onerror(error) {
        process.stderr.write(`mapsource-mcp: ${safeMessage(error)}\n`);
      },
    },
  );
  const shutdown = () => {
    void handle.close();
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

main().catch((error: unknown) => {
  process.stderr.write(`mapsource-mcp: ${safeMessage(error)}\n`);
  process.exitCode = 1;
});
