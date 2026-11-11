import { supabase } from "@/integrations/supabase/client";

export type ChecklistCategoryId =
  | "antes_viagem"
  | "documentos_dinheiro"
  | "eletronicos"
  | "mala_roupas"
  | "higiene"
  | "saude"
  | "casa"
  | "dia_viagem";

export interface ChecklistCategoryMeta {
  id: ChecklistCategoryId;
  name: string;
  description: string;
  iconName: string;
}

export const CHECKLIST_CATEGORIES: ChecklistCategoryMeta[] = [
  { id: "antes_viagem", name: "Antes de viajar", description: "Planejamento e preparativos", iconName: "CalendarClock" },
  { id: "documentos_dinheiro", name: "Documentos e dinheiro", description: "Documentação e segurança financeira", iconName: "CreditCard" },
  { id: "eletronicos", name: "Eletrônicos e tecnologia", description: "Equipamentos e conectividade", iconName: "Smartphone" },
  { id: "mala_roupas", name: "Mala e roupas", description: "Itens pessoais e vestuário", iconName: "Luggage" },
  { id: "higiene", name: "Higiene e cuidados pessoais", description: "Necessaire", iconName: "Sparkles" },
  { id: "saude", name: "Saúde e medicamentos", description: "Cuidados durante a viagem", iconName: "HeartPulse" },
  { id: "casa", name: "Casa antes de sair", description: "Segurança e organização", iconName: "Home" },
  { id: "dia_viagem", name: "No dia da viagem", description: "Última conferência", iconName: "PlaneTakeoff" },
];

export function normalizeChecklistKind(kind: string): ChecklistCategoryId {
  if (kind === "preparo") return "antes_viagem";
  if (kind === "bagagem") return "mala_roupas";
  if (CHECKLIST_CATEGORIES.some((c) => c.id === kind)) return kind as ChecklistCategoryId;
  return "antes_viagem";
}

/**
 * Modelo base padrão de checklist reutilizável para qualquer viagem.
 */
