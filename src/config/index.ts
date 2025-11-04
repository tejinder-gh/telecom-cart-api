/**
 * ============================================================================
 * CONFIGURATION MODULE
 * ============================================================================
 * Centralizes all config-driven settings for the application
 */

import { Config } from '../types';

const config: Config = {
  server: {
    port: Number(process.env.PORT) || 3000,
    apiVersion: 'v1',
    env: process.env.NODE_ENV || 'development',
  },

  salesforce: {
    // Context time-to-live in milliseconds (default: 5 minutes)
    contextTTL: Number(process.env.SF_CONTEXT_TTL) || 5 * 60 * 1000,
    // Default TTL fallback
    defaultTTL: 5 * 60 * 1000,
  },

  cart: {
    // Tax rate (13% for example, adjust as needed)
    taxRate: Number(process.env.TAX_RATE) || 0.13,
    // Maximum items allowed per cart
    maxItemsPerCart: Number(process.env.MAX_ITEMS_PER_CART) || 50,
  },
};

export default config;
