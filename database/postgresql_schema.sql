-- =============================================================================
-- TaxMaster AI - PostgreSQL Database Schema
-- UAE Corporate Tax AI Compliance System
-- Version: 1.0
-- Created: August 7, 2025
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. USER MANAGEMENT & AUTHENTICATION
-- =============================================================================

-- Users table for authentication and profile management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    uae_pass_id VARCHAR(100) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    preferred_language VARCHAR(10) DEFAULT 'en' CHECK (preferred_language IN ('en', 'ar')),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    email_verification_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Companies table for business entities
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_arabic VARCHAR(255),
    trade_license_number VARCHAR(100) UNIQUE NOT NULL,
    emirates VARCHAR(50) NOT NULL,
    business_activity TEXT,
    business_activity_arabic TEXT,
    establishment_date DATE,
    license_expiry_date DATE,
    po_box VARCHAR(50),
    address TEXT,
    address_arabic TEXT,
    phone VARCHAR(20),
    fax VARCHAR(20),
    website VARCHAR(255),
    annual_revenue DECIMAL(15,2),
    employee_count INTEGER,
    industry_sector VARCHAR(100),
    is_free_zone BOOLEAN DEFAULT false,
    free_zone_name VARCHAR(100),
    tax_registration_number VARCHAR(100),
    fta_registration_status VARCHAR(50) DEFAULT 'pending',
    subscription_plan VARCHAR(50) DEFAULT 'starter',
    subscription_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User roles and permissions
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User-Company-Role relationship
CREATE TABLE user_company_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, company_id)
);

-- =============================================================================
-- 2. TAX CONFIGURATION & CALCULATIONS
-- =============================================================================

-- Tax periods for company filings
CREATE TABLE tax_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    period_type VARCHAR(20) DEFAULT 'annual' CHECK (period_type IN ('quarterly', 'annual')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    filing_due_date DATE NOT NULL,
    payment_due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'filed', 'overdue', 'amended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tax calculations and liabilities
CREATE TABLE tax_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    tax_period_id UUID NOT NULL REFERENCES tax_periods(id),
    calculation_type VARCHAR(50) DEFAULT 'regular' CHECK (calculation_type IN ('regular', 'amended', 'estimated')),
    
    -- Revenue and Income
    total_revenue DECIMAL(15,2) DEFAULT 0,
    taxable_income DECIMAL(15,2) DEFAULT 0,
    exempt_income DECIMAL(15,2) DEFAULT 0,
    
    -- Tax Rates and Calculations
    applicable_rate DECIMAL(5,2) NOT NULL, -- 0%, 9%, or 15%
    tax_liability DECIMAL(15,2) DEFAULT 0,
    
    -- DMTT (if applicable)
    is_dmtt_applicable BOOLEAN DEFAULT false,
    dmtt_rate DECIMAL(5,2),
    dmtt_liability DECIMAL(15,2) DEFAULT 0,
    
    -- Free Zone Benefits
    free_zone_income DECIMAL(15,2) DEFAULT 0,
    free_zone_exemption DECIMAL(15,2) DEFAULT 0,
    
    -- Withholding and Credits
    withholding_tax_credit DECIMAL(15,2) DEFAULT 0,
    foreign_tax_credit DECIMAL(15,2) DEFAULT 0,
    
    -- Final Amounts
    total_tax_due DECIMAL(15,2) DEFAULT 0,
    amount_paid DECIMAL(15,2) DEFAULT 0,
    balance_due DECIMAL(15,2) DEFAULT 0,
    
    -- Calculation Metadata
    calculated_by UUID REFERENCES users(id),
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_final BOOLEAN DEFAULT false,
    ai_confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 3. TRANSACTION & EXPENSE MANAGEMENT
-- =============================================================================

-- Chart of accounts for expense categorization
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_name_arabic VARCHAR(255),
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'income', 'expense')),
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    is_tax_deductible BOOLEAN DEFAULT false,
    tax_treatment VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Financial transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('income', 'expense', 'asset', 'liability')),
    
    -- Transaction Details
    reference_number VARCHAR(100),
    description TEXT NOT NULL,
    description_arabic TEXT,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AED',
    transaction_date DATE NOT NULL,
    
    -- Categorization
    account_id UUID REFERENCES chart_of_accounts(id),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    -- AI Classification
    ai_category VARCHAR(100),
    ai_confidence DECIMAL(3,2),
    is_ai_verified BOOLEAN DEFAULT false,
    manual_override BOOLEAN DEFAULT false,
    
    -- Tax Treatment
    is_taxable BOOLEAN DEFAULT true,
    vat_rate DECIMAL(5,2) DEFAULT 0,
    vat_amount DECIMAL(15,2) DEFAULT 0,
    
    -- Source Information
    source_type VARCHAR(50) CHECK (source_type IN ('bank_import', 'manual_entry', 'document_ocr', 'api_import')),
    source_reference VARCHAR(255),
    bank_account_id UUID,
    
    -- Approval Workflow
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_review')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 4. BANK INTEGRATION
-- =============================================================================

