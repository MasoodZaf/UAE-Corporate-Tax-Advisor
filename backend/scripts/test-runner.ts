/**
 * Test Runner Script
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import { spawn } from 'child_process';
import chalk from 'chalk';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
}

class TestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  constructor() {
    console.log(chalk.blue.bold('\n🧪 TaxMaster AI - Comprehensive Test Suite\n'));
    console.log(chalk.gray('=' .repeat(60)));
  }

  async runAllTests(): Promise<void> {
    this.startTime = Date.now();

    try {
      // 1. Database Connection Tests
      await this.runTest('Database Connectivity', 'npm run test:db');
      
      // 2. API Endpoint Tests
      await this.runTest('API Endpoints', 'npm run test:api');
      
      // 3. Security Tests
      await this.runTest('Security & Validation', 'npm run test:security');
      
      // 4. Performance Tests
      await this.runTest('Performance', 'npm run test:performance');
      
      // 5. Integration Tests
      await this.runTest('Integration', 'npm run test:integration');
      
      this.printSummary();
      
    } catch (error) {
      console.error(chalk.red('❌ Test suite failed with error:'), error);
      process.exit(1);
    }
  }

  private async runTest(testName: string, command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(chalk.yellow(`\n📋 Running ${testName} Tests...`));
      const startTime = Date.now();
      
      const [cmd, ...args] = command.split(' ');
      const child = spawn(cmd, args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });

      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        
        if (code === 0) {
          this.results.push({
            name: testName,
            status: 'pass',
            duration
          });
          console.log(chalk.green(`✅ ${testName} tests passed (${duration}ms)`));
        } else {
          this.results.push({
            name: testName,
            status: 'fail',
            duration,
            error: stderr || stdout
          });
          console.log(chalk.red(`❌ ${testName} tests failed (${duration}ms)`));
        }
        
        resolve();
      });

      child.on('error', (error) => {
        this.results.push({
          name: testName,
          status: 'fail',
          duration: Date.now() - startTime,
          error: error.message
        });
        console.log(chalk.red(`❌ ${testName} tests error: ${error.message}`));
        resolve();
      });
    });
  }

  private printSummary(): void {
    const totalTime = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;

    console.log(chalk.blue('\n📊 Test Summary'));
    console.log(chalk.gray('=' .repeat(60)));
    
    this.results.forEach(result => {
      const status = result.status === 'pass' 
        ? chalk.green('✅ PASS') 
        : result.status === 'fail'
        ? chalk.red('❌ FAIL')
        : chalk.yellow('⏭️ SKIP');
      
      console.log(`${status} ${result.name} (${result.duration}ms)`);
      
      if (result.error && result.status === 'fail') {
        console.log(chalk.red(`   Error: ${result.error.slice(0, 100)}...`));
      }
    });

    console.log(chalk.gray('\n' + '=' .repeat(60)));
    console.log(chalk.blue(`Total Tests: ${this.results.length}`));
    console.log(chalk.green(`Passed: ${passed}`));
    console.log(chalk.red(`Failed: ${failed}`));
    console.log(chalk.yellow(`Skipped: ${skipped}`));
    console.log(chalk.blue(`Total Time: ${totalTime}ms`));

    if (failed > 0) {
      console.log(chalk.red('\n❌ Some tests failed. Please check the output above.'));
      process.exit(1);
    } else {
      console.log(chalk.green('\n🎉 All tests passed successfully!'));
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch(console.error);
}