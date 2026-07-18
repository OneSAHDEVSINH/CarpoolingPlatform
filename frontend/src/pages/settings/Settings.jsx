import React, { useState } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Settings,
  Person,
  LocationOn,
  Notifications,
  Delete,
  Add,
  Save,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';

const SettingsPage = () => {
  const { user, login } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || 'Priya Sharma',
    email: user?.email || 'priya@techcorp.com',
    phone: user?.phone || '9876543210',
  });

  const [savedPlaces, setSavedPlaces] = useState([
    { id: 1, label: 'Home', address: 'B-402, Rohan Mithila, Viman Nagar, Pune' },
    { id: 2, label: 'Office', address: 'TechCorp Tower, Hinjewadi Phase 1, Pune' }
  ]);

  const [notifications, setNotifications] = useState({
    rideBooked: true,
    rideStarted: true,
    chatMessage: true,
  });

  const [openAddPlace, setOpenAddPlace] = useState(false);
  const [newPlace, setNewPlace] = useState({ label: '', address: '' });
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });

  const handleProfileChange = (field) => (e) => {
    setProfile({ ...profile, [field]: e.target.value });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    login(localStorage.getItem('token'), { ...user, ...profile });
    setToast({ open: true, msg: 'Profile updated successfully!', severity: 'success' });
  };

  const handleToggleNotification = (field) => () => {
    setNotifications({ ...notifications, [field]: !notifications[field] });
  };

  const handleAddPlace = (e) => {
    e.preventDefault();
    if (!newPlace.label || !newPlace.address) return;
    setSavedPlaces([...savedPlaces, { id: Date.now(), ...newPlace }]);
    setOpenAddPlace(false);
    setToast({ open: true, msg: 'Location saved!', severity: 'success' });
  };

  const handleDeletePlace = (id) => {
    setSavedPlaces(savedPlaces.filter(p => p.id !== id));
    setToast({ open: true, msg: 'Location deleted', severity: 'success' });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h5" fontWeight={800} color="primary" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Settings /> App Settings
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Card details */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 4, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person color="primary" /> Profile Settings
            </Typography>
            
            <form onSubmit={handleSaveProfile}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem', fontWeight: 600 }}>
                    {profile.name.charAt(0)}
                  </Avatar>
                </Box>
                <TextField
                  fullWidth
                  required
                  label="Full Name"
                  value={profile.name}
                  onChange={handleProfileChange('name')}
                />
                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email Address"
                  value={profile.email}
                  onChange={handleProfileChange('email')}
                />
                <TextField
                  fullWidth
                  required
                  label="Phone Number"
                  value={profile.phone}
                  onChange={handleProfileChange('phone')}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  sx={{ borderRadius: 2.5, py: 1.2, mt: 1, textTransform: 'none', fontWeight: 700 }}
                >
                  Save Profile Info
                </Button>
              </Box>
            </form>
          </Card>
        </Grid>

        {/* Saved Places and Notifications */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={4}>
            {/* Saved Places */}
            <Grid item xs={12}>
              <Card sx={{ p: 4, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn color="primary" /> Saved Places
                  </Typography>
                  <IconButton onClick={() => setOpenAddPlace(true)} color="primary" size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <Add fontSize="small" />
                  </IconButton>
                </Box>

                <List disablePadding>
                  {savedPlaces.map((place, idx) => (
                    <Box key={place.id}>
                      <ListItem sx={{ py: 1.5, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <LocationOn color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={600}>{place.label}</Typography>}
                          secondary={<Typography variant="caption" color="text.secondary">{place.address}</Typography>}
                        />
                        <ListItemSecondaryAction>
                          <IconButton onClick={() => handleDeletePlace(place.id)} edge="end" color="error" size="small">
                            <Delete fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {idx < savedPlaces.length - 1 && <Divider component="li" />}
                    </Box>
                  ))}
                </List>
              </Card>
            </Grid>

            {/* Notification settings */}
            <Grid item xs={12}>
              <Card sx={{ p: 4, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Notifications color="primary" /> Notifications
                </Typography>

                <List disablePadding>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText primary={<Typography variant="body2" fontWeight={600}>Ride Booked Alerts</Typography>} secondary={<Typography variant="caption">Receive alerts when someone books your offer</Typography>} />
                    <ListItemSecondaryAction>
                      <Switch checked={notifications.rideBooked} onChange={handleToggleNotification('rideBooked')} />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText primary={<Typography variant="body2" fontWeight={600}>Transit Started Alerts</Typography>} secondary={<Typography variant="caption">Receive transit notifications when trip begins</Typography>} />
                    <ListItemSecondaryAction>
                      <Switch checked={notifications.rideStarted} onChange={handleToggleNotification('rideStarted')} />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText primary={<Typography variant="body2" fontWeight={600}>Message Notifications</Typography>} secondary={<Typography variant="caption">Notify when new chat coordinator messages arrive</Typography>} />
                    <ListItemSecondaryAction>
                      <Switch checked={notifications.chatMessage} onChange={handleToggleNotification('chatMessage')} />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Add Saved Place Dialog */}
      <Dialog open={openAddPlace} onClose={() => setOpenAddPlace(false)} PaperProps={{ sx: { borderRadius: 4 } }}>
        <form onSubmit={handleAddPlace}>
          <DialogTitle sx={{ fontWeight: 700 }}>Add Saved Place</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1.5 }}>
            <TextField
              fullWidth
              required
              label="Location Name"
              placeholder="e.g. Home, Work, Gym"
              value={newPlace.label}
              onChange={(e) => setNewPlace({ ...newPlace, label: e.target.value })}
            />
            <TextField
              fullWidth
              required
              label="Full Address"
              placeholder="Enter drop or search coordinates"
              value={newPlace.address}
              onChange={(e) => setNewPlace({ ...newPlace, address: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpenAddPlace(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none', borderRadius: 2 }}>
              Add Location
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity="success" sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
