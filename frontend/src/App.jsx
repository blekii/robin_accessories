import { Navigate, Route, Routes } from "react-router-dom";
import { ShopProvider } from "./components/ShopContext.jsx";
import { StoreDataProvider } from "./components/StoreData.jsx";
import StoreLayout from "./components/Layout.jsx";
import Storefront from "./pages/Storefront.jsx";
import Products from "./pages/Products.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Checkout from "./pages/Checkout.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <Routes>
      <Route
        element={(
          <StoreDataProvider>
            <ShopProvider>
              <StoreLayout />
            </ShopProvider>
          </StoreDataProvider>
        )}
      >
        <Route path="/" element={<Storefront />} />
        <Route path="/products" element={<Products />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