export const BASE_CHECKLIST_TEMPLATE = {
  id: "checklist_viagem_padrao",
  name: "Checklist básico de viagem",
  description: "Checklist padrão reutilizável para qualquer viagem.",
  version: "1.0",
  categories: [
    {
      id: "antes_viagem" as const,
      name: "Antes de viajar",
      description: "Planejamento e preparativos",
      items: [
        "Conferir documentos necessários para a viagem",
        "Verificar validade dos documentos de identificação",
        "Conferir passagens aéreas ou rodoviárias",
        "Confirmar reservas de hospedagem",
        "Conferir horários de check-in e check-out",
        "Verificar regras de bagagem",
        "Contratar ou conferir seguro-viagem, quando necessário",
        "Consultar previsão do tempo no destino",
        "Pesquisar atrações e passeios",
        "Baixar comprovantes de reservas e passagens",
        "Compartilhar roteiro com familiares",
      ],
    },
    {
      id: "documentos_dinheiro" as const,
      name: "Documentos e dinheiro",
      description: "Documentação e segurança financeira",
      items: [
        "Separar RG, CNH ou passaporte",
        "Conferir vistos e autorizações de entrada",
        "Separar cartões de crédito e débito",
        "Habilitar cartões para uso internacional, se necessário",
        "Separar dinheiro em espécie",
        "Conferir limites dos cartões",
        "Salvar cópias digitais dos documentos",
        "Anotar contatos de emergência",
        "Conferir documentos de todos os viajantes",
      ],
    },
    {
      id: "eletronicos" as const,
      name: "Eletrônicos e tecnologia",
      description: "Equipamentos e conectividade",
      items: [
        "Separar carregadores de celulares",
        "Separar carregadores de outros dispositivos",
        "Levar power bank carregado",
        "Conferir adaptadores de tomada",
        "Baixar mapas offline do destino",
        "Baixar passagens e documentos no celular",
        "Conferir aplicativos de viagem",
        "Verificar plano de internet ou roaming",
        "Separar fones de ouvido",
      ],
    },
    {
      id: "mala_roupas" as const,
      name: "Mala e roupas",
      description: "Itens pessoais e vestuário",
      items: [
        "Separar roupas adequadas ao clima",
        "Separar roupas íntimas e meias",
        "Separar pijamas",
        "Separar calçados adequados",
        "Separar casacos e agasalhos, se necessário",
        "Separar roupas de banho, se necessário",
        "Separar acessórios pessoais",
        "Separar óculos de sol",
        "Conferir peso e dimensões da bagagem",
        "Identificar malas com etiquetas",
      ],
    },
    {
      id: "higiene" as const,
      name: "Higiene e cuidados pessoais",
      description: "Necessaire",
      items: [
        "Escova e creme dental",
        "Shampoo e condicionador",
        "Sabonete",
        "Desodorante",
        "Protetor solar",
        "Hidratante",
        "Perfume",
        "Escova ou pente de cabelo",
        "Produtos de higiene pessoal",
        "Itens de cuidados específicos",
      ],
    },
    {
      id: "saude" as const,
      name: "Saúde e medicamentos",
      description: "Cuidados durante a viagem",
      items: [
        "Separar medicamentos de uso contínuo",
        "Separar receitas médicas, se necessário",
        "Levar medicamentos básicos",
        "Separar itens de primeiros socorros",
        "Conferir vacinas exigidas para o destino",
        "Separar óculos de grau ou lentes de contato",
        "Levar itens de uso pessoal ou ortopédico",
      ],
    },
    {
      id: "casa" as const,
      name: "Casa antes de sair",
      description: "Segurança e organização",
      items: [
        "Conferir portas e janelas",
        "Desligar aparelhos eletrônicos desnecessários",
        "Retirar lixo",
        "Verificar geladeira e alimentos perecíveis",
        "Fechar registros de água e gás, quando apropriado",
        "Desligar luzes",
        "Organizar plantas e cuidados com animais",
        "Deixar cópia da chave com alguém de confiança",
      ],
    },
    {
      id: "dia_viagem" as const,
      name: "No dia da viagem",
      description: "Última conferência",
      items: [
        "Conferir documentos e passagens",
        "Conferir carteira, dinheiro e cartões",
        "Conferir celulares e carregadores",
        "Conferir todas as malas",
        "Conferir transporte até aeroporto ou rodoviária",
        "Fazer check-in, quando disponível",
        "Conferir horário de embarque",
        "Chegar com antecedência ao local de embarque",
      ],
    },
  ],
};

export type ChecklistSeedItem = {
  kind: ChecklistCategoryId;
  title: string;
  owner_name: string | null;
  responsible_type?: "family" | "individual";
  priority?: "low" | "normal" | "high";
  source?: "template" | "ai" | "manual";
  is_optional?: boolean;
};

/**
 * Monta os itens inteligentes de checklist organizados por categorias,
 * combinando o modelo padrão com as sugestões contextuais do tipo de viagem.
 */
