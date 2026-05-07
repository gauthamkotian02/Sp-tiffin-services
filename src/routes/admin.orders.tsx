import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({ component: OrdersAdmin });

type Order = {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  notes: string | null;
  total: number;
  item_count: number;
  status: string;
  created_at: string;
  order_items?: { name: string; quantity: number; price: number }[];
};

const STATUSES = ["received", "preparing", "out_for_delivery", "completed", "cancelled"];

function OrdersAdmin() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  const load = React.useCallback(async () => {
    let q = supabase.from("orders").select("*, order_items(name,quantity,price)").order("created_at", { ascending: false });
    if (from) q = q.gte("created_at", new Date(from).toISOString());
    if (to) q = q.lte("created_at", new Date(to + "T23:59:59").toISOString());
    const { data } = await q;
    setOrders((data ?? []) as Order[]);
  }, [from, to]);

  React.useEffect(() => {
    load();
    const ch = supabase.channel("orders-live").on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "orders" },
      (payload) => {
        toast.success(`New order · $${Number((payload.new as any).total).toFixed(2)}`);
        load();
      },
    ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    load();
  };

  const exportCsv = () => {
    const rows = [["ID","Date","Customer","Phone","Items","Total","Status","Notes"]];
    orders.forEach((o) => rows.push([
      o.id, format(new Date(o.created_at), "yyyy-MM-dd HH:mm"),
      o.customer_name ?? "", o.customer_phone ?? "",
      (o.order_items ?? []).map((i) => `${i.name} x${i.quantity}`).join(" | "),
      o.total.toString(), o.status, (o.notes ?? "").replace(/\n/g, " "),
    ]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">WhatsApp · live</p>
          <h1 className="mt-1 text-3xl font-bold">Orders</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border border-border bg-background/60 p-2 text-sm" />
          <span className="text-muted-foreground">→</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border border-border bg-background/60 p-2 text-sm" />
          <button onClick={exportCsv} className="rounded-xl bg-[image:var(--gradient-neon)] px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-neon)]">Export CSV</button>
        </div>
      </header>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {orders.map((o) => (
            <motion.div key={o.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{format(new Date(o.created_at), "PPp")}</p>
                  <p className="mt-1 text-sm font-semibold">{o.customer_name || "Anonymous"} {o.customer_phone && <span className="text-muted-foreground">· {o.customer_phone}</span>}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {(o.order_items ?? []).map((i) => `${i.name} ×${i.quantity}`).join(" · ")}
                  </p>
                  {o.notes && <p className="mt-2 text-xs italic text-muted-foreground">"{o.notes}"</p>}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold neon-text">${Number(o.total).toFixed(2)}</p>
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="mt-2 rounded-lg border border-border bg-background/60 p-1.5 text-xs">
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {orders.length === 0 && <p className="text-center text-sm text-muted-foreground">No orders yet. New WhatsApp orders appear here in real-time.</p>}
      </div>
    </div>
  );
}