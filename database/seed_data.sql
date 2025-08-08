-- =============================================================================
-- TaxMaster AI - Seed Data Script
-- UAE Corporate Tax AI Compliance System - Initial Data Population
-- Version: 1.0
-- Created: August 7, 2025
-- =============================================================================

-- This script populates the database with initial seed data for development and testing

-- =============================================================================
-- 1. SEED ROLES
-- =============================================================================

INSERT INTO roles (id, name, description, permissions) VALUES 
(uuid_generate_v4(), 'super_admin', 'System Administrator', '{"all": true, "system_config": true, "user_management": true}'),
(uuid_generate_v4(), 'company_owner', 'Company Owner - Full Access', '{"company_full": true, "users": true, "billing": true}'),
(uuid_generate_v4(), 'accountant', 'Accountant - Financial Management', '{"transactions": true, "reports": true, "filings": true, "documents": true}'),
(uuid_generate_v4(), 'bookkeeper', 'Bookkeeper - Transaction Entry', '{"transactions": true, "documents": true}'),
(uuid_generate_v4(), 'viewer', 'Read-only Access', '{"view_only": true, "reports": true}'),
(uuid_generate_v4(), 'auditor', 'External Auditor Access', '{"audit_read": true, "reports": true, "export": true}');

-- =============================================================================
-- 2. SEED CHART OF ACCOUNTS (UAE STANDARD)
-- =============================================================================

-- Assets
INSERT INTO chart_of_accounts (account_code, account_name, account_name_arabic, account_type, is_tax_deductible, tax_treatment) VALUES
('1001', 'Cash in Hand', 'النقد في الخزينة', 'asset', false, 'non_deductible'),
('1002', 'Bank Accounts', 'الحسابات البنكية', 'asset', false, 'non_deductible'),
('1003', 'Petty Cash', 'النثرية', 'asset', false, 'non_deductible'),
('1101', 'Accounts Receivable - Trade', 'حسابات المدينين التجاريين', 'asset', false, 'non_deductible'),
('1102', 'Notes Receivable', 'أوراق القبض', 'asset', false, 'non_deductible'),
('1103', 'Advances to Suppliers', 'سلف للموردين', 'asset', false, 'non_deductible'),
('1104', 'Employee Advances', 'سلف الموظفين', 'asset', false, 'non_deductible'),
('1201', 'Inventory - Raw Materials', 'مخزون المواد الخام', 'asset', false, 'non_deductible'),
('1202', 'Inventory - Finished Goods', 'مخزون البضاعة الجاهزة', 'asset', false, 'non_deductible'),
('1203', 'Inventory - Work in Progress', 'مخزون الإنتاج تحت التشغيل', 'asset', false, 'non_deductible'),
('1301', 'Land', 'الأراضي', 'asset', false, 'non_deductible'),
('1302', 'Buildings', 'المباني', 'asset', false, 'depreciable'),
('1303', 'Machinery & Equipment', 'الآلات والمعدات', 'asset', false, 'depreciable'),
('1304', 'Vehicles', 'المركبات', 'asset', false, 'depreciable'),
('1305', 'Furniture & Fixtures', 'الأثاث والتركيبات', 'asset', false, 'depreciable'),
('1306', 'Computer Equipment', 'معدات الحاسوب', 'asset', false, 'depreciable'),
('1307', 'Accumulated Depreciation', 'مجمع الإهلاك', 'asset', false, 'non_deductible');

