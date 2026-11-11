import { useEffect, useState } from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Droplets,
  Thermometer,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fetchTripWeather, type TripWeatherForecast, type WeatherDay } from "@/lib/weather";

interface TripWeatherPreviewProps {
  destination?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  className?: string | undefined;
}

function WeatherIcon({
  name,
  className = "w-5 h-5",
}: {
  name: WeatherDay["iconName"];
  className?: string;
}) {
  switch (name) {
    case "Sun":
      return <Sun className={`${className} text-amber-500`} />;
    case "CloudSun":
      return <CloudSun className={`${className} text-amber-500`} />;
    case "Cloud":
      return <Cloud className={`${className} text-slate-400`} />;
    case "CloudFog":
      return <CloudFog className={`${className} text-slate-400`} />;
    case "CloudDrizzle":
      return <CloudDrizzle className={`${className} text-sky-400`} />;
    case "CloudRain":
      return <CloudRain className={`${className} text-blue-500`} />;
    case "Snowflake":
      return <Snowflake className={`${className} text-cyan-400`} />;
    case "CloudLightning":
      return <CloudLightning className={`${className} text-purple-500`} />;
    default:
      return <Sun className={`${className} text-amber-500`} />;
  }
}

function formatDayLabel(dateStr: string): { weekday: string; dayMonth: string } {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y!, m! - 1, d!);
    const weekday = dt.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
    const dayMonth = dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    return { weekday, dayMonth };
  } catch {
    return { weekday: "", dayMonth: dateStr };
  }
}

export function TripWeatherPreview({
  destination,
  startDate,
  endDate,
  className = "",
}: TripWeatherPreviewProps) {
  const [weather, setWeather] = useState<TripWeatherForecast | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmedDest = destination?.trim();
    if (!trimmedDest || !startDate || !endDate) {
      setWeather(null);
      setLoading(false);
      return;
    }

    if (startDate > endDate) {
      setWeather(null);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await fetchTripWeather({
          destination: trimmedDest,
          startDate,
          endDate,
        });
        if (!isCancelled) {
          setWeather(data);
        }
      } catch (err) {
        console.error("Erro ao carregar clima:", err);
        if (!isCancelled) setWeather(null);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }, 450);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [destination, startDate, endDate]);

  // Se o usuário já preencheu as datas mas ainda não colocou destino
  if (startDate && endDate && (!destination || !destination.trim())) {
    return (
      <div className="rounded-lg border border-dashed border-sky-300/60 bg-sky-50/40 p-2.5 text-xs text-sky-800 dark:border-sky-800/50 dark:bg-sky-950/20 dark:text-sky-300 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-sky-500 flex-shrink-0" />
        <span>
          Informe o destino acima para carregar a previsão do tempo para as datas selecionadas.
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-sky-200/80 bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-sky-50/70 p-3 text-xs text-foreground shadow-sm dark:border-sky-900/50 dark:from-sky-950/30 dark:via-background dark:to-sky-950/20 animate-pulse flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-900/60 flex items-center justify-center flex-shrink-0">
          <CloudSun className="w-5 h-5 text-sky-500 animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-sky-900 dark:text-sky-200">
            Consultando previsão do tempo pública...
          </p>
          <p className="text-[11px] text-muted-foreground">
            Buscando dados meteorológicos para {destination} no período
          </p>
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-sky-200/90 bg-gradient-to-br from-sky-50/80 via-blue-50/40 to-amber-50/30 p-3 text-xs text-foreground shadow-sm dark:border-sky-900/60 dark:from-sky-950/40 dark:via-background dark:to-background space-y-2.5 transition-all ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-white/80 dark:bg-sky-900/50 flex items-center justify-center shadow-xs flex-shrink-0 ring-1 ring-sky-200/70 dark:ring-sky-800">
            <WeatherIcon name={weather.summary.mainIcon} className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-xs text-foreground truncate">
                {weather.locationName}
              </span>
              {weather.isForecast ? (
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium py-0 px-1.5 h-4.5 bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                >
                  Previsão ao vivo
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium py-0 px-1.5 h-4.5 bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800"
                >
                  Clima médio histórico
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
              {weather.summary.description}
            </p>
          </div>
        </div>

        {/* Temperature Badge */}
        <div className="flex flex-col items-end flex-shrink-0 text-right">
          <div className="flex items-center gap-1 font-semibold text-xs text-foreground">
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {weather.summary.avgMin}°C – {weather.summary.avgMax}°C
            </span>
          </div>
          {weather.summary.rainProbabilityMax > 0 && (
            <span className="text-[10px] text-sky-600 dark:text-sky-400 flex items-center gap-0.5 mt-0.5 font-medium">
              <Droplets className="w-3 h-3" />
              {weather.summary.rainProbabilityMax}% máx chuva
            </span>
          )}
        </div>
      </div>

      {/* Day by Day Mini Cards */}
      {weather.days.length > 0 && (
        <div className="pt-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5 px-0.5">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              Previsão por dia ({weather.days.length} {weather.days.length === 1 ? "dia" : "dias"}):
            </span>
            <span className="text-[10px] text-muted-foreground/80">
              {weather.days[0]?.date.split("-").reverse().join("/")} até{" "}
              {weather.days[weather.days.length - 1]?.date.split("-").reverse().join("/")}
            </span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {weather.days.map((day) => {
              const { weekday, dayMonth } = formatDayLabel(day.date);
              return (
                <div
                  key={day.date}
                  className="flex-shrink-0 flex flex-col items-center justify-between rounded-lg border border-sky-100 bg-white/70 dark:border-sky-900/50 dark:bg-card/70 p-2 text-center min-w-[68px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
                  title={`${day.condition} • Mín: ${day.minTemp}°C, Máx: ${day.maxTemp}°C`}
                >
                  <span className="text-[10px] font-semibold text-muted-foreground capitalize">
                    {weekday}
                  </span>
                  <span className="text-[9px] text-muted-foreground/80 mb-1">
                    {dayMonth}
                  </span>
                  <div className="my-0.5">
                    <WeatherIcon name={day.iconName} className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] font-semibold mt-1">
                    <span className="text-muted-foreground font-normal">{day.minTemp}°</span>{" "}
                    <span>{day.maxTemp}°</span>
                  </div>
                  {day.rainProbability !== undefined && day.rainProbability > 15 && (
                    <span className="mt-1 text-[9px] font-medium text-sky-600 dark:text-sky-400 flex items-center gap-0.5">
                      <Droplets className="w-2.5 h-2.5" />
                      {day.rainProbability}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
