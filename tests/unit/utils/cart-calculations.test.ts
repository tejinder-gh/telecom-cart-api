/**
 * ============================================================================
 * CART UTILITIES - CALCULATION TESTS
 * ============================================================================
 */

import {
  calculateItemTotal,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
} from '../../../src/utils/cart';
import { CartItem } from '../../../src/types';

describe('Cart Utilities - Calculations', () => {
  describe('calculateItemTotal', () => {
    it('should calculate item total correctly', () => {
      expect(calculateItemTotal(100, 2)).toBe(200);
      expect(calculateItemTotal(99.99, 3)).toBe(299.97);
      expect(calculateItemTotal(10.5, 1)).toBe(10.5);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateItemTotal(10.333, 3)).toBe(31);
      expect(calculateItemTotal(10.555, 2)).toBe(21.11);
    });
  });

  describe('calculateSubtotal', () => {
    it('should calculate subtotal for empty items', () => {
      expect(calculateSubtotal([])).toBe(0);
    });

    it('should calculate subtotal for single item', () => {
      const items: CartItem[] = [
        {
          id: 'item1',
          productId: 'prod1',
          productName: 'Product 1',
          productType: 'PHONE',
          quantity: 1,
          unitPrice: 100,
          totalPrice: 100,
        },
      ];

      expect(calculateSubtotal(items)).toBe(100);
    });

    it('should calculate subtotal for multiple items', () => {
      const items: CartItem[] = [
        {
          id: 'item1',
          productId: 'prod1',
          productName: 'Product 1',
          productType: 'PHONE',
          quantity: 2,
          unitPrice: 100,
          totalPrice: 200,
        },
        {
          id: 'item2',
          productId: 'prod2',
          productName: 'Product 2',
          productType: 'ADDON',
          quantity: 1,
          unitPrice: 50,
          totalPrice: 50,
        },
      ];

      expect(calculateSubtotal(items)).toBe(250);
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax at 13% rate', () => {
      expect(calculateTax(100)).toBe(13);
      expect(calculateTax(200)).toBe(26);
      expect(calculateTax(0)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateTax(99.99)).toBe(13);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total correctly', () => {
      expect(calculateTotal(100, 13)).toBe(113);
      expect(calculateTotal(200, 26)).toBe(226);
      expect(calculateTotal(0, 0)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateTotal(99.99, 13.0)).toBe(112.99);
    });
  });
});
