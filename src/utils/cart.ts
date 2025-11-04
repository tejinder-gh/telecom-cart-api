/**
 * ============================================================================
 * CART UTILITY FUNCTIONS
 * ============================================================================
 * Pure functions for cart calculations and validation
 */

import { CartItem, ValidationResult } from '../types';
import config from '../config';

/**
 * Calculate the total price for a single item
 */
export function calculateItemTotal(unitPrice: number, quantity: number): number {
  return Number((unitPrice * quantity).toFixed(2));
}

/**
 * Calculate cart subtotal (sum of all item totals)
 */
export function calculateSubtotal(items: CartItem[]): number {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  return Number(subtotal.toFixed(2));
}

/**
 * Calculate tax based on subtotal
 */
export function calculateTax(subtotal: number): number {
  const tax = subtotal * config.cart.taxRate;
  return Number(tax.toFixed(2));
}

/**
 * Calculate cart total (subtotal + tax)
 */
export function calculateTotal(subtotal: number, tax: number): number {
  return Number((subtotal + tax).toFixed(2));
}

/**
 * Validate cart against telecom business rules
 */
export function validateCartRules(items: CartItem[]): ValidationResult {
  const errors: string[] = [];

  // Check if cart exceeds maximum items
  if (items.length > config.cart.maxItemsPerCart) {
    errors.push(
      `Cart exceeds maximum of ${config.cart.maxItemsPerCart} items`
    );
  }

  // Check if there are any phones in the cart
  const hasPhone = items.some((item) => item.productType === 'PHONE');

  // Check if there are any plans in the cart
  const hasPlans = items.filter((item) => item.productType === 'PLAN');

  // Rule: Plans require a phone
  if (hasPlans.length > 0 && !hasPhone) {
    errors.push('Cart contains plans but no phone. Plans require a phone.');
  }

  // Rule: Only one phone allowed per cart
  const phoneCount = items.filter((item) => item.productType === 'PHONE').length;
  if (phoneCount > 1) {
    errors.push('Only one phone is allowed per cart');
  }

  // Rule: Only one plan allowed per cart
  if (hasPlans.length > 1) {
    errors.push('Only one plan is allowed per cart');
  }

  // Rule: Check for invalid quantities
  const invalidQuantities = items.filter(
    (item) => item.quantity <= 0 || !Number.isInteger(item.quantity)
  );
  if (invalidQuantities.length > 0) {
    errors.push('Cart contains items with invalid quantities');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if an item type can be added to the cart
 */
export function canAddItemType(
  items: CartItem[],
  productType: string
): { allowed: boolean; reason?: string } {
  // Check max items
  if (items.length >= config.cart.maxItemsPerCart) {
    return {
      allowed: false,
      reason: `Cart has reached maximum of ${config.cart.maxItemsPerCart} items`,
    };
  }

  // Check phone limit
  if (productType === 'PHONE') {
    const phoneCount = items.filter((item) => item.productType === 'PHONE')
      .length;
    if (phoneCount >= 1) {
      return { allowed: false, reason: 'Only one phone is allowed per cart' };
    }
  }

  // Check plan limit
  if (productType === 'PLAN') {
    const planCount = items.filter((item) => item.productType === 'PLAN')
      .length;
    if (planCount >= 1) {
      return { allowed: false, reason: 'Only one plan is allowed per cart' };
    }
  }

  return { allowed: true };
}
