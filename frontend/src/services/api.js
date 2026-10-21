import { mockApi } from "./mockData.js";

// PHP API lives at /api (proxied by Vite to `php -S localhost:8000 -t backend`).
// Override with VITE_API_URL, e.g. http://localhost/robin_accessories/backend/api
const BASE = import.meta.env.VITE_API_URL ?? "/api";

// Demo data is a development convenience only. A production build never falls back to it,
// so the dashboard can't be opened without the real, login-protected API.
const DEMO_ALLOWED = import.meta.env.DEV;

// null = not checked yet, true = PHP API reachable, false = using in-memory demo data
let live = null;
const modeListeners = new Set();
const authListeners = new Set();

export const isDemo = () => live === false;
export const onModeChange = (fn) => { modeListeners.add(fn); return () => modeListeners.delete(fn); };
/** Called when the server says the admin session is missing or expired. */
export const onUnauthorized = (fn) => { authListeners.add(fn); return () => authListeners.delete(fn); };
const setLive = (v) => { if (live !== v) { live = v; modeListeners.forEach((fn) => fn(v)); } };

async function http(path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    credentials: "include", // send the admin session cookie
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;
  if (!isJson) throw Object.assign(new Error("The store server isn't reachable right now."), { offline: true });
  if (!res.ok) throw Object.assign(new Error(data?.error || `Request failed (${res.status})`), { status: res.status });
  return data;
}

/** Try the PHP API; in development, fall back to the demo store if it isn't running. */
async function call(path, opts, fallback, { authEvents = true } = {}) {
  if (live === false && DEMO_ALLOWED) return fallback();
  try {
    const data = await http(path, opts);
    setLive(true);
    return data;
  } catch (err) {
    if (err.status === 401 && authEvents) authListeners.forEach((fn) => fn());
    const offline = err.offline || err instanceof TypeError || err.message === "Database error";
    if (DEMO_ALLOWED && live !== true && offline) {
      setLive(false);
      return fallback();
    }
    throw err;
  }
}

const qs = (params) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));
  return s.toString() ? `?${s}` : "";
};

const DEMO_ADMIN = { id: 0, name: "Demo admin", email: "demo", demo: true };

export const api = {
  // ---------- public ----------
  catalog: () => call("catalog.php", undefined, () => mockApi.catalog()),
  products: (params = {}) => call(`products.php${qs(params)}`, undefined, () => mockApi.products(params)),
  product: (id) => call(`products.php?id=${id}`, undefined, () => mockApi.product(id)),

  // ---------- admin session ----------
  me: () => call("auth.php", undefined, () => ({ admin: DEMO_ADMIN })),
  login: (email, password) => call("auth.php", { method: "POST", body: { email, password } }, () => ({ admin: DEMO_ADMIN }), { authEvents: false }),
  logout: () => call("auth.php", { method: "DELETE" }, () => ({ admin: null })),

  // ---------- admin only (the API answers 401 without a session) ----------
  createProduct: (data) => call("products.php", { method: "POST", body: data }, () => mockApi.createProduct(data)),
  updateProduct: (id, data) => call(`products.php?id=${id}`, { method: "PUT", body: data }, () => mockApi.updateProduct(id, data)),
  deleteProduct: (id) => call(`products.php?id=${id}`, { method: "DELETE" }, () => mockApi.deleteProduct(id)),
  setStock: (skuId, change) => call(`inventory.php?id=${skuId}`, { method: "PATCH", body: change }, () => mockApi.setStock(skuId, change)),
  lowStock: () => call("inventory.php?low=1", undefined, () => mockApi.lowStock()),
};