export function buildSmartChecklist({
  destination = "",
  title = "",
  category = "ferias",
  previousItems = [],
}: {
  destination?: string | undefined;
  title?: string | undefined;
  category?: string | undefined;
  previousItems?: { kind: string; title: string; owner_name?: string | null | undefined }[] | undefined;
}): ChecklistSeedItem[] {
  const combined = `${destination} ${title}`.toLowerCase();

  // Detecção contextual do tipo de viagem
  const isChile = combined.includes("chile") || combined.includes("santiago");
  const isEua = combined.includes("eua") || combined.includes("estados unidos") || combined.includes("york") || combined.includes("orlando") || combined.includes("miami");
  const isCanada = combined.includes("canada") || combined.includes("canadá") || combined.includes("toronto");
  const isEuropa = combined.includes("europa") || combined.includes("paris") || combined.includes("frança") || combined.includes("londres") || combined.includes("amsterd") || combined.includes("italia") || combined.includes("espanha") || combined.includes("portugal");
  const isInternacional = isChile || isEua || isCanada || isEuropa || combined.includes("argentina") || combined.includes("bolivia") || combined.includes("uruguai") || combined.includes("internacional");

  const isPraia = category === "praia" || combined.includes("praia") || combined.includes("maragogi") || combined.includes("porto seguro") || combined.includes("cabo frio") || combined.includes("floripa") || combined.includes("nordeste") || combined.includes("ilhabela");
  const isFrio = category === "neve" || isChile || combined.includes("farellones") || combined.includes("gramado") || combined.includes("bariloche") || combined.includes("inverno") || combined.includes("neve") || combined.includes("campos do jordão") || combined.includes("monte verde");
  const isCarro = category === "estrada" || combined.includes("carro") || combined.includes("road trip") || combined.includes("estrada");
  const isAviao = isInternacional || (!isCarro && !combined.includes("aparecida") && !combined.includes("americana"));
  const hasChildren = category === "familia" || combined.includes("beto carrero") || combined.includes("disney") || combined.includes("criança") || combined.includes("filho");

  const items: ChecklistSeedItem[] = [];

  const add = (
    kind: ChecklistCategoryId,
    itemTitle: string,
    owner_name: string | null = "Família",
    priority: "low" | "normal" | "high" = "normal"
  ) => {
    const norm = itemTitle.trim().toLowerCase();
    if (!items.some((i) => i.kind === kind && i.title.trim().toLowerCase() === norm)) {
      items.push({
        kind,
        title: itemTitle.trim(),
        owner_name,
        responsible_type: owner_name === "Família" ? "family" : "individual",
        priority,
        source: "template",
        is_optional: false,
      });
    }
  };

  // 1. Inserir itens base de todas as 8 categorias padrão do template
  for (const cat of BASE_CHECKLIST_TEMPLATE.categories) {
    for (const it of cat.items) {
      add(cat.id, it, "Família");
    }
  }

  // 2. Aplicar Sugestões Contextuais (contextual_suggestions do modelo)

  // Condição: travel_type = "international"
  if (isInternacional) {
    add("documentos_dinheiro", "Conferir passaporte válido por no mínimo 6 meses", "Família", "high");
    add("documentos_dinheiro", "Verificar necessidade de visto e permissões de entrada", "Família", "high");
    add("saude", "Verificar exigências de vacinação (febre amarela / covid)", "Família");
    add("documentos_dinheiro", "Providenciar moeda estrangeira (espécie e cartões internacionais)", "maluki", "high");
    add("eletronicos", "Configurar roaming internacional ou chip eSIM", "maluki");
    add("antes_viagem", "Verificar seguro-viagem com apólice internacional", "maluki", "high");

    if (isEua) {
      add("documentos_dinheiro", "Conferir Visto Americano B1/B2 ou autorização ESTA", "Família", "high");
      add("eletronicos", "Adaptador de tomada padrão americano (dois pinos chatos)", "Família");
    }
    if (isCanada) {
      add("documentos_dinheiro", "Conferir Visto Canadense ou autorização eTA", "Família", "high");
      add("eletronicos", "Adaptador de tomada padrão norte-americano", "Família");
    }
    if (isEuropa) {
      add("documentos_dinheiro", "Verificar autorizações ETIAS (Europa) e UK ETA (Reino Unido)", "Família", "high");
      add("antes_viagem", "Seguro-viagem obrigatório Tratado de Schengen (cobertura € 30.000)", "maluki", "high");
      add("eletronicos", "Adaptador de tomada europeu (Tipo C / Tipo G britânico)", "Família");
    }
    if (isChile) {
      add("eletronicos", "Adaptador de tomada tipo C/L compatível com o Chile", "Família");
    }
  }

  // Condição: transport = "airplane"
  if (isAviao) {
    add("dia_viagem", "Realizar check-in online antecipado", "maluki", "high");
    add("antes_viagem", "Conferir franquia e limites de bagagem despachada", "Família");
    add("mala_roupas", "Verificar regras de bagagem de mão e líquidos (< 100ml)", "Família");
    add("dia_viagem", "Conferir portão e horário de embarque no aeroporto", "Família", "high");
  }

  // Condição: transport = "car"
  if (isCarro) {
    add("antes_viagem", "Verificar revisão do veículo (freios, óleo, água e luzes)", "maluki", "high");
    add("antes_viagem", "Conferir pneus e calibragem do estepe", "maluki");
    add("documentos_dinheiro", "Conferir documentação do veículo e CNH válida", "maluki", "high");
    add("dia_viagem", "Verificar combustível e rotas com pedágios", "maluki");
    add("antes_viagem", "Planejar paradas e pontos de descanso durante o percurso", "Família");
  }

  // Condição: destination_type = "beach"
  if (isPraia) {
    add("mala_roupas", "Separar roupas de banho e saídas de praia", "Família");
    add("higiene", "Separar protetor solar com alto fator e hidratante pós-sol", "Família");
    add("mala_roupas", "Separar chinelos e calçados leves", "Família");
    add("mala_roupas", "Separar toalhas de praia ou piscina", "Família");
    add("mala_roupas", "Separar bolsa ou mochila de praia", "Família");
  }

  // Condição: destination_weather = "cold"
  if (isFrio) {
    add("mala_roupas", "Separar roupas térmicas e segunda pele (calça e blusa)", "Família", "high");
    add("mala_roupas", "Separar luvas, gorros e cachecóis", "Família");
    add("mala_roupas", "Separar casacos de frio pesados e corta-vento impermeável", "Família", "high");
    add("mala_roupas", "Separar calçados adequados para frio e caminhada", "Família");
    add("higiene", "Protetor labial hidratante para clima frio e seco", "Família");
  }

  // Condição: has_children = true
  if (hasChildren) {
    add("documentos_dinheiro", "Conferir documentos das crianças (certidão/RG/autorização de viagem)", "Família", "high");
    add("saude", "Separar medicamentos e itens específicos para as crianças", "Família", "high");
    add("eletronicos", "Preparar entretenimento para o trajeto (fones, jogos, tablets)", "Família");
    add("mala_roupas", "Separar mudas de roupas extras na bagagem de mão", "Família");
  }

  // 3. Incorporar itens recorrentes do histórico anterior da família (se houver)
  if (previousItems && previousItems.length > 0) {
    for (const p of previousItems) {
      const normalizedKind = normalizeChecklistKind(p.kind);
      if (!items.some((i) => i.title.trim().toLowerCase() === p.title.trim().toLowerCase())) {
        const isVerySpecific = p.title.includes("Samaipata") || p.title.includes("Farellones") || p.title.includes("Anne Frank") || p.title.includes("Louvre") || p.title.includes("Niagara");
        if (!isVerySpecific) {
          add(normalizedKind, p.title, p.owner_name || "Família");
        }
      }
    }
  }

  return items;
}

