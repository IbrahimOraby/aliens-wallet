import { useState } from "react";
import { useParams } from "react-router-dom";
import { Star, Shield, Clock, ArrowLeft, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { toast } from "@/hooks/use-toast";

const mockProduct = {
  id: "1",
  title: "ChatGPT Plus Premium Account",
  category: "AI Services",
  type: "Premium Accounts",
  basePrice: 20,
  originalPrice: 25,
  image: "/placeholder.svg",
  rating: 4.8,
  reviewCount: 156,
  description: "Get access to ChatGPT Plus with faster response times, priority access, and access to the latest features including GPT-4.",
  features: [
    "Access to GPT-4 model",
    "Faster response times",
    "Priority access during high traffic",
    "Access to newest features first",
    "24/7 customer support"
  ],
  specifications: {
    plan: {
      options: ["Basic", "Pro", "Enterprise"],
      prices: { "Basic": 20, "Pro": 35, "Enterprise": 60 }
    },
    duration: {
      options: ["1 Month", "3 Months", "12 Months"],
      multipliers: { "1 Month": 1, "3 Months": 2.8, "12 Months": 10 }
    },
    accountType: {
      options: ["New Account", "Upgrade Existing"],
      prices: { "New Account": 0, "Upgrade Existing": 5 }
    }
  },
  deliveryInfo: "Instant delivery via email within 5 minutes of payment confirmation.",
  reviews: [
    {
      id: 1,
      user: "John D.",
      rating: 5,
      comment: "Excellent service! Account was delivered instantly and works perfectly.",
      date: "2 days ago"
    },
    {
      id: 2,
      user: "Sarah M.",
      rating: 4,
      comment: "Great product, fast delivery. Minor delay but customer service was helpful.",
      date: "1 week ago"
    }
  ]
};

export default function ProductDetails() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [selectedSpecs, setSelectedSpecs] = useState({
    plan: "Basic",
    duration: "1 Month", 
    accountType: "New Account"
  });
  const [quantity, setQuantity] = useState(1);

  const calculatePrice = () => {
    const planPrice = mockProduct.specifications.plan.prices[selectedSpecs.plan as keyof typeof mockProduct.specifications.plan.prices];
    const durationMultiplier = mockProduct.specifications.duration.multipliers[selectedSpecs.duration as keyof typeof mockProduct.specifications.duration.multipliers];
    const accountTypePrice = mockProduct.specifications.accountType.prices[selectedSpecs.accountType as keyof typeof mockProduct.specifications.accountType.prices];
    
    return Math.round((planPrice + accountTypePrice) * durationMultiplier);
  };

  const handleAddToCart = () => {
    addItem({
      id: mockProduct.id,
      title: mockProduct.title,
      price: calculatePrice(),
      quantity,
      image: mockProduct.image,
      specifications: selectedSpecs,
    });
    
    toast({
      title: "Added to cart",
      description: `${mockProduct.title} has been added to your cart.`,
    });
  };

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
                <img src={mockProduct.image} alt={mockProduct.title} className="w-32 h-32 object-contain" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">{mockProduct.category}</Badge>
            <h1 className="text-3xl font-bold mb-4">{mockProduct.title}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-warning text-warning" />
                <span className="font-semibold">{mockProduct.rating}</span>
                <span className="text-muted-foreground">({mockProduct.reviewCount} reviews)</span>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">{mockProduct.description}</p>
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customize Your Order</h3>
            
            {/* Plan Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Plan</label>
              <Select value={selectedSpecs.plan} onValueChange={(value) => setSelectedSpecs({...selectedSpecs, plan: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockProduct.specifications.plan.options.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Duration</label>
              <Select value={selectedSpecs.duration} onValueChange={(value) => setSelectedSpecs({...selectedSpecs, duration: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockProduct.specifications.duration.options.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account Type Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Account Type</label>
              <Select value={selectedSpecs.accountType} onValueChange={(value) => setSelectedSpecs({...selectedSpecs, accountType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockProduct.specifications.accountType.options.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

          {/* Price and Add to Cart */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-2xl font-bold text-primary">${calculatePrice()}</span>
                {mockProduct.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through ml-2">
                    ${mockProduct.originalPrice}
                  </span>
                )}
              </div>
            </div>
            
            <Button 
              className="w-full bg-gradient-primary hover:opacity-90 mb-4" 
              size="lg"
              onClick={handleAddToCart}
            >
              Add to Cart - ${calculatePrice() * quantity}
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({mockProduct.reviews.length})</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                {mockProduct.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-6">
          <div className="space-y-4">
            {mockProduct.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{review.user}</span>
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="delivery" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
              <p className="text-muted-foreground">{mockProduct.deliveryInfo}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}