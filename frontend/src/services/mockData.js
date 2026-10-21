// In-memory copy of database/schema.sql seed data.
// Used automatically when the PHP API isn't running, so the UI is always demo-able.

export const CATEGORIES = [
  { id: "cases", name: "Phone cases" },
  { id: "straps", name: "Straps" },
  { id: "protectors", name: "Screen protectors" },
  { id: "chargers", name: "Chargers & cables" },
];

export const DEVICES = [
  { id: "ip16", name: "iPhone 16", series: "16", cam: "pill", size: "std" },
  { id: "ip16pro", name: "iPhone 16 Pro", series: "16", cam: "tri", size: "std" },
  { id: "ip16pm", name: "iPhone 16 Pro Max", series: "16", cam: "tri", size: "max" },
  { id: "ip17", name: "iPhone 17", series: "17", cam: "pill", size: "std" },
  { id: "ip17pro", name: "iPhone 17 Pro", series: "17", cam: "plateau", size: "std" },
  { id: "ip17pm", name: "iPhone 17 Pro Max", series: "17", cam: "plateau", size: "max" },
  { id: "ip18pro", name: "iPhone 18 Pro", series: "18", cam: "plateau", size: "std" },
  { id: "ip18pm", name: "iPhone 18 Pro Max", series: "18", cam: "plateau", size: "max" },
];

export const OUTLETS = [
  { id: 1, city: "Jakarta", name: "Jakarta · Central", addr: "Mall name, Level 3 Unit 12, Jakarta Pusat", open: 10, close: 22, phone: "+62 21 0000 0001", x: 35, y: 67 },
  { id: 2, city: "Jakarta", name: "Jakarta · South", addr: "Mall name, Level 2 Unit 08, Jakarta Selatan", open: 10, close: 22, phone: "+62 21 0000 0002", x: 38, y: 71 },
  { id: 3, city: "Bandung", name: "Bandung", addr: "Mall name, Level 1 Unit 21, Bandung", open: 10, close: 21, phone: "+62 22 0000 0003", x: 43, y: 73 },
  { id: 4, city: "Surabaya", name: "Surabaya", addr: "Mall name, Ground Floor Unit 05, Surabaya", open: 10, close: 22, phone: "+62 31 0000 0004", x: 62, y: 69 },
  { id: 5, city: "Bali", name: "Bali · Denpasar", addr: "Mall name, Level 1 Unit 17, Denpasar", open: 9, close: 21, phone: "+62 361 0000 005", x: 82, y: 75 },
  { id: 6, city: "Medan", name: "Medan", addr: "Mall name, Level 2 Unit 30, Medan", open: 10, close: 22, phone: "+62 61 0000 0006", x: 12, y: 36 },
];

const c = (name, hex) => ({ name, hex });
const ALL_DEVICES = DEVICES.map((d) => d.id);

