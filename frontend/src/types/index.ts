/**
 * TypeScript Type Definitions
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  preferred_language: 'en' | 'ar';
  role: 'admin' | 'user' | 'accountant' | 'viewer';
  is_verified: boolean;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  trade_license_number: string;
  emirates: 'Abu Dhabi' | 'Dubai' | 'Sharjah' | 'Ajman' | 'Umm Al-Quwain' | 'Ras Al Khaimah' | 'Fujairah';
  business_activity: string;
  annual_revenue?: number;
  employee_count?: number;
  is_freezone: boolean;
  is_small_business: boolean;
  tax_registration_number?: string;
  vat_registration_number?: string;
  subscription_plan: 'starter' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  company_id: string;
  transaction_date: string;
  description: string;
  amount: number;
  currency: 'AED' | 'USD' | 'EUR';
  category: string;
  subcategory?: string;
  classification: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity';
  tax_category: 'taxable' | 'exempt' | 'zero_rated';
  tax_amount: number;
  tax_rate: number;
  is_ai_classified: boolean;
  confidence_score?: number;
  supporting_documents?: string[];
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  company_id: string;
  file_name: string;
  file_type: 'receipt' | 'invoice' | 'contract' | 'bank_statement' | 'other';
  file_size: number;
  file_url: string;
  ocr_status: 'pending' | 'processing' | 'completed' | 'failed';
  ocr_data?: any;
  extracted_data?: {
    amount?: number;
    date?: string;
    vendor?: string;
    category?: string;
  };
  confidence_score?: number;
  is_processed: boolean;
  uploaded_by: string;
  uploaded_at: string;
  processed_at?: string;
}

export interface TaxCalculation {
  gross_revenue: number;
  total_expenses: number;
  taxable_income: number;
  applicable_rate: number;
  corporate_tax: number;
  small_business_relief?: number;
  final_tax_amount: number;
  due_date: string;
  quarter: string;
  year: number;
}

export interface DashboardStats {
  total_revenue: number;
  total_expenses: number;
  taxable_income: number;
  estimated_tax: number;
  documents_processed: number;
  pending_documents: number;
  compliance_score: number;
  last_calculation: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name: string;
  trade_license_number: string;
  emirates: Company['emirates'];
  business_activity: string;
  preferred_language?: 'en' | 'ar';
}

export interface FileUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface UAETaxRules {
  corporateTaxRate: number;
  smallBusinessThreshold: number;
  dmttThreshold: number;
  vatThreshold: number;
  freezoneExemption: boolean;
}

export interface ComplianceCheck {
  id: string;
  company_id: string;
  check_type: 'monthly' | 'quarterly' | 'annual';
  period_start: string;
  period_end: string;
  status: 'compliant' | 'non_compliant' | 'pending_review';
  issues: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
  score: number;
  created_at: string;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Form types
export interface TransactionFormData {
  transaction_date: string;
  description: string;
  amount: number;
  currency: 'AED' | 'USD' | 'EUR';
  category: string;
  classification: Transaction['classification'];
  notes?: string;
}

export interface CompanyFormData {
  name: string;
  trade_license_number: string;
  emirates: Company['emirates'];
  business_activity: string;
  annual_revenue?: number;
  employee_count?: number;
  is_freezone: boolean;
  tax_registration_number?: string;
  vat_registration_number?: string;
}