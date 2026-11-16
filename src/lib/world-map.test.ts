import { describe, expect, it } from "vitest";
import { buildWorldMapData, extractLocationsFromTrip, type TripSummary } from "./world-map";

const makeTrip = (overrides: Partial<TripSummary>): TripSummary => ({
  id: overrides.id ?? "t1",
  title: overrides.title ?? "Viagem",
  main_destination: overrides.main_destination ?? null,
  start_date: overrides.start_date ?? "2020-01-10",
  end_date: overrides.end_date ?? "2020-01-15",
  status: overrides.status ?? "realizada",
  category: overrides.category ?? "ferias",
  cover_path: null,
});

describe("world-map extraction and aggregation", () => {
  it("extracts multiple countries from a single trip title", () => {
    const res = extractLocationsFromTrip({
      title: "Europa: França, Inglaterra e Holanda",
      main_destination: null,
    });
    expect(res.countries.map((c) => c.code).sort()).toEqual(["FR", "GB", "NL"]);
  });

  it("extracts cities and countries from cross-border trips", () => {
    const res = extractLocationsFromTrip({
      title: "Nova York e Toronto",
      main_destination: null,
    });
    expect(res.countries.map((c) => c.code).sort()).toEqual(["CA", "US"]);
    expect(res.cities.map((c) => c.name).sort()).toEqual(["Nova York", "Toronto"]);
  });

  it("maps Brazilian cities and Orlando/Disney to BR and US", () => {
    const br = extractLocationsFromTrip({ title: "🇧🇷 Gramado", main_destination: "Gramado, RS" });
    expect(br.countries.map((c) => c.code)).toEqual(["BR"]);
    expect(br.cities.map((c) => c.name)).toContain("Gramado");

    const us = extractLocationsFromTrip({ title: "Orlando / Disney", main_destination: null });
    expect(us.countries.map((c) => c.code)).toEqual(["US"]);
    expect(us.cities.map((c) => c.name)).toContain("Orlando");
  });

  it("separates visited countries from future planned countries", () => {
    const trips: TripSummary[] = [
      makeTrip({ id: "1", title: "Chile 2026", start_date: "2026-07-10", end_date: "2026-07-18" }),
      makeTrip({ id: "2", title: "Argentina", start_date: "2018-01-10", end_date: "2018-01-15" }),
      makeTrip({ id: "3", title: "Santa Cruz de la Sierra", start_date: "2099-03-24", end_date: "2099-03-31", status: "planejamento" }),
    ];

    const withPlanned = buildWorldMapData(trips, { includePlanned: true });
    expect(withPlanned.stats.visitedCountriesCount).toBe(2);
    expect(withPlanned.stats.plannedOnlyCountriesCount).toBe(1);
    expect(withPlanned.countries.find((c) => c.code === "BO")?.status).toBe("planned");

    const visitedOnly = buildWorldMapData(trips, { includePlanned: false });
    expect(visitedOnly.stats.displayedCountriesCount).toBe(2);
    expect(visitedOnly.countries.find((c) => c.code === "BO")).toBeUndefined();
  });
});
