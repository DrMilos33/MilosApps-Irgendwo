import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const contracts = [
  {
    name: "Shell",
    directory: "milosapps-shell/v2",
    lockFile: "shell-lock.json",
    version: "2.0.3",
    sharedCommit: "ed898412306e22c6ae1b10ee8953df29f8acd627",
  },
  {
    name: "Essentials",
    directory: "milosapps-essentials/v1",
    lockFile: "essentials-lock.json",
    version: "1.1.0",
    sharedCommit: "d96e6806862a4a7405b03bd710100543916de76d",
  },
];

for (const contract of contracts) {
  const sourceRoot = new URL(`../vendor/${contract.directory}/`, import.meta.url);
  const outputRoot = new URL(`../dist/vendor/${contract.directory}/`, import.meta.url);
  const lock = JSON.parse(await readFile(new URL(contract.lockFile, sourceRoot), "utf8"));
  if (lock.version !== contract.version || lock.sharedCommit !== contract.sharedCommit) {
    throw new Error(`Unerwarteter ${contract.name}-Lock im Build-Gate.`);
  }

  for (const [file, expected] of Object.entries(lock.artifacts)) {
    const source = await readFile(new URL(file, sourceRoot));
    const output = await readFile(new URL(file, outputRoot));
    const digest = `sha256:${createHash("sha256").update(output).digest("hex")}`;
    if (!source.equals(output)) throw new Error(`${contract.name}: ${file} wurde im Build verändert.`);
    if (digest !== expected) {
      throw new Error(`${contract.name}: ${file} stimmt nicht mit dem Lock überein.`);
    }
  }

  const sourceLock = await readFile(new URL(contract.lockFile, sourceRoot));
  const outputLock = await readFile(new URL(contract.lockFile, outputRoot));
  if (!sourceLock.equals(outputLock)) {
    throw new Error(`${contract.name}: ${contract.lockFile} wurde im Build verändert.`);
  }
}

const index = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
if (!index.includes('src="/vendor/milosapps-shell/v2/bootstrap.js"')) {
  throw new Error("Der Build referenziert nicht das unveränderte Vendor-Bootstrap.");
}
if (!index.includes('src="/vendor/milosapps-essentials/v1/bootstrap.js"')) {
  throw new Error("Der Build referenziert nicht das unveränderte Essentials-Bootstrap.");
}
for (const stylesheet of ["milos-app-essentials.css", "milos-app-essentials-theme.css"]) {
  if (!index.includes(`href="/vendor/milosapps-essentials/v1/${stylesheet}"`)) {
    throw new Error(`Der Build referenziert nicht das externe ${stylesheet}.`);
  }
}
if (/<h[1-6][^>]*data-milos-loading-title/i.test(index)) {
  throw new Error("Der Loader darf keine zusätzliche Dokumentüberschrift erzeugen.");
}

console.log(`Build-Vendorprüfung: PASS (${repositoryRoot})`);
