
import { Request, Response } from 'express';
import { query } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';

export class AuthController {

    // POST /api/v1/auth/register
    async register(req: Request, res: Response) {
        try {
            const { username, password, role, full_name, email } = req.body;

            if (!username || !password || !email) {
                res.status(400).json({ error: 'Username, password, and email are required' });
                return;
            }

            // Check if user exists (username or email)
            const existing = await query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
            if (existing.rows.length > 0) {
                res.status(400).json({ error: 'Username or Email already taken' });
                return;
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            const userId = randomUUID();
            await query(
                'INSERT INTO users (id, username, password_hash, role, full_name, email) VALUES ($1, $2, $3, $4, $5, $6)',
                [userId, username, hash, role || 'CASHIER', full_name || '', email]
            );

            res.status(201).json({ message: 'User registered successfully', userId });
        } catch (error: any) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // POST /api/v1/auth/login
    async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;

            const result = await query('SELECT * FROM users WHERE username = $1', [username]);
            const user = result.rows[0];

            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            // Generate JWT
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: '12h' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    full_name: user.full_name
                }
            });
        } catch (error: any) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // POST /api/v1/auth/reset-password
    async resetPassword(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { currentPassword, newPassword } = req.body;

            if (!newPassword || newPassword.length < 6) {
                res.status(400).json({ error: 'New password must be at least 6 characters' });
                return;
            }

            const result = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
            const user = result.rows[0];

            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            if (currentPassword) {
                const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
                if (!isMatch) {
                    res.status(401).json({ error: 'Invalid current password' });
                    return;
                }
            }

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);

            await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);

            res.json({ message: 'Password updated successfully' });
        } catch (error: any) {
            console.error('Password reset error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // GET /api/v1/auth/users
    async getUsers(req: Request, res: Response) {
        try {
            const result = await query('SELECT id, username, role, full_name, email, created_at FROM users ORDER BY created_at DESC');
            res.json(result.rows);
        } catch (error: any) {
            console.error('Get users error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // POST /api/v1/auth/admin/reset-password
    async adminResetPassword(req: Request, res: Response) {
        try {
            const { targetUserId, newPassword } = req.body;

            if (!targetUserId || !newPassword || newPassword.length < 6) {
                res.status(400).json({ error: 'Target User ID and valid new password are required' });
                return;
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);

            await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, targetUserId]);

            res.json({ message: 'User password reset successfully' });
        } catch (error: any) {
            console.error('Admin password reset error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // POST /api/v1/auth/forgot-password
    async requestPasswordReset(req: Request, res: Response) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ error: 'Email is required' });
                return;
            }

            const result = await query('SELECT id, username FROM users WHERE email = $1', [email]);
            const user = result.rows[0];

            if (user) {
                // Generate secure token
                const token = randomUUID(); // In prod, use crypto.randomBytes(32).toString('hex')
                const expiry = new Date(Date.now() + 3600000); // 1 hour from now

                await query(
                    'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
                    [token, expiry, user.id]
                );

                // MOCK EMAIL SERVICE
                console.log(`
                =========================================================
                [MOCK EMAIL SERVICE] Password Reset Requested
                To: ${email}
                User: ${user.username}
                Link: http://localhost:5173/reset-password?token=${token}
                =========================================================
                `);
            }

            // Always return success to prevent email enumeration
            res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
        } catch (error: any) {
            console.error('Forgot password error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // POST /api/v1/auth/reset-password-confirm
    async performPasswordReset(req: Request, res: Response) {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword || newPassword.length < 6) {
                res.status(400).json({ error: 'Invalid token or password too short' });
                return;
            }

            const result = await query(
                'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
                [token]
            );
            const user = result.rows[0];

            if (!user) {
                res.status(400).json({ error: 'Invalid or expired reset token' });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);

            await query(
                'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
                [hash, user.id]
            );

            res.json({ message: 'Password reset successfully. You can now login.' });
        } catch (error: any) {
            console.error('Reset password confirm error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export const authController = new AuthController();
