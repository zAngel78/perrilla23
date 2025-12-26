import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Mail, Home, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { paymentsService } from '../services/payments.service';

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState<any>(null);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    // Limpiar el carrito
    clearCart();

    // Obtener estado del pago
    const checkPaymentStatus = async () => {
      try {
        const status = await paymentsService.getStatus(orderId);
        setOrderStatus(status.data);
      } catch (error) {
        console.error('Error checking payment status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1221] to-[#0a0f1e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1221] to-[#0a0f1e] pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121a2b] border border-brand-green/30 rounded-2xl p-8 md:p-12 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-brand-green/20 rounded-full mb-6"
          >
            <CheckCircle className="w-16 h-16 text-brand-green" strokeWidth={2.5} />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight"
          >
            ¡Pago Exitoso! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg mb-8"
          >
            Tu orden <span className="text-brand-green font-bold">#{orderId}</span> ha sido procesada correctamente
          </motion.p>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <Mail className="w-8 h-8 text-brand-green mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">Revisa tu Email</h3>
              <p className="text-gray-400 text-sm">
                Te hemos enviado tus códigos digitales a tu correo electrónico
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <Package className="w-8 h-8 text-brand-yellow mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">Orden Confirmada</h3>
              <p className="text-gray-400 text-sm">
                Tu orden está siendo procesada y recibirás tus productos digitales
              </p>
            </motion.div>
          </div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-brand-green/10 border border-brand-green/30 rounded-xl p-6 mb-8"
          >
            <p className="text-brand-green font-semibold text-sm">
              💡 <strong>Importante:</strong> Guarda tus códigos en un lugar seguro. Si no recibes el correo en los próximos minutos, revisa tu carpeta de spam.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/profile"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-green hover:bg-brand-green/80 text-black font-bold rounded-lg transition-all"
            >
              <ShoppingBag size={20} />
              Ver Mis Órdenes
            </Link>
            
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-lg transition-all"
            >
              <Home size={20} />
              Volver al Inicio
            </Link>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-500 text-sm">
            ¿Tienes alguna pregunta? Contáctanos en{' '}
            <a href="mailto:support@tiocalcifer.com" className="text-brand-green hover:underline">
              support@tiocalcifer.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
