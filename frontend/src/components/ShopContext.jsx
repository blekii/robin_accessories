import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const ShopContext = createContext(null);

// Cart + wishlist survive page changes and reloads in this browser (not shared across devices).
const STORE_KEY = "robin.shop.v1";
function loadSaved() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    return {
      cart: Array.isArray(data?.cart) ? data.cart : [],
      wishlist: Array.isArray(data?.wishlist) ? data.wishlist : [],
    };
  } catch {
    return { cart: [], wishlist: [] };
  }
}

/** Cart, wishlist, cart drawer and toast state shared across the storefront pages. */
export function ShopProvider({ children }) {
  const saved = useRef(loadSaved()).current;
  const [cart, setCart] = useState(saved.cart);
  const [wishlist, setWishlist] = useState(() => new Set(saved.wishlist));
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [bump, setBump] = useState(0);
  const timer = useRef();

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ cart, wishlist: [...wishlist] }));
    } catch { /* storage full or blocked — the session still works */ }
  }, [cart, wishlist]);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(""), 2600);
  }, []);

  /** item: { key, title, sub, price, thumb: {product, color, device} } */
  const addItem = useCallback((item) => {
    setCart((prev) => {
      const found = prev.find((i) => i.key === item.key);
      return found
        ? prev.map((i) => (i.key === item.key ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { ...item, qty: 1 }];
    });
    setBump((b) => b + 1);
    toast(`${item.title} added to cart`);
  }, [toast]);

  const setQty = useCallback((key, qty) => {
    setCart((prev) => (qty <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, qty: Math.min(qty, 99) } : i))));
  }, []);

  const removeItem = useCallback((key) => {
    const item = cart.find((i) => i.key === key);
    setCart((prev) => prev.filter((i) => i.key !== key));
    if (item) toast(`${item.title} removed`);
  }, [cart, toast]);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWish = useCallback((id, name) => {
    const had = wishlist.has(id);
    setWishlist((prev) => {
      const next = new Set(prev);
      if (had) next.delete(id); else next.add(id);
      return next;
    });
    toast(had ? `${name ?? "Item"} removed from saved items` : `${name ?? "Item"} saved`);
  }, [wishlist, toast]);

  const value = useMemo(() => ({
    cart, addItem, removeItem, setQty, clearCart,
    count: cart.reduce((a, i) => a + i.qty, 0),
    total: cart.reduce((a, i) => a + i.qty * i.price, 0),
    wishlist, toggleWish, wishCount: wishlist.size,
    cartOpen, setCartOpen,
    searchOpen, setSearchOpen,
    toastMsg, toast, bump,
  }), [cart, addItem, removeItem, setQty, clearCart, wishlist, toggleWish, cartOpen, searchOpen, toastMsg, toast, bump]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export const useShop = () => useContext(ShopContext);
