import { 
  X, 
  MapPin, 
  User, 
  Package, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Clock,
  Truck,
  Building,
  MessageCircle,
  Star,
  Download,
  Edit,
  RefreshCw
} from 'lucide-react'
import { useState } from 'react'

export default function OrderDetailsModal({ order, close, getStatusColor, onStatusUpdate }) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(order.status)

  if (!order) return null

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status) return
    
    setIsUpdatingStatus(true)
    try {
      await onStatusUpdate(order.id, selectedStatus)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const downloadProof = (url, filename) => {
    if (!url) return
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString()}`
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentStatusColor = (status) => {
    const colors = {
      PAID: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      FAILED: 'bg-red-100 text-red-800 border-red-200',
      REFUNDED: 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h2>
              <p className="text-gray-600 text-sm">
                Created {formatDateTime(order.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={close}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Actions & Status */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              <div className="flex items-center gap-4">
                <div>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Last updated: {formatDateTime(order.updatedAt)}
                </div>
              </div>
              
              {onStatusUpdate && (
                <div className="flex gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="RIDER_ASSIGNED">Rider Assigned</option>
                    <option value="PICKED_UP">Picked Up</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="ARRIVED">Arrived</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={isUpdatingStatus || selectedStatus === order.status}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    {isUpdatingStatus ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Edit size={16} />
                    )}
                    Update
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Customer Information */}
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.customer?.fullName || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{order.customer?.phone || 'N/A'}</p>
                      {order.customer?.email && (
                        <p className="text-sm text-gray-600">{order.customer.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Delivery Information */}
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-green-600" />
                  Delivery Information
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-700">{order.deliveryAddress}</p>
                  {order.deliveryLatitude && order.deliveryLongitude && (
                    <p className="text-sm text-gray-600">
                      Coordinates: {order.deliveryLatitude.toFixed(6)}, {order.deliveryLongitude.toFixed(6)}
                    </p>
                  )}
                  {order.scheduledTime && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded-lg">
                      <Clock size={16} />
                      Scheduled for {formatDateTime(order.scheduledTime)}
                    </div>
                  )}
                </div>
              </section>

              {/* Assignment Information */}
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck size={20} className="text-purple-600" />
                  Assignment
                </h3>
                <div className="grid gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Station</p>
                    <div className="flex items-center gap-2">
                      <Building size={16} className="text-gray-400" />
                      <p className="font-medium text-gray-900">
                        {order.station?.name || 'Not assigned'}
                      </p>
                    </div>
                    {order.station?.phone && (
                      <p className="text-sm text-gray-600 ml-6">{order.station.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Rider</p>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <p className="font-medium text-gray-900">
                        {order.rider?.user?.fullName || 'Not assigned'}
                      </p>
                    </div>
                    {order.rider?.user?.phone && (
                      <p className="text-sm text-gray-600 ml-6">{order.rider.user.phone}</p>
                    )}
                    {order.rider?.vehicleNumber && (
                      <p className="text-sm text-gray-600 ml-6">
                        {order.rider.vehicleType} • {order.rider.vehicleNumber}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Order Details */}
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package size={20} className="text-orange-600" />
                  Order Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Gas Type</span>
                    <span className="font-medium text-gray-900">{order.gasType}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Cylinder Size</span>
                    <span className="font-medium text-gray-900">{order.cylinderSize}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Order Type</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {order.orderType?.replace('_', ' ') || 'Standard'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-medium text-gray-900">{order.quantity || 1}</span>
                  </div>
                </div>
              </section>

              {/* Pricing */}
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign size={20} className="text-green-600" />
                  Pricing Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Gas Price</span>
                    <span className="font-medium text-gray-900">{formatCurrency(order.gasPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium text-gray-900">{formatCurrency(order.deliveryFee)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </section>

              {/* Payment Information */}
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard size={20} className="text-purple-600" />
                  Payment Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Method</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {order.paymentMethod?.replace('_', ' ') || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus || 'PENDING'}
                    </span>
                  </div>
                  {order.paymentReference && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Reference</span>
                      <span className="font-medium text-gray-900 text-sm">{order.paymentReference}</span>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Proof of Delivery & Rating */}
          {(order.proofPhotoUrl || order.signatureUrl || order.rating) && (
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Confirmation</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {order.proofPhotoUrl && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Proof Photo</p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
                      <Package size={32} className="mx-auto text-gray-400 mb-2" />
                      <button
                        onClick={() => downloadProof(order.proofPhotoUrl, `proof-${order.orderNumber}.jpg`)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Download size={14} />
                        Download Photo
                      </button>
                    </div>
                  </div>
                )}
                
                {order.signatureUrl && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Customer Signature</p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
                      <MessageCircle size={32} className="mx-auto text-gray-400 mb-2" />
                      <button
                        onClick={() => downloadProof(order.signatureUrl, `signature-${order.orderNumber}.jpg`)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Download size={14} />
                        Download Signature
                      </button>
                    </div>
                  </div>
                )}
                
                {order.rating && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Customer Rating</p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            className={i < order.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{order.rating}/5 Stars</p>
                      {order.review && (
                        <p className="text-xs text-gray-500 mt-2 italic">"{order.review}"</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {order.deliveryNotes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Delivery Notes:</p>
                  <p className="text-gray-700">{order.deliveryNotes}</p>
                </div>
              )}
            </section>
          )}

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
              <div className="space-y-3">
                {order.statusHistory.map((history, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      history.status === 'DELIVERED' ? 'bg-green-500' :
                      history.status === 'CANCELLED' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {history.status.replace(/_/g, ' ').toLowerCase()}
                          </p>
                          {history.notes && (
                            <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDateTime(history.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={close}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}