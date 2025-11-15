import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ordersService } from "@/services/orders";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, CheckoutFormData } from "@/schemas/order";
import type { CheckoutRequest } from "@/types/order";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Checkout() {
  const { 
    getDisplayItems, 
    getTotalAmount, 
    clearCart,
    hasServiceProducts,
    isLoading: cartLoading,
  } = useCart();
  const { isAuthenticated, openAuthModal, user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = getDisplayItems();
  const total = getTotalAmount();
  const hasServices = hasServiceProducts();

  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      serviceAccountType: "EXISTING",
      serviceAccountEmail: "",
      serviceAccountPassword: "",
    },
  });

  const serviceAccountType = watch("serviceAccountType") || "EXISTING";
  const customerNameValue = watch("customerName");
  const customerEmailValue = watch("customerEmail");
  const customerPhoneValue = watch("customerPhone");

  useEffect(() => {
    if (user) {
      if (user.name) {
        setValue("customerName", user.name, { shouldDirty: false });
      }
      if (user.email) {
        setValue("customerEmail", user.email, { shouldDirty: false });
        setValue("serviceAccountEmail", user.email, { shouldDirty: false });
      }
      if (user.phoneNumber) {
        setValue("customerPhone", user.phoneNumber, { shouldDirty: false });
      }
    }
  }, [user, setValue]);

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

    const trimmedName = typeof data.customerName === "string" ? data.customerName.trim() : "";
    const trimmedEmail = typeof data.customerEmail === "string" ? data.customerEmail.trim() : "";
    const trimmedPhone = typeof data.customerPhone === "string" ? data.customerPhone.trim() : "";

    const fallbackName = trimmedName || user?.name || "";
    const fallbackEmail = trimmedEmail || user?.email || "";

    if (!fallbackName || !fallbackEmail) {
      toast({
        title: "Contact details required",
        description: "Please make sure your name and email are filled in.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (!hasServices) {
        const minimalPayload: CheckoutRequest = {
          customerName: fallbackName,
          customerEmail: fallbackEmail,
        };

        if (trimmedPhone) {
          minimalPayload.customerPhone = trimmedPhone;
        }

        const response = await ordersService.checkout(minimalPayload);

        if (response.success) {
          await clearCart();
          navigate(`/store/order-confirmation/${response.data.orderNumber}`);
        }
      } else {
        const serviceEmail =
          (typeof data.serviceAccountEmail === "string" ? data.serviceAccountEmail.trim() : "") ||
          fallbackEmail;
        const servicePassword =
          typeof data.serviceAccountPassword === "string" ? data.serviceAccountPassword : undefined;
        const servicePreference = data.serviceAccountType;

        if (!servicePreference || !serviceEmail || !servicePassword) {
          setIsSubmitting(false);
          toast({
            title: "Service details required",
            description: "Please select account preference and provide the service email and password.",
            variant: "destructive",
          });
          return;
        }

        const checkoutPayload: CheckoutRequest = {
          customerName: fallbackName,
          customerEmail: serviceEmail,
          customerPassword: servicePassword,
        };

        if (trimmedPhone) {
          checkoutPayload.customerPhone = trimmedPhone;
        }

        const serviceItems = items
          .filter((item) => item.product.kind === "SERVICE")
          .map((item) => ({
            productName: item.product.name,
            variationName: item.variation.name,
            quantity: item.quantity,
          }));

        checkoutPayload.additionalInfo = {
          contactEmail: fallbackEmail,
          serviceAccount: {
            preference: servicePreference,
            email: serviceEmail,
          },
          serviceItems,
        };

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
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Full Name</Label>
                  <p className="font-medium">
                    {customerNameValue || user?.name || "Not available"}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">
                    {customerEmailValue || user?.email || "Not available"}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Phone</Label>
                  <p className="font-medium">
                    {customerPhoneValue || user?.phoneNumber || "Not provided"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    We’ll use this if we need to contact you about delivery or activation.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Hidden inputs to submit contact info */}
            <input
              type="hidden"
              {...register("customerName", {
                setValueAs: (value) => (typeof value === "string" ? value.trim() : value),
              })}
            />
            <input
              type="hidden"
              {...register("customerEmail", {
                setValueAs: (value) => (typeof value === "string" ? value.trim() : value),
              })}
            />
            <input
              type="hidden"
              {...register("customerPhone", {
                setValueAs: (value) => (typeof value === "string" ? value.trim() : value),
              })}
            />

            {hasServices && (
              <Card>
                <CardHeader>
                  <CardTitle>Service Account Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Provide the details we should use to activate your digital service. We only use this
                    information to complete your order.
                  </p>

                  <div className="space-y-3">
                    <Label>Account Preference</Label>
                    <input type="hidden" {...register("serviceAccountType")} />
                    <RadioGroup
                      value={serviceAccountType}
                      onValueChange={(value) =>
                        setValue("serviceAccountType", value as "EXISTING" | "NEW", { shouldDirty: true })
                      }
                      className="flex flex-col gap-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="EXISTING" id="service-existing" />
                        <Label htmlFor="service-existing" className="cursor-pointer">
                          Add service to my existing account
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NEW" id="service-new" />
                        <Label htmlFor="service-new" className="cursor-pointer">
                          Create a new account for me
                        </Label>
                      </div>
                    </RadioGroup>
                    {errors.serviceAccountType && (
                      <p className="text-sm text-destructive">{errors.serviceAccountType.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="serviceAccountEmail">Service Account Email</Label>
                    <Input
                      id="serviceAccountEmail"
                      type="email"
                      placeholder="service@example.com"
                      {...register("serviceAccountEmail", {
                        setValueAs: (value) => {
                          if (typeof value !== "string") return value;
                          const trimmed = value.trim();
                          return trimmed.length > 0 ? trimmed : undefined;
                        },
                      })}
                    />
                    {errors.serviceAccountEmail && (
                      <p className="text-sm text-destructive mt-1">{errors.serviceAccountEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="serviceAccountPassword">
                      {serviceAccountType === "NEW"
                        ? "Password for the new account"
                        : "Password for your existing account"}
                    </Label>
                    <Input
                      id="serviceAccountPassword"
                      type="password"
                      placeholder="Enter a secure password"
                      {...register("serviceAccountPassword", {
                        setValueAs: (value) => {
                          if (typeof value !== "string") return value;
                          const trimmed = value.trim();
                          return trimmed.length > 0 ? trimmed : undefined;
                        },
                      })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Our support team will use this to configure your service. You can update it again after
                      activation.
                    </p>
                    {errors.serviceAccountPassword && (
                      <p className="text-sm text-destructive mt-1">{errors.serviceAccountPassword.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

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