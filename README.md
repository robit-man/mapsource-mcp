# mapsource-mcp

Official local stdio adapter for the hosted [Mapsource](https://mapsource.io) MCP server. It gives desktop agents and clients one connection for OpenStreetMap queries, address and business search, regional POI discovery, routing, matrices, isochrones, map matching, optimization, elevation and terrain, basemap styling, spatial analysis, rendering, usage, and service status.

```bash
npm install mapsource-mcp
```

## Connect an MCP client

The adapter reads the subscription key from the process environment and forwards tool calls to Mapsource over HTTPS. It never puts the key in a URL, package file, or log.

```json
{
  "mcpServers": {
    "mapsource": {
      "command": "npx",
      "args": ["-y", "mapsource-mcp"],
      "env": {
        "MAPSOURCE_API_KEY": "your-key-from-secret-storage"
      }
    }
  }
}
```

Use the equivalent command, args, and secret-environment fields in your MCP client. Prefer a pinned version in managed deployments: `npx -y mapsource-mcp@0.1.0`.

```bash
MAPSOURCE_API_KEY="$MAPSOURCE_API_KEY" npx mapsource-mcp --check
```

Clients that support Streamable HTTP and protected headers can connect directly to `https://api.mapsource.io/mcp` with `Authorization: Bearer …`; the adapter exists for stdio-first clients.

The MCP endpoint stays `/mcp`. If an agent also calls the REST API directly, every `/api/...` path on `https://api.mapsource.io` works with or without the `/api` prefix (`/api/interpreter` or `/interpreter`); the server card at `https://api.mapsource.io/mcp.json` states this under `pathAliases`, and the hosted server includes it in the instructions it sends at connection time.

## Complete tool surface

The adapter discovers tool definitions from the deployed service at connection time, so a stale install does not conceal new server tools. This release also ships a provenance-recorded snapshot of all 13 tools:

- `geo_data` — status, metrics, basemaps, elevation, terrain, contours, and usage.
- `geo_style` — inspect, compile, validate, explain, and export custom vector basemaps.
- `geo_search` — address/business lookup, regional discovery, nearby POIs, and geocoding.
- `geo_navigate` — routes, matrices, isochrones, map matching, and trip optimization.
- `geo_analyze` — result retrieval, spatial computation, and typed pipelines.
- `geo_render` — deterministic static map rendering.
- Compatibility tools: `service_status`, `basemap_catalog`, `elevation`, `find_features`, `route`, `isochrone`, and `overpass_query`.

See the [generated tool and operation table](docs/tools.md). Machine-readable discovery is included as `mapsource-mcp/mcp.json`, `mapsource-mcp/openapi.json`, `mapsource-mcp/llms.txt`, `mapsource-mcp/llms-full.txt`, and `mapsource-mcp/server.json`.

The local server also exposes those snapshots as MCP resources under `mapsource://contract/*`. Tool calls still run against the live hosted backend and use the same plan limits as REST calls.

## Programmatic use

```ts
import { createMapsourceServer } from "mapsource-mcp";

const server = await createMapsourceServer({
  apiKey: process.env.MAPSOURCE_API_KEY,
});
// Connect `server` to an MCP transport owned by your application.
```

Use `MAPSOURCE_MCP_URL` only for an approved HTTPS Mapsource deployment. URLs containing user info, query parameters, fragments, or an HTTP downgrade are rejected.

## Contract provenance and release verification

`npm run sync:contracts` downloads Mapsource’s generated OpenAPI, MCP, and agent contracts with strict byte limits, validates the full inventory, records SHA-256 hashes in `contracts/source.json`, and regenerates tool documentation. Temporary staging is project-prefixed and cleaned in `finally`.

```bash
npm ci --ignore-scripts
npm run validate
```

Maintainers can publish without placing a token in a file or command line:

```bash
printf '%s\n' "$NPM_TOKEN" | npm run publish:verified -- --token-stdin
```

The release gate requires a clean `main`, signature and vulnerability audits, formatting, linting, TypeScript checking, unit tests, a live 13-tool MCP smoke check, and a bounded package manifest. A positional token is accepted for automation compatibility, but stdin or npm trusted publishing is safer.

## Related

- [`mapsource`](https://www.npmjs.com/package/mapsource) — typed REST client and complete OpenAPI contract.
- [MCP setup and agent documentation](https://mapsource.io/docs/agents)
- [Mapsource API documentation](https://mapsource.io/docs)
- [Runnable examples](https://github.com/robit-man/mapsource-examples)

MIT © Mapsource
