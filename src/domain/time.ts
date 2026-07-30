import type { Place } from "./types";

const timeFormatters = new Map<string, Intl.DateTimeFormat>();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();
const partFormatters = new Map<string, Intl.DateTimeFormat>();

function getTimeFormatter(timeZone: string): Intl.DateTimeFormat {
  const existing = timeFormatters.get(timeZone);
  if (existing) return existing;
  const formatter = new Intl.DateTimeFormat("de-DE", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  timeFormatters.set(timeZone, formatter);
  return formatter;
}

function getDateTimeFormatter(timeZone: string): Intl.DateTimeFormat {
  const existing = dateTimeFormatters.get(timeZone);
  if (existing) return existing;
  const formatter = new Intl.DateTimeFormat("de-DE", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  dateTimeFormatters.set(timeZone, formatter);
  return formatter;
}

function getPartFormatter(timeZone: string): Intl.DateTimeFormat {
  const existing = partFormatters.get(timeZone);
  if (existing) return existing;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  partFormatters.set(timeZone, formatter);
  return formatter;
}

export function formatLocalTime(date: Date, timeZone: string): string {
  return getTimeFormatter(timeZone).format(date);
}

export function formatLocalDateTime(date: Date, timeZone: string): string {
  return getDateTimeFormatter(timeZone).format(date);
}

export function getLocalParts(
  date: Date,
  timeZone: string,
): { year: number; month: number; day: number; hour: number; minute: number; second: number } {
  const parts = getPartFormatter(timeZone).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
}

export function formatPlaceTime(place: Place, date: Date): string {
  return `${formatLocalTime(date, place.timeZone)} Uhr`;
}

export function minutesFromLocalMidnight(date: Date, timeZone: string): number {
  const parts = getLocalParts(date, timeZone);
  return parts.hour * 60 + parts.minute;
}

export function minutesBetween(left: Date, right: Date): number {
  return Math.round((right.getTime() - left.getTime()) / 60_000);
}
