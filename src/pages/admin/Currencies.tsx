import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, DollarSign, Globe, Star } from 'lucide-react';
import { currenciesService } from '../../services/currencies.service';
import { Currency } from '../../context/CurrencyContext';

export const Currencies = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    symbol: '$',
    rateToUSD: 1,
    isDefault: false,
    active: true,
  });

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      setLoading(true);
      const data = await currenciesService.getAll();
      setCurrencies(data);
    } catch (error) {
      console.error('Error loading currencies:', error);
      alert('Error al cargar monedas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (currency?: Currency) => {
    if (currency) {
      setEditingCurrency(currency);
      setFormData({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        rateToUSD: currency.rateToUSD,
        isDefault: currency.isDefault,
        active: currency.active,
      });
    } else {
      setEditingCurrency(null);
      setFormData({
        code: '',
        name: '',
        symbol: '$',
        rateToUSD: 1,
        isDefault: false,
        active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCurrency(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name || !formData.symbol || formData.rateToUSD <= 0) {
      alert('Todos los campos son requeridos y la tasa debe ser mayor a 0');
      return;
    }

    try {
      if (editingCurrency) {
        await currenciesService.update(editingCurrency.id, formData);
        alert('Moneda actualizada correctamente');
      } else {
        await currenciesService.create(formData);
        alert('Moneda creada correctamente');
      }
      handleCloseModal();
      loadCurrencies();
    } catch (error) {
      console.error('Error saving currency:', error);
      alert('Error al guardar la moneda');
    }
  };

  const handleDelete = async (id: string, isDefault: boolean) => {
    if (isDefault) {
      alert('No se puede eliminar la moneda por defecto');
      return;
    }

    if (!confirm('¿Estás seguro de eliminar esta moneda?')) return;

    try {
      await currenciesService.delete(id);
      alert('Moneda eliminada correctamente');
      loadCurrencies();
    } catch (error) {
      console.error('Error deleting currency:', error);
      alert('Error al eliminar la moneda');
    }
  };

  const handleToggleActive = async (currency: Currency) => {
    if (currency.isDefault && !currency.active) {
      alert('No se puede desactivar la moneda por defecto');
      return;
    }

    try {
      await currenciesService.update(currency.id, { active: !currency.active });
      loadCurrencies();
    } catch (error) {
      console.error('Error toggling currency:', error);
      alert('Error al actualizar la moneda');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando monedas...</p>
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
            <Globe className="text-brand-green" />
            Gestión de Monedas
          </h1>
          <p className="text-gray-400 mt-2">
            Administra las monedas disponibles en la tienda
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green hover:bg-brand-green/80 text-black font-bold rounded-lg transition-all"
        >
          <Plus size={20} />
          Nueva Moneda
        </button>
      </div>

      {/* Currencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currencies.map((currency, index) => (
          <motion.div
            key={currency.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-[#121a2b] border rounded-xl p-6 ${
              currency.isDefault
                ? 'border-brand-green ring-2 ring-brand-green/20'
                : 'border-white/10'
            } ${!currency.active ? 'opacity-50' : ''}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-green/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-brand-green" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    {currency.code}
                    {currency.isDefault && (
                      <Star className="text-brand-green" size={16} fill="currentColor" />
                    )}
                  </h3>
                  <p className="text-gray-400 text-sm">{currency.name}</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Símbolo:</span>
                <span className="text-white font-semibold">{currency.symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tasa (USD):</span>
                <span className="text-white font-semibold">{currency.rateToUSD}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estado:</span>
                <span className={`font-semibold ${currency.active ? 'text-green-400' : 'text-gray-500'}`}>
                  {currency.active ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </div>

            {/* Example */}
            <div className="bg-black/30 rounded-lg p-3 mb-4">
              <p className="text-gray-500 text-xs mb-1">Ejemplo:</p>
              <p className="text-white text-sm">
                $1 USD = {currency.symbol}{currency.rateToUSD.toLocaleString()} {currency.code}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleToggleActive(currency)}
                className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                  currency.active
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30'
                }`}
              >
                {currency.active ? 'Activa' : 'Inactiva'}
              </button>
              
              <button
                onClick={() => handleOpenModal(currency)}
                className="px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg font-semibold text-sm hover:bg-blue-500/30 transition-all"
              >
                <Edit2 size={16} />
              </button>
              
              {!currency.isDefault && (
                <button
                  onClick={() => handleDelete(currency.id, currency.isDefault)}
                  className="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-semibold text-sm hover:bg-red-500/30 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0f1e] border border-white/20 rounded-xl max-w-md w-full"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-black text-white uppercase">
                {editingCurrency ? 'Editar Moneda' : 'Nueva Moneda'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-semibold mb-2">
                  Código (ej: USD, EUR, ARS) *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  maxLength={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white uppercase focus:outline-none focus:border-brand-green/50 transition-all"
                  placeholder="USD"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-semibold mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
                  placeholder="Dólar Estadounidense"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-semibold mb-2">
                  Símbolo *
                </label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  maxLength={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
                  placeholder="$"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-semibold mb-2">
                  Tasa de Conversión (cuánto vale 1 USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.rateToUSD}
                  onChange={(e) => setFormData({ ...formData, rateToUSD: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
                  placeholder="900"
                  required
                />
                <p className="text-gray-500 text-xs mt-1">
                  Ejemplo: 900 significa que 1 USD = 900 de esta moneda
                </p>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-green focus:ring-brand-green"
                  />
                  <span className="text-white font-semibold">Moneda por Defecto</span>
                </label>
                <p className="text-gray-500 text-xs mt-1 ml-8">
                  La moneda que se mostrará inicialmente a los usuarios
                </p>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-green focus:ring-brand-green"
                  />
                  <span className="text-white font-semibold">Moneda Activa</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-green hover:bg-brand-green/80 text-black font-bold rounded-lg transition-all"
                >
                  {editingCurrency ? 'Actualizar Moneda' : 'Crear Moneda'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all"
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
