/**
 * User Model
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import { Knex } from 'knex';
import bcrypt from 'bcrypt';
import { dbConnections } from '../config/database';
import { BaseModel } from './BaseModel';
import { config } from '../config';

export interface IUser {
  id: string;
  email: string;
  password_hash?: string;
  uae_pass_id?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  preferred_language: 'en' | 'ar';
  is_active: boolean;
  is_verified: boolean;
  last_login_at?: Date;
  password_reset_token?: string;
  password_reset_expires?: Date;
  email_verification_token?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IUserCreate {
  email: string;
  password?: string;
  uae_pass_id?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  preferred_language?: 'en' | 'ar';
}

export interface IUserUpdate {
  first_name?: string;
  last_name?: string;
  phone?: string;
  preferred_language?: 'en' | 'ar';
}

export class User extends BaseModel<IUser> {
  protected tableName = 'users';

  constructor(knex?: Knex) {
    super(knex || dbConnections.getPostgreSQL()!);
  }

  // Create a new user
  public async create(userData: IUserCreate): Promise<IUser> {
    const hashedPassword = userData.password 
      ? await bcrypt.hash(userData.password, config.auth.hashRounds)
      : undefined;

    const userToInsert = {
      ...userData,
      password_hash: hashedPassword,
      preferred_language: userData.preferred_language || 'en',
      is_active: true,
      is_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    delete (userToInsert as any).password;

    const [user] = await this.knex(this.tableName)
      .insert(userToInsert)
      .returning('*');

    return this.sanitizeUser(user);
  }

  // Find user by email
  public async findByEmail(email: string): Promise<IUser | null> {
    const user = await this.knex(this.tableName)
      .where({ email: email.toLowerCase() })
      .first();

    return user ? this.sanitizeUser(user) : null;
  }

  // Find user by UAE Pass ID
  public async findByUAEPassId(uaePassId: string): Promise<IUser | null> {
    const user = await this.knex(this.tableName)
      .where({ uae_pass_id: uaePassId })
      .first();

    return user ? this.sanitizeUser(user) : null;
  }

  // Verify password
  public async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.knex(this.tableName)
      .select('password_hash')
      .where({ id: userId })
      .first();

    if (!user || !user.password_hash) {
      return false;
    }

    return await bcrypt.compare(password, user.password_hash);
  }

  // Update password
  public async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, config.auth.hashRounds);

    await this.knex(this.tableName)
      .where({ id: userId })
      .update({
        password_hash: hashedPassword,
        password_reset_token: null,
        password_reset_expires: null,
        updated_at: new Date(),
      });
  }

  // Set password reset token
  public async setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await this.knex(this.tableName)
      .where({ id: userId })
      .update({
        password_reset_token: token,
        password_reset_expires: expires,
        updated_at: new Date(),
      });
  }

  // Verify email
  public async verifyEmail(userId: string): Promise<void> {
    await this.knex(this.tableName)
      .where({ id: userId })
      .update({
        is_verified: true,
        email_verification_token: null,
        updated_at: new Date(),
      });
  }

  // Set email verification token
  public async setEmailVerificationToken(userId: string, token: string): Promise<void> {
    await this.knex(this.tableName)
      .where({ id: userId })
      .update({
        email_verification_token: token,
        updated_at: new Date(),
      });
  }

  // Update last login
  public async updateLastLogin(userId: string): Promise<void> {
    await this.knex(this.tableName)
      .where({ id: userId })
      .update({
        last_login_at: new Date(),
        updated_at: new Date(),
      });
  }

  // Update user profile
  public async updateProfile(userId: string, updates: IUserUpdate): Promise<IUser> {
    const [updatedUser] = await this.knex(this.tableName)
      .where({ id: userId })
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .returning('*');

    return this.sanitizeUser(updatedUser);
  }

  // Deactivate user
  public async deactivate(userId: string): Promise<void> {
    await this.knex(this.tableName)
      .where({ id: userId })
      .update({
        is_active: false,
        updated_at: new Date(),
      });
  }

  // Activate user
  public async activate(userId: string): Promise<void> {
    await this.knex(this.tableName)
      .where({ id: userId })
      .update({
        is_active: true,
        updated_at: new Date(),
      });
  }

  // Find users by company
  public async findByCompany(companyId: string, includeInactive = false): Promise<IUser[]> {
    let query = this.knex(this.tableName)
      .select('users.*')
      .join('user_company_roles', 'users.id', 'user_company_roles.user_id')
      .where('user_company_roles.company_id', companyId)
      .where('user_company_roles.is_active', true);

    if (!includeInactive) {
      query = query.where('users.is_active', true);
    }

    const users = await query;
    return users.map(user => this.sanitizeUser(user));
  }

  // Get user with company roles
  public async findWithCompanyRoles(userId: string): Promise<{
    user: IUser;
    companies: Array<{
      company_id: string;
      company_name: string;
      role_name: string;
      permissions: any;
      is_active: boolean;
    }>;
  } | null> {
    const user = await this.findById(userId);
    if (!user) {
      return null;
    }

    const companies = await this.knex('user_company_roles')
      .select(
        'user_company_roles.company_id',
        'companies.name as company_name',
        'roles.name as role_name',
        'roles.permissions',
        'user_company_roles.is_active'
      )
      .join('companies', 'user_company_roles.company_id', 'companies.id')
      .join('roles', 'user_company_roles.role_id', 'roles.id')
      .where('user_company_roles.user_id', userId)
      .where('user_company_roles.is_active', true);

    return {
      user,
      companies,
    };
  }

  // Search users
  public async search(
    searchTerm: string,
    filters: {
      is_active?: boolean;
      is_verified?: boolean;
      preferred_language?: 'en' | 'ar';
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ users: IUser[]; total: number; page: number; limit: number }> {
    let query = this.knex(this.tableName)
      .where(function() {
        this.where('first_name', 'ilike', `%${searchTerm}%`)
          .orWhere('last_name', 'ilike', `%${searchTerm}%`)
          .orWhere('email', 'ilike', `%${searchTerm}%`);
      });

    // Apply filters
    if (filters.is_active !== undefined) {
      query = query.where('is_active', filters.is_active);
    }
    if (filters.is_verified !== undefined) {
      query = query.where('is_verified', filters.is_verified);
    }
    if (filters.preferred_language) {
      query = query.where('preferred_language', filters.preferred_language);
    }

    // Get total count
    const totalResult = await query.clone().count('* as count').first();
    const total = parseInt(totalResult?.count as string) || 0;

    // Get paginated results
    const users = await query
      .orderBy('created_at', 'desc')
      .limit(pagination.limit)
      .offset((pagination.page - 1) * pagination.limit);

    return {
      users: users.map(user => this.sanitizeUser(user)),
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  // Get user statistics
  public async getStatistics(): Promise<{
    total: number;
    active: number;
    verified: number;
    by_language: { en: number; ar: number };
    recent_registrations: number;
  }> {
    const [stats] = await this.knex(this.tableName)
      .select(
        this.knex.raw('COUNT(*) as total'),
        this.knex.raw('COUNT(*) FILTER (WHERE is_active = true) as active'),
        this.knex.raw('COUNT(*) FILTER (WHERE is_verified = true) as verified'),
        this.knex.raw('COUNT(*) FILTER (WHERE preferred_language = \'en\') as lang_en'),
        this.knex.raw('COUNT(*) FILTER (WHERE preferred_language = \'ar\') as lang_ar'),
        this.knex.raw('COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL \'30 days\') as recent')
      );

    return {
      total: parseInt(stats.total),
      active: parseInt(stats.active),
      verified: parseInt(stats.verified),
      by_language: {
        en: parseInt(stats.lang_en),
        ar: parseInt(stats.lang_ar),
      },
      recent_registrations: parseInt(stats.recent),
    };
  }

  // Remove sensitive information from user object
  private sanitizeUser(user: any): IUser {
    if (!user) return user;
    
    const sanitized = { ...user };
    delete sanitized.password_hash;
    delete sanitized.password_reset_token;
    delete sanitized.email_verification_token;
    
    return sanitized;
  }

  // Bulk operations
  public async bulkCreate(users: IUserCreate[]): Promise<IUser[]> {
    const usersToInsert = await Promise.all(
      users.map(async (userData) => ({
        ...userData,
        password_hash: userData.password 
          ? await bcrypt.hash(userData.password, config.auth.hashRounds)
          : undefined,
        preferred_language: userData.preferred_language || 'en',
        is_active: true,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    );

    // Remove password field
    usersToInsert.forEach(user => delete (user as any).password);

    const insertedUsers = await this.knex(this.tableName)
      .insert(usersToInsert)
      .returning('*');

    return insertedUsers.map(user => this.sanitizeUser(user));
  }

  public async bulkUpdate(updates: { id: string; data: Partial<IUser> }[]): Promise<void> {
    await this.knex.transaction(async (trx) => {
      for (const update of updates) {
        await trx(this.tableName)
          .where({ id: update.id })
          .update({
            ...update.data,
            updated_at: new Date(),
          });
      }
    });
  }
}