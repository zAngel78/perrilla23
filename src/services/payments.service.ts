/**
 * Servicio de Pagos (MercadoPago)
 */

import { apiService } from './api.service';

interface CreatePreferenceResponse {
  success: boolean;
  data: {
    preferenceId: string;
    initPoint: string;
    sandboxInitPoint: string;
  };
}

interface PaymentStatusResponse {
  success: boolean;
  data: {
    status: string;
    paymentId?: string;
    preferenceId?: string;
  };
}

/**
 * Crear preferencia de pago en MercadoPago
 */
export const createPaymentPreference = async (orderId: string): Promise<CreatePreferenceResponse> => {
  try {
    const response = await apiService.post<CreatePreferenceResponse>(
      '/api/payments/create-preference',
      { orderId }
    );
    return response;
  } catch (error) {
    console.error('Error creating payment preference:', error);
    throw error;
  }
};

/**
 * Obtener estado de pago de una orden
 */
export const getPaymentStatus = async (orderId: string): Promise<PaymentStatusResponse> => {
  try {
    const response = await apiService.get<PaymentStatusResponse>(
      `/api/payments/status/${orderId}`
    );
    return response;
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
};

export const paymentsService = {
  createPreference: createPaymentPreference,
  getStatus: getPaymentStatus,
};

export default paymentsService;
