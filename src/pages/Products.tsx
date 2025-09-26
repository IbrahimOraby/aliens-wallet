import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Package, Gift, Upload, Eye, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductVariation {
  id: string;
  specifications: Record<string, string>;
  price: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  type: "gift_card" | "service";
  category: string;
  description: string;
  basePrice: number;
  status: "active" | "inactive";
  variations: ProductVariation[];
  codes?: string[]; // For gift cards
  accountOptions?: "new" | "existing" | "both"; // For services
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Netflix Gift Card",
      type: "gift_card",
      category: "Entertainment",
      description: "Netflix streaming service gift card",
      basePrice: 25.00,
      status: "active",
      variations: [
        { id: "1-1", specifications: { amount: "$25" }, price: 25.00, stock: 50 },
        { id: "1-2", specifications: { amount: "$50" }, price: 50.00, stock: 30 }
      ],
      codes: ["NFLX-ABC123", "NFLX-DEF456", "NFLX-GHI789"]
    },
    {
      id: "2",
      name: "Spotify Premium",
      type: "service",
      category: "Music",
      description: "Spotify premium subscription service",
      basePrice: 9.99,
      status: "active",
      variations: [
        { id: "2-1", specifications: { plan: "Individual", duration: "1 Month" }, price: 9.99, stock: 100 },
        { id: "2-2", specifications: { plan: "Family", duration: "1 Month" }, price: 15.99, stock: 100 }
      ],
      accountOptions: "both"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    name: "",
    type: "gift_card" as "gift_card" | "service",
    category: "",
    description: "",
    basePrice: 0,
    status: "active" as "active" | "inactive",
    accountOptions: "both" as "new" | "existing" | "both",
    bulkCodes: ""
  });

  const categories = ["Entertainment", "Music", "Gaming", "Shopping", "Software"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      type: formData.type,
      category: formData.category,
      description: formData.description,
      basePrice: formData.basePrice,
      status: formData.status,
      variations: [],
      ...(formData.type === "gift_card" && {
        codes: formData.bulkCodes.split('\n').filter(code => code.trim())
      }),
      ...(formData.type === "service" && {
        accountOptions: formData.accountOptions
      })
    };

    if (editingProduct) {
      setProducts(prods => prods.map(prod => 
        prod.id === editingProduct.id ? { ...productData, variations: editingProduct.variations } : prod
      ));
    } else {
      setProducts(prods => [...prods, productData]);
    }

    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setActiveTab("basic");
    setFormData({
      name: "",
      type: "gift_card" as "gift_card" | "service",
      category: "",
      description: "",
      basePrice: 0,
      status: "active" as "active" | "inactive",
      accountOptions: "both" as "new" | "existing" | "both",
      bulkCodes: ""
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      type: product.type,
      category: product.category,
      description: product.description,
      basePrice: product.basePrice,
      status: product.status,
      accountOptions: product.accountOptions || "both",
      bulkCodes: product.codes?.join('\n') || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (productId: string) => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      setProducts(prods => prods.filter(prod => prod.id !== productId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">
            Manage gift cards and digital services with dynamic pricing
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Create New Product"}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="codes">Codes & Options</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit}>
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product-name">Product Name</Label>
                      <Input
                        id="product-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Netflix Gift Card"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="product-type">Product Type</Label>
                      <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gift_card">Gift Card</SelectItem>
                          <SelectItem value="service">Digital Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="base-price">Base Price ($)</Label>
                      <Input
                        id="base-price"
                        type="number"
                        step="0.01"
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Product description..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="status"
                      checked={formData.status === "active"}
                      onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? "active" : "inactive" })}
                    />
                    <Label htmlFor="status">Active Status</Label>
                  </div>
                </TabsContent>

                <TabsContent value="specifications" className="space-y-4">
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Specifications management will be integrated here.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Create specifications first, then assign them to products for dynamic pricing.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="codes" className="space-y-4">
                  {formData.type === "gift_card" ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label htmlFor="bulk-codes">Gift Card Codes</Label>
                        <Button type="button" variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-1" />
                          Upload Excel
                        </Button>
                      </div>
                      <Textarea
                        id="bulk-codes"
                        value={formData.bulkCodes}
                        onChange={(e) => setFormData({ ...formData, bulkCodes: e.target.value })}
                        placeholder="Enter codes (one per line)&#10;NFLX-ABC123&#10;NFLX-DEF456&#10;NFLX-GHI789"
                        rows={8}
                        className="font-mono text-sm"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Codes will be hidden after upload and only revealed after purchase.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="account-options">Account Options</Label>
                      <Select value={formData.accountOptions} onValueChange={(value: any) => setFormData({ ...formData, accountOptions: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New Account Only</SelectItem>
                          <SelectItem value="existing">Existing Account Only</SelectItem>
                          <SelectItem value="both">Both Options Available</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-2">
                        Choose whether customers can create new accounts or activate on existing ones.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                    {editingProduct ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Variations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.type === "gift_card" ? (
                        <Gift className="w-5 h-5 text-primary" />
                      ) : (
                        <Package className="w-5 h-5 text-info" />
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.type === "gift_card" ? "default" : "secondary"}>
                      {product.type === "gift_card" ? "Gift Card" : "Service"}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="font-medium">${product.basePrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.variations.length} variations</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === "active" ? "default" : "secondary"}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {products.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No products found. Create your first product to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}