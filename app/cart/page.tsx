"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight,
  CheckCircle2, Send, Loader2, ShoppingBag, Phone, MapPin, User, Mail
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORY_IMAGES: Record<string, string> = {
  fingerlings: "1560275619-4662e36fa65c",
  feed: "1586201375761-83865001e31c",
  liners: "1504711434969-e33886168f5c",
  equipment: "1574943320219-553eb213f72d",
};

const DELIVERY_REGIONS = [
  "Kampala / Central Uganda",
  "Eastern Uganda",
  "Western Uganda",
  "Northern Uganda",
  "Nairobi / Kenya",
  "Dar es Salaam / Tanzania",
  "Kigali / Rwanda",
  "South Africa",
  "Other (specify below)",
];

type Step = "cart" | "details" | "confirm";

export default function CartPage() {
  const { items, itemCount, subtotal, removeItem, updateQty, clearCart } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", region: "", address: "", notes: "",
  });

  function updateForm(field: string, val: string) {
    setForm(p => ({ ...p, [field]: val }));
  }

  async function submitOrder() {
    if (!form.name || !form.email || !form.phone || !form.region) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const orderItems = items.map(i => ({
        product_slug: i.slug,
        product_name: i.name,
        product_price: i.price,
        quantity: i.quantity,
        subtotal: i.price * i.quantity,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address || form.region,
            district: form.region,
            notes: form.notes || undefined,
          },
          payment_method: "cash_on_delivery",
        }),
      });

      if (!res.ok) throw new Error();
      clearCart();
      setSubmitted(true);
    } catch {
      toast.error("Failed to submit order. Please call us directly.");
    } finally {
      setSubmitting(false);
    }
  }

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f8fafc]">
        <div className="bg-white rounded-3xl shadow-[var(--shadow-card)] border border-gray-100 p-12 max-w-md w-full text-center mx-4">
          <div className="w-20 h-20 rounded-full bg-[#f0fcf4] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={36} className="text-[#226640]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0c4a6e] mb-3 font-display">Order Received!</h1>
          <p className="text-gray-500 leading-relaxed mb-2">
            Thank you, <strong>{form.name}</strong>. Your order request has been submitted successfully.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Our team will contact you at <strong>{form.phone}</strong> within 24 hours to confirm your order, delivery cost, and payment details.
          </p>
          <div className="space-y-3">
            <Link href="/shop" className="btn-primary w-full justify-center">
              <ShoppingBag size={15} /> Continue Shopping
            </Link>
            <Link href="/" className="w-full flex items-center justify-center text-sm text-gray-400 hover:text-[#0284c7] transition-colors py-2">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0 && step === "cart") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f8fafc]">
        <div className="bg-white rounded-3xl shadow-[var(--shadow-card)] border border-gray-100 p-12 max-w-sm w-full text-center mx-4">
          <div className="w-20 h-20 rounded-full bg-[#f8fafc] flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={32} className="text-gray-300" />
          </div>
          <h1 className="text-xl font-bold text-[#0c4a6e] mb-2">Your cart is empty</h1>
          <p className="text-gray-400 text-sm mb-6">Add products from our shop to place an order.</p>
          <Link href="/shop" className="btn-primary justify-center w-full">
            Browse Shop <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="container-wide max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/shop" className="hover:text-[#0284c7] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[#0284c7] font-medium">Cart & Order</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8 bg-white rounded-2xl border border-gray-100 shadow-[var(--shadow-card)] p-4">
          {(["cart", "details", "confirm"] as Step[]).map((s, i) => {
            const labels = { cart: "Cart", details: "Your Details", confirm: "Confirm" };
            const done = ["cart", "details", "confirm"].indexOf(s) < ["cart", "details", "confirm"].indexOf(step);
            const active = s === step;
            return (
              <div key={s} className="flex items-center flex-1">
                <div className="flex items-center gap-2 flex-1 justify-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                    done ? "bg-[#226640] text-white" : active ? "bg-[#0284c7] text-white" : "bg-gray-100 text-gray-400"
                  )}>
                    {done ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                  <span className={cn("text-sm font-medium hidden sm:block", active ? "text-[#0284c7]" : done ? "text-[#226640]" : "text-gray-400")}>
                    {labels[s]}
                  </span>
                </div>
                {i < 2 && <div className={cn("h-px flex-1 max-w-[3rem] mx-2", done ? "bg-[#226640]" : "bg-gray-200")} />}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">

            {/* STEP: CART */}
            {step === "cart" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[var(--shadow-card)] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="font-bold text-[#0c4a6e] font-display flex items-center gap-2">
                    <ShoppingCart size={18} className="text-[#0284c7]" />
                    Your Cart ({itemCount} items)
                  </h2>
                  <button onClick={() => { if (confirm("Clear cart?")) clearCart(); }} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                    Clear all
                  </button>
                </div>

                <div className="divide-y divide-gray-50">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-5 hover:bg-gray-50/50 transition-colors group">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-[#f0f9ff] to-[#f0fcf4] shrink-0">
                        <Image src={`https://images.unsplash.com/photo-${CATEGORY_IMAGES[item.category] ?? "1574943320219-553eb213f72d"}?w=160&q=80`} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/shop/${item.slug}`} className="font-semibold text-[#0c4a6e] hover:text-[#0284c7] transition-colors text-sm line-clamp-2 leading-snug block mb-1 font-display">
                          {item.name}
                        </Link>
                        <div className="text-xs text-gray-400 capitalize mb-3">{item.category} · {formatPrice(item.price)}/{item.unit}</div>

                        <div className="flex items-center gap-4 flex-wrap">
                          {/* Qty */}
                          <div className="flex items-center gap-0 bg-[#f8fafc] border border-gray-200 rounded-xl overflow-hidden">
                            <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#0284c7] transition-colors">
                              <Minus size={12} />
                            </button>
                            <span className="w-10 text-center text-sm font-bold text-[#0c4a6e]">{item.quantity}</span>
                            <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#0284c7] transition-colors">
                              <Plus size={12} />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={12} /> Remove
                          </button>
                          <span className="ml-auto font-bold text-[#0284c7] text-base">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4 bg-[#f8fafc] border-t border-gray-100 flex justify-between items-center">
                  <Link href="/shop" className="text-sm text-gray-500 hover:text-[#0284c7] flex items-center gap-1 transition-colors">
                    <ArrowLeft size={13} /> Continue Shopping
                  </Link>
                  <button onClick={() => setStep("details")} className="btn-primary text-sm">
                    Proceed to Details <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP: DETAILS */}
            {step === "details" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[var(--shadow-card)] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h2 className="font-bold text-[#0c4a6e] font-display">Your Contact & Delivery Details</h2>
                  <p className="text-sm text-gray-400 mt-0.5">We&apos;ll use this to confirm your order and arrange delivery.</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <User size={13} className="inline mr-1" />Full Name <span className="text-red-400">*</span>
                      </label>
                      <input value={form.name} onChange={e => updateForm("name", e.target.value)} placeholder="John Mugisha"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/10 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <Mail size={13} className="inline mr-1" />Email Address <span className="text-red-400">*</span>
                      </label>
                      <input type="email" value={form.email} onChange={e => updateForm("email", e.target.value)} placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/10 transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <Phone size={13} className="inline mr-1" />Phone / WhatsApp <span className="text-red-400">*</span>
                      </label>
                      <input value={form.phone} onChange={e => updateForm("phone", e.target.value)} placeholder="+256 700 000000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/10 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Delivery Region <span className="text-red-400">*</span>
                      </label>
                      <select value={form.region} onChange={e => updateForm("region", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#38bdf8] bg-white transition-all">
                        <option value="">Select your region…</option>
                        {DELIVERY_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <MapPin size={13} className="inline mr-1" />Specific Address / Farm Location
                    </label>
                    <input value={form.address} onChange={e => updateForm("address", e.target.value)} placeholder="e.g. Masaka Road, 2km past Mpigi town"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#38bdf8] transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes / Special Requirements</label>
                    <textarea value={form.notes} onChange={e => updateForm("notes", e.target.value)} rows={3}
                      placeholder="e.g. urgent delivery, specific packaging, questions about products…"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#38bdf8] transition-all resize-none" />
                  </div>
                </div>
                <div className="px-6 py-4 bg-[#f8fafc] border-t border-gray-100 flex justify-between">
                  <button onClick={() => setStep("cart")} className="btn-outline text-sm">
                    <ArrowLeft size={14} /> Back to Cart
                  </button>
                  <button onClick={() => {
                    if (!form.name || !form.email || !form.phone || !form.region) { toast.error("Please fill all required fields"); return; }
                    setStep("confirm");
                  }} className="btn-primary text-sm">
                    Review Order <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP: CONFIRM */}
            {step === "confirm" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[var(--shadow-card)] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h2 className="font-bold text-[#0c4a6e] font-display">Review & Confirm Order</h2>
                </div>
                <div className="p-6 space-y-5">
                  {/* Items summary */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Items Ordered</h3>
                    <div className="space-y-2">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div>
                            <div className="text-sm font-medium text-[#0c4a6e]">{item.name}</div>
                            <div className="text-xs text-gray-400">Qty: {item.quantity} × {formatPrice(item.price)}/{item.unit}</div>
                          </div>
                          <div className="font-bold text-[#0284c7] text-sm">{formatPrice(item.price * item.quantity)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact summary */}
                  <div className="bg-[#f8fafc] rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Delivery Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">Name</div><div className="font-medium text-[#0c4a6e]">{form.name}</div>
                      <div className="text-gray-500">Email</div><div className="font-medium text-[#0c4a6e]">{form.email}</div>
                      <div className="text-gray-500">Phone</div><div className="font-medium text-[#0c4a6e]">{form.phone}</div>
                      <div className="text-gray-500">Region</div><div className="font-medium text-[#0c4a6e]">{form.region}</div>
                      {form.address && <><div className="text-gray-500">Address</div><div className="font-medium text-[#0c4a6e]">{form.address}</div></>}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#fffbf0] border border-[#fde5b0] text-sm text-[#a05200]">
                    <strong>Note:</strong> Submitting this order sends a request to the KASC team. They will contact you within 24 hours to confirm availability, delivery cost, and payment options before processing.
                  </div>
                </div>
                <div className="px-6 py-4 bg-[#f8fafc] border-t border-gray-100 flex justify-between">
                  <button onClick={() => setStep("details")} className="btn-outline text-sm">
                    <ArrowLeft size={14} /> Edit Details
                  </button>
                  <button onClick={submitOrder} disabled={submitting} className="btn-primary text-sm disabled:opacity-60">
                    {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <><Send size={14} /> Submit Order</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[var(--shadow-card)] p-5 sticky top-24">
              <h3 className="font-bold text-[#0c4a6e] mb-4 font-display">Order Summary</h3>
              <div className="space-y-2 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">{item.quantity}× {item.name}</span>
                    <span className="font-medium text-[#0c4a6e] shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery</span>
                  <span className="text-[#226640] font-medium">TBC</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
                  <span className="text-[#0c4a6e]">Estimated Total</span>
                  <span className="text-[#0284c7]">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                {[
                  "Order confirmed within 24hrs",
                  "Delivery cost quoted separately",
                  "Multiple payment options available",
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 size={12} className="text-[#3aaf6c] shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-400 mb-2">Need help with your order?</div>
                <a href="tel:+256700000000" className="flex items-center gap-2 text-sm font-semibold text-[#0284c7] hover:underline">
                  <Phone size={13} /> +256 700 000000
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
