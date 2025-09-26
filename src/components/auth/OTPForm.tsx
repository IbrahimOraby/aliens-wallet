import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { OTPFormData } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";

interface OTPFormProps {
  onBack: () => void;
  userType: "ADMIN" | "CUSTOMER";
  onSubmit?: (data: OTPFormData) => void;
}

export function OTPForm({ onBack, userType }: OTPFormProps) {
  const { setLoading, setError, clearError, qrCodeUrl, manualKey } = useAuth();


  return (
    <Card className="w-full max-w-md mx-auto min-h-[400px] flex flex-col">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verify Your Identity</CardTitle>
        <CardDescription>
          Scan the QR code below with your authenticator app to set up
          two-factor authentication"
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        {userType === "ADMIN" && (
          <div className="mb-6 p-6 bg-muted rounded-lg text-center">
            <p className="text-sm font-medium text-foreground mb-4">
              Setup Two-Factor Authentication
            </p>
            {qrCodeUrl ? (
              <div className="space-y-4">
                <div className="w-48 h-48 bg-white border-2 border-muted-foreground/25 rounded-lg mx-auto flex items-center justify-center overflow-hidden shadow-sm">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code for 2FA Setup"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-foreground font-medium">
                    Scan this QR code with your authenticator app
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (Google Authenticator, Authy, or similar)
                  </p>
                </div>
                {manualKey && (
                  <div className="mt-4 p-3 bg-background rounded border text-left">
                    <p className="text-xs font-medium text-foreground mb-2">
                      Manual Setup Key:
                    </p>
                    <code className="text-xs font-mono break-all bg-muted px-2 py-1 rounded block">
                      {manualKey}
                    </code>
                    <p className="text-xs text-muted-foreground mt-2">
                      Use this key if you can't scan the QR code
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-48 h-48 bg-white border-2 border-dashed border-muted-foreground/25 rounded-lg mx-auto flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <span className="text-sm text-muted-foreground">
                    Loading QR Code...
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Once you've scanned the QR code with your authenticator app, click
              Proceed to continue with login
            </p>
          </div>

          <Button
            onClick={() => {
              // Navigate back to login form
              onBack();
            }}
            className="w-full"
            size="lg"
          >
            Proceed to Login
          </Button>
        </div>

        {/* <div className="mt-6 text-center">
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={onBack}
          >
            ← Back to {userType === "ADMIN" ? "Login" : "Signup"}
          </Button>
        </div> */}
      </CardContent>
    </Card>
  );
}
