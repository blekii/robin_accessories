import { useEffect, useRef, useState } from "react";
import { api } from "../services/api.js";
import { IconMinus, IconPlus } from "./Icons.jsx";

/** One SKU's stock with −/+ and a typed value; saves after a short pause. */
function StockCell({ sku, label, onSaved, onError }) {
  const [value, setValue] = useState(sku.stock);
  const [state, setState] = useState("idle"); // idle | saving | saved
  const timer = useRef();
  const saved = useRef(sku.stock);

  useEffect(() => { setValue(sku.stock); saved.current = sku.stock; }, [sku.stock]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const commit = (next) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (next === saved.current) return;
      setState("saving");
      try {
        const res = await api.setStock(sku.id, { stock: next });
        saved.current = res.stock;
        setState("saved");
        onSaved?.();
        setTimeout(() => setState("idle"), 1200);
      } catch (e) {
        setValue(saved.current);
        setState("idle");
        onError?.(e.message);
      }
    }, 450);
  };
  const change = (next) => {
    const n = Math.max(0, Number.isFinite(next) ? Math.round(next) : 0);
    setValue(n);
    commit(n);
  };

  const low = value <= sku.lowStockThreshold;
  return (
    <div className={`stock-cell${low ? " stock-cell--low" : ""}${value === 0 ? " stock-cell--out" : ""}`}>
      <button type="button" className="stock-cell__btn" aria-label={`Decrease ${label}`} onClick={() => change(value - 1)} disabled={value === 0}><IconMinus /></button>
      <input
        type="number"
        min="0"
        inputMode="numeric"
        aria-label={`Stock for ${label}`}
        value={value}
        onChange={(e) => change(parseInt(e.target.value, 10))}
      />
      <button type="button" className="stock-cell__btn" aria-label={`Increase ${label}`} onClick={() => change(value + 1)}><IconPlus /></button>
      <span className="stock-cell__state" aria-live="polite">{state === "saving" ? "Saving…" : state === "saved" ? "Saved" : ""}</span>
    </div>
  );
}

/** Stock matrix for one product: devices × colors for cases, a single row otherwise. */
export default function InventoryEditor({ productId, onChanged, onError }) {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api.product(productId).then((p) => alive && setProduct(p)).catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [productId]);

  if (error) return <p className="form-error">{error}</p>;
  if (!product) return <p className="muted inv-loading">Loading stock…</p>;

  const rowsKeys = [...new Set(product.inventory.map((i) => i.deviceId ?? "_"))];
  const find = (rowKey, colorId) => product.inventory.find((i) => (i.deviceId ?? "_") === rowKey && i.colorId === colorId);
  const rowLabel = (key) => (key === "_" ? "All" : product.inventory.find((i) => i.deviceId === key)?.device ?? key);

  return (
    <div className="inv-editor">
      <div className="inv-scroll">
        <table className="inv-table">
          <thead>
            <tr>
              <th scope="col">{rowsKeys[0] === "_" ? "" : "Device"}</th>
              {product.colors.map((c) => (
                <th scope="col" key={c.id}><span className="dot-swatch" style={{ background: c.hex }} aria-hidden="true" />{c.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowsKeys.map((rk) => (
              <tr key={rk}>
                <th scope="row">{rowLabel(rk)}</th>
                {product.colors.map((c) => {
                  const sku = find(rk, c.id);
                  return (
                    <td key={c.id}>
                      {sku
                        ? <StockCell sku={sku} label={`${rowLabel(rk)} ${c.name}`} onSaved={onChanged} onError={onError} />
                        : <span className="muted">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="inv-hint muted">Changes save automatically. Cells turn amber at or below the low-stock threshold (5).</p>
    </div>
  );
}
