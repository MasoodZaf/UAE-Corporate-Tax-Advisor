/**
 * Dashboard Layout Component
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  Upload as UploadIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Calculate as CalculateIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  path: string;
  badge?: number;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentPage = 'dashboard' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <ReceiptIcon />,
      path: '/transactions',
      badge: 3, // Example badge
    },
    {
      id: 'tax-calculator',
      label: 'Tax Calculator',
      icon: <CalculateIcon />,
      path: '/tax-calculator',
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <UploadIcon />,
      path: '/documents',
      badge: 5,
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: <AssessmentIcon />,
      path: '/reports',
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: <SecurityIcon />,
      path: '/compliance',
    },
    {
      id: 'company',
      label: 'Company Profile',
      icon: <BusinessIcon />,
      path: '/company',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const renderNavigationList = () => (
    <List sx={{ pt: 2 }}>
      {navigationItems.map((item) => (
        <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={currentPage === item.id}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mx: 2,
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.badge ? (
                <Badge badgeContent={item.badge} color="secondary">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: currentPage === item.id ? 600 : 500,
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo and Company Info */}
      <Box sx={{ p: 3, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BusinessIcon sx={{ color: 'primary.main', fontSize: 32, mr: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            TaxMaster AI
          </Typography>
        </Box>
        
        {user && (
          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Welcome back!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.first_name} {user.last_name}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip 
                label={user.role.toUpperCase()} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </Box>
        )}
      </Box>

      <Divider sx={{ mx: 2, mb: 1 }} />

      {/* Navigation Items */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {renderNavigationList()}
      </Box>

      {/* UAE Tax Info */}
      <Box sx={{ p: 2, m: 2, backgroundColor: 'warning.light', borderRadius: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'warning.dark' }}>
          UAE Corporate Tax Rate: 9%
        </Typography>
        <Typography variant="caption" display="block" sx={{ color: 'warning.dark' }}>
          Small Business Threshold: AED 3M
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
            {navigationItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
          </Typography>

          {/* Header Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="secondary">
                <NotificationsIcon sx={{ color: 'text.primary' }} />
              </Badge>
            </IconButton>

            <IconButton
              onClick={handleUserMenuOpen}
              sx={{ p: 0, ml: 1 }}
            >
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                {user?.first_name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleUserMenuClose}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleUserMenuClose}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;