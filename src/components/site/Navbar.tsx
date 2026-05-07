import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/store/cart";
import { RESTAURANT_NAME } from "@/data/menu";

export function Navbar({ onCartClick }: { onCartClick: () => void }) {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40">
      <div className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-neon)] shadow-[var(--shadow-neon)]">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">{RESTAURANT_NAME}</span>
        </Link>
        <button
          onClick={onCartClick}
          className="relative inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-all hover:bg-secondary/50"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Cart</span>
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[image:var(--gradient-neon)] px-1 text-[11px] font-bold text-primary-foreground shadow-[var(--shadow-neon)]"
            >
              {count}
            </motion.span>
          )}
        </button>
      </div>
    </header>
  );
}