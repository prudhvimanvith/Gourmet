import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Production config with DATABASE_URL
// Helper to clean the connection string if user pasted the 'psql' command
export const getCleanDbUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    let clean = url.trim();
    // Remove "psql " key/command if present
    clean = clean.replace(/^psql\s+/, '');
    // Remove surrounding quotes and any whitespace outside them
    clean = clean.replace(/^['"]|['"]$/g, '').trim();
    return clean;
};

const dbUrl = getCleanDbUrl(process.env.DATABASE_URL);

const pool = dbUrl
    ? new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    })
    : new Pool({
        user: process.env.POSTGRES_USER || 'admin',
        host: process.env.POSTGRES_HOST || 'localhost',
        database: process.env.POSTGRES_DB || 'recipe_db',
        password: process.env.POSTGRES_PASSWORD || 'password123',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
    });

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export const getClient = () => pool.connect();
export default pool;
