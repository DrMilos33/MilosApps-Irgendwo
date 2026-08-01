import { describe, expect, it } from "vitest";
import { getPlaceById } from "./domain/locations";
import { localizePlace, normalizeLanguage, t } from "./i18n";

describe("vollständige App-Lokalisierung", () => {
  it("fällt für unbekannte Werte sicher auf Deutsch zurück", () => {
    expect(normalizeLanguage("en")).toBe("en");
    expect(normalizeLanguage("fr")).toBe("de");
    expect(normalizeLanguage(null)).toBe("de");
  });

  it("liefert zentrale Fachtexte in beiden Sprachen ohne offene Platzhalter", () => {
    expect(t("de", "statusWeatherLoading", { place: "Reykjavík" })).toBe(
      "Wetter für Reykjavík wird geladen …",
    );
    expect(t("en", "statusWeatherLoading", { place: "Reykjavík" })).toBe(
      "Loading weather for Reykjavík …",
    );
    expect(t("en", "sceneLabel", { place: "Tokyo", title: "Day.", detail: "Clear." })).toBe(
      "Procedural abstract scene for Tokyo: Day. Clear.",
    );
  });

  it("übersetzt Orts- und Ländernamen ohne Geodaten zu verändern", () => {
    const place = getPlaceById("cape-town")!;
    const english = localizePlace(place, "en");
    expect(english).toMatchObject({ name: "Cape Town", country: "South Africa" });
    expect(english.latitude).toBe(place.latitude);
    expect(english.longitude).toBe(place.longitude);
    expect(localizePlace(place, "de")).toBe(place);
  });
});
