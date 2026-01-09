import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Package, RefreshCw } from 'lucide-react';

export default function EarningsPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('today');
  const [earnings, setEarnings] = useState([]);
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    totalDeliveries: 0,
    totalCommission: 0,
    totalBaseFees: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchEarnings = useCallback(async () => {
    const loadingState = isRefreshing ? setIsRefreshing : setIsLoading;
    
    loadingState(true);
    try {
      const response = await api.get(`/rider/earnings?period=${period}`);
      
      // Updated response structure based on your backend
      const { data } = response.data;
      setEarnings(data.earnings || []);
      setSummary(data.summary || {
        totalEarnings: 0,
        totalDeliveries: 0,
        totalCommission: 0,
        totalBaseFees: 0
      });
    } catch (error) {
      console.error('Earnings fetch error:', error);
      const errorMessage = error.response?.data?.error || 'Unable to load earnings data';
      
      if (error.response?.status !== 404) {
        toast.error(errorMessage);
      }
      
      // Set empty state on error
      setEarnings([]);
      setSummary({
        totalEarnings: 0,
        totalDeliveries: 0,
        totalCommission: 0,
        totalBaseFees: 0
      });
    } finally {
      loadingState(false);
    }
  }, [period, isRefreshing]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchEarnings();
  };

  const averageEarning = useMemo(
    () =>
      summary.totalDeliveries > 0
        ? Math.floor(summary.totalEarnings / summary.totalDeliveries)
        : 0,
    [summary]
  );

  const formatPeriod = (period) => {
    const periods = {
      'today': 'Today',
      'week': 'This Week',
      'month': 'This Month',
      'all': 'All Time'
    };
    return periods[period] || period;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      'COMPLETED': { color: 'bg-green-100 text-green-800', text: 'Completed' },
      'PAID': { color: 'bg-blue-100 text-blue-800', text: 'Paid' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/rider/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              disabled={isLoading}
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Earnings & Analytics</h1>
              <p className="text-gray-600 mt-1">Track your delivery earnings and performance</p>
            </div>
            
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                Period: <span className="font-bold">{formatPeriod(period)}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period Selector */}
        <div className="flex flex-wrap gap-3 mb-8">
          {['today', 'week', 'month', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                period === p
                  ? 'bg-green-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {formatPeriod(p)}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign size={32} className="opacity-90" />
              <span className="text-green-100 text-sm">Earnings</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              ₦{Number(summary.totalEarnings || 0).toLocaleString()}
            </div>
            <div className="text-green-100 text-sm">Net Earnings</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Package size={32} className="opacity-90" />
              <span className="text-blue-100 text-sm">Deliveries</span>
            </div>
            <div className="text-3xl font-bold mb-1">{summary.totalDeliveries}</div>
            <div className="text-blue-100 text-sm">Completed</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp size={32} className="opacity-90" />
              <span className="text-purple-100 text-sm">Average</span>
            </div>
            <div className="text-3xl font-bold mb-1">₦{Number(averageEarning || 0).toLocaleString()}</div>
            <div className="text-purple-100 text-sm">Per Delivery</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Calendar size={32} className="opacity-90" />
              <span className="text-orange-100 text-sm">Base Fees</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              ₦{Number(summary.totalBaseFees || 0).toLocaleString()}
            </div>
            <div className="text-orange-100 text-sm">Before Commission</div>
          </div>
        </div>

        {/* Earnings List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Earning History</h2>
            <div className="text-sm text-gray-600">
              {earnings.length} record{earnings.length !== 1 ? 's' : ''}
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading earnings history...</p>
            </div>
          ) : earnings.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No earnings recorded</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {period === 'today' 
                  ? "You haven't completed any deliveries today. Complete deliveries to start earning."
                  : `No earnings found for ${formatPeriod(period).toLowerCase()}.`}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/rider/available-orders')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  View Available Orders
                </button>
                <button
                  onClick={() => navigate('/rider/my-orders')}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  My Active Orders
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Base Fee
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Net Earnings
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {earnings.map((earning) => (
                    <tr key={earning.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          #{earning.order?.orderNumber || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                          {earning.order?.deliveryAddress || 'Address not available'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(earning.createdAt).toLocaleDateString('en-NG', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        <div className="text-xs text-gray-400">
                          {new Date(earning.createdAt).toLocaleTimeString('en-NG', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                        ₦{Number(earning.baseFee || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                        -₦{Number(earning.commission || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">
                        ₦{Number(earning.netEarnings || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(earning.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td 
                      colSpan="2" 
                      className="px-6 py-4 text-right text-sm font-bold text-gray-900"
                    >
                      TOTAL ({formatPeriod(period).toUpperCase()}):
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
                      ₦{Number(summary.totalBaseFees || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-red-600">
                      -₦{Number(summary.totalCommission || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-lg text-right font-bold text-green-600">
                      ₦{Number(summary.totalEarnings || 0).toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        {earnings.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <DollarSign size={16} />
              Earnings Breakdown
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Base Fee (100%):</strong> Full delivery fee charged to customer</li>
              <li>• <strong>Commission (20%):</strong> Platform fee deducted for operational costs</li>
              <li>• <strong>Net Earnings (80%):</strong> Your take-home amount after commission</li>
              <li>• Earnings are calculated automatically when you mark orders as "Delivered"</li>
              <li>• <strong>Pending:</strong> Earnings calculated but not yet processed</li>
              <li>• <strong>Completed:</strong> Earnings ready for payment</li>
              <li>• <strong>Paid:</strong> Earnings transferred to your account</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}