import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/site/Navbar";
import { CartProvider } from "@/store/cart";
import { CartDrawer } from "@/components/site/CartDrawer";
import { ChefHat, Clock, Flame } from "lucide-react";

export const Route = createFileRoute("/recipes")({
  head: () => ({
    meta: [
      { title: "Food Stories — NOVA Kitchen" },
      { name: "description", content: "Every dish has a story. Explore the recipes, techniques and inspirations behind our menu." },
      { property: "og:title", content: "Food Stories — NOVA Kitchen" },
      { property: "og:description", content: "Recipes and inspirations behind our menu." },
    ],
  }),
  component: RecipesPage,
});

type Blog = { id: string; title: string; excerpt: string | null; content: string; image_url: string | null; author: string | null; created_at: string };

function RecipesPage() {
  const [open, setOpen] = React.useState(false);
  const [blogs, setBlogs] = React.useState<Blog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [active, setActive] = React.useState<string | null>(null);

  React.useEffect(() => {
    supabase
      .from("blogs")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setBlogs((data ?? []) as Blog[]);
        setLoading(false);
      });
  }, []);

  const featured = blogs[0];
  const rest = blogs.slice(1);

  return (
    <CartProvider>
      <main className="relative min-h-screen pb-24">
        <Navbar onCartClick={() => setOpen(true)} />

        <section className="mx-auto mt-12 max-w-6xl px-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <ChefHat className="h-3.5 w-3.5 text-[var(--neon-cyan)]" />
            Food Stories
          </div>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
            Recipes from our <span className="neon-text">kitchen</span>
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Every plate has a backstory. Dive into the dishes our chefs are obsessing over right now.
          </p>

          {loading ? (
            <p className="mt-12 text-sm text-muted-foreground">Loading recipes…</p>
          ) : blogs.length === 0 ? (
            <div className="glass mt-12 rounded-2xl p-10 text-center">
              <p className="text-sm text-muted-foreground">No recipes yet. The chefs are cooking — check back soon.</p>
            </div>
          ) : (
            <>
              {featured && (
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setActive(featured.id)}
                  className="glass group mt-10 grid cursor-pointer overflow-hidden rounded-3xl border border-border transition-all hover:shadow-[var(--shadow-glow)] md:grid-cols-2"
                >
                  {featured.image_url && (
                    <div className="relative h-64 overflow-hidden md:h-auto">
                      <img src={featured.image_url} alt={featured.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-[image:var(--gradient-neon)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-[var(--shadow-neon)]">
                        <Flame className="h-3 w-3" /> Featured
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col justify-center p-6 md:p-10">
                    <h2 className="text-2xl font-bold leading-tight sm:text-3xl">{featured.title}</h2>
                    {featured.excerpt && <p className="mt-3 text-sm text-muted-foreground">{featured.excerpt}</p>}
                    <div className="mt-5 flex items-center gap-3 text-[11px] text-muted-foreground">
                      {featured.author && <span className="inline-flex items-center gap-1"><ChefHat className="h-3 w-3" /> {featured.author}</span>}
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(featured.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.article>
              )}

              {rest.length > 0 && (
                <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((b, i) => (
                    <motion.article
                      key={b.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setActive(b.id)}
                      className="glass group cursor-pointer overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
                    >
                      {b.image_url && (
                        <div className="relative h-44 overflow-hidden">
                          <img src={b.image_url} alt={b.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="text-base font-bold leading-tight">{b.title}</h3>
                        {b.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{b.excerpt}</p>}
                        <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
                          {b.author && <span className="inline-flex items-center gap-1"><ChefHat className="h-3 w-3" /> {b.author}</span>}
                          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(b.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {active && (() => {
          const b = blogs.find((x) => x.id === active);
          if (!b) return null;
          return (
            <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-md" onClick={() => setActive(null)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="glass max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border"
              >
                {b.image_url && <img src={b.image_url} alt={b.title} className="h-56 w-full object-cover" />}
                <div className="p-6">
                  <h2 className="text-2xl font-bold">{b.title}</h2>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                    {b.author && <span>{b.author}</span>}
                    <span>{new Date(b.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{b.content}</p>
                </div>
              </motion.div>
            </div>
          );
        })()}

        <CartDrawer open={open} onClose={() => setOpen(false)} />
      </main>
    </CartProvider>
  );
}