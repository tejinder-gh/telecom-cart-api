"use strict";
/**
 * ============================================================================
 * CART UTILITY FUNCTIONS
 * ============================================================================
 * Pure functions for cart calculations and validation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateItemTotal = calculateItemTotal;
exports.calculateSubtotal = calculateSubtotal;
exports.calculateTax = calculateTax;
exports.calculateTotal = calculateTotal;
exports.validateCartRules = validateCartRules;
exports.canAddItemType = canAddItemType;
const config_1 = __importDefault(require("../config"));
/**
 * Calculate the total price for a single item
 */
function calculateItemTotal(unitPrice, quantity) {
    return Number((unitPrice * quantity).toFixed(2));
}
/**
 * Calculate cart subtotal (sum of all item totals)
 */
function calculateSubtotal(items) {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    return Number(subtotal.toFixed(2));
}
/**
 * Calculate tax based on subtotal
 */
function calculateTax(subtotal) {
    const tax = subtotal * config_1.default.cart.taxRate;
    return Number(tax.toFixed(2));
}
/**
 * Calculate cart total (subtotal + tax)
 */
function calculateTotal(subtotal, tax) {
    return Number((subtotal + tax).toFixed(2));
}
/**
 * Validate cart against telecom business rules
 */
function validateCartRules(items) {
    const errors = [];
    // Check if cart exceeds maximum items
    if (items.length > config_1.default.cart.maxItemsPerCart) {
        errors.push(`Cart exceeds maximum of ${config_1.default.cart.maxItemsPerCart} items`);
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
    const invalidQuantities = items.filter((item) => item.quantity <= 0 || !Number.isInteger(item.quantity));
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
function canAddItemType(items, productType) {
    // Check max items
    if (items.length >= config_1.default.cart.maxItemsPerCart) {
        return {
            allowed: false,
            reason: `Cart has reached maximum of ${config_1.default.cart.maxItemsPerCart} items`,
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
