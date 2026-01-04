
import pool from '../config/db';

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration: Alter reference_id to VARCHAR...');

        // Alter column type
        await client.query('ALTER TABLE inventory_transactions ALTER COLUMN reference_id TYPE VARCHAR(255)');

        console.log('Migration successful: reference_id is now VARCHAR(255)');
    } catch (err: any) {
        console.error('Migration failed:', err.message);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
