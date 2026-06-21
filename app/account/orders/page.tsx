import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "My Orders | KASC" };

const STATUS_STYLE: Record<string, string> = {
  pending:    "bg-amber-100 text-amber-700",
  confirmed:  "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

const PAYMENT_STYLE: Record<string, string> = {
  unpaid:   "text-gray-400",
  paid:     "text-green-600",
  refunded: "text-orange-500",
};

const METHOD_LABEL: Record<string, string> = {
  cash_on_delivery: "Cash on Delivery",
  mtn_momo:         "MTN MoMo",
  airtel_money:     "Airtel Money",
  bank_transfer:    "Bank Transfer",
};

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id, order_number, status, total_amount, subtotal, delivery_fee,
      payment_method, payment_status, delivery_district,
      created_at,
      order_items(product_name, quantity)
    `)
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h2 className="font-bold text-[#071e2e] font-display text-lg mb-5">My Orders</h2>

      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <ShoppingBag size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 text-sm mb-4">You haven&apos;t placed any orders yet</p>
          <Link href="/shop" className="inline-block px-5 py-2.5 rounded-xl bg-[#0f5070] text-white text-sm font-semibold hover:bg-[#0d3f5a] transition-all">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="font-mono font-bold text-[#071e2e] text-sm">{order.order_number}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString("en-UG", { day: "numeric", month: "long", year: "numeric" })}
                    {order.delivery_district && ` · ${order.delivery_district}`}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[order.status] ?? "bg-gray-100 text-gray-500"}`}>
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-1 mb-4">
                {order.order_items?.slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="text-sm text-gray-600">
                    {item.quantity}× {item.product_name}
                  </div>
                ))}
                {order.order_items?.length > 3 && (
                  <div className="text-xs text-gray-400">+ {order.order_items.length - 3} more items</div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <div className="text-xs text-gray-400">{METHOD_LABEL[order.payment_method] || order.payment_method}</div>
                  <div className={`text-xs font-medium capitalize ${PAYMENT_STYLE[order.payment_status] ?? "text-gray-400"}`}>
                    {order.payment_status}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#071e2e]">UGX {Number(order.total_amount).toLocaleString()}</div>
                  {Number(order.delivery_fee) === 0 && <div className="text-xs text-green-600">Free delivery</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
