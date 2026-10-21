import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import { BRAND, fmt } from "../services/format.js";
import { ProductThumb } from "../components/PhoneCase.jsx";
import InventoryEditor from "../components/InventoryEditor.jsx";
import ProductForm from "../components/ProductForm.jsx";
import DemoBanner from "../components/DemoBanner.jsx";
import { IconAlert, IconBox, IconPlus, IconSearch, IconTrash } from "../components/Icons.jsx";

function statusOf(p) {
  if (p.stock === 0) return ["Out of stock", "out"];
  if (p.lowStockSkus > 0) return [`${p.lowStockSkus} low`, "low"];
  return ["In stock", "ok"];
}

/** Click-to-edit price; Enter or blur saves, Escape cancels. */
function PriceCell({ product, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(product.price);
  const inputRef = useRef(null);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);
  const save = async () => {
    setEditing(false);
    if (Number(value) === product.price) return;
    if (!(Number(value) > 0)) { setValue(product.price); return; }
    const ok = await onSave(product, Number(value));
    if (!ok) setValue(product.price);
  };
  if (!editing) {
    return (
      <button type="button" className="price-edit" onClick={() => { setValue(product.price); setEditing(true); }} aria-label={`Edit price of ${product.name}, currently ${fmt(product.price)}`}>
        {fmt(product.price)}
      </button>
    );
  }
  return (
    <input
      ref={inputRef}
      className="price-input"
      type="number"
      min="0"
      step="1000"
      value={value}
      aria-label={`Price of ${product.name} in rupiah`}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") { setValue(product.price); setEditing(false); } }}
    />
  );
}

