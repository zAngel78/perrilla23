import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { apiService } from '../services/api.service';
import { fortnitePricesService } from '../services/fortnite-prices.service';

interface BundleCardProps {
  bundle: any; // Original entry from API with bundle info
  index: number;
}

// Cache para la tasa de conversión y overrides de precios
let cachedRate: number | null = null;
let cachedPriceOverrides: Map<string, number> | null = null;

export const BundleCard: React.FC<BundleCardProps> = ({ bundle, index }) => {
  // Get all items in the bundle
  const bundleItems = bundle.bundle?.items || [];
  const bundleImage = bundle.bundle?.image;
  const bundleName = bundle.bundle?.name || 'Bundle';
  const bundleInfo = bundle.bundle?.info || '';
  const price = bundle.finalPrice || bundle.regularPrice || 0;
  const bundleId = bundle.offerId || `bundle-${index}`;

  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [vbucksRate, setVbucksRate] = useState(cachedRate || 4.4);
  const [customPrice, setCustomPrice] = useState<number | null>(null);

  useEffect(() => {
    // Cargar datos si no tenemos cache
    if (!cachedRate || !cachedPriceOverrides) {
      loadPricingData();
    } else {
      // Usar cache existente
      setCustomPrice(cachedPriceOverrides.get(bundleId) || null);
    }
  }, [bundleId]);

  const loadPricingData = async () => {
    try {
      const [settingsResponse, overridesResponse] = await Promise.all([
        apiService.get('/api/settings'),
        fortnitePricesService.getAll()
      ]);

      const rate = settingsResponse.data.fortniteVBucksRate || 4.4;
      cachedRate = rate;
      setVbucksRate(rate);

      // Crear mapa de overrides para búsqueda rápida
      const overridesMap = new Map<string, number>();
      overridesResponse
        .filter(o => o.active)
        .forEach(o => overridesMap.set(o.itemId, o.customPrice));

      cachedPriceOverrides = overridesMap;
      setCustomPrice(overridesMap.get(bundleId) || null);
    } catch (error) {
      console.error('Error loading pricing data:', error);
      setVbucksRate(4.4);
      setCustomPrice(null);
    }
  };

  // Calcular precio en CLP (usar precio personalizado si existe, sino usar tasa)
  const priceInCLP = customPrice !== null ? customPrice : (price * vbucksRate);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Convertir Bundle a Product para el carrito (precio en CLP)
    const product: Product = {
      id: bundleId,
      name: bundleName,
      description: bundleInfo || `Bundle con ${bundleItems.length} items`,
      price: priceInCLP, // Precio directo en CLP (personalizado o calculado)
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
      className="group relative rounded-2xl overflow-hidden bg-gradient-to-b from-yellow-500/80 to-orange-500/60 backdrop-blur-md hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl shadow-yellow-500/40 shadow-[0_0_30px_rgba(245,194,89,0.4)] sm:col-span-2 lg:col-span-1 font-sans"
      whileHover={{
        y: -4,
        transition: { duration: 0.2 }
      }}
    >

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden z-10">
        {bundleImage ? (
          // Single bundle image
          <img
            src={bundleImage}
            alt={bundleName}
            className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : bundleItems.length > 0 ? (
          // Floating items composition (like reference image)
          <div className="relative w-full h-full p-4">
            {/* Main character/item (larger, center-right) */}
            {bundleItems[0] && (
              <div className="absolute right-4 bottom-0 top-0 w-1/2 flex items-end justify-end">
                <img
                  src={bundleItems[0].images?.icon || bundleItems[0].images?.featured || bundleItems[0].images?.smallIcon}
                  alt={bundleItems[0].name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            )}

            {/* Floating items (smaller, scattered around) */}
            {bundleItems.slice(1, 7).map((item: any, idx: number) => {
              // Define positions for floating items
              const positions = [
                { top: '10%', left: '5%', size: 'w-16 h-16' },
                { top: '5%', left: '25%', size: 'w-20 h-20' },
                { top: '30%', left: '8%', size: 'w-14 h-14' },
                { bottom: '25%', left: '15%', size: 'w-18 h-18' },
                { top: '50%', left: '35%', size: 'w-12 h-12' },
                { bottom: '10%', left: '30%', size: 'w-16 h-16' },
              ];

              const position = positions[idx] || positions[0];

              return (
                <div
                  key={idx}
                  className={`absolute ${position.size}`}
                  style={{
                    top: position.top,
                    left: position.left,
                    bottom: position.bottom,
                  }}
                >
                  <img
                    src={item.images?.icon || item.images?.featured || item.images?.smallIcon}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              );
            })}

            {bundleItems.length > 7 && (
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                <span className="text-white font-bold text-sm">+{bundleItems.length - 7}</span>
              </div>
            )}
          </div>
        ) : null}

        {/* Info Overlay - Bottom Left */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
          <h3 className="text-white font-black text-base sm:text-lg uppercase italic leading-tight mb-1.5 sm:mb-2 line-clamp-1">
            {bundleName}
          </h3>

          <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#00d4ff] flex-shrink-0 sm:w-[18px] sm:h-[18px]">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className="text-white font-black text-sm sm:text-base tracking-tight">{price.toLocaleString()}</span>
          </div>

          <p className="text-gray-300 text-xs sm:text-sm font-bold">
            {formatPrice(priceInCLP)}
          </p>
        </div>

        {/* Cart Button - Bottom Right */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-gray-700/90 hover:bg-gray-600 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
          aria-label="Agregar al carrito"
        >
          <ShoppingCart size={16} className="text-white cart-icon transition-transform duration-300 sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>
    </motion.div>
  );
};
