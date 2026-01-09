import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin,
  ArrowLeft,
  Calendar,
  Phone,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Status steps for progress bar
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

  const getProgress = (status) => {
    const index = statusSteps.indexOf(status);
    if (index === -1) return 0;
    return ((index + 1) / statusSteps.length) * 100;
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
           setIsLoading(true);
           const response = await api.get(`/orders/${id}`);
           // Handle nested data structure from standard API response wrapper
           const orderData = response.data.data?.order || response.data.data || response.data.order;
           setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details: ' + (error.response?.data?.error || error.message));
        // navigate('/orders'); // Disable auto-redirect to debug
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
        fetchOrder();
    }
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
           <p className="text-red-500 mb-4">Could not load order details.</p>
           <button onClick={() => navigate('/orders')} className="text-blue-600 hover:underline">Go to My Orders</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/orders')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Track Order</h1>
              <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
            </div>
            <div className="ml-auto">
               <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                  order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
               }`}>
                  {order.status.replace('_', ' ')}
               </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        
        {/* Helper: Delivery Code Display */}
        {order.deliveryCode && (
           <div className="bg-green-600 text-white p-6 rounded-xl shadow-lg transform transition-all hover:scale-[1.02]">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-green-100 font-medium">Verification Code</span>
                 <CheckCircle className="text-green-200" size={20}/>
              </div>
              <div className="text-4xl font-mono font-bold tracking-wider text-center py-2 bg-green-700/30 rounded-lg">
                 {order.deliveryCode}
              </div>
              <p className="text-xs text-green-100 mt-2 text-center opacity-90">
                 Give this code to the rider only when you receive your gas.
              </p>
           </div>
        )}

        {/* Status Timeline */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-6">Order Status</h2>
          
          <div className="relative mb-8">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${getProgress(order.status)}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-6 border-l-2 border-gray-100 ml-3 pl-6">
            {order.statusHistory?.map((history, idx) => (
                <div key={idx} className="relative">
                    <div className="absolute -left-[31px] bg-green-500 w-4 h-4 rounded-full border-2 border-white ring-2 ring-gray-50"></div>
                    <p className="font-medium capitalize text-gray-900">{history.status.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500">
                        {new Date(history.createdAt).toLocaleString()}
                    </p>
                    {history.notes && <p className="text-sm text-gray-600 mt-1">{history.notes}</p>}
                </div>
            ))}
          </div>
        </div>

        {/* Rider Info Card */}
        {order.rider && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
               <Truck size={20} className="text-blue-600"/>
               Rider Details
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                 {order.rider.user.avatarUrl ? (
                    <img src={order.rider.user.avatarUrl} className="w-full h-full rounded-full object-cover" alt="Rider"/> 
                 ) : (
                    <Truck size={24} className="text-gray-400"/>
                 )}
              </div>
              <div>
                <p className="font-bold text-gray-900">{order.rider.user.fullName}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                   <span className="flex items-center gap-1">⭐ {order.rider.rating || 'New'}</span>
                   <span>• {order.rider.vehicleType}</span>
                </div>
              </div>
              <a href={`tel:${order.rider.user.phone}`} className="ml-auto p-3 bg-green-50 text-green-600 rounded-full hover:bg-green-100">
                 <Phone size={20}/>
              </a>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Items</span>
                    <span className="font-medium">{order.quantity}x {order.cylinderSize} {order.gasType}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Gas Price</span>
                    <span className="font-medium">₦{order.gasPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">₦{order.deliveryFee?.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-base font-bold">
                    <span>Total Paid</span>
                    <span className="text-green-600">₦{order.totalAmount?.toLocaleString()}</span>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t">
                <div className="flex items-start gap-3">
                    <MapPin className="text-gray-400 mt-1" size={20} />
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                        <p className="font-medium text-gray-900">{order.deliveryAddress}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}