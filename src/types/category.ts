export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  createdUserId: number | null;
  updatedUserId: number | null;
  children: Category[];
  parent: Category | null;
}

export interface CategoryResponse {
  success: boolean;
  data: Category[];
  meta: {
    total: number;
    offset: number;
    limit: number;
  };
}

export interface CreateCategoryRequest {
  name: string;
  parentId?: number | null;
}

export interface UpdateCategoryRequest {
  name?: string;
  parentId?: number | null;
}

export interface CategoryFilters {
  offset?: number;
  limit?: number;
  parentId?: number | null;
}