const SEED = [
  {
    slug: "crystal-case", category: "cases", name: "Crystal Case", finish: "crystal", price: 390000, featured: true,
    tagline: "Catch the light, everywhere.",
    description: "A faceted crystal back over a shock-absorbing frame — the case people stop you to ask about.",
    caption: "Made to<br/>be noticed.",
    specs: [["Crystal", "Back finish"], ["TPU", "Bumper frame"], ["Raised", "Camera lip"], ["Wireless", "Charging friendly"]],
    colors: [c("Silver", "#cfd1d6"), c("Midnight", "#34343f"), c("Sapphire", "#4a62a8"), c("Rose", "#e3a6b4")],
    devices: ALL_DEVICES,
  },
  {
    slug: "clear-magsafe-case", category: "cases", name: "Clear MagSafe Case", finish: "clear", price: 310000, featured: true,
    tagline: "Show it off. Keep it covered.",
    description: "A crystal-clear back that lets your iPhone's color through, with a magnetic ring for MagSafe accessories.",
    caption: "Your color,<br/>uncovered.",
    specs: [["Clear", "Back finish"], ["MagSafe", "Magnetic ring"], ["Raised", "Camera lip"], ["Slim", "Profile"]],
    colors: [c("Clear", "#e6ecf1"), c("Frost", "#c9d2da"), c("Smoke", "#6a6f78"), c("Amber", "#e2b98a")],
    devices: ALL_DEVICES,
  },
  {
    slug: "leather-case", category: "cases", name: "Leather Case", finish: "leather", price: 590000, featured: true,
    tagline: "Gets better with age.",
    description: "Soft-touch leather with stitched edges that picks up its own patina the longer you carry it.",
    caption: "Warm to<br/>the touch.",
    specs: [["Leather", "Back finish"], ["Stitched", "Edges"], ["Microfiber", "Lining"], ["Wireless", "Charging friendly"]],
    colors: [c("Tan", "#b2733f"), c("Espresso", "#4a3326"), c("Olive", "#5b6b4e"), c("Black", "#262322")],
    devices: ALL_DEVICES,
  },
  {
    slug: "silicone-case", category: "cases", name: "Silicone Case", finish: "silicone", price: 250000, featured: true,
    tagline: "Soft grip, bold color.",
    description: "Silky silicone outside, soft microfiber inside — in colors made to match your mood.",
    caption: "Pick a color,<br/>any color.",
    specs: [["Silicone", "Back finish"], ["Microfiber", "Lining"], ["Soft-touch", "Grip"], ["Wireless", "Charging friendly"]],
    colors: [c("Apricot", "#e9a26b"), c("Sky", "#7aa3c4"), c("Sand", "#d8d0c2"), c("Lilac", "#b9a9d6"), c("Graphite", "#2f2f31")],
    devices: ALL_DEVICES,
  },
  {
    slug: "tough-armor-case", category: "cases", name: "Tough Armor Case", finish: "tough", price: 450000, featured: true,
    tagline: "Built for the bumps.",
    description: "Dual-layer armor with reinforced corners and a ridged grip for everyday knocks.",
    caption: "Drop the worry,<br/>not the phone.",
    specs: [["Dual-layer", "Construction"], ["Reinforced", "Corners"], ["Ridged", "Grip"], ["Raised", "Camera lip"]],
    colors: [c("Stone", "#5a5c60"), c("Olive", "#6b7a5a"), c("Clay", "#a9674a"), c("Sand", "#cbbfa8")],
    devices: ALL_DEVICES,
  },
  { slug: "chain-strap", category: "straps", name: "Chain Strap", price: 290000, colors: [c("Gold", "#d9b56a"), c("Silver", "#c0c0c4")] },
  { slug: "rope-crossbody-strap", category: "straps", name: "Rope Crossbody Strap", price: 220000, colors: [c("Red", "#b7402f"), c("Navy", "#2f4a6e"), c("Cream", "#e6dccb")] },
  { slug: "beaded-wrist-strap", category: "straps", name: "Beaded Wrist Strap", price: 150000, colors: [c("Pink", "#f0c6d0"), c("Mint", "#bfe0d0"), c("Lemon", "#f2e3a6")] },
  { slug: "leather-lanyard", category: "straps", name: "Leather Lanyard", price: 270000, colors: [c("Brown", "#8a5a35"), c("Black", "#1f1f1f")] },
  { slug: "tempered-glass", category: "protectors", name: "Tempered Glass", price: 120000, colors: [c("Clear", "#bfe3ff")] },
  { slug: "privacy-glass", category: "protectors", name: "Privacy Glass", price: 180000, colors: [c("Dark", "#8a96a6")] },
  { slug: "matte-anti-glare-glass", category: "protectors", name: "Matte Anti-glare Glass", price: 150000, colors: [c("Matte", "#d7dde2")] },
  { slug: "camera-lens-guard", category: "protectors", name: "Camera Lens Guard", price: 99000, colors: [c("Clear", "#bfe3ff"), c("Black", "#2a2a2a")] },
  { slug: "usb-c-adapter-20w", category: "chargers", name: "20W USB-C Adapter", price: 199000, colors: [c("White", "#f2f2f2"), c("Black", "#2a2a2a")] },
  { slug: "gan-charger-65w", category: "chargers", name: "65W GaN Charger", price: 499000, colors: [c("White", "#e9e6e0"), c("Black", "#2a2a2a")] },
  { slug: "braided-usb-c-cable-1m", category: "chargers", name: "Braided USB-C Cable 1m", price: 149000, colors: [c("Beige", "#d6cfc4"), c("Grey", "#3a3a3a"), c("Blue", "#7aa3c4")] },
  { slug: "magnetic-wireless-pad", category: "chargers", name: "Magnetic Wireless Pad", price: 349000, colors: [c("White", "#f2f2f2"), c("Black", "#2a2a2a")] },
  { slug: "power-bank-10000", category: "chargers", name: "10.000mAh Power Bank", price: 399000, colors: [c("Cream", "#e6dccb"), c("Graphite", "#4a4a4c")] },
];

// ---------------------------------------------------------------
// tiny in-memory "database" mirroring the PHP API responses
// ---------------------------------------------------------------
let nextProductId = 1, nextColorId = 1, nextSkuId = 1;
const products = [];
const inventory = [];

// deterministic pseudo-random stock so demo numbers don't jump on reload
const seededStock = (n) => Math.floor(((Math.sin(n * 9301 + 49297) + 1) / 2) * 30);

