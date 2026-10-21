import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useShop } from "./ShopContext.jsx";
import { BRAND, fmt } from "../services/format.js";
import { ProductThumb } from "./PhoneCase.jsx";
import SearchDialog from "./SearchDialog.jsx";
import DemoBanner from "./DemoBanner.jsx";
import {
  IconBag, IconClose, IconGrid, IconHeart, IconMenu, IconMinus, IconPin, IconPlus, IconSearch, IconStore,
} from "./Icons.jsx";

const LINKS = [
  ["/products", "Shop"],
  ["/#categories", "Categories"],
  ["/#outlets", "Outlets"],
  ["/#faq", "Support"],
];

/** Scroll to #hash after navigation (React Router doesn't), otherwise to the top on page change. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return; }
    let tries = 0;
    const seek = () => {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView();
      else if (tries++ < 20) setTimeout(seek, 100); // wait for data-driven sections to render
    };
    seek();
  }, [pathname, hash]);
  return null;
}

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label={`${BRAND.name} home`}>
      <span className="logo__mark" aria-hidden="true"><span>{BRAND.name[0]}</span></span>
      <span className="logo__word">{BRAND.name}</span>
    </Link>
  );
}

function CartBadge() {
  const { count, bump } = useShop();
  const ref = useRef(null);
  useEffect(() => {
    if (!bump || !ref.current) return;
    ref.current.classList.remove("bump");
    void ref.current.offsetWidth; // restart the animation
    ref.current.classList.add("bump");
  }, [bump]);
  return <span ref={ref} className={`cart-count${count ? " has" : ""}`} aria-hidden="true">{count}</span>;
}

export function SiteNav() {
  const { count, wishCount, setCartOpen, setSearchOpen } = useShop();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="nav" id="top">
      <div className="nav__inner container">
        <Logo />
        <nav className="nav__links" aria-label="Primary">
          {LINKS.map(([to, label]) => (
            <Link key={to} to={to} aria-current={pathname === to ? "page" : undefined}>{label}</Link>
          ))}
        </nav>
        <div className="nav__actions">
          <button className="icon-btn" type="button" aria-label="Search products" onClick={() => setSearchOpen(true)}><IconSearch /></button>
          <NavLink to="/wishlist" className="icon-btn wish-link" aria-label={`Saved items, ${wishCount}`}>
            <IconHeart />
            <span className={`cart-count${wishCount ? " has" : ""}`} aria-hidden="true">{wishCount}</span>
          </NavLink>
          <button className="icon-btn cart-btn" type="button" aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`} onClick={() => setCartOpen(true)}>
            <IconBag /><CartBadge />
          </button>
          <button className="icon-btn menu-btn" type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
            <IconMenu />
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="mobile-menu" aria-label="Mobile">
          {LINKS.map(([to, label]) => <Link key={to} to={to} onClick={() => setMenuOpen(false)}>{label}</Link>)}
          <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Saved items</Link>
        </nav>
      )}
    </header>
  );
}

export function MobileTabBar() {
  const { setCartOpen } = useShop();
  return (
    <nav className="tabbar" aria-label="Quick navigation">
      <NavLink to="/products"><IconStore /><span>Shop</span></NavLink>
      <Link to="/#categories"><IconGrid /><span>Categories</span></Link>
      <Link to="/#outlets"><IconPin /><span>Outlets</span></Link>
      <button type="button" className="tabbar__cart" onClick={() => setCartOpen(true)}>
        <span className="tabbar__icon"><IconBag /><CartBadge /></span><span>Cart</span>
      </button>
    </nav>
  );
}

/** −/+ quantity control used in the cart drawer and on checkout. */
export function QtyStepper({ item, small }) {
  const { setQty } = useShop();
  return (
    <div className={`qty-stepper${small ? " qty-stepper--sm" : ""}`} role="group" aria-label={`Quantity of ${item.title}`}>
      <button type="button" aria-label={`Decrease quantity of ${item.title}`} onClick={() => setQty(item.key, item.qty - 1)}><IconMinus /></button>
      <span aria-live="polite">{item.qty}</span>
      <button type="button" aria-label={`Increase quantity of ${item.title}`} onClick={() => setQty(item.key, item.qty + 1)} disabled={item.qty >= 99}><IconPlus /></button>
    </div>
  );
}

