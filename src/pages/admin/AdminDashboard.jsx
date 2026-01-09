import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  LogOut,
  RefreshCw,
  ShoppingBag,
  UserCheck,
  MapPin,
  UserPlus,
  BarChart3
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await api.get('/admin/dashboard/stats');
      
      // Handle different response structures
      if (response.data.success) {
        setStats(response.data.data);
      } else if (response.data.overview) {
        // Direct stats structure
        setStats(response.data);
      } else {
        // Fallback to raw data
        setStats(response.data);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to load dashboard data';
      toast.error(errorMessage);
      
      // Set default stats structure to prevent UI breakage
      setStats({
        overview: {
          totalOrders: 0,
          todayOrders: 0,
          activeOrders: 0,
          totalRevenue: 0,
          todayRevenue: 0,
          totalRiders: 0,
          onlineRiders: 0,
          totalCustomers: 0,
          totalStations: 0,
          pendingRiders: 0
        },
        recentActivity: [],
        alerts: { lowStock: [] }
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchStats(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper function to safely get stat values
  const getStat = (path, defaultValue = 0) => {
    if (!stats) return defaultValue;
    
    // Handle nested structure (stats.overview.totalOrders)
    if (path.includes('.')) {
      const keys = path.split('.');
      let value = stats;
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) return defaultValue;
      }
      return value;
    }
    
    // Handle direct structure (stats.totalOrders)
    return stats[path] !== undefined ? stats[path] : defaultValue;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="text-green-600" size={32} />
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, <span className="font-semibold text-green-600">{user?.fullName}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${
                  refreshing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Refresh"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Package size={32} />
              </div>
              <span className="text-blue-100 text-sm font-medium">Total</span>
            </div>
            <div className="text-4xl font-bold mb-1">
              {getStat('overview.totalOrders')}
            </div>
            <div className="text-blue-100 text-sm mb-3">Total Orders</div>
            <div className="flex items-center text-sm">
              <TrendingUp size={16} className="mr-1" />
              <span className="font-semibold">+{getStat('overview.todayOrders')}</span>
              <span className="ml-1 opacity-75">today</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <DollarSign size={32} />
              </div>
              <span className="text-green-100 text-sm font-medium">Revenue</span>
            </div>
            <div className="text-4xl font-bold mb-1">
              ₦{Number(getStat('overview.totalRevenue')).toLocaleString()}
            </div>
            <div className="text-green-100 text-sm mb-3">Total Revenue</div>
            <div className="flex items-center text-sm">
              <TrendingUp size={16} className="mr-1" />
              <span className="font-semibold">₦{Number(getStat('overview.todayRevenue')).toLocaleString()}</span>
              <span className="ml-1 opacity-75">today</span>
            </div>
          </div>

          {/* Total Riders */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Users size={32} />
              </div>
              <span className="text-purple-100 text-sm font-medium">Riders</span>
            </div>
            <div className="text-4xl font-bold mb-1">
              {getStat('overview.totalRiders')}
            </div>
            <div className="text-purple-100 text-sm mb-3">Total Riders</div>
            <div className="flex items-center text-sm">
              <UserCheck size={16} className="mr-1" />
              <span className="font-semibold">{getStat('overview.onlineRiders')}</span>
              <span className="ml-1 opacity-75">online</span>
            </div>
          </div>

          {/* Total Customers */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <UserCheck size={32} />
              </div>
              <span className="text-orange-100 text-sm font-medium">Customers</span>
            </div>
            <div className="text-4xl font-bold mb-1">
              {getStat('overview.totalCustomers')}
            </div>
            <div className="text-orange-100 text-sm mb-3">Total Customers</div>
            <div className="flex items-center text-sm">
              <TrendingUp size={16} className="mr-1" />
              <span className="font-semibold">{getStat('overview.pendingRiders', 0)}</span>
              <span className="ml-1 opacity-75">pending riders</span>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Orders</p>
                <p className="text-3xl font-bold text-gray-900">
                  {getStat('overview.activeOrders')}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="text-blue-600" size={32} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Today's Orders</p>
                <p className="text-3xl font-bold text-gray-900">
                  {getStat('overview.todayOrders')}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="text-green-600" size={32} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Stations</p>
                <p className="text-3xl font-bold text-gray-900">
                  {getStat('overview.totalStations')}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <MapPin className="text-purple-600" size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {stats?.alerts?.lowStock && stats.alerts.lowStock.length > 0 && (
          <div className="mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Package className="text-yellow-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-yellow-800">Low Stock Alerts</h3>
                <span className="bg-yellow-600 text-white px-2 py-1 rounded-full text-sm font-medium">
                  {stats.alerts.lowStock.length}
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.alerts.lowStock.slice(0, 3).map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-yellow-200">
                    <p className="font-medium text-gray-900">{item.station?.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.gasType} ({item.cylinderSize}) - {item.quantity} left
                    </p>
                  </div>
                ))}
              </div>
              {stats.alerts.lowStock.length > 3 && (
                <p className="text-yellow-700 text-sm mt-3">
                  +{stats.alerts.lowStock.length - 3} more items with low stock
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Link
              to="/admin/orders"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all text-left group border-2 border-transparent hover:border-blue-500"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Package className="text-blue-600" size={28} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Manage Orders
              </h3>
              <p className="text-gray-600 text-sm">
                View and manage all customer orders
              </p>
            </Link>

            <Link
              to="/admin/riders"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all text-left group border-2 border-transparent hover:border-green-500"
            >
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="text-green-600" size={28} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Manage Riders
              </h3>
              <p className="text-gray-600 text-sm">
                View riders and their performance
              </p>
            </Link>

            <Link
              to="/admin/riders/add"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all text-left group border-2 border-transparent hover:border-purple-500"
            >
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UserPlus className="text-purple-600" size={28} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Add Rider
              </h3>
              <p className="text-gray-600 text-sm">
                Create new rider account
              </p>
            </Link>

            <Link
              to="/admin/stations"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all text-left group border-2 border-transparent hover:border-orange-500"
            >
              <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="text-orange-600" size={28} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Manage Stations
              </h3>
              <p className="text-gray-600 text-sm">
                Control stations and inventory
              </p>
            </Link>

            <Link
              to="/admin/customers"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all text-left group border-2 border-transparent hover:border-indigo-500"
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="text-indigo-600" size={28} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                View Customers
              </h3>
              <p className="text-gray-600 text-sm">
                Customer list and analytics
              </p>
            </Link>
          </div>
        </div>

        {/* Recent Activity (if available) */}
        {stats?.recentActivity && stats.recentActivity.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="space-y-4">
                {stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package size={20} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        Order #{activity.orderNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.customer?.fullName} • {activity.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ₦{Number(activity.totalAmount || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(activity.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}