/**
 * ============================================================================
 * CART BUSINESS RULES - INTEGRATION TESTS
 * ============================================================================
 * Tests for telecom-specific business rule validation
 */

// Mock nanoid with unique IDs
let idCounter = 0;
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => `test-id-${++idCounter}`),
}));

import request from 'supertest';
import { getTestApp } from '../setup/app-instance';

describe('Cart Business Rules - Integration Tests', () => {
  const app = getTestApp();

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

    expect(response.status).toBe(400);
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

    expect(response.status).toBe(400);
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

    const response = await request(app).get(`/api/v1/carts/${cartId}/validate`);

    expect(response.status).toBe(200);
    expect(response.body.data.valid).toBe(false);
    expect(response.body.data.errors).toContain(
      'Cart contains plans but no phone. Plans require a phone.'
    );
  });
});
