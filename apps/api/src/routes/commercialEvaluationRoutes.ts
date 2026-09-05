import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { Permissions } from '@dealflow360/contracts';
import { evaluateCommercialScenarioHandler } from '../controllers/discountPolicyController.js';

const router: Router = Router();

router.use(authenticate);

router.post('/evaluate', requirePermission(Permissions.DISCOUNT_EVALUATE), evaluateCommercialScenarioHandler);

export default router;
