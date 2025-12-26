import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { productsService } from '../services/products.service';
import { Product } from '../types';
import { useSearchParams } from 'react-router-dom';

export const Shop = () => {
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Cargar productos del backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productsService.getAll();
        setProducts(data);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Error al cargar los productos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Actualizar búsqueda cuando cambie el parámetro URL
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Get unique categories from products
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#0b1221] pt-24 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tight mb-4">
            CATÁLOGO
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Explora nuestra colección de productos premium para gamers
          </p>

          {/* Filters Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search Bar */}
            <div className="relative flex-1">
              <div className="absolute left-3 top-[14px] pointer-events-none">
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20" 
                  fill="none"
                  className="text-gray-400"
                  style={{ 
                    transform: 'translateZ(0)',
                    WebkitTransform: 'translateZ(0)'
                  }}
                >
                  <circle 
                    cx="9" 
                    cy="9" 
                    r="6" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    fill="none"
                  />
                  <path 
                    d="M14 14L18 18" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 focus:outline-none focus:border-brand-green/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-xl"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm font-semibold uppercase flex items-center gap-2">
                <Filter size={16} /> Categoría:
              </span>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded text-sm font-bold uppercase transition-all ${
                      selectedCategory === category
                        ? 'bg-brand-green text-black'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {category === 'all' ? 'Todos' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-400">
              Mostrando <span className="text-white font-bold">{filteredProducts.length}</span> productos
            </p>
          </div>
        </motion.div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-brand-green animate-spin mb-4" />
            <p className="text-gray-400 text-lg">Cargando productos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-400 text-lg mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No se encontraron productos.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart} 
                  index={index}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {/* Botón Anterior */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Números de página */}
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // Mostrar solo algunas páginas alrededor de la actual
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-bold transition-all ${
                            currentPage === page
                              ? 'bg-brand-green text-black'
                              : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="text-gray-500 px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                {/* Botón Siguiente */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
