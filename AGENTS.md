# Mapsource MCP stdio adapter

`contracts/mcp.json`, `contracts/openapi.json`, `llms.txt`, the generated tool
catalog, and tool documentation are projections of the deployed Mapsource
registry. Do not hand-edit them. Run `npm run sync:contracts`, review provenance
hashes, and verify the expected 13 tools before committing a contract update.

Run `npm run typecheck` before every push for focused compiler diagnostics and
`npm run validate` for the complete format, lint, test, build, stdio smoke, and
packed-artifact gate. The adapter must keep API keys in process memory, forward
them only as an Authorization header to the configured trusted origin, and never
log them. Publishing must use `npm run publish:verified -- --token-stdin` or npm
trusted publishing; never persist an npm token.
