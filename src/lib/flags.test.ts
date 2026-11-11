import { describe, expect, it } from "vitest";
import {
  countryCodeToEmoji,
  detectLocationFlag,
  extractLocationKeyword,
  normalizeText,
} from "./flags";

describe("flags.ts utility functions", () => {
  it("converts country codes to flag emojis correctly", () => {
    expect(countryCodeToEmoji("BR")).toBe("🇧🇷");
    expect(countryCodeToEmoji("FR")).toBe("🇫🇷");
    expect(countryCodeToEmoji("CL")).toBe("🇨🇱");
    expect(countryCodeToEmoji("US")).toBe("🇺🇸");
    expect(countryCodeToEmoji("GB")).toBe("🇬🇧");
    expect(countryCodeToEmoji("NL")).toBe("🇳🇱");
  });

  it("normalizes text by stripping accents, symbols and casing", () => {
    expect(normalizeText("Florianópolis!")).toBe("florianopolis");
    expect(normalizeText("São Paulo - SP")).toBe("sao paulo sp");
    expect(normalizeText("Férias em Gramado 2026")).toBe("ferias em gramado 2026");
  });

  it("extracts destination keywords from phrases", () => {
    const candidates = extractLocationKeyword("Férias em Floripa 2026");
    expect(candidates).toContain("floripa");
  });

  it("detects Brazilian cities and attaches municipal flag", async () => {
    const floripa = await detectLocationFlag("Floripa");
    expect(floripa).not.toBeNull();
    expect(floripa?.kind).toBe("city_br");
    expect(floripa?.city).toBe("Florianópolis");
    expect(floripa?.state).toBe("SC");
    expect(floripa?.flagUrl).toContain("Florian%C3%B3polis");

    const gramado = await detectLocationFlag("Férias em Gramado");
    expect(gramado).not.toBeNull();
    expect(gramado?.kind).toBe("city_br");
    expect(gramado?.city).toBe("Gramado");
    expect(gramado?.flagUrl).toContain("Gramado");

    const bh = await detectLocationFlag("Belo Horizonte");
    expect(bh).not.toBeNull();
    expect(bh?.kind).toBe("city_br");
    expect(bh?.city).toBe("Belo Horizonte");
    expect(bh?.state).toBe("MG");
  });

  it("detects international cities and attaches country flag", async () => {
    const paris = await detectLocationFlag("Paris");
    expect(paris).not.toBeNull();
    expect(paris?.kind).toBe("city_intl");
    expect(paris?.countryCode).toBe("FR");
    expect(paris?.emoji).toBe("🇫🇷");

    const nyc = await detectLocationFlag("Nova York");
    expect(nyc).not.toBeNull();
    expect(nyc?.countryCode).toBe("US");
    expect(nyc?.emoji).toBe("🇺🇸");

    const santiago = await detectLocationFlag("Santiago");
    expect(santiago).not.toBeNull();
    expect(santiago?.countryCode).toBe("CL");
    expect(santiago?.emoji).toBe("🇨🇱");
  });

  it("detects countries and attaches country flag", async () => {
    const chile = await detectLocationFlag("Chile 2026");
    expect(chile).not.toBeNull();
    expect(chile?.countryCode).toBe("CL");
    expect(chile?.emoji).toBe("🇨🇱");

    const franca = await detectLocationFlag("França");
    expect(franca).not.toBeNull();
    expect(franca?.countryCode).toBe("FR");
    expect(franca?.emoji).toBe("🇫🇷");
  });
});

