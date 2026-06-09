import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AppProvider, Frame, Navigation } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";
import { HomeIcon, OrderIcon, SettingsIcon, ReceiptIcon } from "@shopify/polaris-icons";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";

const params = new URLSearchParams(window.location.search);
const shop = params.get("shop") || "";
const host = params.get("host") || "";

function AppNavigation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Navigation location={pathname}>
      <Navigation.Section
        items={[
          { label: "Dashboard", icon: HomeIcon, url: "/", onClick: () => navigate("/") },
          { label: "Orders", icon: OrderIcon, url: "/orders", onClick: () => navigate("/orders") },
          { label: "Settings", icon: SettingsIcon, url: "/settings", onClick: () => navigate("/settings") },
          { label: "Billing", icon: ReceiptIcon, url: "/billing", onClick: () => navigate("/billing") },
        ]}
      />
    </Navigation>
  );
}

function AppRoutes() {
  return (
    <Frame navigation={<AppNavigation />}>
      <Routes>
        <Route path="/" element={<Dashboard shop={shop} />} />
        <Route path="/orders" element={<Orders shop={shop} />} />
        <Route path="/settings" element={<Settings shop={shop} />} />
        <Route path="/billing" element={<Billing shop={shop} />} />
      </Routes>
    </Frame>
  );
}

export default function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
