/**
 * ============================================================================
 * CART SERVICE
 * ============================================================================
 * Business logic for cart operations with Salesforce context management
 */

import { nanoid } from 'nanoid';
import { Cart, CartItem, Product, SalesforceContext, ValidationResult } from '../types';
import { SalesforceCartClient } from './salesforce-client';
import { NotFoundError } from '../errors';
import {
  calculateItemTotal,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  validateCartRules,
  canAddItemType,
} from '../utils/cart';

export class CartService {
  private sfClient: SalesforceCartClient;
  private contextCache: Map<string, SalesforceContext> = new Map();
  private shadowState: Map<string, CartItem[]> = new Map();

  // Product catalog (in-memory)
  private products: Map<string, Product> = new Map([
    ['phone_iphone15', { id: 'phone_iphone15', name: 'iPhone 15 Pro', type: 'PHONE', price: 1399.99 }],
    ['phone_samsung_s24', { id: 'phone_samsung_s24', name: 'Samsung Galaxy S24', type: 'PHONE', price: 1199.99 }],
    ['plan_unlimited', { id: 'plan_unlimited', name: 'Unlimited Plan', type: 'PLAN', price: 85.00, requiresPhone: true }],
    ['plan_5gb', { id: 'plan_5gb', name: '5GB Plan', type: 'PLAN', price: 55.00, requiresPhone: true }],
    ['addon_insurance', { id: 'addon_insurance', name: 'Device Insurance', type: 'ADDON', price: 12.00 }],
    ['addon_earbuds', { id: 'addon_earbuds', name: 'Wireless Earbuds', type: 'ADDON', price: 199.99 }]
  ]);

  constructor(sfClient: SalesforceCartClient) {
    this.sfClient = sfClient;
  }

  /**
   * Initialize a new cart
   */
  async initializeCart(): Promise<Cart> {
    const cartId = `cart_${nanoid(10)}`;
    const context = await this.sfClient.createContext(cartId);

    this.contextCache.set(cartId, context);
    this.shadowState.set(cartId, []);

    return this.buildCart(cartId, []);
  }

  /**
   * Ensure Salesforce context is valid, recreate if expired
   */
  private async ensureValidContext(cartId: string): Promise<string> {
    const context = this.contextCache.get(cartId);

    if (!context) {
      throw new NotFoundError('Cart', cartId);
    }

    // Check if context is expired
    if (new Date() > context.expiresAt) {
      // Recreate context from shadow state
      const shadowItems = this.shadowState.get(cartId) || [];
      const newContext = await this.sfClient.createContext(cartId);

      // Restore items to new SF context
      for (const item of shadowItems) {
        await this.sfClient.addItem(newContext.contextId, {
          productId: item.productId,
          productName: item.productName,
          productType: item.productType,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        });
      }

      this.contextCache.set(cartId, newContext);
      return newContext.contextId;
    }

    return context.contextId;
  }

  /**
   * Get cart by ID
   */
  async getCart(cartId: string): Promise<Cart> {
    const contextId = await this.ensureValidContext(cartId);
    const items = await this.sfClient.getCartItems(contextId);

    // Sync shadow state
    this.shadowState.set(cartId, items);

    return this.buildCart(cartId, items);
  }

  /**
   * Add item to cart
   */
  async addItem(cartId: string, productId: string, quantity: number): Promise<Cart> {
    const product = this.products.get(productId);
    if (!product) {
      throw new NotFoundError('Product', productId);
    }

    const contextId = await this.ensureValidContext(cartId);

    // Check current items before adding
    const currentItems = await this.sfClient.getCartItems(contextId);
    const canAdd = canAddItemType(currentItems, product.type);

    if (!canAdd.allowed) {
      throw new Error(canAdd.reason);
    }

    const totalPrice = calculateItemTotal(product.price, quantity);
    const newItem = await this.sfClient.addItem(contextId, {
      productId: product.id,
      productName: product.name,
      productType: product.type,
      quantity,
      unitPrice: product.price,
      totalPrice
    });

    // Update shadow state
    const shadowItems = this.shadowState.get(cartId) || [];
    shadowItems.push(newItem);
    this.shadowState.set(cartId, shadowItems);

    return this.buildCart(cartId, shadowItems);
  }

  /**
   * Update item quantity
   */
  async updateItem(cartId: string, itemId: string, quantity: number): Promise<Cart> {
    const contextId = await this.ensureValidContext(cartId);
    const updatedItem = await this.sfClient.updateItem(contextId, itemId, quantity);

    // Update shadow state
    const shadowItems = this.shadowState.get(cartId) || [];
    const index = shadowItems.findIndex(i => i.id === itemId);
    if (index !== -1) {
      shadowItems[index] = updatedItem;
      this.shadowState.set(cartId, shadowItems);
    }

    return this.buildCart(cartId, shadowItems);
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartId: string, itemId: string): Promise<Cart> {
    const contextId = await this.ensureValidContext(cartId);
    await this.sfClient.removeItem(contextId, itemId);

    // Update shadow state
    const shadowItems = this.shadowState.get(cartId) || [];
    const index = shadowItems.findIndex(i => i.id === itemId);
    if (index !== -1) {
      shadowItems.splice(index, 1);
      this.shadowState.set(cartId, shadowItems);
    }

    return this.buildCart(cartId, shadowItems);
  }

  /**
   * Validate cart against business rules
   */
  async validateCart(cartId: string): Promise<ValidationResult> {
    const contextId = await this.ensureValidContext(cartId);
    const items = await this.sfClient.getCartItems(contextId);

    return validateCartRules(items);
  }

  /**
   * Build cart response with calculations
   */
  private buildCart(cartId: string, items: CartItem[]): Cart {
    const subtotal = calculateSubtotal(items);
    const tax = calculateTax(subtotal);
    const total = calculateTotal(subtotal, tax);

    return {
      id: cartId,
      items,
      subtotal,
      tax,
      total,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Get all available products
   */
  getProducts(): Product[] {
    return Array.from(this.products.values());
  }

  /**
   * Get product by ID
   */
  getProduct(productId: string): Product | undefined {
    return this.products.get(productId);
  }
}
