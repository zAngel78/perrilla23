import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Plus, Trash2, Edit2, Loader2, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../../services/api.service';

export const EmailAccounts = () => {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/email-accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Error loading email accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProcessing(true);
      await apiService.post('/api/email-accounts', formData);
      await loadAccounts();
      setShowCreateModal(false);
      setFormData({ email: '', password: '' });
      alert('Cuenta creada exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al crear cuenta');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    
    try {
      setProcessing(true);
      await apiService.put(`/api/email-accounts/${selectedAccount}`, {
        password: formData.password
      });
      setShowUpdateModal(false);
      setSelectedAccount(null);
      setFormData({ email: '', password: '' });
      alert('Contraseña actualizada exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al actualizar contraseña');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (email: string) => {
    if (!confirm(`¿Estás seguro de eliminar la cuenta ${email}?`)) return;

    try {
      await apiService.delete(`/api/email-accounts/${email}`);
      await loadAccounts();
      alert('Cuenta eliminada exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al eliminar cuenta');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
            Cuentas de Correo
          </h1>
          <p className="text-gray-400">
            Gestiona las cuentas de correo de @tiocalcifer.com
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-brand-green hover:bg-brand-green/90 text-black px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Cuenta
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Total Cuentas</p>
          <p className="text-white text-3xl font-black">{accounts.length}</p>
        </div>
        <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Dominio</p>
          <p className="text-brand-green text-xl font-black">@tiocalcifer.com</p>
        </div>
        <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Webmail</p>
          <a 
            href="https://mail.tiocalcifer.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-400 text-lg font-bold hover:text-purple-300 transition-colors"
          >
            mail.tiocalcifer.com
          </a>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-[#121a2b] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-black text-white uppercase">Cuentas Activas</h2>
        </div>
        
        {accounts.length === 0 ? (
          <div className="p-12 text-center">
            <Mail size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No hay cuentas de correo creadas</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {accounts.map((email) => (
              <motion.div
                key={email}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-white/5 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-green/20 rounded-full flex items-center justify-center">
                    <Mail size={24} className="text-brand-green" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{email}</p>
                    <p className="text-gray-400 text-sm">Cuenta activa</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAccount(email);
                      setFormData({ email, password: '' });
                      setShowUpdateModal(true);
                    }}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all"
                    title="Cambiar contraseña"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(email)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f1629] border border-white/10 rounded-2xl max-w-md w-full"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-black text-white uppercase">Nueva Cuenta de Correo</h2>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-white font-bold mb-2">Email</label>
                <input
                  type="text"
                  placeholder="usuario@tiocalcifer.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-bold mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-brand-green hover:bg-brand-green/90 disabled:bg-gray-600 text-black py-3 rounded-lg font-bold uppercase transition-colors"
                >
                  {processing ? 'Creando...' : 'Crear Cuenta'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ email: '', password: '' });
                  }}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold uppercase transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Update Password Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f1629] border border-white/10 rounded-2xl max-w-md w-full"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-black text-white uppercase">Cambiar Contraseña</h2>
              <p className="text-gray-400 text-sm mt-1">{selectedAccount}</p>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-white font-bold mb-2">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-brand-green hover:bg-brand-green/90 disabled:bg-gray-600 text-black py-3 rounded-lg font-bold uppercase transition-colors"
                >
                  {processing ? 'Actualizando...' : 'Actualizar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedAccount(null);
                    setFormData({ email: '', password: '' });
                  }}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold uppercase transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
