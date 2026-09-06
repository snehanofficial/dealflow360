import { Request, Response } from 'express';
import { z } from 'zod';
import { ConfigService } from './configService.js';
import { JwtPayload } from '../../auth/token.js';

const configService = new ConfigService();

const configSchema = z.object({
  discountThreshold: z.number().min(0).max(100),
  marginMinimum: z.number().min(0).max(100),
  marginWarning: z.number().min(0).max(100),
  stalledDaysThreshold: z.number().min(1),
  minMarginThreshold: z.number().min(0).max(100),
});

export const getConfig = async (req: Request, res: Response) => {
  try {
    const config = await configService.getBusinessThresholds();
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch config' },
    });
  }
};

export const updateConfig = async (req: Request, res: Response) => {
  try {
    const validated = configSchema.parse(req.body);
    const actor = (req as any).user as JwtPayload;
    const config = await configService.updateBusinessThresholds(validated, actor);
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { message: error.message || 'Failed to update config' },
    });
  }
};
