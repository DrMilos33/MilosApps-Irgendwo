import { describe, expect, it } from "vitest";
import { PLACES } from "./locations";
import { CURATED_WEBCAMS, webcamForPlace } from "./webcams";

describe("seltene kuratierte Webcams", () => {
  it("bleibt bewusst auf wenige überprüfte Orte begrenzt", () => {
    expect(CURATED_WEBCAMS.length).toBeGreaterThanOrEqual(2);
    expect(CURATED_WEBCAMS.length / PLACES.length).toBeLessThan(0.1);
    expect(new Set(CURATED_WEBCAMS.map((camera) => camera.placeId)).size).toBe(
      CURATED_WEBCAMS.length,
    );
  });

  it("verwendet ausschließlich den offiziellen Windy-Player mit sichtbarer Herkunft", () => {
    for (const camera of CURATED_WEBCAMS) {
      const player = new URL(camera.playerUrl);
      expect(player.origin).toBe("https://webcams.windy.com");
      expect(player.searchParams.get("webcamId")).toBe(camera.webcamId);
      expect(camera.detailUrl).toBe(`https://www.windy.com/webcams/${camera.webcamId}`);
      expect(camera.checkedAt).toMatch(/^2026-08-03$/);
    }
  });

  it("liefert an allen anderen Orten kein Kameraangebot", () => {
    expect(webcamForPlace("tromso")?.title).toContain("Fjellheisen");
    expect(webcamForPlace("tokyo")).toBeNull();
  });
});
