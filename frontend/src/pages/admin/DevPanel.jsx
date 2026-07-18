import React from 'react';
import { Box, Card, Typography, Grid, Button, Chip, Divider, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Launch,
  DirectionsCar,
  Search,
  History,
  AccountBalanceWallet,
  Settings,
  Shield,
  Map,
  CheckCircle,
  PlayArrow
} from '@mui/icons-material';

const DevPanel = () => {
  const navigate = useNavigate();

  const pages = [
    {
      title: 'Splash Screen',
      path: '/',
      description: 'The app loading screen displaying logo, tagline ("Ride Together, Save Together"), and background art. Auto-redirects to Login.',
      status: 'Ready',
      icon: <PlayArrow color="primary" />,
      color: 'info'
    },
    {
      title: 'Login Page',
      path: '/login',
      description: 'Secure email/password entry for registered employees. Includes field validation, error alerts, and direct sign-up redirect.',
      status: 'Ready',
      icon: <Launch color="primary" />,
      color: 'success'
    },
    {
      title: 'Register Page',
      path: '/register',
      description: 'Signup form for new employees, capturing Name, Email, Phone, Organization, and Password. Fully validated.',
      status: 'Ready',
      icon: <Launch color="primary" />,
      color: 'success'
    },
    {
      title: 'Carpooling (Find/Offer Ride)',
      path: '/carpooling',
      description: 'The main dashboard. Toggle between searching for a ride or publishing a ride. Calculates routes and schedules.',
      status: 'In Progress',
      icon: <Search color="primary" />,
      color: 'warning'
    },
    {
      title: 'My Trips & Live Tracking',
      path: '/my-trips',
      description: 'Displays active/upcoming rides, interactive tracking map, real-time status updates (booked, started, completed), and in-trip chat.',
      status: 'In Progress',
      icon: <Map color="primary" />,
      color: 'warning'
    },
    {
      title: 'My Vehicles',
      path: '/vehicles',
      description: 'Employee vehicle registration (Model, Plate, Seating capacity, Fuel type). Allows drivers to offer rides.',
      status: 'In Progress',
      icon: <DirectionsCar color="primary" />,
      color: 'warning'
    },
    {
      title: 'Ride History',
      path: '/ride-history',
      description: 'Archive of all completed carpools showing routes, dates, fare paid, and other participants.',
      status: 'In Progress',
      icon: <History color="primary" />,
      color: 'warning'
    },
    {
      title: 'Wallet & Payments',
      path: '/wallet',
      description: 'Displays user balance, lists past credits/debits, provides wallet recharging, and processes trip payments.',
      status: 'In Progress',
      icon: <AccountBalanceWallet color="primary" />,
      color: 'warning'
    },
    {
      title: 'Settings & Saved Places',
      path: '/settings',
      description: 'Manage user profiles, configure saved locations (Home, Work), toggle app preferences, and support options.',
      status: 'In Progress',
      icon: <Settings color="primary" />,
      color: 'warning'
    },
    {
      title: 'Admin Panel',
      path: '/admin',
      description: 'For Company Admins: manage employee participation, review registered vehicles, configure cost parameters, and set default carpooling policies.',
      status: 'In Progress',
      icon: <Shield color="primary" />,
      color: 'warning'
    }
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
          🛠️ Page Directory & Developer Panel
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Easily preview, test, and jump to any section of the Enterprise Carpooling Platform.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {pages.map((page, index) => (
          <Grid item xs={12} sm={6} md={6} key={index}>
            <Card
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {page.icon}
                    <Typography variant="h6" fontWeight={700}>
                      {page.title}
                    </Typography>
                  </Box>
                  <Chip
                    label={page.status}
                    color={page.color}
                    size="small"
                    variant="outlined"
                    icon={page.status === 'Ready' ? <CheckCircle /> : undefined}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 60, mb: 2 }}>
                  {page.description}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.muted" fontWeight={500}>
                  Route: <code>{page.path}</code>
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate(page.path)}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    background: 'linear-gradient(45deg, #3F51B5 30%, #00BFA6 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #303F9F 30%, #00897B 90%)',
                    }
                  }}
                >
                  Jump to Page
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mt: 5, p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          💡 Hackathon Testing Instructions
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          <ul>
            <li>To bypass login and access authenticated features directly, log in with email: <strong>priya@techcorp.com</strong> and any password (6+ characters).</li>
            <li>For admin view, log in with email: <strong>admin@techcorp.com</strong>.</li>
            <li>Use the Topbar navigation menu to switch pages. Switch the theme (☀️/🌙) anytime in the top right.</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
};

export default DevPanel;
