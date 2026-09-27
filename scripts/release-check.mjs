import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0)
    throw new Error(
      `${command} ${args.join(" ")} failed with exit code ${result.status ?? "unknown"}`,
    );
}
const npmVersion = spawnSync("npm", ["--version"], {
  cwd: root,
  encoding: "utf8",
}).stdout.trim();
const [npmMajor = 0, npmMinor = 0] = npmVersion.split(".").map(Number);
if (npmMajor < 11 || (npmMajor === 11 && npmMinor < 5))
  throw new Error(
    `npm >=11.5 is required to enforce min-release-age; found ${npmVersion}`,
  );
const branch = spawnSync("git", ["branch", "--show-current"], {
  cwd: root,
  encoding: "utf8",
}).stdout.trim();
if (branch !== "main")
  throw new Error(
    `Release must run from main, not ${branch || "detached HEAD"}`,
  );
const status = spawnSync("git", ["status", "--porcelain"], {
  cwd: root,
  encoding: "utf8",
}).stdout.trim();
if (status) throw new Error(`Release requires a clean worktree:\n${status}`);
const pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
const existing = spawnSync(
  "npm",
  ["view", `${pkg.name}@${pkg.version}`, "version", "--json"],
  { cwd: root, encoding: "utf8" },
);
if (existing.status === 0 && existing.stdout.trim())
  throw new Error(`${pkg.name}@${pkg.version} is already published`);
run("npm", ["audit", "--audit-level=high"]);
run("npm", ["audit", "signatures"]);
run("npm", ["run", "validate"]);
process.stdout.write(`Release gate passed for ${pkg.name}@${pkg.version}.\n`);
