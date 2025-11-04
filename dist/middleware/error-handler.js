"use strict";
/**
 * ============================================================================
 * ERROR HANDLER MIDDLEWARE
 * ============================================================================
 * Global error handler for the application
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const zod_1 = require("zod");
const errors_1 = require("../errors");
const config_1 = __importDefault(require("../config"));
/**
 * Global error handler middleware
 */
function errorHandler(error, req, res, next) {
    // Log error in development
    if (config_1.default.server.env === 'development') {
        console.error('Error:', error);
    }
    // Zod validation errors
    if (error instanceof zod_1.ZodError) {
        const problemDetail = {
            type: 'https://api.example.com/errors/validation-error',
            title: 'Validation Error',
            status: 400,
            detail: 'One or more fields failed validation',
            instance: req.path,
            requestId: req.headers['x-request-id'],
            timestamp: new Date().toISOString(),
            errors: config_1.default.server.env === 'development'
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
    if (error instanceof errors_1.APIError) {
        const problemDetail = {
            type: error.type,
            title: error.message,
            status: error.statusCode,
            detail: error.message,
            instance: req.path,
            requestId: req.headers['x-request-id'],
            timestamp: new Date().toISOString(),
            ...(error instanceof errors_1.ValidationError && { errors: error.errors }),
        };
        res.status(error.statusCode).json(problemDetail);
        return;
    }
    // Unexpected errors (don't leak internal details in production)
    console.error('Unexpected error:', error);
    const problemDetail = {
        type: 'https://api.example.com/errors/internal-error',
        title: 'Internal Server Error',
        status: 500,
        detail: config_1.default.server.env === 'development'
            ? error.message
            : 'An unexpected error occurred while processing your request',
        instance: req.path,
        requestId: req.headers['x-request-id'],
        timestamp: new Date().toISOString(),
        ...(config_1.default.server.env === 'development' && { stack: error.stack }),
    };
    res.status(500).json(problemDetail);
}
/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
    const problemDetail = {
        type: 'https://api.example.com/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `The requested endpoint '${req.path}' does not exist`,
        instance: req.path,
        requestId: req.headers['x-request-id'],
        timestamp: new Date().toISOString(),
    };
    res.status(404).json(problemDetail);
}
