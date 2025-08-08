/**
 * Transaction Model
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import { Knex } from 'knex';
import { dbConnections } from '../config/database';
import { BaseModel } from './BaseModel';

export interface ITransaction {
  id: string;
  company_id: string;
  transaction_type: 'income' | 'expense' | 'asset' | 'liability';
  reference_number?: string;
  description: string;
  description_arabic?: string;
  amount: number;
  currency: string;
  transaction_date: Date;
  account_id?: string;
  category?: string;
  subcategory?: string;
  ai_category?: string;
  ai_confidence?: number;
  is_ai_verified: boolean;
  manual_override: boolean;
  is_taxable: boolean;
  vat_rate: number;
  vat_amount: number;
  source_type: 'bank_import' | 'manual_entry' | 'document_ocr' | 'api_import';
  source_reference?: string;
  bank_account_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  approved_by?: string;
  approved_at?: Date;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ITransactionCreate {
  company_id: string;
  transaction_type: 'income' | 'expense' | 'asset' | 'liability';
  reference_number?: string;
  description: string;
  description_arabic?: string;
  amount: number;
  currency?: string;
  transaction_date: Date;
  account_id?: string;
  category?: string;
  subcategory?: string;
  is_taxable?: boolean;
  vat_rate?: number;
  vat_amount?: number;
  source_type: 'bank_import' | 'manual_entry' | 'document_ocr' | 'api_import';
  source_reference?: string;
  bank_account_id?: string;
  created_by?: string;
}

export interface ITransactionUpdate {
  description?: string;
  description_arabic?: string;
  amount?: number;
  transaction_date?: Date;
  account_id?: string;
  category?: string;
  subcategory?: string;
  is_taxable?: boolean;
  vat_rate?: number;
  vat_amount?: number;
}

export interface ITransactionFilter {
  transaction_type?: 'income' | 'expense' | 'asset' | 'liability';
  category?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'needs_review';
  source_type?: 'bank_import' | 'manual_entry' | 'document_ocr' | 'api_import';
  date_from?: Date;
  date_to?: Date;
  amount_min?: number;
  amount_max?: number;
  is_taxable?: boolean;
  needs_ai_review?: boolean;
}

export class Transaction extends BaseModel<ITransaction> {
  protected tableName = 'transactions';

  constructor(knex?: Knex) {
    super(knex || dbConnections.getPostgreSQL()!);
  }

  // Create a new transaction
  public async create(transactionData: ITransactionCreate, userId?: string): Promise<ITransaction> {
    const transactionToInsert = {
      ...transactionData,
      currency: transactionData.currency || 'AED',
      is_taxable: transactionData.is_taxable !== false, // Default to true
      vat_rate: transactionData.vat_rate || 0,
      vat_amount: transactionData.vat_amount || 0,
      is_ai_verified: false,
      manual_override: false,
      status: 'pending' as const,
      created_by: userId || transactionData.created_by,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [transaction] = await this.knex(this.tableName)
      .insert(transactionToInsert)
      .returning('*');

    return transaction;
  }

  // Find transactions by company
  public async findByCompany(
    companyId: string,
    filters: ITransactionFilter = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 50 }
  ): Promise<{ transactions: ITransaction[]; total: number; page: number; limit: number }> {
    let query = this.knex(this.tableName)
      .where('company_id', companyId);

    // Apply filters
    if (filters.transaction_type) {
      query = query.where('transaction_type', filters.transaction_type);
    }
    if (filters.category) {
      query = query.where('category', filters.category);
    }
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    if (filters.source_type) {
      query = query.where('source_type', filters.source_type);
    }
    if (filters.date_from) {
      query = query.where('transaction_date', '>=', filters.date_from);
    }
    if (filters.date_to) {
      query = query.where('transaction_date', '<=', filters.date_to);
    }
    if (filters.amount_min) {
      query = query.where('amount', '>=', filters.amount_min);
    }
    if (filters.amount_max) {
      query = query.where('amount', '<=', filters.amount_max);
    }
    if (filters.is_taxable !== undefined) {
      query = query.where('is_taxable', filters.is_taxable);
    }
    if (filters.needs_ai_review) {
      query = query.where('is_ai_verified', false)
        .where('manual_override', false);
    }

    // Get total count
    const totalResult = await query.clone().count('* as count').first();
    const total = parseInt(totalResult?.count as string) || 0;

    // Get paginated results
    const transactions = await query
      .orderBy('transaction_date', 'desc')
      .limit(pagination.limit)
      .offset((pagination.page - 1) * pagination.limit);

    return {
      transactions,
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  // Update AI classification
  public async updateAIClassification(
    transactionId: string,
    classification: {
      ai_category: string;
      ai_confidence: number;
      category?: string;
      subcategory?: string;
      is_taxable?: boolean;
    }
  ): Promise<void> {
    await this.knex(this.tableName)
      .where({ id: transactionId })
      .update({
        ...classification,
        updated_at: new Date(),
      });
  }

  // Verify AI classification
  public async verifyAIClassification(
    transactionId: string,
    userId: string,
    isCorrect: boolean,
    corrections?: Partial<ITransaction>
  ): Promise<void> {
    const updateData: any = {
      is_ai_verified: true,
      updated_at: new Date(),
    };

    if (!isCorrect && corrections) {
      updateData.manual_override = true;
      Object.assign(updateData, corrections);
    }

    await this.knex(this.tableName)
      .where({ id: transactionId })
      .update(updateData);
  }

  // Approve transaction
  public async approve(transactionId: string, userId: string): Promise<void> {
    await this.knex(this.tableName)
      .where({ id: transactionId })
      .update({
        status: 'approved',
        approved_by: userId,
        approved_at: new Date(),
        updated_at: new Date(),
      });
  }

  // Reject transaction
  public async reject(transactionId: string, userId: string): Promise<void> {
    await this.knex(this.tableName)
      .where({ id: transactionId })
      .update({
        status: 'rejected',
        approved_by: userId,
        approved_at: new Date(),
        updated_at: new Date(),
      });
  }

  // Mark for review
  public async markForReview(transactionId: string): Promise<void> {
    await this.knex(this.tableName)
      .where({ id: transactionId })
      .update({
        status: 'needs_review',
        updated_at: new Date(),
      });
  }

  // Get transactions by date range
  public async findByDateRange(
    companyId: string,
    startDate: Date,
    endDate: Date,
    transactionType?: 'income' | 'expense' | 'asset' | 'liability'
  ): Promise<ITransaction[]> {
    let query = this.knex(this.tableName)
      .where('company_id', companyId)
      .where('transaction_date', '>=', startDate)
      .where('transaction_date', '<=', endDate)
      .where('status', 'approved');

    if (transactionType) {
      query = query.where('transaction_type', transactionType);
    }

    const transactions = await query.orderBy('transaction_date');
    return transactions;
  }

  // Get transactions requiring AI review
  public async findNeedingAIReview(
    companyId?: string,
    limit = 100
  ): Promise<ITransaction[]> {
    let query = this.knex(this.tableName)
      .where('is_ai_verified', false)
      .where('manual_override', false)
      .where('status', 'pending');

    if (companyId) {
      query = query.where('company_id', companyId);
    }

    const transactions = await query
      .orderBy('created_at')
      .limit(limit);

    return transactions;
  }

  // Get transaction summary by category
  public async getSummaryByCategory(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    category: string;
    transaction_type: string;
    total_amount: number;
    transaction_count: number;
    avg_amount: number;
  }>> {
    const summary = await this.knex(this.tableName)
      .select(
        'category',
        'transaction_type',
        this.knex.raw('SUM(amount) as total_amount'),
        this.knex.raw('COUNT(*) as transaction_count'),
        this.knex.raw('AVG(amount) as avg_amount')
      )
      .where('company_id', companyId)
      .where('transaction_date', '>=', startDate)
      .where('transaction_date', '<=', endDate)
      .where('status', 'approved')
      .whereNotNull('category')
      .groupBy('category', 'transaction_type')
      .orderBy('total_amount', 'desc');

    return summary.map(item => ({
      category: item.category,
      transaction_type: item.transaction_type,
      total_amount: parseFloat(item.total_amount),
      transaction_count: parseInt(item.transaction_count),
      avg_amount: parseFloat(item.avg_amount),
    }));
  }

  // Get monthly transaction summary
  public async getMonthlySummary(
    companyId: string,
    year: number
  ): Promise<Array<{
    month: number;
    income: number;
    expenses: number;
    net: number;
    transaction_count: number;
  }>> {
    const summary = await this.knex(this.tableName)
      .select(
        this.knex.raw('EXTRACT(MONTH FROM transaction_date) as month'),
        this.knex.raw('SUM(CASE WHEN transaction_type = \'income\' THEN amount ELSE 0 END) as income'),
        this.knex.raw('SUM(CASE WHEN transaction_type = \'expense\' THEN amount ELSE 0 END) as expenses'),
        this.knex.raw('COUNT(*) as transaction_count')
      )
      .where('company_id', companyId)
      .where(this.knex.raw('EXTRACT(YEAR FROM transaction_date)'), year)
      .where('status', 'approved')
      .groupBy(this.knex.raw('EXTRACT(MONTH FROM transaction_date)'))
      .orderBy('month');

    return summary.map(item => ({
      month: parseInt(item.month),
      income: parseFloat(item.income),
      expenses: parseFloat(item.expenses),
      net: parseFloat(item.income) - parseFloat(item.expenses),
      transaction_count: parseInt(item.transaction_count),
    }));
  }

  // Search transactions
  public async search(
    companyId: string,
    searchTerm: string,
    filters: ITransactionFilter = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ transactions: ITransaction[]; total: number; page: number; limit: number }> {
    let query = this.knex(this.tableName)
      .where('company_id', companyId)
      .where(function() {
        this.where('description', 'ilike', `%${searchTerm}%`)
          .orWhere('description_arabic', 'ilike', `%${searchTerm}%`)
          .orWhere('reference_number', 'ilike', `%${searchTerm}%`)
          .orWhere('category', 'ilike', `%${searchTerm}%`);
      });

    // Apply filters (same as findByCompany)
    if (filters.transaction_type) {
      query = query.where('transaction_type', filters.transaction_type);
    }
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    if (filters.date_from) {
      query = query.where('transaction_date', '>=', filters.date_from);
    }
    if (filters.date_to) {
      query = query.where('transaction_date', '<=', filters.date_to);
    }

    // Get total count
    const totalResult = await query.clone().count('* as count').first();
    const total = parseInt(totalResult?.count as string) || 0;

    // Get paginated results
    const transactions = await query
      .orderBy('transaction_date', 'desc')
      .limit(pagination.limit)
      .offset((pagination.page - 1) * pagination.limit);

    return {
      transactions,
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  // Bulk import transactions
  public async bulkImport(
    transactions: ITransactionCreate[],
    sourceType: 'bank_import' | 'api_import' = 'bank_import'
  ): Promise<ITransaction[]> {
    const transactionsToInsert = transactions.map(transaction => ({
      ...transaction,
      currency: transaction.currency || 'AED',
      is_taxable: transaction.is_taxable !== false,
      vat_rate: transaction.vat_rate || 0,
      vat_amount: transaction.vat_amount || 0,
      is_ai_verified: false,
      manual_override: false,
      status: 'pending' as const,
      source_type: sourceType,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const inserted = await this.knex(this.tableName)
      .insert(transactionsToInsert)
      .returning('*');

    return inserted;
  }

  // Get duplicate transactions
  public async findDuplicates(
    companyId: string,
    transaction: Partial<ITransaction>
  ): Promise<ITransaction[]> {
    const duplicates = await this.knex(this.tableName)
      .where('company_id', companyId)
      .where('amount', transaction.amount)
      .where('transaction_date', transaction.transaction_date)
      .where('description', transaction.description)
      .whereNot('id', transaction.id || '');

    return duplicates;
  }

  // Get transaction statistics
  public async getStatistics(companyId: string, year?: number): Promise<{
    total_transactions: number;
    total_income: number;
    total_expenses: number;
    net_income: number;
    pending_count: number;
    ai_classified_count: number;
    avg_transaction_amount: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
  }> {
    let query = this.knex(this.tableName)
      .where('company_id', companyId);

    if (year) {
      query = query.where(this.knex.raw('EXTRACT(YEAR FROM transaction_date)'), year);
    }

    const [stats] = await query
      .select(
        this.knex.raw('COUNT(*) as total_transactions'),
        this.knex.raw('SUM(CASE WHEN transaction_type = \'income\' THEN amount ELSE 0 END) as total_income'),
        this.knex.raw('SUM(CASE WHEN transaction_type = \'expense\' THEN amount ELSE 0 END) as total_expenses'),
        this.knex.raw('COUNT(*) FILTER (WHERE status = \'pending\') as pending_count'),
        this.knex.raw('COUNT(*) FILTER (WHERE is_ai_verified = true) as ai_classified_count'),
        this.knex.raw('AVG(amount) as avg_transaction_amount')
      );

    const typeStats = await query.clone()
      .select('transaction_type')
      .count('* as count')
      .groupBy('transaction_type');

    const statusStats = await query.clone()
      .select('status')
      .count('* as count')
      .groupBy('status');

    const by_type: Record<string, number> = {};
    typeStats.forEach(stat => {
      by_type[stat.transaction_type] = parseInt(stat.count as string);
    });

    const by_status: Record<string, number> = {};
    statusStats.forEach(stat => {
      by_status[stat.status] = parseInt(stat.count as string);
    });

    return {
      total_transactions: parseInt(stats.total_transactions),
      total_income: parseFloat(stats.total_income) || 0,
      total_expenses: parseFloat(stats.total_expenses) || 0,
      net_income: (parseFloat(stats.total_income) || 0) - (parseFloat(stats.total_expenses) || 0),
      pending_count: parseInt(stats.pending_count),
      ai_classified_count: parseInt(stats.ai_classified_count),
      avg_transaction_amount: parseFloat(stats.avg_transaction_amount) || 0,
      by_type,
      by_status,
    };
  }
}