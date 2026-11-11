export interface WeatherDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  condition: string;
  iconName: "Sun" | "CloudSun" | "Cloud" | "CloudFog" | "CloudDrizzle" | "CloudRain" | "Snowflake" | "CloudLightning";
  rainProbability?: number | undefined;
  rainSumMm?: number | undefined;
}

export interface TripWeatherForecast {
  locationName: string;
  country?: string | undefined;
  admin1?: string | undefined;
  isForecast: boolean; // true = previsão ao vivo (próximos 16 dias), false = clima histórico esperado
  summary: {
    avgMax: number;
    avgMin: number;
    mainCondition: string;
    mainIcon: WeatherDay["iconName"];
    rainProbabilityMax: number;
    totalRainMm: number;
    description: string;
  };
  days: WeatherDay[];
}

export function mapWmoCode(code: number): {
  condition: string;
  iconName: WeatherDay["iconName"];
} {
  if (code === 0) {
    return { condition: "Ensolarado", iconName: "Sun" };
  }
  if (code === 1 || code === 2) {
    return { condition: "Parcialmente nublado", iconName: "CloudSun" };
  }
  if (code === 3) {
    return { condition: "Encoberto", iconName: "Cloud" };
  }
  if (code === 45 || code === 48) {
    return { condition: "Nevoeiro", iconName: "CloudFog" };
  }
  if (code >= 51 && code <= 57) {
    return { condition: "Garoa / Chuvisco", iconName: "CloudDrizzle" };
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return { condition: "Chuva", iconName: "CloudRain" };
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return { condition: "Neve / Frio intenso", iconName: "Snowflake" };
  }
  if (code >= 95 && code <= 99) {
    return { condition: "Tempestade / Trovoadas", iconName: "CloudLightning" };
  }
  return { condition: "Instável", iconName: "CloudSun" };
}

/**
 * Limpa o nome da localidade removendo emojis e pontuações desnecessárias.
 */
export function cleanLocationQuery(raw: string): string {
  if (!raw) return "";
  // Remove emojis unicode, bandeiras (regional indicators), símbolos e seletores de variação
  let clean = raw
    .replace(/\p{Extended_Pictographic}|\p{Regional_Indicator}/gu, "")
    .replace(/[\uFE00-\uFE0F]/g, "");
  // Separa se houver barra ou traço (ex: "Foz do Iguaçu / Londrina" -> "Foz do Iguaçu")
  clean = clean.split("/")[0]!.split("—")[0]!.split("-")[0]!.trim();
  // Se tiver vírgula (ex: "Gramado, RS" -> "Gramado"), pega o primeiro termo
  if (clean.includes(",")) {
    clean = clean.split(",")[0]!.trim();
  }
  return clean.trim();
}

/**
 * Busca a previsão do tempo ou o clima histórico esperado para o período da viagem.
 */
