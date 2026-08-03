import type { Daylight, MomentFocus, MomentKind } from "./types";
import type { Language } from "../i18n";

export type AtmosphericImagePhase = "morning" | "evening" | "night";

export interface AtmosphericImage {
  phase: AtmosphericImagePhase;
  src: string;
  sourceUrl: string;
  licenseUrl: string;
  author: string;
  license: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
}

const IMAGES: Record<AtmosphericImagePhase, AtmosphericImage> = {
  morning: {
    phase: "morning",
    src: "./media/atmosphere/morning-nanga-parbat.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:The_Golden_hour_-_Sunrise_at_the_Killer_Mountain,_the_mighty_Nanga_Parbat.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    author: "Mohammad Yaseen",
    license: "CC BY-SA 4.0",
    title: {
      de: "Morgenlicht am Nanga Parbat",
      en: "Morning light at Nanga Parbat",
    },
    description: {
      de: "Golden beleuchtete Bergspitzen über einem noch dunklen Tal.",
      en: "Golden mountain peaks above a valley still in shadow.",
    },
  },
  evening: {
    phase: "evening",
    src: "./media/atmosphere/evening-lisbon.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Lisbon,_Tagus_river,_fog,_mist,_sea,golden_hour,_light,_sun,_sunset,_bridge_(50706209197).jpg",
    licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
    author: "Eduardo Pereira",
    license: "Public Domain Mark 1.0",
    title: {
      de: "Abendnebel über dem Tejo",
      en: "Evening mist over the Tagus",
    },
    description: {
      de: "Segelboote und Brücke verschwimmen im warmen Licht von Lissabon.",
      en: "Sailboats and bridge fade into Lisbon's warm evening light.",
    },
  },
  night: {
    phase: "night",
    src: "./media/atmosphere/night-tromso.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Northern_lights_in_Tromso.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    author: "Ddgfoto",
    license: "CC BY-SA 4.0",
    title: {
      de: "Polarlicht über Tromsø",
      en: "Northern lights above Tromsø",
    },
    description: {
      de: "Grünes Polarlicht zieht über einen sternklaren Nachthimmel.",
      en: "Green aurora sweeps across a clear, starry night sky.",
    },
  },
};

const NIGHT_MOMENTS = new Set<MomentKind>([
  "night",
  "clear-night",
  "polar-night",
  "blue-hour",
]);

export function atmosphericPhaseFor(
  focus: MomentFocus,
  daylight: Daylight,
  momentKind: MomentKind,
): AtmosphericImagePhase {
  if (focus === "sunrise" || momentKind === "sunrise") return "morning";
  if (focus === "sunset" || momentKind === "sunset") return "evening";
  if (focus === "night" || NIGHT_MOMENTS.has(momentKind)) return "night";
  if (daylight.phase === "night" || daylight.phase === "polar-night") return "night";
  if (daylight.nextEvent === "sunset") return "evening";
  return "morning";
}

export function atmosphericImageFor(
  focus: MomentFocus,
  daylight: Daylight,
  momentKind: MomentKind,
): AtmosphericImage {
  return IMAGES[atmosphericPhaseFor(focus, daylight, momentKind)];
}

