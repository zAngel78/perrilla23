import React, { useEffect, useRef } from 'react';
import { Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { Product } from '../types';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  index: number;
}

export const ProductCard = ({ product, onAddToCart, index }: ProductCardProps) => {
  const cardRef = useScrollReveal<HTMLDivElement>();
  const delayRef = useRef<HTMLDivElement>(null);
  const { formatPrice } = useCurrency();

  // Apply staggered delay based on index
  useEffect(() => {
    const element = delayRef.current || cardRef.current;
    if (element) {
      element.style.transitionDelay = `${index * 0.1}s`;
    }
  }, [index]);

  return (
    <div 
      ref={cardRef}
      className="group relative bg-[#121a2b] rounded-none overflow-hidden hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full"
    >
      {/* Holographic Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-green via-brand-yellow to-brand-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ padding: '1px' }}>
        <div className="absolute inset-0 bg-[#121a2b] m-[1px]" />
      </div>

      {/* Image Container - Ahora es un Link */}
      <Link to={`/product/${product.id}`} className="relative h-72 overflow-hidden bg-[#0f1623] block">
        <div className="absolute inset-0 bg-gradient-to-t from-[#121a2b] to-transparent z-10 opacity-80" />
        
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-110 group-hover:rotate-2 transition-all duration-700 ease-out opacity-80 group-hover:opacity-100"
        />
        
        {/* Tech Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className="px-2 py-1 bg-brand-green text-brand-dark text-[10px] font-black uppercase tracking-widest">
            {product.category}
          </span>
        </div>

        {/* Overlay Button on Hover */}
        <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
            <div className="bg-white text-black px-4 py-2 font-bold uppercase tracking-wider flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                <Eye size={16} /> Ver Detalle
            </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 relative z-20 flex flex-col flex-grow">
        <div className="mb-auto">
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-2xl font-black text-white mb-2 leading-none uppercase italic group-hover:text-brand-green transition-colors">
                {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white tracking-tighter">
              {formatPrice(product.price)}
            </span>
          </div>
          
          <button 
            onClick={(e) => {
                e.preventDefault();
                onAddToCart(product);
            }}
            className="w-10 h-10 bg-white/5 hover:bg-brand-green hover:text-brand-dark text-white flex items-center justify-center transition-all duration-300 group/btn"
            title="Agregar al carrito"
          >
            <Plus size={20} className="group-hover/btn:rotate-90 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
