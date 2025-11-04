"use strict";
/**
 * ============================================================================
 * CUSTOM ERROR CLASSES
 * ============================================================================
 * Following the API specification for error handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = exports.GatewayTimeoutError = exports.InternalServerError = exports.UnprocessableEntityError = exports.ConflictError = exports.NotFoundError = exports.ValidationError = exports.APIError = void 0;
/**
 * Base API Error class
 */
class APIError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.APIError = APIError;
/**
 * Validation Error (400)
 */
class ValidationError extends APIError {
    errors;
    constructor(errors) {
        super('Validation Error', 400);
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
/**
 * Not Found Error (404)
 */
class NotFoundError extends APIError {
    constructor(resource, id) {
        super(`${resource} with ID '${id}' does not exist`, 404);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Conflict Error (409)
 */
class ConflictError extends APIError {
    constructor(message) {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
/**
 * Unprocessable Entity Error (422)
 */
class UnprocessableEntityError extends APIError {
    constructor(message) {
        super(message, 422);
    }
}
exports.UnprocessableEntityError = UnprocessableEntityError;
/**
 * Internal Server Error (500)
 */
class InternalServerError extends APIError {
    constructor(message = 'An unexpected error occurred') {
        super(message, 500, false);
    }
}
exports.InternalServerError = InternalServerError;
/**
 * Gateway Timeout Error (504)
 */
class GatewayTimeoutError extends APIError {
    constructor(message = 'Upstream service timeout') {
        super(message, 504, false);
    }
}
exports.GatewayTimeoutError = GatewayTimeoutError;
/**
 * Bad Request Error (400)
 */
class BadRequestError extends APIError {
    constructor(message) {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
