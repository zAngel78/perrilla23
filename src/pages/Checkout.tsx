import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, CreditCard, ShieldCheck, Plus, Minus, ShoppingBag, Lock, Truck, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ordersService } from '../services/orders.service';
import { paymentsService } from '../services/payments.service';

export const Checkout = () => {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [processing, setProcessing] = useState(false);

  const subtotal = total;
  const shipping = 0; // Free shipping
  const finalTotal = subtotal + shipping;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para realizar una compra');
      navigate('/login');
      return;
    }

    try {
      setProcessing(true);

      // Crear la orden
      const orderData = {
        userId: user?.id,
        customerName: user?.name || 'Cliente',
        customerEmail: user?.email || '',
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          isDigitalProduct: item.isDigitalProduct || false,
        })),
        subtotal: subtotal,
        shipping: shipping,
        total: finalTotal,
        status: 'pending',
      };

      const order = await ordersService.create(orderData);
      console.log('✅ Orden creada:', order.id);

      // Crear preferencia de pago en MercadoPago
      const paymentPreference = await paymentsService.createPreference(order.id);
      console.log('✅ Preferencia creada:', paymentPreference.data.preferenceId);

      // Redirigir a MercadoPago
      window.location.href = paymentPreference.data.initPoint;

      // Nota: El carrito se limpiará después de que el pago sea exitoso
    } catch (error) {
      console.error('Error en checkout:', error);
      alert('Error al procesar el pago. Por favor intenta nuevamente.');
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b1221] pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <div className="bg-white/5 p-8 rounded-full mb-6 inline-block">
            <ShoppingBag className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 uppercase">Carrito Vacío</h2>
          <p className="text-gray-400 mb-8 text-lg">No has agregado productos aún. Explora nuestra tienda y encuentra algo increíble.</p>
          <Link to="/shop" className="inline-block bg-brand-green text-black px-8 py-4 rounded font-bold uppercase hover:bg-brand-green/90 transition-colors">
            Ir a la Tienda
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1221] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 uppercase tracking-tight">Checkout</h1>
          <p className="text-gray-400">Revisa tus productos y completa tu compra</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white uppercase">Tus Productos</h2>
              <span className="text-gray-400">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-brand-green/30 transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 bg-black/40 rounded overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-lg mb-1 truncate">{item.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">{item.category}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-black/40 rounded p-1">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                              <Minus size={16} className="text-white" />
                            </button>
                            <span className="text-white font-bold min-w-[30px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                              <Plus size={16} className="text-white" />
                            </button>
                          </div>
                          
                          <span className="text-brand-green font-bold text-lg">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Promo Code */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Package size={18} className="text-brand-green" />
                Código de Descuento
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ingresa tu código"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50"
                />
                <button className="px-6 py-2 bg-brand-green text-black font-bold rounded hover:bg-brand-green/90 transition-colors">
                  Aplicar
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 rounded-lg p-6 sticky top-28">
              <h3 className="text-2xl font-black text-white mb-6 uppercase">Resumen</h3>
              
              {/* Features */}
              <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Truck size={16} className="text-brand-green" />
                  <span>Envío gratis en pedidos +$50</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <ShieldCheck size={16} className="text-brand-green" />
                  <span>Compra 100% segura</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Lock size={16} className="text-brand-green" />
                  <span>Datos encriptados</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Envío</span>
                  <span className="text-brand-green font-bold">Gratis</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between text-white font-black text-2xl">
                  <span>Total</span>
                  <span className="text-brand-green">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button 
                onClick={handleCheckout}
                disabled={processing}
                className="w-full bg-brand-green hover:bg-brand-green/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-black py-4 rounded font-black text-lg mb-3 transition-all uppercase tracking-wider shadow-[0_0_20px_rgba(148,193,31,0.3)] hover:shadow-[0_0_30px_rgba(148,193,31,0.5)] flex items-center justify-center gap-3"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Pagar con MercadoPago
                  </>
                )}
              </button>
              
              <Link
                to="/shop"
                className="block w-full text-center py-3 text-gray-400 hover:text-white text-sm font-bold uppercase transition-colors"
              >
                Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
