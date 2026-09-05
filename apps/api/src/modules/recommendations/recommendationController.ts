import { Request, Response, NextFunction } from 'express';
import { GetRecommendationsParamsSchema } from '@dealflow360/contracts';
import { recommendationService } from './recommendationService.js';

export async function getRecommendations(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { quotationId } = GetRecommendationsParamsSchema.parse(req.params);

    const recommendations =
      await recommendationService.getRecommendationsForQuotation(quotationId);

    res.json({
      success: true,
      data: recommendations,
      message: null,
      meta: {
        count: recommendations.length,
      },
    });
  } catch (error) {
    next(error);
  }
}
