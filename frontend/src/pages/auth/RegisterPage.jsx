import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Divider,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  EmailOutlined,
  LockOutlined,
  PersonOutlined,
  PhoneOutlined,
  BusinessOutlined,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import mockApi from '../../services/api';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/carpooling');
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    let isValid = true;
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
      isValid = false;
    }

    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
      isValid = false;
    }

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Phone must be 10 digits';
      isValid = false;
    }

    if (!formData.organization.trim()) {
      errors.organization = 'Organization is required';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      const { data } = await mockApi.auth.register({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        org_name: formData.organization,
        password: formData.password,
      });
      login(data.token, data.user);
      setSuccess('Account created successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to register');
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card
          elevation={0}
          sx={{
            maxWidth: 500,
            width: '100%',
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            animation: `${slideUp} 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)`,
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(30,41,59,0.95)'
                : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{ width: 50, height: 50, mb: 1, objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join the carpooling community
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                error={!!formErrors.fullName}
                helperText={formErrors.fullName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlined color={formErrors.fullName ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
                sx={{ gridColumn: '1 / -1' }}
              />

              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!formErrors.email}
                helperText={formErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined color={formErrors.email ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Phone Number"
                variant="outlined"
                value={formData.phone}
                onChange={handleChange('phone')}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlined color={formErrors.phone ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Organization"
                variant="outlined"
                value={formData.organization}
                onChange={handleChange('organization')}
                error={!!formErrors.organization}
                helperText={formErrors.organization}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessOutlined color={formErrors.organization ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
                sx={{ gridColumn: '1 / -1' }}
              />

              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
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
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                variant="outlined"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined color={formErrors.confirmPassword ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 4,
                mb: 2,
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
                }
              }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : 'Create Account'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              or
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography component="span" variant="body2" color="primary.main" fontWeight={600}>
                  Log In
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Card>
      </Box>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </AuthLayout>
  );
};

export default RegisterPage;
