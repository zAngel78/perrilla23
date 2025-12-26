import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api.service';

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  rateToUSD: number;
  isDefault: boolean;
  active: boolean;
}

interface CurrencyContextType {
  currentCurrency: Currency | null;
  availableCurrencies: Currency[];
  changeCurrency: (currencyCode: string) => void;
  convertPrice: (priceInCLP: number) => number;
  formatPrice: (price: number) => string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState<Currency | null>(null);
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar monedas disponibles al iniciar
  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      setLoading(true);
      
      // Cargar todas las monedas activas
      const response = await apiService.get<{ success: boolean; data: Currency[] }>(
        '/api/currencies',
        { skipAuth: true }
      );
      
      const currencies = response.data;
      setAvailableCurrencies(currencies);
      
      // Verificar si hay una moneda guardada en localStorage
      const savedCurrencyCode = localStorage.getItem('selectedCurrency');
      
      if (savedCurrencyCode) {
        const savedCurrency = currencies.find(c => c.code === savedCurrencyCode);
        if (savedCurrency) {
          setCurrentCurrency(savedCurrency);
        } else {
          // Si no existe, usar la por defecto
          const defaultCurrency = currencies.find(c => c.isDefault) || currencies[0];
          setCurrentCurrency(defaultCurrency);
        }
      } else {
        // Usar moneda por defecto
        const defaultCurrency = currencies.find(c => c.isDefault) || currencies[0];
        setCurrentCurrency(defaultCurrency);
      }
    } catch (error) {
      console.error('Error loading currencies:', error);
      
      // Fallback: usar CLP por defecto
      const fallbackCurrency: Currency = {
        id: 'curr-clp',
        code: 'CLP',
        name: 'Peso Chileno',
        symbol: '$',
        rateToUSD: 900,
        isDefault: true,
        active: true
      };
      
      setCurrentCurrency(fallbackCurrency);
      setAvailableCurrencies([fallbackCurrency]);
    } finally {
      setLoading(false);
    }
  };

  const changeCurrency = (currencyCode: string) => {
    const currency = availableCurrencies.find(c => c.code === currencyCode);
    if (currency) {
      setCurrentCurrency(currency);
      localStorage.setItem('selectedCurrency', currencyCode);
    }
  };

  /**
   * Convierte un precio de CLP (moneda base en BD) a la moneda seleccionada
   */
  const convertPrice = (priceInCLP: number): number => {
    if (!currentCurrency) return priceInCLP; // Ya está en CLP

    // Los precios en BD están en CLP
    // Si es CLP, devolver directo
    if (currentCurrency.code === 'CLP') {
      return priceInCLP;
    }

    // Obtener la tasa de CLP desde availableCurrencies
    const clpCurrency = availableCurrencies.find(c => c.code === 'CLP');
    const clpRateToUSD = clpCurrency?.rateToUSD || 900; // Fallback a 900 si no se encuentra

    // Convertir CLP a la moneda seleccionada
    // 1. Convertir CLP a USD usando la tasa dinámica
    const priceInUSD = priceInCLP / clpRateToUSD;

    // 2. Convertir USD a la moneda destino
    const convertedPrice = priceInUSD * currentCurrency.rateToUSD;

    return convertedPrice;
  };

  /**
   * Formatea un precio en la moneda actual
   * @param priceInCLP - Precio en CLP (como está en la BD)
   */
  const formatPrice = (priceInCLP: number): string => {
    if (!currentCurrency) return `${priceInCLP.toLocaleString('es-CL')} CLP`;
    
    // Convertir el precio de CLP a la moneda actual
    const convertedPrice = convertPrice(priceInCLP);
    
    // Formatear según la moneda
    const formatted = convertedPrice.toLocaleString('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: currentCurrency.code === 'CLP' ? 0 : 2
    });
    
    return `${formatted} ${currentCurrency.code}`;
  };

  const value: CurrencyContextType = {
    currentCurrency,
    availableCurrencies,
    changeCurrency,
    convertPrice,
    formatPrice,
    loading
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
