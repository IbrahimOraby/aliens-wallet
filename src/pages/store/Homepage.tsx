import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, Clock, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { categoriesService } from "@/services/categories";
import { productsService } from "@/services/products";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/useCart";

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


const heroSlides = [
  {
    id: 1,
    title: "Premium Digital Services & Gift Cards",
    subtitle: "Gaming & Entertainment",
    description: "Discover the world's largest marketplace for instant digital delivery. Get your favorite gaming gift cards and premium accounts delivered in seconds.",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80",
    buttonText: "Shop Gaming",
    buttonLink: "/store/shop?category=gaming"
  },
  {
    id: 2,
    title: "Streaming & Entertainment",
    subtitle: "Netflix, Spotify, Disney+",
    description: "Access premium streaming services and entertainment platforms. Enjoy unlimited content with our instant delivery service.",
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80",
    buttonText: "Browse Streaming",
    buttonLink: "/store/shop?category=streaming"
  },
  {
    id: 3,
    title: "AI & Software Services",
    subtitle: "ChatGPT, Adobe, Microsoft",
    description: "Unlock the power of AI and professional software tools. Get instant access to the latest digital services and applications.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    buttonText: "Explore AI Services",
    buttonLink: "/store/shop?category=ai"
  }
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productCounts, setProductCounts] = useState<Record<number, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const { addItem } = useCart();

  // Load parent categories and products on component mount
  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  // Load product counts when categories change
  useEffect(() => {
    if (categories.length > 0) {
      loadProductCounts();
    }
  }, [categories]); // eslint-disable-line react-hooks/exhaustive-deps

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
      // Load only active products for the homepage
      const response = await productsService.getActiveProducts(0, 3); // Limit to 3 products for best sellers
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadProductCounts = async () => {
    try {
      const counts: Record<number, number> = {};
      
      // Load all products to count usage
      const productsResponse = await productsService.getProducts({ offset: 0, limit: 1000 });
      const products = productsResponse.data;
      
      // Count products that use each category as either productTypeId or categoryId
      categories.forEach(category => {
        const count = products.filter(product => 
          product.productTypeId === category.id || product.categoryId === category.id
        ).length;
        counts[category.id] = count;
      });
      
      setProductCounts(counts);
    } catch (err) {
      console.error('Failed to load product counts:', err);
      // Don't show error to user, just keep counts at 0
    }
  };

  const getProductCountText = (categoryId: number) => {
    const count = productCounts[categoryId] || 0;
    if (count === 0) return "0 products";
    if (count === 1) return "1 product";
    return `${count} products`;
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id.toString(),
      title: product.name,
      price: parseFloat(product.basePrice),
      quantity: 1,
      image: product.photoUrl || "/placeholder.svg",
    });
  };

  return (
    <div className="space-y-16">
      {/* Hero Carousel */}
      <section className="relative w-full h-[80vh] min-h-[600px] overflow-hidden">
        <Carousel 
          className="w-full h-full" 
          opts={{ 
            loop: true, 
            align: "center",
            containScroll: "trimSnaps"
          }}
        >
          <CarouselContent className="h-full">
            {heroSlides.map((slide) => (
              <CarouselItem key={slide.id} className="h-full pl-0">
                <div 
                  className="relative h-full w-full bg-cover bg-center bg-no-repeat"
                  style={{ 
                    backgroundImage: `url(${slide.image})`,
                    minHeight: '600px',
                    height: '100%'
                  }}
                >
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/40" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="container mx-auto px-4 text-center text-white">
                      <div className="max-w-4xl mx-auto">
                        <Badge variant="secondary" className="mb-4 text-sm">
                          {slide.subtitle}
                        </Badge>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                          {slide.title}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                          {slide.description}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90">
                            <Link to={slide.buttonLink}>
                              {slide.buttonText} <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                            <Link to="/store/shop">Browse All Products</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 z-10" />
          <CarouselNext className="right-4 z-10" />
        </Carousel>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Popular Categories</h2>
          <p className="text-muted-foreground">Explore our most popular digital service categories</p>
        </div>
        
        {categoriesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span className="text-lg">Loading categories...</span>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {categories.map((category) => (
              <Link key={category.id} to={`/store/shop?category=${category.name.toLowerCase()}`} className="w-full sm:w-auto sm:min-w-[280px] sm:max-w-[320px]">
                <Card className="group hover:shadow-glow transition-all duration-300 border-border/50 hover:border-primary/50 h-full">
                  <CardContent className="p-6 text-center h-full flex flex-col justify-between">
                    <div>
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {category.slug ? category.slug.replace(/-/g, ' ') : 'Digital Services'}
                      </p>
                    </div>
                    <Badge variant="secondary" className="mt-auto mx-auto">{getProductCountText(category.id)}</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Best Sellers */}  
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Best Sellers</h2>
          <p className="text-muted-foreground">Most popular products loved by our customers</p>
        </div>

        {productsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span className="text-lg">Loading products...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {products.map((product) => (
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
        )}

        {products.length === 0 && !productsLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products available at the moment.</p>
          </div>
        )}
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