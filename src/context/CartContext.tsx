import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { STORAGE_KEYS } from "@/constants";
import type { CartLine, MenuItem } from "@/lib/types";
import { useCafe } from "@/context/CafeContext";
import { couponService } from "@/services/couponService";

interface CartContextValue {
  lines: CartLine[]; count: number; subtotal: number; discount: number; couponCode: string | null; couponError: string | null; tax: number; deliveryFee: number; total: number; isOpen: boolean;
  openCart: () => void; closeCart: () => void; addItem: (item: MenuItem, quantity?: number) => void; removeItem: (itemId: string) => void; increment: (itemId: string) => void; decrement: (itemId: string) => void;
  applyCoupon: (code: string) => Promise<boolean>; removeCoupon: () => void; clearCart: () => void;
}
const CartContext = createContext<CartContextValue | null>(null);
function readStoredCart(): CartLine[] { if (typeof window === "undefined") return []; try { const raw = window.localStorage.getItem(STORAGE_KEYS.cart); return raw ? (JSON.parse(raw) as CartLine[]) : []; } catch { return []; } }
function readStoredCoupon(): string | null { if (typeof window === "undefined") return null; return window.localStorage.getItem(STORAGE_KEYS.coupon); }

export function CartProvider({ children }: { children: ReactNode }) {
  const { settings } = useCafe(); const [lines, setLines] = useState<CartLine[]>([]); const [isOpen, setIsOpen] = useState(false); const [couponCode, setCouponCode] = useState<string | null>(null); const [discount, setDiscount] = useState(0); const [couponError, setCouponError] = useState<string | null>(null);
  useEffect(() => { setLines(readStoredCart()); setCouponCode(readStoredCoupon()); }, []);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(lines)); }, [lines]);
  useEffect(() => { if (typeof window !== "undefined") { if (couponCode) window.localStorage.setItem(STORAGE_KEYS.coupon, couponCode); else window.localStorage.removeItem(STORAGE_KEYS.coupon); } }, [couponCode]);
  useEffect(() => { if (!couponCode || lines.length === 0) return; void applyCouponInternal(couponCode); }, []);
  const addItem = useCallback((item: MenuItem, quantity = 1) => { setLines((current) => { const existing = current.find((line) => line.itemId === item._id); if (existing) return current.map((line) => line.itemId === item._id ? { ...line, quantity: line.quantity + quantity } : line); return [...current, { itemId: item._id, name: item.name, price: item.price, image: item.image, vegetarian: item.vegetarian, quantity }]; }); }, []);
  const removeItem = useCallback((itemId: string) => setLines((current) => current.filter((line) => line.itemId !== itemId)), []);
  const increment = useCallback((itemId: string) => setLines((current) => current.map((line) => line.itemId === itemId ? { ...line, quantity: line.quantity + 1 } : line)), []);
  const decrement = useCallback((itemId: string) => setLines((current) => current.map((line) => line.itemId === itemId ? { ...line, quantity: line.quantity - 1 } : line).filter((line) => line.quantity > 0)), []);
  const removeCoupon = useCallback(() => { setCouponCode(null); setDiscount(0); setCouponError(null); }, []);
  const applyCouponInternal = async (code: string) => { try { const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0); const result = await couponService.validate(code, subtotal); setCouponCode(result.code); setDiscount(result.discount); setCouponError(null); return true; } catch (error) { setCouponCode(null); setDiscount(0); setCouponError(error instanceof Error ? error.message : "Unable to apply coupon"); return false; } };
  const applyCoupon = useCallback((code: string) => applyCouponInternal(code), [lines]);
  const clearCart = useCallback(() => { setLines([]); removeCoupon(); }, [removeCoupon]);
  const value = useMemo<CartContextValue>(() => { const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0); const discountedSubtotal = Math.max(0, subtotal - discount); const tax = Math.round((discountedSubtotal * (settings?.taxPercentage ?? 5)) / 100); const deliveryFee = discountedSubtotal === 0 || discountedSubtotal > 999 ? 0 : (settings?.deliveryFee ?? 49); return { lines, count: lines.reduce((sum, line) => sum + line.quantity, 0), subtotal, discount, couponCode, couponError, tax, deliveryFee, total: discountedSubtotal + tax + deliveryFee, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false), addItem, removeItem, increment, decrement, applyCoupon, removeCoupon, clearCart }; }, [lines, discount, couponCode, couponError, isOpen, settings, addItem, removeItem, increment, decrement, applyCoupon, removeCoupon, clearCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used inside <CartProvider>"); return context; }
