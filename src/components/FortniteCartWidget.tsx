import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, ChevronLeft, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useNavigate } from 'react-router-dom';

export const FortniteCartWidget: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { items, removeFromCart, total } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = total;

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="hidden lg:block fixed right-0 top-24 z-40 h-[calc(100vh-6rem)]"
    >
      <div className="relative h-full">
        <motion.div
          animate={{ width: isExpanded ? '320px' : '64px' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="h-full bg-[#121a2b]/95 backdrop-blur-md border-l border-brand-green/20 shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-brand-green/20">
            <div className="flex items-center gap-3">
              {/* Icon Container */}
              <div className="relative w-8 h-8 bg-brand-green rounded flex items-center justify-center flex-shrink-0">
                <ShoppingCart size={18} className="text-brand-dark" />
                {totalItems > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-orange rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-black">{totalItems}</span>
                  </div>
                )}
              </div>

              {/* Text (only visible when expanded) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap flex-1"
              >
                <h3 className="text-white font-black uppercase tracking-tight text-sm">
                  Mi Carrito
                </h3>
                <p className="text-brand-green text-xs font-bold">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="overflow-y-auto h-[calc(100%-200px)] scrollbar-hide py-2">
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isExpanded ? 1 : 0 }}
                className="p-4 text-center"
              >
                <ShoppingCart size={48} className="mx-auto text-gray-600 mb-2" />
                <p className="text-gray-400 text-sm font-bold">Carrito vacío</p>
              </motion.div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="px-4 py-3 hover:bg-white/5 transition-all group border-b border-white/5"
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-white/5">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info (only visible when expanded) */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isExpanded ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 overflow-hidden min-w-0"
                    >
                      <p className="text-white text-xs font-black uppercase truncate leading-tight">
                        {item.name}
                      </p>
                      <p className="text-brand-green text-xs font-bold mt-1">
                        {formatPrice(item.price)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-gray-400 text-[10px] font-bold">
                          x{item.quantity}
                        </p>
                      )}
                    </motion.div>

                    {/* Remove button (only visible when expanded) */}
                    {isExpanded && (
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer - Total & Checkout */}
          {items.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#0b1221] border-t border-brand-green/20">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-xs font-bold uppercase">Total</span>
                    <span className="text-white font-black text-lg">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/cart')}
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-brand-dark font-black uppercase text-sm py-3 rounded transition-all flex items-center justify-center gap-2 group"
                >
                  Ver Carrito
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Expand Hint (when collapsed) */}
        {!isExpanded && (
          <div className="absolute top-1/2 -left-8 -translate-y-1/2 bg-brand-green/10 backdrop-blur-sm border border-brand-green/30 px-2 py-1 rounded-l text-brand-green text-[10px] font-bold uppercase tracking-wider pointer-events-none">
            <ChevronLeft size={12} className="animate-pulse" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
