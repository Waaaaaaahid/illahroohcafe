import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STORAGE_KEYS } from "@/constants";
import type { CartLine, MenuItem } from "@/lib/types";
import { useCafe } from "@/context/CafeContext";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  increment: (itemId: string) => void;
  decrement: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.cart);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { settings } = useCafe();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Hydration-safe: localStorage is only read after mount.
  useEffect(() => {
    setLines(readStoredCart());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(lines));
  }, [lines]);

  const addItem = useCallback((item: MenuItem, quantity = 1) => {
    setLines((current) => {
      const existing = current.find((line) => line.itemId === item._id);
      if (existing) {
        return current.map((line) =>
          line.itemId === item._id ? { ...line, quantity: line.quantity + quantity } : line,
        );
      }
      return [
        ...current,
        {
          itemId: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          vegetarian: item.vegetarian,
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setLines((current) => current.filter((line) => line.itemId !== itemId));
  }, []);

  const increment = useCallback((itemId: string) => {
    setLines((current) =>
      current.map((line) => (line.itemId === itemId ? { ...line, quantity: line.quantity + 1 } : line)),
    );
  }, []);

  const decrement = useCallback((itemId: string) => {
    setLines((current) =>
      current
        .map((line) => (line.itemId === itemId ? { ...line, quantity: line.quantity - 1 } : line))
        .filter((line) => line.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    const tax = Math.round((subtotal * (settings?.taxPercentage ?? 5)) / 100);
    const deliveryFee = subtotal === 0 || subtotal > 999 ? 0 : (settings?.deliveryFee ?? 49);
    return {
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal,
      tax,
      deliveryFee,
      total: subtotal + tax + deliveryFee,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      increment,
      decrement,
      clearCart,
    };
  }, [lines, isOpen, settings, addItem, removeItem, increment, decrement, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
