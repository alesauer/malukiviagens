export interface NovaViagemAlertSettings {
  enabled: boolean;
  target_channel: "whatsapp" | "email" | "all";
  include_budget: boolean;
  include_category: boolean;
  include_link: boolean;
  custom_prefix: string;
  custom_suffix: string;
}

export interface ProgramacaoDoDiaAlertSettings {
  enabled: boolean;
  target_channel: "whatsapp" | "email" | "all";
  preferred_time: string; // Ex: "08:00"
  include_times: boolean;
  include_locations: boolean;
  include_notes: boolean;
  include_count: boolean;
  custom_prefix: string;
  custom_suffix: string;
}

export interface LembreteViagemAlertSettings {
  enabled: boolean;
  target_channel: "whatsapp" | "email" | "all";
  days_in_advance: number[]; // Ex: [30, 15, 7, 1]
  preferred_time: string; // Ex: "09:00"
  include_checklist_warning: boolean;
  custom_prefix: string;
  custom_suffix: string;
}

export interface AtualizacaoViagemAlertSettings {
  enabled: boolean;
  target_channel: "whatsapp" | "email" | "all";
  custom_prefix: string;
  custom_suffix: string;
}

export interface FamilyNotificationSettings {
  general_channel: "whatsapp" | "email" | "all";
  only_trip_members: boolean;
  nova_viagem: NovaViagemAlertSettings;
  programacao_do_dia: ProgramacaoDoDiaAlertSettings;
  lembrete_viagem: LembreteViagemAlertSettings;
  atualizacao_viagem: AtualizacaoViagemAlertSettings;
}

export const DEFAULT_NOTIFICATION_SETTINGS: FamilyNotificationSettings = {
  general_channel: "whatsapp",
  only_trip_members: true,
  nova_viagem: {
    enabled: true,
    target_channel: "whatsapp",
    include_budget: true,
    include_category: true,
    include_link: false,
    custom_prefix: "✈️ *Nova Viagem Planejada!*",
    custom_suffix: "🌟 Acesse o Maluki Viagens para planejar o roteiro juntos!",
  },
  programacao_do_dia: {
    enabled: true,
    target_channel: "whatsapp",
    preferred_time: "08:00",
    include_times: true,
    include_locations: true,
    include_notes: true,
    include_count: true,
    custom_prefix: "📅 *Bom dia! Confira a programação do dia:*",
    custom_suffix: "🌟 Tenham um excelente dia de viagem!",
  },
  lembrete_viagem: {
    enabled: true,
    target_channel: "whatsapp",
    days_in_advance: [15, 7, 1],
    preferred_time: "09:00",
    include_checklist_warning: true,
    custom_prefix: "⏰ *A contagem regressiva começou!*",
    custom_suffix: "📋 Não esqueça de conferir as malas e documentos!",
  },
  atualizacao_viagem: {
    enabled: true,
    target_channel: "whatsapp",
    custom_prefix: "✏️ *Atenção: uma viagem foi atualizada!*",
    custom_suffix: "Confira o roteiro e os detalhes atualizados no aplicativo.",
  },
};

/**
 * Mescla as configurações salvas no banco com os valores padrões para garantir integridade
 */
export function mergeNotificationSettings(
  saved?: Partial<FamilyNotificationSettings> | null
): FamilyNotificationSettings {
  if (!saved || typeof saved !== "object") {
    return { ...DEFAULT_NOTIFICATION_SETTINGS };
  }

  return {
    general_channel: saved.general_channel || DEFAULT_NOTIFICATION_SETTINGS.general_channel,
    only_trip_members: saved.only_trip_members ?? DEFAULT_NOTIFICATION_SETTINGS.only_trip_members,
    nova_viagem: {
      ...DEFAULT_NOTIFICATION_SETTINGS.nova_viagem,
      ...(saved.nova_viagem || {}),
    },
    programacao_do_dia: {
      ...DEFAULT_NOTIFICATION_SETTINGS.programacao_do_dia,
      ...(saved.programacao_do_dia || {}),
    },
    lembrete_viagem: {
      ...DEFAULT_NOTIFICATION_SETTINGS.lembrete_viagem,
      ...(saved.lembrete_viagem || {}),
    },
    atualizacao_viagem: {
      ...DEFAULT_NOTIFICATION_SETTINGS.atualizacao_viagem,
      ...(saved.atualizacao_viagem || {}),
    },
  };
}

