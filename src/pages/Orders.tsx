import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Eye, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type OrderStatus = "Paid" | "Pending" | "Canceled";

interface Order {
  id: string;
  customer: string;
  email: string;
  product: string;
  amount: string;
  date: string;
  status: OrderStatus;
}

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const orders: Order[] = [
    { id: "ORD-001", customer: "John Doe", email: "john@example.com", product: "Netflix Gift Card $25", amount: "$25.00", date: "2024-01-15", status: "Paid" },
    { id: "ORD-002", customer: "Jane Smith", email: "jane@example.com", product: "Spotify Premium 1 Month", amount: "$9.99", date: "2024-01-15", status: "Pending" },
    { id: "ORD-003", customer: "Mike Johnson", email: "mike@example.com", product: "Amazon Gift Card $50", amount: "$50.00", date: "2024-01-14", status: "Paid" },
    { id: "ORD-004", customer: "Sarah Wilson", email: "sarah@example.com", product: "ChatGPT Plus", amount: "$20.00", date: "2024-01-14", status: "Canceled" },
    { id: "ORD-005", customer: "Tom Brown", email: "tom@example.com", product: "Apple Store Gift Card $100", amount: "$100.00", date: "2024-01-13", status: "Paid" },
    { id: "ORD-006", customer: "Lisa Davis", email: "lisa@example.com", product: "Disney+ 1 Year", amount: "$79.99", date: "2024-01-13", status: "Pending" },
    { id: "ORD-007", customer: "Chris Lee", email: "chris@example.com", product: "Steam Gift Card $20", amount: "$20.00", date: "2024-01-12", status: "Paid" },
    { id: "ORD-008", customer: "Anna White", email: "anna@example.com", product: "Google Play Gift Card $25", amount: "$25.00", date: "2024-01-12", status: "Canceled" },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "Paid": return "default";
      case "Pending": return "secondary";
      case "Canceled": return "destructive";
      default: return "outline";
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    // In a real app, this would update the order in the backend
    console.log(`Updating order ${orderId} to status: ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Download className="w-4 h-4 mr-2" />
          Export Orders
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, order ID, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{order.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{order.customer}</span>
                        <span className="text-xs text-muted-foreground">{order.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-48 truncate">{order.product}</TableCell>
                    <TableCell className="font-medium">{order.amount}</TableCell>
                    <TableCell className="text-muted-foreground">{order.date}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border border-border">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {order.status === "Pending" && (
                            <>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => handleStatusChange(order.id, "Paid")}
                              >
                                Mark as Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer text-destructive"
                                onClick={() => handleStatusChange(order.id, "Canceled")}
                              >
                                Cancel Order
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}