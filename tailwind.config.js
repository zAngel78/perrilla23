/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#172634',   // Azul obscuro (Fondo principal)
          green: '#94c11f',  // Verde (Acciones positivas, precios)
          orange: '#ed764e', // Naranjo (Botones primarios, alertas)
          yellow: '#f5c259', // Amarillo (Estrellas, destacados)
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
