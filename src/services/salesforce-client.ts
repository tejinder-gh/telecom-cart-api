/**
 * ============================================================================
 * SALESFORCE CART CLIENT TEST DOUBLE
 * ============================================================================
 * Simulates a Salesforce cart context with realistic behavior including
 * context expiry. No real Salesforce calls are made - all data is in-memory.
 */

import { nanoid } from 'nanoid';
import { SalesforceContext, CartItem, AddItemRequest } from '../types';

export class SalesforceCartClient {
  private contexts: Map<string, SalesforceContext> = new Map();
  private cartItems: Map<string, CartItem[]> = new Map(); // contextId -> items
  private contextTTL: number;

  constructor(contextTTL: number = 5 * 60 * 1000) {
    // Default 5 minutes
    this.contextTTL = contextTTL;
  }

  /**
   * Create a new Salesforce context
   */
  async createContext(cartId: string): Promise<SalesforceContext> {
    const contextId = `sf_ctx_${nanoid(12)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.contextTTL);

    const context: SalesforceContext = {
      contextId,
      cartId,
      expiresAt,
      createdAt: now,
    };

    this.contexts.set(contextId, context);
    this.cartItems.set(contextId, []);

    return context;
  }

  /**
   * Check if a context exists and is valid (not expired)
   */
  isContextValid(contextId: string): boolean {
    const context = this.contexts.get(contextId);
    if (!context) {
      return false;
    }

    return new Date() < context.expiresAt;
  }

  /**
   * Get cart items from a context
   */
  async getCartItems(contextId: string): Promise<CartItem[]> {
    if (!this.isContextValid(contextId)) {
      throw new Error('SF_CONTEXT_EXPIRED');
    }

    return this.cartItems.get(contextId) || [];
  }

  /**
   * Add an item to the cart
   */
  async addItem(
    contextId: string,
    itemRequest: AddItemRequest
  ): Promise<CartItem> {
    if (!this.isContextValid(contextId)) {
      throw new Error('SF_CONTEXT_EXPIRED');
    }

    const items = this.cartItems.get(contextId) || [];
    const itemId = `item_${nanoid(8)}`;

    const newItem: CartItem = {
      id: itemId,
      ...itemRequest,
    };

    items.push(newItem);
    this.cartItems.set(contextId, items);

    return newItem;
  }

  /**
   * Update an item's quantity
   */
  async updateItem(
    contextId: string,
    itemId: string,
    quantity: number
  ): Promise<CartItem> {
    if (!this.isContextValid(contextId)) {
      throw new Error('SF_CONTEXT_EXPIRED');
    }

    const items = this.cartItems.get(contextId) || [];
    const itemIndex = items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      throw new Error('ITEM_NOT_FOUND');
    }

    const item = items[itemIndex];
    const updatedItem: CartItem = {
      ...item,
      quantity,
      totalPrice: item.unitPrice * quantity,
    };

    items[itemIndex] = updatedItem;
    this.cartItems.set(contextId, items);

    return updatedItem;
  }

  /**
   * Remove an item from the cart
   */
  async removeItem(contextId: string, itemId: string): Promise<void> {
    if (!this.isContextValid(contextId)) {
      throw new Error('SF_CONTEXT_EXPIRED');
    }

    const items = this.cartItems.get(contextId) || [];
    const itemIndex = items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      throw new Error('ITEM_NOT_FOUND');
    }

    items.splice(itemIndex, 1);
    this.cartItems.set(contextId, items);
  }

  /**
   * Clear all items from a context (for testing purposes)
   */
  async clearContext(contextId: string): Promise<void> {
    if (!this.isContextValid(contextId)) {
      throw new Error('SF_CONTEXT_EXPIRED');
    }

    this.cartItems.set(contextId, []);
  }

  /**
   * Manually expire a context (for testing purposes)
   */
  expireContext(contextId: string): void {
    const context = this.contexts.get(contextId);
    if (context) {
      context.expiresAt = new Date(Date.now() - 1000); // Set to past
      this.contexts.set(contextId, context);
    }
  }

  /**
   * Clean up expired contexts (garbage collection)
   */
  cleanupExpiredContexts(): number {
    const now = new Date();
    let count = 0;

    for (const [contextId, context] of this.contexts.entries()) {
      if (now > context.expiresAt) {
        this.contexts.delete(contextId);
        this.cartItems.delete(contextId);
        count++;
      }
    }

    return count;
  }

  /**
   * Get context info (for debugging)
   */
  getContext(contextId: string): SalesforceContext | undefined {
    return this.contexts.get(contextId);
  }

  /**
   * Get total number of active contexts
   */
  getActiveContextCount(): number {
    return this.contexts.size;
  }
}
