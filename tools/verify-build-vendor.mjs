import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const pagesBasePath = "/MilosApps-Irgendwo/";
const modeFlag = process.argv.indexOf("--mode");
const mode = modeFlag >= 0 ? process.argv[modeFlag + 1] : "root";
if (!['root', 'pages'].includes(mode)) {
  throw new Error(`Unbekannter Buildmodus: ${mode ?? "(fehlt)"}`);
}

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
    version: "1.1.5",
    sharedCommit: "2942132ad3bf6cf39edc9f52ed918de6a230be23",
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
const expectedEntry = mode === "pages" ? `${pagesBasePath}src/entry.js` : "/src/entry.js";
for (const [label, reference] of [
  ["Shell-Bootstrap", 'src="./vendor/milosapps-shell/v2/bootstrap.js"'],
  ["Essentials-Bootstrap", 'src="./vendor/milosapps-essentials/v1/bootstrap.js"'],
  ["Essentials-Basis-CSS", 'href="./vendor/milosapps-essentials/v1/milos-app-essentials.css"'],
  ["Essentials-Theme-CSS", 'href="./vendor/milosapps-essentials/v1/milos-app-essentials-theme.css"'],
]) {
  if (!index.includes(reference)) throw new Error(`${label} ist nicht als relative externe Same-Origin-Ressource erhalten.`);
}
if (!index.includes(`src="${expectedEntry}"`)) {
  throw new Error(`Der ${mode}-Build referenziert nicht das erwartete stabile App-Einstiegsmodul ${expectedEntry}.`);
}
if (/\b(?:src|href)="\/(?:vendor|favicon\.svg|manifest\.webmanifest)/.test(index)) {
  throw new Error("Vite-ignore-/Public-Ressourcen dürfen nicht an die Originwurzel gebunden sein.");
}
if (/data:text\/(?:css|javascript)/i.test(index)) {
  throw new Error("Vendor-CSS oder -JavaScript darf nicht als data:-URL eingebettet werden.");
}
if (/<h[1-6][^>]*data-milos-loading-title/i.test(index)) {
  throw new Error("Der Loader darf keine zusätzliche Dokumentüberschrift erzeugen.");
}
if (mode === "pages") {
  const rootReferences = [...index.matchAll(/\b(?:src|href)="(\/[^\"]+)"/g)].map((match) => match[1]);
  if (rootReferences.some((reference) => !reference.startsWith(pagesBasePath))) {
    throw new Error(`Pages-Build enthält eine lokale Root-URL außerhalb von ${pagesBasePath}.`);
  }
}

await readFile(new URL("../dist/src/entry.js", import.meta.url));
await readFile(new URL("../dist/.nojekyll", import.meta.url));

const manifest = JSON.parse(await readFile(new URL("../dist/manifest.webmanifest", import.meta.url), "utf8"));
if (manifest.start_url !== "./" || manifest.scope !== "./" || manifest.icons?.[0]?.src !== "./favicon.svg") {
  throw new Error("Webmanifest ist nicht relativ und damit nicht Root-/Pages-portabel.");
}

const health = JSON.parse(await readFile(new URL("../dist/health/somewhere-now.json", import.meta.url), "utf8"));
if (
  health.appKey !== "somewhere-now" ||
  health.environment !== "DEV" ||
  health.readiness !== true ||
  health.productionApproved !== false
) {
  throw new Error("Gebauter Healthcheck verletzt App-Identität oder DEV-/Productiongrenze.");
}

const metadata = JSON.parse(await readFile(new URL("../dist/app-metadata.json", import.meta.url), "utf8"));
if (
  metadata.devUrl !== "https://drmilos33.github.io/MilosApps-Irgendwo/" ||
  metadata.healthcheck !== "https://drmilos33.github.io/MilosApps-Irgendwo/health/somewhere-now.json" ||
  metadata.productionApproved !== false
) {
  throw new Error("Gebautes App-Metadatum verletzt den GitHub-Pages-DEV-Vertrag.");
}

const serviceWorker = await readFile(new URL("../dist/sw.js", import.meta.url), "utf8");
const shellDefinition = serviceWorker.slice(
  serviceWorker.indexOf("const SHELL = ["),
  serviceWorker.indexOf("].map((relativePath) => appUrl(relativePath));") + 2,
);
for (const forbidden of ["health.json", "health/somewhere-now.json", "app-metadata.json", "deployment.json"]) {
  if (shellDefinition.includes(`"${forbidden}"`)) {
    throw new Error(`Service-Worker darf aktuelle Readiness-/Deploymentdaten nicht precachen: ${forbidden}`);
  }
}
for (const expected of [
  'const CACHE_NAME = "somewhere-now-shell-v15"',
  'new URL("./", self.registration.scope)',
  "const LIVE_METADATA_PATHS = new Set([",
  'new URL("health/somewhere-now.json", APP_BASE_URL).pathname',
  'new URL("deployment.json", APP_BASE_URL).pathname',
  "LIVE_METADATA_PATHS.has(url.pathname)",
  'fetch(request, { cache: "no-store" })',
  '"src/entry.js"',
  '"vendor/milosapps-shell/v2/bootstrap.js"',
  '"vendor/milosapps-essentials/v1/bootstrap.js"',
]) {
  if (!serviceWorker.includes(expected)) throw new Error(`Service-Worker-Precache fehlt oder ist nicht basisbewusst: ${expected}`);
}

console.log(`Build-Vendor-/Pagesprüfung: PASS (${mode}, ${repositoryRoot})`);
