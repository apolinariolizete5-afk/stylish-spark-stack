import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { CONTACTOS } from "@/lib/constants";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Definir nova palavra-passe — Moza Empregos" },
      { name: "description", content: "Defina uma nova palavra-passe para a sua conta de administrador do portal de vagas." },
      { property: "og:title", content: "Definir nova palavra-passe — Moza Empregos" },
      { property: "og:description", content: "Defina uma nova palavra-passe para a sua conta de administrador." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // O link do email traz o token; o cliente Supabase cria a sessão de recuperação.
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As palavras-passe não coincidem.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
    toast.success("Palavra-passe alterada com sucesso.");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-primary via-primary to-primary/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold">{CONTACTOS.siteName}</span>
        </Link>

        <h1 className="text-center font-display text-2xl font-bold">Nova palavra-passe</h1>

        {done ? (
          <div className="mt-6 space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              A sua palavra-passe foi actualizada. Já pode entrar na área de administração.
            </p>
            <Button asChild className="w-full">
              <Link to="/admin">Ir para o admin</Link>
            </Button>
          </div>
        ) : (
          <>
            {!ready && (
              <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-center text-sm text-destructive">
                Abra esta página a partir do link enviado para o seu email. Se o link expirou, peça um novo em /admin.
              </p>
            )}
            <form onSubmit={submit} className="mt-6 space-y-3">
              <div>
                <Label htmlFor="np">Nova palavra-passe</Label>
                <Input id="np" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="np2">Confirmar palavra-passe</Label>
                <Input id="np2" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !ready}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
