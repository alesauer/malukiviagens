import { useEffect, useState } from "react";

export type FlagResult = {
  kind: "city_br" | "country" | "city_intl";
  city?: string | undefined;
  state?: string | undefined;
  country: string;
  countryCode: string;
  emoji: string;
  flagUrl: string | null;
  label: string;
  description: string;
  suggestedDestination?: string | undefined;
};

// Converte código ISO 2 (ex: 'BR', 'FR', 'CL') em emoji de bandeira
export function countryCodeToEmoji(code: string): string {
  if (!code || code.length !== 2) return "🌐";
  const upper = code.toUpperCase();
  const first = 127397 + upper.charCodeAt(0);
  const second = 127397 + upper.charCodeAt(1);
  return String.fromCodePoint(first, second);
}

// Retorna URL CDN da bandeira do país
export function getCountryFlagCdnUrl(code: string, width = 80): string {
  if (!code || code.length !== 2) return "";
  return `https://flagcdn.com/w${width}/${code.toLowerCase()}.png`;
}

// ---------------------------------------------------------------------------
// Base Local Rápida: Países Principais (PT-BR)
// ---------------------------------------------------------------------------
export const COUNTRIES_MAP: Record<string, { name: string; code: string }> = {
  brasil: { name: "Brasil", code: "BR" },
  brazil: { name: "Brasil", code: "BR" },
  chile: { name: "Chile", code: "CL" },
  argentina: { name: "Argentina", code: "AR" },
  uruguai: { name: "Uruguai", code: "UY" },
  uruguay: { name: "Uruguai", code: "UY" },
  paraguai: { name: "Paraguai", code: "PY" },
  bolivia: { name: "Bolívia", code: "BO" },
  peru: { name: "Peru", code: "PE" },
  colombia: { name: "Colômbia", code: "CO" },
  equador: { name: "Equador", code: "EC" },
  estadosunidos: { name: "Estados Unidos", code: "US" },
  eua: { name: "Estados Unidos", code: "US" },
  usa: { name: "Estados Unidos", code: "US" },
  canada: { name: "Canadá", code: "CA" },
  mexico: { name: "México", code: "MX" },
  franca: { name: "França", code: "FR" },
  france: { name: "França", code: "FR" },
  italia: { name: "Itália", code: "IT" },
  italy: { name: "Itália", code: "IT" },
  espanha: { name: "Espanha", code: "ES" },
  spain: { name: "Espanha", code: "ES" },
  portugal: { name: "Portugal", code: "PT" },
  inglaterra: { name: "Inglaterra", code: "GB" },
  reinounido: { name: "Reino Unido", code: "GB" },
  uk: { name: "Reino Unido", code: "GB" },
  alemanha: { name: "Alemanha", code: "DE" },
  germany: { name: "Alemanha", code: "DE" },
  holanda: { name: "Holanda", code: "NL" },
  paisesbaixos: { name: "Países Baixos", code: "NL" },
  netherlands: { name: "Holanda", code: "NL" },
  suica: { name: "Suíça", code: "CH" },
  switzerland: { name: "Suíça", code: "CH" },
  austria: { name: "Áustria", code: "AT" },
  grecia: { name: "Grécia", code: "GR" },
  greece: { name: "Grécia", code: "GR" },
  irlanda: { name: "Irlanda", code: "IE" },
  belgica: { name: "Bélgica", code: "BE" },
  japao: { name: "Japão", code: "JP" },
  japan: { name: "Japão", code: "JP" },
  china: { name: "China", code: "CN" },
  australia: { name: "Austrália", code: "AU" },
  novazelandia: { name: "Nova Zelândia", code: "NZ" },
  turquia: { name: "Turquia", code: "TR" },
  turkey: { name: "Turquia", code: "TR" },
  egito: { name: "Egito", code: "EG" },
  emiradosarabes: { name: "Emirados Árabes Unidos", code: "AE" },
  dubai: { name: "Emirados Árabes Unidos", code: "AE" },
  africadosul: { name: "África do Sul", code: "ZA" },
  tailandia: { name: "Tailândia", code: "TH" },
};

