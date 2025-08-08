/**
 * Jest Test Setup
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Extend Jest timeout for database operations
jest.setTimeout(30000);

// Mock external services in tests
jest.mock('../src/services/EmailService', () => {
  return {
    EmailService: jest.fn().mockImplementation(() => ({
      sendEmail: jest.fn().mockResolvedValue(true),
      sendEmailVerification: jest.fn().mockResolvedValue(true),
      sendPasswordReset: jest.fn().mockResolvedValue(true),
      sendWelcome: jest.fn().mockResolvedValue(true),
      sendFilingReminder: jest.fn().mockResolvedValue(true),
      sendComplianceAlert: jest.fn().mockResolvedValue(true),
      sendMonthlyReport: jest.fn().mockResolvedValue(true),
    })),
  };
});

// Global test utilities
global.testHelpers = {
  generateRandomEmail: () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
  generateRandomString: (length: number = 10) => Math.random().toString(36).substring(2, length + 2),
  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Console log suppression for tests
if (process.env.SUPPRESS_LOGS === 'true') {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

declare global {
  var testHelpers: {
    generateRandomEmail: () => string;
    generateRandomString: (length?: number) => string;
    sleep: (ms: number) => Promise<void>;
  };
}