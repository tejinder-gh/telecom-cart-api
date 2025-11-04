/**
 * ============================================================================
 * ERROR HANDLER MIDDLEWARE
 * ============================================================================
 * Global error handler for the application
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { APIError, ValidationError } from '../errors';
import config from '../config';

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error in development
  if (config.server.env === 'development') {
    console.error('Error:', error);
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    const problemDetail = {
      title: 'Validation Error',
      status: 400,
      detail: 'One or more fields failed validation',
      instance: req.path,
      requestId: req.headers['x-request-id'] as string,
      timestamp: new Date().toISOString(),
      errors:
        config.server.env === 'development'
          ? error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }))
          : undefined,
    };

    res.status(400).json(problemDetail);
    return;
  }

  // Custom API errors
  if (error instanceof APIError) {
    const problemDetail = {
      title: error.message,
      status: error.statusCode,
      detail: error.message,
      instance: req.path,
      requestId: req.headers['x-request-id'] as string,
      timestamp: new Date().toISOString(),
      ...(error instanceof ValidationError && { errors: error.errors }),
    };

    res.status(error.statusCode).json(problemDetail);
    return;
  }

  // Unexpected errors (don't leak internal details in production)
  console.error('Unexpected error:', error);

  const problemDetail = {
    title: 'Internal Server Error',
    status: 500,
    detail:
      config.server.env === 'development'
        ? error.message
        : 'An unexpected error occurred while processing your request',
    instance: req.path,
    requestId: req.headers['x-request-id'] as string,
    timestamp: new Date().toISOString(),
    ...(config.server.env === 'development' && { stack: error.stack }),
  };

  res.status(500).json(problemDetail);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const problemDetail = {
    title: 'Not Found',
    status: 404,
    detail: `The requested endpoint '${req.path}' does not exist`,
    instance: req.path,
    requestId: req.headers['x-request-id'] as string,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(problemDetail);
}
