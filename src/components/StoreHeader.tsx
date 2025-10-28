import { Link } from "react-router-dom";
import { ShoppingCart, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";

export const StoreHeader = () => {
  const { items } = useCart();
  const { openAuthModal, isAuthenticated, user, logout } = useAuth();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    // Redirect to home page after logout
    window.location.href = '/';
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/store" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Alliens Wallet
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link to="/store" className="text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/store/shop" className="text-foreground hover:text-primary transition-colors">
                Shop
              </Link>
              {/* <Link to="/store/categories" className="text-foreground hover:text-primary transition-colors">
                Categories
              </Link> */}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  Welcome, {user?.name}
                </span>
                <Button 
                  onClick={handleLogout}
                  variant="ghost" 
                  size="sm"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => openAuthModal('login')} 
                variant="ghost" 
                size="icon"
                title="Sign In"
              >
                <User className="h-5 w-5" />
              </Button>
            )}
            
            <Link to="/store/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};