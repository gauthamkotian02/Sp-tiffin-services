import { motion } from "framer-motion";
import heroImg from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { ArrowDown, Flame } from "lucide-react";
import { useSiteSettings } from "@/lib/useSiteSettings";

function renderHighlighted(text: string) {
  // Replace **word** with neon-text span
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <span key={i} className="neon-text">{p.slice(2, -2)}</span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export function Hero() {
  const s = useSiteSettings();
  const eyebrow = s.hero_eyebrow || "Order via WhatsApp · No login needed";
  const title = s.hero_title || "Taste the **future**.";
  const subtitle = s.hero_subtitle || "Order in seconds.";
  const description =
    s.hero_description ||
    "A neon-lit kitchen serving signature smash burgers, ramen and wood-fired pies — sent straight to our chefs through WhatsApp.";
  const ctaPrimary = s.hero_cta_primary || "Browse Menu";
  const ctaSecondary = s.hero_cta_secondary || "Tonight's Specials";
  const image = s.hero_image_url || heroImg;
  return (
    <section className="relative mx-auto mt-10 max-w-6xl px-4">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground"
          >
            <Flame className="h-3.5 w-3.5 text-[var(--neon-magenta)]" />
            {eyebrow}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
          >
            {renderHighlighted(title)}<br />
            {subtitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="mt-5 max-w-md text-base text-muted-foreground"
          >
            {description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button
              variant="neon"
              size="lg"
              onClick={() =>
                document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              {ctaPrimary} <ArrowDown className="h-4 w-4" />
            </Button>
            <Button variant="glass" size="lg">
              {ctaSecondary}
            </Button>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[image:var(--gradient-neon)] opacity-30 blur-3xl" />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="overflow-hidden rounded-[2rem] border border-border shadow-[var(--shadow-glow)]"
          >
            <img
              src={image}
              alt={s.hero_title || "Signature dishes under neon light"}
              width={1536}
              height={1024}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}