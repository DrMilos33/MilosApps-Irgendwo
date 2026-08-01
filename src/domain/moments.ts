import { formatLocalTime, minutesBetween, minutesFromLocalMidnight } from "./time";
import type { Daylight, Moment, Place, Weather } from "./types";
import { t, type Language } from "../i18n";

interface Candidate extends Moment {
  weight: number;
}

function minutesUntil(event: Date | null, now: Date): number | null {
  if (!event) return null;
  return minutesBetween(now, event);
}

function chooseWeighted(candidates: Candidate[], random: () => number): Moment {
  const total = candidates.reduce((sum, candidate) => sum + candidate.weight, 0);
  let cursor = random() * total;
  for (const candidate of candidates) {
    cursor -= candidate.weight;
    if (cursor <= 0) {
      const { weight: _weight, ...moment } = candidate;
      return moment;
    }
  }
  const { weight: _weight, ...fallback } = candidates[candidates.length - 1]!;
  return fallback;
}

function daylightFallback(place: Place, daylight: Daylight, language: Language): Candidate {
  switch (daylight.phase) {
    case "polar-day":
      return {
        kind: "polar-day",
        title: t(language, "momentPolarDayTitle"),
        detail: t(language, "momentPolarDayDetail", { place: place.name }),
        weight: 10,
      };
    case "polar-night":
      return {
        kind: "polar-night",
        title: t(language, "momentPolarNightTitle"),
        detail: t(language, "momentPolarNightDetail", { place: place.name }),
        weight: 10,
      };
    case "golden":
      return {
        kind: daylight.altitude >= 0 ? "sunset" : "sunrise",
        title: t(language, "momentGoldenTitle"),
        detail: t(language, "momentGoldenDetail", { place: place.name }),
        weight: 5,
      };
    case "twilight":
      return {
        kind: "blue-hour",
        title: t(language, "momentTwilightTitle"),
        detail: t(language, "momentTwilightDetail", { place: place.name }),
        weight: 5,
      };
    case "night":
      return {
        kind: "night",
        title: t(language, "momentNightTitle"),
        detail: t(language, "momentNightDetail", { place: place.name }),
        weight: 4,
      };
    case "day":
      return {
        kind: "day",
        title: t(language, "momentDayTitle"),
        detail: t(language, "momentDayDetail", { place: place.name }),
        weight: 4,
      };
  }
}

export function selectMoment(
  place: Place,
  daylight: Daylight,
  weather: Weather | null,
  now: Date,
  random: () => number = Math.random,
  language: Language = "de",
): Moment {
  if (weather?.severe) {
    return {
      kind: "weather-withheld",
      title: t(language, "momentWithheldTitle"),
      detail: t(language, "momentWithheldDetail", { place: place.name }),
    };
  }

  const candidates: Candidate[] = [daylightFallback(place, daylight, language)];
  const localMinute = minutesFromLocalMidnight(now, place.timeZone);
  const toSunrise = daylight.nextEvent === "sunrise" ? minutesUntil(daylight.nextEventAt, now) : null;
  const toSunset = daylight.nextEvent === "sunset" ? minutesUntil(daylight.nextEventAt, now) : null;

  if (toSunrise !== null && toSunrise >= 0 && toSunrise <= 45) {
    candidates.push({
      kind: "sunrise",
      title: t(language, "momentSunriseTitle"),
      detail: t(language, "momentSunriseDetail", {
        place: place.name,
        time: formatLocalTime(daylight.nextEventAt!, place.timeZone, language),
      }),
      weight: 12,
    });
  }
  if (toSunset !== null && toSunset >= 0 && toSunset <= 45) {
    candidates.push({
      kind: "sunset",
      title: t(language, "momentSunsetTitle"),
      detail: t(language, "momentSunsetDetail", {
        place: place.name,
        time: formatLocalTime(daylight.nextEventAt!, place.timeZone, language),
      }),
      weight: 12,
    });
  }
  if (localMinute <= 30 || localMinute >= 1410) {
    candidates.push({
      kind: "night",
      title: t(language, "momentMidnightTitle"),
      detail: t(language, "momentMidnightDetail", { place: place.name }),
      weight: 9,
    });
  }

  if (weather && !weather.stale) {
    if ([45, 48].includes(weather.weatherCode)) {
      candidates.push({
        kind: "fog",
        title: t(language, "momentFogTitle"),
        detail: t(language, "momentFogDetail", { place: place.name }),
        weight: 14,
      });
    }
    if (weather.snowfall > 0 && weather.weatherCode < 75) {
      candidates.push({
        kind: "snow",
        title: t(language, "momentSnowTitle"),
        detail: t(language, "momentSnowDetail", { place: place.name }),
        weight: 14,
      });
    }
    if (weather.rain + weather.showers > 0 && weather.weatherCode < 65) {
      candidates.push({
        kind: "rain",
        title: t(language, "momentRainTitle"),
        detail: t(language, "momentRainDetail", { place: place.name }),
        weight: 11,
      });
    }
    if (daylight.phase === "night" && weather.cloudCover <= 18) {
      candidates.push({
        kind: "clear-night",
        title: t(language, "momentClearNightTitle"),
        detail: t(language, "momentClearNightDetail", { place: place.name }),
        weight: 11,
      });
    }
    if (weather.temperature >= 32) {
      candidates.push({
        kind: "warm",
        title: t(language, "momentWarmTitle"),
        detail: t(language, "momentWarmDetail", {
          place: place.name,
          temperature: Math.round(weather.temperature),
        }),
        weight: 7,
      });
    }
    if (weather.temperature <= -15) {
      candidates.push({
        kind: "cold",
        title: t(language, "momentColdTitle"),
        detail: t(language, "momentColdDetail", {
          place: place.name,
          temperature: Math.round(weather.temperature),
        }),
        weight: 7,
      });
    }
    if (weather.windSpeed >= 25 && weather.windSpeed < 50) {
      candidates.push({
        kind: "wind",
        title: t(language, "momentWindTitle"),
        detail: t(language, "momentWindDetail", {
          place: place.name,
          speed: Math.round(weather.windSpeed),
        }),
        weight: 6,
      });
    }
  }

  return chooseWeighted(candidates, random);
}

export function weatherDescription(weather: Weather, language: Language = "de"): string {
  if (weather.severe) return t(language, "weatherWithheld");
  const values = { temperature: Math.round(weather.temperature) };
  if (weather.stale) return t(language, "weatherStale", values);
  if ([45, 48].includes(weather.weatherCode)) return t(language, "weatherFog", values);
  if (weather.snowfall > 0) return t(language, "weatherSnow", values);
  if (weather.rain + weather.showers > 0) return t(language, "weatherRain", values);
  if (weather.cloudCover <= 18) return t(language, "weatherClear", values);
  if (weather.cloudCover >= 80) return t(language, "weatherOvercast", values);
  return t(language, "weatherPartlyCloudy", values);
}

export function sceneWeather(weather: Weather | null): "clear" | "cloud" | "fog" | "rain" | "snow" {
  if (!weather || weather.severe) return "clear";
  if ([45, 48].includes(weather.weatherCode)) return "fog";
  if (weather.snowfall > 0) return "snow";
  if (weather.rain + weather.showers > 0) return "rain";
  if (weather.cloudCover >= 55) return "cloud";
  return "clear";
}
