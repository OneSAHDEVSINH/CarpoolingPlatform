import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Button,
  TextField,
  IconButton,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Paper,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Autocomplete,
  Avatar
} from '@mui/material';
import {
  Search,
  SwapVert,
  LocationOn,
  AccessTime,
  Event,
  Chair,
  Repeat,
  DirectionsCar,
  ChevronRight,
  AttachMoney,
  Map as MapIcon,
  Navigation
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import mockApi from '../../services/api';
import { useAuth } from '../../contexts/AuthContext.jsx';
import MapView from '../../components/maps/MapView.jsx';

const Carpooling = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('find'); // 'find' | 'offer'
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  
  // Form values
  const [startLoc, setStartLoc] = useState(null);
  const [destLoc, setDestLoc] = useState(null);

  // Autocomplete state
  const [startInput, setStartInput] = useState('');
  const [destInput, setDestInput] = useState('');
  const [startOptions, setStartOptions] = useState([]);
  const [destOptions, setDestOptions] = useState([]);
  const [locating, setLocating] = useState(false);

  // Debounce search effect for Start Location
  useEffect(() => {
    if (startInput.length < 3) return setStartOptions([]);
    const timer = setTimeout(async () => {
      try {
        const { data } = await mockApi.location.search(startInput);
        setStartOptions(data.map(item => ({
          address: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        })));
      } catch (err) {}
    }, 600);
    return () => clearTimeout(timer);
  }, [startInput]);

  // Debounce search effect for Dest Location
  useEffect(() => {
    if (destInput.length < 3) return setDestOptions([]);
    const timer = setTimeout(async () => {
      try {
        const { data } = await mockApi.location.search(destInput);
        setDestOptions(data.map(item => ({
          address: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        })));
      } catch (err) {}
    }, 600);
    return () => clearTimeout(timer);
  }, [destInput]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const { data } = await mockApi.location.reverseGeocode(latitude, longitude);
        const address = data.display_name || 'My Location';
        const locObj = { lat: latitude, lng: longitude, address };
        setStartLoc(locObj);
        setStartInput(address);
      } catch(e) {}
      setLocating(false);
    }, () => setLocating(false));
  };
  const [dateTime, setDateTime] = useState('2026-07-18T17:12');
  const [seats, setSeats] = useState(1);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [farePerSeat, setFarePerSeat] = useState(45);

  // Map & Route dialog states
  const [showRouteConfirm, setShowRouteConfirm] = useState(false);
  const [calculatedRoute, setCalculatedRoute] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const { data } = await mockApi.vehicles.list();
        setVehicles(data.vehicles);
        if (data.vehicles.length > 0) {
          setSelectedVehicle(data.vehicles[0].id);
        }
      } catch (err) {
        console.error('Failed to load vehicles', err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const handleSwapLocations = () => {
    const tempLoc = startLoc; setStartLoc(destLoc); setDestLoc(tempLoc);
    const tempInp = startInput; setStartInput(destInput); setDestInput(tempInp);
  };

  const handleFindRideSubmit = async (e) => {
    e.preventDefault();
    if (!startLoc || !destLoc) return;
    
    setLoading(true);
    try {
      // Route calculation using OSRM
      const pickup = startLoc;
      const drop = destLoc;
      const { data } = await mockApi.route.calculate(pickup, drop);
      setCalculatedRoute(data);
      
      // Search rides matching route
      const ridesRes = await mockApi.rides.search({
        pickup: startLoc,
        destination: destLoc,
        date: dateTime.split('T')[0],
        seats: seats
      });
      setSearchResults(ridesRes.data.rides);
      
      setLoading(false);
      setShowRouteConfirm(true);
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  const handleOfferRideSubmit = async (e) => {
    e.preventDefault();
    if (!startLoc || !destLoc) return;

    setLoading(true);
    try {
      const pickup = startLoc;
      const drop = destLoc;
      const { data } = await mockApi.route.calculate(pickup, drop);
      setCalculatedRoute(data);
      
      setLoading(false);
      setShowRouteConfirm(true);
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  const confirmRouteAndProceed = async () => {
    setShowRouteConfirm(false);
    if (activeTab === 'find') {
      setShowResults(true);
    } else {
      setLoading(true);
      try {
        await mockApi.rides.create({
          pickup: startLoc,
          destination: destLoc,
          travel_date: dateTime.split('T')[0],
          travel_time: dateTime.split('T')[1],
          vehicle_id: selectedVehicle,
          available_seats: seats,
          fare_per_seat: farePerSeat,
          route_polyline: calculatedRoute.polyline,
          distance_km: calculatedRoute.distance_km,
          is_recurring: isRecurring
        });
        setLoading(false);
        navigate('/my-trips');
      } catch (err) {
        setLoading(false);
        console.error(err);
      }
    }
  };

  const bookRide = async (ride) => {
    setLoading(true);
    try {
      await mockApi.bookings.create({ ride_id: ride.id, seats_booked: seats });
      setLoading(false);
      navigate('/my-trips');
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  if (isInitialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 1, md: 3 } }}>
      {!showResults ? (
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Header tabs toggle buttons */}
          <Box sx={{ display: 'flex', bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Button
              onClick={() => setActiveTab('find')}
              sx={{
                flex: 1,
                py: 2.5,
                fontSize: '1.1rem',
                fontWeight: activeTab === 'find' ? 700 : 500,
                color: activeTab === 'find' ? 'primary.main' : 'text.secondary',
                bgcolor: activeTab === 'find' ? 'background.paper' : 'transparent',
                borderRadius: 0,
                borderBottom: activeTab === 'find' ? '3px solid' : 'none',
                borderColor: 'primary.main',
                '&:hover': { bgcolor: activeTab === 'find' ? 'background.paper' : 'action.selected' }
              }}
            >
              Find Ride
            </Button>
            <Button
              onClick={() => setActiveTab('offer')}
              sx={{
                flex: 1,
                py: 2.5,
                fontSize: '1.1rem',
                fontWeight: activeTab === 'offer' ? 700 : 500,
                color: activeTab === 'offer' ? 'primary.main' : 'text.secondary',
                bgcolor: activeTab === 'offer' ? 'background.paper' : 'transparent',
                borderRadius: 0,
                borderBottom: activeTab === 'offer' ? '3px solid' : 'none',
                borderColor: 'primary.main',
                '&:hover': { bgcolor: activeTab === 'offer' ? 'background.paper' : 'action.selected' }
              }}
            >
              Offer Ride
            </Button>
          </Box>

          <Box sx={{ p: { xs: 3, md: 5 } }}>
            <form onSubmit={activeTab === 'find' ? handleFindRideSubmit : handleOfferRideSubmit}>
              <Grid container spacing={3} alignItems="center">
                {/* Start Location */}
                <Grid item xs={11}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={700} color="primary">
                      Start Location
                    </Typography>
                    <Button size="small" onClick={handleLocateMe} disabled={locating} startIcon={locating ? <CircularProgress size={14}/> : <Navigation />}>
                      Locate Me
                    </Button>
                  </Box>
                  <Autocomplete
                    freeSolo
                    options={startOptions}
                    getOptionLabel={(option) => typeof option === 'string' ? option : option.address}
                    value={startLoc}
                    onChange={(e, val) => {
                      setStartLoc(val);
                      if(val?.address) setStartInput(val.address);
                    }}
                    inputValue={startInput}
                    onInputChange={(e, val) => setStartInput(val)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required={!startLoc}
                        placeholder="Search pick-up location..."
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Swap button */}
                <Grid item xs={1} sx={{ display: 'flex', justifyContent: 'center', pt: '28px !important' }}>
                  <IconButton
                    onClick={handleSwapLocations}
                    sx={{
                      bgcolor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      '&:hover': { bgcolor: 'primary.main', color: 'white' }
                    }}
                  >
                    <SwapVert />
                  </IconButton>
                </Grid>

                {/* Destination Location */}
                <Grid item xs={12}>
                  <Typography variant="body2" fontWeight={700} color="primary" sx={{ mb: 1 }}>
                    Destination Location
                  </Typography>
                  <Autocomplete
                    freeSolo
                    options={destOptions}
                    getOptionLabel={(option) => typeof option === 'string' ? option : option.address}
                    value={destLoc}
                    onChange={(e, val) => {
                      setDestLoc(val);
                      if(val?.address) setDestInput(val.address);
                    }}
                    inputValue={destInput}
                    onInputChange={(e, val) => setDestInput(val)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required={!destLoc}
                        placeholder="Search drop-off location..."
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn color="error" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Travel Date & Time */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
                    Travel Date & Time
                  </Typography>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTime color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Seats Selector */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
                    {activeTab === 'find' ? 'Seats Needed' : 'Seats Available'}
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Chair color="action" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {Array.from(
                      { length: activeTab === 'offer' ? (vehicles.find(v => String(v.id) === String(selectedVehicle))?.seating_capacity || 4) : 6 },
                      (_, i) => i + 1
                    ).map((num) => (
                      <MenuItem key={num} value={num}>
                        Seat {num}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Driver-specific Fields (Offer tab only) */}
                {activeTab === 'offer' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
                        Select Vehicle
                      </Typography>
                      <TextField
                        fullWidth
                        select
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DirectionsCar color="action" />
                            </InputAdornment>
                          ),
                        }}
                      >
                        {vehicles.map((v) => (
                          <MenuItem key={v.id} value={v.id}>
                            {v.model} ({v.registration_number})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
                        Fare Per Seat (₹)
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        value={farePerSeat}
                        onChange={(e) => setFarePerSeat(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </>
                )}

                {/* Recurring Ride Switch */}
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Repeat color="action" />
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          Recurring Ride
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Schedule this commute regularly (Mo, Tu, We, Th, Fr)
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      color="primary"
                    />
                  </Paper>
                </Grid>

                {/* Action button */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.8,
                      borderRadius: 3,
                      background: 'linear-gradient(45deg, #3F51B5 30%, #00BFA6 90%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: '0 4px 20px rgba(0,191,166,0.25)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #303F9F 30%, #00897B 90%)',
                        boxShadow: '0 6px 24px rgba(0,191,166,0.35)',
                      }
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={26} color="inherit" />
                    ) : activeTab === 'find' ? (
                      'Find Ride'
                    ) : (
                      'Offer Ride'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Card>
      ) : (
        /* Search Results Panel */
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={700}>
              Available Rides ({searchResults.length})
            </Typography>
            <Button variant="outlined" onClick={() => setShowResults(false)} sx={{ borderRadius: 2 }}>
              Back to Search
            </Button>
          </Box>

          <Grid container spacing={3}>
            {searchResults.map((ride) => (
              <Grid item xs={12} key={ride.id}>
                <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          {ride.driver.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={700}>
                            {ride.driver.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            🚗 {ride.vehicle.model} • {ride.vehicle.registration_number}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn color="primary" fontSize="small" />
                          <Typography variant="body2" fontWeight={500}>
                            {ride.pickup.address}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn color="error" fontSize="small" />
                          <Typography variant="body2" fontWeight={500}>
                            {ride.destination.address}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
                      <Typography variant="h5" fontWeight={800} color="primary" sx={{ mb: 1 }}>
                        ₹{ride.fare_per_seat}
                        <Typography component="span" variant="caption" color="text.secondary">
                          / seat
                        </Typography>
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Chip label={`${ride.available_seats} seats left`} color="success" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                      </Box>

                      <Button
                        variant="contained"
                        onClick={() => bookRide(ride)}
                        endIcon={<ChevronRight />}
                        sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                      >
                        Book Ride
                      </Button>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Route Confirmation Dialog */}
      <Dialog
        open={showRouteConfirm}
        onClose={() => setShowRouteConfirm(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Confirm Route Details
        </DialogTitle>
        <DialogContent>
          {calculatedRoute && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" uppercase>Distance</Typography>
                    <Typography variant="h6" fontWeight={700}>{calculatedRoute.distance_km} km</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" uppercase>Est. Duration</Typography>
                    <Typography variant="h6" fontWeight={700}>{calculatedRoute.duration_min} mins</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Render Leaflet Map */}
              <Box sx={{ height: 350, width: '100%', borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <MapView
                  center={[startLoc?.lat || 18.55, startLoc?.lng || 73.80]}
                  zoom={12}
                  polyline={calculatedRoute.polyline}
                  markers={[
                    { lat: startLoc?.lat, lng: startLoc?.lng, label: 'Pickup' },
                    { lat: destLoc?.lat, lng: destLoc?.lng, label: 'Dropoff' }
                  ]}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setShowRouteConfirm(false)} sx={{ borderRadius: 2, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmRouteAndProceed}
            startIcon={<Navigation />}
            sx={{ borderRadius: 2, textTransform: 'none', px: 4 }}
          >
            Confirm & Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Carpooling;
