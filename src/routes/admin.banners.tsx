import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/banners")({ component: BannersAdmin });

type Banner = { id: string; title: string; subtitle: string | null; image_url: string | null; link_url: string | null; active: boolean };

function BannersAdmin() {
  const [items, setItems] = React.useState<Banner[]>([]);
  const [draft, setDraft] = React.useState<{ title: string; subtitle: string; link_url: string; image_url: string }>({ title: "", subtitle: "", link_url: "", image_url: "" });

  const load = async () => {
    const { data } = await supabase.from("banners").select("*").order("sort_order");
    setItems((data ?? []) as Banner[]);
  };
  React.useEffect(() => { load(); }, []);

  const upload = async (file: File) => {
    const path = `banner-${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("menu-media").upload(path, file);
    if (error) throw error;
    return supabase.storage.from("menu-media").getPublicUrl(path).data.publicUrl;
  };

  const save = async () => {
    if (!draft.title) return;
    await supabase.from("banners").insert({ ...draft, active: true });
    setDraft({ title: "", subtitle: "", link_url: "", image_url: "" });
    load();
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Homepage</p>
        <h1 className="mt-1 text-3xl font-bold">Banners & promos</h1>
      </header>

      <div className="glass rounded-2xl p-5">
        <h3 className="mb-3 text-sm font-semibold">New banner</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input className={inp} placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <input className={inp} placeholder="Subtitle" value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} />
          <input className={inp} placeholder="Link URL (optional)" value={draft.link_url} onChange={(e) => setDraft({ ...draft, link_url: e.target.value })} />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm hover:bg-secondary/50">
            <Upload className="h-4 w-4" /> {draft.image_url ? "Replace image" : "Upload image"}
            <input type="file" accept="image/*,video/*" hidden onChange={async (e) => {
              const f = e.target.files?.[0]; if (!f) return;
              const url = await upload(f); setDraft((p) => ({ ...p, image_url: url }));
            }} />
          </label>
        </div>
        {draft.image_url && <img src={draft.image_url} className="mt-3 h-32 w-full rounded-xl object-cover" />}
        <div className="mt-4 flex justify-end">
          <Button variant="neon" onClick={save} disabled={!draft.title}><Plus className="h-4 w-4" /> Add banner</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((b) => (
          <div key={b.id} className="glass overflow-hidden rounded-2xl">
            {b.image_url && <img src={b.image_url} className="h-36 w-full object-cover" />}
            <div className="flex items-start justify-between gap-2 p-4">
              <div>
                <p className="text-sm font-semibold">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.subtitle}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={async () => { await supabase.from("banners").update({ active: !b.active }).eq("id", b.id); load(); }} className={`rounded-lg px-2 py-1 text-xs ${b.active ? "bg-[image:var(--gradient-neon)] text-primary-foreground" : "border border-border text-muted-foreground"}`}>{b.active ? "Live" : "Off"}</button>
                <button onClick={async () => { await supabase.from("banners").delete().eq("id", b.id); load(); }} className="rounded-lg p-1.5 hover:bg-destructive/30"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">No banners yet.</p>}
      </div>
    </div>
  );
}

const inp = "w-full rounded-xl border border-border bg-background/60 p-2.5 text-sm outline-none focus:border-[var(--neon-cyan)]";