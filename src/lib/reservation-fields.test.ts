import { describe, expect, it } from "vitest";
import { applicableReservationValues, itineraryReservations, reservationFields } from "./reservation-fields";

describe("reservation fields by type", () => {
  it("excludes travel insurance from the itinerary without removing other reservations or changing the source", () => {
    const reservations = ["seguro", "hospedagem", "voo", "onibus", "carro", "restaurante", "ingresso"].map((kind) => ({ kind, starts_at: "2026-11-09T12:00:00" }));
    expect(itineraryReservations(reservations).map((reservation) => reservation.kind)).toEqual(["hospedagem", "voo", "onibus", "carro", "restaurante", "ingresso"]);
    expect(reservations).toHaveLength(7);
    expect(reservations[0]?.kind).toBe("seguro");
  });
  it("does not request company or code for accommodation", () => {
    expect(reservationFields("hospedagem").provider).toBeNull();
    expect(reservationFields("hospedagem").code).toBeNull();
  });
  it("keeps airline, locator and flight times but not street address or maps for flights", () => {
    const fields = reservationFields("voo");
    expect(fields.provider).toBe("Companhia aérea");
    expect(fields.code).toBe("Localizador");
    expect(fields.start).toBe("Partida");
    expect(fields.end).toBe("Chegada");
    expect(fields.address).toBeNull();
  });
  it("discards irrelevant values after changing the type", () => {
    const values = { provider: "Empresa", confirmation_code: "ABC", ends_at: "2026-11-09T12:00", address: "Rua 1", maps_url: "https://maps.google.com" };
    expect(applicableReservationValues("hospedagem", values)).toEqual({ ...values, provider: "", confirmation_code: "" });
    expect(applicableReservationValues("voo", values)).toEqual({ ...values, address: "", maps_url: "" });
    expect(applicableReservationValues("restaurante", values)).toEqual({ ...values, provider: "", confirmation_code: "", ends_at: "" });
  });
});