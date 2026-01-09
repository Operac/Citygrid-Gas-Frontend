import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Clock, 
  MapPin, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ArrowLeft,
  Eye,
  Package,
  Calendar,
  DollarSign,
  Navigation
} from 'lucide-react';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

  // Order status configuration
  const orderStatuses = {
    PENDING: { color: 'bg-yellow-500', text: 'Pending', icon: Clock },
    CONFIRMED: { color: 'bg-blue-500', text: 'Confirmed', icon: CheckCircle },
    PREPARING: { color: 'bg-purple-500', text: 'Preparing', icon: Package },
    RIDER_ASSIGNED: { color: 'bg-indigo-500', text: 'Rider Assigned', icon: Truck },
    PICKED_UP: { color: 'bg-orange-500', text: 'Picked Up', icon: Truck },
    IN_TRANSIT: { color: 'bg-teal-500', text: 'In Transit', icon: Navigation },
    ARRIVED: { color: 'bg-green-500', text: 'Arrived', icon: MapPin },
    DELIVERED: { color: 'bg-green-600', text: 'Delivered', icon: CheckCircle },
    CANCELLED: { color: 'bg-red-500', text: 'Cancelled', icon: XCircle }
  };

  // Fetch customer orders
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') {
      return !['DELIVERED', 'CANCELLED'].includes(order.status);
    } else {
      return ['DELIVERED', 'CANCELLED'].includes(order.status);
    }
  });

  // Get status step for progress tracking
  const getStatusStep = (status) => {
    const statusSteps = [
      'PENDING',
      'CONFIRMED', 
      'PREPARING',
      'RIDER_ASSIGNED',
      'PICKED_UP',
      'IN_TRANSIT',
      'ARRIVED',
      'DELIVERED'
    ];
    return statusSteps.indexOf(status);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate estimated delivery time (mock function)
  const getEstimatedDelivery = (order) => {
    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      return null;
    }

    const created = new Date(order.createdAt);
    const estimated = new Date(created.getTime() + 60 * 60 * 1000); // 1 hour from creation
    
    return estimated.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      await api.patch(`/orders/${orderId}/cancel`, {
        reason: 'Cancelled by customer'
      });
      toast.success('Order cancelled successfully');
      fetchOrders(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel order');
    }
  };

  // View order details - navigate to tracking page
  const handleViewDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-green-600" size={32} />
          <p className="text-gray-600">Loading your orders...</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                  onClick={() => navigate('/home')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <p className="text-sm text-gray-600">Track and manage your gas deliveries</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {orders.length} total orders
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'active'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Active Orders
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Order History
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <Package className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {activeTab === 'active' ? 'Active' : 'Past'} Orders
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'active' 
                  ? "You don't have any active orders at the moment."
                  : "Your completed and cancelled orders will appear here."
                }
              </p>
              {activeTab === 'active' && (
                <button
                    onClick={() => navigate('/home')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Place Your First Order
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => {
              const StatusIcon = orderStatuses[order.status]?.icon || Package;
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${orderStatuses[order.status]?.color || 'bg-gray-500'} bg-green-500`}>
                          <StatusIcon className="text-white" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ₦{order.totalAmount?.toLocaleString()}
                        </div>
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'CANCELLED' 
                            ? 'bg-red-100 text-red-800'
                            : order.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {orderStatuses[order.status]?.text || order.status}
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gas Type:</span>
                          <span className="font-medium">{order.gasType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cylinder Size:</span>
                          <span className="font-medium">{order.cylinderSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Type:</span>
                          <span className="font-medium capitalize">
                            {order.orderType?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Address:</span>
                          <span className="font-medium text-right max-w-xs">
                            {order.deliveryAddress}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment:</span>
                          <span className="font-medium capitalize">
                            {order.paymentMethod} •{' '}
                            <span className={
                              order.paymentStatus === 'PAID' 
                                ? 'text-green-600' 
                                : 'text-yellow-600'
                            }>
                              {order.paymentStatus}
                            </span>
                          </span>
                        </div>
                        {getEstimatedDelivery(order) && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estimated Delivery:</span>
                            <span className="font-medium text-green-600">
                              By {getEstimatedDelivery(order)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar for Active Orders */}
                    {activeTab === 'active' && order.status !== 'CANCELLED' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Order Placed</span>
                          <span>Delivery</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(getStatusStep(order.status) / 7) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Station and Rider Info */}
                    <div className="flex flex-wrap gap-4 mb-4 text-sm">
                      {order.station && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin size={16} />
                          <span>Station: {order.station.name}</span>
                        </div>
                      )}
                      {order.rider && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Truck size={16} />
                          <span>Rider: {order.rider.user.fullName}</span>
                          {order.rider.rating && (
                            <span className="flex items-center gap-1">
                              ⭐ {order.rider.rating}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        onClick={() => handleViewDetails(order.id)}
                        className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      
                      {['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                        >
                          <XCircle size={16} />
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
