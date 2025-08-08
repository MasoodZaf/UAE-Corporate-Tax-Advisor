/**
 * Jest Global Setup
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

export default async (): Promise<void> => {
  console.log('\n🚀 Starting TaxMaster AI Test Suite...');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Timestamp:', new Date().toISOString());
  
  // Set test environment variables if not already set
  if (!process.env.POSTGRES_DB) {
    process.env.POSTGRES_DB = 'taxmaster_ai_test';
  }
  if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/taxmaster_ai_test';
  }
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
  }
  if (!process.env.ENCRYPTION_KEY) {
    process.env.ENCRYPTION_KEY = 'test_encryption_key_32_chars_long';
  }
  
  // Suppress logs during testing unless explicitly enabled
  if (!process.env.ENABLE_TEST_LOGS) {
    process.env.LOG_LEVEL = 'error';
  }
  
  console.log('✅ Global setup completed\n');
};