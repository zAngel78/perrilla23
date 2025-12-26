import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Calendar, Edit2, Trash2, Loader2 } from 'lucide-react';
import { usersService, User as UserType } from '../../services/users.service';

export const Users = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    customers: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        usersService.getAll(),
        usersService.getStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      await usersService.delete(userId);
      setUsers(users.filter(u => u.id !== userId));
      alert('Usuario eliminado correctamente');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error?.error || 'Error al eliminar usuario');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
      </div>
    );
  }

  const usersExample = [
    {
      id: 'user-1',
      name: 'Admin TioCalcifer',
      email: 'admin@tiocalcifer.com',
      role: 'admin',
      createdAt: '2024-01-01',
      orders: 0,
    },
    {
      id: 'user-2',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      role: 'user',
      createdAt: '2024-12-15',
      orders: 5,
    },
    {
      id: 'user-3',
      name: 'María González',
      email: 'maria@example.com',
      role: 'user',
      createdAt: '2024-12-20',
      orders: 2,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
          Usuarios
        </h1>
        <p className="text-gray-400">
          Gestiona los usuarios de tu plataforma
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Total Usuarios</p>
          <p className="text-white text-3xl font-black">{stats.total}</p>
        </div>
        <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Administradores</p>
          <p className="text-brand-green text-3xl font-black">
            {stats.admins}
          </p>
        </div>
        <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Clientes</p>
          <p className="text-brand-orange text-3xl font-black">
            {stats.customers}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#121a2b] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Órdenes
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Registrado
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-green/20 rounded-full flex items-center justify-center">
                        <span className="text-brand-green font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-white font-semibold">{user.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail size={16} />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-green/20 text-brand-green">
                        <Shield size={14} />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-gray-300">
                        <User size={14} />
                        Usuario
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white">{user.totalOrders || 0}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={16} />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => alert('Editar usuario: Funcionalidad en desarrollo')}
                        className="p-2 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={user.role === 'admin'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
