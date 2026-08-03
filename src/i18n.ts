import type { Place } from "./domain/types";

export type Language = "de" | "en";

const de = {
  documentTitle: "Irgendwo ist gerade … – MilosApps",
  metaDescription:
    "Ein stilles Fenster zu einem realen Moment irgendwo auf der Erde – aus Zeit, Tageslicht und Wetter.",
  appTitle: "Irgendwo ist gerade …",
  productPromise:
    "Entdecke einen realen Moment irgendwo auf der Erde – ausgewählt nach Ortszeit und Licht.",
  initialPlace: "Ein Punkt auf der Erde",
  initialMoment: "Hier öffnet sich gleich ein anderer Augenblick.",
  initialDetail: "Zeit und Tageslicht sind sofort da. Das Wetter darf einen Moment brauchen.",
  selectionInitial: "Die App sucht nach einem besonderen lokalen Übergang.",
  travel: "Nächsten Moment entdecken",
  share: "Moment teilen",
  initialStatus: "Die Reise beginnt …",
  soundOn: "Klang einschalten",
  soundOff: "Klang ausschalten",
  aboutOpen: "Über diese Reise",
  privacyInfo: "Datenschutz",
  sceneInitial: "Eine abstrakte Landschaft entsteht.",
  sceneTraveling: "Unterwegs",
  factRegion: "Details zu diesem Moment",
  factKicker: "Gerade vor Ort",
  factTraveling: "Noch unterwegs",
  factTime: "Ortszeit",
  factWeather: "Wetter",
  factDaylight: "Tageslicht",
  weatherPending: "wird angefragt",
  daylightPending: "wird berechnet",
  sourceInitial: "Ortszeit und Sonnenstand werden lokal berechnet.",
  weatherRetry: "Wetter erneut laden",
  aboutKicker: "Ein Blick, keine Beobachtung",
  close: "Schließen",
  aboutTitle: "So entsteht der Moment",
  aboutBody:
    "Die App wählt einen kuratierten Ort und verbindet dortige Uhrzeit, Sonnenstand und – wenn erreichbar – aktuelle Modell-Wetterdaten. Die Landschaft und der optionale Klang entstehen vollständig im Browser.",
  aboutNoAccount: "Kein Konto, kein Nutzerstandort und keine Analyse-Cookies.",
  aboutNoCoordinates: "Exakte Koordinaten werden weder angezeigt noch geteilt.",
  aboutSafety: "Gefährliche Wetterlagen werden bewusst nicht inszeniert.",
  aboutAudio: "Klang startet nur nach deiner ausdrücklichen Aktion.",
  sourceWeather: "Wetter: Open-Meteo · CC BY 4.0",
  sourcePlaces: "Ortsdaten: GeoNames · CC BY 4.0",
  sourceSun: "Sonnenstand: SunCalc · BSD-2-Clause",
  statusOnline: "Wieder online – das Wetter kann neu geladen werden.",
  statusOffline: "Offline – Ortszeit und Sonnenstand funktionieren weiter.",
  statusWeatherLoading: "Wetter für {place} wird geladen …",
  statusPlaceReady: "{place} ist da.",
  statusPlaceStale: "{place} ist da. Die verfügbaren Wetterdaten sind älter.",
  statusPlaceWithheld: "{place} ist da. Das Wetter wird heute bewusst nicht inszeniert.",
  statusWeatherRetry: "Wetter für {place} wird erneut geladen …",
  statusWeatherRestored: "Wetterdaten sind wieder da.",
  statusWeatherRestoredWithheld: "Wetterdaten sind da und werden heute bewusst nicht inszeniert.",
  failureOffline: "Offline – der Moment funktioniert mit Ortszeit und Sonnenstand weiter.",
  failureTimeout: "Das Wetter braucht heute zu lange. Zeit und Tageslicht bleiben aktuell.",
  failureInvalid: "Die Wetterdaten waren unvollständig. Zeit und Tageslicht bleiben aktuell.",
  failureNetwork: "Wetterdaten sind gerade nicht erreichbar. Zeit und Tageslicht bleiben aktuell.",
  weatherUnavailable: "zurzeit nicht verfügbar",
  weatherWithheld: "Wetter nicht inszeniert",
  weatherStale: "{temperature} °C, ältere Wetterdaten",
  weatherFog: "{temperature} °C, neblig",
  weatherSnow: "{temperature} °C, Schnee",
  weatherRain: "{temperature} °C, Regen",
  weatherClear: "{temperature} °C, klar",
  weatherOvercast: "{temperature} °C, bedeckt",
  weatherPartlyCloudy: "{temperature} °C, leicht bewölkt",
  sourceSevere: "Open-Meteo · Stand {time} Uhr. Wetterdetail aus Fürsorge ausgeblendet.",
  sourceStale: "Open-Meteo · letzter verfügbarer Stand {time} Uhr; als älter markiert.",
  sourceLive: "Open-Meteo · Modellstand {time} Uhr; Ortszeit und Sonnenstand lokal berechnet.",
  sourceNoWeather: "Ohne Wetterdaten · Ortszeit und Sonnenstand werden lokal berechnet.",
  daylightPolarDay: "Polartag",
  daylightPolarNight: "Polarnacht",
  daylightSunrise: "Sonnenaufgang {time} Uhr",
  daylightSunset: "Sonnenuntergang {time} Uhr",
  daylightGolden: "tiefes Sonnenlicht",
  daylightTwilight: "Dämmerung",
  daylightNight: "Nacht",
  daylightDay: "Tag",
  daylightLocal: "lokal berechnet",
  stateLoading: "lädt",
  stateLive: "aktuell",
  stateStale: "älter",
  stateFallback: "ohne Wetter",
  stateWithheld: "bewusst ruhig",
  sceneLabel: "Prozedurale abstrakte Szene für {place}: {title} {detail}",
  toastSoundOff: "Klang ist aus.",
  toastSoundOn: "Leiser, prozeduraler Klang ist an.",
  toastSoundBlocked: "Der Browser hat den Klang nicht freigegeben.",
  toastShareCopied: "Moment wurde kopiert.",
  toastShareFailed: "Der Moment konnte nicht geteilt werden.",
  shareTitle: "Irgendwo ist gerade …",
  shareText: "Irgendwo ist gerade …\n{place} · {time}\n{title} {detail}",
  timeSuffix: " Uhr",
  momentPolarDayTitle: "Die Sonne bleibt heute.",
  momentPolarDayDetail: "Über {place} sinkt sie an diesem Tag nicht unter den Horizont.",
  momentPolarNightTitle: "Der Tag bleibt heute dunkel.",
  momentPolarNightDetail: "Über {place} steigt die Sonne an diesem Tag nicht über den Horizont.",
  momentGoldenTitle: "Das Licht steht tief.",
  momentGoldenDetail: "In {place} liegt der Horizont gerade im weichen Übergang.",
  momentTwilightTitle: "Zwischen Tag und Nacht.",
  momentTwilightDetail: "Über {place} ist gerade Dämmerung.",
  momentNightTitle: "Die Stadtseite der Erde schläft.",
  momentNightDetail: "In {place} ist es jetzt Nacht.",
  momentDayTitle: "Der Tag ist längst unterwegs.",
  momentDayDetail: "In {place} steht die Sonne über dem Horizont.",
  momentWithheldTitle: "Heute nur Zeit und Licht.",
  momentWithheldDetail: "Das Wetter in {place} wird bewusst nicht als Unterhaltung inszeniert.",
  momentSunriseTitle: "Gleich beginnt der Tag.",
  momentSunriseDetail: "In {place} geht die Sonne um {time} Uhr auf.",
  momentSunsetTitle: "Der Tag wird gleich leiser.",
  momentSunsetDetail: "In {place} geht die Sonne um {time} Uhr unter.",
  momentMidnightTitle: "Gerade ist dort Mitternacht.",
  momentMidnightDetail: "{place} ist eben in einen neuen Kalendertag gerutscht.",
  momentFogTitle: "Nebel macht den Horizont weich.",
  momentFogDetail: "In {place} liegt die Ferne gerade hinter einem hellen Schleier.",
  momentSnowTitle: "Schnee zieht durch die Luft.",
  momentSnowDetail: "In {place} fällt im aktuellen Wettermodell Schnee.",
  momentRainTitle: "Regen zeichnet kleine Linien.",
  momentRainDetail: "In {place} fällt im aktuellen Wettermodell leichter Regen.",
  momentClearNightTitle: "Die Wolken halten sich zurück.",
  momentClearNightDetail: "Über {place} ist der Himmel im aktuellen Wettermodell fast klar.",
  momentWarmTitle: "Die Luft ist sehr warm.",
  momentWarmDetail: "In {place} zeigt das Wettermodell gerade {temperature} Grad.",
  momentColdTitle: "Die Luft ist sehr kalt.",
  momentColdDetail: "In {place} zeigt das Wettermodell gerade {temperature} Grad.",
  momentWindTitle: "Der Wind ist deutlich zu spüren.",
  momentWindDetail: "In {place} bewegt sich die Luft mit rund {speed} km/h.",
  whySunriseSoon: "Ausgewählt, weil in {place} der Sonnenaufgang in weniger als einer Stunde beginnt.",
  whySunsetSoon: "Ausgewählt, weil in {place} der Sonnenuntergang in weniger als einer Stunde beginnt.",
  whyLocalMidnight: "Ausgewählt, weil {place} gerade die Datumsgrenze passiert.",
  whyPolarDay: "Ausgewählt, weil die Sonne in {place} heute nicht untergeht.",
  whyPolarNight: "Ausgewählt, weil die Sonne in {place} heute nicht aufgeht.",
  whyGolden: "Ausgewählt, weil das Licht in {place} gerade besonders tief steht.",
  whyTwilight: "Ausgewählt, weil {place} gerade zwischen Tag und Nacht liegt.",
  whyNight: "Ausgewählt für einen Blick auf die nächtliche Seite der Erde.",
  whyDay: "Ausgewählt für einen Blick auf die helle Seite der Erde.",
} as const;

