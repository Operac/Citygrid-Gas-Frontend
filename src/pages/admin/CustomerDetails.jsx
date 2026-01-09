import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import toast, { Toaster } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  Mail, 
  Phone, 
  Calendar,
  Clock,
  User,
  ShoppingBag
} from 'lucide-react'

export default function CustomerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get(`/admin/customers/${id}`)
        // Handle varied response structure if necessary, assuming standard wrapper
        setCustomer(res.data.data?.customer || res.data.customer)
      } catch (error) {
        console.error('Failed to fetch customer:', error)
        toast.error(error.response?.data?.error || 'Failed to load customer details')
      } finally {
        setIsLoading(false)
      }
    }
    fetchCustomer()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customer details...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Customer not found</p>
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
            Back to Customers
          </button>
          
          <div className={`px-4 py-2 rounded-full font-medium ${
            customer.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {customer.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* Customer Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl font-bold">
                {customer.fullName?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {customer.fullName}
                </h1>
                <div className="space-y-1 text-gray-600">
                  <p className="flex items-center gap-2">
                    <Mail size={16} />
                    {customer.email || 'No email provided'}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={16} />
                    {customer.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <User size={16} />
                    Member since {new Date(customer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customer._count?.orders || customer.totalOrders || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Lifetime Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₦{Number(customer.lifetimeValue || 0).toLocaleString()}
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
                <p className="text-sm text-gray-600">Last Active</p>
                <p className="text-lg font-bold text-gray-900">
                   {customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'orders'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Order History
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                {customer.orders?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-3 font-medium text-gray-600">Order #</th>
                          <th className="pb-3 font-medium text-gray-600">Date</th>
                          <th className="pb-3 font-medium text-gray-600">Status</th>
                          <th className="pb-3 font-medium text-gray-600">Total</th>
                          <th className="pb-3 font-medium text-gray-600">Items</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {customer.orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="py-3 font-mono text-xs">{order.orderNumber}</td>
                            <td className="py-3 text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 font-medium">
                              ₦{order.totalAmount?.toLocaleString()}
                            </td>
                             <td className="py-3 text-gray-500">
                              {order.items?.length || 0} items
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No orders found for this customer</p>
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
