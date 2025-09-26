import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StoreLayout } from "@/components/StoreLayout";
import Overview from "@/pages/Overview";
import Orders from "@/pages/Orders";
import Categories from "@/pages/Categories";
import Specifications from "@/pages/Specifications";
import Products from "@/pages/Products";
import Homepage from "@/pages/store/Homepage";
import Shop from "@/pages/store/Shop";
import ProductDetails from "@/pages/store/ProductDetails";
import Cart from "@/pages/store/Cart";
import Checkout from "@/pages/store/Checkout";
import OrderConfirmation from "@/pages/store/OrderConfirmation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Route configuration using data mode
const router = createBrowserRouter([
  {
    path: "/admin",
    element: <DashboardLayout><Outlet /></DashboardLayout>,
    children: [
      {
        index: true,
        element: <Overview />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "categories",
        element: <Categories />,
      },
      {
        path: "specifications",
        element: <Specifications />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "/store",
    element: <StoreLayout><Outlet /></StoreLayout>,
    children: [
      {
        index: true,
        element: <Homepage />,
      },
      {
        path: "shop",
        element: <Shop />,
      },
      {
        path: "product/:id",
        element: <ProductDetails />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "order-confirmation/:orderNumber",
        element: <OrderConfirmation />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "/",
    element: <StoreLayout><Homepage /></StoreLayout>,
  },
  {
    path: "*",
    element: <NotFound />,
  },
], {
  future: {
    v7_startTransition: true,
  },
} as Parameters<typeof createBrowserRouter>[1]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
        <AuthModal />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