export type MessageKey = keyof typeof de;

const en: Record<MessageKey, string> = {
  documentTitle: "Somewhere, right now … – MilosApps",
  metaDescription:
    "A quiet window into a real moment somewhere on Earth – shaped by time, daylight and weather.",
  appTitle: "Somewhere, right now …",
  productPromise:
    "Discover a real moment somewhere on Earth – selected by local time and light.",
  initialPlace: "A point on Earth",
  initialMoment: "Another moment is about to open here.",
  initialDetail: "Time and daylight are here at once. Weather may take a moment.",
  selectionInitial: "The app is looking for a distinctive local transition.",
  travel: "Discover another moment",
  share: "Share moment",
  initialStatus: "The journey begins …",
  soundOn: "Turn sound on",
  soundOff: "Turn sound off",
  aboutOpen: "About this journey",
  privacyInfo: "Privacy",
  sceneInitial: "An abstract landscape is taking shape.",
  sceneTraveling: "Travelling",
  factRegion: "Details about this moment",
  factKicker: "Right now, locally",
  factTraveling: "Still travelling",
  factTime: "Local time",
  factWeather: "Weather",
  factDaylight: "Daylight",
  weatherPending: "being requested",
  daylightPending: "being calculated",
  sourceInitial: "Local time and sun position are calculated locally.",
  weatherRetry: "Load weather again",
  aboutKicker: "A glimpse, not surveillance",
  close: "Close",
  aboutTitle: "How this moment is made",
  aboutBody:
    "The app selects a curated place and combines its local time, sun position and – when available – current modelled weather. The landscape and optional sound are generated entirely in your browser.",
  aboutNoAccount: "No account, no user location and no analytics cookies.",
  aboutNoCoordinates: "Exact coordinates are neither shown nor shared.",
  aboutSafety: "Dangerous weather conditions are deliberately not staged.",
  aboutAudio: "Sound starts only after your explicit action.",
  sourceWeather: "Weather: Open-Meteo · CC BY 4.0",
  sourcePlaces: "Place data: GeoNames · CC BY 4.0",
  sourceSun: "Sun position: SunCalc · BSD-2-Clause",
  statusOnline: "Back online – weather can be loaded again.",
  statusOffline: "Offline – local time and sun position still work.",
  statusWeatherLoading: "Loading weather for {place} …",
  statusPlaceReady: "{place} is here.",
  statusPlaceStale: "{place} is here. The available weather data is older.",
  statusPlaceWithheld: "{place} is here. Today’s weather is deliberately not staged.",
  statusWeatherRetry: "Loading weather for {place} again …",
  statusWeatherRestored: "Weather data is back.",
  statusWeatherRestoredWithheld: "Weather data is available and deliberately not staged today.",
  failureOffline: "Offline – this moment continues with local time and sun position.",
  failureTimeout: "Weather is taking too long today. Time and daylight remain current.",
  failureInvalid: "The weather data was incomplete. Time and daylight remain current.",
  failureNetwork: "Weather data is not available right now. Time and daylight remain current.",
  weatherUnavailable: "currently unavailable",
  weatherWithheld: "Weather not staged",
  weatherStale: "{temperature} °C, older weather data",
  weatherFog: "{temperature} °C, foggy",
  weatherSnow: "{temperature} °C, snow",
  weatherRain: "{temperature} °C, rain",
  weatherClear: "{temperature} °C, clear",
  weatherOvercast: "{temperature} °C, overcast",
  weatherPartlyCloudy: "{temperature} °C, partly cloudy",
  sourceSevere: "Open-Meteo · as of {time}. Weather detail hidden with care.",
  sourceStale: "Open-Meteo · last available update {time}; marked as older.",
  sourceLive: "Open-Meteo · model update {time}; local time and sun position calculated locally.",
  sourceNoWeather: "Without weather data · local time and sun position are calculated locally.",
  daylightPolarDay: "Polar day",
  daylightPolarNight: "Polar night",
  daylightSunrise: "Sunrise {time}",
  daylightSunset: "Sunset {time}",
  daylightGolden: "low sunlight",
  daylightTwilight: "twilight",
  daylightNight: "night",
  daylightDay: "day",
  daylightLocal: "calculated locally",
  stateLoading: "loading",
  stateLive: "current",
  stateStale: "older",
  stateFallback: "without weather",
  stateWithheld: "kept calm",
  sceneLabel: "Procedural abstract scene for {place}: {title} {detail}",
  toastSoundOff: "Sound is off.",
  toastSoundOn: "Quiet procedural sound is on.",
  toastSoundBlocked: "The browser did not allow sound.",
  toastShareCopied: "Moment copied.",
  toastShareFailed: "The moment could not be shared.",
  shareTitle: "Somewhere, right now …",
  shareText: "Somewhere, right now …\n{place} · {time}\n{title} {detail}",
  timeSuffix: "",
  momentPolarDayTitle: "The sun is staying today.",
  momentPolarDayDetail: "Above {place}, it does not sink below the horizon today.",
  momentPolarNightTitle: "The day remains dark today.",
  momentPolarNightDetail: "Above {place}, the sun does not rise over the horizon today.",
  momentGoldenTitle: "The light is low.",
  momentGoldenDetail: "In {place}, the horizon is in a soft transition right now.",
  momentTwilightTitle: "Between day and night.",
  momentTwilightDetail: "It is twilight over {place} right now.",
  momentNightTitle: "This side of the Earth is sleeping.",
  momentNightDetail: "It is night in {place} now.",
  momentDayTitle: "The day is well underway.",
  momentDayDetail: "The sun is above the horizon in {place}.",
  momentWithheldTitle: "Only time and light today.",
  momentWithheldDetail: "The weather in {place} is deliberately not staged as entertainment.",
  momentSunriseTitle: "The day is about to begin.",
  momentSunriseDetail: "The sun rises in {place} at {time}.",
  momentSunsetTitle: "The day is about to grow quieter.",
  momentSunsetDetail: "The sun sets in {place} at {time}.",
  momentMidnightTitle: "It is midnight there right now.",
  momentMidnightDetail: "{place} has just moved into a new calendar day.",
  momentFogTitle: "Fog softens the horizon.",
  momentFogDetail: "In {place}, the distance is hidden behind a pale veil.",
  momentSnowTitle: "Snow is moving through the air.",
  momentSnowDetail: "The current weather model shows snow falling in {place}.",
  momentRainTitle: "Rain draws fine lines.",
  momentRainDetail: "The current weather model shows light rain in {place}.",
  momentClearNightTitle: "The clouds are holding back.",
  momentClearNightDetail: "The sky above {place} is almost clear in the current weather model.",
  momentWarmTitle: "The air is very warm.",
  momentWarmDetail: "The weather model shows {temperature} degrees in {place} right now.",
  momentColdTitle: "The air is very cold.",
  momentColdDetail: "The weather model shows {temperature} degrees in {place} right now.",
  momentWindTitle: "The wind can clearly be felt.",
  momentWindDetail: "The air in {place} is moving at around {speed} km/h.",
  whySunriseSoon: "Selected because sunrise begins in {place} within the next hour.",
  whySunsetSoon: "Selected because sunset begins in {place} within the next hour.",
  whyLocalMidnight: "Selected because {place} is crossing into a new date right now.",
  whyPolarDay: "Selected because the sun does not set in {place} today.",
  whyPolarNight: "Selected because the sun does not rise in {place} today.",
  whyGolden: "Selected because the light is especially low in {place} right now.",
  whyTwilight: "Selected because {place} is between day and night right now.",
  whyNight: "Selected for a glimpse of the night side of Earth.",
  whyDay: "Selected for a glimpse of the bright side of Earth.",
};

