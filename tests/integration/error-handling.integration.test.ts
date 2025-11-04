/**
 * ============================================================================
 * ERROR HANDLING - INTEGRATION TESTS
 * ============================================================================
 * Tests for API error responses and validation
 */

// Mock nanoid with unique IDs
let idCounter = 0;
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => `test-id-${++idCounter}`),
}));

import request from 'supertest';
import { getTestApp } from '../setup/app-instance';

describe('Error Handling - Integration Tests', () => {
  const app = getTestApp();

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

  it('should return 404 for undefined routes', async () => {
    const response = await request(app).get('/api/v1/undefined-route');

    expect(response.status).toBe(404);
    expect(response.body.title).toBe('Not Found');
  });
});
