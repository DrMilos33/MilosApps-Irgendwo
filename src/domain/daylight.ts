import { getPosition, getTimes } from "suncalc";
import type { Daylight, DaylightPhase, Place } from "./types";

function choosePhase(altitude: number, alwaysUp: boolean, alwaysDown: boolean): DaylightPhase {
  if (alwaysUp) return "polar-day";
  if (alwaysDown) return "polar-night";
  if (altitude >= 8) return "day";
  if (altitude >= 0) return "golden";
  if (altitude >= -8) return "twilight";
  return "night";
}

function findNextEvent(
  now: Date,
  place: Place,
): { event: "sunrise" | "sunset" | null; at: Date | null } {
  const candidateDates = [now, new Date(now.getTime() + 24 * 60 * 60 * 1000)];
  const events = candidateDates.flatMap((date) => {
    const times = getTimes(date, place.latitude, place.longitude);
    return [
      times.sunrise ? { event: "sunrise" as const, at: times.sunrise } : null,
      times.sunset ? { event: "sunset" as const, at: times.sunset } : null,
    ];
  });

  const next = events
    .filter((item): item is NonNullable<typeof item> => item !== null && item.at > now)
    .sort((left, right) => left.at.getTime() - right.at.getTime())[0];

  return next ? { event: next.event, at: next.at } : { event: null, at: null };
}

export function getDaylight(place: Place, now: Date): Daylight {
  const position = getPosition(now, place.latitude, place.longitude);
  const times = getTimes(now, place.latitude, place.longitude);
  const phase = choosePhase(position.altitude, Boolean(times.alwaysUp), Boolean(times.alwaysDown));
  const next = findNextEvent(now, place);

  return {
    phase,
    altitude: position.altitude,
    azimuth: position.azimuth,
    sunrise: times.sunrise,
    sunset: times.sunset,
    nextEvent: next.event,
    nextEventAt: next.at,
  };
}
