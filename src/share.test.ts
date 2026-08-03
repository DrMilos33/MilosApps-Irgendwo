import { describe, expect, it } from "vitest";
import { getPlaceById } from "./domain/locations";
import { buildSharePayload, buildShareText } from "./share";
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
    expect(text).toContain("Gerade in Waitangi");
    expect(text).toContain("Ortszeit: 00:15 Uhr");
    expect(text).toContain("„Irgendwo ist gerade …“");
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
    expect(text).toContain("Right now in Waitangi, Chatham Islands, New Zealand");
    expect(text).toContain("Local time: 00:15");
    expect(text).not.toContain(String(place.latitude));
    expect(text).not.toContain(String(place.longitude));
  });

  it("liefert einen geteilten Root-Link ohne Ortsparameter", () => {
    const place = getPlaceById("reykjavik")!;
    const payload = buildSharePayload(
      place,
      {
        kind: "day",
        title: "Der Tag ist längst unterwegs.",
        detail: "In Reykjavík steht die Sonne über dem Horizont.",
      },
      "14:10 Uhr",
      "de",
      "https://example.test/",
    );

    expect(payload.url).toBe("https://example.test/");
    expect(payload.url).not.toContain("place=");
    expect(payload.text).toContain("Reykjavík");
    expect(payload.text).toContain("Ortszeit: 14:10 Uhr");
    expect(payload.text).not.toContain(String(place.latitude));
    expect(payload.text).not.toContain(String(place.longitude));
  });
});
