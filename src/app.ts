/**
 * ============================================================================
 * APP MODULE
 * ============================================================================
 * Main application setup with middleware, routes, and error handling
 */

import express, { Application } from 'express';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import routes from './routes';

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // ============================================================================
  // MIDDLEWARE SETUP
  // ============================================================================

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // ============================================================================
  // API ROUTES
  // ============================================================================

  app.use('/api', routes);

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  // 404 handler for undefined routes
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
