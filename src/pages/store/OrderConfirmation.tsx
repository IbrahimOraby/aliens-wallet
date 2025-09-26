import { useParams, Link } from "react-router-dom";
import { CheckCircle, Download, Mail, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const mockOrderData = {
  orderNumber: "ORD-123456789",
  email: "customer@example.com",
  date: new Date().toLocaleDateString(),
  items: [
    {
      id: "1",
      title: "ChatGPT Plus Premium Account",
      specifications: { plan: "Pro", duration: "3 Months", accountType: "New Account" },
      quantity: 1,
      price: 105,
      giftCode: "CHATGPT-XXXX-XXXX-XXXX",
      accountDetails: {
        email: "generated@account.com",
        password: "SecurePass123!"
      }
    }
  ],
  total: 105,
};

export default function OrderConfirmation() {
  const { orderNumber } = useParams();

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${description} copied to clipboard`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your digital products are ready below.
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order #{orderNumber}</span>
              <Badge className="bg-success text-success-foreground">Completed</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Order Date:</span>
                <div className="font-medium">{mockOrderData.date}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <div className="font-medium">{mockOrderData.email}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span>
                <div className="font-medium text-primary">${mockOrderData.total}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Digital Products */}
        <div className="space-y-4">
          {mockOrderData.items.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                {item.specifications && (
                  <div className="flex gap-2">
                    {Object.entries(item.specifications).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Gift Code (for gift cards) */}
                {item.giftCode && (
                  <div className="p-4 bg-card border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Gift Card Code:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(item.giftCode!, "Gift card code")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="font-mono text-lg bg-background p-3 rounded border">
                      {item.giftCode}
                    </div>
                  </div>
                )}

                {/* Account Details (for premium accounts) */}
                {item.accountDetails && (
                  <div className="p-4 bg-card border rounded-lg">
                    <h4 className="font-medium mb-3">Account Details:</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-muted-foreground">Email:</span>
                          <div className="font-mono text-sm">{item.accountDetails.email}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.accountDetails!.email, "Email")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-muted-foreground">Password:</span>
                          <div className="font-mono text-sm">{item.accountDetails.password}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.accountDetails!.password, "Password")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">What's Next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Your digital products are delivered instantly above</li>
              <li>• A confirmation email has been sent to your email address</li>
              <li>• For gift cards, redeem the code on the respective platform</li>
              <li>• For accounts, use the provided credentials to log in</li>
              <li>• Contact support if you encounter any issues</li>
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button asChild className="bg-gradient-primary hover:opacity-90">
            <Link to="/store/shop">Continue Shopping</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/store">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}