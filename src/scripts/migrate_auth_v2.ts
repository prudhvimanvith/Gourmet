
import { query } from '../config/db';

const migrate = async () => {
    try {
        console.log('Starting migration: Auth V2 (Email Recovery)...');

        // Add email column
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
            ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
            ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
        `);

        // Update existing users with default emails
        await query(`UPDATE users SET email = 'admin@gourmet.com' WHERE username = 'admin' AND email IS NULL`);
        await query(`UPDATE users SET email = 'chef@gourmet.com' WHERE username = 'chef' AND email IS NULL`);
        await query(`UPDATE users SET email = 'cashier@gourmet.com' WHERE username = 'cashier' AND email IS NULL`);

        console.log('✅ Migration successful! Added email and reset_token columns.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        process.exit();
    }
};

migrate();
