import { readFile, writeFile } from "node:fs/promises";

const sourceCommit = process.env.SOURCE_SHA;
if (!/^[0-9a-f]{40}$/.test(sourceCommit ?? "")) {
  throw new Error("SOURCE_SHA muss für das Pages-Artefakt ein vollständiger Commit-SHA sein.");
}

const files = ["health.json", "health/somewhere-now.json", "app-metadata.json"];
for (const file of files) {
  const url = new URL(`../dist/${file}`, import.meta.url);
  const data = JSON.parse(await readFile(url, "utf8"));
  data.sourceCommit = sourceCommit;
  await writeFile(url, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

const deployment = {
  status: "ready",
  appKey: "somewhere-now",
  environment: "DEV",
  sourceCommit,
  productionApproved: false,
};
await writeFile(
  new URL("../dist/deployment.json", import.meta.url),
  `${JSON.stringify(deployment, null, 2)}\n`,
  "utf8",
);

process.stdout.write(`Pages-Artefakt gestempelt: ${sourceCommit}\n`);
