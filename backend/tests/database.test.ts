/**
 * Database Connection Tests
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { dbConnections, initializeDatabases, shutdownDatabases } from '../src/config/database';
import { User } from '../src/models/User';
import { Company } from '../src/models/Company';
import { Transaction } from '../src/models/Transaction';
import { DocumentModel, DocumentService } from '../src/models/Document';
import { logger } from '../src/config/logger';

describe('Database Connectivity Tests', () => {
  let testUserId: string;
  let testCompanyId: string;

  beforeAll(async () => {
    await initializeDatabases();
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

  describe('PostgreSQL Connection', () => {
    test('should connect to PostgreSQL successfully', async () => {
      const knex = dbConnections.getPostgreSQL();
      expect(knex).toBeTruthy();
      
      // Test basic query
      const result = await knex.raw('SELECT 1 as test');
      expect(result.rows[0].test).toBe(1);
    });

    test('should perform health check', async () => {
      const health = await dbConnections.healthCheck();
      expect(health.postgresql).toBe(true);
    });

    test('should handle database errors gracefully', async () => {
      const knex = dbConnections.getPostgreSQL();
      
      await expect(
        knex.raw('SELECT * FROM non_existent_table')
      ).rejects.toThrow();
    });
  });

  describe('MongoDB Connection', () => {
    test('should connect to MongoDB successfully', async () => {
      const mongoose = dbConnections.getMongoDB();
      expect(mongoose).toBeTruthy();
      expect(mongoose.connection.readyState).toBe(1); // Connected
    });

    test('should perform health check', async () => {
      const health = await dbConnections.healthCheck();
      expect(health.mongodb).toBe(true);
    });

    test('should handle MongoDB operations', async () => {
      const stats = await DocumentService.getProcessingStats();
      expect(stats).toBeDefined();
      expect(typeof stats.pending).toBe('number');
      expect(typeof stats.processing).toBe('number');
      expect(typeof stats.completed).toBe('number');
      expect(typeof stats.failed).toBe('number');
    });
  });

  describe('Redis Connection', () => {
    test('should connect to Redis successfully', async () => {
      const redis = dbConnections.getRedis();
      expect(redis).toBeTruthy();
      
      // Test basic Redis operation
      await redis.set('test_key', 'test_value', 'EX', 10);
      const value = await redis.get('test_key');
      expect(value).toBe('test_value');
      
      // Cleanup
      await redis.del('test_key');
    });

    test('should perform health check', async () => {
      const health = await dbConnections.healthCheck();
      expect(health.redis).toBe(true);
    });

    test('should handle Redis operations', async () => {
      const redis = dbConnections.getRedis();
      
      // Test various Redis operations
      await redis.hset('test_hash', 'field1', 'value1');
      const hashValue = await redis.hget('test_hash', 'field1');
      expect(hashValue).toBe('value1');
      
      await redis.del('test_hash');
    });
  });

  describe('Model Operations', () => {
    describe('User Model', () => {
      test('should create and retrieve user', async () => {
        const userModel = new User();
        
        const userData = {
          email: 'test@example.com',
          password: 'testpass123',
          first_name: 'Test',
          last_name: 'User',
          preferred_language: 'en' as const
        };

        const user = await userModel.create(userData);
        testUserId = user.id;
        
        expect(user).toBeDefined();
        expect(user.email).toBe('test@example.com');
        expect(user.first_name).toBe('Test');
        expect(user.password_hash).toBeUndefined(); // Should be sanitized
        
        // Test retrieval
        const retrievedUser = await userModel.findById(user.id);
        expect(retrievedUser).toBeDefined();
        expect(retrievedUser?.email).toBe('test@example.com');
      });

      test('should find user by email', async () => {
        const userModel = new User();
        const user = await userModel.findByEmail('test@example.com');
        
        expect(user).toBeDefined();
        expect(user?.email).toBe('test@example.com');
      });

      test('should verify password', async () => {
        const userModel = new User();
        const isValid = await userModel.verifyPassword(testUserId, 'testpass123');
        expect(isValid).toBe(true);
        
        const isInvalid = await userModel.verifyPassword(testUserId, 'wrongpassword');
        expect(isInvalid).toBe(false);
      });
    });

    describe('Company Model', () => {
      test('should create and retrieve company', async () => {
        const companyModel = new Company();
        
        const companyData = {
          name: 'Test Company LLC',
          name_arabic: 'شركة الاختبار ذ.م.م',
          trade_license_number: 'CN-TEST-123456',
          emirates: 'Dubai',
          business_activity: 'Software Development',
          is_free_zone: false,
          annual_revenue: 2500000,
          employee_count: 15
        };

        const company = await companyModel.create(companyData);
        testCompanyId = company.id;
        
        expect(company).toBeDefined();
        expect(company.name).toBe('Test Company LLC');
        expect(company.trade_license_number).toBe('CN-TEST-123456');
        expect(company.subscription_plan).toBe('starter');
        expect(company.fta_registration_status).toBe('pending');
        
        // Test retrieval
        const retrievedCompany = await companyModel.findById(company.id);
        expect(retrievedCompany).toBeDefined();
        expect(retrievedCompany?.name).toBe('Test Company LLC');
      });

      test('should find company by trade license', async () => {
        const companyModel = new Company();
        const company = await companyModel.findByTradeLicense('CN-TEST-123456');
        
        expect(company).toBeDefined();
        expect(company?.name).toBe('Test Company LLC');
      });

      test('should validate subscription limits', async () => {
        const companyModel = new Company();
        const validation = await companyModel.validateSubscriptionLimits(testCompanyId);
        
        expect(validation).toBeDefined();
        expect(validation.isValid).toBe(true); // 2.5M < 5M starter limit
        expect(validation.plan).toBe('starter');
      });
    });

    describe('Transaction Model', () => {
      test('should create and retrieve transaction', async () => {
        const transactionModel = new Transaction();
        
        const transactionData = {
          company_id: testCompanyId,
          transaction_type: 'expense' as const,
          description: 'Test Office Supplies',
          amount: 500.00,
          transaction_date: new Date(),
          source_type: 'manual_entry' as const,
          category: 'office_supplies',
          created_by: testUserId
        };

        const transaction = await transactionModel.create(transactionData);
        
        expect(transaction).toBeDefined();
        expect(transaction.description).toBe('Test Office Supplies');
        expect(transaction.amount).toBe(500.00);
        expect(transaction.currency).toBe('AED');
        expect(transaction.status).toBe('pending');
      });

      test('should find transactions by company', async () => {
        const transactionModel = new Transaction();
        const result = await transactionModel.findByCompany(testCompanyId);
        
        expect(result.transactions).toBeDefined();
        expect(Array.isArray(result.transactions)).toBe(true);
        expect(result.transactions.length).toBeGreaterThan(0);
        expect(result.total).toBeGreaterThan(0);
      });
    });

    describe('Document Model (MongoDB)', () => {
      test('should create and retrieve document', async () => {
        const documentData = {
          companyId: testCompanyId,
          fileName: 'test-receipt.pdf',
          originalFileName: 'receipt-001.pdf',
          fileType: 'receipt' as const,
          mimeType: 'application/pdf',
          fileSize: 150000,
          uploadedBy: testUserId,
          uploadedAt: new Date(),
          status: 'active' as const,
          ocrStatus: 'pending' as const
        };

        const document = new DocumentModel(documentData);
        await document.save();
        
        expect(document).toBeDefined();
        expect(document.fileName).toBe('test-receipt.pdf');
        expect(document.fileType).toBe('receipt');
        
        // Test retrieval
        const retrievedDoc = await DocumentModel.findById(document._id);
        expect(retrievedDoc).toBeDefined();
        expect(retrievedDoc?.fileName).toBe('test-receipt.pdf');
        
        // Cleanup
        await DocumentModel.findByIdAndDelete(document._id);
      });

      test('should find documents by company', async () => {
        const documents = await DocumentModel.find({ 
          companyId: testCompanyId,
          status: 'active'
        });
        
        expect(Array.isArray(documents)).toBe(true);
      });
    });
  });

  describe('Database Performance', () => {
    test('should handle concurrent connections', async () => {
      const promises = [];
      const userModel = new User();
      
      // Create multiple concurrent queries
      for (let i = 0; i < 10; i++) {
        promises.push(
          userModel.findByEmail('test@example.com')
        );
      }
      
      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result?.email).toBe('test@example.com');
      });
    });

    test('should handle large dataset queries', async () => {
      const transactionModel = new Transaction();
      
      // Test pagination with large limits
      const result = await transactionModel.findByCompany(testCompanyId, {}, {
        page: 1,
        limit: 1000
      });
      
      expect(result).toBeDefined();
      expect(typeof result.total).toBe('number');
      expect(Array.isArray(result.transactions)).toBe(true);
    });

    test('should handle complex queries efficiently', async () => {
      const startTime = Date.now();
      
      const userModel = new User();
      const stats = await userModel.getStatistics();
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(stats).toBeDefined();
      expect(queryTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Data Integrity', () => {
    test('should enforce unique constraints', async () => {
      const userModel = new User();
      
      const duplicateUserData = {
        email: 'test@example.com', // Same as existing user
        password: 'testpass123',
        first_name: 'Duplicate',
        last_name: 'User',
        preferred_language: 'en' as const
      };

      await expect(userModel.create(duplicateUserData))
        .rejects.toThrow();
    });

    test('should validate required fields', async () => {
      const companyModel = new Company();
      
      const invalidCompanyData = {
        // Missing required fields
        name: 'Invalid Company'
        // trade_license_number is required but missing
      } as any;

      await expect(companyModel.create(invalidCompanyData))
        .rejects.toThrow();
    });

    test('should handle foreign key constraints', async () => {
      const transactionModel = new Transaction();
      
      const invalidTransactionData = {
        company_id: 'non-existent-company-id',
        transaction_type: 'expense' as const,
        description: 'Invalid Transaction',
        amount: 100.00,
        transaction_date: new Date(),
        source_type: 'manual_entry' as const
      };

      await expect(transactionModel.create(invalidTransactionData))
        .rejects.toThrow();
    });
  });

  describe('Transaction Management', () => {
    test('should handle database transactions', async () => {
      const userModel = new User();
      const knex = dbConnections.getPostgreSQL()!;
      
      await expect(
        knex.transaction(async (trx) => {
          // Create user within transaction
          const user = await userModel.insert({
            email: 'transaction-test@example.com',
            first_name: 'Transaction',
            last_name: 'Test',
            preferred_language: 'en'
          });
          
          // Simulate error to trigger rollback
          throw new Error('Rollback test');
          
          return user;
        })
      ).rejects.toThrow('Rollback test');
      
      // Verify user was not created due to rollback
      const user = await userModel.findByEmail('transaction-test@example.com');
      expect(user).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('should handle connection timeouts gracefully', async () => {
      // This test simulates network issues
      const knex = dbConnections.getPostgreSQL()!;
      
      // Test with a very short timeout
      await expect(
        knex.raw('SELECT pg_sleep(0.1)').timeout(10)
      ).rejects.toThrow();
    });

    test('should handle malformed queries', async () => {
      const knex = dbConnections.getPostgreSQL()!;
      
      await expect(
        knex.raw('INVALID SQL QUERY')
      ).rejects.toThrow();
    });

    test('should handle MongoDB connection errors', async () => {
      // Create document with invalid schema
      const invalidDoc = new DocumentModel({
        // Missing required fields
        fileName: null,
        uploadedBy: null
      });
      
      await expect(invalidDoc.save()).rejects.toThrow();
    });
  });
});

// Helper function to generate test data
export const generateTestData = {
  user: (overrides: any = {}) => ({
    email: `test-${Date.now()}@example.com`,
    password: 'testpass123',
    first_name: 'Test',
    last_name: 'User',
    preferred_language: 'en' as const,
    ...overrides
  }),
  
  company: (overrides: any = {}) => ({
    name: `Test Company ${Date.now()}`,
    trade_license_number: `CN-TEST-${Date.now()}`,
    emirates: 'Dubai',
    business_activity: 'Software Development',
    is_free_zone: false,
    ...overrides
  }),
  
  transaction: (companyId: string, overrides: any = {}) => ({
    company_id: companyId,
    transaction_type: 'expense' as const,
    description: 'Test Transaction',
    amount: 100.00,
    transaction_date: new Date(),
    source_type: 'manual_entry' as const,
    ...overrides
  })
};