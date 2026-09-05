import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { Permissions } from '@dealflow360/contracts';
import {
  getDiscountPoliciesHandler,
  getDiscountPolicyByIdHandler,
  createDiscountPolicyHandler,
  updateDiscountPolicyHandler,
  toggleDiscountPolicyStatusHandler,
  deleteDiscountPolicyHandler,
  evaluateCommercialScenarioHandler,
} from '../controllers/discountPolicyController.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', requirePermission(Permissions.DISCOUNT_VIEW), getDiscountPoliciesHandler);
router.post('/evaluate', requirePermission(Permissions.DISCOUNT_EVALUATE), evaluateCommercialScenarioHandler);
router.get('/:id', requirePermission(Permissions.DISCOUNT_VIEW), getDiscountPolicyByIdHandler);
router.post('/', requirePermission(Permissions.DISCOUNT_CONFIGURE), createDiscountPolicyHandler);
router.patch('/:id', requirePermission(Permissions.DISCOUNT_CONFIGURE), updateDiscountPolicyHandler);
router.patch('/:id/status', requirePermission(Permissions.DISCOUNT_CONFIGURE), toggleDiscountPolicyStatusHandler);
router.delete('/:id', requirePermission(Permissions.DISCOUNT_CONFIGURE), deleteDiscountPolicyHandler);

export default router;
