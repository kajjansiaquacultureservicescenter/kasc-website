"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/shared/Chatbot";
import CartDrawer from "@/components/shop/CartDrawer";
import { CartProvider } from "@/lib/cart-context";

// Wraps public pages with the site header, footer, chatbot and cart.
// Admin and auth routes get none of these.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBare = pathname.startsWith("/admin") || pathname.startsWith("/auth");

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <Header />
      <main className="flex-1 pt-[4rem] lg:pt-[5.25rem]">{children}</main>
      <Footer />
      <Chatbot />
      <CartDrawer />
    </CartProvider>
  );
}
