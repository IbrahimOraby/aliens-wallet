export interface CartProduct {
  id: number;
  name: string;
  code?: string;
  photoUrl?: string;
  kind: "GIFTCARD" | "SERVICE";
}

export interface CartVariation {
  id: number;
  name: string;
  price: number;
  duration: number;
  maxUsers: number;
}

export interface CartItem {
  id: number;
  variationId: number;
  quantity: number;
  price: number;
  product: CartProduct;
  variation: CartVariation;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  success: boolean;
  data: Cart;
  message?: {
    en: string;
    ar: string;
  };
}

export interface AddItemToCartRequest {
  variationId: number;
  quantity: number;
}

export interface UpdateCartItemQuantityRequest {
  quantity: number;
}

