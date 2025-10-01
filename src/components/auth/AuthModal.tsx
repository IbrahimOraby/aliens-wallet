import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { OTPForm } from "./OTPForm";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModalMode, OTPFormData } from "@/types/auth";
import { useState } from "react";

export function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, error, clearError } =
    useAuth();

  const [currentMode, setCurrentMode] = useState<AuthModalMode>("login");
  const [userType, setUserType] = useState<"ADMIN" | "CUSTOMER">("CUSTOMER");

  const handleModeChange = (mode: AuthModalMode) => {
    setCurrentMode(mode);
    clearError();
  };

  const handleSwitchToOTP = (adminUserType?: "ADMIN" | "CUSTOMER") => {
    if (adminUserType) {
      setUserType(adminUserType);
    }
    setCurrentMode("otp");
  };

  const handleBack = () => {
    if (currentMode === "otp") {
      // Both admin and customer users go to login after OTP setup
      setCurrentMode("login");
    } else {
      setCurrentMode("login");
    }
  };

  const handleSignupUserTypeChange = (type: "ADMIN" | "CUSTOMER") => {
    setUserType(type);
  };

  const handleOTPSubmit = async (data: OTPFormData) => {
    try {
      // TODO: Handle customer OTP verification
      console.log("Customer OTP verification:", data);
    } catch (error) {
      console.error("OTP verification failed:", error);
    }
  };

  const renderForm = () => {
    switch (currentMode) {
      case "login":
        return (
          <LoginForm
            onSwitchToSignup={() => handleModeChange("signup")}
            onSwitchToOTP={handleSwitchToOTP}
          />
        );
      case "signup":
        return (
          <SignupForm
            onSwitchToLogin={() => handleModeChange("login")}
            onSwitchToOTP={handleSwitchToOTP}
          />
        );
      case "otp":
        return (
          <OTPForm
            onBack={handleBack}
            userType={userType}
            onSubmit={userType === "CUSTOMER" ? handleOTPSubmit : undefined}
          />
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (currentMode) {
      case "login":
        return "Sign In";
      case "signup":
        return "Create Account";
      case "otp":
        return "Verify Identity";
      default:
        return "Authentication";
    }
  };

  return (
    <Dialog 
      open={authModalOpen} 
      onOpenChange={(open) => {
        // Prevent closing if in OTP mode for ADMIN users
        if (!open && currentMode === "otp" && userType === "ADMIN") {
          return;
        }
        closeAuthModal();
      }}
    >
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-end mb-4">
          {/* <h2 className="text-lg font-semibold">{getModalTitle()}</h2> */}
          {/* Only show close button if not in OTP mode for ADMIN users */}
          {!(currentMode === "otp" && userType === "ADMIN") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={closeAuthModal}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* TODO: Add error message in toast*/}
        {/* {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )} */}

        <div className="flex items-center justify-center">{renderForm()}</div>
      </DialogContent>
    </Dialog>
  );
}