-- Liabilities
INSERT INTO chart_of_accounts (account_code, account_name, account_name_arabic, account_type, is_tax_deductible, tax_treatment) VALUES
('2001', 'Accounts Payable - Trade', 'حسابات الدائنين التجاريين', 'liability', false, 'non_deductible'),
('2002', 'Notes Payable', 'أوراق الدفع', 'liability', false, 'non_deductible'),
('2003', 'Accrued Expenses', 'المصروفات المستحقة', 'liability', false, 'non_deductible'),
('2101', 'Corporate Tax Payable', 'ضريبة الشركات المستحقة', 'liability', false, 'non_deductible'),
('2102', 'VAT Payable', 'ضريبة القيمة المضافة المستحقة', 'liability', false, 'non_deductible'),
('2103', 'Withholding Tax Payable', 'ضريبة الاستقطاع المستحقة', 'liability', false, 'non_deductible'),
('2201', 'Salaries Payable', 'الرواتب المستحقة', 'liability', false, 'non_deductible'),
('2202', 'End of Service Benefits', 'مخصص مكافأة نهاية الخدمة', 'liability', false, 'non_deductible'),
('2203', 'Social Security Payable', 'التأمينات الاجتماعية المستحقة', 'liability', false, 'non_deductible'),
('2301', 'Bank Loans - Short Term', 'القروض البنكية قصيرة الأجل', 'liability', false, 'non_deductible'),
('2302', 'Bank Loans - Long Term', 'القروض البنكية طويلة الأجل', 'liability', false, 'non_deductible');

-- Equity
INSERT INTO chart_of_accounts (account_code, account_name, account_name_arabic, account_type, is_tax_deductible, tax_treatment) VALUES
('3001', 'Share Capital', 'رأس المال', 'equity', false, 'non_deductible'),
('3002', 'Retained Earnings', 'الأرباح المحتجزة', 'equity', false, 'non_deductible'),
('3003', 'Current Year Profit/Loss', 'ربح/خسارة السنة الحالية', 'equity', false, 'non_deductible');

-- Revenue/Income
INSERT INTO chart_of_accounts (account_code, account_name, account_name_arabic, account_type, is_tax_deductible, tax_treatment) VALUES
('4001', 'Sales Revenue', 'إيرادات المبيعات', 'income', false, 'taxable_income'),
('4002', 'Service Revenue', 'إيرادات الخدمات', 'income', false, 'taxable_income'),
('4003', 'Commission Income', 'إيرادات العمولات', 'income', false, 'taxable_income'),
('4004', 'Rental Income', 'إيرادات الإيجار', 'income', false, 'taxable_income'),
('4005', 'Interest Income', 'إيرادات الفوائد', 'income', false, 'taxable_income'),
('4006', 'Foreign Exchange Gain', 'أرباح صرف العملات', 'income', false, 'taxable_income'),
('4007', 'Other Income', 'إيرادات أخرى', 'income', false, 'taxable_income');

-- Cost of Goods Sold
INSERT INTO chart_of_accounts (account_code, account_name, account_name_arabic, account_type, is_tax_deductible, tax_treatment) VALUES
('5001', 'Cost of Materials', 'تكلفة المواد', 'expense', true, 'deductible'),
('5002', 'Direct Labor', 'العمالة المباشرة', 'expense', true, 'deductible'),
('5003', 'Manufacturing Overhead', 'التكاليف الصناعية غير المباشرة', 'expense', true, 'deductible'),
('5004', 'Cost of Goods Purchased', 'تكلفة البضاعة المشتراة', 'expense', true, 'deductible');

