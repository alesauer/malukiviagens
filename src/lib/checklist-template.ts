import { supabase } from "@/integrations/supabase/client";

export type ChecklistSeedItem = {
  kind: "preparo" | "bagagem";
  title: string;
  owner_name: string | null;
};

/**
 * Monta os itens inteligentes de checklist (preparativos e malas)
 * combinando o histórico das outras viagens da família com regras
 * automáticas baseadas no destino (nacional vs internacional, clima e país).
 */
export function buildSmartChecklist({
  destination = "",
  title = "",
  previousItems = [],
}: {
  destination?: string | undefined;
  title?: string | undefined;
  category?: string | undefined;
  previousItems?: { kind: string; title: string; owner_name?: string | null | undefined }[] | undefined;
}): ChecklistSeedItem[] {
  const combined = `${destination} ${title}`.toLowerCase();
  const isChile = combined.includes("chile") || combined.includes("santiago");
  const isEua = combined.includes("eua") || combined.includes("estados unidos") || combined.includes("york") || combined.includes("orlando") || combined.includes("miami");
  const isCanada = combined.includes("canada") || combined.includes("canadá") || combined.includes("toronto");
  const isEuropa = combined.includes("europa") || combined.includes("paris") || combined.includes("frança") || combined.includes("londres") || combined.includes("amsterd") || combined.includes("italia") || combined.includes("espanha") || combined.includes("portugal");
  const isInternacional = isChile || isEua || isCanada || isEuropa || combined.includes("argentina") || combined.includes("bolivia") || combined.includes("uruguai") || combined.includes("internacional");
  const isNeveOuFrio = isChile || combined.includes("farellones") || combined.includes("gramado") || combined.includes("bariloche") || combined.includes("inverno") || combined.includes("neve");
  const isPraiaOuCalor = combined.includes("praia") || combined.includes("maragogi") || combined.includes("porto seguro") || combined.includes("cabo frio") || combined.includes("floripa") || combined.includes("nordeste");

  const items: ChecklistSeedItem[] = [];

  // Helper para adicionar sem duplicar por título
  const add = (kind: "preparo" | "bagagem", itemTitle: string, owner_name: string | null = "Família") => {
    const norm = itemTitle.trim().toLowerCase();
    if (!items.some((i) => i.kind === kind && i.title.trim().toLowerCase() === norm)) {
      items.push({ kind, title: itemTitle.trim(), owner_name });
    }
  };

  // 1. Itens Essenciais de Preparativos (Baseados nas viagens cadastradas)
  if (isInternacional) {
    add("preparo", "Passaportes válidos por no mínimo 6 meses após o retorno", "Família");
    add("preparo", "Seguro Viagem Internacional contratado com apólice salva offline", "maluki");
    add("preparo", "Habilitar cartões para uso no exterior e carregar conta global (Nomad/Wise)", "maluki");
    add("preparo", "Configurar celulares e relógios com carteiras digitais (Apple Pay / Google Pay)", "maluki");
    add("preparo", "Ativar chips eSIM de internet internacional com cobertura no destino", "maluki");
    add("preparo", `Baixar mapas offline de ${destination || "todo o destino"} no Google Maps`, "maluki");
    add("preparo", "Salvar passagens aéreas e comprovantes de hospedagem offline no celular", "maluki");
    add("preparo", "Levar moeda em espécie (dólares/euros ou moeda local) para emergências", "maluki");

    if (isEua) {
      add("preparo", "Visto Americano B1/B2 ou ESTA válido para entrada nos EUA", "Família");
    }
    if (isCanada) {
      add("preparo", "Visto Canadense / eTA (Autorização Eletrônica de Viagem)", "Família");
    }
    if (isEuropa) {
      add("preparo", "Verificar requisitos de entrada: ETIAS (União Europeia) e UK ETA (Reino Unido)", "Família");
      add("preparo", "Seguro Viagem Europa com cobertura médica mínima de € 30.000 (Tratado de Schengen)", "maluki");
    }
  } else {
    add("preparo", "Documentos com foto de todos os viajantes (RG atualizado ou CNH)", "Família");
    add("preparo", "Salvar passagens, bilhetes ou confirmações de hospedagem offline no celular", "maluki");
    add("preparo", "Habilitar limites e cartões para gastos de viagem", "maluki");
    add("preparo", "Configurar carteiras digitais (Apple Pay / Google Pay)", "maluki");
    add("preparo", `Baixar mapas offline de ${destination || "região da viagem"} no Google Maps`, "maluki");
    add("preparo", "Planejar roteiro e ingressos com horários marcados antecipadamente", "maluki");
  }

  // 2. Itens Essenciais de Bagagem / Malas (Baseados nas viagens cadastradas)
  add("bagagem", "Mala de mão dentro do limite permitido pelas companhias (< 10 kg)", "Família");
  add("bagagem", "Cadeados padrão TSA e etiquetas de identificação com telefone nas bagagens", "Família");
  add("bagagem", "Power bank (carregador portátil >= 10.000 mAh na bagagem de mão)", "maluki");
  add("bagagem", "Farmacinha básica (analgésicos, antitérmicos, antialérgicos, remédio para enjoo e curativos)", "Família");
  add("bagagem", isInternacional ? "Medicamentos de uso contínuo com receitas médicas em inglês" : "Medicamentos de uso contínuo com receitas médicas", "Família");

  // Adaptadores de tomada específicos por região
  if (isEua || isCanada) {
    add("bagagem", "Adaptador de tomada padrão americano (dois pinos chatos)", "Família");
  } else if (isChile) {
    add("bagagem", "Adaptador de tomada tipo C/L compatível com o Chile", "Família");
  } else if (isEuropa) {
    add("bagagem", "Adaptador universal de tomadas (Tipo C para Europa e Tipo G para Reino Unido)", "Família");
  } else {
    add("bagagem", "Carregadores de celular e adaptadores padrão brasileiro (3 pinos)", "Família");
  }

  // Roupas e calçados pelo clima
  if (isNeveOuFrio) {
    add("bagagem", "Casacos corta-vento impermeáveis e roupas térmicas / segunda pele (calça e blusa)", "Família");
    add("bagagem", "Luvas térmicas, gorros, cachecóis e protetor de orelha", "Família");
    add("bagagem", "Botas impermeáveis ou calçados confortáveis com solado aderente", "Família");
    add("bagagem", "Protetor solar e protetor labial hidratante para o clima frio/seco", "Família");
    add("bagagem", "Óculos escuros (essencial para reflexo do sol)", "Família");
  } else if (isPraiaOuCalor) {
    add("bagagem", "Roupas de banho para áreas de lazer, piscina ou praia", "Família");
    add("bagagem", "Protetor solar corporal e labial com alto fator de proteção", "Família");
    add("bagagem", "Repelente de insetos e hidratante pós-sol", "Família");
    add("bagagem", "Óculos escuros, bonés ou viseiras", "Família");
    add("bagagem", "Chinelos e sapatos leves", "Família");
  } else {
    add("bagagem", "Casacos leves ou corta-vento e sapatos confortáveis para caminhadas", "Família");
    add("bagagem", "Óculos escuros e protetor solar", "Família");
  }

  // 3. Incorporar itens recorrentes do histórico anterior da família (se houver)
  if (previousItems && previousItems.length > 0) {
    for (const p of previousItems) {
      const k = p.kind === "bagagem" ? "bagagem" : "preparo";
      // Adiciona itens frequentes que ainda não estejam na lista
      if (!items.some((i) => i.title.trim().toLowerCase() === p.title.trim().toLowerCase())) {
        // Se for um item genérico recorrente (ex: não específico de outra cidade fechada)
        const isVerySpecific = p.title.includes("Samaipata") || p.title.includes("Farellones") || p.title.includes("Anne Frank") || p.title.includes("Louvre") || p.title.includes("Niagara");
        if (!isVerySpecific) {
          add(k, p.title, p.owner_name || (k === "bagagem" ? "Família" : "maluki"));
        }
      }
    }
  }

  return items;
}

/**
 * Cria os itens de checklist diretamente no banco de dados para a viagem especificada.
 */
export async function createDefaultTripChecklist(
  tripId: string,
  familyId: string,
  options: { destination?: string | undefined; title?: string | undefined; category?: string | undefined } = {}
): Promise<{ count: number; items: ChecklistSeedItem[] }> {
  // 1. Buscar itens existentes em outras viagens da família para enriquecer o modelo
  const { data: history } = await supabase
    .from("checklist_items")
    .select("kind, title, owner_name")
    .eq("family_id", familyId)
    .limit(100);

  // 2. Gerar lista inteligente
  const items = buildSmartChecklist({
    destination: options.destination,
    title: options.title,
    category: options.category,
    previousItems: history || [],
  });

  if (items.length === 0) return { count: 0, items: [] };

  // 3. Inserir no Supabase para a viagem
  const rows = items.map((i) => ({
    trip_id: tripId,
    family_id: familyId,
    kind: i.kind,
    title: i.title,
    owner_name: i.owner_name,
    done: false,
  }));

  const { error } = await supabase.from("checklist_items").insert(rows);
  if (error) throw error;

  return { count: rows.length, items };
}
