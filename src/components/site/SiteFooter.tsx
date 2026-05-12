import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from "lucide-react";
import { useSiteSettings } from "@/lib/useSiteSettings";

export function SiteFooter() {
  const s = useSiteSettings();
  return (
    <footer className="mx-auto mt-24 max-w-6xl px-4 pb-8">
      <div className="glass rounded-2xl p-6 md:p-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              {s.logo_url ? (
                <img src={s.logo_url} alt={s.brand_name} className="h-9 w-9 rounded-xl object-cover" />
              ) : (
                <div className="h-9 w-9 rounded-xl bg-[image:var(--gradient-neon)] shadow-[var(--shadow-neon)]" />
              )}
              <span className="text-lg font-bold">{s.brand_name}</span>
            </div>
            {s.footer_about && <p className="mt-3 text-sm text-muted-foreground">{s.footer_about}</p>}
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Contact</p>
            {(s.address || s.pincode) && (
              <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> <span>{s.address}{s.address && s.pincode ? ", " : ""}{s.pincode}</span></p>
            )}
            {s.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {s.phone}</p>}
            {s.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {s.email}</p>}
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Follow</p>
            <div className="flex gap-2">
              {s.instagram_url && <a href={s.instagram_url} target="_blank" rel="noreferrer" className="rounded-xl border border-border p-2 hover:bg-secondary/50"><Instagram className="h-4 w-4" /></a>}
              {s.facebook_url && <a href={s.facebook_url} target="_blank" rel="noreferrer" className="rounded-xl border border-border p-2 hover:bg-secondary/50"><Facebook className="h-4 w-4" /></a>}
              {s.twitter_url && <a href={s.twitter_url} target="_blank" rel="noreferrer" className="rounded-xl border border-border p-2 hover:bg-secondary/50"><Twitter className="h-4 w-4" /></a>}
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} {s.brand_name}. All rights reserved.</p>
      </div>
    </footer>
  );
}