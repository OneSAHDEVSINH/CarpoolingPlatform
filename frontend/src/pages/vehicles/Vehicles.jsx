import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  Paper,
  Avatar, 
  CircularProgress
} from '@mui/material';
import {
  Add,
  DirectionsCar,
  Delete,
  LocalGasStation,
  EventSeat,
  Badge,
  CheckCircle,
  HelpOutline
} from '@mui/icons-material';
import mockApi from '../../services/api';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    model: '',
    registrationNumber: '',
    seatingCapacity: 4,
    fuelType: 'Petrol',
    fuelEfficiency: 15,
  });

  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });

  const [isLoading, setIsLoading] = useState(true);

  const fetchVehicles = async () => {
    try {
      const res = await mockApi.vehicles.list();
      setVehicles(res?.data?.vehicles || []);
    } catch (err) {
      console.error('Vehicles fetch error:', err);
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenDialog = () => {
    setNewVehicle({
      model: '',
      registrationNumber: '',
      seatingCapacity: 4,
      fuelType: 'Petrol',
      fuelEfficiency: 15,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (field) => (e) => {
    setNewVehicle({ ...newVehicle, [field]: e.target.value });
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newVehicle.model || !newVehicle.registrationNumber) return;

    try {
      const { data } = await mockApi.vehicles.create({
        owner_id: '1',
        model: newVehicle.model,
        registration_number: newVehicle.registrationNumber,
        seating_capacity: newVehicle.seatingCapacity,
        fuel_type: newVehicle.fuelType,
        fuel_efficiency: newVehicle.fuelEfficiency,
        is_active: true
      });
      
      setVehicles([...vehicles, data.vehicle]);
      setOpenDialog(false);
      setToast({ open: true, msg: 'Vehicle registered successfully!', severity: 'success' });
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to register vehicle';
      setToast({ open: true, msg: errMsg, severity: 'error' });
      console.error(err);
    }
  };

  const handleDeleteVehicle = async (id) => {
    try {
      await mockApi.vehicles.delete(id);
      setVehicles(vehicles.filter(v => v.id !== id));
      setToast({ open: true, msg: 'Vehicle removed successfully', severity: 'success' });
    } catch (err) {
      setToast({ open: true, msg: 'Failed to delete vehicle', severity: 'error' });
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" fontWeight={800} color="primary">
          🚙 Registered Vehicles
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
          sx={{
            borderRadius: 2.5,
            px: 3,
            py: 1.2,
            textTransform: 'none',
            fontWeight: 700,
            background: 'linear-gradient(45deg, #3F51B5 30%, #00BFA6 90%)',
            boxShadow: '0 4px 12px rgba(63,81,181,0.2)'
          }}
        >
          Add Vehicle
        </Button>
      </Box>

      <Grid container spacing={3}>
        {vehicles.map((v) => (
          <Grid item xs={12} sm={6} md={4} key={v.id}>
            <Card
              sx={{
                p: 3,
                borderRadius: 3.5,
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.25s ease'
                }
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
                      <DirectionsCar />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {v.model}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {v.registration_number}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label="Approved"
                    color="success"
                    size="small"
                    variant="outlined"
                    icon={<CheckCircle fontSize="small" />}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <EventSeat color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Capacity: <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{v.seating_capacity} seats</Box>
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LocalGasStation color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Fuel: <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{v.fuel_type} ({v.fuel_efficiency} km/l)</Box>
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <IconButton onClick={() => handleDeleteVehicle(v.id)} color="error" size="small" sx={{ border: '1px solid', borderColor: 'error.light', borderRadius: 2 }}>
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}

        {vehicles.length === 0 && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
              <DirectionsCar sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                No Vehicles Registered
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You must register at least one vehicle before you can offer rides to colleagues.
              </Typography>
              <Button variant="contained" onClick={handleOpenDialog} sx={{ borderRadius: 2, textTransform: 'none' }}>
                Register Vehicle
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Add Vehicle Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <form onSubmit={handleAddVehicle}>
          <DialogTitle sx={{ fontWeight: 700 }}>Register New Vehicle</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1.5 }}>
              <TextField
                fullWidth
                required
                label="Vehicle Model"
                placeholder="e.g. Tesla Model Y or Honda City"
                value={newVehicle.model}
                onChange={handleInputChange('model')}
              />

              <TextField
                fullWidth
                required
                label="Registration Number"
                placeholder="e.g. GJ01AB1234"
                value={newVehicle.registrationNumber}
                onChange={(e) => setNewVehicle({ ...newVehicle, registrationNumber: e.target.value.toUpperCase() })}
                inputProps={{ 
                  pattern: "^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$",
                  title: "Must be a valid Indian Registration Number (e.g., GJ01AB1234)"
                }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    select
                    label="Seating Capacity"
                    value={newVehicle.seatingCapacity}
                    onChange={handleInputChange('seatingCapacity')}
                  >
                    {[2, 3, 4, 5, 6, 7].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num} Seats
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    select
                    label="Fuel Type"
                    value={newVehicle.fuelType}
                    onChange={handleInputChange('fuelType')}
                  >
                    {['Petrol', 'Diesel', 'CNG', 'Electric'].map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                type="number"
                label="Fuel Efficiency (km/l or km/charge)"
                value={newVehicle.fuelEfficiency}
                onChange={handleInputChange('fuelEfficiency')}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={handleCloseDialog} sx={{ textTransform: 'none', borderRadius: 2 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}>
              Register
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Alert toast notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Vehicles;
