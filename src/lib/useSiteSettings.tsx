import * as React from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
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
  hero_eyebrow: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_description: string | null;
  hero_image_url: string | null;
  hero_video_url: string | null;
  hero_cta_primary: string | null;
  hero_cta_secondary: string | null;
};

const DEFAULTS: SiteSettings = {
  brand_name: "NOVA Kitchen",
  logo_url: null,
  tagline: null,
  footer_about: null,
  address: null,
  pincode: null,
  phone: null,
  email: null,
  instagram_url: null,
  facebook_url: null,
  twitter_url: null,
  theme_primary: "#22d3ee",
  theme_accent: "#ec4899",
  hero_eyebrow: null,
  hero_title: null,
  hero_subtitle: null,
  hero_description: null,
  hero_image_url: null,
  hero_video_url: null,
  hero_cta_primary: null,
  hero_cta_secondary: null,
};

const Ctx = React.createContext<SiteSettings>(DEFAULTS);

function hexToOklch(hex: string): string {
  // Lightweight hex -> oklch via sRGB approximation. Returns "L C H" string.
  const h = hex.replace("#", "");
  if (h.length !== 6) return "0.7 0.18 200";
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const R = lin(r), G = lin(g), B = lin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const b2 = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(a * a + b2 * b2);
  let H = (Math.atan2(b2, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return `${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)}`;
}

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<SiteSettings>(DEFAULTS);

  React.useEffect(() => {
    let active = true;
    supabase.from("site_settings").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (active && data) setSettings({ ...DEFAULTS, ...(data as Partial<SiteSettings>) });
    });
    const ch = supabase.channel("site_settings").on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, (payload) => {
      if (payload.new) setSettings({ ...DEFAULTS, ...(payload.new as Partial<SiteSettings>) });
    }).subscribe();
    return () => { active = false; supabase.removeChannel(ch); };
  }, []);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const p = hexToOklch(settings.theme_primary);
    const a = hexToOklch(settings.theme_accent);
    root.style.setProperty("--primary", `oklch(${p})`);
    root.style.setProperty("--ring", `oklch(${p} / 0.6)`);
    root.style.setProperty("--neon-cyan", `oklch(${p})`);
    root.style.setProperty("--accent", `oklch(${a})`);
    root.style.setProperty("--neon-magenta", `oklch(${a})`);
    root.style.setProperty("--gradient-neon", `linear-gradient(135deg, oklch(${p}), oklch(${a}))`);
  }, [settings.theme_primary, settings.theme_accent]);

  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>;
}

export function useSiteSettings() {
  return React.useContext(Ctx);
}