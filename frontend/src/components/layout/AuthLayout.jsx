import React from 'react';
import { Box } from '@mui/material';

const AuthLayout = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, #E0F2F1 0%, #FFFFFF 100%)'
            : 'linear-gradient(135deg, #121212 0%, #1A237E 100%)',
      }}
    >
      {/* Decorative floating shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #3F51B5 30%, #00BFA6 90%)',
          opacity: 0.1,
          filter: 'blur(40px)',
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(20px)' },
            '100%': { transform: 'translateY(0px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #00BFA6 30%, #3F51B5 90%)',
          opacity: 0.1,
          filter: 'blur(60px)',
          animation: 'float-reverse 8s ease-in-out infinite',
          '@keyframes float-reverse': {
            '0%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-30px)' },
            '100%': { transform: 'translateY(0px)' },
          },
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          p: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AuthLayout;
