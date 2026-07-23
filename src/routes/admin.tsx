import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Briefcase, ExternalLink, LayoutDashboard, LogOut, PlusCircle } from "lucide-react";

import { useAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CONTACTOS } from "@/lib/constants";
import { AdminLogin } from "@/components/admin-login";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { loading, isAdmin, email, userId } = useAdmin();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    document.title = "Admin — " + CONTACTOS.siteName;
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <p className="text-sm text-muted-foreground">A verificar sessão...</p>
      </div>
    );
  }

  if (!userId || !isAdmin) {
    return <AdminLogin authenticatedNotAdmin={!!userId && !isAdmin} />;
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin" });
  }

  const nav = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/nova", label: "Nova vaga", icon: PlusCircle, exact: false },
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
        <Link to="/" className="flex items-center gap-2 border-b border-border p-5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="h-5 w-5" />
          </span>
          <span className="font-display font-bold">Admin</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <p className="mb-2 truncate px-2 text-xs text-muted-foreground">{email}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <Link to="/admin" className="font-display font-bold">Admin</Link>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
