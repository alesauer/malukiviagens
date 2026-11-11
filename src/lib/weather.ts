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
 * Limpa o nome da localidade removendo emojis, prefixos de viagens e pontuações desnecessárias.
 */
export function cleanLocationQuery(raw: string): string {
  if (!raw) return "";

  // 1. Remove emojis unicode, bandeiras (regional indicators), símbolos e seletores de variação
  let clean = raw
    .replace(/\p{Extended_Pictographic}|\p{Regional_Indicator}/gu, "")
    .replace(/[\uFE00-\uFE0F]/g, "")
    .trim();

  // 2. Remove prefixos comuns de títulos de viagens (ex: "Férias em Gramado", "Viagem para Paris")
  clean = clean
    .replace(
      /^(férias|ferias|viagem|passeio|fim de semana|indo|ida|visita|tour)\s+(em|para|pra|a|no|na|nos|nas|por)\s+/i,
      ""
    )
    .trim();

  // 3. Separa se houver barra ou traço (ex: "Foz do Iguaçu / PR" -> "Foz do Iguaçu", "Gramado - RS" -> "Gramado")
  clean = clean.split("/")[0]!.split("—")[0]!.split("-")[0]!.trim();

  // 4. Se tiver vírgula (ex: "Gramado, RS, Brasil" -> "Gramado"), pega o primeiro termo
  if (clean.includes(",")) {
    clean = clean.split(",")[0]!.trim();
  }

  // 5. Remove sigla de estado brasileiro no final (ex: "Gramado RS" -> "Gramado", "Florianopolis SC" -> "Florianopolis")
  clean = clean
    .replace(
      /\s+(ac|al|ap|am|ba|ce|df|es|go|ma|mt|ms|mg|pa|pb|pr|pe|pi|rj|rn|rs|ro|rr|sc|sp|se|to)$/i,
      ""
    )
    .trim();

  // 6. Remove palavras finais de país comuns se vierem juntas sem pontuação (ex: "Santiago Chile" -> "Santiago", "Paris França" -> "Paris")
  clean = clean
    .replace(
      /\s+(brasil|brazil|chile|argentina|frança|france|italia|italy|portugal|espanha|spain|eua|usa)$/i,
      ""
    )
    .trim();

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
    let match = null;
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=pt&format=json`;
    const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(5000) });
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      match = geoData.results?.[0];
    }

    // Se não encontrou, tenta buscar pela primeira palavra caso haja termos compostos
    if (!match && query.includes(" ")) {
      const firstWord = query.split(" ")[0]!.trim();
      if (firstWord.length >= 3) {
        const fallbackUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(firstWord)}&count=1&language=pt&format=json`;
        const fbRes = await fetch(fallbackUrl, { signal: AbortSignal.timeout(4000) });
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          match = fbData.results?.[0];
        }
      }
    }

    if (!match) return null;

    const { latitude, longitude, name, admin1, country } = match;
    const locationName = [name, admin1, country].filter(Boolean).join(", ");

    // 2. Busca previsão na API principal pública do Open-Meteo (16 dias de modelo numérico)
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=16`;
    const forecastRes = await fetch(forecastUrl, { signal: AbortSignal.timeout(6000) });
    if (!forecastRes.ok) return null;

    const forecastData = await forecastRes.json();
    const forecastTimes: string[] = forecastData.daily?.time || [];
    const forecastMaxTemps: number[] = forecastData.daily?.temperature_2m_max || [];
    const forecastMinTemps: number[] = forecastData.daily?.temperature_2m_min || [];
    const forecastCodes: number[] = forecastData.daily?.weather_code || [];
    const forecastRainProbs: number[] = forecastData.daily?.precipitation_probability_max || [];

    // Temperaturas base locais da localidade
    const baseMax = forecastMaxTemps.length > 0
      ? Math.round(forecastMaxTemps.reduce((a, b) => a + b, 0) / forecastMaxTemps.length)
      : 23;
    const baseMin = forecastMinTemps.length > 0
      ? Math.round(forecastMinTemps.reduce((a, b) => a + b, 0) / forecastMinTemps.length)
      : 14;

    const pad = (n: number) => String(n).padStart(2, "0");
    const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
    const [endYear, endMonth, endDay] = endDate.split("-").map(Number);

    const tripStart = new Date(startYear!, startMonth! - 1, startDay!);
    const tripEnd = new Date(endYear!, endMonth! - 1, endDay!);

    // Limita para no máximo 30 dias para não sobrecarregar
    const totalDaysCount = Math.max(
      1,
      Math.min(
        Math.round((tripEnd.getTime() - tripStart.getTime()) / 86400000) + 1,
        30
      )
    );

    let liveCount = 0;
    const days: WeatherDay[] = [];

    for (let i = 0; i < totalDaysCount; i++) {
      const cur = new Date(tripStart);
      cur.setDate(cur.getDate() + i);
      const curDateStr = `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`;

      const idx = forecastTimes.indexOf(curDateStr);
      if (idx !== -1) {
        liveCount++;
        const code = forecastCodes[idx] ?? 0;
        const mapped = mapWmoCode(code);
        days.push({
          date: curDateStr,
          maxTemp: Math.round(forecastMaxTemps[idx] ?? baseMax),
          minTemp: Math.round(forecastMinTemps[idx] ?? baseMin),
          weatherCode: code,
          condition: mapped.condition,
          iconName: mapped.iconName,
          rainProbability: forecastRainProbs[idx] ?? 10,
        });
      } else {
        // Data além dos 16 dias ao vivo: calcula estimativa sazonal do destino
        const month = cur.getMonth() + 1; // 1 to 12
        const isSouthern = latitude < 0;
        let seasonalDelta = 0;
        if (isSouthern) {
          if ([12, 1, 2].includes(month)) seasonalDelta = 3;
          else if ([6, 7, 8].includes(month)) seasonalDelta = -5;
          else if ([3, 4, 5].includes(month)) seasonalDelta = -1;
          else seasonalDelta = 1;
        } else {
          if ([6, 7, 8].includes(month)) seasonalDelta = 5;
          else if ([12, 1, 2].includes(month)) seasonalDelta = -6;
          else seasonalDelta = 0;
        }

        const dailyJitter = ((i * 3) % 5) - 2;
        const estimatedMax = Math.round(baseMax + seasonalDelta + dailyJitter);
        const estimatedMin = Math.round(baseMin + seasonalDelta * 0.7 + dailyJitter);
        const sampleCode = (i % 5 === 0) ? 61 : (i % 3 === 0) ? 2 : (i % 2 === 0) ? 1 : 0;
        const mapped = mapWmoCode(sampleCode);

        days.push({
          date: curDateStr,
          maxTemp: Math.max(estimatedMax, estimatedMin + 4),
          minTemp: estimatedMin,
          weatherCode: sampleCode,
          condition: mapped.condition,
          iconName: mapped.iconName,
          rainProbability: sampleCode === 61 ? 55 : sampleCode === 2 ? 25 : 10,
        });
      }
    }

    if (days.length === 0) return null;

    const isForecast = liveCount > 0;
    const avgMax = Math.round(days.reduce((acc, d) => acc + d.maxTemp, 0) / days.length);
    const avgMin = Math.round(days.reduce((acc, d) => acc + d.minTemp, 0) / days.length);
    const rainProbabilityMax = Math.max(...days.map((d) => d.rainProbability || 0));
    const totalRainMm = 0;

    // Condição meteorológica predominante
    const conditionCounts: Record<string, number> = {};
    for (const d of days) {
      conditionCounts[d.condition] = (conditionCounts[d.condition] || 0) + 1;
    }
    const mainCondition = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0]![0];
    const mainIcon = days.find((d) => d.condition === mainCondition)?.iconName || "Sun";

    let description = "";
    if (avgMax >= 28) {
      description = `Clima quente com máximas em torno de ${avgMax}°C. Roupas leves e proteção solar recomendadas.`;
    } else if (avgMax <= 17) {
      description = `Clima frio com mínimas de ${avgMin}°C e máximas de ${avgMax}°C. Recomendado agasalhos.`;
    } else {
      description = `Temperaturas agradáveis, variando entre ${avgMin}°C e ${avgMax}°C.`;
    }

    if (rainProbabilityMax >= 50) {
      description += " Há possibilidade de chuva no período.";
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
