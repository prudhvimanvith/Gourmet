import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

import apiRoutes from './routes/api.routes';
import authRoutes from './routes/auth.routes';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mount API Routes
app.use('/api/v1', apiRoutes);
app.use('/api/v1', authRoutes);

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Recipe Management System API is running' });
});

import { query, getCleanDbUrl } from './config/db';

app.get('/api/health', async (req, res) => {
    try {
        await query('SELECT NOW()');
        res.json({
            status: 'ok',
            timestamp: new Date(),
            services: {
                database: 'connected',
                environment: process.env.NODE_ENV,
                debug: {
                    has_db_url: !!process.env.DATABASE_URL,
                    db_url_start: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + '...' : 'undefined',
                    cleaned_db_url_start: getCleanDbUrl(process.env.DATABASE_URL)?.substring(0, 15) + '...'
                }
            }
        });
    } catch (error: any) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'error',
            timestamp: new Date(),
            services: {
                database: 'disconnected',
                error: error.message,
                debug: {
                    has_db_url: !!process.env.DATABASE_URL,
                    db_url_start: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'undefined',
                    cleaned_db_url_start: getCleanDbUrl(process.env.DATABASE_URL)?.substring(0, 20) + '...',
                    error_code: error.code,
                    syscall: error.syscall,
                    hostname: error.hostname
                }
            }
        });
    }
});

// Start Server (Only if not running on Vercel)
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });
}

export default app;
