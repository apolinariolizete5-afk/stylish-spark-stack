import { useState } from "react";
import { Loader2, Send, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Vaga } from "@/lib/vagas";

type Props = {
  vaga: Vaga;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Doc = { label: string; file: File | null };

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function CandidaturaDialog({ vaga, open, onOpenChange }: Props) {
  const [nome, setNome] = useState("");
  const [emailRemetente, setEmailRemetente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [cv, setCv] = useState<File | null>(null);
  const [bi, setBi] = useState<File | null>(null);
  const [outros, setOutros] = useState<Doc[]>([]);
  const [sending, setSending] = useState(false);

  function addOutro(f: File | null) {
    if (!f) return;
    if (f.size > MAX_SIZE) {
      toast.error(`${f.name} excede 10 MB`);
      return;
    }
    setOutros((s) => [...s, { label: f.name, file: f }]);
  }

  async function uploadOne(file: File, folder: string): Promise<string> {
    const path = `${folder}/${Date.now()}-${sanitize(file.name)}`;
    const { error } = await supabase.storage.from("candidaturas").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;
    const { data, error: signErr } = await supabase.storage
      .from("candidaturas")
      .createSignedUrl(path, 60 * 60 * 24 * 30); // 30 dias
    if (signErr || !data) throw signErr ?? new Error("Falha a gerar ligação");
    return data.signedUrl;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!vaga.email_candidatura) return;
    if (!nome.trim() || !emailRemetente.trim()) {
      toast.error("Preencha nome e email.");
      return;
    }
    if (!cv) {
      toast.error("Anexe o seu CV.");
      return;
    }
    for (const f of [cv, bi, ...outros.map((o) => o.file)]) {
      if (f && f.size > MAX_SIZE) {
        toast.error(`${f.name} excede 10 MB`);
        return;
      }
    }

    setSending(true);
    try {
      const folder = `${vaga.id}/${Date.now()}-${sanitize(nome).slice(0, 30)}`;
      const attachments: { label: string; url: string }[] = [];

      const cvUrl = await uploadOne(cv, folder);
      attachments.push({ label: `CV — ${cv.name}`, url: cvUrl });

      if (bi) {
        const biUrl = await uploadOne(bi, folder);
        attachments.push({ label: `BI — ${bi.name}`, url: biUrl });
      }
      for (const o of outros) {
        if (!o.file) continue;
        const url = await uploadOne(o.file, folder);
        attachments.push({ label: o.file.name, url });
      }

      const subject = `Candidatura: ${vaga.titulo} — ${nome}`;
      const bodyLines = [
        `Candidatura para a vaga: ${vaga.titulo}`,
        `Empresa: ${vaga.empresa}`,
        `Província: ${vaga.provincia}`,
        "",
        `Nome: ${nome}`,
        `Email: ${emailRemetente}`,
        telefone ? `Telefone: ${telefone}` : null,
        "",
        mensagem ? "Mensagem:" : null,
        mensagem || null,
        mensagem ? "" : null,
        "Documentos anexos (ligações válidas por 30 dias):",
        ...attachments.map((a) => `• ${a.label}: ${a.url}`),
      ].filter((l): l is string => l !== null);

      const body = bodyLines.join("\n");
      const to = encodeURIComponent(vaga.email_candidatura);
      const su = encodeURIComponent(subject);
      const bo = encodeURIComponent(body);

      // Abrir Gmail em nova aba (funciona também com apps de email nativos como fallback via mailto).
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${bo}`;
      const mailtoUrl = `mailto:${to}?subject=${su}&body=${bo}`;

      const win = window.open(gmailUrl, "_blank", "noopener,noreferrer");
      if (!win) {
        window.location.href = mailtoUrl;
      }

      toast.success("Abrimos o seu email. Reveja e clique enviar.");
      onOpenChange(false);
      // reset
      setNome(""); setEmailRemetente(""); setTelefone(""); setMensagem("");
      setCv(null); setBi(null); setOutros([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar candidatura");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar candidatura</DialogTitle>
          <DialogDescription>
            Preencha os dados e anexe os documentos. Vamos abrir o seu email (Gmail) com tudo pronto para enviar para <span className="font-medium text-foreground">{vaga.email_candidatura}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="c-nome">Nome completo *</Label>
              <Input id="c-nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="c-email">O seu email *</Label>
              <Input id="c-email" type="email" value={emailRemetente} onChange={(e) => setEmailRemetente(e.target.value)} required />
            </div>
          </div>
          <div>
            <Label htmlFor="c-tel">Telefone</Label>
            <Input id="c-tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="+258 ..." />
          </div>
          <div>
            <Label htmlFor="c-msg">Mensagem / carta de apresentação</Label>
            <Textarea id="c-msg" rows={4} value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
          </div>

          <FileField label="Curriculum Vitae (CV) *" file={cv} onChange={setCv} />
          <FileField label="Bilhete de Identidade (BI)" file={bi} onChange={setBi} />

          <div>
            <Label className="mb-1.5 block">Outros documentos</Label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-3 text-sm hover:border-primary hover:bg-accent/40">
              <Upload className="h-4 w-4" />
              Adicionar ficheiro
              <input
                type="file"
                className="hidden"
                onChange={(e) => { addOutro(e.target.files?.[0] ?? null); e.target.value = ""; }}
              />
            </label>
            {outros.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm">
                {outros.map((o, i) => (
                  <li key={i} className="flex items-center justify-between rounded border border-border bg-muted/40 px-2 py-1">
                    <span className="truncate">{o.label}</span>
                    <button
                      type="button"
                      onClick={() => setOutros((s) => s.filter((_, j) => j !== i))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={sending}>
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Enviar candidatura
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FileField({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <div className="flex items-center gap-2">
        <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-3 text-sm hover:border-primary hover:bg-accent/40">
          <Upload className="h-4 w-4" />
          {file ? file.name : "Escolher ficheiro"}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
        </label>
        {file && (
          <button type="button" onClick={() => onChange(null)} className="text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
