export interface ProductVariation {
  id: number;
  name: string;
  price: string;
  duration: number;
  maxUsers: number;
  productId: number;
  createdAt: string;
  updatedAt: string;
  regionIds: number[];
  availableCount: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  createdUserId: number | null;
  updatedUserId: number | null;
}

export interface ProductType {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  createdUserId: number | null;
  updatedUserId: number | null;
}

export interface Product {
  id: number;
  name: string;
  photoUrl: string | null;
  description: string;
  basePrice: string;
  isActive: boolean;
  code?: string;
  productTypeId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  createdUserId: number | null;
  updatedUserId: number | null;
  category: Category;
  productType: ProductType;
  variations: ProductVariation[];
}

export interface ProductResponse {
  success: boolean;
  data: Product[];
  meta: {
    total: number;
    offset: number;
    limit: number;
  };
}

export interface CreateProductRequest {
  name: string;
  description: string;
  basePrice: number;
  isActive: boolean;
  kind: "GIFTCARD" | "SERVICE";
  code?: string;
  photoUrl?: string;
  productTypeId: number;
  categoryId: number;
  variations: CreateProductVariationRequest[];
}

export interface CreateProductVariationRequest {
  name: string;
  price: number;
  duration?: number;
  maxUsers?: number;
  availableCount?: number; // zero means unlimited - might get added to form fields and UI but not yet
  regionIds: number[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  basePrice?: number;
  isActive?: boolean;
  kind: "GIFTCARD" | "SERVICE";
  code?: string;
  photoUrl?: string;
  productTypeId?: number;
  categoryId?: number;
  variations?: UpdateProductVariationRequest[];
}

export interface UpdateProductVariationRequest {
  id?: number;
  name: string;
  price: number;
  duration?: number;
  maxUsers?: number;
  availableCount?: number; // zero means unlimited - might get added to form fields and UI but not yet
  regionIds: number[];
}

export interface ProductFilters {
  offset?: number;
  limit?: number;
  categoryId?: number;
  productTypeId?: number;
  isActive?: boolean;
  search?: string;
}

