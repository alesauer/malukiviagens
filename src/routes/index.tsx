import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, FileLock2, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-family-travel.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Maluki Viagens — viagens em família, sem planilha" },
      { name: "description", content: "Roteiro dia a dia, reservas, gastos em R$, checklists e documentos da família num só lugar." },
      { property: "og:title", content: "Maluki Viagens — viagens em família, sem planilha" },
      { property: "og:description", content: "Roteiro dia a dia, reservas, gastos em R$, checklists e documentos da família num só lugar." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: CalendarDays, title: "Roteiro dia a dia", text: "Cada dia da viagem com horários, lugares e custos." },
  { icon: Wallet, title: "Gastos sob controle", text: "Orçamento x gasto real, por categoria, em reais." },
  { icon: FileLock2, title: "Documentos protegidos", text: "Passaportes e vouchers visíveis só para a família." },
  { icon: Sparkles, title: "Assistente de viagem", text: "Peça sugestões de roteiro e dicas em segundos." },
];

function Index() {
  return (
    <div>
      <section className="relative min-h-[92vh] overflow-hidden">
        <img src={hero} alt="Família caminhando à beira-mar no pôr do sol" className="absolute inset-0 h-full w-full object-cover" width={1600} height={1008} />
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col px-6">
          <header className="flex h-20 items-center justify-between">
            <span className="font-display text-2xl font-semibold text-primary-foreground">
              Maluki<span className="text-accent">.</span>
            </span>
            <Link to="/auth" className="text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground">
              Entrar
            </Link>
          </header>
          <div className="mt-auto pb-20">
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] text-primary-foreground md:text-7xl">
              A próxima viagem da família começa aqui.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-primary-foreground/85">
              Roteiro, reservas, gastos, malas e documentos — tudo compartilhado com quem vai com você.
            </p>
            <Button asChild variant="hero" size="lg" className="mt-8 h-12 px-8 text-base">
              <Link to="/auth">Começar grátis</Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-20 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title}>
            <f.icon className="size-6 text-accent" />
            <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
