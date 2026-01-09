import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Truck } from 'lucide-react';

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { order } = location.state || {};

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No order details found.</p>
          <button
            onClick={() => navigate('/home')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600 w-10 h-10" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600 mb-8">
          Order #{order.orderNumber} has been confirmed and is being processed.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Amount Paid</span>
            <span className="font-bold">₦{order.totalAmount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Payment Method</span>
            <span className="capitalize">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Delivery</span>
            <span className="text-green-600 font-medium">30-45 mins</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate(`/orders/${order.id}`)}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            Track Order
            <Truck size={20} />
          </button>
          
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-white text-gray-600 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
