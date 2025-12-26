import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, Home, ShoppingBag, RefreshCw } from 'lucide-react';

export const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1221] to-[#0a0f1e] pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121a2b] border border-red-500/30 rounded-2xl p-8 md:p-12 text-center"
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-red-500/20 rounded-full mb-6"
          >
            <XCircle className="w-16 h-16 text-red-500" strokeWidth={2.5} />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight"
          >
            Pago Rechazado
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg mb-8"
          >
            {orderId ? (
              <>Tu pago para la orden <span className="text-red-400 font-bold">#{orderId}</span> no pudo ser procesado</>
            ) : (
              'Tu pago no pudo ser procesado'
            )}
          </motion.p>

          {/* Reasons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-left"
          >
            <h3 className="text-white font-bold mb-4 text-center">Posibles razones:</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Fondos insuficientes en tu cuenta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Datos de la tarjeta incorrectos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>La tarjeta fue rechazada por el banco</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Límite de compra excedido</span>
              </li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/checkout"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-green hover:bg-brand-green/80 text-black font-bold rounded-lg transition-all"
            >
              <RefreshCw size={20} />
              Intentar Nuevamente
            </Link>
            
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-lg transition-all"
            >
              <ShoppingBag size={20} />
              Seguir Comprando
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

        {/* Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-500 text-sm mb-2">
            ¿Necesitas ayuda? Contáctanos y te asistiremos
          </p>
          <a 
            href="mailto:support@tiocalcifer.com" 
            className="text-brand-green hover:underline font-semibold"
          >
            support@tiocalcifer.com
          </a>
        </motion.div>
      </div>
    </div>
  );
};
