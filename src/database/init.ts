import fs from 'fs';
import path from 'path';
import pool from '../config/db';

const initDb = async () => {
    const client = await pool.connect();
    try {
        console.log('Initializing database schema...');

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await client.query('BEGIN');
        await client.query(schemaSql);
        await client.query('COMMIT');

        console.log('Database schema initialized successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error initializing database:', error);
        process.exit(1);
    } finally {
        client.release();
        pool.end(); // Close pool after initialization script
    }
};

initDb();
