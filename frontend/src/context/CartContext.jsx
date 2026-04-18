import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";

const CartContext = createContext(null);
const KEY = "brianna_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((product, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [
        ...prev,
        { id: product.id, name: product.name, price: product.price, image: product.image, slug: product.slug, qty },
      ];
    });
    toast.success(`${product.name} added to basket`, { position: "top-right" });
    setOpen(true);
  }, []);

  const update = useCallback((id, qty) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)));
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { subtotal, count } = useMemo(() => {
    const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
    const c = items.reduce((s, i) => s + i.qty, 0);
    return { subtotal: sub, count: c };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, add, update, remove, clear, subtotal, count, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
