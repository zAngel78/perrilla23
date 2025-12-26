import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Elden Ring',
    price: 49990,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
    category: 'game',
    rating: 5,
    description: 'Un RPG de acción y fantasía oscura creado por Hidetaka Miyazaki.',
    longDescription: 'Levántate, Sinluz, y déjate guiar por la gracia para esgrimir el poder del Anillo de Elden y convertirte en un Señor de Elden en las Tierras Intermedias. Un vasto mundo donde los campos abiertos y las mazmorras inmensas se conectan de forma fluida.',
    features: [
      'Mundo abierto masivo y sin costuras',
      'Personalización profunda de personajes',
      'Multijugador online único',
      'Ciclo día/noche y clima dinámico'
    ],
    specs: {
      'Plataforma': 'PS5 / Xbox / PC',
      'Desarrollador': 'FromSoftware',
      'Género': 'Action RPG',
      'Lanzamiento': '2022'
    },
    stock: 45,
    status: 'Activo'
  },
  {
    id: '2',
    name: 'PS5 DualSense',
    price: 64990,
    image: 'https://images.unsplash.com/photo-1606318801954-d46d46d3360a?auto=format&fit=crop&q=80&w=800',
    category: 'accessory',
    rating: 4.8,
    description: 'Siente la respuesta física a tus acciones en el juego.',
    longDescription: 'Descubre una experiencia de juego más profunda y altamente inmersiva con el innovador mando de PS5, que cuenta con respuesta háptica y efectos de gatillo dinámicos. El mando inalámbrico DualSense también incluye un micrófono integrado y el botón Crear.',
    features: [
      'Respuesta háptica inmersiva',
      'Gatillos adaptativos dinámicos',
      'Micrófono integrado',
      'Diseño ergonómico evolucionado'
    ],
    specs: {
      'Conectividad': 'Bluetooth 5.1',
      'Batería': '1560 mAh',
      'Peso': '280g',
      'Color': 'Blanco / Negro'
    },
    stock: 12,
    status: 'Bajo Stock'
  },
  {
    id: '3',
    name: 'Cyberpunk 2077',
    price: 29990,
    image: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&q=80&w=800',
    category: 'game',
    rating: 4.5,
    description: 'Una historia de acción y aventura de mundo abierto.',
    longDescription: 'Cyberpunk 2077 es una historia de acción y aventura de mundo abierto ambientada en Night City, una megalópolis obsesionada con el poder, el glamur y la modificación corporal. Juegas como V, un mercenario proscrito que busca un implante único que es la clave de la inmortalidad.',
    features: [
      'Ciudad futurista vibrante',
      'Estilo de juego personalizable',
      'Narrativa ramificada',
      'Gráficos Ray-Tracing Next-Gen'
    ],
    specs: {
      'Plataforma': 'Multiplataforma',
      'Desarrollador': 'CD Projekt Red',
      'Género': 'RPG / FPS',
      'Motor': 'REDengine 4'
    },
    stock: 120,
    status: 'Activo'
  },
  {
    id: '4',
    name: 'Xbox Series X',
    price: 499990,
    image: 'https://images.unsplash.com/photo-1621259182902-480c07258436?auto=format&fit=crop&q=80&w=800',
    category: 'console',
    rating: 5,
    description: 'La Xbox más rápida y potente de la historia.',
    longDescription: 'La Xbox Series X ofrece velocidades de cuadro sensacionalmente suaves de hasta 120 FPS con el pop visual de HDR. Sumérgete con personajes más nítidos, mundos más brillantes y detalles imposibles con 4K real.',
    features: [
      'Juegos en 4K real',
      'Hasta 120 FPS',
      '12 Teraflops de potencia',
      'SSD NVMe personalizado de 1TB'
    ],
    specs: {
      'CPU': '8 núcleos a 3.8 GHz',
      'GPU': '12 TFLOPS, 52 CUs',
      'Memoria': '16GB GDDR6',
      'Almacenamiento': '1TB SSD'
    },
    stock: 5,
    status: 'Bajo Stock'
  }
];
