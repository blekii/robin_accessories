import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useStoreData } from "../components/StoreData.jsx";
import { ProductCard } from "../components/ProductCards.jsx";
import { searchProducts } from "../components/SearchDialog.jsx";
import { IconDown, IconSearch } from "../components/Icons.jsx";

const SORTS = [
  ["featured", "Featured"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["name", "Name A–Z"],
];

/** /products — every product, filterable. Filters live in the URL (?category=&q=&device=&sort=). */
export default function Products() {
  const { data, error, reload, products, categories, devices, defaultDevice, categoryName } = useStoreData();
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "all";
  const q = params.get("q") ?? "";
  const sort = params.get("sort") ?? "featured";
  const deviceId = params.get("device") ?? defaultDevice?.id;
  const device = devices.find((d) => d.id === deviceId) ?? defaultDevice;
  const [draft, setDraft] = useState(q);
  useEffect(() => setDraft(q), [q]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v && v !== "all" ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };

  // debounce typing into the URL
  useEffect(() => {
    if (draft === q) return undefined;
    const t = setTimeout(() => update({ q: draft.trim() }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const list = useMemo(() => {
    let items = products.filter((p) => category === "all" || p.category === category);
    if (device && (category === "cases" || params.get("device"))) {
      items = items.filter((p) => p.category !== "cases" || !p.devices.length || p.devices.includes(device.id));
    }
    items = searchProducts(items, categoryName, q);
    const sorted = [...items];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "featured") sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
    return sorted;
  }, [products, category, q, sort, device, params, categoryName]);

  const title = category === "all" ? "All products" : categoryName(category);
  const filtered = category !== "all" || q;

  return (
    <div className="container page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span aria-hidden="true">/</span>
        {category === "all" ? <span aria-current="page">All products</span> : <><Link to="/products">All products</Link><span aria-hidden="true">/</span><span aria-current="page">{title}</span></>}
      </nav>

      <div className="page-head">
        <div>
          <p className="eyebrow">Shop</p>
          <h1 className="section-title">{title}</h1>
        </div>
        <p className="muted result-count" aria-live="polite">{data ? `${list.length} product${list.length === 1 ? "" : "s"}` : ""}</p>
      </div>

      <div className="filters">
        <label className="search filters__search">
          <IconSearch />
          <input type="search" placeholder="Search products" aria-label="Search products" value={draft} onChange={(e) => setDraft(e.target.value)} />
        </label>
        <div className="tabs tabs--scroll" role="tablist" aria-label="Category">
          {[{ id: "all", name: "All" }, ...categories].map((c) => (
            <button key={c.id} role="tab" type="button" aria-selected={category === c.id} onClick={() => update({ category: c.id })}>{c.name}</button>
          ))}
        </div>
        <div className="filters__selects">
          {(category === "all" || category === "cases") && devices.length > 0 && (
            <label className="mini-select">
              <span className="sr-only">Show cases for</span>
              <select value={device?.id} onChange={(e) => update({ device: e.target.value })} aria-label="Show cases for">
                {devices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <IconDown />
            </label>
          )}
          <label className="mini-select">
            <span className="sr-only">Sort by</span>
            <select value={sort} onChange={(e) => update({ sort: e.target.value === "featured" ? "" : e.target.value })} aria-label="Sort by">
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <IconDown />
          </label>
        </div>
      </div>

      {error && (
        <div className="load-state">
          <p>Couldn't load products: {error}</p>
          <button className="btn btn--primary" type="button" onClick={reload}>Try again</button>
        </div>
      )}
      {!data && !error && <p className="muted page-loading" aria-busy="true">Loading products…</p>}

      {data && list.length > 0 && (
        <div className="grid">
          {list.map((p, i) => (
            <ProductCard key={`${p.id}-${device?.id}`} product={p} device={device} devices={devices} categoryName={categoryName} index={i} />
          ))}
        </div>
      )}

      {data && !list.length && (
        <div className="empty-state">
          <h2>Nothing matches{q ? ` “${q}”` : ""}</h2>
          <p className="muted">Try a different word, or clear the filters to see everything.</p>
          {filtered && <button type="button" className="btn btn--primary" onClick={() => setParams({}, { replace: true })}>Clear filters</button>}
        </div>
      )}
    </div>
  );
}
