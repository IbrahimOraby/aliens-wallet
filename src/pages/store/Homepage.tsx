import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const featuredCategories = [
  {
    id: "1",
    title: "Gaming",
    description: "Steam, PlayStation, Xbox gift cards",
    image: "/placeholder.svg",
    count: 15,
  },
  {
    id: "2", 
    title: "Streaming",
    description: "Netflix, Spotify, Disney+ accounts",
    image: "/placeholder.svg",
    count: 12,
  },
  {
    id: "3",
    title: "Software",
    description: "Microsoft Office, Adobe, Antivirus",
    image: "/placeholder.svg",
    count: 8,
  },
  {
    id: "4",
    title: "AI Services",
    description: "ChatGPT Plus, Claude Pro, Midjourney",
    image: "/placeholder.svg",
    count: 6,
  },
];

const bestSellers = [
  {
    id: "1",
    title: "Steam Gift Card",
    category: "Gaming",
    price: 25,
    originalPrice: 30,
    image: "/placeholder.svg",
    rating: 4.9,
    sales: 1200,
  },
  {
    id: "2",
    title: "ChatGPT Plus Account",
    category: "AI Services",
    price: 18,
    originalPrice: 20,
    image: "/placeholder.svg",
    rating: 4.8,
    sales: 850,
  },
  {
    id: "3",
    title: "Netflix Premium",
    category: "Streaming",
    price: 12,
    originalPrice: 15,
    image: "/placeholder.svg",
    rating: 4.7,
    sales: 650,
  },
];

const valueProps = [
  {
    icon: Zap,
    title: "Instant Delivery",
    description: "Get your digital products delivered instantly after payment",
  },
  {
    icon: Shield,
    title: "100% Secure",
    description: "All purchases are protected with our secure payment system",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock customer support for any issues",
  },
];

export default function Homepage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-card to-background">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Premium Digital
              </span>
              <br />
              Services & Gift Cards
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover the world's largest marketplace for instant digital delivery. 
              Get your favorite gift cards and premium accounts delivered in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90">
                <Link to="/store/shop">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/store/categories">Browse Categories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Popular Categories</h2>
          <p className="text-muted-foreground">Explore our most popular digital service categories</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCategories.map((category) => (
            <Link key={category.id} to={`/store/shop?category=${category.title.toLowerCase()}`}>
              <Card className="group hover:shadow-glow transition-all duration-300 border-border/50 hover:border-primary/50">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <img src={category.image} alt={category.title} className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                  <Badge variant="secondary">{category.count} products</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}  
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Best Sellers</h2>
          <p className="text-muted-foreground">Most popular products loved by our customers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestSellers.map((product) => (
            <Link key={product.id} to={`/store/product/${product.id}`}>
              <Card className="group hover:shadow-glow transition-all duration-300">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-card rounded-t-lg flex items-center justify-center mb-4">
                    <img src={product.image} alt={product.title} className="w-20 h-20 object-contain" />
                  </div>
                  <div className="p-6 pt-0">
                    <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">({product.sales} sold)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">${product.price}</span>
                        <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                      </div>
                      <Button size="sm" className="bg-gradient-primary hover:opacity-90">
                        Quick Buy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-card/50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-muted-foreground">Experience the difference with our premium service</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valueProps.map((prop, index) => {
              const Icon = prop.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{prop.title}</h3>
                  <p className="text-muted-foreground">{prop.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}