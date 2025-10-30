import { CartResponse, AddItemToCartRequest, UpdateCartItemQuantityRequest } from '@/types/cart';
import { tokenManager } from '@/services/auth';
import { API_BASE_URL } from '@/config/api';

class CartService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = tokenManager.getToken();
    
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
   * Add an item to the cart
   */
  async addItemToCart(itemData: AddItemToCartRequest): Promise<CartResponse> {
    console.log('📝 Adding item to cart with data:', itemData);
    
    const response = await this.request<CartResponse>('/cart/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
    
    console.log('📝 Add item to cart response:', response);
    return response;
  }

  /**
   * Update cart item quantity
   */
  async updateCartItemQuantity(itemId: number, itemData: UpdateCartItemQuantityRequest): Promise<CartResponse> {
    const response = await this.request<CartResponse>(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
    return response;
  }

  /**
   * Remove an item from the cart
   */
  async removeItemFromCart(itemId: number): Promise<CartResponse> {
    const response = await this.request<CartResponse>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
    return response;
  }

  /**
   * Clear the entire cart
   */
  async clearCart(): Promise<CartResponse> {
    const response = await this.request<CartResponse>('/cart', {
      method: 'DELETE',
    });
    return response;
  }

  /**
   * Get the current cart
   */
  async getCart(): Promise<CartResponse> {
    const response = await this.request<CartResponse>('/cart', {
      method: 'GET',
    });
    return response;
  }
}

// Export a singleton instance
export const cartService = new CartService();
export default cartService;

