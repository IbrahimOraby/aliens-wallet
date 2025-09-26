import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Admin Dashboard Routes */}
          <Route path="/admin/*" element={
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/specifications" element={<Specifications />} />
                <Route path="/products" element={<Products />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DashboardLayout>
          } />
          
          {/* Store Routes */}
          <Route path="/store/*" element={
            <StoreLayout>
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </StoreLayout>
          } />
          
          {/* Default redirect to store homepage */}
          <Route path="/" element={<StoreLayout><Homepage /></StoreLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
