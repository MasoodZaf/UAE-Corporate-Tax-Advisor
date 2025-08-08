/**
 * Error Handling Middleware
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import { Request, Response, NextFunction } from 'express';
import { logger, securityLogger } from '../config/logger';
import { config } from '../config';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

/**
 * Global Error Handler
 */
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Set default values
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let code = error.code || 'INTERNAL_ERROR';

  // Log error details
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    statusCode,
    code,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    companyId: req.user?.companyId,
    requestId: req.id,
    body: req.body,
    params: req.params,
    query: req.query,
  };

  // Log based on error severity
  if (statusCode >= 500) {
    logger.error('Server Error:', errorDetails);
  } else if (statusCode >= 400) {
    logger.warn('Client Error:', errorDetails);
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
    code = 'UNAUTHORIZED';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
    code = 'FORBIDDEN';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource Not Found';
    code = 'NOT_FOUND';
  } else if (error.name === 'ConflictError') {
    statusCode = 409;
    message = 'Conflict';
    code = 'CONFLICT';
  } else if (error.name === 'RateLimitError') {
    statusCode = 429;
    message = 'Too Many Requests';
    code = 'RATE_LIMIT_EXCEEDED';
  }

  // Database errors
  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Database Validation Error';
    code = 'DATABASE_VALIDATION_ERROR';
  } else if (error.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Foreign Key Constraint Error';
    code = 'FOREIGN_KEY_ERROR';
  } else if (error.name === 'SequelizeConnectionError') {
    statusCode = 503;
    message = 'Database Connection Error';
    code = 'DATABASE_CONNECTION_ERROR';
  }

  // MongoDB errors
  if (error.name === 'MongoError' || error.name === 'MongooseError') {
    statusCode = 500;
    message = 'Database Error';
    code = 'DATABASE_ERROR';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID Format';
    code = 'INVALID_ID';
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid Token';
    code = 'INVALID_TOKEN';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token Expired';
    code = 'TOKEN_EXPIRED';
  }

  // File upload errors
  if (error.name === 'MulterError') {
    statusCode = 400;
    if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'File Size Too Large';
      code = 'FILE_TOO_LARGE';
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      message = 'Too Many Files';
      code = 'TOO_MANY_FILES';
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected File Field';
      code = 'UNEXPECTED_FILE';
    }
  }

  // Security-related errors
  if (statusCode === 401 || statusCode === 403 || error.name === 'SecurityError') {
    securityLogger.warn('Security-related error', {
      ...errorDetails,
      severity: statusCode === 403 ? 'high' : 'medium',
      type: 'authorization'
    });
  }

  // Response format
  const errorResponse: any = {
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  // Include request ID if available
  if (req.id) {
    errorResponse.requestId = req.id;
  }

  // Include stack trace in development
  if (config.server.environment === 'development') {
    errorResponse.stack = error.stack;
    errorResponse.details = errorDetails;
  }

  // Include validation errors if present
  if (error.name === 'ValidationError' && (error as any).errors) {
    errorResponse.errors = (error as any).errors;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error: AppError = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  error.isOperational = true;
  next(error);
};

/**
 * Async Error Handler Wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom Error Classes
 */
export class ValidationError extends Error {
  public statusCode = 400;
  public code = 'VALIDATION_ERROR';
  public isOperational = true;

  constructor(message: string, public errors?: any[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error {
  public statusCode = 401;
  public code = 'UNAUTHORIZED';
  public isOperational = true;

  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  public statusCode = 403;
  public code = 'FORBIDDEN';
  public isOperational = true;

  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  public statusCode = 404;
  public code = 'NOT_FOUND';
  public isOperational = true;

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  public statusCode = 409;
  public code = 'CONFLICT';
  public isOperational = true;

  constructor(message: string = 'Conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends Error {
  public statusCode = 429;
  public code = 'RATE_LIMIT_EXCEEDED';
  public isOperational = true;

  constructor(message: string = 'Too many requests') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends Error {
  public statusCode = 500;
  public code = 'DATABASE_ERROR';
  public isOperational = true;

  constructor(message: string = 'Database error') {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends Error {
  public statusCode = 503;
  public code = 'EXTERNAL_SERVICE_ERROR';
  public isOperational = true;

  constructor(message: string = 'External service unavailable') {
    super(message);
    this.name = 'ExternalServiceError';
  }
}

/**
 * Error Factory
 */
export const createError = (
  statusCode: number,
  message: string,
  code?: string
): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true;
  return error;
};

/**
 * Handle Operational Errors
 */
export const handleOperationalError = (error: AppError): boolean => {
  return error.isOperational === true;
};

/**
 * Graceful Shutdown on Critical Errors
 */
export const handleCriticalError = (error: AppError): void => {
  logger.error('Critical Error - Initiating Graceful Shutdown:', {
    message: error.message,
    stack: error.stack,
    code: error.code,
  });

  process.exit(1);
};

/**
 * Request Validation Middleware
 */
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      const validationError = new ValidationError('Request validation failed', errors);
      return next(validationError);
    }

    next();
  };
};