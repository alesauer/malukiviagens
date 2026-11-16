import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Nova senha — Maluki Viagens" },
      { name: "description", content: "Crie uma nova senha para sua conta." },
      { property: "og:title", content: "Nova senha — Maluki Viagens" },
      { property: "og:description", content: "Crie uma nova senha para sua conta." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.auth.updateUser({ password });
          if (error) { toast.error(error.message); return; }
          toast.success("Senha atualizada!");
          navigate({ to: "/meu-mundo" });
        }}
      >
        <h1 className="text-3xl font-semibold">Criar nova senha</h1>
        <div className="space-y-1.5">
          <Label htmlFor="pw">Nova senha</Label>
          <Input id="pw" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="h-11 w-full rounded-full">Salvar senha</Button>
      </form>
    </div>
  );
}
