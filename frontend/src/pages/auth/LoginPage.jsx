import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Divider,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import mockApi from '../../services/api';

/* Slide-up entrance animation */
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/carpooling');
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({ email: '', password: '' });

  const validate = () => {
    let isValid = true;
    const errors = { email: '', password: '' };

    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (formData.email.includes('@') && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      const { data } = await mockApi.auth.login(formData.email, formData.password);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Try priya@techcorp.com');
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card
          elevation={0}
          sx={{
            maxWidth: 440,
            width: '100%',
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            animation: `${slideUp} 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)`,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(30,41,59,0.95)'
                : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Logo & Heading */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="RideShare Logo"
              sx={{ width: 60, height: 60, mb: 1, objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <Typography variant="h6" fontWeight={700} color="primary" sx={{ mb: 0.5 }}>
              RideShare
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue your journey
            </Typography>
          </Box>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              id="login-email"
              fullWidth
              label="Email or Mobile"
              variant="outlined"
              margin="normal"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined color={formErrors.email ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              id="login-password"
              fullWidth
              label="Password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color={formErrors.password ? 'error' : 'action'} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={<Checkbox color="primary" size="small" />}
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <Typography variant="body2" color="primary.main" fontWeight={600} sx={{ cursor: 'pointer' }}>
                Forgot Password?
              </Typography>
            </Box>

            <Button
              id="login-submit"
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #3F51B5 30%, #00BFA6 90%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(63,81,181,0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #303F9F 30%, #00897B 90%)',
                  boxShadow: '0 6px 16px rgba(63,81,181,0.4)',
                },
              }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : 'Log In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              or
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography component="span" variant="body2" color="primary.main" fontWeight={600}>
                  Sign Up
                </Typography>
              </Link>
            </Typography>
          </Box>

          {/* Demo credentials hint
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.light', borderRadius: 2, opacity: 0.8 }}>
            <Typography variant="caption" color="primary.dark" display="block" textAlign="center">
              Demo: priya@techcorp.com / any password (6+ chars)
            </Typography>
          </Box> */}
        </Card>
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </AuthLayout>
  );
};

export default LoginPage;
