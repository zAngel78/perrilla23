import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Gamepad2, Trophy, Star, Crown, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';

export const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // Redirigir al home después del registro exitoso
      navigate('/');
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err?.error || err?.message || 'Error al registrarse. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#0b1221] flex relative overflow-hidden">
      {/* Left Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative order-2 lg:order-1">
        {/* Mobile Background */}
        <div className="absolute inset-0 lg:hidden z-0">
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-brand-yellow/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-brand-orange/10 blur-[100px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Gamepad2 size={48} className="text-brand-orange mx-auto mb-4" />
            <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">
              ÚNETE
            </h1>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">
              CREAR CUENTA
            </h1>
            <p className="text-gray-400">Comienza tu aventura</p>
          </div>

          {/* Register Form Card */}
          <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm border-2 border-brand-orange/20 rounded-lg p-8 shadow-[0_0_50px_rgba(237,118,78,0.1)]">
          
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
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-black/40 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 mt-1 rounded border-white/20 bg-black/40 text-brand-green focus:ring-brand-green" required />
                <span className="text-sm text-gray-400">
                  Acepto los{' '}
                  <Link to="/terms" className="text-brand-green hover:text-brand-green/80">
                    términos y condiciones
                  </Link>
                  {' '}y la{' '}
                  <Link to="/privacy" className="text-brand-green hover:text-brand-green/80">
                    política de privacidad
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-gradient-to-r from-brand-orange to-brand-yellow hover:from-brand-yellow hover:to-brand-orange text-black py-4 rounded font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(237,118,78,0.3)] hover:shadow-[0_0_40px_rgba(237,118,78,0.6)] flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    REGISTRANDO...
                  </>
                ) : (
                  <>
                    COMENZAR AVENTURA
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-brand-green to-brand-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center p-6 bg-black/20 rounded-lg border border-white/10">
            <p className="text-gray-400 mb-2">¿Ya eres parte del equipo?</p>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-brand-orange hover:text-brand-yellow font-bold transition-colors group"
            >
              INICIAR SESIÓN
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        </motion.div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 border-l border-brand-orange/20 order-1 lg:order-2">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-brand-orange/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-brand-yellow/20 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-grid-animate opacity-5" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Trophy size={64} className="text-brand-orange mb-6" />
            <h2 className="text-6xl font-black text-white mb-6 leading-tight">
              ÚNETE A<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-brand-yellow to-brand-green">
                LA ÉLITE
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Crea tu cuenta y desbloquea beneficios exclusivos, ofertas especiales y acceso prioritario a lanzamientos.
            </p>
            
            {/* Benefits */}
            <div className="space-y-4">
              {[
                { icon: Crown, text: 'Acceso VIP a ofertas exclusivas' },
                { icon: Star, text: 'Sistema de recompensas y puntos' },
                { icon: Gamepad2, text: 'Biblioteca personal de juegos' }
              ].map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/10"
                >
                  <benefit.icon size={24} className="text-brand-orange" />
                  <span className="text-gray-300">{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
