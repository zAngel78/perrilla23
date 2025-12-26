import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Zap, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { productsService } from '../services/products.service';
import { heroSlidesService, HeroSlide } from '../services/hero-slides.service';
import { apiService } from '../services/api.service';
import { Product } from '../types';
import { useScrollReveal } from '../hooks/useScrollReveal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Home = () => {
  const { addToCart } = useCart();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  
  // Estado para productos destacados
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Estado para hero slides
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [slideInterval, setSlideInterval] = useState(5000);
  
  // Scroll reveal refs for sections
  const productsTitleRef = useScrollReveal<HTMLDivElement>();
  const fortniteSectionRef = useScrollReveal<HTMLDivElement>();
  
  const heroContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroContainerRef.current) return;

    // Hero scroll animation - scale down with rounded corners and fade out
    gsap.to(heroContainerRef.current, {
      scrollTrigger: {
        trigger: heroContainerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
      opacity: 0,
      scale: 0.85,
      borderRadius: "2rem",
      ease: "none",
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Cargar hero slides y configuración
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingSlides(true);
        
        // Cargar slides
        const slides = await heroSlidesService.getActive();
        setHeroSlides(slides);
        
        // Cargar configuración de intervalo
        try {
          const response = await apiService.get('/api/settings', { skipAuth: true });
          setSlideInterval(response.data.heroSlideInterval || 5000);
        } catch (error) {
          console.error('Error loading settings:', error);
          // Usar default si falla
          setSlideInterval(5000);
        }
      } catch (error) {
        console.error('Error loading hero slides:', error);
      } finally {
        setLoadingSlides(false);
      }
    };

    fetchData();
  }, []);

  // Auto-play slides con intervalo dinámico
  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [heroSlides.length, slideInterval]);

  // Cargar productos destacados
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoadingProducts(true);
        const products = await productsService.getFeatured();
        // Ordenar por featuredOrder y limitar a 4 productos en home
        const sorted = products.sort((a, b) => 
          (a.featuredOrder || 999) - (b.featuredOrder || 999)
        );
        setFeaturedProducts(sorted.slice(0, 4));
      } catch (error) {
        console.error('Error loading featured products:', error);
        // Si falla, intentar cargar todos y tomar los primeros
        try {
          const allProducts = await productsService.getAll();
          setFeaturedProducts(allProducts.slice(0, 4));
        } catch (err) {
          console.error('Error loading products:', err);
        }
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="bg-[#0b1221] min-h-screen selection:bg-brand-green selection:text-brand-dark">
      
      {/* Hero Section Ultra with ScrollTrigger - DYNAMIC SLIDER */}
      <section style={{ marginBottom: '-100vh', paddingTop: 0, paddingBottom: 0 }}>
        <div ref={heroContainerRef} className="sticky top-0 will-change-auto overflow-hidden">
          <div className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        
        {/* Background Slides */}
        <AnimatePresence mode="wait">
          {loadingSlides ? (
            <div className="absolute inset-0 z-0 bg-[#0b1221] flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-brand-green animate-spin" />
            </div>
          ) : heroSlides.length > 0 ? (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 z-0"
            >
              <img
                src={heroSlides[currentSlide].image}
                alt={heroSlides[currentSlide].title}
                className="w-full h-full object-cover"
              />
              {/* Overlay oscuro */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
            </motion.div>
          ) : (
            // Fallback: Fondo por defecto si no hay slides
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b1221] to-[#0b1221] z-10" />
              <div className="w-full h-[200%] bg-grid-animate transform -skew-x-12 origin-top opacity-20" />
            </div>
          )}
        </AnimatePresence>

        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-green/10 blur-[150px] rounded-full pointer-events-none z-10" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-orange/10 blur-[150px] rounded-full pointer-events-none z-10" />

        {/* Dynamic Content from Slides */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatePresence mode="wait">
            {!loadingSlides && heroSlides.length > 0 && heroSlides[currentSlide].showText && (
              <motion.div
                key={`content-${currentSlide}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-3xl"
              >
                {heroSlides[currentSlide].title && (
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-4 sm:mb-6 leading-tight">
                    {heroSlides[currentSlide].title}
                  </h1>
                )}
                
                {heroSlides[currentSlide].subtitle && (
                  <p className="text-gray-300 text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-2xl leading-relaxed">
                    {heroSlides[currentSlide].subtitle}
                  </p>
                )}
                
                {heroSlides[currentSlide].buttonText && heroSlides[currentSlide].buttonLink && (
                  <Link
                    to={heroSlides[currentSlide].buttonLink}
                    className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-brand-green hover:bg-brand-green/80 text-black text-sm sm:text-base font-black uppercase tracking-wider transition-all rounded-lg sm:rounded-none"
                  >
                    {heroSlides[currentSlide].buttonText}
                    <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Slider Controls - Outside container for proper positioning */}
        {heroSlides.length > 1 && (
          <>
            {/* Previous Button - Left */}
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/90 hover:bg-white backdrop-blur-md shadow-lg rounded-full transition-all"
            >
              <ChevronLeft className="text-black" size={20} />
            </button>
            
            {/* Next Button - Right */}
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/90 hover:bg-white backdrop-blur-md shadow-lg rounded-full transition-all"
            >
              <ChevronRight className="text-black" size={20} />
            </button>
            
            {/* Dots Indicator - Bottom Center */}
            <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-30">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all ${
                    index === currentSlide
                      ? 'w-8 sm:w-10 md:w-12 h-2 sm:h-2.5 md:h-3 bg-brand-green'
                      : 'w-2 sm:w-2.5 md:w-3 h-2 sm:h-2.5 md:h-3 bg-white/40 hover:bg-white/60'
                  } rounded-full`}
                />
              ))}
            </div>
          </>
        )}
          </div>
        </div>
        
        {/* Spacer for scroll */}
        <div style={{ height: '100vh' }}></div>
      </section>

      {/* Content Card with rounded top - slides up over hero */}
      <div className="relative rounded-t-[3rem] bg-[#0b1221] z-10">
      
      {/* Marquee Banner */}
      <div className="bg-brand-green py-4 overflow-hidden transform -rotate-1 shadow-[0_0_50px_rgba(148,193,31,0.4)] relative z-30">
        <div className="flex gap-12 whitespace-nowrap animate-[marquee_20s_linear_infinite]">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 text-brand-dark font-black text-xl uppercase tracking-widest">
              <Zap size={24} className="fill-current" />
              <span>Instant Delivery</span>
              <span className="w-2 h-2 bg-brand-dark rounded-full" />
              <span>Official Warranty</span>
            </div>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <section className="py-32 max-w-7xl mx-auto px-4 relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div ref={productsTitleRef} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 relative z-10">
          <div>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-4 uppercase leading-none">
              Trending <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-yellow">Hardware</span>
            </h2>
          </div>
          <Link to="/shop" className="group flex items-center gap-2 text-white font-bold uppercase tracking-widest border-b border-brand-green pb-1 hover:text-brand-green transition-colors">
            Ver Todo <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart} 
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No hay productos destacados disponibles.</p>
            <Link to="/shop" className="inline-block mt-4 text-brand-green hover:underline">
              Ver todos los productos
            </Link>
          </div>
        )}
      </section>

      {/* Fortnite Special Section */}
      <section className="py-32 relative overflow-hidden">
        <motion.div style={{ y: y2 }} className="absolute inset-0 bg-[url('https://cdn2.unrealengine.com/fortnite-battle-royale-chapter-4-season-1-1920x1080-6e70020d5854.jpg')] bg-cover bg-fixed bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1221] via-[#0b1221]/80 to-transparent" />
        
        <div ref={fortniteSectionRef} className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-block p-1 rounded-full bg-gradient-to-r from-brand-yellow to-brand-orange mb-8">
            <div className="bg-black px-6 py-2 rounded-full">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-brand-orange font-bold uppercase tracking-widest text-sm">
                Live API Integration
              </span>
            </div>
          </div>
          
          <h2 className="text-6xl md:text-9xl font-black text-white mb-8 uppercase italic tracking-tighter">
            Fortnite <br />
            <span className="text-stroke text-transparent">Item Shop</span>
          </h2>
          
          <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto">
            Accede a la rotación diaria en tiempo real. Precios, rarezas y skins exclusivas sincronizadas directamente con los servidores de Epic.
          </p>
          
          <Link 
            to="/fortnite" 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-yellow text-brand-dark hover:scale-110 transition-transform shadow-[0_0_40px_rgba(245,194,89,0.4)]"
          >
            <ArrowRight size={32} />
          </Link>
        </div>
      </section>
      
      </div>
    </div>
  );
};
