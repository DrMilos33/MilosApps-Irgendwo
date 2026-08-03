import { ProceduralAudio } from "../audio";
import { getDaylight } from "../domain/daylight";
import { getPlaceById } from "../domain/locations";
import { sceneWeather, selectMoment, weatherDescription } from "../domain/moments";
import {
  chooseNextPlace,
  evaluatePlaceInterest,
  type SelectionReason,
} from "../domain/selection";
import { sceneVariantForPlace } from "../domain/scene";
import { formatLocalDateTime, formatLocalTime, formatPlaceTime } from "../domain/time";
import type {
  Daylight,
  Moment,
  MomentFocus,
  Place,
  Weather,
  WeatherFailureReason,
} from "../domain/types";
import {
  fetchWeather,
  WeatherRequestError,
  weatherFailureMessage,
} from "../domain/weather";
import {
  localizePlace,
  t,
  type Language,
  type MessageKey,
} from "../i18n";
import { buildSharePayload, type SharePayload } from "../share";

type DataState = "loading" | "live" | "stale" | "fallback" | "withheld";
type StatusFactory = (language: Language) => string;

interface Elements {
  aboutClose: HTMLButtonElement;
  aboutDialog: HTMLDialogElement;
  aboutOpen: HTMLButtonElement;
  dataState: HTMLElement;
  factDaylight: HTMLElement;
  factPlace: HTMLElement;
  factTime: HTMLElement;
  factWeather: HTMLElement;
  focusInputs: HTMLInputElement[];
  journeyTrail: HTMLOListElement;
  momentDetail: HTMLElement;
  momentTitle: HTMLElement;
  placeLabel: HTMLElement;
  scene: HTMLElement;
  scenePlace: HTMLElement;
  sceneTime: HTMLTimeElement;
  selectionReason: HTMLElement;
  sessionNote: HTMLElement;
  shareButton: MilosShareButtonElement;
  soundToggle: HTMLButtonElement;
  sourceNote: HTMLElement;
  statusLine: HTMLElement;
  toast: HTMLElement;
  travelButton: HTMLButtonElement;
  travelLabel: HTMLElement;
  weatherParticles: HTMLElement;
  weatherRetry: HTMLButtonElement;
}

