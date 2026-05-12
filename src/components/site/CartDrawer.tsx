import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, X, MessageCircle } from "lucide-react";
import { useCart } from "@/store/cart";
import { WHATSAPP_NUMBER, RESTAURANT_NAME } from "@/data/menu";
import { supabase } from "@/integrations/supabase/client";

function buildWhatsAppMessage(
  lines: ReturnType<typeof useCart>["lines"],
  total: number,
  notes: string,
) {
  const lines_ = lines
    .map(
      (l, i) =>
        `${i + 1}. ${l.item.name} × ${l.qty} — ₹${(l.item.price * l.qty).toFixed(2)}`,
    )
    .join("\n");
  const stamp = new Date().toLocaleString();
  return [
    `*New order — ${RESTAURANT_NAME}*`,
    "",
    lines_,
    "",
    `*Total:* $${total.toFixed(2)}`,
    notes ? `*Notes:* ${notes}` : "",
    "",
    `_Placed at ${stamp}_`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lines, total, setQty, remove, clear, notes, setNotes } = useCart();

  const sendOrder = async () => {
    if (lines.length === 0) return;
    const msg = buildWhatsAppMessage(lines, total, notes);
    // Log to DB so the admin dashboard sees it live
    try {
      const { data: order } = await supabase
        .from("orders")
        .insert({
          total,
          item_count: lines.reduce((s, l) => s + l.qty, 0),
          notes: notes || null,
          status: "received",
        })
        .select("id")
        .single();
      if (order?.id) {
        await supabase.from("order_items").insert(
          lines.map((l) => ({
            order_id: order.id,
            menu_item_id: null,
            name: l.item.name,
            price: l.item.price,
            quantity: l.qty,
            image_url: l.item.image,
          })),
        );
      }
    } catch (e) {
      console.error("order log failed", e);
    }
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <h3 className="text-lg font-bold">Your cart</h3>
              <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 hover:bg-secondary/50">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {lines.length === 0 ? (
                <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
                  <div>
                    <p>Your cart is empty.</p>
                    <p className="mt-1 text-xs">Add a dish to get started.</p>
                  </div>
                </div>
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {lines.map((l) => (
                      <motion.li
                        key={l.item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        className="glass flex gap-3 rounded-xl p-3"
                      >
                        <img
                          src={l.item.image}
                          alt=""
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold">{l.item.name}</p>
                            <button onClick={() => remove(l.item.id)} aria-label="Remove">
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            ₹{l.item.price.toFixed(2)} each
                          </p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="inline-flex items-center rounded-lg border border-border">
                              <button
                                aria-label="Decrease"
                                onClick={() => setQty(l.item.id, l.qty - 1)}
                                className="grid h-7 w-7 place-items-center hover:bg-secondary/50"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold">{l.qty}</span>
                              <button
                                aria-label="Increase"
                                onClick={() => setQty(l.item.id, l.qty + 1)}
                                className="grid h-7 w-7 place-items-center hover:bg-secondary/50"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-sm font-bold neon-text">
                              ₹{(l.item.price * l.qty).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}

              {lines.length > 0 && (
                <div className="mt-5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Notes for the kitchen
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, 300))}
                    placeholder="Allergies, no onions, address, etc."
                    rows={3}
                    className="glass mt-2 w-full resize-none rounded-xl border border-border p-3 text-sm outline-none focus:border-[var(--neon-cyan)]"
                  />
                </div>
              )}
            </div>

            <div className="border-t border-border p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <motion.span
                  key={total}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-bold neon-text"
                >
                  ₹{total.toFixed(2)}
                </motion.span>
              </div>
              <button
                onClick={sendOrder}
                disabled={lines.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--whatsapp)] py-3 font-semibold text-[var(--whatsapp-foreground)] shadow-[0_10px_30px_-10px_oklch(0.74_0.18_150/0.6)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <MessageCircle className="h-5 w-5" />
                Order on WhatsApp
              </button>
              {lines.length > 0 && (
                <button
                  onClick={clear}
                  className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear cart
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}