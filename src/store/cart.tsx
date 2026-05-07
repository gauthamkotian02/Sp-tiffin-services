import * as React from "react";
import type { MenuItem } from "@/data/menu";

export type CartLine = { item: MenuItem; qty: number };

type CartState = {
  lines: CartLine[];
  favorites: string[];
  notes: string;
  add: (item: MenuItem) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  toggleFav: (id: string) => void;
  setNotes: (n: string) => void;
  total: number;
  count: number;
};

const Ctx = React.createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>([]);
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    try {
      const f = JSON.parse(localStorage.getItem("nova_favs") || "[]");
      if (Array.isArray(f)) setFavorites(f);
    } catch {}
  }, []);
  React.useEffect(() => {
    localStorage.setItem("nova_favs", JSON.stringify(favorites));
  }, [favorites]);

  const add = (item: MenuItem) =>
    setLines((prev) => {
      const existing = prev.find((l) => l.item.id === item.id);
      if (existing) return prev.map((l) => (l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { item, qty: 1 }];
    });

  const remove = (id: string) => setLines((p) => p.filter((l) => l.item.id !== id));
  const setQty = (id: string, qty: number) =>
    setLines((p) =>
      qty <= 0 ? p.filter((l) => l.item.id !== id) : p.map((l) => (l.item.id === id ? { ...l, qty } : l)),
    );
  const clear = () => setLines([]);
  const toggleFav = (id: string) =>
    setFavorites((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const total = lines.reduce((s, l) => s + l.item.price * l.qty, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);

  return (
    <Ctx.Provider
      value={{ lines, favorites, notes, add, remove, setQty, clear, toggleFav, setNotes, total, count }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = React.useContext(Ctx);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
}