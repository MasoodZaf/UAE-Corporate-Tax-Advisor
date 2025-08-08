/**
 * Database Seeding Script
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { dbConnections } from '../src/config/database';
import { logger } from '../src/config/logger';

interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'admin' | 'user' | 'accountant' | 'viewer';
  preferred_language: 'en' | 'ar';
  is_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Company {
  id: string;
  name: string;
  trade_license_number: string;
  emirates: string;
  business_activity: string;
  annual_revenue?: number;
  employee_count?: number;
  is_freezone: boolean;
  is_small_business: boolean;
  tax_registration_number?: string;
  vat_registration_number?: string;
  subscription_plan: string;
  subscription_status: string;
  created_at: Date;
  updated_at: Date;
}

interface Transaction {
  id: string;
  company_id: string;
  transaction_date: Date;
  description: string;
  amount: number;
  currency: string;
  category: string;
  subcategory?: string;
  classification: string;
  tax_category: string;
  tax_amount: number;
  tax_rate: number;
  is_ai_classified: boolean;
  confidence_score?: number;
  supporting_documents?: string[];
  tags?: string[];
  notes?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

class DatabaseSeeder {
  private knex: any;

  constructor() {
    console.log('🌱 Initializing Database Seeder...');
  }

  async initialize(): Promise<void> {
    try {
      this.knex = await dbConnections.connectPostgreSQL();
      console.log('✅ Database connection established');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async seedAll(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding process...');

      // Check if data already exists
      const existingUsers = await this.knex('users').count('id as count');
      if (parseInt(existingUsers[0].count) > 0) {
        console.log('📊 Database already contains data. Clearing existing data...');
        await this.clearExistingData();
      }

      // Seed in order due to foreign key constraints
      const users = await this.seedUsers();
      const companies = await this.seedCompanies();
      await this.seedUserCompanyRelationships(users, companies);
      await this.seedTransactions(users, companies);

      console.log('🎉 Database seeding completed successfully!');
      console.log('\n📋 Super Admin Credentials:');
      console.log('Email: superadmin@taxmaster.ae');
      console.log('Password: SuperAdmin123!');

    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  async clearExistingData(): Promise<void> {
    console.log('🧹 Clearing existing data...');
    
    const tables = ['transactions', 'user_companies', 'companies', 'users'];
    
    for (const table of tables) {
      await this.knex(table).del();
      console.log(`   Cleared ${table} table`);
    }
  }

  async seedUsers(): Promise<User[]> {
    console.log('👥 Seeding users...');

    const users: User[] = [
      {
        id: uuidv4(),
        email: 'superadmin@taxmaster.ae',
        password_hash: await bcrypt.hash('SuperAdmin123!', 12),
        first_name: 'Super',
        last_name: 'Admin',
        phone: '+971-50-123-4567',
        role: 'admin',
        preferred_language: 'en',
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        email: 'accountant@demo.ae',
        password_hash: await bcrypt.hash('Demo123!', 12),
        first_name: 'Ahmed',
        last_name: 'Al-Mansoori',
        phone: '+971-50-234-5678',
        role: 'accountant',
        preferred_language: 'en',
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        email: 'user@demo.ae',
        password_hash: await bcrypt.hash('Demo123!', 12),
        first_name: 'Sarah',
        last_name: 'Khan',
        phone: '+971-50-345-6789',
        role: 'user',
        preferred_language: 'en',
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await this.knex('users').insert(users);
    console.log(`   ✅ Created ${users.length} users`);
    
    return users;
  }

  async seedCompanies(): Promise<Company[]> {
    console.log('🏢 Seeding companies...');

    const companies: Company[] = [
      {
        id: uuidv4(),
        name: 'Dubai Tech Solutions LLC',
        trade_license_number: 'CN-1234567',
        emirates: 'Dubai',
        business_activity: 'Software Development and IT Services',
        annual_revenue: 2500000,
        employee_count: 15,
        is_freezone: false,
        is_small_business: true,
        tax_registration_number: 'TRN100123456789012',
        vat_registration_number: 'VAT123456789012345',
        subscription_plan: 'professional',
        subscription_status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Abu Dhabi Trading Company LLC',
        trade_license_number: 'CN-2345678',
        emirates: 'Abu Dhabi',
        business_activity: 'Import and Export Trading',
        annual_revenue: 8500000,
        employee_count: 45,
        is_freezone: false,
        is_small_business: false,
        tax_registration_number: 'TRN100234567890123',
        vat_registration_number: 'VAT234567890123456',
        subscription_plan: 'enterprise',
        subscription_status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'DIFC Innovation Hub FZE',
        trade_license_number: 'DIFC-3456789',
        emirates: 'Dubai',
        business_activity: 'Financial Technology Services',
        annual_revenue: 1200000,
        employee_count: 8,
        is_freezone: true,
        is_small_business: true,
        tax_registration_number: 'TRN100345678901234',
        subscription_plan: 'starter',
        subscription_status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await this.knex('companies').insert(companies);
    console.log(`   ✅ Created ${companies.length} companies`);
    
    return companies;
  }

  async seedUserCompanyRelationships(users: User[], companies: Company[]): Promise<void> {
    console.log('🔗 Seeding user-company relationships...');

    const relationships = [
      // Super admin has access to all companies
      { user_id: users[0].id, company_id: companies[0].id, role: 'admin', is_primary: true, created_at: new Date() },
      { user_id: users[0].id, company_id: companies[1].id, role: 'admin', is_primary: false, created_at: new Date() },
      { user_id: users[0].id, company_id: companies[2].id, role: 'admin', is_primary: false, created_at: new Date() },
      
      // Accountant manages two companies
      { user_id: users[1].id, company_id: companies[0].id, role: 'accountant', is_primary: true, created_at: new Date() },
      { user_id: users[1].id, company_id: companies[1].id, role: 'accountant', is_primary: false, created_at: new Date() },
      
      // Regular user for one company
      { user_id: users[2].id, company_id: companies[0].id, role: 'user', is_primary: true, created_at: new Date() },
    ];

    await this.knex('user_companies').insert(relationships);
    console.log(`   ✅ Created ${relationships.length} user-company relationships`);
  }

  async seedTransactions(users: User[], companies: Company[]): Promise<void> {
    console.log('💰 Seeding transactions...');

    const transactions: Transaction[] = [];
    
    // Generate transactions for each company
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      const creator = users[i % users.length];

      // Revenue transactions
      const revenueTransactions = [
        {
          id: uuidv4(),
          company_id: company.id,
          transaction_date: new Date('2025-07-15'),
          description: 'Software Development Services - Client A',
          amount: 85000,
          currency: 'AED',
          category: 'Software Services',
          subcategory: 'Custom Development',
          classification: 'revenue',
          tax_category: 'taxable',
          tax_amount: 0, // No VAT on software services
          tax_rate: 0,
          is_ai_classified: true,
          confidence_score: 0.95,
          tags: ['software', 'development', 'client-a'],
          notes: 'Monthly software development services invoice',
          created_by: creator.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          company_id: company.id,
          transaction_date: new Date('2025-07-20'),
          description: 'IT Consulting Services - Project Alpha',
          amount: 45000,
          currency: 'AED',
          category: 'Consulting',
          subcategory: 'IT Consulting',
          classification: 'revenue',
          tax_category: 'taxable',
          tax_amount: 2250, // 5% VAT
          tax_rate: 0.05,
          is_ai_classified: true,
          confidence_score: 0.92,
          tags: ['consulting', 'project-alpha'],
          created_by: creator.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      // Expense transactions
      const expenseTransactions = [
        {
          id: uuidv4(),
          company_id: company.id,
          transaction_date: new Date('2025-07-01'),
          description: 'Office Rent - July 2025',
          amount: -25000,
          currency: 'AED',
          category: 'Office Expenses',
          subcategory: 'Rent',
          classification: 'expense',
          tax_category: 'exempt',
          tax_amount: 0,
          tax_rate: 0,
          is_ai_classified: true,
          confidence_score: 0.98,
          tags: ['rent', 'office', 'monthly'],
          notes: 'Monthly office rent payment',
          created_by: creator.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          company_id: company.id,
          transaction_date: new Date('2025-07-05'),
          description: 'Employee Salaries - July 2025',
          amount: -35000,
          currency: 'AED',
          category: 'Personnel',
          subcategory: 'Salaries',
          classification: 'expense',
          tax_category: 'exempt',
          tax_amount: 0,
          tax_rate: 0,
          is_ai_classified: true,
          confidence_score: 0.99,
          tags: ['salaries', 'personnel', 'monthly'],
          created_by: creator.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          company_id: company.id,
          transaction_date: new Date('2025-07-10'),
          description: 'DEWA Electricity Bill - June 2025',
          amount: -3500,
          currency: 'AED',
          category: 'Utilities',
          subcategory: 'Electricity',
          classification: 'expense',
          tax_category: 'zero_rated',
          tax_amount: 0,
          tax_rate: 0,
          is_ai_classified: true,
          confidence_score: 0.96,
          tags: ['utilities', 'dewa', 'electricity'],
          created_by: creator.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          company_id: company.id,
          transaction_date: new Date('2025-07-12'),
          description: 'Marketing Campaign - Google Ads',
          amount: -8500,
          currency: 'AED',
          category: 'Marketing',
          subcategory: 'Digital Advertising',
          classification: 'expense',
          tax_category: 'taxable',
          tax_amount: 425, // 5% VAT
          tax_rate: 0.05,
          is_ai_classified: true,
          confidence_score: 0.88,
          tags: ['marketing', 'google-ads', 'advertising'],
          created_by: creator.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      transactions.push(...revenueTransactions, ...expenseTransactions);
    }

    await this.knex('transactions').insert(transactions);
    console.log(`   ✅ Created ${transactions.length} transactions`);
  }

  async generateSampleCalculations(): Promise<void> {
    console.log('🧮 Generating sample tax calculations...');

    const companies = await this.knex('companies').select('*');
    
    for (const company of companies) {
      // Get transactions for this company
      const transactions = await this.knex('transactions')
        .where('company_id', company.id)
        .select('*');

      const totalRevenue = transactions
        .filter((t: Transaction) => t.classification === 'revenue')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      const totalExpenses = Math.abs(transactions
        .filter((t: Transaction) => t.classification === 'expense')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0));

      const taxableIncome = Math.max(0, totalRevenue - totalExpenses);
      
      // UAE Corporate Tax calculation
      let corporateTax = 0;
      let effectiveRate = 0;

      if (company.is_freezone) {
        // Free zone company - assume qualifying income for demo
        corporateTax = 0;
        effectiveRate = 0;
      } else {
        // Standard company with small business relief
        const SMALL_BUSINESS_RELIEF = 375000; // AED 375,000
        const TAX_RATE = 0.09; // 9%

        if (company.is_small_business && taxableIncome <= SMALL_BUSINESS_RELIEF) {
          corporateTax = 0; // Full small business relief
        } else if (company.is_small_business && taxableIncome > SMALL_BUSINESS_RELIEF) {
          corporateTax = (taxableIncome - SMALL_BUSINESS_RELIEF) * TAX_RATE;
        } else {
          corporateTax = taxableIncome * TAX_RATE;
        }

        effectiveRate = totalRevenue > 0 ? (corporateTax / totalRevenue) * 100 : 0;
      }

      console.log(`   📊 ${company.name}:`);
      console.log(`      Revenue: AED ${totalRevenue.toLocaleString()}`);
      console.log(`      Expenses: AED ${totalExpenses.toLocaleString()}`);
      console.log(`      Taxable Income: AED ${taxableIncome.toLocaleString()}`);
      console.log(`      Corporate Tax: AED ${corporateTax.toLocaleString()}`);
      console.log(`      Effective Rate: ${effectiveRate.toFixed(2)}%`);
      console.log('');
    }
  }

  async close(): Promise<void> {
    if (this.knex) {
      await this.knex.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run seeder if executed directly
async function main() {
  const seeder = new DatabaseSeeder();
  
  try {
    await seeder.initialize();
    await seeder.seedAll();
    await seeder.generateSampleCalculations();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await seeder.close();
  }
}

if (require.main === module) {
  main();
}

export { DatabaseSeeder };