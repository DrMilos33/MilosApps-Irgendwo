import { describe, expect, it } from "vitest";
import { getPlaceById } from "./locations";
import { buildSatelliteView } from "./satellite";

describe("NASA-Satellitenblick", () => {
  it("baut einen begrenzten GIBS-WMS-Ausschnitt vom robusten Vortag", () => {
    const view = buildSatelliteView(
      getPlaceById("reykjavik")!,
      new Date("2026-08-03T14:25:00Z"),
    );
    const image = new URL(view.imageUrl);

    expect(image.origin).toBe("https://gibs.earthdata.nasa.gov");
    expect(image.searchParams.get("SERVICE")).toBe("WMS");
    expect(image.searchParams.get("REQUEST")).toBe("GetMap");
    expect(image.searchParams.get("TIME")).toBe("2026-08-02");
    expect(image.searchParams.get("LAYERS")).toBe(
      "MODIS_Terra_CorrectedReflectance_TrueColor",
    );
    expect(view.captureDate).toBe("2026-08-02");
    expect(view.worldviewUrl).toMatch(/^https:\/\/worldview\.earthdata\.nasa\.gov\//);
  });

  it("hält Datumsgrenzen-Ausschnitte im gültigen Längengradbereich", () => {
    const view = buildSatelliteView(getPlaceById("waitangi")!, new Date("2026-08-03T12:00:00Z"));
    const bbox = new URL(view.imageUrl)
      .searchParams.get("BBOX")!
      .split(",")
      .map(Number);

    const [west, , east] = bbox as [number, number, number, number];
    expect(west).toBeGreaterThanOrEqual(-180);
    expect(east).toBeLessThanOrEqual(180);
    expect(east - west).toBeGreaterThanOrEqual(8);
  });

  it("kann bei verzögerter Bildverfügbarkeit genau einen weiteren Tag zurückgehen", () => {
    const view = buildSatelliteView(
      getPlaceById("tromso")!,
      new Date("2026-08-03T12:00:00Z"),
      2,
    );
    expect(view.captureDate).toBe("2026-08-01");
  });
});
