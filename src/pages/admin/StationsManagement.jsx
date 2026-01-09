import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Plus, Edit2, MapPin, Trash2, UserPlus } from 'lucide-react';
import CreateManagerModal from '../../components/admin/CreateManagerModal';
import AddInventoryModal from '../../components/admin/AddInventoryModal';

export default function StationsManagement() {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateManagerModal, setShowCreateManagerModal] = useState(false);
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState(null);
  
  const [editingInventory, setEditingInventory] = useState(null);
  const [deletingStation, setDeletingStation] = useState(null);
  const [newStation, setNewStation] = useState({ name: '', address: '', phone: '', latitude: '', longitude: '', managerId: '' });
  const [newStationErrors, setNewStationErrors] = useState({});

  const validateNewStation = () => {
    const errs = {};
    if (!newStation.name || newStation.name.trim().length < 2) errs.name = 'Please enter a valid station name (min 2 chars)';
    if (!newStation.address || newStation.address.trim().length < 5) errs.address = 'Please enter a valid address';
    if (!newStation.phone || !/^\+?[0-9]{7,15}$/.test(newStation.phone.trim())) errs.phone = 'Please enter a valid phone number (digits only, 7-15 chars)';
    if (newStation.latitude && isNaN(Number(newStation.latitude))) errs.latitude = 'Latitude must be a number';
    if (newStation.longitude && isNaN(Number(newStation.longitude))) errs.longitude = 'Longitude must be a number';
    setNewStationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  useEffect(() => {
    fetchStations();
    fetchManagers();
  }, []);

  // If the URL contains ?openAdd=true open the add modal
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openAdd') === 'true') {
      setShowAddModal(true);
    }
  }, [location.search]);

  const fetchStations = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/stations');
      setStations(response.data.data?.stations || []);
    } catch {
      toast.error('Failed to load stations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await api.get('/admin/managers');
      setManagers(response.data.data?.managers || []);
    } catch (error) {
      console.error('Failed to load managers', error);
    }
  };

  const handleUpdateInventory = async (inventoryId, quantity, price) => {
    try {
      await api.patch(`/admin/inventory/${inventoryId}`, {
        quantity: parseInt(quantity),
        price: parseFloat(price)
      });
      toast.success('Inventory updated!');
      setEditingInventory(null);
      fetchStations();
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Failed to update inventory');
    }
  };

  const handleDeleteStation = async (stationId) => {
    try {
      const response = await api.delete(`/admin/stations/${stationId}`);
      toast.success('Station deleted successfully');
      setDeletingStation(null);
      fetchStations();
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      toast.error(`Failed to delete station: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Stations Management</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 btn-primary"
            >
              <Plus size={20} />
              Add Station
            </button>
          </div>
        </div>
      </header>

      {/* Add Station Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add Station</h3>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="Station name"
                value={newStation.name}
                onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
              {newStationErrors.name && (
                <p className="text-sm text-red-600 mt-1">{newStationErrors.name}</p>
              )}
              
              <input
                type="text"
                placeholder="Address"
                value={newStation.address}
                onChange={(e) => setNewStation({ ...newStation, address: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
              {newStationErrors.address && (
                <p className="text-sm text-red-600 mt-1">{newStationErrors.address}</p>
              )}
              
              <input
                type="text"
                placeholder="Phone"
                value={newStation.phone}
                onChange={(e) => setNewStation({ ...newStation, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
              {newStationErrors.phone && (
                <p className="text-sm text-red-600 mt-1">{newStationErrors.phone}</p>
              )}

              {/* Manager Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Station Manager</label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-4 py-2 border rounded"
                    value={newStation.managerId}
                    onChange={(e) => setNewStation({ ...newStation, managerId: e.target.value })}
                  >
                    <option value="">Select Manager (Optional)</option>
                    {managers.map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.fullName} ({manager.email})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowCreateManagerModal(true)}
                    className="px-3 py-2 bg-secondary text-primary rounded hover:bg-secondary/90 flex items-center gap-1"
                    title="Create New Manager"
                  >
                    <UserPlus size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Latitude (optional)"
                  value={newStation.latitude}
                  onChange={(e) => setNewStation({ ...newStation, latitude: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
                {newStationErrors.latitude && (
                  <p className="text-sm text-red-600 mt-1">{newStationErrors.latitude}</p>
                )}
                <input
                  type="text"
                  placeholder="Longitude (optional)"
                  value={newStation.longitude}
                  onChange={(e) => setNewStation({ ...newStation, longitude: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
                {newStationErrors.longitude && (
                  <p className="text-sm text-red-600 mt-1">{newStationErrors.longitude}</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={async () => {
                  if (!validateNewStation()) return;
                  try {
                    await api.post('/admin/stations', {
                      ...newStation
                    });
                    toast.success('Station created');
                    setShowAddModal(false);
                    setNewStation({ name: '', address: '', phone: '', latitude: '', longitude: '', managerId: '' });
                    setNewStationErrors({});
                    fetchStations();
                  } catch (err) {
                    toast.error(err.response?.data?.error || 'Failed to create station');
                  }
                }}
                className="btn-primary"
                disabled={!newStation.name || !newStation.address || !newStation.phone}
              >
                Create
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Manager Modal */}
      <CreateManagerModal 
        isOpen={showCreateManagerModal} 
        onClose={() => setShowCreateManagerModal(false)}
        onSuccess={fetchManagers}
      />

      {/* Add Inventory Modal */}
      <AddInventoryModal
        isOpen={showAddInventoryModal}
        onClose={() => setShowAddInventoryModal(false)}
        stationId={selectedStationId}
        onSuccess={fetchStations}
      />

      {/* Delete Confirmation Modal */}
      {deletingStation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Delete Station</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {deletingStation.name}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteStation(deletingStation.id)}
                className="btn-error"
              >
                Delete
              </button>
              <button
                onClick={() => setDeletingStation(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stations List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading stations...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {stations.map((station) => (
              <div key={station.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {station.name}
                    </h2>
                    <p className="text-gray-600 flex items-center gap-2">
                      <MapPin size={16} />
                      {station.address}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Phone: {station.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      station.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {station.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="bg-softGray text-primary px-3 py-1 rounded-full text-sm font-semibold">
                      {station._count?.riders || 0} Riders
                    </span>
                    <button
                      onClick={() => setDeletingStation(station)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                      title="Delete Station"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Inventory Table */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Inventory</h3>
                    <button
                      onClick={() => {
                        setSelectedStationId(station.id);
                        setShowAddInventoryModal(true);
                      }}
                      className="text-sm flex items-center gap-1 text-primary hover:text-primary/80 font-medium"
                    >
                      <Plus size={16} />
                      Add Item
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                            Cylinder Size
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                            Gas Type
                          </th>
                          <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                            Quantity
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                            Price
                          </th>
                          <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {station.inventory?.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {item.cylinderSize}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.gasType}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {editingInventory === item.id ? (
                                <input
                                  type="number"
                                  defaultValue={item.quantity}
                                  id={`qty-${item.id}`}
                                  className="w-20 px-2 py-1 border rounded text-center"
                                />
                              ) : (
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  item.quantity < item.lowStockThreshold
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {item.quantity}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {editingInventory === item.id ? (
                                <input
                                  type="number"
                                  defaultValue={item.price}
                                  id={`price-${item.id}`}
                                  className="w-24 px-2 py-1 border rounded text-right"
                                />
                              ) : (
                                <span className="font-semibold text-gray-900">
                                  ₦{item.price.toLocaleString()}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {editingInventory === item.id ? (
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      const qty = document.getElementById(`qty-${item.id}`).value;
                                      const price = document.getElementById(`price-${item.id}`).value;
                                      handleUpdateInventory(item.id, qty, price);
                                    }}
                                    className="text-green-600 hover:text-green-800 font-semibold text-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingInventory(null)}
                                    className="text-red-600 hover:text-red-800 font-semibold text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingInventory(item.id)}
                                  className="text-primary hover:text-energyLime"
                                >
                                  <Edit2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}