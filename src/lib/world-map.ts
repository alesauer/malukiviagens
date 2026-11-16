import {
  BR_CITIES,
  COUNTRIES_MAP,
  INTL_CITIES_MAP,
  countryCodeToEmoji,
  getCountryFlagCdnUrl,
  normalizeText,
} from "@/lib/flags";
import { tripPhase } from "@/lib/format";

export type TripSummary = {
  id: string;
  title: string;
  main_destination: string | null;
  start_date: string;
  end_date: string;
  status: string;
  category: string;
  cover_path: string | null;
};

export type CountryMeta = {
  code: string;
  numericId: string;
  name: string;
  continent: string;
};

export type CountryVisitStatus = "visited" | "planned";

export type WorldCountryEntry = CountryMeta & {
  emoji: string;
  flagUrl: string;
  status: CountryVisitStatus;
  cities: string[];
  trips: TripSummary[];
};

export type WorldCityEntry = {
  key: string;
  name: string;
  countryCode: string;
  countryName: string;
  emoji: string;
  coords: [number, number] | null; // [lng, lat]
  status: CountryVisitStatus;
  trips: TripSummary[];
};

export type WorldMapStats = {
  visitedCountriesCount: number;
  plannedOnlyCountriesCount: number;
  displayedCountriesCount: number;
  citiesCount: number;
  continentsCount: number;
  continents: string[];
  worldPercent: number;
};

export const COUNTRY_META_LIST: CountryMeta[] = [
  { code: "BR", numericId: "076", name: "Brasil", continent: "América do Sul" },
  { code: "AR", numericId: "032", name: "Argentina", continent: "América do Sul" },
  { code: "CL", numericId: "152", name: "Chile", continent: "América do Sul" },
  { code: "UY", numericId: "858", name: "Uruguai", continent: "América do Sul" },
  { code: "PY", numericId: "600", name: "Paraguai", continent: "América do Sul" },
  { code: "BO", numericId: "068", name: "Bolívia", continent: "América do Sul" },
  { code: "PE", numericId: "604", name: "Peru", continent: "América do Sul" },
  { code: "CO", numericId: "170", name: "Colômbia", continent: "América do Sul" },
  { code: "EC", numericId: "218", name: "Equador", continent: "América do Sul" },
  { code: "US", numericId: "840", name: "Estados Unidos", continent: "América do Norte" },
  { code: "CA", numericId: "124", name: "Canadá", continent: "América do Norte" },
  { code: "MX", numericId: "484", name: "México", continent: "América do Norte" },
  { code: "FR", numericId: "250", name: "França", continent: "Europa" },
  { code: "GB", numericId: "826", name: "Reino Unido", continent: "Europa" },
  { code: "NL", numericId: "528", name: "Holanda", continent: "Europa" },
  { code: "IT", numericId: "380", name: "Itália", continent: "Europa" },
  { code: "ES", numericId: "724", name: "Espanha", continent: "Europa" },
  { code: "PT", numericId: "620", name: "Portugal", continent: "Europa" },
  { code: "DE", numericId: "276", name: "Alemanha", continent: "Europa" },
  { code: "CH", numericId: "756", name: "Suíça", continent: "Europa" },
  { code: "AT", numericId: "040", name: "Áustria", continent: "Europa" },
  { code: "GR", numericId: "300", name: "Grécia", continent: "Europa" },
  { code: "IE", numericId: "372", name: "Irlanda", continent: "Europa" },
  { code: "BE", numericId: "056", name: "Bélgica", continent: "Europa" },
  { code: "CZ", numericId: "203", name: "República Tcheca", continent: "Europa" },
  { code: "TR", numericId: "792", name: "Turquia", continent: "Ásia" },
  { code: "JP", numericId: "392", name: "Japão", continent: "Ásia" },
  { code: "CN", numericId: "156", name: "China", continent: "Ásia" },
  { code: "AE", numericId: "784", name: "Emirados Árabes", continent: "Ásia" },
  { code: "AU", numericId: "036", name: "Austrália", continent: "Oceania" },
  { code: "NZ", numericId: "554", name: "Nova Zelândia", continent: "Oceania" },
  { code: "EG", numericId: "818", name: "Egito", continent: "África" },
  { code: "ZA", numericId: "710", name: "África do Sul", continent: "África" },
  { code: "MA", numericId: "504", name: "Marrocos", continent: "África" },
];

