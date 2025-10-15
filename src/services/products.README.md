# Products Service

This service provides a complete CRUD interface for managing products, following the same pattern as the categories service.

## API Endpoints

- `GET /api/products` - Get all products with optional filters
- `GET /api/products/:id` - Get a single product by ID
- `POST /api/products` - Create a new product
- `PATCH /api/products/:id` - Update an existing product
- `DELETE /api/products/:id` - Delete a product

## Usage

```typescript
import { productsService } from '@/services/products';

// Get all products
const products = await productsService.getProducts({ offset: 0, limit: 10 });

// Get product by ID
const product = await productsService.getProductById(1);

// Create a new product
const newProduct = await productsService.createProduct({
  name: "Netflix Gift Card",
  description: "Access Netflix streaming service",
  basePrice: 20.00,
  isActive: true,
  code: "NETFLIX2024",
  photoUrl: "https://example.com/photos/product.png",
  productTypeId: 8,
  categoryId: 9,
  variations: [
    {
      name: "1 Month - 1 User",
      price: 20.00,
      duration: 30,
      maxUsers: 1
    }
  ]
});

// Update a product
const updatedProduct = await productsService.updateProduct(1, {
  name: "Updated Product Name",
  isActive: false
});

// Delete a product
await productsService.deleteProduct(1);
```

## Available Methods

### Core CRUD Operations
- `getProducts(filters?)` - Get all products with optional filters
- `getProductById(id)` - Get a single product by ID
- `createProduct(data)` - Create a new product
- `updateProduct(id, data)` - Update an existing product
- `deleteProduct(id)` - Delete a product

### Filtering and Search
- `getProductsByCategory(categoryId, offset?, limit?)` - Get products by category
- `getProductsByType(productTypeId, offset?, limit?)` - Get products by product type
- `getActiveProducts(offset?, limit?)` - Get only active products
- `searchProducts(searchTerm, offset?, limit?)` - Search products by name or description

## Types

### Product
```typescript
interface Product {
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
```

### ProductVariation
```typescript
interface ProductVariation {
  id: number;
  name: string;
  price: string;
  duration: number;
  maxUsers: number;
  productId: number;
  createdAt: string;
  updatedAt: string;
}
```

## Form Validation

The service includes comprehensive form validation using Zod schemas:

- `productFormSchema` - Main product form validation
- `productVariationFormSchema` - Product variation validation
- `productSchema` - Transformed schema for API requests

## Error Handling

All methods include proper error handling with detailed logging:
- Request/response logging for debugging
- Error message extraction from API responses
- Consistent error throwing for upstream handling

## Authentication

The service automatically includes the admin token in requests when available, using the same token management system as the categories service.