export function buildPersonalizedWhatsAppMessage({
  event,
  settings,
  familyName,
  trip,
  activities = [],
  date,
  daysLeft = 7,
}: {
  event: "nova_viagem" | "programacao_do_dia" | "lembrete_viagem" | "atualizacao_viagem" | "teste";
  settings: FamilyNotificationSettings;
  familyName: string;
  trip: {
    title: string;
    destination?: string | null | undefined;
    start_date: string;
    end_date: string;
    budget?: number | null | undefined;
    category?: string | null | undefined;
    days_count?: number | null | undefined;
  };
  activities?: Array<{
    title: string;
    time?: string | null | undefined;
    location?: string | null | undefined;
    notes?: string | null | undefined;
  }> | undefined;
  date?: string | undefined;
  daysLeft?: number | undefined;
}): string {
  const pad = (d: string) => {
    try {
      const [y, m, day] = d.split("-");
      return `${day}/${m}/${y}`;
    } catch {
      return d;
    }
  };

  const periodStr = `${pad(trip.start_date)} até ${pad(trip.end_date)}`;
  const daysCount = trip.days_count ? ` (${trip.days_count} ${trip.days_count === 1 ? "dia" : "dias"})` : "";

  if (event === "teste") {
    return (
      `🔔 *Teste de Notificação Personalizada — Maluki Viagens*\n\n` +
      `Olá! Este é um teste do envio com suas configurações personalizadas de alerta.\n\n` +
      `👨‍👩‍👧‍👦 *Família:* ${familyName}\n` +
      `📍 *Destino exemplo:* ${trip.destination || "Gramado, RS"}\n` +
      `📅 *Período:* ${periodStr}${daysCount}\n\n` +
      `✅ Seus alertas estão ativos e prontos para o WhatsApp!`
    );
  }

  if (event === "nova_viagem") {
    const s = settings.nova_viagem;
    const prefix = s.custom_prefix.trim() || `✈️ *Nova Viagem Planejada — ${familyName}*`;
    const suffix = s.custom_suffix.trim() || "🌟 Acesse o Maluki Viagens para planejar o roteiro e o checklist juntos!";

    const parts = [
      prefix,
      "",
      `🧳 *${trip.title}*`,
      `📍 *Destino:* ${trip.destination || "Não informado"}`,
      `📅 *Período:* ${periodStr}${daysCount}`,
    ];

    if (s.include_category && trip.category) {
      parts.push(`🏷️ *Tipo:* ${trip.category}`);
    }

    if (s.include_budget && trip.budget) {
      parts.push(`💰 *Orçamento previsto:* R$ ${trip.budget.toFixed(2)}`);
    }

    if (s.include_link) {
      parts.push(`🔗 *Ver no app:* http://localhost:3000/viagens`);
    }

    if (suffix) {
      parts.push("", suffix);
    }

    return parts.join("\n");
  }

  if (event === "programacao_do_dia") {
    const s = settings.programacao_do_dia;
    const prefix = s.custom_prefix.trim() || `📅 *Programação do Dia — ${familyName}*`;
    const suffix = s.custom_suffix.trim() || "🌟 Tenham um excelente dia de viagem!";
    const formattedDate = date ? pad(date) : pad(new Date().toISOString().split("T")[0] || "");

    const parts = [
      prefix,
      "",
      `🧳 *${trip.title}*`,
      `📆 *Data:* ${formattedDate}`,
    ];

    if (trip.destination) {
      parts.push(`📍 *Destino:* ${trip.destination}`);
    }

    parts.push("");
    if (s.include_count) {
      const total = activities.length;
      parts.push(`*Atividades planejadas (${total} ${total === 1 ? "item" : "itens"}):*`);
    } else {
      parts.push("*Atividades planejadas:*");
    }

    if (activities.length === 0) {
      parts.push("• Nenhuma atividade específica agendada para hoje. Dia livre!");
    } else {
      activities.forEach((a) => {
        let line = "• ";
        if (s.include_times && a.time) {
          line += `*${a.time}* - `;
        }
        line += a.title;
        if (s.include_locations && a.location) {
          line += ` (${a.location})`;
        }
        if (s.include_notes && a.notes) {
          line += ` — _${a.notes}_`;
        }
        parts.push(line);
      });
    }

    if (suffix) {
      parts.push("", suffix);
    }

    return parts.join("\n");
  }

  if (event === "lembrete_viagem") {
    const s = settings.lembrete_viagem;
    const prefix = s.custom_prefix.trim() || `⏰ *Lembrete de Viagem — ${familyName}*`;
    const suffix = s.custom_suffix.trim() || "📋 Não esqueça de conferir o checklist de malas e reservas!";

    const parts = [
      prefix,
      "",
      `Faltam apenas *${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}* para a viagem!`,
      "",
      `🧳 *${trip.title}*`,
      `📍 *Destino:* ${trip.destination || "Não informado"}`,
      `📅 *Início:* ${pad(trip.start_date)}`,
    ];

    if (s.include_checklist_warning) {
      parts.push("", "⚠️ *Atenção:* Revise se os documentos, passaportes e itens da mala já estão concluídos.");
    }

    if (suffix) {
      parts.push("", suffix);
    }

    return parts.join("\n");
  }

  // atualizacao_viagem
  const s = settings.atualizacao_viagem;
  const prefix = s.custom_prefix.trim() || `✏️ *Atualização de Viagem — ${familyName}*`;
  const suffix = s.custom_suffix.trim() || "Confira o roteiro e os detalhes atualizados no aplicativo.";

  const parts = [
    prefix,
    "",
    `A viagem *${trip.title}* foi alterada:`,
    `📍 *Destino:* ${trip.destination || "Não informado"}`,
    `📅 *Período:* ${periodStr}${daysCount}`,
  ];

  if (suffix) {
    parts.push("", suffix);
  }

  return parts.join("\n");
}