export const COUNTRY_BY_CODE = new Map(COUNTRY_META_LIST.map((c) => [c.code, c]));
export const COUNTRY_BY_NUMERIC = new Map(COUNTRY_META_LIST.map((c) => [c.numericId, c]));

// Cidades brasileiras extras e destinos turísticos comuns não listados em BR_CITIES
const EXTRA_BR_CITIES: Record<string, string> = {
  americana: "Americana",
  aparecida: "Aparecida",
  balneariocamboriu: "Balneário Camboriú",
  bcamboriu: "Balneário Camboriú",
  betocarrero: "Penha (Beto Carrero)",
  cabofrio: "Cabo Frio",
  camposdojordao: "Campos do Jordão",
  canela: "Canela",
  espiritosanto: "Espírito Santo",
  fozdoiguacu: "Foz do Iguaçu",
  gramado: "Gramado",
  londrina: "Londrina",
  maceio: "Maceió",
  maragogi: "Maragogi",
  monteverde: "Monte Verde",
  paraty: "Paraty",
  portoseguro: "Porto Seguro",
  taua: "Tauá (Caeté)",
};

// Destinos internacionais por apelido (ex: Disney -> Orlando / US)
const EXTRA_INTL_ALIASES: Record<string, { city: string; code: string }> = {
  disney: { city: "Orlando", code: "US" },
};

// Coordenadas [lng, lat] para plotar pins de cidades no mapa 2D
const CITY_COORDS: Record<string, [number, number]> = {
  gramado: [-50.8764, -29.3746],
  canela: [-50.8119, -29.3619],
  portoalegre: [-51.2177, -30.0346],
  curitiba: [-49.2733, -25.4284],
  florianopolis: [-48.5482, -27.5954],
  balneariocamboriu: [-48.6348, -26.9906],
  penhabetocarrero: [-48.6431, -26.7717],
  saopaulo: [-46.6333, -23.5505],
  americana: [-47.3314, -22.7392],
  aparecida: [-45.2297, -22.8469],
  camposdojordao: [-45.5914, -22.7395],
  riodejaneiro: [-43.1729, -22.9068],
  cabofrio: [-42.0278, -22.8794],
  paraty: [-44.7131, -23.2178],
  belohorizonte: [-43.9378, -19.9208],
  tauacaete: [-43.6697, -19.88],
  monteverde: [-46.0383, -22.8628],
  espiritosanto: [-40.3128, -20.3155],
  vitoria: [-40.3128, -20.3155],
  portoseguro: [-39.0647, -16.4497],
  salvador: [-38.5014, -12.9714],
  maceio: [-35.7353, -9.6658],
  maragogi: [-35.2225, -9.0122],
  recife: [-34.877, -8.0476],
  fortaleza: [-38.5434, -3.7172],
  fozdoiguacu: [-54.5854, -25.5163],
  londrina: [-51.1694, -23.3045],
  brasilia: [-47.8825, -15.7942],
  manaus: [-60.0217, -3.119],
  santiago: [-70.6693, -33.4489],
  buenosaires: [-58.3816, -34.6037],
  bariloche: [-71.3103, -41.1335],
  mendoza: [-68.8458, -32.8895],
  montevideu: [-56.1645, -34.9011],
  santacruzdelasierra: [-63.1812, -17.7833],
  lapaz: [-68.1193, -16.4897],
  lima: [-77.0428, -12.0464],
  cusco: [-71.9675, -13.5319],
  bogota: [-74.0721, 4.711],
  orlando: [-81.3792, 28.5383],
  miami: [-80.1918, 25.7617],
  novayork: [-74.006, 40.7128],
  toronto: [-79.3832, 43.6532],
  montreal: [-73.5673, 45.5017],
  vancouver: [-123.1207, 49.2827],
  losangeles: [-118.2437, 34.0522],
  lasvegas: [-115.1398, 36.1699],
  cancun: [-86.8515, 21.1619],
  cidadedomexico: [-99.1332, 19.4326],
  paris: [2.3522, 48.8566],
  londres: [-0.1276, 51.5072],
  amsterda: [4.9041, 52.3676],
  lisboa: [-9.1393, 38.7223],
  porto: [-8.6291, 41.1579],
  madri: [-3.7038, 40.4168],
  barcelona: [2.1734, 41.3851],
  roma: [12.4964, 41.9028],
  milao: [9.19, 45.4642],
  veneza: [12.3155, 45.4408],
  berlim: [13.405, 52.52],
  zurique: [8.5417, 47.3769],
  viena: [16.3738, 48.2082],
  atenas: [23.7275, 37.9838],
  toquio: [139.6917, 35.6895],
};

