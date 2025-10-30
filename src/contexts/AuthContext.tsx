import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AuthState, AuthUser, AuthModalMode } from '@/types/auth';
import { tokenManager, infoManager } from '@/services/auth';

interface AuthContextType extends AuthState {
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  authModalOpen: boolean;
  authModalMode: AuthModalMode;
  qrCodeUrl: string | null;
  manualKey: string | null;
  setQRCode: (qrCodeUrl: string | null, manualKey?: string | null) => void;
  logout: () => void;
}

type AuthAction =
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'OPEN_AUTH_MODAL'; payload: AuthModalMode }
  | { type: 'CLOSE_AUTH_MODAL' }
  | { type: 'SET_QR_CODE'; payload: { qrCodeUrl: string | null; manualKey?: string | null } }
  | { type: 'LOGOUT' };

const initialState: AuthState & { authModalOpen: boolean; authModalMode: AuthModalMode; qrCodeUrl: string | null; manualKey: string | null } = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to prevent premature redirects
  error: null,
  authModalOpen: false,
  authModalMode: 'login',
  qrCodeUrl: null,
  manualKey: null,
};

function authReducer(
  state: typeof initialState,
  action: AuthAction
): typeof initialState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false, // Set loading to false when user is set
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'OPEN_AUTH_MODAL':
      return {
        ...state,
        authModalOpen: true,
        authModalMode: action.payload,
        error: null,
      };
    case 'CLOSE_AUTH_MODAL':
      return {
        ...state,
        authModalOpen: false,
        error: null,
        qrCodeUrl: null,
        manualKey: null,
      };
    case 'SET_QR_CODE':
      return {
        ...state,
        qrCodeUrl: action.payload.qrCodeUrl,
        manualKey: action.payload.manualKey || null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null,
        qrCodeUrl: null,
        manualKey: null,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const openAuthModal = (mode: AuthModalMode = 'login') => {
    dispatch({ type: 'OPEN_AUTH_MODAL', payload: mode });
  };

  const closeAuthModal = () => {
    dispatch({ type: 'CLOSE_AUTH_MODAL' });
  };

  const setUser = (user: AuthUser | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setQRCode = (qrCodeUrl: string | null, manualKey?: string | null) => {
    dispatch({ type: 'SET_QR_CODE', payload: { qrCodeUrl, manualKey } });
  };

  const logout = () => {
    console.log('🚪 Logging out user:', state.user);
    
    // Clear data based on user type
    if (state.user?.userType === 'ADMIN') {
      // Clear admin data (sessionStorage)
      console.log('🧹 Clearing admin sessionStorage data');
      tokenManager.removeAdminToken();
      infoManager.removeAdminInfo();
    } else if (state.user?.userType === 'CUSTOMER') {
      // Clear customer data (localStorage)
      console.log('🧹 Clearing customer localStorage data');
      tokenManager.removeCustomerToken();
      infoManager.removeCustomerInfo();
    } else {
      // Clear both if user type is unknown (safety measure)
      console.log('🧹 Clearing all data (unknown user type)');
      tokenManager.removeAdminToken();
      tokenManager.removeCustomerToken();
      infoManager.removeAdminInfo();
      infoManager.removeCustomerInfo();
    }
    
    dispatch({ type: 'LOGOUT' });
  };

  // Initialize authentication state from localStorage/sessionStorage
  useEffect(() => {
    console.log('🔍 Initializing auth state...');
    
    // Check for admin user first (sessionStorage)
    const adminToken = tokenManager.getAdminToken();
    console.log('🔑 Auth token (auth_token) exists:', !!adminToken);
    
    if (adminToken && tokenManager.isAdminTokenValid()) {
      const adminInfo = infoManager.getAdminInfo();
      console.log('👤 Admin info found:', adminInfo);
      if (adminInfo) {
        dispatch({ type: 'SET_USER', payload: adminInfo });
        return;
      } else {
        // Token exists but no user info, clean up
        console.log('🧹 Cleaning up invalid admin data');
        tokenManager.removeAdminToken();
        infoManager.removeAdminInfo();
      }
    } else if (adminToken) {
      // Token exists but is invalid, clean up
      console.log('🧹 Cleaning up invalid admin token');
      tokenManager.removeAdminToken();
      infoManager.removeAdminInfo();
    }

    // Check for customer user (localStorage)
    const customerToken = tokenManager.getCustomerToken();
    const customerInfo = infoManager.getCustomerInfo();
    console.log('🔑 Customer token exists:', !!customerToken);
    console.log('👤 Customer info found:', customerInfo);
    if (customerInfo && customerToken) {
      dispatch({ type: 'SET_USER', payload: customerInfo });
    } else if (customerInfo && !customerToken) {
      // Customer info exists but no token, clean up
      console.log('🧹 Cleaning up customer data (no token)');
      infoManager.removeCustomerInfo();
      dispatch({ type: 'SET_LOADING', payload: false });
    } else {
      // If no user found, set loading to false
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    openAuthModal,
    closeAuthModal,
    setUser,
    setLoading,
    setError,
    clearError,
    setQRCode,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
