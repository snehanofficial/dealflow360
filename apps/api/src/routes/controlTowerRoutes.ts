import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { Permissions } from '@dealflow360/contracts';
import { controlTowerController } from '../modules/control-tower/controlTowerController.js';

export const controlTowerRoutes: Router = Router();

controlTowerRoutes.use(authenticate);

controlTowerRoutes.get('/', requirePermission(Permissions.CONTROL_TOWER_VIEW), (req, res, next) => controlTowerController.getDashboard(req, res, next));
controlTowerRoutes.post('/alerts/:id/resolve', requirePermission(Permissions.CONTROL_TOWER_VIEW), (req, res, next) => controlTowerController.resolveAlert(req, res, next));

