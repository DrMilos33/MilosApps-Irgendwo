import { describe, expect, it } from "vitest";
import { PLACES } from "./locations";
import { SCENE_VARIANT_COUNT, sceneVariantForPlace } from "./scene";

describe("prozedurale Szenenprofile", () => {
  it("ordnet jedem Ort deterministisch eines von zwölf Profilen zu", () => {
    for (const place of PLACES) {
      const variant = sceneVariantForPlace(place);
      expect(variant).toBe(sceneVariantForPlace(place));
      expect(variant).toBeGreaterThanOrEqual(0);
      expect(variant).toBeLessThan(SCENE_VARIANT_COUNT);
    }
  });

  it("nutzt im kuratierten Ortsbestand alle zwölf Profile", () => {
    const variants = new Set(PLACES.map(sceneVariantForPlace));
    expect(variants.size).toBe(SCENE_VARIANT_COUNT);
  });
});
