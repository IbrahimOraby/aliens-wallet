export interface OrderItem {
  id: number;
  productName: string;
  variationName: string;
  productCode?: string;
  quantity: number;
  price: number;
}

export interface OrderUser {
  id: number;
  name: string;
  email: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  user?: OrderUser;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  success: boolean;
  data: Order;
  message?: {
    en: string;
    ar: string;
  };
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  meta: {
    total: number;
    offset: number;
    limit: number;
  };
}

export interface CheckoutRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerPassword?: string;
  additionalInfo?: {
    [key: string]: any;
  };
}

export interface OrderFilters {
  offset?: number;
  limit?: number;
  status?: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
}

