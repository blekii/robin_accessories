import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useShop } from "../components/ShopContext.jsx";
import { useStoreData } from "../components/StoreData.jsx";
import { QtyStepper } from "../components/Layout.jsx";
import { ProductThumb } from "../components/PhoneCase.jsx";
import { BRAND, fmt } from "../services/format.js";
import { IconCheck } from "../components/Icons.jsx";

const PROVINCES = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Sumatera Selatan",
  "Kepulauan Bangka Belitung", "Bengkulu", "Lampung", "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah",
  "DI Yogyakarta", "Jawa Timur", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat",
  "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara",
  "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara", "Maluku",
  "Maluku Utara", "Papua", "Papua Barat", "Papua Barat Daya", "Papua Tengah", "Papua Pegunungan", "Papua Selatan",
];

// Placeholder methods — connect a real payment provider before launch.
const PAYMENTS = [
  ["transfer", "Bank transfer", "Pay to our account after you place the order"],
  ["ewallet", "E-wallet", "Pay from your e-wallet app"],
  ["qris", "QRIS", "Scan a QR code with any banking or e-wallet app"],
];

const LABELS = {
  name: "Full name", phone: "Phone number", email: "Email",
  address: "Street address", city: "City", province: "Province", postal: "Postal code", outlet: "Pickup outlet",
};

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = "Enter your full name.";
  const phone = f.phone.replace(/[\s-]/g, "");
  if (!phone) e.phone = "Enter a phone number so we can reach you about the order.";
  else if (!/^(\+62|62|0)8\d{7,11}$/.test(phone)) e.phone = "Use an Indonesian mobile number, like 0812 3456 7890.";
  if (!f.email.trim()) e.email = "Enter your email for the order receipt.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Check the email — it should look like name@example.com.";
  if (f.method === "delivery") {
    if (!f.address.trim()) e.address = "Enter the street address for delivery.";
    if (!f.city.trim()) e.city = "Enter your city.";
    if (!f.province) e.province = "Choose your province.";
    if (!/^\d{5}$/.test(f.postal.trim())) e.postal = "Postal codes have 5 digits.";
  } else if (!f.outlet) {
    e.outlet = "Choose the outlet you'll pick up from.";
  }
  return e;
}

