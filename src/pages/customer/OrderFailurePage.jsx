import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, RefreshCcw, Home } from 'lucide-react';

export default function OrderFailurePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { error } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="text-red-600 w-10 h-10" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Order Placement Failed
        </h1>
        
        <p className="text-gray-600 mb-6">
          {error || "We couldn't process your order. Please try again or contact support."}
        </p>

        <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8 text-left text-sm text-red-700">
          <p className="font-medium mb-1">Potential reasons:</p>
          <ul className="list-disc list-inside space-y-1 opacity-80">
            <li>Payment verification failed</li>
            <li>Network connection issues</li>
            <li>Item became out of stock</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            Try Again
            <RefreshCcw size={20} />
          </button>
          
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-white text-gray-600 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            Go Home
            <Home size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
