"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, COMPANY } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown, Phone, Mail, MapPin, ShoppingCart, User, LogIn } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top bar */}
      <div className="bg-[#071e2e] text-gray-300 text-sm hidden lg:block">
        <div className="container-wide flex items-center justify-between py-2">
          <div className="flex items-center gap-6">
            <a href={`tel:${COMPANY.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={13} className="text-[#5aafd4]" />
              <span>{COMPANY.phone}</span>
            </a>
            <a href={`tel:${COMPANY.phone2}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={13} className="text-[#5aafd4]" />
              <span>{COMPANY.phone2}</span>
            </a>
            <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={13} className="text-[#5aafd4]" />
              <span>{COMPANY.email}</span>
            </a>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <MapPin size={13} className="text-[#5aafd4]" />
            <span>{COMPANY.address}</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav
        className={cn(
          "transition-all duration-300",
          scrolled
            ? "bg-[#0a2d43]/95 backdrop-blur-xl shadow-2xl"
            : "bg-[#0a2d43]"
        )}
      >
        <div className="container-wide flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden bg-white shadow-lg group-hover:shadow-xl transition-shadow shrink-0">
              <img src="/logo.png" alt="KASC Logo" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-bold text-base lg:text-lg leading-tight font-display">
                Kajjansi
              </div>
              <div className="text-[#5aafd4] text-xs font-medium leading-tight tracking-wide">
                Aquaculture Service Center
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.href} className="relative group">
                {item.children ? (
                  <button
                    onMouseEnter={() => setActiveDropdown(item.href)}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      pathname.startsWith(item.href) && item.href !== "/"
                        ? "text-[#5aafd4] bg-white/10"
                        : "text-gray-200 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {item.label}
                    <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))
                        ? "text-[#5aafd4] bg-white/10"
                        : "text-gray-200 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {item.label}
                  </Link>
                )}

                {/* Dropdown */}
                {item.children && (
                  <div
                    onMouseEnter={() => setActiveDropdown(item.href)}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className={cn(
                      "absolute top-full left-0 pt-2 min-w-64 transition-all duration-200",
                      activeDropdown === item.href
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 translate-y-2 pointer-events-none"
                    )}
                  >
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                      <div className="p-1.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150",
                              pathname === child.href
                                ? "bg-[#eef8fd] text-[#0f5070]"
                                : "text-gray-700 hover:bg-gray-50 hover:text-[#0f5070]"
                            )}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2d8ab8] shrink-0" />
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link href="/shop" className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#2d8ab8]/40 text-[#5aafd4] hover:bg-white/10 text-sm font-medium transition-colors">
              Shop
            </Link>
            {user ? (
              <Link
                href="/account"
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#2d8ab8]/40 text-[#5aafd4] hover:bg-white/10 text-sm font-medium transition-colors"
              >
                <User size={15} />
                My Account
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#2d8ab8]/40 text-[#5aafd4] hover:bg-white/10 text-sm font-medium transition-colors"
              >
                <LogIn size={15} />
                Sign In
              </Link>
            )}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 btn-primary text-sm py-2.5 px-4"
              aria-label="Open cart"
            >
              <ShoppingCart size={15} />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#f4a020] text-white text-xs font-bold flex items-center justify-center leading-none">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
            <a
              href={`https://wa.me/${COMPANY.social.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20bc5a] text-white text-sm font-medium transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 border-t border-white/10",
            isOpen ? "max-h-screen" : "max-h-0"
          )}
        >
          <div className="container-wide py-4 space-y-1 max-h-[80vh] overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <div key={item.href}>
                {item.children ? (
                  <>
                    <button
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === item.href ? null : item.href
                        )
                      }
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-200 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors"
                    >
                      {item.label}
                      <ChevronDown
                        size={14}
                        className={cn(
                          "transition-transform",
                          activeDropdown === item.href && "rotate-180"
                        )}
                      />
                    </button>
                    {activeDropdown === item.href && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#2d8ab8]/30 pl-4">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 text-sm transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "text-[#5aafd4] bg-white/10"
                        : "text-gray-200 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-3 pb-2 border-t border-white/10 flex flex-col gap-2">
              <Link href="/shop" className="btn-primary text-sm justify-center">
                <ShoppingCart size={15} /> Shop Now
              </Link>
              {user ? (
                <Link href="/account" className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#2d8ab8]/40 text-[#5aafd4] text-sm font-medium">
                  <User size={15} /> My Account
                </Link>
              ) : (
                <Link href="/auth/login" className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#2d8ab8]/40 text-[#5aafd4] text-sm font-medium">
                  <LogIn size={15} /> Sign In
                </Link>
              )}
              <a
                href={`https://wa.me/${COMPANY.social.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#25D366] text-white text-sm font-medium"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
