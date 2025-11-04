/**
 * Salesforce context type definitions
 */

export interface SalesforceContext {
  contextId: string;
  cartId: string;
  expiresAt: Date;
  createdAt: Date;
}
