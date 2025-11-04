/**
 * ============================================================================
 * VALIDATION MIDDLEWARE - UNIT TESTS
 * ============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  validateBody,
  validateParams,
  validateQuery,
  asyncHandler,
} from '../../../src/middleware/validation';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
      headers: {
        'x-request-id': 'test-request-id',
      },
      path: '/api/v1/test',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('validateBody', () => {
    const testSchema = z.object({
      name: z.string().min(1),
      age: z.number().int().positive(),
    });

    it('should pass validation with valid body', () => {
      mockRequest.body = { name: 'John', age: 25 };

      const middleware = validateBody(testSchema);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it('should fail validation with invalid body', () => {
      mockRequest.body = { name: '', age: -5 };

      const middleware = validateBody(testSchema);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          title: 'Validation Error',
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail validation with missing fields', () => {
      mockRequest.body = {};

      const middleware = validateBody(testSchema);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          title: 'Validation Error',
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('validateParams', () => {
    const testSchema = z.object({
      id: z.string().min(1),
    });

    it('should pass validation with valid params', () => {
      mockRequest.params = { id: 'cart_123' };

      const middleware = validateParams(testSchema);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it('should fail validation with invalid params', () => {
      mockRequest.params = { id: '' };

      const middleware = validateParams(testSchema);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          title: 'Validation Error',
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('validateQuery', () => {
    const testSchema = z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
    });

    it('should pass validation with valid query', () => {
      mockRequest.query = { page: '1', limit: '10' };

      const middleware = validateQuery(testSchema);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it('should pass validation with empty query', () => {
      mockRequest.query = {};

      const middleware = validateQuery(testSchema);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('asyncHandler', () => {
    it('should call async function successfully', async () => {
      const asyncFn = jest.fn().mockResolvedValue('success');

      const handler = asyncHandler(asyncFn);
      await handler(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(asyncFn).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
        nextFunction
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should catch errors and pass to next', async () => {
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);

      const handler = asyncHandler(asyncFn);
      await handler(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });
});
