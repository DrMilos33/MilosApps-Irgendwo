import { describe, expect, it } from "vitest";
import { atmosphericImageFor, atmosphericPhaseFor } from "./atmospheric-images";
import type { Daylight } from "./types";

const daylight: Daylight = {
  phase: "day",
  altitude: 25,
  azimuth: 180,
  sunrise: new Date("2026-08-03T04:00:00Z"),
  sunset: new Date("2026-08-03T20:00:00Z"),
  nextEvent: "sunset",
  nextEventAt: new Date("2026-08-03T20:00:00Z"),
};

describe("atmospheric images", () => {
  it("binds each explicit focus to its promised photographic mood", () => {
    expect(atmosphericPhaseFor("sunrise", daylight, "day")).toBe("morning");
    expect(atmosphericPhaseFor("sunset", daylight, "day")).toBe("evening");
    expect(atmosphericPhaseFor("night", daylight, "day")).toBe("night");
  });

  it("uses the actual selected moment for surprise mode", () => {
    expect(atmosphericPhaseFor("surprise", daylight, "sunrise")).toBe("morning");
    expect(atmosphericPhaseFor("surprise", daylight, "sunset")).toBe("evening");
    expect(atmosphericPhaseFor("surprise", daylight, "clear-night")).toBe("night");
  });

  it("keeps source and license details attached to every local image", () => {
    const image = atmosphericImageFor("night", daylight, "day");
    expect(image.src).toMatch(/^\.\/media\/atmosphere\//);
    expect(image.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
    expect(image.licenseUrl).toMatch(/^https:\/\//);
    expect(image.author).toBeTruthy();
    expect(image.license).toBeTruthy();
  });
});
