import { describe, expect, it } from "vitest";
import { atmosphereForWeather } from "./atmosphere";
import type { Weather } from "./types";

function weather(overrides: Partial<Weather> = {}): Weather {
  return {
    observedAt: new Date("2026-08-03T12:00:00Z"),
    temperature: 18,
    apparentTemperature: 17,
    precipitation: 0,
    rain: 0,
    showers: 0,
    snowfall: 0,
    weatherCode: 1,
    cloudCover: 18,
    relativeHumidity: 62,
    visibility: 24_000,
    windSpeed: 12,
    windDirection: 245,
    windGusts: 24,
    shortwaveRadiation: 430,
    stale: false,
    severe: false,
    ...overrides,
  };
}

describe("datengetriebene Atmosphäre", () => {
  it("verdichtet Rohdaten auf begrenzte visuelle Zustände", () => {
    expect(atmosphereForWeather(weather())).toEqual({
      cloud: "low",
      humidity: "balanced",
      light: "bright",
      visibility: "far",
      wind: "breeze",
      windDirection: "sw",
    });
  });

  it("zeigt eingeschränkte Sicht und dichte Wolken ohne freie CSS-Werte", () => {
    expect(
      atmosphereForWeather(
        weather({ cloudCover: 94, relativeHumidity: 96, visibility: 1_100, windSpeed: 38 }),
      ),
    ).toEqual({
      cloud: "dense",
      humidity: "humid",
      light: "bright",
      visibility: "near",
      wind: "strong",
      windDirection: "sw",
    });
  });

  it("liefert ohne Wetter einen ruhigen lokalen Fallback", () => {
    expect(atmosphereForWeather(null)).toEqual({
      cloud: "unknown",
      humidity: "unknown",
      light: "unknown",
      visibility: "unknown",
      wind: "still",
      windDirection: "n",
    });
  });
});
