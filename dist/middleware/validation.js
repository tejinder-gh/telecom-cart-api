"use strict";
/**
 * ============================================================================
 * VALIDATION MIDDLEWARE
 * ============================================================================
 * Zod-based validation for request body, params, and query
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateParams = validateParams;
exports.validateQuery = validateQuery;
exports.asyncHandler = asyncHandler;
const zod_1 = require("zod");
const config_1 = __importDefault(require("../config"));
/**
 * Validate request body
 */
function validateBody(schema) {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.body);
            req.body = validated;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
            next(error);
        }
    };
}
/**
 * Validate request params
 */
function validateParams(schema) {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.params);
            req.params = validated;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const problemDetail = {
                    type: 'https://api.example.com/errors/validation-error',
                    title: 'Validation Error',
                    status: 400,
                    detail: 'Invalid path parameters',
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
            next(error);
        }
    };
}
/**
 * Validate request query
 */
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.query);
            req.query = validated;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const problemDetail = {
                    type: 'https://api.example.com/errors/validation-error',
                    title: 'Validation Error',
                    status: 400,
                    detail: 'Invalid query parameters',
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
            next(error);
        }
    };
}
/**
 * Async error wrapper for controller handlers
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
