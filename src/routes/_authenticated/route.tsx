import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { Compass, Sparkles, Users, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "@/lib/family";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: AppShell,
});

const nav = [
  { to: "/viagens", label: "Viagens", icon: Compass },
  { to: "/assistente", label: "Assistente", icon: Sparkles },
  { to: "/familia", label: "Família", icon: Users },
] as const;

function AppShell() {
  const { data: family } = useFamily();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <Link to="/viagens" className="font-display text-xl font-semibold text-primary">
            Maluki<span className="text-accent">.</span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary"
                activeProps={{ className: "bg-secondary !text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{family?.name}</span>
            <button
              aria-label="Sair"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/auth" });
              }}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t bg-card/95 backdrop-blur md:hidden">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="flex flex-col items-center gap-1 py-3 text-xs text-muted-foreground"
            activeProps={{ className: "!text-primary font-semibold" }}
          >
            <n.icon className="size-5" />
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
