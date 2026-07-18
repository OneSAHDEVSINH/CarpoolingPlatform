/* ======================================================
   Mock API Service — Use until backend is ready
   Switch individual services to real API as backend
   endpoints become available.
   ====================================================== */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => delay(Math.floor(Math.random() * 700) + 500);

/* ---------- Mock Data ---------- */

const mockUsers = [
  { id: '1', name: 'Priya Sharma', email: 'priya@techcorp.com', phone: '9876543210', role: 'employee', org_id: '1' },
  { id: '2', name: 'Rahul Mehta', email: 'rahul@techcorp.com', phone: '9876543211', role: 'employee', org_id: '1' },
  { id: '3', name: 'Admin User', email: 'admin@techcorp.com', phone: '9876543212', role: 'admin', org_id: '1' },
];

const mockVehicles = [
  { id: 'v1', owner_id: '2', model: 'Toyota Camry', registration_number: 'MH-12-AB-1234', seating_capacity: 4, fuel_type: 'Petrol', fuel_efficiency: 15.5 },
  { id: 'v2', owner_id: '2', model: 'Honda City', registration_number: 'MH-14-CD-5678', seating_capacity: 4, fuel_type: 'Diesel', fuel_efficiency: 18.2 },
];

const mockRides = [
  {
    id: 'r1',
    driver: { id: '2', name: 'Rahul Mehta', avatar: null, rating: 4.5 },
    vehicle: { model: 'Toyota Camry', registration_number: 'MH-12-AB-1234' },
    pickup: { lat: 18.5362, lng: 73.8973, address: 'Koregaon Park, Pune' },
    destination: { lat: 18.5912, lng: 73.7388, address: 'Hinjewadi Phase 1, Pune' },
    date: '2026-07-20', time: '08:30',
    available_seats: 3, fare_per_seat: 45,
    distance_km: 18.5, duration_min: 35,
    status: 'active',
  },
  {
    id: 'r2',
    driver: { id: '3', name: 'Amit Patel', avatar: null, rating: 4.8 },
    vehicle: { model: 'Hyundai Creta', registration_number: 'MH-12-EF-9012' },
    pickup: { lat: 18.5196, lng: 73.8553, address: 'Shivajinagar, Pune' },
    destination: { lat: 18.5912, lng: 73.7388, address: 'Hinjewadi Phase 1, Pune' },
    date: '2026-07-20', time: '09:00',
    available_seats: 2, fare_per_seat: 55,
    distance_km: 21.2, duration_min: 40,
    status: 'active',
  },
];

const mockTrips = [
  {
    id: 't1', ride_id: 'r1', status: 'booked',
    driver: { id: '2', name: 'Rahul Mehta', phone: '9876543211', rating: 4.5 },
    passengers: [{ id: '1', name: 'Priya Sharma', seats: 1 }],
    vehicle: { model: 'Toyota Camry', registration_number: 'MH-12-AB-1234' },
    pickup: { lat: 18.5362, lng: 73.8973, address: 'Koregaon Park, Pune' },
    destination: { lat: 18.5912, lng: 73.7388, address: 'Hinjewadi Phase 1, Pune' },
    date: '2026-07-20', time: '08:30',
    fare_per_seat: 45, total_fare: 45,
    distance_km: 18.5, duration_min: 35,
  },
];

const mockWallet = { balance: 1250.0 };

const mockTransactions = [
  { id: 'wt1', type: 'debit', amount: 120, description: 'Ride to Hinjewadi', created_at: '2026-07-15T10:30:00' },
  { id: 'wt2', type: 'credit', amount: 500, description: 'Wallet Recharge', created_at: '2026-07-14T15:00:00' },
  { id: 'wt3', type: 'debit', amount: 45, description: 'Ride to Kothrud', created_at: '2026-07-12T09:00:00' },
  { id: 'wt4', type: 'credit', amount: 1000, description: 'Wallet Recharge', created_at: '2026-07-10T12:00:00' },
];

