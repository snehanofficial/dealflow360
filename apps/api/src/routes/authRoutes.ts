import { Router } from 'express';
import { signup, login, refresh, logout, me } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

export const authRoutes: Router = Router();

authRoutes.post('/signup', signup);
authRoutes.post('/login', login);
authRoutes.post('/refresh', refresh);
authRoutes.post('/logout', logout);
authRoutes.get('/me', authenticate, me);