const compact = (str: string) => normalizeText(str).replace(/\s+/g, "");

// Base combinada de cidades brasileiras de flags.ts + extras
const BR_CITY_LOOKUP = new Map<string, string>();
for (const entry of BR_CITIES) {
  BR_CITY_LOOKUP.set(compact(entry.city), entry.city);
}
for (const [k, label] of Object.entries(EXTRA_BR_CITIES)) {
  if (!BR_CITY_LOOKUP.has(k)) BR_CITY_LOOKUP.set(k, label);
}

function splitLocationSegments(raw: string): string[] {
  // Remove emojis/símbolos e divide por separadores comuns (ex: "França, Inglaterra e Holanda")
  const cleaned = raw.replace(/[\u{1F300}-\u{1FAFF}]/gu, " ");
  return cleaned
    .split(/[,/;:—–-]+|\s+e\s+/i)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2);
}

export function extractLocationsFromTrip(trip: Pick<TripSummary, "title" | "main_destination">): {
  countries: CountryMeta[];
  cities: Array<{ name: string; countryCode: string; coords: [number, number] | null }>;
} {
  const combined = [trip.title, trip.main_destination].filter(Boolean).join(" , ");
  const segments = splitLocationSegments(combined);

  const countriesMap = new Map<string, CountryMeta>();
  const citiesMap = new Map<string, { name: string; countryCode: string; coords: [number, number] | null }>();

  const addCountry = (code: string, fallbackName?: string) => {
    const meta = COUNTRY_BY_CODE.get(code) ?? {
      code,
      numericId: "",
      name: fallbackName || code,
      continent: "Outros",
    };
    countriesMap.set(code, meta);
  };

  const addCity = (name: string, countryCode: string) => {
    const key = `${countryCode}:${compact(name)}`;
    if (citiesMap.has(key)) return;
    const coords = CITY_COORDS[compact(name)] ?? null;
    citiesMap.set(key, { name, countryCode, coords });
  };

  for (const seg of segments) {
    const norm = compact(seg);
    if (!norm) continue;

    // 1. Correspondência exata de país
    const countryHit = COUNTRIES_MAP[norm];
    if (countryHit) {
      addCountry(countryHit.code, countryHit.name);
      continue;
    }

    // 2. Correspondência de cidade internacional
    const intlHit = INTL_CITIES_MAP[norm];
    if (intlHit) {
      addCountry(intlHit.code, intlHit.country);
      addCity(intlHit.city, intlHit.code);
      continue;
    }

    // 3. Apelidos internacionais (ex: Disney -> Orlando/US)
    const aliasHit = EXTRA_INTL_ALIASES[norm];
    if (aliasHit) {
      addCountry(aliasHit.code);
      addCity(aliasHit.city, aliasHit.code);
      continue;
    }

    // 4. Correspondência de cidade brasileira
    const brCity = BR_CITY_LOOKUP.get(norm);
    if (brCity) {
      addCountry("BR", "Brasil");
      addCity(brCity, "BR");
      continue;
    }

    // 5. Fallback por substring para títulos descritivos (ex: "São Paulo — Fev/24")
    for (const [key, entry] of Object.entries(COUNTRIES_MAP)) {
      if (key.length >= 4 && norm.includes(key)) {
        addCountry(entry.code, entry.name);
      }
    }
    for (const [key, entry] of Object.entries(INTL_CITIES_MAP)) {
      if (key.length >= 4 && norm.includes(key)) {
        addCountry(entry.code, entry.country);
        addCity(entry.city, entry.code);
      }
    }
    for (const [key, label] of BR_CITY_LOOKUP.entries()) {
      if (key.length >= 4 && norm.includes(key)) {
        addCountry("BR", "Brasil");
        addCity(label, "BR");
      }
    }
  }

  return {
    countries: Array.from(countriesMap.values()),
    cities: Array.from(citiesMap.values()),
  };
}

export function classifyTripStatus(trip: Pick<TripSummary, "start_date" | "end_date" | "status">): CountryVisitStatus {
  if (trip.status === "realizada" || trip.status === "concluida") return "visited";
  const phase = tripPhase(trip.start_date, trip.end_date);
  return phase === "futura" ? "planned" : "visited";
}

