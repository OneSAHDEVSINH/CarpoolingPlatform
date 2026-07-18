import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Topbar from './Topbar.jsx';

const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Horizontal top navbar containing all menu tabs */}
      <Topbar />
      
      {/* Content wrapper with margin offset for Topbar */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: '70px', // offset for topbar height
          pb: 4,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
