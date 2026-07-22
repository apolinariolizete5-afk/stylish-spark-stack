import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, ImagePlus, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { PROVINCIAS, TIPOS_CONTRATO } from "@/lib/constants";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/nova")({
  component: NovaVagaPage,
});

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

function NovaVagaPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    titulo: "",
    empresa: "",
    provincia: "",
    tipo_contrato: "",
    salario: "",
    prazo: "",
    descricao: "",
    requisitos: "",
    como_candidatar: "",
    imagem_url: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function uploadImage(): Promise<string | null> {
    if (!file) return form.imagem_url.trim() || null;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("vaga-imagens").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) throw error;
    // Bucket privado — usar URL assinada de longa duração (10 anos).
    const { data, error: signErr } = await supabase.storage
      .from("vaga-imagens")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (signErr || !data) throw signErr ?? new Error("Falha a gerar URL");
    return data.signedUrl;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo || !form.empresa || !form.provincia || !form.descricao) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      const imagem_url = await uploadImage();
      const { error } = await supabase.from("vagas").insert({
        titulo: form.titulo,
        empresa: form.empresa,
        provincia: form.provincia,
        tipo_contrato: form.tipo_contrato || null,
        salario: form.salario || null,
        prazo: form.prazo || null,
        descricao: form.descricao,
        requisitos: form.requisitos || null,
        como_candidatar: form.como_candidatar || null,
        imagem_url: imagem_url || null,
        publicada: true,
      });
      if (error) throw error;
      toast.success("Vaga publicada com sucesso.");
      qc.invalidateQueries({ queryKey: ["admin-vagas"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      qc.invalidateQueries({ queryKey: ["vagas"] });
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao publicar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Voltar ao dashboard
      </Link>

      <h1 className="mt-3 font-display text-2xl font-bold">Publicar nova vaga</h1>
      <p className="text-sm text-muted-foreground">Preencha os detalhes abaixo.</p>

      <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Título da vaga *">
            <Input value={form.titulo} onChange={(e) => update("titulo", e.target.value)} required />
          </Field>
          <Field label="Empresa *">
            <Input value={form.empresa} onChange={(e) => update("empresa", e.target.value)} required />
          </Field>
          <Field label="Província *">
            <Select value={form.provincia} onValueChange={(v) => update("provincia", v)}>
              <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent>
                {PROVINCIAS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tipo de contrato">
            <Select value={form.tipo_contrato} onValueChange={(v) => update("tipo_contrato", v)}>
              <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent>
                {TIPOS_CONTRATO.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Salário (opcional)">
            <Input value={form.salario} onChange={(e) => update("salario", e.target.value)} placeholder="ex: 15.000 – 20.000 MT" />
          </Field>
          <Field label="Prazo de candidatura">
            <Input type="date" value={form.prazo} onChange={(e) => update("prazo", e.target.value)} />
          </Field>
        </div>

        <Field label="Descrição *">
          <Textarea rows={5} value={form.descricao} onChange={(e) => update("descricao", e.target.value)} required />
        </Field>
        <Field label="Requisitos">
          <Textarea rows={4} value={form.requisitos} onChange={(e) => update("requisitos", e.target.value)} />
        </Field>
        <Field label="Como candidatar-se">
          <Textarea rows={3} value={form.como_candidatar} onChange={(e) => update("como_candidatar", e.target.value)} placeholder="Ex: enviar CV para..." />
        </Field>

        <div>
          <Label className="mb-2 block">Imagem da vaga</Label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition hover:border-primary hover:bg-accent/40">
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">Carregar ficheiro</span>
              <span className="text-xs text-muted-foreground">JPG, PNG · máx 5 MB</span>
              <input type="file" accept="image/*" className="hidden" onChange={onFile} />
            </label>
            <div className="space-y-2">
              <Label htmlFor="url" className="text-xs text-muted-foreground">Ou colar link de imagem</Label>
              <Input
                id="url"
                value={form.imagem_url}
                onChange={(e) => { update("imagem_url", e.target.value); setFile(null); setPreview(e.target.value); }}
                placeholder="https://..."
              />
            </div>
          </div>
          {preview && (
            <div className="mt-3 overflow-hidden rounded-lg border border-border">
              <img src={preview} alt="Pré-visualização" className="max-h-64 w-full object-cover" />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Button type="button" variant="ghost" onClick={() => navigate({ to: "/admin" })}>Cancelar</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Publicar vaga
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