-- Operating Expenses
INSERT INTO chart_of_accounts (account_code, account_name, account_name_arabic, account_type, is_tax_deductible, tax_treatment) VALUES
('6001', 'Salaries and Wages', 'الرواتب والأجور', 'expense', true, 'deductible'),
('6002', 'Employee Benefits', 'منافع الموظفين', 'expense', true, 'deductible'),
('6003', 'End of Service Provision', 'مخصص نهاية الخدمة', 'expense', true, 'deductible'),
('6101', 'Office Rent', 'إيجار المكاتب', 'expense', true, 'deductible'),
('6102', 'Warehouse Rent', 'إيجار المستودعات', 'expense', true, 'deductible'),
('6201', 'Electricity', 'الكهرباء', 'expense', true, 'deductible'),
('6202', 'Water', 'المياه', 'expense', true, 'deductible'),
('6203', 'Telephone & Internet', 'الهاتف والإنترنت', 'expense', true, 'deductible'),
('6301', 'Advertising', 'الإعلان', 'expense', true, 'deductible'),
('6302', 'Marketing Campaigns', 'الحملات التسويقية', 'expense', true, 'deductible'),
('6303', 'Website & Digital Marketing', 'الموقع والتسويق الرقمي', 'expense', true, 'deductible'),
('6401', 'Legal Fees', 'الرسوم القانونية', 'expense', true, 'deductible'),
('6402', 'Audit Fees', 'رسوم التدقيق', 'expense', true, 'deductible'),
('6403', 'Consulting Fees', 'رسوم الاستشارات', 'expense', true, 'deductible'),
('6404', 'Tax Advisory Fees', 'رسوم الاستشارات الضريبية', 'expense', true, 'deductible'),
('6501', 'Office Supplies', 'المستلزمات المكتبية', 'expense', true, 'deductible'),
('6502', 'Printing & Stationery', 'الطباعة والقرطاسية', 'expense', true, 'deductible'),
('6503', 'Cleaning Supplies', 'مستلزمات التنظيف', 'expense', true, 'deductible'),
('6601', 'Vehicle Fuel', 'وقود المركبات', 'expense', true, 'deductible'),
('6602', 'Vehicle Maintenance', 'صيانة المركبات', 'expense', true, 'deductible'),
('6603', 'Vehicle Insurance', 'تأمين المركبات', 'expense', true, 'deductible'),
('6701', 'Equipment Maintenance', 'صيانة المعدات', 'expense', true, 'deductible'),
('6702', 'Software Licenses', 'تراخيص البرمجيات', 'expense', true, 'deductible'),
('6703', 'IT Support', 'الدعم التقني', 'expense', true, 'deductible'),
('6801', 'Bank Charges', 'رسوم بنكية', 'expense', true, 'deductible'),
('6802', 'Credit Card Fees', 'رسوم البطاقات الائتمانية', 'expense', true, 'deductible'),
('6901', 'Travel Expenses', 'مصروفات السفر', 'expense', true, 'deductible'),
('6902', 'Business Meals', 'وجبات العمل', 'expense', true, 'partially_deductible'),
('6903', 'Entertainment', 'الضيافة', 'expense', true, 'partially_deductible'),
('7001', 'Depreciation Expense', 'مصروف الإهلاك', 'expense', true, 'deductible'),
('7002', 'Bad Debt Expense', 'مصروف الديون المعدومة', 'expense', true, 'deductible'),
('7003', 'Insurance Expense', 'مصروف التأمين', 'expense', true, 'deductible'),
('7004', 'Interest Expense', 'مصروف الفوائد', 'expense', true, 'deductible'),
('7005', 'Foreign Exchange Loss', 'خسائر صرف العملات', 'expense', true, 'deductible');

-- =============================================================================
-- 3. SEED COMPLIANCE RULES
-- =============================================================================

