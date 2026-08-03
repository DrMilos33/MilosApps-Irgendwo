import { describe, expect, it } from "vitest";
import { chooseNextPlace, evaluatePlaceInterest } from "./selection";
import { getPlaceById } from "./locations";
import type { Daylight } from "./types";

const now = new Date("2026-08-03T12:00:00Z");

function daylight(overrides: Partial<Daylight> = {}): Daylight {
  return {
    phase: "day",
    altitude: 30,
    azimuth: 120,
    sunrise: null,
    sunset: null,
    nextEvent: null,
    nextEventAt: null,
    ...overrides,
  };
}

describe("interessante Ortsauswahl", () => {
  it("priorisiert einen nahen Lichtwechsel und erklärt ihn", () => {
    const place = getPlaceById("reykjavik")!;
    const transition = evaluatePlaceInterest(
      place,
      daylight({ nextEvent: "sunset", nextEventAt: new Date(now.getTime() + 20 * 60_000) }),
      now,
    );
    const ordinary = evaluatePlaceInterest(place, daylight(), now);

    expect(transition.reason).toBe("sunset-soon");
    expect(transition.score).toBeGreaterThan(ordinary.score);
  });

  it("schließt den aktuellen und sechs kürzlich bereiste Orte aus", () => {
    const recentIds = ["reykjavik", "nuuk", "dakar", "quito", "tokyo", "suva"];
    const selection = chooseNextPlace({
      currentId: "longyearbyen",
      recentIds,
      now,
      random: () => 0,
      daylightForPlace: () => daylight({ phase: "twilight" }),
    });

    expect(selection.place.id).not.toBe("longyearbyen");
    expect(recentIds).not.toContain(selection.place.id);
  });

  it("bevorzugt in einer gleich interessanten Gruppe eine neue Landschaft", () => {
    const selection = chooseNextPlace({
      currentId: "reykjavik",
      recentIds: ["reykjavik", "torshavn", "suva"],
      now,
      random: () => 0,
      daylightForPlace: () => daylight({ phase: "golden" }),
    });

    expect(selection.place.landscape).not.toBe("island");
  });
});