export default function Dashboard({ admin, onLogout }) {
  const [catalog, setCatalog] = useState(null);
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef();

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2600);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [p, low] = await Promise.all([api.products(), api.lowStock()]);
      setProducts(p);
      setLowStock(low);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.catalog().then(setCatalog).catch((e) => setError(e.message));
    refresh();
  }, [refresh]);

  const devices = catalog?.devices ?? [];
  const thumbDevice = devices.find((d) => d.id === "ip17pro") ?? devices[0];
  const catName = (id) => catalog?.categories.find((c) => c.id === id)?.name ?? id;

  const visible = useMemo(() => products.filter((p) =>
    (category === "all" || p.category === category)
    && (!query || p.name.toLowerCase().includes(query.toLowerCase()))), [products, category, query]);

  const kpis = useMemo(() => ({
    products: products.length,
    skus: products.reduce((a, p) => a + p.skuCount, 0),
    units: products.reduce((a, p) => a + p.stock, 0),
    low: lowStock.length,
    value: products.reduce((a, p) => a + p.stock * p.price, 0),
  }), [products, lowStock]);

  const savePrice = async (product, price) => {
    try {
      await api.updateProduct(product.id, { price });
      toast(`${product.name} price updated`);
      refresh();
      return true;
    } catch (e) {
      toast(e.message);
      return false;
    }
  };

  const remove = async (product) => {
    if (!window.confirm(`Remove "${product.name}" from the store? It will be hidden from customers.`)) return;
    try {
      await api.deleteProduct(product.id);
      if (expanded === product.id) setExpanded(null);
      toast(`${product.name} removed`);
      refresh();
    } catch (e) {
      toast(e.message);
    }
  };

  const restock = async (sku) => {
    try {
      await api.setStock(sku.id, { delta: 10 });
      toast(`${sku.product} restocked +10`);
      refresh();
    } catch (e) {
      toast(e.message);
    }
  };

  const create = async (data) => {
    const created = await api.createProduct(data); // errors are shown inside the form
    setFormOpen(false);
    toast(`${created.name} created`);
    await refresh();
    setExpanded(created.id);
  };

  return (
    <div className="admin">
      <header className="nav admin-nav">
        <div className="nav__inner container">
          <Link to="/" className="logo" aria-label={`${BRAND.name} storefront`}>
            <span className="logo__mark" aria-hidden="true"><span>{BRAND.name[0]}</span></span>
            <span className="logo__word">{BRAND.name}</span>
            <span className="admin-tag">Admin</span>
          </Link>
          <nav className="nav__links" aria-label="Admin">
            <Link to="/">Storefront</Link>
            <a href="#inventory" aria-current="page">Inventory</a>
          </nav>
          <div className="admin-user">
            <span className="admin-user__name" title={admin?.email}>{admin?.name}</span>
            <button type="button" className="ghost-btn" onClick={onLogout}>Sign out</button>
          </div>
        </div>
      </header>
      <DemoBanner />

      <main className="container admin-main" id="inventory">
        <div className="admin-head">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1 className="section-title">Inventory</h1>
          </div>
          <button className="btn btn--primary" type="button" onClick={() => setFormOpen(true)} disabled={!catalog}>
            <span className="btn__icon"><IconPlus /></span> New product
          </button>
        </div>

        {error && <p className="form-error" role="alert">{error} <button className="link-btn" type="button" onClick={refresh}>Retry</button></p>}

        <div className="kpis">
          <div className="kpi"><span className="kpi__label">Active products</span><strong>{kpis.products}</strong></div>
          <div className="kpi"><span className="kpi__label">SKUs</span><strong>{kpis.skus.toLocaleString("id-ID")}</strong></div>
          <div className="kpi"><span className="kpi__label">Units in stock</span><strong>{kpis.units.toLocaleString("id-ID")}</strong></div>
          <div className={`kpi${kpis.low ? " kpi--warn" : ""}`}><span className="kpi__label">Low-stock SKUs</span><strong>{kpis.low}</strong></div>
          <div className="kpi kpi--wide"><span className="kpi__label">Stock value (retail)</span><strong>{fmt(kpis.value)}</strong></div>
        </div>

        <div className="admin-grid">
          <section className="panel" aria-labelledby="productsTitle">
            <div className="panel__head">
              <h2 id="productsTitle">Products</h2>
              <label className="search">
                <IconSearch />
                <input type="search" placeholder="Search products" aria-label="Search products" value={query} onChange={(e) => setQuery(e.target.value)} />
              </label>
            </div>
            <div className="tabs tabs--scroll" role="tablist" aria-label="Filter by category">
              {[{ id: "all", name: "All" }, ...(catalog?.categories ?? [])].map((c) => (
                <button key={c.id} role="tab" type="button" aria-selected={category === c.id} onClick={() => setCategory(c.id)}>{c.name}</button>
              ))}
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Category</th>
                    <th scope="col">Price</th>
                    <th scope="col">Colors</th>
                    <th scope="col" className="num">Stock</th>
                    <th scope="col">Status</th>
                    <th scope="col"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan={7} className="muted table-empty">Loading products…</td></tr>}
                  {!loading && !visible.length && <tr><td colSpan={7} className="muted table-empty">No products match. Try another search or category.</td></tr>}
                  {visible.map((p) => {
                    const [label, tone] = statusOf(p);
                    const open = expanded === p.id;
                    return (
                      <Fragment key={p.id}>
                        <tr className={open ? "is-open" : ""}>
                          <td>
                            <div className="prod-cell">
                              <span className="prod-thumb">{thumbDevice && <ProductThumb product={p} device={thumbDevice} />}</span>
                              <span><strong>{p.name}</strong><small className="muted">{p.slug}</small></span>
                            </div>
                          </td>
                          <td>{catName(p.category)}</td>
                          <td><PriceCell product={p} onSave={savePrice} /></td>
                          <td>
                            <span className="dots" aria-label={p.colors.map((c) => c.name).join(", ")}>
                              {p.colors.slice(0, 5).map((c) => <span key={c.id} className="dot-swatch" style={{ background: c.hex }} />)}
                              {p.colors.length > 5 && <small>+{p.colors.length - 5}</small>}
                            </span>
                          </td>
                          <td className="num">{p.stock.toLocaleString("id-ID")}<small className="muted"> / {p.skuCount} SKU</small></td>
                          <td><span className={`pill-status pill-status--${tone}`}>{label}</span></td>
                          <td className="row-actions">
                            <button type="button" className="ghost-btn" aria-expanded={open} aria-controls={`inv-${p.id}`} onClick={() => setExpanded(open ? null : p.id)}>
                              {open ? "Close" : "Manage stock"}
                            </button>
                            <button type="button" className="icon-btn" aria-label={`Remove ${p.name}`} onClick={() => remove(p)}><IconTrash /></button>
                          </td>
                        </tr>
                        {open && (
                          <tr className="inv-row" id={`inv-${p.id}`}>
                            <td colSpan={7}><InventoryEditor productId={p.id} onChanged={refresh} onError={toast} /></td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="panel low-panel" aria-labelledby="lowTitle">
            <div className="panel__head">
              <h2 id="lowTitle"><IconAlert /> Low stock</h2>
              <span className="muted">{lowStock.length} SKU{lowStock.length === 1 ? "" : "s"}</span>
            </div>
            {!lowStock.length && !loading && (
              <p className="empty-note"><IconBox /> Everything is above its threshold.</p>
            )}
            <ul className="low-list">
              {lowStock.slice(0, 10).map((s) => (
                <li key={s.id}>
                  <div>
                    <strong>{s.product}</strong>
                    <small className="muted">{[s.device, s.color].filter(Boolean).join(" · ")}</small>
                  </div>
                  <span className={`qty${s.stock === 0 ? " qty--out" : ""}`}>{s.stock}</span>
                  <button type="button" className="ghost-btn" onClick={() => restock(s)} aria-label={`Add 10 to ${s.product} ${s.device ?? ""} ${s.color}`}>+10</button>
                </li>
              ))}
            </ul>
            {lowStock.length > 10 && <p className="muted low-more">+{lowStock.length - 10} more — filter the table to see them.</p>}
          </aside>
        </div>
      </main>

      {formOpen && catalog && (
        <ProductForm categories={catalog.categories} devices={catalog.devices} onSubmit={create} onClose={() => setFormOpen(false)} />
      )}
      <div className={`toast${toastMsg ? " show" : ""}`} role="status" aria-live="polite">{toastMsg}</div>
    </div>
  );
}
