import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Compass, Globe2, MapPin, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "@/lib/family";
import { useTripCover } from "@/lib/album-cover";
import { daysUntil, fmtDate, tripLength, tripPhase } from "@/lib/format";
import { TripFlagTitle } from "@/components/trip/LocationFlagBadge";
import {
  buildWorldMapData,
  type TripSummary,
  type WorldCountryEntry,
} from "@/lib/world-map";
import { WorldMap2D } from "@/components/world/WorldMap2D";
import { CountryTripsModal } from "@/components/world/CountryTripsModal";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/meu-mundo")({
  head: () => ({
    meta: [
      { title: "Meu Mundo — Maluki Viagens" },
      { property: "og:title", content: "Meu Mundo — Maluki Viagens" },
      { name: "description", content: "Mapa-múndi interativo dos países e cidades visitados pela família." },
    ],
  }),
  component: MeuMundoPage,
});

function MeuMundoPage() {
  const { data: family } = useFamily();
  const [includePlanned, setIncludePlanned] = useState(true);
  const [showCityPins, setShowCityPins] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<WorldCountryEntry | null>(null);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ["trips"],
    enabled: !!family,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("id, title, main_destination, start_date, end_date, status, category, cover_path")
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data as TripSummary[];
    },
  });

  const world = useMemo(
    () => buildWorldMapData(trips, { includePlanned }),
    [trips, includePlanned]
  );

  const { lastTrip, nextTrip } = useMemo(() => {
    const ongoing = trips.find((t) => tripPhase(t.start_date, t.end_date) === "em_andamento");
    const futures = trips
      .filter((t) => tripPhase(t.start_date, t.end_date) === "futura")
      .sort((a, b) => a.start_date.localeCompare(b.start_date));
    const pasts = trips
      .filter((t) => tripPhase(t.start_date, t.end_date) === "passada")
      .sort((a, b) => b.end_date.localeCompare(a.end_date) || b.start_date.localeCompare(a.start_date));
    return {
      nextTrip: ongoing ?? futures[0] ?? null,
      lastTrip: pasts[0] ?? null,
    };
  }, [trips]);

  const query = search.trim().toLowerCase();
  const filteredCountries = useMemo(() => {
    if (!query) return world.countries;
    return world.countries.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.continent.toLowerCase().includes(query) ||
        c.cities.some((city) => city.toLowerCase().includes(query))
    );
  }, [world.countries, query]);

  const filteredCities = useMemo(() => {
    if (!query) return world.cities;
    return world.cities.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.countryName.toLowerCase().includes(query)
    );
  }, [world.cities, query]);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent flex items-center gap-1.5">
            <Globe2 className="size-3.5" /> Atlas da Família
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Meu Mundo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Países e cidades coloridos automaticamente a partir das viagens cadastradas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/70 bg-card px-4 py-2.5 shadow-soft">
          <div className="flex items-center gap-2">
            <Switch
              id="include-planned"
              checked={includePlanned}
              onCheckedChange={setIncludePlanned}
            />
            <Label htmlFor="include-planned" className="text-xs sm:text-sm cursor-pointer">
              Incluir viagens futuras
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="show-city-pins"
              checked={showCityPins}
              onCheckedChange={setShowCityPins}
            />
            <Label htmlFor="show-city-pins" className="text-xs sm:text-sm cursor-pointer">
              Pins de cidades
            </Label>
          </div>
        </div>
      </div>

      {/* Última viagem e/ou Próxima viagem */}
      {!isLoading && (lastTrip || nextTrip) && (
        <div className={lastTrip && nextTrip ? "grid gap-4 md:grid-cols-2" : "grid gap-4"}>
          {nextTrip && <TripHighlightCard trip={nextTrip} kind="next" />}
          {lastTrip && <TripHighlightCard trip={lastTrip} kind="last" />}
        </div>
      )}

      {/* KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label="Países"
            value={String(world.stats.displayedCountriesCount)}
            hint={
              includePlanned && world.stats.plannedOnlyCountriesCount > 0
                ? `${world.stats.visitedCountriesCount} visitados · ${world.stats.plannedOnlyCountriesCount} planejados`
                : "países conquistados"
            }
          />
          <KpiCard
            label="Cidades"
            value={String(world.stats.citiesCount)}
            hint="destinos mapeados"
          />
          <KpiCard
            label="Continentes"
            value={`${world.stats.continentsCount} / 6`}
            hint={world.stats.continents.join(", ") || "nenhum ainda"}
          />
          <KpiCard
            label="% do Mundo"
            value={`${world.stats.worldPercent}%`}
            hint="de 195 países"
          />
        </div>
      )}

      {/* Mapa-Múndi 2D Interativo */}
      <section className="rounded-3xl border border-border/70 bg-card p-3 sm:p-5 shadow-soft space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <span className="size-3 rounded-full bg-emerald-500 inline-block" />
              Visitado
            </span>
            {includePlanned && (
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <span className="size-3 rounded-full bg-amber-400 inline-block" />
                Planejado (futuro)
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-slate-200 dark:bg-slate-800 border border-border inline-block" />
              Não visitado
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Passe o mouse ou clique em um país colorido para ver as viagens
          </p>
        </div>

        <WorldMap2D
          countriesByNumericId={world.countriesByNumericId}
          cities={world.cities}
          selectedCountryCode={selectedCountry?.code ?? null}
          onSelectCountry={setSelectedCountry}
          showCityPins={showCityPins}
        />
      </section>

      {/* Lista de Países e Cidades */}
      {trips.length === 0 && !isLoading ? (
        <div className="rounded-3xl border border-dashed bg-card p-10 text-center space-y-3">
          <Compass className="mx-auto size-10 text-accent" />
          <h2 className="text-xl font-semibold">Nenhuma viagem cadastrada ainda</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Cadastre sua primeira viagem para ver seus países e cidades ganharem cor automaticamente no mapa!
          </p>
          <Button asChild className="rounded-full">
            <Link to="/viagens">Ir para Viagens</Link>
          </Button>
        </div>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar país ou cidade..."
                className="pl-9 rounded-full"
              />
            </div>
          </div>

          <Tabs defaultValue="countries">
            <TabsList className="rounded-xl">
              <TabsTrigger value="countries" className="rounded-lg gap-1.5">
                <Globe2 className="size-4" />
                Países ({filteredCountries.length})
              </TabsTrigger>
              <TabsTrigger value="cities" className="rounded-lg gap-1.5">
                <MapPin className="size-4" />
                Cidades ({filteredCities.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="countries" className="mt-4">
              {filteredCountries.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Nenhum país encontrado para "{search}".
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => setSelectedCountry(country)}
                      className="text-left rounded-2xl border border-border/70 bg-card p-4 shadow-soft hover:border-primary/50 hover:bg-muted/30 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {country.flagUrl ? (
                            <img
                              src={country.flagUrl}
                              alt={country.name}
                              className="h-5 w-7 rounded-sm object-cover border border-border/50 shrink-0"
                            />
                          ) : (
                            <span className="text-xl">{country.emoji}</span>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-base truncate">{country.name}</p>
                            <p className="text-xs text-muted-foreground">{country.continent}</p>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            country.status === "visited"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px] shrink-0"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[11px] shrink-0"
                          }
                        >
                          {country.trips.length} {country.trips.length === 1 ? "viagem" : "viagens"}
                        </Badge>
                      </div>

                      {country.cities.length > 0 && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {country.cities.join(" · ")}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="cities" className="mt-4">
              {filteredCities.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Nenhuma cidade encontrada para "{search}".
                </p>
              ) : (
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCities.map((city) => {
                    const latestTrip = city.trips[0];
                    return (
                      <Link
                        key={city.key}
                        to="/viagens/$id"
                        params={{ id: latestTrip.id }}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-3.5 shadow-soft hover:border-primary/50 hover:bg-muted/30 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-lg shrink-0">{city.emoji}</span>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{city.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{city.countryName}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="rounded-full text-[11px] shrink-0">
                          {city.trips.length} {city.trips.length === 1 ? "vez" : "vezes"}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      )}

      <CountryTripsModal country={selectedCountry} onClose={() => setSelectedCountry(null)} />
    </div>
  );
}

function TripHighlightCard({ trip, kind }: { trip: TripSummary; kind: "next" | "last" }) {
  const cover = useTripCover(trip.cover_path);
  const phase = tripPhase(trip.start_date, trip.end_date);
  const d = daysUntil(trip.start_date);
  const label =
    kind === "next"
      ? phase === "em_andamento"
        ? "Acontecendo agora"
        : "Próxima viagem"
      : "Última viagem";

  return (
    <Link
      to="/viagens/$id"
      params={{ id: trip.id }}
      style={
        cover
          ? {
              backgroundImage: `linear-gradient(to top, rgb(0 0 0 / 0.8), rgb(0 0 0 / 0.25)), url("${cover}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
      className={
        cover
          ? "group flex flex-col justify-between overflow-hidden rounded-3xl p-5 sm:p-6 text-primary-foreground shadow-lift transition hover:-translate-y-0.5 min-h-[175px]"
          : kind === "next"
            ? "group flex flex-col justify-between overflow-hidden rounded-3xl bg-sunset p-5 sm:p-6 text-primary-foreground shadow-lift transition hover:-translate-y-0.5 min-h-[175px]"
            : "group flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 sm:p-6 text-white shadow-lift transition hover:-translate-y-0.5 min-h-[175px]"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-background/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-xs">
          {label}
        </span>
        {kind === "next" && phase === "futura" && (
          <div className="text-right leading-none">
            <span className="font-display text-2xl sm:text-3xl font-semibold">{d}</span>
            <span className="block text-[11px] opacity-85">
              {d === 1 ? "dia" : "dias"}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-semibold leading-tight break-words">
          <TripFlagTitle title={trip.title} destination={trip.main_destination} />
        </h2>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm opacity-90">
          {trip.main_destination && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5 shrink-0" />
              {trip.main_destination}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5 shrink-0" />
            {fmtDate(trip.start_date, { day: "2-digit", month: "short" })} –{" "}
            {fmtDate(trip.end_date, { day: "2-digit", month: "short", year: "numeric" })} ·{" "}
            {tripLength(trip.start_date, trip.end_date)} dias
          </span>
        </p>
        <p className="pt-1 text-xs font-medium opacity-90 group-hover:underline">
          {kind === "next" ? "Abrir planejamento →" : "Rever memórias e roteiro →"}
        </p>
      </div>
    </Link>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground truncate">{hint}</p>
    </div>
  );
}
