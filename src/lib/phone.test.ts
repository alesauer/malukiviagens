import { describe, expect, it } from "vitest";
import { normalizeWhatsApp, formatPhoneDisplay, isValidPhone } from "./phone";

describe("phone utilities", () => {
  it("normalizes Brazilian phone without DDI into +55 international format", () => {
    expect(normalizeWhatsApp("(11) 98765-4321")).toBe("+5511987654321");
    expect(normalizeWhatsApp("11987654321")).toBe("+5511987654321");
    expect(normalizeWhatsApp("2133445566")).toBe("+552133445566");
  });

  it("normalizes Brazilian phone that already has 55 but no +", () => {
    expect(normalizeWhatsApp("5511987654321")).toBe("+5511987654321");
  });

  it("preserves international numbers starting with +", () => {
    expect(normalizeWhatsApp("+1 202 555-0199")).toBe("+12025550199");
    expect(normalizeWhatsApp("+351 912 345 678")).toBe("+351912345678");
  });

  it("formats display cleanly for Brazilian numbers", () => {
    expect(formatPhoneDisplay("+5511987654321")).toBe("+55 (11) 98765-4321");
    expect(formatPhoneDisplay("11987654321")).toBe("+55 (11) 98765-4321");
    expect(formatPhoneDisplay("2133445566")).toBe("+55 (21) 3344-5566");
  });

  it("validates phone length correctly", () => {
    expect(isValidPhone("11987654321")).toBe(true);
    expect(isValidPhone("(11) 98765-4321")).toBe(true);
    expect(isValidPhone("+55 11 98765-4321")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone("")).toBe(false);
  });
});

