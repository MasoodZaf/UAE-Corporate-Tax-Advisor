/**
 * API Endpoint Tests
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { Server } from '../src/server';
import { initializeDatabases, shutdownDatabases } from '../src/config/database';
import { User } from '../src/models/User';
import { Company } from '../src/models/Company';

describe('API Endpoint Tests', () => {
  let app: any;
  let server: Server;
  let authToken: string;
  let refreshToken: string;
  let testUserId: string;
  let testCompanyId: string;
  
  beforeAll(async () => {
    // Initialize databases
    await initializeDatabases();
    
    // Create server instance
    server = new Server();
    app = (server as any).app; // Access the Express app for testing
    
    // Wait a bit for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUserId) {
      const userModel = new User();
      await userModel.delete(testUserId);
    }
    if (testCompanyId) {
      const companyModel = new Company();
      await companyModel.delete(testCompanyId);
    }
    
    await shutdownDatabases();
  });

  describe('Health Check Endpoints', () => {
    test('GET /health - should return basic health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.timestamp).toBeDefined();
      expect(response.body.data.uptime).toBeDefined();
      expect(response.body.data.environment).toBeDefined();
    });

    test('GET /health/detailed - should return detailed health information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.dependencies).toBeDefined();
      expect(response.body.data.dependencies.postgresql).toBeDefined();
      expect(response.body.data.dependencies.mongodb).toBeDefined();
      expect(response.body.data.dependencies.redis).toBeDefined();
      expect(response.body.data.system).toBeDefined();
      expect(response.body.data.system.memory).toBeDefined();
      expect(response.body.data.system.cpu).toBeDefined();
    });

    test('GET /health/readiness - should return readiness status', async () => {
      const response = await request(app)
        .get('/health/readiness')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('ready');
    });

    test('GET /health/liveness - should return liveness status', async () => {
      const response = await request(app)
        .get('/health/liveness')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('alive');
    });

    test('GET /health/metrics - should return system metrics', async () => {
      const response = await request(app)
        .get('/health/metrics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.memory).toBeDefined();
      expect(response.body.data.cpu).toBeDefined();
      expect(response.body.data.uptime).toBeDefined();
    });

    test('GET /health/database - should return database status', async () => {
      const response = await request(app)
        .get('/health/database')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.databases).toBeDefined();
      expect(response.body.data.overall_status).toBe('healthy');
    });
  });

  describe('Authentication Endpoints', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'testPassword123',
      first_name: 'Test',
      last_name: 'User',
      phone: '+971501234567',
      preferred_language: 'en'
    };

    test('POST /api/v1/auth/register - should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registered successfully');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.first_name).toBe(testUser.first_name);
      expect(response.body.data.user.is_verified).toBe(false);
      
      testUserId = response.body.data.user.id;
    });

    test('POST /api/v1/auth/register - should fail with duplicate email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('USER_EXISTS');
    });

    test('POST /api/v1/auth/register - should validate required fields', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: '123', // Too short
        first_name: '', // Empty
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    test('POST /api/v1/auth/login - should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('successful');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.access_token).toBeDefined();
      expect(response.body.data.tokens.refresh_token).toBeDefined();
      
      authToken = response.body.data.tokens.access_token;
      refreshToken = response.body.data.tokens.refresh_token;
    });

    test('POST /api/v1/auth/login - should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    test('POST /api/v1/auth/login - should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'somepassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    test('GET /api/v1/auth/profile - should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.companies).toBeDefined();
    });

    test('GET /api/v1/auth/profile - should fail without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('TOKEN_REQUIRED');
    });

    test('GET /api/v1/auth/profile - should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_TOKEN');
    });

    test('POST /api/v1/auth/refresh - should refresh tokens', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refresh_token: refreshToken
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.access_token).toBeDefined();
      expect(response.body.data.tokens.refresh_token).toBeDefined();
      
      // Update tokens for subsequent tests
      authToken = response.body.data.tokens.access_token;
      refreshToken = response.body.data.tokens.refresh_token;
    });

    test('POST /api/v1/auth/refresh - should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refresh_token: 'invalid.refresh.token'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('TOKEN_REFRESH_ERROR');
    });

    test('POST /api/v1/auth/change-password - should change password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          current_password: testUser.password,
          new_password: 'newPassword123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('changed successfully');
      
      // Update password for subsequent tests
      testUser.password = 'newPassword123';
    });

    test('POST /api/v1/auth/change-password - should fail with wrong current password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          current_password: 'wrongcurrentpassword',
          new_password: 'newPassword456'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_CURRENT_PASSWORD');
    });

    test('POST /api/v1/auth/forgot-password - should send reset email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: testUser.email
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reset link');
    });

    test('POST /api/v1/auth/logout - should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('successful');
    });
  });

  describe('API Root Endpoints', () => {
    test('GET / - should return API info', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('TaxMaster AI API');
      expect(response.body.version).toBeDefined();
      expect(response.body.environment).toBeDefined();
    });

    test('GET /api/v1 - should return API endpoints', async () => {
      const response = await request(app)
        .get('/api/v1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.endpoints).toBeDefined();
      expect(Array.isArray(response.body.endpoints)).toBe(true);
    });

    test('GET /api/v1/nonexistent - should return 404', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('NOT_FOUND');
    });
  });

  describe('Placeholder Endpoints', () => {
    // Re-login for authenticated tests
    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'newPassword123'
        });
      
      authToken = loginResponse.body.data.tokens.access_token;
    });

    test('GET /api/v1/users - should require admin access', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    test('GET /api/v1/companies - should return placeholder', async () => {
      const response = await request(app)
        .get('/api/v1/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Coming soon');
    });

    test('GET /api/v1/transactions - should return placeholder', async () => {
      const response = await request(app)
        .get('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Coming soon');
    });

    test('GET /api/v1/documents - should return placeholder', async () => {
      const response = await request(app)
        .get('/api/v1/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Coming soon');
    });
  });

  describe('Security Tests', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check for security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('0');
    });

    test('should handle CORS correctly', async () => {
      const response = await request(app)
        .options('/api/v1/auth/profile')
        .set('Origin', 'http://localhost:3001')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });

    test('should enforce rate limiting', async () => {
      // This test might need adjustment based on rate limit configuration
      const promises = [];
      
      for (let i = 0; i < 150; i++) { // Exceed rate limit
        promises.push(
          request(app)
            .get('/health')
        );
      }

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      // Should have some rate limited responses if limit is working
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('should sanitize error responses in production', async () => {
      // Test with malformed JSON
      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.success).toBe(false);
      // Should not expose internal error details
      expect(response.body.stack).toBeUndefined();
    });
  });

  describe('Input Validation Tests', () => {
    test('should validate email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: 'validpassword123',
          first_name: 'Test',
          last_name: 'User'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test2@example.com',
          password: '123', // Too short
          first_name: 'Test',
          last_name: 'User'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test3@example.com',
          password: 'validpassword123'
          // Missing first_name and last_name
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should handle XSS attempts', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'xss@example.com',
          password: 'validpassword123',
          first_name: xssPayload,
          last_name: 'User'
        })
        .expect(400);

      // Should be rejected due to validation, but if it passes,
      // the response should not contain the raw script
      if (response.status === 201) {
        expect(response.body.data.user.first_name).not.toContain('<script>');
      }
    });

    test('should handle SQL injection attempts', async () => {
      const sqlPayload = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: sqlPayload,
          password: 'anypassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      // Should not cause a server error
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ malformed json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle missing Content-Type', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send('email=test@example.com&password=test')
        .expect(401); // Should still process as form data

      expect(response.body.success).toBe(false);
    });

    test('should handle oversized requests', async () => {
      const largePayload = 'x'.repeat(20 * 1024 * 1024); // 20MB
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'large@example.com',
          password: 'validpassword123',
          first_name: largePayload,
          last_name: 'User'
        });

      // Should be rejected due to size limit
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Performance Tests', () => {
    test('should respond to health checks quickly', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/health')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    test('should handle concurrent requests', async () => {
      const promises = [];
      const concurrentRequests = 20;
      
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .get('/health')
            .expect(200)
        );
      }
      
      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      expect(responses.length).toBe(concurrentRequests);
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });
      
      // All concurrent requests should complete within reasonable time
      expect(totalTime).toBeLessThan(5000);
    });

    test('should handle authentication requests efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'newPassword123'
        })
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(2000); // Should authenticate within 2 seconds
      expect(response.body.success).toBe(true);
    });
  });
});