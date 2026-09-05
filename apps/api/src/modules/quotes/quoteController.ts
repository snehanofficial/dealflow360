import { Request, Response, NextFunction } from 'express';
import { QuoteIdParamSchema, AddQuoteLineSchema } from '@dealflow360/contracts';
import { quoteService } from './quoteService.js';

export async function getQuotation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = QuoteIdParamSchema.parse(req.params);

    const quotation = await quoteService.getQuotationById(id);

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

    const updatedQuotation = await quoteService.addQuoteLine(id, body);

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
