import pool from '../config/db';

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Adding selling_price column to items table...');
        await client.query(`
            ALTER TABLE items 
            ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10, 2) DEFAULT 0;
        `);
        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
