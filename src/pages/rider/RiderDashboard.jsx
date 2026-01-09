import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Power, 
  Package, 
  DollarSign, 
  TrendingUp, 
  LogOut,
  RefreshCw,
  MapPin,
  Clock,
  User,
  Bike
} from 'lucide-react';

export default function RiderDashboard() {
  const navigate = useNavigate();
  const { user, logout, rider, updateProfile } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await api.get('/rider/stats');
      // Backend returns { success: true, data: {...stats} }
      const statsData = response.data.data;
      if (!statsData) {
        toast.error('No stats data received');
        return;
      }
      setStats(statsData);
      setIsOnline(statsData.isOnline || false);
      setIsAvailable(statsData.isAvailable || false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load dashboard';
      toast.error(errorMessage);
      
      // Redirect if unauthorized
      if (error.response?.status === 401) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const toggleOnlineStatus = async () => {
    setIsUpdatingStatus(true);
    const newStatus = !isOnline;
    
    try {
      const response = await api.patch('/rider/status', { isOnline: newStatus });
      setIsOnline(newStatus);
      setIsAvailable(newStatus); // Available when online
      
      toast.success(response.data.message || `You are now ${newStatus ? 'online' : 'offline'}`);
      
      // Update global store so LocationTracker knows to start/stop
      if (user?.rider) {
        updateProfile({
          rider: {
            ...user.rider,
            isOnline: newStatus
          }
        });
      }

      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Failed to update status:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update status';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rider Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, <span className="font-semibold">{user?.fullName}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={fetchStats}
                disabled={isLoading}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Rider Profile & Status */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Profile Card */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'R'}
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{user?.fullName}</h2>
                <p className="text-gray-600 mb-3">Professional Delivery Rider</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={16} />
                    <span>{user?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Bike size={16} />
                    <span>{rider?.vehicleType} • {rider?.vehicleNumber}</span>
                  </div>
                  {rider?.station && (
                    <div className="flex items-center gap-2 text-gray-600 sm:col-span-2">
                      <MapPin size={16} />
                      <span>{rider.station.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="bg-yellow-50 rounded-lg p-4 text-center min-w-[100px]">
                <div className="text-2xl font-bold text-yellow-700">{stats?.rating?.toFixed(1) || '5.0'}</div>
                <div className="text-sm text-yellow-600">Rating</div>
              </div>
            </div>
          </div>

          {/* Status Toggle Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Availability Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200">
                <div>
                  <p className="font-semibold text-gray-900">Online Status</p>
                  <p className="text-sm text-gray-600">
                    {isOnline ? '🟢 Receiving orders' : '⚫ Offline'}
                  </p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  isOnline ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200">
                <div>
                  <p className="font-semibold text-gray-900">Availability</p>
                  <p className="text-sm text-gray-600">
                    {isAvailable ? '🟢 Ready for orders' : '🔴 Currently busy'}
                  </p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  isAvailable ? 'bg-green-500' : 'bg-red-400'
                }`}></div>
              </div>

              <button
                onClick={toggleOnlineStatus}
                disabled={isUpdatingStatus}
                className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
                  isOnline
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isUpdatingStatus ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Power size={20} />
                    {isOnline ? 'Go Offline' : 'Go Online'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign size={32} className="opacity-90" />
              <Clock size={20} className="opacity-75" />
            </div>
            <div className="text-3xl font-bold mb-1">
              ₦{Number(stats?.todayEarnings || 0).toLocaleString()}
            </div>
            <div className="text-blue-100 text-sm">Today's Earnings</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Package size={32} className="opacity-90" />
              <span className="text-green-100 text-sm">Today</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {stats?.todayDeliveries || 0}
            </div>
            <div className="text-green-100 text-sm">Today's Deliveries</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp size={32} className="opacity-90" />
              <span className="text-orange-100 text-sm">Total</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {stats?.totalDeliveries || 0}
            </div>
            <div className="text-orange-100 text-sm">Total Deliveries</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">📦</div>
              <span className="text-purple-100 text-sm">Active</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {stats?.activeOrders || 0}
            </div>
            <div className="text-purple-100 text-sm">Active Orders</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/rider/available-orders"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 text-left border-2 border-transparent hover:border-blue-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="text-blue-600" size={32} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  Available Orders
                </h3>
                <p className="text-gray-600 text-sm">
                  View and accept new delivery requests
                </p>
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  {isOnline ? 'Ready to accept orders' : 'Go online to see orders'}
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/rider/my-orders"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 text-left border-2 border-transparent hover:border-green-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="text-green-600" size={32} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
                  My Orders
                  {stats?.activeOrders > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {stats.activeOrders}
                    </span>
                  )}
                </h3>
                <p className="text-gray-600 text-sm">
                  Manage your assigned deliveries
                </p>
                <div className="mt-2 text-xs text-green-600 font-medium">
                  Track and update order status
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/rider/earnings"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 text-left border-2 border-transparent hover:border-orange-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <DollarSign className="text-orange-600" size={32} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  Earnings & Analytics
                </h3>
                <p className="text-gray-600 text-sm">
                  Track your earnings and performance
                </p>
                <div className="mt-2 text-xs text-orange-600 font-medium">
                  View daily and historical earnings
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Performance Tips */}
        {isOnline && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              💡 Tips for Better Earnings
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-semibold mb-1">• Stay Online</p>
                <p className="text-blue-700">More online time = more order opportunities</p>
              </div>
              <div>
                <p className="font-semibold mb-1">• Quick Response</p>
                <p className="text-blue-700">Accept orders quickly to get more deliveries</p>
              </div>
              <div>
                <p className="font-semibold mb-1">• Maintain Rating</p>
                <p className="text-blue-700">Good ratings help you get preferred orders</p>
              </div>
              <div>
                <p className="font-semibold mb-1">• Update Status</p>
                <p className="text-blue-700">Keep order status updated for better tracking</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}