import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { CATEGORIES, MENU, type MenuItem } from "@/data/menu";
import { supabase } from "@/integrations/supabase/client";
import { MenuCard } from "./MenuCard";

export function MenuSection() {
  const [cat, setCat] = React.useState<(typeof CATEGORIES)[number]>("All");
  const [q, setQ] = React.useState("");
  const [menu, setMenu] = React.useState<MenuItem[]>(MENU);

  React.useEffect(() => {
    let mounted = true;
    supabase
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!mounted || error || !data || data.length === 0) return;
        setMenu(
          data.map((r: any) => ({
            id: r.id,
            name: r.name,
            description: r.description ?? "",
            price: Number(r.price),
            category: r.category,
            image: r.image_url || "",
            available: r.available && r.in_stock,
            trending: r.trending,
            combo: r.combo ?? undefined,
          })),
        );
      });
    return () => {
      mounted = false;
    };
  }, []);

  const items = menu.filter(
    (i) =>
      (cat === "All" || i.category === cat) &&
      (q.trim() === "" ||
        i.name.toLowerCase().includes(q.toLowerCase()) ||
        i.description.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <section id="menu" className="mx-auto mt-24 max-w-6xl px-4">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">The Menu</p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Tonight's <span className="neon-text">selection</span>
          </h2>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search dishes..."
            className="glass w-full rounded-xl border border-border py-3 pl-10 pr-3 text-sm outline-none focus:border-[var(--neon-cyan)]"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`relative rounded-full border px-4 py-1.5 text-sm transition-all ${
              cat === c
                ? "border-transparent text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat === c && (
              <motion.span
                layoutId="cat-pill"
                className="absolute inset-0 rounded-full bg-[image:var(--gradient-neon)] shadow-[var(--shadow-neon)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{c}</span>
          </button>
        ))}
      </div>

      <motion.div layout className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {items.map((i) => (
            <MenuCard key={i.id} item={i} />
          ))}
        </AnimatePresence>
      </motion.div>

      {items.length === 0 && (
        <p className="mt-12 text-center text-sm text-muted-foreground">No dishes match your search.</p>
      )}
    </section>
  );
}