import { categoriesService } from '../categories';

// Mock fetch for testing
global.fetch = jest.fn();

describe('CategoriesService', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('getCategories', () => {
    it('should fetch categories with default parameters', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            name: 'Test Category',
            slug: 'test-category',
            parentId: null,
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
            createdUserId: null,
            updatedUserId: null,
            children: [],
            parent: null
          }
        ],
        meta: {
          total: 1,
          offset: 0,
          limit: 10
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await categoriesService.getCategories();

      expect(fetch).toHaveBeenCalledWith(
        'http://46.101.174.239:8082/api/categories',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch categories with custom filters', async () => {
      const mockResponse = {
        success: true,
        data: [],
        meta: { total: 0, offset: 10, limit: 5 }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await categoriesService.getCategories({ offset: 10, limit: 5, parentId: 1 });

      expect(fetch).toHaveBeenCalledWith(
        'http://46.101.174.239:8082/api/categories?offset=10&limit=5&parentId=1',
        expect.any(Object)
      );
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const categoryData = { name: 'New Category', parentId: null };
      const mockResponse = {
        success: true,
        data: {
          id: 2,
          name: 'New Category',
          slug: 'new-category',
          parentId: null,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          createdUserId: null,
          updatedUserId: null,
          children: [],
          parent: null
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await categoriesService.createCategory(categoryData);

      expect(fetch).toHaveBeenCalledWith(
        'http://46.101.174.239:8082/api/categories',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(categoryData),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('error handling', () => {
    it('should throw error when request fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(categoriesService.getCategories()).rejects.toThrow(
        'HTTP error! status: 500'
      );
    });
  });
});
