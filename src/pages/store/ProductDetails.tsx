import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, Shield, Clock, ArrowLeft, Plus, Minus, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { productsService } from "@/services/products";
import { Product } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


export default function ProductDetails() {
  const { id } = useParams();
  const { addItemToCart, isLoading } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [selectedVariationName, setSelectedVariationName] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  // Service product account setup
  const [accountType, setAccountType] = useState<'existing' | 'new'>('existing');
  const [serviceEmail, setServiceEmail] = useState("");
  const [servicePassword, setServicePassword] = useState("");

  // Load product data on component mount
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await productsService.getProductById(Number(id));
        
        if (response.success) {
          setProduct(response.data);
        } else {
          setError("Failed to load product");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Get unique regions from all variations
  const getAvailableRegions = () => {
    if (!product) return [];
    const regionsSet = new Set<string>();
    product.variations.forEach(variation => {
      if (variation.regions && variation.regions.length > 0) {
        variation.regions.forEach(r => {
          regionsSet.add(JSON.stringify({ id: r.regionId, name: r.region.name }));
        });
      }
    });
    return Array.from(regionsSet).map(r => JSON.parse(r));
  };

  // Get available durations based on selected region and type
  const getAvailableDurations = () => {
    if (!product || !selectedRegion || !selectedVariationName) return [];
    const durationsSet = new Set<number>();
    product.variations.forEach(variation => {
      const hasRegion = variation.regions?.some(r => r.regionId.toString() === selectedRegion);
      const hasName = variation.name === selectedVariationName;
      if (hasRegion && hasName && variation.duration) {
        durationsSet.add(variation.duration);
      }
    });
    return Array.from(durationsSet).sort((a, b) => a - b);
  };

  // Get available variation names based on selected region
  const getAvailableVariationNames = () => {
    if (!product || !selectedRegion) return [];
    const variations = product.variations.filter(variation =>
      variation.regions?.some(r => r.regionId.toString() === selectedRegion)
    );

    const uniqueNames = new Map<string, { id: string; name: string }>();
    variations.forEach(variation => {
      if (!uniqueNames.has(variation.name)) {
        uniqueNames.set(variation.name, { id: variation.name, name: variation.name });
      }
    });

    return Array.from(uniqueNames.values());
  };

  // Find matching variation based on all selections
  const selectedVariation = product?.variations.find(v => {
    const hasRegion = v.regions?.some(r => r.regionId.toString() === selectedRegion);
    const hasDuration = v.duration?.toString() === selectedDuration;
    const hasName = v.name === selectedVariationName;
    return hasRegion && hasDuration && hasName;
  });
  
  const calculatePrice = () => {
    if (!selectedVariation) return 0;
    return parseFloat(selectedVariation.price);
  };

  const handleAddToCart = async () => {
    if (!product || !selectedVariation) return;
    
    // Validate SERVICE product account info
    if (product.kind === "SERVICE") {
      if (!serviceEmail || !servicePassword) {
        toast({
          title: "Account information required",
          description: "Please provide email and password for the service account.",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      await addItemToCart(
        selectedVariation.id,
        quantity,
        {
          productId: product.id,
          productName: product.name,
          productKind: product.kind,
          variationName: selectedVariation.name,
          price: calculatePrice(),
          photoUrl: product.photoUrl || undefined,
          accountType: product.kind === "SERVICE" ? accountType : undefined,
          email: product.kind === "SERVICE" ? serviceEmail : undefined,
          password: product.kind === "SERVICE" ? servicePassword : undefined,
        }
      );
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
      
      // Reset service account fields
      if (product.kind === "SERVICE") {
        setServiceEmail("");
        setServicePassword("");
        setAccountType('existing');
      }
    } catch (err) {
      toast({
        title: "Failed to add to cart",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Loading product...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Product not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/store/shop">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Product Image */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-8">
              <div className="aspect-square bg-gradient-card rounded-lg flex items-center justify-center">
                <img 
                  src={product.photoUrl || "/placeholder.svg"} 
                  alt={product.name} 
                  className="w-32 h-32 object-contain" 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">{product.category.name}</Badge>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="outline">{product.productType.name}</Badge>
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? "Available" : "Unavailable"}
              </Badge>
            </div>

            <p className="text-muted-foreground mb-6">{product.description}</p>
          </div>

          {/* Variation Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Your Options</h3>
            
            {product.variations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Region Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Region</label>
                  <Select
                    value={selectedRegion}
                    onValueChange={(value) => {
                      setSelectedRegion(value);
                      setSelectedVariationName("");
                      setSelectedDuration("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableRegions().map((region) => (
                        <SelectItem key={region.id} value={region.id.toString()}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Variation Name Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select
                    value={selectedVariationName}
                    onValueChange={(value) => {
                      setSelectedVariationName(value);
                      setSelectedDuration("");
                    }}
                    disabled={!selectedRegion}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedRegion ? "Select type" : "Select region first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableVariationNames().map((variation) => (
                        <SelectItem key={variation.id} value={variation.id}>
                          {variation.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Duration</label>
                  <Select
                    value={selectedDuration}
                    onValueChange={setSelectedDuration}
                    disabled={!selectedRegion || !selectedVariationName}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedVariationName ? "Select duration" : "Select type first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDurations().map((duration) => (
                        <SelectItem key={duration} value={duration.toString()}>
                          {duration} days
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No variations available for this product.
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="text-sm font-medium mb-2 block">Quantity</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Service Product Account Setup */}
          {product.kind === "SERVICE" && selectedVariation && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">Account Information</h3>
              <p className="text-sm text-muted-foreground">
                Do you have an existing account or want to create a new one?
              </p>
              
              <RadioGroup value={accountType} onValueChange={(value) => setAccountType(value as 'existing' | 'new')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="existing" />
                  <Label htmlFor="existing" className="cursor-pointer">Existing Account</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="new" />
                  <Label htmlFor="new" className="cursor-pointer">Create New Account</Label>
                </div>
              </RadioGroup>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="serviceEmail">Email</Label>
                  <Input
                    id="serviceEmail"
                    type="email"
                    placeholder="account@example.com"
                    value={serviceEmail}
                    onChange={(e) => setServiceEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="servicePassword">Password</Label>
                  <Input
                    id="servicePassword"
                    type="password"
                    placeholder={accountType === 'existing' ? "Your existing password" : "Choose a password"}
                    value={servicePassword}
                    onChange={(e) => setServicePassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Price and Add to Cart */}
          <div className="border-t pt-6">
            {selectedVariation ? (
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-2xl font-bold text-primary">
                    ${calculatePrice().toFixed(2)}
                  </span>
                  <div className="text-sm text-muted-foreground mt-1">
                    {selectedVariation.duration && `${selectedVariation.duration} days`}
                    {selectedVariation.maxUsers && ` • Max ${selectedVariation.maxUsers} user${selectedVariation.maxUsers > 1 ? 's' : ''}`}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center mb-4 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Select your options to see the price</p>
              </div>
            )}
            
            <Button 
              className="w-full bg-gradient-primary hover:opacity-90 mb-4" 
              size="lg"
              onClick={handleAddToCart}
              disabled={
                !selectedVariation || 
                !product.isActive || 
                !selectedRegion || 
                !selectedDuration || 
                !selectedVariationName ||
                isLoading ||
                (product.kind === "SERVICE" && (!serviceEmail || !servicePassword))
              }
            >
              {isLoading
                ? 'Adding to cart...'
                : !product.isActive 
                  ? 'Product Unavailable' 
                  : !selectedVariation 
                    ? 'Select Options First'
                    : product.kind === "SERVICE" && (!serviceEmail || !servicePassword)
                      ? 'Enter Account Information'
                      : `Add to Cart - $${(calculatePrice() * quantity).toFixed(2)}`
              }
            </Button>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Instant Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="variations">Available Variations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Product Details</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Category</h4>
                  <p className="text-muted-foreground">{product.category.name}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Type</h4>
                  <p className="text-muted-foreground">{product.kind}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Base Price</h4>
                  <p className="text-muted-foreground">${parseFloat(product.basePrice).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="variations" className="mt-6">
          <div className="space-y-4">
            {product.variations.map((variation) => (
              <Card key={variation.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{variation.name}</h4>
                      <p className="text-2xl font-bold text-primary">${parseFloat(variation.price).toFixed(2)}</p>
                    </div>
                    <Badge variant="outline">
                      {variation.regions && variation.regions.length > 0 
                        ? variation.regions[0].region.name 
                        : 'No region specified'
                      }
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {variation.duration && (
                      <div>
                        <span className="font-medium">Duration:</span>
                        <p className="text-muted-foreground">{variation.duration} days</p>
                      </div>
                    )}
                    {variation.maxUsers && (
                      <div>
                        <span className="font-medium">Max Users:</span>
                        <p className="text-muted-foreground">{variation.maxUsers}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Available Count:</span>
                      <p className="text-muted-foreground">
                        {variation.availableCount === 0 ? 'Unlimited' : variation.availableCount}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <p className="text-muted-foreground">
                        {variation.availableCount === 0 || variation.availableCount > 0 ? 'Available' : 'Out of Stock'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {product.variations.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No variations available for this product.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}