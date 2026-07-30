import { describe, expect, it } from "vitest";
import { getPlaceById } from "./domain/locations";
import { buildShareText } from "./share";

describe("Teilkarte", () => {
  it("enthält keine versteckten exakten Koordinaten", () => {
    const place = getPlaceById("waitangi")!;
    const text = buildShareText(
      place,
      {
        kind: "night",
        title: "Die Insel schläft.",
        detail: "Dort ist es Nacht.",
      },
      "00:15 Uhr",
    );
    expect(text).toContain("Waitangi");
    expect(text).not.toContain(String(place.latitude));
    expect(text).not.toContain(String(place.longitude));
    expect(text).not.toContain("geoname");
  });
});
