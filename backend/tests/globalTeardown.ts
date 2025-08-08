/**
 * Jest Global Teardown
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

export default async (): Promise<void> => {
  console.log('\n🧹 Cleaning up TaxMaster AI Test Suite...');
  
  // Allow time for any pending operations to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('✅ Global teardown completed');
  console.log('Test suite finished at:', new Date().toISOString());
};