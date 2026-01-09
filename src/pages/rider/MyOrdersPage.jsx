import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Navigation, 
  Package, 
  Clock,
  DollarSign,
  CheckCircle,
  Truck,
  Home
} from 'lucide-react';

export default function RiderMyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      const response = await api.get(`/rider/my-orders?status=${statusFilter}`);
      // Backend returns { success: true, data: [...orders] }
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      const errorMessage = error.response?.data?.error || 'Failed to fetch assigned orders';
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
    fetchOrders();

    // Refresh every 30 seconds (less frequent to reduce load)
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus, notes = '') => {
    setUpdatingStatus(orderId);

    try {
      const payload = {
        orderId,
        status: newStatus
      };
      
      if (newStatus === 'DELIVERED') {
        const code = window.prompt('Please enter the 4-digit delivery code provided by the customer:');
        if (!code) {
          toast.error('Delivery code is required to complete the order');
          setUpdatingStatus(null);
          return;
        }
        payload.deliveryCode = code;
      }

      if (notes && notes.trim()) {
        payload.notes = notes.trim();
      }

      const response = await api.patch('/rider/order-status', payload);
      
      toast.success(response.data.message || 'Status updated successfully!');
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Update status error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update status';
      toast.error(errorMessage);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'RIDER_ASSIGNED': 'PICKED_UP',
      'PICKED_UP': 'DELIVERED'
      // Removed IN_TRANSIT and ARRIVED to match your schema
    };
    return statusFlow[currentStatus];
  };

  const getStatusLabel = (status) => {
    const labels = {
      'RIDER_ASSIGNED': 'Mark as Picked Up',
      'PICKED_UP': 'Mark as Delivered'
    };
    return labels[status];
  };

  const getStatusColor = (status) => {
    const colors = {
      'RIDER_ASSIGNED': 'bg-blue-100 text-blue-800',
      'PICKED_UP': 'bg-yellow-100 text-yellow-800',
      'IN_TRANSIT': 'bg-purple-100 text-purple-800',
      'ARRIVED': 'bg-orange-100 text-orange-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'RIDER_ASSIGNED': '📦',
      'PICKED_UP': '🚚',
      'IN_TRANSIT': '🛵',
      'ARRIVED': '📍',
      'DELIVERED': '✅',
      'CANCELLED': '❌'
    };
    return icons[status] || '📋';
  };

  const formatOrderType = (orderType) => {
    const types = {
      'refill': 'Gas Refill',
      'new_cylinder': 'New Cylinder',
      'swap': 'Cylinder Swap'
    };
    return types[orderType] || orderType;
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
    return order.status === statusFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
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
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/rider/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">Manage your active delivery orders</p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-sm">
                {filteredOrders.length} Active
              </span>
              <button
                onClick={fetchOrders}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Status Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'RIDER_ASSIGNED', 'PICKED_UP'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                statusFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filter === 'all' ? 'All Active' : filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {statusFilter === 'all' ? 'No active orders' : `No ${statusFilter.toLowerCase().replace('_', ' ')} orders`}
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {statusFilter === 'all' 
                ? "You don't have any active orders right now. Check available orders to start delivering."
                : `You don't have any orders with status "${statusFilter.replace('_', ' ')}".`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/rider/available-orders')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View Available Orders
              </button>
              {statusFilter !== 'all' && (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  View All Orders
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 p-6 border border-gray-100"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={14} />
                      <span>Assigned: {new Date(order.assignedAt || order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3 min-w-[140px]">
                    <p className="text-sm text-green-600 font-medium">Your Earnings</p>
                    <p className="text-xl font-bold text-green-700 flex items-center gap-1">
                      <DollarSign size={18} />
                      ₦{Number((Number(order.deliveryFee || 0) * 0.8).toFixed(2)).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    👤 Customer Details
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-blue-700">Name</p>
                      <p className="font-semibold text-blue-900">{order.customer?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Phone</p>
                      <a 
                        href={`tel:${order.customer?.phone}`}
                        className="font-semibold text-blue-900 hover:text-blue-700 hover:underline flex items-center gap-2"
                      >
                        <Phone size={14} />
                        {order.customer?.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Gas Details</p>
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">
                        {order.cylinderSize} {order.gasType}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        {formatOrderType(order.orderType)} • Qty: {order.quantity}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Pickup Station</p>
                    <p className="font-semibold text-gray-900">{order.station?.name}</p>
                    <p className="text-sm text-gray-600">{order.station?.address}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Order</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₦{Number(order.totalAmount || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Delivery: ₦{Number(order.deliveryFee || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-orange-900 mb-2 flex items-center gap-2">
                    <MapPin size={16} />
                    Delivery Address
                  </p>
                  <p className="text-orange-800 font-medium">{order.deliveryAddress}</p>
                  
                  {/* Order items if available */}
                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-orange-200">
                      <p className="text-sm font-medium text-orange-900 mb-2">Items:</p>
                      <div className="space-y-1">
                        {order.orderItems.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.product?.name}</span>
                            <span className="text-orange-700">₦{Number(item.price || 0).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                  {/* Call Customer */}
                  <a
                    href={`tel:${order.customer?.phone}`}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    <Phone size={18} />
                    Call Customer
                  </a>

                  {/* Navigate */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLatitude},${order.deliveryLongitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    <Navigation size={18} />
                    Navigate
                  </a>

                  {/* Update Status */}
                  {getNextStatus(order.status) && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, getNextStatus(order.status))}
                      disabled={updatingStatus === order.id}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {updatingStatus === order.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          {getStatusLabel(order.status)}
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Status Guide */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 flex items-center gap-2">
                    <span className="font-semibold">💡 Status Flow:</span> 
                    Assigned → Picked Up → Delivered
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}