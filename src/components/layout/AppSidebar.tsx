import { useState, useEffect } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Compass,
  Sparkles,
  Users,
  LogOut,
  Plane,
  HeartHandshake,
  ChevronDown,
  FolderKanban,
  Settings,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "@/lib/family";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Itens principais de navegação
export const PRIMARY_NAV = [
  { to: "/viagens", label: "Viagens", icon: Compass, description: "Roteiros e memórias" },
  { to: "/assistente", label: "Assistente IA", icon: Sparkles, description: "Dicas e ideias de passeios" },
] as const;

// Itens dentro do menu Outros
export const OUTROS_NAV = [
  { to: "/geral", label: "Geral", icon: Settings, description: "IA e configurações" },
  { to: "/familia", label: "Família", icon: Users, description: "Membros e convites" },
] as const;

// Todos os itens combinados para compatibilidade e rotas móveis
export const ALL_NAV_ITEMS = [
  ...PRIMARY_NAV,
  { to: "/geral", label: "Geral", icon: Settings, description: "IA e configurações" },
  { to: "/familia", label: "Família", icon: Users, description: "Membros e convites" },
] as const;

interface AppSidebarProps {
  onItemClick?: () => void;
  className?: string;
}

export function AppSidebar({ onItemClick, className = "" }: AppSidebarProps) {
  const { data: family } = useFamily();
  const navigate = useNavigate();

  // Detecta se a rota atual está dentro do menu Outros (/geral ou /familia)
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isOutrosActive = pathname.startsWith("/geral") || pathname.startsWith("/familia");

  // Estado do menu Outros (expandido por padrão ou se a rota atual for filha)
  const [outrosOpen, setOutrosOpen] = useState(true);

  useEffect(() => {
    if (isOutrosActive) {
      setOutrosOpen(true);
    }
  }, [isOutrosActive]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  // Obter iniciais do usuário
  const initials = (family?.userName || "U")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || "")
    .join("");

  return (
    <aside
      className={`flex h-full flex-col justify-between border-r border-border/70 bg-card/95 p-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))] text-card-foreground backdrop-blur-md shadow-xs ${className}`}
      aria-label="Barra Lateral de Navegação"
    >
      {/* Topo: Logo & Família */}
      <div className="space-y-6">
        {/* Brand */}
        <Link
          to="/viagens"
          onClick={onItemClick}
          className="group flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-secondary/60"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-soft transition-transform group-hover:scale-105">
            <Plane className="size-5 transition-transform group-hover:-rotate-12" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Maluki<span className="text-accent">.</span>
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">Planejador de Viagens</span>
          </div>
        </Link>

        {/* Card Família Ativa */}
        {family ? (
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-3 text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HeartHandshake className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{family.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">
                  {family.role === "owner" ? "Administrador" : "Membro da família"}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Links de Navegação */}
        <nav className="space-y-1.5" aria-label="Navegação Principal">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </p>

          {/* Menus Principais (Viagens e Assistente IA) */}
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onItemClick}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground active:scale-98"
              activeProps={{
                className: "bg-primary text-primary-foreground font-semibold shadow-soft hover:bg-primary hover:text-primary-foreground",
              }}
            >
              <item.icon className="size-4.5 shrink-0" />
              <div className="flex flex-col leading-tight">
                <span>{item.label}</span>
                <span className="text-[10px] opacity-75">{item.description}</span>
              </div>
            </Link>
          ))}

          {/* Menu "Outros" retrátil contendo o submenu "Família" */}
          <Collapsible open={outrosOpen} onOpenChange={setOutrosOpen} className="space-y-1">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-secondary hover:text-foreground active:scale-98 ${isOutrosActive
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-muted-foreground"
                  }`}
                aria-label="Menu Outros"
              >
                <div className="flex items-center gap-3">
                  <FolderKanban className="size-4.5 shrink-0" />
                  <div className="flex flex-col text-left leading-tight">
                    <span>Outros</span>
                    <span className="text-[10px] opacity-75">Configurações e gestão</span>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${outrosOpen ? "rotate-180 text-foreground" : ""
                    }`}
                />
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1 pl-3 pt-1 border-l-2 border-border/70 ml-4 animate-in slide-in-from-top-1 fade-in-50 duration-150">
              {OUTROS_NAV.map((sub) => (
                <Link
                  key={sub.to}
                  to={sub.to}
                  onClick={onItemClick}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                  activeProps={{
                    className: "bg-primary/15 !text-primary font-semibold",
                  }}
                >
                  <sub.icon className="size-4 shrink-0" />
                  <div className="flex flex-col leading-tight">
                    <span>{sub.label}</span>
                    <span className="text-[9px] opacity-75">{sub.description}</span>
                  </div>
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </div>

      {/* Rodapé: Perfil & Sair */}
      <div className="border-t border-border/60 pt-4">
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-secondary/40 p-2">
          <Link
            to="/familia"
            onClick={onItemClick}
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
            title="Ver meu perfil e membros da família"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">{family?.userName || "Usuário"}</p>
              <p className="truncate text-[10px] text-muted-foreground">{family?.name || "Maluki"}</p>
            </div>
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Sair da conta"
            aria-label="Sair da conta"
            className="size-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
