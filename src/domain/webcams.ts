export interface CuratedWebcam {
  placeId: string;
  webcamId: string;
  title: string;
  playerUrl: string;
  detailUrl: string;
  operatorName: string;
  operatorUrl: string;
  checkedAt: string;
}

function playerUrl(webcamId: string): string {
  const url = new URL("https://webcams.windy.com/webcams/public/embed/player");
  url.searchParams.set("forceFullScreenOnOverlayPlay", "false");
  url.searchParams.set("interactive", "true");
  url.searchParams.set("loop", "false");
  url.searchParams.set("playerType", "day");
  url.searchParams.set("webcamId", webcamId);
  return url.toString();
}

export const CURATED_WEBCAMS: readonly CuratedWebcam[] = [
  {
    placeId: "tromso",
    webcamId: "1345854014",
    title: "Tromsø: Fjellheisen",
    playerUrl: playerUrl("1345854014"),
    detailUrl: "https://www.windy.com/webcams/1345854014",
    operatorName: "Fjellheisen",
    operatorUrl: "https://webcam.fjellheisen.no/",
    checkedAt: "2026-08-03",
  },
  {
    placeId: "reykjavik",
    webcamId: "1545635591",
    title: "Reykjavík: Miðbakki-Hafen",
    playerUrl: playerUrl("1545635591"),
    detailUrl: "https://www.windy.com/webcams/1545635591",
    operatorName: "Webcamtaxi",
    operatorUrl: "https://www.webcamtaxi.com/en/iceland/reykjavik/miobakki-harbour-cam.html",
    checkedAt: "2026-08-03",
  },
  {
    placeId: "cape-town",
    webcamId: "1170887551",
    title: "Kapstadt: Tafelberg von Milnerton",
    playerUrl: playerUrl("1170887551"),
    detailUrl: "https://www.windy.com/webcams/1170887551",
    operatorName: "Kapstadt.de",
    operatorUrl: "https://www.kapstadt.de/reisefuehrer/westkueste/milnerton/webcam",
    checkedAt: "2026-08-03",
  },
] as const;

export function webcamForPlace(placeId: string): CuratedWebcam | null {
  return CURATED_WEBCAMS.find((camera) => camera.placeId === placeId) ?? null;
}
