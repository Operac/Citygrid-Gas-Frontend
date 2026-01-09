import React, { useEffect, useState } from 'react';
import axios from '../../lib/axios';
// Removing double navbar: Layout is already handled in App.jsx's ProtectedRoute
// import Layout from '../../components/Layout'; 
import { 
  BarChart3, 
  Package, 
  ClipboardList, 
  Users, 
  AlertTriangle,
  Edit2,
  User,
  CreditCard,
  Settings,
  CheckCircle,
  XCircle,
  Truck
} from 'lucide-react';
import toast from 'react-hot-toast';
import AssignRiderModal from '../../components/manager/AssignRiderModal';

export default function StationDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stationInfo, setStationInfo] = useState(null); // For Settings

  // Modal States
  const [editingItem, setEditingItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    gasType: 'LPG',
    cylinderSize: '12.5kg',
    quantity: '',
    price: ''
  });
  const [editForm, setEditForm] = useState({ quantity: '', price: '' });
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await axios.get('/manager/station-stats');
        setStats(res.data.data);
      } else if (activeTab === 'inventory') {
        const res = await axios.get('/manager/inventory');
        setInventory(res.data.data);
      } else if (activeTab === 'orders' || activeTab === 'payments') { 
        // Reusing orders endpoint for payments logic for now, or fetch specific if added
        const res = await axios.get('/manager/orders');
        setOrders(res.data.data.orders);
      } else if (activeTab === 'riders') {
        const res = await axios.get('/manager/riders');
        setRiders(res.data.data);
        
        // Ensure station name is visible if not already set
        if (!stationInfo) {
             const statRes = await axios.get('/manager/station-stats');
             if (statRes.data.data.station) {
                 setStationInfo(statRes.data.data.station);
             }
        }
      } else if (activeTab === 'customers') {
        const res = await axios.get('/manager/customers'); // New Endpoint
        setCustomers(res.data.data);
      } else if (activeTab === 'settings') {
        // Fetch station info, usually available via stats or riders, but better to have own call or derive
        // For now, we'll derive active status from stats or re-fetch stats to check if needed.
        // Assuming stats endpoint might return station details or we fetch specific station.
        // Let's rely on a fresh inventory call which returns station data embedded or similar.
        // Better: Fetch inventory to get station info, or use a new endpoint if strict.
        // For simplicity: We will fetch inventory to get one station ID and its isActive status? 
        // Actually `getStationStats` checks for owned stations. Let's assume user manages one main station for now
        // or we list all stations in settings.
        const res = await axios.get('/manager/station-stats');
        setStats(res.data.data);
        // Set station info from stats if available (fix for empty inventory bug)
        if (res.data.data.station) {
            setStationInfo(res.data.data.station);
        }

        const invRes = await axios.get('/manager/inventory'); 
        if (invRes.data.data.length > 0 && !res.data.data.station) {
             // Fallback if stats didn't return it (though it should now)
           setStationInfo(invRes.data.data[0].station); 
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/manager/inventory/${editingItem.id}`, {
        quantity: Number(editForm.quantity),
        price: Number(editForm.price)
      });
      toast.success('Inventory updated');
      setEditingItem(null);
      fetchData(); 
    } catch (error) {
      toast.error('Failed to update inventory');
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!addForm.quantity || !addForm.price) return toast.error('Please fill all fields');
    
    // We need stationId. Assuming single station for now or first one from stats/inventory.
    // If inventory list is empty, we might have trouble getting stationId if we rely on it.
    // Best is to fetch station list or use stats. Let's use `stationInfo.id` if available, else derive.
    // We set stationInfo in 'settings' tab logic, but we might not have it here. 
    // Let's ensure we have a stationId. 
    // Fallback: If inventory has items, pick first stationId. OR fetch stations on mount.
    // For MVP: We will use the stationId from the first inventory item if available, or error.
    // BETTER: Get stationId from stats if not set.
    
    let targetStationId = stationInfo?.id;
    if (!targetStationId && inventory.length > 0) {
        targetStationId = inventory[0].stationId;
    }
    
    if (!targetStationId) {
        // Try to fetch stats to get station ID if not present
        try {
            const res = await axios.get('/manager/station-stats');
             return toast.error('Unable to determine station. Please contact admin.');
        } catch(e) {}
    }

    try {
      await axios.post('/manager/inventory', {
        stationId: targetStationId,
        gasType: addForm.gasType,
        cylinderSize: addForm.cylinderSize,
        quantity: Number(addForm.quantity),
        price: Number(addForm.price)
      });
      toast.success(`${addForm.gasType} ${addForm.cylinderSize} added successfully!`);
      setIsAddModalOpen(false);
      setAddForm({ gasType: 'LPG', cylinderSize: '12.5kg', quantity: '', price: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add item');
    }
  };

  const handleOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`/manager/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order ${newStatus.toLowerCase()}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleRiderStatus = async (riderId, isAvailable) => {
    try {
      await axios.patch(`/manager/riders/${riderId}/status`, { isAvailable });
      toast.success(`Rider marked ${isAvailable ? 'available' : 'unavailable'}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update rider status');
    }
  };

  const handleStationStatus = async (stationId, isActive) => {
    try {
      await axios.patch('/manager/station/status', { stationId, isActive });
      toast.success(`Station ${isActive ? 'enabled' : 'disabled'}`);
       // Update local state purely for UI responsiveness
       setStationInfo(prev => ({ ...prev, isActive }));
    } catch (error) {
      toast.error('Failed to update station status');
    }
  };

  const openAssignModal = (orderId) => {
    setSelectedOrderForAssign(orderId);
    setIsAssignModalOpen(true);
  };

  // --- UI HELPERS ---

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'riders', label: 'Riders', icon: Truck },
    { id: 'customers', label: 'Customers', icon: User },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">
             {stationInfo?.name ? `${stationInfo.name}` : 'Station Management'}
           </h1>
           <p className="text-sm text-gray-500">
             {stationInfo?.name ? 'Station Manager Dashboard' : 'Daily Operations & Controls'}
           </p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm font-medium ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-gray-500 text-sm font-medium mb-1">Total Orders</div>
                      <div className="text-3xl font-bold text-gray-900">{stats.totalOrders}</div>
                    </div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <ClipboardList size={20} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-gray-500 text-sm font-medium mb-1">Pending</div>
                      <div className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</div>
                    </div>
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                      <AlertTriangle size={20} />
                    </div>
                  </div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-gray-500 text-sm font-medium mb-1">Revenue (Est.)</div>
                      <div className="text-3xl font-bold text-gray-900">₦0</div>
                      <p className="text-xs text-gray-400 mt-1">Pending Implementation</p>
                    </div>
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <CreditCard size={20} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-gray-500 text-sm font-medium mb-1">Active Riders</div>
                      <div className="text-3xl font-bold text-green-600">{stats.activeRiders}</div>
                    </div>
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Truck size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Low Inventory Alert */}
              {stats.lowInventory?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h3 className="text-red-800 font-bold flex items-center gap-2 mb-4">
                    <AlertTriangle size={20} />
                    Attention: Low Stock Levels
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {stats.lowInventory.map(item => (
                      <div key={item.id} className="bg-white p-4 rounded-lg border border-red-100 shadow-sm flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">{item.gasType} - {item.cylinderSize}</div>
                          <div className="text-sm text-gray-500">Qty: <span className="font-bold text-red-600">{item.quantity}</span></div>
                        </div>
                        <button 
                          onClick={() => { setActiveTab('inventory'); }}
                          className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 font-medium"
                        >
                          Restock
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Inventory Management</h2>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Package size={20} />
              Add Item
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{item.gasType}</td>
                    <td className="px-6 py-4">{item.cylinderSize}</td>
                    <td className="px-6 py-4">{item.quantity} units</td>
                    <td className="px-6 py-4">₦{item.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.quantity > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.quantity > 10 ? 'In Stock' : 'Low Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => {
                          setEditingItem(item);
                          setEditForm({ quantity: item.quantity, price: item.price });
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inventory.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    No inventory items found. Add one to get started.
                </div>
            )}
          </div>
        </div>
      )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rider</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-blue-600">#{order.orderNumber || order.id.slice(0, 6)}</span>
                        <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900 font-medium">{order.customer?.fullName}</div>
                        <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm text-gray-900">{order.gasType} - {order.cylinderSize}</div>
                         <div className="text-xs text-gray-500">Qty: {order.quantity} • ₦{order.totalAmount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${['DELIVERED', 'COMPLETED'].includes(order.status) ? 'bg-green-100 text-green-800' : 
                            ['PENDING', 'PREPARING'].includes(order.status) ? 'bg-yellow-100 text-yellow-800' : 
                            ['CANCELLED', 'REJECTED'].includes(order.status) ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        {order.rider ? (
                           <span className="font-medium text-gray-900">{order.rider.user?.fullName}</span>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <div className="flex justify-end gap-2">
                           {/* Pending: Accept (Prepare) or Reject */}
                           {order.status === 'PENDING' && (
                             <>
                               <button 
                                 onClick={() => handleOrderStatus(order.id, 'CONFIRMED')}
                                 className="text-green-600 hover:text-green-900" title="Accept Order">
                                 <CheckCircle size={18} />
                               </button>
                               <button 
                                 onClick={() => handleOrderStatus(order.id, 'CANCELLED')}
                                 className="text-red-600 hover:text-red-900" title="Reject Order">
                                 <XCircle size={18} />
                               </button>
                             </>
                           )}

                           {/* Confirmed: Assign Rider */}
                           {(order.status === 'CONFIRMED' || order.status === 'PREPARING') && !order.rider && (
                             <button 
                               onClick={() => openAssignModal(order.id)}
                               className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                             >
                               Assign Rider
                             </button>
                           )}

                           {/* In Progress: Mark Delivered (if rider forgets) */}
                           {['RIDER_ASSIGNED', 'IN_TRANSIT', 'PICKED_UP'].includes(order.status) && (
                             <button 
                               onClick={() => handleOrderStatus(order.id, 'DELIVERED')}
                               className="text-blue-600 hover:text-blue-900 text-xs underline"
                             >
                               Force Complete
                             </button>
                           )}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* RIDERS TAB */}
          {activeTab === 'riders' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {riders.map(rider => (
                  <div key={rider.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                          🏍️
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{rider.fullName}</h3>
                          <p className="text-sm text-gray-500">{rider.phone}</p>
                          <p className="text-xs text-green-600 font-medium">{rider.stationName}</p>
                        </div>
                      </div>
                    {/* Status Toggle */}
                    <button
                      onClick={() => handleToggleRiderStatus(rider.id, !rider.isAvailable)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        rider.isAvailable 
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200' 
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                      }`}
                    >
                      {rider.isAvailable ? 'Available' : 'Unavailable'}
                    </button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium">{rider.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vehicle:</span>
                      <span className="font-medium">{rider.vehicleType} ({rider.vehicleNumber})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Deliveries:</span>
                      <span className="font-medium">{rider.totalDeliveries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Online Status:</span>
                      <span className={rider.isOnline ? 'text-green-600' : 'text-gray-400'}>
                        {rider.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Order</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-200">
                    {customers.map(customer => (
                      <tr key={customer.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{customer.fullName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{customer.email}</div>
                          <div>{customer.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.totalOrders}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">No customers found for your stations yet.</td>
                      </tr>
                    )}
                 </tbody>
               </table>
             </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                 <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Ref</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Date</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-200">
                    {orders.map(order => (
                      <tr key={order.id}>
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                           #{order.orderNumber || order.id.slice(0,6)}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                           ₦{order.totalAmount.toLocaleString()}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                           {order.paymentMethod || 'Card'}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${order.paymentStatus === 'COMPLETED' || order.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {order.paymentStatus || 'Pending'}
                            </span>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                           {new Date(order.createdAt).toLocaleDateString()}
                         </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
             <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-8">
               <h2 className="text-lg font-bold text-gray-900 mb-6">Service Area Controls</h2>
               
               {stationInfo ? (
                 <div className="space-y-6">
                   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">Station Status ({stationInfo.name})</div>
                        <div className="text-sm text-gray-500">Toggle to enable or disable orders for this station.</div>
                      </div>
                      <button
                        onClick={() => handleStationStatus(stationInfo.id, !stationInfo.isActive)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                           stationInfo.isActive ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                         <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                           stationInfo.isActive ? 'translate-x-5' : 'translate-x-0'
                         }`} />
                      </button>
                   </div>
                   
                   <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                      <p><strong>Note:</strong> Disabling the station will prevent customers from seeing it in their station list during order placement.</p>
                   </div>
                 </div>
               ) : (
                 <div className="text-center text-gray-500 py-8">
                    Select a station to manage settings (No station info found).
                 </div>
               )}
             </div>
          )}

        </>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-24 z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Inventory</h3>
            
            <form onSubmit={handleUpdateInventory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={editForm.quantity}
                  onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Rider Modal */}
      <AssignRiderModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        orderId={selectedOrderForAssign}
        onSuccess={() => {
           fetchData(); // Refresh orders
        }}
      />
      {/* Add Inventory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Inventory Item</h3>
            <form onSubmit={handleAddInventory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gas Type</label>
                <select
                  value={addForm.gasType}
                  onChange={(e) => setAddForm({...addForm, gasType: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                    <option value="LPG">LPG</option>
                    <option value="CNG">CNG</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cylinder Size</label>
                <input
                  type="text"
                  value={addForm.cylinderSize}
                  onChange={(e) => setAddForm({...addForm, cylinderSize: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. 12.5kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={addForm.quantity}
                  onChange={(e) => setAddForm({...addForm, quantity: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                <input
                  type="number"
                  value={addForm.price}
                  onChange={(e) => setAddForm({...addForm, price: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
