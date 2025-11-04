/**
 * ============================================================================
 * CART SERVICE - INITIALIZATION TESTS
 * ============================================================================
 */

// Mock nanoid before imports
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id-123'),
}));

import { CartService } from '../../../src/services/cart';
import { SalesforceCartClient } from '../../../src/services/salesforce-client';

describe('CartService - Initialization', () => {
  let cartService: CartService;
  let sfClient: SalesforceCartClient;

  beforeEach(() => {
    sfClient = new SalesforceCartClient(5 * 60 * 1000);
    cartService = new CartService(sfClient);
  });

  describe('initializeCart', () => {
    it('should create a new cart with empty items', async () => {
      const cart = await cartService.initializeCart();

      expect(cart).toBeDefined();
      expect(cart.id).toMatch(/^cart_/);
      expect(cart.items).toEqual([]);
      expect(cart.subtotal).toBe(0);
      expect(cart.tax).toBe(0);
      expect(cart.total).toBe(0);
      expect(cart.createdAt).toBeInstanceOf(Date);
      expect(cart.updatedAt).toBeInstanceOf(Date);
    });

    it('should create cart IDs with correct prefix', async () => {
      const cart = await cartService.initializeCart();

      expect(cart.id).toMatch(/^cart_/);
    });
  });

  describe('getCart', () => {
    it('should retrieve an existing cart', async () => {
      const initialCart = await cartService.initializeCart();
      const retrievedCart = await cartService.getCart(initialCart.id);

      expect(retrievedCart.id).toBe(initialCart.id);
      expect(retrievedCart.items).toEqual([]);
    });
  });
});
