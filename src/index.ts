import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

import apiRoutes from './routes/api.routes';

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

// Start Server
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
