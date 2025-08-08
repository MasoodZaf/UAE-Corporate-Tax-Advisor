/**
 * Base Model Class
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export interface IBaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export abstract class BaseModel<T extends IBaseEntity> {
  protected knex: Knex;
  protected abstract tableName: string;

  constructor(knex: Knex) {
    this.knex = knex;
  }

  // Standard CRUD operations

  /**
   * Find entity by ID
   */
  public async findById(id: string): Promise<T | null> {
    const result = await this.knex(this.tableName)
      .where({ id })
      .first();
    
    return result || null;
  }

  /**
   * Find all entities with optional filters
   */
  public async findAll(
    filters: Partial<T> = {},
    options: {
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<T[]> {
    let query = this.knex(this.tableName);

    // Apply filters
    if (Object.keys(filters).length > 0) {
      query = query.where(filters);
    }

    // Apply ordering
    if (options.orderBy) {
      query = query.orderBy(options.orderBy, options.orderDirection || 'asc');
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.offset(options.offset);
    }

    return await query;
  }

  /**
   * Find one entity with filters
   */
  public async findOne(filters: Partial<T>): Promise<T | null> {
    const result = await this.knex(this.tableName)
      .where(filters)
      .first();
    
    return result || null;
  }

  /**
   * Create a new entity
   */
  public async insert(data: Partial<T>): Promise<T> {
    const entityData = {
      id: uuidv4(),
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [created] = await this.knex(this.tableName)
      .insert(entityData)
      .returning('*');

    return created;
  }

  /**
   * Update an entity by ID
   */
  public async update(id: string, data: Partial<T>): Promise<T | null> {
    const updateData = {
      ...data,
      updated_at: new Date(),
    };

    const [updated] = await this.knex(this.tableName)
      .where({ id })
      .update(updateData)
      .returning('*');

    return updated || null;
  }

  /**
   * Delete an entity by ID
   */
  public async delete(id: string): Promise<boolean> {
    const deletedCount = await this.knex(this.tableName)
      .where({ id })
      .del();

    return deletedCount > 0;
  }

  /**
   * Soft delete an entity (if the table has is_active column)
   */
  public async softDelete(id: string): Promise<boolean> {
    try {
      const updatedCount = await this.knex(this.tableName)
        .where({ id })
        .update({
          is_active: false,
          updated_at: new Date(),
        });

      return updatedCount > 0;
    } catch (error) {
      // If is_active column doesn't exist, fall back to hard delete
      return await this.delete(id);
    }
  }

  /**
   * Count entities with optional filters
   */
  public async count(filters: Partial<T> = {}): Promise<number> {
    const result = await this.knex(this.tableName)
      .where(filters)
      .count('* as count')
      .first();

    return parseInt(result?.count as string) || 0;
  }

  /**
   * Check if entity exists
   */
  public async exists(filters: Partial<T>): Promise<boolean> {
    const count = await this.count(filters);
    return count > 0;
  }

  /**
   * Paginated query
   */
  public async paginate(
    filters: Partial<T> = {},
    options: {
      page: number;
      limit: number;
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { page, limit, orderBy, orderDirection } = options;
    const offset = (page - 1) * limit;

    // Get total count
    const total = await this.count(filters);

    // Get data
    const data = await this.findAll(filters, {
      orderBy,
      orderDirection,
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Bulk insert
   */
  public async bulkInsert(items: Partial<T>[]): Promise<T[]> {
    const dataToInsert = items.map(item => ({
      id: uuidv4(),
      ...item,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const created = await this.knex(this.tableName)
      .insert(dataToInsert)
      .returning('*');

    return created;
  }

  /**
   * Bulk update
   */
  public async bulkUpdate(updates: { id: string; data: Partial<T> }[]): Promise<void> {
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

  /**
   * Batch delete
   */
  public async batchDelete(ids: string[]): Promise<number> {
    const deletedCount = await this.knex(this.tableName)
      .whereIn('id', ids)
      .del();

    return deletedCount;
  }

  /**
   * Search with text similarity (requires pg_trgm extension)
   */
  public async searchText(
    columns: string[],
    searchTerm: string,
    options: {
      threshold?: number;
      limit?: number;
      orderBy?: 'similarity' | string;
    } = {}
  ): Promise<T[]> {
    const { threshold = 0.3, limit = 20, orderBy = 'similarity' } = options;

    let query = this.knex(this.tableName);

    // Build similarity query
    if (columns.length === 1) {
      query = query
        .select('*')
        .where(this.knex.raw(`similarity(${columns[0]}, ?) > ?`, [searchTerm, threshold]));
      
      if (orderBy === 'similarity') {
        query = query.orderByRaw(`similarity(${columns[0]}, ?) DESC`, [searchTerm]);
      }
    } else {
      // Multiple columns - combine with CONCAT
      const concatColumns = columns.join(`, ' ', `);
      query = query
        .select('*')
        .where(this.knex.raw(`similarity(CONCAT(${concatColumns}), ?) > ?`, [searchTerm, threshold]));
      
      if (orderBy === 'similarity') {
        query = query.orderByRaw(`similarity(CONCAT(${concatColumns}), ?) DESC`, [searchTerm]);
      }
    }

    if (orderBy !== 'similarity') {
      query = query.orderBy(orderBy);
    }

    if (limit) {
      query = query.limit(limit);
    }

    return await query;
  }

  /**
   * Execute raw query
   */
  public async raw(query: string, params?: any[]): Promise<any> {
    return await this.knex.raw(query, params);
  }

  /**
   * Get query builder for complex queries
   */
  public getQueryBuilder(): Knex.QueryBuilder {
    return this.knex(this.tableName);
  }

  /**
   * Execute within transaction
   */
  public async transaction<R>(
    callback: (trx: Knex.Transaction) => Promise<R>
  ): Promise<R> {
    return await this.knex.transaction(callback);
  }

  /**
   * Upsert (insert or update)
   */
  public async upsert(
    data: Partial<T>,
    conflictColumns: string[] = ['id']
  ): Promise<T> {
    const entityData = {
      id: uuidv4(),
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const conflictClause = conflictColumns.join(', ');
    const updateClause = Object.keys(entityData)
      .filter(key => !conflictColumns.includes(key) && key !== 'created_at')
      .map(key => `${key} = EXCLUDED.${key}`)
      .join(', ');

    const [result] = await this.knex.raw(`
      INSERT INTO ${this.tableName} (${Object.keys(entityData).join(', ')})
      VALUES (${Object.keys(entityData).map(() => '?').join(', ')})
      ON CONFLICT (${conflictClause}) 
      DO UPDATE SET ${updateClause}
      RETURNING *
    `, Object.values(entityData));

    return result;
  }

  /**
   * Get table info
   */
  public async getTableInfo(): Promise<any> {
    return await this.knex(this.tableName).columnInfo();
  }

  /**
   * Truncate table (use with caution!)
   */
  public async truncate(): Promise<void> {
    await this.knex(this.tableName).truncate();
  }
}