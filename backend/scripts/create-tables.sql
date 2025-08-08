-- TaxMaster AI Database Schema
-- UAE Corporate Tax Compliance System

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user', 'accountant', 'viewer')),
    preferred_language VARCHAR(5) DEFAULT 'en' CHECK (preferred_language IN ('en', 'ar')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP,
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Companies table
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    trade_license_number VARCHAR(50) UNIQUE NOT NULL,
    emirates VARCHAR(50) NOT NULL CHECK (emirates IN ('Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al-Quwain', 'Ras Al Khaimah', 'Fujairah')),
    business_activity TEXT NOT NULL,
    annual_revenue DECIMAL(15,2),
    employee_count INTEGER,
    is_freezone BOOLEAN DEFAULT FALSE,
    is_small_business BOOLEAN DEFAULT FALSE,
    tax_registration_number VARCHAR(50),
    vat_registration_number VARCHAR(50),
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    website VARCHAR(255),
    subscription_plan VARCHAR(20) DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'professional', 'enterprise')),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'cancelled')),
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create User-Company relationships table
CREATE TABLE IF NOT EXISTS user_companies (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,
    company_id VARCHAR(36) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'accountant', 'user', 'viewer')),
    is_primary BOOLEAN DEFAULT FALSE,
    permissions TEXT,
    invited_by VARCHAR(36),
    invited_at TIMESTAMP,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(user_id, company_id)
);

-- Create Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(5) DEFAULT 'AED' CHECK (currency IN ('AED', 'USD', 'EUR', 'GBP', 'SAR')),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    classification VARCHAR(20) NOT NULL CHECK (classification IN ('revenue', 'expense', 'asset', 'liability', 'equity')),
    tax_category VARCHAR(20) NOT NULL CHECK (tax_category IN ('taxable', 'exempt', 'zero_rated')),
    tax_amount DECIMAL(15,2) DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0,
    is_ai_classified BOOLEAN DEFAULT FALSE,
    confidence_score DECIMAL(3,2),
    supporting_documents TEXT[], -- Array of document URLs/IDs
    tags TEXT[], -- Array of tags
    notes TEXT,
    reference_number VARCHAR(100),
    invoice_number VARCHAR(100),
    receipt_number VARCHAR(100),
    bank_reference VARCHAR(100),
    created_by VARCHAR(36) NOT NULL,
    approved_by VARCHAR(36),
    approved_at TIMESTAMP,
    reconciled BOOLEAN DEFAULT FALSE,
    reconciled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create Documents table (for file storage metadata)
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('receipt', 'invoice', 'contract', 'bank_statement', 'tax_document', 'other')),
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100),
    file_extension VARCHAR(10),
    ocr_status VARCHAR(20) DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
    ocr_data JSONB,
    extracted_data JSONB,
    confidence_score DECIMAL(3,2),
    is_processed BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    notes TEXT,
    uploaded_by VARCHAR(36) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Create Compliance Checks table
CREATE TABLE IF NOT EXISTS compliance_checks (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id VARCHAR(36) NOT NULL,
    check_type VARCHAR(20) NOT NULL CHECK (check_type IN ('monthly', 'quarterly', 'annual')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
    issues JSONB,
    recommendations JSONB,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_companies_license ON companies(trade_license_number);
CREATE INDEX IF NOT EXISTS idx_companies_plan ON companies(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(subscription_status);

CREATE INDEX IF NOT EXISTS idx_user_companies_user ON user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company ON user_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_role ON user_companies(role);

CREATE INDEX IF NOT EXISTS idx_transactions_company ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_classification ON transactions(classification);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount);

CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(ocr_status);

CREATE INDEX IF NOT EXISTS idx_compliance_company ON compliance_checks(company_id);
CREATE INDEX IF NOT EXISTS idx_compliance_period ON compliance_checks(period_start, period_end);