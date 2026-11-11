export type SuggestionCategory =
  | "imperdivel"
  | "passeio"
  | "gastronomia"
  | "cultura"
  | "natureza"
  | "criancas";

export interface ItinerarySuggestion {
  id: string;
  title: string;
  category: SuggestionCategory;
  categoryLabel: string;
  location?: string;
  time?: string;
  estimated_cost?: number;
  notes?: string;
  suggestedDayOffset: number; // 0 = Dia 1, 1 = Dia 2, etc.
}

export const SUGGESTION_CATEGORY_LABELS: Record<SuggestionCategory, string> = {
  imperdivel: "Imperdível",
  passeio: "Passeio",
  gastronomia: "Gastronomia",
  cultura: "Cultura & História",
  natureza: "Natureza & Ar Livre",
  criancas: "Com Crianças",
};

/**
 * Retorna sugestões ricas de atividades com base no destino e perfil da viagem.
 */
export function getCuratedItinerarySuggestions(
  destination: string = "",
  title: string = "",
  category: string = "ferias",
  totalDays: number = 5
): ItinerarySuggestion[] {
  const norm = `${destination} ${title}`.toLowerCase();
  const safeDays = Math.max(1, totalDays);

  const wrap = (
    list: Array<{
      id: string;
      title: string;
      category: SuggestionCategory;
      location?: string;
      time?: string;
      estimated_cost?: number;
      notes?: string;
      dayOffset?: number;
    }>
  ): ItinerarySuggestion[] =>
    list.map((item, idx) => ({
      ...item,
      categoryLabel: SUGGESTION_CATEGORY_LABELS[item.category] || "Passeio",
      suggestedDayOffset: (item.dayOffset ?? idx) % safeDays,
    }));

  // 1. Gramado / Canela / Serra Gaúcha
  if (norm.includes("gramado") || norm.includes("canela") || norm.includes("serra gaúcha") || norm.includes("serra gaucha")) {
    return wrap([
      {
        id: "gra-1",
        title: "Passeio pelo Lago Negro e Pedalinho",
        category: "natureza",
        location: "Rua A. J. Renner, Gramado - RS",
        time: "09:30",
        estimated_cost: 30,
        notes: "Caminhada relaxante ao redor do lago emoldurado por pinheiros da Floresta Negra alemã e pedalinho cisne.",
        dayOffset: 0,
      },
      {
        id: "gra-2",
        title: "Visita ao Mini Mundo",
        category: "criancas",
        location: "Rua Horácio Cardoso, 291 - Gramado",
        time: "14:00",
        estimated_cost: 85,
        notes: "Parque ao ar livre com réplicas fiéis de castelos, cidades e trens em miniatura.",
        dayOffset: 0,
      },
      {
        id: "gra-3",
        title: "Jantar Tradicional: Sequência de Fondue",
        category: "gastronomia",
        location: "Av. das Hortênsias, Gramado",
        time: "19:30",
        estimated_cost: 140,
        notes: "Queijo colonial, carnes na pedra e chocolate de Gramado com frutas frescas.",
        dayOffset: 0,
      },
      {
        id: "gra-4",
        title: "Snowland: Parque de Neve Indoor",
        category: "imperdivel",
        location: "RS-235, 9009 - Carazal, Gramado",
        time: "10:00",
        estimated_cost: 220,
        notes: "Patinação no gelo, descida de boia na montanha de neve e roupas térmicas inclusas.",
        dayOffset: 1,
      },
      {
        id: "gra-5",
        title: "Rua Coberta e Palácio dos Festivais",
        category: "passeio",
        location: "Centro de Gramado",
        time: "17:00",
        estimated_cost: 0,
        notes: "Passeio a pé pelo centro florido, cafés aconchegantes e compras de chocolates.",
        dayOffset: 1,
      },
      {
        id: "gra-6",
        title: "Bondinhos Aéreos e Cascata do Caracol (Canela)",
        category: "natureza",
        location: "Estrada do Caracol, Canela - RS",
        time: "09:30",
        estimated_cost: 90,
        notes: "Vista panorâmica espetacular da cascata de 131 metros a bordo dos bondinhos.",
        dayOffset: 2,
      },
      {
        id: "gra-7",
        title: "Catedral de Pedra de Canela e Show de Luzes",
        category: "cultura",
        location: "Praça da Matriz, Canela",
        time: "18:30",
        estimated_cost: 0,
        notes: "Belíssima arquitetura gótica inglesa e espetáculo de luzes sincronizadas à noite.",
        dayOffset: 2,
      },
      {
        id: "gra-8",
        title: "Tour Vale dos Vinhedos e Maria Fumaça",
        category: "cultura",
        location: "Bento Gonçalves / Garibaldi",
        time: "08:30",
        estimated_cost: 280,
        notes: "Passeio histórico de trem a vapor com degustação de queijos e vinhos gaúchos.",
        dayOffset: 3,
      },
      {
        id: "gra-9",
        title: "Visita a uma Fábrica de Chocolate Artesanal",
        category: "gastronomia",
        location: "Prawer ou Florybal - Gramado",
        time: "16:00",
        estimated_cost: 40,
        notes: "Aprender como o cacau vira o clássico chocolate de Gramado com direito a degustação.",
        dayOffset: 3,
      },
    ]);
  }

  // 2. Santiago / Chile / Cordilheira dos Andes
  if (norm.includes("chile") || norm.includes("santiago") || norm.includes("farellones") || norm.includes("valle nevado")) {
    return wrap([
      {
        id: "chi-1",
        title: "Subida ao Sky Costanera (Mirante 300m)",
        category: "imperdivel",
        location: "Costanera Center, Providencia, Santiago",
        time: "17:00",
        estimated_cost: 110,
        notes: "Vista 360° deslumbrante de toda Santiago e da Cordilheira dos Andes durante o pôr do sol.",
        dayOffset: 0,
      },
      {
        id: "chi-2",
        title: "Cerro San Cristóbal, Funicular e Teleférico",
        category: "natureza",
        location: "Parque Metropolitano de Santiago",
        time: "10:00",
        estimated_cost: 45,
        notes: "Passeio no funicular histórico, visita à Virgem no topo e descida panorâmica de teleférico.",
        dayOffset: 0,
      },
      {
        id: "chi-3",
        title: "Bate e Volta: Cordilheira dos Andes (Farellones e Valle Nevado)",
        category: "natureza",
        location: "Cordilheira dos Andes, Chile",
        time: "07:30",
        estimated_cost: 250,
        notes: "Subida pelas famosas curvas da cordilheira, tirolesa, teleférico de montanha e neve.",
        dayOffset: 1,
      },
      {
        id: "chi-4",
        title: "Visita e Degustação na Vinícola Concha y Toro",
        category: "cultura",
        location: "Pirque, Região Metropolitana de Santiago",
        time: "10:30",
        estimated_cost: 160,
        notes: "Tour pelos jardins centenários, parreirais e a lendária adega do Casillero del Diablo.",
        dayOffset: 2,
      },
      {
        id: "chi-5",
        title: "Centro Histórico: Palácio de La Moneda e Plaza de Armas",
        category: "cultura",
        location: "Santiago Centro",
        time: "14:30",
        estimated_cost: 0,
        notes: "Troca da guarda presidencial, Catedral Metropolitana e arquitetura neoclássica.",
        dayOffset: 2,
      },
      {
        id: "chi-6",
        title: "Safari com Leões no Parque Safari Rancagua",
        category: "criancas",
        location: "Rancagua, Chile",
        time: "09:00",
        estimated_cost: 180,
        notes: "Passeio em caminhão gradeado onde os grandes felinos sobem no teto do veículo.",
        dayOffset: 3,
      },
      {
        id: "chi-7",
        title: "Jantar no Bairro Bellavista e Pátio Bellavista",
        category: "gastronomia",
        location: "Constitución 30-70, Providencia",
        time: "20:00",
        estimated_cost: 130,
        notes: "Complexo gastronômico animado com opções de carnes, salmão chileno e empanadas.",
        dayOffset: 3,
      },
    ]);
  }

  // 3. Europa (França, Inglaterra, Holanda, etc.)
  if (norm.includes("europa") || norm.includes("paris") || norm.includes("londres") || norm.includes("amsterd") || norm.includes("frança") || norm.includes("inglaterra")) {
    return wrap([
      {
        id: "eur-1",
        title: "Torre Eiffel e Cruzeiro pelo Rio Sena",
        category: "imperdivel",
        location: "Champ de Mars, 5 Av. Anatole France - Paris",
        time: "10:00",
        estimated_cost: 210,
        notes: "Subida de elevador ao topo da Dama de Ferro e passeio relaxante de barco pelos monumentos.",
        dayOffset: 0,
      },
      {
        id: "eur-2",
        title: "Museu do Louvre e Jardim das Tulherias",
        category: "cultura",
        location: "Rue de Rivoli - Paris",
        time: "14:30",
        estimated_cost: 120,
        notes: "O maior museu de arte do mundo: Mona Lisa, Vênus de Milo e a imponente pirâmide de vidro.",
        dayOffset: 0,
      },
      {
        id: "eur-3",
        title: "London Eye e Big Ben / Palácio de Westminster",
        category: "imperdivel",
        location: "Riverside Building, County Hall - Londres",
        time: "10:30",
        estimated_cost: 230,
        notes: "Giro na famosa roda-gigante panorâmica com visão completa do Tâmisa e do Big Ben.",
        dayOffset: 1,
      },
      {
        id: "eur-4",
        title: "British Museum e Caminhada em Covent Garden",
        category: "cultura",
        location: "Great Russell St - Londres",
        time: "14:00",
        estimated_cost: 0,
        notes: "Museu gratuito com a Pedra de Roseta e múmias egípcias, seguido por feirinha e artistas de rua.",
        dayOffset: 1,
      },
      {
        id: "eur-5",
        title: "Cruzeiro pelos Canais de Amsterdã",
        category: "natureza",
        location: "Prins Hendrikkade - Amsterdã",
        time: "10:00",
        estimated_cost: 110,
        notes: "Navegação pelos canais históricos tombados pela UNESCO apreciando as casas flutuantes.",
        dayOffset: 2,
      },
      {
        id: "eur-6",
        title: "Casa de Anne Frank e Bairro Jordaan",
        category: "cultura",
        location: "Westermarkt 20 - Amsterdã",
        time: "15:00",
        estimated_cost: 95,
        notes: "Visita emocionante ao esconderijo secreto da Segunda Guerra (ingressos antecipados).",
        dayOffset: 2,
      },
    ]);
  }

  // 4. Orlando / Flórida / Disney
  if (norm.includes("orlando") || norm.includes("disney") || norm.includes("magic kingdom") || norm.includes("universal")) {
    return wrap([
      {
        id: "orl-1",
        title: "Dia Mágico no Magic Kingdom",
        category: "imperdivel",
        location: "Walt Disney World Resort, Orlando",
        time: "08:30",
        estimated_cost: 750,
        notes: "Space Mountain, Piratas do Caribe, Castelo da Cinderela e o show de fogos Happily Ever After.",
        dayOffset: 0,
      },
      {
        id: "orl-2",
        title: "Universal Studios & Beco Diagonal do Harry Potter",
        category: "imperdivel",
        location: "Universal Orlando Resort",
        time: "09:00",
        estimated_cost: 720,
        notes: "A magia de Gringotes, Expresso de Hogwarts, simulador dos Simpsons e montanhas-russas.",
        dayOffset: 1,
      },
      {
        id: "orl-3",
        title: "Epcot: Volta ao Mundo e Cosmic Rewind",
        category: "cultura",
        location: "Epcot, Walt Disney World",
        time: "10:00",
        estimated_cost: 720,
        notes: "A montanha-russa dos Guardiões da Galáxia e pavilhões gastronômicos de 11 países.",
        dayOffset: 2,
      },
      {
        id: "orl-4",
        title: "Compras no Orlando Vineland Premium Outlets",
        category: "passeio",
        location: "8200 Vineland Ave, Orlando",
        time: "14:00",
        estimated_cost: 0,
        notes: "Mais de 160 lojas de marcas com descontos especiais.",
        dayOffset: 3,
      },
      {
        id: "orl-5",
        title: "Tarde e Jantar no Disney Springs",
        category: "gastronomia",
        location: "Lake Buena Vista, Orlando",
        time: "18:00",
        estimated_cost: 150,
        notes: "Ambiente animado à beira do lago, maior loja Disney do mundo e ótimos restaurantes.",
        dayOffset: 3,
      },
    ]);
  }

  // 5. Nova York / Toronto
  if (norm.includes("nova york") || norm.includes("new york") || norm.includes("toronto") || norm.includes("niagara")) {
    return wrap([
      {
        id: "nyc-1",
        title: "Caminhada pelo Central Park e Strawberry Fields",
        category: "natureza",
        location: "Central Park, Manhattan, NY",
        time: "09:30",
        estimated_cost: 0,
        notes: "Passeio pelo pulmão verde de Nova York, homenagem a John Lennon e Ponte Bow Bridge.",
        dayOffset: 0,
      },
      {
        id: "nyc-2",
        title: "Subida ao Mirante Summit One Vanderbilt",
        category: "imperdivel",
        location: "45 E 42nd St, New York, NY",
        time: "16:30",
        estimated_cost: 250,
        notes: "Experiência imersiva de espelhos e vista de tirar o fôlego do Empire State e Manhattan ao pôr do sol.",
        dayOffset: 0,
      },
      {
        id: "nyc-3",
        title: "Travessia a pé da Ponte do Brooklyn até DUMBO",
        category: "passeio",
        location: "Brooklyn Bridge, New York",
        time: "10:00",
        estimated_cost: 0,
        notes: "Cenário clássico de cinema com vista do skyline de Manhattan e pausa para pizza no DUMBO.",
        dayOffset: 1,
      },
      {
        id: "nyc-4",
        title: "Luzes da Times Square e Musical da Broadway",
        category: "cultura",
        location: "Broadway & 7th Ave, New York",
        time: "19:00",
        estimated_cost: 450,
        notes: "A energia vibrante dos telões de LED iluminados e a magia de um espetáculo na Broadway.",
        dayOffset: 1,
      },
      {
        id: "nyc-5",
        title: "Bate e Volta: Cataratas do Niágara (Toronto)",
        category: "natureza",
        location: "Niagara Falls, Ontário, Canadá",
        time: "08:00",
        estimated_cost: 190,
        notes: "A força monumental das quedas d'água e o passeio de barco Hornblower.",
        dayOffset: 2,
      },
    ]);
  }

  // 6. Rio de Janeiro
  if (norm.includes("rio de janeiro") || norm.includes("copacabana") || norm.includes("barra da tijuca")) {
    return wrap([
      {
        id: "rio-1",
        title: "Cristo Redentor pelo Trem do Corcovado",
        category: "imperdivel",
        location: "Parque Nacional da Tijuca, Rio de Janeiro",
        time: "09:00",
        estimated_cost: 120,
        notes: "Subida ecológica pelo trem através da Mata Atlântica até a Maravilha do Mundo Moderno.",
        dayOffset: 0,
      },
      {
        id: "rio-2",
        title: "Bondinho do Pão de Açúcar ao Entardecer",
        category: "natureza",
        location: "Praia Vermelha, Urca - Rio de Janeiro",
        time: "16:30",
        estimated_cost: 150,
        notes: "Passeio icônico pelos dois teleféricos com visão de 360° da Baía de Guanabara.",
        dayOffset: 0,
      },
      {
        id: "rio-3",
        title: "Caminhada e Água de Coco na Orla de Copacabana e Ipanema",
        category: "passeio",
        location: "Av. Atlântica / Av. Vieira Souto",
        time: "08:30",
        estimated_cost: 20,
        notes: "Calçadão famoso, brisa do mar e parada no Posto 9 para banho de mar.",
        dayOffset: 1,
      },
      {
        id: "rio-4",
        title: "Jardim Botânico e Parque Lage",
        category: "cultura",
        location: "Rua Jardim Botânico, 1008",
        time: "14:00",
        estimated_cost: 40,
        notes: "Alamedas de palmeiras imperiais centenárias e café histórico com vista para o Corcovado.",
        dayOffset: 1,
      },
      {
        id: "rio-5",
        title: "Museu do Amanhã e Boulevard Olímpico",
        category: "cultura",
        location: "Praça Mauá, 1 - Centro",
        time: "10:30",
        estimated_cost: 30,
        notes: "Arquitetura futurista de Santiago Calatrava e o mural Etnias de Eduardo Kobra.",
        dayOffset: 2,
      },
      {
        id: "rio-6",
        title: "Pôr do Sol Mágico na Pedra do Arpoador",
        category: "natureza",
        location: "Arpoador, Ipanema",
        time: "17:30",
        estimated_cost: 0,
        notes: "Tradição carioca de aplaudir o sol se pondo por trás do Morro Dois Irmãos.",
        dayOffset: 2,
      },
    ]);
  }

  // 7. Foz do Iguaçu
  if (norm.includes("foz") || norm.includes("iguaçu") || norm.includes("iguacu")) {
    return wrap([
      {
        id: "foz-1",
        title: "Parque Nacional do Iguaçu (Cataratas do Iguaçu)",
        category: "imperdivel",
        location: "BR-469, Km 18 - Foz do Iguaçu",
        time: "09:00",
        estimated_cost: 95,
        notes: "Trilha das Cataratas até a passarela da Garganta do Diabo com banho de névoa.",
        dayOffset: 0,
      },
      {
        id: "foz-2",
        title: "Macuco Safari: Barco embaixo das Cataratas",
        category: "natureza",
        location: "Dentro do Parque Nacional do Iguaçu",
        time: "14:00",
        estimated_cost: 380,
        notes: "Trilha na selva em carro elétrico seguida de navegação radical de bote até o coração das quedas.",
        dayOffset: 0,
      },
      {
        id: "foz-3",
        title: "Parque das Aves (Viveiros de Imersão)",
        category: "criancas",
        location: "Ao lado do Parque Nacional, Foz",
        time: "10:00",
        estimated_cost: 80,
        notes: "Contato próximo com araras, tucanos e flamingos em viveiros gigantes na Mata Atlântica.",
        dayOffset: 1,
      },
      {
        id: "foz-4",
        title: "Usina Hidrelétrica de Itaipu e Iluminação Noturna",
        category: "cultura",
        location: "Av. Tancredo Neves, 6702",
        time: "15:00",
        estimated_cost: 65,
        notes: "Tour panorâmico na maior geradora de energia limpa do planeta.",
        dayOffset: 1,
      },
      {
        id: "foz-5",
        title: "Marco das Três Fronteiras e Show Cultural",
        category: "gastronomia",
        location: "Foz do Iguaçu - PR",
        time: "18:00",
        estimated_cost: 50,
        notes: "Encontro dos rios Iguaçu e Paraná unindo Brasil, Argentina e Paraguai.",
        dayOffset: 2,
      },
    ]);
  }

  // 8. Praias / Litoral (Maragogi, Porto Seguro, Florianópolis, Cabo Frio, etc.)
  if (
    category === "praia" ||
    norm.includes("praia") ||
    norm.includes("maragogi") ||
    norm.includes("porto seguro") ||
    norm.includes("cabo frio") ||
    norm.includes("florianópolis") ||
    norm.includes("floripa") ||
    norm.includes("maceió") ||
    norm.includes("litoral")
  ) {
    return wrap([
      {
        id: "pra-1",
        title: "Passeio de Catamarã às Piscinas Naturais (Galés)",
        category: "imperdivel",
        location: "Praia de Maragogi / Orla Central",
        time: "08:30",
        estimated_cost: 130,
        notes: "Navegação na maré baixa para mergulho com peixes coloridos em águas cristalinas.",
        dayOffset: 0,
      },
      {
        id: "pra-2",
        title: "Passeio de Buggy pelas Praias Paradisíacas",
        category: "passeio",
        location: "Litoral Norte e Sul",
        time: "13:30",
        estimated_cost: 250,
        notes: "Passeio pelas areias, mirantes, coqueirais e paradas em praias desertas para fotos.",
        dayOffset: 0,
      },
      {
        id: "pra-3",
        title: "Dia de Relaxamento à Beira-Mar com Barraca Estruturada",
        category: "natureza",
        location: "Melhores quiosques da orla",
        time: "10:00",
        estimated_cost: 80,
        notes: "Água de coco fresca, petiscos locais e banho de mar tranquilo com a família.",
        dayOffset: 1,
      },
      {
        id: "pra-4",
        title: "Jantar de Frutos do Mar e Culinária Regional",
        category: "gastronomia",
        location: "Restaurantes recomendados da vila",
        time: "19:30",
        estimated_cost: 120,
        notes: "Peixada fresca, moqueca com camarão ou lagosta grelhada.",
        dayOffset: 1,
      },
      {
        id: "pra-5",
        title: "Caminhada ao Pôr do Sol e Feirinha de Artesanato",
        category: "cultura",
        location: "Calçadão / Centro Histórico",
        time: "17:30",
        estimated_cost: 30,
        notes: "Lembrancinhas, doces típicos, arte local e o espetáculo do pôr do sol à beira da praia.",
        dayOffset: 2,
      },
    ]);
  }

  // 9. Beto Carrero / Santa Catarina
  if (norm.includes("beto carrero") || norm.includes("penha") || norm.includes("camboriú") || norm.includes("camboriu")) {
    return wrap([
      {
        id: "bet-1",
        title: "Dia de Diversão no Beto Carrero World",
        category: "imperdivel",
        location: "Rua Inácio Francisco de Souza, 1597 - Penha, SC",
        time: "09:00",
        estimated_cost: 160,
        notes: "FireWhip, Hot Wheels Epic Show, montanha-russa Star Mountain e zoológico.",
        dayOffset: 0,
      },
      {
        id: "bet-2",
        title: "Área Temática Madagascar e Show das Feras",
        category: "criancas",
        location: "Beto Carrero World",
        time: "14:00",
        estimated_cost: 0,
        notes: "Crazy River Adventure e espetáculo musical ao vivo com os personagens da DreamWorks.",
        dayOffset: 0,
      },
      {
        id: "bet-3",
        title: "Passeio de Teleférico no Parque Unipraias",
        category: "natureza",
        location: "Barra Sul, Balneário Camboriú",
        time: "10:00",
        estimated_cost: 75,
        notes: "Subida até o topo do Morro da Aguada e descida até a encantadora Praia de Laranjeiras.",
        dayOffset: 1,
      },
      {
        id: "bet-4",
        title: "Roda Gigante FG Big Wheel ao Pôr do Sol",
        category: "passeio",
        location: "Pontal Norte, Balneário Camboriú",
        time: "17:30",
        estimated_cost: 60,
        notes: "Cabines climatizadas a 82 metros de altura com vista para os imponentes arranha-céus.",
        dayOffset: 1,
      },
    ]);
  }

  // 10. Sugestões Universais / Destino Geral
  return wrap([
    {
      id: "gen-1",
      title: "City Tour pelos Pontos Históricos e Centro da Cidade",
      category: "imperdivel",
      location: `Centro Histórico de ${destination || "Destino"}`,
      time: "09:30",
      estimated_cost: 0,
      notes: "Conhecer a pé as praças principais, igrejas históricas e monumentos marcantes.",
      dayOffset: 0,
    },
    {
      id: "gen-2",
      title: "Almoço com Culinária Típica da Região",
      category: "gastronomia",
      location: "Restaurante tradicional local",
      time: "12:30",
      estimated_cost: 80,
      notes: "Degustar os pratos e sabores característicos mais elogiados pelos viajantes.",
      dayOffset: 0,
    },
    {
      id: "gen-3",
      title: "Visita ao Principal Museu ou Centro Cultural",
      category: "cultura",
      location: "Museu Municipal / Palácio Cultural",
      time: "15:00",
      estimated_cost: 25,
      notes: "Mergulho na história, arte e tradições locais.",
      dayOffset: 0,
    },
    {
      id: "gen-4",
      title: "Passeio ao Ar Livre no Parque Municipal ou Mirante",
      category: "natureza",
      location: "Parque da Cidade / Mirante Panorâmico",
      time: "10:00",
      estimated_cost: 0,
      notes: "Caminhada arborizada, contato com a natureza e fotos panorâmicas do destino.",
      dayOffset: 1,
    },
    {
      id: "gen-5",
      title: "Tarde de Compras e Feirinha de Artesanato Local",
      category: "passeio",
      location: "Mercado Central / Rua de Comércio",
      time: "15:30",
      estimated_cost: 50,
      notes: "Descobrir produtos artesanais, lembrancinhas e produtos coloniais da região.",
      dayOffset: 1,
    },
    {
      id: "gen-6",
      title: "Jantar Especial com Música ao Vivo ou Vista Panorâmica",
      category: "gastronomia",
      location: "Restaurante de destaque da cidade",
      time: "20:00",
      estimated_cost: 120,
      notes: "Celebração em família para fechar a noite com ambiente acolhedor e boa comida.",
      dayOffset: 1,
    },
  ]);
}
