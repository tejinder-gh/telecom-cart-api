/**
 * ============================================================================
 * CART SERVICE - BUSINESS RULES TESTS
 * ============================================================================
 */

// Mock nanoid before imports
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id-123'),
}));

import { CartService } from '../../../src/services/cart';
import { SalesforceCartClient } from '../../../src/services/salesforce-client';

describe('CartService - Business Rules', () => {
  let cartService: CartService;
  let sfClient: SalesforceCartClient;

  beforeEach(() => {
    sfClient = new SalesforceCartClient(5 * 60 * 1000);
    cartService = new CartService(sfClient);
  });

  describe('Phone limit rule', () => {
    it('should reject adding a second phone', async () => {
      const cart = await cartService.initializeCart();
      await cartService.addItem(cart.id, 'phone_iphone15', 1);

      await expect(
        cartService.addItem(cart.id, 'phone_samsung_s24', 1)
      ).rejects.toThrow('Only one phone is allowed per cart');
    });
  });

  describe('Plan limit rule', () => {
    it('should reject adding a second plan', async () => {
      const cart = await cartService.initializeCart();
      await cartService.addItem(cart.id, 'phone_iphone15', 1);
      await cartService.addItem(cart.id, 'plan_unlimited', 1);

      await expect(
        cartService.addItem(cart.id, 'plan_5gb', 1)
      ).rejects.toThrow('Only one plan is allowed per cart');
    });
  });

  describe('validateCart', () => {
    it('should validate empty cart as valid', async () => {
      const cart = await cartService.initializeCart();
      const validation = await cartService.validateCart(cart.id);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should validate cart with phone and plan as valid', async () => {
      const cart = await cartService.initializeCart();
      await cartService.addItem(cart.id, 'phone_iphone15', 1);
      await cartService.addItem(cart.id, 'plan_unlimited', 1);

      const validation = await cartService.validateCart(cart.id);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should invalidate cart with plan but no phone', async () => {
      const cart = await cartService.initializeCart();
      await cartService.addItem(cart.id, 'plan_unlimited', 1);

      const validation = await cartService.validateCart(cart.id);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain(
        'Cart contains plans but no phone. Plans require a phone.'
      );
    });
  });
});
