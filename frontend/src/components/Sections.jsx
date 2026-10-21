import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AccessoryCard, CaseCard } from "./ProductCards.jsx";
import { CategoryArt } from "./PhoneCase.jsx";
import { useCountUp } from "./useCountUp.js";
import { BRAND, prefersReducedMotion } from "../services/format.js";
import { IconCall, IconClock, IconLeft, IconNav, IconPhone, IconPin, IconRight } from "./Icons.jsx";

export function TrustStrip() {
  return (
    <section className="trust container" aria-label="Why shop with us">
      <div className="trust__item">
        <IconPhone />
        <div><strong>Made for iPhone 16 – 18</strong><span>Pick your exact model</span></div>
      </div>
      <div className="trust__item">
        <IconPin />
        <div><strong>Try it in store</strong><span>At any of our outlets</span></div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
export function Categories({ categories, products, devices, device, onView }) {
  const [active, setActive] = useState("cases");
  const railRef = useRef(null);
  const items = products.filter((p) => p.category === active);
  const catName = (id) => categories.find((c) => c.id === id)?.name ?? id;

  useEffect(() => { if (railRef.current) railRef.current.scrollLeft = 0; }, [active]);

  const step = (dir) => railRef.current?.scrollBy({
    left: dir * railRef.current.clientWidth * 0.8,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
  const onTabKey = (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    const i = categories.findIndex((c) => c.id === active);
    const next = categories[(i + (e.key === "ArrowRight" ? 1 : -1) + categories.length) % categories.length];
    setActive(next.id);
    requestAnimationFrame(() => document.querySelector(`[data-cat="${next.id}"]`)?.focus());
  };

  return (
    <section className="cats container" id="categories" aria-labelledby="catTitle">
      <div className="section-head">
        <div>
          <p className="eyebrow">Categories</p>
          <h2 className="section-title" id="catTitle">Shop by category</h2>
        </div>
      </div>
      <div className="cat-tiles" role="tablist" aria-label="Product categories" onKeyDown={onTabKey}>
        {categories.map((c) => (
          <button
            key={c.id}
            data-cat={c.id}
            className="cat-tile"
            role="tab"
            type="button"
            aria-selected={c.id === active}
            aria-controls="rail"
            tabIndex={c.id === active ? 0 : -1}
            onClick={() => setActive(c.id)}
          >
            <span className="cat-tile__art" aria-hidden="true"><CategoryArt category={c.id} /></span>
            <strong>{c.name}</strong>
            <span>{products.filter((p) => p.category === c.id).length} items</span>
          </button>
        ))}
      </div>

      <div className="rail-head">
        <h3 className="rail-title" id="railTitle">{active === "cases" ? `Cases for ${device.name}` : catName(active)}</h3>
        <div className="rail-actions">
          <Link to={`/products?category=${active}${active === "cases" ? `&device=${device.id}` : ""}`} className="view-all">View all</Link>
          <button className="round-btn" type="button" aria-label="Scroll left" onClick={() => step(-1)}><IconLeft /></button>
          <button className="round-btn" type="button" aria-label="Scroll right" onClick={() => step(1)}><IconRight /></button>
        </div>
      </div>
      <div className="rail" id="rail" role="tabpanel" aria-labelledby="railTitle" ref={railRef}>
        {items.map((p, i) => (active === "cases"
          ? <CaseCard key={`${p.id}-${device.id}`} product={p} device={device} devices={devices} index={i} onView={onView} />
          : <AccessoryCard key={p.id} product={p} categoryName={catName(p.category)} index={i} />))}
        {!items.length && <p className="muted">No products in this category yet.</p>}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
export function CaseGrid({ cases, devices, onView }) {
  const seriesList = useMemo(() => [...new Set(devices.map((d) => d.series))], [devices]);
  const [series, setSeries] = useState(seriesList.includes("17") ? "17" : seriesList[0]);
  // show each series on its Pro model (fall back to whatever exists)
  const device = devices.find((d) => d.series === series && d.cam !== "pill") ?? devices.find((d) => d.series === series);

  return (
    <section className="shop container" id="shop" aria-labelledby="shopTitle">
      <div className="section-head">
        <div>
          <p className="eyebrow">Bestsellers</p>
          <h2 className="section-title" id="shopTitle">Find your case</h2>
        </div>
        <Link to="/products?category=cases" className="view-all view-all--head">View all cases</Link>
        <div className="tabs" role="tablist" aria-label="Filter by iPhone series">
          {seriesList.map((s) => (
            <button key={s} role="tab" type="button" aria-selected={s === series} onClick={() => setSeries(s)}>iPhone {s}</button>
          ))}
        </div>
      </div>
      <div className="grid">
        {device && cases.map((p, i) => (
          <CaseCard key={`${p.id}-${device.id}`} product={p} device={device} devices={devices} index={i} feature={i === 0} onView={onView} />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
function Stat({ value, decimals = 0, suffix = "", label, start }) {
  const v = useCountUp(value, { start });
  return (
    <div className="stat">
      <span className="stat__num">{decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-US")}{suffix}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}

export function FeatureBand({ outletCount }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <section className="feature container" aria-labelledby="featTitle">
      <h2 className="feature__title" id="featTitle">Made to <em>be held.</em></h2>
      <p className="feature__copy">Cases, straps and chargers for the phone you already love — picked to protect it, and to look good doing it.</p>
      <div className="stats" ref={ref}>
        <Stat value={12400} suffix="+" label="Happy customers" start={seen} />
        <Stat value={4.9} decimals={1} label="Average rating" start={seen} />
        <Stat value={outletCount} label="Outlets" start={seen} />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
const wibHour = () => +new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Jakarta" }).format(new Date());
const hh = (h) => String(h).padStart(2, "0") + ".00";

export function Outlets({ outlets }) {
  const [city, setCity] = useState("All");
  const [activeId, setActiveId] = useState(outlets[0]?.id);
  const listRef = useRef(null);
  const cities = ["All", ...new Set(outlets.map((o) => o.city))];
  const visible = outlets.filter((o) => city === "All" || o.city === city);
  const active = visible.some((o) => o.id === activeId) ? activeId : visible[0]?.id;
  const hour = wibHour();

  const select = (o, scroll) => {
    if (city !== "All" && o.city !== city) setCity(o.city);
    setActiveId(o.id);
    if (scroll) requestAnimationFrame(() => {
      const list = listRef.current, card = list?.querySelector(`[data-outlet="${o.id}"]`);
      if (list && card && list.scrollHeight > list.clientHeight) {
        list.scrollTo({ top: card.offsetTop - list.offsetTop - 4, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      }
    });
  };

  return (
    <section className="outlets container" id="outlets" aria-labelledby="outTitle">
      <div className="section-head">
        <div>
          <p className="eyebrow">Outlets</p>
          <h2 className="section-title" id="outTitle">Come say hi in store</h2>
        </div>
        <div className="tabs" role="tablist" aria-label="Filter outlets by city">
          {cities.map((c) => <button key={c} role="tab" type="button" aria-selected={c === city} onClick={() => setCity(c)}>{c}</button>)}
        </div>
      </div>
      <div className="outlets__wrap">
        <div className="outlet-list" ref={listRef}>
          {visible.map((o) => {
            const open = hour >= o.open && hour < o.close;
            return (
              <article key={o.id} data-outlet={o.id} className={`outlet${o.id === active ? " active" : ""}`} onClick={(e) => !e.target.closest("a") && select(o)}>
                <h3><button type="button" aria-pressed={o.id === active} onClick={() => select(o)}>{BRAND.short} {o.name}</button></h3>
                <span className={`status ${open ? "status--open" : "status--closed"}`}>{open ? "Open now" : "Closed"}</span>
                <p className="outlet__addr">{o.addr}</p>
                <div className="outlet__meta">
                  <span><IconClock />{hh(o.open)}–{hh(o.close)} WIB</span>
                  <span><IconCall />{o.phone}</span>
                </div>
                <div className="outlet__actions">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.addr)}`} target="_blank" rel="noopener noreferrer"><IconNav />Directions</a>
                  <a href={`tel:${o.phone.replace(/\s/g, "")}`}><IconCall />Call</a>
                </div>
              </article>
            );
          })}
        </div>
        <div className="map" aria-label="Outlet map (placeholder)">
          <div className="map__grid" aria-hidden="true" />
          <svg className="map__land" viewBox="0 0 100 60" aria-hidden="true" preserveAspectRatio="none">
            <path d="M4 18c6-3 13-2 18 3s9 9 14 10 6 4 3 6-10 0-15-3S6 28 4 24z" />
            <path d="M34 40c5-2 12-1 20 0s16 1 22 0 8 2 4 3-14 1-24 1-20 0-22-4z" />
            <path d="M80 44c3-1 6 0 6 1s-3 2-6 1z" />
            <path d="M46 14c5-4 12-5 14 0s-1 12-6 13-11-2-11-6 1-5 3-7z" />
            <path d="M66 20c3-3 6-2 6 2s-2 9-4 9-3-7-2-11z" />
          </svg>
          <div className="map__pins">
            {outlets.map((o) => {
              const shown = city === "All" || o.city === city;
              return (
                <button
                  key={o.id}
                  type="button"
                  className={`pin${shown ? "" : " dim"}`}
                  style={{ left: `${o.x}%`, top: `${o.y}%` }}
                  aria-pressed={o.id === active}
                  aria-label={o.name}
                  tabIndex={shown ? 0 : -1}
                  onClick={() => select(o, true)}
                >
                  <span className="pin__label">{o.name}</span><span className="pin__dot" />
                </button>
              );
            })}
          </div>
          <p className="map__note">Map placeholder — swap for Google Maps embed</p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
const REVIEWS = [
  { stars: 5, text: "The crystal case looks even better in person. Fits my 17 Pro perfectly.", who: "Crystal Case" },
  { stars: 5, text: "Got a case and a matching strap — staff helped me pick the colors.", who: "Chain Strap" },
  { stars: 4, text: "Clear case still shows off my phone’s color. Exactly what I wanted.", who: "Clear MagSafe Case" },
];

export function Reviews() {
  return (
    <section className="reviews container" aria-labelledby="revTitle">
      <div className="section-head">
        <div>
          <p className="eyebrow">Reviews</p>
          <h2 className="section-title" id="revTitle">People keep coming back</h2>
        </div>
      </div>
      <div className="reviews__grid">
        {REVIEWS.map((r) => (
          <figure className="review" key={r.who}>
            <div className="stars" aria-label={`${r.stars} out of 5 stars`}>{"★".repeat(r.stars)}<span className="dim">{"★".repeat(5 - r.stars)}</span></div>
            <blockquote>“{r.text}”</blockquote>
            <figcaption>Customer name · {r.who}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="faq container" id="faq" aria-labelledby="faqTitle">
      <h2 className="section-title" id="faqTitle">Questions, answered</h2>
      <div className="faq__list">
        <details>
          <summary>How do I know a case fits my phone?</summary>
          <p>Every case is listed by exact model. Choose your iPhone from the “Your iPhone” menu before adding it to your cart.</p>
        </details>
        <details>
          <summary>Can I see the products before buying?</summary>
          <p>Yes — drop by any of our outlets to see and try them in person. Find the nearest one in the outlet list above.</p>
        </details>
        <details>
          <summary>Placeholder question</summary>
          <p>Placeholder answer — add your shipping, returns or warranty details here once they're decided.</p>
        </details>
      </div>
    </section>
  );
}