-- Bank accounts for transaction imports
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(255),
    account_type VARCHAR(50) CHECK (account_type IN ('current', 'savings', 'credit')),
    currency VARCHAR(3) DEFAULT 'AED',
    iban VARCHAR(34),
    swift_code VARCHAR(11),
    
    -- Integration Details
    integration_type VARCHAR(50) CHECK (integration_type IN ('open_banking', 'file_upload', 'manual')),
    api_connection_id VARCHAR(255),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency VARCHAR(50) DEFAULT 'daily',
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, account_number)
);

-- =============================================================================
-- 5. COMPLIANCE & ALERTS
-- =============================================================================

-- Compliance rules and regulations
CREATE TABLE compliance_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_code VARCHAR(50) UNIQUE NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    rule_name_arabic VARCHAR(255),
    description TEXT,
    rule_type VARCHAR(50) CHECK (rule_type IN ('filing', 'payment', 'registration', 'disclosure')),
    
    -- Rule Conditions
    conditions JSONB,
    threshold_amount DECIMAL(15,2),
    deadline_days INTEGER,
    
    -- Severity and Actions
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    penalty_amount DECIMAL(15,2),
    required_action TEXT,
    
    effective_from DATE,
    effective_until DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Compliance monitoring and alerts
CREATE TABLE compliance_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES compliance_rules(id),
    alert_type VARCHAR(50) CHECK (alert_type IN ('deadline', 'violation', 'warning', 'opportunity')),
    
    -- Alert Details
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    due_date DATE,
    
    -- Status and Actions
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    action_required TEXT,
    action_taken TEXT,
    
    -- Notification
    notification_sent BOOLEAN DEFAULT false,
    notification_channels JSONB, -- email, sms, push
    
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 6. FTA INTEGRATION & FILINGS
-- =============================================================================

-- FTA filing submissions
CREATE TABLE fta_filings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    tax_period_id UUID NOT NULL REFERENCES tax_periods(id),
    filing_type VARCHAR(50) CHECK (filing_type IN ('registration', 'return', 'amendment', 'notification')),
    
    -- Filing Details
    submission_reference VARCHAR(100),
    emiratax_reference VARCHAR(100),
    filing_date DATE,
    due_date DATE,
    
    -- Status Tracking
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'accepted', 'rejected', 'amended')),
    submission_response JSONB,
    rejection_reason TEXT,
    
    -- Filing Content
    filing_data JSONB,
    xml_content TEXT,
    pdf_report_path VARCHAR(500),
    
    -- Submission Details
    submitted_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 7. AI & ML MODELS
-- =============================================================================

-- ML model performance tracking
CREATE TABLE ml_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) CHECK (model_type IN ('classification', 'regression', 'nlp', 'ocr')),
    version VARCHAR(20) NOT NULL,
    
    -- Model Metrics
    accuracy DECIMAL(5,4),
    precision_score DECIMAL(5,4),
    recall_score DECIMAL(5,4),
    f1_score DECIMAL(5,4),
    
    -- Model Configuration
    training_data_size INTEGER,
    model_parameters JSONB,
    deployment_status VARCHAR(50) DEFAULT 'active',
    
    deployed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI predictions and corrections
CREATE TABLE ai_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES ml_models(id),
    transaction_id UUID REFERENCES transactions(id),
    prediction_type VARCHAR(50) CHECK (prediction_type IN ('category', 'tax_treatment', 'amount', 'description')),
    
    -- Prediction Data
    input_features JSONB,
    predicted_value TEXT,
    confidence_score DECIMAL(5,4),
    
    -- Validation
    actual_value TEXT,
    is_correct BOOLEAN,
    user_feedback TEXT,
    corrected_by UUID REFERENCES users(id),
    corrected_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 8. AUDIT & LOGGING
