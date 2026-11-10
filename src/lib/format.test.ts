import { describe, expect, it } from "vitest";
import { daysUntil, tripDays, tripLength, tripPhase } from "./format";

const today = new Date(2026, 10, 9); // 9 Nov 2026

describe("trip dates", () => {
  it("counts days until trip start", () => {
    expect(daysUntil("2026-11-19", today)).toBe(10);
  });
  it("trip length includes both ends", () => {
    expect(tripLength("2026-12-20", "2026-12-27")).toBe(8);
  });
  it("lists every day of the trip", () => {
    expect(tripDays("2026-12-30", "2027-01-02")).toEqual(["2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02"]);
  });
  it("a trip happening today is in progress", () => {
    expect(tripPhase("2026-11-08", "2026-11-12", today)).toBe("em_andamento");
    expect(tripPhase("2026-11-01", "2026-11-05", today)).toBe("realizada");
  });
});
