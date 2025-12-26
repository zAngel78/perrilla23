import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Package, Zap } from 'lucide-react';
import { FortniteShopSection } from '../lib/fortniteApi';

interface FortniteSidebarProps {
  sections: FortniteShopSection[];
  onSectionClick: (sectionName: string) => void;
  activeSection?: string;
}

export const FortniteSidebar: React.FC<FortniteSidebarProps> = ({
  sections,
  onSectionClick,
  activeSection
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="hidden lg:block fixed left-0 top-24 z-40 h-[calc(100vh-6rem)]"
    >
      <div className="relative h-full">
        {/* Sidebar Container */}
        <motion.div
          animate={{ width: isExpanded ? '280px' : '64px' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="h-full bg-[#121a2b]/95 backdrop-blur-md border-r border-brand-green/20 shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-brand-green/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-green rounded flex items-center justify-center flex-shrink-0">
                <Zap size={18} className="text-brand-dark fill-current" />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h3 className="text-white font-black uppercase tracking-tight text-sm">
                  Secciones
                </h3>
                <p className="text-brand-green text-xs font-bold">
                  {sections.length} categorías
                </p>
              </motion.div>
            </div>
          </div>

          {/* Sections List */}
          <div className="overflow-y-auto h-[calc(100%-80px)] scrollbar-hide py-2">
            {sections.map((section, index) => {
              const isActive = activeSection === section.name;
              const hasBundle = section.bundleEntries && section.bundleEntries.length > 0;

              return (
                <button
                  key={section.name}
                  onClick={() => onSectionClick(section.name)}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-all group relative ${
                    isActive
                      ? 'bg-brand-green/20 border-l-4 border-brand-green'
                      : 'hover:bg-white/5 border-l-4 border-transparent'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                    isActive
                      ? 'bg-brand-green text-brand-dark'
                      : 'bg-white/10 text-gray-400 group-hover:bg-brand-green/20 group-hover:text-brand-green'
                  }`}>
                    {hasBundle ? (
                      <Package size={16} />
                    ) : (
                      <span className="font-black text-xs">{index + 1}</span>
                    )}
                  </div>

                  {/* Text */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isExpanded ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 text-left overflow-hidden"
                  >
                    <p className={`font-black text-xs uppercase leading-tight truncate transition-colors ${
                      isActive ? 'text-brand-green' : 'text-white group-hover:text-brand-green'
                    }`}>
                      {section.name}
                    </p>
                    <p className="text-gray-400 text-[10px] font-bold">
                      {section.items.length + (section.bundleEntries?.length || 0)} items
                    </p>
                  </motion.div>

                  {/* Arrow indicator */}
                  {isExpanded && (
                    <ChevronRight
                      size={14}
                      className={`transition-all ${
                        isActive ? 'text-brand-green translate-x-1' : 'text-gray-600 group-hover:text-brand-green group-hover:translate-x-1'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Expand Hint (when collapsed) */}
        {!isExpanded && (
          <div className="absolute top-1/2 -right-8 -translate-y-1/2 bg-brand-green/10 backdrop-blur-sm border border-brand-green/30 px-2 py-1 rounded-r text-brand-green text-[10px] font-bold uppercase tracking-wider pointer-events-none">
            <ChevronRight size={12} className="animate-pulse" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
