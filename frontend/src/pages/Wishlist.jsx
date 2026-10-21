import { Link } from "react-router-dom";
import { useShop } from "../components/ShopContext.jsx";
import { useStoreData } from "../components/StoreData.jsx";
import { ProductCard } from "../components/ProductCards.jsx";
import { IconHeart } from "../components/Icons.jsx";

/** /wishlist — products saved with the heart buttons (kept in this browser). */
export default function Wishlist() {
  const { wishlist } = useShop();
  const { data, products, devices, defaultDevice, categoryName } = useStoreData();
  const saved = products.filter((p) => wishlist.has(p.id));

  return (
    <div className="container page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Saved items</span>
      </nav>
      <div className="page-head">
        <div>
          <p className="eyebrow">Wishlist</p>
          <h1 className="section-title">Saved items</h1>
        </div>
        {saved.length > 0 && <p className="muted result-count">{saved.length} saved</p>}
      </div>

      {!data && <p className="muted page-loading" aria-busy="true">Loading…</p>}

      {data && saved.length > 0 && (
        <div className="grid">
          {saved.map((p, i) => (
            <ProductCard key={p.id} product={p} device={defaultDevice} devices={devices} categoryName={categoryName} index={i} />
          ))}
        </div>
      )}

      {data && !saved.length && (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden="true"><IconHeart /></span>
          <h2>No saved items yet</h2>
          <p className="muted">Tap the heart on any product to keep it here for later.</p>
          <Link to="/products" className="btn btn--primary">Browse all products</Link>
        </div>
      )}
    </div>
  );
}
