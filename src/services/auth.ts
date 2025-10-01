import {
  LoginFormData,
  SignupFormData,
  OTPFormData,
  AuthUser
} from "@/types/auth";

const API_BASE_URL = "http://46.101.174.239:8082/api";

// Token management utilities
export const tokenManager = {
  setAdminToken: (token: string) => {
    sessionStorage.setItem('auth_token', token);
  },
  
  getAdminToken: (): string | null => {
    return sessionStorage.getItem('auth_token');
  },
  
  removeAdminToken: () => {
    sessionStorage.removeItem('auth_token');
  },
  
  isAdminTokenValid: (): boolean => {
    const token = sessionStorage.getItem('auth_token');
    if (!token) return false;
    
    try {
      // Decode JWT to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }
};

const keys: (keyof AuthUser)[] = [
  "id",
  "name",
  "email",
  "phoneNumber",
  "userType",
];

export const infoManager = {
  getAdminInfo: (): AuthUser | null => {
    const data: Partial<AuthUser> = {};
    for (const key of keys) {
      const value = sessionStorage.getItem(`admin_${key}`);
      if (!value) return null; // If any field is missing → consider not logged in
      if (key === "userType") {
        if (value !== "ADMIN" && value !== "CUSTOMER") return null; // invalid value
        data[key] = value as AuthUser["userType"];
      } else {
        data[key] = value as string;
      }    }
    return data as AuthUser;
  },

  setAdminInfo: (info: AuthUser) => {
    for (const key of keys) {
      sessionStorage.setItem(`admin_${key}`, info[key]);
    }
  },

  removeAdminInfo: () => {
    for (const key of keys) {
      sessionStorage.removeItem(`admin_${key}`);
    }
  },

  getCustomerInfo: (): AuthUser | null => {
    const data: Partial<AuthUser> = {};
    for (const key of keys) {
      const value = localStorage.getItem(`customer_${key}`);
      if (!value) return null; // If any field is missing → consider not logged in
      if (key === "userType") {
        if (value !== "ADMIN" && value !== "CUSTOMER") return null; // invalid value
        data[key] = value as AuthUser["userType"];
      } else {
        data[key] = value as string;
      }
    }
    return data as AuthUser;
  },

  setCustomerInfo: (info: AuthUser) => {
    for (const key of keys) {
      localStorage.setItem(`customer_${key}`, info[key]);
    }
  },

  removeCustomerInfo: () => {
    for (const key of keys) {
      localStorage.removeItem(`customer_${key}`);
    }
  },
};

export class AuthService {
  static async login(
    data: LoginFormData
  ): Promise<{ user: AuthUser; requiresOTP: boolean; token: string }> {
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
      const token = result.data.token;

      // Store token in sessionStorage
      tokenManager.setAdminToken(token);

      return {
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          userType: user.userType
        },
        requiresOTP: user.userType === "ADMIN" && user.twofaEnabled,
        token: token
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


  // Note: Logout is now handled client-side by clearing sessionStorage/localStorage
  // No API call needed for logout

}
