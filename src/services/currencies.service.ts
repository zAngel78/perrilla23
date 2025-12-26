/**
 * Servicio de Monedas
 */

import { apiService } from './api.service';
import { Currency } from '../context/CurrencyContext';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Obtener monedas activas (Público)
 */
export const getActiveCurrencies = async (): Promise<Currency[]> => {
  try {
    const response = await apiService.get<ApiResponse<Currency[]>>(
      '/api/currencies',
      { skipAuth: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    throw error;
  }
};

/**
 * Obtener todas las monedas (Admin)
 */
export const getAllCurrencies = async (): Promise<Currency[]> => {
  try {
    const response = await apiService.get<ApiResponse<Currency[]>>('/api/currencies/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all currencies:', error);
    throw error;
  }
};

/**
 * Crear moneda (Admin)
 */
export const createCurrency = async (currencyData: Partial<Currency>): Promise<Currency> => {
  try {
    const response = await apiService.post<ApiResponse<Currency>>('/api/currencies', currencyData);
    return response.data;
  } catch (error) {
    console.error('Error creating currency:', error);
    throw error;
  }
};

/**
 * Actualizar moneda (Admin)
 */
export const updateCurrency = async (id: string, updates: Partial<Currency>): Promise<Currency> => {
  try {
    const response = await apiService.put<ApiResponse<Currency>>(`/api/currencies/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating currency:', error);
    throw error;
  }
};

/**
 * Eliminar moneda (Admin)
 */
export const deleteCurrency = async (id: string): Promise<void> => {
  try {
    await apiService.delete<ApiResponse<void>>(`/api/currencies/${id}`);
  } catch (error) {
    console.error('Error deleting currency:', error);
    throw error;
  }
};

export const currenciesService = {
  getActive: getActiveCurrencies,
  getAll: getAllCurrencies,
  create: createCurrency,
  update: updateCurrency,
  delete: deleteCurrency,
};

export default currenciesService;
