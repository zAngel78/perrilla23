import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { productsService } from '../../services/products.service';
import { Product } from '../../types';

export const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsService.getAll();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Calcular estadísticas
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
  const lowStockProducts = products.filter(p => (p.stock || 0) < 10).length;
  const featuredProducts = products.filter(p => p.featured).length;

  const stats = [
    {
      icon: Package,
      label: 'Total Productos',
      value: totalProducts,
      change: '+12%',
      positive: true,
      color: 'brand-green',
    },
    {
      icon: ShoppingCart,
      label: 'Stock Total',
      value: totalStock,
      change: '-3%',
      positive: false,
      color: 'brand-orange',
    },
    {
      icon: DollarSign,
      label: 'Valor Inventario',
      value: `$${(totalValue / 1000).toFixed(1)}K`,
      change: '+8%',
      positive: true,
      color: 'brand-yellow',
    },
    {
      icon: Users,
      label: 'Bajo Stock',
      value: lowStockProducts,
      change: `${lowStockProducts} productos`,
      positive: false,
      color: 'red-400',
    },
  ];

  // Productos con bajo stock
  const lowStockList = products
    .filter(p => (p.stock || 0) < 10)
    .sort((a, b) => (a.stock || 0) - (b.stock || 0))
    .slice(0, 5);

  // Productos destacados
  const featuredList = products
    .filter(p => p.featured)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
          Dashboard
        </h1>
        <p className="text-gray-400">
          Vista general de tu tienda
        </p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#121a2b] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-${stat.color}/10 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${stat.color}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-bold ${
                      stat.positive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stat.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-white text-2xl font-black">{stat.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bajo Stock */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#121a2b] border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg uppercase tracking-tight">
                  Bajo Stock
                </h2>
                <span className="text-red-400 text-sm font-bold">
                  {lowStockProducts} productos
                </span>
              </div>

              <div className="space-y-3">
                {lowStockList.length > 0 ? (
                  lowStockList.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                          {product.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 font-bold text-sm">
                          {product.stock || 0} unidades
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(product.price)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Todo el stock está bien
                  </p>
                )}
              </div>
            </motion.div>

            {/* Productos Destacados */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#121a2b] border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg uppercase tracking-tight">
                  Destacados
                </h2>
                <span className="text-brand-green text-sm font-bold">
                  {featuredProducts} productos
                </span>
              </div>

              <div className="space-y-3">
                {featuredList.length > 0 ? (
                  featuredList.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                          {product.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-brand-green font-bold text-sm">
                          {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(product.price)}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {product.stock || 0} en stock
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No hay productos destacados
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-brand-green/10 to-brand-orange/10 border border-brand-green/20 rounded-xl p-6"
          >
            <h2 className="text-white font-bold text-lg uppercase tracking-tight mb-4">
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/admin/products/new"
                className="bg-brand-green hover:bg-brand-green/90 text-black font-bold py-3 px-4 rounded-lg transition-all text-center"
              >
                + Nuevo Producto
              </Link>
              <button className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-4 rounded-lg transition-all border border-white/10">
                Ver Reportes
              </button>
              <Link
                to="/admin/settings"
                className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-4 rounded-lg transition-all border border-white/10 text-center"
              >
                Configuración
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};
