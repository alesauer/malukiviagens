import { describe, expect, it } from "vitest";
import { buildTripWhatsAppMessage, type WebhookTripData } from "./webhook.functions";

describe("webhook.functions.ts", () => {
  const sampleTrip: WebhookTripData = {
    id: "trip-123",
    title: "Férias em Gramado ❄️",
    destination: "Gramado, RS",
    start_date: "2026-11-20",
    end_date: "2026-11-25",
    category: "Férias",
    budget: 3500.0,
    days_count: 6,
  };

  it("builds friendly test message with sample data and WhatsApp emojis", () => {
    const msg = buildTripWhatsAppMessage({
      event: "test",
      trip: sampleTrip,
      familyName: "Família Maluki",
    });

    expect(msg).toContain("Teste de Integração");
    expect(msg).toContain("Família Maluki");
    expect(msg).toContain("Gramado, RS");
    expect(msg).toContain("n8n");
    expect(msg).toContain("WhatsApp");
  });

  it("builds new trip message with details, category and budget", () => {
    const msg = buildTripWhatsAppMessage({
      event: "trip_created",
      trip: sampleTrip,
      familyName: "Família Maluki",
    });

    expect(msg).toContain("Nova Viagem Planejada");
    expect(msg).toContain("Férias em Gramado");
    expect(msg).toContain("Gramado, RS");
    expect(msg).toContain("20/11/2026");
    expect(msg).toContain("R$ 3500.00");
  });

  it("builds trip reminder message with checklist alert", () => {
    const msg = buildTripWhatsAppMessage({
      event: "trip_reminder",
      trip: sampleTrip,
      familyName: "Família Maluki",
    });

    expect(msg).toContain("Lembrete de Viagem");
    expect(msg).toContain("A sua viagem está chegando");
    expect(msg).toContain("checklist");
  });

  it("builds trip updated message", () => {
    const msg = buildTripWhatsAppMessage({
      event: "trip_updated",
      trip: sampleTrip,
      familyName: "Família Maluki",
    });

    expect(msg).toContain("Atualização de Viagem");
    expect(msg).toContain("foi atualizada");
  });
});
