import { formatLocalTime, minutesBetween, minutesFromLocalMidnight } from "./time";
import type { Daylight, Moment, Place, Weather } from "./types";

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

function daylightFallback(place: Place, daylight: Daylight): Candidate {
  switch (daylight.phase) {
    case "polar-day":
      return {
        kind: "polar-day",
        title: "Die Sonne bleibt heute.",
        detail: `Über ${place.name} sinkt sie an diesem Tag nicht unter den Horizont.`,
        weight: 10,
      };
    case "polar-night":
      return {
        kind: "polar-night",
        title: "Der Tag bleibt heute dunkel.",
        detail: `Über ${place.name} steigt die Sonne an diesem Tag nicht über den Horizont.`,
        weight: 10,
      };
    case "golden":
      return {
        kind: daylight.altitude >= 0 ? "sunset" : "sunrise",
        title: "Das Licht steht tief.",
        detail: `In ${place.name} liegt der Horizont gerade im weichen Übergang.`,
        weight: 5,
      };
    case "twilight":
      return {
        kind: "blue-hour",
        title: "Zwischen Tag und Nacht.",
        detail: `Über ${place.name} ist gerade Dämmerung.`,
        weight: 5,
      };
    case "night":
      return {
        kind: "night",
        title: "Die Stadtseite der Erde schläft.",
        detail: `In ${place.name} ist es jetzt Nacht.`,
        weight: 4,
      };
    case "day":
      return {
        kind: "day",
        title: "Der Tag ist längst unterwegs.",
        detail: `In ${place.name} steht die Sonne über dem Horizont.`,
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
): Moment {
  if (weather?.severe) {
    return {
      kind: "weather-withheld",
      title: "Heute nur Zeit und Licht.",
      detail: `Das Wetter in ${place.name} wird bewusst nicht als Unterhaltung inszeniert.`,
    };
  }

  const candidates: Candidate[] = [daylightFallback(place, daylight)];
  const localMinute = minutesFromLocalMidnight(now, place.timeZone);
  const toSunrise = daylight.nextEvent === "sunrise" ? minutesUntil(daylight.nextEventAt, now) : null;
  const toSunset = daylight.nextEvent === "sunset" ? minutesUntil(daylight.nextEventAt, now) : null;

  if (toSunrise !== null && toSunrise >= 0 && toSunrise <= 45) {
    candidates.push({
      kind: "sunrise",
      title: "Gleich beginnt der Tag.",
      detail: `In ${place.name} geht die Sonne um ${formatLocalTime(daylight.nextEventAt!, place.timeZone)} Uhr auf.`,
      weight: 12,
    });
  }
  if (toSunset !== null && toSunset >= 0 && toSunset <= 45) {
    candidates.push({
      kind: "sunset",
      title: "Der Tag wird gleich leiser.",
      detail: `In ${place.name} geht die Sonne um ${formatLocalTime(daylight.nextEventAt!, place.timeZone)} Uhr unter.`,
      weight: 12,
    });
  }
  if (localMinute <= 30 || localMinute >= 1410) {
    candidates.push({
      kind: "night",
      title: "Gerade ist dort Mitternacht.",
      detail: `${place.name} ist eben in einen neuen Kalendertag gerutscht.`,
      weight: 9,
    });
  }

  if (weather && !weather.stale) {
    if ([45, 48].includes(weather.weatherCode)) {
      candidates.push({
        kind: "fog",
        title: "Nebel macht den Horizont weich.",
        detail: `In ${place.name} liegt die Ferne gerade hinter einem hellen Schleier.`,
        weight: 14,
      });
    }
    if (weather.snowfall > 0 && weather.weatherCode < 75) {
      candidates.push({
        kind: "snow",
        title: "Schnee zieht durch die Luft.",
        detail: `In ${place.name} fällt im aktuellen Wettermodell Schnee.`,
        weight: 14,
      });
    }
    if (weather.rain + weather.showers > 0 && weather.weatherCode < 65) {
      candidates.push({
        kind: "rain",
        title: "Regen zeichnet kleine Linien.",
        detail: `In ${place.name} fällt im aktuellen Wettermodell leichter Regen.`,
        weight: 11,
      });
    }
    if (daylight.phase === "night" && weather.cloudCover <= 18) {
      candidates.push({
        kind: "clear-night",
        title: "Die Wolken halten sich zurück.",
        detail: `Über ${place.name} ist der Himmel im aktuellen Wettermodell fast klar.`,
        weight: 11,
      });
    }
    if (weather.temperature >= 32) {
      candidates.push({
        kind: "warm",
        title: "Die Luft ist sehr warm.",
        detail: `In ${place.name} zeigt das Wettermodell gerade ${Math.round(weather.temperature)} Grad.`,
        weight: 7,
      });
    }
    if (weather.temperature <= -15) {
      candidates.push({
        kind: "cold",
        title: "Die Luft ist sehr kalt.",
        detail: `In ${place.name} zeigt das Wettermodell gerade ${Math.round(weather.temperature)} Grad.`,
        weight: 7,
      });
    }
    if (weather.windSpeed >= 25 && weather.windSpeed < 50) {
      candidates.push({
        kind: "wind",
        title: "Der Wind ist deutlich zu spüren.",
        detail: `In ${place.name} bewegt sich die Luft mit rund ${Math.round(weather.windSpeed)} km/h.`,
        weight: 6,
      });
    }
  }

  return chooseWeighted(candidates, random);
}

export function weatherDescription(weather: Weather): string {
  if (weather.severe) return "Wetter nicht inszeniert";
  const temperature = `${Math.round(weather.temperature)} °C`;
  if (weather.stale) return `${temperature}, ältere Wetterdaten`;
  if ([45, 48].includes(weather.weatherCode)) return `${temperature}, neblig`;
  if (weather.snowfall > 0) return `${temperature}, Schnee`;
  if (weather.rain + weather.showers > 0) return `${temperature}, Regen`;
  if (weather.cloudCover <= 18) return `${temperature}, klar`;
  if (weather.cloudCover >= 80) return `${temperature}, bedeckt`;
  return `${temperature}, leicht bewölkt`;
}

export function sceneWeather(weather: Weather | null): "clear" | "cloud" | "fog" | "rain" | "snow" {
  if (!weather || weather.severe) return "clear";
  if ([45, 48].includes(weather.weatherCode)) return "fog";
  if (weather.snowfall > 0) return "snow";
  if (weather.rain + weather.showers > 0) return "rain";
  if (weather.cloudCover >= 55) return "cloud";
  return "clear";
}