// ---------------------------------------------------------------------------
// Base Local Rápida: Cidades Internacionais Populares
// ---------------------------------------------------------------------------
export const INTL_CITIES_MAP: Record<string, { city: string; country: string; code: string }> = {
  paris: { city: "Paris", country: "França", code: "FR" },
  londres: { city: "Londres", country: "Reino Unido", code: "GB" },
  london: { city: "Londres", country: "Reino Unido", code: "GB" },
  novayork: { city: "Nova York", country: "Estados Unidos", code: "US" },
  newyork: { city: "Nova York", country: "Estados Unidos", code: "US" },
  nyc: { city: "Nova York", country: "Estados Unidos", code: "US" },
  santiago: { city: "Santiago", country: "Chile", code: "CL" },
  buenosaires: { city: "Buenos Aires", country: "Argentina", code: "AR" },
  bariloche: { city: "Bariloche", country: "Argentina", code: "AR" },
  mendoza: { city: "Mendoza", country: "Argentina", code: "AR" },
  ushuaia: { city: "Ushuaia", country: "Argentina", code: "AR" },
  montevideu: { city: "Montevidéu", country: "Uruguai", code: "UY" },
  montevideo: { city: "Montevidéu", country: "Uruguai", code: "UY" },
  puntadeleste: { city: "Punta del Este", country: "Uruguai", code: "UY" },
  santacruzdelasierra: { city: "Santa Cruz de la Sierra", country: "Bolívia", code: "BO" },
  santacruz: { city: "Santa Cruz de la Sierra", country: "Bolívia", code: "BO" },
  lapaz: { city: "La Paz", country: "Bolívia", code: "BO" },
  orlando: { city: "Orlando", country: "Estados Unidos", code: "US" },
  miami: { city: "Miami", country: "Estados Unidos", code: "US" },
  losangeles: { city: "Los Angeles", country: "Estados Unidos", code: "US" },
  sanfrancisco: { city: "São Francisco", country: "Estados Unidos", code: "US" },
  lasvegas: { city: "Las Vegas", country: "Estados Unidos", code: "US" },
  chicago: { city: "Chicago", country: "Estados Unidos", code: "US" },
  toronto: { city: "Toronto", country: "Canadá", code: "CA" },
  montreal: { city: "Montreal", country: "Canadá", code: "CA" },
  vancouver: { city: "Vancouver", country: "Canadá", code: "CA" },
  amsterda: { city: "Amsterdã", country: "Holanda", code: "NL" },
  amsterdam: { city: "Amsterdã", country: "Holanda", code: "NL" },
  roma: { city: "Roma", country: "Itália", code: "IT" },
  rome: { city: "Roma", country: "Itália", code: "IT" },
  milao: { city: "Milão", country: "Itália", code: "IT" },
  florenca: { city: "Florença", country: "Itália", code: "IT" },
  veneza: { city: "Veneza", country: "Itália", code: "IT" },
  madri: { city: "Madri", country: "Espanha", code: "ES" },
  madrid: { city: "Madri", country: "Espanha", code: "ES" },
  barcelona: { city: "Barcelona", country: "Espanha", code: "ES" },
  sevilha: { city: "Sevilha", country: "Espanha", code: "ES" },
  lisboa: { city: "Lisboa", country: "Portugal", code: "PT" },
  porto: { city: "Porto", country: "Portugal", code: "PT" },
  berlim: { city: "Berlim", country: "Alemanha", code: "DE" },
  munique: { city: "Munique", country: "Alemanha", code: "DE" },
  zurique: { city: "Zurique", country: "Suíça", code: "CH" },
  genebra: { city: "Genebra", country: "Suíça", code: "CH" },
  viena: { city: "Viena", country: "Áustria", code: "AT" },
  praga: { city: "Praga", country: "República Tcheca", code: "CZ" },
  atenas: { city: "Atenas", country: "Grécia", code: "GR" },
  toquio: { city: "Tóquio", country: "Japão", code: "JP" },
  tokyo: { city: "Tóquio", country: "Japão", code: "JP" },
  kyoto: { city: "Quioto", country: "Japão", code: "JP" },
  cancun: { city: "Cancún", country: "México", code: "MX" },
  cidadedomexico: { city: "Cidade do México", country: "México", code: "MX" },
  cuzco: { city: "Cusco", country: "Peru", code: "PE" },
  cusco: { city: "Cusco", country: "Peru", code: "PE" },
  lima: { city: "Lima", country: "Peru", code: "PE" },
  bogota: { city: "Bogotá", country: "Colômbia", code: "CO" },
  medellin: { city: "Medellín", country: "Colômbia", code: "CO" },
  cartagena: { city: "Cartagena", country: "Colômbia", code: "CO" },
};

