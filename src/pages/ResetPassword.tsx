import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../services/api.service';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Token de recuperación inválido o faltante');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token de recuperación inválido');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await apiService.post('/api/auth/reset-password', {
        token,
        newPassword,
      });
      setSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al restablecer contraseña');
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
              ¡Contraseña Actualizada!
            </h1>
            
            <p className="text-gray-400 mb-6">
              Tu contraseña ha sido restablecida exitosamente.
            </p>
            
            <p className="text-gray-500 text-sm mb-8">
              Serás redirigido al login en 3 segundos...
            </p>
            
            <Link
              to="/login"
              className="inline-block bg-brand-green hover:bg-brand-green/90 text-brand-dark px-8 py-3 rounded-lg font-bold uppercase transition-colors"
            >
              Ir al Login
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
            <Lock size={32} className="text-brand-green" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase mb-2">
            Nueva Contraseña
          </h1>
          <p className="text-gray-400">
            Crea una nueva contraseña segura para tu cuenta
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

            {!token && (
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  El enlace de recuperación es inválido. Por favor solicita uno nuevo.
                </p>
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="block text-white font-bold mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50 transition-colors pr-12"
                  required
                  disabled={!token}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-white font-bold mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50 transition-colors pr-12"
                  required
                  disabled={!token}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-brand-green hover:bg-brand-green/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-brand-dark py-4 rounded-lg font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Actualizando...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Restablecer Contraseña
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link
              to="/login"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Volver al Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
