"use client";

import { createContext, useContext, useEffect, useReducer, useCallback } from "react";
import { PRODUCTS } from "@/lib/data";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
};

type CartAction =
  | { type: "ADD"; item: Omit<CartItem, "quantity">; qty?: number }
  | { type: "REMOVE"; id: string }
  | { type: "UPDATE_QTY"; id: string; qty: number }
  | { type: "CLEAR" }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "HYDRATE"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, items: action.items };
    case "ADD": {
      const exists = state.items.find((i) => i.id === action.item.id);
      const addQty = action.qty ?? 1;
      if (exists) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.item.id ? { ...i, quantity: i.quantity + addQty } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, quantity: addQty }],
      };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "UPDATE_QTY": {
      if (action.qty <= 0) {
        return { ...state, items: state.items.filter((i) => i.id !== action.id) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: action.qty } : i
        ),
      };
    }
    case "CLEAR":
      return { ...state, items: [] };
    case "OPEN":
      return { ...state, isOpen: true };
    case "CLOSE":
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

type CartContextType = {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (productId: string, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kasc_cart");
      if (saved) dispatch({ type: "HYDRATE", items: JSON.parse(saved) });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("kasc_cart", JSON.stringify(state.items));
    } catch {}
  }, [state.items]);

  const addItem = useCallback((productId: string, qty = 1) => {
    const product = PRODUCTS.find((p) => p.id === productId || p.slug === productId);
    if (!product) return;
    dispatch({
      type: "ADD",
      qty,
      item: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        price: product.price,
        unit: product.unit,
      },
    });
  }, []);

  const removeItem = useCallback((id: string) => dispatch({ type: "REMOVE", id }), []);
  const updateQty = useCallback((id: string, qty: number) => dispatch({ type: "UPDATE_QTY", id, qty }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const openCart = useCallback(() => dispatch({ type: "OPEN" }), []);
  const closeCart = useCallback(() => dispatch({ type: "CLOSE" }), []);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items: state.items, isOpen: state.isOpen, itemCount, subtotal, addItem, removeItem, updateQty, clearCart, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
