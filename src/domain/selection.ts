import { getDaylight } from "./daylight";
import { PLACES } from "./locations";
import { minutesBetween, minutesFromLocalMidnight } from "./time";
import type { Daylight, Place } from "./types";

export type SelectionReason =
  | "sunrise-soon"
  | "sunset-soon"
  | "local-midnight"
  | "polar-day"
  | "polar-night"
  | "golden"
  | "twilight"
  | "night"
  | "day";

export interface PlaceSelection {
  place: Place;
  daylight: Daylight;
  reason: SelectionReason;
  score: number;
}

interface SelectionOptions {
  currentId: string | null;
  recentIds: readonly string[];
  now: Date;
  random?: () => number;
  daylightForPlace?: (place: Place, now: Date) => Daylight;
}

const RECENT_PLACE_WINDOW = 6;
const INTERESTING_POOL_SIZE = 8;

function phaseInterest(phase: Daylight["phase"]): { reason: SelectionReason; score: number } {
  switch (phase) {
    case "polar-day":
      return { reason: "polar-day", score: 82 };
    case "polar-night":
      return { reason: "polar-night", score: 82 };
    case "golden":
      return { reason: "golden", score: 76 };
    case "twilight":
      return { reason: "twilight", score: 72 };
    case "night":
      return { reason: "night", score: 28 };
    case "day":
      return { reason: "day", score: 24 };
  }
}

export function evaluatePlaceInterest(
  place: Place,
  daylight: Daylight,
  now: Date,
  recentIds: readonly string[] = [],
): PlaceSelection {
  let { reason, score } = phaseInterest(daylight.phase);
  const eventMinutes = daylight.nextEventAt ? minutesBetween(now, daylight.nextEventAt) : null;
  if (
    daylight.nextEvent &&
    eventMinutes !== null &&
    eventMinutes >= 0 &&
    eventMinutes <= 60
  ) {
    reason = daylight.nextEvent === "sunrise" ? "sunrise-soon" : "sunset-soon";
    score = 110 - eventMinutes / 2;
  } else {
    const localMinute = minutesFromLocalMidnight(now, place.timeZone);
    if (localMinute <= 30 || localMinute >= 1410) {
      reason = "local-midnight";
      score = 88;
    }
  }

  const recentLandscapes = new Set(
    recentIds
      .slice(-3)
      .map((id) => PLACES.find((candidate) => candidate.id === id)?.landscape)
      .filter((landscape): landscape is Place["landscape"] => Boolean(landscape)),
  );
  if (!recentLandscapes.has(place.landscape)) score += 10;

  return { place, daylight, reason, score };
}

export function chooseNextPlace({
  currentId,
  recentIds,
  now,
  random = Math.random,
  daylightForPlace = getDaylight,
}: SelectionOptions): PlaceSelection {
  const recentWindow = new Set(recentIds.slice(-RECENT_PLACE_WINDOW));
  let candidates = PLACES.filter(
    (place) => place.id !== currentId && !recentWindow.has(place.id),
  );
  if (candidates.length < INTERESTING_POOL_SIZE) {
    candidates = PLACES.filter((place) => place.id !== currentId);
  }

  const ranked = candidates
    .map((place) => evaluatePlaceInterest(place, daylightForPlace(place, now), now, recentIds))
    .sort((left, right) => right.score - left.score || left.place.sceneSeed - right.place.sceneSeed);
  const pool = ranked.slice(0, Math.min(INTERESTING_POOL_SIZE, ranked.length));
  const index = Math.min(pool.length - 1, Math.floor(random() * pool.length));
  const selection = pool[index];
  if (!selection) throw new Error("Kein interessanter Ort verfügbar.");
  return selection;
}
