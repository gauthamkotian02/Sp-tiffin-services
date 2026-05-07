import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit3, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/menu")({ component: MenuAdmin });

type Item = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  video_url: string | null;
  available: boolean;
  in_stock: boolean;
  trending: boolean;
  combo: string | null;
};

const empty: Omit<Item, "id"> = {
  name: "", description: "", price: 0, category: "Mains",
  image_url: null, video_url: null, available: true, in_stock: true, trending: false, combo: "",
};

function MenuAdmin() {
  const [items, setItems] = React.useState<Item[]>([]);
  const [editing, setEditing] = React.useState<Partial<Item> | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = async () => {
    const { data } = await supabase.from("menu_items").select("*").order("sort_order");
    setItems((data ?? []) as Item[]);
  };
  React.useEffect(() => { load(); }, []);

  const upload = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("menu-media").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("menu-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      const payload = { ...empty, ...editing, price: Number(editing.price ?? 0) };
      delete (payload as any).id;
      if (editing.id) {
        await supabase.from("menu_items").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("menu_items").insert(payload);
      }
      setEditing(null);
      await load();
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await supabase.from("menu_items").delete().eq("id", id);
    load();
  };

  const toggle = async (it: Item, key: "available" | "in_stock" | "trending") => {
    await supabase.from("menu_items").update({ [key]: !it[key] }).eq("id", it.id);
    load();
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Catalog</p>
          <h1 className="mt-1 text-3xl font-bold">Menu</h1>
        </div>
        <Button variant="neon" onClick={() => setEditing(empty)}><Plus className="h-4 w-4" /> New item</Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <motion.div key={it.id} layout className="glass overflow-hidden rounded-2xl">
            {it.image_url && <img src={it.image_url} alt={it.name} className="h-40 w-full object-cover" />}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{it.name}</p>
                  <p className="text-xs text-muted-foreground">{it.category} · ${Number(it.price).toFixed(2)}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(it)} className="rounded-lg p-1.5 hover:bg-secondary/50"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => remove(it.id)} className="rounded-lg p-1.5 hover:bg-destructive/30"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Toggle label={it.available ? "Available" : "Hidden"} on={it.available} onClick={() => toggle(it, "available")} />
                <Toggle label={it.in_stock ? "In stock" : "Out of stock"} on={it.in_stock} onClick={() => toggle(it, "in_stock")} />
                <Toggle label="Trending" on={it.trending} onClick={() => toggle(it, "trending")} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} className="glass w-full max-w-lg rounded-2xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">{editing.id ? "Edit item" : "New item"}</h3>
                <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3">
                <Field label="Name"><input className={inp} value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
                <Field label="Description"><textarea rows={3} className={inp} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Price"><input type="number" step="0.01" className={inp} value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></Field>
                  <Field label="Category">
                    <select className={inp} value={editing.category ?? "Mains"} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                      {["Signatures","Mains","Sides","Desserts","Drinks"].map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Combo offer (optional)"><input className={inp} value={editing.combo ?? ""} onChange={(e) => setEditing({ ...editing, combo: e.target.value })} /></Field>
                <Field label="Image">
                  <div className="flex items-center gap-3">
                    {editing.image_url && <img src={editing.image_url} className="h-14 w-14 rounded-lg object-cover" />}
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-secondary/50">
                      <Upload className="h-4 w-4" /> Upload
                      <input type="file" accept="image/*" hidden onChange={async (e) => {
                        const f = e.target.files?.[0]; if (!f) return;
                        const url = await upload(f);
                        setEditing((p) => ({ ...p!, image_url: url }));
                      }} />
                    </label>
                  </div>
                </Field>
                <Field label="Video URL (optional)"><input className={inp} value={editing.video_url ?? ""} onChange={(e) => setEditing({ ...editing, video_url: e.target.value })} placeholder="https://..." /></Field>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="glass" onClick={() => setEditing(null)}>Cancel</Button>
                <Button variant="neon" onClick={save} disabled={busy || !editing.name}>Save</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const inp = "w-full rounded-xl border border-border bg-background/60 p-2.5 text-sm outline-none focus:border-[var(--neon-cyan)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label>;
}
function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-full border px-2.5 py-1 transition ${on ? "border-[var(--neon-cyan)] text-[var(--neon-cyan)]" : "border-border text-muted-foreground"}`}>
      {label}
    </button>
  );
}