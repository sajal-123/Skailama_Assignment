import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import profileRoutes from './routes/profileRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { corsOrigin, env, isProd, isTest } from './config/env.js';

export function createApp(): Application {
  const app = express();

  // Behind a proxy/load balancer, trust X-Forwarded-* so rate limiting keys on the real client IP.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: '100kb' }));

  if (!isTest) {
    app.use(morgan(isProd ? 'combined' : 'dev'));
  }

  app.use(
    '/api',
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Health check reflects DB connectivity so orchestrators can gate traffic.
  app.get('/api/health', (_req, res) => {
    const dbUp = mongoose.connection.readyState === 1;
    res.status(dbUp ? 200 : 503).json({ status: dbUp ? 'ok' : 'degraded', db: dbUp ? 'up' : 'down' });
  });

  app.use('/api/profiles', profileRoutes);
  app.use('/api/events', eventRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
