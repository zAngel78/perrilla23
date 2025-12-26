export interface DigitalKey {
  id: string;
  code: string;
  status: 'available' | 'used' | 'reserved';
  usedAt: string | null;
  usedBy: string | null; // orderId
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  gallery?: string[];
  category: string;
  description: string;
  rating?: number;
  // Nuevos campos para la página de detalle
  longDescription?: string;
  features?: string[];
  specs?: Record<string, string>;
  stock?: number;
  status?: 'Activo' | 'Bajo Stock' | 'Sin Stock';
  featured?: boolean;
  featuredOrder?: number; // Orden en destacados (menor = primero)
  // Campos para productos digitales
  isDigitalProduct?: boolean;
  digitalKeys?: DigitalKey[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FortniteItem {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  price: number; // V-Bucks
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}
