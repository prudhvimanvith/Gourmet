
import pool from '../config/db';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

async function seed() {
    const client = await pool.connect();
    try {
        console.log('Seeding Users...');

        const users = [
            { username: 'admin', password: 'admin123', role: 'ADMIN', full_name: 'System Admin' },
            { username: 'chef', password: 'chef123', role: 'CHEF', full_name: 'Head Chef' },
            { username: 'cashier', password: 'cashier123', role: 'CASHIER', full_name: 'Front Desk' }
        ];

        for (const u of users) {
            const existing = await client.query('SELECT id FROM users WHERE username = $1', [u.username]);
            if (existing.rows.length === 0) {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(u.password, salt);
                await client.query(
                    'INSERT INTO users (id, username, password_hash, role, full_name) VALUES ($1, $2, $3, $4, $5)',
                    [randomUUID(), u.username, hash, u.role, u.full_name]
                );
                console.log(`Created user: ${u.username}`);
            } else {
                console.log(`User ${u.username} already exists.`);
            }
        }

        console.log('Seeding complete.');
    } catch (err: any) {
        console.error('Seeding failed:', err.message);
    } finally {
        client.release();
        process.exit();
    }
}

seed();
