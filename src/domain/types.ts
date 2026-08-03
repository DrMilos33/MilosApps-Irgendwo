export type Landscape = "coast" | "hills" | "plateau" | "island" | "arctic" | "city";

export interface Place {
  id: string;
  geonameId: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  landscape: Landscape;
  sceneSeed: number;
}

export interface Weather {
  observedAt: Date;
  temperature: number;
  apparentTemperature: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weatherCode: number;
  cloudCover: number;
  relativeHumidity: number;
  visibility: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  shortwaveRadiation: number;
  stale: boolean;
  severe: boolean;
}

export type WeatherFailureReason = "offline" | "timeout" | "network" | "invalid";

export interface WeatherFailure {
  reason: WeatherFailureReason;
  message: string;
}

export type DaylightPhase =
  | "day"
  | "golden"
  | "twilight"
  | "night"
  | "polar-day"
  | "polar-night";

export interface Daylight {
  phase: DaylightPhase;
  altitude: number;
  azimuth: number;
  sunrise: Date | null;
  sunset: Date | null;
  nextEvent: "sunrise" | "sunset" | null;
  nextEventAt: Date | null;
}

export type MomentKind =
  | "sunrise"
  | "sunset"
  | "blue-hour"
  | "night"
  | "day"
  | "polar-day"
  | "polar-night"
  | "fog"
  | "rain"
  | "snow"
  | "clear-night"
  | "warm"
  | "cold"
  | "wind"
  | "weather-withheld";

export type MomentFocus = "surprise" | "sunrise" | "sunset" | "night";

export interface Moment {
  kind: MomentKind;
  title: string;
  detail: string;
}
