import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { getConfig, updateConfig } from './configController.js';

const router = Router();

// Everyone authenticated can view config (used by frontend for some logic)
router.get('/', authenticate, getConfig);

// Only ADMIN can update config
router.put('/', authenticate, requireRole(['ADMIN']), updateConfig);

export const configRoutes: Router = router;
