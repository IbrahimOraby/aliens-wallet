import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingBag, TrendingUp, Package, Users, Activity } from "lucide-react";

export default function Overview() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$54,239",
      change: "+12.3%",
      icon: DollarSign,
      trend: "up",
      color: "text-success"
    },
    {
      title: "Orders",
      value: "1,429",
      change: "+18.2%",
      icon: ShoppingBag,
      trend: "up",
      color: "text-info"
    },
    {
      title: "Active Products",
      value: "892",
      change: "+4.1%",
      icon: Package,
      trend: "up",
      color: "text-warning"
    },
    {
      title: "Customers",
      value: "2,845",
      change: "+7.8%",
      icon: Users,
      trend: "up",
      color: "text-primary"
    }
  ];

  const recentOrders = [
    { id: "ORD-001", customer: "John Doe", product: "Netflix Gift Card", amount: "$25.00", status: "Paid" },
    { id: "ORD-002", customer: "Jane Smith", product: "Spotify Premium", amount: "$9.99", status: "Pending" },
    { id: "ORD-003", customer: "Mike Johnson", product: "Amazon Gift Card", amount: "$50.00", status: "Paid" },
    { id: "ORD-004", customer: "Sarah Wilson", product: "ChatGPT Plus", amount: "$20.00", status: "Canceled" },
    { id: "ORD-005", customer: "Tom Brown", product: "Apple Store Gift Card", amount: "$100.00", status: "Paid" }
  ];

  const topProducts = [
    { name: "Netflix Gift Card", sales: 234, revenue: "$5,850" },
    { name: "Amazon Gift Card", sales: 189, revenue: "$9,450" },
    { name: "Spotify Premium", sales: 156, revenue: "$1,559" },
    { name: "ChatGPT Plus", sales: 142, revenue: "$2,840" },
    { name: "Apple Store Gift Card", sales: 98, revenue: "$9,800" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your gift card platform today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-success" />
                <span className="text-xs text-success font-medium">{stat.change}</span>
                <span className="text-xs text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <div className="font-medium text-sm">{order.customer}</div>
                    <div className="text-xs text-muted-foreground">{order.product}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        order.status === "Paid" ? "default" : 
                        order.status === "Pending" ? "secondary" : 
                        "destructive"
                      }
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                    <span className="text-sm font-medium">{order.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                      {index + 1}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.sales} sales</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-success">{product.revenue}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Chart Component Placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Pie Chart Placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}