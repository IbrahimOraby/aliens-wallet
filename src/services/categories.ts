import { Category, CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest, CategoryFilters } from '@/types/category';

const API_BASE_URL = 'http://46.101.174.239:8082/api';

class CategoriesService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
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
  async getCategoryById(id: number): Promise<Category> {
    const response = await this.request<{ success: boolean; data: Category }>(`/categories/${id}`);
    return response.data;
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: CreateCategoryRequest): Promise<Category> {
    const response = await this.request<{ success: boolean; data: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    return response.data;
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: number, categoryData: UpdateCategoryRequest): Promise<Category> {
    const response = await this.request<{ success: boolean; data: Category }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
    return response.data;
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: number): Promise<void> {
    await this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
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
