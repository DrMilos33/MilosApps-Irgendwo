import { describe, expect, it } from "vitest";
import type { Daylight, Weather } from "./types";
import { getPlaceById } from "./locations";
import { sceneWeather, selectMoment } from "./moments";

const place = getPlaceById("tromso")!;
const daylight: Daylight = {
  phase: "day",
  altitude: 30,
  azimuth: 140,
  sunrise: new Date("2026-07-30T01:00:00Z"),
  sunset: new Date("2026-07-30T21:00:00Z"),
  nextEvent: "sunset",
  nextEventAt: new Date("2026-07-30T21:00:00Z"),
};
const weather: Weather = {
  observedAt: new Date("2026-07-30T12:00:00Z"),
  temperature: 8,
  apparentTemperature: 7,
  precipitation: 0,
  rain: 0,
  showers: 0,
  snowfall: 0,
  weatherCode: 1,
  cloudCover: 8,
  windSpeed: 7,
  windGusts: 15,
  stale: false,
  severe: false,
};

describe("Momentauswahl", () => {
  it("ist mit injiziertem Zufall reproduzierbar", () => {
    const now = new Date("2026-07-30T12:10:00Z");
    expect(selectMoment(place, daylight, weather, now, () => 0)).toEqual(
      selectMoment(place, daylight, weather, now, () => 0),
    );
  });

  it("spielt gefährliches Wetter niemals als Moment aus", () => {
    const moment = selectMoment(
      place,
      daylight,
      { ...weather, severe: true, weatherCode: 95 },
      new Date("2026-07-30T12:10:00Z"),
    );
    expect(moment.kind).toBe("weather-withheld");
    expect(moment.title).not.toMatch(/Gewitter|Sturm/);
    expect(sceneWeather({ ...weather, severe: true })).toBe("clear");
  });

  it("verwendet veraltetes Wetter nicht für die Inszenierung", () => {
    const moment = selectMoment(
      place,
      { ...daylight, phase: "night" },
      { ...weather, stale: true, cloudCover: 0 },
      new Date("2026-07-30T12:10:00Z"),
      () => 0.999,
    );
    expect(moment.kind).not.toBe("clear-night");
  });
});
