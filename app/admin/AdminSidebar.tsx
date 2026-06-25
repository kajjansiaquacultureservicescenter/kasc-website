"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import {
  Fish, LayoutDashboard, Package, Video, MessageSquare,
  Settings, LogOut, Image, ShoppingBag, Newspaper,
  Tag, Zap, ExternalLink, Globe, Home, Star,
} from "lucide-react";

const NAV = [
  { href: "/admin",                label: "Dashboard",      icon: LayoutDashboard },
  { href: "/admin/orders",         label: "Orders",         icon: ShoppingBag },
  { href: "/admin/inquiries",      label: "Inquiries",      icon: MessageSquare },
  { href: "/admin/homepage",       label: "Homepage",       icon: Home },
  { href: "/admin/testimonials",   label: "Testimonials",   icon: Star },
  { href: "/admin/gallery",        label: "Gallery",        icon: Image },
  { href: "/admin/media",          label: "Videos",         icon: Video },
  { href: "/admin/news",           label: "News",           icon: Newspaper },
  { href: "/admin/offers",         label: "Offers",         icon: Tag },
  { href: "/admin/flash-deals",    label: "Flash Deals",    icon: Zap },
  { href: "/admin/products",       label: "Products",       icon: Package },
  { href: "/admin/site-images",    label: "Site Images",    icon: Globe },
  { href: "/admin/settings",       label: "Settings",       icon: Settings },
];

export default function AdminSidebar({
  adminName,
  adminEmail,
}: {
  adminName: string;
  adminEmail: string;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="w-64 bg-[#071e2e] flex flex-col shrink-0 fixed top-0 left-0 bottom-0 z-40">
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2d8ab8] to-[#2d8c56] flex items-center justify-center">
            <Fish size={18} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">KASC Admin</div>
            <div className="text-[#5aafd4] text-xs">Management Panel</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              isActive(href)
                ? "bg-white/15 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/8"
            }`}
          >
            <Icon
              size={16}
              className={`shrink-0 transition-colors ${
                isActive(href) ? "text-[#5aafd4]" : "group-hover:text-[#5aafd4]"
              }`}
            />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2d8ab8] to-[#226640] flex items-center justify-center text-white font-bold text-xs shrink-0">
            {adminName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">{adminName}</div>
            <div className="text-gray-400 text-xs truncate">{adminEmail}</div>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs"
        >
          <ExternalLink size={13} /> View Website
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs"
          >
            <LogOut size={13} /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