function Field({ id, label, error, hint, children }) {
  return (
    <div className={`co-field${error ? " has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <small className="muted" id={`${id}-hint`}>{hint}</small>}
      {error && <small className="field-error" id={`${id}-err`}>{error}</small>}
    </div>
  );
}

export default function Checkout() {
  const { cart, total, removeItem, clearCart } = useShop();
  const { outlets } = useStoreData();
  const [f, setF] = useState({
    name: "", phone: "", email: "", method: "delivery",
    address: "", city: "", province: "", postal: "", notes: "", outlet: "", payment: "transfer",
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);
  const summaryRef = useRef(null);

  const errors = validate(f);
  const shown = (k) => (submitted || touched[k]) && errors[k];
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));
  const inputProps = (k) => ({
    id: `co-${k}`,
    value: f[k],
    onChange: set(k),
    onBlur: blur(k),
    "aria-invalid": !!shown(k),
    "aria-describedby": shown(k) ? `co-${k}-err` : undefined,
  });

  const submit = (ev) => {
    ev.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setPlacing(true);
    // Prototype: no order is sent to a server and no payment is taken yet.
    setTimeout(() => {
      setOrder({
        number: `RA-${Date.now().toString().slice(-6)}`,
        items: cart,
        total,
        form: f,
        outlet: outlets.find((o) => String(o.id) === f.outlet),
      });
      clearCart();
      window.scrollTo(0, 0);
    }, 900);
  };

  // ---------- confirmation ----------
  if (order) {
    const pay = PAYMENTS.find(([v]) => v === order.form.payment)?.[1];
    return (
      <div className="container page checkout-done">
        <div className="done-card">
          <span className="done-icon" aria-hidden="true"><IconCheck /></span>
          <p className="eyebrow">Order {order.number}</p>
          <h1 className="section-title">Thank you, {order.form.name.split(" ")[0]}!</h1>
          <p className="muted">
            We've got your order. A confirmation will go to <strong>{order.form.email}</strong>
            {order.form.method === "pickup" && order.outlet ? <> and you can collect it at <strong>{BRAND.short} {order.outlet.name}</strong></> : null}.
          </p>
          <ul className="done-items">
            {order.items.map((i) => (
              <li key={i.key}><span>{i.qty} × {i.title}<small className="muted"> · {i.sub}</small></span><strong>{fmt(i.price * i.qty)}</strong></li>
            ))}
            <li className="done-total"><span>Total{order.form.method === "delivery" ? " (excl. delivery)" : ""}</span><strong>{fmt(order.total)}</strong></li>
          </ul>
          <p className="muted done-pay">Payment: {pay}</p>
          <p className="proto-note">Prototype — no order was sent and no payment was taken.</p>
          <Link to="/products" className="btn btn--primary">Continue shopping</Link>
        </div>
      </div>
    );
  }

  // ---------- empty cart ----------
  if (!cart.length) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h1 className="section-title">Your cart is empty</h1>
          <p className="muted">Add a case or accessory, then come back to check out.</p>
          <Link to="/products" className="btn btn--primary">Browse all products</Link>
        </div>
      </div>
    );
  }

  const errorList = Object.entries(errors);

  return (
    <div className="container page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Checkout</span>
      </nav>
      <div className="page-head">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1 className="section-title">Almost yours</h1>
        </div>
      </div>

      <form className="checkout" onSubmit={submit} noValidate>
        <div className="checkout__form">
          {submitted && errorList.length > 0 && (
            <div className="error-summary" tabIndex={-1} ref={summaryRef} role="alert" aria-labelledby="errSumTitle">
              <h2 id="errSumTitle">Please fix {errorList.length} thing{errorList.length > 1 ? "s" : ""} to continue</h2>
              <ul>
                {errorList.map(([k, msg]) => (
                  <li key={k}><a href={`#co-${k}`} onClick={(e) => { e.preventDefault(); document.getElementById(`co-${k}`)?.focus(); }}>{LABELS[k]}: {msg}</a></li>
                ))}
              </ul>
            </div>
          )}

          <fieldset className="co-section">
            <legend><span className="co-step">1</span> Contact</legend>
            <Field id="co-name" label="Full name" error={shown("name")}>
              <input {...inputProps("name")} autoComplete="name" />
            </Field>
            <div className="co-grid">
              <Field id="co-phone" label="Phone number" error={shown("phone")} hint="For delivery or pickup updates">
                <input {...inputProps("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="0812 3456 7890" />
              </Field>
              <Field id="co-email" label="Email" error={shown("email")}>
                <input {...inputProps("email")} type="email" inputMode="email" autoComplete="email" />
              </Field>
            </div>
          </fieldset>

          <fieldset className="co-section">
            <legend><span className="co-step">2</span> Delivery</legend>
            <div className="choice-row" role="radiogroup" aria-label="How do you want to get your order?">
              {[["delivery", "Deliver to me", "To your address"], ["pickup", "Pick up in store", "At one of our outlets"]].map(([v, t, s]) => (
                <label key={v} className={`choice${f.method === v ? " is-on" : ""}`}>
                  <input type="radio" name="method" value={v} checked={f.method === v} onChange={set("method")} />
                  <span><strong>{t}</strong><small className="muted">{s}</small></span>
                </label>
              ))}
            </div>

            {f.method === "delivery" ? (
              <>
                <Field id="co-address" label="Street address" error={shown("address")}>
                  <textarea {...inputProps("address")} rows={2} autoComplete="street-address" placeholder="Street, house number, RT/RW, kelurahan" />
                </Field>
                <div className="co-grid co-grid--3">
                  <Field id="co-city" label="City" error={shown("city")}>
                    <input {...inputProps("city")} autoComplete="address-level2" />
                  </Field>
                  <Field id="co-province" label="Province" error={shown("province")}>
                    <select {...inputProps("province")} autoComplete="address-level1">
                      <option value="">Choose…</option>
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                  <Field id="co-postal" label="Postal code" error={shown("postal")}>
                    <input {...inputProps("postal")} inputMode="numeric" autoComplete="postal-code" maxLength={5} />
                  </Field>
                </div>
                <Field id="co-notes" label="Notes for the courier (optional)">
                  <input id="co-notes" value={f.notes} onChange={set("notes")} placeholder="e.g. leave with security" />
                </Field>
              </>
            ) : (
              <Field id="co-outlet" label="Pickup outlet" error={shown("outlet")}>
                <select {...inputProps("outlet")}>
                  <option value="">Choose an outlet…</option>
                  {outlets.map((o) => <option key={o.id} value={o.id}>{BRAND.short} {o.name} — {o.addr}</option>)}
                </select>
              </Field>
            )}
          </fieldset>

          <fieldset className="co-section">
            <legend><span className="co-step">3</span> Payment</legend>
            <div className="choice-col" role="radiogroup" aria-label="Payment method">
              {PAYMENTS.map(([v, t, s]) => (
                <label key={v} className={`choice${f.payment === v ? " is-on" : ""}`}>
                  <input type="radio" name="payment" value={v} checked={f.payment === v} onChange={set("payment")} />
                  <span><strong>{t}</strong><small className="muted">{s}</small></span>
                </label>
              ))}
            </div>
            <p className="proto-note">Placeholder methods — no payment is taken in this prototype.</p>
          </fieldset>
        </div>

        <aside className="checkout__summary" aria-labelledby="sumTitle">
          <h2 id="sumTitle">Order summary</h2>
          <ul className="sum-items">
            {cart.map((i) => (
              <li key={i.key}>
                <span className="sum-thumb"><ProductThumb {...i.thumb} /></span>
                <div className="sum-info">
                  <strong>{i.title}</strong>
                  <small className="muted">{i.sub}</small>
                  <div className="sum-actions">
                    <QtyStepper item={i} small />
                    <button type="button" className="link-btn" onClick={() => removeItem(i.key)}>Remove</button>
                  </div>
                </div>
                <strong className="sum-price">{fmt(i.price * i.qty)}</strong>
              </li>
            ))}
          </ul>
          <dl className="sum-lines">
            <div><dt>Subtotal</dt><dd>{fmt(total)}</dd></div>
            <div><dt>Delivery</dt><dd className="muted">{f.method === "pickup" ? "Pick up in store" : "Calculated after you order"}</dd></div>
            <div className="sum-total"><dt>Total{f.method === "delivery" ? <small className="muted"> excl. delivery</small> : null}</dt><dd>{fmt(total)}</dd></div>
          </dl>
          <button type="submit" className="btn btn--primary btn--full" disabled={placing}>
            {placing ? "Placing order…" : `Place order · ${fmt(total)}`}
          </button>
          <Link to="/products" className="sum-back">← Keep shopping</Link>
        </aside>
      </form>
    </div>
  );
}
