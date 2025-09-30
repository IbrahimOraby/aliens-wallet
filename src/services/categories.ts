import { Category, CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest, CategoryFilters } from '@/types/category';
import { tokenManager } from '@/services/auth';

const API_BASE_URL = 'http://46.101.174.239:8082/api';

class CategoriesService {
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
   * Get all categories with optional filters
   */
  async getCategories(filters: CategoryFilters = {}): Promise<CategoryResponse> {
    const params = new URLSearchParams();
    
    if (filters.offset !== undefined) params.append('offset', filters.offset.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.parentId !== undefined) params.append('parentId', filters.parentId?.toString() || 'null');

    const queryString = params.toString();
    const endpoint = `/categories${queryString ? `?${queryString}` : ''}`;

    return this.request<CategoryResponse>(endpoint);
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(id: number): Promise<{ success: boolean; data: Category; message?: { en: string; ar: string } }> {
    const response = await this.request<{ success: boolean; data: Category; message?: { en: string; ar: string } }>(`/categories/${id}`);
    return response;
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: CreateCategoryRequest): Promise<{ success: boolean; data: Category; message?: { en: string; ar: string } }> {
    console.log('📝 Creating category with data:', categoryData);
    
    const response = await this.request<{ success: boolean; data: Category; message?: { en: string; ar: string } }>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    
    console.log('📝 Create category response:', response);
    return response;
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: number, categoryData: UpdateCategoryRequest): Promise<{ success: boolean; data: Category; message?: { en: string; ar: string } }> {
    const response = await this.request<{ success: boolean; data: Category; message?: { en: string; ar: string } }>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData),
    });
    return response;
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: number): Promise<{ success: boolean; message?: { en: string; ar: string } }> {
    const response = await this.request<{ success: boolean; message?: { en: string; ar: string } }>(`/categories/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  /**
   * Get only parent categories (categories without parentId)
   */
  async getParentCategories(offset = 0, limit = 10): Promise<CategoryResponse> {
    return this.getCategories({ offset, limit, parentId: null });
  }

  /**
   * Get subcategories of a specific parent category
   */
  async getSubcategories(parentId: number, offset = 0, limit = 10): Promise<CategoryResponse> {
    return this.getCategories({ offset, limit, parentId });
  }
}

// Export a singleton instance
export const categoriesService = new CategoriesService();
export default categoriesService;
