import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccessoryArt, MiniCase } from "./PhoneCase.jsx";
import { useShop } from "./ShopContext.jsx";
import { fmt, mix, tintOf } from "../services/format.js";
import { IconHeart } from "./Icons.jsx";

// subtle 3D tilt that follows the mouse
function useTilt() {
  const ref = useRef(null);
  const onPointerMove = (e) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const mini = ref.current.querySelector(".mini");
    if (!mini) return;
    mini.style.setProperty("--tilt", `${((e.clientX - r.left) / r.width - 0.5) * 30}deg`);
    mini.style.setProperty("--tiltx", `${-((e.clientY - r.top) / r.height - 0.5) * 14}deg`);
  };
  const onPointerLeave = () => {
    const mini = ref.current?.querySelector(".mini");
    mini?.style.removeProperty("--tilt");
    mini?.style.removeProperty("--tiltx");
  };
  return { ref, onPointerMove, onPointerLeave };
}

function Swatches({ label, colors, value, onChange }) {
  return (
    <div className="card__swatches" role="group" aria-label={`${label} colors`}>
      {colors.map((c, j) => (
        <button key={c.id ?? j} type="button" style={{ "--c": c.hex }} aria-pressed={j === value} aria-label={c.name} onClick={() => onChange(j)} />
      ))}
    </div>
  );
}

function WishButton({ product }) {
  const { wishlist, toggleWish } = useShop();
  const saved = wishlist.has(product.id);
  return (
    <button
      className="icon-btn card__wish"
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from saved items` : `Save ${product.name}`}
      onClick={() => toggleWish(product.id, product.name)}
    >
      <IconHeart />
    </button>
  );
}

/**
 * A case shown on a specific iPhone. Clicking the card opens it in the 3D viewer:
 * `onView` handles that on the home page; elsewhere we navigate home with the selection.
 */
export function CaseCard({ product, device, devices, index = 0, feature = false, onView }) {
  const { addItem } = useShop();
  const [ci, setCi] = useState(0);
  const tilt = useTilt();
  const navigate = useNavigate();
  const color = product.colors[ci];
  const fits = devices.filter((d) => d.series === device.series).map((d) => d.name.replace("iPhone ", "")).join(" · ");

  const view = () => (onView
    ? onView(product, device, ci)
    : navigate("/", { state: { view: { productId: product.id, deviceId: device.id, colorIdx: ci } } }));

  return (
    <article
      className={`card${feature ? " card--feature" : ""}`}
      style={{ "--i": index, "--card-tint": tintOf(color.hex) }}
      {...tilt}
    >
      <button className="card__view" type="button" aria-label={`View ${product.name} in 3D`} onClick={view} />
      <div className="card__media">
        <span className="card__badge">iPhone {device.series}</span>
        <WishButton product={product} />
        <MiniCase device={device} product={product} color={color} />
      </div>
      <div className="card__body">
        <h3 className="card__title">{product.name}</h3>
        <p className="card__meta">Fits {fits}</p>
        <Swatches label={product.name} colors={product.colors} value={ci} onChange={setCi} />
        <div className="card__foot">
          <span className="card__price">{fmt(product.price)}</span>
          <button
            className="card__add"
            type="button"
            onClick={() => addItem({
              key: [product.id, device.id, color.id ?? ci].join("-"),
              title: product.name,
              sub: `${device.name} · ${color.name}`,
              price: product.price,
              thumb: { product, color, device },
            })}
          >
            Quick add
          </button>
        </div>
      </div>
    </article>
  );
}

export function AccessoryCard({ product, categoryName, index = 0 }) {
  const { addItem } = useShop();
  const [ci, setCi] = useState(0);
  const color = product.colors[ci];
  return (
    <article className="card" style={{ "--i": index, "--card-tint": mix(color.hex, "#000000", 0.2) }}>
      <div className="card__media">
        <span className="card__badge">{categoryName}</span>
        <WishButton product={product} />
        <AccessoryArt category={product.category} hex={color.hex} />
      </div>
      <div className="card__body">
        <h3 className="card__title">{product.name}</h3>
        <p className="card__meta">{product.colors.length} color{product.colors.length > 1 ? "s" : ""}</p>
        <Swatches label={product.name} colors={product.colors} value={ci} onChange={setCi} />
        <div className="card__foot">
          <span className="card__price">{fmt(product.price)}</span>
          <button
            className="card__add"
            type="button"
            onClick={() => addItem({
              key: `${product.id}-${color.id ?? ci}`,
              title: product.name,
              sub: color.name,
              price: product.price,
              thumb: { product, color },
            })}
          >
            Quick add
          </button>
        </div>
      </div>
    </article>
  );
}

/** Picks the right card for any product. */
export function ProductCard({ product, device, devices, categoryName, index }) {
  return product.category === "cases"
    ? <CaseCard product={product} device={device} devices={devices} index={index} />
    : <AccessoryCard product={product} categoryName={categoryName(product.category)} index={index} />;
}
