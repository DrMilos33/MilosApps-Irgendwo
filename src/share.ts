import type { Moment, Place } from "./domain/types";

export interface ShareResult {
  method: "native" | "clipboard";
}

export function buildShareText(place: Place, moment: Moment, localTime: string): string {
  return `Irgendwo ist gerade …\n${place.name}, ${place.country} · ${localTime}\n${moment.title} ${moment.detail}`;
}

export async function shareMoment(
  place: Place,
  moment: Moment,
  localTime: string,
): Promise<ShareResult> {
  const text = buildShareText(place, moment, localTime);
  const data = {
    title: "Irgendwo ist gerade …",
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
