import { describe, expect, it } from "vitest";
import { getCuratedItinerarySuggestions } from "./itinerary-suggestions";

describe("itinerary-suggestions.ts", () => {
  it("returns Gramado suggestions with Lago Negro and Mini Mundo", () => {
    const list = getCuratedItinerarySuggestions("Gramado, RS", "Férias em Gramado", "ferias", 4);
    expect(list.length).toBeGreaterThanOrEqual(5);
    expect(list.some((i) => i.title.includes("Lago Negro"))).toBe(true);
    expect(list.some((i) => i.title.includes("Mini Mundo"))).toBe(true);
    expect(list.some((i) => i.title.includes("Fondue"))).toBe(true);
  });

  it("returns Santiago/Chile suggestions with Sky Costanera and Valle Nevado", () => {
    const list = getCuratedItinerarySuggestions("Santiago, Chile", "Viagem Chile", "ferias", 5);
    expect(list.some((i) => i.title.includes("Sky Costanera"))).toBe(true);
    expect(list.some((i) => i.title.includes("Cordilheira"))).toBe(true);
  });

  it("returns Paris/Europa suggestions with Torre Eiffel and Louvre", () => {
    const list = getCuratedItinerarySuggestions("Paris, França", "Europa", "internacional", 6);
    expect(list.some((i) => i.title.includes("Torre Eiffel"))).toBe(true);
    expect(list.some((i) => i.title.includes("Louvre"))).toBe(true);
  });

  it("assigns valid day offsets within trip days count", () => {
    const totalDays = 3;
    const list = getCuratedItinerarySuggestions("Florianópolis", "Praia", "praia", totalDays);
    for (const item of list) {
      expect(item.suggestedDayOffset).toBeGreaterThanOrEqual(0);
      expect(item.suggestedDayOffset).toBeLessThan(totalDays);
    }
  });

  it("returns generic suggestions when destination is unknown", () => {
    const list = getCuratedItinerarySuggestions("Cidade Nova", "Viagem", "outros", 2);
    expect(list.length).toBeGreaterThan(0);
    expect(list.some((i) => i.title.includes("City Tour"))).toBe(true);
  });
});

