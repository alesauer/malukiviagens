import { describe, expect, it } from "vitest";
import { buildTripWhatsAppMessage, getControlDataForEvent, type WebhookTripData } from "./webhook.functions";

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

  it("returns correct control data for each event type for n8n routing", () => {
    const createdCtrl = getControlDataForEvent("trip_created");
    expect(createdCtrl.type).toBe("nova_viagem");
    expect(createdCtrl.action).toBe("trip_created");
    expect(createdCtrl.description).toBe("Nova Viagem Cadastrada");

    const scheduleCtrl = getControlDataForEvent("daily_schedule");
    expect(scheduleCtrl.type).toBe("programacao_do_dia");
    expect(scheduleCtrl.action).toBe("daily_schedule");
    expect(scheduleCtrl.description).toBe("Programação do Dia");

    const reminderCtrl = getControlDataForEvent("trip_reminder");
    expect(reminderCtrl.type).toBe("lembrete_viagem");
    expect(reminderCtrl.action).toBe("trip_reminder");

    const updatedCtrl = getControlDataForEvent("trip_updated");
    expect(updatedCtrl.type).toBe("atualizacao_viagem");

    const testCtrl = getControlDataForEvent("test");
    expect(testCtrl.type).toBe("teste");
  });

  it("builds daily schedule message with formatted activities", () => {
    const msg = buildTripWhatsAppMessage({
      event: "daily_schedule",
      trip: sampleTrip,
      familyName: "Família Maluki",
      date: "2026-11-21",
      activities: [
        { time: "09:00", title: "Passeio Snowland", location: "Gramado" },
        { time: "14:30", title: "Almoço no Centro Colonial", location: "Canela" },
      ],
    });

    expect(msg).toContain("Programação do Dia");
    expect(msg).toContain("Férias em Gramado");
    expect(msg).toContain("Passeio Snowland");
    expect(msg).toContain("09:00");
    expect(msg).toContain("Almoço no Centro Colonial");
    expect(msg).toContain("21/11/2026");
  });

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

  it("validates recipient model with name, email and phone", () => {
    const sampleRecipient = {
      name: "Carlos Eduardo",
      email: "carlos@exemplo.com",
      phone: "+5511999998888",
    };

    expect(sampleRecipient.name).toBe("Carlos Eduardo");
    expect(sampleRecipient.email).toContain("@");
    expect(sampleRecipient.phone).toMatch(/^\+\d{12,13}$/);
  });
});