export async function fetchTripWeather({
  destination,
  startDate,
  endDate,
}: {
  destination: string;
  startDate: string;
  endDate: string;
}): Promise<TripWeatherForecast | null> {
  const query = cleanLocationQuery(destination);
  if (!query || !startDate || !endDate) return null;

  try {
    // 1. Geocodificação pública gratuita do Open-Meteo
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=pt&format=json`;
    const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(6000) });
    if (!geoRes.ok) return null;
    const geoData = await geoRes.json();
    const match = geoData.results?.[0];
    if (!match) return null;

    const { latitude, longitude, name, admin1, country } = match;
    const locationName = [name, admin1, country].filter(Boolean).join(", ");

    // 2. Determinar se a data cabe na previsão em tempo real (Open-Meteo suporta até 16 dias à frente)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
    const [endYear, endMonth, endDay] = endDate.split("-").map(Number);

    const tripStart = new Date(startYear!, startMonth! - 1, startDay!);
    const tripEnd = new Date(endYear!, endMonth! - 1, endDay!);

    const daysFromNow = Math.round((tripStart.getTime() - today.getTime()) / 86400000);
    const isLiveForecastPossible = daysFromNow >= -1 && daysFromNow <= 14;

    let isForecast = false;
    let days: WeatherDay[] = [];

    if (isLiveForecastPossible) {
      // 3A. Previsão do tempo em tempo real
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&start_date=${startDate}&end_date=${endDate}`;
      const forecastRes = await fetch(forecastUrl, { signal: AbortSignal.timeout(7000) });

      if (forecastRes.ok) {
        const data = await forecastRes.json();
        const times: string[] = data.daily?.time || [];
        const maxTemps: number[] = data.daily?.temperature_2m_max || [];
        const minTemps: number[] = data.daily?.temperature_2m_min || [];
        const codes: number[] = data.daily?.weather_code || [];
        const rainProbs: number[] = data.daily?.precipitation_probability_max || [];

        if (times.length > 0) {
          isForecast = true;
          days = times.map((d, i) => {
            const mapped = mapWmoCode(codes[i] ?? 0);
            return {
              date: d,
              maxTemp: Math.round(maxTemps[i] ?? 22),
              minTemp: Math.round(minTemps[i] ?? 14),
              weatherCode: codes[i] ?? 0,
              condition: mapped.condition,
              iconName: mapped.iconName,
              rainProbability: rainProbs[i] ?? 0,
            };
          });
        }
      }
    }

    // 3B. Se a viagem for além de 14 dias no futuro (ou ano que vem), busca os dados climáticos históricos das mesmas datas
    if (days.length === 0) {
      // Referência do último ano disponível para os mesmos dias e meses
      const refYear = today.getFullYear() - 1;
      const pad = (n: number) => String(n).padStart(2, "0");
      const refStartDate = `${refYear}-${pad(startMonth!)}-${pad(startDay!)}`;
      const refEndDate = `${refYear}-${pad(endMonth!)}-${pad(endDay!)}`;

      const archiveUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${refStartDate}&end_date=${refEndDate}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
      const archiveRes = await fetch(archiveUrl, { signal: AbortSignal.timeout(7000) });

      if (archiveRes.ok) {
        const data = await archiveRes.json();
        const times: string[] = data.daily?.time || [];
        const maxTemps: number[] = data.daily?.temperature_2m_max || [];
        const minTemps: number[] = data.daily?.temperature_2m_min || [];
        const codes: number[] = data.daily?.weather_code || [];
        const rainSums: number[] = data.daily?.precipitation_sum || [];

        if (times.length > 0) {
          isForecast = false;
          days = times.map((_, i) => {
            // Reconstroi a data com o ano pretendido da viagem
            const d = new Date(tripStart);
            d.setDate(d.getDate() + i);
            const actualDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

            const mapped = mapWmoCode(codes[i] ?? 0);
            const rainMm = rainSums[i] ?? 0;
            return {
              date: actualDate,
              maxTemp: Math.round(maxTemps[i] ?? 22),
              minTemp: Math.round(minTemps[i] ?? 14),
              weatherCode: codes[i] ?? 0,
              condition: mapped.condition,
              iconName: mapped.iconName,
              rainSumMm: Math.round(rainMm * 10) / 10,
              rainProbability: rainMm > 1 ? 65 : rainMm > 0 ? 30 : 10,
            };
          });
        }
      }
    }

    if (days.length === 0) return null;

    // 4. Calcular estatísticas resumidas
    const avgMax = Math.round(days.reduce((acc, d) => acc + d.maxTemp, 0) / days.length);
    const avgMin = Math.round(days.reduce((acc, d) => acc + d.minTemp, 0) / days.length);
    const rainProbabilityMax = Math.max(...days.map((d) => d.rainProbability || 0));
    const totalRainMm = Math.round(days.reduce((acc, d) => acc + (d.rainSumMm || 0), 0) * 10) / 10;

    // Condição meteorológica predominante
    const conditionCounts: Record<string, number> = {};
    for (const d of days) {
      conditionCounts[d.condition] = (conditionCounts[d.condition] || 0) + 1;
    }
    const mainCondition = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0]![0];
    const mainIcon = days.find((d) => d.condition === mainCondition)?.iconName || "Sun";

    let description = "";
    if (avgMax >= 28) {
      description = `Clima quente com máximas em torno de ${avgMax}°C. Ideal para roupas leves e proteção solar.`;
    } else if (avgMax <= 17) {
      description = `Clima frio com mínimas de ${avgMin}°C e máximas de ${avgMax}°C. Recomendado agasalhos e casacos.`;
    } else {
      description = `Temperaturas amenas e agradáveis, variando entre ${avgMin}°C e ${avgMax}°C.`;
    }

    if (rainProbabilityMax >= 60 || totalRainMm >= 10) {
      description += " Há possibilidade de chuva durante o período.";
    } else {
      description += " Predomínio de tempo firme ou pouca chuva.";
    }

    return {
      locationName,
      country,
      admin1,
      isForecast,
      summary: {
        avgMax,
        avgMin,
        mainCondition,
        mainIcon,
        rainProbabilityMax,
        totalRainMm,
        description,
      },
      days,
    };
  } catch (err: unknown) {
    console.error("Erro ao buscar previsão do tempo:", err);
    return null;
  }
}
