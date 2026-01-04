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

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        services: {
            database: 'disconnected', // placeholder
            redis: 'disconnected'     // placeholder
        }
    });
});

// Start Server (Only if not running on Vercel)
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });
}

export default app;
