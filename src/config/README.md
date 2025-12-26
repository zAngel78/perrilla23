# 🔧 Configuración de API - Documentación

Este directorio contiene la configuración centralizada de todas las APIs del proyecto.

## 📁 Archivos

### `api.config.ts`
Configuración centralizada de URLs, endpoints y constantes de API.

**Uso:**
```typescript
import { API_ENDPOINTS, buildBackendUrl, ENV } from '@/config/api.config';

// Obtener URL completa
const shopUrl = buildBackendUrl(API_ENDPOINTS.FORTNITE.SHOP);
// => "http://localhost:3001/api/fortnite/shop"

// Acceder a variables de entorno
console.log(ENV.BACKEND_URL); // => "http://localhost:3001"
console.log(ENV.IS_DEVELOPMENT); // => true
```

## 🎯 Variables de Entorno

Configura estas variables en tu archivo `.env`:

```bash
VITE_BACKEND_URL=http://localhost:3001
VITE_FORTNITE_API_URL=https://fortnite-api.com
```

**⚠️ IMPORTANTE:** 
- Todas las variables deben tener el prefijo `VITE_` para ser accesibles en el frontend
- Copia `.env.example` a `.env` y ajusta los valores según tu entorno
- Nunca subas el archivo `.env` a git (ya está en `.gitignore`)

## 📡 Endpoints Disponibles

### Fortnite
```typescript
API_ENDPOINTS.FORTNITE.SHOP              // /api/fortnite/shop
API_ENDPOINTS.FORTNITE.ITEM_DETAILS(id)  // /api/fortnite/item/:id
API_ENDPOINTS.FORTNITE.UPCOMING          // /api/fortnite/upcoming
```

### Productos (futuro)
```typescript
API_ENDPOINTS.PRODUCTS.LIST              // /api/products
API_ENDPOINTS.PRODUCTS.DETAIL(id)        // /api/products/:id
API_ENDPOINTS.PRODUCTS.CREATE            // /api/products
API_ENDPOINTS.PRODUCTS.UPDATE(id)        // /api/products/:id
API_ENDPOINTS.PRODUCTS.DELETE(id)        // /api/products/:id
```

### Autenticación (futuro)
```typescript
API_ENDPOINTS.AUTH.LOGIN                 // /api/auth/login
API_ENDPOINTS.AUTH.REGISTER              // /api/auth/register
API_ENDPOINTS.AUTH.LOGOUT                // /api/auth/logout
API_ENDPOINTS.AUTH.REFRESH               // /api/auth/refresh
API_ENDPOINTS.AUTH.ME                    // /api/auth/me
```

### Carrito (futuro)
```typescript
API_ENDPOINTS.CART.GET                   // /api/cart
API_ENDPOINTS.CART.ADD                   // /api/cart/add
API_ENDPOINTS.CART.UPDATE                // /api/cart/update
API_ENDPOINTS.CART.REMOVE                // /api/cart/remove
API_ENDPOINTS.CART.CLEAR                 // /api/cart/clear
```

## ➕ Agregar Nuevos Endpoints

1. Abre `api.config.ts`
2. Agrega tu nuevo grupo de endpoints:

```typescript
export const API_ENDPOINTS = {
  // ... endpoints existentes
  
  // Nuevo grupo
  MI_RECURSO: {
    LIST: '/api/mi-recurso',
    DETAIL: (id: string) => `/api/mi-recurso/${id}`,
    CREATE: '/api/mi-recurso',
    UPDATE: (id: string) => `/api/mi-recurso/${id}`,
    DELETE: (id: string) => `/api/mi-recurso/${id}`,
  },
} as const;
```

3. Usa el servicio API para hacer peticiones:

```typescript
import { apiService } from '@/services/api.service';
import { API_ENDPOINTS } from '@/config/api.config';

// GET
const items = await apiService.get(API_ENDPOINTS.MI_RECURSO.LIST);

// POST
const newItem = await apiService.post(API_ENDPOINTS.MI_RECURSO.CREATE, {
  name: 'Nuevo Item',
  price: 100
});

// PUT/PATCH
const updated = await apiService.put(API_ENDPOINTS.MI_RECURSO.UPDATE('123'), {
  name: 'Item Actualizado'
});

// DELETE
await apiService.delete(API_ENDPOINTS.MI_RECURSO.DELETE('123'));
```

## 🔒 Autenticación

El servicio API maneja automáticamente los tokens de autenticación:

```typescript
import { apiService } from '@/services/api.service';

// Establecer token después del login
apiService.setAuthToken('tu-token-jwt');

// Las siguientes peticiones incluirán automáticamente el header Authorization
const userData = await apiService.get(API_ENDPOINTS.AUTH.ME);

// Cerrar sesión (elimina el token)
apiService.setAuthToken(null);
```

## ⚡ Características del Servicio API

- ✅ **Retry automático** (3 intentos por defecto)
- ✅ **Timeout** (30 segundos por defecto)
- ✅ **Manejo de errores** centralizado
- ✅ **Headers automáticos** (Content-Type, Authorization)
- ✅ **Persistencia de token** (localStorage)
- ✅ **TypeScript** con tipos genéricos
- ✅ **Logs en desarrollo**

## 🌍 Entornos

### Desarrollo Local
```bash
npm run dev
# Usa .env.development
```

### Producción
```bash
npm run build
# Usa .env.production
```

### Staging (opcional)
Crea `.env.staging` y configura tu script:
```json
{
  "scripts": {
    "build:staging": "vite build --mode staging"
  }
}
```
