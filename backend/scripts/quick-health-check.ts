/**
 * Quick Health Check Script
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import chalk from 'chalk';
import { performance } from 'perf_hooks';

interface ServiceCheck {
  name: string;
  status: 'online' | 'offline' | 'warning';
  responseTime?: number;
  error?: string;
  details?: any;
}

class QuickHealthCheck {
  private results: ServiceCheck[] = [];

  constructor() {
    console.log(chalk.blue.bold('\n🏥 TaxMaster AI - Quick Health Check\n'));
  }

  async runChecks(): Promise<void> {
    try {
      await this.checkDatabases();
      await this.checkServer();
      await this.checkSystemResources();
      
      this.printResults();
    } catch (error) {
      console.error(chalk.red('Health check failed:'), error);
      process.exit(1);
    }
  }

  private async checkDatabases(): Promise<void> {
    console.log(chalk.yellow('🗄️  Checking database services...'));

    // Check PostgreSQL
    await this.checkService('PostgreSQL', async () => {
      const { exec } = require('child_process');
      return new Promise((resolve, reject) => {
        exec('pg_isready -h localhost -p 5432', (error: any) => {
          if (error) {
            reject(new Error('PostgreSQL not responding'));
          } else {
            resolve({ version: 'Available' });
          }
        });
      });
    });

    // Check MongoDB
    await this.checkService('MongoDB', async () => {
      const { exec } = require('child_process');
      return new Promise((resolve, reject) => {
        exec('mongosh --eval "db.adminCommand(\'ping\')" --quiet', (error: any, stdout: string) => {
          if (error || !stdout.includes('"ok" : 1')) {
            reject(new Error('MongoDB not responding'));
          } else {
            resolve({ status: 'Available' });
          }
        });
      });
    });

    // Check Redis
    await this.checkService('Redis', async () => {
      const { exec } = require('child_process');
      return new Promise((resolve, reject) => {
        exec('redis-cli ping', (error: any, stdout: string) => {
          if (error || stdout.trim() !== 'PONG') {
            reject(new Error('Redis not responding'));
          } else {
            resolve({ status: 'Available' });
          }
        });
      });
    });
  }

  private async checkServer(): Promise<void> {
    console.log(chalk.yellow('🌐 Checking server status...'));

    await this.checkService('TaxMaster API Server', async () => {
      const axios = require('axios');
      try {
        const response = await axios.get('http://localhost:3000/health', {
          timeout: 5000
        });
        
        return {
          status: response.status,
          uptime: response.data.data?.uptime || 'N/A',
          environment: response.data.data?.environment || 'N/A'
        };
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Server not running on port 3000');
        }
        throw error;
      }
    });
  }

  private async checkSystemResources(): Promise<void> {
    console.log(chalk.yellow('💻 Checking system resources...'));

    // Check memory usage
    await this.checkService('Memory Usage', async () => {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const rssUsedMB = Math.round(memUsage.rss / 1024 / 1024);

      const isMemoryHealthy = heapUsedMB < 500 && rssUsedMB < 1024;

      if (!isMemoryHealthy) {
        throw new Error(`High memory usage: Heap ${heapUsedMB}MB, RSS ${rssUsedMB}MB`);
      }

      return {
        heapUsedMB,
        heapTotalMB,
        rssUsedMB,
        status: 'Healthy'
      };
    });

    // Check disk space
    await this.checkService('Disk Space', async () => {
      const { exec } = require('child_process');
      return new Promise((resolve, reject) => {
        exec('df -h .', (error: any, stdout: string) => {
          if (error) {
            reject(new Error('Could not check disk space'));
          } else {
            const lines = stdout.split('\n');
            const diskLine = lines[1] || lines[0] || '';
            const parts = diskLine.split(/\s+/);
            const available = parts[3] || 'N/A';
            const usage = parts[4] || 'N/A';

            resolve({
              available,
              usage,
              status: 'Available'
            });
          }
        });
      });
    });

    // Check Node.js version
    await this.checkService('Node.js Version', async () => {
      const version = process.version;
      const majorVersion = parseInt(version.slice(1).split('.')[0] || '0');

      if (majorVersion < 18) {
        throw new Error(`Node.js version ${version} is below required minimum (18.x)`);
      }

      return {
        version,
        status: majorVersion >= 18 ? 'Compatible' : 'Outdated'
      };
    });
  }

  private async checkService(name: string, checkFn: () => Promise<any>): Promise<void> {
    const startTime = performance.now();
    
    try {
      const details = await checkFn();
      const responseTime = Math.round(performance.now() - startTime);
      
      this.results.push({
        name,
        status: 'online',
        responseTime,
        details
      });

      console.log(`  ${chalk.green('✅')} ${name} ${chalk.gray(`(${responseTime}ms)`)}`);
      
    } catch (error: any) {
      const responseTime = Math.round(performance.now() - startTime);
      
      this.results.push({
        name,
        status: 'offline',
        responseTime,
        error: error.message
      });

      console.log(`  ${chalk.red('❌')} ${name} ${chalk.gray(`(${responseTime}ms)`)} - ${chalk.red(error.message)}`);
    }
  }

  private printResults(): void {
    const online = this.results.filter(r => r.status === 'online').length;
    const offline = this.results.filter(r => r.status === 'offline').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;

    console.log(chalk.blue('\n📊 Health Check Summary'));
    console.log(chalk.gray('=' .repeat(50)));
    
    console.log(chalk.green(`✅ Online: ${online}`));
    console.log(chalk.red(`❌ Offline: ${offline}`));
    console.log(chalk.yellow(`⚠️  Warnings: ${warnings}`));
    
    const avgResponseTime = this.results.length > 0 
      ? Math.round(this.results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / this.results.length)
      : 0;
    
    console.log(chalk.blue(`⏱️  Avg Response Time: ${avgResponseTime}ms`));

    // Overall status
    if (offline === 0) {
      console.log(chalk.green('\n🎉 System Status: HEALTHY'));
      console.log(chalk.green('All critical services are operational.'));
    } else if (offline <= 2) {
      console.log(chalk.yellow('\n⚠️  System Status: DEGRADED'));
      console.log(chalk.yellow(`${offline} service(s) are offline but system can operate.`));
    } else {
      console.log(chalk.red('\n❌ System Status: CRITICAL'));
      console.log(chalk.red(`${offline} service(s) are offline. System may not function properly.`));
    }

    // Recommendations
    console.log(chalk.blue('\n💡 Recommendations:'));
    
    const offlineServices = this.results.filter(r => r.status === 'offline');
    if (offlineServices.length > 0) {
      offlineServices.forEach(service => {
        switch (service.name) {
          case 'PostgreSQL':
            console.log(chalk.yellow('  - Start PostgreSQL: brew services start postgresql (macOS) or sudo systemctl start postgresql (Linux)'));
            break;
          case 'MongoDB':
            console.log(chalk.yellow('  - Start MongoDB: brew services start mongodb/brew/mongodb-community (macOS) or sudo systemctl start mongod (Linux)'));
            break;
          case 'Redis':
            console.log(chalk.yellow('  - Start Redis: brew services start redis (macOS) or sudo systemctl start redis (Linux)'));
            break;
          case 'TaxMaster API Server':
            console.log(chalk.yellow('  - Start the API server: npm run dev'));
            break;
        }
      });
    } else {
      console.log(chalk.green('  - System is healthy! You can proceed with development.'));
      console.log(chalk.blue('  - Run full tests: npm run test:all'));
      console.log(chalk.blue('  - Start development: npm run dev'));
    }

    console.log('');
  }
}

// Run health check if script is executed directly
if (require.main === module) {
  const healthCheck = new QuickHealthCheck();
  healthCheck.runChecks().catch(error => {
    console.error(chalk.red('Health check failed:'), error);
    process.exit(1);
  });
}

export { QuickHealthCheck };