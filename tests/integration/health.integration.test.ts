/**
 * ============================================================================
 * HEALTH ENDPOINT - INTEGRATION TESTS
 * ============================================================================
 */

// Mock nanoid with unique IDs
let idCounter = 0;
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => `test-id-${++idCounter}`),
}));

import request from 'supertest';
import { getTestApp } from '../setup/app-instance';

describe('Health Endpoint - Integration Tests', () => {
  const app = getTestApp();

  it('should return 200 for health endpoint', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });
});
