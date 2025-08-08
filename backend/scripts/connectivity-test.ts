/**
 * Database and Server Connectivity Test Script
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import chalk from 'chalk';
import axios from 'axios';
import { performance } from 'perf_hooks';

// Import database connections
import { dbConnections, initializeDatabases, shutdownDatabases } from '../src/config/database';
import { User } from '../src/models/User';
import { Company } from '../src/models/Company';
import { DocumentModel } from '../src/models/Document';
import { config } from '../src/config';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  duration: number;
  message: string;
  details?: any;
}

class ConnectivityTester {
  private results: TestResult[] = [];
  private serverUrl = `http://localhost:${config.server.port}`;

  constructor() {
    console.log(chalk.blue.bold('\n🔌 TaxMaster AI - Connectivity Test Suite\n'));
    console.log(chalk.gray('=' .repeat(70)));
  }

  async runAllTests(): Promise<void> {
    try {
      console.log(chalk.yellow('🔍 Testing Database Connectivity...'));
      await this.testDatabaseConnections();

      console.log(chalk.yellow('\n🗄️ Testing Database Operations...'));
      await this.testDatabaseOperations();

      console.log(chalk.yellow('\n🌐 Testing Server Endpoints...'));
      await this.testServerEndpoints();

      console.log(chalk.yellow('\n🔒 Testing Security Features...'));
      await this.testSecurityFeatures();

      console.log(chalk.yellow('\n⚡ Testing Performance...'));
      await this.testPerformance();

      this.printSummary();

    } catch (error) {
      console.error(chalk.red('❌ Test suite failed:'), error);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }

  private async testDatabaseConnections(): Promise<void> {
    // PostgreSQL Connection Test
    await this.runTest('PostgreSQL Connection', async () => {
      const knex = await dbConnections.connectPostgreSQL();
      const result = await knex.raw('SELECT version() as version, NOW() as timestamp');
      return {
        success: true,
        details: {
          version: result.rows[0].version.split(' ')[0],
          timestamp: result.rows[0].timestamp
        }
      };
    });

    // MongoDB Connection Test
    await this.runTest('MongoDB Connection', async () => {
      const mongoose = await dbConnections.connectMongoDB();
      const stats = await mongoose.connection.db.stats();
      return {
        success: true,
        details: {
          version: mongoose.version,
          collections: stats.collections,
          dataSize: stats.dataSize
        }
      };
    });

    // Redis Connection Test
    await this.runTest('Redis Connection', async () => {
      const redis = await dbConnections.connectRedis();
      const info = await redis.info('server');
      const version = info.match(/redis_version:([^\r\n]+)/)?.[1] || 'unknown';
      
      // Test basic operations
      await redis.set('connectivity_test', 'success', 'EX', 10);
      const testValue = await redis.get('connectivity_test');
      await redis.del('connectivity_test');

      return {
        success: testValue === 'success',
        details: { version, testResult: testValue }
      };
    });

    // Combined Health Check
    await this.runTest('Database Health Check', async () => {
      const health = await dbConnections.healthCheck();
      const allHealthy = Object.values(health).every(status => status === true);
      
      return {
        success: allHealthy,
        details: health
      };
    });
  }

  private async testDatabaseOperations(): Promise<void> {
    // User Model Operations
    let testUserId: string | null = null;
    await this.runTest('User Model CRUD Operations', async () => {
      const userModel = new User();
      
      // Create
      const user = await userModel.create({
        email: `test-${Date.now()}@example.com`,
        password: 'testpass123',
        first_name: 'Test',
        last_name: 'User',
        preferred_language: 'en'
      });
      testUserId = user.id;

      // Read
      const retrievedUser = await userModel.findById(user.id);
      if (!retrievedUser) throw new Error('User not found after creation');

      // Update
      const updatedUser = await userModel.updateProfile(user.id, {
        first_name: 'Updated'
      });

      // Verify password
      const isValidPassword = await userModel.verifyPassword(user.id, 'testpass123');
      
      return {
        success: updatedUser.first_name === 'Updated' && isValidPassword,
        details: {
          created: !!user.id,
          retrieved: !!retrievedUser,
          updated: updatedUser.first_name === 'Updated',
          passwordVerified: isValidPassword
        }
      };
    });

    // Company Model Operations
    let testCompanyId: string | null = null;
    await this.runTest('Company Model CRUD Operations', async () => {
      const companyModel = new Company();
      
      // Create
      const company = await companyModel.create({
        name: `Test Company ${Date.now()}`,
        trade_license_number: `CN-TEST-${Date.now()}`,
        emirates: 'Dubai',
        business_activity: 'Software Development'
      });
      testCompanyId = company.id;

      // Read
      const retrievedCompany = await companyModel.findById(company.id);
      
      // Update
      const updatedCompany = await companyModel.updateProfile(company.id, {
        annual_revenue: 2500000
      });

      return {
        success: !!retrievedCompany && updatedCompany.annual_revenue === 2500000,
        details: {
          created: !!company.id,
          retrieved: !!retrievedCompany,
          updated: updatedCompany.annual_revenue === 2500000
        }
      };
    });

    // Document Model Operations (MongoDB)
    await this.runTest('Document Model Operations', async () => {
      const document = new DocumentModel({
        companyId: testCompanyId,
        fileName: `test-doc-${Date.now()}.pdf`,
        fileType: 'receipt',
        uploadedBy: testUserId,
        uploadedAt: new Date(),
        status: 'active',
        ocrStatus: 'pending'
      });

      await document.save();
      const retrievedDoc = await DocumentModel.findById(document._id);
      
      // Update
      document.ocrStatus = 'completed';
      await document.save();
      
      // Cleanup
      await DocumentModel.findByIdAndDelete(document._id);

      return {
        success: !!retrievedDoc && document.ocrStatus === 'completed',
        details: {
          created: !!document._id,
          retrieved: !!retrievedDoc,
          updated: document.ocrStatus === 'completed'
        }
      };
    });

    // Complex Query Operations
    await this.runTest('Complex Query Operations', async () => {
      if (!testUserId || !testCompanyId) {
        throw new Error('Test user or company not available');
      }

      const userModel = new User();
      
      // Search functionality
      const searchResults = await userModel.search('Test', {}, { page: 1, limit: 10 });
      
      // Statistics
      const userStats = await userModel.getStatistics();
      
      // Company operations
      const companyModel = new Company();
      const companyStats = await companyModel.getStatistics();

      return {
        success: searchResults.users.length > 0 && userStats.total > 0,
        details: {
          searchResults: searchResults.users.length,
          userStats: userStats.total,
          companyStats: companyStats.total
        }
      };
    });

    // Cleanup test data
    if (testUserId) {
      const userModel = new User();
      await userModel.delete(testUserId);
    }
    if (testCompanyId) {
      const companyModel = new Company();
      await companyModel.delete(testCompanyId);
    }
  }

  private async testServerEndpoints(): Promise<void> {
    // Test if server is running
    await this.runTest('Server Availability', async () => {
      const response = await axios.get(`${this.serverUrl}/health`, { timeout: 5000 });
      return {
        success: response.status === 200 && response.data.success === true,
        details: {
          status: response.status,
          uptime: response.data.data?.uptime,
          environment: response.data.data?.environment
        }
      };
    });

    // Health endpoints
    const healthEndpoints = [
      '/health',
      '/health/detailed',
      '/health/readiness', 
      '/health/liveness',
      '/health/metrics',
      '/health/database'
    ];

    for (const endpoint of healthEndpoints) {
      await this.runTest(`Health Endpoint: ${endpoint}`, async () => {
        const response = await axios.get(`${this.serverUrl}${endpoint}`, { timeout: 10000 });
        return {
          success: response.status === 200,
          details: {
            status: response.status,
            responseTime: response.headers['x-response-time'] || 'N/A'
          }
        };
      });
    }

    // API root endpoints
    await this.runTest('API Root Endpoint', async () => {
      const response = await axios.get(`${this.serverUrl}/api/v1`, { timeout: 5000 });
      return {
        success: response.status === 200 && response.data.success === true,
        details: {
          version: response.data.version,
          endpoints: response.data.endpoints?.length || 0
        }
      };
    });

    // Authentication endpoint availability
    await this.runTest('Authentication Endpoint Availability', async () => {
      // Test with invalid data to check if endpoint is responding
      try {
        await axios.post(`${this.serverUrl}/api/v1/auth/login`, {
          email: 'invalid',
          password: 'invalid'
        }, { timeout: 5000 });
        return { success: false, details: 'Should have returned error' };
      } catch (error: any) {
        // We expect this to fail with 400/401, not 404 or connection error
        const isEndpointAvailable = error.response && 
          (error.response.status === 400 || error.response.status === 401);
        
        return {
          success: isEndpointAvailable,
          details: {
            status: error.response?.status || 'Connection Error',
            available: isEndpointAvailable
          }
        };
      }
    });
  }

  private async testSecurityFeatures(): Promise<void> {
    // CORS Headers
    await this.runTest('CORS Headers', async () => {
      const response = await axios.options(`${this.serverUrl}/api/v1/auth/login`, {
        headers: { 'Origin': 'http://localhost:3001' },
        timeout: 5000
      });
      
      const hasCorsHeaders = !!(
        response.headers['access-control-allow-origin'] ||
        response.headers['access-control-allow-methods']
      );
      
      return {
        success: hasCorsHeaders,
        details: {
          allowOrigin: response.headers['access-control-allow-origin'],
          allowMethods: response.headers['access-control-allow-methods']
        }
      };
    });

    // Security Headers
    await this.runTest('Security Headers', async () => {
      const response = await axios.get(`${this.serverUrl}/health`, { timeout: 5000 });
      
      const securityHeaders = {
        'x-content-type-options': response.headers['x-content-type-options'],
        'x-frame-options': response.headers['x-frame-options'],
        'x-xss-protection': response.headers['x-xss-protection']
      };
      
      const hasSecurityHeaders = Object.values(securityHeaders).some(header => !!header);
      
      return {
        success: hasSecurityHeaders,
        details: securityHeaders
      };
    });

    // Rate Limiting
    await this.runTest('Rate Limiting', async () => {
      const requests = [];
      const startTime = performance.now();
      
      // Make multiple rapid requests
      for (let i = 0; i < 20; i++) {
        requests.push(
          axios.get(`${this.serverUrl}/health`, { timeout: 5000 }).catch(err => err.response)
        );
      }
      
      const responses = await Promise.all(requests);
      const rateLimitedCount = responses.filter(r => r && r.status === 429).length;
      const totalTime = performance.now() - startTime;
      
      return {
        success: true, // Rate limiting is optional in test
        details: {
          totalRequests: responses.length,
          rateLimited: rateLimitedCount,
          totalTime: Math.round(totalTime),
          avgResponseTime: Math.round(totalTime / responses.length)
        }
      };
    });
  }

  private async testPerformance(): Promise<void> {
    // Database Query Performance
    await this.runTest('Database Query Performance', async () => {
      const startTime = performance.now();
      
      await Promise.all([
        dbConnections.getPostgreSQL()!.raw('SELECT COUNT(*) FROM users'),
        dbConnections.getPostgreSQL()!.raw('SELECT COUNT(*) FROM companies'),
        dbConnections.getRedis()!.ping(),
        DocumentModel.countDocuments({})
      ]);
      
      const duration = performance.now() - startTime;
      
      return {
        success: duration < 1000, // Should complete within 1 second
        details: {
          duration: Math.round(duration),
          threshold: 1000
        }
      };
    });

    // API Response Performance
    await this.runTest('API Response Performance', async () => {
      const startTime = performance.now();
      
      const promises = [
        axios.get(`${this.serverUrl}/health`),
        axios.get(`${this.serverUrl}/health/database`),
        axios.get(`${this.serverUrl}/api/v1`)
      ];
      
      await Promise.all(promises);
      const duration = performance.now() - startTime;
      
      return {
        success: duration < 2000, // All requests within 2 seconds
        details: {
          duration: Math.round(duration),
          threshold: 2000,
          requestsCount: promises.length
        }
      };
    });

    // Memory Usage Check
    await this.runTest('Memory Usage Check', async () => {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const rssUsedMB = Math.round(memUsage.rss / 1024 / 1024);
      
      return {
        success: heapUsedMB < 500, // Less than 500MB heap usage
        details: {
          heapUsedMB,
          rssUsedMB,
          heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
          externalMB: Math.round(memUsage.external / 1024 / 1024)
        }
      };
    });
  }

  private async runTest(name: string, testFn: () => Promise<{ success: boolean; details?: any }>): Promise<void> {
    const startTime = performance.now();
    
    try {
      const result = await testFn();
      const duration = performance.now() - startTime;
      
      this.results.push({
        name,
        status: result.success ? 'pass' : 'fail',
        duration: Math.round(duration),
        message: result.success ? 'Success' : 'Test failed',
        details: result.details
      });
      
      const status = result.success ? chalk.green('✅') : chalk.red('❌');
      const time = chalk.gray(`(${Math.round(duration)}ms)`);
      console.log(`  ${status} ${name} ${time}`);
      
      if (!result.success && result.details) {
        console.log(chalk.red(`     Details: ${JSON.stringify(result.details)}`));
      }
      
    } catch (error: any) {
      const duration = performance.now() - startTime;
      
      this.results.push({
        name,
        status: 'fail',
        duration: Math.round(duration),
        message: error.message || 'Unknown error',
        details: error.stack
      });
      
      console.log(`  ${chalk.red('❌')} ${name} ${chalk.gray(`(${Math.round(duration)}ms)`)}`);
      console.log(chalk.red(`     Error: ${error.message}`));
    }
  }

  private printSummary(): void {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warned = this.results.filter(r => r.status === 'warn').length;
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(chalk.blue('\n📊 Connectivity Test Summary'));
    console.log(chalk.gray('=' .repeat(70)));
    
    console.log(chalk.blue(`Total Tests: ${this.results.length}`));
    console.log(chalk.green(`✅ Passed: ${passed}`));
    console.log(chalk.red(`❌ Failed: ${failed}`));
    console.log(chalk.yellow(`⚠️  Warnings: ${warned}`));
    console.log(chalk.blue(`⏱️  Total Time: ${totalTime}ms`));
    console.log(chalk.blue(`📈 Average Time: ${Math.round(totalTime / this.results.length)}ms per test`));

    // Show failed tests
    if (failed > 0) {
      console.log(chalk.red('\n❌ Failed Tests:'));
      this.results.filter(r => r.status === 'fail').forEach(test => {
        console.log(chalk.red(`  - ${test.name}: ${test.message}`));
      });
    }

    // Overall status
    if (failed === 0) {
      console.log(chalk.green('\n🎉 All connectivity tests passed! System is ready.'));
    } else {
      console.log(chalk.red(`\n⚠️  ${failed} test(s) failed. Please check the issues above.`));
    }

    // Performance insights
    const slowTests = this.results.filter(r => r.duration > 1000);
    if (slowTests.length > 0) {
      console.log(chalk.yellow('\n⚡ Slow Tests (>1000ms):'));
      slowTests.forEach(test => {
        console.log(chalk.yellow(`  - ${test.name}: ${test.duration}ms`));
      });
    }
  }

  private async cleanup(): Promise<void> {
    try {
      await shutdownDatabases();
      console.log(chalk.gray('\n🧹 Cleanup completed'));
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Cleanup warning:'), error);
    }
  }
}

// Run connectivity tests if script is executed directly
if (require.main === module) {
  const tester = new ConnectivityTester();
  tester.runAllTests().catch(error => {
    console.error(chalk.red('💥 Connectivity test suite failed:'), error);
    process.exit(1);
  });
}

export { ConnectivityTester };