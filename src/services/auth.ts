import {
  LoginFormData,
  SignupFormData,
  OTPFormData,
  AuthUser
} from "@/types/auth";

const API_BASE_URL = "http://46.101.174.239:8082/api";

export class AuthService {
  static async login(
    data: LoginFormData
  ): Promise<{ user: AuthUser; requiresOTP: boolean }> {
    const response = await fetch(`${API_BASE_URL}/users-auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message?.en || errorData.message || "Login failed"
      );
    }

    const result = await response.json();

    // Handle the actual API response format
    if (result.success && result.data) {
      const user = result.data.user;

      return {
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          userType: user.userType
        },
        requiresOTP: user.userType === "ADMIN" && user.twofaEnabled
      };
    }

    throw new Error("Invalid response format");
  }

  static async signup(
    data: SignupFormData
  ): Promise<{
    user: AuthUser;
    requiresOTP: boolean;
    qrCodeUrl?: string;
    manualKey?: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/users-auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message?.en || errorData.message || "Signup failed"
      );
    }

    const result = await response.json();
    console.log(result);

    // Handle the actual API response format
    if (result.success && result.data) {
      const user = result.data.user;
      const twofa = result.data.twofa;

      return {
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          userType: user.userType
        },
        requiresOTP: user.userType === "ADMIN" && user.twofaEnabled,
        qrCodeUrl: twofa?.qrDataUrl,
        manualKey: twofa?.manualKey
      };
    }

    throw new Error("Invalid response format");
  }


  static async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users-auth/logout`, {
      method: "POST"
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message?.en || errorData.message || "Logout failed"
      );
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message?.en || result.message || "Logout failed");
    }
  }

}
