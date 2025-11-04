/**
 * ============================================================================
 * ERROR HANDLER MIDDLEWARE - UNIT TESTS
 * ============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import {
  errorHandler,
  notFoundHandler,
} from '../../../src/middleware/error-handler';
import {
  ValidationError,
  NotFoundError,
} from '../../../src/errors';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {
        'x-request-id': 'test-request-id',
      },
    };
    Object.defineProperty(mockRequest, 'path', {
      value: '/api/v1/test',
      writable: true,
    });
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('errorHandler', () => {
    it('should handle ValidationError with 400 status', () => {
      const error = new ValidationError([
        { field: 'name', message: 'Name is required', code: 'REQUIRED_FIELD' },
      ]);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
        })
      );
    });

    it('should handle NotFoundError with 404 status', () => {
      const error = new NotFoundError('Cart', 'cart_123');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 404,
        })
      );
    });

    it('should handle generic Error with 500 status', () => {
      const error = new Error('Business rule violation: Only one phone allowed');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 500,
        })
      );
    });

    it('should handle ZodError with 400 status', () => {
      const schema = z.object({
        name: z.string().min(1, 'Name is required'),
      });

      try {
        schema.parse({});
      } catch (error) {
        errorHandler(
          error as Error,
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Validation Error',
            status: 400,
            detail: 'One or more fields failed validation',
          })
        );
      }
    });

  });

  describe('notFoundHandler', () => {
    it('should respond with 404 for undefined routes', () => {
      notFoundHandler(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Not Found',
          status: 404,
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should include request path in error detail', () => {
      Object.defineProperty(mockRequest, 'path', {
        value: '/api/v1/undefined-route',
        writable: true,
      });

      notFoundHandler(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.detail).toContain('/api/v1/undefined-route');
    });
  });
});
