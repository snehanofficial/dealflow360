import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { authRoutes } from './routes/authRoutes.js';
import { customerRoutes } from './routes/customerRoutes.js';
import { quoteRoutes } from './routes/quoteRoutes.js';
import { portalRoutes } from './routes/portalRoutes.js';
import { fulfillmentRoutes } from './routes/fulfillmentRoutes.js';
import { billingRoutes } from './routes/billingRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';

export const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health Endpoint
app.get('/api/v1/health', (_req, res) => {
  res.json({
    success: true,
    data: { status: 'ok', service: 'dealflow360-api', timestamp: new Date().toISOString() },
    message: null,
    meta: null,
  });
});

// Auth & Business Module Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/quotes', quoteRoutes);
app.use('/api/v1/quotations', quoteRoutes);
app.use('/api/v1/portal', portalRoutes);
app.use('/api/v1/fulfillment', fulfillmentRoutes);
app.use('/api/v1/quotes', fulfillmentRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/quotes', billingRoutes);

// Centralized Error Handler
app.use(errorHandler);

const PORT = env.PORT;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`DealFlow360 API server running on port ${PORT}`);
  });
}
