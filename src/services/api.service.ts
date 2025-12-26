/**
 * Servicio API centralizado
 * Maneja todas las peticiones HTTP con interceptors, retry logic y manejo de errores
 */

import { API_CONFIG, API_HEADERS, buildBackendUrl } from '../config/api.config';

// Tipos para las opciones de petición
interface RequestOptions extends RequestInit {
  timeout?: number;
  retry?: number;
  skipAuth?: boolean;
}

// Tipo para la respuesta de error
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

/**
 * Clase principal del servicio API
 */
class ApiService {
  private authToken: string | null = null;

  /**
   * Establece el token de autenticación
   */
  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Obtiene el token de autenticación
   */
  getAuthToken(): string | null {
    if (!this.authToken) {
      this.authToken = localStorage.getItem('auth_token');
    }
    return this.authToken;
  }

  /**
   * Construye los headers de la petición
   */
  private buildHeaders(skipAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = { ...API_HEADERS };

    if (!skipAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Maneja los errores de la API
   */
  private async handleError(response: Response): Promise<never> {
    let errorMessage = 'Error en la petición';
    let errorDetails: unknown = null;

    try {
      const data = await response.json();
      errorMessage = data.message || data.error || errorMessage;
      errorDetails = data;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    const error: ApiError = {
      message: errorMessage,
      status: response.status,
      code: response.status.toString(),
      details: errorDetails,
    };

    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', error);
    }

    throw error;
  }

  /**
   * Realiza una petición con timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestOptions = {}
  ): Promise<Response> {
    const timeout = options.timeout || API_CONFIG.TIMEOUT;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('La petición ha excedido el tiempo de espera');
      }
      throw error;
    }
  }

  /**
   * Realiza una petición con retry logic
   */
  private async fetchWithRetry(
    url: string,
    options: RequestOptions = {}
  ): Promise<Response> {
    const maxRetries = options.retry ?? API_CONFIG.RETRY_ATTEMPTS;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, options);

        // Si la respuesta es exitosa, retornarla
        if (response.ok) {
          return response;
        }

        // Si es 4xx (error del cliente), no reintentar
        if (response.status >= 400 && response.status < 500) {
          await this.handleError(response);
        }

        // Si es 5xx (error del servidor), reintentar
        if (attempt < maxRetries) {
          await this.delay(API_CONFIG.RETRY_DELAY * (attempt + 1));
          continue;
        }

        // Último intento fallido
        await this.handleError(response);
      } catch (error) {
        lastError = error as Error;

        // Si no quedan intentos, lanzar el error
        if (attempt >= maxRetries) {
          throw lastError;
        }

        // Esperar antes de reintentar
        await this.delay(API_CONFIG.RETRY_DELAY * (attempt + 1));
      }
    }

    throw lastError || new Error('Error desconocido en la petición');
  }

  /**
   * Delay helper para retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = buildBackendUrl(endpoint);
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'GET',
      headers: this.buildHeaders(options.skipAuth),
    });

    return response.json();
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = buildBackendUrl(endpoint);
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'POST',
      headers: this.buildHeaders(options.skipAuth),
      body: data ? JSON.stringify(data) : undefined,
    });

    return response.json();
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = buildBackendUrl(endpoint);
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'PUT',
      headers: this.buildHeaders(options.skipAuth),
      body: data ? JSON.stringify(data) : undefined,
    });

    return response.json();
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = buildBackendUrl(endpoint);
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'PATCH',
      headers: this.buildHeaders(options.skipAuth),
      body: data ? JSON.stringify(data) : undefined,
    });

    return response.json();
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = buildBackendUrl(endpoint);
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'DELETE',
      headers: this.buildHeaders(options.skipAuth),
    });

    // Algunas APIs no retornan contenido en DELETE
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return {} as T;
  }

  /**
   * Upload de archivos (multipart/form-data)
   */
  async upload<T>(
    endpoint: string,
    formData: FormData,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = buildBackendUrl(endpoint);
    const headers: HeadersInit = {};

    // No establecer Content-Type para FormData (el browser lo hace automáticamente)
    if (!options.skipAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'POST',
      headers,
      body: formData,
    });

    return response.json();
  }

  /**
   * Request externo (no usa buildBackendUrl)
   */
  async external<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const response = await this.fetchWithRetry(url, {
      ...options,
      headers: options.headers || API_HEADERS,
    });

    return response.json();
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();

// Exportar clase para testing o múltiples instancias
export default ApiService;
