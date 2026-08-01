import type { Moment, Place } from "./domain/types";
import { t, type Language } from "./i18n";

export interface ShareResult {
  method: "native" | "clipboard";
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

export async function shareMoment(
  place: Place,
  moment: Moment,
  localTime: string,
  language: Language = "de",
): Promise<ShareResult> {
  const text = buildShareText(place, moment, localTime, language);
  const data = {
    title: t(language, "shareTitle"),
    text,
    url: window.location.origin,
  };

  if (navigator.share) {
    await navigator.share(data);
    return { method: "native" };
  }

  await navigator.clipboard.writeText(`${text}\n${window.location.origin}`);
  return { method: "clipboard" };
}
