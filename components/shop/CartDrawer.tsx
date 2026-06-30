"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice, cn } from "@/lib/utils";

const CATEGORY_IMAGES: Record<string, string> = {
  fingerlings: "1544551763-46a013bb70d5",
  feed: "1586201375761-83865001e31c",
  liners: "1558618666-fcd25c85cd64",
  equipment: "1617817546668-b5db71eef39e",
};

export default function CartDrawer() {
  const { items, isOpen, itemCount, subtotal, removeItem, updateQty, closeCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn("fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className={cn(
        "fixed top-0 right-0 bottom-0 z-[70] w-full sm:w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#226640] flex items-center justify-center">
              <ShoppingCart size={17} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-[#0c4a6e] font-display">Your Cart</h2>
              <p className="text-xs text-gray-400">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
            </div>
          </div>
          <button onClick={closeCart} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-20 h-20 rounded-full bg-[#f8fafc] flex items-center justify-center mb-4">
                <ShoppingBag size={32} className="text-gray-300" />
              </div>
              <h3 className="font-semibold text-[#0c4a6e] mb-1">Your cart is empty</h3>
              <p className="text-gray-400 text-sm mb-6">Add products from our shop to place an order.</p>
              <button onClick={closeCart} className="btn-primary text-sm">
                Browse Shop <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 rounded-2xl bg-[#f8fafc] border border-gray-100 hover:border-gray-200 transition-colors group">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-[#f0f9ff] to-[#f0fcf4] shrink-0">
                    <Image
                      src={`https://images.unsplash.com/photo-${CATEGORY_IMAGES[item.category] ?? "1617817546668-b5db71eef39e"}?w=120&q=80`}
                      alt={item.name} fill className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link href={`/shop/${item.slug}`} onClick={closeCart}
                      className="text-sm font-semibold text-[#0c4a6e] hover:text-[#0284c7] transition-colors line-clamp-2 leading-tight block mb-1">
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-1 mb-2">
                      <Tag size={11} className="text-gray-400" />
                      <span className="text-xs text-gray-400 capitalize">{item.category}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Qty controls */}
                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#0284c7] transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-[#0c4a6e]">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#0284c7] transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0284c7]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100 space-y-4 shrink-0 bg-white">
            {/* Unit note */}
            <p className="text-xs text-gray-400 text-center">
              Prices shown per listed unit. Final invoice confirmed before payment.
            </p>

            {/* Subtotal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-medium text-gray-700">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Delivery</span>
                <span className="text-[#226640] font-medium">Quoted separately</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0c4a6e]">Estimated Total</span>
                <span className="font-bold text-xl text-[#0284c7]">{formatPrice(subtotal)}</span>
              </div>
            </div>

            {/* Actions */}
            <Link
              href="/cart"
              onClick={closeCart}
              className="btn-primary w-full justify-center text-sm py-3.5"
            >
              Proceed to Order <ArrowRight size={15} />
            </Link>
            <button onClick={closeCart} className="w-full text-center text-sm text-gray-400 hover:text-[#0284c7] transition-colors py-1">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
