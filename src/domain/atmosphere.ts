import type { Weather } from "./types";

export interface SceneAtmosphere {
  cloud: "unknown" | "low" | "mixed" | "dense";
  humidity: "unknown" | "dry" | "balanced" | "humid";
  light: "unknown" | "dim" | "soft" | "bright";
  visibility: "unknown" | "near" | "medium" | "far";
  wind: "still" | "breeze" | "strong";
  windDirection: "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";
}

const DIRECTIONS: SceneAtmosphere["windDirection"][] = [
  "n",
  "ne",
  "e",
  "se",
  "s",
  "sw",
  "w",
  "nw",
];

export function atmosphereForWeather(weather: Weather | null): SceneAtmosphere {
  if (!weather || weather.severe) {
    return {
      cloud: "unknown",
      humidity: "unknown",
      light: "unknown",
      visibility: "unknown",
      wind: "still",
      windDirection: "n",
    };
  }

  const normalizedDirection = ((weather.windDirection % 360) + 360) % 360;
  return {
    cloud: weather.cloudCover <= 30 ? "low" : weather.cloudCover <= 70 ? "mixed" : "dense",
    humidity:
      weather.relativeHumidity < 40
        ? "dry"
        : weather.relativeHumidity <= 80
          ? "balanced"
          : "humid",
    light:
      weather.shortwaveRadiation < 50
        ? "dim"
        : weather.shortwaveRadiation < 300
          ? "soft"
          : "bright",
    visibility:
      weather.visibility < 3_000
        ? "near"
        : weather.visibility < 10_000
          ? "medium"
          : "far",
    wind: weather.windSpeed < 5 ? "still" : weather.windSpeed < 25 ? "breeze" : "strong",
    windDirection: DIRECTIONS[Math.floor((normalizedDirection + 22.5) / 45) % 8]!,
  };
}
