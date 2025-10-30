import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ordersService } from "@/services/orders";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, CheckoutFormData } from "@/schemas/order";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Checkout() {
  const { 
    getDisplayItems, 
    getTotalAmount, 
    clearCart,
    hasServiceProducts,
    isLoading: cartLoading,
  } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = getDisplayItems();
  const total = getTotalAmount();
  const hasServices = hasServiceProducts();

  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerPassword: "",
      additionalInfo: {},
    },
  });

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated && items.length > 0) {
      // Don't redirect, just show the login prompt
    }
  }, [isAuthenticated, items.length]);

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In to Complete Your Order</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to proceed with checkout.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => openAuthModal('login')}
              className="bg-gradient-primary hover:opacity-90"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => openAuthModal('signup')}
              variant="outline"
            >
              Sign Up
            </Button>
          </div>
          <Button variant="ghost" asChild className="mt-6">
            <Link to="/store/cart">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mr-3" />
          <span className="text-lg">Loading checkout...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Button asChild className="bg-gradient-primary hover:opacity-90">
            <Link to="/store/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutFormData) => {
    if (!agreeTerms) {
      toast({
        title: "Please accept terms",
        description: "You must agree to the terms and conditions to proceed.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // TEMPORARY FIX: If cart contains ONLY GIFTCARD products, send minimal payload
      // TODO: Remove this when backend is fixed
      if (!hasServices) {
        // Only GIFTCARD products - send minimal payload
        const minimalPayload = {
          customerName: data.customerName,
          customerEmail: data.customerEmail,
        };
        
        const response = await ordersService.checkout(minimalPayload as any);
        
        if (response.success) {
          await clearCart();
          navigate(`/store/order-confirmation/${response.data.orderNumber}`);
        }
      } else {
        // Has SERVICE products - send full payload
        const checkoutPayload: any = {
          customerName: data.customerName,
          customerEmail: data.customerEmail,
        };

        // Add optional fields
        if (data.customerPhone) {
          checkoutPayload.customerPhone = data.customerPhone;
        }

        // Check if any service item needs password (new account)
        const serviceItemsNeedingPassword = items.filter(
          item => item.product.kind === "SERVICE" && item.accountType === 'new'
        );

        if (serviceItemsNeedingPassword.length > 0 && data.customerPassword) {
          checkoutPayload.customerPassword = data.customerPassword;
        }

        // Add additionalInfo if there are service products
        if (hasServices) {
          const serviceAccountInfo: any = {};
          items.forEach((item, index) => {
            if (item.product.kind === "SERVICE") {
              serviceAccountInfo[`service_${index}`] = {
                productName: item.product.name,
                variationName: item.variation.name,
                accountType: item.accountType,
                email: item.email,
              };
            }
          });
          if (Object.keys(serviceAccountInfo).length > 0) {
            checkoutPayload.additionalInfo = serviceAccountInfo;
          }
        }

        const response = await ordersService.checkout(checkoutPayload);
        
        if (response.success) {
          await clearCart();
          navigate(`/store/order-confirmation/${response.data.orderNumber}`);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create order";
      toast({
        title: "Checkout failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/store/cart">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input
                    id="customerName"
                    {...register("customerName")}
                    placeholder="John Doe"
                  />
                  {errors.customerName && (
                    <p className="text-sm text-destructive mt-1">{errors.customerName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerEmail">Email Address</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    {...register("customerEmail")}
                    placeholder="your@email.com"
                  />
                  {errors.customerEmail && (
                    <p className="text-sm text-destructive mt-1">{errors.customerEmail.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerPhone">Phone Number (Optional)</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    {...register("customerPhone")}
                    placeholder="+1234567890"
                  />
                  {errors.customerPhone && (
                    <p className="text-sm text-destructive mt-1">{errors.customerPhone.message}</p>
                  )}
                </div>

                {/* Show password field only if there are service products with new accounts */}
                {hasServices && items.some(item => 
                  item.product.kind === "SERVICE" && item.accountType === 'new'
                ) && (
                  <div>
                    <Label htmlFor="customerPassword">Password for New Accounts (Optional)</Label>
                    <Input
                      id="customerPassword"
                      type="password"
                      {...register("customerPassword")}
                      placeholder="Choose a password"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This password will be used for new service accounts if applicable.
                    </p>
                    {errors.customerPassword && (
                      <p className="text-sm text-destructive mt-1">{errors.customerPassword.message}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Terms */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(!!checked)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <Link to="/store/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/store/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.variationId}`} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-muted-foreground">{item.variation.name}</div>
                        <div className="text-muted-foreground">Qty: {item.quantity}</div>
                        {item.product.kind === "SERVICE" && item.email && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Account: {item.email}
                          </div>
                        )}
                      </div>
                      <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold mt-2">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Complete Order
                    </>
                  )}
                </Button>
                
                <div className="text-xs text-center text-muted-foreground">
                  Your payment information is secure and encrypted
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}