// ---------------------------------------------------------------------------
// Base Local Curada: Cidades Brasileiras com Bandeira Oficial Municipal
// (URLs de thumbnail do Wikimedia Commons estáveis ou busca automática)
// ---------------------------------------------------------------------------
export type BrCityEntry = {
  city: string;
  state: string;
  aliases: string[];
  wikiTitle: string; // Título da página ou arquivo no Wikimedia
  flagUrl?: string;
};

export const BR_CITIES: BrCityEntry[] = [
  {
    city: "Florianópolis",
    state: "SC",
    aliases: ["floripa", "florianopolis"],
    wikiTitle: "Bandeira_de_Florianópolis",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Bandeira_de_Florian%C3%B3polis.svg/250px-Bandeira_de_Florian%C3%B3polis.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Belo Horizonte",
    state: "MG",
    aliases: ["bh", "belo horizonte", "beaga"],
    wikiTitle: "Bandeira_de_Belo_Horizonte",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Bandeira-de-Belo-Horizonte.svg/250px-Bandeira-de-Belo-Horizonte.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "São Paulo",
    state: "SP",
    aliases: ["sampa", "sao paulo", "sp"],
    wikiTitle: "Bandeira_da_cidade_de_São_Paulo",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Bandeira_da_cidade_de_S%C3%A3o_Paulo.svg/250px-Bandeira_da_cidade_de_S%C3%A3o_Paulo.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Rio de Janeiro",
    state: "RJ",
    aliases: ["rio", "rio de janeiro", "errejota"],
    wikiTitle: "Bandeira_da_cidade_do_Rio_de_Janeiro",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Bandeira_da_cidade_do_Rio_de_Janeiro.svg/250px-Bandeira_da_cidade_do_Rio_de_Janeiro.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Curitiba",
    state: "PR",
    aliases: ["curitiba"],
    wikiTitle: "Bandeira_de_Curitiba",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9f/Bandeira_de_Curitiba.svg/250px-Bandeira_de_Curitiba.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Gramado",
    state: "RS",
    aliases: ["gramado"],
    wikiTitle: "Gramado",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Bandeira_de_Gramado.jpg/250px-Bandeira_de_Gramado.jpg?utm_source=pt.wikipedia.org&utm_campaign=imageinfo&utm_content=thumbnail"
  },
  {
    city: "Cabo Frio",
    state: "RJ",
    aliases: ["cabo frio"],
    wikiTitle: "Cabo_Frio",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Bandeira_cabo_frio.png/250px-Bandeira_cabo_frio.png?utm_source=pt.wikipedia.org&utm_campaign=imageinfo&utm_content=thumbnail"
  },
  {
    city: "Campos do Jordão",
    state: "SP",
    aliases: ["campos do jordao", "campos do jordão"],
    wikiTitle: "Bandeira_de_Campos_do_Jordão",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Bandeira_de_Campos_do_Jord%C3%A3o.svg/250px-Bandeira_de_Campos_do_Jord%C3%A3o.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Foz do Iguaçu",
    state: "PR",
    aliases: ["foz do iguacu", "foz do iguaçu", "foz"],
    wikiTitle: "Bandeira_de_Foz_do_Iguaçu",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Bandeira_de_Foz_do_Igua%C3%A7u.svg/250px-Bandeira_de_Foz_do_Igua%C3%A7u.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Porto Seguro",
    state: "BA",
    aliases: ["porto seguro"],
    wikiTitle: "Bandeira_de_Porto_Seguro",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Bandeira_de_Porto_Seguro.svg/250px-Bandeira_de_Porto_Seguro.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Balneário Camboriú",
    state: "SC",
    aliases: ["balneario camboriu", "camboriu", "bc"],
    wikiTitle: "Bandeira_de_Balneário_Camboriú",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Bandeira_de_Balne%C3%A1rio_Cambori%C3%BA.svg/250px-Bandeira_de_Balne%C3%A1rio_Cambori%C3%BA.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Americana",
    state: "SP",
    aliases: ["americana"],
    wikiTitle: "Bandeira_de_Americana",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/Bandeira_de_Americana.svg/250px-Bandeira_de_Americana.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Tauá",
    state: "CE",
    aliases: ["taua", "tauá"],
    wikiTitle: "Bandeira_de_Tauá",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Bandeira_de_Tau%C3%A1.svg/250px-Bandeira_de_Tau%C3%A1.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Monte Verde",
    state: "MG",
    aliases: ["monte verde", "camanducaia"],
    wikiTitle: "Bandeira_de_Camanducaia",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Bandeira_de_Camanducaia.svg/250px-Bandeira_de_Camanducaia.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Aparecida",
    state: "SP",
    aliases: ["aparecida", "aparecida do norte"],
    wikiTitle: "Bandeira_de_Aparecida",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/Bandeira_Aparecida_SP.jpg/250px-Bandeira_Aparecida_SP.jpg"
  },
  {
    city: "Paraty",
    state: "RJ",
    aliases: ["paraty", "parati"],
    wikiTitle: "Bandeira_de_Paraty",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Bandeira_de_Paraty.svg/250px-Bandeira_de_Paraty.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Salvador",
    state: "BA",
    aliases: ["salvador", "ssa"],
    wikiTitle: "Bandeira_de_Salvador",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Bandeira_de_Salvador.svg/250px-Bandeira_de_Salvador.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Fortaleza",
    state: "CE",
    aliases: ["fortaleza"],
    wikiTitle: "Bandeira_de_Fortaleza",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Bandeira_de_Fortaleza.svg/250px-Bandeira_de_Fortaleza.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Porto Alegre",
    state: "RS",
    aliases: ["porto alegre", "poa"],
    wikiTitle: "Bandeira_de_Porto_Alegre",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/Bandeira_de_Porto_Alegre.svg/250px-Bandeira_de_Porto_Alegre.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Recife",
    state: "PE",
    aliases: ["recife"],
    wikiTitle: "Bandeira_do_Recife",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Bandeira_do_Recife.svg/250px-Bandeira_do_Recife.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Maceió",
    state: "AL",
    aliases: ["maceio", "maceió"],
    wikiTitle: "Bandeira_de_Maceió",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Bandeira_de_Macei%C3%B3.svg/250px-Bandeira_de_Macei%C3%B3.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Maragogi",
    state: "AL",
    aliases: ["maragogi"],
    wikiTitle: "Maragogi",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Bandeira_de_Maragogi.svg/250px-Bandeira_de_Maragogi.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Londrina",
    state: "PR",
    aliases: ["londrina"],
    wikiTitle: "Bandeira_de_Londrina",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cd/Bandeira_de_Londrina.svg/250px-Bandeira_de_Londrina.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Ouro Preto",
    state: "MG",
    aliases: ["ouro preto"],
    wikiTitle: "Ouro_Preto",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Brasao_ouro_preto.png/250px-Brasao_ouro_preto.png?utm_source=pt.wikipedia.org&utm_campaign=imageinfo&utm_content=thumbnail"
  },
  {
    city: "Búzios",
    state: "RJ",
    aliases: ["buzios", "búzios", "armacao dos buzios"],
    wikiTitle: "Bandeira_de_Armação_dos_Búzios",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/Bandeira_de_Arma%C3%A7%C3%A3o_dos_B%C3%BAzios.svg/250px-Bandeira_de_Arma%C3%A7%C3%A3o_dos_B%C3%BAzios.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Natal",
    state: "RN",
    aliases: ["natal"],
    wikiTitle: "Bandeira_de_Natal",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Bandeira_de_Natal.svg/250px-Bandeira_de_Natal.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Manaus",
    state: "AM",
    aliases: ["manaus"],
    wikiTitle: "Bandeira_de_Manaus",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Bandeira_de_Manaus.svg/250px-Bandeira_de_Manaus.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  },
  {
    city: "Brasília",
    state: "DF",
    aliases: ["brasilia", "brasília", "bsb"],
    wikiTitle: "Bandeira_do_Distrito_Federal_(Brasil)",
    flagUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Bandeira_do_Distrito_Federal_%28Brasil%29.svg/250px-Bandeira_do_Distrito_Federal_%28Brasil%29.svg.png?utm_source=pt.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
  }
];

