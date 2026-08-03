const LOCAL_APP_URL = "http://127.0.0.1:4316/";
const LOCAL_PAGES_URL = "http://127.0.0.1:4316/MilosApps-Irgendwo/";
const APP_URL =
  process.env.E2E_BASE_URL ??
  (process.env.E2E_PAGES === "true" ? LOCAL_PAGES_URL : LOCAL_APP_URL);
const READINESS_URL = new URL("health/somewhere-now.json", APP_URL).href;

interface Readiness {
  status?: unknown;
  appKey?: unknown;
  environment?: unknown;
  readiness?: unknown;
  shellContract?: unknown;
  essentialsContract?: unknown;
  productionApproved?: unknown;
  sourceCommit?: unknown;
}

export default async function verifySomewhereNowReadiness(): Promise<void> {
  const expectedSourceCommit = process.env.E2E_EXPECTED_SOURCE_SHA;
  if (process.env.E2E_BASE_URL && !/^[0-9a-f]{40}$/.test(expectedSourceCommit ?? "")) {
    throw new Error("Externe E2E benötigen E2E_EXPECTED_SOURCE_SHA als vollständigen Commit-SHA.");
  }
  const response = await fetch(READINESS_URL, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`somewhere-now Readiness antwortete mit HTTP ${response.status}.`);
  }

  const data = (await response.json()) as Readiness;
  if (
    data.appKey !== "somewhere-now" ||
    data.status !== "ok" ||
    data.environment !== "DEV" ||
    data.readiness !== true ||
    data.shellContract !== "public-app-shell/v2.0.3" ||
    data.essentialsContract !== "public-app-essentials/v1.1.5" ||
    data.productionApproved !== false ||
    (expectedSourceCommit !== undefined && data.sourceCommit !== expectedSourceCommit)
  ) {
    throw new Error(
      `Falscher Dienst auf DEV-Port 4316: ${JSON.stringify({
        appKey: data.appKey,
        status: data.status,
        environment: data.environment,
        readiness: data.readiness,
        shellContract: data.shellContract,
        essentialsContract: data.essentialsContract,
        productionApproved: data.productionApproved,
        sourceCommit: data.sourceCommit,
      })}`,
    );
  }
}
