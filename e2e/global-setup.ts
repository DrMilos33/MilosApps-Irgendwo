const READINESS_URL = "http://127.0.0.1:4316/health/somewhere-now.json";

interface Readiness {
  status?: unknown;
  appKey?: unknown;
  environment?: unknown;
  readiness?: unknown;
  shellContract?: unknown;
  essentialsContract?: unknown;
  productionApproved?: unknown;
}

export default async function verifySomewhereNowReadiness(): Promise<void> {
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
    data.essentialsContract !== "public-app-essentials/v1.0.0" ||
    data.productionApproved !== false
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
      })}`,
    );
  }
}
