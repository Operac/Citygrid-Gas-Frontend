import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, MapPin, Clock, DollarSign, CheckCircle, Package } from 'lucide-react';

export default function AvailableOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingOrder, setAcceptingOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/rider/available-orders');
      // Backend returns { success: true, data: [...orders] }
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load available orders';
      toast.error(errorMessage);
      
      // If unauthorized or rider not found, redirect to login
      if (error.response?.status === 401 || error.response?.status === 404) {
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
  }, []);

  const handleAcceptOrder = async (orderId) => {
    setAcceptingOrder(orderId);
    
    try {
      const response = await api.post('/rider/accept-order', { orderId });
      
      // Updated response structure
      toast.success(response.data.message || 'Order accepted successfully! 🎉');
      
      // Remove order from list
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      
      // Navigate to my orders after a short delay
      setTimeout(() => {
        navigate('/rider/my-orders');
      }, 1500);
    } catch (error) {
      console.error('Accept order error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to accept order';
      toast.error(errorMessage);
      
      // Refresh orders if there was an error (order might have been taken by someone else)
      if (error.response?.status === 400) {
        fetchOrders();
      }
    } finally {
      setAcceptingOrder(null);
    }
  };

  const formatOrderType = (orderType) => {
    const types = {
      'refill': 'Gas Refill',
      'new_cylinder': 'New Cylinder',
      'swap': 'Cylinder Swap'
    };
    return types[orderType] || orderType;
  };

  const formatStatus = (status) => {
    return status.toLowerCase().replace('_', ' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading available orders...</p>
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
              <span>Back to Dashboard</span>
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Available Orders
              </h1>
              <p className="text-gray-600 mt-1">
                New orders waiting for delivery
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-sm">
                {orders.length} Available
              </span>
              <button
                onClick={fetchOrders}
                disabled={isLoading}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Orders List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No orders available
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              There are no new orders available for delivery at the moment. 
              Check back later or make sure you're online to receive orders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/rider/dashboard')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={fetchOrders}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Refresh Orders
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-100"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold self-start">
                        READY FOR PICKUP
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={14} />
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 min-w-[120px]">
                    <p className="text-sm text-blue-600 font-medium">Earnings</p>
                    <p className="text-xl font-bold text-blue-700 flex items-center gap-1">
                      <DollarSign size={18} />
                      ₦{Number(order.deliveryFee || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Customer</p>
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">{order.customer?.fullName}</p>
                      <p className="text-sm text-gray-600">{order.customer?.phone}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Order Details</p>
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
                  </div>
                </div>

                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-2 flex items-start gap-2">
                    <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                    Delivery Address
                  </p>
                  <p className="text-gray-900 font-medium">{order.deliveryAddress}</p>
                  
                  {/* Show order items if available */}
                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-600 mb-2">Items:</p>
                      <div className="space-y-1">
                        {order.orderItems.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.product?.name}</span>
                            <span className="text-gray-600">₦{Number(item.price || 0).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <p>Total Amount: <span className="font-semibold text-gray-900">
                      ₦{Number(order.totalAmount || 0).toLocaleString()}
                    </span></p>
                  </div>

                  <button
                    onClick={() => handleAcceptOrder(order.id)}
                    disabled={acceptingOrder === order.id}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors min-w-[160px] justify-center"
                  >
                    {acceptingOrder === order.id ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Accept Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}