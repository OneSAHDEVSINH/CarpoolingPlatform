import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Chip,
  Avatar,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  History,
  LocationOn,
  DirectionsCar,
  AccessTime,
  AttachMoney,
  Person
} from '@mui/icons-material';
import mockApi from '../../services/api';
import { useAuth } from '../../contexts/AuthContext.jsx';

const RideHistory = () => {
  const { user } = useAuth();
  const [historyList, setHistoryList] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');

  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const { data } = await mockApi.history.getHistory();
      setHistoryList(data.rides || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = historyList.filter((trip) => {
    if (roleFilter === 'all') return true;
    const isDriver = trip.driver?.id === user?.id || trip.driver?.name === user?.name;
    if (roleFilter === 'driver') return isDriver;
    if (roleFilter === 'passenger') return !isDriver;
    return true;
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={800} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <History /> Ride History
        </Typography>

        {/* Role Filters */}
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>Filter by Role</InputLabel>
          <Select
            value={roleFilter}
            label="Filter by Role"
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="all">All Commutes</MenuItem>
            <MenuItem value="driver">As Driver</MenuItem>
            <MenuItem value="passenger">As Passenger</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {filteredHistory.map((trip) => {
          const isDriver = trip.driver?.id === user?.id || trip.driver?.name === user?.name;
          const driverEarnings = (trip.passengers?.reduce((sum, p) => sum + p.seats_booked, 0) || 0) * (trip.fare_per_seat || 150);
          const myPassengerRecord = trip.passengers?.find(p => p.id === user?.id || p.name === user?.name);
          const displayFare = isDriver ? driverEarnings : (myPassengerRecord ? myPassengerRecord.seats_booked * (trip.fare_per_seat || 150) : (trip.fare_per_seat || 150));
          
          return (
          <Grid item xs={12} key={trip.id}>
            <Card
              sx={{
                p: 3,
                borderRadius: 3.5,
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.07)'
                }
              }}
            >
              <Grid container spacing={3} alignItems="center">
                {/* Left side: Date, time and route */}
                <Grid item xs={12} md={7}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <AccessTime color="action" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={700}>
                      {trip.date} • {trip.time}
                    </Typography>
                    <Chip label="COMPLETED" size="small" color="success" sx={{ fontSize: '0.65rem', fontWeight: 700 }} />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn color="primary" fontSize="small" />
                      <Typography variant="body2">
                        <Box component="span" sx={{ fontWeight: 600 }}>Start:</Box> {trip.pickup.address}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn color="error" fontSize="small" />
                      <Typography variant="body2">
                        <Box component="span" sx={{ fontWeight: 600 }}>Destination:</Box> {trip.destination.address}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Right side: Companion & Cost details */}
                <Grid item xs={12} md={5}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={7}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                          {trip.driver.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {trip.driver.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <DirectionsCar fontSize="inherit" /> {trip.vehicle.model}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={5} sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" fontWeight={800} color={isDriver ? "success.main" : "primary"}>
                        ₹{displayFare}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {isDriver ? 'Total Earnings' : 'Paid via Wallet'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Card>
          </Grid>
          );
        })}

        {filteredHistory.length === 0 && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
              <History sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                No History Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You have not completed any carpooling trips yet.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default RideHistory;
