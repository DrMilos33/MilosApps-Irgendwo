import type { Place } from "./types";

export const SCENE_VARIANT_COUNT = 12;

/**
 * Creates a stable visual profile without exposing or persisting location data.
 * The id keeps places with the same landscape and similar seeds visually distinct.
 */
export function sceneVariantForPlace(place: Place): number {
  let hash = 2166136261;
  for (const character of place.id) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return ((hash + place.sceneSeed) >>> 0) % SCENE_VARIANT_COUNT;
}
