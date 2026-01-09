import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import toast, { Toaster } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  MapPin, 
  Bike, 
  Star,
  Clock,
  Navigation
} from 'lucide-react'

export default function RiderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rider, setRider] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchRider = async () => {
      try {
        const res = await api.get(`/admin/riders/${id}`)
        setRider(res.data.data?.rider)
      } catch (error) {
        console.error('Failed to fetch rider:', error)
        toast.error(error.response?.data?.error || 'Failed to load rider details')
      } finally {
        setIsLoading(false)
      }
    }
    fetchRider()
  }, [id])

  const calculateTotalEarnings = (earnings) => {
    return earnings?.reduce((total, earning) => total + (earning.netEarnings || 0), 0) || 0
  }

  const formatStatus = (isOnline, isAvailable) => {
    if (!isOnline) return { text: 'Offline', color: 'text-gray-500', bg: 'bg-gray-100' }
    return isAvailable 
      ? { text: 'Available', color: 'text-green-600', bg: 'bg-green-100' }
      : { text: 'Busy', color: 'text-yellow-600', bg: 'bg-yellow-100' }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rider details...</p>
        </div>
      </div>
    )
  }

  if (!rider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Rider not found</p>
          <button
            onClick={() => navigate(-1)}
            className="text-primary hover:text-primary-dark"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const status = formatStatus(rider.isOnline, rider.isAvailable)
  const totalEarnings = calculateTotalEarnings(rider.earnings)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Riders
          </button>
          
          <div className={`px-4 py-2 rounded-full ${status.bg} ${status.color} font-medium`}>
            {status.text}
          </div>
        </div>

        {/* Rider Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-2xl font-bold">
                {rider.user?.fullName?.charAt(0)?.toUpperCase() || 'R'}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {rider.user?.fullName}
                </h1>
                <div className="space-y-1 text-gray-600">
                  <p className="flex items-center gap-2">
                    <span>📧</span>
                    {rider.user?.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <span>📞</span>
                    {rider.user?.phone}
                  </p>
                  {rider.station && (
                    <p className="flex items-center gap-2">
                      <MapPin size={16} />
                      {rider.station.name} • {rider.station.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-gray-50 rounded-lg p-4 min-w-[250px]">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Bike size={18} />
                Vehicle Details
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Type:</span> {rider.vehicleType}</p>
                <p><span className="text-gray-600">Number:</span> {rider.vehicleNumber}</p>
                <p><span className="text-gray-600">License:</span> {rider.licenseNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{rider.totalDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₦{totalEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rider.rating?.toFixed(1) || '5.0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(rider.joinedAt || rider.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b">
            <nav className="flex -mb-px">
              {['overview', 'earnings', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                {rider.orders?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-3 font-medium text-gray-600">Order #</th>
                          <th className="pb-3 font-medium text-gray-600">Customer</th>
                          <th className="pb-3 font-medium text-gray-600">Status</th>
                          <th className="pb-3 font-medium text-gray-600">Date</th>
                          <th className="pb-3 font-medium text-gray-600">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {rider.orders.slice(0, 10).map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="py-3 font-mono text-xs">{order.orderNumber}</td>
                            <td className="py-3">{order.customer?.fullName}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 font-medium">
                              ₦{order.totalAmount?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No orders found for this rider</p>
                  </div>
                )}
              </div>
            )}

            {/* Earnings Tab */}
            {activeTab === 'earnings' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Earnings History</h3>
                {rider.earnings?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-3 font-medium text-gray-600">Date</th>
                          <th className="pb-3 font-medium text-gray-600">Order #</th>
                          <th className="pb-3 font-medium text-gray-600">Base Fee</th>
                          <th className="pb-3 font-medium text-gray-600">Commission</th>
                          <th className="pb-3 font-medium text-gray-600">Net Earnings</th>
                          <th className="pb-3 font-medium text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {rider.earnings.map((earning) => (
                          <tr key={earning.id} className="hover:bg-gray-50">
                            <td className="py-3">
                              {new Date(earning.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 font-mono text-xs">
                              {earning.order?.orderNumber}
                            </td>
                            <td className="py-3">₦{earning.baseFee?.toLocaleString()}</td>
                            <td className="py-3 text-red-600">-₦{earning.commission?.toLocaleString()}</td>
                            <td className="py-3 font-medium text-green-600">
                              ₦{earning.netEarnings?.toLocaleString()}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                earning.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                earning.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {earning.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No earnings history found</p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                {rider.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {rider.reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                            <span className="font-medium">{review.customer?.fullName}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No reviews yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}