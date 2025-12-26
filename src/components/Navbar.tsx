import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Zap, ArrowRight, Globe } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { CartDrawer } from './CartDrawer';
import { productsService } from '../services/products.service';
import { Product } from '../types';

// Componente de resultados de búsqueda
const SearchResults: React.FC<{ searchTerm: string; onClose: () => void }> = ({ searchTerm, onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const searchProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await productsService.getAll();
        const filtered = allProducts.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5); // Máximo 5 resultados
        setProducts(filtered);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    };

    if (searchTerm) {
      searchProducts();
    }
  }, [searchTerm]);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  const handleViewAll = () => {
    navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
    onClose();
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-400 mt-4">Buscando...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-8 text-center">
        <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No se encontraron resultados para "{searchTerm}"</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border-b border-white/10">
        <p className="text-gray-400 text-sm">
          {products.length} resultado{products.length !== 1 ? 's' : ''} para "<span className="text-white font-semibold">{searchTerm}</span>"
        </p>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => handleProductClick(product.id!)}
            className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1 text-left">
              <h3 className="text-white font-semibold">{product.name}</h3>
              <p className="text-gray-400 text-sm line-clamp-1">{product.description}</p>
              <p className="text-brand-green font-bold mt-1">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(product.price)}</p>
            </div>
            <ArrowRight className="text-gray-500" size={20} />
          </button>
        ))}
      </div>
      
      <div className="p-4 bg-black/30 border-t border-white/10">
        <button
          onClick={handleViewAll}
          className="w-full py-2 bg-brand-green/10 hover:bg-brand-green/20 border border-brand-green/30 text-brand-green font-semibold rounded-lg transition-all"
        >
          Ver todos los resultados
        </button>
      </div>
    </>
  );
};

export const Navbar = () => {
  const { items } = useCart();
  const { isAuthenticated } = useAuth();
  const { currentCurrency, availableCurrencies, changeCurrency } = useCurrency();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setSearchTerm('');
    }
  };

  // Efecto de scroll para cambiar la opacidad y altura
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Tienda Fortnite', path: '/fortnite' },
    { name: 'Catálogo', path: '/shop' },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "circOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b",
          scrolled 
            ? "bg-[#0b1221]/95 border-white/10 py-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]" 
            : "bg-transparent border-transparent py-6"
        )}
      >
        {/* Línea de gradiente superior para efecto Cyberpunk */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-green/50 to-transparent opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo Area */}
            <Link to="/" className="flex items-center gap-2 group relative z-20">
              <div className="absolute inset-0 bg-brand-orange/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img 
                src="https://i.postimg.cc/wxRJh3P1/logo-Navideno.png" 
                alt="TioCalcifer Logo" 
                className="h-12 md:h-16 w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_15px_rgba(237,118,78,0.4)]" 
              />
            </Link>

            {/* Desktop Navigation - Tech Style */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className="relative group py-2"
                  >
                    <span className={cn(
                      "text-sm font-black uppercase tracking-[0.15em] transition-all duration-300 relative z-10",
                      isActive ? "text-brand-green" : "text-gray-400 group-hover:text-white"
                    )}>
                      {link.name}
                    </span>
                    
                    {/* Hover Line */}
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-green scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right group-hover:origin-left" />
                    
                    {/* Active Line */}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-green"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Actions Area */}
            <div className="flex items-center gap-3 md:gap-6 z-20">
              {/* Currency Selector - Mobile & Desktop */}
              <div className="relative">
                <button
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                  onBlur={() => setTimeout(() => setCurrencyOpen(false), 200)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  <Globe size={18} />
                  <span className="text-sm font-bold">{currentCurrency?.code || 'CLP'}</span>
                </button>
                
                {/* Currency Dropdown */}
                <AnimatePresence>
                  {currencyOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-[#0a0f1e] border border-white/20 rounded-lg shadow-xl z-50 overflow-hidden"
                    >
                      {availableCurrencies.map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => {
                            changeCurrency(currency.code);
                            setCurrencyOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                            currentCurrency?.code === currency.code ? 'bg-brand-green/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-semibold ${
                              currentCurrency?.code === currency.code ? 'text-brand-green' : 'text-white'
                            }`}>
                              {currency.code}
                            </span>
                            {currentCurrency?.code === currency.code && (
                              <span className="text-brand-green text-sm">✓</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">{currency.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search Bar - Desktop */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Buscar productos..."
                  className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-brand-green/50 focus:w-64 lg:focus:w-80 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSearchOpen(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="h-6 w-[1px] bg-white/10 hidden md:block" />

              {/* Cart Button */}
              <button 
                onClick={() => setCartOpen(true)}
                className="relative group"
              >
                <div className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg border transition-all duration-300",
                  itemCount > 0 
                    ? "bg-brand-green/10 border-brand-green/50 text-brand-green shadow-[0_0_15px_rgba(148,193,31,0.2)]" 
                    : "bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:bg-white/10"
                )}>
                  <ShoppingCart size={18} className={cn("transition-transform group-hover:scale-110", itemCount > 0 && "fill-current")} />
                  <span className="font-bold font-mono">{itemCount}</span>
                </div>
              </button>
              
              {/* User Button */}
              <Link 
                to={isAuthenticated ? "/profile" : "/login"} 
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-brand-orange/10 hover:border-brand-orange/50 hover:text-brand-orange transition-all duration-300"
              >
                <User size={18} />
              </Link>

              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 text-white hover:text-brand-green transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-[#0b1221]/95 backdrop-blur-xl md:hidden pt-24 px-6"
          >
            {/* Background Grid */}
            <div className="absolute inset-0 bg-grid-animate opacity-10 pointer-events-none" />
            
            <div className="flex flex-col gap-6 relative z-10">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link 
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-brand-green hover:border-brand-green transition-all group text-white hover:text-brand-dark"
                  >
                    <span className="text-2xl font-black uppercase tracking-wider group-hover:text-brand-dark">{link.name}</span>
                    <Zap className="opacity-0 group-hover:opacity-100 transition-opacity group-hover:text-brand-dark" size={20} />
                  </Link>
                </motion.div>
              ))}
              
              <div className="h-[1px] bg-white/10 my-4" />
              
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to={isAuthenticated ? "/profile" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold flex flex-col items-center gap-2 hover:bg-white/10"
                >
                  <User size={24} />
                  <span>Mi Cuenta</span>
                </Link>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => {
                      setSearchOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchTerm.trim()) {
                        navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
                        setMobileMenuOpen(false);
                        setSearchOpen(false);
                        setSearchTerm('');
                      }
                    }}
                    placeholder="Buscar productos..."
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-base placeholder:text-gray-500 focus:outline-none focus:border-brand-green/50 transition-all"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {searchOpen && searchTerm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 z-[90] bg-black/50"
            />
            
            {/* Results Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-[100] px-4"
            >
              <div className="bg-[#0a0f1e] border border-white/20 rounded-xl overflow-hidden shadow-2xl">
                <SearchResults 
                  searchTerm={searchTerm} 
                  onClose={() => {
                    setSearchOpen(false);
                    setSearchTerm('');
                  }} 
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
