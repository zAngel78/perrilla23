import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un precio - NOTA: Esta función es un fallback
 * Idealmente usa useCurrency().formatPrice() para conversión dinámica
 */
export const formatPrice = (priceInUSD: number) => {
  // Default: convertir USD a CLP (900 CLP = 1 USD)
  const priceInCLP = priceInUSD * 900;
  
  // Formatear sin decimales para CLP
  const formatted = new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInCLP);
  
  // Agregar "CLP" al final
  return `${formatted} CLP`;
};
