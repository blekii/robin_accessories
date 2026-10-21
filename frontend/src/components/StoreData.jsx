import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";

const StoreDataContext = createContext(null);

export const DEFAULT_DEVICE_ID = "ip17pro";

/** Loads the catalog + products once and shares them with every storefront page. */
export function StoreDataProvider({ children }) {
  const [state, setState] = useState({ data: null, error: "" });

  const load = useCallback(() => {
    setState((s) => ({ ...s, error: "" }));
    Promise.all([api.catalog(), api.products()])
      .then(([catalog, products]) => setState({ data: { ...catalog, products }, error: "" }))
      .catch((e) => setState({ data: null, error: e.message }));
  }, []);
  useEffect(load, [load]);

  const value = useMemo(() => {
    const data = state.data;
    const devices = data?.devices ?? [];
    return {
      ...state,
      reload: load,
      products: data?.products ?? [],
      categories: data?.categories ?? [],
      devices,
      outlets: data?.outlets ?? [],
      cases: data?.products.filter((p) => p.category === "cases" && p.colors.length) ?? [],
      defaultDevice: devices.find((d) => d.id === DEFAULT_DEVICE_ID) ?? devices[0],
      categoryName: (id) => data?.categories.find((c) => c.id === id)?.name ?? id,
    };
  }, [state, load]);

  return <StoreDataContext.Provider value={value}>{children}</StoreDataContext.Provider>;
}

export const useStoreData = () => useContext(StoreDataContext);
