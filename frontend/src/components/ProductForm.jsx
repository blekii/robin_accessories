import { useEffect, useRef, useState } from "react";
import { IconClose, IconPlus, IconTrash } from "./Icons.jsx";

const FINISHES = ["crystal", "clear", "leather", "silicone", "tough"];
const blankColor = () => ({ name: "", hex: "#cccccc" });

/** Modal form for adding a product. Calls onSubmit(data) and shows the API's error if it fails. */
export default function ProductForm({ categories, devices, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name: "", category: categories[0]?.id ?? "cases", price: "", initialStock: 10,
    finish: "silicone", tagline: "", description: "",
    colors: [blankColor()], devices: devices.map((d) => d.id),
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const firstField = useRef(null);
  const isCase = form.category === "cases";

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setColor = (i, key, value) => setForm((f) => ({ ...f, colors: f.colors.map((c, j) => (j === i ? { ...c, [key]: value } : c)) }));
  const toggleDevice = (id) => setForm((f) => ({
    ...f, devices: f.devices.includes(id) ? f.devices.filter((d) => d !== id) : [...f.devices, id],
  }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Enter a product name.";
    if (!(Number(form.price) > 0)) e.price = "Enter a price above 0.";
    if (form.colors.some((c) => !c.name.trim())) e.colors = "Give every color a name.";
    if (isCase && !form.devices.length) e.devices = "Pick at least one iPhone this case fits.";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => document.querySelector(".modal [aria-invalid=true]")?.focus());
      return;
    }
    setSaving(true);
    setSubmitError("");
    try {
      await onSubmit({
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        initialStock: Number(form.initialStock) || 0,
        colors: form.colors.map((c) => ({ name: c.name.trim(), hex: c.hex })),
        devices: isCase ? form.devices : [],
        ...(isCase ? { finish: form.finish, tagline: form.tagline || null, description: form.description || null } : {}),
      });
    } catch (err) {
      setSubmitError(err.message);
      setSaving(false);
    }
  };

  const skuCount = form.colors.length * (isCase ? Math.max(form.devices.length, 1) : 1);

  return (
    <div className="modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="pfTitle" onSubmit={submit} noValidate>
        <div className="modal__head">
          <h2 id="pfTitle">New product</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}><IconClose /></button>
        </div>

        <div className="modal__body">
          {submitError && <p className="form-error" role="alert">{submitError}</p>}

          <div className="form-row">
            <label className="field">
              <span>Name <abbr title="required">*</abbr></span>
              <input ref={firstField} value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "err-name" : undefined} />
              {errors.name && <small className="field-error" id="err-name">{errors.name}</small>}
            </label>
            <label className="field">
              <span>Category</span>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label className="field">
              <span>Price (Rp) <abbr title="required">*</abbr></span>
              <input type="number" min="0" step="1000" inputMode="numeric" value={form.price} onChange={(e) => set("price", e.target.value)} aria-invalid={!!errors.price} aria-describedby={errors.price ? "err-price" : undefined} />
              {errors.price && <small className="field-error" id="err-price">{errors.price}</small>}
            </label>
            <label className="field">
              <span>Starting stock per SKU</span>
              <input type="number" min="0" inputMode="numeric" value={form.initialStock} onChange={(e) => set("initialStock", e.target.value)} />
            </label>
          </div>

          {isCase && (
            <>
              <div className="form-row">
                <label className="field">
                  <span>Finish (drives the 3D preview)</span>
                  <select value={form.finish} onChange={(e) => set("finish", e.target.value)}>
                    {FINISHES.map((f) => <option key={f} value={f}>{f[0].toUpperCase() + f.slice(1)}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Tagline</span>
                  <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Catch the light, everywhere." />
                </label>
              </div>
              <label className="field">
                <span>Description</span>
                <textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
              </label>
            </>
          )}

          <fieldset className="field">
            <legend>Colors</legend>
            <div className="color-list">
              {form.colors.map((c, i) => (
                <div className="color-row" key={i}>
                  <input type="color" value={c.hex} onChange={(e) => setColor(i, "hex", e.target.value)} aria-label={`Color ${i + 1} swatch`} />
                  <input value={c.name} onChange={(e) => setColor(i, "name", e.target.value)} placeholder="Color name" aria-label={`Color ${i + 1} name`} aria-invalid={!!errors.colors && !c.name.trim()} />
                  <button type="button" className="icon-btn" aria-label={`Remove color ${i + 1}`} disabled={form.colors.length === 1} onClick={() => set("colors", form.colors.filter((_, j) => j !== i))}><IconTrash /></button>
                </div>
              ))}
            </div>
            {errors.colors && <small className="field-error">{errors.colors}</small>}
            <button type="button" className="ghost-btn" onClick={() => set("colors", [...form.colors, blankColor()])}><IconPlus /> Add color</button>
          </fieldset>

          {isCase && (
            <fieldset className="field">
              <legend>Fits</legend>
              <div className="device-checks">
                {devices.map((d) => (
                  <label key={d.id} className="check">
                    <input type="checkbox" checked={form.devices.includes(d.id)} onChange={() => toggleDevice(d.id)} />
                    <span>{d.name}</span>
                  </label>
                ))}
              </div>
              {errors.devices && <small className="field-error">{errors.devices}</small>}
            </fieldset>
          )}
        </div>

        <div className="modal__foot">
          <span className="muted">Creates {skuCount} SKU{skuCount === 1 ? "" : "s"}</span>
          <div className="modal__actions">
            <button type="button" className="ghost-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? "Saving…" : "Create product"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
