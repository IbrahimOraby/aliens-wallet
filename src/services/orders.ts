import { OrderResponse, OrdersResponse, CheckoutRequest, OrderFilters } from '@/types/order';
import { tokenManager } from '@/services/auth';
import { API_BASE_URL } from '@/config/api';

class OrdersService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = tokenManager.getAdminToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Console log the request details
    console.log('🚀 API Request:', {
      method: options.method || 'GET',
      url: url,
      headers: headers,
      body: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined
    });
    
    const response = await fetch(url, {
      headers,
      ...options,
    });

    // Console log the response details
    console.log('📥 API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.log('❌ Error Response Data:', errorData);
        errorMessage = errorData.message?.en || errorData.message || errorMessage;
      } catch (e) {
        console.log('❌ Could not parse error response as JSON');
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    if (responseData.success) {
      console.log('✅ Success Response Data:', responseData);
    } else {
      console.log('❌ [NON-SUCCESS] Response Data:', responseData);
    }
    return responseData;
  }

  /**
   * Checkout (Create Order)
   */
  async checkout(checkoutData: CheckoutRequest): Promise<OrderResponse> {
    console.log('📝 Creating order with data:', checkoutData);
    
    const response = await this.request<OrderResponse>('/cart/checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
    
    console.log('📝 Checkout response:', response);
    return response;
  }

  /**
   * Get user's orders (paginated)
   */
  async getMyOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
    const params = new URLSearchParams();
    
    if (filters.offset !== undefined) params.append('offset', filters.offset.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.status !== undefined) params.append('status', filters.status);

    const queryString = params.toString();
    const endpoint = `/cart/orders${queryString ? `?${queryString}` : ''}`;

    return this.request<OrdersResponse>(endpoint);
  }

  /**
   * Get all orders (Admin only, paginated)
   */
  async getAllOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
    const params = new URLSearchParams();
    
    if (filters.offset !== undefined) params.append('offset', filters.offset.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.status !== undefined) params.append('status', filters.status);

    const queryString = params.toString();
    const endpoint = `/cart/orders/admin${queryString ? `?${queryString}` : ''}`;

    return this.request<OrdersResponse>(endpoint);
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: number): Promise<OrderResponse> {
    const response = await this.request<OrderResponse>(`/cart/orders/${id}`);
    return response;
  }
}

// Export a singleton instance
export const ordersService = new OrdersService();
export default ordersService;

