import { useState } from "react";
import { Filter, Grid, List, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";

const categories = [
  "Gaming",
  "Streaming", 
  "Software",
  "AI Services",
  "Gift Cards",
  "Subscriptions"
];

const productTypes = [
  "Gift Cards",
  "Premium Accounts",
  "Software Licenses",
  "Subscriptions"
];

const mockProducts = [
  {
    id: "1",
    title: "Steam Gift Card",
    category: "Gaming",
    type: "Gift Cards",
    price: 25,
    originalPrice: 30,
    image: "/placeholder.svg",
    rating: 4.9,
    reviews: 120,
    isPopular: true,
  },
  {
    id: "2", 
    title: "ChatGPT Plus Account",
    category: "AI Services",
    type: "Premium Accounts",
    price: 18,
    originalPrice: 20,
    image: "/placeholder.svg",
    rating: 4.8,
    reviews: 85,
    isNew: true,
  },
  {
    id: "3",
    title: "Netflix Premium",
    category: "Streaming",
    type: "Premium Accounts", 
    price: 12,
    originalPrice: 15,
    image: "/placeholder.svg",
    rating: 4.7,
    reviews: 65,
  },
  {
    id: "4",
    title: "Microsoft Office 365",
    category: "Software",
    type: "Software Licenses",
    price: 45,
    originalPrice: 60,
    image: "/placeholder.svg",
    rating: 4.9,
    reviews: 95,
    isPopular: true,
  },
  {
    id: "5",
    title: "PlayStation Gift Card",
    category: "Gaming", 
    type: "Gift Cards",
    price: 50,
    originalPrice: 55,
    image: "/placeholder.svg",
    rating: 4.8,
    reviews: 110,
  },
  {
    id: "6",
    title: "Spotify Premium",
    category: "Streaming",
    type: "Subscriptions",
    price: 8,
    originalPrice: 10,
    image: "/placeholder.svg",
    rating: 4.6,
    reviews: 75,
  },
];

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { addItem } = useCart();

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(product.type);
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesType && matchesPrice;
  });

  const handleAddToCart = (product: typeof mockProducts[0]) => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
  };

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
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories([...selectedCategories, category]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c !== category));
                        }
                      }}
                    />
                    <Label htmlFor={category} className="text-sm">{category}</Label>
                  </div>
                ))}
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
                max={100}
                step={5}
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
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-glow transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="aspect-video bg-gradient-card rounded-t-lg flex items-center justify-center">
                      <img src={product.image} alt={product.title} className="w-20 h-20 object-contain" />
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {product.isPopular && (
                        <Badge className="bg-warning text-warning-foreground">Popular</Badge>
                      )}
                      {product.isNew && (
                        <Badge className="bg-info text-info-foreground">New</Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      <Link to={`/store/product/${product.id}`}>{product.title}</Link>
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-gradient-primary hover:opacity-90"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}