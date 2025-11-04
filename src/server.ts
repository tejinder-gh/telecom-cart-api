/**
 * ============================================================================
 * SERVER MODULE
 * ============================================================================
 * Server initialization, HTTP server setup, and graceful shutdown handling
 */

import dotenv from 'dotenv';
import { createApp } from './app';
import config from './config';

// Load environment variables
dotenv.config();

// Create Express application
const app = createApp();

// Start HTTP server
const server = app.listen(config.server.port, () => {
  console.log(`
┌─────────────────────────────────────────────┐
│  Telecom Cart API Server                    │
├─────────────────────────────────────────────┤
│  Environment: ${config.server.env.padEnd(31)}│
│  Port:        ${String(config.server.port).padEnd(31)}│
│  API Version: ${config.server.apiVersion.padEnd(31)}│
│  Base URL:    http://localhost:${config.server.port}/api/v${config.server.apiVersion.replace('v', '')}  │
└─────────────────────────────────────────────┘
  `);
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

const gracefulShutdown = (signal: string) => {
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
