import { Link } from "@tanstack/react-router";
import { Calendar, ExternalLink, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTripCover } from "@/lib/album-cover";
import { fmtDate } from "@/lib/format";
import type { TripSummary, WorldCountryEntry } from "@/lib/world-map";

type Props = {
  country: WorldCountryEntry | null;
  onClose: () => void;
};

function TripMiniCard({ trip }: { trip: TripSummary }) {
  const cover = useTripCover(trip.cover_path);
  return (
    <Link
      to="/viagens/$id"
      params={{ id: trip.id }}
      className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 hover:border-primary/50 hover:bg-muted/40 transition-all"
    >
      {cover ? (
        <img
          src={cover}
          alt=""
          referrerPolicy="no-referrer"
          className="size-14 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="size-14 shrink-0 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
          <MapPin className="size-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm text-foreground group-hover:text-primary truncate">
          {trip.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3 shrink-0" />
          <span>
            {fmtDate(trip.start_date, { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </p>
      </div>
      <ExternalLink className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
    </Link>
  );
}

export function CountryTripsModal({ country, onClose }: Props) {
  return (
    <Dialog open={!!country} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-lg max-h-[88dvh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-xl font-display">
            {country?.flagUrl ? (
              <img
                src={country.flagUrl}
                alt={country.name}
                className="h-5 w-7 rounded-sm object-cover border border-border/60 shrink-0"
              />
            ) : (
              <span>{country?.emoji}</span>
            )}
            <span>{country?.name}</span>
            {country && (
              <Badge
                variant={country.status === "visited" ? "default" : "secondary"}
                className={
                  country.status === "visited"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px]"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[11px]"
                }
              >
                {country.status === "visited" ? "Visitado" : "Planejado"}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {country?.continent} · {country?.trips.length ?? 0}{" "}
            {(country?.trips.length ?? 0) === 1 ? "viagem registrada" : "viagens registradas"}
          </DialogDescription>
        </DialogHeader>

        {country && (
          <div className="space-y-4 pt-1">
            {country.cities.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cidades
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {country.cities.map((city) => (
                    <Badge key={city} variant="secondary" className="rounded-full text-xs font-normal gap-1">
                      <MapPin className="size-3 text-primary" />
                      {city}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Viagens da Família
              </p>
              <div className="space-y-2">
                {country.trips.map((t) => (
                  <TripMiniCard key={t.id} trip={t} />
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
