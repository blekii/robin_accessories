import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { prefersReducedMotion } from "../services/format.js";
import { useStoreData } from "../components/StoreData.jsx";
import Hero from "../components/Hero.jsx";
import { CaseGrid, Categories, Faq, FeatureBand, Outlets, Reviews, TrustStrip } from "../components/Sections.jsx";

export default function Storefront() {
  const { data, error, reload, cases, devices, defaultDevice, categories, products, outlets } = useStoreData();
  const [deviceIdx, setDeviceIdx] = useState(0);
  const [request, setRequest] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const select = useCallback((productId, deviceId, colorIdx) => setRequest({
    caseIdx: cases.findIndex((p) => p.id === productId),
    deviceIdx: devices.findIndex((d) => d.id === deviceId),
    colorIdx,
    nonce: Date.now(),
  }), [cases, devices]);

  const onView = useCallback((product, device, colorIdx) => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    setTimeout(() => select(product.id, device.id, colorIdx), prefersReducedMotion() ? 0 : 350);
  }, [select]);

  // a case card on another page sent us here to show it in 3D
  const view = location.state?.view;
  useEffect(() => {
    if (!view || !data) return;
    const t = setTimeout(() => select(view.productId, view.deviceId, view.colorIdx), 150);
    navigate(location.pathname, { replace: true, state: null });
    return () => clearTimeout(t);
  }, [view, data, select, navigate, location.pathname]);

  if (error) {
    return (
      <div className="container load-state">
        <p>Couldn't load the store: {error}</p>
        <button className="btn btn--primary" type="button" onClick={reload}>Try again</button>
      </div>
    );
  }
  if (!data) return <div className="container load-state" aria-busy="true"><div className="stage stage--loading" /></div>;

  const initialDevice = Math.max(0, devices.indexOf(defaultDevice));

  return (
    <>
      {cases.length > 0 && (
        <Hero cases={cases} devices={devices} initialDevice={initialDevice} request={request} onDeviceChange={setDeviceIdx} />
      )}
      <TrustStrip />
      <Categories categories={categories} products={products} devices={devices} device={devices[deviceIdx] ?? defaultDevice} onView={onView} />
      <CaseGrid cases={cases} devices={devices} onView={onView} />
      <FeatureBand outletCount={outlets.length} />
      <Outlets outlets={outlets} />
      <Reviews />
      <Faq />
    </>
  );
}
