/**
 * Authentication Controller
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import { Request, Response } from 'express';
import { validationResult, body } from 'express-validator';
import crypto from 'crypto';
import { User, IUserCreate } from '../models/User';
import { Company } from '../models/Company';
import { 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken, 
  TokenPayload 
} from '../middleware/auth';
import { logger, auditLogger, securityLogger } from '../config/logger';
import { config } from '../config';
import { EmailService } from '../services/EmailService';

export class AuthController {
  private userModel = new User();
  private companyModel = new Company();
  private emailService = new EmailService();

  /**
   * User Registration
   */
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { email, password, first_name, last_name, phone, preferred_language } = req.body;

      // Check if user already exists
      const existingUser = await this.userModel.findByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User already exists with this email',
          code: 'USER_EXISTS'
        });
        return;
      }

      // Create user
      const userData: IUserCreate = {
        email: email.toLowerCase(),
        password,
        first_name,
        last_name,
        phone,
        preferred_language: preferred_language || 'en'
      };

      const user = await this.userModel.create(userData);

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      await this.userModel.setEmailVerificationToken(user.id, verificationToken);

      // Send verification email
      await this.emailService.sendEmailVerification(
        user.email,
        user.first_name,
        verificationToken
      );

      // Log registration
      auditLogger.info('User registered', {
        userId: user.id,
        email: user.email,
        action: 'user_register',
        resource: 'user',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            is_verified: user.is_verified
          }
        }
      });

    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        code: 'REGISTRATION_ERROR'
      });
    }
  };

  /**
   * User Login
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await this.userModel.findByEmail(email);
      if (!user || !user.is_active) {
        securityLogger.warn('Login attempt with invalid email', {
          email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
        return;
      }

      // Verify password
      const isPasswordValid = await this.userModel.verifyPassword(user.id, password);
      if (!isPasswordValid) {
        securityLogger.warn('Login attempt with invalid password', {
          userId: user.id,
          email: user.email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
        return;
      }

      // Get user's companies and roles
      const userWithCompanies = await this.userModel.findWithCompanyRoles(user.id);
      
      // Generate tokens (without company context initially)
      const tokenPayload: Omit<TokenPayload, 'iat' | 'exp'> = {
        userId: user.id,
        email: user.email
      };

      const accessToken = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Update last login
      await this.userModel.updateLastLogin(user.id);

      // Log successful login
      auditLogger.info('User logged in', {
        userId: user.id,
        email: user.email,
        action: 'user_login',
        resource: 'auth',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            preferred_language: user.preferred_language,
            is_verified: user.is_verified
          },
          companies: userWithCompanies?.companies || [],
          tokens: {
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'Bearer',
            expires_in: config.auth.jwtExpiresIn
          }
        }
      });

    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        code: 'LOGIN_ERROR'
      });
    }
  };

  /**
   * Company Context Login
   * Switch user context to a specific company
   */
  public switchCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyId } = req.body;

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      // Get user's company access
      const userWithCompanies = await this.userModel.findWithCompanyRoles(req.user.id);
      
      if (!userWithCompanies) {
        res.status(403).json({
          success: false,
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        });
        return;
      }

      // Find the requested company
      const companyAccess = userWithCompanies.companies.find(
        c => c.company_id === companyId && c.is_active
      );

      if (!companyAccess) {
        res.status(403).json({
          success: false,
          message: 'Access to company denied',
          code: 'COMPANY_ACCESS_DENIED'
        });
        return;
      }

      // Get company details
      const company = await this.companyModel.findById(companyId);
      if (!company || company.subscription_status !== 'active') {
        res.status(403).json({
          success: false,
          message: 'Company not accessible',
          code: 'COMPANY_NOT_ACCESSIBLE'
        });
        return;
      }

      // Generate new token with company context
      const tokenPayload: Omit<TokenPayload, 'iat' | 'exp'> = {
        userId: req.user.id,
        email: req.user.email,
        companyId: companyId,
        role: companyAccess.role_name,
        permissions: companyAccess.permissions
      };

      const accessToken = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Log company switch
      auditLogger.info('User switched company context', {
        userId: req.user.id,
        companyId: companyId,
        role: companyAccess.role_name,
        action: 'company_switch',
        resource: 'auth',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Company context switched successfully',
        data: {
          company: {
            id: company.id,
            name: company.name,
            trade_license_number: company.trade_license_number,
            subscription_plan: company.subscription_plan
          },
          role: companyAccess.role_name,
          permissions: companyAccess.permissions,
          tokens: {
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'Bearer',
            expires_in: config.auth.jwtExpiresIn
          }
        }
      });

    } catch (error) {
      logger.error('Company switch error:', error);
      res.status(500).json({
        success: false,
        message: 'Company switch failed',
        code: 'COMPANY_SWITCH_ERROR'
      });
    }
  };

  /**
   * Refresh Access Token
   */
  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        res.status(400).json({
          success: false,
          message: 'Refresh token required',
          code: 'REFRESH_TOKEN_REQUIRED'
        });
        return;
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refresh_token);

      // Verify user still exists and is active
      const user = await this.userModel.findById(decoded.userId);
      if (!user || !user.is_active) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        });
        return;
      }

      // Generate new tokens
      const tokenPayload: Omit<TokenPayload, 'iat' | 'exp'> = {
        userId: user.id,
        email: user.email,
        companyId: decoded.companyId,
        role: decoded.role,
        permissions: decoded.permissions
      };

      const accessToken = generateToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            access_token: accessToken,
            refresh_token: newRefreshToken,
            token_type: 'Bearer',
            expires_in: config.auth.jwtExpiresIn
          }
        }
      });

    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: 'Token refresh failed',
        code: 'TOKEN_REFRESH_ERROR'
      });
    }
  };

  /**
   * User Logout
   */
  public logout = async (req: Request, res: Response): Promise<void> => {
    try {
      // In a production environment, you would invalidate the token
      // by storing it in a blacklist (Redis) or using short-lived tokens

      auditLogger.info('User logged out', {
        userId: req.user?.id,
        action: 'user_logout',
        resource: 'auth',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        code: 'LOGOUT_ERROR'
      });
    }
  };

  /**
   * Verify Email
   */
  public verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;

      // Find user by verification token
      const user = await this.userModel.findOne({ email_verification_token: token });
      
      if (!user) {
        res.status(400).json({
          success: false,
          message: 'Invalid verification token',
          code: 'INVALID_TOKEN'
        });
        return;
      }

      // Verify email
      await this.userModel.verifyEmail(user.id);

      auditLogger.info('Email verified', {
        userId: user.id,
        email: user.email,
        action: 'email_verify',
        resource: 'user',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Email verified successfully'
      });

    } catch (error) {
      logger.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Email verification failed',
        code: 'EMAIL_VERIFICATION_ERROR'
      });
    }
  };

  /**
   * Forgot Password
   */
  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      const user = await this.userModel.findByEmail(email);
      
      if (!user) {
        // Don't reveal if email exists
        res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent.'
        });
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await this.userModel.setPasswordResetToken(user.id, resetToken, resetExpires);

      // Send reset email
      await this.emailService.sendPasswordReset(
        user.email,
        user.first_name,
        resetToken
      );

      auditLogger.info('Password reset requested', {
        userId: user.id,
        email: user.email,
        action: 'password_reset_request',
        resource: 'auth',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.'
      });

    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Password reset request failed',
        code: 'PASSWORD_RESET_ERROR'
      });
    }
  };

  /**
   * Reset Password
   */
  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // Find user by reset token
      const user = await this.userModel.findOne({
        password_reset_token: token,
        password_reset_expires: { $gt: new Date() }
      });

      if (!user) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token',
          code: 'INVALID_RESET_TOKEN'
        });
        return;
      }

      // Update password
      await this.userModel.updatePassword(user.id, password);

      auditLogger.info('Password reset completed', {
        userId: user.id,
        email: user.email,
        action: 'password_reset',
        resource: 'auth',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      logger.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Password reset failed',
        code: 'PASSWORD_RESET_FAILED'
      });
    }
  };

  /**
   * Change Password
   */
  public changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { current_password, new_password } = req.body;

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await this.userModel.verifyPassword(
        req.user.id,
        current_password
      );

      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        });
        return;
      }

      // Update password
      await this.userModel.updatePassword(req.user.id, new_password);

      auditLogger.info('Password changed', {
        userId: req.user.id,
        action: 'password_change',
        resource: 'user',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Password change failed',
        code: 'PASSWORD_CHANGE_ERROR'
      });
    }
  };

  /**
   * Get Current User Profile
   */
  public getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      const userWithCompanies = await this.userModel.findWithCompanyRoles(req.user.id);
      
      if (!userWithCompanies) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: userWithCompanies.user,
          companies: userWithCompanies.companies,
          current_context: req.user.companyId ? {
            company_id: req.user.companyId,
            role: req.user.role,
            permissions: req.user.permissions
          } : null
        }
      });

    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
        code: 'PROFILE_ERROR'
      });
    }
  };
}

// Validation rules
export const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('first_name').trim().isLength({ min: 1 }).withMessage('First name required'),
  body('last_name').trim().isLength({ min: 1 }).withMessage('Last name required'),
  body('phone').optional().matches(/^\+971[0-9]{8,9}$/).withMessage('Valid UAE phone number required'),
  body('preferred_language').optional().isIn(['en', 'ar']).withMessage('Language must be en or ar')
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
];

export const changePasswordValidation = [
  body('current_password').notEmpty().withMessage('Current password required'),
  body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
];

export const resetPasswordValidation = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];