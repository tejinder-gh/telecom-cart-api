/**
 * ============================================================================
 * CART API INTEGRATION TESTS
 * ============================================================================
 * Tests for the complete cart API workflow
 */

// Mock nanoid with unique IDs
let idCounter = 0;
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => `test-id-${++idCounter}`),
}));

import request from 'supertest';
import { createApp } from '../app';
import { Application } from 'express';

describe('Cart API Integration Tests', () => {
  let app: Application;

  beforeAll(() => {
    app = createApp();
  });

  describe('Health Check', () => {
    it('should return 200 for health endpoint', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Products API', () => {
    it('should get all products', async () => {
      const response = await request(app).get('/api/v1/products');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toHaveLength(6);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.version).toBe('v1');
    });

    it('should get a specific product', async () => {
      const response = await request(app).get(
        '/api/v1/products/phone_iphone15'
      );

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('phone_iphone15');
      expect(response.body.data.name).toBe('iPhone 15 Pro');
      expect(response.body.data.type).toBe('PHONE');
      expect(response.body.data.price).toBe(1399.99);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get(
        '/api/v1/products/non-existent'
      );

      expect(response.status).toBe(404);
      expect(response.body.title).toBe('Not Found');
    });
  });

  describe('Cart Lifecycle', () => {
    it('should initialize a new cart', async () => {
      const response = await request(app).post('/api/v1/carts');

      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toMatch(/^cart_/);
      expect(response.body.data.items).toEqual([]);
      expect(response.body.data.subtotal).toBe(0);
      expect(response.body.data.tax).toBe(0);
      expect(response.body.data.total).toBe(0);
    });

    it('should get an empty cart', async () => {
      const cart = await request(app).post('/api/v1/carts');
      const cartId = cart.body.data.id;

      const response = await request(app).get(`/api/v1/carts/${cartId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(cartId);
      expect(response.body.data.items).toEqual([]);
    });

    it('should add a phone to the cart', async () => {
      const cart = await request(app).post('/api/v1/carts');
      const cartId = cart.body.data.id;

      const response = await request(app)
        .post(`/api/v1/carts/${cartId}/items`)
        .send({
          productId: 'phone_iphone15',
          quantity: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].productId).toBe('phone_iphone15');
      expect(response.body.data.items[0].quantity).toBe(1);
      expect(response.body.data.subtotal).toBe(1399.99);
    });

    it('should add multiple items and calculate totals', async () => {
      const cart = await request(app).post('/api/v1/carts');
      const cartId = cart.body.data.id;

      // Add phone
      await request(app).post(`/api/v1/carts/${cartId}/items`).send({
        productId: 'phone_iphone15',
        quantity: 1,
      });

      // Add plan
      await request(app).post(`/api/v1/carts/${cartId}/items`).send({
        productId: 'plan_unlimited',
        quantity: 1,
      });

      // Add addon
      const response = await request(app)
        .post(`/api/v1/carts/${cartId}/items`)
        .send({
          productId: 'addon_insurance',
          quantity: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(3);

      const subtotal = 1399.99 + 85.0 + 12.0;
      const expectedTax = Number((subtotal * 0.13).toFixed(2));
      const expectedTotal = Number((subtotal + expectedTax).toFixed(2));

      expect(response.body.data.subtotal).toBe(subtotal);
      expect(response.body.data.tax).toBe(expectedTax);
      expect(response.body.data.total).toBe(expectedTotal);
    });

    it('should validate cart with phone and plan as valid', async () => {
      const cart = await request(app).post('/api/v1/carts');
      const cartId = cart.body.data.id;

      await request(app).post(`/api/v1/carts/${cartId}/items`).send({
        productId: 'phone_iphone15',
        quantity: 1,
      });

      await request(app).post(`/api/v1/carts/${cartId}/items`).send({
        productId: 'plan_unlimited',
        quantity: 1,
      });

      const response = await request(app).get(
        `/api/v1/carts/${cartId}/validate`
      );

      expect(response.status).toBe(200);
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.errors).toEqual([]);
    });

    it('should update item quantity', async () => {
      const cart = await request(app).post('/api/v1/carts');
      const cartId = cart.body.data.id;

      const addResponse = await request(app)
        .post(`/api/v1/carts/${cartId}/items`)
        .send({
          productId: 'phone_iphone15',
          quantity: 1,
        });

      const itemId = addResponse.body.data.items[0].id;

      const response = await request(app)
        .patch(`/api/v1/carts/${cartId}/items/${itemId}`)
        .send({
          quantity: 2,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.items[0].quantity).toBe(2);
      expect(response.body.data.items[0].totalPrice).toBe(1399.99 * 2);
    });

    it('should remove an item from the cart', async () => {
      const cart = await request(app).post('/api/v1/carts');
      const cartId = cart.body.data.id;

      await request(app).post(`/api/v1/carts/${cartId}/items`).send({
        productId: 'phone_iphone15',
        quantity: 1,
      });

      const addResponse = await request(app)
        .post(`/api/v1/carts/${cartId}/items`)
        .send({
          productId: 'addon_insurance',
          quantity: 1,
        });

      const itemId = addResponse.body.data.items[1].id;

      const response = await request(app).delete(
        `/api/v1/carts/${cartId}/items/${itemId}`
      );

      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].productId).toBe('phone_iphone15');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent cart', async () => {
      const response = await request(app).get('/api/v1/carts/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.title).toContain('does not exist');
    });

    it('should return 400 for invalid product ID when adding item', async () => {
      const cart = await request(app).post('/api/v1/carts');
      const cartId = cart.body.data.id;

      const response = await request(app)
        .post(`/api/v1/carts/${cartId}/items`)
        .send({
          productId: 'non-existent-product',
          quantity: 1,
        });

      expect(response.status).toBe(404);
    });

    it('should return 400 for missing required fields', async () => {
      const cart = await request(app).post('/api/v1/carts');
      const cartId = cart.body.data.id;

      const response = await request(app)
        .post(`/api/v1/carts/${cartId}/items`)
        .send({
          // Missing productId and quantity
        });

      expect(response.status).toBe(400);
      expect(response.body.title).toBe('Validation Error');
    });

    it('should return 400 for invalid quantity', async () => {
      const cart = await request(app).post('/api/v1/carts');
      const cartId = cart.body.data.id;

      const response = await request(app)
        .post(`/api/v1/carts/${cartId}/items`)
        .send({
          productId: 'phone_iphone15',
          quantity: 0,
        });

      expect(response.status).toBe(400);
      expect(response.body.title).toBe('Validation Error');
    });
  });

  describe('Business Rules', () => {
    it('should reject adding a second phone', async () => {
      const cart = await request(app).post('/api/v1/carts');
      const cartId = cart.body.data.id;

      // Add first phone
      await request(app).post(`/api/v1/carts/${cartId}/items`).send({
        productId: 'phone_iphone15',
        quantity: 1,
      });

      // Try to add second phone
      const response = await request(app)
        .post(`/api/v1/carts/${cartId}/items`)
        .send({
          productId: 'phone_samsung_s24',
          quantity: 1,
        });

      expect(response.status).toBe(500);
      expect(response.body.detail).toContain('Only one phone is allowed');
    });

    it('should reject adding a second plan', async () => {
      const cart = await request(app).post('/api/v1/carts');
      const cartId = cart.body.data.id;

      // Add phone first
      await request(app).post(`/api/v1/carts/${cartId}/items`).send({
        productId: 'phone_iphone15',
        quantity: 1,
      });

      // Add first plan
      await request(app).post(`/api/v1/carts/${cartId}/items`).send({
        productId: 'plan_unlimited',
        quantity: 1,
      });

      // Try to add second plan
      const response = await request(app)
        .post(`/api/v1/carts/${cartId}/items`)
        .send({
          productId: 'plan_5gb',
          quantity: 1,
        });

      expect(response.status).toBe(500);
      expect(response.body.detail).toContain('Only one plan is allowed');
    });

    it('should invalidate cart with plan but no phone', async () => {
      const cart = await request(app).post('/api/v1/carts');
      const cartId = cart.body.data.id;

      // Add plan without phone
      await request(app).post(`/api/v1/carts/${cartId}/items`).send({
        productId: 'plan_unlimited',
        quantity: 1,
      });

      const response = await request(app).get(
        `/api/v1/carts/${cartId}/validate`
      );

      expect(response.status).toBe(200);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.errors).toContain(
        'Cart contains plans but no phone. Plans require a phone.'
      );
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app).get('/api/v1/undefined-route');

      expect(response.status).toBe(404);
      expect(response.body.title).toBe('Not Found');
    });
  });
});
