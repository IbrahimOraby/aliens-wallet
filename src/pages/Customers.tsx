import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, MoreHorizontal, Loader2, Eye, Shield, XCircle, CheckCircle, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usersService } from "@/services/users";
import { User } from "@/types/user";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

type StatusFilter = "all" | "active" | "inactive";

export default function Customers() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await usersService.getCustomers(offset, limit, statusFilter === "all" ? undefined : statusFilter === "active");

      const list = Array.isArray(response?.data) ? response.data : [];
      setCustomers(list);

      const meta = response?.meta;
      if (meta) {
        setTotal(typeof meta.total === "number" ? meta.total : list.length);
        if (typeof meta.offset === "number" && meta.offset !== offset) {
          setOffset(meta.offset);
        }
        if (typeof meta.limit === "number" && meta.limit !== limit && meta.limit > 0) {
          setLimit(meta.limit);
        }
      } else {
        setTotal(list.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, limit, statusFilter]);

  const filteredCustomers = useMemo(() => {
    const base = Array.isArray(customers) ? customers : [];
    const term = searchTerm.trim().toLowerCase();

    if (!term) return base;

    return base.filter((customer) => {
      const name = customer.name?.toLowerCase?.() || "";
      const email = customer.email?.toLowerCase?.() || "";
      const phone = customer.phoneNumber?.toLowerCase?.() || "";
      return name.includes(term) || email.includes(term) || phone.includes(term);
    });
  }, [customers, searchTerm]);

  const handleStatusToggle = async (customer: User) => {
    try {
      setStatusUpdatingId(customer.id);
      const response = await usersService.updateCustomerStatus(customer.id, { isActive: !customer.isActive });
      if (response.success && response.data) {
        setCustomers((prev) =>
          prev.map((item) => (item.id === customer.id ? response.data : item))
        );
        if (selectedCustomer?.id === customer.id) {
          setSelectedCustomer(response.data);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update customer status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const openDetails = (customer: User) => {
    setSelectedCustomer(customer);
    setDetailsError(null);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedCustomer(null);
    setDetailsError(null);
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    try {
      return format(new Date(value), "PPpp");
    } catch {
      return value;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your registered customers and account access</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => loadCustomers()} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => { setOffset(0); setStatusFilter(value as StatusFilter); }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Customers List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="w-5 h-5 mr-2 inline-block animate-spin" />
                      Loading customers...
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{customer.name}</span>
                        <span className="text-xs text-muted-foreground">#{customer.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{customer.email}</span>
                        <span className="text-xs text-muted-foreground">{customer.phoneNumber || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(customer.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.isActive ? "default" : "secondary"}>
                        {customer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={(event) => {
                              event.preventDefault();
                              openDetails(customer);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem
                            className="cursor-pointer text-destructive"
                            onSelect={(event) => {
                              event.preventDefault();
                              handleStatusToggle(customer);
                            }}
                            disabled={statusUpdatingId === customer.id}
                          >
                            {statusUpdatingId === customer.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : customer.isActive ? (
                              <XCircle className="w-4 h-4 mr-2" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            {customer.isActive ? "Block User" : "Unblock User"}
                          </DropdownMenuItem> */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {!isLoading && filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No customers found matching your criteria.</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {customers.length > 0 ? offset + 1 : 0}-{Math.min(offset + limit, total)} of {total}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)}>
                Next
              </Button>
              <Select
                value={String(limit)}
                onValueChange={(value) => {
                  setOffset(0);
                  setLimit(Number(value));
                }}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
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

      <Dialog open={isDetailsOpen} onOpenChange={(open) => !open && closeDetails()}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Review account details and status.
            </DialogDescription>
          </DialogHeader>

          {detailsError && (
            <Alert variant="destructive">
              <AlertDescription>{detailsError}</AlertDescription>
            </Alert>
          )}

          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedCustomer.phoneNumber || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedCustomer.isActive ? "default" : "secondary"}>
                    {selectedCustomer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">{formatDate(selectedCustomer.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatDate(selectedCustomer.updatedAt)}</p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeDetails}>
                  Close
                </Button>
                <Button
                  variant={selectedCustomer.isActive ? "destructive" : "default"}
                  onClick={() => handleStatusToggle(selectedCustomer)}
                  disabled={statusUpdatingId === selectedCustomer.id}
                >
                  {statusUpdatingId === selectedCustomer.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : selectedCustomer.isActive ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Block User
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Unblock User
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

