/**
 * Servicio de Hero Slides
 */

import { apiService } from './api.service';

export interface HeroSlide {
  id?: string;
  order: number;
  image: string;
  showText: boolean;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Obtener slides activos (Público)
 */
export const getActiveSlides = async (): Promise<HeroSlide[]> => {
  try {
    const response = await apiService.get<ApiResponse<HeroSlide[]>>(
      '/api/hero-slides',
      { skipAuth: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching active slides:', error);
    throw error;
  }
};

/**
 * Obtener todos los slides (Admin)
 */
export const getAllSlides = async (): Promise<HeroSlide[]> => {
  try {
    const response = await apiService.get<ApiResponse<HeroSlide[]>>('/api/hero-slides/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all slides:', error);
    throw error;
  }
};

/**
 * Obtener un slide por ID (Admin)
 */
export const getSlideById = async (id: string): Promise<HeroSlide> => {
  try {
    const response = await apiService.get<ApiResponse<HeroSlide>>(`/api/hero-slides/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching slide:', error);
    throw error;
  }
};

/**
 * Crear slide (Admin)
 */
export const createSlide = async (slideData: Partial<HeroSlide>): Promise<HeroSlide> => {
  try {
    const response = await apiService.post<ApiResponse<HeroSlide>>('/api/hero-slides', slideData);
    return response.data;
  } catch (error) {
    console.error('Error creating slide:', error);
    throw error;
  }
};

/**
 * Actualizar slide (Admin)
 */
export const updateSlide = async (id: string, updates: Partial<HeroSlide>): Promise<HeroSlide> => {
  try {
    const response = await apiService.put<ApiResponse<HeroSlide>>(`/api/hero-slides/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating slide:', error);
    throw error;
  }
};

/**
 * Reordenar slides (Admin)
 */
export const reorderSlides = async (slides: { id: string; order: number }[]): Promise<void> => {
  try {
    await apiService.put<ApiResponse<void>>('/api/hero-slides/reorder/bulk', { slides });
  } catch (error) {
    console.error('Error reordering slides:', error);
    throw error;
  }
};

/**
 * Eliminar slide (Admin)
 */
export const deleteSlide = async (id: string): Promise<void> => {
  try {
    await apiService.delete<ApiResponse<void>>(`/api/hero-slides/${id}`);
  } catch (error) {
    console.error('Error deleting slide:', error);
    throw error;
  }
};

export const heroSlidesService = {
  getActive: getActiveSlides,
  getAll: getAllSlides,
  getById: getSlideById,
  create: createSlide,
  update: updateSlide,
  reorder: reorderSlides,
  delete: deleteSlide,
};

export default heroSlidesService;
