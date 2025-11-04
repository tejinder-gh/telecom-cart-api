/**
 * Product-related type definitions
 */

export type ProductType = 'PHONE' | 'PLAN' | 'ADDON';

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  price: number;
  requiresPhone?: boolean; // For plans that require a phone
}
