import { describe, expect, it } from "vitest";
import { chooseNextPlace, getPlaceById, PLACES } from "./locations";

describe("kuratierte Orte", () => {
  it("hat eindeutige App- und GeoNames-IDs", () => {
    expect(new Set(PLACES.map((place) => place.id)).size).toBe(PLACES.length);
    expect(new Set(PLACES.map((place) => place.geonameId)).size).toBe(PLACES.length);
  });

  it("enthält nur vom Laufzeitsystem unterstützte Zeitzonen", () => {
    for (const place of PLACES) {
      expect(() => new Intl.DateTimeFormat("de-DE", { timeZone: place.timeZone })).not.toThrow();
      expect(place.latitude).toBeGreaterThanOrEqual(-90);
      expect(place.latitude).toBeLessThanOrEqual(90);
      expect(place.longitude).toBeGreaterThanOrEqual(-180);
      expect(place.longitude).toBeLessThanOrEqual(180);
    }
  });

  it("wählt nicht direkt denselben Ort erneut", () => {
    expect(chooseNextPlace("longyearbyen", () => 0).id).not.toBe("longyearbyen");
    expect(chooseNextPlace(null, () => 0)).toEqual(PLACES[0]);
  });

  it("löst nur bekannte direkte Ortslinks auf", () => {
    expect(getPlaceById("waitangi")?.timeZone).toBe("Pacific/Chatham");
    expect(getPlaceById("../secret")).toBeNull();
  });
});
