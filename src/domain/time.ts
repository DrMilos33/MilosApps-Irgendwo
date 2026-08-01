import type { Place } from "./types";
import { localeCode, t, type Language } from "../i18n";

const timeFormatters = new Map<string, Intl.DateTimeFormat>();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();
const partFormatters = new Map<string, Intl.DateTimeFormat>();

function getTimeFormatter(timeZone: string, language: Language): Intl.DateTimeFormat {
  const key = `${language}:${timeZone}`;
  const existing = timeFormatters.get(key);
  if (existing) return existing;
  const formatter = new Intl.DateTimeFormat(localeCode(language), {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  timeFormatters.set(key, formatter);
  return formatter;
}

function getDateTimeFormatter(timeZone: string, language: Language): Intl.DateTimeFormat {
  const key = `${language}:${timeZone}`;
  const existing = dateTimeFormatters.get(key);
  if (existing) return existing;
  const formatter = new Intl.DateTimeFormat(localeCode(language), {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  dateTimeFormatters.set(key, formatter);
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

export function formatLocalTime(
  date: Date,
  timeZone: string,
  language: Language = "de",
): string {
  return getTimeFormatter(timeZone, language).format(date);
}

export function formatLocalDateTime(
  date: Date,
  timeZone: string,
  language: Language = "de",
): string {
  return getDateTimeFormatter(timeZone, language).format(date);
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

export function formatPlaceTime(
  place: Place,
  date: Date,
  language: Language = "de",
): string {
  return `${formatLocalTime(date, place.timeZone, language)}${t(language, "timeSuffix")}`;
}

export function minutesFromLocalMidnight(date: Date, timeZone: string): number {
  const parts = getLocalParts(date, timeZone);
  return parts.hour * 60 + parts.minute;
}

export function minutesBetween(left: Date, right: Date): number {
  return Math.round((right.getTime() - left.getTime()) / 60_000);
}
