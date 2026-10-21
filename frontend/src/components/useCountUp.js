import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../services/format.js";

/** Animates a number toward `value` (ease-out, 500ms). */
export function useCountUp(value, { start = true, duration = 500 } = {}) {
  const [shown, setShown] = useState(start ? value : 0);
  const from = useRef(start ? value : 0);

  useEffect(() => {
    if (!start) return;
    if (prefersReducedMotion() || document.hidden) {
      from.current = value;
      setShown(value);
      return;
    }
    const begin = from.current, t0 = performance.now();
    let raf;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / duration);
      const v = begin + (value - begin) * (1 - Math.pow(1 - k, 3));
      from.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, start, duration]);

  return shown;
}
