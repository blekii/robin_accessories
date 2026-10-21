import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "./ShopContext.jsx";
import { useStoreData } from "./StoreData.jsx";
import { ProductThumb } from "./PhoneCase.jsx";
import { fmt } from "../services/format.js";
import { IconClose, IconSearch } from "./Icons.jsx";

/** Matches name, category and color names; every word must appear somewhere. */
export function searchProducts(products, categoryName, query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return products;
  return products.filter((p) => {
    const hay = [p.name, categoryName(p.category), ...p.colors.map((c) => c.name), p.finish ?? ""].join(" ").toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

export default function SearchDialog() {
  const { searchOpen, setSearchOpen } = useShop();
  const { products, categories, categoryName, defaultDevice } = useStoreData();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const lastFocus = useRef(null);
  const navigate = useNavigate();

  const results = useMemo(
    () => (query.trim() ? searchProducts(products, categoryName, query).slice(0, 8) : []),
    [products, categoryName, query],
  );

  useEffect(() => {
    if (!searchOpen) return;
    lastFocus.current = document.activeElement;
    setActive(0);
    requestAnimationFrame(() => inputRef.current?.focus());
    const onKey = (e) => e.key === "Escape" && setSearchOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lastFocus.current?.focus?.();
    };
  }, [searchOpen, setSearchOpen]);

  useEffect(() => setActive(0), [query]);

  if (!searchOpen) return null;

  const close = () => setSearchOpen(false);
  const go = (to) => { close(); setQuery(""); navigate(to); };
  const openProduct = (p) => go(`/products?q=${encodeURIComponent(p.name)}&category=${p.category}`);
  const seeAll = () => go(`/products${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) openProduct(results[active]); else seeAll();
    }
  };

  return (
    <div className="search-scrim" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="search-panel" role="dialog" aria-modal="true" aria-label="Search products">
        <div className="search-bar">
          <IconSearch />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search cases, straps, chargers…"
            aria-label="Search products"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="searchResults"
            aria-activedescendant={results[active] ? `sr-${results[active].id}` : undefined}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button type="button" className="icon-btn" aria-label="Close search" onClick={close}><IconClose /></button>
        </div>

        {!query.trim() && (
          <div className="search-hint">
            <p className="eyebrow">Browse</p>
            <div className="chip-row">
              {categories.map((c) => (
                <button key={c.id} type="button" className="ghost-btn" onClick={() => go(`/products?category=${c.id}`)}>{c.name}</button>
              ))}
            </div>
          </div>
        )}

        {query.trim() && (
          <>
            <ul className="search-results" id="searchResults" role="listbox" aria-label="Results">
              {results.map((p, i) => (
                <li
                  key={p.id}
                  id={`sr-${p.id}`}
                  role="option"
                  aria-selected={i === active}
                  className={i === active ? "is-active" : ""}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => openProduct(p)}
                >
                  <span className="search-thumb"><ProductThumb product={p} device={defaultDevice} /></span>
                  <span className="search-name"><strong>{p.name}</strong><small className="muted">{categoryName(p.category)}</small></span>
                  <span className="search-price">{fmt(p.price)}</span>
                </li>
              ))}
            </ul>
            {!results.length && <p className="search-empty muted">No products match “{query.trim()}”. Try a color or category, like “clear” or “strap”.</p>}
            <button type="button" className={`search-all${active === results.length ? " is-active" : ""}`} onClick={seeAll}>
              See all results for “{query.trim()}”
            </button>
          </>
        )}
      </div>
    </div>
  );
}
