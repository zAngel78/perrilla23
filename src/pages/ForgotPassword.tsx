import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { apiService } from '../services/api.service';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiService.post('/api/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al procesar solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-[#0f1629] border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-brand-green" />
            </div>
            
            <h1 className="text-3xl font-black text-white uppercase mb-4">
              ¡Correo Enviado!
            </h1>
            
            <p className="text-gray-400 mb-6">
              Si el correo <strong className="text-white">{email}</strong> está registrado, 
              recibirás instrucciones para restablecer tu contraseña.
            </p>
            
            <p className="text-gray-500 text-sm mb-8">
              Revisa tu bandeja de entrada y carpeta de spam. El enlace es válido por 1 hora.
            </p>
            
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-brand-green hover:text-white transition-colors font-bold"
            >
              <ArrowLeft size={20} />
              Volver al Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-brand-green" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase mb-2">
            ¿Olvidaste tu Contraseña?
          </h1>
          <p className="text-gray-400">
            No te preocupes, te enviaremos instrucciones para recuperarla
          </p>
        </div>

        {/* Form */}
        <div className="bg-[#0f1629] border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-white font-bold mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50 transition-colors"
                required
              />
              <p className="text-gray-500 text-sm mt-2">
                Ingresa el email asociado a tu cuenta
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-green hover:bg-brand-green/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-brand-dark py-4 rounded-lg font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail size={20} />
                  Enviar Instrucciones
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Volver al Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
