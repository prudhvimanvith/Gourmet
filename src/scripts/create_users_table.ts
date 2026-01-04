
import pool from '../config/db';

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration: Create Users Table...');

        await client.query("DO $$ BEGIN CREATE TYPE user_role AS ENUM ('ADMIN', 'CHEF', 'CASHIER'); EXCEPTION WHEN duplicate_object THEN null; END $$;");

        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role user_role NOT NULL DEFAULT 'CASHIER',
                full_name VARCHAR(100),
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('Migration successful: Users table created.');
    } catch (err: any) {
        console.error('Migration failed:', err.message);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
