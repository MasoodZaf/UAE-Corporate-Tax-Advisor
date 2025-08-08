-- =============================================================================
-- TaxMaster AI - Database Setup Script
-- UAE Corporate Tax AI Compliance System
-- Version: 1.0
-- Created: August 7, 2025
-- =============================================================================

-- This script sets up the database environment for TaxMaster AI

-- =============================================================================
-- 1. CREATE DATABASE AND USER
-- =============================================================================

-- Create database (run as postgres superuser)
CREATE DATABASE taxmaster_ai
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Create application user
CREATE USER taxmaster_app WITH
    PASSWORD 'TaxM@ster2025!'
    CREATEDB
    NOSUPERUSER
    NOCREATEROLE;

-- Grant privileges to application user
GRANT ALL PRIVILEGES ON DATABASE taxmaster_ai TO taxmaster_app;

-- Connect to the new database
\c taxmaster_ai;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO taxmaster_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO taxmaster_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO taxmaster_app;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO taxmaster_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO taxmaster_app;

-- =============================================================================
-- 2. ENVIRONMENT-SPECIFIC CONFIGURATIONS
-- =============================================================================

-- Development environment settings
-- (These would be different for staging/production)

-- Enable query logging for development
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 100;

-- Performance settings for development
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET track_functions = 'all';

-- Reload configuration
SELECT pg_reload_conf();

-- =============================================================================
-- 3. CREATE SCHEMAS FOR ORGANIZATION
-- =============================================================================

-- Create separate schemas for different domains
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS tax;
CREATE SCHEMA IF NOT EXISTS documents;
CREATE SCHEMA IF NOT EXISTS compliance;
CREATE SCHEMA IF NOT EXISTS integrations;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Grant permissions to schemas
GRANT ALL ON SCHEMA auth TO taxmaster_app;
GRANT ALL ON SCHEMA tax TO taxmaster_app;
GRANT ALL ON SCHEMA documents TO taxmaster_app;
GRANT ALL ON SCHEMA compliance TO taxmaster_app;
GRANT ALL ON SCHEMA integrations TO taxmaster_app;
GRANT ALL ON SCHEMA analytics TO taxmaster_app;

-- =============================================================================
-- 4. ADDITIONAL EXTENSIONS
-- =============================================================================

-- Install additional useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For better indexing
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- For query analysis

-- =============================================================================
-- 5. CUSTOM FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate audit log entries
CREATE OR REPLACE FUNCTION generate_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changes JSONB;
BEGIN
    -- Handle different trigger operations
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := to_jsonb(NEW);
    END IF;

    -- Calculate changes for UPDATE operations
    IF TG_OP = 'UPDATE' THEN
        SELECT jsonb_object_agg(key, value) INTO changes
        FROM (
            SELECT key, 
                   jsonb_build_object('old', old_data->key, 'new', new_data->key) as value
            FROM jsonb_each(new_data)
            WHERE old_data->key IS DISTINCT FROM new_data->key
        ) t;
    END IF;

    -- Insert audit log (this would be handled by application in real scenario)
    -- This is a placeholder for the audit trigger logic
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 6. PERFORMANCE MONITORING VIEWS
-- =============================================================================

-- View for slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time,
    stddev_time,
    rows
FROM pg_stat_statements 
WHERE mean_time > 100 -- queries slower than 100ms
ORDER BY mean_time DESC;

-- View for table statistics
CREATE OR REPLACE VIEW table_stats AS
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- =============================================================================
-- 7. BACKUP AND MAINTENANCE PROCEDURES
-- =============================================================================

-- Create a function for database maintenance
CREATE OR REPLACE FUNCTION perform_maintenance()
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    -- Update table statistics
    ANALYZE;
    
    -- Vacuum tables if needed
    VACUUM ANALYZE;
    
    -- Reindex if needed (use carefully in production)
    -- REINDEX DATABASE taxmaster_ai;
    
    result := 'Maintenance completed at ' || CURRENT_TIMESTAMP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 8. SECURITY CONFIGURATION
-- =============================================================================

-- Row Level Security policies would be defined here
-- Example for multi-tenant security:

-- Enable RLS on companies table
-- ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policy for user access to their companies
-- CREATE POLICY company_access_policy ON companies
--     FOR ALL TO taxmaster_app
--     USING (id IN (
--         SELECT company_id 
--         FROM user_company_roles 
--         WHERE user_id = current_setting('app.current_user_id')::uuid
--           AND is_active = true
--     ));

-- =============================================================================
-- 9. INITIAL CONFIGURATION DATA
-- =============================================================================

-- Insert initial system configuration
INSERT INTO system_logs (log_level, service_name, component, message) 
VALUES ('INFO', 'database', 'setup', 'Database setup completed successfully');

-- =============================================================================
-- END OF SETUP SCRIPT
-- =============================================================================

-- Display setup completion message
SELECT 
    'TaxMaster AI Database Setup Completed' as message,
    CURRENT_TIMESTAMP as completed_at,
    current_database() as database_name,
    current_user as connected_user;