function insertProduct(data, initialStock) {
  const product = {
    id: nextProductId++,
    slug: data.slug,
    category: data.category,
    name: data.name,
    finish: data.finish || null,
    tagline: data.tagline || null,
    description: data.description || null,
    caption: data.caption || null,
    price: Number(data.price),
    specs: data.specs || [],
    featured: !!data.featured,
    active: true,
    colors: data.colors.map((col) => ({ id: nextColorId++, name: col.name, hex: col.hex.toLowerCase() })),
    devices: data.devices || [],
    updatedAt: new Date().toISOString(),
  };
  products.push(product);
  const devs = product.devices.length ? product.devices : [null];
  product.colors.forEach((col, ci) => devs.forEach((d) => {
    const id = nextSkuId++;
    inventory.push({
      id, productId: product.id, colorId: col.id, deviceId: d,
      sku: [product.slug, d, ci + 1].filter(Boolean).join("-").toUpperCase(),
      stock: initialStock ?? seededStock(id), lowStockThreshold: 5,
    });
  }));
  return product;
}
SEED.forEach((p) => insertProduct(p));

const deviceName = (id) => DEVICES.find((d) => d.id === id)?.name ?? null;

function summarize(p) {
  const rows = inventory.filter((i) => i.productId === p.id);
  return {
    ...p,
    stock: rows.reduce((a, r) => a + r.stock, 0),
    skuCount: rows.length,
    lowStockSkus: rows.filter((r) => r.stock <= r.lowStockThreshold).length,
  };
}
function inventoryFor(productId) {
  const p = products.find((x) => x.id === productId);
  return inventory.filter((i) => i.productId === productId).map((i) => {
    const col = p.colors.find((cc) => cc.id === i.colorId);
    return { ...i, color: col.name, hex: col.hex, device: deviceName(i.deviceId) };
  });
}
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "product";
const clone = (x) => JSON.parse(JSON.stringify(x));

export const mockApi = {
  catalog: () => clone({ categories: CATEGORIES, devices: DEVICES, outlets: OUTLETS }),

  products: ({ category, device, q, all } = {}) => clone(products
    .filter((p) => (all || p.active)
      && (!category || p.category === category)
      && (!device || p.devices.includes(device))
      && (!q || p.name.toLowerCase().includes(q.toLowerCase())))
    .map(summarize)),

  product: (id) => {
    const p = products.find((x) => x.id === id);
    if (!p) throw new Error("Product not found");
    return clone({ ...summarize(p), inventory: inventoryFor(id) });
  },

  createProduct: (data) => {
    if (!data.name?.trim()) throw new Error("Name is required");
    if (!(Number(data.price) > 0)) throw new Error("Price must be greater than 0");
    if (!data.colors?.length) throw new Error("Add at least one color");
    let slug = slugify(data.name), n = 2;
    while (products.some((p) => p.slug === slug)) slug = `${slugify(data.name)}-${n++}`;
    const p = insertProduct({ ...data, slug }, Math.max(0, Number(data.initialStock) || 0));
    return mockApi.product(p.id);
  },

  updateProduct: (id, data) => {
    const p = products.find((x) => x.id === id);
    if (!p) throw new Error("Product not found");
    if ("price" in data && !(Number(data.price) > 0)) throw new Error("Price must be greater than 0");
    if ("name" in data && !String(data.name).trim()) throw new Error("Name is required");
    Object.assign(p, data, { price: "price" in data ? Number(data.price) : p.price, updatedAt: new Date().toISOString() });
    return mockApi.product(id);
  },

  deleteProduct: (id) => {
    const p = products.find((x) => x.id === id);
    if (!p) throw new Error("Product not found");
    p.active = false;
    return { deleted: id };
  },

  setStock: (skuId, { stock, delta, lowStockThreshold }) => {
    const row = inventory.find((i) => i.id === skuId);
    if (!row) throw new Error("SKU not found");
    if (stock !== undefined) {
      if (stock < 0) throw new Error("Stock cannot be negative");
      row.stock = Number(stock);
    } else if (delta !== undefined) {
      row.stock = Math.max(0, row.stock + Number(delta));
    }
    if (lowStockThreshold !== undefined) row.lowStockThreshold = Math.max(0, Number(lowStockThreshold));
    return clone(row);
  },

  lowStock: () => clone(inventory
    .filter((i) => i.stock <= i.lowStockThreshold && products.find((p) => p.id === i.productId)?.active)
    .sort((a, b) => a.stock - b.stock)
    .map((i) => {
      const p = products.find((x) => x.id === i.productId);
      return { ...i, product: p.name, color: p.colors.find((cc) => cc.id === i.colorId).name, device: deviceName(i.deviceId) };
    })),
};
