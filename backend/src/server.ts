/**
 * Server Entry Point
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config, validateConfig } from './config';
import { initializeDatabases, shutdownDatabases } from './config/database';
import { logger, morganStream } from './config/logger';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { companyRoutes } from './routes/companies';
import { transactionRoutes } from './routes/transactions';
import { documentRoutes } from './routes/documents';
import { healthRoutes } from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import morgan from 'morgan';

class Server {
  private app: express.Application;
  private server: any;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    if (config.security.helmetEnabled) {
      this.app.use(helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
          },
        },
        crossOriginEmbedderPolicy: false,
      }));
    }

    // CORS
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Compression
    if (config.security.compressionEnabled) {
      this.app.use(compression());
    }

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      skip: (_req, res) => {
        return config.rateLimit.skipSuccessful && res.statusCode < 400;
      },
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.app.use(limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(morgan('combined', { stream: morganStream }));

    // Trust proxy
    if (config.server.trustProxy) {
      this.app.set('trust proxy', 1);
    }

    // Request ID middleware
    this.app.use((req: any, res, next) => {
      req.id = Math.random().toString(36).substr(2, 9);
      res.setHeader('X-Request-ID', req.id);
      next();
    });

    // Request timeout
    this.app.use((req, res, next) => {
      res.setTimeout(30000, () => {
        logger.warn('Request timeout', {
          url: req.url,
          method: req.method,
          ip: req.ip,
        });
        res.status(408).json({
          success: false,
          message: 'Request timeout',
          code: 'REQUEST_TIMEOUT'
        });
      });
      next();
    });
  }

  private setupRoutes(): void {
    // API version prefix
    const apiPrefix = `/api/${config.server.apiVersion}`;

    // Health check (no prefix)
    this.app.use('/health', healthRoutes);
    this.app.use('/api/health', healthRoutes);

    // API routes
    this.app.use(`${apiPrefix}/auth`, authRoutes);
    this.app.use(`${apiPrefix}/users`, userRoutes);
    this.app.use(`${apiPrefix}/companies`, companyRoutes);
    this.app.use(`${apiPrefix}/transactions`, transactionRoutes);
    this.app.use(`${apiPrefix}/documents`, documentRoutes);

    // API documentation (Swagger)
    if (config.development.enableSwagger) {
      this.setupSwagger(apiPrefix);
    }

    // Root route
    this.app.get('/', (_req, res) => {
      res.json({
        success: true,
        message: 'TaxMaster AI API',
        version: config.server.apiVersion,
        environment: config.server.environment,
        timestamp: new Date().toISOString(),
      });
    });

    // API root
    this.app.get(apiPrefix, (_req, res) => {
      res.json({
        success: true,
        message: 'TaxMaster AI API',
        version: config.server.apiVersion,
        endpoints: [
          'GET /health',
          'POST /auth/register',
          'POST /auth/login',
          'GET /auth/profile',
          'GET /users',
          'GET /companies',
          'GET /transactions',
          'GET /documents',
        ],
        documentation: config.development.enableSwagger ? `${apiPrefix}/docs` : null,
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        code: 'NOT_FOUND',
        path: req.originalUrl,
      });
    });
  }

  private setupSwagger(apiPrefix: string): void {
    const swaggerUi = require('swagger-ui-express');
    const swaggerJsdoc = require('swagger-jsdoc');

    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'TaxMaster AI API',
          version: '1.0.0',
          description: 'UAE Corporate Tax AI Compliance System API',
          contact: {
            name: 'TaxMaster AI Support',
            email: 'support@taxmaster.ai',
            url: 'https://taxmaster.ai',
          },
        },
        servers: [
          {
            url: `http://localhost:${config.server.port}${apiPrefix}`,
            description: 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [
          {
            bearerAuth: [] as any[],
          },
        ],
      },
      apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
    };

    const specs = swaggerJsdoc(options);
    this.app.use(`${apiPrefix}/docs`, swaggerUi.serve, swaggerUi.setup(specs, {
      customSiteTitle: 'TaxMaster AI API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
    }));

    logger.info(`API documentation available at ${apiPrefix}/docs`);
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);

    // Uncaught exception handler
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Unhandled promise rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection:', { reason, promise });
      process.exit(1);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      if (this.server) {
        this.server.close(async () => {
          logger.info('HTTP server closed.');

          try {
            await shutdownDatabases();
            logger.info('Database connections closed.');
          } catch (error) {
            logger.error('Error closing database connections:', error);
          }

          process.exit(0);
        });
      }

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  public async start(): Promise<void> {
    try {
      // Validate configuration
      validateConfig();
      logger.info('Configuration validated successfully');

      // Initialize databases
      try {
        await initializeDatabases();
        logger.info('Database connections initialized');
      } catch (error) {
        logger.warn('Database initialization failed, continuing without some features', error);
      }

      // Start server
      this.server = this.app.listen(config.server.port, config.server.host, () => {
        logger.info(`Server started successfully`, {
          port: config.server.port,
          host: config.server.host,
          environment: config.server.environment,
          apiVersion: config.server.apiVersion,
        });

        if (config.development.enableSwagger) {
          logger.info(`API Documentation: http://${config.server.host}:${config.server.port}/api/${config.server.apiVersion}/docs`);
        }
      });

      this.server.on('error', (error: any) => {
        if (error.syscall !== 'listen') {
          throw error;
        }

        const bind = typeof config.server.port === 'string'
          ? 'Pipe ' + config.server.port
          : 'Port ' + config.server.port;

        switch (error.code) {
          case 'EACCES':
            logger.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
          case 'EADDRINUSE':
            logger.error(`${bind} is already in use`);
            process.exit(1);
            break;
          default:
            throw error;
        }
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start server
if (require.main === module) {
  const server = new Server();
  server.start();
}

export { Server };