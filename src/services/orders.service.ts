/**
 * Servicio de órdenes
 */

import { apiService } from './api.service';

// Tipos
export interface OrderItem {
  productId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image: string;
  isDigitalProduct?: boolean;
}

export interface Order {
  id: string;
  userId: string | null;
  customerId?: string | null; // Deprecated, usar userId
  customerName: string;
  customerEmail: string;
  fortniteUsername?: string; // Username de Fortnite para productos de Fortnite
  items: OrderItem[];
  products?: OrderItem[]; // Deprecated, usar items
  subtotal: number;
  tax?: number;
  shipping: number;
  total: number;
  status: 'pending' | 'pending_payment' | 'paid' | 'payment_failed' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  // MercadoPago fields
  mercadopagoPreferenceId?: string;
  mercadopagoPaymentId?: string;
  paymentStatus?: string;
  paidAt?: string;
  // Digital Keys
  digitalKeys?: Array<{
    productName: string;
    productId: string;
    key: string;
    keyId: string;
  }>;
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
 * Obtener todas las órdenes
 */
export const getOrders = async (filters?: { status?: string; customerId?: string; limit?: number }): Promise<Order[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.customerId) queryParams.append('customerId', filters.customerId);
    if (filters?.limit) queryParams.append('limit', String(filters.limit));
    
    const endpoint = queryParams.toString() 
      ? `/api/orders?${queryParams.toString()}`
      : '/api/orders';
    
    const response = await apiService.get<ApiResponse<Order[]>>(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Obtener una orden por ID
 */
export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const response = await apiService.get<ApiResponse<Order>>(`/api/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

/**
 * Crear una nueva orden
 */
export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
  try {
    const response = await apiService.post<ApiResponse<Order>>('/api/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Actualizar una orden
 */
export const updateOrder = async (id: string, updates: Partial<Order>): Promise<Order> => {
  try {
    const response = await apiService.put<ApiResponse<Order>>(`/api/orders/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating order ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar una orden
 */
export const deleteOrder = async (id: string): Promise<void> => {
  try {
    await apiService.delete<ApiResponse<void>>(`/api/orders/${id}`);
  } catch (error) {
    console.error(`Error deleting order ${id}:`, error);
    throw error;
  }
};

/**
 * Obtener estadísticas de órdenes
 */
export const getOrderStats = async (): Promise<any> => {
  try {
    const response = await apiService.get<ApiResponse<any>>('/api/orders/stats/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }
};

export const ordersService = {
  getAll: getOrders,
  getById: getOrderById,
  create: createOrder,
  update: updateOrder,
  delete: deleteOrder,
  getStats: getOrderStats,
};

export default ordersService;
