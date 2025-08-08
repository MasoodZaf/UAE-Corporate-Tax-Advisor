/**
 * Health Check Routes
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import { Router, Request, Response } from 'express';
import { dbConnections } from '../config/database';
import { logger } from '../config/logger';
import { config } from '../config';
import { DocumentService } from '../models/Document';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: System health and monitoring endpoints
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is healthy
 *       503:
 *         description: System is unhealthy
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.environment,
      version: config.server.apiVersion,
    };

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check with dependencies
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed system health information
 *       503:
 *         description: One or more dependencies are unhealthy
 */
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    // Check database connections
    const dbHealth = await dbConnections.healthCheck();
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    };

    // Check CPU usage (basic)
    const cpuUsage = process.cpuUsage();

    // Document processing stats
    let documentStats = null;
    try {
      documentStats = await DocumentService.getProcessingStats();
    } catch (error) {
      logger.warn('Could not fetch document processing stats:', error);
    }

    const health = {
      status: dbHealth.postgresql && dbHealth.mongodb && dbHealth.redis ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.environment,
      version: config.server.apiVersion,
      dependencies: {
        postgresql: {
          status: dbHealth.postgresql ? 'connected' : 'disconnected',
          healthy: dbHealth.postgresql,
        },
        mongodb: {
          status: dbHealth.mongodb ? 'connected' : 'disconnected',
          healthy: dbHealth.mongodb,
        },
        redis: {
          status: dbHealth.redis ? 'connected' : 'disconnected',
          healthy: dbHealth.redis,
        },
      },
      system: {
        memory: memoryUsageMB,
        cpu: cpuUsage,
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      services: {
        documentProcessing: documentStats,
      },
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: health.status === 'healthy',
      data: health
    });

  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Detailed health check failed',
      timestamp: new Date().toISOString(),
      error: config.server.environment === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @swagger
 * /health/readiness:
 *   get:
 *     summary: Readiness probe for Kubernetes
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready to receive traffic
 *       503:
 *         description: Service is not ready
 */
router.get('/readiness', async (req: Request, res: Response) => {
  try {
    // Check critical dependencies
    const dbHealth = await dbConnections.healthCheck();
    
    const isReady = dbHealth.postgresql && dbHealth.mongodb;
    
    if (isReady) {
      res.json({
        success: true,
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        success: false,
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        reason: 'Database connections not available',
      });
    }
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      success: false,
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      reason: 'Readiness check failed',
    });
  }
});

/**
 * @swagger
 * /health/liveness:
 *   get:
 *     summary: Liveness probe for Kubernetes
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 *       503:
 *         description: Service is not responding
 */
router.get('/liveness', (req: Request, res: Response) => {
  // Simple liveness check - just return 200 if the process is running
  res.json({
    success: true,
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * @swagger
 * /health/metrics:
 *   get:
 *     summary: Basic application metrics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Get event loop lag (basic implementation)
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const lag = process.hrtime.bigint() - start;
      
      const metrics = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external,
          heapUsagePercentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
        eventLoop: {
          lag: Number(lag) / 1000000, // Convert to milliseconds
        },
        process: {
          pid: process.pid,
          version: process.version,
          platform: process.platform,
          arch: process.arch,
        },
      };

      res.json({
        success: true,
        data: metrics
      });
    });

  } catch (error) {
    logger.error('Metrics collection failed:', error);
    res.status(500).json({
      success: false,
      message: 'Metrics collection failed',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /health/database:
 *   get:
 *     summary: Database connection status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Database connection status
 */
router.get('/database', async (req: Request, res: Response) => {
  try {
    const dbHealth = await dbConnections.healthCheck();
    
    const allHealthy = Object.values(dbHealth).every(status => status === true);
    
    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      data: {
        timestamp: new Date().toISOString(),
        databases: dbHealth,
        overall_status: allHealthy ? 'healthy' : 'unhealthy',
      }
    });

  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Database health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as healthRoutes };