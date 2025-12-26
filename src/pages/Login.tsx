import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight, Gamepad2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.error || err?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  // Quick login para desarrollo
  const quickAdminLogin = () => {
    setEmail('admin@tiocalcifer.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#0b1221] flex relative overflow-hidden">
      {/* Left Side - Hero/Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 border-r border-brand-green/20">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-green/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brand-orange/20 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-grid-animate opacity-5" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Gamepad2 size={64} className="text-brand-green mb-6" />
            <h2 className="text-6xl font-black text-white mb-6 leading-tight">
              BIENVENIDO<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green via-brand-yellow to-brand-orange">
                DE VUELTA
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Accede a tu arsenal de juegos, gestiona tus pedidos y descubre las últimas ofertas exclusivas.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              {[
                'Acceso instantáneo a tu biblioteca',
                'Ofertas exclusivas para miembros',
                'Gestión rápida de pedidos'
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-brand-green rounded-full" />
                  <span className="text-gray-300">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Mobile Background */}
        <div className="absolute inset-0 lg:hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brand-green/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brand-orange/10 blur-[100px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Gamepad2 size={48} className="text-brand-green mx-auto mb-4" />
            <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">
              INICIAR SESIÓN
            </h1>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">
              INICIA SESIÓN
            </h1>
            <p className="text-gray-400">Accede a tu cuenta</p>
          </div>

          {/* Login Form Card */}
          <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm border-2 border-brand-green/20 rounded-lg p-8 shadow-[0_0_50px_rgba(148,193,31,0.1)]">
          
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-black/40 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-black/40 text-brand-green focus:ring-brand-green" />
                <span className="text-sm text-gray-400">Recordarme</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-brand-green hover:text-brand-green/80 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-yellow hover:to-brand-green text-black py-4 rounded font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(148,193,31,0.3)] hover:shadow-[0_0_40px_rgba(148,193,31,0.6)] flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    INICIANDO...
                  </>
                ) : (
                  <>
                    ENTRAR AL JUEGO
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-brand-yellow to-brand-orange opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center p-6 bg-black/20 rounded-lg border border-white/10">
            <p className="text-gray-400 mb-2">¿Primera vez aquí?</p>
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 text-brand-green hover:text-brand-yellow font-bold transition-colors group"
            >
              CREAR CUENTA NUEVA
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        </motion.div>
      </div>
    </div>
  );
};
