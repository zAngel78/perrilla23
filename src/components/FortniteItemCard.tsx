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

const RarityColors: Record<string, { border: string; glow: string; text: string; bg: string }> = {
  common: {
    border: 'border-gray-500',
    glow: 'shadow-[0_0_30px_rgba(156,163,175,0.3)]',
    text: 'text-gray-400',
    bg: 'from-gray-600/20 to-gray-800/40'
  },
  uncommon: {
    border: 'border-green-500',
    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.4)]',
    text: 'text-green-400',
    bg: 'from-green-600/20 to-green-800/40'
  },
  rare: {
    border: 'border-blue-500',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.4)]',
    text: 'text-blue-400',
    bg: 'from-blue-600/20 to-blue-800/40'
  },
  epic: {
    border: 'border-purple-500',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]',
    text: 'text-purple-400',
    bg: 'from-purple-600/20 to-purple-800/40'
  },
  legendary: {
    border: 'border-orange-500',
    glow: 'shadow-[0_0_30px_rgba(249,115,22,0.5)]',
    text: 'text-orange-400',
    bg: 'from-orange-600/20 to-orange-800/40'
  },
};

export const FortniteItemCard: React.FC<FortniteItemCardProps> = ({ item, index }) => {
  const rarityStyle = RarityColors[item.rarity] || RarityColors.common;
  const { addToCart } = useCart();
  const { formatPrice, currentCurrency } = useCurrency();
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
    button.textContent = '✓ Agregado';
    button.classList.add('bg-green-500');
    setTimeout(() => {
      button.textContent = 'Agregar al Carrito';
      button.classList.remove('bg-green-500');
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`group relative flex flex-col bg-gradient-to-b ${rarityStyle.bg} rounded overflow-hidden border-2 ${rarityStyle.border} ${rarityStyle.glow} transition-all duration-500 cursor-pointer hover:border-opacity-100`}
      style={{ minHeight: '400px' }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
    >
      {/* Rarity indicator strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${rarityStyle.bg}`} />

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-black/40 to-black/80">
        {/* Animated background on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${rarityStyle.bg} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
        
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-2 transition-all duration-700"
          loading="lazy"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
        
        {/* Animated glow effect on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${rarityStyle.glow}`} />

        {/* Price tag */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-md">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#00d4ff]">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="text-white font-bold text-sm">{item.price.toLocaleString()}</span>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 bg-black/60 backdrop-blur-sm flex-1 flex flex-col group-hover:bg-black/80 transition-colors duration-300">
        <h3 className="text-white font-bold text-lg uppercase leading-tight mb-2 line-clamp-2 group-hover:text-white transition-colors">{item.name}</h3>
        <p className={`text-sm font-semibold uppercase ${rarityStyle.text} mb-2`}>{item.type}</p>
        
        {item.description && (
          <p className="text-gray-400 text-sm line-clamp-2 mb-3">{item.description}</p>
        )}

        <div className="mt-auto space-y-2">
          <button 
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-brand-green hover:bg-brand-green/80 text-black text-sm font-bold uppercase tracking-wider rounded transition-all duration-300 flex items-center justify-center gap-2"
          >
            <ShoppingCart size={16} />
            Agregar al Carrito
          </button>
          <p className="text-center text-gray-500 text-xs">
            {formatPrice(priceInCLP)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
