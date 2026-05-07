import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import * as React from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login · NOVA" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

function LoginPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!loading && user && isAdmin) navigate({ to: "/admin/dashboard" });
  }, [user, isAdmin, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { setErr(parsed.error.issues[0].message); return; }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${window.location.origin}/admin/dashboard` },
        });
        if (error) throw error;
        setErr("Account created. Check your email to confirm, then ask the owner to grant admin access.");
      } else {
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;
      }
    } catch (e: any) {
      setErr(e.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass w-full max-w-md rounded-2xl p-7"
      >
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[image:var(--gradient-neon)] shadow-[var(--shadow-neon)]">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Owner Console</h1>
            <p className="text-xs text-muted-foreground">Restricted access</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-border bg-background/60 p-3 text-sm outline-none focus:border-[var(--neon-cyan)]"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-xl border border-border bg-background/60 p-3 text-sm outline-none focus:border-[var(--neon-cyan)]"
            />
          </div>
          {err && (
            <p className="rounded-lg border border-border bg-secondary/40 p-2 text-xs">{err}</p>
          )}
          <Button type="submit" variant="neon" size="lg" className="w-full" disabled={busy}>
            <ShieldCheck className="h-4 w-4" />
            {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="hover:text-foreground">
            {mode === "signin" ? "Create account" : "Have an account? Sign in"}
          </button>
          <Link to="/" className="hover:text-foreground">← Back to site</Link>
        </div>
      </motion.div>
    </div>
  );
}