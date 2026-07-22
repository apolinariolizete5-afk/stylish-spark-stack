import { useEffect, useState } from "react";
import { Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { CONTACTOS } from "@/lib/constants";

export function AdminLogin({ authenticatedNotAdmin }: { authenticatedNotAdmin: boolean }) {
  const [tab, setTab] = useState("login");
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.rpc("has_any_admin").then(({ data }) => setHasAdmin(!!data));
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Sessão iniciada");
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + "/admin" },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Conta criada. Já pode iniciar sessão.");
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

        <h1 className="text-center font-display text-2xl font-bold">Área do Administrador</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Inicie sessão para gerir as vagas.
        </p>

        {authenticatedNotAdmin && (
          <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-center text-sm text-destructive">
            A sua conta não tem permissões de administrador.
          </div>
        )}

        {hasAdmin === false ? (
          <Tabs value={tab} onValueChange={setTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={signIn} className="mt-4 space-y-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="password">Palavra-passe</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <p className="mt-4 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
                Ainda não existe nenhum administrador. O primeiro utilizador registado será automaticamente admin.
              </p>
              <form onSubmit={signUp} className="mt-3 space-y-3">
                <div>
                  <Label htmlFor="email2">Email</Label>
                  <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="password2">Palavra-passe</Label>
                  <Input id="password2" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Criar conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        ) : (
          <form onSubmit={signIn} className="mt-6 space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Palavra-passe</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading || hasAdmin === null}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Entrar
            </Button>
            <p className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
              O registo público está desativado. Peça a um administrador existente para lhe conceder acesso.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
