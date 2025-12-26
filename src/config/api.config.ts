/**
 * Configuración centralizada de API
 * Todas las URLs y configuraciones de endpoints deben estar aquí
 */

// Variables de entorno con valores por defecto
const ENV = {
  // Backend API
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  
  // APIs externas (si las usas directamente desde frontend)
  FORTNITE_API_URL: import.meta.env.VITE_FORTNITE_API_URL || 'https://fortnite-api.com',
  
  // Configuración de la aplicación
  APP_ENV: import.meta.env.MODE || 'development',
  IS_PRODUCTION: import.meta.env.PROD || false,
  IS_DEVELOPMENT: import.meta.env.DEV || true,
} as const;

// Endpoints del Backend
export const API_ENDPOINTS = {
  // Fortnite
  FORTNITE: {
    SHOP: '/api/fortnite/shop',
    ITEM_DETAILS: (itemId: string) => `/api/fortnite/item/${itemId}`,
    UPCOMING: '/api/fortnite/upcoming',
  },
  
  // Productos (cuando implementes el backend)
  PRODUCTS: {
    LIST: '/api/products',
    DETAIL: (id: string) => `/api/products/${id}`,
    CREATE: '/api/products',
    UPDATE: (id: string) => `/api/products/${id}`,
    DELETE: (id: string) => `/api/products/${id}`,
  },
  
  // Carrito (futuro)
  CART: {
    GET: '/api/cart',
    ADD: '/api/cart/add',
    UPDATE: '/api/cart/update',
    REMOVE: '/api/cart/remove',
    CLEAR: '/api/cart/clear',
  },
  
  // Cupones
  COUPONS: {
    VALIDATE: '/api/coupons/validate',
    APPLY: '/api/coupons/apply',
    LIST: '/api/coupons',
    CREATE: '/api/coupons',
    UPDATE: (id: string) => `/api/coupons/${id}`,
    DELETE: (id: string) => `/api/coupons/${id}`,
  },
  
  // Autenticación (futuro)
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
  },
  
  // Usuarios (futuro)
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    ORDERS: '/api/users/orders',
  },
  
  // Órdenes
  ORDERS: {
    LIST: '/api/orders',
    DETAIL: (id: string) => `/api/orders/${id}`,
    CREATE: '/api/orders',
    UPDATE: (id: string) => `/api/orders/${id}`,
    DELETE: (id: string) => `/api/orders/${id}`,
    STATS: '/api/orders/stats/summary',
  },
  
  // Gestión de Usuarios (admin)
  USERS: {
    LIST: '/api/users',
    DETAIL: (id: string) => `/api/users/${id}`,
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
    STATS: '/api/users/stats/summary',
  },
} as const;

// Configuración de timeouts y reintentos
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
} as const;

// Headers comunes
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

/**
 * Construye la URL completa para un endpoint del backend
 */
export const buildBackendUrl = (endpoint: string): string => {
  const base = ENV.BACKEND_URL.replace(/\/$/, ''); // Elimina trailing slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};

/**
 * Construye la URL completa para una API externa
 */
export const buildExternalUrl = (baseUrl: string, path: string): string => {
  const base = baseUrl.replace(/\/$/, '');
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  return `${base}${endpoint}`;
};

// Exportar configuración del entorno
export { ENV };

// Log de configuración en desarrollo
if (ENV.IS_DEVELOPMENT) {
  console.log('🔧 API Configuration:', {
    backend: ENV.BACKEND_URL,
    environment: ENV.APP_ENV,
  });
}
