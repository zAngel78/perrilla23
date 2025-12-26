import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FortniteItem } from '../types';
import { FortniteItemCard } from './FortniteItemCard';
import { BundleCard } from './BundleCard';

interface ShopSectionProps {
  title: string;
  items: FortniteItem[];
  bundleEntries?: any[];
  accent?: 'green' | 'orange' | 'yellow';
  isBundle?: boolean;
}

export const ShopSection: React.FC<ShopSectionProps> = ({ title, items, bundleEntries, accent = 'green', isBundle = false }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (items.length === 0) return null;

  const accentColors = {
    green: {
      gradient: 'from-brand-green to-brand-green/50',
      glow: 'shadow-[0_0_30px_rgba(148,193,31,0.3)]',
      text: 'text-brand-green',
      button: 'hover:bg-brand-green/20 border-brand-green/30'
    },
    orange: {
      gradient: 'from-brand-orange to-brand-orange/50',
      glow: 'shadow-[0_0_30px_rgba(237,118,78,0.3)]',
      text: 'text-brand-orange',
      button: 'hover:bg-brand-orange/20 border-brand-orange/30'
    },
    yellow: {
      gradient: 'from-brand-yellow to-brand-yellow/50',
      glow: 'shadow-[0_0_30px_rgba(245,194,89,0.3)]',
      text: 'text-brand-yellow',
      button: 'hover:bg-brand-yellow/20 border-brand-yellow/30'
    }
  };

  const colors = accentColors[accent];

  return (
    <div className="mb-16">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-4">
          <div className={`h-1 w-16 bg-gradient-to-r ${colors.gradient} ${colors.glow}`} />
          <h2 className={`text-3xl md:text-4xl font-black uppercase ${colors.text}`}>
            {title}
          </h2>
          <span className="text-gray-500 text-lg font-bold">({items.length})</span>
        </div>

        {/* Navigation Buttons */}
        {items.length > 4 && (
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className={`p-2 bg-white/5 border border-white/10 ${colors.button} rounded transition-all`}
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <button
              onClick={() => scroll('right')}
              className={`p-2 bg-white/5 border border-white/10 ${colors.button} rounded transition-all`}
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-4 pb-4"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {isBundle && bundleEntries ? (
          bundleEntries.map((entry, idx) => (
            <div
              key={entry.offerId || idx}
              className="flex-shrink-0"
              style={{
                width: '350px',
                scrollSnapAlign: 'start'
              }}
            >
              <BundleCard bundle={entry} index={idx} />
            </div>
          ))
        ) : (
          items.map((item, idx) => (
            <div
              key={item.id}
              className="flex-shrink-0"
              style={{
                width: '280px',
                scrollSnapAlign: 'start'
              }}
            >
              <FortniteItemCard item={item} index={idx} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
