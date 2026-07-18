import axios from 'axios';

// Centralized configuration: 
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Bypass-Tunnel-Reminder': 'true', // Bypasses localtunnel warning page
    'ngrok-skip-browser-warning': 'true' // Bypasses ngrok warning page
  }
});

// Add a request interceptor to automatically attach the JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// We map the actual Axios calls to return { data: response.data } 
// Helper to format backend flattened locations to frontend nested structure
const mapLocationData = (item) => {
  if (!item) return item;
  return {
    ...item,
    pickup: {
      lat: item.pickup_lat,
      lng: item.pickup_lng,
      address: item.pickup_address || 'Unknown address'
    },
    destination: {
      lat: item.destination_lat,
      lng: item.destination_lng,
      address: item.destination_address || 'Unknown address'
    }
  };
};

const api = {
  auth: {
    login: async (email, password) => {
      const response = await axiosInstance.post('/auth/login', { email, password });
      return { data: response.data }; 
    },
    register: async (userData) => {
      const response = await axiosInstance.post('/auth/register', userData);
      return { data: response.data };
    },
    getProfile: async () => {
      const response = await axiosInstance.get('/auth/me');
      return { data: { user: response.data } };
    },
  },

  vehicles: {
    list: async () => {
      const response = await axiosInstance.get('/vehicles/');
      return { data: { vehicles: response.data } };
    },
    create: async (data) => {
      const response = await axiosInstance.post('/vehicles/', data);
      return { data: { vehicle: response.data } };
    },
    update: async (id, data) => {
      const response = await axiosInstance.put(`/vehicles/${id}`, data);
      return { data: { vehicle: response.data } };
    },
    delete: async (id) => {
      const response = await axiosInstance.delete(`/vehicles/${id}`);
      return { data: { success: true } };
    }
  },

  rides: {
    search: async (params) => {
      const response = await axiosInstance.post('/rides/search', params);
      return { data: { rides: response.data.map(mapLocationData) } };
    },
    create: async (data) => {
      const response = await axiosInstance.post('/rides/', data);
      return { data: { ride: mapLocationData(response.data) } };
    },
    my: async () => {
      const response = await axiosInstance.get('/rides/my');
      return { data: { rides: response.data.map(mapLocationData) } };
    },
  },

  trips: {
    list: async () => {
      const response = await axiosInstance.get('/trips/my');
      return { data: { trips: response.data.map(mapLocationData) } };
    },
    get: async (id) => {
      const response = await axiosInstance.get(`/trips/${id}`);
      return { data: { trip: mapLocationData(response.data) } };
    },
    start: async (id) => {
      const response = await axiosInstance.put(`/trips/${id}/start`);
      return { data: { trip: mapLocationData(response.data) } };
    },
    complete: async (id) => {
      const response = await axiosInstance.put(`/trips/${id}/complete`);
      return { data: { trip: mapLocationData(response.data) } };
    },
    getChat: async (id) => {
      const response = await axiosInstance.get(`/trips/${id}/chat`);
      return { data: response.data };
    },
    sendChat: async (id, message) => {
      const response = await axiosInstance.post(`/trips/${id}/chat`, { message });
      return { data: response.data };
    }
  },

  bookings: {
    create: async (data) => {
      const response = await axiosInstance.post('/bookings/', data);
      return { data: { booking: response.data } };
    }
  },

  wallet: {
    balance: async () => {
      const response = await axiosInstance.get('/wallet/');
      return { data: response.data };
    },
    recharge: async (amount) => {
      const response = await axiosInstance.post('/wallet/recharge', { amount });
      return { data: response.data };
    },
    pay: async (data) => {
      const response = await axiosInstance.post('/payments/', { ...data, method: 'wallet' });
      return { data: response.data };
    },
    transactions: async () => {
      const response = await axiosInstance.get('/wallet/transactions');
      return { data: { transactions: response.data } };
    }
  },

  reports: {
    summary: async () => {
      const response = await axiosInstance.get('/reports/summary');
      return { data: response.data };
    }
  },

  history: {
    getHistory: async () => {
      // Mock history list basically returned completed trips
      const response = await axiosInstance.get('/trips/my');
      return { data: { rides: response.data.map(mapLocationData) } };
    }
  },

  admin: {
    getEmployees: async () => {
      const response = await axiosInstance.get('/admin/employees');
      return { data: response.data };
    },
    addEmployee: async (data) => {
      const response = await axiosInstance.post('/admin/employees', data);
      return { data: response.data };
    },
    updateEmployeeAccess: async (id, status) => {
      const response = await axiosInstance.put(`/admin/employees/${id}/status`, { is_active: status === 'active' });
      return { data: response.data };
    },
    getOrgVehicles: async () => {
      const response = await axiosInstance.get('/admin/org/vehicles'); // or whatever route you have
      return { data: response.data };
    },
    addOrgVehicle: async (data) => {
      const response = await axiosInstance.post('/admin/org/vehicles', data);
      return { data: response.data };
    },
    updateVehicleStatus: async (id, status) => {
      const response = await axiosInstance.put(`/admin/org/vehicles/${id}/status`, { status });
      return { data: response.data };
    },
    getOrgSettings: async () => {
      const response = await axiosInstance.get('/admin/org/settings');
      return { data: response.data };
    },
    saveOrgSettings: async (data) => {
      const response = await axiosInstance.put('/admin/org/settings', data);
      return { data: response.data };
    }
  },

  // --- External Free APIs for Hackathon ---

  location: {
    search: async (query) => {
      // Use standard axios to avoid sending our JWT to Nominatim
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`);
      return { data: response.data };
    },
    reverseGeocode: async (lat, lng) => {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      return { data: response.data };
    }
  },

  route: {
    calculate: async (pickup, destination) => {
      // OSRM expects coordinates in lng,lat format
      const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
      const response = await axios.get(url);
      
      if (response.data.code !== 'Ok' || !response.data.routes.length) {
        throw new Error('Route calculation failed');
      }

      const route = response.data.routes[0];
      
      // OSRM returns polyline as array of [lng, lat]. Leaflet needs [lat, lng]
      const polyline = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
      
      return {
        data: {
          distance_km: parseFloat((route.distance / 1000).toFixed(1)),
          duration_min: Math.round(route.duration / 60),
          polyline: polyline,
          pickup_address: pickup.address,
          destination_address: destination.address
        }
      };
    }
  }
};

export default api;
