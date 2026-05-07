import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import * as React from "react";
import { LayoutDashboard, UtensilsCrossed, Image as ImageIcon, ShoppingBag, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · NOVA Kitchen" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLayout,
});

const links = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
] as const;

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });

  React.useEffect(() => {
    if (loading) return;
    if (!user && path !== "/admin/login") navigate({ to: "/admin/login" });
  }, [user, loading, navigate, path]);

  // Login page renders without the chrome
  if (path === "/admin/login") return <Outlet />;

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (user && !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div className="glass max-w-md rounded-2xl p-8">
          <h1 className="text-2xl font-bold">Not authorized</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account doesn't have admin access. Ask the owner to grant you the <code>admin</code> role.
          </p>
          <button
            className="mt-6 rounded-xl border border-border px-4 py-2 text-sm hover:bg-secondary/50"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/admin/login" });
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-background/60 backdrop-blur-xl md:flex">
        <Link to="/" className="flex items-center gap-2 border-b border-border p-5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-neon)] shadow-[var(--shadow-neon)]">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold">NOVA</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin</p>
          </div>
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  active ? "text-primary-foreground" : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="admin-pill"
                    className="absolute inset-0 -z-10 rounded-xl bg-[image:var(--gradient-neon)] shadow-[var(--shadow-neon)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/admin/login" });
          }}
          className="m-3 flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>

      <div className="md:pl-60">
        {/* Mobile top nav */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-border p-3 md:hidden">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs ${
                  active
                    ? "bg-[image:var(--gradient-neon)] text-primary-foreground"
                    : "border border-border text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
        <main className="p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}