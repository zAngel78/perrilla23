/**
 * Servicio de usuarios
 */

import { apiService } from './api.service';

// Tipos
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  phone?: string;
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

/**
 * Obtener todos los usuarios
 */
export const getUsers = async (filters?: { role?: string; search?: string; limit?: number }): Promise<User[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.role) queryParams.append('role', filters.role);
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.limit) queryParams.append('limit', String(filters.limit));
    
    const endpoint = queryParams.toString() 
      ? `/api/users?${queryParams.toString()}`
      : '/api/users';
    
    const response = await apiService.get<ApiResponse<User[]>>(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Obtener un usuario por ID
 */
export const getUserById = async (id: string): Promise<User> => {
  try {
    const response = await apiService.get<ApiResponse<User>>(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
};

/**
 * Actualizar un usuario
 */
export const updateUser = async (id: string, updates: Partial<User>): Promise<User> => {
  try {
    const response = await apiService.put<ApiResponse<User>>(`/api/users/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar un usuario
 */
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await apiService.delete<ApiResponse<void>>(`/api/users/${id}`);
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};

/**
 * Obtener estadísticas de usuarios
 */
export const getUserStats = async (): Promise<any> => {
  try {
    const response = await apiService.get<ApiResponse<any>>('/api/users/stats/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

export const usersService = {
  getAll: getUsers,
  getById: getUserById,
  update: updateUser,
  delete: deleteUser,
  getStats: getUserStats,
};

export default usersService;
