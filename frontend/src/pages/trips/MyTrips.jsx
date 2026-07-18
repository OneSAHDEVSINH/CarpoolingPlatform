import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  Avatar,
  Divider,
  Paper,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton ,
  Badge,
  LinearProgress,
  Dialog,
  DialogContent,
  DialogTitle
} from '@mui/material';
import {
  Send,
  Navigation,
  CheckCircle,
  Chat,
  DirectionsCar,
  LocationOn,
  Payment,
  Schedule,
  Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import mockApi from '../../services/api';
import { useAuth } from '../../contexts/AuthContext.jsx';
import MapView from '../../components/maps/MapView.jsx';

const MyTrips = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tabValue, setTabValue] = useState(0); // 0: Upcoming/Active, 1: Completed
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  
  // Chat simulator states
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Rahul Mehta', text: 'Hey Priya, I have started from my home. I will reach in 10 mins.', time: '8:15 AM' },
    { sender: 'Priya Sharma', text: 'Sure Rahul, I am waiting at the main gate.', time: '8:17 AM' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const chatEndRef = useRef(null);

  // Live tracking simulator states
  const [carPosition, setCarPosition] = useState(null);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [trackingActive, setTrackingActive] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const animationRef = useRef(null);

  const fetchTrips = async () => {
    try {
      const res = await mockApi.trips.list();
      const tripList = res?.data?.trips || [];
      setTrips(tripList);
      // Select the first trip by default if available
      if (tripList.length > 0) {
        setSelectedTrip(tripList[0]);
      } else {
        setSelectedTrip(null);
      }
    } catch (err) {
      console.error('Trips fetch error:', err);
      setTrips([]);
      setSelectedTrip(null);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Set up mock route polyline for the trip
  useEffect(() => {
    if (selectedTrip && selectedTrip.pickup && selectedTrip.destination) {
      const pickup = selectedTrip.pickup;
      const destination = selectedTrip.destination;
      
      // Attempt to calculate real route using OSRM if route_polyline is not provided by backend
      const fetchRoute = async () => {
        try {
          if (selectedTrip.route_polyline && selectedTrip.route_polyline.length > 0) {
            setRoutePolyline(selectedTrip.route_polyline);
            setCarPosition({ lat: pickup.lat, lng: pickup.lng });
            setProgressIndex(0);
          } else {
            const { data } = await mockApi.route.calculate(pickup, destination);
            if (data && data.polyline) {
              setRoutePolyline(data.polyline);
              setCarPosition({ lat: pickup.lat, lng: pickup.lng });
              setProgressIndex(0);
            }
          }
        } catch (e) {
          // Fallback to straight line if OSRM fails
          const steps = 30;
          const line = Array.from({ length: steps + 1 }, (_, i) => [
            pickup.lat + (destination.lat - pickup.lat) * (i / steps),
            pickup.lng + (destination.lng - pickup.lng) * (i / steps),
          ]);
          setRoutePolyline(line);
          setCarPosition({ lat: pickup.lat, lng: pickup.lng });
          setProgressIndex(0);
        }
        setTrackingActive(selectedTrip.status === 'started' || selectedTrip.status === 'in_progress');
      };
      
      fetchRoute();
    }
  }, [selectedTrip]);

  // Handle simulated location updates along the route
  useEffect(() => {
    if (trackingActive && routePolyline.length > 0) {
      animationRef.current = setInterval(() => {
        setProgressIndex((prev) => {
          const next = prev + 1;
          if (next >= routePolyline.length) {
            clearInterval(animationRef.current);
            setTrackingActive(false);
            // Auto complete trip in demo
            handleCompleteTrip();
            return prev;
          }
          const nextCoords = routePolyline[next];
          if (nextCoords && nextCoords.length === 2) {
            setCarPosition({ lat: nextCoords[0], lng: nextCoords[1] });
          }
          return next;
        });
      }, 2000); // update marker position every 2s
    }

    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [trackingActive, routePolyline]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    const newMsg = {
      sender: user?.name || 'Priya Sharma',
      text: inputMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([...chatMessages, newMsg]);
    setInputMsg('');

    // Simulate auto reply in 2 seconds
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: selectedTrip?.driver?.name || 'Rahul Mehta',
          text: 'Sounds good! On my way.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 2000);
  };

  const handleStartTrip = async () => {
    if (!selectedTrip) return;
    try {
      const { data } = await mockApi.trips.start(selectedTrip.id);
      setSelectedTrip(data.trip);
      setTrips(trips.map(t => t.id === selectedTrip.id ? data.trip : t));
      setTrackingActive(true);
    } catch(err) { console.error(err); }
  };

  const handleCompleteTrip = async () => {
    if (!selectedTrip) return;
    try {
      const { data } = await mockApi.trips.complete(selectedTrip.id);
      setSelectedTrip(data.trip);
      setTrips(trips.map(t => t.id === selectedTrip.id ? data.trip : t));
      setTrackingActive(false);
    } catch(err) { console.error(err); }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked': return 'info';
      case 'started':
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  // Filter trips based on tab
  const activeTrips = trips.filter(t => t.status !== 'completed');
  const completedTrips = trips.filter(t => t.status === 'completed');

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }} color="primary">
        🗺️ My Commuting Journeys
      </Typography>

      <Grid container spacing={3}>
        {/* Left Side: Trip lists and selected detail */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, val) => setTabValue(val)}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label={`Active (${activeTrips.length})`} />
              <Tab label={`Completed (${completedTrips.length})`} />
            </Tabs>

            <List sx={{ mt: 2, maxHeight: 350, overflowY: 'auto' }}>
              {(tabValue === 0 ? activeTrips : completedTrips).map((trip) => (
                <ListItem
                  key={trip.id}
                  disablePadding
                  sx={{
                    mb: 1.5,
                    border: '1px solid',
                    borderColor: selectedTrip?.id === trip.id ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    bgcolor: selectedTrip?.id === trip.id ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemButton onClick={() => setSelectedTrip(trip)} sx={{ p: 2 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {trip.date} • {trip.time}
                          </Typography>
                          <Chip
                            label={trip.status.toUpperCase()}
                            size="small"
                            color={getStatusColor(trip.status)}
                            sx={{ fontSize: '0.65rem', fontWeight: 700 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ pl: 0.5 }}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, my: 0.5 }}>
                            📍 <Box component="span" sx={{ fontWeight: 600 }}>From:</Box> {trip.pickup.address}
                          </Typography>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            🏁 <Box component="span" sx={{ fontWeight: 600 }}>To:</Box> {trip.destination.address}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              {(tabValue === 0 ? activeTrips : completedTrips).length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No trips found in this category.
                </Typography>
              )}
            </List>
          </Card>

          {/* Selected Trip Actions & Detail Details */}
          {selectedTrip && (
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Trip Actions & Details
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 44, height: 44 }}>
                  {selectedTrip.driver.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {selectedTrip.driver.name} (Driver)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    📞 {selectedTrip.driver.phone} • ⭐ {selectedTrip.driver.rating}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Vehicle Model</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedTrip.vehicle.model}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Reg. Number</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedTrip.vehicle.registration_number}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Total Fare</Typography>
                  <Typography variant="body2" fontWeight={700} color="primary">₹{selectedTrip.total_fare || selectedTrip.ride?.fare_per_seat || 150}</Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {selectedTrip.status === 'booked' && (
                  <Button
                    variant="contained"
                    startIcon={<Navigation />}
                    onClick={handleStartTrip}
                    fullWidth
                    sx={{ py: 1.2, borderRadius: 2 }}
                  >
                    Start Trip
                  </Button>
                )}

                {selectedTrip.status === 'started' && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={handleCompleteTrip}
                    fullWidth
                    sx={{ py: 1.2, borderRadius: 2 }}
                  >
                    Complete Trip
                  </Button>
                )}

                {selectedTrip.status === 'completed' && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Payment />}
                    onClick={() => navigate(`/wallet?trip=${selectedTrip.id}&amount=${selectedTrip.total_fare || selectedTrip.ride?.fare_per_seat || 150}`)}
                    fullWidth
                    sx={{ py: 1.2, borderRadius: 2 }}
                  >
                    Process Payment (₹{selectedTrip.total_fare || selectedTrip.ride?.fare_per_seat || 150})
                  </Button>
                )}
              </Box>
            </Card>
          )}
        </Grid>

        {/* Right Side: Map & Interactive Chat */}
        <Grid item xs={12} md={7}>
          <Grid container spacing={3}>
            {/* Live Tracking Map */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    🗺️ Live Journey Map
                  </Typography>
                  {trackingActive && (
                    <Chip
                      label="LIVE TRACKING ACTIVE"
                      color="warning"
                      size="small"
                      sx={{ animation: 'blink 1.5s infinite', fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>

                <Box sx={{ height: 350, borderRadius: 2, overflow: 'hidden' }}>
                  {selectedTrip ? (
                    <MapView
                      center={[selectedTrip.pickup.lat, selectedTrip.pickup.lng]}
                      zoom={13}
                      polyline={routePolyline}
                      markers={[
                        { lat: selectedTrip.pickup.lat, lng: selectedTrip.pickup.lng, label: 'Pickup point' },
                        { lat: selectedTrip.destination.lat, lng: selectedTrip.destination.lng, label: 'Dropoff point' },
                        ...(carPosition ? [{ lat: carPosition.lat, lng: carPosition.lng, label: trackingActive ? 'Driver moving' : 'Driver parked' }] : [])
                      ]}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', bgcolor: 'action.hover' }}>
                      <Typography color="text.secondary">Select a trip to load the map</Typography>
                    </Box>
                  )}
                </Box>

                {trackingActive && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Simulated Transit Progress: {Math.round((progressIndex / routePolyline.length) * 100)}%
                    </Typography>
                    <LinearProgress variant="determinate" value={(progressIndex / routePolyline.length) * 100} sx={{ height: 8, borderRadius: 1 }} />
                  </Box>
                )}
              </Card>
            </Grid>

            {/* Chat Box Panel */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chat color="primary" /> In-Trip Coordinator Chat
                </Typography>
                
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    height: 200,
                    overflowY: 'auto',
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    bgcolor: 'background.default'
                  }}
                >
                  {chatMessages.map((msg, i) => {
                    const isSelf = msg.sender === user?.name || msg.sender === 'Priya Sharma';
                    return (
                      <Box
                        key={i}
                        sx={{
                          alignSelf: isSelf ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" display="block" align={isSelf ? 'right' : 'left'} sx={{ mb: 0.25 }}>
                          {msg.sender}
                        </Typography>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: isSelf ? '16px 16px 0px 16px' : '16px 16px 16px 0px',
                            bgcolor: isSelf ? 'primary.main' : 'background.paper',
                            color: isSelf ? 'primary.contrastText' : 'text.primary',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                          }}
                        >
                          <Typography variant="body2">{msg.text}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.muted" display="block" align={isSelf ? 'right' : 'left'} sx={{ mt: 0.25, fontSize: '0.65rem' }}>
                          {msg.time}
                        </Typography>
                      </Box>
                    );
                  })}
                  <div ref={chatEndRef} />
                </Paper>

                <form onSubmit={handleSendMessage}>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Type message here..."
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                    />
                    <IconButton type="submit" color="primary" sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
                      <Send />
                    </IconButton>
                  </Box>
                </form>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MyTrips;
