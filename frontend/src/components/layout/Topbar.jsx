import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  NotificationsOutlined,
  LightModeOutlined,
  DarkModeOutlined,
  DeveloperMode
} from '@mui/icons-material';
import { useThemeMode } from '../../contexts/ThemeContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

const Topbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mode, toggleTheme } = useThemeMode();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Nav items from mockup
  const navItems = [
    { text: 'Carpooling', path: '/carpooling' },
    { text: 'My Trips', path: '/my-trips' },
    { text: 'My Vehicle', path: '/vehicles' },
    { text: 'Ride History', path: '/ride-history' },
    { text: 'Wallet', path: '/wallet' },
  ];

  // Admin tools — strictly show only to users with role 'admin'
  const adminItems = user?.role === 'admin' ? [{ text: 'Admin Panel', path: '/admin' }] : [];
  
  // All items rendered in horizontal header tabs (Dev Panel hidden from header)
  const allItems = [...navItems, ...adminItems];

  const handleNavClick = (path) => {
    navigate(path);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ height: 70, display: 'flex', justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          {/* Logo & Mobile Menu Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 0.5 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{ height: 38, width: 38, objectFit: 'contain' }}
              onClick={() => navigate('/carpooling')}
              style={{ cursor: 'pointer' }}
            />
            
            <Typography
              variant="h6"
              fontWeight="800"
              color="primary"
              onClick={() => navigate('/carpooling')}
              sx={{ cursor: 'pointer', letterSpacing: '-0.5px', display: { xs: 'none', sm: 'block' } }}
            >
              RideShare
            </Typography>
          </Box>

          {/* Desktop Navigation Links (Mockup Tabs) */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {allItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const isSpecial = item.path === '/admin' || item.path === '/dev-panel';
                return (
                  <Button
                    key={item.text}
                    onClick={() => handleNavClick(item.path)}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive 
                        ? 'primary.main' 
                        : isSpecial 
                        ? 'text.secondary' 
                        : 'text.primary',
                      borderBottom: isActive ? '3px solid' : '3px solid transparent',
                      borderColor: 'primary.main',
                      borderRadius: 0,
                      '&:hover': {
                        bgcolor: 'action.hover',
                        color: 'primary.main'
                      },
                      transition: 'all 0.25s ease'
                    }}
                  >
                    {item.text}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* Right Side Icons & Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton color="inherit" onClick={toggleTheme} size="medium">
              {mode === 'dark' ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>

            <IconButton color="inherit" size="medium">
              <Badge badgeContent={1} color="error">
                <NotificationsOutlined />
              </Badge>
            </IconButton>

            <Box
              onClick={handleMenu}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                p: 0.5,
                borderRadius: 2,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              {!isMobile && (
                <Typography variant="body2" fontWeight="700">
                  {user?.name || 'Dero Addict'}
                </Typography>
              )}
              <Avatar
                src={user?.avatar}
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: 'primary.main',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(0,191,166,0.2)'
                }}
              >
                {user?.name ? user.name.charAt(0) : 'D'}
              </Avatar>
            </Box>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: { mt: 1.5, minWidth: 160, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }
              }}
            >
              <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>My Profile</MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>Settings</MenuItem>
              {user?.role === 'admin' && (
                <MenuItem onClick={() => { handleClose(); navigate('/admin'); }}>Admin Panel</MenuItem>
              )}
              <MenuItem onClick={() => { handleClose(); navigate('/dev-panel'); }}>Developer Panel</MenuItem>
              <Divider />
              <MenuItem onClick={() => { handleClose(); logout(); }} sx={{ color: 'error.main' }}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250, borderRadius: '0 16px 16px 0' }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="img" src="/logo.png" sx={{ height: 32, width: 32 }} />
          <Typography variant="h6" fontWeight="800" color="primary">
            RideShare
          </Typography>
        </Box>
        <Divider />
        <List sx={{ px: 1 }}>
          {allItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive ? 'primary.light' : 'transparent',
                    color: isActive ? 'primary.dark' : 'text.primary',
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 'inherit' }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    </>
  );
};

export default Topbar;
