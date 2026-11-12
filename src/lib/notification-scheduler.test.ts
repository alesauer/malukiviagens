import { describe, expect, it } from "vitest";
import { calculateDaysDifference, getTodayDateString } from "./notification-scheduler";

describe("notification-scheduler", () => {
  it("calculateDaysDifference calculates positive remaining days correctly", () => {
    const diff = calculateDaysDifference("2026-11-20", "2026-11-13");
    expect(diff).toBe(7);
  });

  it("calculateDaysDifference returns 0 for same day", () => {
    const diff = calculateDaysDifference("2026-11-20", "2026-11-20");
    expect(diff).toBe(0);
  });

  it("calculateDaysDifference returns negative for past trips", () => {
    const diff = calculateDaysDifference("2026-11-10", "2026-11-13");
    expect(diff).toBe(-3);
  });

  it("getTodayDateString returns valid YYYY-MM-DD format", () => {
    const today = getTodayDateString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

