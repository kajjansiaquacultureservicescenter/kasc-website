"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShoppingBag, CheckCircle2, ChevronRight, Phone, Banknote, CreditCard, Truck } from "lucide-react";
import Link from "next/link";

type PaymentMethod = "cash_on_delivery" | "mtn_momo" | "airtel_money" | "bank_transfer";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "cash_on_delivery", label: "Cash on Delivery",  icon: Truck,    desc: "Pay when your order arrives" },
  { value: "mtn_momo",         label: "MTN Mobile Money",  icon: Phone,    desc: "Pay via MTN MoMo" },
  { value: "airtel_money",     label: "Airtel Money",      icon: CreditCard, desc: "Pay via Airtel Money" },
  { value: "bank_transfer",    label: "Bank Transfer",     icon: Banknote, desc: "Transfer to our bank account" },
];

type OrderResult = {
  orderNumber: string;
  total: number;
  deliveryFee: number;
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [confirmed, setConfirmed] = useState<OrderResult | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash_on_delivery");
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    address: "", district: "", notes: "",
    paymentReference: "",
  });

  const UGANDAN_DISTRICTS = [
    "Kampala","Wakiso","Mukono","Jinja","Mbale","Mbarara","Gulu","Lira","Fort Portal","Masaka",
    "Entebbe","Soroti","Kabale","Arua","Tororo","Hoima","Mityana","Kasese","Iganga","Ntungamo",
    "Other",
  ];

  if (items.length === 0 && !confirmed) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
          <h2 className="text-xl font-bold text-[#0c4a6e] font-display mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-6">Add some products before checking out</p>
          <Link href="/shop" className="inline-block px-6 py-3 rounded-xl bg-[#0284c7] text-white font-semibold text-sm hover:bg-[#0369a1] transition-all">
            Browse Shop
          </Link>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#0c4a6e] font-display mb-2">Order Placed!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Thank you for your order. We&apos;ll contact you to confirm delivery.
          </p>
          <div className="bg-[#f8fafc] rounded-2xl p-5 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order number</span>
              <span className="font-bold text-[#0c4a6e] font-mono">{confirmed.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery fee</span>
              <span className="font-medium">{confirmed.deliveryFee === 0 ? "FREE" : `UGX ${confirmed.deliveryFee.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
              <span>Total paid</span>
              <span className="text-[#0284c7]">UGX {confirmed.total.toLocaleString()}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-6">Save your order number for reference. Our team will call within 2 hours to confirm.</p>
          <div className="flex gap-3">
            <Link href="/shop" className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all text-center">
              Continue Shopping
            </Link>
            <Link href="/" className="flex-1 py-3 rounded-xl bg-[#0284c7] text-white text-sm font-semibold hover:bg-[#0369a1] transition-all text-center">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const needsReference = paymentMethod === "mtn_momo" || paymentMethod === "airtel_money" || paymentMethod === "bank_transfer";

  async function placeOrder() {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.address.trim() || !form.district) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (needsReference && !form.paymentReference.trim()) {
      toast.error("Please enter your payment reference / transaction ID");
      return;
    }

    setPlacing(true);

    const orderItems = items.map((i) => ({
      product_slug: i.slug,
      product_name: i.name,
      product_price: i.price,
      quantity: i.quantity,
      subtotal: i.price * i.quantity,
    }));

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            district: form.district,
            notes: form.notes,
          },
          payment_method: paymentMethod,
          payment_reference: form.paymentReference || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to place order");
        return;
      }

      clearCart();
      setConfirmed({
        orderNumber: data.orderNumber,
        total: data.total,
        deliveryFee: data.deliveryFee,
      });
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setPlacing(false);
    }
  }

  const f = (v: string, k: keyof typeof form) => setForm({ ...form, [k]: v });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0c4a6e] font-display">Checkout</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Link href="/cart" className="hover:text-[#0284c7]">Cart</Link>
            <ChevronRight size={14} />
            <span className="text-[#0284c7] font-medium">Checkout</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Customer info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-[#0c4a6e] font-display mb-5">Delivery Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Full name", key: "name", placeholder: "John Ssali", type: "text", full: true },
                  { label: "Phone number", key: "phone", placeholder: "+256 700 000000", type: "tel", full: false },
                  { label: "Email address", key: "email", placeholder: "you@example.com", type: "email", full: false },
                ].map(({ label, key, placeholder, type, full }) => (
                  <div key={key} className={full ? "sm:col-span-2" : ""}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label} *</label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => f(e.target.value, key as keyof typeof form)}
                      placeholder={placeholder}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition-all"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Delivery address *</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => f(e.target.value, "address")}
                    placeholder="Street / area / landmark"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">District *</label>
                  <select
                    value={form.district}
                    onChange={(e) => f(e.target.value, "district")}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition-all"
                  >
                    <option value="">Select district</option>
                    {UGANDAN_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Delivery notes (optional)</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => f(e.target.value, "notes")}
                    placeholder="Any special instructions"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-[#0c4a6e] font-display mb-5">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {PAYMENT_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPaymentMethod(value)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === value
                        ? "border-[#38bdf8] bg-[#f0f9ff]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      paymentMethod === value ? "bg-[#0284c7] text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      <Icon size={17} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#0c4a6e]">{label}</div>
                      <div className="text-xs text-gray-400">{desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Payment instructions */}
              {(paymentMethod === "mtn_momo" || paymentMethod === "airtel_money") && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-4">
                  <p className="text-sm font-semibold text-amber-800 mb-1">
                    {paymentMethod === "mtn_momo" ? "MTN MoMo" : "Airtel Money"} Instructions
                  </p>
                  <p className="text-sm text-amber-700">
                    Send <strong>UGX {subtotal.toLocaleString()}</strong> (+ delivery) to our number — contact us on WhatsApp for the current collection number. Enter your transaction ID below.
                  </p>
                </div>
              )}
              {paymentMethod === "bank_transfer" && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 mb-4">
                  <p className="text-sm font-semibold text-blue-800 mb-1">Bank Transfer Instructions</p>
                  <p className="text-sm text-blue-700">Transfer to our bank account — contact us for bank details. Enter your transfer reference below.</p>
                </div>
              )}

              {needsReference && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Transaction / Reference ID *</label>
                  <input
                    type="text"
                    value={form.paymentReference}
                    onChange={(e) => f(e.target.value, "paymentReference")}
                    placeholder="e.g. MoMoRef123456"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-8">
              <h2 className="font-bold text-[#0c4a6e] font-display mb-5">Order Summary</h2>
              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#f0f9ff] flex items-center justify-center text-xs font-bold text-[#0284c7] shrink-0">
                      {item.quantity}×
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#0c4a6e] truncate">{item.name}</div>
                      <div className="text-xs text-gray-400">UGX {item.price.toLocaleString()} /{item.unit}</div>
                    </div>
                    <div className="text-sm font-semibold text-[#0c4a6e] shrink-0">
                      UGX {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm mb-6">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span><span>UGX {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span>{subtotal >= 500000 ? <span className="text-green-600 font-medium">FREE</span> : "Calculated at delivery"}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span className="text-[#0c4a6e]">Total</span>
                  <span className="text-[#0284c7]">UGX {subtotal.toLocaleString()}+</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0284c7] to-[#226640] text-white font-bold text-base hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {placing ? <><Loader2 size={18} className="animate-spin" /> Placing order...</> : "Place Order"}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                We&apos;ll call you within 2 hours to confirm delivery
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