const dictionaries: Record<Language, Record<MessageKey, string>> = { de, en };

const englishPlaces: Record<string, { name?: string; country: string }> = {
  longyearbyen: { country: "Svalbard, Norway" },
  tromso: { country: "Norway" },
  reykjavik: { country: "Iceland" },
  torshavn: { country: "Faroe Islands" },
  nuuk: { country: "Greenland" },
  anchorage: { country: "Alaska, USA" },
  whitehorse: { country: "Canada" },
  vancouver: { country: "Canada" },
  "san-francisco": { country: "California, USA" },
  "mexico-city": { name: "Mexico City", country: "Mexico" },
  quito: { country: "Ecuador" },
  ushuaia: { country: "Argentina" },
  "hanga-roa": { country: "Rapa Nui, Chile" },
  "ponta-delgada": { country: "Azores, Portugal" },
  dakar: { country: "Senegal" },
  "cape-town": { name: "Cape Town", country: "South Africa" },
  nairobi: { country: "Kenya" },
  cairo: { name: "Cairo", country: "Egypt" },
  istanbul: { country: "Türkiye" },
  jaipur: { country: "India" },
  kathmandu: { country: "Nepal" },
  thimphu: { country: "Bhutan" },
  singapore: { name: "Singapore", country: "Singapore" },
  hanoi: { country: "Vietnam" },
  seoul: { country: "South Korea" },
  tokyo: { name: "Tokyo", country: "Japan" },
  yakutsk: { name: "Yakutsk", country: "Russia" },
  ulaanbaatar: { country: "Mongolia" },
  perth: { country: "Australia" },
  hobart: { country: "Tasmania, Australia" },
  suva: { country: "Fiji" },
  apia: { country: "Samoa" },
  waitangi: { country: "Chatham Islands, New Zealand" },
};

