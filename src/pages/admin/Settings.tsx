import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Store, Mail, Lock, Bell, DollarSign } from 'lucide-react';
import { apiService } from '../../services/api.service';

export const Settings = () => {
  const [saving, setSaving] = useState(false);
  const [vbucksRate, setVbucksRate] = useState(4.4);
  const [slideInterval, setSlideInterval] = useState(5000);
  const [fortniteUsernames, setFortniteUsernames] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/settings');
      setVbucksRate(response.data.fortniteVBucksRate || 4.4);
      setSlideInterval(response.data.heroSlideInterval || 5000);
      setFortniteUsernames(response.data.fortniteUsernames || '');
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.put('/api/settings', {
        fortniteVBucksRate: parseFloat(vbucksRate.toString()),
        heroSlideInterval: parseInt(slideInterval.toString()),
        fortniteUsernames: fortniteUsernames.trim()
      });
      alert('✅ Configuración guardada correctamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
            Configuración
          </h1>
          <p className="text-gray-400">
            Personaliza tu tienda
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-green hover:bg-brand-green/90 text-black font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración de Fortnite - NUEVO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121a2b] border border-white/10 rounded-xl p-6 lg:col-span-2"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-brand-green" />
            </div>
            <h2 className="text-white font-bold text-lg uppercase tracking-tight">
              Configuración de Fortnite V-Bucks
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-2">
                Precio por V-Buck (Pesos Chilenos - CLP)
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={vbucksRate}
                    onChange={(e) => setVbucksRate(parseFloat(e.target.value) || 4.4)}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
                    placeholder="4.4"
                  />
                </div>
                <div className="text-gray-400 text-sm whitespace-nowrap">
                  CLP por V-Buck
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-2">
                Define cuántos pesos chilenos cuesta cada V-Buck (por defecto: $4.4 CLP)
              </p>
            </div>

            {/* Ejemplos de conversión */}
            <div className="bg-black/30 rounded-lg p-4 mt-4">
              <p className="text-gray-400 text-sm font-semibold mb-3">Ejemplos de Conversión:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-brand-green font-bold text-lg">800 V-Bucks</p>
                  <p className="text-gray-400 text-sm">{(800 * vbucksRate).toLocaleString('es-CL')} CLP</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-brand-green font-bold text-lg">1,500 V-Bucks</p>
                  <p className="text-gray-400 text-sm">{(1500 * vbucksRate).toLocaleString('es-CL')} CLP</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-brand-green font-bold text-lg">2,000 V-Bucks</p>
                  <p className="text-gray-400 text-sm">{(2000 * vbucksRate).toLocaleString('es-CL')} CLP</p>
                </div>
              </div>
            </div>

            {/* Usernames de Fortnite para envío de regalos */}
            <div className="border-t border-white/10 pt-6 mt-6">
              <label className="block text-gray-400 text-sm font-semibold mb-2">
                Usernames de Fortnite (para envío de regalos)
              </label>
              <textarea
                rows={3}
                value={fortniteUsernames}
                onChange={(e) => setFortniteUsernames(e.target.value)}
                disabled={loading}
                placeholder="Ej: TioCalcifer_Store, TioCalcifer_Gifts&#10;Escribe un username por línea"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50 transition-all resize-none font-mono text-sm"
              />
              <p className="text-gray-500 text-sm mt-2">
                Escribe los nombres de usuario de las cuentas de Fortnite que usas para enviar regalos (uno por línea). Los clientes deberán agregar estas cuentas como amigos antes de comprar.
              </p>

              {fortniteUsernames.trim() && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mt-3">
                  <p className="text-purple-200 text-xs font-semibold mb-2">Vista previa (cómo lo verán los clientes):</p>
                  <div className="space-y-1">
                    {fortniteUsernames.split('\n').filter(u => u.trim()).map((username, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-purple-400 flex-shrink-0">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <code className="text-purple-300 font-mono">{username.trim()}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Configuración de Hero Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#121a2b] border border-white/10 rounded-xl p-6 lg:col-span-2"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-brand-green" />
            </div>
            <h2 className="text-white font-bold text-lg uppercase tracking-tight">
              Configuración del Hero Slider
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-2">
                Intervalo de Cambio Automático (milisegundos)
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="number"
                    min="2000"
                    max="30000"
                    step="1000"
                    value={slideInterval}
                    onChange={(e) => setSlideInterval(parseInt(e.target.value) || 5000)}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
                    placeholder="5000"
                  />
                </div>
                <div className="text-gray-400 text-sm whitespace-nowrap">
                  = {(slideInterval / 1000).toFixed(1)} segundos
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-2">
                Tiempo entre cambios automáticos de slides (mínimo 2s, máximo 30s)
              </p>
            </div>

            {/* Vista previa del intervalo */}
            <div className="bg-black/30 rounded-lg p-4 mt-4">
              <p className="text-gray-400 text-sm font-semibold mb-3">Ejemplos:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setSlideInterval(3000)}
                  className={`bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-all ${
                    slideInterval === 3000 ? 'ring-2 ring-brand-green' : ''
                  }`}
                >
                  <p className="text-brand-green font-bold text-lg">Rápido</p>
                  <p className="text-gray-400 text-sm">3 segundos</p>
                </button>
                <button
                  onClick={() => setSlideInterval(5000)}
                  className={`bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-all ${
                    slideInterval === 5000 ? 'ring-2 ring-brand-green' : ''
                  }`}
                >
                  <p className="text-brand-green font-bold text-lg">Normal</p>
                  <p className="text-gray-400 text-sm">5 segundos (default)</p>
                </button>
                <button
                  onClick={() => setSlideInterval(8000)}
                  className={`bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-all ${
                    slideInterval === 8000 ? 'ring-2 ring-brand-green' : ''
                  }`}
                >
                  <p className="text-brand-green font-bold text-lg">Lento</p>
                  <p className="text-gray-400 text-sm">8 segundos</p>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Información de la Tienda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#121a2b] border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-brand-green" />
            </div>
            <h2 className="text-white font-bold text-lg uppercase tracking-tight">
              Información de la Tienda
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-2">
                Nombre de la Tienda
              </label>
              <input
                type="text"
                defaultValue="TioCalcifer Gaming"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-2">
                Descripción
              </label>
              <textarea
                rows={3}
                defaultValue="Tu tienda gaming de confianza"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                defaultValue="+1 234 567 890"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Email */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#121a2b] border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-brand-orange" />
            </div>
            <h2 className="text-white font-bold text-lg uppercase tracking-tight">
              Configuración de Email
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-2">
                Email de Contacto
              </label>
              <input
                type="email"
                defaultValue="info@tiocalcifer.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-2">
                Email de Soporte
              </label>
              <input
                type="email"
                defaultValue="support@tiocalcifer.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
              />
            </div>

            <div className="pt-4 border-t border-white/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-green focus:ring-brand-green"
                />
                <span className="text-white text-sm">
                  Enviar emails de confirmación de orden
                </span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Seguridad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#121a2b] border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-400/10 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-white font-bold text-lg uppercase tracking-tight">
              Seguridad
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-2">
                Contraseña Actual
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-2">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Notificaciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#121a2b] border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-yellow/10 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-brand-yellow" />
            </div>
            <h2 className="text-white font-bold text-lg uppercase tracking-tight">
              Notificaciones
            </h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <span className="text-white text-sm">Nuevas órdenes</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-green focus:ring-brand-green"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <span className="text-white text-sm">Productos con bajo stock</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-green focus:ring-brand-green"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <span className="text-white text-sm">Nuevos usuarios</span>
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-green focus:ring-brand-green"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <span className="text-white text-sm">Reportes semanales</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-green focus:ring-brand-green"
              />
            </label>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
