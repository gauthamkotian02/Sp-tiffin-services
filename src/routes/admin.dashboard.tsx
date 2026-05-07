import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { TrendingUp, DollarSign, ShoppingBag, Flame } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

type Stats = {
  todayRevenue: number;
  monthRevenue: number;
  totalOrders: number;
  todayOrders: number;
};

function useCount(target: number) {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 800);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

function Dashboard() {
  const [stats, setStats] = React.useState<Stats>({ todayRevenue: 0, monthRevenue: 0, totalOrders: 0, todayOrders: 0 });
  const [series, setSeries] = React.useState<{ day: string; revenue: number; orders: number }[]>([]);
  const [topItems, setTopItems] = React.useState<{ name: string; qty: number }[]>([]);

  const load = React.useCallback(async () => {
    const since = subDays(startOfDay(new Date()), 29);
    const { data: orders } = await supabase
      .from("orders")
      .select("id, total, created_at")
      .gte("created_at", since.toISOString());

    const { data: items } = await supabase
      .from("order_items")
      .select("name, quantity, orders!inner(created_at)")
      .gte("orders.created_at", since.toISOString());

    const todayKey = format(new Date(), "yyyy-MM-dd");
    const monthKey = format(new Date(), "yyyy-MM");
    let todayRev = 0, monthRev = 0, todayOrders = 0;
    const buckets = new Map<string, { revenue: number; orders: number }>();
    for (let i = 29; i >= 0; i--) {
      const k = format(subDays(new Date(), i), "yyyy-MM-dd");
      buckets.set(k, { revenue: 0, orders: 0 });
    }
    (orders ?? []).forEach((o) => {
      const k = format(new Date(o.created_at), "yyyy-MM-dd");
      const b = buckets.get(k);
      if (b) { b.revenue += Number(o.total); b.orders += 1; }
      if (k === todayKey) { todayRev += Number(o.total); todayOrders += 1; }
      if (k.startsWith(monthKey)) monthRev += Number(o.total);
    });
    setSeries([...buckets.entries()].map(([day, v]) => ({ day: format(new Date(day), "MMM d"), ...v })));
    setStats({ todayRevenue: todayRev, monthRevenue: monthRev, totalOrders: orders?.length ?? 0, todayOrders });

    const tally = new Map<string, number>();
    (items ?? []).forEach((it: any) => tally.set(it.name, (tally.get(it.name) ?? 0) + it.quantity));
    setTopItems([...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, qty]) => ({ name, qty })));
  }, []);

  React.useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const cards = [
    { label: "Today's revenue", value: `$${stats.todayRevenue.toFixed(2)}`, raw: stats.todayRevenue, icon: DollarSign, color: "var(--neon-cyan)" },
    { label: "This month", value: `$${stats.monthRevenue.toFixed(2)}`, raw: stats.monthRevenue, icon: TrendingUp, color: "var(--neon-magenta)" },
    { label: "Today's orders", value: `${stats.todayOrders}`, raw: stats.todayOrders, icon: ShoppingBag, color: "var(--neon-violet)" },
    { label: "All-time orders", value: `${stats.totalOrders}`, raw: stats.totalOrders, icon: Flame, color: "var(--neon-cyan)" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Live</p>
        <h1 className="mt-1 text-3xl font-bold">Command center</h1>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c, i) => (
          <Counter key={c.label} {...c} delay={i * 0.05} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Revenue · last 30 days</h3>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={series} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.18 195)" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="oklch(0.7 0.25 340)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
              <XAxis dataKey="day" stroke="oklch(0.72 0.03 260)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.72 0.03 260)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "oklch(0.16 0.02 270)", border: "1px solid oklch(1 0 0 / 0.08)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="oklch(0.78 0.18 195)" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5">
          <h3 className="mb-4 text-sm font-semibold">Top sellers</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topItems} layout="vertical" margin={{ left: 0, right: 8 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="oklch(0.72 0.03 260)" fontSize={11} tickLine={false} axisLine={false} width={100} />
              <Tooltip contentStyle={{ background: "oklch(0.16 0.02 270)", border: "1px solid oklch(1 0 0 / 0.08)", borderRadius: 12 }} />
              <Bar dataKey="qty" fill="oklch(0.7 0.25 340)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {topItems.length === 0 && <p className="text-center text-xs text-muted-foreground">No sales yet</p>}
        </motion.div>
      </div>
    </div>
  );
}

function Counter({ label, value, raw, icon: Icon, color, delay }: any) {
  const v = useCount(raw);
  const display = typeof raw === "number" && value.startsWith("$") ? `$${v.toFixed(2)}` : `${Math.round(v)}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass relative overflow-hidden rounded-2xl p-5"
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20 blur-2xl" style={{ background: color }} />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-4 w-4" style={{ color }} />
        {label}
      </div>
      <p className="mt-3 text-2xl font-bold neon-text">{display}</p>
    </motion.div>
  );
}