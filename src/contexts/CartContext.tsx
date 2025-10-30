import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback } from 'react';
import { Cart, CartItem } from '@/types/cart';
import { cartService } from '@/services/cart';
import { useAuth } from './AuthContext';

interface LocalCartItem {
  variationId: number;
  quantity: number;
  productId: number;
  productName: string;
  productKind: "GIFTCARD" | "SERVICE";
  variationName: string;
  price: number;
  photoUrl?: string;
  accountType?: 'existing' | 'new';
  email?: string;
  password?: string;
}

interface CartState {
  cart: Cart | null;
  localCart: LocalCartItem[];
  isLoading: boolean;
  error: string | null;
  isLocalCart: boolean;
}

interface CartContextType extends CartState {
  fetchCart: () => Promise<void>;
  addItemToCart: (variationId: number, quantity: number, productInfo?: {
    productId: number;
    productName: string;
    productKind: "GIFTCARD" | "SERVICE";
    variationName: string;
    price: number;
    photoUrl?: string;
    accountType?: 'existing' | 'new';
    email?: string;
    password?: string;
  }) => Promise<void>;
  updateCartItemQuantity: (itemId: number, quantity: number) => Promise<void>;
  updateLocalCartItemQuantity: (variationId: number, quantity: number) => void;
  removeItemFromCart: (itemId: number) => Promise<void>;
  removeLocalCartItem: (variationId: number) => void;
  clearCart: () => Promise<void>;
  migrateLocalCartToApi: () => Promise<void>;
  getTotalItemCount: () => number;
  getTotalAmount: () => number;
  hasServiceProducts: () => boolean;
  getDisplayItems: () => Array<CartItem & { accountType?: 'existing' | 'new'; email?: string; password?: string }>;
}

