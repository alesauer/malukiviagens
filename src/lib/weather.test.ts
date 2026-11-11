import { describe, expect, it, vi, afterEach } from "vitest";
import { cleanLocationQuery, fetchTripWeather, mapWmoCode } from "./weather";

describe("weather.ts", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("cleanLocationQuery", () => {
    it("removes emojis and symbols cleanly", () => {
      expect(cleanLocationQuery("✈️ Gramado")).toBe("Gramado");
      expect(cleanLocationQuery("Paris 🇫🇷")).toBe("Paris");
    });

    it("extracts the primary city before commas, slashes, or dashes", () => {
      expect(cleanLocationQuery("Gramado, RS, Brasil")).toBe("Gramado");
      expect(cleanLocationQuery("Foz do Iguaçu / PR")).toBe("Foz do Iguaçu");
      expect(cleanLocationQuery("Curitiba - PR")).toBe("Curitiba");
      expect(cleanLocationQuery("Férias em Gramado")).toBe("Gramado");
      expect(cleanLocationQuery("Viagem para Paris")).toBe("Paris");
      expect(cleanLocationQuery("Santiago Chile")).toBe("Santiago");
      expect(cleanLocationQuery("Florianópolis SC")).toBe("Florianópolis");
    });

    it("returns empty string for empty inputs", () => {
      expect(cleanLocationQuery("")).toBe("");
      expect(cleanLocationQuery("   ")).toBe("");
    });
  });

  describe("mapWmoCode", () => {
    it("maps standard WMO weather codes to Portuguese labels and Lucide icon names", () => {
      expect(mapWmoCode(0)).toEqual({ condition: "Ensolarado", iconName: "Sun" });
      expect(mapWmoCode(1)).toEqual({ condition: "Parcialmente nublado", iconName: "CloudSun" });
      expect(mapWmoCode(3)).toEqual({ condition: "Encoberto", iconName: "Cloud" });
      expect(mapWmoCode(45)).toEqual({ condition: "Nevoeiro", iconName: "CloudFog" });
      expect(mapWmoCode(53)).toEqual({ condition: "Garoa / Chuvisco", iconName: "CloudDrizzle" });
      expect(mapWmoCode(61)).toEqual({ condition: "Chuva", iconName: "CloudRain" });
      expect(mapWmoCode(73)).toEqual({ condition: "Neve / Frio intenso", iconName: "Snowflake" });
      expect(mapWmoCode(95)).toEqual({ condition: "Tempestade / Trovoadas", iconName: "CloudLightning" });
      expect(mapWmoCode(999)).toEqual({ condition: "Instável", iconName: "CloudSun" });
    });
  });

  describe("fetchTripWeather", () => {
    it("returns null if destination or dates are missing", async () => {
      expect(await fetchTripWeather({ destination: "", startDate: "2026-11-20", endDate: "2026-11-25" })).toBeNull();
      expect(await fetchTripWeather({ destination: "Gramado", startDate: "", endDate: "2026-11-25" })).toBeNull();
      expect(await fetchTripWeather({ destination: "Gramado", startDate: "2026-11-20", endDate: "" })).toBeNull();
    });

    it("parses weather forecast successfully when API returns valid data", async () => {
      const mockFetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("geocoding-api.open-meteo.com")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                results: [
                  {
                    name: "Gramado",
                    admin1: "Rio Grande do Sul",
                    country: "Brasil",
                    latitude: -29.37,
                    longitude: -50.87,
                  },
                ],
              }),
          });
        }
        if (url.includes("api.open-meteo.com/v1/forecast")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                daily: {
                  time: ["2026-11-20", "2026-11-21"],
                  temperature_2m_max: [24.5, 26.0],
                  temperature_2m_min: [14.0, 15.2],
                  weather_code: [1, 61],
                  precipitation_probability_max: [10, 80],
                },
              }),
          });
        }
        return Promise.resolve({ ok: false });
      });

      vi.stubGlobal("fetch", mockFetch);

      const result = await fetchTripWeather({
        destination: "Gramado, RS",
        startDate: "2026-11-20",
        endDate: "2026-11-21",
      });

      expect(result).not.toBeNull();
      if (!result) return;
      expect(result.locationName).toContain("Gramado");
      expect(result.days.length).toBe(2);
      expect(result.days[0]?.maxTemp).toBe(25);
      expect(result.days[0]?.minTemp).toBe(14);
      expect(result.days[0]?.condition).toBe("Parcialmente nublado");
      expect(result.days[1]?.condition).toBe("Chuva");
      expect(result.summary.rainProbabilityMax).toBe(80);
      expect(result.summary.description).toContain("possibilidade de chuva");
    });
  });
});

