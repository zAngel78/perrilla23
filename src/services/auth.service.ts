/**
 * Servicio de autenticación
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

// Tipos
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

/**
 * Login de usuario
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
      { skipAuth: true }
    );
    
    // Guardar token automáticamente
    if (response.data.token) {
      apiService.setAuthToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

/**
 * Registro de usuario
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data,
      { skipAuth: true }
    );
    
    // Guardar token automáticamente
    if (response.data.token) {
      apiService.setAuthToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

/**
 * Obtener usuario actual
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiService.get<{ success: boolean; data: User }>(
      API_ENDPOINTS.AUTH.ME
    );
    
    // Actualizar usuario en localStorage
    localStorage.setItem('user', JSON.stringify(response.data));
    
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

/**
 * Logout
 */
export const logout = (): void => {
  apiService.setAuthToken(null);
  localStorage.removeItem('user');
  localStorage.removeItem('auth_token');
};

/**
 * Verificar si hay sesión activa
 */
export const isAuthenticated = (): boolean => {
  const token = apiService.getAuthToken();
  return !!token;
};

/**
 * Obtener usuario de localStorage
 */
export const getStoredUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Verificar si el usuario es admin
 */
export const isAdmin = (): boolean => {
  const user = getStoredUser();
  return user?.role === 'admin';
};

export const authService = {
  login,
  register,
  getCurrentUser,
  logout,
  isAuthenticated,
  getStoredUser,
  isAdmin,
};

export default authService;
