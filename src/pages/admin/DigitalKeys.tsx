import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { productsService } from '../../services/products.service';
import { Product, DigitalKey } from '../../types';

interface KeyWithProduct extends DigitalKey {
  productName: string;
  productId: string;
}

export const DigitalKeys = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [allKeys, setAllKeys] = useState<KeyWithProduct[]>([]);
  const [filteredKeys, setFilteredKeys] = useState<KeyWithProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'used' | 'reserved'>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterKeys();
  }, [searchTerm, statusFilter, allKeys]);

  const loadData = async () => {
    try {
      setLoading(true);
      const productsData = await productsService.getAll();
      setProducts(productsData);

      // Extraer todas las keys de todos los productos
      const keys: KeyWithProduct[] = [];
      productsData.forEach((product) => {
        if (product.isDigitalProduct && product.digitalKeys) {
          product.digitalKeys.forEach((key) => {
            keys.push({
              ...key,
              productName: product.name,
              productId: product.id || '',
            });
          });
        }
      });

      setAllKeys(keys);
      setFilteredKeys(keys);
    } catch (error) {
      console.error('Error loading keys:', error);
      alert('Error al cargar las keys');
    } finally {
      setLoading(false);
    }
  };

  const filterKeys = () => {
    let filtered = [...allKeys];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (key) =>
          key.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          key.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter((key) => key.status === statusFilter);
    }

    setFilteredKeys(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'used':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'reserved':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'used':
        return 'Enviada';
      case 'reserved':
        return 'Reservada';
      default:
        return status;
    }
  };

  const stats = {
    total: allKeys.length,
    available: allKeys.filter((k) => k.status === 'available').length,
    used: allKeys.filter((k) => k.status === 'used').length,
    reserved: allKeys.filter((k) => k.status === 'reserved').length,
  };

  const exportKeys = () => {
    const csv = [
      ['Producto', 'Key', 'Estado', 'Usado Por', 'Fecha de Uso', 'Fecha de Creación'],
      ...filteredKeys.map((key) => [
        key.productName,
        key.code,
        getStatusLabel(key.status),
        key.usedBy || '-',
        key.usedAt ? new Date(key.usedAt).toLocaleString() : '-',
        new Date(key.createdAt).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keys-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-brand-green animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Key className="text-brand-green" />
            Gestión de Keys Digitales
          </h1>
          <p className="text-gray-400 mt-2">
            Administra todas las keys de productos digitales
          </p>
        </div>
        <button
          onClick={exportKeys}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border border-brand-green/30 rounded-lg transition-all"
        >
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121a2b] border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-semibold uppercase">Total Keys</p>
              <p className="text-3xl font-black text-white mt-1">{stats.total}</p>
            </div>
            <Key className="text-blue-400 w-10 h-10" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#121a2b] border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-semibold uppercase">Disponibles</p>
              <p className="text-3xl font-black text-green-400 mt-1">{stats.available}</p>
            </div>
            <Key className="text-green-400 w-10 h-10" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#121a2b] border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-semibold uppercase">Enviadas</p>
              <p className="text-3xl font-black text-gray-400 mt-1">{stats.used}</p>
            </div>
            <Key className="text-gray-400 w-10 h-10" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#121a2b] border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-semibold uppercase">Reservadas</p>
              <p className="text-3xl font-black text-yellow-400 mt-1">{stats.reserved}</p>
            </div>
            <Key className="text-yellow-400 w-10 h-10" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por key o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all appearance-none cursor-pointer [&>option]:bg-[#121a2b] [&>option]:text-white"
            >
              <option value="all" className="bg-[#121a2b] text-white">Todos los estados</option>
              <option value="available" className="bg-[#121a2b] text-white">Disponibles</option>
              <option value="used" className="bg-[#121a2b] text-white">Enviadas</option>
              <option value="reserved" className="bg-[#121a2b] text-white">Reservadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Keys Table */}
      <div className="bg-[#121a2b] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/30">
              <tr>
                <th className="text-left px-6 py-4 text-gray-400 font-semibold uppercase text-sm">
                  Producto
                </th>
                <th className="text-left px-6 py-4 text-gray-400 font-semibold uppercase text-sm">
                  Key
                </th>
                <th className="text-left px-6 py-4 text-gray-400 font-semibold uppercase text-sm">
                  Estado
                </th>
                <th className="text-left px-6 py-4 text-gray-400 font-semibold uppercase text-sm">
                  Usado Por
                </th>
                <th className="text-left px-6 py-4 text-gray-400 font-semibold uppercase text-sm">
                  Fecha de Uso
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No se encontraron keys
                  </td>
                </tr>
              ) : (
                filteredKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-semibold">{key.productName}</p>
                      <p className="text-gray-500 text-sm">{key.productId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-brand-green font-mono text-sm">{key.code}</code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                          key.status
                        )}`}
                      >
                        {getStatusLabel(key.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {key.usedBy ? (
                        <code className="text-sm">{key.usedBy}</code>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {key.usedAt ? new Date(key.usedAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm">
        Mostrando {filteredKeys.length} de {allKeys.length} keys
      </div>
    </div>
  );
};
