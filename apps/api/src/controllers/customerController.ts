import { Request, Response, NextFunction } from 'express';
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  CustomerFilterQuerySchema,
} from '@dealflow360/contracts';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
} from '../modules/customers/customer.service.js';

export async function createCustomerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validated = CreateCustomerSchema.parse(req.body);
    const customer = await createCustomer(validated);
    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomersHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = CustomerFilterQuerySchema.parse(req.query);
    const result = await getCustomers(query);
    res.json({
      success: true,
      data: result,
      message: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const customer = await getCustomerById(id);
    res.json({
      success: true,
      data: customer,
      message: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCustomerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const validated = UpdateCustomerSchema.parse(req.body);
    const customer = await updateCustomer(id, validated);
    res.json({
      success: true,
      data: customer,
      message: 'Customer updated successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}
