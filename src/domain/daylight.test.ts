import { describe, expect, it } from "vitest";
import { getDaylight } from "./daylight";
import { getPlaceById } from "./locations";

function place(id: string) {
  const value = getPlaceById(id);
  if (!value) throw new Error(`Testort fehlt: ${id}`);
  return value;
}

describe("Tageslicht", () => {
  it("erkennt Polartag in Longyearbyen", () => {
    const daylight = getDaylight(place("longyearbyen"), new Date("2026-06-21T12:00:00Z"));
    expect(daylight.phase).toBe("polar-day");
    expect(daylight.sunrise).toBeNull();
    expect(daylight.sunset).toBeNull();
  });

  it("erkennt Polarnacht in Longyearbyen", () => {
    const daylight = getDaylight(place("longyearbyen"), new Date("2026-12-21T12:00:00Z"));
    expect(daylight.phase).toBe("polar-night");
    expect(daylight.sunrise).toBeNull();
    expect(daylight.sunset).toBeNull();
  });

  it("liefert an mittleren Breiten das nächste Sonnenereignis", () => {
    const daylight = getDaylight(place("reykjavik"), new Date("2026-04-15T12:00:00Z"));
    expect(["day", "golden"]).toContain(daylight.phase);
    expect(daylight.sunrise).toBeInstanceOf(Date);
    expect(daylight.sunset).toBeInstanceOf(Date);
    expect(daylight.nextEvent).toBe("sunset");
    expect(daylight.nextEventAt!.getTime()).toBeGreaterThan(new Date("2026-04-15T12:00:00Z").getTime());
  });
});
