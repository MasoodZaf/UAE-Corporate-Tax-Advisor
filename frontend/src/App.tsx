/**
 * Main App Component
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './utils/theme';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TaxCalculator from './pages/TaxCalculator';
import TransactionsPage from './pages/TransactionsPage';
import DashboardLayout from './components/Layout/DashboardLayout';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main App Routes
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Transactions Route */}
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <TransactionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tax-calculator"
        element={
          <ProtectedRoute>
            <TaxCalculator />
          </ProtectedRoute>
        }
      />

      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <DashboardLayout currentPage="documents">
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                  📄 Documents Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Upload and manage your tax documents, receipts, and financial records.
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                  🚧 Coming Soon - Document management features are under development
                </Typography>
              </Box>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <DashboardLayout currentPage="reports">
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                  📊 Reports & Analytics
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Generate comprehensive tax reports, analytics, and compliance summaries.
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                  🚧 Coming Soon - Advanced reporting features are under development
                </Typography>
              </Box>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/compliance"
        element={
          <ProtectedRoute>
            <DashboardLayout currentPage="compliance">
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                  🛡️ Tax Compliance
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Monitor compliance status, deadlines, and regulatory requirements.
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                  🚧 Coming Soon - Compliance monitoring features are under development
                </Typography>
              </Box>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/company"
        element={
          <ProtectedRoute>
            <DashboardLayout currentPage="company">
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                  🏢 Company Profile
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage company information, tax registration, and business details.
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                  🚧 Coming Soon - Company management features are under development
                </Typography>
              </Box>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout currentPage="settings">
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                  ⚙️ Settings
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Configure system preferences, notifications, and user settings.
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                  🚧 Coming Soon - Settings management is under development
                </Typography>
              </Box>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
            <AppRoutes />
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
