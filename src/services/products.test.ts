// Example usage of the products service
// This file demonstrates how to use the products service

import { productsService } from './products';
import { CreateProductRequest } from '@/types/product';

// Example: Get all products
export const getAllProducts = async () => {
  try {
    const response = await productsService.getProducts({ offset: 0, limit: 10 });
    console.log('All products:', response);
    return response;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Example: Get product by ID
export const getProductById = async (id: number) => {
  try {
    const response = await productsService.getProductById(id);
    console.log('Product by ID:', response);
    return response;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
};

// Example: Create a new product
export const createNewProduct = async () => {
  const newProduct: CreateProductRequest = {
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
      },
      {
        name: "6 Months - 2 Users",
        price: 100.00,
        duration: 180,
        maxUsers: 2
      }
    ]
  };

  try {
    const response = await productsService.createProduct(newProduct);
    console.log('Created product:', response);
    return response;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Example: Update a product
export const updateProduct = async (id: number) => {
  const updateData = {
    name: "Updated Netflix Gift Card",
    description: "Updated description",
    isActive: false
  };

  try {
    const response = await productsService.updateProduct(id, updateData);
    console.log('Updated product:', response);
    return response;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Example: Delete a product
export const deleteProduct = async (id: number) => {
  try {
    const response = await productsService.deleteProduct(id);
    console.log('Deleted product:', response);
    return response;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Example: Search products
export const searchProducts = async (searchTerm: string) => {
  try {
    const response = await productsService.searchProducts(searchTerm, 0, 10);
    console.log('Search results:', response);
    return response;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// Example: Get products by category
export const getProductsByCategory = async (categoryId: number) => {
  try {
    const response = await productsService.getProductsByCategory(categoryId, 0, 10);
    console.log('Products by category:', response);
    return response;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

// Example: Get active products only
export const getActiveProducts = async () => {
  try {
    const response = await productsService.getActiveProducts(0, 10);
    console.log('Active products:', response);
    return response;
  } catch (error) {
    console.error('Error fetching active products:', error);
    throw error;
  }
};

