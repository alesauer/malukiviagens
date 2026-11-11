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
  ChevronDown,
  ChevronUp,
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
  className = "w-4 h-4",
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
  const [showDays, setShowDays] = useState(false);

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

  if (loading) {
    return (
      <div className="rounded-lg border border-sky-200/70 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20 px-2.5 py-1.5 text-xs text-sky-800 dark:text-sky-300 flex items-center gap-2 animate-pulse">
        <CloudSun className="w-3.5 h-3.5 text-sky-500 animate-spin flex-shrink-0" />
        <span className="text-[11px] truncate">Consultando previsão do tempo pública...</span>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border border-sky-200/80 bg-gradient-to-r from-sky-50/70 via-blue-50/30 to-amber-50/20 p-2.5 text-xs text-foreground dark:border-sky-900/50 dark:from-sky-950/30 dark:via-background dark:to-background transition-all ${className}`}
    >
      {/* Linha compacta principal (Sem scroll horizontal) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-white dark:bg-sky-900/60 flex items-center justify-center flex-shrink-0 shadow-xs ring-1 ring-sky-200/80 dark:ring-sky-800">
            <WeatherIcon name={weather.summary.mainIcon} className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-xs text-foreground truncate max-w-[150px] sm:max-w-[200px]">
                {weather.locationName}
              </span>
              <Badge
                variant="outline"
                className="text-[9px] font-normal py-0 px-1 h-4 bg-background/80 text-muted-foreground border-sky-200 dark:border-sky-800"
              >
                {weather.isForecast ? "Ao vivo" : "Clima esperado"}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground truncate max-w-[200px] sm:max-w-[280px]">
              {weather.summary.description}
            </p>
          </div>
        </div>

        {/* Temperatura e Ação */}
        <div className="flex flex-col items-end flex-shrink-0 text-right">
          <div className="flex items-center gap-1 font-semibold text-xs text-foreground whitespace-nowrap">
            <Thermometer className="w-3 h-3 text-amber-500" />
            <span>
              {weather.summary.avgMin}°C ~ {weather.summary.avgMax}°C
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            {weather.summary.rainProbabilityMax > 0 && (
              <span className="text-sky-600 dark:text-sky-400 font-medium flex items-center gap-0.5">
                <Droplets className="w-2.5 h-2.5" />
                {weather.summary.rainProbabilityMax}%
              </span>
            )}
            {weather.days.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDays((v) => !v)}
                className="inline-flex items-center gap-0.5 text-sky-600 hover:text-sky-700 dark:text-sky-400 underline font-medium cursor-pointer ml-1"
                title="Ver previsão dia a dia"
              >
                <span>{showDays ? "Ocultar" : `${weather.days.length}d`}</span>
                {showDays ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grade expansível dia a dia (quebra em linhas, sem nenhum scroll horizontal) */}
      {showDays && weather.days.length > 0 && (
        <div className="pt-2 mt-2 border-t border-sky-200/50 dark:border-sky-900/40">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
            {weather.days.map((day) => {
              const { weekday, dayMonth } = formatDayLabel(day.date);
              return (
                <div
                  key={day.date}
                  className="flex items-center justify-between rounded bg-white/80 dark:bg-card/70 border border-sky-100 dark:border-sky-900/40 px-2 py-1 text-[10px]"
                >
                  <span className="text-muted-foreground font-medium capitalize">
                    {weekday} {dayMonth}
                  </span>
                  <div className="flex items-center gap-1">
                    <WeatherIcon name={day.iconName} className="w-3 h-3" />
                    <span className="font-semibold text-foreground">
                      {day.minTemp}°/{day.maxTemp}°
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
