import { useEffect, useState } from "react";
import { isDemo, onModeChange } from "../services/api.js";

/** Shown when the PHP API isn't reachable and the app is running on built-in demo data. */
export default function DemoBanner() {
  const [demo, setDemo] = useState(isDemo());
  useEffect(() => onModeChange((live) => setDemo(!live)), []);
  if (!demo) return null;
  return (
    <div className="demo-banner" role="status">
      <span className="dot dot--warn" aria-hidden="true" />
      Demo data — the PHP API isn't running, so changes are kept in memory only. See README to connect MySQL.
    </div>
  );
}
