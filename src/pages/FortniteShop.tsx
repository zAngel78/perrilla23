import React, { useEffect, useState, useRef } from 'react';
import { getFortniteShop, FortniteShopSections, FortniteShopSection } from '../lib/fortniteApi';
import { Loader2, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { ShopSection } from '../components/ShopSection';
import { FortniteSidebar } from '../components/FortniteSidebar';

export const FortniteShop = () => {
  const [shopData, setShopData] = useState<FortniteShopSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [activeSection, setActiveSection] = useState<string>('');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const data = await getFortniteShop();
        setShopData(data);
        // Set first section as active by default
        if (data.sections.length > 0) {
          setActiveSection(data.sections[0].name);
        }
      } catch (error) {
        console.error("Error fetching shop", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, []);

  // Scroll to section
  const scrollToSection = (sectionName: string) => {
    const element = sectionRefs.current[sectionName];
    if (element) {
      const yOffset = -100; // Offset para el header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(sectionName);
    }
  };

  // Detect visible section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const [name, ref] of Object.entries(sectionRefs.current)) {
        if (ref) {
          const { top, bottom } = ref.getBoundingClientRect();
          const absoluteTop = top + window.scrollY;
          const absoluteBottom = bottom + window.scrollY;

          if (scrollPosition >= absoluteTop && scrollPosition < absoluteBottom) {
            setActiveSection(name);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [shopData]);

  // Filter sections based on search and rarity
  const filterSection = (section: FortniteShopSection): FortniteShopSection | null => {
    let filtered = section.items;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedRarity !== 'all') {
      filtered = filtered.filter(item => item.rarity === selectedRarity);
    }

    // Return null if section has no items after filtering
    if (filtered.length === 0) return null;

    return {
      name: section.name,
      items: filtered,
      bundleEntries: section.bundleEntries
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1221] flex flex-col items-center justify-center gap-3 sm:gap-4 px-4">
        <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-brand-green animate-spin" />
        <p className="text-white font-black tracking-widest animate-pulse uppercase text-sm sm:text-base text-center">Loading Item Shop...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1221] pb-20 selection:bg-brand-green selection:text-brand-dark">
      {/* Sidebar */}
      {shopData && shopData.sections.length > 0 && (
        <FortniteSidebar
          sections={shopData.sections}
          onSectionClick={scrollToSection}
          activeSection={activeSection}
        />
      )}

      {/* Header Section */}
      <div className="relative pt-20 sm:pt-24 pb-6 sm:pb-8 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-brand-yellow/5 blur-[100px] sm:blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-brand-orange/5 blur-[100px] sm:blur-[150px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative w-full overflow-hidden"
          style={{
            backgroundImage: 'url(https://i.postimg.cc/L6ZRvzhw/fortnite-purple-vector-logo-banner-violet-blue-pink-gradient-background-online-game-editorial-white.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70 backdrop-blur-[1px]" />

          {/* Content wrapper with relative positioning */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:pl-20 py-6 sm:py-8">
            <div className="flex flex-col gap-4 sm:gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white mb-2 uppercase tracking-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                Fortnite <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-brand-orange italic drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">Shop</span>
              </h1>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="bg-brand-green/20 backdrop-blur-md border border-brand-green/40 px-3 sm:px-4 py-1 sm:py-1.5 rounded shadow-lg">
                  <span className="text-brand-green font-bold uppercase tracking-wider drop-shadow-lg">
                    {shopData?.sections.length || 0} Secciones • {shopData?.all.length || 0} Items
                  </span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:max-w-md">
              <div className="absolute left-3 top-[14px] pointer-events-none">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="text-gray-400"
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
                placeholder="Buscar items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-black/30 backdrop-blur-md border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-brand-green/50 focus:bg-black/40 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start sm:items-center">
            {/* Rarity Filter */}
            <div className="w-full sm:w-auto">
              <span className="text-gray-400 text-xs sm:text-sm font-semibold flex items-center gap-2 mb-2 sm:mb-0">
                <Filter size={14} className="sm:w-4 sm:h-4" /> Rareza:
              </span>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {[
                { key: 'all', label: 'Todos' },
                { key: 'common', label: 'Común' },
                { key: 'uncommon', label: 'Poco común' },
                { key: 'rare', label: 'Raro' },
                { key: 'epic', label: 'Épico' },
                { key: 'legendary', label: 'Legendario' },
              ].map((rarity) => (
                <button
                  key={rarity.key}
                  onClick={() => setSelectedRarity(rarity.key)}
                  className={`px-3 sm:px-4 py-1.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedRarity === rarity.key
                      ? 'bg-brand-green text-brand-dark shadow-lg shadow-brand-green/50'
                      : 'bg-black/40 backdrop-blur-md text-gray-300 hover:bg-black/60 hover:text-white border border-white/20'
                  }`}
                >
                  {rarity.label}
                </button>
              ))}
            </div>
            </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Shop Content */}
      <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-2 sm:px-4 lg:ml-20">
        {shopData && shopData.sections.map((section) => {
          const filteredSection = filterSection(section);
          if (!filteredSection) return null;

          return (
            <div
              key={section.name}
              ref={(el) => (sectionRefs.current[section.name] = el)}
            >
              <ShopSection
                title={section.name}
                items={filteredSection.items}
                bundleEntries={filteredSection.bundleEntries}
                isBundle={filteredSection.bundleEntries.length > 0}
              />
            </div>
          );
        })}

        {shopData && shopData.sections.every(section => filterSection(section) === null) && (
          <div className="text-center py-12 sm:py-16 lg:py-20 px-4">
            <p className="text-gray-400 text-base sm:text-lg">No se encontraron items con tus filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
};
