import { Product, ProductResponse, CreateProductRequest, UpdateProductRequest, ProductFilters, ProductVariationTemplate, ProductVariationTemplateResponse } from '@/types/product';
import { tokenManager } from '@/services/auth';
import { API_BASE_URL } from '@/config/api';

class ProductsService {
  private normalizeName(value: string) {
    return value?.trim().toLowerCase();
  }

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
   * Get all products with optional filters
   */
  async getProducts(filters: ProductFilters = {}): Promise<ProductResponse> {
    const params = new URLSearchParams();
    
    if (filters.offset !== undefined) params.append('offset', filters.offset.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.categoryId !== undefined) params.append('categoryId', filters.categoryId.toString());
    if (filters.productTypeId !== undefined) params.append('productTypeId', filters.productTypeId.toString());
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.search !== undefined) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    return this.request<ProductResponse>(endpoint);
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: number): Promise<{ success: boolean; data: Product; message?: { en: string; ar: string } }> {
    const response = await this.request<{ success: boolean; data: Product; message?: { en: string; ar: string } }>(`/products/${id}`);
    return response;
  }

  /**
   * Create a new product
   */
  async createProduct(productData: CreateProductRequest): Promise<{ success: boolean; data: Product; message?: { en: string; ar: string } }> {
    console.log('📝 Creating product with data:', productData);
    
    const response = await this.request<{ success: boolean; data: Product; message?: { en: string; ar: string } }>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    
    console.log('📝 Create product response:', response);
    return response;
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: number, productData: UpdateProductRequest): Promise<{ success: boolean; data: Product; message?: { en: string; ar: string } }> {
    const response = await this.request<{ success: boolean; data: Product; message?: { en: string; ar: string } }>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    });
    return response;
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<{ success: boolean; message?: { en: string; ar: string } }> {
    const response = await this.request<{ success: boolean; message?: { en: string; ar: string } }>(`/products/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: number, offset = 0, limit = 10): Promise<ProductResponse> {
    return this.getProducts({ offset, limit, categoryId });
  }

  /**
   * Get products by product type
   */
  async getProductsByType(productTypeId: number, offset = 0, limit = 10): Promise<ProductResponse> {
    return this.getProducts({ offset, limit, productTypeId });
  }

  /**
   * Get active products only
   */
  async getActiveProducts(offset = 0, limit = 10): Promise<ProductResponse> {
    return this.getProducts({ offset, limit, isActive: true });
  }

  /**
   * Search products by name or description
   */
  async searchProducts(searchTerm: string, offset = 0, limit = 10): Promise<ProductResponse> {
    return this.getProducts({ offset, limit, search: searchTerm });
  }

  /**
   * Find a product by exact name (case-insensitive). Falls back to partial match.
   */
  async findProductByName(productName: string, limit = 100): Promise<Product | null> {
    const normalizedSearch = productName?.trim();
    if (!normalizedSearch) {
      return null;
    }

    const response = await this.getProducts({ search: normalizedSearch, limit });
    const normalizedTarget = this.normalizeName(normalizedSearch);

    const exactMatch = response.data.find(
      (product) => this.normalizeName(product.name) === normalizedTarget
    );

    if (exactMatch) {
      return exactMatch;
    }

    const partialMatch = response.data.find((product) =>
      this.normalizeName(product.name).includes(normalizedTarget)
    );

    return partialMatch ?? null;
  }

  /**
   * Fetch all variation templates available to the current admin.
   */
  async getVariationTemplates(): Promise<ProductVariationTemplate[]> {
    const response = await this.request<ProductVariationTemplateResponse>('/products/variations/my-templates');
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Find a variation template by name (case-insensitive). Falls back to partial match.
   */
  async findVariationTemplateByName(variationName: string): Promise<ProductVariationTemplate | null> {
    const normalizedSearch = variationName?.trim();
    if (!normalizedSearch) {
      return null;
    }

    const templates = await this.getVariationTemplates();
    const normalizedTarget = this.normalizeName(normalizedSearch);

    const exactMatch = templates.find(
      (template) => this.normalizeName(template.name) === normalizedTarget
    );

    if (exactMatch) {
      return exactMatch;
    }

    const partialMatch = templates.find((template) =>
      this.normalizeName(template.name).includes(normalizedTarget)
    );

    return partialMatch ?? null;
  }
}

// Export a singleton instance
export const productsService = new ProductsService();
export default productsService;

