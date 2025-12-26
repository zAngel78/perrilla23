import React, { useState, useEffect } from 'react';
import { FortniteItem } from '../types';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { apiService } from '../services/api.service';

interface FortniteItemCardProps {
  item: FortniteItem;
  index: number;
}

// Cache para la tasa de conversión
let cachedRate: number | null = null;

// Rarity colors (fondos y acentos)
const RarityColors: Record<string, { bg: string; shadow: string; glow: string }> = {
  common: {
    bg: 'from-gray-500/80 to-gray-600/60',
    shadow: 'shadow-gray-500/40',
    glow: 'shadow-[0_0_30px_rgba(156,163,175,0.3)]'
  },
  uncommon: {
    bg: 'from-green-500/80 to-green-600/60',
    shadow: 'shadow-green-500/40',
    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.4)]'
  },
  rare: {
    bg: 'from-blue-500/80 to-blue-600/60',
    shadow: 'shadow-blue-500/40',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.4)]'
  },
  epic: {
    bg: 'from-purple-500/80 to-purple-600/60',
    shadow: 'shadow-purple-500/40',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]'
  },
  legendary: {
    bg: 'from-orange-500/80 to-orange-600/60',
    shadow: 'shadow-orange-500/40',
    glow: 'shadow-[0_0_30px_rgba(249,115,22,0.5)]'
  },
};

export const FortniteItemCard: React.FC<FortniteItemCardProps> = ({ item, index }) => {
  const rarityStyle = RarityColors[item.rarity] || RarityColors.common;
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
      // Usar default si falla
      setVbucksRate(4.4);
    }
  };

  // Calcular precio en CLP (tasa configurada por admin)
  const priceInCLP = item.price * vbucksRate; // Ej: 1500 V-Bucks * 4.4 = 6,600 CLP

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Convertir FortniteItem a Product para el carrito (precio en CLP)
    const product: Product = {
      id: item.id,
      name: item.name,
      description: item.description || `${item.type} - ${item.rarity}`,
      price: priceInCLP, // Precio directo en CLP
      image: item.image,
      category: 'fortnite',
      stock: 999, // Items digitales tienen stock "infinito"
      rating: 5,
      isDigitalProduct: true, // Es un producto digital
    };

    addToCart(product);

    // Feedback visual
    const button = e.currentTarget as HTMLButtonElement;
    const icon = button.querySelector('.cart-icon');
    if (icon) {
      icon.classList.add('scale-125');
      setTimeout(() => icon.classList.remove('scale-125'), 300);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`group relative rounded-2xl overflow-hidden bg-gradient-to-b ${rarityStyle.bg} backdrop-blur-md hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl ${rarityStyle.shadow} ${rarityStyle.glow} font-sans`}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 }
      }}
    >

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden z-10">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Info Overlay - Bottom Left */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
          <h3 className="text-white font-black text-sm sm:text-base uppercase italic leading-tight mb-1.5 sm:mb-2 line-clamp-2">
            {item.name}
          </h3>

          {item.price > 0 && (
            <>
              <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#00d4ff] flex-shrink-0 sm:w-4 sm:h-4">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span className="text-white font-black text-xs sm:text-sm tracking-tight">{item.price.toLocaleString()}</span>
              </div>

              <p className="text-gray-300 text-[10px] sm:text-xs font-bold">
                {formatPrice(priceInCLP)}
              </p>
            </>
          )}
        </div>

        {/* Cart Button - Bottom Right (only for items with price) */}
        {item.price > 0 && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-gray-700/90 hover:bg-gray-600 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
            aria-label="Agregar al carrito"
          >
            <ShoppingCart size={16} className="text-white cart-icon transition-transform duration-300 sm:w-[18px] sm:h-[18px]" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
