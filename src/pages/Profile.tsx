import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Phone, Calendar, Settings, LogOut, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { usersService } from '../services/users.service';

export const Profile = () => {
  const { user: authUser, logout, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState({
    name: authUser?.name || 'Usuario',
    email: authUser?.email || '',
    phone: authUser?.phone || '',
    address: authUser?.address || '',
  });

  const handleSaveChanges = async () => {
    if (!authUser?.id) return;
    
    try {
      setIsSaving(true);
      
      // Actualizar en el backend
      const updatedUser = await usersService.update(authUser.id, {
        name: userData.name,
        phone: userData.phone,
      });
      
      // Actualizar el contexto de autenticación
      if (updateUser) {
        updateUser(updatedUser);
      }
      
      setIsEditing(false);
      alert('✅ Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('❌ Error al actualizar el perfil. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1221] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 uppercase tracking-tight">Mi Perfil</h1>
          <p className="text-gray-400">Gestiona tu información personal</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Card */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <div className="text-center">
                {authUser?.role === 'admin' ? (
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-brand-green shadow-lg shadow-brand-green/20">
                    <img 
                      src="https://i.postimg.cc/8ctJNjFK/anonymous-8291223-1280.webp" 
                      alt="Admin Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-brand-green to-brand-orange rounded-full flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                <h2 className="text-2xl font-black text-white mb-2">{userData.name}</h2>
                {authUser?.role === 'admin' && (
                  <span className="inline-block px-3 py-1 mb-2 bg-brand-green/20 border border-brand-green/50 text-brand-green text-xs font-bold rounded-full uppercase">
                    👑 Administrador
                  </span>
                )}
                <p className="text-gray-400 mb-1">{userData.email}</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-4">
                  <Calendar size={16} />
                  <span>Miembro desde {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString('es', { month: 'long', year: 'numeric' }) : 'Reciente'}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
                <button 
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Cerrar Sesión
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Personal Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-white uppercase">Información Personal</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-brand-green hover:text-brand-green/80 transition-colors"
                  >
                    <Edit2 size={18} />
                    <span className="font-bold text-sm">Editar</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="p-2 bg-brand-green hover:bg-brand-green/90 text-black rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        // Restaurar datos originales
                        setUserData({
                          name: authUser?.name || 'Usuario',
                          email: authUser?.email || '',
                          phone: authUser?.phone || '',
                          address: authUser?.address || '',
                        });
                      }}
                      disabled={isSaving}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Nombre Completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-brand-green/50"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-white bg-black/20 px-4 py-3 rounded">
                      <User size={18} className="text-gray-400" />
                      <span>{userData.name}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Email
                  </label>
                  <div className="flex items-center gap-2 text-white bg-black/20 px-4 py-3 rounded">
                    <Mail size={18} className="text-gray-400" />
                    <span>{userData.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">El email no se puede cambiar</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Teléfono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                      placeholder="+52 123 456 7890"
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-brand-green/50"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-white bg-black/20 px-4 py-3 rounded">
                      <Phone size={18} className="text-gray-400" />
                      <span>{userData.phone || 'No especificado'}</span>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Dirección
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.address}
                      onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                      placeholder="Tu dirección"
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-brand-green/50"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-white bg-black/20 px-4 py-3 rounded">
                      <MapPin size={18} className="text-gray-400" />
                      <span>{userData.address || 'No especificado'}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
