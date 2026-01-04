
import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { authController } from '../controllers/auth.controller';

const router = Router();

// Protect Register: Only Admin can create users
router.post('/auth/register', authenticate, requireRole(['ADMIN']), (req, res) => authController.register(req, res));
router.post('/auth/login', (req, res) => authController.login(req, res));
router.post('/auth/reset-password', authenticate, (req, res) => authController.resetPassword(req, res));
router.post('/auth/admin/reset-password', authenticate, requireRole(['ADMIN']), (req, res) => authController.adminResetPassword(req, res));
router.get('/auth/users', authenticate, requireRole(['ADMIN']), (req, res) => authController.getUsers(req, res));

// Public Recovery Routes
router.post('/auth/forgot-password', (req, res) => authController.requestPasswordReset(req, res));
router.post('/auth/reset-password-confirm', (req, res) => authController.performPasswordReset(req, res));

export default router;
