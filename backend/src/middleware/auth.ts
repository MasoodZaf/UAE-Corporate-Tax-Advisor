/**
 * Authentication Middleware
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config';
import { logger, securityLogger } from '../config/logger';

// Extend Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        companyId?: string;
        role?: string;
        permissions?: any;
      };
      company?: {
        id: string;
        name: string;
        subscription_plan: string;
      };
    }
  }
}

export interface TokenPayload {
  userId: string;
  email: string;
  companyId?: string;
  role?: string;
  permissions?: any;
  iat?: number;
  exp?: number;
}

/**
 * JWT Authentication Middleware
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      securityLogger.warn('Authentication attempt without token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method
      });

      res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_REQUIRED'
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.auth.jwtSecret) as TokenPayload;

    // Get user details from database
    const userModel = new User();
    const user = await userModel.findById(decoded.userId);

    if (!user || !user.is_active) {
      securityLogger.warn('Authentication with invalid or inactive user', {
        userId: decoded.userId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(401).json({
        success: false,
        message: 'Invalid or inactive user',
        code: 'INVALID_USER'
      });
      return;
    }

    // Update last login
    await userModel.updateLastLogin(user.id);

    // Attach user data to request
    req.user = {
      id: user.id,
      email: user.email,
      companyId: decoded.companyId,
      role: decoded.role,
      permissions: decoded.permissions
    };

    logger.debug('User authenticated successfully', {
      userId: user.id,
      email: user.email,
      companyId: decoded.companyId
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      securityLogger.warn('Authentication with invalid token', {
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      securityLogger.warn('Authentication with expired token', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }

    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Optional Authentication Middleware
 * Adds user data to request if token is present and valid, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as TokenPayload;
    const userModel = new User();
    const user = await userModel.findById(decoded.userId);

    if (user && user.is_active) {
      req.user = {
        id: user.id,
        email: user.email,
        companyId: decoded.companyId,
        role: decoded.role,
        permissions: decoded.permissions
      };
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};

/**
 * Company Context Middleware
 * Ensures user has access to the requested company
 */
export const requireCompanyAccess = (paramName = 'companyId') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = req.params[paramName] || req.body.companyId || req.query.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          message: 'Company ID required',
          code: 'COMPANY_ID_REQUIRED'
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      // Get user's company access
      const userModel = new User();
      const userWithCompanies = await userModel.findWithCompanyRoles(req.user.id);

      if (!userWithCompanies) {
        res.status(403).json({
          success: false,
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      // Check if user has access to the requested company
      const companyAccess = userWithCompanies.companies.find(
        c => c.company_id === companyId && c.is_active
      );

      if (!companyAccess) {
        securityLogger.warn('Unauthorized company access attempt', {
          userId: req.user.id,
          requestedCompanyId: companyId,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        res.status(403).json({
          success: false,
          message: 'Access to company denied',
          code: 'COMPANY_ACCESS_DENIED'
        });
        return;
      }

      // Attach company context to request
      req.user.companyId = companyId;
      req.user.role = companyAccess.role_name;
      req.user.permissions = companyAccess.permissions;

      next();
    } catch (error) {
      logger.error('Company access check error:', error);
      res.status(500).json({
        success: false,
        message: 'Access check failed',
        code: 'ACCESS_CHECK_ERROR'
      });
    }
  };
};

/**
 * Role-based Authorization Middleware
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      securityLogger.warn('Role authorization failed', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        ip: req.ip,
        path: req.path
      });

      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }

    next();
  };
};

/**
 * Permission-based Authorization Middleware
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    if (!req.user.permissions) {
      res.status(403).json({
        success: false,
        message: 'No permissions assigned',
        code: 'NO_PERMISSIONS'
      });
      return;
    }

    // Check if user has the specific permission or 'all' permission
    const hasPermission = 
      req.user.permissions.all === true ||
      req.user.permissions[permission] === true;

    if (!hasPermission) {
      securityLogger.warn('Permission authorization failed', {
        userId: req.user.id,
        requiredPermission: permission,
        userPermissions: req.user.permissions,
        ip: req.ip,
        path: req.path
      });

      res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`,
        code: 'PERMISSION_DENIED'
      });
      return;
    }

    next();
  };
};

/**
 * Admin-only Middleware
 */
export const requireAdmin = requireRole(['super_admin', 'admin']);

/**
 * Company Owner or Admin Middleware
 */
export const requireOwnerOrAdmin = requireRole(['super_admin', 'admin', 'company_owner']);

/**
 * Generate JWT Token
 */
export const generateToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
    issuer: 'taxmaster-ai',
    audience: 'taxmaster-ai-users'
  });
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.auth.jwtRefreshSecret, {
    expiresIn: config.auth.jwtRefreshExpiresIn,
    issuer: 'taxmaster-ai',
    audience: 'taxmaster-ai-refresh'
  });
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.auth.jwtRefreshSecret) as TokenPayload;
};

/**
 * Rate Limiting by User
 */
export const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next();
      return;
    }

    const userId = req.user.id;
    const now = Date.now();
    const userLimit = userRequests.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      userRequests.set(userId, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (userLimit.count >= maxRequests) {
      securityLogger.warn('User rate limit exceeded', {
        userId,
        requests: userLimit.count,
        windowMs,
        ip: req.ip
      });

      res.status(429).json({
        success: false,
        message: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      });
      return;
    }

    userLimit.count++;
    next();
  };
};

/**
 * Audit Log Middleware
 */
export const auditLog = (action: string, resource: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Store audit info in response locals for later logging
    res.locals.auditInfo = {
      action,
      resource,
      userId: req.user?.id,
      companyId: req.user?.companyId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      path: req.path,
      timestamp: new Date()
    };

    next();
  };
};