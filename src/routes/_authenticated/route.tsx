import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, Globe2, Menu, Plane, Sparkles, FolderKanban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "@/lib/family";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: AppShell,
});

const MOBILE_NAV = [
  { to: "/viagens", label: "Viagens", icon: Compass },
  { to: "/meu-mundo", label: "Meu Mundo", icon: Globe2 },
  { to: "/assistente", label: "Assistente", icon: Sparkles },
  { to: "/geral", label: "Outros", icon: FolderKanban },
] as const;

function AppShell() {
  const { data: family } = useFamily();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      {/* Sidebar Desktop (fixa na lateral esquerda, substituindo o menu do topo) */}
      <div className="hidden md:block w-64 shrink-0">
        <div className="fixed inset-y-0 left-0 w-64 z-30">
          <AppSidebar />
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topo Mobile com botão de abrir Sidebar gaveta e suporte a safe area */}
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-card/85 px-4 backdrop-blur-md pt-[env(safe-area-inset-top)] h-[calc(3.5rem+env(safe-area-inset-top))]">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-xl text-muted-foreground hover:text-foreground size-9"
                  aria-label="Abrir menu de navegação"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 max-w-[85vw]">
                <AppSidebar onItemClick={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <Link to="/viagens" className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-xs">
                <Plane className="size-4" />
              </div>
              <span>
                Maluki<span className="text-accent">.</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {family?.name && <span className="font-medium truncate max-w-[130px] sm:max-w-[180px]">{family.name}</span>}
          </div>
        </header>

        {/* Corpo principal das rotas autenticadas */}
        <main className="flex-1 px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8 w-full max-w-6xl mx-auto min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Navegação rápida no rodapé para dispositivos móveis com safe area */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border/80 bg-card/95 backdrop-blur-md md:hidden pb-[env(safe-area-inset-bottom)]"
        aria-label="Navegação Rápida Mobile"
      >
        {MOBILE_NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="flex min-h-[50px] flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "!text-primary font-semibold" }}
          >
            <n.icon className="size-5 shrink-0" />
            <span className="truncate max-w-full whitespace-nowrap">{n.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
