import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({ component: SettingsAdmin });

type Settings = {
  id?: string;
  brand_name: string;
  logo_url: string | null;
  tagline: string | null;
  footer_about: string | null;
  address: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  theme_primary: string;
  theme_accent: string;
};

const inp = "w-full rounded-xl border border-border bg-background/60 p-2.5 text-sm outline-none focus:border-[var(--neon-cyan)]";
const lbl = "block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5";

function SettingsAdmin() {
  const [s, setS] = React.useState<Settings | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    supabase.from("site_settings").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (data) setS(data as Settings);
    });
  }, []);

  if (!s) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS({ ...s, [k]: v });

  const upload = async (file: File) => {
    const path = `site-${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("menu-media").upload(path, file);
    if (error) throw error;
    return supabase.storage.from("menu-media").getPublicUrl(path).data.publicUrl;
  };

  const save = async () => {
    setSaving(true);
    const { id, ...rest } = s;
    const { error } = await supabase.from("site_settings").update(rest).eq("id", id!);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Settings saved — site updated");
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Branding</p>
        <h1 className="mt-1 text-3xl font-bold">Site Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Edit hotel name, logo, footer details, contact info, and theme color.</p>
      </header>

      <section className="glass space-y-4 rounded-2xl p-5">
        <h3 className="text-sm font-semibold">Hotel identity</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={lbl}>Hotel / Brand name</label>
            <input className={inp} value={s.brand_name} onChange={(e) => set("brand_name", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Tagline</label>
            <input className={inp} value={s.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className={lbl}>Hotel logo / icon</label>
            <div className="flex items-center gap-3">
              {s.logo_url && <img src={s.logo_url} alt="logo" className="h-14 w-14 rounded-xl object-cover" />}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm hover:bg-secondary/50">
                <Upload className="h-4 w-4" /> {s.logo_url ? "Replace logo" : "Upload logo"}
                <input type="file" accept="image/*" hidden onChange={async (e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  const url = await upload(f); set("logo_url", url);
                }} />
              </label>
              {s.logo_url && <button onClick={() => set("logo_url", null)} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>}
            </div>
          </div>
        </div>
      </section>

      <section className="glass space-y-4 rounded-2xl p-5">
        <h3 className="text-sm font-semibold">Footer & contact</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={lbl}>About / footer description</label>
            <textarea className={inp} rows={3} value={s.footer_about ?? ""} onChange={(e) => set("footer_about", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className={lbl}>Address</label>
            <input className={inp} value={s.address ?? ""} onChange={(e) => set("address", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Pincode</label>
            <input className={inp} value={s.pincode ?? ""} onChange={(e) => set("pincode", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Phone</label>
            <input className={inp} value={s.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Email</label>
            <input className={inp} value={s.email ?? ""} onChange={(e) => set("email", e.target.value)} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className={lbl}>Instagram URL</label>
            <input className={inp} value={s.instagram_url ?? ""} onChange={(e) => set("instagram_url", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Facebook URL</label>
            <input className={inp} value={s.facebook_url ?? ""} onChange={(e) => set("facebook_url", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Twitter / X URL</label>
            <input className={inp} value={s.twitter_url ?? ""} onChange={(e) => set("twitter_url", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="glass space-y-4 rounded-2xl p-5">
        <h3 className="text-sm font-semibold">Theme color</h3>
        <p className="text-xs text-muted-foreground">Pick the primary and accent colors. They drive buttons, highlights, and the gradient throughout the website.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={lbl}>Primary color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={s.theme_primary} onChange={(e) => set("theme_primary", e.target.value)} className="h-12 w-16 cursor-pointer rounded-xl border border-border bg-transparent" />
              <input className={inp} value={s.theme_primary} onChange={(e) => set("theme_primary", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={lbl}>Accent color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={s.theme_accent} onChange={(e) => set("theme_accent", e.target.value)} className="h-12 w-16 cursor-pointer rounded-xl border border-border bg-transparent" />
              <input className={inp} value={s.theme_accent} onChange={(e) => set("theme_accent", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="mt-2 h-12 rounded-xl" style={{ background: `linear-gradient(135deg, ${s.theme_primary}, ${s.theme_accent})` }} />
      </section>

      <div className="flex justify-end">
        <Button variant="neon" onClick={save} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save settings"}</Button>
      </div>
    </div>
  );
}