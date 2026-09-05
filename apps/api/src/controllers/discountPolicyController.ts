import { Request, Response, NextFunction } from 'express';
import {
  CreateDiscountPolicyRuleSchema,
  UpdateDiscountPolicyRuleSchema,
  EvaluateCommercialScenarioSchema,
} from '@dealflow360/contracts';
import {
  getDiscountPolicies,
  getDiscountPolicyById,
  createDiscountPolicy,
  updateDiscountPolicy,
  toggleDiscountPolicyStatus,
  deleteDiscountPolicy,
} from '../services/discountPolicyService.js';
import { evaluateCommercialScenario } from '../services/commercialEvaluationService.js';
import { CustomerTier } from '@dealflow360/db';

export async function getDiscountPoliciesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const customerTier = typeof req.query.customerTier === 'string' ? (req.query.customerTier as CustomerTier) : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;

    const policies = await getDiscountPolicies({ customerTier, category, isActive, search });

    res.json({
      success: true,
      data: policies,
      message: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDiscountPolicyByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const policy = await getDiscountPolicyById(id);
    res.json({
      success: true,
      data: policy,
      message: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function createDiscountPolicyHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validated = CreateDiscountPolicyRuleSchema.parse(req.body);
    const created = await createDiscountPolicy(validated);
    res.status(201).json({
      success: true,
      data: created,
      message: 'Discount policy rule created successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDiscountPolicyHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const validated = UpdateDiscountPolicyRuleSchema.parse(req.body);
    const updated = await updateDiscountPolicy(id, validated);
    res.json({
      success: true,
      data: updated,
      message: 'Discount policy rule updated successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleDiscountPolicyStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const isActive = req.body.isActive === true;
    const updated = await toggleDiscountPolicyStatus(id, isActive);
    res.json({
      success: true,
      data: updated,
      message: `Discount policy rule ${isActive ? 'activated' : 'deactivated'} successfully.`,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteDiscountPolicyHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await deleteDiscountPolicy(id);
    res.json({
      success: true,
      data: null,
      message: 'Discount policy rule deleted successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function evaluateCommercialScenarioHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validated = EvaluateCommercialScenarioSchema.parse(req.body);
    const evaluation = await evaluateCommercialScenario(validated);
    res.json({
      success: true,
      data: evaluation,
      message: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}
