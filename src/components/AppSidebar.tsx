import { BarChart3, Package, ShoppingCart, Tags, Settings, Grid3X3, Home, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

const navigationItems = [
  { title: "Overview", url: "/admin", icon: BarChart3 },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Categories", url: "/admin/categories", icon: Tags },
  { title: "Customers", url: "/admin/customers", icon: Users },
  // { title: "Specifications", url: "/admin/specifications", icon: Grid3X3 },
  { title: "Products", url: "/admin/products", icon: Package },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { user } = useAuth();

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      isActive
        ? "bg-primary text-foreground font-medium"
        : "text-muted-foreground hover:text-foreground hover:bg-accent"
    }`;

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="border-r border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-semibold text-foreground">Aliens Wallet</h2>
                <p className="text-sm text-muted-foreground">Admin Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-3 py-2">
            {!isCollapsed && "Main Navigation"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClassName}>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <div className="mt-auto p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="min-w-6 min-h-6 bg-gradient-success rounded-full flex items-center justify-center">
                <Settings className="w-3 h-3 text-success-foreground" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground">{user?.name || 'Admin'}</p>
                <p className="text-muted-foreground">{user?.email || 'admin@example.com'}</p>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}