INSERT INTO compliance_rules (rule_code, rule_name, rule_name_arabic, rule_type, description, conditions, threshold_amount, deadline_days, severity, penalty_amount, required_action, effective_from, is_active) VALUES
('CT-REG-001', 'Corporate Tax Registration', 'تسجيل ضريبة الشركات', 'registration', 'Companies must register for corporate tax within the specified timeframe', '{"revenue_threshold": 375000, "business_activity": "taxable"}', 375000.00, 90, 'critical', 10000.00, 'Register with FTA through EmaraTax portal', '2023-06-01', true),
('CT-RTN-001', 'Corporate Tax Return Filing', 'تقديم إقرار ضريبة الشركات', 'filing', 'Annual corporate tax return must be filed within 9 months of financial year end', '{"filing_period": "annual"}', NULL, 270, 'critical', 5000.00, 'File annual return through EmaraTax portal', '2023-06-01', true),
('CT-PAY-001', 'Corporate Tax Payment', 'دفع ضريبة الشركات', 'payment', 'Corporate tax payment due within 9 months of financial year end', '{"tax_due": "> 0"}', 0.01, 270, 'critical', 0.05, 'Pay outstanding tax liability', '2023-06-01', true),
('CT-NOT-001', 'Business Activity Notification', 'إشعار النشاط التجاري', 'disclosure', 'Notify FTA of significant business activity changes', '{"activity_change": true}', NULL, 20, 'high', 2000.00, 'Submit notification through EmaraTax portal', '2023-06-01', true),
('CT-TRF-001', 'Transfer Pricing Documentation', 'وثائق التسعير التحويلي', 'disclosure', 'Maintain transfer pricing documentation for related party transactions', '{"related_party_transactions": "> 10000000"}', 10000000.00, 365, 'medium', 50000.00, 'Prepare and maintain TP documentation', '2023-06-01', true),
('VAT-REG-001', 'VAT Registration', 'تسجيل ضريبة القيمة المضافة', 'registration', 'VAT registration required when taxable supplies exceed threshold', '{"taxable_supplies": 187500}', 187500.00, 30, 'high', 20000.00, 'Register for VAT with FTA', '2018-01-01', true),
('VAT-RTN-001', 'VAT Return Filing', 'تقديم إقرار ضريبة القيمة المضافة', 'filing', 'Monthly or quarterly VAT returns must be filed', '{"vat_registered": true}', NULL, 28, 'high', 1000.00, 'File VAT return through EmaraTax portal', '2018-01-01', true);

-- =============================================================================
-- 4. SEED ML MODELS
-- =============================================================================

INSERT INTO ml_models (model_name, model_type, version, accuracy, precision_score, recall_score, f1_score, training_data_size, model_parameters, deployment_status, deployed_at) VALUES
('expense_classifier_v1', 'classification', '1.0.0', 0.9345, 0.9289, 0.9401, 0.9344, 50000, '{"algorithm": "random_forest", "n_estimators": 100, "max_depth": 15, "features": ["amount", "description", "vendor", "date"]}', 'active', CURRENT_TIMESTAMP),
('amount_extractor_v1', 'regression', '1.0.0', 0.9678, 0.9645, 0.9712, 0.9678, 30000, '{"algorithm": "neural_network", "layers": [128, 64, 32], "activation": "relu", "dropout": 0.2}', 'active', CURRENT_TIMESTAMP),
('ocr_processor_v1', 'nlp', '1.0.0', 0.9234, 0.9189, 0.9278, 0.9233, 75000, '{"model": "tesseract", "language": ["eng", "ara"], "preprocessing": "adaptive_threshold"}', 'active', CURRENT_TIMESTAMP),
('tax_optimizer_v1', 'classification', '1.0.0', 0.8956, 0.8923, 0.8989, 0.8956, 25000, '{"algorithm": "gradient_boosting", "n_estimators": 200, "learning_rate": 0.1, "max_depth": 10}', 'active', CURRENT_TIMESTAMP);

-- =============================================================================
-- 5. SEED DEMO COMPANIES (FOR DEVELOPMENT/TESTING)
-- =============================================================================

-- Demo Company 1: Small Trading Business
INSERT INTO companies (id, name, name_arabic, trade_license_number, emirates, business_activity, business_activity_arabic, establishment_date, license_expiry_date, po_box, address, address_arabic, phone, annual_revenue, employee_count, industry_sector, is_free_zone, subscription_plan, subscription_status) VALUES
(uuid_generate_v4(), 'Al Noor Trading LLC', 'النور للتجارة ذ.م.م', 'CN-1234567', 'Dubai', 'Trading in Electronics and Consumer Goods', 'تجارة الإلكترونيات والسلع الاستهلاكية', '2020-03-15', '2025-03-14', '12345', 'Office 101, Building A, Dubai', 'مكتب 101، مبنى أ، دبي', '+971-4-1234567', 2500000.00, 12, 'Trading', false, 'professional', 'active');

