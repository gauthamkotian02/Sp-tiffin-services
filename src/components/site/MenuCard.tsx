import { motion } from "framer-motion";
import { Heart, Plus, Flame } from "lucide-react";
import type { MenuItem } from "@/data/menu";
import { useCart } from "@/store/cart";

export function MenuCard({ item }: { item: MenuItem }) {
  const { add, toggleFav, favorites } = useCart();
  const isFav = favorites.includes(item.id);
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group glass relative flex flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-[image:var(--gradient-card)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <button
          onClick={() => toggleFav(item.id)}
          aria-label="Toggle favorite"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-border bg-background/60 backdrop-blur transition hover:bg-background"
        >
          <Heart className={`h-4 w-4 ${isFav ? "fill-[var(--neon-magenta)] text-[var(--neon-magenta)]" : ""}`} />
        </button>
        {item.trending && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-1 text-[10px] font-semibold text-foreground backdrop-blur">
            <Flame className="h-3 w-3 text-[var(--neon-magenta)]" /> Trending
          </span>
        )}
        {!item.available && (
          <span className="absolute bottom-3 left-3 rounded-full bg-destructive/80 px-2 py-1 text-[10px] font-semibold text-destructive-foreground">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-tight">{item.name}</h3>
          <span className="shrink-0 rounded-lg border border-border px-2 py-1 text-sm font-bold neon-text">
            ₹{item.price.toFixed(2)}
          </span>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        {item.combo && (
          <p className="text-[11px] text-[var(--neon-cyan)]">{item.combo}</p>
        )}
        <button
          disabled={!item.available}
          onClick={() => add(item)}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-neon)] px-3 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-neon)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <Plus className="h-4 w-4" /> Add to cart
        </button>
      </div>
    </motion.article>
  );
}