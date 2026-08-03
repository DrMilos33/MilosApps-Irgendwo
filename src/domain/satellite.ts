import type { Place } from "./types";

const GIBS_WMS = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi";
const LAYER = "MODIS_Terra_CorrectedReflectance_TrueColor";

export interface SatelliteView {
  captureDate: string;
  imageUrl: string;
  worldviewUrl: string;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function viewBounds(place: Place): [number, number, number, number] {
  const longitudeSpan = 8;
  const latitudeSpan = 5;
  let west = Math.max(-180, place.longitude - longitudeSpan);
  let east = Math.min(180, place.longitude + longitudeSpan);
  if (east - west < longitudeSpan) {
    if (west === -180) east = Math.min(180, west + longitudeSpan);
    if (east === 180) west = Math.max(-180, east - longitudeSpan);
  }
  const south = Math.max(-85, place.latitude - latitudeSpan);
  const north = Math.min(85, place.latitude + latitudeSpan);
  return [west, south, east, north];
}

export function buildSatelliteView(
  place: Place,
  now: Date = new Date(),
  daysAgo = 1,
): SatelliteView {
  const capture = new Date(now.getTime() - Math.max(1, daysAgo) * 86_400_000);
  const captureDate = isoDate(capture);
  const bounds = viewBounds(place);
  const image = new URL(GIBS_WMS);
  image.searchParams.set("SERVICE", "WMS");
  image.searchParams.set("VERSION", "1.1.1");
  image.searchParams.set("REQUEST", "GetMap");
  image.searchParams.set("TIME", captureDate);
  image.searchParams.set("LAYERS", LAYER);
  image.searchParams.set("FORMAT", "image/jpeg");
  image.searchParams.set("STYLES", "");
  image.searchParams.set("HEIGHT", "720");
  image.searchParams.set("WIDTH", "1280");
  image.searchParams.set("SRS", "EPSG:4326");
  image.searchParams.set("BBOX", bounds.join(","));

  const worldview = new URL("https://worldview.earthdata.nasa.gov/");
  worldview.searchParams.set("v", bounds.join(","));
  worldview.searchParams.set("t", captureDate);
  worldview.searchParams.set("l", LAYER);

  return {
    captureDate,
    imageUrl: image.toString(),
    worldviewUrl: worldview.toString(),
  };
}
