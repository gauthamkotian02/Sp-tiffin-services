import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/blogs")({ component: BlogsAdmin });

type Blog = { id: string; title: string; excerpt: string | null; content: string; image_url: string | null; author: string | null; published: boolean };

function BlogsAdmin() {
  const [items, setItems] = React.useState<Blog[]>([]);
  const [draft, setDraft] = React.useState({ title: "", excerpt: "", content: "", author: "", image_url: "" });

  const load = async () => {
    const { data } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as Blog[]);
  };
  React.useEffect(() => { load(); }, []);

  const upload = async (file: File) => {
    const path = `blog-${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("menu-media").upload(path, file);
    if (error) throw error;
    return supabase.storage.from("menu-media").getPublicUrl(path).data.publicUrl;
  };

  const save = async () => {
    if (!draft.title || !draft.content) return;
    const { error } = await supabase.from("blogs").insert({ ...draft, published: true });
    if (error) { toast.error(error.message); return; }
    setDraft({ title: "", excerpt: "", content: "", author: "", image_url: "" });
    load();
    toast.success("Post published");
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Content</p>
        <h1 className="mt-1 text-3xl font-bold">Blog posts</h1>
      </header>

      <div className="glass rounded-2xl p-5">
        <h3 className="mb-3 text-sm font-semibold">New post</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input className={inp} placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <input className={inp} placeholder="Author" value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} />
          <input className={`${inp} md:col-span-2`} placeholder="Excerpt (short summary)" value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} />
          <textarea className={`${inp} min-h-32 md:col-span-2`} placeholder="Full content" value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm hover:bg-secondary/50">
            <Upload className="h-4 w-4" /> {draft.image_url ? "Replace image" : "Upload cover image"}
            <input type="file" accept="image/*" hidden onChange={async (e) => {
              const f = e.target.files?.[0]; if (!f) return;
              const url = await upload(f); setDraft((p) => ({ ...p, image_url: url }));
            }} />
          </label>
        </div>
        {draft.image_url && <img src={draft.image_url} className="mt-3 h-40 w-full rounded-xl object-cover" />}
        <div className="mt-4 flex justify-end">
          <Button variant="neon" onClick={save} disabled={!draft.title || !draft.content}><Plus className="h-4 w-4" /> Publish</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((b) => (
          <div key={b.id} className="glass overflow-hidden rounded-2xl">
            {b.image_url && <img src={b.image_url} className="h-36 w-full object-cover" />}
            <div className="space-y-2 p-4">
              <p className="text-sm font-semibold">{b.title}</p>
              {b.excerpt && <p className="line-clamp-2 text-xs text-muted-foreground">{b.excerpt}</p>}
              <div className="flex items-center justify-between pt-2">
                <button onClick={async () => { await supabase.from("blogs").update({ published: !b.published }).eq("id", b.id); load(); }} className={`rounded-lg px-2 py-1 text-xs ${b.published ? "bg-[image:var(--gradient-neon)] text-primary-foreground" : "border border-border text-muted-foreground"}`}>{b.published ? "Live" : "Draft"}</button>
                <button onClick={async () => { await supabase.from("blogs").delete().eq("id", b.id); load(); }} className="rounded-lg p-1.5 hover:bg-destructive/30"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">No posts yet.</p>}
      </div>
    </div>
  );
}

const inp = "w-full rounded-xl border border-border bg-background/60 p-2.5 text-sm outline-none focus:border-[var(--neon-cyan)]";