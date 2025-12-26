import React, { useEffect, useState } from 'react';
import { getFortniteShop, FortniteShopSections } from '../lib/fortniteApi';
import { Loader2, Clock, Filter, LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { ShopSection } from '../components/ShopSection';
import { FortniteItemCard } from '../components/FortniteItemCard';
import { BundleCard } from '../components/BundleCard';

export const FortniteShop = () => {
  const [shopData, setShopData] = useState<FortniteShopSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [showBundlesOnly, setShowBundlesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'grid'>('slider');

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const data = await getFortniteShop();
        setShopData(data);
      } catch (error) {
        console.error("Error fetching shop", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, []);

  // Filter items based on search and rarity
  const filterItems = (items: any[]) => {
    let filtered = items;
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(item => item.rarity === selectedRarity);
    }
    
    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />
        <p className="text-white font-bold tracking-widest animate-pulse">LOADING ITEM SHOP...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1221] pb-20">
      {/* Header Section */}
      <div className="relative pt-24 pb-8 px-4 overflow-hidden border-b border-brand-green/20">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-green/5 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8"
          >
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tight mb-2">
                ITEM SHOP
              </h1>
              <div className="flex items-center gap-3 text-sm">
                <div className="bg-brand-orange/10 backdrop-blur-sm border border-brand-orange/30 px-4 py-1.5 rounded">
                  <span className="text-brand-orange font-bold">{shopData?.all.length || 0} Items</span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md w-full">
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
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 focus:outline-none focus:border-brand-green/50 transition-colors"
              />
            </div>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-white/5 p-1 rounded">
              <button
                onClick={() => setViewMode('slider')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'slider'
                    ? 'bg-brand-green text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Slider View"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'grid'
                    ? 'bg-brand-green text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
            </div>

            {/* Bundles Toggle */}
            <button
              onClick={() => setShowBundlesOnly(!showBundlesOnly)}
              className={`px-4 py-2 rounded font-bold text-sm uppercase transition-all border-2 ${
                showBundlesOnly
                  ? 'bg-brand-yellow/20 border-brand-yellow text-brand-yellow'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border-transparent'
              }`}
            >
              Bundles Only ({shopData?.bundles.length || 0})
            </button>

            {/* Rarity Filter */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-gray-400 text-sm font-semibold uppercase flex items-center gap-2">
                <Filter size={16} /> Rarity:
              </span>
            {[
              { key: 'all', label: 'All', color: 'bg-gray-500/20 border-gray-500 text-gray-400' },
              { key: 'common', label: 'Common', color: 'bg-gray-500/20 border-gray-500 text-gray-300' },
              { key: 'uncommon', label: 'Uncommon', color: 'bg-green-500/20 border-green-500 text-green-400' },
              { key: 'rare', label: 'Rare', color: 'bg-blue-500/20 border-blue-500 text-blue-400' },
              { key: 'epic', label: 'Epic', color: 'bg-purple-500/20 border-purple-500 text-purple-400' },
              { key: 'legendary', label: 'Legendary', color: 'bg-orange-500/20 border-orange-500 text-orange-400' },
            ].map((rarity) => (
              <button
                key={rarity.key}
                onClick={() => setSelectedRarity(rarity.key)}
                className={`px-4 py-1.5 rounded text-xs font-bold uppercase transition-all border ${
                  selectedRarity === rarity.key
                    ? `${rarity.color} shadow-lg`
                    : 'bg-white/5 text-gray-500 hover:bg-white/10 border-transparent'
                }`}
              >
                {rarity.label}
              </button>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* Shop Content */}
      <div className="max-w-[1600px] mx-auto py-8">
        {shopData && (
          <>
            {viewMode === 'slider' ? (
              // Slider View (Horizontal Sections)
              <>
                {showBundlesOnly ? (
                  <ShopSection 
                    title="Bundles" 
                    items={filterItems(shopData.bundles)}
                    bundleEntries={shopData.bundleEntries}
                    accent="yellow"
                    isBundle={true}
                  />
                ) : (
                  <>
                    <ShopSection 
                      title="Featured" 
                      items={filterItems(shopData.featured)} 
                      accent="green"
                    />
                    <ShopSection 
                      title="Daily Rotation" 
                      items={filterItems(shopData.daily)} 
                      accent="orange"
                    />
                    <ShopSection 
                      title="Special Offers" 
                      items={filterItems(shopData.special)} 
                      accent="yellow"
                    />
                    {shopData.bundles.length > 0 && (
                      <ShopSection 
                        title="Bundles" 
                        items={filterItems(shopData.bundles)}
                        bundleEntries={shopData.bundleEntries}
                        accent="yellow"
                        isBundle={true}
                      />
                    )}
                  </>
                )}
              </>
            ) : (
              // Grid View (Vertical Grid)
              <div className="px-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {showBundlesOnly ? (
                    // Show only bundles
                    shopData.bundleEntries.map((entry, idx) => (
                      <BundleCard key={entry.offerId || idx} bundle={entry} index={idx} />
                    ))
                  ) : (
                    // Show all items
                    filterItems(shopData.all).map((item, idx) => {
                      // Check if this item is a bundle
                      const bundleEntry = shopData.bundleEntries.find(
                        (e) => e.offerId === item.id
                      );
                      
                      return bundleEntry ? (
                        <BundleCard key={item.id} bundle={bundleEntry} index={idx} />
                      ) : (
                        <FortniteItemCard key={item.id} item={item} index={idx} />
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </>
        )}
        
        {shopData && filterItems(shopData.all).length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No items found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
