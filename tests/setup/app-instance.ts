/**
 * ============================================================================
 * SHARED TEST APP INSTANCE
 * ============================================================================
 * Creates a single app instance shared across all integration tests
 * to avoid recreating the app for each test file
 */

import { Application } from 'express';
import { createApp } from '../../src/app';

let appInstance: Application | null = null;

/**
 * Get or create the shared app instance
 */
export function getTestApp(): Application {
  if (!appInstance) {
    appInstance = createApp();
  }
  return appInstance;
}

/**
 * Reset the app instance (useful for cleanup between test suites if needed)
 */
export function resetTestApp(): void {
  appInstance = null;
}
