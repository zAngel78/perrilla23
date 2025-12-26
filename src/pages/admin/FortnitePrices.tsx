import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Plus, Trash2, Edit2, Loader2, Search, Save, X } from 'lucide-react';
import { fortnitePricesService, FortnitePriceOverride } from '../../services/fortnite-prices.service';
import { getFortniteShop, FortniteItem } from '../../lib/fortniteApi';

export const FortnitePrices = () => {
  const [overrides, setOverrides] = useState<FortnitePriceOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopItems, setShopItems] = useState<FortniteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FortniteItem | null>(null);
  const [customPrice, setCustomPrice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overridesData, shopData] = await Promise.all([
        fortnitePricesService.getAll(),
        getFortniteShop()
      ]);
      setOverrides(overridesData);
      setShopItems(shopData.all);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOverride = async () => {
    if (!selectedItem || !customPrice) return;

    try {
      setSaving(true);
      await fortnitePricesService.createOrUpdate({
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        originalPrice: selectedItem.price,
        customPrice: parseFloat(customPrice),
        active: true
      });
      await loadData();
      setShowAddModal(false);
      setSelectedItem(null);
      setCustomPrice('');
    } catch (error) {
      console.error('Error saving override:', error);
      alert('Error al guardar el precio personalizado');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOverride = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este precio personalizado?')) return;

    try {
      await fortnitePricesService.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting override:', error);
      alert('Error al eliminar el precio personalizado');
    }
  };

  const filteredItems = shopItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    item.price > 0
  );

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
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
          Precios de Fortnite
        </h1>
        <p className="text-gray-400">
          Gestiona precios personalizados para items de la tienda de Fortnite
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Total Items</p>
          <p className="text-white text-3xl font-black">{shopItems.length}</p>
        </div>
        <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Precios Personalizados</p>
          <p className="text-brand-green text-3xl font-black">{overrides.length}</p>
        </div>
        <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Activos</p>
          <p className="text-purple-400 text-3xl font-black">
            {overrides.filter(o => o.active).length}
          </p>
        </div>
      </div>

      {/* Add New Override Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="bg-brand-green hover:bg-brand-green/90 text-black px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
      >
        <Plus size={20} />
        Agregar Precio Personalizado
      </button>

      {/* Current Overrides */}
      <div className="bg-[#121a2b] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-black text-white uppercase">Precios Personalizados Activos</h2>
        </div>
        
        {overrides.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No hay precios personalizados configurados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Item</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Precio Original (V-Bucks)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Precio Personalizado (CLP)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {overrides.map((override) => (
                  <motion.tr
                    key={override.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-white font-bold">{override.itemName}</p>
                      <p className="text-gray-500 text-xs">{override.itemId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span className="text-white font-bold">{override.originalPrice.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-brand-green font-bold text-lg">
                        ${override.customPrice.toLocaleString()} CLP
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                        override.active 
                          ? 'bg-green-400/10 text-green-400' 
                          : 'bg-gray-400/10 text-gray-400'
                      }`}>
                        {override.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteOverride(override.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Override Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121a2b] border border-white/10 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-black text-white uppercase">Seleccionar Item de Fortnite</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedItem(null);
                  setCustomPrice('');
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-white/10">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50"
                />
              </div>
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedItem ? (
                /* Selected Item - Price Input */
                <div className="space-y-6">
                  <div className="bg-white/5 border border-purple-500/30 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={selectedItem.image}
                        alt={selectedItem.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-black text-lg mb-2">{selectedItem.name}</h3>
                        <div className="flex items-center gap-2 text-blue-400 mb-4">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          <span className="font-bold">{selectedItem.price.toLocaleString()} V-Bucks</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-2">Precio Personalizado (CLP)</label>
                    <input
                      type="number"
                      placeholder="Ej: 5000"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50"
                    />
                    <p className="text-gray-400 text-sm mt-2">
                      Este precio reemplazará el cálculo automático de V-Bucks a CLP
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveOverride}
                      disabled={!customPrice || saving}
                      className="flex-1 bg-brand-green hover:bg-brand-green/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-black py-3 rounded-lg font-bold uppercase flex items-center justify-center gap-2 transition-colors"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          Guardar Precio
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(null);
                        setCustomPrice('');
                      }}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold uppercase transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* Items Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredItems.map((item) => {
                    const hasOverride = overrides.some(o => o.itemId === item.id);
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        disabled={hasOverride}
                        className={`relative group rounded-lg overflow-hidden transition-all ${
                          hasOverride
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:scale-105 hover:shadow-xl cursor-pointer'
                        }`}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full aspect-square object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-3 flex flex-col justify-end">
                          <p className="text-white font-bold text-sm line-clamp-2 mb-1">{item.name}</p>
                          <div className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span className="text-white text-xs font-bold">{item.price.toLocaleString()}</span>
                          </div>
                          {hasOverride && (
                            <span className="absolute top-2 right-2 bg-brand-green text-black text-[10px] font-bold px-2 py-1 rounded uppercase">
                              Configurado
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {!selectedItem && filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <Search size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No se encontraron items</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
