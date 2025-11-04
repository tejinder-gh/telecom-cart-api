/**
 * ============================================================================
 * CART UTILITIES - VALIDATION TESTS
 * ============================================================================
 */

import { validateCartRules, canAddItemType } from '../../../src/utils/cart';
import { CartItem } from '../../../src/types';

describe('Cart Utilities - Validation', () => {
  describe('validateCartRules', () => {
    it('should validate empty cart as valid', () => {
      const result = validateCartRules([]);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate cart with phone and plan as valid', () => {
      const items: CartItem[] = [
        {
          id: 'item1',
          productId: 'phone1',
          productName: 'Phone',
          productType: 'PHONE',
          quantity: 1,
          unitPrice: 1000,
          totalPrice: 1000,
        },
        {
          id: 'item2',
          productId: 'plan1',
          productName: 'Plan',
          productType: 'PLAN',
          quantity: 1,
          unitPrice: 50,
          totalPrice: 50,
        },
      ];

      const result = validateCartRules(items);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should invalidate cart with plan but no phone', () => {
      const items: CartItem[] = [
        {
          id: 'item1',
          productId: 'plan1',
          productName: 'Plan',
          productType: 'PLAN',
          quantity: 1,
          unitPrice: 50,
          totalPrice: 50,
        },
      ];

      const result = validateCartRules(items);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Cart contains plans but no phone. Plans require a phone.'
      );
    });

    it('should invalidate cart with multiple phones', () => {
      const items: CartItem[] = [
        {
          id: 'item1',
          productId: 'phone1',
          productName: 'Phone 1',
          productType: 'PHONE',
          quantity: 1,
          unitPrice: 1000,
          totalPrice: 1000,
        },
        {
          id: 'item2',
          productId: 'phone2',
          productName: 'Phone 2',
          productType: 'PHONE',
          quantity: 1,
          unitPrice: 1200,
          totalPrice: 1200,
        },
      ];

      const result = validateCartRules(items);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Only one phone is allowed per cart');
    });

    it('should invalidate cart with multiple plans', () => {
      const items: CartItem[] = [
        {
          id: 'item1',
          productId: 'phone1',
          productName: 'Phone',
          productType: 'PHONE',
          quantity: 1,
          unitPrice: 1000,
          totalPrice: 1000,
        },
        {
          id: 'item2',
          productId: 'plan1',
          productName: 'Plan 1',
          productType: 'PLAN',
          quantity: 1,
          unitPrice: 50,
          totalPrice: 50,
        },
        {
          id: 'item3',
          productId: 'plan2',
          productName: 'Plan 2',
          productType: 'PLAN',
          quantity: 1,
          unitPrice: 60,
          totalPrice: 60,
        },
      ];

      const result = validateCartRules(items);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Only one plan is allowed per cart');
    });

    it('should invalidate cart with invalid quantities', () => {
      const items: CartItem[] = [
        {
          id: 'item1',
          productId: 'phone1',
          productName: 'Phone',
          productType: 'PHONE',
          quantity: 0,
          unitPrice: 1000,
          totalPrice: 0,
        },
      ];

      const result = validateCartRules(items);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Cart contains items with invalid quantities'
      );
    });
  });

  describe('canAddItemType', () => {
    it('should allow adding phone to empty cart', () => {
      const result = canAddItemType([], 'PHONE');

      expect(result.allowed).toBe(true);
    });

    it('should not allow adding second phone', () => {
      const items: CartItem[] = [
        {
          id: 'item1',
          productId: 'phone1',
          productName: 'Phone',
          productType: 'PHONE',
          quantity: 1,
          unitPrice: 1000,
          totalPrice: 1000,
        },
      ];

      const result = canAddItemType(items, 'PHONE');

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Only one phone is allowed per cart');
    });

    it('should not allow adding second plan', () => {
      const items: CartItem[] = [
        {
          id: 'item1',
          productId: 'plan1',
          productName: 'Plan',
          productType: 'PLAN',
          quantity: 1,
          unitPrice: 50,
          totalPrice: 50,
        },
      ];

      const result = canAddItemType(items, 'PLAN');

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Only one plan is allowed per cart');
    });

    it('should allow multiple addons', () => {
      const items: CartItem[] = [
        {
          id: 'item1',
          productId: 'addon1',
          productName: 'Addon 1',
          productType: 'ADDON',
          quantity: 1,
          unitPrice: 10,
          totalPrice: 10,
        },
      ];

      const result = canAddItemType(items, 'ADDON');

      expect(result.allowed).toBe(true);
    });

    it('should not allow exceeding max items limit', () => {
      const items: CartItem[] = Array.from({ length: 50 }, (_, i) => ({
        id: `item${i}`,
        productId: `addon${i}`,
        productName: `Addon ${i}`,
        productType: 'ADDON' as const,
        quantity: 1,
        unitPrice: 10,
        totalPrice: 10,
      }));

      const result = canAddItemType(items, 'ADDON');

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Cart has reached maximum of 50 items');
    });
  });
});
