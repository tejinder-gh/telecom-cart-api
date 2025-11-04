/**
 * ============================================================================
 * VALIDATION MIDDLEWARE
 * ============================================================================
 * Zod-based validation for request body, params, and query
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import config from '../config';

/**
 * Validate request body
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
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
      next(error);
    }
  };
}

/**
 * Validate request params
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const problemDetail = {
          title: 'Validation Error',
          status: 400,
          detail: 'Invalid path parameters',
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
      next(error);
    }
  };
}

/**
 * Validate request query
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const problemDetail = {
          title: 'Validation Error',
          status: 400,
          detail: 'Invalid query parameters',
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
      next(error);
    }
  };
}

/**
 * Async error wrapper for controller handlers
 */
export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
