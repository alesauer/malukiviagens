export const brl = (n: number | string | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n ?? 0));

const parseDay = (d: string) => {
  const [y = 1970, m = 1, day = 1] = d.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, day);
};

export const fmtDate = (d: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" }) =>
  d ? new Intl.DateTimeFormat("pt-BR", opts).format(parseDay(d)) : "";

export const fmtLongDay = (d: string) =>
  new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(parseDay(d));

/** Whole days from `today` until `start` (negative if past). */
export function daysUntil(start: string, today: Date = new Date()) {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((parseDay(start).getTime() - t.getTime()) / 86_400_000);
}

/** Number of calendar days in a trip, inclusive of both ends. */
export function tripLength(start: string, end: string) {
  return Math.round((parseDay(end).getTime() - parseDay(start).getTime()) / 86_400_000) + 1;
}

/** Every date (YYYY-MM-DD) from start to end inclusive. */
export function tripDays(start: string, end: string) {
  const out: string[] = [];
  const d = parseDay(start);
  const e = parseDay(end);
  while (d <= e) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export type TripPhase = "futura" | "em_andamento" | "realizada";
export function tripPhase(start: string, end: string, today: Date = new Date()): TripPhase {
  if (daysUntil(start, today) > 0) return "futura";
  if (daysUntil(end, today) < 0) return "realizada";
  return "em_andamento";
}

export const CATEGORIES: Record<string, string> = {
  ferias: "Férias",
  nacional: "Nacional",
  internacional: "Internacional",
  fim_de_semana: "Fim de semana",
  feriado: "Feriado",
  profissional: "Trabalho",
  outros: "Outros",
};

export const EXPENSE_CATEGORIES: Record<string, string> = {
  hospedagem: "Hospedagem",
  transporte: "Transporte",
  alimentacao: "Alimentação",
  passeios: "Passeios",
  compras: "Compras",
  seguro: "Seguro",
  outros: "Outros",
};

export const RESERVATION_KINDS: Record<string, string> = {
  hospedagem: "Hospedagem",
  voo: "Voo",
  onibus: "Ônibus / trem",
  carro: "Aluguel de carro",
  restaurante: "Restaurante",
  ingresso: "Ingresso",
  seguro: "Seguro-viagem",
};

export const DOC_KINDS: Record<string, string> = {
  passaporte: "Passaporte",
  visto: "Visto",
  rg: "RG / CNH",
  bilhete: "Bilhete",
  voucher: "Voucher",
  seguro: "Seguro",
  outro: "Outro",
};
