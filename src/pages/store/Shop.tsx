import { useState, useEffect } from "react";
import { Filter, Grid, List, Search, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { categoriesService } from "@/services/categories";
import { productsService } from "@/services/products";
import { Category } from "@/types/category";
import { Product } from "@/types/product";

const productTypes = [
  "GIFTCARD",
  "SERVICE"
];

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Load parent categories and products on component mount
  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      // Load ALL categories first to find which ones have no parent (parent categories)
      const response = await categoriesService.getCategories({ offset: 0, limit: 1000 });
      const allCategories = response.data;
      
      // Filter categories that have NO parent (parentId is null) - these are our "Product Types"
      const parentCategoriesOnly = allCategories.filter(category => category.parentId === null);
      
      setCategories(parentCategoriesOnly);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      // Load only active products for the shop
      const response = await productsService.getActiveProducts(0, 1000);
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.productType.name);
    // Check if product has a kind field that matches the selected types
    const productKind = (product as Product & { kind?: "GIFTCARD" | "SERVICE" }).kind;
    const matchesType = selectedTypes.length === 0 || (productKind && selectedTypes.includes(productKind));
    const productPrice = parseFloat(product.basePrice);
    const matchesPrice = productPrice >= priceRange[0] && productPrice <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesType && matchesPrice;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5" />
              <h3 className="font-semibold">Filters</h3>
            </div>

            {/* Search */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">Categories</Label>
              <div className="space-y-2">
                {categoriesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading categories...</p>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No categories available</p>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.name}
                        checked={selectedCategories.includes(category.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category.name]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== category.name));
                          }
                        }}
                      />
                      <Label htmlFor={category.name} className="text-sm">{category.name}</Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Product Types */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">Product Type</Label>
              <div className="space-y-2">
                {productTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTypes([...selectedTypes, type]);
                        } else {
                          setSelectedTypes(selectedTypes.filter(t => t !== type));
                        }
                      }}
                    />
                    <Label htmlFor={type} className="text-sm">{type}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </Label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={500}
                step={10}
                className="w-full"
              />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Shop</h1>
              <p className="text-muted-foreground">{filteredProducts.length} products found</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mr-3" />
              <span className="text-lg">Loading products...</span>
            </div>
          ) : (
            <>
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-glow transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="relative">
                        <div className="aspect-video bg-gradient-card rounded-t-lg flex items-center justify-center overflow-hidden">
                          <img 
                            src={product.photoUrl || "/placeholder.svg"} 
                            alt={product.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {product.variations.length > 0 && (
                            <Badge className="bg-info text-info-foreground">
                              {product.variations.length} Options
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex gap-2 mb-2">
                          <Badge variant="secondary">{product.productType.name}</Badge>
                          <Badge variant="outline">{product.category.name}</Badge>
                        </div>
                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                          <Link to={`/store/product/${product.id}`}>{product.name}</Link>
                        </h3>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-primary">
                              ${parseFloat(product.basePrice).toFixed(2)}
                            </span>
                            {product.variations.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                starting at
                              </span>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-gradient-primary hover:opacity-90"
                            asChild
                          >
                            <Link to={`/store/product/${product.id}`}>
                              See Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredProducts.length === 0 && !productsLoading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products found matching your criteria.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}