import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import hero from "@/assets/hero-family-travel.jpg";
import { normalizeInviteCode, signupMetadata } from "@/lib/family-invite";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Entrar — Maluki Viagens" },
      { name: "description", content: "Entre ou crie sua conta para planejar as viagens da família." },
      { property: "og:title", content: "Entrar — Maluki Viagens" },
      { property: "og:description", content: "Entre ou crie sua conta para planejar as viagens da família." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  async function completeGoogleInvite() {
    const code = window.localStorage.getItem("maluki:pending-family-invite");
    if (!code) { navigate({ to: "/meu-mundo" }); return; }
    const { error } = await supabase.rpc("join_family", { _code: code });
    if (error) {
      setMode("up");
      setInviteCode(code);
      toast.error("Não foi possível entrar na família. Confira o código de convite.");
      return;
    }
    window.localStorage.removeItem("maluki:pending-family-invite");
    toast.success("Você entrou na família!");
    navigate({ to: "/meu-mundo" });
  }

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) void completeGoogleInvite();
    });
    return () => { active = false; };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/meu-mundo" });
      } else if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/meu-mundo", data: signupMetadata(name, inviteCode) },
        });
        if (error) throw error;
        toast.success(inviteCode.trim() ? "Conta criada na família convidada! Confirme seu e-mail para acessar as viagens." : "Conta criada! Confirme pelo link que enviamos para seu e-mail.");
        setMode("in");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        toast.success("Se o e-mail existir, você receberá um link para criar nova senha.");
        setMode("in");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Algo deu errado";
      toast.error(msg === "Invalid login credentials" ? "E-mail ou senha incorretos" : mode === "up" && inviteCode.trim() && msg.includes("Database error saving new user") ? "Não foi possível criar a conta. Confira o código de convite e tente novamente." : msg);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const code = mode === "up" ? normalizeInviteCode(inviteCode) : "";
    if (code) window.localStorage.setItem("maluki:pending-family-invite", code);
    else window.localStorage.removeItem("maluki:pending-family-invite");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/auth" },
    });
    if (error) toast.error("Não foi possível entrar com Google: " + error.message);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={hero} alt="Família caminhando à beira-mar no pôr do sol" className="absolute inset-0 h-full w-full object-cover" width={1600} height={1008} />
        <div className="absolute inset-0 bg-hero-fade" />
        <p className="absolute bottom-10 left-10 max-w-sm font-display text-3xl text-primary-foreground">
          Cada viagem da família, organizada num lugar só.
        </p>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-display text-2xl font-semibold text-primary">
            Maluki<span className="text-accent">.</span>
          </Link>
          <h1 className="mt-8 text-3xl font-semibold">
            {mode === "in" ? "Bem-vindo de volta" : mode === "up" ? "Criar sua conta" : "Recuperar senha"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "reset" ? "Enviaremos um link para seu e-mail." : "Planeje, organize e reviva suas viagens."}
          </p>

          {mode !== "reset" && (
            <>
              {mode === "up" && (
                <div className="mt-6 space-y-1.5">
                  <Label htmlFor="invite-code">Código de convite da família (opcional)</Label>
                  <Input id="invite-code" autoComplete="off" placeholder="Código recebido" value={inviteCode} onChange={(e) => setInviteCode(normalizeInviteCode(e.target.value))} />
                </div>
              )}
              <button
                type="button"
                onClick={google}
                className="mt-8 flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-[#747775] bg-[#FFFFFF] px-3 text-sm font-medium text-[#1F1F1F]"
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" /><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" /><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" /><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" /></svg>
                Continuar com o Google
              </button>
              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> ou com e-mail <div className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          <form onSubmit={submit} className={mode === "reset" ? "mt-8 space-y-4" : "space-y-4"}>
            {mode === "up" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Seu nome</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {mode !== "reset" && (
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {mode === "in" && (
                    <button type="button" onClick={() => setMode("reset")} className="text-xs text-primary hover:underline">
                      Esqueci a senha
                    </button>
                  )}
                </div>
                <Input id="password" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}
            <Button type="submit" className="h-11 w-full rounded-full" disabled={busy}>
              {busy ? "Aguarde…" : mode === "in" ? "Entrar" : mode === "up" ? "Criar conta" : "Enviar link"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "in" ? (
              <>Ainda não tem conta? <button onClick={() => setMode("up")} className="font-medium text-primary hover:underline">Criar conta</button></>
            ) : (
              <button onClick={() => setMode("in")} className="font-medium text-primary hover:underline">Voltar para entrar</button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