export function buildWorldMapData(
  trips: TripSummary[],
  options: { includePlanned?: boolean } = {}
): {
  countries: WorldCountryEntry[];
  countriesByNumericId: Map<string, WorldCountryEntry>;
  cities: WorldCityEntry[];
  stats: WorldMapStats;
} {
  const includePlanned = options.includePlanned ?? true;

  const countryAcc = new Map<
    string,
    {
      meta: CountryMeta;
      status: CountryVisitStatus;
      cities: Set<string>;
      trips: Map<string, TripSummary>;
    }
  >();

  const cityAcc = new Map<
    string,
    {
      name: string;
      countryCode: string;
      countryName: string;
      coords: [number, number] | null;
      status: CountryVisitStatus;
      trips: Map<string, TripSummary>;
    }
  >();

  for (const trip of trips) {
    const tripStatus = classifyTripStatus(trip);
    if (!includePlanned && tripStatus === "planned") continue;

    const { countries, cities } = extractLocationsFromTrip(trip);

    for (const c of countries) {
      const existing = countryAcc.get(c.code);
      if (!existing) {
        countryAcc.set(c.code, {
          meta: c,
          status: tripStatus,
          cities: new Set(),
          trips: new Map([[trip.id, trip]]),
        });
      } else {
        if (tripStatus === "visited") existing.status = "visited";
        existing.trips.set(trip.id, trip);
      }
    }

    for (const city of cities) {
      const cEntry = countryAcc.get(city.countryCode);
      if (cEntry) cEntry.cities.add(city.name);

      const cKey = `${city.countryCode}:${compact(city.name)}`;
      const cMeta = COUNTRY_BY_CODE.get(city.countryCode);
      const existingCity = cityAcc.get(cKey);
      if (!existingCity) {
        cityAcc.set(cKey, {
          name: city.name,
          countryCode: city.countryCode,
          countryName: cMeta?.name ?? city.countryCode,
          coords: city.coords,
          status: tripStatus,
          trips: new Map([[trip.id, trip]]),
        });
      } else {
        if (tripStatus === "visited") existingCity.status = "visited";
        existingCity.trips.set(trip.id, trip);
      }
    }
  }

  const countries: WorldCountryEntry[] = Array.from(countryAcc.values())
    .map((item) => ({
      ...item.meta,
      emoji: countryCodeToEmoji(item.meta.code),
      flagUrl: getCountryFlagCdnUrl(item.meta.code, 80),
      status: item.status,
      cities: Array.from(item.cities).sort((a, b) => a.localeCompare(b, "pt-BR")),
      trips: Array.from(item.trips.values()).sort((a, b) => b.start_date.localeCompare(a.start_date)),
    }))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "visited" ? -1 : 1;
      return b.trips.length - a.trips.length || a.name.localeCompare(b.name, "pt-BR");
    });

  const countriesByNumericId = new Map<string, WorldCountryEntry>();
  for (const c of countries) {
    if (c.numericId) countriesByNumericId.set(c.numericId, c);
  }

  const cities: WorldCityEntry[] = Array.from(cityAcc.entries())
    .map(([key, item]) => ({
      key,
      name: item.name,
      countryCode: item.countryCode,
      countryName: item.countryName,
      emoji: countryCodeToEmoji(item.countryCode),
      coords: item.coords,
      status: item.status,
      trips: Array.from(item.trips.values()).sort((a, b) => b.start_date.localeCompare(a.start_date)),
    }))
    .sort((a, b) => b.trips.length - a.trips.length || a.name.localeCompare(b.name, "pt-BR"));

  const visitedCountriesCount = countries.filter((c) => c.status === "visited").length;
  const plannedOnlyCountriesCount = countries.filter((c) => c.status === "planned").length;
  const continents = Array.from(new Set(countries.map((c) => c.continent).filter((c) => c !== "Outros")));

  return {
    countries,
    countriesByNumericId,
    cities,
    stats: {
      visitedCountriesCount,
      plannedOnlyCountriesCount,
      displayedCountriesCount: countries.length,
      citiesCount: cities.length,
      continentsCount: continents.length,
      continents,
      worldPercent: Math.round((countries.length / 195) * 1000) / 10,
    },
  };
}
