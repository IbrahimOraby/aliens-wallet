import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Eye, MoreHorizontal, Loader2, AlertCircle, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ordersService } from "@/services/orders";
import { productsService } from "@/services/products";
import { Order } from "@/types/order";
import type { Product, ProductVariation, ProductVariationTemplate } from "@/types/product";
import { formatDurationInDays } from "@/utils/time";

type OrderStatusFilter = "all" | "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<Order["status"] | "">("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ordersService.getAllOrders({
        offset,
        limit,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      const list = Array.isArray(response?.data) ? response.data : [];
      setOrders(list);
      const metaTotal =
        typeof response?.meta?.total === "number" ? response.meta.total : list.length;
      setTotal(metaTotal);

      if (typeof response?.meta?.offset === "number" && response.meta.offset !== offset) {
        setOffset(response.meta.offset);
      }

      if (
        typeof response?.meta?.limit === "number" &&
        response.meta.limit > 0 &&
        response.meta.limit !== limit
      ) {
        setLimit(response.meta.limit);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, offset, limit]);

  const filteredOrders = useMemo(() => {
    const base = Array.isArray(orders) ? orders : [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return base;
    return base.filter(order => {
      const customerName = order.customerName?.toLowerCase?.() || "";
      const orderNumber = order.orderNumber?.toLowerCase?.() || "";
      const email = order.customerEmail?.toLowerCase?.() || "";
      return (
        customerName.includes(term) ||
        orderNumber.includes(term) ||
        email.includes(term)
      );
    });
  }, [orders, searchTerm]);

  const getStatusBadgeVariant = (status: Order["status"]) => {
    switch (status) {
      case "COMPLETED": return "default";
      case "PENDING": return "secondary";
      case "PROCESSING": return "outline";
      case "CANCELLED": return "destructive";
      default: return "outline";
    }
  };

  const handleStatusChange = (orderId: number, newStatus: Order["status"]) => {
    // Placeholder for future actions (update order status)
    console.log(`Updating order ${orderId} to status: ${newStatus}`);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedOrder(null);
    setDetailsError(null);
    setStatusDraft("");
    setStatusUpdateError(null);
    setStatusUpdateSuccess(null);
  };

  const handleViewDetails = async (orderId: number) => {
    setIsDetailsOpen(true);
    setSelectedOrder(null);
    setDetailsError(null);
    setDetailsLoading(true);
    setStatusUpdateError(null);
    setStatusUpdateSuccess(null);

    try {
      const response = await ordersService.getOrderById(orderId);
      if (response.success) {
        const orderData = response.data;
        let enrichedItems = orderData.items;

        try {
          enrichedItems = await enrichOrderItems(orderData.items);
        } catch (error) {
          console.error("Failed to enrich order items", error);
        }

        setSelectedOrder({
          ...orderData,
          items: enrichedItems,
        });
        setStatusDraft(orderData.status);
        setStatusUpdateSuccess(null);
      } else {
        setDetailsError("Failed to load order details.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load order details.";
      setDetailsError(message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !statusDraft || statusDraft === selectedOrder.status) {
      return;
    }

    try {
      setStatusUpdateLoading(true);
      setStatusUpdateError(null);
      setStatusUpdateSuccess(null);

      const response = await ordersService.updateOrderStatus(selectedOrder.id, { status: statusDraft });
      if (response.success) {
        let enrichedItems = response.data.items;
        try {
          enrichedItems = await enrichOrderItems(response.data.items);
        } catch (error) {
          console.error("Failed to enrich items after status update", error);
        }

        const updatedOrder = { ...response.data, items: enrichedItems };
        setSelectedOrder(updatedOrder);
        setStatusDraft(updatedOrder.status);
        setOrders(prev =>
          prev.map(order => (order.id === updatedOrder.id ? { ...order, status: updatedOrder.status } : order))
        );
        setStatusUpdateSuccess("Order status updated successfully.");
        await loadOrders();
      } else {
        setStatusUpdateError("Failed to update order status.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update order status.";
      setStatusUpdateError(message);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDateTime = (value: string) => {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const formatPriceString = (value?: string | number | null) => {
    if (value === undefined || value === null) {
      return null;
    }
    const numeric = typeof value === "string" ? Number(value) : value;
    if (Number.isFinite(numeric)) {
      return formatCurrency(numeric as number);
    }
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
    return null;
  };

  const enrichOrderItems = async (items: Order["items"]) => {
    const productCache = new Map<string, Product | null>();
    let variationTemplates: ProductVariationTemplate[] | null = null;

    const normalize = (value: string) => value?.trim().toLowerCase();
    const ensureVariationTemplates = async () => {
      if (variationTemplates === null) {
        try {
          variationTemplates = await productsService.getVariationTemplates();
        } catch (error) {
          console.error("Failed to load variation templates", error);
          variationTemplates = [];
        }
      }
      return variationTemplates;
    };

    return Promise.all(
      items.map(async (item) => {
        let productDetails: Product | null = null;

        if (productCache.has(item.productName)) {
          productDetails = productCache.get(item.productName) ?? null;
        } else {
          try {
            productDetails = await productsService.findProductByName(item.productName);
          } catch (error) {
            console.error("Failed to load product metadata for order item", {
              productName: item.productName,
              error,
            });
            productDetails = null;
          }
          productCache.set(item.productName, productDetails);
        }

        let variationDetails: ProductVariation | undefined;
        if (productDetails) {
          const targetName = normalize(item.variationName);
          variationDetails = productDetails.variations.find(
            (variation) => normalize(variation.name) === targetName
          );
        }

        let variationTemplate: ProductVariationTemplate | undefined;
        try {
          const templates = await ensureVariationTemplates();
          const targetName = normalize(item.variationName);
          const templateMatch = templates.find(
            (template) => normalize(template.name) === targetName
          );
          variationTemplate = templateMatch ?? undefined;
        } catch (error) {
          console.error("Failed to load variation template for order item", {
            variationName: item.variationName,
            error,
          });
        }

        return {
          ...item,
          productKind: productDetails?.kind ?? item.productKind,
          productDetails: productDetails ?? undefined,
          variationDetails,
          variationTemplate,
        };
      })
    );
  };

  const getItemKind = (item: Order["items"][number]) =>
    item.productDetails?.kind ?? item.productKind ?? undefined;

  const renderProductMetadata = (item: Order["items"][number]) => {
    const kind = getItemKind(item) ?? "Unknown";
    const categoryName = item.productDetails?.productType?.name;
    const subcategoryName = item.productDetails?.category?.name;
    const missingMetadata = !item.productDetails;

    return (
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Type: {kind}</p>
        {categoryName && <p>Category: {categoryName}</p>}
        {subcategoryName && <p>Subcategory: {subcategoryName}</p>}
        {missingMetadata && (
          <p className="flex items-center gap-2">
            <AlertCircle className="w-3 h-3" />
            Product metadata not found.
          </p>
        )}
      </div>
    );
  };

  const renderVariationMetadata = (item: Order["items"][number]) => {
    const variation = item.variationDetails;
    const template = item.variationTemplate;

    if (!variation && !template) {
      return (
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <AlertCircle className="w-3 h-3" />
          Variation metadata not found.
        </p>
      );
    }

    const priceLabel = formatPriceString(variation?.price ?? template?.price);
    const duration = variation?.duration ?? template?.duration;
    const maxUsers = variation?.maxUsers ?? template?.maxUsers;
    const regionsFromVariation =
      variation?.regions?.map((entry) => entry.region?.name).filter(Boolean) ?? [];
    const regionsFromTemplate =
      template?.regions?.map((entry) => entry.regionName).filter(Boolean) ?? [];
    const regionNames = regionsFromVariation.length > 0 ? regionsFromVariation : regionsFromTemplate;

    const hasData =
      Boolean(priceLabel) ||
      (duration !== undefined && duration !== null) ||
      (maxUsers !== undefined && maxUsers !== null) ||
      regionNames.length > 0 ||
      Boolean(item.variationName);

    if (!hasData) {
      return null;
    }

    const itemPriceLabel = formatCurrency(item.price);
    const showVariationPrice = priceLabel && priceLabel !== itemPriceLabel;

    return (
      <div className="text-xs text-muted-foreground space-y-1">
        {item.variationName && <p>Variation: {item.variationName}</p>}
        {showVariationPrice && <p>Variation price: {priceLabel}</p>}
        {duration !== undefined && duration !== null && <p>Duration: {formatDurationInDays(duration)}</p>}
        {maxUsers !== undefined && maxUsers !== null && <p>Max users: {maxUsers}</p>}
        {regionNames.length > 0 && <p>Regions: {regionNames.join(", ")}</p>}
      </div>
    );
  };

  const renderServiceInfo = (item: Order["items"][number]) => {
    if (getItemKind(item) !== "SERVICE") return null;

    const hasAccountInfo = item.email || item.accountType || item.password;

    if (!hasAccountInfo) {
      return (
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
          <AlertCircle className="w-3 h-3" />
          Service account details were not returned by the backend.
        </p>
      );
    }

    return (
      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
        {item.accountType && (
          <p>Account type: {item.accountType === "new" ? "Create new account" : "Use existing account"}</p>
        )}
        {item.email && <p>Email: {item.email}</p>}
        {item.password && <p>Password: {item.password}</p>}
      </div>
    );
  };

  const statusOptions: Order["status"][] = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];

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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => loadOrders()} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Refresh
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90">
            <Download className="w-4 h-4 mr-2" />
            Export Orders
          </Button>
        </div>
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
            <Select value={statusFilter} onValueChange={(v) => { setOffset(0); setStatusFilter(v as OrderStatusFilter); }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="w-5 h-5 mr-2 inline-block animate-spin" />
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{order.customerName}</span>
                        <span className="text-xs text-muted-foreground">{order.customerEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</TableCell>
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
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={(event) => {
                              event.preventDefault();
                              handleViewDetails(order.id);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {!isLoading && filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found matching your criteria.</p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {orders.length > 0 ? offset + 1 : 0}-{Math.min(offset + limit, total)} of {total}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>Previous</Button>
              <Button variant="outline" size="sm" disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)}>Next</Button>
              <Select value={String(limit)} onValueChange={(v) => { setOffset(0); setLimit(Number(v)); }}>
                <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isDetailsOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseDetails();
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder ? `Placed on ${formatDateTime(selectedOrder.createdAt)}` : "Review the order information."}
            </DialogDescription>
          </DialogHeader>
          <DialogClose className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>

          {detailsLoading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading order details...
            </div>
          )}

          {!detailsLoading && detailsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{detailsError}</AlertDescription>
            </Alert>
          )}

          {!detailsLoading && selectedOrder && !detailsError && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-semibold font-mono">{selectedOrder.orderNumber}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={getStatusBadgeVariant(selectedOrder.status)} className="w-fit">
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-semibold text-primary">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold">Order Status</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Select
                    value={statusDraft}
                    onValueChange={(value) => {
                      setStatusDraft(value as Order["status"]);
                      setStatusUpdateError(null);
                      setStatusUpdateSuccess(null);
                    }}
                  >
                    <SelectTrigger className="sm:w-60">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={
                      statusUpdateLoading ||
                      !selectedOrder ||
                      !statusDraft ||
                      statusDraft === selectedOrder.status
                    }
                  >
                    {statusUpdateLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Status"
                    )}
                  </Button>
                </div>
                {statusUpdateError && <p className="text-xs text-destructive">{statusUpdateError}</p>}
                {statusUpdateSuccess && <p className="text-xs text-green-600">{statusUpdateSuccess}</p>}
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-base font-semibold">Customer Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedOrder.customerEmail}</p>
                  </div>
                  {selectedOrder.customerPhone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedOrder.customerPhone}</p>
                    </div>
                  )}
                  {selectedOrder.user && (
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground">Account</p>
                      <p className="font-medium">
                        {selectedOrder.user.name} ({selectedOrder.user.email})
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Items</h3>
                  <span className="text-sm text-muted-foreground">
                    {selectedOrder.items.length} {selectedOrder.items.length === 1 ? "item" : "items"}
                  </span>
                </div>
                <ScrollArea className="max-h-72 pr-4">
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="rounded-lg border border-border/60 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                          <div className="space-y-3">
                            <p className="font-semibold">{item.productName}</p>
                            {renderProductMetadata(item)}
                            {renderVariationMetadata(item)}
                            {renderServiceInfo(item)}
                          </div>
                          <div className="text-sm sm:text-right space-y-1">
                            <p className="font-medium">{formatCurrency(item.price)}</p>
                            <p className="text-muted-foreground">Qty: {item.quantity}</p>
                            {/* <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p> */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {selectedOrder.additionalInfo && Object.keys(selectedOrder.additionalInfo).length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold">Additional Information</h3>
                    <pre className="max-h-48 overflow-auto rounded-md bg-muted p-4 text-xs">
                      {JSON.stringify(selectedOrder.additionalInfo, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}