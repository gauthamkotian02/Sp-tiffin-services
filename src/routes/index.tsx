import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { CartProvider } from "@/store/cart";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { MenuSection } from "@/components/site/MenuSection";
import { BannerCarousel } from "@/components/site/BannerCarousel";
import { CartDrawer } from "@/components/site/CartDrawer";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NOVA Kitchen — Futuristic dining, ordered on WhatsApp" },
      {
        name: "description",
        content:
          "Browse our neon-lit menu and send your order straight to the chefs via WhatsApp. No login. No friction.",
      },
      { property: "og:title", content: "NOVA Kitchen — Order on WhatsApp" },
      {
        property: "og:description",
        content: "A futuristic restaurant menu with one-tap WhatsApp ordering.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [open, setOpen] = React.useState(false);
  return (
    <CartProvider>
      <main className="relative min-h-screen pb-24">
        <Navbar onCartClick={() => setOpen(true)} />
        <Hero />
        <BannerCarousel />
        <MenuSection />
        <SiteFooter />
        <CartDrawer open={open} onClose={() => setOpen(false)} />
      </main>
    </CartProvider>
  );
}
