import { useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COUNTRY_BY_NUMERIC,
  type WorldCityEntry,
  type WorldCountryEntry,
} from "@/lib/world-map";
import { cn } from "@/lib/utils";

type Props = {
  countriesByNumericId: Map<string, WorldCountryEntry>;
  cities: WorldCityEntry[];
  selectedCountryCode: string | null;
  onSelectCountry: (country: WorldCountryEntry) => void;
  showCityPins?: boolean;
};

type GeoFeature = GeoJSON.Feature<GeoJSON.Geometry, { name?: string }> & {
  id?: string | number;
};

type TooltipState = {
  x: number;
  y: number;
  title: string;
  subtitle: string;
  emoji?: string;
};

const WIDTH = 960;
const HEIGHT = 480;

export function WorldMap2D({
  countriesByNumericId,
  cities,
  selectedCountryCode,
  onSelectCountry,
  showCityPins = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const movedRef = useRef(false);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const { features, projection, pathGenerator } = useMemo(() => {
    const topo = worldAtlas as unknown as Parameters<typeof feature>[0] & {
      objects: { countries: Parameters<typeof feature>[1] };
    };
    const fc = feature(topo, topo.objects.countries) as unknown as GeoJSON.FeatureCollection;
    // Remove Antártida (010) para melhor aproveitamento visual do mapa 2D
    const filtered = (fc.features as GeoFeature[]).filter(
      (f) => String(f.id ?? "").padStart(3, "0") !== "010"
    );

    const proj = geoNaturalEarth1().fitSize([WIDTH - 24, HEIGHT - 24], {
      type: "FeatureCollection",
      features: filtered,
    });
    // Centraliza pequena margem de 12px
    const [tx, ty] = proj.translate();
    proj.translate([tx + 12, ty + 12]);

    const pathGen = geoPath(proj);
    return { features: filtered, projection: proj, pathGenerator: pathGen };
  }, []);

  const projectedCities = useMemo(() => {
    if (!showCityPins) return [];
    return cities
      .filter((c): c is WorldCityEntry & { coords: [number, number] } => c.coords !== null)
      .map((c) => {
        const pt = projection(c.coords);
        return pt ? { ...c, x: pt[0], y: pt[1] } : null;
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);
  }, [cities, projection, showCityPins]);

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (e.button !== 0) return;
    setDragging(true);
    movedRef.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true;
    setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
  }

  function handlePointerUp() {
    setDragging(false);
  }

  function updateTooltipPosition(e: React.MouseEvent, next: Omit<TooltipState, "x" | "y">) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      ...next,
    });
  }

  function handleZoom(delta: number) {
    setZoom((z) => {
      const next = Math.min(4.5, Math.max(1, Number((z + delta).toFixed(2))));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl border border-border/70 bg-sky-50/60 dark:bg-slate-950/50 select-none"
    >
      {/* Controles de Zoom */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-xl border border-border/70 bg-card/90 p-1 shadow-soft backdrop-blur-sm">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-7 rounded-lg"
          onClick={() => handleZoom(0.5)}
          aria-label="Aumentar zoom"
          title="Aumentar zoom"
        >
          <Plus className="size-3.5" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-7 rounded-lg"
          onClick={() => handleZoom(-0.5)}
          disabled={zoom <= 1}
          aria-label="Diminuir zoom"
          title="Diminuir zoom"
        >
          <Minus className="size-3.5" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-7 rounded-lg"
          onClick={resetView}
          disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
          aria-label="Centralizar mapa"
          title="Centralizar mapa"
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>

      {/* Mapa SVG 2D */}
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={cn(
          "w-full h-auto max-h-[540px] touch-none",
          dragging ? "cursor-grabbing" : zoom > 1 ? "cursor-grab" : "cursor-default"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          handlePointerUp();
          setTooltip(null);
        }}
      >
        <g
          transform={`translate(${WIDTH / 2 + pan.x}, ${HEIGHT / 2 + pan.y}) scale(${zoom}) translate(${-WIDTH / 2}, ${-HEIGHT / 2})`}
          style={{ transition: dragging ? "none" : "transform 180ms ease-out" }}
        >
          {/* Países */}
          {features.map((f, idx) => {
            const numId = String(f.id ?? "").padStart(3, "0");
            const visited = countriesByNumericId.get(numId);
            const metaPt = COUNTRY_BY_NUMERIC.get(numId);
            const displayName = visited?.name ?? metaPt?.name ?? f.properties?.name ?? "País";
            const isSelected = !!visited && selectedCountryCode === visited.code;
            const d = pathGenerator(f) ?? "";
            if (!d) return null;

            let fillClass =
              "fill-slate-200/90 hover:fill-slate-300 dark:fill-slate-800 dark:hover:fill-slate-700";
            if (visited?.status === "visited") {
              fillClass =
                "fill-emerald-500 hover:fill-emerald-600 dark:fill-emerald-500 dark:hover:fill-emerald-400 cursor-pointer";
            } else if (visited?.status === "planned") {
              fillClass =
                "fill-amber-400 hover:fill-amber-500 dark:fill-amber-500 dark:hover:fill-amber-400 cursor-pointer";
            }

            const subtitle = visited
              ? `${visited.status === "visited" ? "Visitado" : "Planejado"} · ${visited.trips.length} ${
                  visited.trips.length === 1 ? "viagem" : "viagens"
                }`
              : "Ainda não visitado";

            return (
              <path
                key={numId || idx}
                d={d}
                className={cn(
                  "stroke-white dark:stroke-slate-900 transition-colors duration-150",
                  fillClass,
                  isSelected && "stroke-slate-950 dark:stroke-white"
                )}
                strokeWidth={(isSelected ? 1.6 : 0.55) / Math.sqrt(zoom)}
                onMouseMove={(e) =>
                  updateTooltipPosition(e, {
                    title: displayName,
                    subtitle,
                    emoji: visited?.emoji,
                  })
                }
                onMouseLeave={() => setTooltip(null)}
                onClick={() => {
                  if (movedRef.current) return;
                  if (visited) onSelectCountry(visited);
                }}
              />
            );
          })}

          {/* Pins de Cidades */}
          {projectedCities.map((city) => {
            const r = (city.status === "visited" ? 4.2 : 3.5) / Math.sqrt(zoom);
            return (
              <g
                key={city.key}
                transform={`translate(${city.x}, ${city.y})`}
                className="cursor-pointer"
                onMouseMove={(e) => {
                  e.stopPropagation();
                  updateTooltipPosition(e, {
                    title: `${city.name}`,
                    subtitle: `${city.countryName} · ${city.trips.length} ${
                      city.trips.length === 1 ? "viagem" : "viagens"
                    }`,
                    emoji: city.emoji,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (movedRef.current) return;
                  const meta = Array.from(countriesByNumericId.values()).find(
                    (c) => c.code === city.countryCode
                  );
                  if (meta) onSelectCountry(meta);
                }}
              >
                <circle
                  r={r}
                  className={cn(
                    "stroke-white dark:stroke-slate-950",
                    city.status === "visited" ? "fill-emerald-900 dark:fill-emerald-200" : "fill-amber-800 dark:fill-amber-200"
                  )}
                  strokeWidth={1.2 / Math.sqrt(zoom)}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip Flutuante */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 rounded-xl border border-border/80 bg-popover/95 px-3 py-1.5 text-xs shadow-lift backdrop-blur-sm"
          style={{
            left: Math.min(tooltip.x + 12, (containerRef.current?.clientWidth ?? 400) - 180),
            top: Math.max(8, tooltip.y - 46),
          }}
        >
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            {tooltip.emoji && <span>{tooltip.emoji}</span>}
            <span>{tooltip.title}</span>
          </p>
          <p className="text-[11px] text-muted-foreground">{tooltip.subtitle}</p>
        </div>
      )}
    </div>
  );
}
