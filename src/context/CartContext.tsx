import React, { createContext, useContext, useState } from 'react';
import { CartItem, Product } from '../types';
import { Coupon, couponsService } from '../services/coupons.service';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  subtotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const addToCart = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string) => {
    const currentSubtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    try {
      const coupon = await couponsService.validate(code, currentSubtotal);
      setAppliedCoupon(coupon);
      
      // Incrementar contador de uso en backend
      await couponsService.apply(code);
    } catch (error: any) {
      throw error;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Calcular total con descuento del cupón
  let total = subtotal;
  if (appliedCoupon) {
    total = subtotal - appliedCoupon.discount;
    if (total < 0) total = 0;
  }

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      total,
      subtotal,
      appliedCoupon,
      applyCoupon,
      removeCoupon
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
