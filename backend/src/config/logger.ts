/**
 * Logging Configuration
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import winston from 'winston';
import path from 'path';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(logColors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports based on environment
const transports: winston.transport[] = [];

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// File transports for all environments
const logDir = path.join(process.cwd(), 'logs');

// Error log file
transports.push(
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true,
  })
);

// Combined log file
transports.push(
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: logFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true,
  })
);

// HTTP request log file
transports.push(
  new winston.transports.File({
    filename: path.join(logDir, 'http.log'),
    level: 'http',
    format: logFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 3,
    tailable: true,
  })
);

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: logFormat,
  transports,
  exitOnError: false,
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      format: logFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 2,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      format: logFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 2,
    }),
  ],
});

// Create a stream object for morgan HTTP logging
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Audit logger for compliance tracking
export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf((info) => {
      return JSON.stringify({
        timestamp: info.timestamp,
        level: info.level,
        message: info.message,
        userId: info.userId,
        companyId: info.companyId,
        action: info.action,
        resource: info.resource,
        ip: info.ip,
        userAgent: info.userAgent,
        requestId: info.requestId,
        ...info,
      });
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'audit.log'),
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 10,
      tailable: true,
    }),
  ],
});

// Security logger for security events
export const securityLogger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'security.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
  ],
});

// Performance logger for monitoring
export const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'performance.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 3,
      tailable: true,
    }),
  ],
});

// Business logger for business events
export const businessLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf((info) => {
      return JSON.stringify({
        timestamp: info.timestamp,
        level: info.level,
        message: info.message,
        companyId: info.companyId,
        userId: info.userId,
        eventType: info.eventType,
        metadata: info.metadata,
        ...info,
      });
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'business.log'),
      maxsize: 15 * 1024 * 1024, // 15MB
      maxFiles: 7,
      tailable: true,
    }),
  ],
});

// Helper functions for structured logging
export const logAudit = (data: {
  userId?: string;
  companyId?: string;
  action: string;
  resource: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  metadata?: any;
  message: string;
}) => {
  auditLogger.info(data.message, data);
};

export const logSecurity = (data: {
  type: 'authentication' | 'authorization' | 'data_access' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  ip?: string;
  userAgent?: string;
  userId?: string;
  metadata?: any;
}) => {
  securityLogger.warn(data.message, data);
};

export const logPerformance = (data: {
  operation: string;
  duration: number;
  status: 'success' | 'error';
  metadata?: any;
  message: string;
}) => {
  performanceLogger.info(data.message, data);
};

export const logBusiness = (data: {
  companyId?: string;
  userId?: string;
  eventType: 'tax_calculation' | 'filing_submission' | 'compliance_check' | 'document_processing' | 'payment';
  message: string;
  metadata?: any;
}) => {
  businessLogger.info(data.message, data);
};

// Error handling for loggers
logger.on('error', (error) => {
  console.error('Logger error:', error);
});

auditLogger.on('error', (error) => {
  console.error('Audit logger error:', error);
});

securityLogger.on('error', (error) => {
  console.error('Security logger error:', error);
});

performanceLogger.on('error', (error) => {
  console.error('Performance logger error:', error);
});

businessLogger.on('error', (error) => {
  console.error('Business logger error:', error);
});

// Create logs directory if it doesn't exist
import fs from 'fs';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export default logger;