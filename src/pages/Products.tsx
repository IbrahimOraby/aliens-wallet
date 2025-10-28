import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Plus, Edit, Trash2, Package, Gift, Upload, Eye, X, Loader2, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { productsService } from "@/services/products";
import { categoriesService } from "@/services/categories";
import { regionsService } from "@/services/regions";
import { Product, CreateProductRequest, UpdateProductRequest } from "@/types/product";
import { Category } from "@/types/category";
import { Region } from "@/types/region";
import { productFormSchema, productSchema, ProductFormData, ProductData } from "@/schemas/product";
import { useToast } from "@/hooks/use-toast";

// Using Product type from the API types

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      isActive: true,
      kind: "GIFTCARD",
      code: "",
      photoUrl: "",
      productTypeId: "",
      categoryId: "",
      variations: []
    }
  });

  // Load products, categories, and regions on component mount
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadRegions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load subcategories when product type changes
  const productTypeId = form.watch("productTypeId");
  useEffect(() => {
    if (productTypeId) {
      loadSubcategories(Number(productTypeId));
      // Only reset category selection when product type changes if we're not editing
      if (!editingProduct) {
        form.setValue("categoryId", "");
      }
    } else {
      setSubcategories([]);
    }
  }, [productTypeId, editingProduct, form]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsService.getProducts({ offset: 0, limit: 50 });
      setProducts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      // Load ALL categories first to find which ones have no parent (parent categories)
      const response = await categoriesService.getCategories({ offset: 0, limit: 1000 });
      const allCategories = response.data;
      
      // Filter categories that have NO parent (parentId is null) - these are our "Product Types"
      const parentCategoriesOnly = allCategories.filter(category => category.parentId === null);
      
      setParentCategories(parentCategoriesOnly);
    } catch (err) {
      console.error('Failed to load categories:', err);
      toast({
        title: "Warning",
        description: "Failed to load categories. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadRegions = async () => {
    try {
      setRegionsLoading(true);
      const response = await regionsService.getRegions({ offset: 0, limit: 1000, isActive: true });
      setRegions(response.data);
    } catch (err) {
      console.error('Failed to load regions:', err);
      toast({
        title: "Warning",
        description: "Failed to load regions. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setRegionsLoading(false);
    }
  };

  const loadSubcategories = async (parentId: number) => {
    try {
      // Load ALL categories and filter to find children of the selected parent
      const response = await categoriesService.getCategories({ offset: 0, limit: 1000 });
      const allCategories = response.data;
      
      // Filter categories that have the selected parentId (children of the selected parent)
      const childrenCategories = allCategories.filter(category => category.parentId === parentId);
      
      setSubcategories(childrenCategories);
    } catch (err) {
      console.error('Failed to load subcategories:', err);
      setSubcategories([]);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    
    try {
      // Transform form data using the schema
      const transformedData: ProductData = productSchema.parse(data);
      
      const productData: CreateProductRequest = {
        name: transformedData.name,
        description: transformedData.description,
        basePrice: transformedData.basePrice,
        isActive: transformedData.isActive,
        kind: transformedData.kind,
        code: transformedData.code,
        photoUrl: transformedData.photoUrl,
        productTypeId: transformedData.productTypeId,
        categoryId: transformedData.categoryId,
        variations: transformedData.variations?.map(v => ({
          name: v.name,
          price: v.price,
          duration: v.duration,
          maxUsers: v.maxUsers,
          availableCount: v.isUnlimited ? 0 : v.availableCount, // zero means unlimited
          regionIds: [v.regionId] // Convert single regionId to array as expected by API
        })) || []
      };

      let response;
      if (editingProduct) {
        // Update product
        const updateData: UpdateProductRequest = {
          name: productData.name,
          description: productData.description,
          basePrice: productData.basePrice,
          isActive: productData.isActive,
          kind: productData.kind,
          code: productData.code,
          photoUrl: productData.photoUrl,
          productTypeId: productData.productTypeId,
          categoryId: productData.categoryId,
          variations: productData.variations
        };
        response = await productsService.updateProduct(editingProduct.id, updateData);
      } else {
        // Create new product
        response = await productsService.createProduct(productData);
      }
      
      // Handle response based on success status
      if (response.success) {
        toast({
          title: "Success",
          description: response.message?.en || (editingProduct ? "Product updated successfully" : "Product created successfully"),
        });
        // Reload products after successful operation
        await loadProducts();
        handleDialogClose();
      } else {
        toast({
          title: "Error",
          description: response.message?.en || "Operation failed",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to save product',
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setActiveTab("basic");
    setSubcategories([]); // Clear subcategories when closing dialog
    form.reset({
      name: "",
      description: "",
      basePrice: 0,
      isActive: true,
      kind: "GIFTCARD",
      code: "",
      photoUrl: "",
      productTypeId: "",
      categoryId: "",
      variations: []
    });
  };

  const handleCreate = () => {
    setEditingProduct(null);
    form.reset({
      name: "",
      description: "",
      basePrice: 0,
      isActive: true,
      kind: "GIFTCARD",
      code: "",
      photoUrl: "",
      productTypeId: "",
      categoryId: "",
      variations: []
    });
    setIsDialogOpen(true);
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    
    // Load subcategories for the selected product type first
    if (product.productTypeId) {
      await loadSubcategories(product.productTypeId);
    }
    
    // Reset form with product data
    form.reset({
      name: product.name,
      description: product.description,
      basePrice: parseFloat(product.basePrice),
      isActive: product.isActive,
      kind: (product as Product & { kind?: "GIFTCARD" | "SERVICE" }).kind || "GIFTCARD",
      code: product.code || "",
      photoUrl: product.photoUrl || "",
      productTypeId: product.productTypeId.toString(),
      categoryId: product.categoryId.toString(),
      variations: product.variations.map(v => ({
        name: v.name,
        price: parseFloat(v.price),
        duration: v.duration,
        maxUsers: v.maxUsers,
        availableCount: v.availableCount || 0,
        isUnlimited: (v.availableCount || 0) === 0,
        regionId: v.regions && v.regions.length > 0 ? v.regions[0].regionId.toString() : ""
      }))
    });
    
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    setDeleting(true);
    try {
      const response = await productsService.deleteProduct(productToDelete.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
        await loadProducts();
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      } else {
        toast({
          title: "Error",
          description: response.message?.en || "Failed to delete product",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete product',
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
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
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) {
            handleDialogClose();
          }
        }}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-primary hover:opacity-90"
              onClick={handleCreate}
            >
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="variations">Variations</TabsTrigger>
                {/* <TabsTrigger value="codes">Codes & Options</TabsTrigger> */}
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Netflix Gift Card"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="kind"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Kind</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product kind" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="GIFTCARD">Gift Card</SelectItem>
                              <SelectItem value="SERVICE">Service</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Code (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., NETFLIX2024"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div></div> {/* Empty div to maintain grid layout */}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="productTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={categoriesLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select a category"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {parentCategories.map(category => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name} {category.children && category.children.length > 0 && `(${category.children.length} children)`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subcategory</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={!productTypeId || subcategories.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={
                                  !productTypeId 
                                    ? "Select a category first" 
                                    : subcategories.length === 0 
                                      ? "No subcategories available" 
                                      : "Select a subcategory"
                                } />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subcategories.map(category => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="basePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Price ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="photoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Photo URL (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Product description..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Status</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Whether this product is available for purchase
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="variations" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Product Variations</h3>
                        <p className="text-sm text-muted-foreground">
                          Add different pricing tiers and options for your product (optional)
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentVariations = form.getValues("variations") || [];
                          form.setValue("variations", [
                            ...currentVariations,
                            { name: "", price: 0, duration: 30, maxUsers: 1, availableCount: 0, isUnlimited: true, regionId: "" }
                          ]);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Variation
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {form.watch("variations")?.map((variation, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Variation {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentVariations = form.getValues("variations") || [];
                                const newVariations = currentVariations.filter((_, i) => i !== index);
                                form.setValue("variations", newVariations);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`variations.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Variation Name *</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., 1 Month - 1 User"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`variations.${index}.price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price ($) *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`variations.${index}.regionId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Region *</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    value={field.value}
                                    disabled={regionsLoading}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder={regionsLoading ? "Loading..." : "Select a region"} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {regions.map(region => (
                                        <SelectItem key={region.id} value={region.id.toString()}>
                                          {region.name} ({region.code})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`variations.${index}.duration`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duration (days)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="30"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`variations.${index}.maxUsers`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Max Users</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="1"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <FormField
                              control={form.control}
                              name={`variations.${index}.isUnlimited`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Unlimited Stock</FormLabel>
                                    <div className="text-sm text-muted-foreground">
                                      Enable for unlimited availability
                                    </div>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={(checked) => {
                                        field.onChange(checked);
                                        if (checked) {
                                          form.setValue(`variations.${index}.availableCount`, 0);
                                        }
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`variations.${index}.availableCount`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Available Count</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      {...field}
                                      disabled={form.watch(`variations.${index}.isUnlimited`)}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </Card>
                      ))}
                      
                      {(!form.watch("variations") || form.watch("variations").length === 0) && (
                        <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                          <h3 className="text-lg font-semibold mb-2">No Variations Added</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Add pricing variations to offer different options for your product.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              form.setValue("variations", [
                                { name: "", price: 0, duration: 30, maxUsers: 1, availableCount: 0, isUnlimited: true, regionId: "" }
                              ]);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Variation
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* <TabsContent value="codes" className="space-y-4">
                  <div className="text-center py-8">
                    <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Product codes and additional options will be managed here.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Configure product-specific settings and codes.
                    </p>
                  </div>
                </TabsContent> */}

                  <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                    <Button type="button" variant="outline" onClick={handleDialogClose} disabled={submitting}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-primary hover:opacity-90" disabled={submitting}>
                      {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {editingProduct ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading products...</span>
            </div>
          ) : (
            <>
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
                          <Package className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">{product.name}</div>
                            {/* <div className="text-sm text-muted-foreground">{product.description}</div> */}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            {product.productType.name}
                          </Badge>
                          {/* <div className="text-xs text-muted-foreground">
                            Type ID: {product.productTypeId}
                          </div> */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="secondary" className="text-xs">
                            {product.category.name}
                          </Badge>
                          {/* <div className="text-xs text-muted-foreground">
                            Category ID: {product.categoryId}
                          </div> */}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${parseFloat(product.basePrice).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.variations.length} variations</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Active" : "Inactive"}
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
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(product)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {products.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No products found. Create your first product to get started.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Delete Product
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the product <strong>"{productToDelete?.name}"</strong>? 
              This action cannot be undone and will also delete all variations.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setProductToDelete(null);
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}