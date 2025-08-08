# TaxMaster AI Backend

UAE Corporate Tax AI Compliance System - Backend API

## Overview

TaxMaster AI is a comprehensive backend system designed to help UAE SMEs manage their corporate tax compliance requirements. The system provides AI-powered expense categorization, document processing, real-time compliance monitoring, and automated tax calculations.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Multi-company support with context switching
- UAE Pass integration support
- Email verification and password reset

### 🏢 Multi-Tenant Architecture
- Company-based data isolation
- Role management (Owner, Accountant, Viewer, etc.)
- Subscription plan management
- User company access control

### 💰 Tax Calculation Engine
- UAE Corporate Tax rate calculation (0%/9%/15%)
- DMTT (Domestic Minimum Top-up Tax) support
- Free zone qualification assessment
- VAT integration and calculations
- Real-time tax liability tracking

### 📄 Document Management
- OCR processing for receipts and invoices
- AI-powered data extraction
- Multi-language support (English/Arabic)
- Document categorization and tagging
- 7-year retention policy compliance

### 🤖 AI/ML Integration
- Expense classification and categorization
- Document OCR with confidence scoring
- Tax optimization recommendations
- Predictive compliance analytics

### 📊 Transaction Management
- Bank account integration support
- Automated transaction import
- Manual entry with validation
- Duplicate detection and handling
- Audit trail and approval workflows

### ⚠️ Compliance Monitoring
- Real-time FTA regulation updates
- Deadline tracking and notifications
- Automated compliance checking
- Risk assessment scoring
- Alert management system

### 🔗 External Integrations
- EmaraTax portal integration
- UAE banking APIs (ENBD, ADCB)
- Email and SMS notifications
- Cloud storage (AWS S3, Azure, GCP)

## Technology Stack

### Backend Framework
- **Node.js** with **TypeScript**
- **Express.js** for REST API
- **JWT** for authentication
- **bcrypt** for password hashing

### Databases
- **PostgreSQL** for structured data (users, companies, transactions)
- **MongoDB** for document storage and unstructured data
- **Redis** for caching and session management

### AI/ML
- **TensorFlow.js** or **Python ML services**
- **Tesseract.js** for OCR processing
- Custom models for expense classification

### External Services
- **Nodemailer** for email services
- **Twilio** for SMS notifications
- **AWS SDK** for cloud storage
- **Sharp** for image processing

### Development Tools
- **ESLint** and **Prettier** for code quality
- **Jest** for testing
- **Swagger** for API documentation
- **Winston** for logging
- **Docker** for containerization

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 13+
- MongoDB 5.0+
- Redis 6.0+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up databases**
   ```bash
   # PostgreSQL setup
   psql -U postgres -f ../database/setup_database.sql
   psql -U postgres -d taxmaster_ai -f ../database/postgresql_schema.sql
   psql -U postgres -d taxmaster_ai -f ../database/seed_data.sql

   # MongoDB setup
   mongosh --eval "use taxmaster_ai_docs" --file ../database/mongodb_schema.js
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.ts   # Database connections
│   ├── logger.ts     # Logging configuration
│   └── index.ts      # Main configuration
├── controllers/      # Request handlers
│   ├── AuthController.ts
│   └── ...
├── middleware/       # Express middleware
│   ├── auth.ts       # Authentication middleware
│   ├── errorHandler.ts
│   └── ...
├── models/          # Database models
│   ├── User.ts      # PostgreSQL models
│   ├── Company.ts
│   ├── Transaction.ts
│   ├── Document.ts  # MongoDB models
│   └── BaseModel.ts
├── routes/          # API routes
│   ├── auth.ts
│   ├── users.ts
│   └── ...
├── services/        # Business logic services
│   ├── EmailService.ts
│   ├── AIService.ts
│   └── ...
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── server.ts        # Application entry point
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/switch-company` - Switch company context
- `GET /api/v1/auth/profile` - Get user profile

### Health & Monitoring
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system health
- `GET /health/readiness` - Kubernetes readiness probe
- `GET /health/liveness` - Kubernetes liveness probe

### Documentation
- `GET /api/v1/docs` - Swagger API documentation

## Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
# Server
NODE_ENV=development
PORT=3000

# Database
POSTGRES_HOST=localhost
POSTGRES_PASSWORD=your_password
MONGODB_URI=mongodb://localhost:27017/taxmaster_ai_docs
REDIS_HOST=localhost

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_32_char_encryption_key

# External Services
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

## Database Schema

### PostgreSQL Tables
- `users` - User accounts and authentication
- `companies` - Business entities and company information
- `roles` - User roles and permissions
- `user_company_roles` - User-company-role relationships
- `transactions` - Financial transactions
- `tax_calculations` - Tax computation results
- `compliance_rules` - Tax compliance rules
- `compliance_alerts` - Compliance notifications
- `audit_logs` - System audit trail

### MongoDB Collections
- `documents` - Document storage with OCR and AI data
- `ai_training_data` - Machine learning training datasets
- `notification_templates` - Email/SMS templates
- `system_config` - System configuration
- `analytics_data` - Business analytics and metrics

## Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcrypt with salt rounds
- **Rate Limiting** to prevent abuse
- **CORS** configuration for cross-origin requests
- **Helmet** for security headers
- **Input Validation** and sanitization
- **SQL Injection** prevention with parameterized queries
- **XSS Protection** with content security policy
- **Audit Logging** for compliance and security monitoring

## Performance Optimizations

- **Database Indexing** for optimal query performance
- **Connection Pooling** for database connections
- **Redis Caching** for frequently accessed data
- **Compression** middleware for response optimization
- **Query Optimization** with proper joins and filters
- **Pagination** for large data sets
- **Background Jobs** for heavy processing tasks

## Monitoring & Logging

- **Winston** for structured logging
- **Morgan** for HTTP request logging
- **Health Checks** for system monitoring
- **Performance Metrics** collection
- **Error Tracking** and alerting
- **Audit Trail** for compliance requirements

## Testing

The project includes comprehensive testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test categories:
- **Unit Tests** - Individual function testing
- **Integration Tests** - API endpoint testing
- **Database Tests** - Model and query testing
- **Authentication Tests** - Security feature testing

## Deployment

### Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t taxmaster-ai-backend .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Production Deployment

1. **Environment Setup**
   - Configure production environment variables
   - Set up SSL/TLS certificates
   - Configure reverse proxy (Nginx)

2. **Database Migration**
   - Run database migrations
   - Set up database backups
   - Configure connection pooling

3. **Monitoring Setup**
   - Configure log aggregation
   - Set up performance monitoring
   - Configure alerting

## API Documentation

Interactive API documentation is available at:
- Development: `http://localhost:3000/api/v1/docs`
- Production: `https://api.taxmaster.ai/api/v1/docs`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. All rights reserved.

## Support

For support and questions:
- Email: support@taxmaster.ai
- Documentation: https://docs.taxmaster.ai
- Issue Tracker: [Internal tracking system]

---

© 2025 TaxMaster AI. All rights reserved.