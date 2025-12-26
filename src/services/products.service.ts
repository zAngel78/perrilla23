/**
 * Servicio de productos - Conecta con el backend
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { Product } from '../types';

// Tipo para respuesta de la API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

// Filtros para listar productos
export interface ProductFilters {
  category?: string;
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Obtener todos los productos con filtros opcionales
 */
export const getProducts = async (filters?: ProductFilters): Promise<Product[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.featured !== undefined) queryParams.append('featured', String(filters.featured));
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.minPrice !== undefined) queryParams.append('minPrice', String(filters.minPrice));
    if (filters?.maxPrice !== undefined) queryParams.append('maxPrice', String(filters.maxPrice));
    
    const endpoint = queryParams.toString() 
      ? `${API_ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`
      : API_ENDPOINTS.PRODUCTS.LIST;
    
    const response = await apiService.get<ApiResponse<Product[]>>(endpoint, {
      skipAuth: true // Productos son públicos
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Obtener productos destacados (featured)
 */
export const getFeaturedProducts = async (): Promise<Product[]> => {
  return getProducts({ featured: true });
};

/**
 * Obtener un producto por ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await apiService.get<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.DETAIL(id),
      { skipAuth: true }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

/**
 * Obtener productos por categoría
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  return getProducts({ category });
};

/**
 * Buscar productos
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
  return getProducts({ search: query });
};

/**
 * Crear un nuevo producto (Admin)
 */
export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  try {
    const response = await apiService.post<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.CREATE,
      productData
    );
    
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Actualizar un producto (Admin)
 */
export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  try {
    const response = await apiService.put<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.UPDATE(id),
      updates
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar un producto (Admin)
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await apiService.delete<ApiResponse<void>>(
      API_ENDPOINTS.PRODUCTS.DELETE(id)
    );
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

/**
 * Subir imagen de producto (Admin)
 */
export const uploadProductImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiService.upload<ApiResponse<{ url: string }>>(
      '/api/upload/single',
      formData
    );
    
    return response.data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Subir múltiples imágenes (galería) (Admin)
 */
export const uploadProductImages = async (files: File[]): Promise<string[]> => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await apiService.upload<ApiResponse<Array<{ url: string }>>>(
      '/api/upload/multiple',
      formData
    );
    
    return response.data.map(img => img.url);
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

/**
 * Reordenar productos destacados (Admin)
 */
export const reorderFeatured = async (orders: Array<{ id: string; featuredOrder: number }>): Promise<void> => {
  try {
    await apiService.put('/api/products/featured/reorder', { orders });
  } catch (error) {
    console.error('Error reordering featured products:', error);
    throw error;
  }
};

/**
 * Hook personalizado para manejar el estado de productos (opcional)
 * Lo crearemos si usas React Query o similar
 */
export const productsService = {
  getAll: getProducts,
  getFeatured: getFeaturedProducts,
  getById: getProductById,
  getByCategory: getProductsByCategory,
  search: searchProducts,
  create: createProduct,
  update: updateProduct,
  delete: deleteProduct,
  uploadImage: uploadProductImage,
  uploadImages: uploadProductImages,
  reorderFeatured: reorderFeatured,
};

export default productsService;
