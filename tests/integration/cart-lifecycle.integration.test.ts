/**
 * ============================================================================
 * CART LIFECYCLE - INTEGRATION TESTS
 * ============================================================================
 * Tests for cart CRUD operations and item management
 */

// Mock nanoid with unique IDs
let idCounter = 0;
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => `test-id-${++idCounter}`),
}));

import request from 'supertest';
import { createApp } from '../../src/app';
import { Application } from 'express';

describe('Cart Lifecycle - Integration Tests', () => {
  let app: Application;

  beforeAll(() => {
    app = createApp();
  });

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

    const response = await request(app).get(`/api/v1/carts/${cartId}/validate`);

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
