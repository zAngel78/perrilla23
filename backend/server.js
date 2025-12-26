import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'fnapicom';
const { Client: FortniteClient } = pkg;

// Importar rutas
import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/upload.js';
import ordersRouter from './routes/orders.js';
import usersRouter from './routes/users.js';
import couponsRouter from './routes/coupons.js';
import settingsRouter from './routes/settings.js';
import heroSlidesRouter from './routes/hero-slides.js';
import currenciesRouter from './routes/currencies.js';
import paymentsRouter from './routes/payments.js';
import webhooksRouter from './routes/webhooks.js';

// Importar middlewares
import { authenticate, isAdmin } from './middleware/auth.js';

// Importar path para archivos estáticos
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Fortnite API Configuration
const FORTNITE_API_KEY = process.env.FORTNITE_API_KEY || 'cc11a503-e92f-4a69-afe4-b88d37da98ff';

// Initialize Fortnite API Client
const fortniteClient = new FortniteClient({
  apiKey: FORTNITE_API_KEY,
  language: 'es' // Spanish language
});

// Middleware
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'TioCalcifer Backend Server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      fortnite: '/api/fortnite/shop',
      products: '/api/products',
      auth: '/api/auth/login, /api/auth/register',
      upload: '/api/upload (admin only)',
      orders: '/api/orders (admin only)',
      users: '/api/users (admin only)',
      coupons: '/api/coupons/validate (public), /api/coupons (admin)',
      staticFiles: '/uploads'
    }
  });
});

// Rutas de autenticación (públicas)
app.use('/api/auth', authRouter);

// Rutas de productos (públicas para GET, protegidas para modificaciones)
app.use('/api/products', productsRouter);

// Rutas de upload (protegidas - solo admin)
app.use('/api/upload', uploadRouter);

// Rutas de órdenes (usuarios autenticados pueden crear, admin puede gestionar)
app.use('/api/orders', ordersRouter);

// Rutas de usuarios (protegidas - solo admin)
app.use('/api/users', authenticate, isAdmin, usersRouter);

// Rutas de cupones
// Validar cupón es público, gestión es solo admin
app.use('/api/coupons', couponsRouter);

// Rutas de configuración
// GET es público (para obtener tasa de conversión), PUT es solo admin
app.use('/api/settings', settingsRouter);

// Rutas de hero slides
// GET es público (slides activos), resto solo admin
app.use('/api/hero-slides', heroSlidesRouter);

// Rutas de monedas
// GET es público (monedas activas), CRUD solo admin
app.use('/api/currencies', currenciesRouter);

// Rutas de pagos (MercadoPago)
app.use('/api/payments', paymentsRouter);
app.use('/api/payments', webhooksRouter);

// Fortnite shop endpoint
app.get('/api/fortnite/shop', async (req, res) => {
  try {
    console.log('📡 Fetching Fortnite shop data from fortnite-api.com...');
    
    const response = await fortniteClient.shop();

    console.log('Shop data fetched - Total entries:', response.data.entries?.length || 0);
    
    // Log bundle info
    if (response.data.entries && response.data.entries.length > 0) {
      const bundleEntries = response.data.entries.filter(e => e.bundle || e.devName?.includes('Bundle') || (e.brItems && e.brItems.length > 1));
      console.log('Potential bundles found:', bundleEntries.length);
      
      if (bundleEntries.length > 0) {
        console.log('First bundle example:', JSON.stringify({
          devName: bundleEntries[0].devName,
          hasBundle: !!bundleEntries[0].bundle,
          brItemsCount: bundleEntries[0].brItems?.length || 0,
          layoutName: bundleEntries[0].layout?.name
        }, null, 2));
      }
    }
    
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Error fetching Fortnite shop:', error.message);
    
    res.status(error.status || 500).json({
      error: 'Failed to fetch Fortnite shop',
      details: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🔥 ================================ 🔥');
  console.log('   TioCalcifer Fortnite API Proxy');
  console.log('🔥 ================================ 🔥');
  console.log('');
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`📡 Shop endpoint: http://localhost:${PORT}/api/fortnite/shop`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 API Key: ${FORTNITE_API_KEY.substring(0, 10)}...`);
  console.log('');
  console.log('✨ Ready to serve Fortnite shop data!');
  console.log('');
});
