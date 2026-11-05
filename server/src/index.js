import './env.js'; // HARUS import pertama — muat .env sebelum middleware/routes
import express from 'express';
import cors from 'cors';
import path from 'path';
import {fileURLToPath} from 'url';

import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import productsRoutes from './routes/products.js';
import storeRoutes from './routes/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fail fast — jangan jalan di publik tanpa secret
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET wajib diset di server/.env');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.set('trust proxy', 1);

//Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

//CORS — di publik hanya origin frontend yang diizinkan
const allowedOrigins = (process.env.CLIENT_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

//Serve static uploadedfiles
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

//API Routes
app.use('/api/auth',authRoutes);
app.use('/api/categories',categoryRoutes);
app.use('/api/products',productsRoutes);
app.use('/api/store',storeRoutes);

//Health check endpoint
app.get('/api/health', (req,res) => {
    res.json({
        status: "ok",
        app: "Katalog Laju",
        timeStamp: new Date().toISOString()
    });
});

//Root Route
app.get('/',(req,res) => {
    res.json({
        message: 'Welcome to KatalogWA API Server',
        endpoints: {
            auth: '/api/auth/login',
            categories: '/api/categories',
            products: '/api/products',
            store: '/api/store',
            health: '/api/health'
        }
    });
});

//Start server — hanya localhost (nginx yang diekspos ke publik)
app.listen(PORT, '127.0.0.1', () => {
    console.log(`KatalogWA API Server running on http://127.0.0.1:${PORT}`);
});
