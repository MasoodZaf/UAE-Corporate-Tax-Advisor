/**
 * Login Page Component
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Checkbox,
  FormControlLabel,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Business as BusinessIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../types';

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  remember_me: yup.boolean(),
});

const LoginPage: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember_me: false,
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    clearError();
    try {
      await login(data);
      // Navigate to dashboard after successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password page
    console.log('Navigate to forgot password');
  };

  const handleRegister = () => {
    // Navigate to registration page
    console.log('Navigate to registration');
  };

  const handleQuickLogin = async (email: string, password: string) => {
    clearError();
    try {
      await login({ email, password, remember_me: false });
      navigate('/dashboard');
    } catch (error) {
      console.error('Quick login failed:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 450,
          boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.1)',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #CE1126 30%, #00732F 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                TaxMaster AI
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your UAE Corporate Tax compliance account
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email Address"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ mb: 2 }}
                  autoComplete="email"
                  autoFocus
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ mb: 2 }}
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
              }}
            >
              <Controller
                name="remember_me"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} size="small" />}
                    label="Remember me"
                  />
                )}
              />
              <Link
                component="button"
                variant="body2"
                onClick={handleForgotPassword}
                sx={{ textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mb: 2,
                height: 48,
                background: 'linear-gradient(45deg, #CE1126 30%, #00732F 90%)',
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleRegister}
              sx={{
                height: 48,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'primary.main',
                  color: 'white',
                },
              }}
            >
              Create New Account
            </Button>
          </Box>

          {/* Security Notice */}
          <Box
            sx={{
              mt: 4,
              p: 2,
              backgroundColor: 'grey.50',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <SecurityIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
            <Typography variant="caption" color="text.secondary">
              Your data is secured with enterprise-grade encryption and complies with UAE data protection regulations.
            </Typography>
          </Box>

          {/* Quick Login Options */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Demo Access
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => handleQuickLogin('superadmin@taxmaster.ae', 'SuperAdmin123!')}
              disabled={isLoading}
              sx={{
                textTransform: 'none',
                justifyContent: 'flex-start',
                color: 'error.main',
                borderColor: 'error.main',
                '&:hover': {
                  borderColor: 'error.dark',
                  backgroundColor: 'error.main',
                  color: 'white',
                },
              }}
            >
              🔑 Quick Login: Super Admin
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => handleQuickLogin('accountant@demo.ae', 'Demo123!')}
              disabled={isLoading}
              sx={{
                textTransform: 'none',
                justifyContent: 'flex-start',
                color: 'secondary.main',
                borderColor: 'secondary.main',
                '&:hover': {
                  borderColor: 'secondary.dark',
                  backgroundColor: 'secondary.main',
                  color: 'white',
                },
              }}
            >
              🧮 Quick Login: Accountant Demo
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => handleQuickLogin('user@demo.ae', 'Demo123!')}
              disabled={isLoading}
              sx={{
                textTransform: 'none',
                justifyContent: 'flex-start',
                color: 'info.main',
                borderColor: 'info.main',
                '&:hover': {
                  borderColor: 'info.dark',
                  backgroundColor: 'info.main',
                  color: 'white',
                },
              }}
            >
              👤 Quick Login: Business User Demo
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;