/**
 * Cria os itens de checklist diretamente no banco de dados para a viagem especificada,
 * aplicando o modelo de 8 categorias e sugestões contextuais do tipo de viagem.
 */
export async function createDefaultTripChecklist(
  tripId: string,
  familyId: string,
  options: { destination?: string | undefined; title?: string | undefined; category?: string | undefined } = {}
): Promise<{ count: number; items: ChecklistSeedItem[] }> {
  // 1. Verificar itens já existentes nesta viagem específica para não duplicar
  const { data: existingTripItems } = await supabase
    .from("checklist_items")
    .select("title")
    .eq("trip_id", tripId);

  const existingTitles = new Set(
    (existingTripItems || []).map((it) => it.title.trim().toLowerCase())
  );

  // 2. Gerar lista inteligente baseada puramente no template padrão e tipo da viagem
  // (não importa itens específicos ou checagens de outras viagens anteriores)
  const allSuggestedItems = buildSmartChecklist({
    destination: options.destination,
    title: options.title,
    category: options.category,
  });

  // Filtrar apenas itens que ainda não foram inseridos nesta viagem
  const newItems = allSuggestedItems.filter(
    (i) => !existingTitles.has(i.title.trim().toLowerCase())
  );

  if (newItems.length === 0) return { count: 0, items: [] };

  // 3. Inserir no Supabase com status pendente (done: false)
  const rows = newItems.map((i) => ({
    trip_id: tripId,
    family_id: familyId,
    kind: i.kind,
    title: i.title,
    owner_name: i.owner_name,
    responsible_type: i.responsible_type || "family",
    priority: i.priority || "normal",
    source: i.source || "template",
    is_optional: i.is_optional || false,
    done: false,
  }));

  const { error } = await supabase.from("checklist_items").insert(rows);
  if (error) throw error;

  return { count: rows.length, items: newItems };
}
