/**
 * ============================================================================
 * CART SERVICE - ITEM MANAGEMENT TESTS
 * ============================================================================
 */

// Mock nanoid before imports
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id-123'),
}));

import { CartService } from '../../../src/services/cart';
import { SalesforceCartClient } from '../../../src/services/salesforce-client';
import { NotFoundError } from '../../../src/errors';

describe('CartService - Item Management', () => {
  let cartService: CartService;
  let sfClient: SalesforceCartClient;

  beforeEach(() => {
    sfClient = new SalesforceCartClient(5 * 60 * 1000);
    cartService = new CartService(sfClient);
  });

  describe('addItem', () => {
    let cartId: string;

    beforeEach(async () => {
      const cart = await cartService.initializeCart();
      cartId = cart.id;
    });

    it('should add a phone to the cart', async () => {
      const cart = await cartService.addItem(cartId, 'phone_iphone15', 1);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe('phone_iphone15');
      expect(cart.items[0].productName).toBe('iPhone 15 Pro');
      expect(cart.items[0].productType).toBe('PHONE');
      expect(cart.items[0].quantity).toBe(1);
      expect(cart.items[0].unitPrice).toBe(1399.99);
      expect(cart.items[0].totalPrice).toBe(1399.99);
    });

    it('should add a plan to the cart', async () => {
      await cartService.addItem(cartId, 'phone_iphone15', 1);
      const cart = await cartService.addItem(cartId, 'plan_unlimited', 1);

      expect(cart.items).toHaveLength(2);
      expect(cart.items[1].productId).toBe('plan_unlimited');
      expect(cart.items[1].productType).toBe('PLAN');
    });

    it('should add an addon to the cart', async () => {
      const cart = await cartService.addItem(cartId, 'addon_insurance', 1);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe('addon_insurance');
      expect(cart.items[0].productType).toBe('ADDON');
    });

    it('should calculate correct subtotal, tax, and total', async () => {
      await cartService.addItem(cartId, 'phone_iphone15', 1);
      const cart = await cartService.addItem(cartId, 'addon_insurance', 1);

      const expectedSubtotal = 1399.99 + 12.0;
      const expectedTax = Number((expectedSubtotal * 0.13).toFixed(2));
      const expectedTotal = Number((expectedSubtotal + expectedTax).toFixed(2));

      expect(cart.subtotal).toBe(expectedSubtotal);
      expect(cart.tax).toBe(expectedTax);
      expect(cart.total).toBe(expectedTotal);
    });

    it('should throw NotFoundError for non-existent product', async () => {
      await expect(
        cartService.addItem(cartId, 'non-existent-product', 1)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError for non-existent cart', async () => {
      await expect(
        cartService.addItem('non-existent-cart', 'phone_iphone15', 1)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateItem', () => {
    let cartId: string;
    let itemId: string;

    beforeEach(async () => {
      const cart = await cartService.initializeCart();
      cartId = cart.id;
      const updatedCart = await cartService.addItem(cartId, 'phone_iphone15', 1);
      itemId = updatedCart.items[0].id;
    });

    it('should update item quantity', async () => {
      const cart = await cartService.updateItem(cartId, itemId, 2);

      expect(cart.items[0].quantity).toBe(2);
      expect(cart.items[0].totalPrice).toBe(1399.99 * 2);
    });

    it('should recalculate cart totals after update', async () => {
      const cart = await cartService.updateItem(cartId, itemId, 2);

      const expectedSubtotal = 1399.99 * 2;
      const expectedTax = Number((expectedSubtotal * 0.13).toFixed(2));
      const expectedTotal = Number((expectedSubtotal + expectedTax).toFixed(2));

      expect(cart.subtotal).toBe(expectedSubtotal);
      expect(cart.tax).toBe(expectedTax);
      expect(cart.total).toBe(expectedTotal);
    });
  });

  describe('removeItem', () => {
    let cartId: string;
    let itemId: string;

    beforeEach(async () => {
      const cart = await cartService.initializeCart();
      cartId = cart.id;
      const updatedCart = await cartService.addItem(cartId, 'phone_iphone15', 1);
      itemId = updatedCart.items[0].id;
    });

    it('should remove item from cart', async () => {
      const cart = await cartService.removeItem(cartId, itemId);

      expect(cart.items).toHaveLength(0);
      expect(cart.subtotal).toBe(0);
      expect(cart.tax).toBe(0);
      expect(cart.total).toBe(0);
    });

    it('should recalculate totals after removing item', async () => {
      await cartService.addItem(cartId, 'addon_insurance', 1);
      const cart = await cartService.removeItem(cartId, itemId);

      expect(cart.items).toHaveLength(1);
      expect(cart.subtotal).toBe(12.0);
    });
  });
});
