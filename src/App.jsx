import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import MyOrdersPage from './pages/customer/MyOrdersPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import OrderSuccessPage from './pages/customer/OrderSuccessPage';
import OrderFailurePage from './pages/customer/OrderFailurePage';

// Rider Pages
import RiderDashboard from './pages/rider/RiderDashboard';
import AvailableOrdersPage from './pages/rider/AvailableOrdersPage';
import RiderMyOrdersPage from './pages/rider/MyOrdersPage';
import EarningsPage from './pages/rider/EarningsPage';
// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import OrdersManagement from './pages/admin/OrdersManagement';
import RidersManagement from './pages/admin/RidersManagement';
import StationsManagement from './pages/admin/StationsManagement';
// Manager Pages
import StationDashboardManager from './pages/manager/StationDashboard';
import CustomersPage from './pages/admin/CustomersPage';
import CustomerDetails from './pages/admin/CustomerDetails';
import AddRiderPage from './pages/admin/AddRiderPage';
import RiderDetails from './pages/admin/RiderDetails';

// Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  // Wrap protected pages in the shared Layout (navbar + container)
  return <Layout>{children}</Layout>;
}

import { SocketProvider } from './context/SocketContext';
import RiderLocationTracker from './components/rider/RiderLocationTracker';

function App() {
  return (
    <SocketProvider>
      {/* Rider Location Tracker - runs in background when authenticated as RIDER */}
      <RiderLocationTracker />
      
      <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <MyOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderTrackingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-success"
        element={
          <ProtectedRoute>
            <OrderSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-failure"
        element={
          <ProtectedRoute>
            <OrderFailurePage />
          </ProtectedRoute>
        }
      />

{/* Rider Routes */}
<Route
  path="/rider"
  element={
    <ProtectedRoute requiredRole="RIDER">
      <RiderDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/rider/available-orders"
  element={
    <ProtectedRoute requiredRole="RIDER">
      <AvailableOrdersPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/rider/my-orders"
  element={
    <ProtectedRoute requiredRole="RIDER">
      <RiderMyOrdersPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/rider/earnings"
  element={
    <ProtectedRoute requiredRole="RIDER">
      <EarningsPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/rider/riders"
  element={
    <ProtectedRoute requiredRole="RIDER">
      <RidersManagement />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/riders/:id"
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <RiderDetails />
    </ProtectedRoute>
  }
/>

      {/* Admin Routes */}
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/orders"
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <OrdersManagement />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/riders"
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <RidersManagement />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/riders/add"
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <AddRiderPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/stations"
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <StationsManagement />
    </ProtectedRoute>
  }
/>
<Route
  path="/manager"
  element={
    <ProtectedRoute requiredRole="STATION_MANAGER">
      <StationDashboardManager />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/customers"
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <CustomersPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/customers/:id"
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <CustomerDetails />
    </ProtectedRoute>
  }
/>
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </SocketProvider>
  );
}

export default App;