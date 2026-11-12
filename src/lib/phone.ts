/**
 * Utilitários para normalização e formatação de números de telefone e WhatsApp.
 */

/**
 * Normaliza o número para o padrão internacional com prefixo '+'
 * Ex.:
 *  "(11) 98765-4321" -> "+5511987654321"
 *  "11987654321" -> "+5511987654321"
 *  "+55 11 98765-4321" -> "+5511987654321"
 *  "+1 202 555-0199" -> "+12025550199"
 */
export function normalizeWhatsApp(raw?: string | null): string {
  if (!raw) return "";

  const trimmed = raw.trim();
  if (!trimmed) return "";

  const startsWithPlus = trimmed.startsWith("+");
  // Extrai apenas dígitos
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) return "";

  // Se já tinha o '+', junta com os dígitos
  if (startsWithPlus) {
    return `+${digits}`;
  }

  // Se começa com 55 e tem 12 ou 13 dígitos (DDI Brasil já digitado sem o '+')
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return `+${digits}`;
  }

  // Padrão Brasil com DDD (10 dígitos fixo, 11 dígitos celular)
  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }

  // Outros formatos com mais de 11 dígitos, adiciona '+'
  return `+${digits}`;
}

/**
 * Formata um número para exibição legível na interface
 * Ex.: "+5511987654321" -> "+55 (11) 98765-4321"
 */
export function formatPhoneDisplay(raw?: string | null): string {
  if (!raw) return "";
  const normalized = normalizeWhatsApp(raw);
  if (!normalized) return "";

  // Formato brasileiro: +55 (DD) 9XXXX-XXXX ou +55 (DD) XXXX-XXXX
  const brMatch = normalized.match(/^\+55(\d{2})(\d{4,5})(\d{4})$/);
  if (brMatch) {
    const [, ddd, prefix, suffix] = brMatch;
    return `+55 (${ddd}) ${prefix}-${suffix}`;
  }

  return normalized;
}

/**
 * Valida se um número de telefone/WhatsApp parece válido (mínimo 10 dígitos)
 */
export function isValidPhone(raw?: string | null): boolean {
  if (!raw) return false;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

