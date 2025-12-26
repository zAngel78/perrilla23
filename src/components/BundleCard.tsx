import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { apiService } from '../services/api.service';

interface BundleCardProps {
  bundle: any; // Original entry from API with bundle info
  index: number;
}

// Cache para la tasa de conversión
let cachedRate: number | null = null;

export const BundleCard: React.FC<BundleCardProps> = ({ bundle, index }) => {
  // Get all items in the bundle
  const bundleItems = bundle.bundle?.items || [];
  const bundleImage = bundle.bundle?.image;
  const bundleName = bundle.bundle?.name || 'Bundle';
  const bundleInfo = bundle.bundle?.info || '';
  const price = bundle.finalPrice || bundle.regularPrice || 0;
  
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [vbucksRate, setVbucksRate] = useState(cachedRate || 4.4);

  useEffect(() => {
    // Solo cargar si no tenemos cache
    if (!cachedRate) {
      loadVBucksRate();
    }
  }, []);

  const loadVBucksRate = async () => {
    try {
      const response = await apiService.get('/api/settings');
      const rate = response.data.fortniteVBucksRate || 4.4;
      cachedRate = rate; // Guardar en cache
      setVbucksRate(rate);
    } catch (error) {
      console.error('Error loading V-Bucks rate:', error);
      setVbucksRate(4.4);
    }
  };

  // Calcular precio en CLP
  const priceInCLP = price * vbucksRate;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Convertir Bundle a Product para el carrito (precio en CLP)
    const product: Product = {
      id: bundle.offerId || `bundle-${index}`,
      name: bundleName,
      description: bundleInfo || `Bundle con ${bundleItems.length} items`,
      price: priceInCLP, // Precio directo en CLP
      image: bundleImage || (bundleItems[0]?.images?.icon || ''),
      category: 'fortnite-bundle',
      stock: 999,
      rating: 5,
      isDigitalProduct: true,
    };

    addToCart(product);
    
    // Feedback visual
    const button = e.currentTarget as HTMLButtonElement;
    const originalText = button.innerHTML;
    button.innerHTML = '✓ Agregado';
    button.classList.add('!bg-green-500');
    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove('!bg-green-500');
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative flex flex-col bg-gradient-to-b from-brand-yellow/10 to-brand-orange/10 rounded overflow-hidden border-2 border-brand-yellow hover:border-brand-orange shadow-[0_0_30px_rgba(245,194,89,0.3)] hover:shadow-[0_0_40px_rgba(237,118,78,0.5)] transition-all duration-500 cursor-pointer"
      style={{ minHeight: '500px' }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
    >
      {/* Bundle Badge */}
      <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-brand-yellow to-brand-orange px-3 py-1 rounded font-black text-xs uppercase text-black shadow-lg">
        Bundle
      </div>

      {/* Main Bundle Image or Grid of Items */}
      <div className="relative overflow-hidden bg-gradient-to-b from-black/40 to-black/80" style={{ height: '300px' }}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/20 to-brand-orange/20 opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
        
        {bundleImage ? (
          // Single bundle image
          <img
            src={bundleImage}
            alt={bundleName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : bundleItems.length > 0 ? (
          // Grid of item images
          <div className={`grid gap-1 p-2 h-full ${
            bundleItems.length === 1 ? 'grid-cols-1' :
            bundleItems.length === 2 ? 'grid-cols-2' :
            bundleItems.length === 3 ? 'grid-cols-3' :
            bundleItems.length === 4 ? 'grid-cols-2 grid-rows-2' :
            'grid-cols-3 grid-rows-2'
          }`}>
            {bundleItems.slice(0, 6).map((item: any, idx: number) => (
              <div 
                key={idx}
                className="relative overflow-hidden rounded bg-black/60"
              >
                <img
                  src={item.images?.icon || item.images?.featured || item.images?.smallIcon}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ))}
            {bundleItems.length > 6 && (
              <div className="flex items-center justify-center bg-black/80 rounded">
                <span className="text-white font-bold text-xl">+{bundleItems.length - 6}</span>
              </div>
            )}
          </div>
        ) : null}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Price tag */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-md shadow-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#00d4ff]">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="text-white font-bold text-base">{price.toLocaleString()}</span>
        </div>

        {/* Item count badge */}
        {bundleItems.length > 0 && (
          <div className="absolute top-3 right-3 z-20 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-md">
            <span className="text-brand-yellow font-bold text-sm">{bundleItems.length} Items</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 bg-black/70 backdrop-blur-sm flex-1 flex flex-col group-hover:bg-black/90 transition-colors duration-300">
        <h3 className="text-white font-bold text-xl uppercase leading-tight mb-3 line-clamp-2">{bundleName}</h3>
        
        {bundleInfo && (
          <p className="text-gray-300 text-sm mb-4 line-clamp-3">{bundleInfo}</p>
        )}

        {/* Items list */}
        {bundleItems.length > 0 && (
          <div className="mb-4 flex-1">
            <p className="text-brand-yellow text-xs font-bold uppercase mb-2">Includes:</p>
            <div className="flex flex-wrap gap-1">
              {bundleItems.slice(0, 4).map((item: any, idx: number) => (
                <span 
                  key={idx}
                  className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded"
                >
                  {item.name}
                </span>
              ))}
              {bundleItems.length > 4 && (
                <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                  +{bundleItems.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto space-y-2">
          <button 
            onClick={handleAddToCart}
            className="w-full py-3 bg-gradient-to-r from-brand-yellow to-brand-orange hover:from-brand-orange hover:to-brand-yellow text-black font-bold uppercase tracking-wider rounded transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            Agregar al Carrito
          </button>
          <p className="text-center text-gray-400 text-sm">
            {formatPrice(priceInCLP)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