-- Demo Company 2: Service Provider
INSERT INTO companies (id, name, name_arabic, trade_license_number, emirates, business_activity, business_activity_arabic, establishment_date, license_expiry_date, po_box, address, address_arabic, phone, annual_revenue, employee_count, industry_sector, is_free_zone, subscription_plan, subscription_status) VALUES
(uuid_generate_v4(), 'Emirates Consulting Services', 'الإمارات للخدمات الاستشارية', 'CN-2345678', 'Abu Dhabi', 'Management and Business Consulting', 'الإدارة والاستشارات التجارية', '2019-07-10', '2024-07-09', '23456', 'Floor 5, Tower B, Abu Dhabi', 'الطابق 5، برج ب، أبو ظبي', '+971-2-2345678', 1800000.00, 25, 'Services', false, 'professional', 'active');

-- Demo Company 3: Free Zone Entity
INSERT INTO companies (id, name, name_arabic, trade_license_number, emirates, business_activity, business_activity_arabic, establishment_date, license_expiry_date, po_box, address, address_arabic, phone, annual_revenue, employee_count, industry_sector, is_free_zone, free_zone_name, subscription_plan, subscription_status) VALUES
(uuid_generate_v4(), 'DIFC Tech Solutions FZ-LLC', 'حلول ديفك التقنية ش.ذ.م.م', 'FZ-3456789', 'Dubai', 'Software Development and IT Services', 'تطوير البرمجيات وخدمات تقنية المعلومات', '2021-01-20', '2026-01-19', '34567', 'Level 10, Gate Building, DIFC', 'المستوى 10، مبنى الباب، ديفك', '+971-4-3456789', 8500000.00, 45, 'Technology', true, 'Dubai International Financial Centre', 'enterprise', 'active');

-- =============================================================================
-- 6. SEED DEMO USERS
-- =============================================================================

-- Demo User 1: Company Owner
INSERT INTO users (id, email, first_name, last_name, phone, preferred_language, is_active, is_verified) VALUES
(uuid_generate_v4(), 'owner@alnoortrading.ae', 'Ahmad', 'Al Mansouri', '+971-50-1234567', 'en', true, true);

-- Demo User 2: Accountant
INSERT INTO users (id, email, first_name, last_name, phone, preferred_language, is_active, is_verified) VALUES
(uuid_generate_v4(), 'accountant@emiratesconsulting.ae', 'Fatima', 'Al Zahra', '+971-55-2345678', 'ar', true, true);

-- Demo User 3: Admin User
INSERT INTO users (id, email, first_name, last_name, phone, preferred_language, is_active, is_verified) VALUES
(uuid_generate_v4(), 'admin@taxmaster.ai', 'System', 'Administrator', '+971-4-5555555', 'en', true, true);

-- =============================================================================
-- 7. SEED DEMO TAX PERIODS
-- =============================================================================

-- Current tax periods for demo companies
INSERT INTO tax_periods (company_id, period_type, start_date, end_date, filing_due_date, payment_due_date, status) 
SELECT 
    c.id as company_id,
    'annual' as period_type,
    '2024-01-01'::date as start_date,
    '2024-12-31'::date as end_date,
    '2025-09-30'::date as filing_due_date,
    '2025-09-30'::date as payment_due_date,
    'active' as status
FROM companies c
WHERE c.name IN ('Al Noor Trading LLC', 'Emirates Consulting Services', 'DIFC Tech Solutions FZ-LLC');

-- =============================================================================
-- 8. COMPLETION MESSAGE
-- =============================================================================

-- Insert completion log
INSERT INTO system_logs (log_level, service_name, component, message) 
VALUES ('INFO', 'database', 'seed_data', 'Seed data population completed successfully');

-- Display completion summary
SELECT 
    'Seed Data Population Completed' as status,
    (SELECT COUNT(*) FROM roles) as roles_created,
    (SELECT COUNT(*) FROM chart_of_accounts) as accounts_created,
    (SELECT COUNT(*) FROM compliance_rules) as rules_created,
    (SELECT COUNT(*) FROM ml_models) as models_created,
    (SELECT COUNT(*) FROM companies) as demo_companies,
    (SELECT COUNT(*) FROM users) as demo_users,
    CURRENT_TIMESTAMP as completed_at;