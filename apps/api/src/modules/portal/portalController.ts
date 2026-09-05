import { Request, Response, NextFunction } from 'express';
import {
  PortalTokenParamsSchema,
  SubmitCounterOfferSchema,
  CreatePortalTokenSchema,
} from '@dealflow360/contracts';
import { portalService } from './portalService.js';

export async function generatePortalToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { quotationId, expiresInHours } = CreatePortalTokenSchema.parse(req.body);

    const token = await portalService.generatePortalToken(quotationId, expiresInHours);

    res.status(201).json({
      success: true,
      data: { token, portalUrl: `/portal/quotes/${token}` },
      message: 'Customer portal access token generated successfully',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPortalQuote(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { token } = PortalTokenParamsSchema.parse(req.params);

    const quote = await portalService.getQuoteByPortalToken(token);

    res.json({
      success: true,
      data: quote,
      message: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function submitCounterOffer(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { token } = PortalTokenParamsSchema.parse(req.params);
    const body = SubmitCounterOfferSchema.parse(req.body);

    const result = await portalService.submitCounterOffer(token, body);

    res.status(200).json({
      success: true,
      data: result.quote,
      message: result.message,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}
