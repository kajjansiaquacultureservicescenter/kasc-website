"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart, type CartProduct } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

type Props = {
  product: CartProduct;
  qty?: number;
  variant?: "full" | "icon";
  className?: string;
};

export default function AddToCartButton({ product, qty = 1, variant = "full", className }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleAdd}
        title="Add to cart"
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0",
          added
            ? "bg-[#226640] text-white scale-95"
            : "bg-[#eef8fd] text-[#0f5070] hover:bg-[#0f5070] hover:text-white hover:scale-110",
          className
        )}
      >
        {added ? <Check size={15} /> : <ShoppingCart size={15} />}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={cn(
        "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200",
        added
          ? "bg-[#226640] text-white"
          : "bg-[#0f5070] text-white hover:bg-[#0a2d43] active:scale-95",
        className
      )}
    >
      {added ? (
        <><Check size={15} /> Added!</>
      ) : (
        <><ShoppingCart size={15} /> Add to Cart</>
      )}
    </button>
  );
}
