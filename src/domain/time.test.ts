import { describe, expect, it } from "vitest";
import { formatLocalDateTime, formatLocalTime, getLocalParts, minutesFromLocalMidnight } from "./time";

describe("lokale Zeit", () => {
  it("beachtet Datumsgrenzen und Viertelstunden-Zeitzonen", () => {
    const instant = new Date("2026-01-01T10:30:00Z");
    const chatham = getLocalParts(instant, "Pacific/Chatham");
    expect(chatham).toMatchObject({ year: 2026, month: 1, day: 2, hour: 0, minute: 15 });
    expect(minutesFromLocalMidnight(instant, "Pacific/Chatham")).toBe(15);
  });

  it("beachtet halbstündige und dreiviertelstündige Offsets", () => {
    const instant = new Date("2026-07-30T00:00:00Z");
    expect(formatLocalTime(instant, "Asia/Kathmandu")).toBe("05:45");
    expect(formatLocalTime(instant, "Australia/Adelaide")).toBe("09:30");
  });

  it("überlässt Sommerzeitregeln der IANA-Laufzeit", () => {
    expect(formatLocalTime(new Date("2026-03-29T00:30:00Z"), "Europe/Oslo")).toBe("01:30");
    expect(formatLocalTime(new Date("2026-03-29T01:30:00Z"), "Europe/Oslo")).toBe("03:30");
  });

  it("formatiert Datum und Zeit vollständig auf Englisch", () => {
    const value = formatLocalDateTime(
      new Date("2026-01-01T10:30:00Z"),
      "Pacific/Chatham",
      "en",
    );
    expect(value).toBe("Friday 2 January at 00:15");
  });
});
