import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import { useAuth } from '../../contexts/AuthContext.jsx';

const scaleIn = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 1; }
`;

const SplashScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        if (isAuthenticated) {
          navigate('/carpooling');
        } else {
          navigate('/login');
        }
      }, 500); // 500ms fade out transition
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated]);

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: 'linear-gradient(180deg, #3F51B5 0%, #00BFA6 100%)',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/splash-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: `${scaleIn} 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
        }}
      >
        <Box
          component="img"
          src="/logo.png"
          alt="RideShare Logo"
          sx={{
            width: 120,
            height: 120,
            mb: 3,
            filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.3))',
            objectFit: 'contain'
          }}
          onError={(e) => {
            e.target.style.display = 'none'; // Fallback if no logo
          }}
        />

        <Typography
          variant="h2"
          component="h1"
          sx={{
            color: 'white',
            fontWeight: 800,
            letterSpacing: '-1px',
            textShadow: '0 0 20px rgba(255,255,255,0.4)',
            mb: 1,
          }}
        >
          RideShare
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 400,
            letterSpacing: '0.5px',
          }}
        >
          Ride Together, Save Together
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          display: 'flex',
          gap: 1.5,
          zIndex: 1,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: 'white',
              animation: `${pulse} 1.5s infinite ease-in-out`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default SplashScreen;
