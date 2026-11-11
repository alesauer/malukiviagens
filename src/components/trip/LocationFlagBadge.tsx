import { FlagResult, useFlagDetector } from "@/lib/flags";
import { Button } from "@/components/ui/button";
import { Check, Loader2, MapPin, Sparkles } from "lucide-react";

interface LocationFlagBadgeProps {
  flag: FlagResult | null;
  loading?: boolean;
  titleValue?: string;
  onApplyEmoji?: (emoji: string) => void;
  onApplyDestination?: (destination: string) => void;
  hasDestination?: boolean;
  className?: string;
}

export function LocationFlagBadge({
  flag,
  loading,
  titleValue = "",
  onApplyEmoji,
  onApplyDestination,
  hasDestination,
  className = "",
}: LocationFlagBadgeProps) {
  if (loading) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}>
        <Loader2 className="size-3.5 animate-spin text-primary" />
        <span>Buscando bandeira do local…</span>
      </div>
    );
  }

  if (!flag) return null;

  const isEmojiInTitle = titleValue.includes(flag.emoji);
  const isCityBr = flag.kind === "city_br";

  return (
    <div
      className={`animate-in fade-in slide-in-from-top-1 duration-200 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-2 text-xs shadow-xs ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 min-w-0">
        {/* Bandeira Imagem / Ícone */}
        {flag.flagUrl ? (
          <div className="relative shrink-0 overflow-hidden rounded border border-border/80 bg-background shadow-xs">
            <img
              src={flag.flagUrl}
              alt={`Bandeira de ${flag.label}`}
              className="h-4.5 w-7 object-cover"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          </div>
        ) : null}

        {/* Emoji de Bandeira */}
        <span className="text-base select-none" aria-hidden="true">
          {flag.emoji}
        </span>

        {/* Informações da Cidade/País */}
        <div className="min-w-0 flex flex-col leading-tight">
          <div className="flex items-center gap-1.5 font-medium text-foreground truncate">
            <span>{flag.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold tracking-wide uppercase ${
                isCityBr
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : "bg-blue-500/15 text-blue-700 dark:text-blue-400"
              }`}
            >
              {isCityBr ? "Bandeira da Cidade" : "Bandeira do País"}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground truncate">{flag.description}</span>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onApplyEmoji && (
          <Button
            type="button"
            variant={isEmojiInTitle ? "secondary" : "outline"}
            size="sm"
            className="h-6.5 text-[11px] px-2.5 rounded-full font-medium transition-all"
            onClick={() => onApplyEmoji(flag.emoji)}
            title={isEmojiInTitle ? "Emoji já incluído no título" : `Adicionar ${flag.emoji} ao título`}
          >
            {isEmojiInTitle ? (
              <>
                <Check className="mr-1 size-3 text-emerald-600 dark:text-emerald-400" />
                Emoji no nome
              </>
            ) : (
              <>
                <Sparkles className="mr-1 size-3 text-primary" />
                Usar {flag.emoji}
              </>
            )}
          </Button>
        )}

        {onApplyDestination && !hasDestination && flag.suggestedDestination && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6.5 text-[11px] px-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/80"
            onClick={() => onApplyDestination(flag.suggestedDestination!)}
            title="Preencher destino automaticamente"
          >
            <MapPin className="mr-1 size-3" />
            Preencher destino
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Ícone inline de bandeira para renderizar diretamente ao lado do texto digitado
 * ou dentro de inputs, títulos e cards.
 */
export function InlineFlagIcon({
  flag,
  className = "",
}: {
  flag: FlagResult | null;
  className?: string;
}) {
  if (!flag) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 align-middle select-none ${className}`}>
      {flag.flagUrl ? (
        <span className="inline-block overflow-hidden rounded border border-border/60 bg-muted/20 align-middle shadow-xs">
          <img
            src={flag.flagUrl}
            alt={`Bandeira de ${flag.label}`}
            className="h-3.5 w-5 object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
        </span>
      ) : null}
      <span className="text-sm" aria-hidden="true">
        {flag.emoji}
      </span>
    </span>
  );
}

/**
 * Componente que renderiza o título da viagem com o ícone de bandeira detectado
 * caso o título ainda não contenha emoji.
 */
export function TripFlagTitle({
  title,
  destination,
  className = "",
}: {
  title: string;
  destination?: string | null;
  className?: string;
}) {
  const { flag } = useFlagDetector(title, destination || undefined);

  // Se o título já possui emoji de bandeira, renderiza o texto puro
  const hasEmoji = /[\uD83C][\uDDE6-\uDDFF]{2}/.test(title);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {!hasEmoji && flag ? <InlineFlagIcon flag={flag} /> : null}
      <span>{title}</span>
    </span>
  );
}