// Normaliza texto para busca (remove acentos, pontuação, lowercase)
export function normalizeText(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Remove prefixos comuns de títulos de viagem para extrair o local
export function extractLocationKeyword(title: string): string[] {
  const clean = normalizeText(title);
  if (!clean) return [];

  // Remove termos como "ferias em", "viagem para", "ida a", anos (2025, 2026)
  const stripped = clean
    .replace(/\b(ferias|viagem|planejamento|roteiro|passeio|tour|mochilao|fim de ano|ano novo|carnaval|natal|temporada|visita|ida a|ida ao|ida para|para|em|no|na|de|do|da|com a familia|familia|com a|com o|com)\b/gi, " ")
    .replace(/\b(19\d\d|20\d\d)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const candidates: string[] = [];
  if (stripped && stripped !== clean) candidates.push(stripped);
  candidates.push(clean);

  // Também divide por vírgula, barra ou hífen caso haja destinos múltiplos
  const rawParts = title.split(/[,/–-]/).map((p) => normalizeText(p)).filter(Boolean);
  for (const p of rawParts) {
    if (!candidates.includes(p)) candidates.push(p);
  }

  return candidates;
}

// Cache em memória para consultas já realizadas
const flagCache = new Map<string, FlagResult | null>();

/**
 * Busca a bandeira para o texto fornecido.
 * 1. Consulta dicionário de Cidades Brasileiras (com bandeiras municipais reais).
 * 2. Consulta dicionário de Cidades Internacionais e Países.
 * 3. Faz busca dinâmica na Wikipedia PT (para cidades brasileiras não cadastradas).
 * 4. Faz busca dinâmica no OpenStreetMap Nominatim + FlagCDN (para cidades/países do exterior).
 */
export async function detectLocationFlag(input: string): Promise<FlagResult | null> {
  const norm = normalizeText(input);
  if (!norm || norm.length < 2) return null;

  if (flagCache.has(norm)) {
    return flagCache.get(norm)!;
  }

  const candidates = extractLocationKeyword(input);

  // 1. Verificar Cidades Brasileiras no Catálogo
  for (const c of candidates) {
    const compact = c.replace(/\s+/g, "");
    const match = BR_CITIES.find(
      (item) =>
        normalizeText(item.city) === c ||
        item.aliases.some((a) => normalizeText(a) === c || normalizeText(a) === compact) ||
        c.includes(normalizeText(item.city)) ||
        (c.length >= 4 && item.aliases.some((a) => c.includes(normalizeText(a))))
    );

    if (match) {
      const res: FlagResult = {
        kind: "city_br",
        city: match.city,
        state: match.state,
        country: "Brasil",
        countryCode: "BR",
        emoji: "🇧🇷",
        flagUrl: match.flagUrl ?? getCountryFlagCdnUrl("BR"),
        label: `${match.city}, ${match.state}`,
        description: `Cidade brasileira (Bandeira de ${match.city})`,
        suggestedDestination: `${match.city}, ${match.state}`,
      };
      flagCache.set(norm, res);
      return res;
    }
  }

  // 2. Verificar Cidades Internacionais no Catálogo
  for (const c of candidates) {
    const compact = c.replace(/\s+/g, "");
    const item = INTL_CITIES_MAP[compact] || INTL_CITIES_MAP[c];
    if (item) {
      const emoji = countryCodeToEmoji(item.code);
      const res: FlagResult = {
        kind: "city_intl",
        city: item.city,
        country: item.country,
        countryCode: item.code,
        emoji,
        flagUrl: getCountryFlagCdnUrl(item.code),
        label: `${item.city}, ${item.country}`,
        description: `${item.country} ${emoji}`,
        suggestedDestination: `${item.city}, ${item.country}`,
      };
      flagCache.set(norm, res);
      return res;
    }
  }

  // 3. Verificar Países no Catálogo
  for (const c of candidates) {
    const compact = c.replace(/\s+/g, "");
    const item = COUNTRIES_MAP[compact] || COUNTRIES_MAP[c];
    if (item) {
      const emoji = countryCodeToEmoji(item.code);
      const res: FlagResult = {
        kind: "country",
        country: item.name,
        countryCode: item.code,
        emoji,
        flagUrl: getCountryFlagCdnUrl(item.code),
        label: item.name,
        description: `País (${emoji})`,
        suggestedDestination: item.name,
      };
      flagCache.set(norm, res);
      return res;
    }
  }

  // 4. Busca Dinâmica: Wikipedia PT e OpenStreetMap Nominatim
  const primaryTerm = candidates[0] || input;

  try {
    // 4.1 Testar Wikipedia PT para ver se existe bandeira municipal
    const wikiTitle = `Bandeira_de_${encodeURIComponent(primaryTerm)}`;
    const wikiRes = await fetch(
      `https://pt.wikipedia.org/w/api.php?action=query&titles=${wikiTitle}&prop=pageimages&format=json&pithumbsize=200&origin=*`,
      { headers: { Accept: "application/json" } }
    );
    if (wikiRes.ok) {
      const data = await wikiRes.json();
      const pages = data?.query?.pages || {};
      for (const [id, page] of Object.entries(pages as Record<string, { thumbnail?: { source: string }; title?: string }>)) {
        if (id !== "-1" && page?.thumbnail?.source) {
          const res: FlagResult = {
            kind: "city_br",
            city: primaryTerm,
            country: "Brasil",
            countryCode: "BR",
            emoji: "🇧🇷",
            flagUrl: page.thumbnail.source,
            label: primaryTerm,
            description: `Bandeira municipal de ${primaryTerm}`,
            suggestedDestination: `${primaryTerm}, Brasil`,
          };
          flagCache.set(norm, res);
          return res;
        }
      }
    }
  } catch {
    // Ignore Wikipedia network errors
  }

  // 4.2 Testar OpenStreetMap Nominatim para geocodificação internacional ou nacional
  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(primaryTerm)}&format=json&addressdetails=1&limit=1`,
      { headers: { Accept: "application/json" } }
    );
    if (nomRes.ok) {
      const data = (await nomRes.json()) as Array<{
        name?: string;
        address?: {
          country_code?: string;
          country?: string;
          city?: string;
          town?: string;
          municipality?: string;
          state?: string;
        };
      }>;
      const item = data[0];
      if (item && item.address) {
        const cc = (item.address.country_code || "").toUpperCase();
        const country = item.address.country || "";
        const city = item.address.city || item.address.town || item.address.municipality || item.name || primaryTerm;
        const state = item.address.state || "";

        if (cc === "BR") {
          // Cidade Brasileira encontrada via OpenStreetMap: buscar imagem do artigo da cidade na Wikipedia
          let cityFlagUrl: string | null = null;
          try {
            const cityWikiRes = await fetch(
              `https://pt.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(city)}&prop=images&format=json&origin=*`
            );
            if (cityWikiRes.ok) {
              const cityWiki = await cityWikiRes.json();
              const p = Object.values(cityWiki?.query?.pages || {})[0] as { images?: { title: string }[] };
              const flagFile = (p?.images || []).find((img) => img.title.includes("Bandeira") || img.title.includes("Brasao"));
              if (flagFile) {
                const infoRes = await fetch(
                  `https://pt.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(flagFile.title)}&prop=imageinfo&iiprop=url&iiurlwidth=200&format=json&origin=*`
                );
                if (infoRes.ok) {
                  const infoData = await infoRes.json();
                  const infoP = Object.values(infoData?.query?.pages || {})[0] as { imageinfo?: { thumburl?: string }[] };
                  cityFlagUrl = infoP?.imageinfo?.[0]?.thumburl || null;
                }
              }
            }
          } catch {
            // Ignore city image errors
          }

          const res: FlagResult = {
            kind: "city_br",
            city,
            state,
            country: "Brasil",
            countryCode: "BR",
            emoji: "🇧🇷",
            flagUrl: cityFlagUrl || getCountryFlagCdnUrl("BR"),
            label: state ? `${city}, ${state}` : city,
            description: `Cidade brasileira (Bandeira de ${city})`,
            suggestedDestination: state ? `${city}, ${state}` : `${city}, Brasil`,
          };
          flagCache.set(norm, res);
          return res;
        } else if (cc && cc.length === 2) {
          // Destino Internacional
          const emoji = countryCodeToEmoji(cc);
          const res: FlagResult = {
            kind: city && city !== country ? "city_intl" : "country",
            city: city !== country ? city : undefined,
            country,
            countryCode: cc,
            emoji,
            flagUrl: getCountryFlagCdnUrl(cc),
            label: city && city !== country ? `${city}, ${country}` : country,
            description: `${country} ${emoji}`,
            suggestedDestination: city && city !== country ? `${city}, ${country}` : country,
          };
          flagCache.set(norm, res);
          return res;
        }
      }
    }
  } catch {
    // Ignore Nominatim network errors
  }

  flagCache.set(norm, null);
  return null;
}

/**
 * Hook para detectar a bandeira conforme o usuário digita no input.
 */
export function useFlagDetector(title: string, destination?: string) {
  const [flag, setFlag] = useState<FlagResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = (title || "").trim() || (destination || "").trim();
    if (!query || query.length < 2) {
      setFlag(null);
      setLoading(false);
      return;
    }

    // Consulta rápida síncrona se já estiver em cache
    const norm = normalizeText(query);
    if (flagCache.has(norm)) {
      setFlag(flagCache.get(norm) ?? null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const found = await detectLocationFlag(query);
        if (isMounted) {
          setFlag(found);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setFlag(null);
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [title, destination]);

  return { flag, loading };
}