-- =============================================================================

-- Comprehensive audit trail
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    user_id UUID REFERENCES users(id),
    
    -- Action Details
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    
    -- Change Tracking
    old_values JSONB,
    new_values JSONB,
    changes_summary TEXT,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System health and performance logs
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_level VARCHAR(20) CHECK (log_level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')),
    service_name VARCHAR(100),
    component VARCHAR(100),
    message TEXT,
    error_details JSONB,
    execution_time_ms INTEGER,
    memory_usage_mb INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 9. INDEXES FOR PERFORMANCE
-- =============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_uae_pass_id ON users(uae_pass_id);
CREATE INDEX idx_users_active ON users(is_active);

-- Companies indexes
CREATE INDEX idx_companies_trade_license ON companies(trade_license_number);
CREATE INDEX idx_companies_tax_reg ON companies(tax_registration_number);
CREATE INDEX idx_companies_subscription ON companies(subscription_plan, subscription_status);

-- Transactions indexes
CREATE INDEX idx_transactions_company_date ON transactions(company_id, transaction_date);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_amount ON transactions(amount);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_ai_category ON transactions(ai_category, ai_confidence);

-- Tax calculations indexes
CREATE INDEX idx_tax_calc_company_period ON tax_calculations(company_id, tax_period_id);
CREATE INDEX idx_tax_calc_date ON tax_calculations(calculation_date);

-- Compliance alerts indexes
CREATE INDEX idx_compliance_alerts_company ON compliance_alerts(company_id, status);
CREATE INDEX idx_compliance_alerts_due_date ON compliance_alerts(due_date, severity);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_company_date ON audit_logs(company_id, created_at);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- =============================================================================
-- 10. DEFAULT DATA SETUP
-- =============================================================================

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('owner', 'Company Owner - Full Access', '{"all": true}'),
('accountant', 'Accountant - Financial Management', '{"transactions": true, "reports": true, "filings": true}'),
('viewer', 'Read-only Access', '{"view_only": true}');

-- Insert default chart of accounts (UAE standard)
INSERT INTO chart_of_accounts (account_code, account_name, account_name_arabic, account_type, is_tax_deductible) VALUES
('1000', 'Cash and Bank', 'النقد والبنوك', 'asset', false),
('1100', 'Accounts Receivable', 'حسابات المدينين', 'asset', false),
('1200', 'Inventory', 'المخزون', 'asset', false),
('1300', 'Fixed Assets', 'الأصول الثابتة', 'asset', false),
('2000', 'Accounts Payable', 'حسابات الدائنين', 'liability', false),
('2100', 'Tax Payable', 'الضرائب المستحقة', 'liability', false),
('3000', 'Capital', 'رأس المال', 'equity', false),
('4000', 'Revenue', 'الإيرادات', 'income', false),
('5000', 'Cost of Goods Sold', 'تكلفة البضاعة المباعة', 'expense', true),
('6000', 'Operating Expenses', 'المصروفات التشغيلية', 'expense', true),
('6100', 'Salaries and Benefits', 'الرواتب والمنافع', 'expense', true),
('6200', 'Rent', 'الإيجار', 'expense', true),
('6300', 'Utilities', 'المرافق', 'expense', true),
('6400', 'Marketing', 'التسويق', 'expense', true),
('6500', 'Professional Services', 'الخدمات المهنية', 'expense', true);

-- Insert basic compliance rules
INSERT INTO compliance_rules (rule_code, rule_name, rule_name_arabic, rule_type, deadline_days, severity) VALUES
('CT001', 'Corporate Tax Registration', 'تسجيل ضريبة الشركات', 'registration', 90, 'critical'),
('CT002', 'Quarterly Return Filing', 'تقديم الإقرار الربعي', 'filing', 90, 'high'),
('CT003', 'Annual Tax Payment', 'دفع الضريبة السنوية', 'payment', 270, 'critical'),
('CT004', 'Tax Audit Response', 'الرد على التدقيق الضريبي', 'disclosure', 30, 'critical');

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================