const mockReports = {
  total_trips: 42, total_distance: 526.3, fuel_saved: 38.2, money_saved: 2340,
  monthly_trips: [
    { month: 'Jan', count: 3 }, { month: 'Feb', count: 5 }, { month: 'Mar', count: 7 },
    { month: 'Apr', count: 4 }, { month: 'May', count: 8 }, { month: 'Jun', count: 9 },
    { month: 'Jul', count: 6 },
  ],
  cost_per_km: [
    { month: 'Jan', cost: 5.2 }, { month: 'Feb', cost: 4.8 }, { month: 'Mar', cost: 4.5 },
    { month: 'Apr', cost: 4.9 }, { month: 'May', cost: 4.1 }, { month: 'Jun', cost: 3.9 },
    { month: 'Jul', cost: 4.2 },
  ],
  vehicle_costs: [
    { vehicle: 'Toyota Camry', cost: 1200 }, { vehicle: 'Honda City', cost: 850 },
    { vehicle: 'Hyundai Creta', cost: 640 },
  ],
  fuel_trends: [
    { month: 'Jan', efficiency: 14.2 }, { month: 'Feb', efficiency: 14.8 },
    { month: 'Mar', efficiency: 15.1 }, { month: 'Apr', efficiency: 14.9 },
    { month: 'May', efficiency: 15.5 }, { month: 'Jun', efficiency: 15.8 },
    { month: 'Jul', efficiency: 15.2 },
  ],
};

/* ---------- Admin mock data ---------- */

const mockEmployees = [
  { id: 1, name: 'Priya Sharma', email: 'priya@techcorp.com', department: 'Engineering', manager: 'Vikram Singh', officeLocation: 'Pune HQ', accessStatus: 'active' },
  { id: 2, name: 'Rahul Mehta', email: 'rahul@techcorp.com', department: 'Engineering', manager: 'Vikram Singh', officeLocation: 'Pune HQ', accessStatus: 'active' },
  { id: 3, name: 'Amit Patel', email: 'amit@techcorp.com', department: 'Marketing', manager: 'Neha Gupta', officeLocation: 'Mumbai Branch', accessStatus: 'active' },
  { id: 4, name: 'Sneha Kulkarni', email: 'sneha@techcorp.com', department: 'HR', manager: 'Deepak Joshi', officeLocation: 'Pune HQ', accessStatus: 'revoked' },
  { id: 5, name: 'Vikram Singh', email: 'vikram@techcorp.com', department: 'Engineering', manager: 'CTO', officeLocation: 'Pune HQ', accessStatus: 'active' },
  { id: 6, name: 'Neha Gupta', email: 'neha@techcorp.com', department: 'Marketing', manager: 'CMO', officeLocation: 'Mumbai Branch', accessStatus: 'active' },
  { id: 7, name: 'Rohan Desai', email: 'rohan@techcorp.com', department: 'Sales', manager: 'Amit Patel', officeLocation: 'Pune HQ', accessStatus: 'active' },
  { id: 8, name: 'Kavita Rao', email: 'kavita@techcorp.com', department: 'Finance', manager: 'CFO', officeLocation: 'Pune HQ', accessStatus: 'active' },
  { id: 9, name: 'Suresh Nair', email: 'suresh@techcorp.com', department: 'Operations', manager: 'COO', officeLocation: 'Chennai Branch', accessStatus: 'revoked' },
  { id: 10, name: 'Anita Reddy', email: 'anita@techcorp.com', department: 'Design', manager: 'Priya Sharma', officeLocation: 'Pune HQ', accessStatus: 'active' },
];

const mockOrgVehicles = [
  { id: 1, registrationNumber: 'MH-12-AB-1234', model: 'Toyota Camry', seatingCapacity: 4, assignedDriver: 'Rahul Mehta', approvalStatus: 'approved' },
  { id: 2, registrationNumber: 'MH-12-EF-9012', model: 'Hyundai Creta', seatingCapacity: 5, assignedDriver: 'Amit Patel', approvalStatus: 'approved' },
  { id: 3, registrationNumber: 'MH-14-CD-5678', model: 'Honda City', seatingCapacity: 4, assignedDriver: 'Vikram Singh', approvalStatus: 'pending' },
  { id: 4, registrationNumber: 'MH-01-GH-3456', model: 'Tata Nexon EV', seatingCapacity: 5, assignedDriver: 'Priya Sharma', approvalStatus: 'approved' },
  { id: 5, registrationNumber: 'KA-05-XY-9876', model: 'Maruti Suzuki Baleno', seatingCapacity: 5, assignedDriver: 'Rohan Desai', approvalStatus: 'inactive' },
  { id: 6, registrationNumber: 'MH-03-JK-7890', model: 'Mahindra XUV700', seatingCapacity: 7, assignedDriver: 'Neha Gupta', approvalStatus: 'approved' },
];

