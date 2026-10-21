import { useEffect, useRef, useState } from "react";
import { PhoneCase3D, MiniCase } from "./PhoneCase.jsx";
import { useShop } from "./ShopContext.jsx";
import { useCountUp } from "./useCountUp.js";
import { fmt, mix, prefersReducedMotion, tintOf } from "../services/format.js";
import {
  IconChat, IconDown, IconHeart, IconInstagram, IconLeft, IconRight, IconRotL, IconRotR, IconTikTok,
} from "./Icons.jsx";

const BACK_ANGLE = 156; // land on the back so the case is on show
const pad2 = (n) => String(n).padStart(2, "0");

/**
 * Interactive product stage. Owns its own selection; the page can push a new selection
 * through `request` ({caseIdx, deviceIdx, colorIdx, nonce}) when a product card is clicked.
 */
export default function Hero({ cases, devices, initialDevice, request, onDeviceChange }) {
  const { addItem, wishlist, toggleWish } = useShop();
  const [c, setC] = useState(0);
  const [d, setD] = useState(initialDevice);
  const [col, setCol] = useState(0);
  const [ry, setRy] = useState(BACK_ANGLE);
  const [rx, setRx] = useState(4);
  const [dragging, setDragging] = useState(false);
  const [swap, setSwap] = useState("");
  const [textOut, setTextOut] = useState(false);
  const busy = useRef(false);
  const drag = useRef(null);

  const kase = cases[c];
  const device = devices[d];
  const color = kase.colors[col] ?? kase.colors[0];
  const next = cases[(c + 1) % cases.length];
  const price = useCountUp(kase.price);
  const tint = tintOf(color.hex);
  const norm = ((ry % 360) + 360) % 360;
  const showingBack = norm > 90 && norm < 270;

  useEffect(() => { onDeviceChange?.(d); }, [d, onDeviceChange]);

  const turnToBack = () => setRy((v) => {
    const n = ((v % 360) + 360) % 360;
    return n > 90 && n < 270 ? v : v + 180 - 30;
  });

  function goTo(target, dir = 1, colorIdx = 0, deviceIdx = d) {
    if (busy.current) return;
    target = (target + cases.length) % cases.length;
    if (target === c) {
      setCol(colorIdx); setD(deviceIdx); turnToBack();
      return;
    }
    const apply = () => {
      setC(target); setCol(colorIdx); setD(deviceIdx);
      setRy(dir > 0 ? BACK_ANGLE : -BACK_ANGLE);
    };
    if (prefersReducedMotion()) return apply();
    busy.current = true;
    setSwap(dir > 0 ? "leave-left" : "leave-right");
    setTextOut(true);
    setTimeout(() => {
      apply();
      setSwap(dir > 0 ? "enter-right" : "enter-left");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setSwap("");
        setTextOut(false);
        busy.current = false;
      }));
    }, 300);
  }

  // card clicks elsewhere on the page
  useEffect(() => {
    if (!request) return;
    goTo(request.caseIdx, request.caseIdx >= c ? 1 : -1, request.colorIdx ?? 0, request.deviceIdx ?? d);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.nonce]);

  // ---------- rotation ----------
  const onPointerDown = (e) => {
    drag.current = { x: e.clientX, y: e.clientY, ry, rx };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    setRy(drag.current.ry + (e.clientX - drag.current.x) * 0.6);
    setRx(Math.max(-25, Math.min(25, drag.current.rx - (e.clientY - drag.current.y) * 0.3)));
  };
  const endDrag = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    setRx(4); // settle back to a gentle tilt
  };
  const onKeyDown = (e) => {
    const map = { ArrowLeft: [-30, 0], ArrowRight: [30, 0], ArrowUp: [0, 8], ArrowDown: [0, -8] };
    if (!map[e.key]) return;
    e.preventDefault();
    setRy((v) => v + map[e.key][0]);
    setRx((v) => Math.max(-25, Math.min(25, v + map[e.key][1])));
  };

  const onColorKey = (e) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const group = e.currentTarget;
    const n = kase.colors.length;
    const nextIdx = (col + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1) + n) % n;
    setCol(nextIdx); turnToBack();
    requestAnimationFrame(() => group.querySelectorAll("[role=radio]")[nextIdx]?.focus());
  };

  const addToCart = () => addItem({
    key: [kase.id, device.id, color.id ?? col].join("-"),
    title: kase.name,
    sub: `${device.name} · ${color.name}`,
    price: kase.price,
    thumb: { product: kase, color, device },
  });

  const text = `swap-target${textOut ? " swap-out" : ""}`;

  return (
    <section className="hero container" aria-labelledby="heroTitle">
      <div className="stage" style={{ "--tint": tint, "--tint-deep": mix(tint, "#000000", 0.62) }}>
        <svg className="stage__swoosh" viewBox="0 0 800 800" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <path d="M520 -40 C 860 160, 900 520, 640 860" />
          <path d="M700 -60 C 1000 200, 1020 560, 820 880" />
        </svg>
        <div className="stage__glow" aria-hidden="true" />

        <div className="stage__left">
          <div className="model-nav">
            <button className="round-btn" type="button" aria-label="Previous case" onClick={() => goTo(c - 1, -1)}><IconLeft /></button>
            <button className="round-btn" type="button" aria-label="Next case" onClick={() => goTo(c + 1, 1)}><IconRight /></button>
            <span className="model-index" aria-live="polite">{pad2(c + 1)} / {pad2(cases.length)}</span>
          </div>
          <p className={`eyebrow ${text}`}>Phone case · {device.name}</p>
          <h1 className={`hero__title ${text}`} id="heroTitle">{kase.name}</h1>
          <p className={`hero__tag ${text}`}>{kase.tagline}</p>
          <p className={`hero__desc ${text}`}>{kase.description}</p>
          <ul className={`spec-list ${text}`} aria-label="Key specs">
            {kase.specs.map(([a, b]) => <li key={a + b}><strong>{a}</strong>{b}</li>)}
          </ul>
          <div className="stage__ctas">
            <button className="btn btn--primary" type="button" onClick={addToCart}>
              <span>Add to cart</span><span className="btn__price">{fmt(kase.price)}</span>
            </button>
            <button className="icon-btn icon-btn--outline" type="button" aria-pressed={wishlist.has(kase.id)} aria-label={wishlist.has(kase.id) ? `Remove ${kase.name} from saved items` : `Save ${kase.name}`} onClick={() => toggleWish(kase.id, kase.name)}>
              <IconHeart />
            </button>
          </div>
          <p className="stock"><span className="dot" aria-hidden="true" /> {(kase.inStock ?? kase.stock > 0) ? "In stock" : "Out of stock"}</p>
        </div>

        <div className="stage__center">
          <div
            className={`phone-viewport${dragging ? " dragging" : ""}`}
            tabIndex={0}
            role="img"
            aria-label={`Interactive 3D preview of the ${kase.name} on an ${device.name}. Drag or use arrow keys to rotate.`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={onKeyDown}
          >
            <div className="phone-float">
              <div className={`phone-stage-swap ${swap}`}>
                <PhoneCase3D device={device} product={kase} color={color} rx={rx} ry={ry} dragging={dragging} />
              </div>
            </div>
            <div className="phone-shadow" aria-hidden="true" />
          </div>
          <div className="phone-controls" role="group" aria-label="Rotate preview">
            <button className="chip-btn" type="button" aria-label="Rotate left" onClick={() => setRy((v) => v - 45)}><IconRotL /></button>
            <button className="chip-btn chip-btn--label" type="button" onClick={() => setRy((v) => v + 180)}>
              {showingBack ? "Show front" : "Show back"}
            </button>
            <button className="chip-btn" type="button" aria-label="Rotate right" onClick={() => setRy((v) => v + 45)}><IconRotR /></button>
          </div>
          <p className="drag-hint" aria-hidden="true">Drag to rotate</p>
        </div>

        <div className="stage__right">
          <div className="price-block"><p className="price">{fmt(price)}</p></div>
          <div className="opt">
            <label className="opt__label" htmlFor="deviceSelect">Your iPhone</label>
            <div className="select">
              <select id="deviceSelect" value={d} onChange={(e) => setD(+e.target.value)}>
                {devices.map((dev, i) => <option key={dev.id} value={i}>{dev.name}</option>)}
              </select>
              <IconDown />
            </div>
          </div>
          <fieldset className="opt">
            <legend>Color · {color.name}</legend>
            <div className="opt__row" role="radiogroup" aria-label="Case color" onKeyDown={onColorKey}>
              {kase.colors.map((cc, i) => (
                <button
                  key={cc.id ?? cc.name}
                  type="button"
                  className="swatch"
                  role="radio"
                  aria-checked={i === col}
                  aria-label={cc.name}
                  tabIndex={i === col ? 0 : -1}
                  onClick={() => { setCol(i); turnToBack(); }}
                >
                  <span style={{ background: cc.hex }} />
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="stage__bottom">
          <div className="socials" aria-label="Social links">
            <a href="#" aria-label="Instagram"><IconInstagram /></a>
            <a href="#" aria-label="TikTok"><IconTikTok /></a>
            <a href="#" aria-label="WhatsApp"><IconChat /></a>
          </div>
          <p className={`stage__caption ${text}`}>
            {(kase.caption ?? "").split(/<br\s*\/?>/i).map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}
          </p>
          <button className="next-thumb" type="button" aria-label="Next case" onClick={() => goTo(c + 1, 1)}>
            <span className="next-thumb__label">Next<br /><strong>{next.name}</strong></span>
            <span className="next-thumb__img" aria-hidden="true"><MiniCase device={device} product={next} color={next.colors[0]} /></span>
          </button>
        </div>
      </div>
    </section>
  );
}
