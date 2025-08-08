# TaxMaster AI Database Schema

## Overview
This directory contains the complete database schema and setup scripts for the UAE Corporate Tax AI Compliance System (TaxMaster AI). The system uses a hybrid database approach with PostgreSQL for structured data and MongoDB for document storage.

## Architecture

### PostgreSQL (Primary Database)
- **User Management & Authentication**
- **Company & Business Entity Management**
- **Tax Calculations & Compliance**
- **Financial Transactions**
- **Bank Integrations**
- **Audit Trails & Logging**
- **ML Model Tracking**

### MongoDB (Document Storage)
- **Document Management** (receipts, invoices, contracts)
- **OCR & AI Processing Results**
- **Analytics & Reporting Data**
- **System Configuration**
- **Notification Templates**

## Files Description

### 1. `postgresql_schema.sql`
Complete PostgreSQL database schema including:
- All tables with proper relationships
- Indexes for performance optimization
- Default data for roles, accounts, and compliance rules
- Comprehensive commenting and documentation

### 2. `mongodb_schema.js`
MongoDB collections schema with:
- Document validation rules
- Indexes for performance
- Initial configuration data
- Collection structure for all document types

### 3. `setup_database.sql`
Database initialization script:
- Database and user creation
- Extension installation
- Schema organization
- Performance configuration
- Security setup

### 4. `seed_data.sql`
Development and testing data:
- Sample companies and users
- Chart of accounts (UAE standard)
- Compliance rules
- ML model configurations
- Demo tax periods

## Database Setup Instructions

### Prerequisites
- PostgreSQL 13+ installed
- MongoDB 5.0+ installed
- Database administration access

### Step 1: PostgreSQL Setup

```bash
# 1. Connect to PostgreSQL as superuser
sudo -u postgres psql

# 2. Run the setup script
\i /path/to/setup_database.sql

# 3. Run the main schema
\i /path/to/postgresql_schema.sql

# 4. Load seed data (optional for development)
\i /path/to/seed_data.sql
```

### Step 2: MongoDB Setup

```bash
# 1. Connect to MongoDB
mongosh

# 2. Create database and run schema
use taxmaster_ai_docs
load('/path/to/mongodb_schema.js')
```

### Step 3: Environment Configuration

Create environment-specific configuration files:

#### Development
```env
# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=taxmaster_ai
POSTGRES_USER=taxmaster_app
POSTGRES_PASSWORD=TaxM@ster2025!

# MongoDB
MONGODB_URI=mongodb://localhost:27017/taxmaster_ai_docs

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
```

#### Production
- Use separate databases for production
- Enable SSL/TLS connections
- Configure proper backup strategies
- Set up monitoring and alerting

## Key Database Features

### 1. Multi-tenancy Support
- Row-level security policies
- Company-based data isolation
- Role-based access control

### 2. Audit Trail
- Complete change tracking
- User activity logging
- Data integrity validation

### 3. AI/ML Integration
- Model performance tracking
- Training data management
- Prediction accuracy monitoring

### 4. Compliance Framework
- Automated rule checking
- Deadline tracking
- Penalty calculations

### 5. Document Management
- OCR processing results
- AI extraction metadata
- 7-year retention policy

## Performance Considerations

### Indexes
- All foreign keys are indexed
- Composite indexes for common queries
- Partial indexes for filtered queries
- Text search indexes for document content

### Partitioning (for large datasets)
```sql
-- Example: Partition audit_logs by month
CREATE TABLE audit_logs_y2024m01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### Query Optimization
- Use prepared statements
- Implement connection pooling
- Regular VACUUM and ANALYZE operations
- Monitor slow query log

## Security Features

### Data Protection
- Password hashing with bcrypt
- Sensitive data encryption
- PII data anonymization
- Secure backup procedures

### Access Control
- Role-based permissions
- Row-level security
- API rate limiting
- Audit logging

## Backup & Recovery

### PostgreSQL Backup
```bash
# Full backup
pg_dump -h localhost -U taxmaster_app taxmaster_ai > backup.sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump taxmaster_ai | gzip > "$BACKUP_DIR/taxmaster_ai_$DATE.sql.gz"
```

### MongoDB Backup
```bash
# Full backup
mongodump --db taxmaster_ai_docs --out /backups/mongodb/

# Automated backup
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db taxmaster_ai_docs --out "$BACKUP_DIR/taxmaster_ai_docs_$DATE"
```

## Monitoring & Maintenance

### PostgreSQL Monitoring
```sql
-- Monitor table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY mean_time DESC;
```

### MongoDB Monitoring
```javascript
// Monitor collection sizes
db.stats()

// Monitor index usage
db.documents.aggregate([
  { $indexStats: {} }
])

// Monitor slow operations
db.setProfilingLevel(2, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(5)
```

## Migration Scripts

For future schema changes, create migration scripts:

```sql
-- Migration example: Add new column
-- File: migrations/001_add_company_type.sql
ALTER TABLE companies 
ADD COLUMN company_type VARCHAR(50) DEFAULT 'llc';

-- Update migration log
INSERT INTO schema_migrations (version, executed_at) 
VALUES ('001', CURRENT_TIMESTAMP);
```

## Troubleshooting

### Common Issues

1. **Connection Issues**
   - Check PostgreSQL/MongoDB service status
   - Verify connection parameters
   - Check firewall settings

2. **Performance Issues**
   - Run ANALYZE on tables
   - Check for missing indexes
   - Monitor connection pool usage

3. **Data Integrity Issues**
   - Check foreign key constraints
   - Validate data types
   - Run consistency checks

### Support Contacts
- Database Team: db-team@taxmaster.ai
- DevOps Team: devops@taxmaster.ai
- Documentation: https://docs.taxmaster.ai/database

## License
Proprietary - TaxMaster AI System © 2025