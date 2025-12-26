import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Tag, Edit2, Trash2, Loader2, X, Save, Calendar, Percent, DollarSign, Truck } from 'lucide-react';
import { couponsService } from '../../services/coupons.service';

interface CouponType {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minPurchase: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const Coupons = () => {
  const [coupons, setCoupons] = useState<CouponType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponType | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'free_shipping',
    value: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    expiresAt: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponsService.getAll();
      setCoupons(data);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: '',
      minPurchase: '',
      maxDiscount: '',
      usageLimit: '',
      expiresAt: '',
    });
    setShowModal(true);
  };

  const openEditModal = (coupon: CouponType) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: String(coupon.value),
      minPurchase: String(coupon.minPurchase),
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.description) {
      alert('Código y descripción son requeridos');
      return;
    }

    try {
      setSaving(true);

      const couponData = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        type: formData.type,
        value: parseFloat(formData.value) || 0,
        minPurchase: parseFloat(formData.minPurchase) || 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      };

      if (editingCoupon) {
        const { code, ...updates } = couponData;
        await couponsService.update(editingCoupon.id, updates);
      } else {
        await couponsService.create(couponData);
      }

      await fetchCoupons();
      setShowModal(false);
    } catch (error: any) {
      alert(error?.error || 'Error al guardar el cupón');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (coupon: CouponType) => {
    if (!confirm(`¿Eliminar cupón ${coupon.code}?`)) return;

    try {
      await couponsService.delete(coupon.id);
      setCoupons(coupons.filter(c => c.id !== coupon.id));
    } catch (error) {
      alert('Error al eliminar cupón');
    }
  };

  const toggleActive = async (coupon: CouponType) => {
    try {
      await couponsService.update(coupon.id, { active: !coupon.active });
      setCoupons(coupons.map(c => 
        c.id === coupon.id ? { ...c, active: !c.active } : c
      ));
    } catch (error) {
      alert('Error al actualizar cupón');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent size={18} />;
      case 'fixed': return <DollarSign size={18} />;
      case 'free_shipping': return <Truck size={18} />;
      default: return <Tag size={18} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage': return 'Porcentaje';
      case 'fixed': return 'Fijo';
      case 'free_shipping': return 'Envío Gratis';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
            Cupones
          </h1>
          <p className="text-gray-400">
            Gestiona los códigos de descuento
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-brand-green hover:bg-brand-green/90 text-black font-bold py-3 px-6 rounded-lg transition-all"
        >
          <Plus size={20} />
          Nuevo Cupón
        </button>
      </div>

      {/* Coupons Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
        </div>
      ) : (
        <div className="bg-[#121a2b] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Usos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {coupons.map((coupon) => {
                  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                  const isLimitReached = coupon.usageLimit && coupon.usageCount >= coupon.usageLimit;

                  return (
                    <motion.tr
                      key={coupon.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Tag className="text-brand-green" size={18} />
                          <span className="text-white font-bold">{coupon.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-400">{coupon.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-gray-300">
                          {getTypeIcon(coupon.type)}
                          {getTypeLabel(coupon.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-bold">
                          {coupon.type === 'percentage' ? `${coupon.value}%` : 
                           coupon.type === 'fixed' ? `$${coupon.value}` : 
                           'N/A'}
                        </p>
                        {coupon.minPurchase > 0 && (
                          <p className="text-gray-500 text-xs">Min: ${coupon.minPurchase}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white">
                          {coupon.usageCount}
                          {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {isExpired ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-400/10 text-red-400">
                            Expirado
                          </span>
                        ) : isLimitReached ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-400/10 text-orange-400">
                            Agotado
                          </span>
                        ) : coupon.active ? (
                          <button
                            onClick={() => toggleActive(coupon)}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-colors"
                          >
                            Activo
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleActive(coupon)}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-400/10 text-gray-400 hover:bg-gray-400/20 transition-colors"
                          >
                            Inactivo
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="p-2 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Crear/Editar */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#121a2b] border border-white/10 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-xl uppercase">
                  {editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Code */}
                <div>
                  <label className="block text-gray-400 text-sm font-semibold mb-2">
                    Código del Cupón *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="NAVIDAD2024"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50 uppercase"
                    required
                    disabled={!!editingCoupon}
                  />
                  {editingCoupon && (
                    <p className="text-xs text-gray-500 mt-1">El código no se puede cambiar</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-400 text-sm font-semibold mb-2">
                    Descripción *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descuento de Navidad"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-gray-400 text-sm font-semibold mb-2">
                    Tipo de Descuento *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                    <option value="free_shipping">Envío Gratis</option>
                  </select>
                </div>

                {/* Value */}
                {formData.type !== 'free_shipping' && (
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                      Valor del Descuento *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder={formData.type === 'percentage' ? '20' : '50'}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.type === 'percentage' ? 'Porcentaje de descuento (ej: 20 para 20%)' : 'Monto en dólares (ej: 50 para $50)'}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* Min Purchase */}
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                      Compra Mínima ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.minPurchase}
                      onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50"
                    />
                  </div>

                  {/* Max Discount */}
                  {formData.type === 'percentage' && (
                    <div>
                      <label className="block text-gray-400 text-sm font-semibold mb-2">
                        Descuento Máximo ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                        placeholder="Opcional"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Usage Limit */}
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                      Límite de Usos
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      placeholder="Ilimitado"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50"
                    />
                  </div>

                  {/* Expires At */}
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                      Fecha de Expiración
                    </label>
                    <input
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-brand-green hover:bg-brand-green/90 text-black font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        {editingCoupon ? 'Actualizar' : 'Crear'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
