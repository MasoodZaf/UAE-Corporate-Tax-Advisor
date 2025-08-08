/**
 * Database Configuration
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import { Knex } from 'knex';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import { logger } from './logger';

// PostgreSQL Configuration
export const postgresConfig: Knex.Config = {
  client: 'postgresql',
  connection: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'taxmaster_ai',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: parseInt(process.env.POSTGRES_POOL_MIN || '2'),
    max: parseInt(process.env.POSTGRES_POOL_MAX || '10'),
    createTimeoutMillis: 3000,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
  migrations: {
    directory: './src/database/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './src/database/seeds',
  },
  debug: process.env.DEBUG_SQL === 'true',
  acquireConnectionTimeout: 60000,
};

// MongoDB Configuration
export const mongoConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/taxmaster_ai_docs',
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
    w: 'majority' as const,
  },
};

// Redis Configuration
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Database Connection Classes
export class DatabaseConnections {
  private static instance: DatabaseConnections;
  private knexInstance: Knex | null = null;
  private mongooseInstance: typeof mongoose | null = null;
  private redisInstance: Redis | null = null;

  private constructor() {}

  public static getInstance(): DatabaseConnections {
    if (!DatabaseConnections.instance) {
      DatabaseConnections.instance = new DatabaseConnections();
    }
    return DatabaseConnections.instance;
  }

  // PostgreSQL Connection
  public async connectPostgreSQL(): Promise<Knex> {
    if (this.knexInstance) {
      return this.knexInstance;
    }

    try {
      const knex = require('knex')(postgresConfig);
      
      // Test connection
      await knex.raw('SELECT 1');
      
      this.knexInstance = knex;
      logger.info('PostgreSQL connected successfully');
      
      return knex;
    } catch (error) {
      logger.error('PostgreSQL connection failed:', error);
      throw error;
    }
  }

  // MongoDB Connection
  public async connectMongoDB(): Promise<typeof mongoose> {
    if (this.mongooseInstance) {
      return this.mongooseInstance;
    }

    try {
      const connection = await mongoose.connect(mongoConfig.uri, mongoConfig.options);
      
      this.mongooseInstance = mongoose;
      
      // Event listeners
      mongoose.connection.on('connected', () => {
        logger.info('MongoDB connected successfully');
      });

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      return connection;
    } catch (error) {
      logger.error('MongoDB connection failed:', error);
      throw error;
    }
  }

  // Redis Connection
  public async connectRedis(): Promise<Redis> {
    if (this.redisInstance) {
      return this.redisInstance;
    }

    try {
      const redis = new Redis(redisConfig);

      redis.on('connect', () => {
        logger.info('Redis connected successfully');
      });

      redis.on('error', (err) => {
        logger.error('Redis connection error:', err);
      });

      redis.on('close', () => {
        logger.warn('Redis connection closed');
      });

      // Test connection
      await redis.ping();
      
      this.redisInstance = redis;
      return redis;
    } catch (error) {
      logger.error('Redis connection failed:', error);
      throw error;
    }
  }

  // Get existing connections
  public getPostgreSQL(): Knex | null {
    return this.knexInstance;
  }

  public getMongoDB(): typeof mongoose | null {
    return this.mongooseInstance;
  }

  public getRedis(): Redis | null {
    return this.redisInstance;
  }

  // Close all connections
  public async closeAll(): Promise<void> {
    const promises: Promise<void>[] = [];

    if (this.knexInstance) {
      promises.push(this.knexInstance.destroy());
      this.knexInstance = null;
    }

    if (this.mongooseInstance) {
      promises.push(mongoose.disconnect());
      this.mongooseInstance = null;
    }

    if (this.redisInstance) {
      promises.push(this.redisInstance.quit().then(() => {}));
      this.redisInstance = null;
    }

    await Promise.all(promises);
    logger.info('All database connections closed');
  }

  // Health check for all databases
  public async healthCheck(): Promise<{
    postgresql: boolean;
    mongodb: boolean;
    redis: boolean;
  }> {
    const health = {
      postgresql: false,
      mongodb: false,
      redis: false,
    };

    // PostgreSQL health check
    try {
      if (this.knexInstance) {
        await this.knexInstance.raw('SELECT 1');
        health.postgresql = true;
      }
    } catch (error) {
      logger.warn('PostgreSQL health check failed:', error);
    }

    // MongoDB health check
    try {
      if (this.mongooseInstance && mongoose.connection.readyState === 1) {
        health.mongodb = true;
      }
    } catch (error) {
      logger.warn('MongoDB health check failed:', error);
    }

    // Redis health check
    try {
      if (this.redisInstance) {
        await this.redisInstance.ping();
        health.redis = true;
      }
    } catch (error) {
      logger.warn('Redis health check failed:', error);
    }

    return health;
  }
}

// Export singleton instance
export const dbConnections = DatabaseConnections.getInstance();

// Database initialization function
export async function initializeDatabases(): Promise<void> {
  try {
    logger.info('Initializing database connections...');
    
    const [knex, mongoose, redis] = await Promise.all([
      dbConnections.connectPostgreSQL(),
      dbConnections.connectMongoDB(),
      dbConnections.connectRedis(),
    ]);

    logger.info('All databases initialized successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

// Graceful shutdown
export async function shutdownDatabases(): Promise<void> {
  try {
    logger.info('Shutting down database connections...');
    await dbConnections.closeAll();
  } catch (error) {
    logger.error('Error during database shutdown:', error);
    throw error;
  }
}

// Export individual connections for direct use
export { Knex } from 'knex';
export { mongoose };
export { Redis };