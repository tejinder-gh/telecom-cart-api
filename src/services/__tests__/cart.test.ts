/**
 * ============================================================================
 * CART SERVICE UNIT TESTS
 * ============================================================================
 */

// Mock nanoid before imports
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id-123'),
}));

import { CartService } from '../cart';
import { SalesforceCartClient } from '../salesforce-client';
import { NotFoundError } from '../../errors';

describe('CartService', () => {
  let cartService: CartService;
  let sfClient: SalesforceCartClient;

  beforeEach(() => {
    sfClient = new SalesforceCartClient(5 * 60 * 1000); // 5 minutes
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

    it('should throw NotFoundError for non-existent cart', async () => {
      await expect(cartService.getCart('non-existent-cart')).rejects.toThrow(
        NotFoundError
      );
    });
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
      await cartService.addItem(cartId, 'phone_iphone15', 1); // 1399.99
      const cart = await cartService.addItem(cartId, 'addon_insurance', 1); // 12.00

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

    it('should reject adding a second phone', async () => {
      await cartService.addItem(cartId, 'phone_iphone15', 1);

      await expect(
        cartService.addItem(cartId, 'phone_samsung_s24', 1)
      ).rejects.toThrow('Only one phone is allowed per cart');
    });

    it('should reject adding a second plan', async () => {
      await cartService.addItem(cartId, 'phone_iphone15', 1);
      await cartService.addItem(cartId, 'plan_unlimited', 1);

      await expect(
        cartService.addItem(cartId, 'plan_5gb', 1)
      ).rejects.toThrow('Only one plan is allowed per cart');
    });
  });

  describe('updateItem', () => {
    let cartId: string;
    let itemId: string;

    beforeEach(async () => {
      const cart = await cartService.initializeCart();
      cartId = cart.id;
      const updatedCart = await cartService.addItem(
        cartId,
        'phone_iphone15',
        1
      );
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
      const updatedCart = await cartService.addItem(
        cartId,
        'phone_iphone15',
        1
      );
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

  describe('validateCart', () => {
    let cartId: string;

    beforeEach(async () => {
      const cart = await cartService.initializeCart();
      cartId = cart.id;
    });

    it('should validate empty cart as valid', async () => {
      const validation = await cartService.validateCart(cartId);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should validate cart with phone and plan as valid', async () => {
      await cartService.addItem(cartId, 'phone_iphone15', 1);
      await cartService.addItem(cartId, 'plan_unlimited', 1);

      const validation = await cartService.validateCart(cartId);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should invalidate cart with plan but no phone', async () => {
      await cartService.addItem(cartId, 'plan_unlimited', 1);

      const validation = await cartService.validateCart(cartId);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain(
        'Cart contains plans but no phone. Plans require a phone.'
      );
    });
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

  describe('context expiry handling', () => {
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
});
