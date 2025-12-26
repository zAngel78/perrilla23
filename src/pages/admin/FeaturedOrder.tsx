import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, GripVertical, ArrowUp, ArrowDown, Loader2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productsService } from '../../services/products.service';
import { Product } from '../../types';

export const FeaturedOrder = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await productsService.getAll({ featured: true });
      // Ordenar por featuredOrder
      const sorted = allProducts.sort((a, b) => 
        (a.featuredOrder || 999) - (b.featuredOrder || 999)
      );
      setProducts(sorted);
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newProducts = [...products];
    [newProducts[index], newProducts[index - 1]] = [newProducts[index - 1], newProducts[index]];
    setProducts(newProducts);
  };

  const moveDown = (index: number) => {
    if (index === products.length - 1) return;
    const newProducts = [...products];
    [newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]];
    setProducts(newProducts);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Crear array con nuevo orden
      const orders = products.map((product, index) => ({
        id: product.id,
        featuredOrder: index + 1
      }));

      // Llamar al endpoint de reordenar
      await productsService.reorderFeatured(orders);
      
      alert('Orden guardado correctamente');
    } catch (error: any) {
      console.error('Error saving order:', error);
      alert(error?.error || 'Error al guardar el orden');
    } finally {
      setSaving(false);
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
            Orden de Destacados
          </h1>
          <p className="text-gray-400">
            Organiza el orden en que aparecen los productos destacados en la home
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-green hover:bg-brand-green/90 text-black font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save size={20} />
              Guardar Orden
            </>
          )}
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-brand-green/10 border border-brand-green/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-semibold mb-1">
              ¿Cómo funciona?
            </p>
            <p className="text-gray-300 text-sm">
              Usa las flechas para reordenar los productos. El orden de arriba hacia abajo es el mismo orden en que aparecerán en la página principal. 
              Solo los productos marcados como "Destacados" aparecen aquí.
            </p>
          </div>
        </div>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="bg-[#121a2b] border border-white/10 rounded-xl p-12 text-center">
          <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No hay productos destacados</p>
          <p className="text-gray-500 text-sm mb-6">
            Marca algunos productos como destacados para que aparezcan aquí
          </p>
          <Link
            to="/admin/products"
            className="inline-block bg-brand-green hover:bg-brand-green/90 text-black font-bold py-3 px-6 rounded-lg transition-all"
          >
            Ir a Productos
          </Link>
        </div>
      ) : (
        <div className="bg-[#121a2b] border border-white/10 rounded-xl overflow-hidden">
          <div className="divide-y divide-white/10">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                className="flex items-center gap-4 p-6 hover:bg-white/5 transition-colors"
              >
                {/* Drag Handle */}
                <div className="text-gray-500">
                  <GripVertical size={24} />
                </div>

                {/* Order Number */}
                <div className="flex-shrink-0 w-12 h-12 bg-brand-green/20 rounded-lg flex items-center justify-center">
                  <span className="text-brand-green font-bold text-lg">
                    {index + 1}
                  </span>
                </div>

                {/* Product Image */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {product.category} • {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(product.price)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Subir"
                  >
                    <ArrowUp size={20} />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === products.length - 1}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Bajar"
                  >
                    <ArrowDown size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      {products.length > 0 && (
        <div className="text-center text-gray-400 text-sm">
          Total: {products.length} producto{products.length !== 1 ? 's' : ''} destacado{products.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
