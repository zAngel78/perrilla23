/**
 * Servicio de overrides de precios de Fortnite
 */

import { apiService } from './api.service';

export interface FortnitePriceOverride {
  id: string;
  itemId: string;
  itemName: string;
  originalPrice: number;
  customPrice: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Obtener todos los overrides de precios
 */
export const getAll = async (): Promise<FortnitePriceOverride[]> => {
  try {
    const response = await apiService.get<ApiResponse<FortnitePriceOverride[]>>('/api/fortnite-prices');
    return response.data;
  } catch (error) {
    console.error('Error fetching fortnite price overrides:', error);
    throw error;
  }
};

/**
 * Obtener override por itemId
 */
export const getByItemId = async (itemId: string): Promise<FortnitePriceOverride | null> => {
  try {
    const response = await apiService.get<ApiResponse<FortnitePriceOverride>>(`/api/fortnite-prices/${itemId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching fortnite price override:', error);
    throw error;
  }
};

/**
 * Crear o actualizar override de precio
 */
export const createOrUpdate = async (data: {
  itemId: string;
  itemName: string;
  originalPrice: number;
  customPrice: number;
  active?: boolean;
}): Promise<FortnitePriceOverride> => {
  try {
    const response = await apiService.post<ApiResponse<FortnitePriceOverride>>('/api/fortnite-prices', data);
    return response.data;
  } catch (error) {
    console.error('Error creating/updating fortnite price override:', error);
    throw error;
  }
};

/**
 * Eliminar override de precio
 */
export const remove = async (id: string): Promise<void> => {
  try {
    await apiService.delete(`/api/fortnite-prices/${id}`);
  } catch (error) {
    console.error('Error deleting fortnite price override:', error);
    throw error;
  }
};

export const fortnitePricesService = {
  getAll,
  getByItemId,
  createOrUpdate,
  delete: remove,
};

export default fortnitePricesService;
