import { Region, RegionResponse, SingleRegionResponse, RegionFilters } from '@/types/region';
import { tokenManager } from '@/services/auth';
import { API_BASE_URL } from '@/config/api';

class RegionsService {
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
        errorMessage = errorData.message || errorData.error || errorMessage;
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
   * Get all regions with optional filters
   */
  async getRegions(filters: RegionFilters = {}): Promise<RegionResponse> {
    const params = new URLSearchParams();
    
    if (filters.offset !== undefined) params.append('offset', filters.offset.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const queryString = params.toString();
    const endpoint = `/regions${queryString ? `?${queryString}` : ''}`;

    return this.request<RegionResponse>(endpoint);
  }

  /**
   * Get a single region by ID
   */
  async getRegionById(id: number): Promise<SingleRegionResponse> {
    const response = await this.request<SingleRegionResponse>(`/regions/${id}`);
    return response;
  }
}

// Export a singleton instance
export const regionsService = new RegionsService();
export default regionsService;
