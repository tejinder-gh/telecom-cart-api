/**
 * Configuration type definitions
 */

export interface ServerConfig {
  port: number;
  apiVersion: string;
  env: string;
}

export interface SalesforceConfig {
  contextTTL: number; // Time to live in milliseconds
  defaultTTL: number;
}

export interface CartConfig {
  taxRate: number;
  maxItemsPerCart: number;
}

export interface Config {
  server: ServerConfig;
  salesforce: SalesforceConfig;
  cart: CartConfig;
}
