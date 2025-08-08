/**
 * Tax Calculator Page Component
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Alert,
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DashboardLayout from '../components/Layout/DashboardLayout';

interface TaxCalculationData {
  grossRevenue: number;
  totalExpenses: number;
  companyType: 'standard' | 'freezone' | 'qualifying_freezone_person';
  isSmallBusiness: boolean;
  hasQualifyingIncome: boolean;
  year: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
}

interface TaxResult {
  grossRevenue: number;
  allowableDeductions: number;
  taxableIncome: number;
  smallBusinessRelief: number;
  applicableRate: number;
  corporateTax: number;
  finalTaxAmount: number;
  effectiveRate: number;
  breakdown: Array<{
    description: string;
    amount: number;
    note?: string;
  }>;
}

const calculationSchema = yup.object().shape({
  grossRevenue: yup
    .number()
    .required('Gross revenue is required')
    .min(0, 'Revenue must be positive'),
  totalExpenses: yup
    .number()
    .required('Total expenses is required')
    .min(0, 'Expenses must be positive'),
  companyType: yup
    .string()
    .required('Company type is required')
    .oneOf(['standard', 'freezone', 'qualifying_freezone_person']),
  year: yup
    .number()
    .required('Year is required')
    .min(2023, 'UAE Corporate Tax started in 2023')
    .max(2030, 'Invalid year'),
  quarter: yup
    .string()
    .required('Quarter is required')
    .oneOf(['Q1', 'Q2', 'Q3', 'Q4']),
});

const TaxCalculator: React.FC = () => {
  const [taxResult, setTaxResult] = useState<TaxResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TaxCalculationData>({
    resolver: yupResolver(calculationSchema),
    defaultValues: {
      grossRevenue: 0,
      totalExpenses: 0,
      companyType: 'standard',
      isSmallBusiness: false,
      hasQualifyingIncome: false,
      year: 2025,
      quarter: 'Q3',
    },
  });

  const watchedValues = watch();

  const steps = ['Company Information', 'Financial Data', 'Tax Calculation', 'Results'];

  const calculateTax = (data: TaxCalculationData): TaxResult => {
    const { grossRevenue, totalExpenses, companyType, isSmallBusiness } = data;
    
    // Basic calculations
    const allowableDeductions = totalExpenses;
    const taxableIncome = Math.max(0, grossRevenue - allowableDeductions);
    
    // UAE Corporate Tax Rules (2023+)
    const SMALL_BUSINESS_THRESHOLD = 3000000; // AED 3 million
    const STANDARD_TAX_RATE = 0.09; // 9%
    const SMALL_BUSINESS_RATE = 0; // 0% for first AED 375,000
    const SMALL_BUSINESS_RELIEF_LIMIT = 375000; // AED 375,000
    
    let corporateTax = 0;
    let smallBusinessRelief = 0;
    let applicableRate = STANDARD_TAX_RATE;
    
    // Free Zone exemption logic
    if (companyType === 'qualifying_freezone_person') {
      corporateTax = 0;
      applicableRate = 0;
    } else if (companyType === 'freezone') {
      // Freezone companies - 0% on qualifying income, 9% on non-qualifying
      if (data.hasQualifyingIncome) {
        corporateTax = 0;
        applicableRate = 0;
      } else {
        corporateTax = taxableIncome * STANDARD_TAX_RATE;
      }
    } else {
      // Standard company
      if (taxableIncome <= SMALL_BUSINESS_THRESHOLD && isSmallBusiness) {
        // Small business relief - 0% on first AED 375,000
        smallBusinessRelief = Math.min(taxableIncome, SMALL_BUSINESS_RELIEF_LIMIT);
        corporateTax = Math.max(0, taxableIncome - smallBusinessRelief) * STANDARD_TAX_RATE;
        applicableRate = taxableIncome > 0 ? corporateTax / taxableIncome : 0;
      } else {
        corporateTax = taxableIncome * STANDARD_TAX_RATE;
      }
    }

    const finalTaxAmount = corporateTax;
    const effectiveRate = grossRevenue > 0 ? (finalTaxAmount / grossRevenue) * 100 : 0;

    // Create breakdown
    const breakdown = [
      {
        description: 'Gross Revenue',
        amount: grossRevenue,
      },
      {
        description: 'Less: Allowable Deductions',
        amount: -allowableDeductions,
        note: 'Business expenses and deductions',
      },
      {
        description: 'Taxable Income',
        amount: taxableIncome,
      },
    ];

    if (smallBusinessRelief > 0) {
      breakdown.push({
        description: 'Less: Small Business Relief',
        amount: -smallBusinessRelief,
        note: '0% rate on first AED 375,000',
      });
    }

    if (companyType === 'qualifying_freezone_person') {
      breakdown.push({
        description: 'Corporate Tax (Qualifying Free Zone)',
        amount: 0,
        note: '0% rate for qualifying Free Zone persons',
      });
    } else if (companyType === 'freezone' && data.hasQualifyingIncome) {
      breakdown.push({
        description: 'Corporate Tax (Free Zone - Qualifying Income)',
        amount: 0,
        note: '0% rate on qualifying income',
      });
    } else {
      breakdown.push({
        description: `Corporate Tax (${(applicableRate * 100).toFixed(1)}%)`,
        amount: finalTaxAmount,
        note: applicableRate === STANDARD_TAX_RATE ? 'Standard corporate tax rate' : 'Effective rate after reliefs',
      });
    }

    return {
      grossRevenue,
      allowableDeductions,
      taxableIncome,
      smallBusinessRelief,
      applicableRate,
      corporateTax,
      finalTaxAmount,
      effectiveRate,
      breakdown,
    };
  };

  const onSubmit = async (data: TaxCalculationData) => {
    setIsCalculating(true);
    setActiveStep(3);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = calculateTax(data);
    setTaxResult(result);
    setIsCalculating(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const nextStep = () => {
    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  return (
    <DashboardLayout currentPage="tax-calculator">
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalculateIcon sx={{ color: 'primary.main', fontSize: 32, mr: 1.5 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              UAE Corporate Tax Calculator
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Calculate your UAE Corporate Tax liability for 2023 onwards
          </Typography>
        </Box>

        {/* Progress Stepper */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        <Grid container spacing={4}>
          {/* Input Form */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Tax Calculation Input
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  {/* Company Type */}
                  <FormControl component="fieldset" sx={{ mb: 3 }}>
                    <FormLabel component="legend">Company Type</FormLabel>
                    <Controller
                      name="companyType"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup {...field}>
                          <FormControlLabel
                            value="standard"
                            control={<Radio />}
                            label="Standard Company (Mainland)"
                          />
                          <FormControlLabel
                            value="freezone"
                            control={<Radio />}
                            label="Free Zone Company"
                          />
                          <FormControlLabel
                            value="qualifying_freezone_person"
                            control={<Radio />}
                            label="Qualifying Free Zone Person"
                          />
                        </RadioGroup>
                      )}
                    />
                  </FormControl>

                  {/* Financial Information */}
                  <Controller
                    name="grossRevenue"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Gross Revenue (AED)"
                        type="number"
                        error={!!errors.grossRevenue}
                        helperText={errors.grossRevenue?.message}
                        sx={{ mb: 2 }}
                        InputProps={{
                          inputProps: { min: 0, step: 1000 }
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="totalExpenses"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Total Allowable Expenses (AED)"
                        type="number"
                        error={!!errors.totalExpenses}
                        helperText={errors.totalExpenses?.message}
                        sx={{ mb: 3 }}
                        InputProps={{
                          inputProps: { min: 0, step: 1000 }
                        }}
                      />
                    )}
                  />

                  {/* Period Selection */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Controller
                        name="year"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Tax Year"
                            type="number"
                            error={!!errors.year}
                            helperText={errors.year?.message}
                            InputProps={{
                              inputProps: { min: 2023, max: 2030 }
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name="quarter"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            select
                            label="Quarter"
                            SelectProps={{ native: true }}
                            error={!!errors.quarter}
                            helperText={errors.quarter?.message}
                          >
                            <option value="Q1">Q1 (Jan-Mar)</option>
                            <option value="Q2">Q2 (Apr-Jun)</option>
                            <option value="Q3">Q3 (Jul-Sep)</option>
                            <option value="Q4">Q4 (Oct-Dec)</option>
                          </TextField>
                        )}
                      />
                    </Grid>
                  </Grid>

                  {/* Special Conditions */}
                  {watchedValues.companyType === 'standard' && (
                    <Controller
                      name="isSmallBusiness"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Switch {...field} checked={field.value} />}
                          label="Qualify for Small Business Relief (Annual revenue ≤ AED 3M)"
                          sx={{ mb: 2 }}
                        />
                      )}
                    />
                  )}

                  {watchedValues.companyType === 'freezone' && (
                    <Controller
                      name="hasQualifyingIncome"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Switch {...field} checked={field.value} />}
                          label="All income is qualifying Free Zone income"
                          sx={{ mb: 2 }}
                        />
                      )}
                    />
                  )}

                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={isCalculating}
                      startIcon={<CalculateIcon />}
                    >
                      {isCalculating ? 'Calculating...' : 'Calculate Tax'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Results */}
          <Grid item xs={12} lg={6}>
            {taxResult ? (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Tax Calculation Results
                  </Typography>

                  {/* Summary Cards */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                        <Typography variant="body2" color="success.dark">
                          Taxable Income
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.dark' }}>
                          {formatCurrency(taxResult.taxableIncome)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                        <Typography variant="body2" color="error.dark">
                          Corporate Tax
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.dark' }}>
                          {formatCurrency(taxResult.finalTaxAmount)}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Detailed Breakdown */}
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Description</strong></TableCell>
                          <TableCell align="right"><strong>Amount (AED)</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {taxResult.breakdown.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Box>
                                {item.description}
                                {item.note && (
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    {item.note}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="right" sx={{ 
                              color: item.amount < 0 ? 'error.main' : 'text.primary',
                              fontWeight: item.description.includes('Corporate Tax') ? 600 : 400
                            }}>
                              {formatCurrency(Math.abs(item.amount))}
                              {item.amount < 0 && ' (-)'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Key Metrics */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Key Tax Metrics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Chip
                          icon={<TrendingUpIcon />}
                          label={`Effective Rate: ${taxResult.effectiveRate.toFixed(2)}%`}
                          color="primary"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Chip
                          icon={<BusinessIcon />}
                          label={`Applied Rate: ${(taxResult.applicableRate * 100).toFixed(1)}%`}
                          color="secondary"
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Small Business Relief */}
                  {taxResult.smallBusinessRelief > 0 && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <strong>Small Business Relief Applied:</strong><br />
                      You saved {formatCurrency(taxResult.smallBusinessRelief * 0.09)} in taxes through the 
                      small business relief (0% rate on first AED 375,000).
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <CalculateIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Enter your financial information to calculate UAE Corporate Tax
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* UAE Tax Information */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              UAE Corporate Tax Key Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InfoIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Standard Rate
                  </Typography>
                </Box>
                <Typography variant="body2">
                  9% on taxable income above AED 375,000
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Small Business Relief
                  </Typography>
                </Box>
                <Typography variant="body2">
                  0% rate on first AED 375,000 for businesses with annual revenue ≤ AED 3 million
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessIcon sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Free Zone Exemption
                  </Typography>
                </Box>
                <Typography variant="body2">
                  0% rate for Qualifying Free Zone Persons on qualifying income
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default TaxCalculator;