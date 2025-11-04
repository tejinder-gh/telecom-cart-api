"use strict";
/**
 * ============================================================================
 * SERVER MODULE
 * ============================================================================
 * Server initialization, HTTP server setup, and graceful shutdown handling
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./app");
const config_1 = __importDefault(require("./config"));
// Load environment variables
dotenv_1.default.config();
// Create Express application
const app = (0, app_1.createApp)();
// Start HTTP server
const server = app.listen(config_1.default.server.port, () => {
    console.log(`
┌─────────────────────────────────────────────┐
│  Telecom Cart API Server                    │
├─────────────────────────────────────────────┤
│  Environment: ${config_1.default.server.env.padEnd(31)}│
│  Port:        ${String(config_1.default.server.port).padEnd(31)}│
│  API Version: ${config_1.default.server.apiVersion.padEnd(31)}│
│  Base URL:    http://localhost:${config_1.default.server.port}/api/v${config_1.default.server.apiVersion.replace('v', '')}  │
└─────────────────────────────────────────────┘
  `);
});
// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} signal received: closing HTTP server`);
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};
// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});
