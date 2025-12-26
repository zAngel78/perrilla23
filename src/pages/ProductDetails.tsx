import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Star, ShieldCheck, Zap, Truck, Cpu, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { productsService } from '../services/products.service';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Cargar producto del backend
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await productsService.getById(id);
        setProduct(data);
        setSelectedImage(data.image);
      } catch (error) {
        console.error('Error loading product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1221] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-green animate-spin mb-4" />
        <p className="text-gray-400">Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0b1221] flex flex-col items-center justify-center text-white pt-20">
        <h2 className="text-4xl font-black mb-4">ERROR 404</h2>
        <p className="text-gray-400 mb-8">Producto no encontrado en la base de datos.</p>
        <button onClick={() => navigate('/shop')} className="text-brand-green hover:underline">
          Volver a la tienda
        </button>
      </div>
    );
  }

  // Galería: imagen principal + galería (si existe)
  const galleryImages = [product.image, ...(product.gallery || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0b1221] pt-32 pb-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="w-full h-full bg-grid-animate" />
      </div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-green/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Breadcrumb / Back */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="uppercase tracking-widest text-xs font-bold">Volver</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Image Gallery Style */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#121a2b] border border-white/10 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Floating Badge */}
              <div className="absolute top-6 left-6 bg-brand-green/90 backdrop-blur text-brand-dark px-4 py-1 font-black uppercase tracking-widest text-sm rounded-sm">
                {product.category}
              </div>
              
              {/* Featured Badge */}
              {product.featured && (
                <div className="absolute top-6 right-6 bg-brand-orange/90 backdrop-blur text-white px-4 py-1 font-black uppercase tracking-widest text-sm rounded-sm">
                  Destacado
                </div>
              )}
            </div>

            {/* Thumbnails Gallery */}
            {galleryImages.length > 1 && (
              <div className={`grid ${galleryImages.length <= 4 ? 'grid-cols-4' : 'grid-cols-5'} gap-4 mt-4`}>
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-lg bg-[#121a2b] border ${selectedImage === img ? 'border-brand-green ring-2 ring-brand-green/50' : 'border-white/10'} overflow-hidden cursor-pointer hover:border-brand-green/50 transition-all`}
                  >
                    <img src={img} alt={`${product.name} - ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-6">
              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-brand-yellow">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < Math.floor(product.rating!) ? "fill-current" : "text-gray-700"} />
                    ))}
                  </div>
                  <span className="text-gray-400 text-sm font-mono">({product.rating} Rating)</span>
                </div>
              )}

              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-none uppercase italic tracking-tighter">
                {product.name}
              </h1>
              
              <div className="flex items-end gap-4 mb-8">
                <span className="text-4xl font-bold text-brand-green tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.stock && product.stock < 10 && (
                  <span className="text-brand-orange font-bold text-sm uppercase tracking-widest animate-pulse mb-2">
                    ¡Solo quedan {product.stock}!
                  </span>
                )}
              </div>

              <p className="text-gray-300 text-lg leading-relaxed mb-8 border-l-4 border-white/10 pl-6">
                {product.longDescription || product.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={() => addToCart(product)}
                  className="flex-1 bg-brand-green text-brand-dark py-4 px-8 font-black uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-3 text-lg group"
                >
                  <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
                  Agregar al Carro
                </button>
                <button 
                  onClick={() => {
                    addToCart(product);
                    navigate('/checkout');
                  }}
                  className="flex-1 border border-white/20 text-white py-4 px-8 font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
                >
                  Comprar Ahora
                </button>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {product.features?.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="p-1 bg-brand-orange/10 rounded mt-1">
                      <Zap size={14} className="text-brand-orange" />
                    </div>
                    <span className="text-gray-300 text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Specs Table */}
              {product.specs && (
                <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                  <h3 className="text-white font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Cpu size={18} /> Especificaciones Técnicas
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-500 text-sm">{key}</span>
                        <span className="text-white text-sm font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex gap-6 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider">
                <ShieldCheck size={16} className="text-brand-green" />
                Garantía Oficial
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider">
                <Truck size={16} className="text-brand-green" />
                Envío Express
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
