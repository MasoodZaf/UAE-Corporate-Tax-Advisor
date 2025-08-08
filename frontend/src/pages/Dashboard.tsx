/**
 * Dashboard Page Component
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  MonetizationOn,
  Receipt,
  FileUpload,
  Warning,
  CheckCircle,
  Timeline,
  Calculate,
  Insights,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import DashboardLayout from '../components/Layout/DashboardLayout';

// Mock data for demonstration
const monthlyData = [
  { month: 'Jan', revenue: 45000, expenses: 32000, tax: 1170 },
  { month: 'Feb', revenue: 52000, expenses: 38000, tax: 1260 },
  { month: 'Mar', revenue: 48000, expenses: 35000, tax: 1170 },
  { month: 'Apr', revenue: 61000, expenses: 42000, tax: 1710 },
  { month: 'May', revenue: 55000, expenses: 39000, tax: 1440 },
  { month: 'Jun', revenue: 67000, expenses: 45000, tax: 1980 },
];

const expenseCategories = [
  { name: 'Office Rent', value: 25000, color: '#CE1126' },
  { name: 'Salaries', value: 45000, color: '#00732F' },
  { name: 'Utilities', value: 8000, color: '#FFB81C' },
  { name: 'Marketing', value: 12000, color: '#2196F3' },
  { name: 'Travel', value: 6000, color: '#FF9500' },
  { name: 'Other', value: 4000, color: '#9E9E9E' },
];

const recentTransactions = [
  { id: 1, description: 'Office Rent Payment', amount: -25000, date: '2025-08-05', type: 'expense' },
  { id: 2, description: 'Client Invoice Payment', amount: 45000, date: '2025-08-04', type: 'revenue' },
  { id: 3, description: 'Software Subscription', amount: -1200, date: '2025-08-03', type: 'expense' },
  { id: 4, description: 'Consulting Services', amount: 18000, date: '2025-08-02', type: 'revenue' },
];

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 328000,
    totalExpenses: 231000,
    taxableIncome: 97000,
    estimatedTax: 8730,
    documentsProcessed: 156,
    pendingDocuments: 8,
    complianceScore: 92,
    lastCalculation: '2025-08-07',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactElement;
    color?: string;
    subtitle?: string;
  }> = ({ title, value, change, icon, color = 'primary', subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
              {typeof value === 'number' ? formatCurrency(value) : value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {change > 0 ? (
                  <TrendingUp sx={{ color: 'success.main', mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main', mr: 0.5 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: change > 0 ? 'success.main' : 'error.main',
                    fontWeight: 500,
                  }}
                >
                  {Math.abs(change)}% from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout currentPage="dashboard">
      <Box sx={{ flexGrow: 1 }}>
        {/* Welcome Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Welcome to TaxMaster AI
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your UAE Corporate Tax compliance dashboard for August 2025
          </Typography>
        </Box>

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Revenue"
              value={dashboardData.totalRevenue}
              change={12.5}
              icon={<MonetizationOn />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Expenses"
              value={dashboardData.totalExpenses}
              change={-3.2}
              icon={<Receipt />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Taxable Income"
              value={dashboardData.taxableIncome}
              change={18.7}
              icon={<Calculate />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Estimated Tax"
              value={dashboardData.estimatedTax}
              icon={<Insights />}
              color="error"
              subtitle="9% Corporate Tax Rate"
            />
          </Grid>
        </Grid>

        {/* Compliance Alert */}
        <Box sx={{ mb: 3 }}>
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Compliance Score: {dashboardData.complianceScore}%
                </Typography>
                <Typography variant="body2">
                  Your business is compliant with UAE Corporate Tax regulations. Next filing deadline: September 30, 2025
                </Typography>
              </Box>
              <Button variant="outlined" color="success" size="small">
                View Details
              </Button>
            </Box>
          </Alert>
        </Box>

        {/* Charts and Analytics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Revenue vs Expenses Chart */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Monthly Revenue vs Expenses
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#00732F"
                      fill="#00732F"
                      fillOpacity={0.8}
                      name="Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stackId="2"
                      stroke="#CE1126"
                      fill="#CE1126"
                      fillOpacity={0.8}
                      name="Expenses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Expense Categories */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Expense Categories
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 2 }}>
                  {expenseCategories.slice(0, 3).map((category, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          backgroundColor: category.color,
                          borderRadius: '50%',
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatCurrency(category.value)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Bottom Section */}
        <Grid container spacing={3}>
          {/* Recent Transactions */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Transactions
                  </Typography>
                  <Button variant="text" size="small">
                    View All
                  </Button>
                </Box>
                <List>
                  {recentTransactions.map((transaction, index) => (
                    <ListItem key={transaction.id} divider={index < recentTransactions.length - 1}>
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            bgcolor: transaction.type === 'revenue' ? 'success.main' : 'error.main',
                            width: 32,
                            height: 32,
                          }}
                        >
                          {transaction.type === 'revenue' ? (
                            <TrendingUp fontSize="small" />
                          ) : (
                            <TrendingDown fontSize="small" />
                          )}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={transaction.description}
                        secondary={transaction.date}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: transaction.amount > 0 ? 'success.main' : 'error.main',
                        }}
                      >
                        {formatCurrency(Math.abs(transaction.amount))}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions & Status */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Receipt />}
                      sx={{ py: 1.5, justifyContent: 'flex-start' }}
                    >
                      Add Transaction
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FileUpload />}
                      sx={{ py: 1.5, justifyContent: 'flex-start' }}
                    >
                      Upload Document
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Calculate />}
                      sx={{ py: 1.5, justifyContent: 'flex-start' }}
                    >
                      Calculate Tax
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Timeline />}
                      sx={{ py: 1.5, justifyContent: 'flex-start' }}
                    >
                      View Reports
                    </Button>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Document Processing Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {dashboardData.documentsProcessed} documents processed
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Warning sx={{ color: 'warning.main', mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {dashboardData.pendingDocuments} documents pending review
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(dashboardData.documentsProcessed / (dashboardData.documentsProcessed + dashboardData.pendingDocuments)) * 100}
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;