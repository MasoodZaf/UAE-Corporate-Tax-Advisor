/**
 * Company Model
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import { Knex } from 'knex';
import { dbConnections } from '../config/database';
import { BaseModel } from './BaseModel';

export interface ICompany {
  id: string;
  name: string;
  name_arabic?: string;
  trade_license_number: string;
  emirates: string;
  business_activity?: string;
  business_activity_arabic?: string;
  establishment_date?: Date;
  license_expiry_date?: Date;
  po_box?: string;
  address?: string;
  address_arabic?: string;
  phone?: string;
  fax?: string;
  website?: string;
  annual_revenue?: number;
  employee_count?: number;
  industry_sector?: string;
  is_free_zone: boolean;
  free_zone_name?: string;
  tax_registration_number?: string;
  fta_registration_status: 'pending' | 'registered' | 'rejected';
  subscription_plan: 'starter' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'suspended' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface ICompanyCreate {
  name: string;
  name_arabic?: string;
  trade_license_number: string;
  emirates: string;
  business_activity?: string;
  business_activity_arabic?: string;
  establishment_date?: Date;
  license_expiry_date?: Date;
  po_box?: string;
  address?: string;
  address_arabic?: string;
  phone?: string;
  fax?: string;
  website?: string;
  annual_revenue?: number;
  employee_count?: number;
  industry_sector?: string;
  is_free_zone?: boolean;
  free_zone_name?: string;
  subscription_plan?: 'starter' | 'professional' | 'enterprise';
}

export interface ICompanyUpdate {
  name?: string;
  name_arabic?: string;
  business_activity?: string;
  business_activity_arabic?: string;
  license_expiry_date?: Date;
  po_box?: string;
  address?: string;
  address_arabic?: string;
  phone?: string;
  fax?: string;
  website?: string;
  annual_revenue?: number;
  employee_count?: number;
  industry_sector?: string;
  free_zone_name?: string;
}

export class Company extends BaseModel<ICompany> {
  protected tableName = 'companies';

  constructor(knex?: Knex) {
    super(knex || dbConnections.getPostgreSQL()!);
  }

  // Create a new company
  public async create(companyData: ICompanyCreate): Promise<ICompany> {
    const companyToInsert = {
      ...companyData,
      is_free_zone: companyData.is_free_zone || false,
      subscription_plan: companyData.subscription_plan || 'starter',
      subscription_status: 'active' as const,
      fta_registration_status: 'pending' as const,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [company] = await this.knex(this.tableName)
      .insert(companyToInsert)
      .returning('*');

    return company;
  }

  // Find company by trade license number
  public async findByTradeLicense(tradeLicenseNumber: string): Promise<ICompany | null> {
    const company = await this.knex(this.tableName)
      .where({ trade_license_number: tradeLicenseNumber })
      .first();

    return company || null;
  }

  // Find company by tax registration number
  public async findByTaxRegistration(taxRegistrationNumber: string): Promise<ICompany | null> {
    const company = await this.knex(this.tableName)
      .where({ tax_registration_number: taxRegistrationNumber })
      .first();

    return company || null;
  }

  // Find companies by user
  public async findByUser(userId: string, includeInactive = false): Promise<ICompany[]> {
    let query = this.knex(this.tableName)
      .select('companies.*', 'roles.name as role_name', 'user_company_roles.is_active as user_role_active')
      .join('user_company_roles', 'companies.id', 'user_company_roles.company_id')
      .join('roles', 'user_company_roles.role_id', 'roles.id')
      .where('user_company_roles.user_id', userId)
      .where('user_company_roles.is_active', true);

    if (!includeInactive) {
      query = query.where('companies.subscription_status', 'active');
    }

    const companies = await query.orderBy('companies.name');
    return companies;
  }

  // Update company profile
  public async updateProfile(companyId: string, updates: ICompanyUpdate): Promise<ICompany> {
    const [updatedCompany] = await this.knex(this.tableName)
      .where({ id: companyId })
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .returning('*');

    return updatedCompany;
  }

  // Update FTA registration status
  public async updateFTARegistration(
    companyId: string,
    status: 'pending' | 'registered' | 'rejected',
    taxRegistrationNumber?: string
  ): Promise<void> {
    const updateData: any = {
      fta_registration_status: status,
      updated_at: new Date(),
    };

    if (status === 'registered' && taxRegistrationNumber) {
      updateData.tax_registration_number = taxRegistrationNumber;
    }

    await this.knex(this.tableName)
      .where({ id: companyId })
      .update(updateData);
  }

  // Update subscription
  public async updateSubscription(
    companyId: string,
    plan: 'starter' | 'professional' | 'enterprise',
    status: 'active' | 'inactive' | 'suspended' | 'cancelled'
  ): Promise<void> {
    await this.knex(this.tableName)
      .where({ id: companyId })
      .update({
        subscription_plan: plan,
        subscription_status: status,
        updated_at: new Date(),
      });
  }

  // Get companies by emirates
  public async findByEmirates(emirates: string): Promise<ICompany[]> {
    const companies = await this.knex(this.tableName)
      .where({ emirates })
      .where({ subscription_status: 'active' })
      .orderBy('name');

    return companies;
  }

  // Get companies by industry sector
  public async findByIndustrySector(sector: string): Promise<ICompany[]> {
    const companies = await this.knex(this.tableName)
      .where({ industry_sector: sector })
      .where({ subscription_status: 'active' })
      .orderBy('name');

    return companies;
  }

  // Get free zone companies
  public async findFreeZoneCompanies(freeZoneName?: string): Promise<ICompany[]> {
    let query = this.knex(this.tableName)
      .where({ is_free_zone: true })
      .where({ subscription_status: 'active' });

    if (freeZoneName) {
      query = query.where({ free_zone_name: freeZoneName });
    }

    const companies = await query.orderBy('name');
    return companies;
  }

  // Search companies
  public async search(
    searchTerm: string,
    filters: {
      emirates?: string;
      industry_sector?: string;
      is_free_zone?: boolean;
      subscription_plan?: string;
      subscription_status?: string;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ companies: ICompany[]; total: number; page: number; limit: number }> {
    let query = this.knex(this.tableName)
      .where(function() {
        this.where('name', 'ilike', `%${searchTerm}%`)
          .orWhere('name_arabic', 'ilike', `%${searchTerm}%`)
          .orWhere('trade_license_number', 'ilike', `%${searchTerm}%`)
          .orWhere('tax_registration_number', 'ilike', `%${searchTerm}%`);
      });

    // Apply filters
    if (filters.emirates) {
      query = query.where('emirates', filters.emirates);
    }
    if (filters.industry_sector) {
      query = query.where('industry_sector', filters.industry_sector);
    }
    if (filters.is_free_zone !== undefined) {
      query = query.where('is_free_zone', filters.is_free_zone);
    }
    if (filters.subscription_plan) {
      query = query.where('subscription_plan', filters.subscription_plan);
    }
    if (filters.subscription_status) {
      query = query.where('subscription_status', filters.subscription_status);
    }

    // Get total count
    const totalResult = await query.clone().count('* as count').first();
    const total = parseInt(totalResult?.count as string) || 0;

    // Get paginated results
    const companies = await query
      .orderBy('name')
      .limit(pagination.limit)
      .offset((pagination.page - 1) * pagination.limit);

    return {
      companies,
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  // Get company statistics
  public async getStatistics(): Promise<{
    total: number;
    active: number;
    by_emirates: Record<string, number>;
    by_plan: Record<string, number>;
    free_zone: number;
    fta_registered: number;
    avg_revenue: number;
  }> {
    const [stats] = await this.knex(this.tableName)
      .select(
        this.knex.raw('COUNT(*) as total'),
        this.knex.raw('COUNT(*) FILTER (WHERE subscription_status = \'active\') as active'),
        this.knex.raw('COUNT(*) FILTER (WHERE is_free_zone = true) as free_zone'),
        this.knex.raw('COUNT(*) FILTER (WHERE fta_registration_status = \'registered\') as fta_registered'),
        this.knex.raw('AVG(annual_revenue) as avg_revenue')
      );

    const emiratesStats = await this.knex(this.tableName)
      .select('emirates')
      .count('* as count')
      .groupBy('emirates');

    const planStats = await this.knex(this.tableName)
      .select('subscription_plan')
      .count('* as count')
      .groupBy('subscription_plan');

    const by_emirates: Record<string, number> = {};
    emiratesStats.forEach(stat => {
      by_emirates[stat.emirates] = parseInt(stat.count as string);
    });

    const by_plan: Record<string, number> = {};
    planStats.forEach(stat => {
      by_plan[stat.subscription_plan] = parseInt(stat.count as string);
    });

    return {
      total: parseInt(stats.total),
      active: parseInt(stats.active),
      by_emirates,
      by_plan,
      free_zone: parseInt(stats.free_zone),
      fta_registered: parseInt(stats.fta_registered),
      avg_revenue: parseFloat(stats.avg_revenue) || 0,
    };
  }

  // Get companies with expired licenses
  public async findWithExpiredLicenses(daysAhead = 30): Promise<ICompany[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

    const companies = await this.knex(this.tableName)
      .where('license_expiry_date', '<=', cutoffDate)
      .where('subscription_status', 'active')
      .orderBy('license_expiry_date');

    return companies;
  }

  // Get companies requiring FTA registration
  public async findRequiringFTARegistration(): Promise<ICompany[]> {
    const companies = await this.knex(this.tableName)
      .where(function() {
        this.where('annual_revenue', '>', 375000)
          .orWhere('is_free_zone', false);
      })
      .where('fta_registration_status', 'pending')
      .where('subscription_status', 'active')
      .orderBy('annual_revenue', 'desc');

    return companies;
  }

  // Validate subscription limits
  public async validateSubscriptionLimits(companyId: string): Promise<{
    isValid: boolean;
    currentRevenue: number;
    planLimit: number;
    plan: string;
  }> {
    const company = await this.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    const limits = {
      starter: 5000000,     // 5M AED
      professional: 25000000, // 25M AED
      enterprise: 0,        // Unlimited
    };

    const planLimit = limits[company.subscription_plan];
    const currentRevenue = company.annual_revenue || 0;
    const isValid = planLimit === 0 || currentRevenue <= planLimit;

    return {
      isValid,
      currentRevenue,
      planLimit,
      plan: company.subscription_plan,
    };
  }

  // Get company with users and roles
  public async findWithUsers(companyId: string): Promise<{
    company: ICompany;
    users: Array<{
      user_id: string;
      first_name: string;
      last_name: string;
      email: string;
      role_name: string;
      is_active: boolean;
      assigned_at: Date;
    }>;
  } | null> {
    const company = await this.findById(companyId);
    if (!company) {
      return null;
    }

    const users = await this.knex('user_company_roles')
      .select(
        'users.id as user_id',
        'users.first_name',
        'users.last_name',
        'users.email',
        'roles.name as role_name',
        'user_company_roles.is_active',
        'user_company_roles.assigned_at'
      )
      .join('users', 'user_company_roles.user_id', 'users.id')
      .join('roles', 'user_company_roles.role_id', 'roles.id')
      .where('user_company_roles.company_id', companyId)
      .orderBy('user_company_roles.assigned_at');

    return {
      company,
      users,
    };
  }
}