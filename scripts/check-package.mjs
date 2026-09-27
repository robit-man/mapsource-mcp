import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
const mcp = JSON.parse(
  await readFile(resolve(root, "contracts/mcp.json"), "utf8"),
);
const server = JSON.parse(await readFile(resolve(root, "server.json"), "utf8"));
const versionSource = await readFile(resolve(root, "src/version.ts"), "utf8");
const generated = await readFile(
  resolve(root, "src/generated/tools.ts"),
  "utf8",
);
const docs = await readFile(resolve(root, "docs/tools.md"), "utf8");
const cli = await readFile(resolve(root, "dist/cli.js"), "utf8");

if (pkg.name !== "mapsource-mcp" || pkg.private)
  throw new Error("Package identity is not publishable as mapsource-mcp");
if (
  pkg.bin?.["mapsource-mcp"] !== "dist/cli.js" ||
  !cli.startsWith("#!/usr/bin/env node\n")
)
  throw new Error(
    "The mapsource-mcp CLI must use a normalized bin path and retain its shebang",
  );
if (
  pkg.mcpName !== server.name ||
  pkg.version !== server.version ||
  pkg.version !== server.packages?.[0]?.version
)
  throw new Error("npm and MCP registry identities or versions have drifted");
if (!versionSource.includes(JSON.stringify(pkg.version)))
  throw new Error("src/version.ts does not match package.json");
if (
  new Set(mcp.tools ?? []).size !== 13 ||
  (mcp.toolDefinitions ?? []).length !== 13
)
  throw new Error("MCP contract is incomplete");
for (const tool of mcp.toolDefinitions) {
  if (!generated.includes(`"name": "${tool.name}"`))
    throw new Error(`Generated tool exports omit ${tool.name}`);
  if (!docs.includes(`\`${tool.name}\``))
    throw new Error(`Tool documentation omits ${tool.name}`);
}

const manifestText = JSON.stringify({
  dependencies: pkg.dependencies,
  devDependencies: pkg.devDependencies,
  optionalDependencies: pkg.optionalDependencies,
  peerDependencies: pkg.peerDependencies,
});
if (
  /(?:git\+|git:\/\/|github:|file:|link:|https?:\/\/[^"]+\.(?:tgz|tar\.gz))/.test(
    manifestText,
  )
)
  throw new Error("Exotic dependency source found in package.json");
for (const forbidden of ["preinstall", "install", "postinstall", "prepare"])
  if (pkg.scripts?.[forbidden])
    throw new Error(`Forbidden install lifecycle script: ${forbidden}`);

const packed = spawnSync(
  "npm",
  ["pack", "--dry-run", "--json", "--ignore-scripts"],
  { cwd: root, encoding: "utf8" },
);
if (packed.status !== 0)
  throw new Error(packed.stderr || "npm pack --dry-run failed");
const [result] = JSON.parse(packed.stdout);
if (!result || result.unpackedSize > 4 * 1024 * 1024 || result.entryCount > 100)
  throw new Error(
    "Packed artifact exceeds the 4 MiB / 100-file release bounds",
  );
const allowed =
  /^(?:package\/(?:dist\/|contracts\/|docs\/|server\.json$|README\.md$|SECURITY\.md$|LICENSE$|llms\.txt$|package\.json$))/u;
for (const file of result.files)
  if (!allowed.test(`package/${file.path}`))
    throw new Error(`Unexpected packed file: ${file.path}`);
process.stdout.write(
  `Package contract complete: ${mcp.tools.length} tools, ${result.entryCount} files, ${result.unpackedSize} bytes.\n`,
);
