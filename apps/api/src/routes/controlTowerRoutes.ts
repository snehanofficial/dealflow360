import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { controlTowerController } from '../modules/control-tower/controlTowerController.js';

export const controlTowerRoutes: Router = Router();

controlTowerRoutes.use(authenticate);

controlTowerRoutes.get('/', (req, res, next) => controlTowerController.getDashboard(req, res, next));
controlTowerRoutes.post('/alerts/:id/resolve', (req, res, next) => controlTowerController.resolveAlert(req, res, next));
