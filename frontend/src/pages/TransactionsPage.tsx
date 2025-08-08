/**
 * Transactions Page Component
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Pagination,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  TrendingUp,
  TrendingDown,
  Receipt as ReceiptIcon,
  MonetizationOn,
  Calculate as CalculateIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';

// UAE VAT Categories and Tax Rules as per UAE Federal Tax Authority guidelines
const UAE_CATEGORIES = {
  // Standard Rated (5% VAT)
  'IT Services': { taxCategory: 'taxable', vatRate: 5, description: 'Information Technology Services' },
  'Consulting Services': { taxCategory: 'taxable', vatRate: 5, description: 'Professional Consulting' },
  'Marketing & Advertising': { taxCategory: 'taxable', vatRate: 5, description: 'Marketing and Advertisement Services' },
  'Office Supplies': { taxCategory: 'taxable', vatRate: 5, description: 'Office Equipment and Supplies' },
  'Telecommunications': { taxCategory: 'taxable', vatRate: 5, description: 'Telecom Services and Equipment' },
  'Legal Services': { taxCategory: 'taxable', vatRate: 5, description: 'Legal and Audit Services' },
  'Training & Education': { taxCategory: 'taxable', vatRate: 5, description: 'Training and Educational Services' },
  'Software Licenses': { taxCategory: 'taxable', vatRate: 5, description: 'Software and Digital Services' },
  'Vehicle Expenses': { taxCategory: 'taxable', vatRate: 5, description: 'Vehicle Running Costs' },
  'Entertainment': { taxCategory: 'taxable', vatRate: 5, description: 'Business Entertainment' },
  'Maintenance & Repairs': { taxCategory: 'taxable', vatRate: 5, description: 'Equipment Maintenance' },
  
  // Zero Rated (0% VAT)
  'Exports': { taxCategory: 'zero_rated', vatRate: 0, description: 'Export of Goods/Services' },
  'International Transport': { taxCategory: 'zero_rated', vatRate: 0, description: 'International Transportation' },
  'Precious Metals': { taxCategory: 'zero_rated', vatRate: 0, description: 'Investment Grade Precious Metals' },
  'Medical Equipment': { taxCategory: 'zero_rated', vatRate: 0, description: 'Qualifying Medical Equipment' },
  
  // Exempt (No VAT)
  'Residential Rent': { taxCategory: 'exempt', vatRate: 0, description: 'Residential Property Rent' },
  'Financial Services': { taxCategory: 'exempt', vatRate: 0, description: 'Banking and Financial Services' },
  'Insurance Services': { taxCategory: 'exempt', vatRate: 0, description: 'Insurance Premiums and Services' },
  'Employee Salaries': { taxCategory: 'exempt', vatRate: 0, description: 'Staff Salaries and Benefits' },
  'Healthcare Services': { taxCategory: 'exempt', vatRate: 0, description: 'Medical and Healthcare Services' },
  'Educational Services': { taxCategory: 'exempt', vatRate: 0, description: 'Educational Institution Services' },
  'Local Passenger Transport': { taxCategory: 'exempt', vatRate: 0, description: 'Local Public Transportation' },
  
  // Utilities (Often Zero Rated for Business)
  'Electricity & Water': { taxCategory: 'zero_rated', vatRate: 0, description: 'DEWA/ADDC/SEWA Utilities' },
  'Gas & Fuel': { taxCategory: 'taxable', vatRate: 5, description: 'Fuel and Gas Supplies' },
  
  // Common Business Categories
  'Travel & Accommodation': { taxCategory: 'taxable', vatRate: 5, description: 'Business Travel Expenses' },
  'Meals & Catering': { taxCategory: 'taxable', vatRate: 5, description: 'Business Meals and Catering' },
  'Printing & Stationery': { taxCategory: 'taxable', vatRate: 5, description: 'Printing and Office Stationery' },
  'Professional Fees': { taxCategory: 'taxable', vatRate: 5, description: 'Professional Service Fees' },
  'Bank Charges': { taxCategory: 'exempt', vatRate: 0, description: 'Banking Fees and Charges' },
  'Interest Expense': { taxCategory: 'exempt', vatRate: 0, description: 'Interest on Loans' },
  'Depreciation': { taxCategory: 'exempt', vatRate: 0, description: 'Asset Depreciation' },
  
  // Revenue Categories
  'Product Sales': { taxCategory: 'taxable', vatRate: 5, description: 'Sale of Products' },
  'Service Revenue': { taxCategory: 'taxable', vatRate: 5, description: 'Service Income' },
  'Rental Income': { taxCategory: 'taxable', vatRate: 5, description: 'Commercial Property Rent' },
  'Commission Income': { taxCategory: 'taxable', vatRate: 5, description: 'Commission and Referral Income' },
  'Interest Income': { taxCategory: 'exempt', vatRate: 0, description: 'Interest Received' },
};

// Get tax category based on selected category
const getTaxCategoryForCategory = (category: string) => {
  const categoryData = UAE_CATEGORIES[category as keyof typeof UAE_CATEGORIES];
  return categoryData ? categoryData.taxCategory : 'taxable';
};

// Get VAT rate based on selected category
const getVATRateForCategory = (category: string) => {
  const categoryData = UAE_CATEGORIES[category as keyof typeof UAE_CATEGORIES];
  return categoryData ? categoryData.vatRate : 5;
};

// Mock transaction data (in real app, this would come from API)
const mockTransactions = [
  {
    id: '1',
    date: '2025-07-20',
    description: 'IT Consulting Services - Project Alpha',
    amount: 45000,
    currency: 'AED',
    category: 'Consulting',
    classification: 'revenue',
    taxCategory: 'taxable',
    taxAmount: 2250,
    taxRate: 5,
    status: 'completed',
  },
  {
    id: '2',
    date: '2025-07-15',
    description: 'Software Development Services - Client A',
    amount: 85000,
    currency: 'AED',
    category: 'Software Services',
    classification: 'revenue',
    taxCategory: 'taxable',
    taxAmount: 0,
    taxRate: 0,
    status: 'completed',
  },
  {
    id: '3',
    date: '2025-07-12',
    description: 'Marketing Campaign - Google Ads',
    amount: -8500,
    currency: 'AED',
    category: 'Marketing',
    classification: 'expense',
    taxCategory: 'taxable',
    taxAmount: -425,
    taxRate: 5,
    status: 'completed',
  },
  {
    id: '4',
    date: '2025-07-10',
    description: 'DEWA Electricity Bill - June 2025',
    amount: -3500,
    currency: 'AED',
    category: 'Utilities',
    classification: 'expense',
    taxCategory: 'zero_rated',
    taxAmount: 0,
    taxRate: 0,
    status: 'completed',
  },
  {
    id: '5',
    date: '2025-07-05',
    description: 'Employee Salaries - July 2025',
    amount: -35000,
    currency: 'AED',
    category: 'Personnel',
    classification: 'expense',
    taxCategory: 'exempt',
    taxAmount: 0,
    taxRate: 0,
    status: 'completed',
  },
  {
    id: '6',
    date: '2025-07-01',
    description: 'Office Rent - July 2025',
    amount: -25000,
    currency: 'AED',
    category: 'Office Expenses',
    classification: 'expense',
    taxCategory: 'exempt',
    taxAmount: 0,
    taxRate: 0,
    status: 'completed',
  },
];

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [filteredTransactions, setFilteredTransactions] = useState(mockTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  
  // Add Transaction Dialog State
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: '',
    classification: 'expense',
    taxCategory: 'taxable'
  });

  // Edit Transaction Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editTransaction, setEditTransaction] = useState({
    description: '',
    amount: '',
    category: '',
    classification: 'expense',
    taxCategory: 'taxable'
  });

  // Calculate summary statistics
  const totalRevenue = transactions
    .filter(t => t.classification === 'revenue')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = Math.abs(transactions
    .filter(t => t.classification === 'expense')
    .reduce((sum, t) => sum + t.amount, 0));
  
  const netIncome = totalRevenue - totalExpenses;
  const estimatedTax = Math.max(0, (netIncome - 375000) * 0.09); // UAE Corporate Tax with small business relief

  useEffect(() => {
    let filtered = transactions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(t => t.classification === selectedFilter);
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, selectedFilter, transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'revenue':
        return 'success';
      case 'expense':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTaxCategoryColor = (category: string) => {
    switch (category) {
      case 'taxable':
        return 'error';
      case 'exempt':
        return 'success';
      case 'zero_rated':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setPage(1);
    handleFilterClose();
  };

  // Add Transaction Handlers
  const handleAddTransaction = () => {
    setAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
    setNewTransaction({
      description: '',
      amount: '',
      category: '',
      classification: 'expense',
      taxCategory: 'taxable'
    });
  };

  const handleTransactionChange = (field: string, value: string) => {
    const updatedTransaction = {
      ...newTransaction,
      [field]: value
    };
    
    // Auto-assign tax category when category changes
    if (field === 'category') {
      updatedTransaction.taxCategory = getTaxCategoryForCategory(value);
    }
    
    setNewTransaction(updatedTransaction);
  };

  const handleSaveTransaction = () => {
    const amount = parseFloat(newTransaction.amount);
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      alert('Please fill in all required fields');
      return;
    }

    const newTxn = {
      id: (transactions.length + 1).toString(),
      date: new Date().toISOString().split('T')[0],
      description: newTransaction.description,
      amount: newTransaction.classification === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      currency: 'AED',
      category: newTransaction.category,
      classification: newTransaction.classification,
      taxCategory: newTransaction.taxCategory,
      taxAmount: newTransaction.taxCategory === 'taxable' ? Math.abs(amount) * (getVATRateForCategory(newTransaction.category) / 100) : 0,
      taxRate: getVATRateForCategory(newTransaction.category),
      status: 'completed',
    };

    setTransactions(prev => [newTxn, ...prev]);
    handleCloseAddDialog();
  };

  // Edit Transaction Handlers
  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setEditTransaction({
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category,
      classification: transaction.classification,
      taxCategory: transaction.taxCategory
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingTransaction(null);
    setEditTransaction({
      description: '',
      amount: '',
      category: '',
      classification: 'expense',
      taxCategory: 'taxable'
    });
  };

  const handleEditTransactionChange = (field: string, value: string) => {
    const updatedTransaction = {
      ...editTransaction,
      [field]: value
    };
    
    // Auto-assign tax category when category changes
    if (field === 'category') {
      updatedTransaction.taxCategory = getTaxCategoryForCategory(value);
    }
    
    setEditTransaction(updatedTransaction);
  };

  const handleSaveEditTransaction = () => {
    const amount = parseFloat(editTransaction.amount);
    if (!editTransaction.description || !editTransaction.amount || !editTransaction.category) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedTxn = {
      ...editingTransaction,
      description: editTransaction.description,
      amount: editTransaction.classification === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      category: editTransaction.category,
      classification: editTransaction.classification,
      taxCategory: editTransaction.taxCategory,
      taxAmount: editTransaction.taxCategory === 'taxable' ? Math.abs(amount) * (getVATRateForCategory(editTransaction.category) / 100) : 0,
      taxRate: getVATRateForCategory(editTransaction.category),
    };

    setTransactions(prev => 
      prev.map(t => t.id === editingTransaction.id ? updatedTxn : t)
    );
    handleCloseEditDialog();
  };

  return (
    <DashboardLayout currentPage="transactions">
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ReceiptIcon sx={{ color: 'primary.main', fontSize: 32, mr: 1.5 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Transactions
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddTransaction}
              sx={{ ml: 'auto' }}
            >
              Add Transaction
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage and review your financial transactions for UAE Corporate Tax compliance
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {formatCurrency(totalRevenue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1 }}>
                  <TrendingDown />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>
                  {formatCurrency(totalExpenses)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Expenses
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                  <MonetizationOn />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'info.main' }}>
                  {formatCurrency(netIncome)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Net Income
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                  <CalculateIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'warning.main' }}>
                  {formatCurrency(estimatedTax)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estimated Corporate Tax (9%)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* UAE Tax Information Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            UAE Corporate Tax Calculation Preview
          </Typography>
          <Typography variant="body2">
            Based on current transactions: Net Income of {formatCurrency(netIncome)} results in 
            Corporate Tax of {formatCurrency(estimatedTax)} (9% on income above AED 375,000 small business relief).
            {netIncome <= 375000 && ' Your business qualifies for full small business relief!'}
          </Typography>
        </Alert>

        {/* Search and Filter */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <IconButton onClick={handleFilterClick}>
                <FilterIcon />
              </IconButton>
            </Box>

            <Menu
              anchorEl={filterAnchor}
              open={Boolean(filterAnchor)}
              onClose={handleFilterClose}
            >
              <MenuItem onClick={() => handleFilterSelect('all')}>
                All Transactions
              </MenuItem>
              <MenuItem onClick={() => handleFilterSelect('revenue')}>
                Revenue Only
              </MenuItem>
              <MenuItem onClick={() => handleFilterSelect('expense')}>
                Expenses Only
              </MenuItem>
            </Menu>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Transaction History ({filteredTransactions.length} transactions)
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell align="right"><strong>Amount</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Tax Category</strong></TableCell>
                    <TableCell align="right"><strong>Tax Amount</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions
                    .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                    .map((transaction) => (
                      <TableRow key={transaction.id} hover>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString('en-AE')}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell align="right">
                          <Typography
                            sx={{
                              color: transaction.amount > 0 ? 'success.main' : 'error.main',
                              fontWeight: 500,
                            }}
                          >
                            {formatCurrency(transaction.amount)}
                            {transaction.amount > 0 ? '' : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.classification.toUpperCase()}
                            size="small"
                            color={getClassificationColor(transaction.classification) as any}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.taxCategory.replace('_', ' ').toUpperCase()}
                            size="small"
                            color={getTaxCategoryColor(transaction.taxCategory) as any}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {transaction.taxAmount !== 0 ? (
                            <Typography
                              sx={{
                                color: transaction.taxAmount > 0 ? 'success.main' : 'error.main',
                                fontWeight: 500,
                              }}
                            >
                              {formatCurrency(transaction.taxAmount)}
                            </Typography>
                          ) : (
                            <Typography color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleEditTransaction(transaction)}
                            sx={{ color: 'primary.main' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {filteredTransactions.length > rowsPerPage && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={Math.ceil(filteredTransactions.length / rowsPerPage)}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Add Transaction Dialog */}
      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AddIcon sx={{ mr: 1, color: 'primary.main' }} />
            Add New Transaction
          </Box>
          <IconButton onClick={handleCloseAddDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Transaction Description *"
              fullWidth
              value={newTransaction.description}
              onChange={(e) => handleTransactionChange('description', e.target.value)}
              placeholder="e.g., Office supplies from ABC Store"
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Amount (AED) *"
                type="number"
                value={newTransaction.amount}
                onChange={(e) => handleTransactionChange('amount', e.target.value)}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                }}
                sx={{ flex: 1 }}
              />
              
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Classification *</InputLabel>
                <Select
                  value={newTransaction.classification}
                  onChange={(e) => handleTransactionChange('classification', e.target.value)}
                  label="Classification *"
                >
                  <MenuItem value="revenue">Revenue</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 1 }} required>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={newTransaction.category}
                  onChange={(e) => handleTransactionChange('category', e.target.value)}
                  label="Category *"
                >
                  {Object.entries(UAE_CATEGORIES).map(([category, data]) => (
                    <MenuItem key={category} value={category}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {category}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {data.description} ({data.taxCategory === 'taxable' ? `${data.vatRate}% VAT` : 
                           data.taxCategory === 'zero_rated' ? '0% VAT' : 'VAT Exempt'})
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Tax Category</InputLabel>
                <Select
                  value={newTransaction.taxCategory}
                  onChange={(e) => handleTransactionChange('taxCategory', e.target.value)}
                  label="Tax Category"
                  disabled={!!newTransaction.category} // Disabled when category is selected (auto-assigned)
                >
                  <MenuItem value="taxable">
                    Taxable ({getVATRateForCategory(newTransaction.category)}% VAT)
                  </MenuItem>
                  <MenuItem value="zero_rated">Zero Rated (0% VAT)</MenuItem>
                  <MenuItem value="exempt">VAT Exempt</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>UAE Tax Guidelines:</strong><br />
                • Categories automatically assign correct VAT treatment per UAE FTA rules<br />
                • Standard rate is 5% VAT on most goods and services<br />
                • Zero-rated: Exports, international transport, precious metals, utilities<br />
                • Exempt: Financial services, insurance, healthcare, education, residential rent<br />
                • Corporate Tax applies at 9% on profits above AED 375,000 (Small Business Relief)
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseAddDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSaveTransaction} variant="contained" startIcon={<SaveIcon />}>
            Add Transaction
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1, color: 'primary.main' }} />
            Edit Transaction
          </Box>
          <IconButton onClick={handleCloseEditDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Transaction Description *"
              fullWidth
              value={editTransaction.description}
              onChange={(e) => handleEditTransactionChange('description', e.target.value)}
              placeholder="e.g., Office supplies from ABC Store"
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Amount (AED) *"
                type="number"
                value={editTransaction.amount}
                onChange={(e) => handleEditTransactionChange('amount', e.target.value)}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                }}
                sx={{ flex: 1 }}
              />
              
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Classification *</InputLabel>
                <Select
                  value={editTransaction.classification}
                  onChange={(e) => handleEditTransactionChange('classification', e.target.value)}
                  label="Classification *"
                >
                  <MenuItem value="revenue">Revenue</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 1 }} required>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={editTransaction.category}
                  onChange={(e) => handleEditTransactionChange('category', e.target.value)}
                  label="Category *"
                >
                  {Object.entries(UAE_CATEGORIES).map(([category, data]) => (
                    <MenuItem key={category} value={category}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {category}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {data.description} ({data.taxCategory === 'taxable' ? `${data.vatRate}% VAT` : 
                           data.taxCategory === 'zero_rated' ? '0% VAT' : 'VAT Exempt'})
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Tax Category</InputLabel>
                <Select
                  value={editTransaction.taxCategory}
                  onChange={(e) => handleEditTransactionChange('taxCategory', e.target.value)}
                  label="Tax Category"
                  disabled={!!editTransaction.category} // Disabled when category is selected (auto-assigned)
                >
                  <MenuItem value="taxable">
                    Taxable ({getVATRateForCategory(editTransaction.category)}% VAT)
                  </MenuItem>
                  <MenuItem value="zero_rated">Zero Rated (0% VAT)</MenuItem>
                  <MenuItem value="exempt">VAT Exempt</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>UAE Tax Guidelines:</strong><br />
                • Categories automatically assign correct VAT treatment per UAE FTA rules<br />
                • Standard rate is 5% VAT on most goods and services<br />
                • Zero-rated: Exports, international transport, precious metals, utilities<br />
                • Exempt: Financial services, insurance, healthcare, education, residential rent<br />
                • Corporate Tax applies at 9% on profits above AED 375,000 (Small Business Relief)
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseEditDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSaveEditTransaction} variant="contained" startIcon={<SaveIcon />}>
            Update Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default TransactionsPage;