import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type Banner = { id: string; title: string; subtitle: string | null; image_url: string | null; link_url: string | null };

export function BannerCarousel() {
  const [items, setItems] = React.useState<Banner[]>([]);
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    supabase
      .from("banners")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setItems((data ?? []) as Banner[]));
  }, []);

  React.useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;
  const b = items[idx];

  const inner = (
    <AnimatePresence mode="wait">
      <motion.div
        key={b.id}
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="relative h-56 w-full overflow-hidden sm:h-72"
      >
        {b.image_url && <img src={b.image_url} alt={b.title} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-center gap-2 p-6 sm:p-10">
          <h3 className="text-2xl font-bold sm:text-3xl">{b.title}</h3>
          {b.subtitle && <p className="max-w-md text-sm text-muted-foreground sm:text-base">{b.subtitle}</p>}
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <section className="mx-auto mt-16 max-w-6xl px-4">
      <div className="glass relative overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-glow)]">
        {b.link_url ? (
          <a href={b.link_url} target="_blank" rel="noreferrer">{inner}</a>
        ) : (
          inner
        )}
        {items.length > 1 && (
          <div className="absolute bottom-3 right-4 z-20 flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-[image:var(--gradient-neon)]" : "w-1.5 bg-muted-foreground/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}