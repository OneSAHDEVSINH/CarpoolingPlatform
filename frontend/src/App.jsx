import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layout Components
import MainLayout from './components/layout/MainLayout.jsx';

// Auth Pages
import SplashScreen from './pages/auth/SplashScreen.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';

// Core Pages
import Carpooling from './pages/dashboard/Carpooling.jsx';
import MyTrips from './pages/trips/MyTrips.jsx';
import Vehicles from './pages/vehicles/Vehicles.jsx';
import RideHistory from './pages/history/RideHistory.jsx';
import Wallet from './pages/wallet/Wallet.jsx';
import Reports from './pages/reports/Reports.jsx';
import Settings from './pages/settings/Settings.jsx';
import AdminPanel from './pages/admin/AdminPanel.jsx';
import DevPanel from './pages/admin/DevPanel.jsx';

// Auth Context
import { useAuth } from './contexts/AuthContext.jsx';

/* ============================================
   Protected Route — redirects to /login
   if user is not authenticated
   ============================================ */
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

/* ============================================
   App Router Configuration
   ============================================ */
const App = () => {
  return (
    <Routes>
      {/* Public Screens */}
      <Route path="/" element={<SplashScreen />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated Dashboard Core Flow */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/carpooling" element={<Carpooling />} />
          <Route path="/my-trips" element={<MyTrips />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/ride-history" element={<RideHistory />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/dev-panel" element={<DevPanel />} />
          
          {/* Default redirect to main Carpooling tab */}
          <Route path="/dashboard" element={<Navigate to="/carpooling" replace />} />
        </Route>
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
