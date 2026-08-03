import { describe, expect, it } from "vitest";
import { buildWeatherUrl, parseWeatherResponse, WeatherRequestError } from "./weather";
import { getPlaceById } from "./locations";

const base = {
  current: {
    time: "2026-07-30T12:00",
    temperature_2m: 18.4,
    apparent_temperature: 17.8,
    precipitation: 0,
    rain: 0,
    showers: 0,
    snowfall: 0,
    weather_code: 1,
    cloud_cover: 18,
    relative_humidity_2m: 62,
    visibility: 24_000,
    wind_speed_10m: 12,
    wind_direction_10m: 245,
    wind_gusts_10m: 24,
    shortwave_radiation: 430,
  },
};

describe("Wetterdaten", () => {
  it("fragt nur notwendige aktuelle Werte in GMT an", () => {
    const place = getPlaceById("tromso")!;
    const url = new URL(buildWeatherUrl(place));
    expect(url.origin).toBe("https://api.open-meteo.com");
    expect(url.searchParams.get("timezone")).toBe("GMT");
    expect(url.searchParams.get("forecast_days")).toBe("1");
    expect(url.searchParams.get("latitude")).toBe(String(place.latitude));
    expect(url.searchParams.get("current")).toContain("visibility");
    expect(url.searchParams.get("current")).toContain("shortwave_radiation");
  });

  it("markiert alte Daten ehrlich", () => {
    const weather = parseWeatherResponse(base, new Date("2026-07-30T14:00:00Z"));
    expect(weather.stale).toBe(true);
  });

  it("übernimmt die Atmosphärendaten für die prozedurale Live-Szene", () => {
    const weather = parseWeatherResponse(base, new Date("2026-07-30T12:10:00Z"));
    expect(weather.relativeHumidity).toBe(62);
    expect(weather.visibility).toBe(24_000);
    expect(weather.windDirection).toBe(245);
    expect(weather.shortwaveRadiation).toBe(430);
  });

  it.each([
    ["Gewitter", 95, 12, 24],
    ["schwere Böen", 1, 12, 82],
    ["Sturm", 1, 61, 70],
  ])("inszeniert %s nicht", (_label, code, wind, gusts) => {
    const weather = parseWeatherResponse(
      {
        current: {
          ...base.current,
          weather_code: code,
          wind_speed_10m: wind,
          wind_gusts_10m: gusts,
        },
      },
      new Date("2026-07-30T12:10:00Z"),
    );
    expect(weather.severe).toBe(true);
  });

  it("weist unvollständige Antworten zurück", () => {
    expect(() =>
      parseWeatherResponse({ current: { time: "2026-07-30T12:00" } }, new Date()),
    ).toThrow(WeatherRequestError);
  });
});
