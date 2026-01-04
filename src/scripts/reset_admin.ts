
import { query } from '../config/db';
import bcrypt from 'bcryptjs';

const resetAdmin = async () => {
    try {
        const newPassword = process.argv[2] || 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        // Update the user with username 'admin'
        // OR if you want to be more generic, find the first ADMIN role user
        const result = await query(
            "UPDATE users SET password_hash = $1 WHERE role = 'ADMIN' RETURNING username",
            [hash]
        );

        if (result.rowCount && result.rowCount > 0) {
            console.log(`✅ Success! Password for admin(s) [${result.rows.map(r => r.username).join(', ')}] has been reset to: '${newPassword}'`);
        } else {
            console.log("❌ No Admin user found to reset.");
        }
    } catch (error) {
        console.error('Error resetting admin password:', error);
    } finally {
        process.exit();
    }
};

resetAdmin();
