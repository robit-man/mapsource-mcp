import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  Client,
  StreamableHTTPClientTransport,
  type CallToolRequest,
  type CallToolRequestOptions,
  type CallToolResult,
  type ListToolsRequest,
  type ListToolsResult,
} from "@modelcontextprotocol/client";
import { Server } from "@modelcontextprotocol/server";
import { VERSION } from "./version.js";

export const DEFAULT_MCP_URL = "https://mapsource.io/mcp";

export interface RemoteMapsourceClient {
  listTools(
    params?: ListToolsRequest["params"],
    options?: { signal?: AbortSignal },
  ): Promise<ListToolsResult>;
  callTool(
    params: CallToolRequest["params"],
    options?: CallToolRequestOptions,
  ): Promise<CallToolResult>;
  close(): Promise<void>;
}

export interface MapsourceServerOptions {
  apiKey?: string;
  url?: string;
  /** Test/programmatic injection point. Normal callers should omit this. */
  remote?: RemoteMapsourceClient;
}

const resources = {
  "mapsource://contract/mcp": {
    path: "../contracts/mcp.json",
    name: "Mapsource MCP server card",
    mimeType: "application/json",
  },
  "mapsource://contract/openapi": {
    path: "../contracts/openapi.json",
    name: "Mapsource OpenAPI contract",
    mimeType: "application/json",
  },
  "mapsource://contract/llms": {
    path: "../llms.txt",
    name: "Mapsource compact agent contract",
    mimeType: "text/plain",
  },
  "mapsource://contract/llms-full": {
    path: "../contracts/llms-full.txt",
    name: "Mapsource full agent contract",
    mimeType: "text/plain",
  },
} as const;

export type ContractResourceUri = keyof typeof resources;

export function validateRemoteUrl(input: string): URL {
  const url = new URL(input);
  if (url.protocol !== "https:")
    throw new Error("MAPSOURCE_MCP_URL must use HTTPS");
  if (url.username || url.password || url.search || url.hash)
    throw new Error(
      "MAPSOURCE_MCP_URL cannot contain credentials, query parameters, or a fragment",
    );
  return url;
}

export async function connectRemote(
  options: Pick<MapsourceServerOptions, "apiKey" | "url"> = {},
): Promise<RemoteMapsourceClient> {
  const url = validateRemoteUrl(options.url ?? DEFAULT_MCP_URL);
  const client = new Client({
    name: "mapsource-mcp-stdio-adapter",
    version: VERSION,
  });
  const apiKey = options.apiKey;
  const transport = new StreamableHTTPClientTransport(url, {
    ...(apiKey
      ? { authProvider: { token: () => Promise.resolve(apiKey) } }
      : {}),
    onInsufficientScope: "throw",
  });
  await client.connect(transport);
  return client;
}

async function readContractResource(uri: ContractResourceUri): Promise<string> {
  return readFile(
    fileURLToPath(new URL(resources[uri].path, import.meta.url)),
    "utf8",
  );
}

/**
 * Build a local MCP server that mirrors the deployed tool list and forwards
 * calls over Streamable HTTP. Tool definitions are discovered at request time,
 * so an installed adapter does not conceal newly deployed Mapsource tools.
 */
export async function createMapsourceServer(
  options: MapsourceServerOptions = {},
): Promise<Server> {
  const remote =
    options.remote ??
    (await connectRemote({
      ...(options.apiKey ? { apiKey: options.apiKey } : {}),
      ...(options.url ? { url: options.url } : {}),
    }));
  const server = new Server(
    { name: "mapsource-mcp", version: VERSION },
    {
      capabilities: { tools: {}, resources: {} },
      instructions:
        "Use geo_search for addresses, businesses and OSM features; geo_navigate for routes, matrices and isochrones; geo_style for basemap design; geo_analyze for spatial work; geo_render for static maps; and geo_data for service state, terrain and usage. Respect result handles, quota metadata, ambiguity, attribution and retryable error fields.",
    },
  );

  server.setRequestHandler("tools/list", async (request, context) =>
    remote.listTools(request.params, { signal: context.mcpReq.signal }),
  );
  server.setRequestHandler("tools/call", async (request, context) =>
    remote.callTool(request.params, { signal: context.mcpReq.signal }),
  );
  server.setRequestHandler("resources/list", () => ({
    resources: Object.entries(resources).map(([uri, resource]) => ({
      uri,
      name: resource.name,
      mimeType: resource.mimeType,
    })),
  }));
  server.setRequestHandler("resources/read", async (request) => {
    const uri = request.params.uri as ContractResourceUri;
    if (!(uri in resources))
      throw new Error(
        `Unknown Mapsource contract resource: ${request.params.uri}`,
      );
    const resource = resources[uri];
    return {
      contents: [
        {
          uri,
          mimeType: resource.mimeType,
          text: await readContractResource(uri),
        },
      ],
    };
  });
  server.onclose = () => {
    void remote.close();
  };
  return server;
}