interface MilosShareButtonElement extends HTMLElement {
  setPayloadProvider(provider: () => SharePayload): void;
}

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Element fehlt: ${selector}`);
  return element;
}

function requiredAll<T extends Element>(selector: string): T[] {
  const elements = Array.from(document.querySelectorAll<T>(selector));
  if (elements.length === 0) throw new Error(`Elemente fehlen: ${selector}`);
  return elements;
}

function isMomentFocus(value: string): value is MomentFocus {
  return ["surprise", "sunrise", "sunset", "night"].includes(value);
}

function weatherSourceLine(weather: Weather, place: Place, language: Language): string {
  const observed = formatLocalTime(weather.observedAt, place.timeZone, language);
  if (weather.severe) return t(language, "sourceSevere", { time: observed });
  if (weather.stale) return t(language, "sourceStale", { time: observed });
  return t(language, "sourceLive", { time: observed });
}

function daylightDescription(
  daylight: Daylight,
  place: Place,
  language: Language,
): string {
  if (daylight.phase === "polar-day") return t(language, "daylightPolarDay");
  if (daylight.phase === "polar-night") return t(language, "daylightPolarNight");
  if (daylight.nextEvent && daylight.nextEventAt) {
    const key: MessageKey =
      daylight.nextEvent === "sunrise" ? "daylightSunrise" : "daylightSunset";
    return t(language, key, {
      time: formatLocalTime(daylight.nextEventAt, place.timeZone, language),
    });
  }
  const keys: Record<Daylight["phase"], MessageKey> = {
    golden: "daylightGolden",
    twilight: "daylightTwilight",
    night: "daylightNight",
    day: "daylightDay",
    "polar-day": "daylightPolarDay",
    "polar-night": "daylightPolarNight",
  };
  return t(language, keys[daylight.phase] ?? "daylightLocal");
}

function particleCount(kind: ReturnType<typeof sceneWeather>): number {
  if (kind === "rain") return 24;
  if (kind === "snow") return 18;
  return 0;
}

function selectionReasonText(
  reason: SelectionReason,
  place: Place,
  daylight: Daylight,
  language: Language,
): string {
  if (reason === "next-sunrise" && daylight.nextEventAt) {
    return t(language, "whyNextSunrise", {
      place: place.name,
      time: formatLocalTime(daylight.nextEventAt, place.timeZone, language),
    });
  }
  if (reason === "next-sunrise") {
    return t(language, "whySunriseFocus", { place: place.name });
  }
  if (reason === "next-sunset" && daylight.nextEventAt) {
    return t(language, "whyNextSunset", {
      place: place.name,
      time: formatLocalTime(daylight.nextEventAt, place.timeZone, language),
    });
  }
  if (reason === "next-sunset") {
    return t(language, "whySunsetFocus", { place: place.name });
  }
  const keys: Record<SelectionReason, MessageKey> = {
    "sunrise-soon": "whySunriseSoon",
    "sunset-soon": "whySunsetSoon",
    "local-midnight": "whyLocalMidnight",
    "polar-day": "whyPolarDay",
    "polar-night": "whyPolarNight",
    golden: "whyGolden",
    twilight: "whyTwilight",
    night: "whyNight",
    day: "whyDay",
    "next-sunrise": "whySunriseFocus",
    "next-sunset": "whySunsetFocus",
    "night-focus": "whyNightFocus",
  };
  return t(language, keys[reason], { place: place.name });
}

export class SomewhereNowApp {
  private readonly elements: Elements;
  private readonly audio = new ProceduralAudio();
  private currentPlace: Place | null = null;
  private currentDaylight: Daylight | null = null;
  private currentWeather: Weather | null = null;
  private currentMoment: Moment | null = null;
  private currentDataState: DataState = "loading";
  private currentMomentAt = new Date();
  private currentMomentRandom = 0;
  private currentFocus: MomentFocus = "surprise";
  private currentSelectionReason: SelectionReason = "day";
  private readonly recentPlaceIds: string[] = [];
  private readonly visitedPlaceIds = new Set<string>();
  private readonly visitedLandscapes = new Set<Place["landscape"]>();
  private statusFactory: StatusFactory = (language) => t(language, "initialStatus");
  private requestController: AbortController | null = null;
  private requestNumber = 0;
  private clockTimer: number | null = null;
  private toastTimer: number | null = null;
  private requestedPlaceUsed = false;

  constructor(
    private readonly root: HTMLElement,
    private language: Language = "de",
  ) {
    this.elements = {
      aboutClose: required("#about-close"),
      aboutDialog: required("#about-dialog"),
      aboutOpen: required("#about-open"),
      dataState: required("#data-state"),
      factDaylight: required("#fact-daylight"),
      factPlace: required("#fact-place"),
      factTime: required("#fact-time"),
      factWeather: required("#fact-weather"),
      focusInputs: requiredAll('input[name="moment-focus"]'),
      journeyTrail: required("#journey-trail"),
      momentDetail: required("#moment-detail"),
      momentTitle: required("#moment-title"),
      placeLabel: required("#place-label"),
      scene: required("#scene"),
      scenePlace: required("#scene-place"),
      sceneTime: required("#scene-time"),
      selectionReason: required("#selection-reason"),
      sessionNote: required("#session-note"),
      shareButton: required("#share-button"),
      soundToggle: required("#sound-toggle"),
      sourceNote: required("#source-note"),
      statusLine: required("#status-line"),
      toast: required("#toast"),
      travelButton: required("#travel-button"),
      travelLabel: required("#travel-label"),
      weatherParticles: required("#weather-particles"),
      weatherRetry: required("#weather-retry"),
    };
  }

  start(): void {
    const appUrl = new URL(import.meta.env.BASE_URL, window.location.origin).href;
    this.elements.shareButton.setPayloadProvider(() => {
      if (!this.currentPlace || !this.currentMoment) {
        return {
          title: t(this.language, "shareTitle"),
          text: t(this.language, "initialDetail"),
          url: appUrl,
        };
      }
      const place = localizePlace(this.currentPlace, this.language);
      return buildSharePayload(
        place,
        this.currentMoment,
        formatPlaceTime(place, new Date(), this.language),
        this.language,
        appUrl,
      );
    });
    this.elements.focusInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (!input.checked || !isMomentFocus(input.value)) return;
        this.currentFocus = input.value;
        this.root.dataset.momentFocus = this.currentFocus;
        this.updateTravelLabel();
      });
    });
    this.elements.travelButton.addEventListener("click", () => void this.travel());
    this.elements.weatherRetry.addEventListener("click", () => void this.retryWeather());
    this.elements.soundToggle.addEventListener("click", () => void this.toggleSound());
    this.elements.aboutOpen.addEventListener("click", () => this.elements.aboutDialog.showModal());
    this.elements.aboutClose.addEventListener("click", () => this.elements.aboutDialog.close());
    this.elements.aboutDialog.addEventListener("click", (event) => {
      if (event.target === this.elements.aboutDialog) this.elements.aboutDialog.close();
    });
    document.addEventListener("visibilitychange", () => void this.audio.onVisibilityChange());
    window.addEventListener("online", () => {
      if (!this.currentWeather) {
        this.setStatus((language) => t(language, "statusOnline"));
        this.elements.weatherRetry.hidden = false;
      }
    });
    window.addEventListener("offline", () => {
      this.setStatus((language) => t(language, "statusOffline"));
    });

    this.updateSoundLabel();
    this.root.dataset.momentFocus = this.currentFocus;
    this.updateTravelLabel();
    this.clockTimer = window.setInterval(() => this.refreshClock(), 30_000);
    void this.travel();
  }

  setLanguage(language: Language): void {
    this.language = language;
    this.updateSoundLabel();
    this.updateTravelLabel();

    const place = this.currentPlace;
    const daylight = this.currentDaylight;
    if (place && daylight) {
      const displayPlace = localizePlace(place, language);
      this.currentMoment = selectMoment(
        displayPlace,
        daylight,
        this.currentWeather?.severe ? this.currentWeather : null,
        this.currentMomentAt,
        () => this.currentMomentRandom,
        language,
        this.currentFocus,
      );
      this.render(
        displayPlace,
        daylight,
        this.currentWeather,
        this.currentMoment,
        new Date(),
        this.currentDataState,
      );
    }
    this.elements.statusLine.textContent = this.statusFactory(language);
    this.renderSessionNote();
    this.renderJourneyTrail();
  }

  destroy(): void {
    this.requestController?.abort();
    if (this.clockTimer !== null) window.clearInterval(this.clockTimer);
    if (this.toastTimer !== null) window.clearTimeout(this.toastTimer);
  }

  private async travel(): Promise<void> {
    this.requestController?.abort();
    const request = ++this.requestNumber;
    const controller = new AbortController();
    this.requestController = controller;

    const requestedPlace = this.requestedPlaceUsed
      ? null
      : getPlaceById(new URLSearchParams(window.location.search).get("place"));
    this.requestedPlaceUsed = true;
    const now = new Date();
    const selection = requestedPlace
      ? evaluatePlaceInterest(
          requestedPlace,
          getDaylight(requestedPlace, now),
          now,
          this.recentPlaceIds,
          this.currentFocus,
        )
      : chooseNextPlace({
          currentId: this.currentPlace?.id ?? null,
          recentIds: this.recentPlaceIds,
          now,
          focus: this.currentFocus,
        });
    const { place, daylight, reason } = selection;
    const displayPlace = localizePlace(place, this.language);
    this.currentSelectionReason = reason;
    this.recentPlaceIds.push(place.id);
    if (this.recentPlaceIds.length > 12) this.recentPlaceIds.shift();
    this.visitedPlaceIds.add(place.id);
    this.visitedLandscapes.add(place.landscape);
    this.currentPlace = place;
    this.currentDaylight = daylight;
    this.currentWeather = null;
    this.currentMomentAt = now;
    this.currentMomentRandom = Math.random();
    this.currentMoment = selectMoment(
      displayPlace,
      daylight,
      null,
      now,
      () => this.currentMomentRandom,
      this.language,
      this.currentFocus,
    );

    this.setBusy(true);
    this.render(displayPlace, daylight, null, this.currentMoment, now, "loading");
    this.setStatus((language) =>
      t(language, "statusWeatherLoading", {
        place: localizePlace(place, language).name,
      }),
    );

    try {
      const weather = await fetchWeather(place, { signal: controller.signal, now });
      if (request !== this.requestNumber) return;
      this.currentWeather = weather;
      const localized = localizePlace(place, this.language);
      this.currentMoment = selectMoment(
        localized,
        daylight,
        weather.severe ? weather : null,
        now,
        () => this.currentMomentRandom,
        this.language,
        this.currentFocus,
      );
      const dataState: DataState = weather.severe
        ? "withheld"
        : weather.stale
          ? "stale"
          : "live";
      this.render(localized, daylight, weather, this.currentMoment, now, dataState);
      const statusKey: MessageKey = weather.severe
        ? "statusPlaceWithheld"
        : weather.stale
          ? "statusPlaceStale"
          : "statusPlaceReady";
      this.setStatus((language) =>
        t(language, statusKey, { place: localizePlace(place, language).name }),
      );
    } catch (error) {
      if (request !== this.requestNumber) return;
      const reason: WeatherFailureReason =
        error instanceof WeatherRequestError ? error.reason : "network";
      const localized = localizePlace(place, this.language);
      this.currentMoment = selectMoment(
        localized,
        daylight,
        null,
        now,
        () => this.currentMomentRandom,
        this.language,
        this.currentFocus,
      );
      this.render(localized, daylight, null, this.currentMoment, now, "fallback");
      this.setStatus((language) => weatherFailureMessage(reason, language));
      this.elements.weatherRetry.hidden = false;
    } finally {
      if (request === this.requestNumber) this.setBusy(false);
    }
  }

  private async retryWeather(): Promise<void> {
    const place = this.currentPlace;
    const daylight = this.currentDaylight;
    if (!place || !daylight) return;

    this.requestController?.abort();
    const request = ++this.requestNumber;
    const controller = new AbortController();
    this.requestController = controller;
    this.setBusy(true);
    this.elements.weatherRetry.hidden = true;
    this.setStatus((language) =>
      t(language, "statusWeatherRetry", {
        place: localizePlace(place, language).name,
      }),
    );
    this.setDataState("loading");

    try {
      const now = new Date();
      const weather = await fetchWeather(place, { signal: controller.signal, now });
      if (request !== this.requestNumber) return;
      this.currentWeather = weather;
      this.currentMomentAt = now;
      this.currentMomentRandom = Math.random();
      const localized = localizePlace(place, this.language);
      this.currentMoment = selectMoment(
        localized,
        daylight,
        weather.severe ? weather : null,
        now,
        () => this.currentMomentRandom,
        this.language,
        this.currentFocus,
      );
      const state: DataState = weather.severe
        ? "withheld"
        : weather.stale
          ? "stale"
          : "live";
      this.render(localized, daylight, weather, this.currentMoment, now, state);
      this.setStatus((language) =>
        t(
          language,
          weather.severe ? "statusWeatherRestoredWithheld" : "statusWeatherRestored",
        ),
      );
    } catch (error) {
      if (request !== this.requestNumber) return;
      const reason: WeatherFailureReason =
        error instanceof WeatherRequestError ? error.reason : "network";
      this.setStatus((language) => weatherFailureMessage(reason, language));
      this.setDataState("fallback");
      this.elements.weatherRetry.hidden = false;
    } finally {
      if (request === this.requestNumber) this.setBusy(false);
    }
  }

  private render(
    place: Place,
    daylight: Daylight,
    weather: Weather | null,
    moment: Moment,
    now: Date,
    state: DataState,
  ): void {
    const localTime = formatPlaceTime(place, now, this.language);
    this.currentDataState = state;
    this.elements.placeLabel.textContent = `${place.name} · ${place.country}`;
    this.elements.momentTitle.textContent = moment.title;
    this.elements.momentDetail.textContent = moment.detail;
    this.elements.selectionReason.textContent = selectionReasonText(
      this.currentSelectionReason,
      place,
      daylight,
      this.language,
    );
    this.renderSessionNote();
    this.renderJourneyTrail();
    this.elements.factPlace.textContent = `${place.name}, ${place.country}`;
    this.elements.factTime.textContent = formatLocalDateTime(now, place.timeZone, this.language);
    this.elements.factWeather.textContent = weather
      ? weatherDescription(weather, this.language)
      : t(this.language, "weatherUnavailable");
    this.elements.factDaylight.textContent = daylightDescription(daylight, place, this.language);
    this.elements.scenePlace.textContent = place.name;
    this.elements.sceneTime.textContent = localTime;
    this.elements.sceneTime.dateTime = now.toISOString();
    this.elements.weatherRetry.hidden = state !== "fallback" && state !== "stale";
    this.elements.sourceNote.textContent = weather
      ? weatherSourceLine(weather, place, this.language)
      : t(this.language, "sourceNoWeather");
    this.setDataState(state);
    this.renderScene(place, daylight, weather, moment);
    this.audio.setPhase(daylight.phase);
  }

  private renderScene(
    place: Place,
    daylight: Daylight,
    weather: Weather | null,
    moment: Moment,
  ): void {
    const scene = this.elements.scene;
    const weatherKind = sceneWeather(weather);
    scene.dataset.phase = daylight.phase;
    scene.dataset.weather = weatherKind;
    scene.dataset.landscape = place.landscape;
    const sunX = Math.round(Math.max(10, Math.min(90, daylight.azimuth / 3.6)) / 10) * 10;
    const sunY = Math.round(Math.max(10, Math.min(80, 68 - daylight.altitude * 0.7)) / 10) * 10;
    scene.dataset.sunX = String(sunX);
    scene.dataset.sunY = String(sunY);
    scene.dataset.sceneVariant = String(sceneVariantForPlace(place));
    scene.dataset.moment = moment.kind;
    scene.setAttribute(
      "aria-label",
      t(this.language, "sceneLabel", {
        place: place.name,
        title: moment.title,
        detail: moment.detail,
      }),
    );

    const count = particleCount(weatherKind);
    const particles = Array.from({ length: count }, () => document.createElement("span"));
    this.elements.weatherParticles.replaceChildren(...particles);

    const themeColor =
      daylight.phase === "night" || daylight.phase === "polar-night" ? "#15243a" : "#e3a66d";
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute(
      "content",
      themeColor,
    );
  }

  private refreshClock(): void {
    const place = this.currentPlace;
    if (!place) return;
    const displayPlace = localizePlace(place, this.language);
    const now = new Date();
    const daylight = getDaylight(place, now);
    this.currentDaylight = daylight;
    this.elements.factTime.textContent = formatLocalDateTime(now, place.timeZone, this.language);
    this.elements.sceneTime.textContent = formatPlaceTime(place, now, this.language);
    this.elements.sceneTime.dateTime = now.toISOString();
    this.elements.factDaylight.textContent = daylightDescription(
      daylight,
      displayPlace,
      this.language,
    );
    if (this.currentMoment) {
      this.renderScene(displayPlace, daylight, this.currentWeather, this.currentMoment);
    }
  }

  private renderSessionNote(): void {
    const placeCount = this.visitedPlaceIds.size;
    const landscapeCount = this.visitedLandscapes.size;
    this.elements.sessionNote.textContent =
      placeCount <= 1
        ? t(this.language, "sessionFirst")
        : t(this.language, "sessionProgress", {
            places: String(placeCount),
            landscapes: String(landscapeCount),
          });
  }

  private renderJourneyTrail(): void {
    const items = this.recentPlaceIds.slice(-3).map((id, index, recent) => {
      const place = getPlaceById(id);
      if (!place) return null;
      const item = document.createElement("li");
      item.textContent = localizePlace(place, this.language).name;
      if (index === recent.length - 1) item.setAttribute("aria-current", "true");
      return item;
    });
    this.elements.journeyTrail.replaceChildren(
      ...items.filter((item): item is HTMLLIElement => Boolean(item)),
    );
  }

  private setBusy(isBusy: boolean): void {
    this.root.setAttribute("aria-busy", String(isBusy));
    this.elements.travelButton.classList.toggle("is-loading", isBusy);
  }

  private setDataState(state: DataState): void {
    const keys: Record<DataState, MessageKey> = {
      loading: "stateLoading",
      live: "stateLive",
      stale: "stateStale",
      fallback: "stateFallback",
      withheld: "stateWithheld",
    };
    this.currentDataState = state;
    this.elements.dataState.dataset.state = state;
    this.elements.dataState.textContent = t(this.language, keys[state]);
  }

  private setStatus(factory: StatusFactory): void {
    this.statusFactory = factory;
    this.elements.statusLine.textContent = factory(this.language);
  }

  private updateSoundLabel(): void {
    this.elements.soundToggle.setAttribute(
      "aria-label",
      t(this.language, this.audio.isEnabled ? "soundOff" : "soundOn"),
    );
  }

  private updateTravelLabel(): void {
    const keys: Record<MomentFocus, MessageKey> = {
      surprise: "travel",
      sunrise: "travelSunrise",
      sunset: "travelSunset",
      night: "travelNight",
    };
    this.elements.travelLabel.textContent = t(this.language, keys[this.currentFocus]);
  }

  private async toggleSound(): Promise<void> {
    try {
      if (this.audio.isEnabled) {
        await this.audio.disable();
        this.elements.soundToggle.setAttribute("aria-pressed", "false");
        this.updateSoundLabel();
        this.showToast(t(this.language, "toastSoundOff"));
      } else {
        await this.audio.enable();
        this.elements.soundToggle.setAttribute("aria-pressed", "true");
        this.updateSoundLabel();
        this.showToast(t(this.language, "toastSoundOn"));
      }
    } catch {
      this.elements.soundToggle.setAttribute("aria-pressed", "false");
      this.updateSoundLabel();
      this.showToast(t(this.language, "toastSoundBlocked"));
    }
  }

  private showToast(message: string): void {
    if (this.toastTimer !== null) window.clearTimeout(this.toastTimer);
    this.elements.toast.textContent = message;
    this.elements.toast.classList.add("is-visible");
    this.toastTimer = window.setTimeout(() => {
      this.elements.toast.classList.remove("is-visible");
    }, 2_800);
  }
}