export function normalizeLanguage(value: unknown): Language {
  return value === "en" ? "en" : "de";
}

export function localeCode(language: Language): "de-DE" | "en-GB" {
  return language === "en" ? "en-GB" : "de-DE";
}

export function t(
  language: Language,
  key: MessageKey,
  values: Record<string, string | number> = {},
): string {
  return dictionaries[language][key].replace(/\{([a-zA-Z]+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

export function localizePlace(place: Place, language: Language): Place {
  if (language === "de") return place;
  const translated = englishPlaces[place.id];
  if (!translated) return place;
  return {
    ...place,
    name: translated.name ?? place.name,
    country: translated.country,
  };
}

export function applyAppLocale(language: Language): void {
  const dictionary = dictionaries[language];
  document.documentElement.lang = language;
  document.title = dictionary.documentTitle;
  document
    .querySelector<HTMLMetaElement>('meta[name="description"]')
    ?.setAttribute("content", dictionary.metaDescription);

  document.querySelectorAll<HTMLElement>("[data-app-text]").forEach((element) => {
    const key = element.dataset.appText as MessageKey | undefined;
    if (key && key in dictionary) element.textContent = dictionary[key];
  });
  document.querySelectorAll<HTMLElement>("[data-app-aria-label]").forEach((element) => {
    const key = element.dataset.appAriaLabel as MessageKey | undefined;
    if (key && key in dictionary) element.setAttribute("aria-label", dictionary[key]);
  });
}

export function bindAppLocale(onChange: (language: Language) => void): () => void {
  const apply = (value: unknown): void => {
    const language = normalizeLanguage(value);
    applyAppLocale(language);
    onChange(language);
  };
  const handleLocaleChange = (event: Event): void => {
    const detail = (event as CustomEvent<{ locale?: unknown }>).detail;
    apply(detail?.locale);
  };

  window.addEventListener("milosapps:localechange", handleLocaleChange);
  apply(document.documentElement.lang);
  return () => window.removeEventListener("milosapps:localechange", handleLocaleChange);
}
