import burger from "@/assets/burger.jpg";
import ramen from "@/assets/ramen.jpg";
import pizza from "@/assets/pizza.jpg";
import fries from "@/assets/fries.jpg";
import dessert from "@/assets/dessert.jpg";
import drink from "@/assets/drink.jpg";
import chicken from "@/assets/chicken.jpg";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "Signatures" | "Mains" | "Sides" | "Desserts" | "Drinks";
  image: string;
  available: boolean;
  trending?: boolean;
  combo?: string;
};

export const CATEGORIES = ["All", "Signatures", "Mains", "Sides", "Desserts", "Drinks"] as const;

export const MENU: MenuItem[] = [
  {
    id: "neon-burger",
    name: "Neon Smash Burger",
    description: "Double smash patty, aged cheddar, smoked aioli, brioche bun.",
    price: 12.5,
    category: "Signatures",
    image: burger,
    available: true,
    trending: true,
    combo: "Combo +$3 with fries & drink",
  },
  {
    id: "tonkotsu-ramen",
    name: "Tonkotsu Ramen",
    description: "24-hour pork broth, chashu, ajitama egg, scallions.",
    price: 14.0,
    category: "Signatures",
    image: ramen,
    available: true,
    trending: true,
  },
  {
    id: "margherita",
    name: "Margherita Lumière",
    description: "San Marzano, fior di latte, fresh basil, wood-fired crust.",
    price: 13.0,
    category: "Mains",
    image: pizza,
    available: true,
  },
  {
    id: "karaage",
    name: "Citrus Karaage",
    description: "Crispy fried chicken, yuzu salt, smoked lemon.",
    price: 9.5,
    category: "Mains",
    image: chicken,
    available: true,
    trending: true,
  },
  {
    id: "truffle-fries",
    name: "Truffle Fries",
    description: "Hand-cut fries, parmesan, black truffle, herbs.",
    price: 7.0,
    category: "Sides",
    image: fries,
    available: true,
  },
  {
    id: "lava-cake",
    name: "Molten Lava Cake",
    description: "Dark chocolate, sea salt, vanilla bean ice cream.",
    price: 8.5,
    category: "Desserts",
    image: dessert,
    available: true,
  },
  {
    id: "neon-spritz",
    name: "Neon Spritz",
    description: "Hibiscus, prosecco, citrus, edible glow.",
    price: 10.0,
    category: "Drinks",
    image: drink,
    available: false,
  },
];

// Placeholder — replace with the restaurant's WhatsApp number in international format (no +)
export const WHATSAPP_NUMBER = "15551234567";
export const RESTAURANT_NAME = "NOVA Kitchen";