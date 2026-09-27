import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { tmpdir } from "node:os";

const root = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const stdinMode = args.includes("--token-stdin");
const positional = args.find((argument) => !argument.startsWith("--"));
if (!stdinMode && !positional)
  throw new Error(
    "Pass the npm token with --token-stdin (recommended) or as the positional argument.",
  );
if (stdinMode && positional)
  throw new Error(
    "Choose either --token-stdin or a positional token, not both.",
  );
let token = positional;
for (let index = 2; index < process.argv.length; index += 1)
  process.argv[index] = "[redacted]";

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    stdio: "inherit",
    ...options,
  });
  if (result.status !== 0)
    throw new Error(
      `${command} ${commandArgs.join(" ")} failed with exit code ${result.status ?? "unknown"}`,
    );
}

run("npm", ["ci", "--ignore-scripts"]);
run("npm", ["run", "validate:release"]);
if (stdinMode)
  token = await new Promise((resolveInput, reject) => {
    let value = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      value += chunk;
      if (value.includes("\n")) {
        process.stdin.pause();
        resolveInput(value.split("\n", 1)[0].trim());
      }
    });
    process.stdin.on("end", () => resolveInput(value.trim()));
    process.stdin.on("error", reject);
  });
if (!token || !token.startsWith("npm_"))
  throw new Error("The supplied npm token is missing or malformed");

let temporary;
try {
  temporary = await mkdtemp(join(tmpdir(), "mapsource-mcp-npm-publish-"));
  if (
    !temporary.startsWith(`${tmpdir()}${sep}`) ||
    !temporary.split(sep).at(-1)?.startsWith("mapsource-mcp-npm-publish-")
  )
    throw new Error("Unsafe temporary publish path");
  const npmrc = join(temporary, "npmrc");
  await writeFile(
    npmrc,
    "registry=https://registry.npmjs.org/\n//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}\n",
    { mode: 0o600 },
  );
  const env = {
    ...process.env,
    NODE_AUTH_TOKEN: token,
    NPM_CONFIG_USERCONFIG: npmrc,
  };
  run("npm", ["whoami"], { env });
  run("npm", ["publish", "--access", "public", "--ignore-scripts"], { env });
} finally {
  // eslint-disable-next-line no-useless-assignment -- deliberately release the secret reference before cleanup
  token = undefined;
  if (temporary) await rm(temporary, { recursive: true, force: true });
}
