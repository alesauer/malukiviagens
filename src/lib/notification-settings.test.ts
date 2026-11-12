import { describe, expect, it } from "vitest";
import {
  mergeNotificationSettings,
  buildPersonalizedWhatsAppMessage,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "./notification-settings";

describe("notification-settings", () => {
  it("mergeNotificationSettings handles undefined and null gracefully", () => {
    const res = mergeNotificationSettings(null);
    expect(res.general_channel).toBe("whatsapp");
    expect(res.only_trip_members).toBe(true);
    expect(res.nova_viagem.include_budget).toBe(true);
  });

  it("mergeNotificationSettings preserves customized values", () => {
    const res = mergeNotificationSettings({
      only_trip_members: false,
      nova_viagem: {
        ...DEFAULT_NOTIFICATION_SETTINGS.nova_viagem,
        custom_prefix: "🚨 Nova viagem adicionada!",
        include_budget: false,
      },
    });

    expect(res.only_trip_members).toBe(false);
    expect(res.nova_viagem.custom_prefix).toBe("🚨 Nova viagem adicionada!");
    expect(res.nova_viagem.include_budget).toBe(false);
    expect(res.nova_viagem.include_category).toBe(true);
  });

  it("buildPersonalizedWhatsAppMessage formats nova_viagem according to custom settings", () => {
    const settings = mergeNotificationSettings({
      nova_viagem: {
        ...DEFAULT_NOTIFICATION_SETTINGS.nova_viagem,
        custom_prefix: "🌴 *Bora viajar família!*",
        include_budget: false,
        include_category: true,
      },
    });

    const msg = buildPersonalizedWhatsAppMessage({
      event: "nova_viagem",
      settings,
      familyName: "Família Maluki",
      trip: {
        title: "Praia de Pipa",
        destination: "Tibau do Sul, RN",
        start_date: "2026-12-10",
        end_date: "2026-12-17",
        category: "Praia",
        budget: 5000,
      },
    });

    expect(msg).toContain("🌴 *Bora viajar família!*");
    expect(msg).toContain("Praia de Pipa");
    expect(msg).toContain("🏷️ *Tipo:* Praia");
    expect(msg).not.toContain("💰 *Orçamento"); // excluded
  });

  it("buildPersonalizedWhatsAppMessage formats programacao_do_dia with times and notes", () => {
    const settings = mergeNotificationSettings({
      programacao_do_dia: {
        ...DEFAULT_NOTIFICATION_SETTINGS.programacao_do_dia,
        include_times: true,
        include_locations: true,
        include_notes: true,
      },
    });

    const msg = buildPersonalizedWhatsAppMessage({
      event: "programacao_do_dia",
      settings,
      familyName: "Família Maluki",
      trip: {
        title: "Férias em Roma",
        destination: "Roma, Itália",
        start_date: "2026-10-01",
        end_date: "2026-10-10",
      },
      activities: [
        {
          title: "Coliseu",
          time: "09:30",
          location: "Piazza del Colosseo",
          notes: "Ingressos comprados online",
        },
      ],
      date: "2026-10-02",
    });

    expect(msg).toContain("Coliseu");
    expect(msg).toContain("*09:30*");
    expect(msg).toContain("Piazza del Colosseo");
    expect(msg).toContain("Ingressos comprados online");
  });

  it("buildPersonalizedWhatsAppMessage formats lembrete_viagem with days left and checklist warning", () => {
    const settings = mergeNotificationSettings({
      lembrete_viagem: {
        ...DEFAULT_NOTIFICATION_SETTINGS.lembrete_viagem,
        include_checklist_warning: true,
      },
    });

    const msg = buildPersonalizedWhatsAppMessage({
      event: "lembrete_viagem",
      settings,
      familyName: "Família Maluki",
      trip: {
        title: "Viagem Japão",
        destination: "Tóquio",
        start_date: "2026-11-20",
        end_date: "2026-12-05",
      },
      daysLeft: 5,
    });

    expect(msg).toContain("Faltam apenas *5 dias* para a viagem!");
    expect(msg).toContain("Tóquio");
    expect(msg).toContain("passaportes");
  });
});
