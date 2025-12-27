import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import { ordersService, Order } from '../../services/orders.service';

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [ordersData, statsData] = await Promise.all([
        ordersService.getAll(),
        ordersService.getStats()
      ]);
      setOrders(ordersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
      </div>
    );
  }

  // Mantener el código anterior de orders de ejemplo y reemplazar con el estado
  const ordersExample = [
    {
      id: 'ORD-001',
      customer: 'Juan Pérez',
      email: 'juan@example.com',
      products: 2,
      total: 89.99,
      status: 'completed',
      date: '2024-12-25',
    },
    {
      id: 'ORD-002',
      customer: 'María González',
      email: 'maria@example.com',
      products: 1,
      total: 499.99,
      status: 'pending',
      date: '2024-12-25',
    },
    {
      id: 'ORD-003',
      customer: 'Carlos Rodríguez',
      email: 'carlos@example.com',
      products: 3,
      total: 159.97,
      status: 'processing',
      date: '2024-12-24',
    },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return { icon: CheckCircle, label: 'Completado', color: 'text-green-400', bg: 'bg-green-400/10' };
      case 'pending':
        return { icon: Clock, label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
      case 'pending_payment':
        return { icon: Clock, label: 'Esperando Pago', color: 'text-blue-400', bg: 'bg-blue-400/10' };
      case 'processing':
        return { icon: Package, label: 'Procesando', color: 'text-brand-green', bg: 'bg-brand-green/10' };
      case 'payment_failed':
        return { icon: XCircle, label: 'Pago Fallido', color: 'text-red-400', bg: 'bg-red-400/10' };
      case 'cancelled':
        return { icon: XCircle, label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-400/10' };
      default:
        return { icon: Clock, label: 'Desconocido', color: 'text-gray-400', bg: 'bg-gray-400/10' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
          Órdenes
        </h1>
        <p className="text-gray-400">
          Gestiona los pedidos de tus clientes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Total Órdenes</p>
          <p className="text-white text-3xl font-black">{stats.total}</p>
        </div>
        <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Pendientes</p>
          <p className="text-yellow-400 text-3xl font-black">
            {stats.pending}
          </p>
        </div>
        <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Completadas</p>
          <p className="text-green-400 text-3xl font-black">
            {stats.completed}
          </p>
        </div>
        <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-2">Ingresos</p>
          <p className="text-brand-green text-3xl font-black">
            ${stats.totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#121a2b] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  ID Orden
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Usuario Fortnite
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-white font-bold">{order.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-semibold">{order.customerName}</p>
                        <p className="text-gray-400 text-sm">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.fortniteUsername ? (
                        <div className="flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-purple-400">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          <span className="text-purple-400 font-bold">{order.fortniteUsername}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{(order.items || order.products || []).length} items</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-brand-green font-bold">${order.total}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f1629] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0f1629] border-b border-white/10 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white uppercase">Detalle de Orden</h2>
                <p className="text-gray-400 text-sm mt-1">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XCircle size={24} className="text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Package size={18} className="text-brand-green" />
                  Información del Cliente
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Nombre</p>
                    <p className="text-white font-semibold">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white font-semibold">{selectedOrder.customerEmail}</p>
                  </div>
                  {selectedOrder.fortniteUsername && (
                    <div className="col-span-2">
                      <p className="text-gray-400 text-sm">Usuario de Fortnite</p>
                      <div className="flex items-center gap-2 mt-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-purple-400">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span className="text-purple-400 font-bold">{selectedOrder.fortniteUsername}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Status */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-bold mb-3">Estado de la Orden</h3>
                <div className="flex items-center gap-4">
                  {(() => {
                    const statusConfig = getStatusConfig(selectedOrder.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon size={16} />
                        {statusConfig.label}
                      </span>
                    );
                  })()}
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm">Fecha de creación</p>
                    <p className="text-white">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-bold mb-3">Productos</h3>
                <div className="space-y-3">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div key={index} className="bg-black/40 border border-white/10 rounded-lg p-3 flex items-center gap-4">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-white font-bold">{item.name}</p>
                        {item.description && (
                          <p className="text-gray-400 text-sm">{item.description}</p>
                        )}
                        <p className="text-gray-400 text-sm">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-brand-green font-bold">${item.price}</p>
                        <p className="text-gray-400 text-xs">c/u</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-bold mb-3">Resumen</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">${selectedOrder.subtotal?.toFixed(2) || selectedOrder.total.toFixed(2)}</span>
                  </div>
                  {selectedOrder.shipping !== undefined && selectedOrder.shipping > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Envío</span>
                      <span className="text-white">${selectedOrder.shipping.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-2 flex justify-between">
                    <span className="text-white font-bold text-lg">Total</span>
                    <span className="text-brand-green font-black text-xl">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              {selectedOrder.mercadopagoPaymentId && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-white font-bold mb-3">Información de Pago</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-400 text-sm">ID de Pago (MercadoPago)</p>
                      <p className="text-white font-mono">{selectedOrder.mercadopagoPaymentId}</p>
                    </div>
                    {selectedOrder.paidAt && (
                      <div>
                        <p className="text-gray-400 text-sm">Fecha de pago</p>
                        <p className="text-white">{new Date(selectedOrder.paidAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
