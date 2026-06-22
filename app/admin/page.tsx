import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ShoppingBag, MessageSquare, Image, Zap, Newspaper,
  TrendingUp, ArrowRight,
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

export const revalidate = 30;

export default async function AdminDashboard() {
  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const [
    { count: orders_today },
    { count: orders_pending },
    { count: orders_total },
    { data: revenueToday },
    { data: revenueAll },
    { count: inquiries_new },
    { count: inquiries_total },
    { count: gallery_photos },
    { count: active_flash_deals },
    { count: published_news },
    { data: recentOrders },
    { data: recentInquiries },
  ] = await Promise.all([
    admin.from("orders").select("*", { count: "exact", head: true }).gte("created_at", today),
    admin.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("orders").select("*", { count: "exact", head: true }),
    admin.from("orders").select("total_amount").gte("created_at", today).eq("payment_status", "paid"),
    admin.from("orders").select("total_amount").eq("payment_status", "paid"),
    admin.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
    admin.from("inquiries").select("*", { count: "exact", head: true }),
    admin.from("gallery_photos").select("*", { count: "exact", head: true }),
    admin.from("flash_deals").select("*", { count: "exact", head: true }).eq("is_active", true).gt("ends_at", new Date().toISOString()),
    admin.from("news").select("*", { count: "exact", head: true }).eq("is_published", true),
    admin.from("orders").select("id, order_number, guest_name, total_amount, status, payment_method, created_at").order("created_at", { ascending: false }).limit(5),
    admin.from("inquiries").select("id, name, subject, service, status, created_at").order("created_at", { ascending: false }).limit(4),
  ]);

  const revenue_today = (revenueToday ?? []).reduce((s: number, r: any) => s + Number(r.total_amount), 0);
  const revenue_total = (revenueAll ?? []).reduce((s: number, r: any) => s + Number(r.total_amount), 0);

  const s = {
    orders_today:       orders_today ?? 0,
    orders_pending:     orders_pending ?? 0,
    orders_total:       orders_total ?? 0,
    revenue_today,
    revenue_total,
    inquiries_new:      inquiries_new ?? 0,
    inquiries_total:    inquiries_total ?? 0,
    gallery_photos:     gallery_photos ?? 0,
    active_flash_deals: active_flash_deals ?? 0,
    published_news:     published_news ?? 0,
  } as Record<string, number>;

  const STAT_CARDS = [
    { label: "Orders Today",     value: s?.orders_today ?? 0,     icon: ShoppingBag, sub: `${s?.orders_pending ?? 0} pending`,   color: "brand" },
    { label: "New Inquiries",    value: s?.inquiries_new ?? 0,     icon: MessageSquare, sub: `${s?.inquiries_total ?? 0} total`, color: "amber" },
    { label: "Gallery Photos",   value: s?.gallery_photos ?? 0,    icon: Image,       sub: "Uploaded",                          color: "green" },
    { label: "Active Deals",     value: s?.active_flash_deals ?? 0,icon: Zap,         sub: `${s?.published_news ?? 0} news`,    color: "brand" },
  ];

  const statusColor: Record<string, string> = {
    pending:    "bg-amber-100 text-amber-700",
    confirmed:  "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    shipped:    "bg-indigo-100 text-indigo-700",
    delivered:  "bg-green-100 text-green-700",
    cancelled:  "bg-red-100 text-red-700",
  };

  const inquiryBadge: Record<string, string> = {
    new:     "bg-[#eef8fd] text-[#0f5070]",
    read:    "bg-gray-100 text-gray-500",
    replied: "bg-green-50 text-green-700",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#071e2e] font-display">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Live overview of your store and inquiries.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {STAT_CARDS.map(({ label, value, icon: Icon, sub, color }) => (
          <div key={label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                color === "brand" ? "bg-[#eef8fd]" : color === "green" ? "bg-[#f0fcf4]" : "bg-[#fffbf0]"
              }`}>
                <Icon size={18} className={
                  color === "brand" ? "text-[#0f5070]" : color === "green" ? "text-[#226640]" : "text-[#a05200]"
                } />
              </div>
              <TrendingUp size={14} className="text-gray-300" />
            </div>
            <div className="text-3xl font-bold text-[#071e2e] mb-1">{value}</div>
            <div className="text-sm font-medium text-gray-700 mb-0.5">{label}</div>
            <div className="text-xs text-gray-400">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#071e2e] font-display">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-[#0f5070] hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f8fafc] transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#071e2e]">{order.order_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">{order.guest_name || "Registered user"}</div>
                  </div>
                  <div className="text-sm font-bold text-[#071e2e] shrink-0">
                    UGX {Number(order.total_amount).toLocaleString()}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">No orders yet</div>
          )}
        </div>

        {/* Recent inquiries */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#071e2e] font-display">Inquiries</h2>
            <Link href="/admin/inquiries" className="text-xs text-[#0f5070] hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {recentInquiries && recentInquiries.length > 0 ? (
            <div className="space-y-2">
              {recentInquiries.map((inq) => (
                <div key={inq.id} className="p-3 rounded-xl bg-[#f8fafc] border border-transparent hover:border-gray-200 transition-all">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0f5070] to-[#226640] flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5">
                      {inq.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-[#071e2e]">{inq.name}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${inquiryBadge[inq.status] ?? "bg-gray-100 text-gray-500"}`}>
                          {inq.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 truncate">{inq.subject}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">No inquiries yet</div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: "/admin/gallery",     label: "Upload Photos",  icon: Image,       bg: "from-[#0f5070] to-[#2d8ab8]" },
          { href: "/admin/media",       label: "Add Video",      icon: Zap,         bg: "from-[#226640] to-[#3aaf6c]" },
          { href: "/admin/news",        label: "Write News",     icon: Newspaper,   bg: "from-[#a05200] to-[#f4a020]" },
          { href: "/admin/flash-deals", label: "Flash Deal",     icon: ShoppingBag, bg: "from-[#5b21b6] to-[#7c3aed]" },
        ].map(({ href, label, icon: Icon, bg }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${bg} text-white hover:opacity-90 transition-all`}
          >
            <Icon size={20} />
            <span className="font-semibold text-sm">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