const mockOrgSettings = {
  companyName: 'TechCorp Solutions Pvt. Ltd.',
  registeredOffice: '42 Innovation Park, Hinjewadi Phase 1, Pune 411057',
  industry: 'Information Technology',
  contactInfo: '+91 20 6789 1234',
  contactEmail: 'admin@techcorp.com',
  totalEmployees: 450,
  fuelCostPerLitre: 105.50,
  travelCostPerKm: 8.00,
  carpoolingPolicy: 'Employees are encouraged to carpool for daily commutes. Costs are shared equally among passengers based on distance. A minimum of 2 passengers is recommended per ride.',
};

/* ---------- Mock API Object ---------- */

export const mockApi = {
  auth: {
    login: async (email, password) => {
      await randomDelay();
      const user = mockUsers.find((u) => u.email === email);
      if (!user) throw new Error('Invalid credentials');
      return { data: { token: 'mock-jwt-token-' + Date.now(), user } };
    },
    register: async (data) => {
      await randomDelay();
      const newUser = { id: Date.now().toString(), ...data, role: 'employee', org_id: '1' };
      return { data: { token: 'mock-jwt-token-' + Date.now(), user: newUser } };
    },
    getProfile: async () => {
      await delay(300);
      return { data: { user: mockUsers[0] } };
    },
  },

  vehicles: {
    list: async () => { await randomDelay(); return { data: { vehicles: mockVehicles } }; },
    create: async (data) => { await randomDelay(); return { data: { vehicle: { id: Date.now().toString(), ...data } } }; },
    update: async (id, data) => { await randomDelay(); return { data: { vehicle: { id, ...data } } }; },
    delete: async (id) => { await randomDelay(); return { data: { success: true } }; },
  },

  rides: {
    search: async (params) => { await delay(1000); return { data: { rides: mockRides } }; },
    create: async (data) => { await randomDelay(); return { data: { ride: { id: Date.now().toString(), ...data, status: 'active' } } }; },
    my: async () => { await randomDelay(); return { data: { rides: mockRides } }; },
  },

  trips: {
    list: async () => { await randomDelay(); return { data: { trips: mockTrips } }; },
    get: async (id) => { await randomDelay(); return { data: { trip: mockTrips[0] } }; },
    start: async (id) => { await randomDelay(); return { data: { trip: { ...mockTrips[0], status: 'started' } } }; },
    complete: async (id) => { await randomDelay(); return { data: { trip: { ...mockTrips[0], status: 'completed' } } }; },
  },

  wallet: {
    balance: async () => { await delay(300); return { data: mockWallet }; },
    recharge: async (amount) => { await randomDelay(); return { data: { balance: mockWallet.balance + amount } }; },
    transactions: async () => { await randomDelay(); return { data: { transactions: mockTransactions } }; },
  },

  reports: {
    summary: async () => { await randomDelay(); return { data: mockReports }; },
  },

  history: {
    list: async () => {
      await randomDelay();
      return { data: { rides: mockTrips.map((t) => ({ ...t, status: 'completed', payment_status: 'paid' })) } };
    },
  },

  route: {
    calculate: async (pickup, destination) => {
      await delay(1200);
      const steps = 20;
      const polyline = Array.from({ length: steps + 1 }, (_, i) => [
        pickup.lat + (destination.lat - pickup.lat) * (i / steps),
        pickup.lng + (destination.lng - pickup.lng) * (i / steps),
      ]);
      return {
        data: {
          distance_km: 18.5,
          duration_min: 35,
          polyline,
          pickup_address: 'Koregaon Park, Pune',
          destination_address: 'Hinjewadi Phase 1, Pune',
        },
      };
    },
  },

  admin: {
    getEmployees: async () => { await randomDelay(); return { data: mockEmployees }; },
    addEmployee: async (data) => { await randomDelay(); return { data: { ...data, id: Date.now(), accessStatus: 'active' } }; },
    updateEmployeeAccess: async (id, status) => { await randomDelay(); return { data: { id, accessStatus: status } }; },
    getOrgVehicles: async () => { await randomDelay(); return { data: mockOrgVehicles }; },
    addOrgVehicle: async (data) => { await randomDelay(); return { data: { ...data, id: Date.now(), approvalStatus: 'pending' } }; },
    updateVehicleStatus: async (id, status) => { await randomDelay(); return { data: { id, approvalStatus: status } }; },
    getOrgSettings: async () => { await randomDelay(); return { data: mockOrgSettings }; },
    saveOrgSettings: async (data) => { await randomDelay(); return { data: { ...mockOrgSettings, ...data } }; },
  },
};

export default mockApi;
