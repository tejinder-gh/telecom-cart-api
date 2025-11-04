/**
 * ============================================================================
 * CART SERVICE - CONTEXT MANAGEMENT TESTS
 * ============================================================================
 */

// Mock nanoid before imports
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id-123'),
}));

import { CartService } from '../../../src/services/cart';
import { SalesforceCartClient } from '../../../src/services/salesforce-client';
import { NotFoundError } from '../../../src/errors';

describe('CartService - Context Management', () => {
  let cartService: CartService;
  let sfClient: SalesforceCartClient;

  beforeEach(() => {
    sfClient = new SalesforceCartClient(5 * 60 * 1000);
    cartService = new CartService(sfClient);
  });

  describe('Context expiry handling', () => {
    it('should recreate expired context from shadow state', async () => {
      const cart = await cartService.initializeCart();
      const cartId = cart.id;

      // Add item to cart
      await cartService.addItem(cartId, 'phone_iphone15', 1);

      // Manually expire the context
      const context = (cartService as any).contextCache.get(cartId);
      sfClient.expireContext(context.contextId);

      // Get cart should recreate context from shadow state
      const retrievedCart = await cartService.getCart(cartId);

      expect(retrievedCart.items).toHaveLength(1);
      expect(retrievedCart.items[0].productId).toBe('phone_iphone15');
    });
  });

  describe('Error handling', () => {
    it('should throw NotFoundError for non-existent cart', async () => {
      await expect(cartService.getCart('non-existent-cart')).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
