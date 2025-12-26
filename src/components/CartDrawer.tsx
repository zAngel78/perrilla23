import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, subtotal, total, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const { formatPrice } = useCurrency();
  
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const finalTotal = total;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Ingresa un código de cupón');
      return;
    }

    try {
      setApplyingCoupon(true);
      setCouponError('');
      await applyCoupon(couponCode.trim());
      setCouponCode('');
    } catch (error: any) {
      setCouponError(error.message || 'Cupón no válido');
    } finally {
      setApplyingCoupon(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-[#0b1221] border-l border-brand-green/20 shadow-2xl z-[200] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black uppercase text-white flex items-center gap-2">
                  <ShoppingBag size={24} className="text-brand-green" />
                  Tu Carrito
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded transition-colors"
                >
                  <X size={24} className="text-gray-400 hover:text-white" />
                </button>
              </div>
              <p className="text-gray-400 text-sm">
                {items.length} {items.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={64} className="text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg mb-2">Tu carrito está vacío</p>
                  <p className="text-gray-500 text-sm mb-6">Agrega productos para comenzar</p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-brand-green text-black font-bold uppercase rounded hover:bg-brand-green/90 transition-colors"
                  >
                    Ir a la tienda
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-brand-green/30 transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-20 h-20 bg-black/40 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-sm mb-1 truncate">
                            {item.name}
                          </h3>
                          <p className="text-brand-green font-bold text-lg mb-2">
                            {formatPrice(item.price)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="p-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
                            >
                              <Minus size={14} className="text-white" />
                            </button>
                            <span className="text-white font-bold min-w-[30px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
                            >
                              <Plus size={14} className="text-white" />
                            </button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors self-start"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with totals */}
            {items.length > 0 && (
              <div className="border-t border-white/10 p-6 bg-black/40">
                {/* Cupón Input */}
                {!appliedCoupon ? (
                  <div className="mb-4">
                    <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">
                      ¿Tienes un cupón?
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError('');
                          }}
                          placeholder="CÓDIGO"
                          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50 uppercase"
                          disabled={applyingCoupon}
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                        className="px-4 py-2 bg-brand-green hover:bg-brand-green/90 text-black font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applyingCoupon ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Aplicar'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-400 text-xs mt-2">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 bg-brand-green/10 border border-brand-green/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-brand-green" size={18} />
                        <div>
                          <p className="text-white font-bold text-sm">{appliedCoupon.code}</p>
                          <p className="text-gray-400 text-xs">{appliedCoupon.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  {/* Descuento del cupón */}
                  {appliedCoupon && appliedCoupon.discount > 0 && (
                    <div className="flex justify-between text-brand-green">
                      <span>Descuento ({appliedCoupon.code})</span>
                      <span>-{formatPrice(appliedCoupon.discount)}</span>
                    </div>
                  )}
                  
                  {appliedCoupon && appliedCoupon.freeShipping && (
                    <div className="flex justify-between text-brand-green">
                      <span>Envío Gratis ({appliedCoupon.code})</span>
                      <span>Aplicado</span>
                    </div>
                  )}
                  
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between text-white font-black text-xl">
                    <span>Total</span>
                    <span className="text-brand-green">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-brand-green text-black font-black uppercase tracking-wider rounded hover:bg-brand-green/90 transition-all shadow-[0_0_20px_rgba(148,193,31,0.3)] hover:shadow-[0_0_30px_rgba(148,193,31,0.5)]"
                >
                  Ir al Checkout
                  <ArrowRight size={20} />
                </Link>

                <button
                  onClick={onClose}
                  className="w-full mt-3 py-3 text-gray-400 hover:text-white text-sm font-bold uppercase transition-colors"
                >
                  Continuar Comprando
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
