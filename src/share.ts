import type { Moment, Place } from "./domain/types";
import { t, type Language } from "./i18n";

export interface SharePayload {
  title: string;
  text: string;
  url: string;
}

export function buildShareText(
  place: Place,
  moment: Moment,
  localTime: string,
  language: Language = "de",
): string {
  return t(language, "shareText", {
    place: `${place.name}, ${place.country}`,
    time: localTime,
    title: moment.title,
    detail: moment.detail,
  });
}

export function buildSharePayload(
  place: Place,
  moment: Moment,
  localTime: string,
  language: Language,
  url: string,
): SharePayload {
  const text = buildShareText(place, moment, localTime, language);
  return {
    title: t(language, "shareTitle"),
    text,
    url,
  };
}
