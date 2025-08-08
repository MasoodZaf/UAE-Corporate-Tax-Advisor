const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Login endpoint for super admin
app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email });
  
  // Demo accounts authentication
  const demoAccounts = {
    'superadmin@taxmaster.ae': {
      password: 'SuperAdmin123!',
      user: {
        id: '1',
        email: 'superadmin@taxmaster.ae',
        first_name: 'Super',
        last_name: 'Admin',
        role: 'admin'
      }
    },
    'accountant@demo.ae': {
      password: 'Demo123!',
      user: {
        id: '2',
        email: 'accountant@demo.ae',
        first_name: 'Ahmed',
        last_name: 'Al-Mansoori',
        role: 'accountant'
      }
    },
    'user@demo.ae': {
      password: 'Demo123!',
      user: {
        id: '3',
        email: 'user@demo.ae',
        first_name: 'Sarah',
        last_name: 'Khan',
        role: 'user'
      }
    }
  };

  const account = demoAccounts[email];
  if (account && account.password === password) {
    const accessToken = 'mock-jwt-token-' + Date.now();
    res.json({
      success: true,
      data: {
        user: account.user,
        tokens: {
          access_token: accessToken,
          refresh_token: 'mock-refresh-token-' + Date.now(),
          expires_in: 86400 // 24 hours
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Get current user endpoint (for token validation)
app.get('/api/v1/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No authorization token provided'
    });
  }
  
  // Mock validation - in real app, validate JWT
  const token = authHeader.substring(7);
  if (token.startsWith('mock-jwt-token-')) {
    // For demo purposes, return super admin user
    // In real implementation, decode JWT to get user info
    res.json({
      success: true,
      data: {
        id: '1',
        email: 'superadmin@taxmaster.ae',
        first_name: 'Super',
        last_name: 'Admin',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Logout endpoint
app.post('/api/v1/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Sample transactions endpoint for dashboard
app.get('/api/v1/transactions', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No authorization token provided'
    });
  }
  
  // Mock transaction data
  const sampleTransactions = [
    {
      id: '1',
      date: '2025-01-15',
      description: 'IT Consulting Services - Project Alpha',
      amount: 45000,
      currency: 'AED',
      category: 'Consulting',
      classification: 'revenue',
      taxCategory: 'taxable'
    },
    {
      id: '2',
      date: '2025-01-10',
      description: 'Marketing Campaign - Google Ads',
      amount: -8500,
      currency: 'AED',
      category: 'Marketing',
      classification: 'expense',
      taxCategory: 'taxable'
    },
    {
      id: '3',
      date: '2025-01-05',
      description: 'Office Rent - January 2025',
      amount: -25000,
      currency: 'AED',
      category: 'Office Expenses',
      classification: 'expense',
      taxCategory: 'exempt'
    }
  ];
  
  res.json({
    success: true,
    data: {
      transactions: sampleTransactions,
      total: sampleTransactions.length,
      revenue: 45000,
      expenses: 33500,
      netIncome: 11500,
      estimatedTax: 0 // Below small business threshold
    }
  });
});

// Companies endpoint for dashboard
app.get('/api/v1/companies', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No authorization token provided'
    });
  }
  
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Dubai Tech Solutions LLC',
        license_number: 'DXB-123456',
        tax_number: 'AE1234567890001',
        status: 'active'
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Simple server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
});