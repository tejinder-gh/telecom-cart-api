"use strict";
/**
 * ============================================================================
 * APP MODULE
 * ============================================================================
 * Main application setup with middleware, routes, and error handling
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const error_handler_1 = require("./middleware/error-handler");
const routes_1 = __importDefault(require("./routes"));
/**
 * Create and configure Express application
 */
function createApp() {
    const app = (0, express_1.default)();
    // ============================================================================
    // MIDDLEWARE SETUP
    // ============================================================================
    // Body parsing middleware
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
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
    app.use('/api', routes_1.default);
    // ============================================================================
    // ERROR HANDLING
    // ============================================================================
    // 404 handler for undefined routes
    app.use(error_handler_1.notFoundHandler);
    // Global error handler (must be last)
    app.use(error_handler_1.errorHandler);
    return app;
}
