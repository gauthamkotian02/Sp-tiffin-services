import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/site/Navbar";
import { CartProvider } from "@/store/cart";
import { CartDrawer } from "@/components/site/CartDrawer";
import { Button } from "@/components/ui/button";
import { Star, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback — NOVA Kitchen" },
      { name: "description", content: "Share your experience and read what other guests are saying." },
    ],
  }),
  component: FeedbackPage,
});

type Feedback = { id: string; name: string; rating: number; message: string; created_at: string };

function FeedbackPage() {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<Feedback[]>([]);
  const [form, setForm] = React.useState({ name: "", email: "", rating: 5, message: "" });
  const [submitting, setSubmitting] = React.useState(false);

  const load = () => {
    supabase.from("feedback").select("id,name,rating,message,created_at").eq("approved", true).order("created_at", { ascending: false }).limit(50).then(({ data }) => {
      setItems((data ?? []) as Feedback[]);
    });
  };
  React.useEffect(load, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) return;
    setSubmitting(true);
    const { error } = await supabase.from("feedback").insert({ name: form.name, email: form.email || null, rating: form.rating, message: form.message });
    setSubmitting(false);
    if (error) { toast.error("Could not submit"); return; }
    toast.success("Thanks for the feedback!");
    setForm({ name: "", email: "", rating: 5, message: "" });
    load();
  };

  const avg = items.length ? items.reduce((s, i) => s + i.rating, 0) / items.length : 0;

  return (
    <CartProvider>
      <main className="relative min-h-screen pb-24">
        <Navbar onCartClick={() => setOpen(true)} />
        <section className="mx-auto mt-12 max-w-6xl px-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Guest book</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Your <span className="neon-text">voice</span> matters</h1>
          <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(avg) ? "fill-[var(--neon-magenta)] text-[var(--neon-magenta)]" : "text-muted-foreground/40"}`} />)}</div>
            <span>{avg.toFixed(1)} · {items.length} review{items.length === 1 ? "" : "s"}</span>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
            <form onSubmit={submit} className="glass h-fit space-y-4 rounded-2xl p-6">
              <h2 className="text-lg font-semibold">Leave a review</h2>
              <input className={inp} placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className={inp} placeholder="Email (optional)" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Rating</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((n) => (
                    <button type="button" key={n} onClick={() => setForm({ ...form, rating: n })}>
                      <Star className={`h-7 w-7 transition-all ${n <= form.rating ? "fill-[var(--neon-magenta)] text-[var(--neon-magenta)] drop-shadow-[0_0_8px_var(--neon-magenta)]" : "text-muted-foreground/40"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea className={`${inp} min-h-32 resize-none`} placeholder="Tell us about your experience…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
              <Button type="submit" variant="neon" size="lg" disabled={submitting} className="w-full">
                <Send className="h-4 w-4" /> {submitting ? "Sending…" : "Submit feedback"}
              </Button>
            </form>

            <div className="space-y-4">
              {items.length === 0 && <p className="text-sm text-muted-foreground">Be the first to leave a review.</p>}
              {items.map((f, i) => (
                <motion.div key={f.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{f.name}</p>
                    <div className="flex">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={`h-3.5 w-3.5 ${j < f.rating ? "fill-[var(--neon-magenta)] text-[var(--neon-magenta)]" : "text-muted-foreground/30"}`} />)}</div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{f.message}</p>
                  <p className="mt-3 text-[11px] text-muted-foreground/70">{new Date(f.created_at).toLocaleDateString()}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        <CartDrawer open={open} onClose={() => setOpen(false)} />
      </main>
    </CartProvider>
  );
}

const inp = "w-full rounded-xl border border-border bg-background/60 p-3 text-sm outline-none focus:border-[var(--neon-cyan)]";