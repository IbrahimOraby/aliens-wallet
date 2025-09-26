export interface LoginFormData {
  email: string;
  password: string;
  totp?: string; // Only for admin
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  userType: 'ADMIN' | 'CUSTOMER';
}

export interface OTPFormData {
  otp: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  userType: 'ADMIN' | 'CUSTOMER';
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type AuthModalMode = 'login' | 'signup' | 'otp';
