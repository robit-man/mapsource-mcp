# Security

Report vulnerabilities privately through GitHub security advisories for
`robit-man/mapsource-mcp`. Do not place API keys, npm tokens, customer prompts,
or tool results in public issues.

The adapter reads `MAPSOURCE_API_KEY` at startup and forwards it only in the
Bearer authorization header to `https://api.mapsource.io/mcp` by default. An origin
override is accepted only through `MAPSOURCE_MCP_URL`; treat that as a trust
boundary and use an HTTPS endpoint you control. Credentials are never accepted
in a URL, persisted, or written to stdout/stderr.

The initial release helper accepts an npm token over stdin, validates a clean
repository and the full package gate before reading it, and uses a short-lived
project-prefixed npm configuration that is removed in `finally`. Trusted npm
publishing should replace bootstrap tokens after the first release.
