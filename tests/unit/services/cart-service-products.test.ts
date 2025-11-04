/**
 * ============================================================================
 * CART SERVICE - PRODUCT MANAGEMENT TESTS
 * ============================================================================
 */

// Mock nanoid before imports
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id-123'),
}));

import { CartService } from '../../../src/services/cart';
import { SalesforceCartClient } from '../../../src/services/salesforce-client';

describe('CartService - Product Management', () => {
  let cartService: CartService;
  let sfClient: SalesforceCartClient;

  beforeEach(() => {
    sfClient = new SalesforceCartClient(5 * 60 * 1000);
    cartService = new CartService(sfClient);
  });

  describe('getProducts', () => {
    it('should return all available products', () => {
      const products = cartService.getProducts();

      expect(products).toHaveLength(6);
      expect(products.some((p) => p.id === 'phone_iphone15')).toBe(true);
      expect(products.some((p) => p.id === 'phone_samsung_s24')).toBe(true);
      expect(products.some((p) => p.id === 'plan_unlimited')).toBe(true);
      expect(products.some((p) => p.id === 'plan_5gb')).toBe(true);
      expect(products.some((p) => p.id === 'addon_insurance')).toBe(true);
      expect(products.some((p) => p.id === 'addon_earbuds')).toBe(true);
    });
  });

  describe('getProduct', () => {
    it('should return a specific product', () => {
      const product = cartService.getProduct('phone_iphone15');

      expect(product).toBeDefined();
      expect(product?.id).toBe('phone_iphone15');
      expect(product?.name).toBe('iPhone 15 Pro');
      expect(product?.type).toBe('PHONE');
      expect(product?.price).toBe(1399.99);
    });

    it('should return undefined for non-existent product', () => {
      const product = cartService.getProduct('non-existent-product');

      expect(product).toBeUndefined();
    });
  });
});
