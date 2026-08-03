import type { Place, Weather, WeatherFailure, WeatherFailureReason } from "./types";
import { t, type Language, type MessageKey } from "../i18n";

const OPEN_METEO_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const CURRENT_FIELDS = [
  "temperature_2m",
  "apparent_temperature",
  "is_day",
  "precipitation",
  "rain",
  "showers",
  "snowfall",
  "weather_code",
  "cloud_cover",
  "relative_humidity_2m",
  "visibility",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
  "shortwave_radiation",
].join(",");

const SEVERE_WEATHER_CODES = new Set([65, 67, 75, 77, 82, 86, 95, 96, 99]);

interface OpenMeteoResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    precipitation?: number;
    rain?: number;
    showers?: number;
    snowfall?: number;
    weather_code?: number;
    cloud_cover?: number;
    relative_humidity_2m?: number;
    visibility?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    wind_gusts_10m?: number;
    shortwave_radiation?: number;
  };
}

export class WeatherRequestError extends Error {
  readonly reason: WeatherFailureReason;

  constructor(failure: WeatherFailure) {
    super(failure.message);
    this.name = "WeatherRequestError";
    this.reason = failure.reason;
  }
}

export function buildWeatherUrl(place: Place): string {
  const url = new URL(OPEN_METEO_ENDPOINT);
  url.searchParams.set("latitude", String(place.latitude));
  url.searchParams.set("longitude", String(place.longitude));
  url.searchParams.set("current", CURRENT_FIELDS);
  url.searchParams.set("timezone", "GMT");
  url.searchParams.set("forecast_days", "1");
  return url.toString();
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function parseWeatherResponse(data: OpenMeteoResponse, now: Date): Weather {
  const current = data.current;
  if (
    !current ||
    typeof current.time !== "string" ||
    !finiteNumber(current.temperature_2m) ||
    !finiteNumber(current.apparent_temperature) ||
    !finiteNumber(current.precipitation) ||
    !finiteNumber(current.rain) ||
    !finiteNumber(current.showers) ||
    !finiteNumber(current.snowfall) ||
    !finiteNumber(current.weather_code) ||
    !finiteNumber(current.cloud_cover) ||
    !finiteNumber(current.relative_humidity_2m) ||
    !finiteNumber(current.visibility) ||
    !finiteNumber(current.wind_speed_10m) ||
    !finiteNumber(current.wind_direction_10m) ||
    !finiteNumber(current.wind_gusts_10m) ||
    !finiteNumber(current.shortwave_radiation)
  ) {
    throw new WeatherRequestError({
      reason: "invalid",
      message: "Die Wetterantwort war unvollständig.",
    });
  }

  const observedAt = new Date(`${current.time}Z`);
  if (Number.isNaN(observedAt.getTime())) {
    throw new WeatherRequestError({
      reason: "invalid",
      message: "Der Wetterzeitpunkt war nicht lesbar.",
    });
  }

  const ageMinutes = Math.abs(now.getTime() - observedAt.getTime()) / 60_000;
  const severe =
    SEVERE_WEATHER_CODES.has(current.weather_code) ||
    current.wind_speed_10m >= 60 ||
    current.wind_gusts_10m >= 80;

  return {
    observedAt,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    precipitation: current.precipitation,
    rain: current.rain,
    showers: current.showers,
    snowfall: current.snowfall,
    weatherCode: current.weather_code,
    cloudCover: current.cloud_cover,
    relativeHumidity: current.relative_humidity_2m,
    visibility: current.visibility,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    windGusts: current.wind_gusts_10m,
    shortwaveRadiation: current.shortwave_radiation,
    stale: ageMinutes > 90,
    severe,
  };
}

export async function fetchWeather(
  place: Place,
  options: {
    signal?: AbortSignal;
    timeoutMs?: number;
    now?: Date;
    fetcher?: typeof fetch;
  } = {},
): Promise<Weather> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new WeatherRequestError({
      reason: "offline",
      message: "Gerade besteht keine Netzverbindung.",
    });
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 6_000;
  const timeoutId = window.setTimeout(() => controller.abort("timeout"), timeoutMs);
  const onExternalAbort = (): void => controller.abort("cancelled");
  options.signal?.addEventListener("abort", onExternalAbort, { once: true });

  try {
    const response = await (options.fetcher ?? fetch)(buildWeatherUrl(place), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new WeatherRequestError({
        reason: "network",
        message: `Der Wetterdienst antwortete mit Status ${response.status}.`,
      });
    }
    const data = (await response.json()) as OpenMeteoResponse;
    return parseWeatherResponse(data, options.now ?? new Date());
  } catch (error) {
    if (error instanceof WeatherRequestError) throw error;
    if (controller.signal.aborted) {
      const timedOut = controller.signal.reason === "timeout";
      throw new WeatherRequestError({
        reason: timedOut ? "timeout" : "network",
        message: timedOut
          ? "Die Wetteranfrage hat zu lange gedauert."
          : "Die Wetteranfrage wurde unterbrochen.",
      });
    }
    throw new WeatherRequestError({
      reason: "network",
      message: "Die Wetterdaten sind gerade nicht erreichbar.",
    });
  } finally {
    window.clearTimeout(timeoutId);
    options.signal?.removeEventListener("abort", onExternalAbort);
  }
}

export function weatherFailureMessage(
  reason: WeatherFailureReason,
  language: Language = "de",
): string {
  const keys: Record<WeatherFailureReason, MessageKey> = {
    offline: "failureOffline",
    timeout: "failureTimeout",
    invalid: "failureInvalid",
    network: "failureNetwork",
  };
  return t(language, keys[reason]);
}
