import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-brand-dark border-t border-white/10 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <img 
              src="https://i.postimg.cc/wxRJh3P1/logo-Navideno.png" 
              alt="TioCalcifer" 
              className="h-12 w-auto object-contain"
            />
          </div>
          <p className="text-sm text-gray-400">
            TioCalcifer, tu tienda de confianza para productos de Fortnite.
            Club Fortnite, regalos, suscripciones y entrega rápida a todo LATAM.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Enlaces Rápidos</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-brand-green transition-colors">Inicio</a></li>
            <li><a href="#" className="hover:text-brand-green transition-colors">Catálogo</a></li>
            <li><a href="#" className="hover:text-brand-green transition-colors">Tienda Fortnite</a></li>
            <li><a href="#" className="hover:text-brand-green transition-colors">Soporte</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-brand-green transition-colors">Términos y Condiciones</a></li>
            <li><a href="#" className="hover:text-brand-green transition-colors">Política de Privacidad</a></li>
            <li><a href="#" className="hover:text-brand-green transition-colors">Cookies</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Síguenos</h4>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-brand-orange hover:scale-110 transition-transform"><Facebook size={20} /></a>
            <a href="#" className="hover:text-brand-orange hover:scale-110 transition-transform"><Twitter size={20} /></a>
            <a href="#" className="hover:text-brand-orange hover:scale-110 transition-transform"><Instagram size={20} /></a>
            <a href="#" className="hover:text-brand-orange hover:scale-110 transition-transform"><Youtube size={20} /></a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
        <span>© 2025 TioCalcifer. Todos los derechos reservados.</span>
        <span className="text-xs mt-2 md:mt-0 opacity-50">Designed for Gamers</span>
      </div>
    </footer>
  );
};
