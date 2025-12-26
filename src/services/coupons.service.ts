/**
 * Servicio de cupones
 */

import { apiService } from './api.service';

export interface Coupon {
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  discount: number;
  freeShipping: boolean;
  originalValue: number;
  minPurchase: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Validar un cupón
 */
export const validateCoupon = async (code: string, cartTotal: number): Promise<Coupon> => {
  try {
    const response = await apiService.post<ApiResponse<Coupon>>(
      '/api/coupons/validate',
      { code, cartTotal },
      { skipAuth: true } // Público
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    throw new Error(error?.error || 'Cupón no válido');
  }
};

/**
 * Aplicar un cupón (incrementa contador)
 */
export const applyCoupon = async (code: string): Promise<void> => {
  try {
    await apiService.post<ApiResponse<void>>(
      '/api/coupons/apply',
      { code },
      { skipAuth: true }
    );
  } catch (error) {
    console.error('Error applying coupon:', error);
    // No lanzar error, solo log (el contador es secundario)
  }
};

/**
 * Obtener todos los cupones (Admin)
 */
export const getAllCoupons = async (): Promise<any[]> => {
  try {
    const response = await apiService.get<ApiResponse<any[]>>('/api/coupons');
    return response.data;
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};

/**
 * Crear cupón (Admin)
 */
export const createCoupon = async (couponData: any): Promise<any> => {
  try {
    const response = await apiService.post<ApiResponse<any>>('/api/coupons', couponData);
    return response.data;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
};

/**
 * Actualizar cupón (Admin)
 */
export const updateCoupon = async (id: string, updates: any): Promise<any> => {
  try {
    const response = await apiService.put<ApiResponse<any>>(`/api/coupons/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
};

/**
 * Eliminar cupón (Admin)
 */
export const deleteCoupon = async (id: string): Promise<void> => {
  try {
    await apiService.delete<ApiResponse<void>>(`/api/coupons/${id}`);
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};

export const couponsService = {
  validate: validateCoupon,
  apply: applyCoupon,
  getAll: getAllCoupons,
  create: createCoupon,
  update: updateCoupon,
  delete: deleteCoupon,
};

export default couponsService;
