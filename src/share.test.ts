import { describe, expect, it } from "vitest";
import { getPlaceById } from "./domain/locations";
import { buildShareText } from "./share";
import { localizePlace } from "./i18n";

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

  it("teilt den Fachinhalt vollständig auf Englisch", () => {
    const place = getPlaceById("waitangi")!;
    const englishPlace = localizePlace(place, "en");
    const text = buildShareText(
      englishPlace,
      {
        kind: "night",
        title: "The island is sleeping.",
        detail: "It is night there.",
      },
      "00:15",
      "en",
    );
    expect(text).toContain("Somewhere, right now …");
    expect(text).toContain("Waitangi, Chatham Islands, New Zealand · 00:15");
    expect(text).not.toContain(String(place.latitude));
    expect(text).not.toContain(String(place.longitude));
  });
});
