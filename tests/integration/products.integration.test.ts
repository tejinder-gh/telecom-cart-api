/**
 * ============================================================================
 * PRODUCTS API - INTEGRATION TESTS
 * ============================================================================
 */

// Mock nanoid with unique IDs
let idCounter = 0;
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => `test-id-${++idCounter}`),
}));

import request from 'supertest';
import { getTestApp } from '../setup/app-instance';

describe('Products API - Integration Tests', () => {
  const app = getTestApp();

  it('should get all products', async () => {
    const response = await request(app).get('/api/v1/products');

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data).toHaveLength(6);
    expect(response.body.meta).toBeDefined();
    expect(response.body.meta.version).toBe('v1');
  });

  it('should get a specific product', async () => {
    const response = await request(app).get('/api/v1/products/phone_iphone15');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('phone_iphone15');
    expect(response.body.data.name).toBe('iPhone 15 Pro');
    expect(response.body.data.type).toBe('PHONE');
    expect(response.body.data.price).toBe(1399.99);
  });

  it('should return 404 for non-existent product', async () => {
    const response = await request(app).get('/api/v1/products/non-existent');

    expect(response.status).toBe(404);
    expect(response.body.title).toBe('Not Found');
  });
});
