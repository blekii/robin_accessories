import { BRAND, mix, tintOf } from "../services/format.js";

// Placeholder renders: an iPhone wearing the case, drawn in CSS.
// When product photos exist, swap these for <img> per product/color.

const SIZES = { std: { w: 16, h: 33 }, max: { w: 17, h: 35.2 } };
const thickness = (finish) => (finish === "tough" ? 1.2 : 0.95);

export function caseStyle(device, product, color) {
  const { w, h } = SIZES[device?.size] ?? SIZES.std;
  return {
    "--body": color.hex,
    "--body-dark": mix(color.hex, "#000000", 0.35),
    "--body-light": mix(color.hex, "#ffffff", 0.35),
    "--screen-tint": tintOf(color.hex),
    "--card-tint": tintOf(color.hex),
    "--w": `${w}em`,
    "--h": `${h}em`,
    "--t": `${thickness(product.finish)}em`,
  };
}

function Camera({ cam }) {
  const lenses = (n) => Array.from({ length: n }, (_, i) => <span className="lens" key={i} />);
  if (cam === "pill") {
    return (<><div className="cam-module cam--pill">{lenses(2)}</div><span className="flash flash--solo" /></>);
  }
  return (
    <div className={`cam-module cam--${cam === "tri" ? "tri" : "plateau"}`}>
      {lenses(3)}<span className="flash" /><span className="mic" />
    </div>
  );
}

function CaseBack({ device, product }) {
  return (
    <>
      <Camera cam={device?.cam ?? "plateau"} />
      {product.finish === "clear" && <span className="mag" aria-hidden="true" />}
    </>
  );
}

function Screen({ product }) {
  return (
    <div className="screen">
      <span className="island" />
      <span className="screen__date">Tuesday, Oct 20</span>
      <span className="screen__time">9:41</span>
      <div className="screen__widget"><i /><div><b>{BRAND.name}</b><span>{product.name}</span></div></div>
      <span className="screen__bar" />
    </div>
  );
}

/** Interactive 3D phone-in-case. Rotation is controlled by the parent. */
export function PhoneCase3D({ device, product, color, rx, ry, dragging }) {
  const t = thickness(product.finish);
  const slices = 9;
  const norm = ((ry % 360) + 360) % 360;
  const sheen = { transform: `translateX(${((norm % 180) - 90) * 0.9}%)` };
  return (
    <div
      className={`phone cased fin-${product.finish}${dragging ? " no-anim" : ""}`}
      style={{ ...caseStyle(device, product, color), "--rx": `${rx}deg`, "--ry": `${ry}deg` }}
    >
      {Array.from({ length: slices }, (_, i) => (
        <div className="slice" key={i} style={{ transform: `translateZ(${(-t / 2 + (t * i) / (slices - 1)).toFixed(3)}em)` }} />
      ))}
      <div className="face back"><CaseBack device={device} product={product} /><span className="sheen" style={sheen} /></div>
      <div className="face front"><Screen product={product} /><span className="sheen" style={sheen} /></div>
      <span className="side-btn r" style={{ top: "9em", height: "3.6em" }} />
      <span className="side-btn r" style={{ top: "19em", height: "2.4em" }} />
      <span className="side-btn l" style={{ top: "6.5em", height: "1.6em" }} />
      <span className="side-btn l" style={{ top: "9.2em", height: "2.6em" }} />
      <span className="side-btn l" style={{ top: "12.4em", height: "2.6em" }} />
    </div>
  );
}

/** Static back view used in cards, thumbnails, cart and dashboard. */
export function MiniCase({ device, product, color, style }) {
  return (
    <div className={`mini cased fin-${product.finish || "silicone"}`} style={{ ...caseStyle(device, product, color), ...style }}>
      <div className="face back"><CaseBack device={device} product={product} /></div>
    </div>
  );
}

// ---------- accessory placeholder art ----------
const ART = {
  cases: (
    <svg viewBox="0 0 64 64"><rect x="18" y="5" width="28" height="54" rx="7" fill="currentColor" fillOpacity=".9" /><rect x="21" y="8" width="12" height="12" rx="4" fill="#0a0908" stroke="none" /><circle cx="25" cy="12" r="1.6" fill="#555" stroke="none" /><circle cx="29.5" cy="16" r="1.6" fill="#555" stroke="none" /></svg>
  ),
  straps: (
    <svg viewBox="0 0 64 64" style={{ strokeWidth: 3 }}><path d="M22 10c-9 14-9 32 6 44" /><path d="M42 10c9 14 9 32-6 44" /><circle cx="32" cy="55" r="4" fill="currentColor" /><rect x="25" y="4" width="14" height="7" rx="3" fill="currentColor" /></svg>
  ),
  protectors: (
    <svg viewBox="0 0 64 64"><rect x="18" y="5" width="28" height="54" rx="7" fill="currentColor" fillOpacity=".22" /><path d="M24 16l12-8M24 28l20-14M30 52l14-10" /></svg>
  ),
  chargers: (
    <svg viewBox="0 0 64 64"><rect x="12" y="14" width="26" height="26" rx="6" fill="currentColor" fillOpacity=".9" /><path d="M21 14V6M29 14V6" style={{ strokeWidth: 3 }} /><path d="M25 40v5c0 7 4 11 11 11h12" style={{ strokeWidth: 3 }} /><rect x="47" y="52" width="10" height="8" rx="2" fill="currentColor" /></svg>
  ),
};
export const CategoryArt = ({ category }) => ART[category] ?? ART.cases;

export function AccessoryArt({ category, hex }) {
  return <div className="acc-art" style={{ "--item": hex }} aria-hidden="true"><CategoryArt category={category} /></div>;
}

/** Product thumbnail for any category. */
export function ProductThumb({ product, color, device }) {
  const col = color ?? product.colors[0];
  if (product.category === "cases" && col) return <MiniCase device={device} product={product} color={col} />;
  return <AccessoryArt category={product.category} hex={col?.hex ?? "#888888"} />;
}
