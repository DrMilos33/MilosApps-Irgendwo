import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const sourceRoot = new URL("../vendor/milosapps-shell/v2/", import.meta.url);
const outputRoot = new URL("../dist/vendor/milosapps-shell/v2/", import.meta.url);
const lock = JSON.parse(await readFile(new URL("shell-lock.json", sourceRoot), "utf8"));

if (
  lock.version !== "2.0.3" ||
  lock.sharedCommit !== "ed898412306e22c6ae1b10ee8953df29f8acd627"
) {
  throw new Error("Unerwarteter Shell-Lock im Build-Gate.");
}

for (const [file, expected] of Object.entries(lock.artifacts)) {
  const source = await readFile(new URL(file, sourceRoot));
  const output = await readFile(new URL(file, outputRoot));
  const digest = `sha256:${createHash("sha256").update(output).digest("hex")}`;
  if (!source.equals(output)) throw new Error(`${file} wurde im Build verändert.`);
  if (digest !== expected) throw new Error(`${file} stimmt nicht mit dem Shell-Lock überein.`);
}

const sourceLock = await readFile(new URL("shell-lock.json", sourceRoot));
const outputLock = await readFile(new URL("shell-lock.json", outputRoot));
if (!sourceLock.equals(outputLock)) throw new Error("shell-lock.json wurde im Build verändert.");

const index = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
if (!index.includes('src="/vendor/milosapps-shell/v2/bootstrap.js"')) {
  throw new Error("Der Build referenziert nicht das unveränderte Vendor-Bootstrap.");
}

console.log(`Build-Vendorprüfung: PASS (${repositoryRoot})`);
