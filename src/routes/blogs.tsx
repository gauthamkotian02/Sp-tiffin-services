import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/site/Navbar";
import { CartProvider } from "@/store/cart";
import { CartDrawer } from "@/components/site/CartDrawer";
import { Calendar, User } from "lucide-react";

export const Route = createFileRoute("/blogs")({
  head: () => ({
    meta: [
      { title: "Blog — NOVA Kitchen" },
      { name: "description", content: "Stories, recipes and behind-the-scenes from our neon-lit kitchen." },
    ],
  }),
  component: BlogsPage,
});

type Blog = { id: string; title: string; excerpt: string | null; content: string; image_url: string | null; author: string | null; created_at: string };

function BlogsPage() {
  const [open, setOpen] = React.useState(false);
  const [blogs, setBlogs] = React.useState<Blog[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.from("blogs").select("*").eq("published", true).order("created_at", { ascending: false }).then(({ data }) => {
      setBlogs((data ?? []) as Blog[]);
      setLoading(false);
    });
  }, []);

  return (
    <CartProvider>
      <main className="relative min-h-screen pb-24">
        <Navbar onCartClick={() => setOpen(true)} />
        <section className="mx-auto mt-12 max-w-6xl px-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Journal</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">From the <span className="neon-text">kitchen</span></h1>
          <p className="mt-3 max-w-xl text-muted-foreground">Recipes, reels, and stories from behind the pass.</p>

          {loading ? (
            <p className="mt-12 text-sm text-muted-foreground">Loading…</p>
          ) : blogs.length === 0 ? (
            <div className="glass mt-12 rounded-2xl p-10 text-center">
              <p className="text-sm text-muted-foreground">No posts yet. Check back soon.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((b, i) => (
                <motion.article
                  key={b.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass group overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
                >
                  {b.image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img src={b.image_url} alt={b.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="text-lg font-bold leading-tight">{b.title}</h2>
                    {b.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{b.excerpt}</p>}
                    <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
                      {b.author && <span className="inline-flex items-center gap-1"><User className="h-3 w-3" /> {b.author}</span>}
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>
        <CartDrawer open={open} onClose={() => setOpen(false)} />
      </main>
    </CartProvider>
  );
}