import { useState, useEffect } from "react";
import { MessageSquare, Mail, User, Phone, CheckCircle2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { normalizeWhatsApp, formatPhoneDisplay, isValidPhone } from "@/lib/phone";
import { toast } from "sonner";

export interface MemberContactData {
  userId: string;
  name: string;
  email?: string | null | undefined;
  phone?: string | null | undefined;
  isSelf?: boolean;
}

interface EditMemberContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberContactData | null;
  onSaved?: () => void;
}

export function EditMemberContactModal({
  open,
  onOpenChange,
  member,
  onSaved,
}: EditMemberContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (member && open) {
      setName(member.name || "");
      setEmail(member.email || "");
      setPhone(member.phone ? formatPhoneDisplay(member.phone) : "");
    }
  }, [member, open]);

  function handlePhoneChange(val: string) {
    // Permite digitação livre mas formata automaticamente se for padrão brasileiro
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 11 && !val.startsWith("+")) {
      if (digits.length > 6) {
        setPhone(`(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`);
      } else if (digits.length > 2) {
        setPhone(`(${digits.slice(0, 2)}) ${digits.slice(2)}`);
      } else if (digits.length > 0) {
        setPhone(`(${digits}`);
      } else {
        setPhone("");
      }
    } else {
      setPhone(val);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!member) return;

    if (!name.trim()) {
      toast.error("O nome não pode estar em branco.");
      return;
    }

    if (phone.trim() && !isValidPhone(phone)) {
      toast.error("Por favor, informe um número de telefone/WhatsApp válido com DDD.");
      return;
    }

    setSaving(true);
    try {
      const normalizedPhone = phone.trim() ? normalizeWhatsApp(phone) : null;
      const normalizedEmail = email.trim() ? email.trim().toLowerCase() : null;

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: name.trim(),
          email: normalizedEmail,
          phone: normalizedPhone,
        })
        .eq("id", member.userId);

      if (error) throw error;

      toast.success("Dados de contato atualizados com sucesso!");
      onSaved?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar dados de contato.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] rounded-3xl p-5 sm:p-6">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-display font-semibold">
                {member?.isSelf ? "Meu Perfil & Contato" : `Contato de ${member?.name || "Membro"}`}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Dados usados para envio de notificações por WhatsApp e E-mail.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="contact-name" className="text-xs font-semibold flex items-center gap-1.5">
              <User className="size-3.5 text-muted-foreground" /> Nome Completo
            </Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Carlos Silva"
              required
              className="rounded-xl text-xs sm:text-sm h-10"
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-1.5">
            <Label htmlFor="contact-phone" className="text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="size-3.5 text-emerald-600 dark:text-emerald-400" /> WhatsApp / Celular
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">com DDD (Ex: 11 99999-8888)</span>
            </Label>
            <div className="relative">
              <Input
                id="contact-phone"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(11) 98765-4321 ou +5511987654321"
                className="rounded-xl text-xs sm:text-sm h-10 pl-9 font-mono"
              />
              <MessageSquare className="size-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-3 pointer-events-none" />
            </div>
            {phone && isValidPhone(phone) && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="size-3" /> Padrão internacional: {normalizeWhatsApp(phone)}
              </p>
            )}
          </div>

          {/* E-mail */}
          <div className="space-y-1.5">
            <Label htmlFor="contact-email" className="text-xs font-semibold flex items-center gap-1.5">
              <Mail className="size-3.5 text-sky-600 dark:text-sky-400" /> E-mail para Alertas
            </Label>
            <div className="relative">
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                className="rounded-xl text-xs sm:text-sm h-10 pl-9"
              />
              <Mail className="size-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Informação sobre Notificações */}
          <div className="rounded-2xl border border-border/70 bg-secondary/50 p-3 text-[11px] sm:text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <AlertCircle className="size-3.5 text-primary" />
              <span>Como funcionam as notificações?</span>
            </div>
            <p>
              Ao vincular este membro a uma viagem, o <strong>n8n</strong> utilizará este WhatsApp e E-mail para enviar alertas automáticos de novas viagens, atualizações e roteiros.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs h-9"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-xl text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={saving}
            >
              {saving ? "Salvando…" : "Salvar Contato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
