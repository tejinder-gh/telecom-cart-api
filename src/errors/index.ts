/**
 * ============================================================================
 * CUSTOM ERROR CLASSES
 * ============================================================================
 * Following the API specification for error handling
 */

import { ErrorDetail } from '../types';

/**
 * Base API Error class
 */
export class APIError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends APIError {
  public readonly errors: ErrorDetail[];

  constructor(errors: ErrorDetail[]) {
    super('Validation Error', 400);
    this.errors = errors;
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends APIError {
  constructor(resource: string, id: string) {
    super(`${resource} with ID '${id}' does not exist`, 404);
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends APIError {
  constructor(message: string) {
    super(message, 409);
  }
}

/**
 * Unprocessable Entity Error (422)
 */
export class UnprocessableEntityError extends APIError {
  constructor(message: string) {
    super(message, 422);
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends APIError {
  constructor(message = 'An unexpected error occurred') {
    super(message, 500, false);
  }
}

/**
 * Gateway Timeout Error (504)
 */
export class GatewayTimeoutError extends APIError {
  constructor(message = 'Upstream service timeout') {
    super(message, 504, false);
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends APIError {
  constructor(message: string) {
    super(message, 400);
  }
}
