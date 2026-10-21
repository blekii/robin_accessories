export const BRAND = { name: "Robin Accessories", short: "Robin" };

export const fmt = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");

export function mix(hex, target, amt) {
  const a = parseInt(hex.slice(1), 16), b = parseInt(target.slice(1), 16);
  const ch = (v, s) => (v >> s) & 255;
  const m = (s) => Math.round(ch(a, s) + (ch(b, s) - ch(a, s)) * amt);
  return "#" + ((1 << 24) | (m(16) << 16) | (m(8) << 8) | m(0)).toString(16).slice(1);
}

export const tintOf = (hex) => mix(hex, "#000000", 0.42);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
