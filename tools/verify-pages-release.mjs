import { readFile } from "node:fs/promises";

const sourceCommit = process.env.SOURCE_SHA;
if (!/^[0-9a-f]{40}$/.test(sourceCommit ?? "")) {
  throw new Error("SOURCE_SHA muss für das Pages-Release-Gate ein vollständiger Commit-SHA sein.");
}

const expected = {
  "health.json": { appKey: "somewhere-now", environment: "DEV", productionApproved: false },
  "health/somewhere-now.json": {
    appKey: "somewhere-now",
    environment: "DEV",
    productionApproved: false,
  },
  "app-metadata.json": {
    appKey: "somewhere-now",
    status: "DEV",
    productionApproved: false,
  },
  "deployment.json": {
    appKey: "somewhere-now",
    environment: "DEV",
    productionApproved: false,
    status: "ready",
  },
};

for (const [file, identity] of Object.entries(expected)) {
  const data = JSON.parse(await readFile(new URL(`../dist/${file}`, import.meta.url), "utf8"));
  for (const [key, value] of Object.entries(identity)) {
    if (data[key] !== value) throw new Error(`${file}: ${key} verletzt den DEV-Releasevertrag.`);
  }
  if (data.sourceCommit !== sourceCommit) {
    throw new Error(`${file}: sourceCommit ist nicht der erwartete vollständige Source-SHA.`);
  }
}

process.stdout.write(`Pages-Releaseprüfung: PASS (${sourceCommit})\n`);
