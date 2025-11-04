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
  public readonly type: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    type: string,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
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
    super(
      'Validation Error',
      400,
      'https://api.example.com/errors/validation-error'
    );
    this.errors = errors;
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends APIError {
  constructor(resource: string, id: string) {
    super(
      `${resource} with ID '${id}' does not exist`,
      404,
      'https://api.example.com/errors/not-found'
    );
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends APIError {
  constructor(message: string) {
    super(message, 409, 'https://api.example.com/errors/conflict');
  }
}

/**
 * Unprocessable Entity Error (422)
 */
export class UnprocessableEntityError extends APIError {
  constructor(message: string) {
    super(
      message,
      422,
      'https://api.example.com/errors/unprocessable-entity'
    );
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends APIError {
  constructor(message = 'An unexpected error occurred') {
    super(message, 500, 'https://api.example.com/errors/internal-error', false);
  }
}

/**
 * Gateway Timeout Error (504)
 */
export class GatewayTimeoutError extends APIError {
  constructor(message = 'Upstream service timeout') {
    super(message, 504, 'https://api.example.com/errors/gateway-timeout', false);
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends APIError {
  constructor(message: string) {
    super(message, 400, 'https://api.example.com/errors/bad-request');
  }
}
