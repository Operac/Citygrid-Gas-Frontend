import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import toast, { Toaster } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  MapPin, 
  User, 
  Package,
  RefreshCw,
  Truck,
  Building,
  CheckSquare,
  Square,
  Edit,
  Users,
  Play,
  Pause,
  Wifi,
  WifiOff
} from 'lucide-react'
import OrderDetailsModal from '../../components/orders/OrderDetailsModal'
import AssignRiderModal from '../../components/orders/AssignRiderModal'
import AssignStationModal from '../../components/orders/AssignStationModal'
import BulkActionsModal from '../../components/orders/BulkActionsModal'

export default function OrdersManagement() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [stations, setStations] = useState([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [isLoadingStations, setIsLoadingStations] = useState(true)
  const [filters, setFilters] = useState({ 
    status: 'all', 
    search: '',
    stationId: '',
    startDate: '',
    endDate: ''
  })
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showStationModal, setShowStationModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)
  const [availableRiders, setAvailableRiders] = useState([])
  const [selectedOrders, setSelectedOrders] = useState(new Set())
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true)
  const ws = useRef(null)

  // WebSocket connection for real-time updates
  const connectWebSocket = useCallback(() => {
    try {
      // Use backend URL for WebSocket (typically localhost:5000)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const backendHost = window.location.hostname === 'localhost' ? 'localhost:5000' : window.location.host
      const wsUrl = `${protocol}//${backendHost}/ws/orders`
      
      ws.current = new WebSocket(wsUrl)
      
      ws.current.onopen = () => {
        console.log('WebSocket connected')
        setIsWebSocketConnected(true)
        toast.success('Real-time updates connected')
      }
      
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('WebSocket message received:', data)
          
          switch (data.type) {
            case 'ORDER_UPDATED':
              handleOrderUpdate(data.order)
              break
            case 'ORDER_CREATED':
              handleNewOrder(data.order)
              break
            case 'ORDER_STATUS_CHANGED':
              handleOrderStatusChange(data.order)
              break
            case 'RIDER_ASSIGNED':
              handleRiderAssignment(data.order)
              break
            default:
              console.log('Unknown WebSocket message type:', data.type)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      ws.current.onclose = () => {
        console.log('WebSocket disconnected')
        setIsWebSocketConnected(false)
        // Attempt reconnect after 5 seconds
        setTimeout(() => {
          if (ws.current?.readyState !== WebSocket.OPEN) {
            connectWebSocket()
          }
        }, 5000)
      }
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsWebSocketConnected(false)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      setIsWebSocketConnected(false)
    }
  }, [])

  // WebSocket message handlers
  const handleOrderUpdate = useCallback((updatedOrder) => {
    setOrders(prev => prev.map(order => 
      order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
    ))
  }, [])

  const handleNewOrder = useCallback((newOrder) => {
    setOrders(prev => {
      // Don't add if already exists (in case of duplicates)
      if (prev.find(order => order.id === newOrder.id)) {
        return prev
      }
      return [newOrder, ...prev]
    })
  }, [])

  const handleOrderStatusChange = useCallback((updatedOrder) => {
    setOrders(prev => prev.map(order => 
      order.id === updatedOrder.id ? { ...order, status: updatedOrder.status } : order
    ))
    
    // Show toast notification for important status changes
    if (['DELIVERED', 'CANCELLED', 'IN_TRANSIT'].includes(updatedOrder.status)) {
      toast.success(`Order #${updatedOrder.orderNumber} is now ${updatedOrder.status.replace('_', ' ').toLowerCase()}`, {
        duration: 4000
      })
    }
  }, [])

  const handleRiderAssignment = useCallback((updatedOrder) => {
    setOrders(prev => prev.map(order => 
      order.id === updatedOrder.id ? { ...order, rider: updatedOrder.rider } : order
    ))
    
    if (updatedOrder.rider) {
      toast.success(`Rider assigned to order #${updatedOrder.orderNumber}`, {
        duration: 3000
      })
    }
  }, [])

  // Fetch orders with pagination and filters
  const fetchOrders = useCallback(async (page = 1, signal) => {
    setIsLoadingOrders(true)
    try {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      if (filters.stationId) params.append('stationId', filters.stationId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      params.append('page', page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await api.get(`/admin/orders?${params.toString()}`, { signal })
      
      // Response structure: { success, message, data: { orders, pagination } }
      const data = response.data.data || {}
      setOrders(data.orders || [])
      setPagination(prev => ({
        ...prev,
        page: data.pagination?.page || page,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || Math.ceil((data.pagination?.total || 0) / prev.limit)
      }))
    } catch (error) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') return
      console.error('Failed to fetch orders:', error)
      toast.error(error.response?.data?.error || 'Failed to load orders')
      setOrders([])
    } finally {
      setIsLoadingOrders(false)
    }
  }, [filters, pagination.limit])

  // Fetch stations
  const fetchStations = useCallback(async (signal) => {
    setIsLoadingStations(true)
    try {
      const response = await api.get('/admin/stations', { signal })
      
      // Response structure: { success, message, data: { stations, pagination } }
      setStations(response.data.data?.stations || [])
    } catch (error) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') return
      console.error('Failed to fetch stations:', error)
      toast.error(error.response?.data?.error || 'Failed to load stations')
      setStations([])
    } finally {
      setIsLoadingStations(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchOrders(1, controller.signal)
    fetchStations(controller.signal)
    
    // Connect to WebSocket
    connectWebSocket()
    
    return () => {
      controller.abort()
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [fetchOrders, fetchStations, connectWebSocket])

  // Auto-assign rider when station is assigned
  const autoAssignRider = async (orderId, stationId) => {
    if (!autoAssignEnabled) return
    
    try {
      // Find available riders for this station
      const response = await api.get(`/admin/riders?status=online&stationId=${stationId}`)
      const availableRiders = response.data.success 
        ? response.data.data?.riders || response.data.riders || []
        : response.data.riders || []
      
      if (availableRiders.length > 0) {
        // Assign the first available rider
        const rider = availableRiders[0]
        await api.post('/admin/orders/assign-rider', { 
          orderId, 
          riderId: rider.id 
        })
        
        toast.success(`Auto-assigned rider ${rider.user?.fullName} to order`)
        
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, rider, status: 'RIDER_ASSIGNED' }
            : order
        ))
      }
    } catch (error) {
      console.error('Auto-assign rider failed:', error)
      // Don't show toast for auto-assign failures to avoid spam
    }
  }

  const handleViewDetails = async (orderId) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}`)
      
      if (response.data.success) {
        setSelectedOrderDetails(response.data.data?.order || response.data.order)
      } else {
        setSelectedOrderDetails(response.data.order)
      }
      setShowDetailsModal(true)
    } catch (error) {
      console.error('Failed to fetch order details:', error)
      toast.error(error.response?.data?.error || 'Failed to load order details')
    }
  }

  const handleAssignRider = async (orderId) => {
    setSelectedOrder(orderId)
    try {
      const response = await api.get('/admin/riders?status=online')
      
      // Response structure: { success, message, data: { riders, pagination } }
      setAvailableRiders(response.data.data?.riders || [])
      setShowAssignModal(true)
    } catch (error) {
      console.error('Failed to fetch riders:', error)
      toast.error(error.response?.data?.error || 'Failed to fetch available riders')
    }
  }

  const handleAssignStation = (orderId) => {
    setSelectedOrder(orderId)
    setShowStationModal(true)
  }

  const assignRiderToOrder = async (riderId) => {
    try {
      await api.post('/admin/orders/assign-rider', { 
        orderId: selectedOrder, 
        riderId 
      })
      toast.success('Rider assigned successfully')
      setShowAssignModal(false)
      setSelectedOrder(null)
      fetchOrders(pagination.page)
    } catch (error) {
      console.error('Failed to assign rider:', error)
      toast.error(error.response?.data?.error || 'Failed to assign rider')
    }
  }

  const assignStationToOrder = async (stationId) => {
    try {
      await api.patch(`/admin/orders/${selectedOrder}/station`, { stationId })
      toast.success('Station assigned successfully')
      
      // Auto-assign rider if enabled
      if (autoAssignEnabled) {
        await autoAssignRider(selectedOrder, stationId)
      }
      
      setShowStationModal(false)
      setSelectedOrder(null)
      fetchOrders(pagination.page)
    } catch (error) {
      console.error('Failed to assign station:', error)
      toast.error(error.response?.data?.error || 'Failed to assign station')
    }
  }

  // Selection handlers for bulk actions
  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(orderId)) {
        newSelection.delete(orderId)
      } else {
        newSelection.add(orderId)
      }
      return newSelection
    })
  }

  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(orders.map(order => order.id)))
    }
  }

  const clearSelection = () => {
    setSelectedOrders(new Set())
  }

  // Bulk actions
  const handleBulkAction = async (action, data) => {
    try {
      const orderIds = Array.from(selectedOrders)
      
      switch (action) {
        case 'update_status':
          await api.patch('/admin/orders/bulk-status', {
            orderIds,
            status: data.status
          })
          toast.success(`Updated status for ${orderIds.length} orders`)
          break
        
        case 'assign_station':
          await api.patch('/admin/orders/bulk-station', {
            orderIds,
            stationId: data.stationId
          })
          toast.success(`Assigned station to ${orderIds.length} orders`)
          break
        
        case 'assign_rider':
          await api.post('/admin/orders/bulk-assign-rider', {
            orderIds,
            riderId: data.riderId
          })
          toast.success(`Assigned rider to ${orderIds.length} orders`)
          break
        
        case 'cancel_orders':
          await api.patch('/admin/orders/bulk-cancel', { orderIds })
          toast.success(`Cancelled ${orderIds.length} orders`)
          break
        
        default:
          throw new Error('Unknown bulk action')
      }
      
      // Refresh orders and clear selection
      fetchOrders(pagination.page)
      clearSelection()
      setShowBulkModal(false)
    } catch (error) {
      console.error('Bulk action failed:', error)
      toast.error(error.response?.data?.error || 'Failed to perform bulk action')
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status })
      toast.success(`Order status updated to ${status}`)
      fetchOrders(pagination.page)
    } catch (error) {
      console.error('Failed to update order status:', error)
      toast.error(error.response?.data?.error || 'Failed to update order status')
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchOrders(newPage)
    }
  }

  const clearFilters = () => {
    setFilters({
      status: 'all',
      search: '',
      stationId: '',
      startDate: '',
      endDate: ''
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
      PREPARING: 'bg-purple-100 text-purple-800 border-purple-200',
      RIDER_ASSIGNED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      PICKED_UP: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      IN_TRANSIT: 'bg-teal-100 text-teal-800 border-teal-200',
      ARRIVED: 'bg-orange-100 text-orange-800 border-orange-200',
      DELIVERED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getTotalStats = () => {
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    const pendingOrders = orders.filter(order => 
      ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status)
    ).length
    const deliveredOrders = orders.filter(order => order.status === 'DELIVERED').length

    return { totalOrders, totalRevenue, pendingOrders, deliveredOrders }
  }

  const stats = getTotalStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button 
            onClick={() => navigate('/admin')} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
                <p className="text-gray-600 text-sm">Manage and track all customer orders</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* WebSocket Status */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                isWebSocketConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isWebSocketConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                <span className="text-sm font-medium">
                  {isWebSocketConnected ? 'Live' : 'Offline'}
                </span>
              </div>

              {/* Auto-assign Toggle */}
              <button
                onClick={() => setAutoAssignEnabled(!autoAssignEnabled)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  autoAssignEnabled
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {autoAssignEnabled ? <Play size={16} /> : <Pause size={16} />}
                <span className="text-sm font-medium">
                  Auto-assign: {autoAssignEnabled ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                onClick={() => fetchOrders(pagination.page)}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                onClick={() => {
                  const csv = generateCSV(orders)
                  downloadCSV(csv, `orders-${new Date().toISOString().split('T')[0]}.csv`)
                }}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Bulk Actions Bar */}
      {selectedOrders.size > 0 && (
        <div className="bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-blue-100 hover:text-white text-sm font-medium"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  <Edit size={16} />
                  Bulk Actions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <Package className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
              <RefreshCw className="text-yellow-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.deliveredOrders}</p>
              </div>
              <Truck className="text-green-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₦{Number(stats.totalRevenue).toLocaleString()}
                </p>
              </div>
              <Building className="text-purple-500" size={24} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Clear all
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline mr-2" size={16} />
                Search Orders
              </label>
              <input
                type="text"
                placeholder="Search by order number or customer..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline mr-2" size={16} />
                Order Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="all">All Statuses</option>
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
            </div>

            {/* Station Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline mr-2" size={16} />
                Station
              </label>
              <select
                value={filters.stationId}
                onChange={(e) => setFilters({ ...filters, stationId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">All Stations</option>
                {stations.map(station => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {isLoadingOrders ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some(filter => filter && filter !== 'all') 
                ? 'Try adjusting your filters' 
                : 'No orders have been placed yet'
              }
            </p>
            {Object.values(filters).some(filter => filter && filter !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center">
                          <button
                            onClick={toggleSelectAll}
                            className="mr-3 p-1 hover:bg-gray-200 rounded"
                          >
                            {selectedOrders.size === orders.length ? (
                              <CheckSquare size={16} className="text-blue-600" />
                            ) : (
                              <Square size={16} className="text-gray-400" />
                            )}
                          </button>
                          Order Details
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Station & Rider
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr 
                        key={order.id} 
                        className={`hover:bg-gray-50 transition-colors ${
                          selectedOrders.has(order.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        {/* Order Details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleOrderSelection(order.id)}
                              className="mr-3 p-1 hover:bg-gray-200 rounded"
                            >
                              {selectedOrders.has(order.id) ? (
                                <CheckSquare size={16} className="text-blue-600" />
                              ) : (
                                <Square size={16} className="text-gray-400" />
                              )}
                            </button>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                #{order.orderNumber}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {order.cylinderSize} {order.gasType}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(order.createdAt).toLocaleDateString('en-NG', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User size={14} className="text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {order.customer?.fullName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {order.customer?.phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Station & Rider */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {/* Station */}
                            <div>
                              {order.station?.name ? (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <MapPin size={14} />
                                  {order.station.name}
                                </div>
                              ) : (
                                <button 
                                  onClick={() => handleAssignStation(order.id)}
                                  className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                                >
                                  <MapPin size={14} />
                                  Assign Station
                                </button>
                              )}
                            </div>

                            {/* Rider */}
                            <div>
                              {order.rider?.user?.fullName ? (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <User size={14} />
                                  {order.rider.user.fullName}
                                </div>
                              ) : order.stationId && ['CONFIRMED', 'PREPARING'].includes(order.status) ? (
                                <button 
                                  onClick={() => handleAssignRider(order.id)}
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  <User size={14} />
                                  Assign Rider
                                </button>
                              ) : (
                                <div className="text-sm text-gray-400">
                                  Unassigned
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 text-right">
                          <div className="font-bold text-gray-900 text-lg">
                            ₦{Number(order.totalAmount || 0).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.paymentStatus?.toLowerCase() || 'pending'}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => handleViewDetails(order.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-between items-center bg-white rounded-xl shadow-sm p-6">
                <div className="text-sm text-gray-600">
                  Showing {orders.length} of {pagination.total} orders
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {showDetailsModal && selectedOrderDetails && (
        <OrderDetailsModal 
          order={selectedOrderDetails} 
          close={() => {
            setShowDetailsModal(false)
            setSelectedOrderDetails(null)
          }} 
          getStatusColor={getStatusColor}
          onStatusUpdate={(orderId, status) => {
            updateOrderStatus(orderId, status)
            setShowDetailsModal(false)
          }}
        />
      )}
      
      {showAssignModal && (
        <AssignRiderModal 
          riders={availableRiders} 
          onAssign={assignRiderToOrder} 
          onClose={() => { 
            setShowAssignModal(false); 
            setSelectedOrder(null) 
          }} 
        />
      )}
      
      {showStationModal && (
        <AssignStationModal 
          stations={stations} 
          onAssign={assignStationToOrder} 
          onClose={() => { 
            setShowStationModal(false); 
            setSelectedOrder(null) 
          }} 
        />
      )}

      {showBulkModal && (
        <BulkActionsModal
          selectedCount={selectedOrders.size}
          stations={stations}
          onAction={handleBulkAction}
          onClose={() => setShowBulkModal(false)}
        />
      )}
    </div>
  )
}

// CSV Helpers
function generateCSV(orders) {
  const headers = ['Order #', 'Customer', 'Phone', 'Gas Type', 'Cylinder Size', 'Station', 'Rider', 'Status', 'Amount', 'Payment Status', 'Date']
  const rows = orders.map((order) => [
    order.orderNumber,
    order.customer?.fullName || 'N/A',
    order.customer?.phone || 'N/A',
    order.gasType || 'N/A',
    order.cylinderSize || 'N/A',
    order.station?.name || 'Unassigned',
    order.rider?.user?.fullName || 'Unassigned',
    order.status,
    order.totalAmount || 0,
    order.paymentStatus || 'PENDING',
    new Date(order.createdAt).toLocaleDateString()
  ])
  
  const escapeCell = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`
  return [headers.map(escapeCell).join(','), ...rows.map(row => row.map(escapeCell).join(','))].join('\n')
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}