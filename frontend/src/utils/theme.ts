/**
 * Material-UI Theme Configuration
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import { createTheme, Theme } from '@mui/material/styles';
import { Palette } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
  }
}

// UAE Corporate Colors
const colors = {
  // Primary - UAE Flag Red
  primary: {
    main: '#CE1126',
    light: '#E6344A',
    dark: '#8E0C1A',
    contrastText: '#FFFFFF',
  },
  // Secondary - UAE Flag Green
  secondary: {
    main: '#00732F',
    light: '#339A5C',
    dark: '#004D20',
    contrastText: '#FFFFFF',
  },
  // Tertiary - UAE Gold
  tertiary: {
    main: '#FFB81C',
    light: '#FFC947',
    dark: '#B28013',
    contrastText: '#000000',
  },
  // Neutral Colors
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  // Success, Warning, Error
  success: {
    main: '#00A651',
    light: '#33B370',
    dark: '#007138',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FF9500',
    light: '#FFA733',
    dark: '#B26800',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#F44336',
    light: '#F66358',
    dark: '#AA2E25',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#2196F3',
    light: '#4DABF5',
    dark: '#1769AA',
    contrastText: '#FFFFFF',
  },
};

// Create the theme
export const theme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[700],
    },
    divider: colors.neutral[300],
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    // Button
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 24px',
          fontSize: '0.95rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    // Card
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          border: `1px solid ${colors.neutral[200]}`,
          '&:hover': {
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    // Paper
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    // AppBar
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: colors.neutral[900],
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
          borderBottom: `1px solid ${colors.neutral[200]}`,
        },
      },
    },
    // Drawer
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: `1px solid ${colors.neutral[200]}`,
        },
      },
    },
    // TextField
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: colors.neutral[300],
            },
            '&:hover fieldset': {
              borderColor: colors.neutral[400],
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary.main,
              borderWidth: 2,
            },
          },
        },
      },
    },
    // Chip
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    // Table
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: colors.neutral[50],
        },
      },
    },
    // Alert
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Dark theme variant
export const darkTheme: Theme = createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: colors.neutral[400],
    },
  },
});

export default theme;