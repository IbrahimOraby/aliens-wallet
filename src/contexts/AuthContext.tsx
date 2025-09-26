import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AuthState, AuthUser, AuthModalMode } from '@/types/auth';

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
}

type AuthAction =
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'OPEN_AUTH_MODAL'; payload: AuthModalMode }
  | { type: 'CLOSE_AUTH_MODAL' }
  | { type: 'SET_QR_CODE'; payload: { qrCodeUrl: string | null; manualKey?: string | null } };

const initialState: AuthState & { authModalOpen: boolean; authModalMode: AuthModalMode; qrCodeUrl: string | null; manualKey: string | null } = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
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

  const value: AuthContextType = {
    ...state,
    openAuthModal,
    closeAuthModal,
    setUser,
    setLoading,
    setError,
    clearError,
    setQRCode,
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
