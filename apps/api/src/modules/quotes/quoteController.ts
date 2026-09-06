import { Request, Response, NextFunction } from 'express';
import {
  QuoteIdParamSchema,
  QuoteLineParamsSchema,
  CreateQuoteSchema,
  UpdateQuoteLineSchema,
  ListQuotesQuerySchema,
  AddQuoteLineSchema,
} from '@dealflow360/contracts';
import { quoteService } from './quoteService.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function createQuotation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId || (req as any).user?.id || 'system-user';
    const body = CreateQuoteSchema.parse(req.body);

    const actor = req.user ? { id: req.user.userId, name: req.user.email, role: req.user.role } : null;

    const quotation = await quoteService.createQuotation(userId, body, actor);

    res.status(201).json({
      success: true,
      data: quotation,
      message: 'Quotation created successfully',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function listQuotations(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = ListQuotesQuerySchema.parse(req.query);

    if (req.user?.role === 'CUSTOMER') {
      if (!req.user.customerId) {
        throw new AppError('FORBIDDEN', 'User account is not bound to a valid customer account.', 403);
      }
      query.customerId = req.user.customerId;
    }

    const result = await quoteService.listQuotations(query, req.user?.role === 'CUSTOMER');

    res.json({
      success: true,
      data: result.data,
      message: null,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

export async function getQuotation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = QuoteIdParamSchema.parse(req.params);

    if (req.user?.role === 'CUSTOMER' && !req.user.customerId) {
      throw new AppError('FORBIDDEN', 'User account is not bound to a valid customer account.', 403);
    }

    const quotation = await quoteService.getQuotationById(id, {
      role: req.user?.role,
      customerId: req.user?.customerId,
    });

    if (!quotation) {
      res.status(404).json({
        success: false,
        data: null,
        message: `Quotation with ID ${id} not found`,
        meta: null,
      });
      return;
    }

    res.json({
      success: true,
      data: quotation,
      message: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function addQuoteLine(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = QuoteIdParamSchema.parse(req.params);
    const body = AddQuoteLineSchema.parse(req.body);

    const actor = req.user ? { id: req.user.userId, name: req.user.email, role: req.user.role } : null;
    const updatedQuotation = await quoteService.addQuoteLine(id, body, actor);

    res.status(201).json({
      success: true,
      data: updatedQuotation,
      message: 'Line added successfully',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateQuoteLine(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id, lineId } = QuoteLineParamsSchema.parse(req.params);
    const body = UpdateQuoteLineSchema.parse(req.body);

    const actor = req.user ? { id: req.user.userId, name: req.user.email, role: req.user.role } : null;
    const updatedQuotation = await quoteService.updateQuoteLine(id, lineId, body, actor);

    res.json({
      success: true,
      data: updatedQuotation,
      message: 'Line updated successfully',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteQuoteLine(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id, lineId } = QuoteLineParamsSchema.parse(req.params);

    const actor = req.user ? { id: req.user.userId, name: req.user.email, role: req.user.role } : null;
    const updatedQuotation = await quoteService.deleteQuoteLine(id, lineId, actor);

    res.json({
      success: true,
      data: updatedQuotation,
      message: 'Line deleted successfully',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function submitQuotation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = QuoteIdParamSchema.parse(req.params);

    const actor = req.user ? { id: req.user.userId, name: req.user.email, role: req.user.role } : null;
    const result = await quoteService.submitQuotation(id, actor);

    res.json({
      success: true,
      data: result.quotation,
      message: result.transitionMessage,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}
