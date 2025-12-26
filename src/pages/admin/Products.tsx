import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye,
  Filter,
  Loader2,
  Package,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { productsService } from '../../services/products.service';
import { Product } from '../../types';

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      await productsService.delete(productToDelete.id);
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    } finally {
      setDeleting(false);
    }
  };

  // Filtrado
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
            Productos
          </h1>
          <p className="text-gray-400">
            Gestiona tu catálogo de productos
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/products/featured-order"
            className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Ordenar Destacados
          </Link>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 bg-brand-green hover:bg-brand-green/90 text-black font-bold py-3 px-6 rounded-lg transition-all"
          >
            <Plus size={20} />
            Nuevo Producto
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-green/50 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
            >
              <option value="all">Todas las categorías</option>
              {categories.filter(c => c !== 'all').map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-gray-400">
            Mostrando <span className="text-white font-bold">{filteredProducts.length}</span> de{' '}
            <span className="text-white font-bold">{products.length}</span> productos
          </p>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-[#121a2b] border border-white/10 rounded-xl p-12 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No se encontraron productos</p>
          <p className="text-gray-500 text-sm">
            Intenta con otros términos de búsqueda o agrega un nuevo producto
          </p>
        </div>
      ) : (
        <div className="bg-[#121a2b] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Stock
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
                {filteredProducts.map((product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-white font-semibold">{product.name}</p>
                          <p className="text-gray-400 text-sm truncate max-w-xs">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-gray-300">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-bold">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(product.price)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-bold ${
                        (product.stock || 0) < 10 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {product.stock || 0}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {product.featured ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-green/20 text-brand-green">
                          Destacado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-gray-400">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/product/${product.id}`}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                          title="Ver"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="p-2 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-all inline-block"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Eliminar"
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
      )}

      {/* Delete Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121a2b] border border-white/10 rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Confirmar Eliminación</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar el producto{' '}
              <span className="text-white font-bold">{productToDelete.name}</span>?
              Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