type CartAction =
  | { type: 'SET_CART'; payload: Cart | null }
  | { type: 'SET_LOCAL_CART'; payload: LocalCartItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOCAL_CART_MODE'; payload: boolean };

const initialState: CartState = {
  cart: null,
  localCart: [],
  isLoading: false,
  error: null,
  isLocalCart: true,
};

function cartReducer(
  state: CartState,
  action: CartAction
): CartState {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        cart: action.payload,
        isLocalCart: false,
      };
    case 'SET_LOCAL_CART':
      return {
        ...state,
        localCart: action.payload,
        isLocalCart: true,
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
    case 'CLEAR_CART':
      return {
        ...state,
        cart: null,
        localCart: [],
      };
    case 'SET_LOCAL_CART_MODE':
      return {
        ...state,
        isLocalCart: action.payload,
      };
    default:
      return state;
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'cart_items';

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Load local cart from localStorage on mount
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        const savedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedCart) {
          const items = JSON.parse(savedCart) as LocalCartItem[];
          dispatch({ type: 'SET_LOCAL_CART', payload: items });
        }
      } catch (err) {
        console.error('Failed to load cart from localStorage:', err);
      }
    }
  }, [isAuthenticated]);

  // Save local cart to localStorage whenever it changes
  useEffect(() => {
    if (!isAuthenticated && state.isLocalCart) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.localCart));
      } catch (err) {
        console.error('Failed to save cart to localStorage:', err);
      }
    }
  }, [state.localCart, state.isLocalCart, isAuthenticated]);

  // Fetch cart from API when authenticated
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await cartService.getCart();
      if (response.success) {
        dispatch({ type: 'SET_CART', payload: response.data });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Failed to fetch cart:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated]);

  // Add item to cart (API or localStorage)
  const addItemToCart = useCallback(async (
    variationId: number,
    quantity: number,
    productInfo?: {
      productId: number;
      productName: string;
      productKind: "GIFTCARD" | "SERVICE";
      variationName: string;
      price: number;
      photoUrl?: string;
      accountType?: 'existing' | 'new';
      email?: string;
      password?: string;
    }
  ) => {
    if (!isAuthenticated) {
      // Use localStorage for unauthenticated users
      const existingItem = state.localCart.find(item => item.variationId === variationId);
      
      if (existingItem && productInfo) {
        // Update quantity if same variation
        const updatedCart = state.localCart.map(item =>
          item.variationId === variationId
            ? { ...item, quantity: item.quantity + quantity, ...productInfo }
            : item
        );
        dispatch({ type: 'SET_LOCAL_CART', payload: updatedCart });
      } else if (productInfo) {
        // Add new item
        const newItem: LocalCartItem = {
          variationId,
          quantity,
          productId: productInfo.productId,
          productName: productInfo.productName,
          productKind: productInfo.productKind,
          variationName: productInfo.variationName,
          price: productInfo.price,
          photoUrl: productInfo.photoUrl,
          accountType: productInfo.accountType,
          email: productInfo.email,
          password: productInfo.password,
        };
        dispatch({ type: 'SET_LOCAL_CART', payload: [...state.localCart, newItem] });
      }
      return;
    }

    // Use API for authenticated users
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await cartService.addItemToCart({ variationId, quantity });
      if (response.success) {
        dispatch({ type: 'SET_CART', payload: response.data });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated, state.localCart]);

  // Update cart item quantity (API)
  const updateCartItemQuantity = useCallback(async (itemId: number, quantity: number) => {
    if (!isAuthenticated) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await cartService.updateCartItemQuantity(itemId, { quantity });
      if (response.success) {
        dispatch({ type: 'SET_CART', payload: response.data });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update cart item';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated]);

  // Update local cart item quantity
  const updateLocalCartItemQuantity = useCallback((variationId: number, quantity: number) => {
    if (quantity <= 0) {
      removeLocalCartItem(variationId);
      return;
    }

    const updatedCart = state.localCart.map(item =>
      item.variationId === variationId
        ? { ...item, quantity }
        : item
    );
    dispatch({ type: 'SET_LOCAL_CART', payload: updatedCart });
  }, [state.localCart]);

  // Remove item from cart (API)
  const removeItemFromCart = useCallback(async (itemId: number) => {
    if (!isAuthenticated) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await cartService.removeItemFromCart(itemId);
      if (response.success) {
        dispatch({ type: 'SET_CART', payload: response.data });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item from cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated]);

  // Remove local cart item
  const removeLocalCartItem = useCallback((variationId: number) => {
    const updatedCart = state.localCart.filter(item => item.variationId !== variationId);
    dispatch({ type: 'SET_LOCAL_CART', payload: updatedCart });
  }, [state.localCart]);

  // Clear cart
  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await cartService.clearCart();
        dispatch({ type: 'CLEAR_CART' });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw err;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'CLEAR_CART' });
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [isAuthenticated]);

  // Migrate local cart to API when user authenticates
  const migrateLocalCartToApi = useCallback(async () => {
    if (!isAuthenticated || state.localCart.length === 0) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Fetch existing cart first
      await fetchCart();
      
      // Migrate each item
      for (const item of state.localCart) {
        try {
          await cartService.addItemToCart({
            variationId: item.variationId,
            quantity: item.quantity,
          });
        } catch (err) {
          console.error(`Failed to migrate item ${item.variationId}:`, err);
        }
      }
      
      // Refresh cart after migration
      await fetchCart();
      
      // Clear localStorage
      dispatch({ type: 'SET_LOCAL_CART', payload: [] });
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to migrate cart:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated, state.localCart, fetchCart]);

  // Get total item count
  const getTotalItemCount = useCallback(() => {
    if (state.isLocalCart) {
      return state.localCart.reduce((sum, item) => sum + item.quantity, 0);
    }
    return state.cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }, [state.cart, state.localCart, state.isLocalCart]);

  // Get total amount
  const getTotalAmount = useCallback(() => {
    if (state.isLocalCart) {
      return state.localCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    return state.cart?.totalAmount || 0;
  }, [state.cart, state.localCart, state.isLocalCart]);

  // Check if cart has service products
  const hasServiceProducts = useCallback(() => {
    if (state.isLocalCart) {
      return state.localCart.some(item => item.productKind === 'SERVICE');
    }
    return state.cart?.items.some(item => item.product.kind === 'SERVICE') || false;
  }, [state.cart, state.localCart, state.isLocalCart]);

  // Fetch cart when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart().then(() => {
        // Migrate local cart after fetching
        migrateLocalCartToApi();
      });
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get items for display (normalized format)
  const getDisplayItems = useCallback((): Array<CartItem & { accountType?: 'existing' | 'new'; email?: string; password?: string }> => {
    if (state.isLocalCart) {
      return state.localCart.map(item => ({
        id: `local-${item.variationId}`,
        variationId: item.variationId,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.productId,
          name: item.productName,
          kind: item.productKind,
          photoUrl: item.photoUrl,
        },
        variation: {
          id: item.variationId,
          name: item.variationName,
          price: item.price,
          duration: 0,
          maxUsers: 0,
        },
        accountType: item.accountType,
        email: item.email,
        password: item.password,
      }));
    }
    return (state.cart?.items || []) as Array<CartItem & { accountType?: 'existing' | 'new'; email?: string; password?: string }>;
  }, [state.cart, state.localCart, state.isLocalCart]);

  const value: CartContextType = {
    ...state,
    cart: state.isLocalCart ? null : state.cart,
    fetchCart,
    addItemToCart,
    updateCartItemQuantity,
    updateLocalCartItemQuantity,
    removeItemFromCart,
    removeLocalCartItem,
    clearCart,
    migrateLocalCartToApi,
    getTotalItemCount,
    getTotalAmount,
    hasServiceProducts,
    getDisplayItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