export function CartDrawer() {
  const { cart, total, removeItem, cartOpen, setCartOpen } = useShop();
  const closeRef = useRef(null);
  const lastFocus = useRef(null);
  const [scrimVisible, setScrimVisible] = useState(false);

  useEffect(() => {
    if (cartOpen) {
      lastFocus.current = document.activeElement;
      setScrimVisible(true);
      closeRef.current?.focus();
      const onKey = (e) => e.key === "Escape" && setCartOpen(false);
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
    const t = setTimeout(() => setScrimVisible(false), 320);
    lastFocus.current?.focus?.();
    return () => clearTimeout(t);
  }, [cartOpen, setCartOpen]);

  return (
    <>
      {scrimVisible && <div className={`scrim${cartOpen ? " show" : ""}`} onClick={() => setCartOpen(false)} />}
      <aside className={`drawer${cartOpen ? " open" : ""}`} aria-label="Shopping cart" aria-hidden={!cartOpen} tabIndex={-1}>
        <div className="drawer__head">
          <h2>Your cart</h2>
          <button ref={closeRef} className="icon-btn" type="button" aria-label="Close cart" onClick={() => setCartOpen(false)}><IconClose /></button>
        </div>
        <div className="drawer__body">
          {!cart.length && (
            <div className="empty">
              <p>Your cart is empty.</p>
              <Link to="/products" className="ghost-btn" onClick={() => setCartOpen(false)}>Browse all products</Link>
            </div>
          )}
          {cart.map((i) => (
            <div className="cart-item" key={i.key}>
              <div className="cart-item__img"><ProductThumb {...i.thumb} /></div>
              <div>
                <h3>{i.title}</h3><p>{i.sub}</p>
                <QtyStepper item={i} small />
              </div>
              <div className="cart-item__side">
                <strong>{fmt(i.price * i.qty)}</strong>
                <button className="link-btn" type="button" onClick={() => removeItem(i.key)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="drawer__foot">
          <div className="drawer__total"><span>Subtotal</span><strong>{fmt(total)}</strong></div>
          {cart.length
            ? <Link to="/checkout" className="btn btn--primary btn--full" onClick={() => setCartOpen(false)}>Checkout</Link>
            : <button className="btn btn--primary btn--full" type="button" disabled>Checkout</button>}
        </div>
      </aside>
    </>
  );
}

export function Toast() {
  const { toastMsg } = useShop();
  return <div className={`toast${toastMsg ? " show" : ""}`} role="status" aria-live="polite">{toastMsg}</div>;
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Logo />
          <p className="muted">Phone accessories. Placeholder tagline goes here.</p>
        </div>
        <div className="footer__cols">
          <div>
            <h3>Shop</h3>
            <Link to="/products?category=cases">Phone cases</Link>
            <Link to="/products?category=straps">Straps</Link>
            <Link to="/products?category=protectors">Screen protectors</Link>
            <Link to="/products?category=chargers">Chargers</Link>
          </div>
          <div><h3>Help</h3><Link to="/#faq">FAQ</Link><Link to="/#outlets">Store locator</Link><a href="#">Contact</a></div>
          <div><h3>Account</h3><Link to="/wishlist">Saved items</Link><Link to="/checkout">Checkout</Link><a href="#">About</a></div>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© 2026 {BRAND.name}. Design prototype — prices and imagery are placeholders.</span>
      </div>
    </footer>
  );
}

/** Chrome shared by every customer page. */
export default function StoreLayout() {
  return (
    <>
      <ScrollManager />
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteNav />
      <DemoBanner />
      <main id="main"><Outlet /></main>
      <Footer />
      <CartDrawer />
      <SearchDialog />
      <MobileTabBar />
      <Toast />
    </>
  );
}
