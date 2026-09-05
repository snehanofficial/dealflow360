import { Router } from 'express';

export const apiRouter: Router = Router();

apiRouter.get('/', (_req, res) => {
  res.json({ message: 'DealFlow360 API v1 router placeholder' });
});
