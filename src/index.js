import express from 'express';
import cors from 'cors';
import path from 'path';
import {fileURLToPath} from 'url';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import CategoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import storeRoutes from './routes/store.js';
import { timeStamp } from 'console';

dotenv.config();

const__filename = fileURLToPath(import.meta.url);
const__dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(cors({
    origin: '*',
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

//Serve static uploadedfiles
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

//API Routes
app.use('./api/auth',authRoutes);
app.use('./api/categories',categoryRoutes);
app.use('./api/products',productsRoutes);
app.use('./api/store',storeRoutesRoutes);

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

//Start server
app.listen(PORT,() => {
    console.log(`KatalogWA API Server running on http://localhost${PORTS}`);
});
