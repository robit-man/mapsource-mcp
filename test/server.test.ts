import {
  Client,
  InMemoryTransport,
  type CallToolRequest,
  type CallToolRequestOptions,
  type CallToolResult,
  type ListToolsResult,
} from "@modelcontextprotocol/client";
import { afterEach, describe, expect, it } from "vitest";
import {
  createMapsourceServer,
  validateRemoteUrl,
  type RemoteMapsourceClient,
} from "../src/server.js";

const opened: Array<() => Promise<void>> = [];
afterEach(async () => {
  await Promise.allSettled(opened.splice(0).map((close) => close()));
});

describe("Mapsource MCP adapter", () => {
  it("forwards tool discovery and calls without changing their payloads", async () => {
    const list: ListToolsResult = {
      tools: [
        {
          name: "service_status",
          description: "Read status",
          inputSchema: { type: "object" },
        },
      ],
    };
    const called: CallToolResult = {
      content: [{ type: "text", text: "operational" }],
    };
    const calls: Array<
      [CallToolRequest["params"], CallToolRequestOptions | undefined]
    > = [];
    const remote: RemoteMapsourceClient = {
      listTools: () => Promise.resolve(list),
      callTool: (params, options) => {
        calls.push([params, options]);
        return Promise.resolve(called);
      },
      close: () => Promise.resolve(),
    };
    const server = await createMapsourceServer({ remote });
    const client = new Client({ name: "adapter-test", version: "1.0.0" });
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    opened.push(
      () => client.close(),
      () => server.close(),
    );

    await expect(client.listTools()).resolves.toEqual(list);
    await expect(
      client.callTool({ name: "service_status", arguments: {} }),
    ).resolves.toEqual(called);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.[0]).toEqual({ name: "service_status", arguments: {} });
    expect(calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it("publishes machine-readable contract resources", async () => {
    const remote: RemoteMapsourceClient = {
      listTools: () => Promise.resolve({ tools: [] }),
      callTool: () => Promise.resolve({ content: [] }),
      close: () => Promise.resolve(),
    };
    const server = await createMapsourceServer({ remote });
    const client = new Client({ name: "resource-test", version: "1.0.0" });
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    opened.push(
      () => client.close(),
      () => server.close(),
    );

    const listed = await client.listResources();
    expect(listed.resources.map((resource) => resource.uri)).toContain(
      "mapsource://contract/openapi",
    );
    const resource = await client.readResource({
      uri: "mapsource://contract/mcp",
    });
    expect(resource.contents[0]).toMatchObject({
      mimeType: "application/json",
    });
  });

  it("rejects remote URLs that could leak credentials or downgrade transport", () => {
    expect(() => validateRemoteUrl("http://mapsource.io/mcp")).toThrow(/HTTPS/);
    expect(() => validateRemoteUrl("https://key@mapsource.io/mcp")).toThrow(
      /credentials/,
    );
    expect(() =>
      validateRemoteUrl("https://mapsource.io/mcp?key=secret"),
    ).toThrow(/query/);
  });
});
