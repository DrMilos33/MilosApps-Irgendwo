import { ProceduralAudio } from "../audio";
import { getDaylight } from "../domain/daylight";
import { chooseNextPlace, getPlaceById } from "../domain/locations";
import { sceneWeather, selectMoment, weatherDescription } from "../domain/moments";
import { formatLocalDateTime, formatLocalTime, formatPlaceTime } from "../domain/time";
import type {
  Daylight,
  Moment,
  Place,
  Weather,
  WeatherFailureReason,
} from "../domain/types";
import {
  fetchWeather,
  WeatherRequestError,
  weatherFailureMessage,
} from "../domain/weather";
import { shareMoment } from "../share";

type DataState = "loading" | "live" | "stale" | "fallback" | "withheld";

interface Elements {
  aboutClose: HTMLButtonElement;
  aboutDialog: HTMLDialogElement;
  aboutOpen: HTMLButtonElement;
  dataState: HTMLElement;
  factDaylight: HTMLElement;
  factPlace: HTMLElement;
  factTime: HTMLElement;
  factWeather: HTMLElement;
  momentDetail: HTMLElement;
  momentTitle: HTMLElement;
  placeLabel: HTMLElement;
  scene: HTMLElement;
  scenePlace: HTMLElement;
  sceneTime: HTMLTimeElement;
  shareButton: HTMLButtonElement;
  soundToggle: HTMLButtonElement;
  sourceNote: HTMLElement;
  statusLine: HTMLElement;
  toast: HTMLElement;
  travelButton: HTMLButtonElement;
  weatherParticles: HTMLElement;
  weatherRetry: HTMLButtonElement;
}

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Element fehlt: ${selector}`);
  return element;
}

function weatherSourceLine(weather: Weather, place: Place): string {
  const observed = formatLocalTime(weather.observedAt, place.timeZone);
  if (weather.severe) {
    return `Open-Meteo · Stand ${observed} Uhr. Wetterdetail aus Fürsorge ausgeblendet.`;
  }
  if (weather.stale) {
    return `Open-Meteo · letzter verfügbarer Stand ${observed} Uhr; als älter markiert.`;
  }
  return `Open-Meteo · Modellstand ${observed} Uhr; Ortszeit und Sonnenstand lokal berechnet.`;
}

function daylightDescription(daylight: Daylight, place: Place): string {
  if (daylight.phase === "polar-day") return "Polartag";
  if (daylight.phase === "polar-night") return "Polarnacht";
  if (daylight.nextEvent && daylight.nextEventAt) {
    const label = daylight.nextEvent === "sunrise" ? "Sonnenaufgang" : "Sonnenuntergang";
    return `${label} ${formatLocalTime(daylight.nextEventAt, place.timeZone)} Uhr`;
  }
  switch (daylight.phase) {
    case "golden":
      return "tiefes Sonnenlicht";
    case "twilight":
      return "Dämmerung";
    case "night":
      return "Nacht";
    case "day":
      return "Tag";
    default:
      return "lokal berechnet";
  }
}

function particleCount(kind: ReturnType<typeof sceneWeather>): number {
  if (kind === "rain") return 24;
  if (kind === "snow") return 18;
  return 0;
}

export class SomewhereNowApp {
  private readonly elements: Elements;
  private readonly audio = new ProceduralAudio();
  private currentPlace: Place | null = null;
  private currentDaylight: Daylight | null = null;
  private currentWeather: Weather | null = null;
  private currentMoment: Moment | null = null;
  private requestController: AbortController | null = null;
  private requestNumber = 0;
  private clockTimer: number | null = null;
  private toastTimer: number | null = null;
  private requestedPlaceUsed = false;

  constructor(private readonly root: HTMLElement) {
    this.elements = {
      aboutClose: required("#about-close"),
      aboutDialog: required("#about-dialog"),
      aboutOpen: required("#about-open"),
      dataState: required("#data-state"),
      factDaylight: required("#fact-daylight"),
      factPlace: required("#fact-place"),
      factTime: required("#fact-time"),
      factWeather: required("#fact-weather"),
      momentDetail: required("#moment-detail"),
      momentTitle: required("#moment-title"),
      placeLabel: required("#place-label"),
      scene: required("#scene"),
      scenePlace: required("#scene-place"),
      sceneTime: required("#scene-time"),
      shareButton: required("#share-button"),
      soundToggle: required("#sound-toggle"),
      sourceNote: required("#source-note"),
      statusLine: required("#status-line"),
      toast: required("#toast"),
      travelButton: required("#travel-button"),
      weatherParticles: required("#weather-particles"),
      weatherRetry: required("#weather-retry"),
    };
  }

  start(): void {
    this.elements.travelButton.addEventListener("click", () => void this.travel());
    this.elements.weatherRetry.addEventListener("click", () => void this.retryWeather());
    this.elements.shareButton.addEventListener("click", () => void this.share());
    this.elements.soundToggle.addEventListener("click", () => void this.toggleSound());
    this.elements.aboutOpen.addEventListener("click", () => this.elements.aboutDialog.showModal());
    this.elements.aboutClose.addEventListener("click", () => this.elements.aboutDialog.close());
    this.elements.aboutDialog.addEventListener("click", (event) => {
      if (event.target === this.elements.aboutDialog) this.elements.aboutDialog.close();
    });
    document.addEventListener("visibilitychange", () => void this.audio.onVisibilityChange());
    window.addEventListener("online", () => {
      if (!this.currentWeather) {
        this.elements.statusLine.textContent = "Wieder online – das Wetter kann neu geladen werden.";
        this.elements.weatherRetry.hidden = false;
      }
    });
    window.addEventListener("offline", () => {
      this.elements.statusLine.textContent =
        "Offline – Ortszeit und Sonnenstand funktionieren weiter.";
    });

    this.clockTimer = window.setInterval(() => this.refreshClock(), 30_000);
    void this.travel();
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
    const place = requestedPlace ?? chooseNextPlace(this.currentPlace?.id ?? null);
    const now = new Date();
    const daylight = getDaylight(place, now);
    this.currentPlace = place;
    this.currentDaylight = daylight;
    this.currentWeather = null;
    this.currentMoment = selectMoment(place, daylight, null, now);

    this.setBusy(true);
    this.render(place, daylight, null, this.currentMoment, now, "loading");
    this.elements.statusLine.textContent = `Wetter für ${place.name} wird geladen …`;

    try {
      const weather = await fetchWeather(place, { signal: controller.signal, now });
      if (request !== this.requestNumber) return;
      this.currentWeather = weather;
      this.currentMoment = selectMoment(place, daylight, weather, now);
      const dataState: DataState = weather.severe
        ? "withheld"
        : weather.stale
          ? "stale"
          : "live";
      this.render(place, daylight, weather, this.currentMoment, now, dataState);
      this.elements.statusLine.textContent = weather.severe
        ? `${place.name} ist da. Das Wetter wird heute bewusst nicht inszeniert.`
        : weather.stale
          ? `${place.name} ist da. Die verfügbaren Wetterdaten sind älter.`
          : `${place.name} ist da.`;
    } catch (error) {
      if (request !== this.requestNumber) return;
      const reason: WeatherFailureReason =
        error instanceof WeatherRequestError ? error.reason : "network";
      this.currentMoment = selectMoment(place, daylight, null, now);
      this.render(place, daylight, null, this.currentMoment, now, "fallback");
      this.elements.statusLine.textContent = weatherFailureMessage(reason);
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
    this.elements.statusLine.textContent = `Wetter für ${place.name} wird erneut geladen …`;
    this.setDataState("loading");

    try {
      const now = new Date();
      const weather = await fetchWeather(place, { signal: controller.signal, now });
      if (request !== this.requestNumber) return;
      this.currentWeather = weather;
      this.currentMoment = selectMoment(place, daylight, weather, now);
      const state: DataState = weather.severe
        ? "withheld"
        : weather.stale
          ? "stale"
          : "live";
      this.render(place, daylight, weather, this.currentMoment, now, state);
      this.elements.statusLine.textContent = weather.severe
        ? "Wetterdaten sind da und werden heute bewusst nicht inszeniert."
        : "Wetterdaten sind wieder da.";
    } catch (error) {
      if (request !== this.requestNumber) return;
      const reason: WeatherFailureReason =
        error instanceof WeatherRequestError ? error.reason : "network";
      this.elements.statusLine.textContent = weatherFailureMessage(reason);
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
    const localTime = formatPlaceTime(place, now);
    this.elements.placeLabel.textContent = `${place.name} · ${place.country}`;
    this.elements.momentTitle.replaceChildren(
      Object.assign(document.createElement("span"), { textContent: moment.title }),
    );
    this.elements.momentDetail.textContent = moment.detail;
    this.elements.factPlace.textContent = `${place.name}, ${place.country}`;
    this.elements.factTime.textContent = formatLocalDateTime(now, place.timeZone);
    this.elements.factWeather.textContent = weather
      ? weatherDescription(weather)
      : "zurzeit nicht verfügbar";
    this.elements.factDaylight.textContent = daylightDescription(daylight, place);
    this.elements.scenePlace.textContent = place.name;
    this.elements.sceneTime.textContent = localTime;
    this.elements.sceneTime.dateTime = now.toISOString();
    this.elements.shareButton.disabled = false;
    this.elements.weatherRetry.hidden = state !== "fallback" && state !== "stale";
    this.elements.sourceNote.textContent = weather
      ? weatherSourceLine(weather, place)
      : "Ohne Wetterdaten · Ortszeit und Sonnenstand werden lokal berechnet.";
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
    scene.style.setProperty("--sun-x", `${Math.max(10, Math.min(90, daylight.azimuth / 3.6))}%`);
    scene.style.setProperty(
      "--sun-y",
      `${Math.max(11, Math.min(82, 68 - daylight.altitude * 0.7))}%`,
    );
    scene.style.setProperty("--scene-seed", String(place.sceneSeed % 17));
    scene.setAttribute(
      "aria-label",
      `Prozedurale abstrakte Szene für ${place.name}: ${moment.title} ${moment.detail}`,
    );

    const count = particleCount(weatherKind);
    const particles = Array.from({ length: count }, (_value, index) => {
      const particle = document.createElement("span");
      particle.style.setProperty("--particle-x", `${(index * 37 + place.sceneSeed) % 100}%`);
      particle.style.setProperty("--particle-delay", `${-((index * 19) % 23) / 10}s`);
      particle.style.setProperty("--particle-speed", `${1.5 + ((index * 7) % 10) / 10}s`);
      return particle;
    });
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
    const now = new Date();
    const daylight = getDaylight(place, now);
    this.currentDaylight = daylight;
    this.elements.factTime.textContent = formatLocalDateTime(now, place.timeZone);
    this.elements.sceneTime.textContent = formatPlaceTime(place, now);
    this.elements.sceneTime.dateTime = now.toISOString();
    this.elements.factDaylight.textContent = daylightDescription(daylight, place);
    if (this.currentMoment) {
      this.renderScene(place, daylight, this.currentWeather, this.currentMoment);
    }
  }

  private setBusy(isBusy: boolean): void {
    this.root.setAttribute("aria-busy", String(isBusy));
    this.elements.travelButton.classList.toggle("is-loading", isBusy);
  }

  private setDataState(state: DataState): void {
    const labels: Record<DataState, string> = {
      loading: "lädt",
      live: "aktuell",
      stale: "älter",
      fallback: "ohne Wetter",
      withheld: "bewusst ruhig",
    };
    this.elements.dataState.dataset.state = state;
    this.elements.dataState.textContent = labels[state];
  }

  private async toggleSound(): Promise<void> {
    try {
      if (this.audio.isEnabled) {
        await this.audio.disable();
        this.elements.soundToggle.setAttribute("aria-pressed", "false");
        this.elements.soundToggle.setAttribute("aria-label", "Klang einschalten");
        this.showToast("Klang ist aus.");
      } else {
        await this.audio.enable();
        this.elements.soundToggle.setAttribute("aria-pressed", "true");
        this.elements.soundToggle.setAttribute("aria-label", "Klang ausschalten");
        this.showToast("Leiser, prozeduraler Klang ist an.");
      }
    } catch {
      this.elements.soundToggle.setAttribute("aria-pressed", "false");
      this.elements.soundToggle.setAttribute("aria-label", "Klang einschalten");
      this.showToast("Der Browser hat den Klang nicht freigegeben.");
    }
  }

  private async share(): Promise<void> {
    if (!this.currentPlace || !this.currentMoment) return;
    try {
      const result = await shareMoment(
        this.currentPlace,
        this.currentMoment,
        formatPlaceTime(this.currentPlace, new Date()),
      );
      if (result.method === "clipboard") this.showToast("Moment wurde kopiert.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      this.showToast("Der Moment konnte nicht geteilt werden.");
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
