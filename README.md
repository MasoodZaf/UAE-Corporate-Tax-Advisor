# UAE Corporate Tax Advisory System

A comprehensive corporate tax advisory and management system designed for UAE businesses, providing tax calculation, document management, and compliance tracking.

## 🏗️ Project Structure

```
UAE-Corporate-Tax-Advisor/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic services
│   │   └── config/         # Configuration files
│   └── tests/              # Backend test suite
├── frontend/               # React TypeScript application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── contexts/       # React contexts
│   │   └── types/          # TypeScript type definitions
│   └── public/             # Static assets
├── database/               # Database schemas and migrations
└── docs/                   # Documentation
```

## 🚀 Features

- **Tax Calculator**: Advanced UAE corporate tax calculation engine
- **Document Management**: Secure document upload and storage
- **Transaction Tracking**: Comprehensive transaction history and reporting
- **User Authentication**: Secure role-based access control
- **Dashboard Analytics**: Real-time tax insights and reporting
- **Compliance Monitoring**: Automated compliance checks and alerts

## 🛠️ Technology Stack

### Backend
- **Node.js** with **TypeScript**
- **Express.js** framework
- **PostgreSQL** database
- **JWT** authentication
- **Jest** testing framework

### Frontend
- **React** with **TypeScript**
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication

### Database
- **PostgreSQL** for production
- **SQLite** for development/testing

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (for production)
- Git

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/UAE-Corporate-Tax-Advisor.git
cd UAE-Corporate-Tax-Advisor
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/uae_tax_db
JWT_SECRET=your-super-secret-jwt-key
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
```

### 4. Database Setup

```bash
cd database
psql -U postgres -c "CREATE DATABASE uae_tax_db;"
psql -U postgres -d uae_tax_db -f setup_database.sql
psql -U postgres -d uae_tax_db -f seed_data.sql
```

## 🚀 Running the Application

### Development Mode

1. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend Development Server**:
   ```bash
   cd frontend
   npm start
   ```

3. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Production Mode

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Start Production Server**:
   ```bash
   cd backend
   npm start
   ```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Run All Tests
```bash
npm run test:all
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Tax Calculation Endpoints
- `POST /api/tax/calculate` - Calculate corporate tax
- `GET /api/tax/history` - Get calculation history

### Document Management Endpoints
- `POST /api/documents/upload` - Upload documents
- `GET /api/documents` - List documents
- `DELETE /api/documents/:id` - Delete document

### Transaction Endpoints
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting
- Environment variable protection

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and authentication
- `companies` - Company information
- `transactions` - Financial transactions
- `documents` - Document storage metadata
- `tax_calculations` - Tax calculation history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines

- Use TypeScript for all new code
- Follow ESLint configuration
- Write unit tests for new features
- Use meaningful commit messages
- Follow conventional commits format

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🔄 Version History

- **v1.0.0** - Initial release with basic tax calculation
- **v1.1.0** - Added document management
- **v1.2.0** - Enhanced dashboard and reporting
- **v1.3.0** - Improved security and performance

## 📈 Roadmap

- [ ] Multi-language support (Arabic/English)
- [ ] Advanced reporting and analytics
- [ ] Mobile application
- [ ] Integration with UAE government APIs
- [ ] AI-powered tax optimization suggestions
- [ ] Real-time compliance monitoring

---

**Built with ❤️ for UAE businesses**
