"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Check, Phone } from "lucide-react";
import { useCart } from "@/lib/cart-context";

type Props = {
  product: { id: string; name: string; slug: string; price: number; unit: string; inStock: boolean };
};

export default function ProductActions({ product }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, openCart } = useCart();

  function handleAdd() {
    addItem(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (!product.inStock) {
    return (
      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
          <p className="text-gray-500 text-sm font-medium mb-3">This product is currently out of stock.</p>
          <a href="tel:+256700000000" className="btn-outline text-sm inline-flex">
            <Phone size={14} /> Call to Check Availability
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-600 shrink-0">Quantity</span>
        <div className="flex items-center gap-0 bg-[#f8fafc] border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#0f5070] transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-12 text-center font-bold text-[#071e2e] text-sm">{qty}</span>
          <button
            onClick={() => setQty(q => q + 1)}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#0f5070] transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        <span className="text-sm text-gray-400">× {product.unit}</span>
      </div>

      {/* CTA buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
            added
              ? "bg-[#226640] text-white"
              : "bg-[#0f5070] text-white hover:bg-[#0a2d43] active:scale-95"
          }`}
        >
          {added ? (
            <><Check size={16} /> Added to Cart!</>
          ) : (
            <><ShoppingCart size={16} /> Add to Cart</>
          )}
        </button>
        {added && (
          <button
            onClick={openCart}
            className="px-4 py-3.5 rounded-xl border-2 border-[#226640] text-[#226640] font-semibold text-sm hover:bg-[#f0fcf4] transition-colors"
          >
            View Cart
          </button>
        )}
      </div>

      <Link
        href="/cart"
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 border-[#0f5070] text-[#0f5070] font-semibold text-sm hover:bg-[#eef8fd] transition-colors"
        onClick={handleAdd}
      >
        Buy Now
      </Link>
    </div>
  );
}
