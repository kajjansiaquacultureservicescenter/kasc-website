"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ShoppingBag, ChevronDown, X, Loader2, RefreshCw } from "lucide-react";

type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  payment_reference: string | null;
  delivery_address: string | null;
  delivery_district: string | null;
  delivery_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  order_items: OrderItem[];
};

type OrderItem = {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
};

const STATUS_OPTIONS = ["pending","confirmed","processing","shipped","delivered","cancelled"];
const PAYMENT_STATUS = ["unpaid","paid","refunded"];

const STATUS_COLOR: Record<string, string> = {
  pending:    "bg-amber-100 text-amber-700 border-amber-200",
  confirmed:  "bg-blue-100 text-blue-700 border-blue-200",
  processing: "bg-purple-100 text-purple-700 border-purple-200",
  shipped:    "bg-indigo-100 text-indigo-700 border-indigo-200",
  delivered:  "bg-green-100 text-green-700 border-green-200",
  cancelled:  "bg-red-100 text-red-700 border-red-200",
};

const PAYMENT_COLOR: Record<string, string> = {
  unpaid:   "bg-gray-100 text-gray-600",
  paid:     "bg-green-100 text-green-700",
  refunded: "bg-orange-100 text-orange-700",
};

const METHOD_LABEL: Record<string, string> = {
  cash_on_delivery: "Cash on Delivery",
  mtn_momo:         "MTN MoMo",
  airtel_money:     "Airtel Money",
  bank_transfer:    "Bank Transfer",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select(`*, order_items(*)`)
      .order("created_at", { ascending: false });

    if (filterStatus !== "all") query = query.eq("status", filterStatus);

    const { data, error } = await query;
    if (error) toast.error("Failed to load orders");
    else setOrders(data as Order[]);
    setLoading(false);
  }, [filterStatus, supabase]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function updateOrderStatus(orderId: string, field: "status" | "payment_status", value: string) {
    setUpdating(true);
    const { error } = await supabase.from("orders").update({ [field]: value }).eq("id", orderId);
    if (error) {
      toast.error("Update failed");
    } else {
      toast.success("Order updated");
      await fetchOrders();
      if (selected?.id === orderId) {
        setSelected((prev) => prev ? { ...prev, [field]: value } : null);
      }
    }
    setUpdating(false);
  }

  async function saveNotes(orderId: string, notes: string) {
    const { error } = await supabase.from("orders").update({ admin_notes: notes }).eq("id", orderId);
    if (error) toast.error("Failed to save notes");
    else toast.success("Notes saved");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#071e2e] font-display">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm hover:bg-gray-50 transition-all">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["all", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              filterStatus === s
                ? "bg-[#071e2e] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <ShoppingBag size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] border-b border-gray-100">
              <tr>
                {["Order #","Customer","Total","Payment","Status","Date",""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#f8fafc] transition-all">
                  <td className="px-4 py-3 font-mono font-semibold text-[#071e2e] text-xs">{order.order_number}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#071e2e]">{order.guest_name || "User"}</div>
                    <div className="text-xs text-gray-400">{order.guest_phone || order.guest_email || ""}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold">UGX {Number(order.total_amount).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_COLOR[order.payment_status]}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_COLOR[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString("en-UG")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(order)}
                      className="px-3 py-1.5 rounded-lg bg-[#071e2e] text-white text-xs hover:bg-[#0f3a52] transition-all"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md bg-white shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="font-bold text-[#071e2e] font-display">{selected.order_number}</h2>
                <p className="text-xs text-gray-400">{new Date(selected.created_at).toLocaleString("en-UG")}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Customer */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Customer</h3>
                <div className="space-y-1 text-sm">
                  <div className="font-semibold text-[#071e2e]">{selected.guest_name || "Registered user"}</div>
                  {selected.guest_email && <div className="text-gray-500">{selected.guest_email}</div>}
                  {selected.guest_phone && <div className="text-gray-500">{selected.guest_phone}</div>}
                  {selected.delivery_address && <div className="text-gray-500">{selected.delivery_address}, {selected.delivery_district}</div>}
                  {selected.delivery_notes && <div className="text-gray-400 italic text-xs">{selected.delivery_notes}</div>}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Items</h3>
                <div className="space-y-2">
                  {selected.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm p-3 bg-[#f8fafc] rounded-xl">
                      <div>
                        <div className="font-medium text-[#071e2e]">{item.product_name}</div>
                        <div className="text-xs text-gray-400">Qty: {item.quantity} × UGX {Number(item.product_price).toLocaleString()}</div>
                      </div>
                      <div className="font-semibold">UGX {Number(item.subtotal).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t flex flex-col gap-1 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span><span>UGX {Number(selected.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span><span>UGX {Number(selected.delivery_fee).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#071e2e]">
                    <span>Total</span><span>UGX {Number(selected.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Payment</h3>
                <div className="text-sm space-y-1">
                  <div className="text-gray-600">{METHOD_LABEL[selected.payment_method] || selected.payment_method}</div>
                  {selected.payment_reference && <div className="text-gray-400 text-xs">Ref: {selected.payment_reference}</div>}
                </div>
                <div className="mt-3">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Payment status</label>
                  <select
                    value={selected.payment_status}
                    onChange={(e) => updateOrderStatus(selected.id, "payment_status", e.target.value)}
                    disabled={updating}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]"
                  >
                    {PAYMENT_STATUS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Order status */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 block">Order status</label>
                <select
                  value={selected.status}
                  onChange={(e) => updateOrderStatus(selected.id, "status", e.target.value)}
                  disabled={updating}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8]"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </div>

              {/* Admin notes */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 block">Admin notes</label>
                <textarea
                  defaultValue={selected.admin_notes || ""}
                  rows={3}
                  placeholder="Internal notes..."
                  onBlur={(e) => saveNotes(selected.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8] resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
